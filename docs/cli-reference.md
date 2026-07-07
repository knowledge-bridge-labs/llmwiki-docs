# CLI Reference

This page is the operator reference for the public-preview command surfaces.
Use [Quickstart](/quickstart) for the shortest successful path, then use this
page when you need exact command shapes, expected output, and failure behavior.

The current supported path is source checkout usage. Package command examples
are included as publication targets and install-smoke references, but registry
installs should not be treated as supported until the release status says the
packages are published.

## Setup Context

Most local smoke tests assume one workspace with sibling checkouts:

```text
workspace/
  llmwiki-serve/
  llmwiki-agent-bridge/
  llmwiki-chat/
  llmwiki-docs/
```

Use these runtime baselines:

| Component | Source checkout setup | Package status |
| --- | --- | --- |
| `llmwiki-serve` | `uv sync --extra dev` from `llmwiki-serve` | PyPI publication pending. Use package commands only after the package gate passes. |
| `llmwiki-agent-bridge` | `npm ci` from `llmwiki-agent-bridge` | npm publication pending. Source checkout is the supported local path. |
| `llmwiki-chat` | `npm ci` from `llmwiki-chat` | npm publication pending. The browser workbench is run from source today. |
| `llmwiki-docs` | `npm ci` from `llmwiki-docs` | GitHub Pages publication pending until the Pages gate passes. |

Source checkout examples use `uv run`, `node ./bin/...`, and `npm run`. After
the first package publication, the matching install-smoke commands should also
pass from a clean temporary directory.

Most examples use `./examples/sample-wiki`. Replace that path with your own
Markdown, Obsidian, or LLMWiki-style graph after the sample source smoke passes.
The additional bundled fixture paths from the quickstart use the same command
shapes.

## Command Map

| Command | Run from | Purpose |
| --- | --- | --- |
| `uv run llmwiki-serve manifest <wiki-path>` | `llmwiki-serve` checkout | Print a local manifest for a compatible Markdown/wiki folder. |
| `uv run llmwiki-serve query <wiki-path> <text>` | `llmwiki-serve` checkout | Build one context pack for an agent or smoke test. |
| `uv run llmwiki-serve serve <wiki-path>` | `llmwiki-serve` checkout | Start the read-only HTTP and MCP source server, with A2A compatibility only when explicitly enabled. |
| `node ./bin/llmwiki-agent-bridge.mjs` | `llmwiki-agent-bridge` checkout | Start the optional runtime companion bridge from a source checkout. |
| `npm run dev` | `llmwiki-chat` checkout | Start the browser workbench through Vite. |
| `npm run check` | `llmwiki-docs` checkout | Validate license artifact freshness and build the Pages site. |

## `llmwiki-serve manifest`

Use `manifest` to confirm that a folder is a supported Knowledge Source before
starting a server or wiring an agent tool.

```sh
cd ../llmwiki-serve
uv run llmwiki-serve manifest ./examples/sample-wiki
```

Expected output is JSON with source metadata:

```json
{
  "title": "Sample Packaging LLMWiki",
  "description": "Synthetic packaging operations knowledge base.",
  "root": "C:/absolute/path/to/llmwiki-serve/examples/sample-wiki",
  "adapter": "llmwiki-markdown",
  "implementation": "llmwiki-markdown",
  "page_count": 5,
  "approved_page_count": 4,
  "capabilities": [
    "llmwiki_context",
    "llmwiki_search",
    "llmwiki_read",
    "llmwiki_graph",
    "mcp-jsonrpc",
    "mcp-streamable-http"
  ]
}
```

Notes:

- The CLI manifest includes the resolved local `root` so operators can confirm
  which folder was inspected.
- The network `GET /manifest` response redacts the local root and returns an
  empty root field.
- Draft or unpublished pages count toward `page_count` but are withheld from
  default retrieval surfaces.

Common failures:

| Symptom | Meaning | Next check |
| --- | --- | --- |
| `Error: No supported wiki files were found...` | The folder exists but has no supported Markdown/wiki content. | Check that the selected root contains approved Markdown pages, not only adapter marker files. |
| Typer `Invalid value for 'ROOT'` | The path does not exist, is not a directory, or is unreadable. | Resolve the path from the current shell and rerun. |
| Traceback-free exit code `1` | The CLI rejected the root before printing JSON. | Treat this as a setup failure, not as an empty wiki. |

## `llmwiki-serve query`

Use `query` when an agent, script, or release smoke needs context but not a
long-running HTTP server.

