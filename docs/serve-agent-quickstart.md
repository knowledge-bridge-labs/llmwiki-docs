# `llmwiki-serve` QuickStart

Use this detailed serve-first path when you want a local coding agent, IDE
agent, script, or workbench to read an existing Markdown, Obsidian-style, or
LLMWiki folder as cited context. The default path uses the published PyPI
package and a folder you already own. If you do not have a wiki yet, create the
tiny local sample below and delete it after the smoke test.

The generic [Quickstart](/quickstart) route points here so first-run users have
one primary path. Add bridge, bridge-start, or chat only after the source layer
works and you know which later hurdle they remove.

`llmwiki-serve` is the read-only source layer. It projects files you already
own into cited context, source refs, and graph hints. It does not compile,
ingest, author, crawl, embed, call a model, synthesize final answers, or claim
certified MCP/A2A conformance.

## 1. Install The Published CLI

Install the current public-preview CLI from PyPI:

```sh
uv tool install llmwiki-serve
```

For a pinned, no-shim reproducibility check against the current public-preview
baseline:

```sh
uvx --from llmwiki-serve==0.2.3 llmwiki-serve --help
```

Alternatives:

```sh
pipx install llmwiki-serve
# or install inside an activated virtual environment
python -m pip install llmwiki-serve
```

Pin `llmwiki-serve==0.2.3` when you need to reproduce the current
public-preview baseline exactly.

Confirm the command is available:

```sh
llmwiki-serve --help
```

The remaining commands use the installed `llmwiki-serve` CLI directly. Use
`uv run` only when you intentionally switch to the optional source-checkout
development path near the end.

## 2. Choose Or Create A Wiki Folder

If you already have a Markdown, Obsidian-style, or LLMWiki folder, point the
commands at it:

```powershell
$WikiRoot = "C:\path\to\your\wiki"
```

```sh
WIKI_ROOT=/path/to/your/wiki
```

For a clone-free smoke test, create a tiny local wiki:

```powershell
$WikiRoot = Join-Path (Get-Location) "llmwiki-quickstart-wiki"
New-Item -ItemType Directory -Force $WikiRoot | Out-Null

@'
---
wiki_title: Quickstart Agent Wiki
description: Tiny local sample for llmwiki-serve package install.
review_state: approved
source_refs:
  - SRC-INDEX
---

# Quickstart Agent Wiki

This wiki tracks release readiness for an agent context smoke. Start with
[[hot]] before packaging handoff.
'@ | Set-Content -NoNewline -Encoding ascii (Join-Path $WikiRoot "index.md")

@'
---
title: Current Agent Focus
review_state: approved
source_refs:
  - SRC-HOT
---

# Current Agent Focus

The current focus is release readiness, required copy, approved evidence, and
handoff status before packaging release.
'@ | Set-Content -NoNewline -Encoding ascii (Join-Path $WikiRoot "hot.md")

@'
---
title: Draft Note
review_state: draft
draft: true
source_refs:
  - SRC-DRAFT
---

# Draft Note

This page should be withheld unless draft serving is explicitly enabled.
'@ | Set-Content -NoNewline -Encoding ascii (Join-Path $WikiRoot "draft-note.md")
```

```sh
WIKI_ROOT="$PWD/llmwiki-quickstart-wiki"
mkdir -p "$WIKI_ROOT"

cat > "$WIKI_ROOT/index.md" <<'EOF'
---
wiki_title: Quickstart Agent Wiki
description: Tiny local sample for llmwiki-serve package install.
review_state: approved
source_refs:
  - SRC-INDEX
---

# Quickstart Agent Wiki

This wiki tracks release readiness for an agent context smoke. Start with
[[hot]] before packaging handoff.
EOF

cat > "$WIKI_ROOT/hot.md" <<'EOF'
---
title: Current Agent Focus
review_state: approved
source_refs:
  - SRC-HOT
---

# Current Agent Focus

The current focus is release readiness, required copy, approved evidence, and
handoff status before packaging release.
EOF

cat > "$WIKI_ROOT/draft-note.md" <<'EOF'
---
title: Draft Note
review_state: draft
draft: true
source_refs:
  - SRC-DRAFT
---

# Draft Note

This page should be withheld unless draft serving is explicitly enabled.
EOF
```

