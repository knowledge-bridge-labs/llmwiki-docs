# AI Tool Support

This page maps agent and IDE clients to concrete integration patterns. The
toolchain is local-first: `llmwiki-serve` supplies read-only context, clients
or runtimes decide how to use that context, and `llmwiki-agent-bridge` is
optional when a client wants one companion endpoint for evidence fan-out or
runtime synthesis.

## Choose an Integration Path

| Need | Use | Why |
| --- | --- | --- |
| The agent can call local HTTP, shell commands, or MCP-style tools and can synthesize its own answer. | Direct source pattern | Fewer moving parts. The agent retrieves `ContextPack` JSON and cites source fields itself. |
| The client expects JSON-RPC tools. | MCP-style pattern | `llmwiki-serve` exposes `tools/list` and `tools/call` at `/mcp`. |
| The client or browser wants one companion endpoint for selected sources. | Bridge pattern | `llmwiki-agent-bridge` handles source fan-out, evidence bundling, optional runtime calls, citations, graph, and trace. |
| A human needs to inspect sources, traces, and bridge readiness. | `llmwiki-chat` | The browser workbench makes source and bridge state visible before asking. |

## Tool Mapping

| Tool or client | Primary pattern | Concrete template |
| --- | --- | --- |
| Codex | Direct source call from a skill, command, or repo script. Use the bridge when Codex delegates source fan-out, evidence normalization, or runtime synthesis to a companion service. | Define a local command that calls `POST /query`, returns the JSON, and instructs Codex to cite `title`, `path`, and `source_refs`. |
| Claude Code | Direct source call from a slash command, skill, shell command, or MCP-style tool. | Create a command that accepts `{query, limit}`, calls `llmwiki-serve`, and prints compact evidence before Claude Code composes the answer. |
| GitHub Copilot | IDE integration candidate through MCP-style tools, HTTP tools, or workspace tasks when the IDE environment supports them. | Expose `llmwiki_context` as a local tool or add a workspace task that prints `ContextPack` JSON for the current question. |
| Cursor | Direct MCP-style or command integration candidate. | Register a local MCP-style source or command wrapper that calls `/query`, then let Cursor use returned evidence as workspace context. |
| Backend scripts | Direct HTTP. | Call `/query`, `/search`, `/read/{page_id}`, or `/graph` from tests, release checks, and internal tools. |
| Browser workbench | `llmwiki-chat` plus optional bridge. | Host the static `llmwiki-chat@0.1.6` package artifact, add a Knowledge Source URL, then choose Agent Bridge A2A, Agent Bridge MCP, or Local Development Runtime for UI-only testing. |
| Hermes-compatible runtime | Bridge profile. | Set `LLMWIKI_AGENT_BRIDGE_RUNTIME_PROFILE=hermes` and point `BASE_URL` at the runtime's OpenAI-compatible `/v1` endpoint. |
| DeepAgents-compatible runtime | Bridge profile. | Set `LLMWIKI_AGENT_BRIDGE_RUNTIME_PROFILE=deepagents` and use the same `llmwiki_agent_result` artifact shape. |
| OpenAI-compatible local runtime | Generic bridge profile. | Set `LLMWIKI_AGENT_BRIDGE_RUNTIME_PROFILE=generic` with the runtime `BASE_URL` and `MODEL`. |

These are integration paths, not vendor-certified integrations. Keep product
names in docs tied to the path being exercised: direct source call, MCP tool,
Agent Bridge A2A/MCP, or bridge runtime profile.

## Direct Source Template

Use this when the AI tool can call an HTTP endpoint or command and will compose
the final answer itself.

```sh
curl -s http://127.0.0.1:8765/query \
  -H 'content-type: application/json' \
  -d '{"query":"how should this project be released?","limit":6}'
```

Expected client behavior:

