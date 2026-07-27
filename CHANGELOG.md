# Changelog

All notable changes to the documentation portal will be recorded here.

## Unreleased

- Aligned public release docs with the PyPI `llmwiki-serve==0.2.2` baseline
  and published the package-publication runbook in the Pages navigation.
- Documented the manual owner-provided security and conduct reporting route gate
  that must be satisfied before public repository visibility.
- Required an explicit `--confirm-private-report-routes` acknowledgement before
  the combined public launch apply command can make repositories public.
- Required the same acknowledgement on direct public visibility apply so the
  combined launch helper is not the only guarded path.
- Added a Pages publication wait helper and clarified the public launch copy,
  visibility, Pages, branch-policy, and package-publication order.
- Added a guarded public-visibility helper so release owners can dry-run or
  apply the repository visibility switch after private staging succeeds.
- Added public-launch copy checks so public preflight fails when README or docs
  still describe private staging, expected Pages 404s, or transfer-pending
  status as current.
- Added a public-launch branch protection helper and documented when to apply
  it after repository visibility changes.
- Added task-based homepage routes for source serving, direct agent use,
  runtime bridging, and private-network operation.
- Updated documentation status language after the repositories moved into
  private `knowledge-bridge-labs` org staging.
- Corrected the release status matrix after the bridge split so `llmwiki-chat`
  is documented as a browser workbench artifact rather than an embedded bridge
  package.
- Fixed mobile docs layout overflow by constraining VitePress home/doc content
  to the viewport and restoring horizontal scrolling for wide reference tables.
- Aligned transfer verification with public-preview link checks so dynamic
  `targetOrg` URLs and documented `<owner>` placeholders are not reported as
  stale repository links.
- Added CODEOWNERS for the planned Knowledge Bridge Labs maintainer team,
  hardened automated PR review-guide rendering, and tightened the manual public
  preflight workflow's token exposure.
- Added quickstart acceptance-output cues and moved maintainer-only operations
  pages behind a dedicated documentation section.
- Added a usage-question issue form and surfaced Code of Conduct guidance in
  the docs community navigation.
- Aligned package-publication and preflight checks with the split where
  `llmwiki-agent-bridge` owns bridge binaries and `llmwiki-chat` ships only the
  browser workbench artifact.
- Added a release status and compatibility matrix covering repositories,
  package publication state, protocol surfaces, runtime adapters, and non-claims.
- Added package publication runbook for PyPI/npm registry checks, publication
  gates, and post-publish verification.
- Added stricter publication gates for clean installs, notices, and
  post-transfer external link checks.
- Added initial VitePress documentation portal for the LLM Wiki-style server,
  bridge, and chat toolchain.
- Added GitHub Pages build workflow with deploy gated by repository visibility
  and Pages availability.
- Added organization transfer and GitHub Pages setup guidance for Knowledge
  Bridge Labs.
