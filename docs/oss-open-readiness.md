# OSS Open Readiness Rounds

Status: historical
Last updated: 2026-07-21

::: warning Historical readiness evidence
This page is a historical rollup of pre-first-release readiness rounds. It no
longer describes current launch blockers: repository visibility, GitHub Pages,
and first package publication have since moved to the public published baseline.
For current state, read [Release Status & Compatibility](/status),
[Package Publication](/package-publication), and
[Organization & Pages Setup](/organization-setup).
:::

This page tracks the pre-public-open readiness loop for the coordinated
`llmwiki-serve`, `llmwiki-agent-bridge`, `llmwiki-chat`, and `llmwiki-docs`
repositories.

The working style is inspired by Superpowers-style agentic development:
write down the intended outcome, split work into small reviewable rounds, use
subagents for parallel repository checks, record concrete verification
evidence, and do not claim completion until the evidence covers the actual
release goal.

Executable plans and reusable agent handoff templates live under
[Agentic Planning](/dev/agentic-planning). This page is the readiness evidence
rollup; dated plans under `docs/dev/plans/` are the task-level execution
artifacts.

## Objective

Before public open:

- A new user can follow the quickstart from clone to a working source query.
- Optional bridge and chat paths work against the same sample Knowledge Source.
- The docs match the host-RAG plus LLMWiki orchestration architecture.
- The four repositories can be tested independently and together.
- Known launch blockers are explicit, owned, and rechecked after each round.

## Architecture Invariants

These invariants come from the host-RAG / LLMWiki orchestration design:

| Area | Invariant |
| --- | --- |
| Source boundary | `llmwiki-serve` owns one served Knowledge Source bundle, including projection, manifest, graph, source refs, and raw-origin metadata when available. |
| Host loop | Codex, Claude Code, GitHub Copilot, Microsoft 365 Copilot, and similar hosts may call `llmwiki-serve` directly and own final answer synthesis. |
| Bridge loop | `llmwiki-agent-bridge` is optional. It owns source fan-out, evidence packaging, optional delegated runtime calls, and normalized evidence-only or runtime-backed artifacts when a client wants one companion service. |
| Chat surface | `llmwiki-chat` is a workbench for setup, inspection, questions, citations, graph context, artifacts, and run details. It does not own source files or production runtime policy. |
| Surface RAG | Host-native RAG remains host-owned. LLMWiki supplies project memory, decisions, source maps, graph hints, and provenance that can guide or supplement current evidence retrieval. |
| Precedence | User instructions and live evidence override stale wiki memory. Wiki memory explains intent and history; it does not silently override current files, CI, tests, or host search. |

## Round Plan

| Round | Scope | Evidence Required | Status |
| --- | --- | --- | --- |
| R0 Baseline | Inspect current worktrees, running services, and public clone URLs. | `git status`, process scan, `git ls-remote` for all target repos. | Completed |
| R1 Quickstart source path | Run `llmwiki-serve` quickstart from a fresh clone and from the coordinated worktree. | `uv sync`, `manifest`, `query`, `/health`, `/manifest`, `/source-bundle`, `/query`. | Historical pre-merge gap resolved by PR #11 |
| R2 Bridge path | Run bridge evidence-only and runtime-backed bridge calls against the coordinated source. | `/health`, `/message:send`, top-level A2A task with `llmwiki_agent_result` artifact. | Verified in current worktree |
| R3 Chat path | Verify chat source setup, bridge setup, ask enablement, markdown/citation/graph/run-detail behavior. | scoped checks, browser smoke against feature serve plus bridge. | Verified in current worktree |
| R4 Docs consistency | Check quickstart, architecture, concepts, protocols, examples, runtime adapters, and AI tool docs for contradictions. | Docs diff, rendered VitePress checks, link/build check. | Rechecked; launch-phase and bridge-mode wording fixed |
| R5 Release gates | Run repo-level checks and cross-repo smoke after fixes. | serve, bridge, chat, docs check commands plus E2E smoke output. | Main checks pass; public/security gates remain private-state blocked |
| R6 PR-ready review | Review current diffs as candidate PRs and close review blockers. | subagent review findings, targeted fixes, full repo checks. | Completed; coordinated PRs merged |
| R7 Quickstart rerun and settings audit | Rerun quickstart as written, inspect private GitHub settings, and remove docs contradictions found by subagents. | quickstart command evidence, rendered docs smoke, PR/check state, GitHub visibility/Pages/protection evidence. | Completed in current docs PR update |
| R8 Public launch copy and Mermaid hardening | Recheck launch-copy wording, public-preview preflight scripts, docs rendering, and cross-repo release runbooks. | Mermaid browser smoke, `npm run check`, `release:preflight:private-staging`, `launch-copy:check:public-unpublished`, PR checks. | Private-staging passes; launch-copy correctly blocks until status/Pages copy is flipped |
| R9 Fresh public clone audit | Re-run quickstart paths from temporary clones and compare with coordinated worktrees. | clone source/bridge/chat results, feature sibling results, live E2E output. | Historical pre-merge gap resolved by PRs #11, #12, #25, and #6 |
| R10 Post-merge main audit | Verify clean `main` checkouts after merging the coordinated PR stack. | main commit hashes, repo checks, live E2E, private-staging preflight, bridge health. | Passed; launch blockers are visibility, Pages, branch policy, and package publication |
| R11 Public-launch dry-run gate | Re-run launch-copy and combined public-launch dry-run after post-merge docs update. | `launch-copy:check:public-unpublished`, `public:launch:dry-run`, [R11 plan](/dev/plans/2026-07-05-oss-open-readiness-r11). | Correctly stops at owner-approved launch-copy flip |
| R12 Public-launch rehearsal | Exercise non-mutating transfer, org, visibility, Pages, branch-policy, and launch dry-run commands. | `transfer:verify`, `org:configure:dry-run`, `visibility:public:dry-run`, `org:configure:pages:dry-run`, `pages:publish:dry-run`, `branch-policy:dry-run`, `public:launch:dry-run`, [R12 plan](/dev/plans/2026-07-05-public-launch-rehearsal-r12). | Dry-run path is coherent; launch still waits for owner approval and copy flip |
| R13 Final readiness audit | Recheck quickstart, host-RAG/LLMWiki architecture docs, repo gates, and open PR state after the Mermaid fix. | Subagent audits, docs wording patch, `npm run check`, `release:preflight:private-staging`, [R13 plan](/dev/plans/2026-07-05-final-readiness-audit-r13). | Completed; docs PR #12 merged and launch-copy PR #11 stayed draft |
| R14 Final open readiness loop | Repeat quickstart/e2e, host-RAG docs, repo-gate, and Superpowers-style evidence checks from current main. | Subagent audits, docs patch if needed, `npm run check`, `release:preflight:private-staging`, [R14 plan](/dev/plans/2026-07-05-final-open-readiness-loop-r14). | Completed; bridge PR #14 and docs PR #13 merged |
| R15 Fresh E2E readiness loop | Re-run fresh source-checkout quickstart, rendered docs smoke, and cross-repo source/bridge/chat e2e after R14 merges. | Fresh clone evidence, browser/render smoke, e2e output, `npm run check`, `release:preflight:private-staging`, [R15 plan](/dev/plans/2026-07-05-fresh-e2e-readiness-loop-r15). | In progress |