Keep the server on `127.0.0.1` while you are validating first-run behavior.

## 3. Inspect The Source

Run `manifest` first to confirm what will be served:

```powershell
llmwiki-serve manifest $WikiRoot
```

```sh
llmwiki-serve manifest "$WIKI_ROOT"
```

Expected tiny-sample signals:

- `title`: `Quickstart Agent Wiki`
- `source_id`: `quickstart-agent-wiki`
- `page_count`: `3`
- `approved_page_count`: `2`
- `capabilities` includes `llmwiki_context`, `llmwiki_source_bundle`, and
  `mcp-streamable-http`

The CLI manifest includes the resolved local root for operator verification.
Network `GET /manifest` responses redact the root.

## 4. Build A Cited Context Pack

Ask one concrete question against the same folder:

```powershell
llmwiki-serve query $WikiRoot "release readiness required copy" --limit 4
```

```sh
llmwiki-serve query "$WIKI_ROOT" "release readiness required copy" --limit 4
```

In the tiny-sample response, check:

- `answerable` is `true`
- `evidence[].path` includes approved pages such as `hot.md`
- `evidence[].source_refs` includes labels such as `SRC-HOT`
- `limitations` says one draft or unapproved page was withheld
- `graph.nodes` includes page or source-ref nodes when graph context is present

Treat this output as source evidence for the host agent. It is not a generated
final answer.

## 5. Inspect Source References

Use `source-refs` and `source-bundle` when a client needs stable source-owned
identity and citation metadata:

```powershell
llmwiki-serve source-refs $WikiRoot
llmwiki-serve source-bundle $WikiRoot
```

```sh
llmwiki-serve source-refs "$WIKI_ROOT"
llmwiki-serve source-bundle "$WIKI_ROOT"
```

`source-refs` maps labels such as `SRC-HOT` to `llmwiki://` URIs and linked
page ids. `source-bundle` adds the source identity, projection signature,
capabilities, raw-origin metadata, and visible source refs in one response.
Handles are opaque; pass them back to the source endpoint instead of deriving
file paths from them.

## 6. Start The Loopback Server

Run the HTTP, MCP-style JSON-RPC, and MCP Streamable HTTP source server on
loopback:

```powershell
llmwiki-serve serve $WikiRoot --host 127.0.0.1 --port 8765
```

```sh
llmwiki-serve serve "$WIKI_ROOT" --host 127.0.0.1 --port 8765
```

Leave that terminal running. By default, `serve` writes redacted local I/O
debugging events to `.runtime-logs/llmwiki-serve-io.jsonl`. Use `--io-log off`
or `LLMWIKI_SERVE_IO_LOG=off` when you do not want local request/response
debug logs.

In another terminal, inspect the local instance registry:

```powershell
llmwiki-serve status
llmwiki-serve status --json
```

```sh
llmwiki-serve status
llmwiki-serve status --json
```

`status` is an alias for `ls`. The registry is local operator state written by
running `serve` processes. It reports PID, URL, source identity, page counts,
health or stale status, and duplicate or parent/subfolder overlap hints. Public
docs and issue reports should replace real roots with placeholders such as
`<wiki-root>`:

```json
{
  "instances": [
    {
      "status": "healthy",
      "url": "http://127.0.0.1:8765",
      "root": "<wiki-root>",
      "source_id": "quickstart-agent-wiki",
      "page_count": 3,
      "approved_page_count": 2,
      "warnings": []
    }
  ]
}
```

Use `llmwiki-serve ls --no-probe` when you need a fast registry read without
calling `/health`. Use `llmwiki-serve ls --prune-stale` only when you intend to
remove records left by hard-killed processes.

## 7. Verify HTTP Readiness

PowerShell:

```powershell
$Base = "http://127.0.0.1:8765"

Invoke-RestMethod "$Base/health"
Invoke-RestMethod "$Base/manifest"
Invoke-RestMethod "$Base/source-bundle"
Invoke-RestMethod "$Base/source-refs"

$Body = @{ query = "release readiness required copy"; limit = 4 } |
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
  -d '{"query":"release readiness required copy","limit":4}'
```

You have a working source server when `/health` reports `status: ok`,
`/manifest` and `/source-bundle` report the same `source_id`, `/source-refs`
returns visible refs, and `/query` returns evidence with page paths and source
ref labels.

