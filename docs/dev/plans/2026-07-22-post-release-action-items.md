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
| 3 | Verify npm/GitHub page rendering manually. | Done | User manual confirmation: the npm page shows package version `llmwiki-chat` `0.1.3`; README/package copy shows `llmwiki-chat@0.1.3` and `llmwiki-agent-bridge@0.1.0`; the demo image is the latest default screen. The visible `Release llmwiki-chat 0.1.2` text was from GitHub image/link context, not stale npm package copy. |
| 4 | Add reproducible screenshot capture workflow. | Done | `llmwiki-chat` now has `npm run docs:capture-screenshots` and `npm run docs:check-screenshots`; both current PNGs reproduce byte-identically. |
| 5 | Decide `llmwiki-agent-bridge` `compact-json` default promotion path. | Done | `llmwiki-agent-bridge` now documents that runtime prompts already use compact JSON, while broad production-default approval remains a separate multi-runtime/model-class evidence claim gated by the tracked e2e wrapper. |
| 6 | Add chat-to-bridge multi-turn/context live verification. | Done | `llmwiki-chat` now has `npm run test:e2e:bridge-multiturn`, proving browser → real bridge → test OpenAI-compatible runtime over three turns with stable thread/context/session IDs and bounded runtime history. |
| 7 | Improve bridge-managed source UX and orchestration controls. | Done | `llmwiki-chat` now exposes bridge-only `evidence-only` / `delegated-runtime` / `hybrid` orchestration controls and routes bridge-managed page/detail previews through the owning bridge MCP `llmwiki_read` tool instead of direct private source `/read/...` fetches. Source grouping remains an optional cosmetic follow-up. |
| 8 | Process Dependabot PRs after release baseline. | Done | All open Dependabot PRs were handled with green CI evidence: `llmwiki-serve` #12/#13, `llmwiki-agent-bridge` #6/#15, `llmwiki-chat` #7/#16, and `llmwiki-docs` #12. `llmwiki-chat` #16 also refreshed generated third-party license output before merge. |
| 9 | Investigate bundle-size warning. | Done | `llmwiki-chat` split the Markdown renderer into a lazy chunk. Production build now emits `index-*.js` at about 343.61 kB plus `MarkdownRenderer-*.js` at about 161.99 kB, with no Vite chunk-size warning. `npm run build` now also runs `bundle:check` to guard that Markdown parser internals stay out of the entry chunk. |

## Excluded For Now

- Managed one-click Quickstart / local process automation is intentionally out
  of this immediate sequence. Browser-safe Quickstart remains the current
  default until a trusted local setup API exists.

## Validation Notes

- Do not commit `.llmwiki-work/` or private local artifacts.
- Keep package-version claims synchronized with registry reality.
- Only use sanitized live/e2e summaries when documenting model/runtime quality
  evidence.
