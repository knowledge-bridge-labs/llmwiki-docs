# 2026-07-05 Final Open Readiness Loop R14

For agentic workers:

- Work from current `main` evidence in all four sibling repositories.
- Do not run apply commands for repository visibility, GitHub Pages, branch
  protection, package publication, credentials, or organization mutation.
- Keep the public-launch copy branch separate from this readiness loop.
- Record exact command evidence and separate expected private-staging warnings
  from product, docs, or process defects.
- Do not claim launch readiness from a narrow smoke test unless the test covers
  the documented user path.

## Goal

Repeat the pre-open readiness loop after R13 so the first-time user path,
host-RAG plus LLMWiki orchestration docs, repo gates, and end-to-end evidence
remain aligned with the current repositories.

This plan follows a Superpowers-style workflow: durable Markdown plan, scoped
subagent handoffs, evidence-first verification, and a review gate before merge.

## Architecture

| Component | R14 Invariant |
| --- | --- |
| `llmwiki-serve` | Owns one served Knowledge Source bundle per source boundary, including projection, handles, source refs, raw-origin descriptors, HTTP, MCP, and opt-in source A2A compatibility. |
| `llmwiki-agent-bridge` | Owns a companion loop for selected-source fan-out, evidence bundle normalization, trace assembly, and optional delegated-runtime synthesis. |
| `llmwiki-chat` | Owns the browser workbench for source setup, bridge selection, evidence inspection, graph display, and answer review. |
| Host agents and host RAG | Own retrieval orchestration when they call sources directly, including surface RAG, ranking, policy, prompt assembly, answer memory, and final answer display. |
| Raw-file or surface RAG providers | Stay outside `llmwiki-agent-bridge` unless exposed through an approved host, source, or proxy path; `llmwiki-serve` may describe origins without granting direct file access. |

## Tech Stack

| Repo | Package Manager | Current Role |
| --- | --- | --- |
| `llmwiki-serve` | `uv` / Python | Source projection and protocol surfaces. |
| `llmwiki-agent-bridge` | `npm` / Node.js | Bridge A2A and MCP companion service. |
| `llmwiki-chat` | `npm` / Vite/React | Browser workbench and live E2E smoke. |
| `llmwiki-docs` | `npm` / VitePress | Public-preview docs, plans, and release gates. |

## Global Constraints

- Source-checkout usage is the supported path until packages are published.
- Repositories are still in private-staging unless the release owner explicitly
  performs the public transition.
- Private URLs, local vault paths, credentials, runtime tokens, and private
  evidence payloads must not be committed.
- Launch-copy PR #11 remains draft until the public transition point.

## File Scope

| Area | Files | Notes |
| --- | --- | --- |
| Quickstart and examples | `docs/quickstart.md`, `docs/examples.md`, `docs/troubleshooting.md` | Commands should match current scripts and source-checkout assumptions. |
| Architecture consistency | `docs/architecture.md`, `docs/core-concepts.md`, `docs/ai-tools.md`, `docs/runtime-adapters.md`, `docs/direct-agent-integrations.md`, `docs/knowledge-source-format.md`, `docs/positioning.md` | Host-owned search, bridge-owned fan-out, serve-owned source bundle, and raw-file RAG boundaries must not conflict. |
| Readiness records | `docs/oss-open-readiness.md`, this plan, VitePress nav/sidebar | Record the round, evidence, and remaining launch gates. |

## Task Plan

| Task | Owner | Status | Commands | Expected Evidence |
| --- | --- | --- | --- | --- |
| Recollect repo state | Parent agent | Done | `git status --short --branch` and recent logs in all four repos | All repos clean on `main` before R14 branch work. |
| Audit quickstart reproducibility | Subagent `Meitner` | Done | Read-only docs/source audit plus safe lightweight commands | Six small source-checkout drift issues found: troubleshooting ports/CORS/query command, docs install command, chat live E2E caveat, and bridge example mode. |
| Audit orchestration docs | Subagent `Aristotle` | Done | Read-only docs audit | Two wording drifts found: Codex bridge use was too runtime-only; R11 implied the bridge could own surface RAG. |
| Audit repo gates and e2e posture | Subagent `Newton` | Done | Read-only repo, CI, and gate audit | Repos are private-staging ready; public-open blockers remain visibility, Pages, branch policy, reporting route, launch-copy PR, and package publication. |
| Patch docs and readiness records | Parent agent | Done | Markdown edits after subagent review | Docs and bridge example payload updated to keep source-checkout quickstart runtime-free by default. |
| Verify docs | Parent agent | Done | `npm run check` | VitePress build and license artifact check passed after docs edits. |
| Verify private-staging gate | Parent agent | Done | `npm run release:preflight:private-staging` | 0 required failures, 0 strict blockers, and 5 expected private-staging warnings. |

