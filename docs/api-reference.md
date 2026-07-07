# API Reference

This page documents the current compatibility surface used by
`llmwiki-serve`, `llmwiki-agent-bridge`, and `llmwiki-chat`. Treat these shapes
as practical integration contracts for the public preview, not as certified
MCP or A2A conformance claims.

## Contract Status

This page is the human-readable public-preview contract for clients, docs, and
smoke tests. `llmwiki-serve` owns the machine-readable contract for its HTTP
surface at `docs/openapi.json` in the server repository. In local sibling
checkouts, read `../llmwiki-serve/docs/openapi.json`; the public repository
path is
`https://github.com/knowledge-bridge-labs/llmwiki-serve/blob/main/docs/openapi.json`.

The OpenAPI artifact is generated from the implemented FastAPI routes and data
models by `scripts/export_openapi.py`, then checked by the server release smoke
so route/schema drift fails in the owning repository. This docs hub links and
summarizes that artifact; it does not vendor a separate copy.

The current OpenAPI contract covers the public-preview HTTP endpoints, request
models, and response models where the local compatibility surface has a stable
shape. Legacy MCP-style JSON-RPC remains documented for compatibility. Official
MCP SDK-backed Streamable HTTP surfaces are documented separately from the
legacy endpoint as they are added. A2A surfaces are either opt-in source
compatibility or bridge-runtime surfaces; do not treat them as certified
conformance claims until a conformance process is documented.

## Knowledge Source HTTP

`llmwiki-serve` exposes a read-only Knowledge Source over HTTP.
See [Knowledge Source Format](/knowledge-source-format) for the disk layout,
frontmatter fields, graph sidecar shape, draft rules, and refresh behavior
behind these responses.

| Endpoint | Method | Request | Response |
| --- | --- | --- | --- |
| `/health` | `GET` | none | `{ "status": "ok" }` |
| `/manifest` | `GET` | none | `WikiManifest` |
| `/source-bundle` | `GET` | query `include_drafts` | `SourceBundleManifest` with bundle identity, projection metadata, capabilities, raw-origin metadata, and typed source refs |
| `/source-refs` | `GET` | query `include_drafts` | `SourceRefsResponse` with opaque source-reference handles linked to served pages |
| `/query` | `POST` | `QueryRequest` | `ContextPack` |
| `/search` | `POST` | `QueryRequest` | `{ "results": SearchResult[] }` |
| `/read/{page_id}` | `GET` | query `include_drafts` | page payload, HTTP 404 for a missing page, or withheld payload for a draft page |
| `/graph` | `GET` | query `limit`, `include_drafts` | `{ "nodes": GraphNode[], "edges": GraphEdge[] }` |
| `/mcp` | `POST` | JSON-RPC object | Legacy MCP-style JSON-RPC result envelope |
| `/mcp/stream` | `POST` | MCP Streamable HTTP | Official MCP SDK-backed tool surface where enabled by the server version |
| `/.well-known/agent-card.json` | `GET` | none | A2A-style agent card when A2A compatibility is enabled |
| `/message:send` | `POST` | A2A-style message | completed task with `llmwiki_context` artifact when A2A compatibility is enabled |

`QueryRequest`:

```json
{
  "query": "release readiness",
  "limit": 8,
  "include_drafts": false
}
```

For HTTP `/query` and `/search`, `limit` is validated as an integer in
`1..30`; invalid requests fail request validation. MCP-style context and
search calls clamp `limit` to `1..30`. Graph calls clamp `limit` to `1..2000`.
`include_drafts` only has effect when the server operator started
`llmwiki-serve` with draft access enabled.

`GET /read/{page_id}` returns HTTP 404 with `detail: "page not found"` when no
page matches the ID or path. When a page exists but is withheld by draft
filtering, the response is HTTP 200 with:

```json
{
  "found": false,
  "reason": "not approved for serving"
}
```

## Context Pack

`/query`, MCP `llmwiki_context`, and A2A `llmwiki_context` artifacts return the
same core context shape:

```json
{
  "query": "release readiness",
  "wiki_title": "Project Wiki",
  "description": "Local project knowledge source",
  "adapter": "llmwiki-markdown",
  "implementation": "llmwiki-markdown",
  "page_count": 42,
  "approved_page_count": 40,
  "answerable": true,
  "orientation": [
    {
      "page_id": "index",
      "title": "Index",
      "path": "index.md",
      "score": 1,
      "snippet": "Overview text...",
      "role": "index",
      "source_refs": [],
      "route": "orientation"
    }
  ],
  "evidence": [
    {
      "page_id": "release-checklist",
      "title": "Release Checklist",
      "path": "release-checklist.md",
      "score": 4.25,
      "snippet": "Release evidence...",
      "role": "topic",
      "source_refs": ["ADR-0042"],
      "route": "search"
    }
  ],
  "limitations": [],
  "graph": {
    "nodes": [
      { "id": "page:release-checklist", "label": "Release Checklist", "kind": "topic", "path": "release-checklist.md", "metadata": {} }
    ],
    "edges": [
      { "source": "page:index", "target": "page:release-checklist", "relation": "links_to", "metadata": {} }
    ]
  }
}
```

