# 2026-07-22 Post-Release Action Items

Status: active
Owner: llmwiki-* maintainers
Scope: follow-up work after `llmwiki-chat@0.1.3` and the current public-preview
baseline.

## Current Baseline

- `llmwiki-serve==0.2.0` is published on PyPI.
- `llmwiki-agent-bridge@0.1.0` is published on npm.
- `llmwiki-chat@0.1.3` is published on npm.
- `llmwiki-docs` public-preview preflight passed after the `llmwiki-chat@0.1.3`
  release.

## TODO

| Priority | Item | Status | Notes |
| ---: | --- | --- | --- |
| 1 | Update `llmwiki-docs` public package/version copy. | Done | User-facing docs now say `llmwiki-chat@0.1.3`, not older `0.1.0` examples. Historical/operational copy was reviewed separately. |
| 2 | Harden docs release preflight against stale package-version copy. | Done | `release:preflight:published` now includes a public docs package-version copy check, with a focused `--only-published-docs-version-copy` mode. |
| 3 | Verify npm/GitHub page rendering manually. | In progress | GitHub README, npm registry README metadata, published tarball contents, and raw default workbench image are verified. npm web page rendering still needs a browser/manual recheck because npm returned 403 to non-browser fetch and in-app browser automation was unavailable in this run. |
| 4 | Add reproducible screenshot capture workflow. | Done | `llmwiki-chat` now has `npm run docs:capture-screenshots` and `npm run docs:check-screenshots`; both current PNGs reproduce byte-identically. |
| 5 | Decide `llmwiki-agent-bridge` `compact-json` default promotion path. | Done | `llmwiki-agent-bridge` now documents that runtime prompts already use compact JSON, while broad production-default approval remains a separate multi-runtime/model-class evidence claim gated by the tracked e2e wrapper. |
| 6 | Add chat-to-bridge multi-turn/context live verification. | Pending | Prove stable `contextId` or equivalent thread continuity across real chat turns and bridge runtime calls. |
| 7 | Improve bridge-managed source UX and orchestration controls. | Pending | Cover bridge-mediated graph/read, source grouping, and explicit `evidence-only` / `delegated-runtime` / `hybrid` mode controls. |
| 8 | Process Dependabot PRs after release baseline. | Pending | Handle dependency/action bumps one at a time with CI evidence. |
| 9 | Investigate bundle-size warning. | Pending | Vite repeatedly warns about the large browser chunk; evaluate code splitting after higher-priority docs/release drift is closed. |

## Excluded For Now

- Managed one-click Quickstart / local process automation is intentionally out
  of this immediate sequence. Browser-safe Quickstart remains the current
  default until a trusted local setup API exists.

## Validation Notes

- Do not commit `.llmwiki-work/` or private local artifacts.
- Keep package-version claims synchronized with registry reality.
- Only use sanitized live/e2e summaries when documenting model/runtime quality
  evidence.