## Verification Matrix

| Requirement | Evidence | Status |
| --- | --- | --- |
| Current repo state is known | Local `git status` and `git log` output | Passed before R14 branch work. |
| Quickstart can be followed from source checkout | Subagent audit plus local command verification | Docs patch applied; docs build passed. |
| Orchestration docs match the agreed architecture | Subagent audit plus parent file inspection | Docs patch applied; docs build passed. |
| Repo-level readiness gates are current | Subagent gate audit plus `release:preflight:private-staging` | Passed for private-staging with expected warnings only. |
| Public launch transition remains controlled | PR #11 draft status and private-staging preflight | PR #11 remains draft with passing checks; private-staging preflight passed. |

## Subagent Handoffs

| Agent | Scope | Expected Output |
| --- | --- | --- |
| `Meitner` | Quickstart, examples, troubleshooting, scripts, and source-checkout commands | Exact mismatches, verified commands, and minimal file/line recommendations. |
| `Aristotle` | Host-RAG / LLMWiki orchestration docs and planning artifacts | Exact contradictions and minimal wording fixes. |
| `Newton` | Repo/module/e2e gates, PR state, CI state, and launch blockers | Evidence table separating expected private-staging warnings from defects. |

## Findings Applied

| Finding | Resolution |
| --- | --- |
| Troubleshooting used `18765` while the first-run source default is `8765`. | Troubleshooting now uses `8765` and tells users to substitute their configured source port. |
| Troubleshooting described `--cors-origin` as a top-level command option. | It now shows `uv run llmwiki-serve serve /path/to/wiki --cors-origin ...`. |
| Troubleshooting used a bare `llmwiki-serve query` command while packages are unpublished. | It now shows source-checkout usage with `uv run llmwiki-serve query`. |
| Bridge request docs referenced a local payload that defaulted to runtime-backed mode. | `llmwiki-agent-bridge/examples/message-send.local.json` now declares `mode: "evidence-only"`, and docs describe it as runtime-free. |
| Quickstart listed docs preview verification as `npm run check` only. | It now shows `npm ci && npm run check` for a clean checkout. |
| Chat live E2E docs omitted the wrapper's default sibling `llmwiki-serve` sync. | Quickstart now documents `uv sync --extra dev --locked` and the `LLMWIKI_LIVE_SERVE_SKIP_SYNC=1` override. |
| Codex bridge guidance implied bridge use only for separate runtime synthesis. | It now includes source fan-out and evidence normalization delegation. |
| R11 plan implied the bridge could own host surface RAG decisions. | It now keeps surface RAG, retrieval ranking, and direct final synthesis host-owned. |

## Progress Ledger

| Time | Update |
| --- | --- |
| 2026-07-05 | R14 started from clean `main` checkouts in all four repos. |
| 2026-07-05 | Public-launch copy PR #11 stayed draft after rebase and fresh CI pass. |
| 2026-07-05 | Local docs `release:preflight:private-staging` passed on `main` with expected warnings only. |
| 2026-07-05 | R14 subagents found quickstart drift, one architecture wording conflict, and no unexpected open PRs. |
| 2026-07-05 | Parent applied docs fixes plus a bridge example payload change so the local bridge request stays runtime-free by default. |
| 2026-07-05 | `llmwiki-agent-bridge` `npm run check` passed after the example payload change. |
| 2026-07-05 | `llmwiki-docs` `npm run check` passed after the docs changes. |
| 2026-07-05 | `llmwiki-docs` `npm run release:preflight:private-staging` passed with 0 required failures, 0 strict blockers, and 5 expected warnings. |

## Review Gate

Before merging R14 docs:

```sh
npm run check
npm run release:preflight:private-staging
```

Do not treat this plan as public launch completion. Completion still requires
release-owner approval, public visibility changes, GitHub Pages publication,
branch policy setup, public-unpublished preflight, security/reporting route
confirmation, and package publication gates.