## Current Evidence

### Public Clone URL Probe

On 2026-07-05, all target repository URLs responded to `git ls-remote HEAD`:

| Repository | Result |
| --- | --- |
| `knowledge-bridge-labs/llmwiki-serve` | HEAD resolved |
| `knowledge-bridge-labs/llmwiki-agent-bridge` | HEAD resolved |
| `knowledge-bridge-labs/llmwiki-chat` | HEAD resolved |
| `knowledge-bridge-labs/llmwiki-docs` | HEAD resolved |

### Quickstart Source Smoke

Fresh clone from public `knowledge-bridge-labs/llmwiki-serve` before the
coordinated source-bundle PR was merged:

- `git clone --depth 1` succeeded.
- `uv sync --extra dev` succeeded.
- `uv run llmwiki-serve manifest ./examples/sample-wiki` succeeded.
- `uv run llmwiki-serve query ./examples/sample-wiki "release readiness" --limit 4` succeeded.
- Historical gap: public HEAD manifest did not yet expose the latest
  source-bundle fields expected by current docs, such as `source_id`,
  `bundle_id`, `public_uri`, projection signature, raw-origin metadata, and
  `/source-bundle`.

Coordinated source-bundle worktree, now merged to `main` by PR #11:

- `uv sync --extra dev` succeeded.
- `uv run llmwiki-serve manifest ./examples/sample-wiki` returned
  `source_id`, `bundle_id`, `public_uri`, projection metadata, raw-origin
  metadata, and source-bundle capabilities.
- Running HTTP source on an ephemeral high port returned:
  - `GET /health`: `200`
  - `GET /manifest`: `200`
  - `GET /source-bundle`: `200`
  - `POST /query`: `200`, 4 evidence items, 12 graph nodes, 1 draft limitation.

Interpretation: the historical serve gap is resolved on `main` by commit
`a290ca8`. Public-open is still blocked by repository visibility, Pages,
branch-policy, and registry publication gates, not by the source-bundle
quickstart contract.

### Bridge Evidence-Only Smoke

Against feature `llmwiki-serve` on an ephemeral high port and
`llmwiki-agent-bridge` on another high port:

- Bridge `/health` became ready.
- `POST /message:send` returned HTTP `200`.
- The response shape is A2A-style top-level:
  `{ id, status, message, artifacts }`.
- The first artifact is named `llmwiki_agent_result`.
- Evidence-only text reported 4 citations, 1 Knowledge Source, 12 graph nodes,
  13 graph edges, and the source bundle id.

Interpretation: the bridge path is working, but docs and clients should avoid
assuming a nested `result.artifacts` shape for `/message:send`.

Follow-up fixes applied in the bridge repository:

- README now explains mode-dependent behavior: `evidence-only` skips runtime
  calls, while `delegated-runtime` and `hybrid` call the configured runtime.
- Message contract trace wording now says `runtime-chat-completions` appears
  only for runtime-backed modes.
- OpenAPI now requires the always-returned `sourceBundles` field on
  `AgentResult`.