1. Ask `llmwiki_context` or `POST /query` first.
2. Read `orientation` for project-level framing.
3. Use `evidence` for the answer body.
4. Preserve `limitations` in the answer or trace when they affect confidence.
5. Cite `title`, `path`, `page_id`, and `source_refs` instead of local
   absolute file paths.

A compact command wrapper can normalize this pattern for Codex, Claude Code,
Cursor, Copilot workspace tasks, or scripts:

```sh
LLMWIKI_SOURCE_URL=http://127.0.0.1:8765
curl -s "$LLMWIKI_SOURCE_URL/query" \
  -H 'content-type: application/json' \
  -d '{"query":"release readiness","limit":6}'
```

Template prompt for a direct-call agent:

```text
Call the local LLMWiki source before answering. Use the ContextPack evidence,
cite page title and path, mention limitations that affect the answer, and do
not infer facts that are not present in the returned context.
```

## MCP-Style Template

Use this when the client prefers JSON-RPC tool calls.

List tools:

```sh
curl -s http://127.0.0.1:8765/mcp \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Call the primary context tool:

```sh
curl -s http://127.0.0.1:8765/mcp \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"llmwiki_context","arguments":{"query":"release readiness","limit":6}}}'
```

Available tool names:

| Tool | Use first? | Purpose |
| --- | --- | --- |
| `llmwiki_context` | yes | Query-ranked context pack with orientation, evidence, limitations, and graph hints. |
| `llmwiki_search` | no | Follow-up search when the first context points to a narrower topic. |
| `llmwiki_read` | no | Read a specific returned `page_id`. |
| `llmwiki_graph` | no | Inspect graph nodes and edges for trace or UI context. |
| `llmwiki_source_bundle` | no | Discover source identity, projection metadata, raw-origin metadata, and source refs. |
| `llmwiki_source_refs` | no | Inspect typed source-reference handles linked from approved pages. |

Recommended tool policy:

- Prefer `llmwiki_context` before `search`, `read`, or `graph`.
- Do not request drafts unless the server was intentionally started with
  `--allow-drafts` for a trusted local workflow.
- Treat JSON-RPC `-32601`, `-32602`, and `-32000` as tool errors with safe,
  redacted messages.

## Bridge Template

Use the bridge when the AI client wants one endpoint that fans out across
selected sources and returns a normalized artifact. Use evidence-only mode when
you want source proof without a model runtime; use runtime-backed mode when the
bridge should call an OpenAI-compatible runtime.

Bridge source fan-out uses bounded concurrency, and the artifact is ordered by
the selected source list. Keep returned citations, graph data, source bundles,
trace steps, and per-source failures in that order when rendering evidence or
feeding another runtime.

Start the bridge for evidence-only source fan-out:

```sh
npx llmwiki-agent-bridge@latest
```

Send a message with `mode: "evidence-only"`:

```sh
BRIDGE_URL=http://127.0.0.1:8788

curl -s "$BRIDGE_URL/message:send" \
  -H 'content-type: application/json' \
  -d '{
    "data": {
      "query": "What should I know before release?",
      "mode": "evidence-only",
      "knowledgeSources": [
        {
          "id": "sample-wiki",
          "name": "Sample Wiki",
          "protocol": "llmwiki-http",
          "status": "ready",
          "url": "http://127.0.0.1:8765",
          "selected": true
        }
      ]
    }
  }'
```

Start the bridge with a runtime profile when synthesis should be delegated:

```sh
LLMWIKI_AGENT_BRIDGE_BASE_URL=http://127.0.0.1:8642/v1 \
LLMWIKI_AGENT_BRIDGE_MODEL=local-model \
LLMWIKI_AGENT_BRIDGE_RUNTIME_PROFILE=generic \
npx llmwiki-agent-bridge@latest
```

For bridge setup, open `$BRIDGE_URL/settings`: Step 1 connects the runtime
through `PUT /settings/config.json`, Step 2 registers sources through
`GET/PUT /settings/sources.json`, and Step 3 verifies the bridge with
`POST /message:send`. Advanced network/auth controls are under
diagnostics/advanced.

Send a runtime-backed message directly when automating the same verify path:

```sh
curl -s "$BRIDGE_URL/message:send" \
  -H 'content-type: application/json' \
  -d '{
    "data": {
      "query": "What should I know before release?",
      "knowledgeSources": [
        {
          "id": "sample-wiki",
          "name": "Sample Wiki",
          "protocol": "llmwiki-http",
          "status": "ready",
          "url": "http://127.0.0.1:8765",
          "selected": true
        }
      ]
    }
  }'