Network responses intentionally omit the local source root from `/manifest`.
Client code should rely on `source_id`, `bundle_id`, `page_id`, `path`,
`title`, `source_refs`, and `llmwiki://...` handles for citations rather than
absolute local file paths.

## Source Bundle And Source Refs

`/source-bundle` is the source-owned discovery surface for clients that need a
stable bundle identity before deciding how to retrieve evidence. It is additive
to `/manifest`; older clients can keep using `/manifest`.

```json
{
  "source_id": "sample-packaging-llmwiki",
  "bundle_id": "sample-packaging-llmwiki:sha256:abc123...",
  "public_uri": "llmwiki://sample-packaging-llmwiki",
  "title": "Sample Packaging LLMWiki",
  "adapter": "llmwiki-markdown",
  "projection": {
    "signature": "sha256:abc123...",
    "page_count": 5,
    "approved_page_count": 4,
    "graph_node_count": 21,
    "graph_edge_count": 18
  },
  "raw_origins": {
    "enabled": false,
    "metadata_only": true,
    "public_root_labels": []
  },
  "capabilities": ["llmwiki_source_bundle", "llmwiki_context", "llmwiki_source_refs"],
  "source_refs": [
    {
      "id": "src-hot",
      "label": "SRC-HOT",
      "kind": "source_ref",
      "uri": "llmwiki://sample-packaging-llmwiki/source-refs/src-hot",
      "linked_pages": ["hot.md"],
      "linked_page_ids": ["hot"],
      "locator": {}
    }
  ]
}
```

`/source-refs` returns the same typed source-reference list without the full
bundle summary. These refs are opaque handles. A bridge or host agent may pass
them back to `llmwiki-serve`, but should not derive local files or private raw
paths from the handle text.

## MCP-Style JSON-RPC

The `/mcp` endpoint supports `tools/list` and `tools/call`.

List tools:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list"
}
```

Call primary context retrieval:

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "llmwiki_context",
    "arguments": {
      "query": "release readiness",
      "limit": 6
    }
  }
}
```

Available tools:

| Tool | Arguments | Result |
| --- | --- | --- |
| `llmwiki_context` | `query`, `limit`, `include_drafts` | `ContextPack` |
| `llmwiki_search` | `query`, `limit`, `include_drafts` | `{ "results": SearchResult[] }` |
| `llmwiki_read` | `page_id` or `id`, `include_drafts` | page payload or not-found payload |
| `llmwiki_graph` | `limit`, `include_drafts` | graph payload |
| `llmwiki_source_refs` | `include_drafts` | `SourceRefsResponse` |
| `llmwiki_source_bundle` | `include_drafts` | `SourceBundleManifest` |

Unsupported methods return JSON-RPC error `-32601`. Unknown tools return
`-32602`. Internal errors are sanitized as `-32000`.

## A2A-Style Knowledge Source Compatibility

This surface is for A2A-native clients that require an agent-card-shaped source
adapter. It should be opt-in on `llmwiki-serve` deployments. Use HTTP or MCP
for default source retrieval.

Discovery:

```sh
curl -s http://127.0.0.1:8765/.well-known/agent-card.json
```

Message request:

```json
{
  "data": {
    "query": "release readiness"
  }
}
```

`llmwiki-serve` also accepts a direct `text` field or a `message.parts[].text`
envelope for simple clients.

Response:

```json
{
  "status": "completed",
  "message": {
    "role": "agent",
    "parts": [
      { "kind": "text", "text": "Project Wiki context:\nEvidence:\n[1] Release Checklist - ..." }
    ]
  },
  "artifacts": [
    {
      "name": "llmwiki_context",
      "parts": [
        { "kind": "data", "data": { "query": "release readiness", "evidence": [] } }
      ]
    }
  ]
}
```

## Agent Bridge HTTP