- A `hybrid` behavior test now verifies source retrieval, runtime synthesis,
  artifact `orchestrationMode: "hybrid"`, and source bundle metadata.
- Source bundle metadata is sanitized by allowlist before it appears in
  artifacts or runtime evidence. Unsafe `path`, `root`, `locator`, linked-page
  path hints, credentials, query strings, and fragments are stripped or omitted.
- Source-ref URIs are conservative: HTTP(S) and `llmwiki://` refs have
  credentials, query strings, and fragments stripped; `urn:` refs are retained
  only for `urn:llmwiki:source-ref:<id>`, so path-like URNs are omitted.
- MCP sources now attempt `llmwiki_source_bundle` before `llmwiki_context`; a
  source-bundle discovery error is non-fatal when context retrieval succeeds.
- MCP source-bundle probing is capability-aware: descriptors that explicitly
  advertise capabilities but omit `llmwiki_source_bundle` are not probed, while
  unspecified legacy descriptors can still use opportunistic discovery.
- `npm run check` passed with 36 bridge tests after these sanitizer and MCP
  ordering checks were added.

### Serve Repository Checks

The serve audit found one formatting gate failure in `tests/test_service.py`.
That file was reformatted with `ruff format`, then these checks passed:

- `uv run --no-sync ruff format --check --no-cache .`
- `uv run --no-sync ruff check --no-cache .`

The broader serve audit also reported:

- `uv run --no-sync mypy src` passed.
- `uv run --no-sync pytest -q -p no:cacheprovider` passed with 136 passed and
  2 skipped.
- `uv run --no-sync python scripts/export_openapi.py --check` passed.
- `uv run --no-sync python scripts/check_third_party_notices.py` passed.

Latest local verification on 2026-07-05:

- `uv run --no-sync ruff check --no-cache .` passed.
- `uv run --no-sync ruff format --check --no-cache .` passed.
- `uv run --no-sync mypy src` passed.
- `uv run --no-sync pytest -q` passed with 136 passed and 2 skipped.
- `uv run --no-sync python scripts/release_smoke.py --dist-dir <temp-dist-dir>`
  passed, including source boundary, MCP Streamable HTTP, sdist contents,
  wheel contents, and wheel CLI smoke. The dist output was written outside the
  repository.
- Follow-up release-smoke hardening closed review gaps:
  - HTTP `/source-refs` and `/source-bundle` are checked on the source checkout.
  - JSON-RPC MCP and Streamable HTTP MCP both exercise
    `llmwiki_source_bundle`.
  - Streamable HTTP MCP source-bundle responses are checked for full-envelope
    private-root leaks, not only `structuredContent`.
  - projection graph node and edge counts are compared against a full
    `/graph?limit=2000&include_drafts=true` projection rather than only checked
    for nonzero values.
  - the installed wheel is now tested through a fresh venv Python using
    `python -I -c`, imports `llmwiki_serve.api.create_app` from the installed
    package rather than the checkout, and verifies HTTP `/source-refs`,
    HTTP `/source-bundle`, JSON-RPC MCP `llmwiki_source_bundle`, and
    Streamable HTTP MCP `llmwiki_source_bundle`.
  - the installed wheel CLI now also exercises `llmwiki-serve source-refs`
    and `llmwiki-serve source-bundle`, so packaged Typer command regressions
    are covered in addition to API imports.
- Parent-session verification after the hardening:
  `uv run --no-sync python scripts/release_smoke.py --dist-dir <temp-dist-dir>`
  passed with `release smoke passed: source boundary, sdist contents, and
  wheel CLI/API`.

### Bridge Runtime-Backed Smoke

Against feature `llmwiki-serve` on `127.0.0.1:19071`, a temporary
OpenAI-compatible chat-completions stub on `127.0.0.1:19072`, and
`llmwiki-agent-bridge` on `127.0.0.1:19073`:

- Bridge `/health` returned `status: ok`, `runtimeProfile: generic`, and
  `modelConfigured: true`.
- `POST /message:send` returned state `completed`.
- The first artifact was `llmwiki_agent_result`.
- The answer rendered a markdown table from the runtime stub.
- The artifact contained 4 citations, 12 graph nodes, 6 steps, 1 source bundle,
  and a completed `runtime-chat-completions` step.

Latest bridge local verification:

- `npm run check` passed with lint, OpenAPI contract check, 36 tests, and npm
  pack dry-run.
- Scoped source-bundle tests passed for evidence-only metadata, MCP source
  bundle inclusion before runtime evidence, and non-fatal MCP source-bundle
  discovery failure when `llmwiki_context` succeeds.

### Chat Workbench Checks

Follow-up fixes applied in the chat repository:

- The first-run README now tells users to test the prefilled
  `Local sample LLMWiki` source first and uses Add source only for additional
  HTTP or MCP sources.
- A2A Knowledge Source endpoints are documented as advanced/non-default until
  the Add source picker exposes them directly.
- Adding `Custom A2A` now selects that runtime and deselects other runtimes.
- Disabled Ask guidance now reports selected Knowledge Source readiness before
  runtime readiness, while keeping the active-run guard first.

Latest chat local verification:

- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run test` passed with 4 test files and 174 tests before rebasing, then
  4 test files and 175 tests after fast-forwarding to `origin/main`.
- `npm run build` passed.
- `git merge --ff-only origin/main` brought `llmwiki-chat` up to the latest
  compact-sidebar runtime-card UI. The only conflict was in `src/App.test.tsx`,
  where the upstream auto-collapse test and the new Custom A2A auto-select
  test were both preserved.
- PR-ready e2e review found that `Custom A2A` tests still tried to click a
  runtime card after the new UX had already auto-selected the added runtime.
  The e2e helper now no-ops when the target radio is already checked and
  otherwise reopens the Agent Bridge section before clicking the visible label.
- Parent-session `npm run check` passed after the e2e helper fix:
  4 unit test files and 175 tests passed, Playwright e2e reported 40 passed and
  12 skipped, build and pack dry-run passed, and audit reported 0
  vulnerabilities.

Live `llmwiki-serve` E2E source-checkout verification:

- `llmwiki-chat` now has `npm run test:e2e:live`, backed by
  `scripts/run-live-serve-e2e.mjs`, which provisions a sibling
  `llmwiki-serve` sample source pair for the browser tests.
- `node --check scripts/run-live-serve-e2e.mjs` passed.
- `LLMWIKI_LIVE_SERVE_URLS=http://127.0.0.1:1,http://127.0.0.1:2 npm run test:e2e:live -- --list --project=desktop`
  passed and showed external URL-list mode does not start local servers.
- `npm run test:e2e:live -- --project=desktop` started two local sample
  endpoints and passed 4/4 desktop tests, including two-source provenance.
- `npm run check` passed with 175 unit tests, 40 baseline Playwright e2e tests
  passed and 12 expected skipped, build, pack dry-run, and audit.

Live browser smoke on 2026-07-05 used isolated high ports, and was rerun after
the `llmwiki-chat` fast-forward:

- `llmwiki-serve`: `http://127.0.0.1:19071`
- temporary OpenAI-compatible runtime stub: `http://127.0.0.1:19072/v1`
- `llmwiki-agent-bridge`: `http://127.0.0.1:19073`
- `llmwiki-chat`: `http://127.0.0.1:19074`

The smoke changed the prefilled source URL to `19071`, tested the source,
changed Local Agent Bridge A2A to `19073`, tested the bridge, then clicked
`Ask: What is in this wiki?`.

Observed result:

- source summary: `1 selected - 1 ready available`
- connection status: `1 ready source - runtime ready`
- answer rendered as a markdown table
- run details displayed `8 steps - 1 tool call`
- citations displayed and were selectable
- evidence graph displayed 4 pages, 10 links, and 8 source refs
- screenshot evidence was captured to local temporary artifacts before and
  after the chat rebase; the committed readiness note records the observed UI
  state rather than machine-local artifact paths.
- expected console noise: two `ERR_CONNECTION_REFUSED` entries from the initial
  default `127.0.0.1:8765` source auto-test before the smoke changed the source
  URL to the isolated `19071` server.

### Docs Rendering Smoke

The docs portal at `http://127.0.0.1:18770/llmwiki-docs/` was verified with
headless Chrome after Mermaid rendering fixes:

- Home `Module Map`: one Mermaid SVG, `aria-roledescription="flowchart-v2"`,
  no Mermaid parser error text.
- Architecture page after SPA navigation: one Mermaid SVG,
  `aria-roledescription="flowchart-v2"`, no Mermaid parser error text.
- `npm run check` passed after the Mermaid dependency and third-party license
  artifact were updated.
- After a browser-reported Mermaid 11 parser failure on the home `Module Map`,
  Mermaid labels in the home and architecture diagrams were made conservative
  by removing inline `<br/>` HTML labels. Headless Chromium rechecked both pages
  with cache-busting URLs: each page rendered one Mermaid SVG and contained no
  Mermaid parser error text.
- This readiness page is intentionally linked from Maintainers navigation and
  the release checklist. Machine-local temp paths and screenshot paths were
  generalized before PR, and transient local auth/plan wording was changed into
  launch requirements.
- `khroma@2.1.0` ships a top-level MIT license file but lacks a package
  metadata license field. The docs license generator now records an explicit
  `khroma@2.1.0 -> MIT` override, and `npm run licenses:check` passes.

Follow-up consistency fixes applied:

- Quickstart prerequisites now include `curl` and PowerShell `curl.exe` caveats.
- Bridge startup wording now says to run from the `llmwiki-agent-bridge`
  checkout.
- Chat quickstart labels now match the current UI:
  `Local Agent Bridge (A2A)`, `Local Agent Bridge (MCP)`, and
  `Test-only local runtime`.
- The home module map now shows `llmwiki-chat` calling `llmwiki-serve` and
  `llmwiki-agent-bridge`, rather than being owned by them.
- Architecture/core concepts now use "selected Knowledge Source descriptors"
  for bridge inputs and reserve "opaque handles" for serve-owned references.
- Archive-backed and packed source bundles are now described as future source
  shapes, not current CLI inputs.
- `npm run check` passed after these docs changes.

Additional host-RAG / LLMWiki orchestration consistency fixes in this worktree:

