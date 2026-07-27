# CLI Reference

This page is the operator reference for the public-preview command surfaces.
Use [Quickstart](/quickstart) for the shortest successful path, then use this
page when you need exact command shapes, expected output, and failure behavior.

Published package commands are the public first-run path:
`llmwiki-serve==0.2.2`, `llmwiki-bridge-start@0.0.2`,
`llmwiki-agent-bridge@0.2.1`, and `llmwiki-chat@0.1.6`. Source checkout usage
remains supported for local development, bundled fixtures, and release
verification.

## Setup Context

Package-installed examples can run from any local shell:

```sh
uv tool install llmwiki-serve
llmwiki-serve manifest /path/to/your/wiki
```

Use these runtime baselines:

| Component | Source checkout setup | Package status |
| --- | --- | --- |
| `llmwiki-serve` | `uv sync --extra dev` from `llmwiki-serve` | PyPI published as `llmwiki-serve==0.2.2`; package commands are available. |
| `llmwiki-bridge-start` | `npm ci` from `llmwiki-bridge-start` when developing the harness | npm published as `llmwiki-bridge-start@0.0.2`; use it as the first-run entrypoint for discovery, source startup, optional bridge registration, and smoke checks. |
| `llmwiki-agent-bridge` | `npm ci` from `llmwiki-agent-bridge` | npm published as `llmwiki-agent-bridge@0.2.1`; source checkout remains supported for local development. |
| `llmwiki-chat` | `npm ci` from `llmwiki-chat` | npm published as `llmwiki-chat@0.1.6`; source checkout remains supported for local development. |
| `llmwiki-docs` | `npm ci` from `llmwiki-docs` | GitHub Pages is live for the public docs portal. |

Source checkout examples use `uv run`, `node ./bin/...`, and `npm run`. Treat
those as development equivalents, not the public default. Package install-smoke
commands should also pass from a clean temporary directory.

Most examples below use `/path/to/your/wiki`. Replace it with an existing
Markdown, Obsidian, or LLMWiki-style graph, or create the tiny local sample from
[10-Minute Agent Context Quickstart](/serve-agent-quickstart). Optional bundled
fixtures such as `./examples/sample-wiki` require a `llmwiki-serve` source
checkout and use the same command shapes.

## Command Map

| Command | Run from | Purpose |
| --- | --- | --- |
| `llmwiki-serve manifest <wiki-path>` | Any shell with the PyPI package installed | Print a local manifest for a compatible Markdown/wiki folder. |
| `llmwiki-serve query <wiki-path> <text>` | Any shell with the PyPI package installed | Build one context pack for an agent or smoke test. |
| `llmwiki-serve source-refs <wiki-path>` | Any shell with the PyPI package installed | Print visible source-reference handles for cited source metadata. |
| `llmwiki-serve source-bundle <wiki-path>` | Any shell with the PyPI package installed | Print source identity, projection metadata, capabilities, raw-origin metadata, and source refs. |
| `llmwiki-serve serve <wiki-path>` | Any shell with the PyPI package installed | Start the read-only HTTP and MCP source server, with A2A compatibility only when explicitly enabled. |
| `npx llmwiki-bridge-start@latest --path <wiki-path>` | Any local workspace | Run the first-run onboarding harness against an existing wiki folder. |
| `npm exec --package llmwiki-agent-bridge@0.2.1 -- llmwiki-agent-bridge` | Any local workspace | Start the optional runtime companion bridge from the published package. |
| `node ./bin/llmwiki-agent-bridge.mjs` | `llmwiki-agent-bridge` checkout | Start the optional runtime companion bridge from a source checkout. |
| `npm run dev` | `llmwiki-chat` checkout | Start the browser workbench through Vite. |
| `npm run check` | `llmwiki-docs` checkout | Validate license artifact freshness and build the Pages site. |

## `llmwiki-serve manifest`

