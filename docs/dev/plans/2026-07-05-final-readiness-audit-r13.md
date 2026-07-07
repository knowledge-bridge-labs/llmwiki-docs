# 2026-07-05 Final Readiness Audit R13

For agentic workers:

- Work from current `main` evidence in all four sibling repositories.
- Do not run apply commands for visibility, Pages, branch protection, package
  publication, credentials, or organization mutation.
- Keep the public-launch copy branch separate from this documentation audit.
- Record exact command evidence and distinguish expected pre-public gate
  blockers from code or docs defects.

## Goal

Recheck the OSS pre-open state after the Module Map Mermaid fix, then align
the docs with the current host-RAG plus LLMWiki orchestration model:

- `llmwiki-serve` owns the served source bundle.
- host agents can call `llmwiki-serve` directly and own final synthesis.
- `llmwiki-agent-bridge` owns evidence fan-out and optional runtime delegation.
- `llmwiki-chat` remains a browser workbench, not a production runtime owner.

## Architecture

| Component | R13 Invariant |
| --- | --- |
| `llmwiki-serve` | One source folder projects to one read-only Knowledge Source bundle with HTTP and MCP access, plus opt-in A2A source compatibility. |
| `llmwiki-agent-bridge` | One companion service can fan out across selected sources and return evidence-only or runtime-backed artifacts. |
| `llmwiki-chat` | Workbench setup should make source, bridge, local mock runtime, citations, graph, and run details inspectable. |
| Host RAG / host agents | Host-owned retrieval, ranking, surface RAG, prompt policy, and answer memory stay outside `llmwiki-serve` and `llmwiki-agent-bridge`. |

## File Scope

| Area | Files | Notes |
| --- | --- | --- |
| Architecture wording | `docs/architecture.md`, `docs/positioning.md`, `docs/core-concepts.md` | Bridge should read evidence-first, runtime-optional. |
| Integration docs | `docs/ai-tools.md`, `docs/direct-agent-integrations.md`, `docs/runtime-adapters.md` | A2A/MCP bridge wording and chat mock path should stay distinct. |
| Quickstart examples | `docs/quickstart.md`, `docs/examples.md`, `docs/knowledge-source-format.md` | Evidence-only bridge startup and live E2E guidance should match current repos. |
| Planning artifacts | `docs/dev/plans/2026-07-05-final-readiness-audit-r13.md`, `docs/oss-open-readiness.md`, VitePress nav | Record the audit trail. |

## Task Plan

| Task | Owner | Status | Commands | Expected Evidence |
| --- | --- | --- | --- | --- |
| Recollect repo state | Parent agent | Done | `git status --short --branch` in all four repos | All four local main checkouts clean before R13 branch work. |
| Audit quickstart against current scripts | Subagent `Confucius` | Done | Read-only source/docs audit | Only low-severity doc gaps found: self-contained chat live smoke, `4173`, POSIX bridge high-port example. |
| Audit orchestration docs | Subagent `Gibbs` | Done | Read-only docs audit | Bridge wording drift found: docs still implied runtime-first behavior. |
| Audit repo gates and open PRs | Subagent `Boole` | Done | GitHub and local read-only audit | Only expected pre-public gates remain; only open PR is launch-copy draft #11. |
| Fix docs wording drift | Parent agent | Done | Markdown edits | Bridge described as evidence fan-out first, runtime delegation optional. |
| Verify docs | Parent agent | Done | `npm run check` | VitePress build passed. |
| Verify pre-public gate | Parent agent | Done | `npm run release:preflight:private-staging` | First run correctly failed on dirty R13 worktree; rerun after commit showed 0 required failures, 0 strict blockers, and 5 expected warnings. |

## Verification Matrix

| Requirement | Evidence | Status |
| --- | --- | --- |
| Current repo states are coherent | `llmwiki-serve` `afb2ade`, `llmwiki-agent-bridge` `b132948`, `llmwiki-chat` `556cdd8`, `llmwiki-docs` `39062d9` before this branch | Passed |
| Quickstart commands match current package scripts | Subagent quickstart audit plus source inspection of package scripts | Mostly passed; docs patch adds missing live smoke notes. |
| Orchestration docs match implementation | Subagent architecture audit | Patch required and in progress. |
| No unexpected PRs are waiting | `gh pr list` across all four repos | Passed; only docs #11 launch-copy draft remains open. |
| Public-launch copy remains deliberate | PR #11 is draft and says do not merge before launch transition | Passed |
| Pre-public gates are explicit | Gate audit found auth scope, Pages setup, branch policy, visibility, and owner-confirmed reporting routes still pending | Passed |

## Subagent Handoffs

| Agent | Scope | Result |
| --- | --- | --- |
| `Confucius` | Quickstart vs current scripts and env vars | Low-severity quickstart additions only. |
| `Gibbs` | Host-RAG / LLMWiki orchestration docs | Bridge wording was runtime-first in several pages. |
| `Boole` | Repo, CI, PR, and operational gate matrix | No surprise PRs; expected pre-public blockers remain. |

## Progress Ledger

| Time | Update |
| --- | --- |
| 2026-07-05 | Main checkouts were clean for `llmwiki-serve`, `llmwiki-agent-bridge`, `llmwiki-chat`, and `llmwiki-docs`. |
| 2026-07-05 | Module Map Mermaid fix merged as docs PR #10, and local preview rendered Mermaid SVGs without console errors. |
| 2026-07-05 | Launch-copy PR #11 created as draft and left unmerged for the public transition. |
| 2026-07-05 | R13 subagents found docs drift around bridge evidence-only mode and minor quickstart live-smoke gaps. |
| 2026-07-05 | `npm run check` passed after R13 docs edits. |
| 2026-07-05 | `npm run release:preflight:private-staging` passed after commit with 0 required failures, 0 strict blockers, and 5 expected warnings. |

## Review Gate

Before merging R13 docs:

```sh
npm run check
npm run release:preflight:private-staging
```

Do not treat this plan as public launch completion. Completion still requires
release-owner approval, the launch-copy PR at the transition point, visibility
changes, Pages publication, branch policy setup, public-unpublished preflight,
and later package publication gates.