- Architecture and core concepts now state that source-bundle and
  current-evidence descriptors remain source-owned coordination metadata for
  host or bridge retrieval loops.
- Runtime adapters now describe source reachability as a requirement for the
  component doing retrieval, such as the host loop, bridge, or approved proxy
  path, rather than requiring the delegated runtime to reach raw sources.
- Quickstart bridge setup now says it registers Knowledge Source endpoint
  descriptors and does not copy or store the served source bundle.
- Direct agent integrations now warn hosts not to infer raw file paths or bypass
  `llmwiki-serve` from source-bundle or current-evidence descriptors.
- Local verification: `npm run check` passed with license validation and
  VitePress build.

### Public Launch Preflight

On 2026-07-05, the public-unpublished preflight was run from `llmwiki-docs`:

```sh
npm run release:preflight:public-unpublished
```

This command is expected to fail before the coordinated changes are committed,
pushed, and public-launch operations are applied. The useful current signal was:

- package/artifact checks passed:
  - `llmwiki-serve` Python release smoke passed
  - `llmwiki-agent-bridge` npm pack dry-run passed with 23 packaged files
  - `llmwiki-chat` npm pack dry-run passed with 18 packaged files
  - `llmwiki-docs` npm pack dry-run passed with 40 packaged files
- license artifacts passed:
  - chat `THIRD_PARTY_LICENSES.md` was up to date
  - docs `docs/public/third-party-licenses.txt` was up to date
- target org/repo access worked through GitHub CLI
- registry state matched public-unpublished expectations:
  - PyPI `llmwiki-serve` returned 404
  - npm `llmwiki-agent-bridge` returned E404
  - npm `llmwiki-chat` returned E404
- public launch copy was checked independently:

```sh
npm run launch-copy:check:public-unpublished
```

This launch-copy check is expected to fail while [Release Status &
Compatibility](/status) still identifies the current phase as `private org
staging`. It should pass only in the public-launch copy flip where the status
page is updated to `public unpublished` and the repositories are ready to become
public.

The public-unpublished preflight still fails for launch-order reasons:

- all four target repositories are still private
- docs Pages URL returns `404`
- branch protection or rulesets must be configured after the repository
  visibility and plan support the chosen policy
- GitHub CLI auth must include `admin:org` before org setup operations that
  require it

Interpretation: public-unpublished failures are expected before the launch-copy
flip, repository visibility change, Pages publication, and branch-policy
operations. The coordinated feature changes have already been merged to clean
`main` checkouts.

### R8 Public Launch Copy And Mermaid Hardening

On 2026-07-05, follow-up checks found two gaps that were fixed before public
open:

- A stale preview server on port `18888` served HTML but returned `404` for
  assets, so Mermaid client rendering did not run even though the source
  diagram syntax was valid. Restarting preview from the current build fixed the
  visible page. The home Module Map and Architecture flow diagrams were also
  hardened with semicolon-terminated Mermaid statements, and the VitePress
  theme now trims restored Mermaid source before rendering.
- The public-preview remote checks now normalize GitHub remote URLs before
  comparing them, so `https://github.com/<org>/<repo>` and
  `https://github.com/<org>/<repo>.git` are treated as the same repository.
  This prevents `actions/checkout` remotes from failing preflight only because
  the `.git` suffix is absent.
- The central package-publication runbook now explains that, before package
  upload, the public unpublished phase could show PyPI/npm packages as not yet
  uploaded until install-smoke verification finished.
- The bridge release checklist used the same interpretation: before package
  upload, the bridge package could be marked as not yet uploaded during
  `public-unpublished`.
- `launch-copy:check:public-unpublished` now treats `GitHub Pages publication
  pending` as stale public-launch copy. This keeps the docs portal from
  claiming public-unpublished readiness while the status matrix or CLI reference
  still describe Pages as pending.

Local verification after these fixes:

- `npm run check` in `llmwiki-docs`: passed.
- Headless Chromium against `http://localhost:18888/llmwiki-docs/` verified the
  home Module Map and Architecture Mermaid diagrams each rendered one
  `flowchart-v2` SVG, with no Mermaid parser-error text and no console errors.
- `npm run release:preflight:private-staging`: passed with 0 required failures
  and 0 strict blockers. The remaining 5 warnings are expected private-state
  warnings: missing `admin:org` scope and branch-policy APIs unavailable while
  the repositories are private on the current plan.
- `npm run launch-copy:check:public-unpublished`: intentionally failed while
  the then-current status page still described pre-public staging and while
  `llmwiki-docs` Pages were still described as pending in status/CLI reference.
  This was the desired blocker before the public launch copy flip.
- `npm run public:launch:dry-run`: intentionally stopped at the same
  launch-copy gate after a successful docs build, before previewing or applying
  mutating visibility, Pages, or branch-policy operations.
- `npm run check` in `llmwiki-agent-bridge`: passed after release-checklist
  wording was aligned with the central package-publication runbook.

PR heads observed after R8 before merge:

