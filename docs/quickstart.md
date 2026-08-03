# QuickStart

Start with one read-only Knowledge Source. Install the published
`llmwiki-serve` package, point it at one Markdown, Obsidian-style, or LLMWiki
folder, verify the CLI and HTTP surfaces, then add `llmwiki-bridge-start` as
the next handoff step.

The default source URL in this page is `http://127.0.0.1:8765`. Keep the first
run on loopback while you verify behavior.
Package versions and compatibility evidence are tracked in
[Release Status & Compatibility](/status) and [Evidence](/evidence).

## 1. Install `llmwiki-serve`

Install the current public-preview CLI from PyPI:

```sh
uv tool install llmwiki-serve
llmwiki-serve --help
```

For a reproducible check against the current public baseline:

```sh
uvx --from llmwiki-serve==0.2.9 llmwiki-serve --help
```

Pin `llmwiki-serve==0.2.9` only when you need to reproduce the current
released baseline exactly. Use [Release Status & Compatibility](/status) before
publishing docs or release notes.

Alternatives:

```sh
pipx install llmwiki-serve
# or install inside an activated virtual environment
python -m pip install llmwiki-serve
```

## 2. Choose `SOURCE_PATH`

If you already have a Markdown, Obsidian-style, or LLMWiki folder, use that
folder:

```powershell
$SourcePath = "C:\path\to\your\wiki"
```

```sh
SOURCE_PATH=/path/to/your/wiki
```

If you do not have a source yet, create a tiny local smoke-test folder:

```powershell
$SourcePath = Join-Path (Get-Location) "llmwiki-quickstart-source"
New-Item -ItemType Directory -Force $SourcePath | Out-Null

@'
---
wiki_title: QuickStart Agent Wiki
description: Tiny local sample for llmwiki-serve package install.
review_state: approved
source_refs:
  - SRC-INDEX
---

# QuickStart Agent Wiki

This wiki tracks release readiness for an agent context smoke. Start with
[[hot]] before packaging handoff.
'@ | Set-Content -NoNewline -Encoding ascii (Join-Path $SourcePath "index.md")

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
'@ | Set-Content -NoNewline -Encoding ascii (Join-Path $SourcePath "hot.md")

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
'@ | Set-Content -NoNewline -Encoding ascii (Join-Path $SourcePath "draft-note.md")
```

```sh
SOURCE_PATH="$PWD/llmwiki-quickstart-source"
mkdir -p "$SOURCE_PATH"

cat > "$SOURCE_PATH/index.md" <<'EOF'
---
wiki_title: QuickStart Agent Wiki
description: Tiny local sample for llmwiki-serve package install.
review_state: approved
source_refs:
  - SRC-INDEX
---

# QuickStart Agent Wiki

This wiki tracks release readiness for an agent context smoke. Start with
[[hot]] before packaging handoff.
EOF

cat > "$SOURCE_PATH/hot.md" <<'EOF'
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

cat > "$SOURCE_PATH/draft-note.md" <<'EOF'
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

## 3. Run CLI Checks

PowerShell:

```powershell
llmwiki-serve manifest $SourcePath
llmwiki-serve query $SourcePath "release readiness required copy" --limit 4
llmwiki-serve source-refs $SourcePath
llmwiki-serve source-bundle $SourcePath
llmwiki-serve search $SourcePath "release readiness" --mode literal `
  --fields page_id,title,route --snippet-chars 0
```

POSIX shell:

```sh
llmwiki-serve manifest "$SOURCE_PATH"
llmwiki-serve query "$SOURCE_PATH" "release readiness required copy" --limit 4
llmwiki-serve source-refs "$SOURCE_PATH"
llmwiki-serve source-bundle "$SOURCE_PATH"
llmwiki-serve search "$SOURCE_PATH" "release readiness" \
  --mode literal \
  --fields page_id,title,route \
  --snippet-chars 0
```

For the tiny sample, check these signals:

