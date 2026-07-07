# 2026-07-05 Fresh E2E Readiness Loop R15

For agentic workers:

- Work from current `main` evidence in all four sibling repositories.
- Use temporary clones or high-port loopback processes for fresh-user checks.
- Do not stop existing personal wiki, bridge, chat, tailnet, or runtime
  services unless the worker started them in the current task.
- Do not run public visibility, Pages, branch policy, package publication,
  credential, or organization mutation commands.
- Record exact commands, ports, pass/fail state, and skipped validation.
- Treat source-checkout usage as the supported path until the first packages
  are published.

## Goal

Prove that the R14 documentation fixes hold up from a fresh source-checkout
workflow and that the rendered docs, bridge example payload, and cross-repo
e2e path still agree.

This round continues the Superpowers-style loop: dated Markdown plan, scoped
subagent handoffs, concrete command evidence, and a review gate before merge.

## Architecture

| Component | R15 Invariant |
| --- | --- |
| `llmwiki-serve` | A first-time source checkout can serve and query the sample Knowledge Source without package publication. |
| `llmwiki-agent-bridge` | The bundled local request payload exercises evidence-only fan-out without requiring a runtime endpoint. |
| `llmwiki-chat` | The live E2E path can connect to served sources and a bridge/runtime path without relying on stale local state. |
| `llmwiki-docs` | Rendered docs expose the R14/R15 plans, render Mermaid diagrams, and do not contradict host-owned RAG or bridge-owned fan-out. |

## File Scope

| Area | Files | Notes |
| --- | --- | --- |
| Fresh quickstart | `docs/quickstart.md`, `docs/examples.md`, `docs/troubleshooting.md` | Patch only if the source-checkout path fails or misleads. |
| Rendered docs | `docs/.vitepress/config.mts`, key docs pages, R15 plan link | Patch only if a rendered page or nav link is broken. |
| Readiness records | `docs/oss-open-readiness.md`, this plan, VitePress nav/sidebar | Record evidence and remaining gates. |
| Bridge payload | `llmwiki-agent-bridge/examples/message-send.local.json` | Already updated in R14; verify from fresh checkout. |

## Task Plan

| Task | Owner | Status | Commands | Expected Evidence |
| --- | --- | --- | --- | --- |
| Recollect repo state | Parent agent | Done | `git status --short --branch`, `gh pr list` in all four repos | Clean `main` checkouts; only docs launch-copy draft #11 open. |
| Fresh quickstart audit | Subagent `Descartes` | Done | Temp clone/source-checkout commands | Fresh clones passed serve, source query, MCP context, bridge `npm run check`, and bridge evidence-only request. High-port example-file guidance gap was found and patched. |
| Rendered docs audit | Subagent `Turing` | Done | VitePress server plus browser automation | Key pages loaded, Mermaid rendered as SVG on home and architecture, R14 link resolved, and no console issues were observed. |
| Cross-repo e2e audit | Subagent `McClintock` | Done | Safe high-port serve/bridge/chat checks | Source HTTP/MCP/MCP stream, bridge evidence-only, and chat live E2E passed; audit-owned ports were cleaned up. |
| Apply fixes | Parent agent | Done | Markdown edits | Quickstart and bridge README/examples now explain editing the sample payload URL when high source or bridge ports are used. |
| Verify docs | Parent agent | Done | `npm run check` | VitePress build and license check passed. |
| Verify staging gate | Parent agent | Done | `npm run release:preflight:private-staging` | 0 required failures, 0 strict blockers, and 5 expected private-staging warnings. |

## Verification Matrix

| Requirement | Evidence | Status |
| --- | --- | --- |
| Quickstart is reproducible from source checkout | Fresh audit output and parent verification | Passed from temp clones; high-port payload guidance patched. |
| Bridge local example is runtime-free | Fresh bridge evidence-only smoke and bridge tests | Passed; runtime-chat step count was 0. |
| Rendered docs are navigable and diagrams render | Browser/render smoke | Passed for quickstart, architecture, core concepts, AI tools, runtime adapters, examples, troubleshooting, readiness, and R14 plan. |
| Cross-repo e2e path is current | Source/bridge/chat e2e command output | Passed: source HTTP/MCP/MCP stream, bridge evidence-only, and chat live E2E 4/4. |
| Public launch remains controlled | Draft launch-copy PR and private-staging preflight | Draft PR #11 remains separate; private-staging preflight passed. |

## Subagent Handoffs

| Agent | Scope | Expected Output |
| --- | --- | --- |
| `Descartes` | Fresh source-checkout quickstart from temp clones | Exact commands, pass/fail state, and minimal docs fixes. |
| `Turing` | Rendered docs navigation and Mermaid smoke | Broken links/rendering issues and minimal docs fixes. |
| `McClintock` | Cross-repo source/bridge/chat e2e | E2E evidence, skipped checks, and minimal fixes. |

## Progress Ledger

| Time | Update |
| --- | --- |
| 2026-07-05 | R15 started from clean `main` checkouts in all four repos. |
| 2026-07-05 | `llmwiki-agent-bridge` R14 payload fix and `llmwiki-docs` R14 plan were already merged to `main`. |
| 2026-07-05 | Public launch-copy PR #11 remains draft, clean, and passing checks. |
| 2026-07-05 | Rendered docs smoke passed on a temporary VitePress server; Mermaid rendered as SVG and the temporary server was stopped afterward. |
| 2026-07-05 | Fresh temp clone quickstart passed for `llmwiki-serve` and `llmwiki-agent-bridge`; docs now mention how to adapt the example payload for non-default ports. |
| 2026-07-05 | Cross-repo e2e passed source HTTP/MCP/MCP stream, bridge evidence-only, and `llmwiki-chat` live desktop E2E 4/4. |
| 2026-07-05 | `npm run check` and `npm run release:preflight:private-staging` passed after the R15 docs changes. |

## Review Gate

Before merging R15 docs:

```sh
npm run check
npm run release:preflight:private-staging
```

Do not treat this plan as public launch completion. Completion still requires
release-owner approval, security/reporting route confirmation, public visibility
changes, GitHub Pages publication, branch policy setup, public-unpublished
preflight, and package publication gates.
