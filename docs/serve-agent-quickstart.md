# 10-Minute Agent Context Quickstart

Use this path when you want a local coding agent, IDE agent, script, or
workbench to read an existing Markdown, Obsidian-style, or LLMWiki folder as
cited context. Start with the bundled `examples/sample-wiki` fixture before
pointing the same commands at private notes or project docs.

`llmwiki-serve` is the read-only source layer. It projects files you already
own into cited context, source refs, and graph hints. It does not compile,
ingest, author, crawl, embed, call a model, synthesize final answers, or claim
certified MCP/A2A conformance.

## 1. Start From The Sample

Clone the source server and install its local development environment:

```sh
git clone https://github.com/knowledge-bridge-labs/llmwiki-serve.git
cd llmwiki-serve
uv sync --extra dev
```

Pick the synthetic public sample wiki:

```powershell
$WikiRoot = ".\examples\sample-wiki"
```

```sh
WIKI_ROOT=./examples/sample-wiki
```

For your own folder later, replace the sample path with a local Markdown,
Obsidian-style, or LLMWiki folder. Keep the server on `127.0.0.1` while you are
validating first-run behavior.

## 2. Inspect The Source

Run `manifest` first to confirm what will be served:

```powershell
uv run llmwiki-serve manifest $WikiRoot
```

```sh
uv run llmwiki-serve manifest "$WIKI_ROOT"
```

Expected sample signals:

- `title`: `Sample Packaging LLMWiki`
- `source_id`: `sample-packaging-llmwiki`
- `page_count`: `5`
- `approved_page_count`: `4`
- `capabilities` includes `llmwiki_context`, `llmwiki_source_bundle`, and
  `mcp-streamable-http`

The CLI manifest includes the resolved local root for operator verification.
Network `GET /manifest` responses redact the root.

## 3. Build A Cited Context Pack

Ask one concrete question against the same folder:

```powershell
uv run llmwiki-serve query $WikiRoot "required copy release readiness" --limit 4
```

```sh
uv run llmwiki-serve query "$WIKI_ROOT" "required copy release readiness" --limit 4
```

In the sample response, check:

- `answerable` is `true`
- `evidence[].path` includes approved pages
- `evidence[].source_refs` includes labels such as `SRC-HOT`
- `limitations` says one draft or unapproved page was withheld
- `graph.nodes` includes source-ref or page nodes when graph context is present

Treat this output as source evidence for the host agent. It is not a generated
final answer.

## 4. Inspect Source References

Use `source-refs` and `source-bundle` when a client needs stable source-owned
identity and citation metadata:

```powershell
uv run llmwiki-serve source-refs $WikiRoot
uv run llmwiki-serve source-bundle $WikiRoot
```

```sh
uv run llmwiki-serve source-refs "$WIKI_ROOT"
uv run llmwiki-serve source-bundle "$WIKI_ROOT"
```

`source-refs` maps labels such as `SRC-HOT` to `llmwiki://` URIs and linked
page ids. `source-bundle` adds the source identity, projection signature,
capabilities, raw-origin metadata, and visible source refs in one response.
Handles are opaque; pass them back to the source endpoint instead of deriving
file paths from them.

## 5. Start The Loopback Server

Run the HTTP, MCP-style JSON-RPC, and MCP Streamable HTTP source server on
loopback:

```powershell
uv run llmwiki-serve serve $WikiRoot --host 127.0.0.1 --port 8765
```

```sh
uv run llmwiki-serve serve "$WIKI_ROOT" --host 127.0.0.1 --port 8765
```

Leave that terminal running. By default, `serve` writes redacted local I/O
debugging events to `.runtime-logs/llmwiki-serve-io.jsonl`. Use `--io-log off`
or `LLMWIKI_SERVE_IO_LOG=off` when you do not want local request/response
debug logs.

## 6. Verify HTTP Readiness

PowerShell:

```powershell
$Base = "http://127.0.0.1:8765"

Invoke-RestMethod "$Base/health"
Invoke-RestMethod "$Base/manifest"
Invoke-RestMethod "$Base/source-bundle"
Invoke-RestMethod "$Base/source-refs"

$Body = @{ query = "required copy release readiness"; limit = 4 } |
  ConvertTo-Json -Compress
Invoke-RestMethod "$Base/query" -Method Post -ContentType "application/json" -Body $Body
```

POSIX shell:

```sh
BASE=http://127.0.0.1:8765

curl -s "$BASE/health"
curl -s "$BASE/manifest"
curl -s "$BASE/source-bundle"
curl -s "$BASE/source-refs"
curl -s "$BASE/query" \
  -H 'content-type: application/json' \
  -d '{"query":"required copy release readiness","limit":4}'
```

You have a working source server when `/health` reports `status: ok`,
`/manifest` and `/source-bundle` report the same `source_id`, `/source-refs`
returns visible refs, and `/query` returns evidence with page paths and source
ref labels.

## 7. Connect An Agent Or Client

For direct HTTP use, set the local base URL:

```powershell
$env:LLMWIKI_SERVE_URL = "http://127.0.0.1:8765"
```

```sh
export LLMWIKI_SERVE_URL=http://127.0.0.1:8765
```

Use this client instruction:

```text
Use the local read-only LLMWiki source at http://127.0.0.1:8765.
Call POST /query first with the task question and a small limit.
Inspect /source-bundle and /source-refs for source identity and citation refs.
Use /read/{page_id} or /graph/neighborhood only after evidence identifies a page
or graph seed. Treat returned snippets, paths, and source_refs as source
evidence, not as a generated final answer.
```

For an MCP Streamable HTTP client, configure the source URL when the client
supports that transport:

```text
Name: sample-packaging-llmwiki
Transport: Streamable HTTP
URL: http://127.0.0.1:8765/mcp/stream
First tool: llmwiki_context
Inspection tools: llmwiki_source_bundle, llmwiki_source_refs, llmwiki_read,
llmwiki_graph_neighbors
```

This is an MCP SDK-backed source surface where supported by the installed
server and client. It is not a certification claim for every MCP client or
runtime.

Stop here if the agent can retrieve evidence and synthesize its own answer.
Add `llmwiki-agent-bridge` only when one local endpoint should fan out across
multiple sources or call a configured runtime for a normalized cited artifact.