Use `manifest` to confirm that a folder is a supported Knowledge Source before
starting a server or wiring an agent tool.

```sh
llmwiki-serve manifest /path/to/your/wiki
```

Expected output is JSON with source metadata. This example uses the tiny local
sample from the 10-minute quickstart:

```json
{
  "title": "Quickstart Agent Wiki",
  "description": "Tiny local sample for llmwiki-serve package install.",
  "root": "C:/absolute/path/to/llmwiki-quickstart-wiki",
  "adapter": "llmwiki-markdown",
  "implementation": "llmwiki-markdown",
  "page_count": 3,
  "approved_page_count": 2,
  "capabilities": [
    "llmwiki_context",
    "llmwiki_search",
    "llmwiki_read",
    "llmwiki_graph",
    "llmwiki_graph_neighbors",
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
llmwiki-serve query /path/to/your/wiki "release readiness" --limit 4
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
  "wiki_title": "Quickstart Agent Wiki",
  "answerable": true,
  "orientation": [],
  "evidence": [
    {
      "page_id": "hot",
      "title": "Current Agent Focus",
      "path": "hot.md"
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

## `llmwiki-serve source-refs`

Use `source-refs` when a client needs source-owned handles for cited metadata
without the full source-bundle envelope.

```sh
llmwiki-serve source-refs /path/to/your/wiki
```

Expected output is JSON with `source_id` and visible `refs`. Each ref has a
stable opaque id, a `llmwiki://.../source-refs/...` URI, labels declared by the
served pages, and linked page ids. Draft-only refs stay hidden unless draft
serving is explicitly enabled in a trusted local workflow.

Do not derive local file paths from source-ref ids or URIs. Pass them back to
`llmwiki-serve` or keep them as citation metadata in the host trace.

## `llmwiki-serve source-bundle`

Use `source-bundle` when an agent, bridge, or smoke test needs source identity
and citation metadata before deciding whether to query or inspect pages.

```sh
llmwiki-serve source-bundle /path/to/your/wiki
```

Expected output includes:

- `source_id`
- `bundle_id`
- projection metadata such as `projection.signature`
- capabilities, including `llmwiki_source_refs` and `llmwiki_source_bundle`
- visible `source_refs`
- raw-origin metadata when the source declares it

The source bundle is coordination metadata owned by the source endpoint. It is
not an invitation to bypass `llmwiki-serve` and read arbitrary local files.

## `llmwiki-serve serve`

Use `serve` when a browser workbench, IDE agent, MCP-style client, or bridge
needs a stable local Knowledge Source endpoint.

```sh
llmwiki-serve serve /path/to/your/wiki --host 127.0.0.1 --port 8765
```

Command shape:

```text
llmwiki-serve serve <wiki-path> [--host <host>] [--port <1-65535>] [--allow-drafts] [--cors-origin <origin> ...] [--enable-a2a-compat] [--refresh-interval-seconds <seconds>] [--producer-manifest <path>] [--io-log <path|off>]
```

Options:

| Option | Default | Purpose |
| --- | --- | --- |
| `<wiki-path>` | required | Source folder to project. The server treats it as read-only. |
| `--host` | `127.0.0.1` | Bind address. Use loopback for local development. |
| `--port` | `8765` | HTTP port for the source endpoint. |
| `--allow-drafts` | disabled | Allows `include_drafts` requests to return draft or unpublished pages. Keep disabled unless a trusted local workflow needs it. |
| `--cors-origin` | local browser allowlist | Replaces the default local browser CORS allowlist. Repeat for multiple explicit origins. |
| `--enable-a2a-compat` | disabled | Enables legacy A2A-style source compatibility endpoints. Keep disabled unless a client requires that adapter surface. |
| `--refresh-interval-seconds` | `0.0` | Local-performance knob for projection freshness. `0.0` checks the source signature on every request. Positive values reuse the in-memory projection between checks. |
| `--producer-manifest` | unset | Optional producer-owned freshness marker. When the non-symlink marker exists inside the served root, strict refresh checks use it instead of rescanning every source file. |
| `--io-log` | `.runtime-logs/llmwiki-serve-io.jsonl` | Local request/response JSONL logging for `serve`. Set `off` to disable or pass a path to choose a different sink. `LLMWIKI_SERVE_IO_LOG` accepts the same values. |

