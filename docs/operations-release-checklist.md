# Operations & Release Checklist

Use this checklist when preparing a coordinated release, a public demo, or a
GitHub Pages documentation update.

For the active pre-public-open audit log, round plan, and evidence matrix, see
[OSS Open Readiness Rounds](/oss-open-readiness). This checklist is the stable
gate list; the readiness rounds page records the current iteration evidence and
open blockers.

## Repository Checks

For `llmwiki-serve`:

- Run Python tests.
- Run lint and type checks.
- Verify sample wiki commands from the README.
- Confirm draft filtering and local CORS defaults still match documented
  behavior.
- Inspect package metadata, license files, changelog, and third-party notices.

For `llmwiki-agent-bridge`:

- Run `npm ci` from a clean checkout.
- Run `npm run check`.
- Smoke test `/health`, `/.well-known/agent-card.json`, `/message:send`, and
  `/mcp` bridge tools.
- Verify runtime profile examples still match supported environment variables.
- Confirm no runtime secrets are committed or printed in logs.

For `llmwiki-chat`:

- Run lint, typecheck, unit tests, bridge tests, and build.
- Run browser or Playwright checks for the main source setup and ask flow.
- Run `node --check scripts/run-live-serve-e2e.mjs` and
  `npm run test:e2e:live -- --project=desktop` for the source-checkout live
  `llmwiki-serve` smoke. This provisions two sibling sample endpoints by
  default and must pass the two-source provenance case.
- Confirm external URL-list mode with
  `LLMWIKI_LIVE_SERVE_URLS=http://127.0.0.1:1,http://127.0.0.1:2 npm run test:e2e:live -- --list --project=desktop`;
  `--list` should not start local sample servers.
- Test Agent Bridge A2A, Agent Bridge MCP, and Local Development Runtime paths.
- Confirm bridge bearer tokens are not persisted in source descriptors or
  local storage.

## Cross-Repo Smoke Test

1. Start `llmwiki-serve` on `127.0.0.1:8765`.
2. Query `/manifest`, `/query`, `/graph`, and `/mcp`; query `/message:send`
   only when A2A source compatibility is enabled.
3. Start the bridge in evidence-only mode against the fixture source.
   Runtime-backed smoke is optional unless the release explicitly changes
   delegated-runtime or hybrid behavior; when needed, use a mocked or local
   OpenAI-compatible endpoint rather than requiring live provider keys.
4. Send a bridge `message:send` request with one selected source.
5. Start `llmwiki-chat`.
6. Connect the source, inspect graph context, and ask a question through the
   selected bridge path.
7. Check citations, trace steps, and graph data for shape regressions.
8. For the maintained live source-checkout smoke, run
   `npm run test:e2e:live -- --project=desktop` from `llmwiki-chat`; it starts
   two sibling `llmwiki-serve` sample endpoints by default and expects all
   desktop tests to pass, including two-source provenance.

## Documentation Release

For this docs portal:

```sh
npm ci
npm run check
npm run release:preflight:staging
```

Run `release:preflight:private-staging` only after the repositories have moved
to the target organization and the authenticated GitHub CLI user can read those
private repositories:

```sh
npm run release:preflight:private-staging
```

Before merging a docs change:

- Confirm links point to the target repository
  `knowledge-bridge-labs/llmwiki-docs`.
- Avoid copying text or styling from unrelated sites.
- Update this checklist when release commands change in any toolchain
  repository.

## GitHub Pages

The included workflow always builds VitePress. The deploy job runs only when the
repository is public. Repository settings should use GitHub Actions as the Pages
source for the public-launch phase.

Required workflow permissions:

- `contents: read`
- `pages: write`
- `id-token: write`

The workflow runs on pull requests, pushes to `main`, and manual dispatch. Do
not tag release commits unless the release owner explicitly asks for it.

## Organization Transfer

Before public release, create or confirm the target organization and move the
private repositories there. The default documented target is
`knowledge-bridge-labs`; if the release owner chooses another neutral name, use
`--target-org=<org>` or `LLMWIKI_TARGET_ORG=<org>` with the helper scripts:

