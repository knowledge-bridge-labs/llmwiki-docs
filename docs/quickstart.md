# Quickstart

This is the shortest public-preview path for an existing Markdown, Obsidian, or
LLMWiki-style knowledge folder:

1. Start `llmwiki-serve` on one folder.
2. Verify one `/query` response.
3. Optionally run `llmwiki-bridge-start` for guided discovery and handoff.

Stop after the query check when your agent, script, IDE extension, or backend
service can call `llmwiki-serve` directly. Add bridge or chat workflows only
when you need multi-source fan-out, runtime-backed answer artifacts, or a
browser workbench.

Package versions and compatibility evidence are tracked in
[Release Status & Compatibility](/status) and [Evidence](/evidence).

## Prerequisites

- `uv`
- Python `>=3.11`
- `curl` for HTTP checks. On Windows PowerShell, use `curl.exe` explicitly.
- Git only when using the sample source checkout.
- Node.js `>=22.12` and npm `>=10` only for optional `llmwiki-bridge-start`.

Check local tools:

```sh
uv --version
python --version
curl --version
```

Optional bridge-start tools:

```sh
node --version
npm --version
```

Shell snippets use POSIX syntax unless marked `Windows PowerShell`.

## Choose A Folder

Use your own wiki folder when you already have one:

```text
/path/to/your/wiki
```

Use the sample when you want a known-good first run:

```text
./examples/sample-wiki
```

The sample path is relative to a `llmwiki-serve` source checkout. If you are
starting from raw project files instead of an existing Markdown wiki, run your
compiler, authoring, or ingest workflow first, then point `llmwiki-serve` at
the generated Markdown output. `llmwiki-serve` projects the folder read-only; it
does not run the upstream compile or ingest step.

## Start `llmwiki-serve`

If you already have a wiki folder, use the published package:

```sh
uv tool install llmwiki-serve
llmwiki-serve serve /path/to/your/wiki --host 127.0.0.1 --port 8765
```

For a reproducible check against the current live package baseline:

```sh
uvx --from llmwiki-serve==0.2.6 llmwiki-serve serve /path/to/your/wiki --host 127.0.0.1 --port 8765
```

If you want the bundled sample, use a source checkout:

```sh
git clone https://github.com/knowledge-bridge-labs/llmwiki-serve.git
cd llmwiki-serve
uv sync --extra dev
uv run llmwiki-serve serve ./examples/sample-wiki --host 127.0.0.1 --port 8765
```

To serve your own folder from a checkout, replace the sample path:

```sh
uv run llmwiki-serve serve /path/to/your/wiki --host 127.0.0.1 --port 8765
```

Leave this terminal running. If port `8765` is busy, choose another loopback
port and use that URL in every command below:

```sh
uv run llmwiki-serve serve ./examples/sample-wiki --host 127.0.0.1 --port 39165
```

For exact CLI options such as draft access, CORS, refresh intervals, producer
manifests, I/O logging, and MCP/A2A compatibility endpoints, see
[CLI Reference](/cli-reference) and [API Reference](/api-reference).

## Verify One Query

In another terminal, confirm the source is the one you expected:

```sh
curl -s http://127.0.0.1:8765/health
curl -s http://127.0.0.1:8765/manifest
```

Then prove retrieval with one query:

```sh
curl -s http://127.0.0.1:8765/query \
  -H 'content-type: application/json' \
  -d '{"query":"release readiness","limit":4}'
```

Windows PowerShell:

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
- `evidence` or an explicit `limitations` entry
- citation fields such as `page_id`, `title`, and `path`
- graph nodes or edges when available

If `/manifest` shows the wrong title or page count, restart the server at the
folder that owns the wiki content, not at a parent folder with unrelated build
artifacts. If `/query` has no approved evidence, try a broader query or inspect
draft filtering in the source folder.

For representative JSON, MCP-style calls, source-bundle checks, and graph
neighborhood examples, see [Examples](/examples), [CLI Reference](/cli-reference),
and [API Reference](/api-reference).

## Optional Bridge-Start Handoff

Use `llmwiki-bridge-start` when you want a guided first-run flow for discovery,
source startup, optional bridge registration, and smoke checks from existing
wiki folders. It does not compile knowledge, host a model runtime, or replace
direct `llmwiki-serve` calls.

Run it against a known wiki folder:

```sh
npm exec --package llmwiki-bridge-start@0.0.3 -- llmwiki-bridge-start --path /path/to/your/wiki
```

Or let it scan your workspace for candidate wiki folders:

```sh
npm exec --package llmwiki-bridge-start@0.0.3 -- llmwiki-bridge-start --workspace
```

Minimum success is a healthy loopback `llmwiki-serve` source endpoint plus a
handoff URL. Use the printed source URL or MCP URL directly with a coding agent
or script. Add `llmwiki-agent-bridge` only when one companion endpoint should
query multiple sources, normalize citations and traces, or call a configured
runtime.

For the deeper bridge, runtime, and browser workbench flows, use these pages:

| Need | Page |
| --- | --- |
| Exact `llmwiki-bridge-start` commands and subcommands | [CLI Reference](/cli-reference#llmwiki-bridge-start) |
| Manual `llmwiki-agent-bridge` startup and runtime profiles | [CLI Reference](/cli-reference#llmwiki-agent-bridge) and [Runtime Adapters](/runtime-adapters) |
| Direct Codex, Claude Code, Cursor, Copilot-style, MCP, or script integration | [Direct Agent Integrations](/direct-agent-integrations) and [AI Tool Support](/ai-tools) |
| Source-plus-bridge transcript and chat workbench setup | [Examples](/examples#source-and-bridge-transcript) and [Examples](/examples#chat-workbench) |
| Network, CORS, auth, and endpoint exposure decisions | [Network & Security](/network-security) |

## Default Local URLs

| Service | Default |
| --- | --- |
| `llmwiki-serve` | `http://127.0.0.1:8765` |
| `llmwiki-agent-bridge` | `http://127.0.0.1:8788` |

Keep endpoints on loopback for the first run. Before exposing sources or
bridges beyond loopback, review [Network & Security](/network-security).

## Next

| Goal | Page |
| --- | --- |
| See representative JSON output and copyable transcripts | [Examples](/examples) |
| Check exact command behavior and failures | [CLI Reference](/cli-reference) |
| Understand source folder shape | [Knowledge Source Format](/knowledge-source-format) |
| Choose direct source vs bridge vs chat | [Architecture](/architecture) and [Runtime Adapters](/runtime-adapters) |
| Connect coding agents or MCP-style clients | [Direct Agent Integrations](/direct-agent-integrations) and [AI Tool Support](/ai-tools) |
| Check package status | [Release Status & Compatibility](/status) |