The default `0.0` is the strict freshness path for local authoring and exact
tests: edits are checked before each served response. A positive refresh
interval can improve repeated requests against larger local graphs, but updates
may be invisible until the interval expires. Use the default, wait for the
interval, or restart the process when you need immediate visibility of a source
change.

Use `--producer-manifest` only for generated wiki outputs whose producer
updates the marker after every source-changing compile. If the marker is
missing, outside the served root, or a symlink, `llmwiki-serve` falls back to
the default strict source scan. The marker controls freshness checks only;
public `projection.signature` and `bundle_id` remain content-derived from the
served projection and are recomputed on initial load and marker changes.

Local I/O logging is enabled by default for HTTP, MCP-style JSON-RPC, MCP
Streamable HTTP, and A2A-style compatibility requests served by
`llmwiki-serve serve`. It writes one JSONL event per request to
`.runtime-logs/llmwiki-serve-io.jsonl` unless `--io-log off` or
`LLMWIKI_SERVE_IO_LOG=off` is set. The logger redacts common credential
headers, token-shaped fields, credential-bearing URLs, private local path
shapes, and the served root, but it still captures user queries and approved
wiki content for debugging. Treat the file as local sensitive data and do not
commit it.

Readiness checks:

```sh
curl -s http://127.0.0.1:8765/health
curl -s http://127.0.0.1:8765/manifest
curl -s http://127.0.0.1:8765/source-refs
curl -s http://127.0.0.1:8765/source-bundle
curl -s http://127.0.0.1:8765/query \
  -H 'content-type: application/json' \
  -d '{"query":"release readiness","limit":4}'
```

Expected readiness output:

| Check | Expected signal |
| --- | --- |
| `/health` | `status: "ok"` with service/version, current source summary, capabilities, endpoint paths, and CORS discovery metadata. |
| `/manifest` | Manifest JSON with `root` redacted to an empty string. |
| `/source-refs` | Visible typed source-reference handles linked to served pages. |
| `/source-bundle` | Source identity, bundle identity, projection metadata, capabilities, raw-origin metadata, and source refs. |
| `/query` | `ContextPack` JSON with `orientation`, `evidence`, `limitations`, and `graph`. |
| `/graph/neighborhood` | Bounded graph neighborhood around one or more `seed` values, with optional `depth`, `direction`, `relation`, `limit`, and `include_drafts`. |
| `/mcp` | JSON-RPC `tools/list` and `tools/call` responses for `llmwiki_context`, `llmwiki_search`, `llmwiki_read`, `llmwiki_graph`, `llmwiki_graph_neighbors`, `llmwiki_source_refs`, and `llmwiki_source_bundle`. |
| `/mcp/stream` | Official MCP Streamable HTTP endpoint when supported by the installed server version. |
| `/.well-known/agent-card.json` | A2A-style discovery card only when A2A source compatibility is enabled. |

Common failures:

| Symptom | Meaning | Next check |
| --- | --- | --- |
| Port bind failure from Uvicorn | The requested port is already in use. | Pick another `--port` and update clients. |
| HTTP `422` with `wiki_root_unsupported` | The source folder has no supported pages at request time. | Confirm source contents or rerun after compile output appears. |
| HTTP `404` with `wiki_root_missing` | The source root was removed or never existed. | Restore the folder or restart with the correct path. |
| Recent source edit is not visible | A positive `--refresh-interval-seconds` value is reusing the in-memory projection between checks. | Keep the default `0.0` for strict freshness, wait for the interval, or restart the process. |
| Generated output changed but the served projection did not | `--producer-manifest` is set, but the producer did not update the marker after changing source files. | Update the marker as part of the producer build, remove `--producer-manifest`, or restart after verifying the producer contract. |
| Browser preflight fails | The browser origin is not allowed. | Add the exact origin with `--cors-origin` or use a local default origin. |
| Draft page is still hidden | The server was not started with `--allow-drafts`, or the request did not set `include_drafts`. | Enable both only in a trusted local workflow. |