| Repository | PR | Head | Merge state | Core checks |
| --- | --- | --- | --- | --- |
| `llmwiki-serve` | #11 | `c0560cb` | CLEAN | pass |
| `llmwiki-agent-bridge` | #12 | `5eee7d9` | CLEAN | pass |
| `llmwiki-chat` | #25 | `22ad5ae` | CLEAN | pass |
| `llmwiki-docs` | #6 | `95b47af` | CLEAN | pass |

### R9 Fresh Public Clone Quickstart Audit

A subagent reran the public quickstart from temporary public clones under
`C:/tmp` and compared those results with the coordinated pre-merge worktrees.
This was a pre-merge audit. The public clone check was intentionally stricter
than private-staging checks because it proved whether a user who copied the
docs at that time could succeed from public default branches.

Pre-merge public default-branch findings:

- `llmwiki-serve` public HEAD served `/health`, `/manifest`, `/query`,
  and `/mcp`, but `GET /source-bundle` returned `{"detail":"Not Found"}` and
  the public manifest does not expose the source-bundle fields required by the
  current docs. This gap was resolved by PR #11.
- `llmwiki-agent-bridge` public HEAD passed its existing `npm run check`, but
  the documented `mode: "evidence-only"` quickstart request follows the older
  runtime-backed path and does not produce the documented `orchestrationMode`
  and `sourceBundles` artifact shape. This was covered by the coordinated bridge
  PR and was resolved by PR #12.
- `llmwiki-chat` public HEAD had a stale live E2E path for the current UI:
  desktop live E2E failed when the old source-setup clicks were blocked by the
  collapsed sidebar/summary overlay. The coordinated chat PR adds the live
  source wrapper and current UI helpers; this was resolved by PR #25.

Coordinated pre-merge worktree results:

- Coordinated `llmwiki-serve` passed `/health`, `/manifest`, `/source-bundle`, and
  `/query`.
- Coordinated `llmwiki-agent-bridge` passed `npm run check` and evidence-only
  `/message:send`, returning `orchestrationMode: "evidence-only"`,
  `sourceBundles`, and no runtime call.
- Coordinated `llmwiki-chat` passed
  `npm run test:e2e:live -- --project=desktop` with 4 tests.
- Coordinated bridge settings endpoints `/settings.json`,
  `/settings/sources.json`, and `/mcp tools/list` were reachable.

Post-merge interpretation: the docs quickstart is aligned with the current
`main` stack. The dependency-order merge has completed:
`llmwiki-serve` PR #11, `llmwiki-agent-bridge` PR #12, `llmwiki-chat` PR #25,
then `llmwiki-docs` PR #6.

### R10 Post-Merge Main Verification

On 2026-07-05, the coordinated PR stack was merged to `main` and the sibling
main checkouts were fast-forwarded:

| Repository | Main commit | Post-merge verification |
| --- | --- | --- |
| `llmwiki-serve` | `a290ca8` | `uv run --no-sync python scripts/release_smoke.py --dist-dir ...`: passed, including source boundary, sdist contents, wheel CLI/API, and MCP Streamable HTTP smoke. |
| `llmwiki-agent-bridge` | `a2c088e` | `npm run check`: passed with 36 node tests, OpenAPI contract check, and npm pack dry-run. |
| `llmwiki-chat` | `e57510b` | `npm run check`: passed with lint, typecheck, 175 unit tests, 40 baseline Playwright E2E tests, 12 expected skipped, build, pack dry-run, and `npm audit --audit-level=moderate`. Live desktop E2E passed 4/4 against a temporary fresh `llmwiki-serve` clone. |
| `llmwiki-docs` | `84f84ef` | `npm run check`: passed with third-party license check and VitePress build. |

Additional post-merge evidence:

- `npm run release:preflight:private-staging`: passed with 0 required failures
  and 0 strict blockers.
- The remaining 5 preflight warnings are expected private-state warnings:
  missing `admin:org` scope and branch-policy APIs unavailable while the
  repositories are private on the current plan.
- The restored private bridge health endpoint returned `status: "ok"` from a
  redacted private-network URL. Do not commit operator tailnet hostnames,
  private IPs, runtime secrets, or local machine paths in readiness evidence.
- The docs preview at `http://127.0.0.1:18888/llmwiki-docs/#module-map`
  rendered the Module Map as an SVG Mermaid flowchart after the stale preview
  process was replaced with the current main worktree server.

### R11 Public-Launch Dry-Run Gate

After PR #7 merged, the current private-staging copy was rechecked against the
public-launch gate:

- `npm run launch-copy:check:public-unpublished`: intentionally failed only for
  the then-current `llmwiki-docs` pre-public launch copy:
  - `docs/status.md` still marked the pre-public staging phase as current.
  - `docs/status.md` still marked GitHub Pages publication as pending.
  - `docs/cli-reference.md` still marked `llmwiki-docs` Pages publication as
    pending until the Pages gate passed.
- `npm run public:launch:dry-run`: built docs successfully, then intentionally
  stopped at the same launch-copy gate before previewing visibility, Pages, or
  branch-policy mutations.

Interpretation at that time: this was the correct owner-approval boundary. The
docs had to keep pre-public staging wording until the release owner approved the
public visibility and Pages transition. The copy flip had to be a deliberate
launch PR, not an incidental readiness-doc update.

### R11 Fresh High-Port Quickstart Audit

