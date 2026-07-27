# Quickstart

This is the shortest public-preview path for an existing LLMWiki user:

1. Start `llmwiki-serve` on one Markdown or LLMWiki-style knowledge graph.
2. Prove the source works with `/health`, `/manifest`, `/source-refs`,
   `/source-bundle`, and `/query`.
3. Add `llmwiki-agent-bridge` only when one endpoint should gather evidence or call a runtime.
4. Add `llmwiki-chat` only when a human needs a browser workbench for source, citation, graph, and trace review.

The supported first-run path uses the published packages listed in
[Release Status & Compatibility](/status). Current package versions are
`llmwiki-serve==0.2.2`, `llmwiki-bridge-start@0.0.2`,
`llmwiki-agent-bridge@0.2.1`, and `llmwiki-chat@0.1.6`. Use source checkouts
only when you want bundled fixtures, development scripts, or contribution
workflow checks.

For the package-installed source-only path that exercises `manifest`, `query`,
`source-refs`, `source-bundle`, loopback HTTP, and MCP Streamable HTTP before
any bridge or chat layer, use
[10-Minute Agent Context Quickstart](/serve-agent-quickstart).

## Prerequisites

- Git only for optional source checkouts
- `uv`
- Python `>=3.11` for `llmwiki-serve`
- Node.js `>=22.12` and npm `>=10` for the optional bridge, chat, and docs repositories
- `curl` for HTTP smoke checks. On Windows PowerShell, use `curl.exe` explicitly.

Check versions:

```sh
git --version
uv --version
python --version
node --version
npm --version
curl --version
```

Shell snippets use POSIX syntax unless marked `Windows PowerShell`.

## Choose A Knowledge Graph

Use your own graph when you already have one. If you do not have a wiki yet,
the [10-Minute Agent Context Quickstart](/serve-agent-quickstart) includes a
tiny copy-paste local sample that works with the installed PyPI package.
Bundled repository fixtures are optional source-checkout examples.

| Graph path | Use when | Notes |
| --- | --- | --- |
| `/path/to/your/wiki` | You already have a Markdown, Obsidian, or LLMWiki-style graph. | Default public path. The server treats the folder as read-only input. |
| `llmwiki-quickstart-wiki` | You want a clone-free smoke test. | Create it from the 10-minute quickstart, then reuse the commands below. |
| `/path/to/repo` with `openwiki/quickstart.md` | You generated repository documentation with OpenWiki. | Point at the repo root or directly at `openwiki/`; `quickstart.md` is served as the index entrypoint. |
| `./examples/sample-wiki` | You want the bundled repository sample. | Optional `llmwiki-serve` source-checkout fixture; includes approved pages, links, source refs, and one withheld draft. |
| `./tests/fixtures/obsidian-vault` | You want to smoke an Obsidian-shaped vault. | Optional source-checkout fixture for preview validation. |
| `./tests/fixtures/llmwiki-compiler-output` | You want to smoke compiler-style topic wiki output. | Optional source-checkout fixture for preview validation. |

Source-checkout fixture paths are relative to the `llmwiki-serve` checkout.

::: tip Compiler output quickstart
If you are starting from raw sources instead of an existing Markdown wiki, run
your upstream compiler, authoring, or ingest workflow first. Point
`llmwiki-serve` at the generated Markdown wiki folder after the compile step
writes pages, frontmatter, links, tags, source references, or graph sidecars.
`llmwiki-serve` projects the generated Markdown; it does not run that upstream
workflow.
:::

## Start `llmwiki-serve`

Install the published CLI from PyPI:

```sh
uv tool install llmwiki-serve
```

Alternatives:

```sh
pipx install llmwiki-serve
# or install inside an activated virtual environment
python -m pip install llmwiki-serve
```

Start a source endpoint for your wiki folder:

```sh
llmwiki-serve serve /path/to/your/wiki --host 127.0.0.1 --port 8765
```

Pin the command when you need exact public-preview reproduction:

```sh
uv tool install llmwiki-serve==0.2.2
```

Leave this terminal running. Use one `llmwiki-serve` process per source folder
when different graphs have different lifecycle, draft, or network policies.
By default, `llmwiki-serve` checks source freshness on every request. For large
local graphs, the CLI also exposes
`--refresh-interval-seconds <seconds>` as an opt-in local-performance knob. A
positive value reuses the in-memory projection between checks, so recent edits
may not appear until the interval expires or the process restarts.

Generated wiki producers that can atomically update a build marker after every
source-changing compile may opt into `--producer-manifest <path>` for
long-running servers. Keep the default strict scan unless the producer owns that
marker discipline; the marker is a freshness hint, not the public
`projection.signature` or `bundle_id`.

