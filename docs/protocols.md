# Protocols

The toolchain exposes practical compatibility surfaces for local agents and
clients. The current language is intentionally conservative: MCP-style and
A2A-style endpoints are compatibility surfaces, not certified conformance
claims.

## HTTP Knowledge Source

`llmwiki-serve` exposes these local HTTP endpoints:

| Endpoint | Method | Purpose | Availability |
| --- | --- | --- | --- |
| `/health` | `GET` | Process health check | default |
| `/manifest` | `GET` | Source discovery and metadata | default |
| `/source-bundle` | `GET` | Source-owned bundle identity, capabilities, projection metadata, raw-origin metadata, and typed source refs | default |
| `/source-refs` | `GET` | Typed opaque source-reference handles linked from approved pages | default |
| `/query` | `POST` | Context retrieval for a query | default |
| `/search` | `POST` | Search candidate pages or snippets | default |
| `/read/{page_id}` | `GET` | Read one projected page | default |
| `/graph` | `GET` | Read projected graph nodes and edges | default |
| `/mcp` | `POST` | MCP-style JSON-RPC tool endpoint | default |
| `/mcp/stream` | `POST` | MCP Streamable HTTP tool endpoint | default when supported by the installed server version |
| `/.well-known/agent-card.json` | `GET` | A2A-style source discovery card | opt-in |
| `/message:send` | `POST` | A2A-style source context endpoint | opt-in |

For request and response examples, see [API Reference](/api-reference).
For the disk format that feeds these endpoints, see
[Knowledge Source Format](/knowledge-source-format).

Context retrieval over HTTP is `POST /query`. `llmwiki_context` is the MCP tool
name. Clients should not assume an HTTP `/context` route exists.

## MCP-Style JSON-RPC

The MCP-style endpoint accepts JSON-RPC requests at `/mcp`. Typical tool calls
include:

- `llmwiki_context` for primary context retrieval
- `llmwiki_search` for targeted search
- `llmwiki_read` for page inspection
- `llmwiki_graph` for graph inspection
- `llmwiki_source_refs` for typed source-reference handles
- `llmwiki_source_bundle` for source bundle discovery

Example:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "llmwiki_context",
    "arguments": {
      "query": "release readiness",
      "limit": 4
    }
  }
}
```

## A2A-Style Message Surface

The A2A-style path exposes discovery through `/.well-known/agent-card.json` and
message handling through `POST /message:send`.

For a Knowledge Source, this surface is opt-in source compatibility. A message
request should ask for context and receive a context artifact when available.

For the bridge, a message request can include selected Knowledge Source
descriptors and receive a completed task containing text plus a
`llmwiki_agent_result` data artifact.

| Surface | Owner | Used for | Artifact |
| --- | --- | --- | --- |
| Source HTTP | `llmwiki-serve` | Direct retrieval from one projected wiki folder. | Context pack, page, search, or graph JSON. |
| Source MCP | `llmwiki-serve` | Tool calls for context/search/read/graph/source-bundle/source-refs. | Tool result content from the selected source. |
| Source A2A compatibility | `llmwiki-serve`, opt-in | A2A-native source discovery. | `llmwiki_context` artifact. |
| Bridge A2A | `llmwiki-agent-bridge` | Answer synthesis over selected sources. | `llmwiki_agent_result` artifact. |
| Bridge MCP | `llmwiki-agent-bridge` | One MCP tool for grounded answering. | `structuredContent.llmwiki_agent_result`. |

## Source Protocols Accepted by the Bridge

| Source protocol | Bridge behavior |
| --- | --- |
| `llmwiki-http` | Calls `GET /source-bundle` for discovery when available, falls back to `GET /manifest`, then calls `POST /query` on the selected Knowledge Source. |
| `mcp` | Calls `llmwiki_context` through the source `/mcp` endpoint. |
| `a2a` | Discovers the agent card, posts a message, and prefers a context artifact. |

Bridge MCP source-tool results may carry the closed camelCase guidance shape
under `structuredContent.llmwiki_context`:

```json
{
  "structuredContent": {
    "llmwiki_context": {
      "retrievalGuidance": {
        "schemaVersion": "llmwiki.retrieval_guidance.v1",
        "orientationSource": "authored",
        "contentTrust": "untrusted_source_evidence",
        "maxQueryVariants": 2,
        "characterBudget": 4000,
        "folderCards": [],
        "pageCards": [],
        "suggestedTerms": ["release"],
        "exactIdentifiers": ["publish.yml"],
        "fallbackModes": ["literal"]
      }
    }
  }
}
```

Search intent is a separate bridge source-tool argument:

```json
{
  "query": "release readiness",
  "retrieval": {
    "schemaVersion": "llmwiki.retrieval.v1",
    "searchMode": "lexical",
    "search": {
      "queryVariants": ["릴리스 체크리스트", "publish.yml"]
    }
  }
}
```

The bridge forwards variants only when the source advertises
`llmwiki_agent_guided_lexical_v1` exactly. Older sources keep query-only
behavior.

## Versioning Guidance

Protocol changes should be documented in the repository that owns the change
and summarized here when they affect cross-repo workflows. Prefer additive
fields and preserve existing response shapes for at least one release cycle
when possible.