A subagent reran the quickstart from temp clones under
`C:\tmp\llmwiki-quickstart-audit-20260705-174730`, using high loopback ports
because `18765` was already listening:

| Area | Result |
| --- | --- |
| `llmwiki-serve` temp clone | `uv sync --extra dev` passed at commit `a290ca8`; sample wiki served on `127.0.0.1:39165`. |
| Source endpoints | `/health`, `/manifest`, `/source-bundle`, `/query`, and MCP `llmwiki_context` passed. The manifest exposed source/bundle metadata without private absolute source paths. |
| `llmwiki-agent-bridge` temp clone | `npm ci` and `npm run check` passed at commit `a2c088e`; evidence-only bridge ran on `127.0.0.1:39188`. |
| Bridge evidence-only smoke | `/message:send` completed with `orchestrationMode: "evidence-only"`, 4 citations, source bundle metadata, source-call steps, and no `runtime-chat-completions` step. |
| `llmwiki-chat` temp clone | live source smoke passed at commit `e57510b`: 6 passed, 2 skipped, covering desktop/mobile HTTP and MCP source UI paths. |

Docs follow-up applied from that audit:

- Quickstart now explains how to choose non-default serve, bridge, and chat
  ports and where to reuse those URLs.
- Bridge `message:send` now has a Windows PowerShell body-file example.
- Evidence-only bridge setup now warns that deprecated `HERMES_*` aliases may
  still be read during migration and recommends `LLMWIKI_AGENT_BRIDGE_*` for new
  setups.
- Chat quickstart now includes a non-interactive live source smoke command using
  `LLMWIKI_LIVE_SERVE_URL`.

### R12 Public-Launch Rehearsal

The non-mutating public-launch runbook path was rehearsed while repositories
remain private:

| Command | Result |
| --- | --- |
| `npm run transfer:verify` | Passed private org verification. Repos, remotes, workflows, CODEOWNERS, teams, and vulnerability alerts were verified. Private vulnerability reporting and branch policy remain warnings. |
| `npm run org:configure:dry-run` | Printed non-mutating team/repository/vulnerability setup commands and skipped Pages creation. |
| `npm run visibility:public:dry-run` | Confirmed all four sibling checkouts are clean on `main...origin/main` and printed exact `gh repo edit --visibility public` commands. |
| `npm run org:configure:pages:dry-run` | Printed setup commands and warned that `llmwiki-docs` is still private before public-launch Pages setup. |
| `npm run pages:publish:dry-run` | Printed the Pages workflow query and URL polling commands for docs commit `5a2537d`. |
| `npm run branch-policy:dry-run` | Printed public-launch branch protection payloads and warned that repositories are still private. |
| `npm run public:launch:dry-run` | Built docs successfully, then intentionally stopped at launch-copy validation before previewing or applying mutations. |

The package/PR audit also found that package README release-status copy was
ahead of the current gate: `llmwiki-serve`, `llmwiki-agent-bridge`, and
`llmwiki-chat` each said they were already in public preview while GitHub
repositories were still private and the docs status page said `private org
staging`. Follow-up PRs aligned the copy:

| Repository | PR | Main commit | Result |
| --- | --- | --- | --- |
| `llmwiki-serve` | #12 | `afb2ade` | README was aligned to the pre-public staging gate used at that point in the launch process. |
| `llmwiki-agent-bridge` | #13 | `b132948` | README was aligned to the pre-public staging gate used at that point in the launch process. |
| `llmwiki-chat` | #26 | `556cdd8` | README was aligned to the pre-public staging gate used at that point in the launch process. |

Interpretation: the dry-run path is coherent for the current phase. The next
state transition is not a code change; it requires release-owner approval,
confirmed private security/conduct report routes, a deliberate public-launch
copy flip, public visibility, Pages publication, branch policy, and
`release:preflight:public-unpublished`.

## Historical Open Issues

### R7 Quickstart And Private Settings Rerun

On 2026-07-05, a subagent reran the quickstart against the coordinated
pre-merge worktrees:

- `uv sync --extra dev` in `llmwiki-serve`: passed.
- `uv run llmwiki-serve manifest ./examples/sample-wiki`: passed.
- `uv run llmwiki-serve query ./examples/sample-wiki "release readiness"
  --limit 4`: passed.
- Coordinated `llmwiki-serve` on `127.0.0.1:19651` returned passing `/health`,
  `/manifest`, `/source-bundle`, `/query`, MCP `llmwiki_context`, and MCP
  `llmwiki_source_bundle` responses.
- Windows PowerShell inline JSON with `curl.exe -d '{...}'` stripped quotes
  before reaching curl; the documented body-file pattern with
  `curl.exe --data-binary @file.json` passed and is now the recommended
  PowerShell POST pattern.
- `llmwiki-agent-bridge` `npm ci` and `npm run check`: passed.
- Coordinated bridge on `127.0.0.1:19652` returned passing `/health`, agent card,
  evidence-only `/message:send`, and `/mcp tools/list` responses.
- `llmwiki-chat` `npm ci`: passed; a Vite dev server on `127.0.0.1:19653`
  returned HTTP `200` and the expected `LLMWiki Chat` shell.