- `llmwiki-serve`
- `llmwiki-agent-bridge`
- `llmwiki-chat`
- `llmwiki-docs`

Use [Organization & Pages Setup](/organization-setup) for the full operational
runbook. This checklist keeps only the release gates.

Before applying organization changes, refresh GitHub CLI auth for organization
administration and confirm the target organization is visible:

```sh
gh auth refresh -h github.com -s admin:org
gh api orgs/knowledge-bridge-labs --jq '{login:.login,name:.name}'
```

After the organization exists, preview the transfer commands from this
repository:

```sh
npm run transfer:dry-run -- --source-owner=<current-owner>
# or:
npm run transfer:dry-run -- --source-owner=<current-owner> --target-org=<org>
```

Run the transfer only when the organization owner is ready:

```sh
npm run transfer:apply -- --source-owner=<current-owner>
# or:
npm run transfer:apply -- --source-owner=<current-owner> --target-org=<org>
```

The apply command requires every sibling checkout to be on `main`, clean, and
fully pushed to its current upstream before it submits repository transfer
requests.

Then run the read-only verifier:

```sh
npm run transfer:verify
npm run release:preflight:private-staging
# or:
npm run transfer:verify -- --target-org=<org>
npm run release:preflight:private-staging -- --target-org=<org>
```

PowerShell equivalent:

```powershell
npm run transfer:verify -- --target-org=<org>
npm run release:preflight:private-staging -- --target-org=<org>
```

The public-preview preflight now checks cross-repo working trees, package
contents, local license artifacts, organization access, Pages status, and
registry state. Public modes also check for stale private-staging launch copy
in README and documentation surfaces. Use `release:preflight:staging` while
target organization URLs are still expected to warn,
`release:preflight:private-staging` after private organization transfer and
before public visibility changes,
`release:preflight:public-unpublished` after the release owner intentionally
makes the public-facing repositories and Pages site public but before first
package publication, and `release:preflight:published` after the first PyPI/npm
packages are live.
Use `release:preflight:private-staging:branch-policy` after branch protection
or repository rulesets are configured if the release owner wants those warnings
to become blockers before accepting outside pull requests.

After transfer:

- Create `maintainers`, `security`, and `conduct` teams or equivalent private
  maintainer channels.
- Publish or confirm monitored private security and conduct reporting routes
  before public visibility. Use GitHub private vulnerability reporting as the
  security route only when it is enabled and the `SECURITY.md` advisory URL
  resolves; otherwise update `SECURITY.md`, `SUPPORT.md`, and issue-template
  contact links with an owner-provided private route. Publish an owner-provided
  private conduct route in the Code of Conduct or repository/organization
  contact surface. Do not invent an email address, domain, or contact route.
- Confirm `CODEOWNERS` entries resolve to an org team with repository access.
- Update local fetch and push remotes to
  `https://github.com/<target-org>/<repo>.git`.
- Verify `gh repo view <target-org>/<repo>` works for every repository.
- Verify README CI badge URLs, issue-template links, security advisory URLs,
  repository homepage URLs, and VitePress edit/social links resolve under the
  transferred organization.
- Enable private vulnerability reporting where available.
- Enable branch protection for `main` with `npm run branch-policy:apply` after
  public visibility is approved, or use a repository ruleset with equivalent
  review, status-check, force-push, and deletion controls.
- Require CI before merge once the repositories accept external pull requests.
- Keep GitHub Pages missing during private org staging unless the release owner
  has explicitly approved public visibility.
- Re-run the cross-repo smoke test against the transferred clone URLs.

The safe organization settings helper can prepare teams, repository homepage
settings, issue/delete-branch defaults, vulnerability reporting endpoints, and
the docs Pages site where the account plan supports those features:

```sh
npm run org:configure:dry-run
npm run org:configure:apply
npm run codeowners:dry-run
npm run codeowners:apply
npm run branch-policy:dry-run
npm run transfer:verify
npm run release:preflight:private-staging
```

For a non-default organization, pass `--target-org=<org>` to the
`org:configure:*` and `transfer:verify` commands, and set
`LLMWIKI_TARGET_ORG=<org>` for `codeowners:*` and `release:preflight:*`.

