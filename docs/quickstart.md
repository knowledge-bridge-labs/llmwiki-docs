# Quickstart

This is the shortest public-preview path for an existing LLMWiki user:

1. Start `llmwiki-serve` on one Markdown or LLMWiki-style knowledge graph.
2. Prove the source works with `/health`, `/manifest`, and `/query`.
3. Add `llmwiki-agent-bridge` only when one endpoint should gather evidence or call a runtime.
4. Add `llmwiki-chat` only when a human needs a browser workbench for source, citation, graph, and trace review.

The supported first-run path is source checkouts until the first PyPI/npm package
publication gates pass. See [Release Status & Compatibility](/status).

## Prerequisites

- Git
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

Use your own graph when you already have one. Use the bundled samples when you
want a known-good smoke before pointing at private or larger content.

| Graph path | Use when | Notes |
| --- | --- | --- |
| `/path/to/your/wiki` | You already have a Markdown, Obsidian, or LLMWiki-style graph. | Replace the sample path in the commands below. The server treats the folder as read-only input. |
| `./examples/sample-wiki` | You want the fastest known-good first run. | Stable public sample in the `llmwiki-serve` checkout; includes approved pages, links, source refs, and one withheld draft. |
| `./tests/fixtures/obsidian-vault` | You want to smoke an Obsidian-shaped vault. | Source-checkout fixture for preview validation. |
| `./tests/fixtures/llmwiki-compiler-output` | You want to smoke compiler-style topic wiki output. | Source-checkout fixture for preview validation. |

Fixture paths are relative to the `llmwiki-serve` checkout.

## Start `llmwiki-serve`

Create a workspace for sibling checkouts:

```sh
mkdir llmwiki-workspace
cd llmwiki-workspace
```

Clone and start the sample Knowledge Source:

```sh
git clone https://github.com/knowledge-bridge-labs/llmwiki-serve.git
cd llmwiki-serve
uv sync --extra dev
uv run llmwiki-serve serve ./examples/sample-wiki --host 127.0.0.1 --port 8765
```

To serve your own graph, replace `./examples/sample-wiki` with the folder that
contains your wiki:

```sh
uv run llmwiki-serve serve /path/to/your/wiki --host 127.0.0.1 --port 8765
```

Leave this terminal running. Use one `llmwiki-serve` process per source folder
when different graphs have different lifecycle, draft, or network policies.

If port `8765` is busy, choose another loopback port and use that URL everywhere
below:

```sh
uv run llmwiki-serve serve ./examples/sample-wiki --host 127.0.0.1 --port 39165
```

## Verify The Source

In another terminal:

```sh
curl -s http://127.0.0.1:8765/health
curl -s http://127.0.0.1:8765/manifest
curl -s http://127.0.0.1:8765/source-bundle
```

Expected signals:

- `/health` returns `{"status":"ok"}`.
- `/manifest` returns title, adapter, page counts, capabilities, `source_id`, and a redacted network `root`.
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

You can stop here if your agent, script, IDE extension, or backend service can
call `llmwiki-serve` directly and synthesize its own answer.

For exact CLI output examples, see [Examples](/examples) and
[CLI Reference](/cli-reference).

## Optional Agent Bridge

Use the bridge when one local endpoint should gather evidence from selected
Knowledge Sources and return a normalized artifact. Start with evidence-only
mode; it proves source fan-out without calling a model runtime.

```sh
cd ..
git clone https://github.com/knowledge-bridge-labs/llmwiki-agent-bridge.git
cd llmwiki-agent-bridge
npm ci
node ./bin/llmwiki-agent-bridge.mjs
```

Windows PowerShell:

```powershell
node .\bin\llmwiki-agent-bridge.mjs
```

If port `8788` is busy, set a bridge port before starting it:

```sh
LLMWIKI_AGENT_BRIDGE_PORT=39188 node ./bin/llmwiki-agent-bridge.mjs
```

```powershell
$env:LLMWIKI_AGENT_BRIDGE_PORT = '39188'
node .\bin\llmwiki-agent-bridge.mjs
```

With the sample source on `127.0.0.1:8765` and the bridge on `127.0.0.1:8788`,
send the bundled evidence-only request from the bridge checkout:

```sh
curl -s http://127.0.0.1:8788/message:send \
  -H 'content-type: application/json' \
  --data @examples/message-send.local.json
```

For your own graph or a non-default source URL, post an explicit source
descriptor instead:

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

Bridge success means the returned `llmwiki_agent_result` has:

- `orchestrationMode: "evidence-only"`
- citations from the selected source
- `sourceBundles[0].sourceId`
- source-call trace steps
- no `runtime-chat-completions` step

The bridge calls `llmwiki-serve` through the selected source URL. It does not
read your wiki files directly or store the served source bundle.

## Optional Runtime-Backed Bridge

Configure a runtime only after evidence-only bridge smoke passes. The bridge
expects an externally managed OpenAI-compatible `/v1/chat/completions` endpoint.

macOS/Linux:

```sh
LLMWIKI_AGENT_BRIDGE_BASE_URL=http://127.0.0.1:8642/v1 \
LLMWIKI_AGENT_BRIDGE_MODEL=local-model \
LLMWIKI_AGENT_BRIDGE_RUNTIME_PROFILE=generic \
node ./bin/llmwiki-agent-bridge.mjs
```

Windows PowerShell:

```powershell
$env:LLMWIKI_AGENT_BRIDGE_BASE_URL = 'http://127.0.0.1:8642/v1'
$env:LLMWIKI_AGENT_BRIDGE_MODEL = 'local-model'
$env:LLMWIKI_AGENT_BRIDGE_RUNTIME_PROFILE = 'generic'
node .\bin\llmwiki-agent-bridge.mjs
```

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

```sh
cd ..
git clone https://github.com/knowledge-bridge-labs/llmwiki-chat.git
cd llmwiki-chat
npm ci
npm run dev
```

Open the Vite URL printed by the command. The default Knowledge Source URL is
`http://127.0.0.1:8765`.

First-run flow:

1. Confirm the sample Knowledge Source is `ready`, or add your source URL and click `Test source`.
2. Inspect the Knowledge map, Pages, and Details panels before asking.
3. If the bridge is running, select `Local Agent Bridge (A2A)` or `Local Agent Bridge (MCP)`, confirm the bridge URL, and click `Test bridge`.
4. If no bridge or model runtime is running, switch to `Local Development Runtime` for deterministic UI, citation, trace, and graph smoke tests.
5. Ask a small question, then review the answer, citations, graph context, artifacts, and run details.

If the default Vite port is busy:

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
running.

## Next

| Goal | Page |
| --- | --- |
| See representative JSON output and copyable transcripts | [Examples](/examples) |
| Check exact command behavior and failures | [CLI Reference](/cli-reference) |
| Understand source folder shape | [Knowledge Source Format](/knowledge-source-format) |
| Choose direct source vs bridge vs chat | [Architecture](/architecture) and [Runtime Adapters](/runtime-adapters) |
| Connect Codex, Claude Code, Cursor, scripts, or MCP-style clients | [Direct Agent Integrations](/direct-agent-integrations) and [AI Tool Support](/ai-tools) |
