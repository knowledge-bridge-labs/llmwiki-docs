# FAQ

## Is this an official LLM Wiki specification?

No. This is independent community tooling for LLM Wiki-style Markdown
knowledge folders and agent-readable context. It should avoid implying
ownership of upstream concepts or compatibility certification from any named
runtime or vendor.

## Which package should I install first?

Start with `llmwiki-serve` first. It is the minimum useful path because it can
serve a wiki folder, answer `/query`, and expose MCP-style JSON-RPC without the
bridge, chat workbench, or any model runtime.

Use the published `llmwiki-serve==0.2.3` package for the default path. Clone
the repository only when you want bundled fixtures or development scripts.

Run `npx llmwiki-bridge-start@latest` when you want guided discovery and
source startup. Run `npx llmwiki-agent-bridge@latest` only if you need a
companion service for evidence-only, delegated-runtime, or hybrid answer loops.
Install `llmwiki-chat@0.1.6` only if you want to host the static browser
workbench for source inspection, bridge selection, traces, citations, and graph
context.

## Do I need all three repositories?

No. Start with the smallest component that matches the job:

| Need | Component |
| --- | --- |
| Query one existing wiki folder from an agent, script, or command. | `llmwiki-serve` |
| Return one cited answer artifact through a runtime companion service. | `llmwiki-agent-bridge` |
| Inspect sources, graph context, bridge traces, and answers in a browser. | `llmwiki-chat` |

`llmwiki-docs` is only the cross-repo documentation and release-operations
entrypoint.

## Can I stop after starting `llmwiki-serve`?

Yes. If `GET /health`, `GET /manifest`, and `POST /query` work for your wiki,
you already have the useful first-run result: a read-only local Knowledge
Source that agents, scripts, and tools can call directly.

Use `Ctrl+C` in the server terminal when you are done. Leave it running only
when you want to connect optional tools such as the bridge or chat workbench.

## Why do docs still show source checkouts?

Source checkouts remain supported because they include fixtures, development
scripts, and release-smoke commands. Package installs are now available for the
current public-preview baseline: `llmwiki-serve==0.2.3`,
`llmwiki-bridge-start@0.0.3`, `llmwiki-agent-bridge@0.3.0`, and
`llmwiki-chat@0.1.6`.

If you are working from an offline or mirrored environment, use local sibling
checkouts or accessible mirrored remotes.

## What runtime requirements do I need for first run?

For the minimum `llmwiki-serve` path, install `uv` and Python `>=3.11`. `uv`
can install and manage the Python version on supported platforms. Git is needed
only for optional source checkouts or contribution workflows.

For optional JavaScript packages, install Node.js `>=22.12` with npm `>=10`.
`llmwiki-agent-bridge` also expects an externally managed OpenAI-compatible chat
completions runtime when you want real synthesis. `llmwiki-chat` starts only a
browser client when its static package artifact is hosted; it does not start
`llmwiki-serve` or a production Agent Runtime.

## Can I install the packages instead of cloning?

Yes. Use `uv tool install llmwiki-serve` or
`uvx --from llmwiki-serve==0.2.3 llmwiki-serve ...` for the source server. Use
`npx llmwiki-bridge-start@latest --path /path/to/your/wiki` when you want the
guided first-run entrypoint. Use `npx llmwiki-agent-bridge@latest` when you
want to run the bridge directly for source fan-out or runtime-backed answers.
Use `npm install llmwiki-chat@0.1.6` when you want the static browser
workbench artifact; the current chat package has no CLI `bin`. Source checkouts
remain the development path for bundled fixtures, Vite dev server work, or
repository-local checks.

## Does the server write into my wiki folder?

No. `llmwiki-serve` is a read-only projection layer. Ingestion, compilation,
and authoring remain owned by the wiki variant or workflow that creates the
Markdown folder and sidecar artifacts.

## What is a projection?

A projection is a read-only view derived from your Markdown wiki files.
`llmwiki-serve` parses pages, metadata, links, tags, source references, and
optional sidecars, then exposes that derived view through APIs for agents and
tools. The Markdown folder remains the source of truth.

## Does `llmwiki-serve` run my ingest or compiler workflow?

No. Run your upstream ingest, authoring, or compiler workflow before starting
or querying `llmwiki-serve`. The server picks up compatible Markdown pages and
sidecar files after they exist on disk; it does not fetch raw sources, run an
upstream compiler, or rewrite generated Markdown output.

## How is this different from Obsidian graph view?

Obsidian graph view is a human editor feature for browsing links in a vault.
The `llmwiki-serve` graph projection is an agent-facing API view derived from
Markdown links, tags, headings, source references, and optional sidecar facts.
They can describe the same files, but Obsidian owns authoring while
`llmwiki-serve` owns read-only retrieval surfaces.

## What happens after a wiki is projected?

Agents and scripts can call `llmwiki-serve` directly and own their own answer
loop. `llmwiki-agent-bridge` can gather evidence from selected sources and
optionally call a runtime. `llmwiki-chat` can inspect sources, graph context,
citations, and bridge traces in a browser.

## Can one server expose multiple knowledge graphs?

The recommended public-preview default is one Knowledge Source server per
knowledge graph. Clients can connect multiple sources directly or through the
bridge when they need fan-out.

## Should I expose the server publicly?

Not by default. For personal and internal workflows, prefer loopback, SSH
tunnels, a VPN, a private overlay network, or a private reverse proxy. Public
exposure needs an explicit operator decision around authentication, HTTPS,
CORS, draft handling, logging, and rate limits.

## Is plain HTTP supported?

Yes for local, personal, and trusted private-network use. HTTP keeps first-run
setup simple. For untrusted networks or public deployments, put the service
behind HTTPS and authentication.

## When should I use the bridge?

Use the bridge when a client needs one endpoint that collects source evidence,
calls a configured OpenAI-compatible runtime, and returns a normalized answer,
citations, graph data, and trace steps.

Skip the bridge when the agent can call `llmwiki-serve` directly and perform
its own synthesis.

## Are Hermes and DeepAgents bundled?

No. Runtime names are bridge profiles or integration paths. Operators install,
configure, secure, and monitor those runtimes separately.

## Are MCP and A2A officially certified here?

No. Official MCP SDK-backed surfaces are documented where implemented, while
legacy MCP-style JSON-RPC and A2A compatibility paths remain public-preview
integration surfaces. Certified conformance should be documented only after a
separate conformance effort.

## Why a separate docs repository?

The three runtime repositories have different jobs and release gates. A
separate GitHub Pages portal gives users one serve-first onboarding path, one
architecture map, one protocol reference, and one release checklist without
making any runtime package depend on the docs site.