- `manifest` reports `source_id: quickstart-agent-wiki`.
- `manifest` reports `page_count: 3` and `approved_page_count: 2`.
- `query` returns approved evidence such as `hot.md`.
- `limitations` says one draft or unapproved page was withheld.
- `source-refs` includes `SRC-HOT`.
- `source-bundle` reports the same source identity and projection metadata.

The CLI manifest includes the resolved local root for operator verification.
Network `GET /manifest` responses redact the root.

## 4. Serve The Source

Start the source server:

```powershell
llmwiki-serve serve $SourcePath --host 127.0.0.1 --port 8765
```

```sh
llmwiki-serve serve "$SOURCE_PATH" --host 127.0.0.1 --port 8765
```

Leave that terminal running. In another terminal, set the source URL:

```powershell
$SourceUrl = "http://127.0.0.1:8765"
```

```sh
SOURCE_URL=http://127.0.0.1:8765
```

Inspect local running source records:

```sh
llmwiki-serve ls
llmwiki-serve status --json
```

`status` is an alias for `ls`. These commands combine local registry records
written by `serve` with OS process command-line discovery for
`llmwiki-serve serve` processes, then probe discovered local `/health`
endpoints by default. They do not use default fixed-port probing. Use
`--no-processes` for registry-only output and `--probe-port <port>` only for a
manual loopback diagnostic. JSON output can include `discovery_source` and
`root_source`. Redact real local roots from public issues, logs, and
screenshots.

## 5. Verify HTTP

PowerShell:

```powershell
Invoke-RestMethod "$SourceUrl/health"
Invoke-RestMethod "$SourceUrl/manifest"
Invoke-RestMethod "$SourceUrl/source-refs"
Invoke-RestMethod "$SourceUrl/source-bundle"

$Body = @{ query = "release readiness required copy"; limit = 4 } |
  ConvertTo-Json -Compress
Invoke-RestMethod "$SourceUrl/query" -Method Post `
  -ContentType "application/json" -Body $Body
```

POSIX shell:

```sh
curl -s "$SOURCE_URL/health"
curl -s "$SOURCE_URL/manifest"
curl -s "$SOURCE_URL/source-refs"
curl -s "$SOURCE_URL/source-bundle"
curl -s "$SOURCE_URL/query" \
  -H 'content-type: application/json' \
  -d '{"query":"release readiness required copy","limit":4}'
```

You have a working source when `/health` reports `status: ok`, `/manifest` and
`/source-bundle` agree on the source identity, `/source-refs` returns visible
refs, and `/query` returns evidence with page paths and source-ref labels.
For coding agents that should turn `/query` or MCP `llmwiki_context` guidance
into follow-up lexical search/read calls, see
[Direct Agent Integrations](/direct-agent-integrations#agent-guided-lexical-loop).

## 6. Optional MCP Smoke

If your client supports MCP Streamable HTTP, smoke the source endpoint before
registering it:

```sh
curl -s "$SOURCE_URL/mcp/stream" \
  -H 'accept: application/json, text/event-stream' \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"llmwiki-quickstart-smoke","version":"0.0.0"}}}'

curl -s "$SOURCE_URL/mcp/stream" \
  -H 'accept: application/json, text/event-stream' \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'

curl -s "$SOURCE_URL/mcp/stream" \
  -H 'accept: application/json, text/event-stream' \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"llmwiki_context","arguments":{"query":"release readiness required copy","limit":4}}}'
