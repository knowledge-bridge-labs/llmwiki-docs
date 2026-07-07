# FAQ

## Is this an official LLM Wiki specification?

No. This is independent community tooling for LLM Wiki-style Markdown
knowledge folders and agent-readable context. It should avoid implying
ownership of upstream concepts or compatibility certification from any named
runtime or vendor.

## Which repository should I clone first?

Clone `llmwiki-serve` first. It is the minimum useful path because it can serve
the sample wiki, answer `/query`, and expose MCP-style JSON-RPC without the
bridge, chat workbench, or any model runtime.

Clone `llmwiki-agent-bridge` later only if you need a companion service for
evidence-only, delegated-runtime, or hybrid answer loops. Clone `llmwiki-chat`
later only if you want a browser workbench for source inspection, bridge
selection, traces, citations, and graph context.

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

## Why do package install commands still point to source checkouts?

The public preview starts from source checkouts. PyPI and npm package names are
reserved for the first package publication gate, but package install commands
are not the first-run path until the release status page marks them available.

If you are working from an offline or mirrored environment, use local sibling
checkouts or accessible mirrored remotes.

## What runtime requirements do I need for first run?

For the minimum `llmwiki-serve` path, install Git, `uv`, and Python `>=3.11`.
`uv` can install and manage the Python version on supported platforms.

For optional JavaScript repositories, install Node.js `>=22.12` with npm `>=10`.
`llmwiki-agent-bridge` also expects an externally managed OpenAI-compatible chat
completions runtime when you want real synthesis. `llmwiki-chat` starts only a
browser client; it does not start `llmwiki-serve` or a production Agent Runtime.

## Can I install the packages instead of cloning?

Source checkout usage is the supported first-run path until the first public
PyPI/npm publications are complete. Use `uv sync --extra dev` in
`llmwiki-serve` and `npm ci` in JavaScript checkouts.

Package install commands become the normal short path only after the matching
package has been published and the release status page marks that package as
available.

## Does the server write into my wiki folder?

No. `llmwiki-serve` is a read-only projection layer. Ingestion, compilation,
and authoring remain owned by the wiki variant or workflow that creates the
Markdown folder and sidecar artifacts.

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
separate GitHub Pages portal gives users one first-10-minute path, one
architecture map, one protocol reference, and one release checklist without
making any runtime package depend on the docs site.
