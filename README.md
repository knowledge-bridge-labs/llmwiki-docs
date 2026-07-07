# LLMWiki Toolchain Docs

[![Public preview preflight](https://github.com/knowledge-bridge-labs/llmwiki-docs/actions/workflows/public-preview-preflight.yml/badge.svg)](https://github.com/knowledge-bridge-labs/llmwiki-docs/actions/workflows/public-preview-preflight.yml)
[![Pages build](https://github.com/knowledge-bridge-labs/llmwiki-docs/actions/workflows/pages.yml/badge.svg)](https://github.com/knowledge-bridge-labs/llmwiki-docs/actions/workflows/pages.yml)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)
[![Node.js >=22.12](https://img.shields.io/badge/node-%3E%3D22.12-339933.svg)](https://nodejs.org/)

This repository is the GitHub Pages documentation portal for the independent
LLMWiki-style toolchain:

- `llmwiki-serve`: read-only Knowledge Source server for one Markdown/wiki folder.
- `llmwiki-agent-bridge`: optional runtime companion that gathers source evidence and returns one cited answer artifact.
- `llmwiki-chat`: optional browser workbench for source setup, bridge selection, graph/citation review, and run details.
- `llmwiki-docs`: cross-repo onboarding, architecture, protocol posture, release status, and operations references.

Use this repo for topics that cross repository boundaries. Keep repo-specific
implementation details in the owning repo README or docs directory.

## Start Here

- [Overview](docs/index.md)
- [Quickstart](docs/quickstart.md)
- [Architecture](docs/architecture.md)
- [Runtime Adapters](docs/runtime-adapters.md)
- [Network & Security](docs/network-security.md)
- [Release Status & Compatibility](docs/status.md)

The docs are intentionally local-first. Source checkouts are the supported
first-run path until the first PyPI/npm package publication gates pass.

Shortest local path:

1. Run `llmwiki-serve` against your existing wiki folder, or use the bundled
   `./examples/sample-wiki` source.
2. Query `http://127.0.0.1:8765/query`.
3. Add `llmwiki-agent-bridge` and `llmwiki-chat` only when you need a companion
   bridge endpoint or browser workbench.

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

- a first-10-minute path across `serve`, optional `agent-bridge`, and optional `chat`
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
public-preview docs entrypoint once repository visibility and Pages deployment
are enabled.

## Content Map

| Area | Pages |
| --- | --- |
| Start | `docs/index.md`, `docs/quickstart.md`, `docs/examples.md` |
| Understand | `docs/core-concepts.md`, `docs/architecture.md`, `docs/positioning.md` |
| Connect | `docs/runtime-adapters.md`, `docs/direct-agent-integrations.md`, `docs/ai-tools.md` |
| Reference | `docs/knowledge-source-format.md`, `docs/protocols.md`, `docs/api-reference.md`, `docs/cli-reference.md` |
| Operate | `docs/network-security.md`, `docs/deployment.md`, `docs/troubleshooting.md`, `docs/faq.md` |
| Status | `docs/status.md`, `docs/faq.md` |

This is independent community documentation for LLM Wiki-style Markdown
knowledge folders and agent-readable context. It is not an official project
from Andrej Karpathy or any upstream producer named in compatibility examples.