- `llmwiki-docs` `npm run check`: passed.

The same round found and fixed docs contradictions:

- Status clarified that the launch was still in pre-public staging at that time,
  not public preview or public unpublished.
- Bridge docs now distinguish evidence-only, delegated-runtime, and hybrid
  modes; only runtime-backed modes call an OpenAI-compatible runtime.
- The release checklist no longer requires live provider keys for minimum
  bridge smoke; evidence-only is the minimum gate, with mocked or local runtime
  smoke only when runtime-backed behavior changes.
- The Mermaid error regression note no longer contains the exact parser-error
  text, so rendered docs smoke does not confuse historical evidence with a live
  page failure.

Local maintainer verification after the fixes:

- `npm run check` in `llmwiki-docs`: passed.
- Internal Markdown link smoke: passed.
- Headless Chromium smoke against the running docs server verified `/`,
  `/quickstart`, `/architecture`, `/core-concepts`, `/protocols`, `/ai-tools`,
  `/runtime-adapters`, `/faq`, `/status`, `/oss-open-readiness`,
  `/organization-setup`, and `/package-publication` all returned HTTP `200`,
  had no VitePress missing-page shell, had no Mermaid parser-error text, and
  emitted no console warnings or errors.

GitHub settings observed in the same round:

- `llmwiki-serve`, `llmwiki-agent-bridge`, `llmwiki-chat`, and `llmwiki-docs`
  are still private repositories under `knowledge-bridge-labs`.
- Main branch protection is not yet available or configured while the repos are
  private on the current plan; GitHub returned a feature availability error for
  the protection endpoint.
- `llmwiki-docs` Pages returned `404`, so the public docs site is not live yet.

Resolved post-merge issues:

| ID | Resolution |
| --- | --- |
| OOR-001 | Resolved by `llmwiki-serve` PR #11. Current `main` exposes the source-bundle contract used by the quickstart. |
| OOR-002 | Resolved by `llmwiki-agent-bridge` PR #12. Current `main` supports evidence-only mode and `sourceBundles` artifacts. |
| OOR-003 | Resolved by `llmwiki-chat` PR #25. Current `main` live E2E wrapper and UI helpers match the first-run UI. |
| OOR-005 | Resolved by dependency-order merges of `llmwiki-serve` #11, `llmwiki-agent-bridge` #12, `llmwiki-chat` #25, and `llmwiki-docs` #6. Clean main checkouts pass private-staging verification. |
| OOR-009 | R14 resolved source-checkout quickstart drift: troubleshooting now uses the default source port and `uv run`, the bridge local payload is evidence-only, docs preview includes `npm ci`, chat live E2E documents the sibling serve sync, and Codex/host-RAG wording keeps bridge fan-out distinct from host-owned surface RAG. |
| OOR-011 | R15 fresh-clone quickstart and cross-repo e2e passed. Quickstart and bridge example docs now explain that `examples/message-send.local.json` targets the default `8765` source URL and must be copied or edited when high source or bridge ports are used. |

| ID | Severity | Issue | Required Action |
| --- | --- | --- | --- |
| OOR-004 | Medium | Quickstart uses default ports `8765` and `8788`, while private/tailnet operations often use high ports. | Keep defaults documented, but ensure conflict guidance and high-port deployment guidance remain clear. |
| OOR-006 | High | Target repositories are still private and Pages returns 404. | After owner approval and private reporting-route confirmation, run the public visibility and Pages runbook from Organization & Pages Setup. |
| OOR-007 | High | Branch policy/status checks are not configured for public launch. | Apply branch protection or equivalent rulesets after public visibility is approved, then rerun `release:preflight:public-unpublished`. |
| OOR-008 | Medium | GitHub CLI lacks `admin:org` scope. | Before org setup or visibility automation, run `gh auth refresh -h github.com -s admin:org` from the release-owner account. |
| OOR-010 | High | Private vulnerability reporting and monitored security/conduct routes are not confirmed for public open. | Confirm the reporting route from the release-owner account, then enable or document the route before public visibility. |

## Repository Check Matrix

| Repository | Required local checks | Live checks |
| --- | --- | --- |
| `llmwiki-serve` | `uv run ruff check .`, `uv run mypy src`, `uv run pytest`, `uv run python scripts/release_smoke.py`, `uv build` | source fixture HTTP/MCP/source-bundle smoke |
| `llmwiki-agent-bridge` | `npm run check` | evidence-only and delegated-runtime `/message:send`, `/mcp`, `/settings` smoke |
| `llmwiki-chat` | `npm run check` or scoped lint/type/test/build while iterating | browser source setup, bridge setup, ask flow, markdown, citations, graph, run details |
| `llmwiki-docs` | `npm run check` | VitePress render smoke, Mermaid SVG smoke, quickstart link and command review |

## Historical Next Round Notes

These notes were the next steps at the time this readiness log was active. They
are superseded by the current published baseline in
[Release Status & Compatibility](/status): source checkouts remain supported,
GitHub Pages is live, and the first packages are published as
`llmwiki-serve==0.2.2`, `llmwiki-bridge-start@0.0.2`,
`llmwiki-agent-bridge@0.2.1`, and `llmwiki-chat@0.1.6`.