## `llmwiki-bridge-start`

Use `llmwiki-bridge-start` as the package-based first-run entrypoint when you
already have one or more wiki folders and want the tooling to guide local
discovery, source startup, bridge registration, and smoke checks. It is an
onboarding harness, not a compiler, ingestion workflow, model runtime, or
replacement for `llmwiki-agent-bridge`.

Run against a known folder:

```sh
npx llmwiki-bridge-start@latest --path /path/to/your/wiki
```

Scan the user's workspace:

```sh
npx llmwiki-bridge-start@latest --workspace
```

At this baseline, `@latest` resolves to `llmwiki-bridge-start@0.0.2`. Pin the
version only for reproducible release checks.

Useful scriptable commands:

| Command | Purpose |
| --- | --- |
| `llmwiki-bridge-start` or `llmwiki-bridge-start quickstart` | Guided first-run flow. |
| `llmwiki-bridge-start discover --path <dir> --validate` | Find candidate wiki roots and validate them with `llmwiki-serve manifest`. |
| `llmwiki-bridge-start start --path <wiki-path> --port <port>` | Start `llmwiki-serve` for a selected source folder. |
| `llmwiki-bridge-start register --bridge http://127.0.0.1:8788 --config .llmwiki-bridge-start/sources.json` | Register started source URLs with a local bridge. |
| `llmwiki-bridge-start smoke --bridge http://127.0.0.1:8788` | Run an evidence-only bridge smoke request. |

Minimum success is a healthy loopback source endpoint and a handoff URL that a
coding agent or script can use directly. When bridge setup is skipped, the
handoff can be a direct source URL or an MCP Streamable HTTP URL such as
`http://127.0.0.1:<port>/mcp/stream`. Optional bridge setup starts or uses
`llmwiki-agent-bridge@0.2.1`; configure a runtime only when you need
runtime-backed synthesis. Interactive runtime installer steps require explicit
approval, and `--yes` automation does not install runtimes unless
`--install-runtime` is also supplied.

## `llmwiki-agent-bridge`

Use the bridge when a client wants one A2A or MCP endpoint that queries selected
Knowledge Sources and returns a normalized artifact. The bridge can run
evidence-only source fan-out without a model, or call an OpenAI-compatible
runtime when synthesis is configured.

Minimal local start for evidence-only mode:

```sh
npm exec --package llmwiki-agent-bridge@0.2.1 -- llmwiki-agent-bridge
```

Source-checkout equivalent:

```sh
cd ../llmwiki-agent-bridge
node ./bin/llmwiki-agent-bridge.mjs
```

Runtime-backed start when an OpenAI-compatible local endpoint is available:

```sh
LLMWIKI_AGENT_BRIDGE_BASE_URL=http://127.0.0.1:8642/v1 \
LLMWIKI_AGENT_BRIDGE_MODEL=local-model \
LLMWIKI_AGENT_BRIDGE_RUNTIME_PROFILE=generic \
npm exec --package llmwiki-agent-bridge@0.2.1 -- llmwiki-agent-bridge
```

