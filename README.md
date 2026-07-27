# Wiki Knowledge Sources for Agents

[![Public preview preflight](https://github.com/knowledge-bridge-labs/llmwiki-docs/actions/workflows/public-preview-preflight.yml/badge.svg)](https://github.com/knowledge-bridge-labs/llmwiki-docs/actions/workflows/public-preview-preflight.yml)
[![Pages build](https://github.com/knowledge-bridge-labs/llmwiki-docs/actions/workflows/pages.yml/badge.svg)](https://github.com/knowledge-bridge-labs/llmwiki-docs/actions/workflows/pages.yml)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)
[![Node.js >=22.12](https://img.shields.io/badge/node-%3E%3D22.12-339933.svg)](https://nodejs.org/)

This repository is the GitHub Pages documentation portal for serving
LLMWiki-style Markdown folders as agent-readable Knowledge Sources:

- `llmwiki-serve`: read-only Knowledge Source server for one Markdown/wiki folder.
- `llmwiki-bridge-start`: first-run entrypoint for discovering existing wiki folders, starting loopback sources, and handing them to agent clients or the bridge.
- `llmwiki-agent-bridge`: optional runtime companion that gathers source evidence and returns one cited answer artifact.
- `llmwiki-chat`: optional browser workbench for source setup, bridge selection, graph/citation review, and run details.
- `llmwiki-docs`: cross-repo onboarding, architecture, protocol posture, release status, and operations references.

Use this repo for topics that cross repository boundaries. Keep repo-specific
implementation details in the owning repo README or docs directory.

## Start Here

- [Overview](docs/index.md)
- [Demo](docs/demo.md)
- [Quickstart](docs/quickstart.md)
- [Data Flow](docs/data-flow.md)
- [Architecture](docs/architecture.md)
- [Runtime Adapters](docs/runtime-adapters.md)
- [Network & Security](docs/network-security.md)
- [Release Status & Compatibility](docs/status.md)

The docs are intentionally local-first. Source checkouts remain supported for
bundled samples, development scripts, and release verification. Package
installs are also available for `llmwiki-serve==0.2.2`,
`llmwiki-bridge-start@0.0.1`, `llmwiki-agent-bridge@0.2.1`, and
`llmwiki-chat@0.1.4`; see
[Release Status & Compatibility](docs/status.md) for the current baseline.
`llmwiki-bridge-start@0.0.1` was the manually published first release; the
next real package version is the one that should validate Trusted
Publisher/OIDC publishing.

Shortest local path:

1. Run `llmwiki-serve` from a source checkout or the published package against
   your existing wiki folder. Use the bundled `./examples/sample-wiki` source
   from a checkout when you want a known-good fixture.
2. Query `http://127.0.0.1:8765/query`.
3. Use `llmwiki-bridge-start` when you want a guided first-run path for
   discovery, source startup, bridge registration, and smoke checks.
4. Add `llmwiki-agent-bridge` and `llmwiki-chat` only when you need a companion
   bridge endpoint or browser workbench; source checkouts and the published npm
   packages are both supported.

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
public-preview docs entrypoint.

## Content Map

| Area | Pages |
| --- | --- |
| Start | `docs/index.md`, `docs/demo.md`, `docs/quickstart.md`, `docs/examples.md` |
| Understand | `docs/core-concepts.md`, `docs/data-flow.md`, `docs/architecture.md`, `docs/positioning.md` |
| Connect | `docs/runtime-adapters.md`, `docs/direct-agent-integrations.md`, `docs/ai-tools.md` |
| Reference | `docs/knowledge-source-format.md`, `docs/protocols.md`, `docs/api-reference.md`, `docs/cli-reference.md` |
| Operate | `docs/network-security.md`, `docs/deployment.md`, `docs/troubleshooting.md`, `docs/faq.md` |
| Status | `docs/status.md`, `docs/package-publication.md`, `docs/faq.md` |

This is independent community documentation for LLM Wiki-style Markdown
knowledge folders and agent-readable context. It is not an official project
from Andrej Karpathy or any upstream producer named in compatibility examples.
