# 2026-07-05 OSS Open Readiness R11

For agentic workers:

- Work only in the listed repositories and file scopes.
- Do not revert user, maintainer, or other-agent changes.
- Use temp directories for fresh-clone tests.
- Avoid killing existing personal wiki, bridge, or tailnet services.
- Record exact commands, pass/fail state, expected failures, and skipped
  validation.
- Stop before repository visibility, Pages publication, branch-policy apply,
  credentials, or package publication unless the release owner explicitly
  approves that operation.

## Goal

Keep the public-open readiness loop executable after the coordinated
source-bundle, bridge, chat, and docs PR stack has merged. Prove that current
private-staging docs and checks are internally consistent, and identify the
next owner-approved launch actions without prematurely flipping public copy.

## Architecture

The plan follows these module boundaries:

| Module | Role |
| --- | --- |
| `llmwiki-serve` | Serves one Knowledge Source bundle through HTTP and MCP source APIs. |
| `llmwiki-agent-bridge` | Optional evidence fan-out and runtime companion for selected Knowledge Sources. |
| `llmwiki-chat` | Browser workbench for setup, inspection, trace, evidence, and answer review. |
| `llmwiki-docs` | Cross-repo quickstart, architecture, status, and release operations map. |

The host-RAG plus LLMWiki orchestration baseline remains source-first:
`llmwiki-serve` exposes project memory and graph context; host agents own
surface RAG, retrieval ranking, and final answer synthesis when they orchestrate
directly. The bridge owns selected-source evidence fan-out and optional
delegated-runtime synthesis when a client delegates that companion loop.

## Tech Stack

| Area | Tooling |
| --- | --- |
| Docs | Node.js 22.12+, npm, VitePress, Mermaid 11.16 |
| Serve | Python 3.11+, uv, FastAPI, MCP SDK-backed smoke coverage |
| Bridge | Node.js 22.12+, npm, A2A/MCP bridge contracts |
| Chat | Node.js 22.12+, npm, Vite, Playwright |
| GitHub operations | GitHub CLI, target org `knowledge-bridge-labs` |

## Global Constraints

- Current phase is `private org staging`.
- Public launch copy must not claim public repositories or live Pages until the
  release owner approves visibility and Pages transition.
- Package publication remains pending until `public-unpublished` passes and the
  release owner approves registry publication.
- `admin:org` scope and branch policy are external owner/operator gates.
- Private endpoints, raw logs, credentials, screenshots with private data, and
  private wiki content must not be committed.

## File Scope

| Area | Files | Notes |
| --- | --- | --- |
| Active readiness rollup | `docs/oss-open-readiness.md` | Current round table, evidence, resolved/open blockers, next round. |
| Release status | `docs/status.md` | Current launch phase and registry/Pages status. |
| Operations runbooks | `docs/organization-setup.md`, `docs/operations-release-checklist.md`, `docs/package-publication.md`, `docs/cli-reference.md` | Public-launch, Pages, branch policy, and package gates. |
| Planning convention | `docs/dev/agentic-planning.md`, `docs/dev/plans/*`, `docs/dev/specs/*` | Durable plan/spec convention and this executable plan. |
| Contribution process | `CONTRIBUTING.md`, `.github/PULL_REQUEST_TEMPLATE.md` | Require plan links and exact validation for cross-repo/release posture changes. |

## Task Plan

| Task | Owner | Status | Commands | Expected Evidence |
| --- | --- | --- | --- | --- |
| Reconfirm clean main state | Parent agent | Done | `git status --short --branch` and `git rev-parse --short HEAD` in all four repos | All repos clean on `main...origin/main`; commits `a290ca8`, `a2c088e`, `e57510b`, `0c9f22a`. |
| Recheck launch-copy gate | Parent agent | Done | `npm run launch-copy:check:public-unpublished` | Expected failure only in `llmwiki-docs` private-staging copy. |
| Recheck combined public launch dry-run | Parent agent | Done | `npm run public:launch:dry-run` | Docs build passes; dry-run stops at launch-copy gate before mutations. |
| Fresh quickstart audit | Subagent | Done | Temp-clone audit under `C:\tmp\llmwiki-quickstart-audit-20260705-174730` | Source, bridge evidence-only, and chat live smoke passed on high ports. Runtime-backed bridge and multi-source live E2E were intentionally out of minimal scope. |
| Superpowers-style docs audit | Subagent | Done | Shallow clone `obra/superpowers`; compare docs process | Gap found: add plan/spec convention, task template, PR requirements. |
| Add agentic planning docs | Parent agent | Done | `npm run check` | Planning convention and R11 plan are rendered and linked. |
| Add quickstart high-port and smoke guidance | Parent agent | Done | `npm run check` | Quickstart documents non-default serve/bridge/chat ports, PowerShell `message:send` body-file pattern, legacy `HERMES_*` alias note, and live chat smoke command. |
| Merge planning docs | Parent agent | Pending | PR checks, squash merge | Docs main records the executable planning convention. |

## Verification Matrix

| Requirement | Evidence | Status |
| --- | --- | --- |
| Private-staging state remains truthful | `docs/status.md` and launch-copy failure still name private org staging and Pages pending | Passed |
| Public-launch mutation does not run before approval | `public:launch:dry-run` stops before visibility, Pages, and branch-policy operations | Passed |
| Planning/dev docs are durable Markdown artifacts | `docs/dev/agentic-planning.md` and this plan file | In progress |
| Quickstart still works from fresh source checkout | Fresh quickstart subagent report | Passed |
| Readiness rollup stays concise enough to execute | R11 plan captures next actions; rollup records evidence | Passed |

## Subagent Handoffs

Fresh quickstart worker:

```txt
Use docs/quickstart.md from current llmwiki-docs main as the source. Work in
temp directories only. Verify source endpoints, bridge evidence-only path, and
chat live e2e where feasible. Return exact commands, pass/fail, and docs gaps.
```

Planning/docs explorer:

```txt
Inspect obra/superpowers in a temp clone, compare its Markdown planning style
with llmwiki-docs, and report durable plan/spec/process gaps without editing.
```

## Progress Ledger

| Time | Update |
| --- | --- |
| 2026-07-05 | R10 post-merge readiness update merged through docs PR #7. |
| 2026-07-05 | `npm run launch-copy:check:public-unpublished` intentionally failed only on current private-staging `llmwiki-docs` copy. |
| 2026-07-05 | `npm run public:launch:dry-run` built docs, then intentionally stopped at the same launch-copy gate. |
| 2026-07-05 | Superpowers-style audit recommended durable plan/spec docs, agent handoff template, PR template expansion, and separate evidence rollup. |
| 2026-07-05 | Fresh quickstart audit passed on temp clones using ports `39165`, `39188`, and `39173`; quickstart docs were updated with high-port and PowerShell bridge smoke guidance. |

## Review Gate

Before merging this planning-doc update:

```sh
npm run check
npm run release:preflight:private-staging
```

If the fresh quickstart subagent reports a docs or command gap, either fix it in
the same PR when scoped to docs, or record it in `docs/oss-open-readiness.md`
with an owner and next action.