From a source checkout, replace the final `npm exec ...` command with
`node ./bin/llmwiki-agent-bridge.mjs`.

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
| `LLMWIKI_AGENT_BRIDGE_AUDIT_LOG` | unset | Opt-in safe request audit JSON lines through the bridge logger. Audit events include route patterns, counts, status, and redaction flags, not raw prompts, answers, URLs, model names, credentials, query strings, or local paths. |
| `LLMWIKI_AGENT_BRIDGE_IO_LOG` | `file` | Default-on I/O debug JSONL. Set `off` to suppress prompt/body/answer debug logs, `logger` or `stdout` to route through process logs, or `file` to append JSONL to a file sink. |
| `LLMWIKI_AGENT_BRIDGE_IO_LOG_PATH` | `.runtime-logs/llmwiki-agent-bridge-io.jsonl` | Optional file path for bridge I/O JSONL logs. |

The default runtime profile is `hermes` for compatibility with existing bridge
setups. For a generic OpenAI-compatible local endpoint, set
`LLMWIKI_AGENT_BRIDGE_RUNTIME_PROFILE=generic` explicitly.

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

For multi-source requests, the current source-checkout bridge uses bounded
concurrency for source fan-out rather than unbounded parallel requests.
Responses are normalized back to the selected source order for citations, graph
data, source bundles, trace steps, and per-source failures, so clients can keep
a stable evidence order even when source calls complete at different times.

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
  "runtimeProfile": "hermes",
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
3. Begin in the `First-run quickstart` panel. It shows the local source and
   bridge commands before you choose a runtime path.
4. For direct source testing, confirm the default Knowledge Source is ready and
   click `Test sample source` or the source card's `Test source`.
5. If `llmwiki-agent-bridge` is running at `http://127.0.0.1:8788`, click
   `Test local bridge` from the quickstart panel or select the local Agent
   Bridge card, choose A2A or MCP mode, and run `Test bridge`.
6. When the bridge is ready, its registered Knowledge Sources appear as
   bridge-managed, read-only source cards. Manage those sources in the bridge
   settings page; keep chat direct sources for standalone source testing.
7. Use `Local Development Runtime` only for deterministic UI checks when no
   bridge or model runtime is available.

The `Local I/O logging` controls are visible in the chat UI and are enabled by
default. They store bounded browser-local JSONL in localStorage for debugging
prompts, runtime request payloads, answers/errors, and response metadata.
Disable the toggle or clear/export/copy the panel before shared-device demos.
Authorization headers, bearer tokens, API-key shaped values, and
credential-bearing URL parts are redacted before storage, but the entries may
still contain user prompts and answer text.

Hermes, DeepAgents, and generic OpenAI-compatible bridge workflows use the
standalone `llmwiki-agent-bridge` package path above. `llmwiki-chat` no longer
ships or tests an embedded bridge binary.

Common failures:

| Symptom | Meaning | Next check |
| --- | --- | --- |
| Source status is not ready | The source URL is wrong, blocked by CORS, or the source server is down. | Check `/health` and `/manifest` in the browser or with `curl`. |
| Bridge says URL is required | A bridge card was selected before a bridge URL was configured. | Open bridge setup, enter the URL, and run `Test bridge`. |
| Bridge URL policy error | External bridge URLs must be public HTTPS, or loopback HTTP(S) for local development unless the local dev private-network override is set. | For private bridge URLs in local dev, set `VITE_LLMWIKI_CHAT_ALLOW_PRIVATE_AGENT_RUNTIME_URLS=true`. |
| Bridge source does not appear in chat | The bridge is not ready, the bridge does not expose `llmwiki_list_sources`, or no sources are saved in bridge settings. | Open bridge settings, verify saved sources, then run `Test bridge` again. |
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

Exact live tests in the component repositories may override the public
quickstart defaults with non-default ports, pre-registered bridge sources, or
runtime environment variables. Treat those as test harness details. The public
quickstart defaults still use `llmwiki-serve` on `127.0.0.1:8765`,
`llmwiki-agent-bridge` on `127.0.0.1:8788`, and evidence-only bridge smoke
without a runtime.

For package and Pages publication status, see
[Release Status & Compatibility](/status). Public users normally do not need
the repository launch automation scripts to run the toolchain locally.
