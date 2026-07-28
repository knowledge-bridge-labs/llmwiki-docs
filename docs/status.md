# Release Status & Compatibility

This toolchain is in public preview. The supported public first-run path uses
the published package installs shown below. Source checkouts remain supported
for bundled fixtures, development scripts, and release verification. Use
[`llmwiki-serve` QuickStart](/serve-agent-quickstart) for the shortest local
source checks.
`llmwiki-serve==0.2.3` is the current source-server package baseline.
`llmwiki-bridge-start@0.0.3` is the current first-run entrypoint for local
discovery, source startup, optional bridge registration, and smoke checks.
`llmwiki-agent-bridge@0.3.0` is the current bridge package for source fan-out,
runtime profile configuration, and normalized answer artifacts.
`llmwiki-chat@0.1.6` is the current browser workbench static artifact package.
Public registry checks on 2026-07-28 confirmed `llmwiki-serve 0.2.3`,
`llmwiki-bridge-start 0.0.3`, `llmwiki-agent-bridge 0.3.0`, and
`llmwiki-chat 0.1.6`.

Publication evidence:

| Package | Current version | Evidence |
| --- | --- | --- |
| `llmwiki-serve` | `0.2.3` | PyPI latest verified; publish workflow [`30356643454`](https://github.com/knowledge-bridge-labs/llmwiki-serve/actions/runs/30356643454). |
| `llmwiki-bridge-start` | `0.0.3` | npm latest verified; publish workflow [`30357056742`](https://github.com/knowledge-bridge-labs/llmwiki-bridge-start/actions/runs/30357056742). |
| `llmwiki-agent-bridge` | `0.3.0` | npm latest verified; publish workflow [`30356422156`](https://github.com/knowledge-bridge-labs/llmwiki-agent-bridge/actions/runs/30356422156). |
| `llmwiki-chat` | `0.1.6` | npm latest verified; unchanged static artifact package. |

The project is independent community tooling for LLM Wiki-style Markdown
knowledge folders and agent-readable context. It is not an official project
from Andrej Karpathy or any upstream producer named in compatibility examples.

## Availability

| Channel | Status | Use it when |
| --- | --- | --- |
| Source checkouts | Supported development path | You want bundled fixtures, source-level development scripts, screenshot refreshes, or release verification. |
| GitHub Pages docs | Live at `https://knowledge-bridge-labs.github.io/llmwiki-docs/` | You want the rendered docs site for quickstart, architecture, protocol, and release-status references. |
| PyPI/npm packages | Published | Use package-manager installs for `llmwiki-serve==0.2.3`, `llmwiki-bridge-start@0.0.3`, `llmwiki-agent-bridge@0.3.0`, and the static `llmwiki-chat@0.1.6` artifact. |

## First-Run Roles

| Need | Start with | Add later |
| --- | --- | --- |
| Serve and query one existing knowledge graph. | `llmwiki-serve` | Nothing else is required when your agent or script can synthesize answers directly. |
| Discover local wiki folders and get a guided first-run handoff. | `llmwiki-bridge-start` | Add the bridge when you want one endpoint across sources or runtime-backed answers. |
| Return one cited artifact through a companion endpoint. | `llmwiki-agent-bridge` after the source works | Add a runtime profile only after evidence-only bridge smoke passes. |
| Inspect source readiness, citations, graph context, and run traces in a browser. | `llmwiki-chat` after the source works | Add a bridge when the browser should test the real bridge path instead of the local development runtime. |

## Repository Status

| Repository | Package metadata | Registry status | Supported path today | Runtime baseline | Primary gate |
| --- | --- | --- | --- | --- | --- |
| `llmwiki-serve` | Python package 0.2.3, Apache-2.0, CLI entrypoint | PyPI published 0.2.3 | Package install or source checkout with `uv sync --extra dev` | Python 3.11+ | `uv run python scripts/release_smoke.py` |
| `llmwiki-bridge-start` | npm package 0.0.3, Apache-2.0, CLI entrypoint | npm published 0.0.3 | Package CLI through `npx llmwiki-bridge-start@latest`; source checkout for harness development | Node.js 22.12+ | `npx llmwiki-bridge-start@latest --help` or repository `npm run check` |
| `llmwiki-agent-bridge` | npm package 0.3.0, Apache-2.0, CLI entrypoint | npm published 0.3.0 | Package CLI through `npx llmwiki-agent-bridge@latest` or pinned `npm exec`; source checkout for development | Node.js 22.12+ | `npx llmwiki-agent-bridge@latest --help` or repository `npm run check` |
| `llmwiki-chat` | npm package 0.1.6, Apache-2.0, static Vite browser workbench artifact, no CLI `bin` | npm published 0.1.6; Trusted Publisher/OIDC verified via workflow_dispatch on 2026-07-27 | Package `dist/` static hosting or source checkout for UI development | Node.js 22.12+ | package install-smoke for `dist/`, or repository `npm run check` |
| `llmwiki-docs` | VitePress docs portal, Apache-2.0 | GitHub Pages live | Source checkout with `npm ci` | Node.js 22.12+ | `npm run check` |

The primary gate column is a status-oriented smoke signal. Each repository also
keeps its own README, changelog, package metadata, license files, and CI gates.

The `llmwiki-serve==0.2.3`, `llmwiki-bridge-start@0.0.3`,
`llmwiki-agent-bridge@0.3.0`, and `llmwiki-chat@0.1.6` packages are
published. Source checkouts remain supported for development and release
verification.

::: tip Historical publication note
The initial bridge-start release was manually published and is historical
first-publish evidence only. Use `llmwiki-bridge-start@0.0.3` for the current
first-run baseline.
:::

## Protocol Surfaces

| Surface | Owner | Status | Compatibility claim | Validation gate |
| --- | --- | --- | --- | --- |
| HTTP Knowledge Source | `llmwiki-serve` | Public-preview contract | Local HTTP endpoints for health discovery, manifest, context query, search, read, graph projection, and graph neighborhoods. | `llmwiki-serve` release smoke and `llmwiki-chat` `npm run test:e2e:live` smoke. |
| MCP JSON-RPC compatibility | `llmwiki-serve` | Compatibility surface | Legacy JSON-RPC tool calls for local integration testing, including `llmwiki_graph_neighbors`. | `llmwiki-serve` MCP smoke coverage. |
| MCP Streamable HTTP | `llmwiki-serve` | SDK-backed source surface where implemented | Official MCP SDK-backed tool calls for source retrieval. | `llmwiki-serve` MCP SDK smoke coverage. |
| A2A source compatibility | `llmwiki-serve` | Opt-in compatibility surface | Agent-card discovery and `message:send` for A2A-native source discovery. | A2A source smoke coverage when enabled. |
| Bridge runtime endpoints | `llmwiki-agent-bridge` | Public-preview contract | A2A and MCP bridge endpoints that gather source evidence, expose read-only source exploration tools, return a grounded answer artifact when `llmwiki_agent_run` or `message:send` is used, and expose redacted source registry views through `GET /sources`. | `npm run check` in `llmwiki-agent-bridge`. |
| Browser workbench | `llmwiki-chat` | Public-preview UI | Source selection, graph inspection, bridge selection, trace display, citations, and answer review. | `llmwiki-chat` lint, typecheck, unit, E2E, build, and pack gates. |

## Runtime Adapter Status

| Runtime path | Status | What works | What is not claimed | Validation gate |
| --- | --- | --- | --- | --- |
| Agent Bridge A2A | Public-preview path | Connects chat or clients to a bridge agent card and `message:send` endpoint. | Certified A2A conformance or hosted runtime operation. | Bridge and chat A2A smoke tests. |
| Agent Bridge MCP | Public-preview path | Connects chat or MCP clients to `llmwiki_agent_run` for full bridge answers, or to read-only source tools for progressive exploration of registered or inline Knowledge Sources. | Certified MCP conformance or hosted runtime operation. | Bridge and chat MCP smoke tests. |
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
