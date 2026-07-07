# Release Status & Compatibility

This toolchain is in source-checkout preview. The supported first-run path is
to clone the repositories and run the local checks documented in
[Quickstart](/quickstart). Registry package installs remain pending until the
first PyPI/npm packages are published.

The project is independent community tooling for LLM Wiki-style Markdown
knowledge folders and agent-readable context. It is not an official project
from Andrej Karpathy or any upstream producer named in compatibility examples.

## Availability

| Channel | Status | Use it when |
| --- | --- | --- |
| Source checkouts | Supported preview path | You want to run `llmwiki-serve`, the optional bridge, chat, or docs locally today. |
| GitHub Pages docs | Prepared public documentation path | You want the rendered docs site once Pages is enabled for the docs repository. |
| PyPI/npm packages | Pending first publication | Wait for package publication before relying on package-manager install commands. |

## First-Run Roles

| Need | Start with | Add later |
| --- | --- | --- |
| Serve and query one existing knowledge graph. | `llmwiki-serve` | Nothing else is required when your agent or script can synthesize answers directly. |
| Return one cited artifact through a companion endpoint. | `llmwiki-agent-bridge` after the source works | Add a runtime profile only after evidence-only bridge smoke passes. |
| Inspect source readiness, citations, graph context, and run traces in a browser. | `llmwiki-chat` after the source works | Add a bridge when the browser should test the real bridge path instead of the local development runtime. |

## Repository Status

| Repository | Package metadata | Registry status | Supported path today | Runtime baseline | Primary gate |
| --- | --- | --- | --- | --- | --- |
| `llmwiki-serve` | Python package, Apache-2.0, CLI entrypoint | PyPI publication pending | Source checkout with `uv sync --extra dev` | Python 3.11+ | `uv run python scripts/release_smoke.py` |
| `llmwiki-agent-bridge` | npm package, Apache-2.0, CLI entrypoint | npm publication pending | Source checkout with `npm ci` | Node.js 22.12+ | `npm run check` |
| `llmwiki-chat` | npm package, Apache-2.0, Vite browser workbench artifact | npm publication pending | Source checkout with `npm ci` | Node.js 22.12+ | `npm run check` |
| `llmwiki-docs` | VitePress docs portal, Apache-2.0 | GitHub Pages path prepared | Source checkout with `npm ci` | Node.js 22.12+ | `npm run check` |

The primary gate column is a status-oriented smoke signal. Each repository also
keeps its own README, changelog, package metadata, license files, and CI gates.

The dated `0.1.0` changelog sections in `llmwiki-serve`,
`llmwiki-agent-bridge`, and `llmwiki-chat` describe source-preview baselines.
Registry package publication is still pending until this matrix records package
versions and install commands.

## Protocol Surfaces

| Surface | Owner | Status | Compatibility claim | Validation gate |
| --- | --- | --- | --- | --- |
| HTTP Knowledge Source | `llmwiki-serve` | Public-preview contract | Local HTTP endpoints for manifest, context query, search, read, and graph projection. | `llmwiki-serve` release smoke and `llmwiki-chat` `npm run test:e2e:live` smoke. |
| MCP JSON-RPC compatibility | `llmwiki-serve` | Compatibility surface | Legacy JSON-RPC tool calls for local integration testing. | `llmwiki-serve` MCP smoke coverage. |
| MCP Streamable HTTP | `llmwiki-serve` | SDK-backed source surface where implemented | Official MCP SDK-backed tool calls for source retrieval. | `llmwiki-serve` MCP SDK smoke coverage. |
| A2A source compatibility | `llmwiki-serve` | Opt-in compatibility surface | Agent-card discovery and `message:send` for A2A-native source discovery. | A2A source smoke coverage when enabled. |
| Bridge runtime endpoints | `llmwiki-agent-bridge` | Public-preview contract | A2A and MCP bridge endpoints that gather source evidence and return a grounded answer artifact. | `npm run check` in `llmwiki-agent-bridge`. |
| Browser workbench | `llmwiki-chat` | Public-preview UI | Source selection, graph inspection, bridge selection, trace display, citations, and answer review. | `llmwiki-chat` lint, typecheck, unit, E2E, build, and pack gates. |

## Runtime Adapter Status

| Runtime path | Status | What works | What is not claimed | Validation gate |
| --- | --- | --- | --- | --- |
| Agent Bridge A2A | Public-preview path | Connects chat or clients to a bridge agent card and `message:send` endpoint. | Certified A2A conformance or hosted runtime operation. | Bridge and chat A2A smoke tests. |
| Agent Bridge MCP | Public-preview path | Connects chat or MCP clients to `llmwiki_agent_run` on the bridge. | Certified MCP conformance or hosted runtime operation. | Bridge and chat MCP smoke tests. |
| Local Development Runtime | Supported for development | Deterministic UI flow, tool-call trace, citation rendering, and graph continuity. | Production answer quality. | `npm run test` and `npm run test:e2e` in `llmwiki-chat`. |
| Hermes profile | Supported bridge profile | Uses the bridge runtime profile for Hermes-compatible gateways. | Product-certified Hermes integration. | Bridge profile tests plus operator smoke against a real Hermes-compatible gateway. |
| DeepAgents profile | Supported bridge profile | Uses the bridge runtime profile for DeepAgents-compatible gateways. | Product-certified DeepAgents integration. | Bridge profile tests plus operator smoke against a real DeepAgents runtime. |
| Generic OpenAI-compatible profile | Supported bridge profile | Calls `/v1/chat/completions` with source evidence and normalizes an answer artifact. | Any provider-specific model quality or hosted runtime SLA. | `npm run check` in `llmwiki-agent-bridge`. |
| Copilot or IDE agents | Direct-client candidate | Can use direct HTTP, MCP-style, or skill/command integrations when the agent environment supports them. | Built-in Copilot adapter or product validation. | Integration-specific manual smoke. |

Validation evidence should be read from the current repository checks rather
than from a single historical commit. For a local preview, run the primary gate
listed in the repository matrix and any live source, bridge, or chat smoke that
matches the path you plan to use.

## Non-Claims

- Not certified MCP conformance.
- Not certified A2A conformance.
- Not product-certified Hermes, DeepAgents, Copilot, or IDE integration.
- Not a hosted production runtime.
- Not a vector database, crawler, ingestion pipeline, or full-stack RAG app.
- Not a promise that private wiki content is safe to expose without operator
  review, network controls, authentication, and logging policy.

## Status Update Rule

Before publishing a package version, update this page with the actual registry
state, package versions, supported runtime paths, protocol caveats, and
validation commands used for that release.
