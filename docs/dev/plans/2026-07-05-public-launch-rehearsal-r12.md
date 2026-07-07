# 2026-07-05 Public Launch Rehearsal R12

For agentic workers:

- Do not run apply commands for visibility, Pages, branch protection, package
  publication, credentials, or organization mutation.
- Use dry-run and verify commands only unless the release owner explicitly
  approves the public-launch operation.
- Treat private repositories, Pages 404, missing private vulnerability
  reporting, missing branch policy, and missing `admin:org` scope as launch
  blockers to document, not as local code failures.
- Record exact command results and whether a failure is expected for the
  current `private org staging` phase.

## Goal

Rehearse the public-launch runbooks without mutating GitHub state. Confirm that
the non-mutating path is coherent before owner approval, and keep the next
public-launch blocker list grounded in command output.

## Architecture

This plan tests the release operations layer, not the runtime path:

| Area | Owner |
| --- | --- |
| Repository transfer and metadata verification | `llmwiki-docs` scripts plus GitHub CLI |
| Organization setup preview | `org:configure:dry-run` |
| Visibility preview | `visibility:public:dry-run` |
| Pages preview | `org:configure:pages:dry-run`, `pages:publish:dry-run` |
| Branch policy preview | `branch-policy:dry-run` |
| Combined launch preview | `public:launch:dry-run` |

## Global Constraints

- Current phase is still `private org staging`.
- Public launch copy must remain private-staging copy until release-owner
  approval.
- `public:launch:dry-run` is expected to stop at launch-copy validation until
  the copy flip is committed.
- `public:launch:apply`, `visibility:public:apply`, `org:configure:pages:apply`,
  `pages:publish:dispatch`, `branch-policy:apply`, and package publication are
  out of scope for this round.

## Task Plan

| Task | Owner | Status | Command | Expected Evidence |
| --- | --- | --- | --- | --- |
| Verify transferred private org state | Parent agent | Done | `npm run transfer:verify` | Repos, remotes, workflows, CODEOWNERS, teams, and vulnerability alerts verified; private vulnerability reporting and branch policy remain warnings. |
| Preview org settings | Parent agent | Done | `npm run org:configure:dry-run` | Prints team/repo/vulnerability commands; skips Pages creation. |
| Preview public visibility commands | Parent agent | Done | `npm run visibility:public:dry-run` | All four repos clean on `main...origin/main`; prints `gh repo edit --visibility public` commands only. |
| Preview Pages setup | Parent agent | Done | `npm run org:configure:pages:dry-run` | Prints setup commands and warns that `llmwiki-docs` is still private. |
| Preview Pages publish wait | Parent agent | Done | `npm run pages:publish:dry-run` | Prints `gh run list` and Pages URL polling commands for docs commit `5a2537d`. |
| Preview branch policy payloads | Parent agent | Done | `npm run branch-policy:dry-run` | Prints required status checks and protection payloads; warns repos are still private. |
| Confirm combined launch gate | Parent agent | Done | `npm run public:launch:dry-run` | Builds docs, then intentionally fails launch-copy check before mutation previews. |
| Run subagent runbook audit | Subagent | Done | Read-only source inspection | No runbook contradictions requiring edits. |
| Run subagent package/PR audit | Subagent | Done | Read-only source inspection | Found package README posture copy ahead of current gate. |
| Align package README posture copy | Parent agent | Done | PRs #12, #13, #26 | `llmwiki-serve`, `llmwiki-agent-bridge`, and `llmwiki-chat` now say prepared for public preview and currently private org staging. |

## Verification Matrix

| Requirement | Evidence | Status |
| --- | --- | --- |
| Non-mutating launch rehearsal is possible | Dry-run commands complete or stop at documented copy gate | Passed |
| Launch copy is not flipped prematurely | `public:launch:dry-run` and `launch-copy:check:public-unpublished` fail on private-staging docs copy | Passed |
| Public visibility operations are explicit | `visibility:public:dry-run` prints exact `gh repo edit --visibility public` commands | Passed |
| Pages and branch policy are sequenced after visibility | Pages setup warns docs repo is private; branch policy warns repos are private | Passed |
| External blockers are visible | transfer/preflight warnings identify private vulnerability reporting, branch policy, and `admin:org` scope | Passed |
| Package README posture matches docs status | README PRs #12, #13, and #26 merged | Passed |

## Progress Ledger

| Time | Update |
| --- | --- |
| 2026-07-05 | `npm run transfer:verify` passed with warnings for private vulnerability reporting and branch policy. |
| 2026-07-05 | `npm run org:configure:dry-run` printed non-mutating org metadata/team/vulnerability commands and skipped Pages creation. |
| 2026-07-05 | `npm run visibility:public:dry-run` printed visibility commands after confirming clean pushed main checkouts. |
| 2026-07-05 | `npm run org:configure:pages:dry-run` warned that `llmwiki-docs` is still private before Pages setup. |
| 2026-07-05 | `npm run pages:publish:dry-run` printed Pages workflow and URL polling commands for docs commit `5a2537d`. |
| 2026-07-05 | `npm run branch-policy:dry-run` printed public-launch branch protection payloads and warned that repos are still private. |
| 2026-07-05 | `npm run public:launch:dry-run` built docs and intentionally stopped at launch-copy validation. |
| 2026-07-05 | Package README posture copy was softened through `llmwiki-serve` #12, `llmwiki-agent-bridge` #13, and `llmwiki-chat` #26 after package/PR audit found the phrase "in public preview" was ahead of the current private-staging gate. |

## Review Gate

Before merging R12 docs:

```sh
npm run check
npm run release:preflight:private-staging
```

Do not mark public launch complete from this plan. Completion still requires
release-owner approval, public-launch copy flip, public repository visibility,
Pages publication, branch policy, public-unpublished preflight, and later
package publication gates.
