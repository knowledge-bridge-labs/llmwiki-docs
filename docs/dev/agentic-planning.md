# Agentic Planning

Use this convention for cross-repository changes, release-readiness rounds, and
agent-assisted implementation work. It is intentionally lightweight: plans stay
in Markdown, evidence is command-based, and every task should be reviewable by
another maintainer.

This workflow is inspired by Superpowers-style agentic development without
copying that project's structure or wording. The goal is practical continuity:
an agent, maintainer, or reviewer should be able to open one plan file and know
what to do next, what not to touch, and how to prove completion.

## Where Things Live

| Artifact | Path | Purpose |
| --- | --- | --- |
| Durable specs | `docs/dev/specs/` | Design decisions, architecture constraints, and long-lived contracts. |
| Executable plans | `docs/dev/plans/` | Dated work plans with task steps, owners, file scope, commands, and expected evidence. |
| Readiness rollup | `docs/oss-open-readiness.md` | Current and historical release-readiness rounds, evidence, and open blockers. |
| Stable release gates | `docs/operations-release-checklist.md` | Repeatable release checklist independent of the current round. |

Keep implementation notes, private logs, screenshots, and transient scratch
state out of committed docs unless they are redacted and useful to future
maintainers. Local progress ledgers can live in an untracked scratch path such
as `.llmwiki-dev/progress.md`.

## Plan Template

Each plan should start with a short handoff that an agentic worker can follow:

```md
# YYYY-MM-DD Short Plan Name

For agentic workers:
- Work only in the listed repositories and file scopes.
- Do not revert user or other-agent changes.
- Prefer existing project tools and documented commands.
- Record exact commands, pass/fail state, and skipped validation.
- Stop before public visibility, Pages, credentials, or package publication
  unless the release owner explicitly approved that operation.

## Goal

One concrete outcome.

## Architecture

Relevant module boundaries and invariants.

## Tech Stack

Repos, runtimes, package managers, and required versions.

## Global Constraints

Security, privacy, network, compatibility, and ownership constraints.

## File Scope

| Area | Files | Notes |
| --- | --- | --- |

## Task Plan

| Task | Owner | Status | Commands | Expected Evidence |
| --- | --- | --- | --- | --- |

## Verification Matrix

| Requirement | Evidence | Status |
| --- | --- | --- |

## Subagent Handoffs

Prompts, scopes, and expected outputs for delegated workers.

## Progress Ledger

Dated updates with command results and links to PRs.

## Review Gate

Checks that must pass before merge.
```

## Evidence Rules

- Prefer exact commands over prose claims.
- Distinguish historical evidence from current-state evidence.
- Label expected failures, such as private-staging Pages 404, as expected only
  when the selected release phase says they are expected.
- Do not use a narrow smoke test to claim a broad contract unless the smoke
  explicitly covers that contract.
- When a subagent reports findings, the parent agent or maintainer must inspect
  changed files, run relevant checks, and decide what becomes committed state.

## Review Rules

Pull requests that modify release posture, protocol contracts, cross-repo
quickstart paths, or public-launch copy should include:

- a linked plan or spec
- affected repositories and modules
- exact verification commands
- skipped validation with reason
- subagent or AI-assisted areas that need closer review
- readiness/status doc updates when support, package, Pages, or protocol state
  changes

