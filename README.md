# Wiki Knowledge Sources for Agents

[![Public preview preflight](https://github.com/knowledge-bridge-labs/llmwiki-docs/actions/workflows/public-preview-preflight.yml/badge.svg)](https://github.com/knowledge-bridge-labs/llmwiki-docs/actions/workflows/public-preview-preflight.yml)
[![Pages build](https://github.com/knowledge-bridge-labs/llmwiki-docs/actions/workflows/pages.yml/badge.svg)](https://github.com/knowledge-bridge-labs/llmwiki-docs/actions/workflows/pages.yml)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)
[![Node.js >=22.12](https://img.shields.io/badge/node-%3E%3D22.12-339933.svg)](https://nodejs.org/)

This repository is the GitHub Pages documentation portal for serving
LLMWiki-style Markdown folders as agent-readable Knowledge Sources:

- `llmwiki-serve`: read-only Knowledge Source server for one Markdown/wiki folder.
- `llmwiki-bridge-start`: guided handoff for discovering existing wiki folders, starting loopback sources, and handing them to agent clients or the bridge after the source layer works.
- `llmwiki-agent-bridge`: optional runtime companion that gathers source evidence and returns one cited answer artifact.
- `llmwiki-chat`: optional browser workbench for source setup, bridge selection, graph/citation review, and run details.
- `llmwiki-docs`: cross-repo onboarding, architecture, protocol posture, release status, and operations references.

Use this repo for topics that cross repository boundaries. Keep repo-specific
implementation details in the owning repo README or docs directory.

## Start Here

- [Overview](docs/index.md)
- [Demo](docs/demo.md)
- [QuickStart](docs/quickstart.md)
- [`llmwiki-serve`](docs/llmwiki-serve.md)
- [Data Flow](docs/data-flow.md)
- [Architecture](docs/architecture.md)
- [Runtime Adapters](docs/runtime-adapters.md)
- [Network & Security](docs/network-security.md)
- [Release Status & Compatibility](docs/status.md)
- [Evidence](docs/evidence.md)

The docs are intentionally local-first. Source checkouts remain supported for
bundled samples, development scripts, and release verification. Package
installs are also available for `llmwiki-serve==0.2.6`,
`llmwiki-bridge-start@0.0.3`, `llmwiki-agent-bridge@0.3.0`, and
`llmwiki-chat@0.1.6`; see
[Release Status & Compatibility](docs/status.md) for the current baseline.
Compatibility-smoke and deterministic benchmark summaries are recorded in
[Evidence](docs/evidence.md). Windows and Ubuntu/DGX deterministic retrieval
metrics are summarized there, no quality pass is claimed, and Qwen agent-tier
validation remains pending. Version `0.0.1` of `llmwiki-bridge-start` was the
manually published first release, and the current package baseline is
`llmwiki-bridge-start@0.0.3`. `llmwiki-agent-bridge@0.3.0` exposes the bridge
CLI for `npx`/`npm exec` runs, including `sources`, `ls`, and `status`
registry checks. `llmwiki-chat@0.1.6` is a static browser artifact with no CLI
`bin`; install it when you want to host the packaged `dist/` directory.

Shortest local path:

1. Install `llmwiki-serve` from PyPI with `uv tool install llmwiki-serve`.
2. Point it at an existing Markdown, Obsidian-style, or LLMWiki folder, or
   create the tiny sample in [QuickStart](docs/quickstart.md).
3. Run `llmwiki-serve manifest`, `query`, `source-refs`, and `source-bundle`
   before starting the loopback server.
4. Serve the same folder on `http://127.0.0.1:8765`, then verify `/health`,
   `/manifest`, `/source-refs`, `/source-bundle`, and `/query`.
5. Use `llmwiki-serve ls` or `llmwiki-serve status --json` from another
   terminal when you need local instance discovery, stale-record checks, or
   overlap hints.
6. Register `http://127.0.0.1:8765/mcp/stream` directly with clients that
   support MCP Streamable HTTP, without treating it as a protocol certification
   claim.
7. After the source works, use
   `npx llmwiki-bridge-start@latest --path /path/to/your/wiki` when you want
   guided discovery, source startup, bridge registration, and smoke checks.
   Use `npx llmwiki-bridge-start@latest status --json` or `ls` to inspect
   started sources and bridge registration state.
8. Add `npx llmwiki-agent-bridge@latest` only when you need a companion bridge
   endpoint, and use `npx llmwiki-agent-bridge@latest sources --probe --json`
   to inspect registered source readiness. Install `llmwiki-chat@0.1.6` only
   when you need to host the static browser workbench. Source checkouts remain
   development paths.

## Develop

```sh
npm ci
npm run dev
```

## Build And Check

```sh
npm run check
```

`npm run check` verifies third-party license output and builds the VitePress
site from `docs/`.

## Repository Structure

| Path | Purpose |
| --- | --- |
| `docs/` | VitePress pages and public assets. |
| `docs/.vitepress/` | Site config and theme customizations. |
| `scripts/` | Public-preview, Pages, organization-transfer, branch-policy, and license helper scripts. |
| `.github/workflows/` | Preflight, Pages, CodeQL, and dependency-review workflows. |
| `CONTRIBUTING.md`, `SECURITY.md`, `SUPPORT.md` | Community and project policy docs. |

## Public Preview Scope

This portal is:

- a serve-first onboarding path for one existing Markdown, Obsidian-style, or LLMWiki folder
- a protocol and runtime role map
- a network/security posture guide
- a release-status, deployment, and troubleshooting reference for operators

It is not:

- a runtime package published to npm
- an official upstream LLM Wiki specification
- a certified MCP, A2A, or vendor-runtime conformance claim
- a replacement for each repository's README, changelog, or release checklist

Repository metadata and Pages paths target
`knowledge-bridge-labs/llmwiki-docs`. The hosted Pages site is the canonical
public-preview docs entrypoint.

## Content Map

| Area | Pages |
| --- | --- |
| Start | `docs/index.md`, `docs/demo.md`, `docs/quickstart.md`, `docs/examples.md` |
| Understand | `docs/core-concepts.md`, `docs/llmwiki-serve.md`, `docs/data-flow.md`, `docs/architecture.md`, `docs/positioning.md` |
| Connect | `docs/runtime-adapters.md`, `docs/direct-agent-integrations.md`, `docs/ai-tools.md` |
| Reference | `docs/knowledge-source-format.md`, `docs/protocols.md`, `docs/api-reference.md`, `docs/cli-reference.md` |
| Operate | `docs/network-security.md`, `docs/deployment.md`, `docs/troubleshooting.md`, `docs/faq.md` |
| Status | `docs/status.md`, `docs/evidence.md`, `docs/package-publication.md`, `docs/faq.md` |

This is independent community documentation for LLM Wiki-style Markdown
knowledge folders and agent-readable context. It is not an official project
from Andrej Karpathy or any upstream producer named in compatibility examples.