`llmwiki-agent-bridge` exposes a small local HTTP surface:

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Reports bridge readiness, selected runtime profile, runtime identity, model configuration, allowed-origin count, and source policy. |
| `GET` | `/.well-known/agent-card.json` | Returns the A2A-style runtime card with the bridge identity and `message:send` URL. |
| `POST` | `/message:send` | Accepts a query plus selected Knowledge Sources and returns a completed task with a `llmwiki_agent_result` artifact. |
| `GET` | `/settings` | Serves the bridge-owned guided setup page: connect runtime, register Knowledge Sources, and verify with `POST /message:send`. |
| `GET` | `/settings.json` | Returns redacted bridge settings and endpoint metadata. |
| `PUT` | `/settings/config.json` | Persists runtime configuration plus advanced access, CORS, timeout, and source-policy settings. |
| `GET/PUT` | `/settings/sources.json` | Reads or persists registered Knowledge Sources. |
| `POST` | `/mcp` | Exposes bridge tools such as `llmwiki_agent_run` for MCP bridge clients. |

When `LLMWIKI_AGENT_BRIDGE_BEARER_TOKEN` is configured, every bridge HTTP
request must include `Authorization: Bearer <token>`. Browser requests are also
checked against the configured CORS origin policy before endpoint handling.

Settings persistence is local to the bridge process. The first-run UI saves
runtime profile, base URL, and model through `PUT /settings/config.json`, saves
registered sources through `GET/PUT /settings/sources.json`, and verifies the
combined path with `POST /message:send`. Advanced network, auth, CORS, timeout,
and source-policy settings also persist through `/settings/config.json`.
Runtime and policy changes apply live, while host and port changes are saved
for the next start and returned as restart-required fields. Registered sources
are used when a bridge run omits `knowledgeSources`; a request can still
provide its own source list.

`/health` returns fields such as:

```json
{
  "status": "ok",
  "runtime": "llmwiki-agent-bridge",
  "runtimeProfile": "generic",
  "runtimeId": "llmwiki-agent-bridge",
  "agentRuntime": "generic",
  "modelConfigured": false,
  "configuredAllowedOrigins": 1,
  "sourcePolicy": "private-http"
}
```

`modelConfigured: false` is valid for evidence-only bridge runs. Runtime-backed
and hybrid runs require `modelConfigured: true` before the bridge can call the
configured OpenAI-compatible endpoint.

## Agent Bridge Message And MCP Tool

`llmwiki-agent-bridge` accepts the same logical run through A2A-style
`POST /message:send` and MCP `tools/call` with `llmwiki_agent_run`. The bridge
queries selected Knowledge Sources from the request, or from its registered
source list when the request omits sources. Evidence-only requests return a
normalized source-evidence artifact without calling a runtime. Delegated-runtime
and hybrid requests call the configured OpenAI-compatible runtime and return a
normalized result artifact.

```json
{
  "data": {
    "query": "What should I know before release?",
    "knowledgeSources": [
      {
        "id": "project-wiki",
        "name": "Project Wiki",
        "protocol": "llmwiki-http",
        "status": "ready",
        "url": "http://127.0.0.1:8765",
        "selected": true
      },
      {
        "id": "mcp-wiki",
        "name": "MCP Wiki",
        "protocol": "mcp",
        "status": "ready",
        "url": "http://127.0.0.1:8766"
      },
      {
        "id": "a2a-wiki",
        "name": "A2A Wiki",
        "protocol": "a2a",
        "status": "ready",
        "url": "http://127.0.0.1:8767"
      }
    ]
  }
}
```

Only sources with `status: "ready"`, a supported protocol, a URL, and
`selected !== false` are queried.

Bridge response artifact:

```json
{
  "artifacts": [
    {
      "name": "llmwiki_agent_result",
      "parts": [
        {
          "kind": "data",
          "data": {
            "answer": "Grounded markdown answer.",
            "traceId": "5f4a4f0d6a7f4a8c9d1c1f3f8b2c1a0e",
            "citations": [],
            "graph": { "nodes": [], "edges": [] },
            "steps": []
          }
        }
      ]
    }
  ]
}
```

Trace steps may include a `diagnostic` object for failed or degraded phases.
Diagnostics are fact envelopes, not a failure-code catalog. Clients should use
`scope`, `phase`, `protocol`, safe name/value `observations`, and
`remediation` to render actionable help. Human text such as `message`,
`remediation`, `detail`, and `error` is best-effort and can change between
releases. See [Diagnostics](/diagnostics).

## Compatibility Notes

- Prefer `/query` or `llmwiki_context` for first-pass retrieval.
- Use `/search`, `/read/{page_id}`, and `/graph` for follow-up inspection.
- Preserve draft filtering unless the deployment is a trusted local workflow.
- Cite returned `page_id`, `title`, `path`, and `source_refs` when composing
  model answers.
- Treat legacy MCP-style JSON-RPC and A2A compatibility wording as
  compatibility language until a separate conformance process is documented.