```

The smoke passes when `tools/list` includes `llmwiki_context` and the tool call
returns approved evidence. This is an SDK-backed source surface where supported
by the installed server and client; it is not a certification claim for every
MCP client or runtime.

## 7. Connect An Agent Directly

When a local agent, script, or IDE command can call HTTP directly, pass the
source URL as `LLMWIKI_SOURCE_URL`:

```powershell
$env:LLMWIKI_SOURCE_URL = $SourceUrl
```

```sh
export LLMWIKI_SOURCE_URL="$SOURCE_URL"
```

Use this instruction for direct retrieval:

```text
Use the local read-only LLMWiki source at LLMWIKI_SOURCE_URL.
Call POST /query first with the task question and a small limit.
Inspect /source-bundle and /source-refs for source identity and citation refs.
Use /read/{page_id} or /graph/neighborhood only after evidence identifies a page
or graph seed. Treat returned snippets, paths, and source_refs as source
evidence, not as a generated final answer.
```

For an MCP Streamable HTTP client, register:

```text
Name: quickstart-agent-wiki
Transport: Streamable HTTP
URL: http://127.0.0.1:8765/mcp/stream
First tool: llmwiki_context
Inspection tools: llmwiki_source_bundle, llmwiki_source_refs, llmwiki_read,
llmwiki_graph_neighbors
```

Stop here if your agent can retrieve evidence and synthesize its own answer.

## 8. Next: Add `llmwiki-bridge-start`

After the source checks pass, use `llmwiki-bridge-start` when you want guided
discovery, repeatable source startup, optional bridge registration, and smoke
checks:

```powershell
npx --yes llmwiki-bridge-start@latest --path $SourcePath
npx --yes llmwiki-bridge-start@latest status --json
```

```sh
npx --yes llmwiki-bridge-start@latest --path "$SOURCE_PATH"
npx --yes llmwiki-bridge-start@latest status --json
```

If you add a next source later, repeat the same pattern with another source
path and port, then use `llmwiki-bridge-start status --json` or
`llmwiki-serve ls` to inspect what is running.

Use `llmwiki-agent-bridge` only when one local companion endpoint should fan
out across selected sources or call a configured runtime for a normalized cited
artifact. Keep the bridge URL distinct from runtime endpoint variables:

```sh
BRIDGE_URL=http://127.0.0.1:8788
curl -s "$BRIDGE_URL/health"
curl -s "$BRIDGE_URL/sources?probe=1"
```

`LLMWIKI_AGENT_BRIDGE_BASE_URL` is the model runtime base URL used by the
bridge in runtime-backed modes. It is not the bridge URL.

## Package Smoke Checklist

| Check | Command or action | Expected result |
| --- | --- | --- |
| Install source CLI | `uv tool install llmwiki-serve` | Command installs. |
| Reproduce pinned CLI help | `uvx --from llmwiki-serve==0.2.9 llmwiki-serve --help` | Help prints. |
| Choose source | Existing folder or tiny local sample above | `SOURCE_PATH` points at Markdown content. |
| Inspect source | `llmwiki-serve manifest "$SOURCE_PATH"` | Manifest prints source metadata. |
| Query source | `llmwiki-serve query "$SOURCE_PATH" "release readiness required copy" --limit 4` | Approved evidence returns. |
| Inspect refs | `llmwiki-serve source-refs "$SOURCE_PATH"` | Visible source refs return. |
| Inspect bundle | `llmwiki-serve source-bundle "$SOURCE_PATH"` | Source bundle returns. |
| Serve source | `llmwiki-serve serve "$SOURCE_PATH" --host 127.0.0.1 --port 8765` | Loopback server starts. |
| Inspect discovery | `llmwiki-serve ls` or `llmwiki-serve status --json` | Running instances report health, stale state, and registry/process discovery source. |
| Verify HTTP | `/health`, `/manifest`, `/query`, `/source-refs`, `/source-bundle` | Endpoints return source data. |
| Optionally verify MCP | `/mcp/stream` `initialize`, `tools/list`, and `llmwiki_context` | MCP source smoke passes where supported. |
| Add guided handoff | `npx --yes llmwiki-bridge-start@latest --path "$SOURCE_PATH"` | Guided source startup and handoff checks run. |

## Source Checkout Use

Use a source checkout only when you want bundled repository fixtures,
development scripts, contribution workflow checks, or release verification.
Package-installed users should point `llmwiki-serve` at an existing Markdown
folder or the tiny local sample above.