```

Expected result:

- HTTP `200` with an A2A-style completed task or MCP tool result, depending on
  the bridge mode.
- A text answer in `message.parts`.
- A structured `llmwiki_agent_result` artifact.
- `citations`, `graph`, and `steps` inside the artifact data.
- In evidence-only mode, no `runtime-chat-completions` step is present.

Use bridge failure modes to guide client UX:

| Status | Meaning |
| --- | --- |
| `400` | Bad JSON body or missing query. |
| `401` | Bridge bearer token is configured and missing from the request. |
| `403` | Browser origin is not allowed. |
| `502` | Runtime chat-completions call failed. |
| `500` | Unexpected bridge failure. |

Per-source failures usually appear in trace `steps` instead of failing the
whole request when other selected sources still work.

## Client Templates

Use these as implementation sketches for local tools and commands.

All examples assume:

```sh
export LLMWIKI_SOURCE_URL=http://127.0.0.1:8765
```

Windows PowerShell:

```powershell
$env:LLMWIKI_SOURCE_URL = 'http://127.0.0.1:8765'
```

Codex skill or command:

```text
Input: query string and optional limit.
Action: POST {query, limit} to LLMWIKI_SOURCE_URL/query.
Output: compact JSON or markdown summary preserving title, path, source_refs,
limitations, and snippets.
Instruction: answer only from returned evidence unless explicitly asked to use
general knowledge.
```

Claude Code command:

```text
Command name: llmwiki-context
Arguments: $QUERY
Shell: curl -s "$LLMWIKI_SOURCE_URL/query" -H "content-type: application/json"
  -d "{\"query\":\"$QUERY\",\"limit\":6}"
Use: run before editing docs, release notes, or architecture explanations that
depend on wiki facts.
```

Copilot or Cursor workspace task:

```text
Task: llmwiki context
Input: question text
Command: node scripts/llmwiki-context.mjs "$QUESTION"
Script behavior: read LLMWIKI_SOURCE_URL, call /query, print evidence and
limitations in a stable format.
Use: paste or expose the task output to the IDE assistant as project context.
```

MCP-style tool registration:

```text
Server URL: http://127.0.0.1:8765/mcp
Primary tool: llmwiki_context
Follow-up tools: llmwiki_search, llmwiki_read, llmwiki_graph
Policy: start with context, cite returned identifiers, keep draft access off by
default.
```

## Copyable Starter Artifacts

Use these small files when your agent environment supports local commands.
They intentionally call `llmwiki-serve` directly; add
`llmwiki-agent-bridge` only when you want a separate service to own source
fan-out, evidence normalization, and optional runtime synthesis.

### Codex Skill Skeleton

Create `.codex/skills/llmwiki-query/SKILL.md` in the project where Codex runs:

```md
# LLMWiki Query

Use when a question depends on the local project wiki.

Before answering, call:

`curl -s "$LLMWIKI_SOURCE_URL/query" -H "content-type: application/json" -d "{\"query\":\"<question>\",\"limit\":6}"`

Answer only from returned `orientation`, `evidence`, `limitations`, and graph
hints unless the user explicitly asks for general knowledge. Cite page `title`,
`path`, and `source_refs`.
```

### Claude Code Slash Command

Create `.claude/commands/llmwiki-query.md`:

```md
Query the local LLMWiki source before answering.

Run:

`curl -s "$LLMWIKI_SOURCE_URL/query" -H "content-type: application/json" -d "{\"query\":\"$ARGUMENTS\",\"limit\":6}"`

Use returned evidence and limitations. Cite page title and path.
```

Then ask Claude Code to run `/llmwiki-query release readiness`.

### Cursor Or IDE Command Wrapper

Create `scripts/llmwiki-context.mjs`:

```js
const sourceUrl = process.env.LLMWIKI_SOURCE_URL || 'http://127.0.0.1:8765'
const query = process.argv.slice(2).join(' ') || 'what is in this wiki?'
const response = await fetch(`${sourceUrl.replace(/\/+$/, '')}/query`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ query, limit: 6 }),
})
if (!response.ok) throw new Error(`llmwiki query failed: ${response.status}`)
console.log(JSON.stringify(await response.json(), null, 2))
```

Register that script as a task or command in the IDE, then feed the output to
the assistant as project context. If the IDE supports MCP Streamable HTTP or a
compatible JSON-RPC tool surface, use `http://127.0.0.1:8765/mcp` and start
with `llmwiki_context`.

### Copilot Workspace Task

For VS Code or Copilot Enterprise-style workflows, start with a workspace task
that prints source evidence. Create `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "llmwiki: context",
      "type": "shell",
      "command": "node scripts/llmwiki-context.mjs \"${input:llmwikiQuestion}\"",
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "llmwikiQuestion",
      "type": "promptString",
      "description": "Question for the local LLMWiki source"
    }
  ]
}
```

For Copilot Studio or managed enterprise deployments, treat this as a proof of
the retrieval contract, then implement the approved organizational connector,
MCP server registration, authentication, and network policy separately.

## Readiness Checks

Before wiring a tool into an AI workflow:

1. `curl -s http://127.0.0.1:8765/health` returns `{ "status": "ok" }`.
2. `curl -s http://127.0.0.1:8765/manifest` returns the expected title and
   capabilities.
3. A direct `/query` call returns evidence or an explicit limitation.
4. If using MCP-style calls, `tools/list` includes `llmwiki_context`.
5. If using the bridge without a runtime, `POST /message:send` with
   `mode: "evidence-only"` returns a `llmwiki_agent_result` artifact and no
   `runtime-chat-completions` step.
6. If using the bridge with a runtime, `/health` reports `modelConfigured:
   true`, then `/settings` Step 3 or an equivalent `POST /message:send` call
   returns a `llmwiki_agent_result` artifact.
7. If using `llmwiki-chat`, the source and selected bridge/runtime both show ready
   before asking.

Some exact live tests use non-default ports, saved bridge source registration,
or runtime environment variables to isolate test processes. Those requirements
belong to the test harness; the public QuickStart defaults remain
`SOURCE_URL=http://127.0.0.1:8765`, `BRIDGE_URL=http://127.0.0.1:8788`, and
evidence-only bridge smoke before configuring a runtime.

## Compatibility Posture

Public preview language should stay conservative:

- Official MCP SDK-backed surfaces are documented where implemented. Legacy
  MCP-style JSON-RPC and A2A compatibility surfaces are public-preview
  compatibility paths, not certified conformance claims.
- Hermes, DeepAgents, Copilot, Codex, Claude Code, Cursor, and IDE agent names
  describe integration paths or runtime profiles, not vendor-certified support.
- The server is read-only. Authoring, ingestion, and compilation remain owned
  by the wiki variant or upstream workflow.
- Operators choose the network, authentication, CORS, TLS, and logging posture
  appropriate for their private data.

## Local-First Default

For private or personal knowledge folders, start with loopback URLs:

```text
SOURCE_URL=http://127.0.0.1:8765  llmwiki-serve
BRIDGE_URL=http://127.0.0.1:8788  llmwiki-agent-bridge
```

Move to a private network, HTTPS reverse proxy, or public deployment only after
the operator has reviewed draft handling, CORS policy, authentication, source
URL policy, and log-retention requirements.