## 8. Connect An Agent Or Client

Before wiring a client, smoke the MCP Streamable HTTP endpoint if your client
will use that transport. The package-first validation checks `initialize`,
`tools/list`, and one `llmwiki_context` call against `/mcp/stream`.

PowerShell:

```powershell
$McpHeaders = @{ Accept = "application/json, text/event-stream" }

$InitializeBody = @{
  jsonrpc = "2.0"
  id = 1
  method = "initialize"
  params = @{
    protocolVersion = "2025-06-18"
    capabilities = @{}
    clientInfo = @{ name = "llmwiki-quickstart-smoke"; version = "0.0.0" }
  }
} | ConvertTo-Json -Depth 6 -Compress
Invoke-RestMethod "$Base/mcp/stream" -Method Post -Headers $McpHeaders `
  -ContentType "application/json" -Body $InitializeBody

Invoke-RestMethod "$Base/mcp/stream" -Method Post -Headers $McpHeaders `
  -ContentType "application/json" `
  -Body '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'

$ContextBody = @{
  jsonrpc = "2.0"
  id = 3
  method = "tools/call"
  params = @{
    name = "llmwiki_context"
    arguments = @{ query = "release readiness required copy"; limit = 4 }
  }
} | ConvertTo-Json -Depth 6 -Compress
Invoke-RestMethod "$Base/mcp/stream" -Method Post -Headers $McpHeaders `
  -ContentType "application/json" -Body $ContextBody
```

POSIX shell:

```sh
curl -s "$BASE/mcp/stream" \
  -H 'accept: application/json, text/event-stream' \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"llmwiki-quickstart-smoke","version":"0.0.0"}}}'

curl -s "$BASE/mcp/stream" \
  -H 'accept: application/json, text/event-stream' \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'

curl -s "$BASE/mcp/stream" \
  -H 'accept: application/json, text/event-stream' \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"llmwiki_context","arguments":{"query":"release readiness required copy","limit":4}}}'
```

The smoke passes when `tools/list` includes `llmwiki_context` and the
`llmwiki_context` response returns structured content with answerable evidence
from the approved tiny-sample pages.

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
Name: quickstart-agent-wiki
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

## Package Smoke Checklist

The public package-first path has been validated with these clone-free smokes:

| Check | Command or action | Expected result |
| --- | --- | --- |
| Install source CLI | `uv tool install llmwiki-serve` | Command installs. |
| Reproduce pinned CLI help | `uvx --from llmwiki-serve==0.2.3 llmwiki-serve --help` | Help prints. |
| Create sample wiki | Tiny local Markdown sample above | Files are local and clone-free. |
| Inspect source | `llmwiki-serve manifest "$WIKI_ROOT"` | Manifest prints source metadata. |
| Query source | `llmwiki-serve query "$WIKI_ROOT" "release readiness required copy" --limit 4` | Approved evidence returns. |
| Inspect refs | `llmwiki-serve source-refs "$WIKI_ROOT"` | Visible source refs return. |
| Inspect bundle | `llmwiki-serve source-bundle "$WIKI_ROOT"` | Source bundle returns. |
| Serve source | `llmwiki-serve serve "$WIKI_ROOT" --host 127.0.0.1 --port 8765` | Loopback server starts. |
| Inspect local server registry | `llmwiki-serve status --json` | Running instances report health or stale state without publishing local roots. |
| Verify HTTP | `/health`, `/manifest`, `/query`, `/source-refs`, `/source-bundle` | Endpoints return source data. |
| Verify MCP Streamable HTTP | `/mcp/stream` `initialize`, `tools/list`, and `llmwiki_context` | MCP source tool smoke passes. |
| Check guided startup package | `npx --yes llmwiki-bridge-start@latest --help` | Help prints. |
| Check bridge package | `npx --yes llmwiki-agent-bridge@latest --help` | Help prints. |
| Check chat artifact | `npm install llmwiki-chat@0.1.6` | Static `dist/` artifact exists. |

## Optional: Source Checkout

Use a source checkout only when you want bundled repository fixtures such as
`examples/sample-wiki`, development scripts, or contribution workflow checks.
Package-installed users should point `llmwiki-serve` at an existing Markdown
folder or the tiny local sample above.