Local I/O logging is enabled by default for `llmwiki-serve serve` and writes
redacted request/response JSONL to `.runtime-logs/llmwiki-serve-io.jsonl`.
Pass `--io-log off` or set `LLMWIKI_SERVE_IO_LOG=off` to disable it; pass a
path or set `LLMWIKI_SERVE_IO_LOG=<path>` to choose another sink. The logger
redacts common credentials, credential-bearing URLs, private local path shapes,
and the served root, but it still captures user queries and approved wiki
content for debugging, so treat the file as local sensitive data.

If port `8765` is busy, choose another loopback port and use that URL everywhere
below:

```sh
llmwiki-serve serve /path/to/your/wiki --host 127.0.0.1 --port 39165
```

## Verify The Source

In another terminal:

```sh
curl -s http://127.0.0.1:8765/health
curl -s http://127.0.0.1:8765/manifest
curl -s http://127.0.0.1:8765/source-refs
curl -s http://127.0.0.1:8765/source-bundle
```

Expected signals:

- `/health` returns `status: "ok"` plus service/version, source identity,
  capabilities, endpoint paths, and CORS discovery metadata.
- `/manifest` returns title, adapter, page counts, capabilities, `source_id`, and a redacted network `root`.
- `/source-refs` returns visible typed source-reference handles linked to
  served pages.
- `/source-bundle` returns `source_id`, `bundle_id`, projection metadata, and source refs when pages declare them.

If `manifest` shows the wrong title or page count, restart the server at the
folder that owns the wiki content, not at a parent folder with unrelated build
artifacts.

## Query It Directly

Prove retrieval before adding a runtime or browser UI:

```sh
curl -s http://127.0.0.1:8765/query \
  -H 'content-type: application/json' \
  -d '{"query":"release readiness","limit":4}'
```

For Windows PowerShell, write JSON bodies to a file:

```powershell
@'
{"query":"release readiness","limit":4}
'@ | Set-Content -NoNewline -Encoding ascii query.json

curl.exe -s http://127.0.0.1:8765/query `
  -H 'content-type: application/json' `
  --data-binary '@query.json'
```

Accept the source when the response includes:

- the same query text
- `wiki_title`
- `orientation`
- `evidence` or an explicit limitation
- citation fields such as `page_id`, `title`, and `path`
- graph nodes or edges when available

Optional MCP-style smoke:

```sh
curl -s http://127.0.0.1:8765/mcp \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"llmwiki_context","arguments":{"query":"release readiness","limit":4}}}'
```

Optional graph-neighborhood smoke after a query identifies a useful page or
source-ref seed:

```sh
curl -s 'http://127.0.0.1:8765/graph/neighborhood?seed=release-readiness&depth=1'
```

You can stop here if your agent, script, IDE extension, or backend service can
call `llmwiki-serve` directly and synthesize its own answer.

For exact CLI output examples, see [Examples](/examples) and
[CLI Reference](/cli-reference).

## Optional Agent Bridge

Use `llmwiki-bridge-start` as the first-run entrypoint when you want guided
discovery, source startup, bridge registration, and smoke checks from existing
wiki folders. It does not compile or ingest knowledge, and it does not replace
`llmwiki-agent-bridge`; it hands you direct source URLs or an optional bridge
handoff.

Run it against a known wiki folder:

```sh
npx llmwiki-bridge-start@latest --path /path/to/your/wiki
```

Or let it scan your workspace for candidate wiki folders:

```sh
npx llmwiki-bridge-start@latest --workspace
```

The current `@latest` release resolves to `llmwiki-bridge-start@0.0.2` at this
baseline; pin `0.0.2` only when you need reproducible release checks. Minimum
success is a healthy loopback `llmwiki-serve` source endpoint. If you skip the
bridge, use the printed source URL or MCP Streamable HTTP handoff URL
(`<source>/mcp/stream`) directly with a coding agent or script. Add
`llmwiki-agent-bridge` only when one local endpoint should gather evidence from
selected Knowledge Sources, fan out across multiple sources, or call a runtime
for a normalized artifact. Start with evidence-only mode; it proves source
fan-out without calling a model runtime.

When bridge-start offers to configure Hermes or DeepAgents during interactive
setup, runtime installation is an approval gate. It downloads and runs a
documented installer only after explicit approval; `--yes` automation does not
run runtime installers unless `--install-runtime` is also supplied.

Start the published bridge package:

```sh
npx llmwiki-agent-bridge@latest
```

Pin the current public-preview bridge when you need reproducible checks:

```sh
npm exec --package llmwiki-agent-bridge@0.2.1 -- llmwiki-agent-bridge
```