Commit and push the generated `.github/CODEOWNERS` files in each repository
after `codeowners:apply` succeeds.

If transfer partially succeeds, stop before any visibility, Pages, tag, or
package-publication step. Save the transfer dry-run/apply output, source and
target `gh repo view` JSON, `git remote -v`, `git status -sb`,
`transfer:verify`, `release:preflight:private-staging`, and registry
404/E404 evidence. Re-run `transfer:dry-run`, update remotes only for repos
confirmed in the target organization, then rerun the private-staging gates.

Pages creation is a separate public-launch action. Run
`npm run org:configure:pages:dry-run` and
`npm run org:configure:pages:apply` only after the release owner approves Pages
and public repository visibility, and after `llmwiki-docs` is public. Those
scripts pass the explicit public-launch flag and verify the docs repository is
not private so Pages setup cannot mask accidental visibility drift.

Repository visibility is also a separate public-launch action. Preview the
change after private staging gates pass and launch-copy updates are ready, then
apply it only after owner approval:

```sh
npm run visibility:public:dry-run
npm run visibility:public:apply -- --confirm-private-report-routes
```

Before applying visibility, commit and push the public launch copy flip. Run
`npm run launch-copy:check:public-unpublished`, then
`npm run release:preflight:public-unpublished` and confirm any remaining
failures are expected external-state blockers, such as private repository
visibility, missing Pages, or unapplied branch policy, not stale public copy.
The copy flip must update [Release Status & Compatibility](/status) so
`public unpublished` is the current phase, and it must update both the status
matrix and [CLI Reference](/cli-reference) so `llmwiki-docs` Pages are live for
public preview rather than publication pending.
Also confirm the owner-provided private security and conduct reporting routes
are published or otherwise reachable by maintainers before the repositories
accept public issues.

The combined dry-run command exercises the non-mutating launch gates and prints
the public visibility, Pages, and branch policy operations:

```sh
npm run public:launch:dry-run
```

Branch protection is also a separate public-launch action. Preview it during
private staging, then apply it only after public visibility is approved unless
the organization owner has confirmed a plan that supports protected private
repositories:

```sh
npm run branch-policy:dry-run
npm run branch-policy:apply
```

After public visibility is approved, update launch copy, make the repositories
public, enable GitHub Pages for `llmwiki-docs`, wait for the Pages workflow and
URL, apply branch protection, and run
`npm run release:preflight:public-unpublished`:

```sh
npm run public:launch:apply -- --accept-public-launch --confirm-public-launch=knowledge-bridge-labs --confirm-private-report-routes
```

The apply command is intentionally explicit. It refuses to run unless the
underlying script receives `--accept-public-launch` and
`--confirm-public-launch=<target-org>`, plus
`--confirm-private-report-routes` after the release owner confirms monitored
private security and conduct reporting routes.

After the repositories are in the target organization, maintainers can also run
the manual `Public Preview Preflight` GitHub Actions workflow from
`llmwiki-docs`. It checks out all four repositories as siblings and runs the
same preflight modes in CI. While the repositories are still private, configure
an `LLMWIKI_PREFLIGHT_TOKEN` repository or organization secret if the default
`GITHUB_TOKEN` cannot read sibling private repositories.

Prefer a short-lived fine-grained token for `LLMWIKI_PREFLIGHT_TOKEN`. Limit it
to the target organization and the four preview repositories, grant only the
read permissions needed for repository checkout and verification metadata, and
avoid package-publish or write scopes. Branch policy verification may require
read access to repository administration metadata. The workflow passes this
token only to repository checkout and the final verifier step, not to dependency
installation commands.

## Package Publication

Use [Package Publication](/package-publication) before publishing PyPI or npm
packages. Registry publication is a maintainer-owner gate and should happen
only after the GitHub organization, public repository visibility, Pages URL,
branch policy, public-unpublished preflight, status matrix, package contents,
and local/CI validation gates are complete.

## Tagging Notes

When release tags span multiple repositories, record:

- exact repository SHAs
- package versions
- supported protocol surface
- required Node, npm, Python, and uv versions
- known compatibility notes for runtime adapters
- any security posture changes
- current status matrix updates, including registry publication status and
  compatibility caveats