```sh
cd ../llmwiki-serve
uv run llmwiki-serve query ./examples/sample-wiki "release readiness" --limit 4
```

Command shape:

```text
llmwiki-serve query <wiki-path> <text> [--limit <1-30>]
```

Expected output is a `ContextPack` JSON object. This example is abbreviated;
real output usually includes ranked evidence and graph nodes when approved
pages match the query.

```json
{
  "query": "release readiness",
  "wiki_title": "Sample Packaging LLMWiki",
  "answerable": true,
  "orientation": [],
  "evidence": [
    {
      "page_id": "release-readiness",
      "title": "Release Readiness",
      "path": "release-readiness.md"
    }
  ],
  "limitations": [
    "1 draft or unapproved page(s) were withheld."
  ],
  "graph": {
    "nodes": [],
    "edges": []
  }
}
```

Field order, scores, snippets, and graph size can vary by release and source
content. Agent integrations should rely on stable field names rather than exact
ordering.

Important behavior:

- `--limit` controls the number of query-ranked evidence items and is clamped
  by the CLI to `1..30`.
- `orientation` gives hot, index, or overview pages before query-ranked
  evidence when those pages exist.
- `answerable: false` with an empty `evidence` array is a valid response when
  no approved page matches.
- `limitations` is part of the contract. Preserve it in downstream prompts and
  traces because it explains withheld drafts or missing approved evidence.

Common failures:

| Symptom | Meaning | Next check |
| --- | --- | --- |
| `Invalid value for '--limit'` | The limit is outside `1..30` or not an integer. | Use a small bounded limit such as `4`, `6`, or `8`. |
| `No matching approved LLMWiki page was found.` | The source loaded, but the query did not match approved pages. | Try a broader query or inspect draft filtering. |
| `No supported wiki files were found...` | The source root is unsupported. | Run `manifest` on the same root. |

## `llmwiki-serve serve`

Use `serve` when a browser workbench, IDE agent, MCP-style client, or bridge
needs a stable local Knowledge Source endpoint.

```sh
cd ../llmwiki-serve
uv run llmwiki-serve serve ./examples/sample-wiki --host 127.0.0.1 --port 8765
```

Command shape:

```text
llmwiki-serve serve <wiki-path> [--host <host>] [--port <1-65535>] [--allow-drafts] [--cors-origin <origin> ...]
```

Options:

| Option | Default | Purpose |
| --- | --- | --- |
| `<wiki-path>` | required | Source folder to project. The server treats it as read-only. |
| `--host` | `127.0.0.1` | Bind address. Use loopback for local development. |
| `--port` | `8765` | HTTP port for the source endpoint. |
| `--allow-drafts` | disabled | Allows `include_drafts` requests to return draft or unpublished pages. Keep disabled unless a trusted local workflow needs it. |
| `--cors-origin` | local browser allowlist | Replaces the default local browser CORS allowlist. Repeat for multiple explicit origins. |

Readiness checks:

```sh
curl -s http://127.0.0.1:8765/health
curl -s http://127.0.0.1:8765/manifest
curl -s http://127.0.0.1:8765/query \
  -H 'content-type: application/json' \
  -d '{"query":"release readiness","limit":4}'
```

Expected readiness output:

| Check | Expected signal |
| --- | --- |
| `/health` | `{ "status": "ok" }` |
| `/manifest` | Manifest JSON with `root` redacted to an empty string. |
| `/query` | `ContextPack` JSON with `orientation`, `evidence`, `limitations`, and `graph`. |
| `/mcp` | JSON-RPC `tools/list` and `tools/call` responses for `llmwiki_context`, `llmwiki_search`, `llmwiki_read`, and `llmwiki_graph`. |
| `/mcp/stream` | Official MCP Streamable HTTP endpoint when supported by the installed server version. |
| `/.well-known/agent-card.json` | A2A-style discovery card only when A2A source compatibility is enabled. |

Common failures:

| Symptom | Meaning | Next check |
| --- | --- | --- |
| Port bind failure from Uvicorn | The requested port is already in use. | Pick another `--port` and update clients. |
| HTTP `422` with `wiki_root_unsupported` | The source folder has no supported pages at request time. | Confirm source contents or rerun after compile output appears. |
| HTTP `404` with `wiki_root_missing` | The source root was removed or never existed. | Restore the folder or restart with the correct path. |
| Browser preflight fails | The browser origin is not allowed. | Add the exact origin with `--cors-origin` or use a local default origin. |
| Draft page is still hidden | The server was not started with `--allow-drafts`, or the request did not set `include_drafts`. | Enable both only in a trusted local workflow. |