Use a source checkout only for bridge development, bundled examples, or
repository-local checks:

```sh
cd ../llmwiki-agent-bridge
npm ci
node ./bin/llmwiki-agent-bridge.mjs
```

From Windows PowerShell in a source checkout:

```powershell
node .\bin\llmwiki-agent-bridge.mjs
```

If port `8788` is busy, set a bridge port before starting it:

```sh
LLMWIKI_AGENT_BRIDGE_PORT=39188 npx llmwiki-agent-bridge@latest
```

```powershell
$env:LLMWIKI_AGENT_BRIDGE_PORT = '39188'
npx llmwiki-agent-bridge@latest
```

With a source on `127.0.0.1:8765` and the bridge on `127.0.0.1:8788`, post an
explicit source descriptor:

```sh
curl -s http://127.0.0.1:8788/message:send \
  -H 'content-type: application/json' \
  -d '{
    "data": {
      "query": "what should I know first?",
      "mode": "evidence-only",
      "knowledgeSources": [
        {
          "id": "local-wiki",
          "name": "Local Wiki",
          "protocol": "llmwiki-http",
          "status": "ready",
          "url": "http://127.0.0.1:8765",
          "selected": true
        }
      ]
    }
  }'
```

If you are working from a `llmwiki-agent-bridge` source checkout, you can use
the bundled fixture instead:

```sh
curl -s http://127.0.0.1:8788/message:send \
  -H 'content-type: application/json' \
  --data @examples/message-send.local.json
```

Bridge success means the returned `llmwiki_agent_result` has:

- `orchestrationMode: "evidence-only"`
- citations from the selected source
- `sourceBundles[0].sourceId`
- source-call trace steps
- no `runtime-chat-completions` step

The bridge calls `llmwiki-serve` through the selected source URL. It does not
read your wiki files directly or store the served source bundle. For
multi-source requests, bridge fan-out uses bounded concurrency and the returned
citations, graph data, source bundles, trace steps, and per-source failures
preserve the selected source order even when individual source calls finish out
of order.

Optional MCP source-tool smoke:

```sh
curl -s http://127.0.0.1:8788/mcp \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

curl -s http://127.0.0.1:8788/mcp \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"llmwiki_context","arguments":{"query":"release readiness","limit":4,"knowledgeSources":[{"id":"local-wiki","name":"Local Wiki","protocol":"llmwiki-http","status":"ready","url":"http://127.0.0.1:8765","selected":true}]}}}'
```

Use `llmwiki_agent_run` when the bridge should return a full grounded answer
artifact. Use read-only source tools such as `llmwiki_list_sources`,
`llmwiki_context`, `llmwiki_search`, `llmwiki_read`, `llmwiki_graph`,
`llmwiki_graph_neighbors`, and `llmwiki_source_bundle` when your host agent
wants progressive source exploration without a runtime call. If you register
sources through `/settings`, source tools can omit inline `knowledgeSources`
and use the registered source IDs.

## Optional Runtime-Backed Bridge

Configure a runtime only after evidence-only bridge smoke passes. The bridge
expects an externally managed OpenAI-compatible `/v1/chat/completions` endpoint.

macOS/Linux:

```sh
LLMWIKI_AGENT_BRIDGE_BASE_URL=http://127.0.0.1:8642/v1 \
LLMWIKI_AGENT_BRIDGE_MODEL=local-model \
LLMWIKI_AGENT_BRIDGE_RUNTIME_PROFILE=generic \
npx llmwiki-agent-bridge@latest
```

Windows PowerShell:

```powershell
$env:LLMWIKI_AGENT_BRIDGE_BASE_URL = 'http://127.0.0.1:8642/v1'
$env:LLMWIKI_AGENT_BRIDGE_MODEL = 'local-model'
$env:LLMWIKI_AGENT_BRIDGE_RUNTIME_PROFILE = 'generic'
npx llmwiki-agent-bridge@latest
```

From a source checkout, use `node ./bin/llmwiki-agent-bridge.mjs` or
`node .\bin\llmwiki-agent-bridge.mjs` as the final command.

| Profile | Use when |
| --- | --- |
| `generic` | Any OpenAI-compatible local runtime. |
| `hermes` | Hermes or a Hermes-compatible local gateway. |
| `deepagents` | DeepAgents behind an OpenAI-compatible endpoint. |

Open `http://127.0.0.1:8788/settings` for the guided setup. Register your
Knowledge Source URL, save the runtime profile/base URL/model, and run
`Verify Bridge`.

## Optional Chat Workbench

Use chat when a human needs to inspect source readiness, graph context,
citations, artifacts, and run details.

