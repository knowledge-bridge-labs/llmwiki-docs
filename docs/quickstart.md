# Quickstart

Start with the source layer. The default first run is:

1. Point `llmwiki-serve` at one existing Markdown, Obsidian-style, or LLMWiki
   folder.
2. Verify the read-only served view with `manifest`, `query`, `source-refs`,
   `source-bundle`, `/health`, `/manifest`, `/source-refs`, `/source-bundle`,
   and `/query`.
3. Connect an agent, script, IDE tool, or MCP Streamable HTTP client directly
   to that local source.

Use the detailed [`llmwiki-serve` QuickStart](/serve-agent-quickstart) for the
copyable commands. This page keeps the short `/quickstart` route as a gateway
so there is one obvious path instead of two competing first-run flows.

## Default Path

The shortest useful result is a read-only Knowledge Source on loopback:

```sh
uv tool install llmwiki-serve
llmwiki-serve manifest /path/to/your/wiki
llmwiki-serve query /path/to/your/wiki "what should I know first?" --limit 4
llmwiki-serve source-refs /path/to/your/wiki
llmwiki-serve source-bundle /path/to/your/wiki
llmwiki-serve serve /path/to/your/wiki --host 127.0.0.1 --port 8765
```

In another terminal, use the local instance registry when you need to confirm
which source servers are running:

```sh
llmwiki-serve status
llmwiki-serve status --json
```

If you do not have a wiki folder yet, the
[`llmwiki-serve` QuickStart](/serve-agent-quickstart) includes a tiny local
sample you can create without cloning any repository.

Stop after this path when your agent or script can retrieve evidence and
compose its own answer. `llmwiki-serve` does not compile, ingest, crawl, embed,
call a model, or write to the source folder.

## Add Later Only If Needed

| Later hurdle | Add | Default command or install |
| --- | --- | --- |
| You want guided discovery, source startup, and handoff from local folders. | `llmwiki-bridge-start` | `npx llmwiki-bridge-start@latest --path /path/to/your/wiki`; use `status` or `ls` for started-source state. |
| A client needs one companion endpoint across sources or a runtime escalation path. | `llmwiki-agent-bridge` | `npx llmwiki-agent-bridge@latest`; use `sources --probe --json` for registry checks. |
| A human needs to inspect source readiness, pages, citations, graph context, or bridge traces in a browser. | `llmwiki-chat` | `npm install llmwiki-chat@0.1.6`, then host `node_modules/llmwiki-chat/dist` |

Current package baselines are listed in
[Release Status & Compatibility](/status). At this baseline,
`llmwiki-agent-bridge@0.3.0` exposes a package CLI for `npx`/`npm exec`.
`llmwiki-chat@0.1.6` is a static browser artifact with no CLI `bin`, so do not
try to run it through `npx`.

Source checkouts remain useful for bundled fixtures, development scripts,
screenshot refreshes, and release verification. They are not the default
personal or team onboarding path.

## Next

| Goal | Page |
| --- | --- |
| Run the detailed source-layer setup | [`llmwiki-serve` QuickStart](/serve-agent-quickstart) |
| Connect Codex, Claude Code, Cursor, IDE agents, scripts, or MCP-style clients | [Direct Agent Integrations](/direct-agent-integrations) and [AI Tool Support](/ai-tools) |
| See representative JSON output | [Examples](/examples) |
| Check supported package versions and non-claims | [Release Status & Compatibility](/status) |
| Review private-network and logging posture | [Network & Security](/network-security) |