## `llmwiki-agent-bridge`

Use the bridge when a client wants one A2A or MCP endpoint that queries selected
Knowledge Sources and returns a normalized artifact. The bridge can run
evidence-only source fan-out without a model, or call an OpenAI-compatible
runtime when synthesis is configured.

Minimal local start for evidence-only mode:

```sh
cd ../llmwiki-agent-bridge
node ./bin/llmwiki-agent-bridge.mjs
```

Runtime-backed start when a compatible model endpoint is available:

```sh
cd ../llmwiki-agent-bridge
LLMWIKI_AGENT_BRIDGE_BASE_URL=http://127.0.0.1:8642/v1 \
LLMWIKI_AGENT_BRIDGE_MODEL=local-model \
LLMWIKI_AGENT_BRIDGE_RUNTIME_PROFILE=generic \
node ./bin/llmwiki-agent-bridge.mjs
```

Core environment variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `LLMWIKI_AGENT_BRIDGE_HOST` | `127.0.0.1` | Bridge bind host. Non-loopback values require explicit public-bind opt-in. Host changes saved from `/settings` require restart. |
| `LLMWIKI_AGENT_BRIDGE_PORT` | `8788` | Bridge HTTP port. Port changes saved from `/settings` require restart. |
| `LLMWIKI_AGENT_BRIDGE_BASE_URL` | unset | OpenAI-compatible runtime base URL, including `/v1` when the runtime expects it. Required for runtime-backed modes, not evidence-only mode. |
| `LLMWIKI_AGENT_BRIDGE_MODEL` | unset | Model name sent to the runtime. Required for runtime-backed modes, not evidence-only mode. |
| `LLMWIKI_AGENT_BRIDGE_API_KEY` | unset | Optional runtime API key. Sent only to the configured runtime as bearer auth. |
| `LLMWIKI_AGENT_BRIDGE_RUNTIME_PROFILE` | `hermes` | Runtime profile: `hermes`, `deepagents`, or `generic`. |
| `LLMWIKI_AGENT_BRIDGE_BEARER_TOKEN` | unset | Optional bearer token required by clients that call the bridge. Required for non-loopback binds unless the insecure development escape hatch is explicit. |
| `LLMWIKI_AGENT_BRIDGE_TIMEOUT_MS` | `120000` | Outbound runtime and source request timeout in milliseconds. |
| `LLMWIKI_AGENT_BRIDGE_ALLOWED_ORIGINS` | unset | Comma-separated browser CORS origins allowed in addition to loopback origins. |
| `LLMWIKI_AGENT_BRIDGE_SOURCE_POLICY` | `private-http` | Outbound Knowledge Source URL policy: `private-http`, `allowlist`, or `public-https`. |
| `LLMWIKI_AGENT_BRIDGE_ALLOWED_SOURCE_ORIGINS` | unset | Comma-separated exact source origins for `allowlist` or stricter policies. |
| `LLMWIKI_AGENT_BRIDGE_ALLOW_PUBLIC_BIND` | unset | Set to `1` before binding to a non-loopback host. |
| `LLMWIKI_AGENT_BRIDGE_CONFIG_PATH` | CLI user config file | Persistent settings file for `/settings/config.json` and `/settings/sources.json`; embedded callers can pass `configPath`. |

Runtime identity overrides are available when an integration needs custom
agent-card metadata:

| Variable | Purpose |
| --- | --- |
| `LLMWIKI_AGENT_BRIDGE_RUNTIME_ID` | Agent-card runtime ID. |
| `LLMWIKI_AGENT_BRIDGE_RUNTIME_NAME` | Human-readable runtime name. |
| `LLMWIKI_AGENT_BRIDGE_RUNTIME` | Runtime kind label. |
| `LLMWIKI_AGENT_BRIDGE_AGENT_RUNTIME` | A2A-style agent runtime label. |
| `LLMWIKI_AGENT_BRIDGE_PROVIDER_ORGANIZATION` | Provider or operator label. |

Open `http://127.0.0.1:8788/settings` for the guided setup flow:

1. Choose the bridge mode. Evidence-only mode can verify source fan-out without
   runtime settings; runtime-backed modes need profile, base URL, and model.
2. Register Knowledge Sources. Save reusable source descriptors through
   `GET/PUT /settings/sources.json`; registered sources are used when a request
   does not send `knowledgeSources`.
3. Verify Bridge. Run the page's verify action, which sends
   `POST /message:send` and displays the returned artifact, citations, graph,
   and trace steps.