`llmwiki-chat@0.1.6` is a published static browser artifact, not a CLI package.
It does not expose `npx llmwiki-chat`. Install it into a small workspace and
serve the packaged `dist/` directory with a static file server:

```sh
mkdir llmwiki-chat-static
cd llmwiki-chat-static
npm init -y
npm install llmwiki-chat@0.1.6
python -m http.server 5173 --directory node_modules/llmwiki-chat/dist --bind 127.0.0.1
```

Open `http://127.0.0.1:5173`. The default direct Knowledge Source URL is
`http://127.0.0.1:8765`.

Use a source checkout only for chat UI development, screenshot refreshes, or
repository-local checks:

```sh
cd ../llmwiki-chat
npm ci
npm run dev
```

First-run flow:

1. Start in the `First-run quickstart` panel. It shows copyable commands for
   the local sample source and the optional local bridge.
2. For direct source testing, confirm the sample Knowledge Source URL is
   `http://127.0.0.1:8765`, then click `Test sample source` or the source
   card's `Test source`. Add your own source URL only after the sample passes.
3. For bridge testing, start `llmwiki-agent-bridge` on
   `http://127.0.0.1:8788`, then click `Test local bridge` from the quickstart
   panel or select `Local Agent Bridge (A2A)` / `Local Agent Bridge (MCP)`,
   confirm the bridge URL, and click `Test bridge`.
4. When a bridge is ready, chat discovers the bridge's registered Knowledge
   Sources and shows them as bridge-managed, read-only source cards. Edit those
   sources in the bridge settings page; direct source cards in chat remain
   separate for standalone `llmwiki-serve` testing and debugging.
5. Inspect the Knowledge map, Pages, and Details panels before asking.
6. If no bridge or model runtime is running, switch to `Local Development
   Runtime` for deterministic UI, citation, trace, and graph smoke tests.
7. Ask a small question, then review the answer, citations, graph context,
   artifacts, and run details.

The `Local I/O logging` controls are enabled by default in the chat UI. They
keep bounded browser-local JSONL in localStorage for debugging prompts, runtime
request payloads, answers/errors, and response metadata. Disable or clear the
panel before shared-device demos. Redaction removes common credentials and
credential-bearing URL parts before storage, but logged prompts and answers may
still contain sensitive content.

If the source-checkout Vite port is busy:

```sh
npm run dev -- --port 39173
```

For a non-interactive source UI smoke against an already-running
`llmwiki-serve`:

```sh
LLMWIKI_LIVE_SERVE_URL=http://127.0.0.1:8765 npm run test:e2e:live -- --project=desktop
```

Windows PowerShell:

```powershell
$env:LLMWIKI_LIVE_SERVE_URL = 'http://127.0.0.1:8765'
npm run test:e2e:live -- --project=desktop
```

## Common Ports

| Service | Default |
| --- | --- |
| `llmwiki-serve` | `127.0.0.1:8765` |
| `llmwiki-agent-bridge` | `127.0.0.1:8788` |
| `llmwiki-chat` dev server | Vite output, usually `127.0.0.1:5173` |
| `llmwiki-chat` live E2E web server | `127.0.0.1:4173` |

For public or semi-public deployments, prefer HTTPS, authentication, source
allowlists, and stricter bridge source policy before exposing endpoints beyond
loopback. See [Network & Security](/network-security).

## Baseline Verification

Run these before treating local checkouts as release-ready:

```sh
# llmwiki-serve
uv run ruff check .
uv run mypy src
uv run pytest
uv run python scripts/release_smoke.py
uv build

# llmwiki-agent-bridge
npm run check

# llmwiki-chat
npm run check

# llmwiki-docs
npm run check
```

Some live E2E tests require running source or runtime processes. Treat skipped
live tests as expected only when the prerequisite service is intentionally not
running. Exact repository tests may use non-default ports, pre-registered
bridge sources, or runtime environment variables; those overrides do not change
the public quickstart defaults shown above.

## Next

| Goal | Page |
| --- | --- |
| See representative JSON output and copyable transcripts | [Examples](/examples) |
| Exercise source-only agent context | [10-Minute Agent Context Quickstart](/serve-agent-quickstart) |
| Understand raw sources to compiler output to served projection | [Data Flow](/data-flow) |
| Check exact command behavior and failures | [CLI Reference](/cli-reference) |
| Understand source folder shape | [Knowledge Source Format](/knowledge-source-format) |
| Choose direct source vs bridge vs chat | [Architecture](/architecture) and [Runtime Adapters](/runtime-adapters) |
| Connect Codex, Claude Code, Cursor, scripts, or MCP-style clients | [Direct Agent Integrations](/direct-agent-integrations) and [AI Tool Support](/ai-tools) |