Advanced network, auth, CORS, timeout, source-policy, and bind controls live
under diagnostics/advanced. Runtime and policy changes apply to the running
bridge. Host and port edits are saved but require a restart before the listener
moves.

Readiness checks:

```sh
curl -s http://127.0.0.1:8788/health
curl -s http://127.0.0.1:8788/.well-known/agent-card.json
curl -s http://127.0.0.1:8788/mcp \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

For an end-to-end run, use Step 3 in `/settings` or send the equivalent CLI
request:

```sh
curl -s http://127.0.0.1:8788/message:send \
  -H 'content-type: application/json' \
  --data @examples/message-send.local.json
```

Expected evidence-only health output includes fields like:

```json
{
  "status": "ok",
  "runtime": "llmwiki-agent-bridge",
  "runtimeProfile": "generic",
  "modelConfigured": false,
  "configuredAllowedOrigins": 0,
  "sourcePolicy": "private-http"
}
```

In runtime-backed modes, `modelConfigured` should be `true` after the base URL
and model are saved or set through environment variables.

Common failures:

| Symptom | Meaning | Next check |
| --- | --- | --- |
| Startup refuses a non-loopback host | Public bind opt-in is missing. | Set `LLMWIKI_AGENT_BRIDGE_ALLOW_PUBLIC_BIND=1` and configure `LLMWIKI_AGENT_BRIDGE_BEARER_TOKEN`. |
| HTTP `401` | Bridge bearer token is configured and the request lacks the matching `Authorization: Bearer ...` header. | Add the header or remove the token for loopback-only development. |
| HTTP `403` | Browser `Origin` is not allowed by CORS policy. | Add the exact browser origin to `LLMWIKI_AGENT_BRIDGE_ALLOWED_ORIGINS`. |
| HTTP `502` from `/message:send` | The configured runtime chat-completions call failed. | Check `BASE_URL`, `MODEL`, `API_KEY`, runtime logs, and timeout. |
| Source trace step is `error` | One selected Knowledge Source failed or was rejected by source policy. | Check source URL, source readiness, and `LLMWIKI_AGENT_BRIDGE_SOURCE_POLICY`. |

## `llmwiki-chat`

Use the browser workbench to select Knowledge Sources, inspect graph/citation
state, and choose an Agent Bridge or testing runtime.

```sh
cd ../llmwiki-chat
npm ci
npm run dev
```

Open the Vite URL printed by the command. It is usually a loopback URL such as
`http://127.0.0.1:5173`.

Default local flow:

1. Start `llmwiki-serve` on `http://127.0.0.1:8765`.
2. Start `llmwiki-chat` with `npm run dev`.
3. Confirm the default Knowledge Source is ready.
4. Select the local Agent Bridge at `http://127.0.0.1:8788` when a bridge is
   running, choose A2A or MCP mode, and run `Test bridge`.
5. Use `Local Development Runtime` only for deterministic UI checks when no
   bridge or model runtime is available.

Hermes, DeepAgents, and generic OpenAI-compatible bridge workflows use the
standalone `llmwiki-agent-bridge` package path above. `llmwiki-chat` no longer
ships or tests an embedded bridge binary.

Common failures:

| Symptom | Meaning | Next check |
| --- | --- | --- |
| Source status is not ready | The source URL is wrong, blocked by CORS, or the source server is down. | Check `/health` and `/manifest` in the browser or with `curl`. |
| Bridge says URL is required | A bridge card was selected before a bridge URL was configured. | Open bridge setup, enter the URL, and run `Test bridge`. |
| Bridge URL policy error | External bridge URLs must be public HTTPS, or loopback HTTP(S) for local development unless the local dev private-network override is set. | For private bridge URLs in local dev, set `VITE_LLMWIKI_CHAT_ALLOW_PRIVATE_AGENT_RUNTIME_URLS=true`. |
| Ask button remains unavailable | The selected bridge/runtime is not ready or source selection changed during a run. | Test the bridge again, or switch to `Local Development Runtime` for UI-only testing. |

## Repository Checks

Use repository-local gates before opening a PR:

```sh
# llmwiki-serve
uv run python scripts/release_smoke.py

# llmwiki-agent-bridge
npm run check

# llmwiki-chat
npm run lint
npm run typecheck
npm run test
npm run build

# llmwiki-docs
npm run check
```

For package and Pages publication status, see
[Release Status & Compatibility](/status). Public users normally do not need
the repository launch automation scripts to run the toolchain locally.
