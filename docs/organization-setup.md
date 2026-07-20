# Organization & Pages Setup

Use this guide when moving the toolchain into the public organization and
turning the documentation portal into the canonical GitHub Pages site.

The target organization is `knowledge-bridge-labs`. The documentation URL is:

```txt
https://knowledge-bridge-labs.github.io/llmwiki-docs/
```

The name is intentionally neutral. It describes the toolchain's role around
agent-readable Knowledge Sources without implying that the organization owns
the broader LLM Wiki idea, upstream producers, or any third-party runtime. Avoid
organization names that start with `llmwiki-` or otherwise sound like an
official upstream project unless the release owner has the corresponding rights
and community agreement.

If the release owner chooses a different neutral organization name, pass it to
the helper scripts with `--target-org=<org>` or set `LLMWIKI_TARGET_ORG=<org>`.
The default remains `knowledge-bridge-labs` so the documented public-preview
commands stay short.

Those options affect the helper scripts and verifiers. Before publishing under
a different organization, also update committed public URLs in repository
metadata, README badges, issue-template links, `SECURITY.md` advisory links,
and the VitePress nav/config so the rendered docs do not point at stale target
locations.

## Scope

Move these repositories together:

- `llmwiki-serve`
- `llmwiki-agent-bridge`
- `llmwiki-chat`
- `llmwiki-docs`

The helper scripts assume the four repositories are sibling clones under one
workspace directory:

```txt
workspace/
  llmwiki-serve/
  llmwiki-agent-bridge/
  llmwiki-chat/
  llmwiki-docs/
```

## Why A Pages Site

The individual README files are still the right place for package-specific
commands. The Pages site is the cross-repository map:

- how the server, bridge, and chat client fit together
- which protocol surfaces are stable compatibility targets
- how to run a complete local smoke test
- how to configure network, runtime, and release posture
- what must be checked before public release

The site should keep its own visual identity. Do not copy another project's CSS,
page structure, names, or marketing language.

## Before You Start

Install and authenticate GitHub CLI:

```sh
gh auth status
```

For organization setup and team/repository access APIs, refresh the token with
organization administration scope before applying changes:

```sh
gh auth refresh -h github.com -s admin:org
gh auth status
```

The account running the transfer must have admin access to the source
repositories and permission to create repositories in the target organization.
The target organization must not already contain repositories with these names.
All four source repositories must still be private for the initial organization
staging transfer. The transfer and verification helpers intentionally reject a
public source or target repository at this stage so publication remains a
separate release-owner decision.

Do not create empty `<target-org>/llmwiki-*` repositories before transfer. A
same-name target repository is treated as a collision unless it is the same
transferred repository.

## Create The Organization

Create `knowledge-bridge-labs` in GitHub's web UI:

```txt
Profile picture -> Settings -> Organizations -> New organization
```

Verify CLI visibility after creation:

```sh
gh api orgs/knowledge-bridge-labs --jq '{login:.login,name:.name}'
```

The repository scripts intentionally do not create the organization. GitHub
organization creation includes ownership, billing, and terms choices that should
remain a manual owner decision.

If the command returns `Not Found` after creating the organization, confirm that
the authenticated GitHub account is an organization owner and rerun:

```sh
gh auth refresh -h github.com -s admin:org
```

## Org Baseline

Before transferring repositories, confirm these organization settings in the
GitHub UI. Some are account-plan dependent and intentionally remain manual
owner checks:

- keep default member repository permission at the least-privilege setting
  appropriate for the owner group
- require two-factor authentication for organization members where available
- restrict repository creation and visibility changes to owners or trusted
  maintainers
- keep Actions restricted to trusted workflows and GitHub-maintained actions
  until the public preview policy is finalized
- keep package publication credentials out of the organization until the
  release owner approves PyPI/npm publication
- identify at least two owners or an equivalent recovery path before opening the
  repositories to outside contributors
- choose monitored private reporting routes for security and conduct before
  public visibility. GitHub private vulnerability reporting can satisfy the
  security route only after it is enabled and the repository policy link
  resolves. Conduct reporting requires an owner-provided private maintainer or
  organization route. Do not document an email address, domain, or other contact
  route until the owner provides it.

The helper scripts can configure teams, repository metadata, vulnerability
endpoints, and optional Pages setup after transfer. They do not replace these
manual organization-owner controls.

## Pages Plan Check

GitHub Pages is available for public repositories on GitHub Free, including Free
organizations. Pages for private repositories requires a plan that supports
private repository Pages.

The included workflow always builds the VitePress site. The deploy job is gated
so it runs only outside pull requests and only when the repository is public:

```yaml
if: ${{ github.event_name != 'pull_request' && github.event.repository.private == false }}
```

For the default OSS launch path, keep `llmwiki-docs` private while preparing the
content, then make it public when the project is ready to publish the site.

## Transfer Repositories

Preview the transfer:

```sh
npm run transfer:dry-run -- --source-owner=<current-owner>
# or, for a non-default organization:
npm run transfer:dry-run -- --source-owner=<current-owner> --target-org=<org>
```

Apply only after the organization exists and the owner has confirmed the target
plan. The apply helper requires each sibling checkout to be on `main`, clean,
and pushed so the transferred private repositories start from the same commit
state that was validated locally:

```sh
npm run transfer:apply -- --source-owner=<current-owner>
# or:
npm run transfer:apply -- --source-owner=<current-owner> --target-org=<org>
```

The transfer helper checks organization access, verifies source and target repo
state, rejects public source or target repositories during initial staging,
rejects distinct same-name target repositories, and updates sibling clone
fetch and push remotes after the target repositories are confirmed. Apply mode
also requires local fetch and push remotes to point at the declared
`--source-owner` before it submits transfer requests, so a stale checkout cannot
silently transfer or retarget the wrong repository.

If a transfer is done manually in the GitHub UI, update local remotes:

```sh
git -C ../llmwiki-serve remote set-url origin https://github.com/knowledge-bridge-labs/llmwiki-serve.git
git -C ../llmwiki-serve remote set-url --push origin https://github.com/knowledge-bridge-labs/llmwiki-serve.git
git -C ../llmwiki-agent-bridge remote set-url origin https://github.com/knowledge-bridge-labs/llmwiki-agent-bridge.git
git -C ../llmwiki-agent-bridge remote set-url --push origin https://github.com/knowledge-bridge-labs/llmwiki-agent-bridge.git
git -C ../llmwiki-chat remote set-url origin https://github.com/knowledge-bridge-labs/llmwiki-chat.git
git -C ../llmwiki-chat remote set-url --push origin https://github.com/knowledge-bridge-labs/llmwiki-chat.git
git -C ../llmwiki-docs remote set-url origin https://github.com/knowledge-bridge-labs/llmwiki-docs.git
git -C ../llmwiki-docs remote set-url --push origin https://github.com/knowledge-bridge-labs/llmwiki-docs.git
```

Confirm both fetch and push URLs afterwards:

```sh
git -C ../llmwiki-serve remote -v
git -C ../llmwiki-agent-bridge remote -v
git -C ../llmwiki-chat remote -v
git -C ../llmwiki-docs remote -v
```

## Partial Transfer Recovery

If a transfer partially succeeds, stop and keep every repository private. Do
not change visibility, enable Pages, create release tags, or publish packages
until the transferred and untransferred repositories are reconciled.

Capture evidence before retrying:

- `npm run transfer:dry-run -- --source-owner=<current-owner>` output
- `npm run transfer:apply -- --source-owner=<current-owner>` output
- `gh repo view <source-owner>/<repo> --json id,nameWithOwner,isPrivate,url`
- `gh repo view <target-org>/<repo> --json id,nameWithOwner,isPrivate,url`
- `git -C ../<repo> remote -v`
- `git -C ../<repo> status -sb`
- `npm run transfer:verify` output
- `npm run release:preflight:private-staging` output
- registry availability output showing PyPI `404` and npm `E404`

Rerun `transfer:dry-run` after collecting that state. Update local fetch and
push remotes only for repositories that GitHub confirms have moved to the
target organization. Then run `npm run transfer:verify` and
`npm run release:preflight:private-staging` before continuing.

## Configure The Organization

Preview organization settings:

```sh
npm run org:configure:dry-run
# or:
npm run org:configure:dry-run -- --target-org=<org>
```

Apply organization settings:

```sh
npm run org:configure:apply
# or:
npm run org:configure:apply -- --target-org=<org>
```

The helper prepares:

- `maintainers`, `security`, and `conduct` teams
- repository descriptions, homepage URLs, Issues, and delete-branch-on-merge
- `maintainers` team access
- vulnerability alert endpoints where available
- private vulnerability reporting where available

The helper does not publish or validate a human contact route. Before public
visibility, the release owner must confirm that `SECURITY.md` and
`CODE_OF_CONDUCT.md` route sensitive reports to monitored private channels. If
GitHub private vulnerability reporting is unavailable, update the security
policy and issue-template contact links to an owner-provided private route
before making the repositories public. For conduct reports, team creation alone
is not enough; publish an owner-provided private maintainer or organization
route first.

Add people to the teams manually. `CODEOWNERS` entries only work when GitHub can
resolve the referenced team and that team has explicit repository access.
Keep the repositories private until the release owner deliberately switches the
public-facing repositories or Pages site to public visibility.

After the `maintainers` team exists and has repository access, install
CODEOWNERS files into the sibling checkouts:

```sh
npm run codeowners:dry-run
npm run codeowners:apply
# or for a non-default organization:
npm run codeowners:dry-run -- --target-org=<org>
npm run codeowners:apply -- --target-org=<org>
```

The apply command writes `.github/CODEOWNERS` in each repository with the
resolved `@knowledge-bridge-labs/maintainers` team. Commit and push those
resulting repository changes before accepting external pull requests. Apply
mode requires each sibling checkout to be on clean `main` so CODEOWNERS updates
are not mixed with unrelated work.

Pages creation is skipped by default while repositories are private. Only run
the explicit Pages helper after the release owner approves Pages or
public-launch setup and after `llmwiki-docs` has been made public:

```sh
npm run org:configure:pages:dry-run
npm run org:configure:pages:apply
```

## Public Visibility Change

Changing repository visibility is the release owner's public-launch decision.
Do it only after private staging gates pass, launch-copy updates have removed
private-staging current-state wording, and the owner accepts that source,
issues, pull requests, Actions history, and repository metadata become public.

Manual contact-route gate: do not run `visibility:public:apply` or
`public:launch:apply` until the release owner has provided or confirmed private
security and conduct reporting routes. If either route is missing, keep the
repositories private and record the missing owner-provided route as unresolved
external input.

## Public Launch Copy Flip

Before changing visibility, update the public-facing copy from private
preparation language to public-unpublished language:

- repository README files should no longer say that the repository is private
  or that public links are expected to be unavailable
- docs home, quickstart, FAQ, troubleshooting, community, and status pages
  should describe public repositories and live Pages as the expected state
- [Release Status & Compatibility](/status) should mark `public unpublished`
  as the current phase and describe `llmwiki-docs` Pages as live for public
  preview instead of planned or unavailable
- [CLI Reference](/cli-reference) should describe `llmwiki-docs` Pages as live
  for public preview; package publication remains not applicable for the docs
  portal
- package sections should describe package-manager installs as available once
  package upload and install-smoke verification complete
- maintainer-only runbooks may still document private staging as a historical
  or repeatable phase, but not as the current state for public users

Check the copy through the public preflight before and after the update:

```sh
npm run launch-copy:check:public-unpublished
npm run release:preflight:public-unpublished
```

The launch-copy check is local-only. It should pass before visibility changes
because it does not require public repositories, GitHub Pages, branch policy, or
registry state.

Before visibility changes, this command should still fail on repository
visibility and Pages. It should no longer fail on public launch copy after the
copy flip has been committed and pushed.

Preview the exact repository visibility commands:

```sh
npm run visibility:public:dry-run
```

Apply only after approval:

```sh
npm run visibility:public:apply -- --confirm-private-report-routes
```

The helper requires each sibling checkout to be on clean `main`, pushed to
`origin/main`, and pointing at the target organization before it calls
`gh repo edit <org>/<repo> --visibility public`. It passes GitHub CLI's
required `--accept-visibility-change-consequences` flag only in apply mode.
It does not enable Pages, branch protection, package publication, or release
tags.

## Pages Publishing

Use GitHub Actions as the Pages source. The `pages.yml` workflow builds on every
push and pull request, but its deploy job runs only after the repository is
public. During deployment it calls `actions/configure-pages` with
`enablement: true`; the explicit `org:configure:pages:*` helper is an operator
preview/apply path for checking or enabling the same public-launch setting
before relying on the workflow.

With the current workflow, Pages deployment runs only after the docs repository
is public. Even if a GitHub plan supports private repository Pages, this
workflow intentionally skips deploys while `github.event.repository.private` is
`true`. After the docs repo is public, push to `main` or run the workflow
manually. If Pages does not initialize from the workflow, confirm the repository
setting manually:

```txt
Repository Settings -> Pages -> Source -> GitHub Actions
```

Verify:

```sh
gh api repos/knowledge-bridge-labs/llmwiki-docs/pages --jq '{build_type:.build_type,status:.status,html_url:.html_url}'
gh run list -R knowledge-bridge-labs/llmwiki-docs -w pages.yml -L 5
npm run pages:publish:dispatch
# or, when a pages.yml run already exists:
npm run pages:publish:wait
```

The `pages:publish:*` helpers watch the latest `pages.yml` run on `main` and
poll the rendered Pages URL until it returns a 2xx response. Use this before
running `release:preflight:public-unpublished`.

## Branch Protection

Branch protection remains an org-owner control, but the release helper can
prepare the default public-launch policy once the repositories are public.
Protected branches are available for public repositories on GitHub Free. Private
repository support depends on the organization plan, so the default helper
refuses to apply public-launch policy while a repository is still private.

Minimum `main` policy before accepting external pull requests:

- require pull requests before merging
- require status checks after the first workflow run exists
- require conversation resolution
- require code owner review after the maintainer team resolves
- block force pushes and branch deletion

Expected required status checks:

| Repository | Private org staging | Public launch |
| --- | --- | --- |
| `llmwiki-serve` | `test (3.11)`, `test (3.12)` | Private checks plus `analyze python`, `dependency review` |
| `llmwiki-agent-bridge` | `lint, contracts, tests, pack, audit` | Private checks plus `codeql`, `dependency review` |
| `llmwiki-chat` | `lint, typecheck, tests, build, pack, audit` | Private checks plus `analyze javascript-typescript`, `dependency review` |
| `llmwiki-docs` | `build` | Private checks plus `analyze javascript-typescript`, `dependency review` |

The verification scripts check these names against branch protection or active
repository rulesets. Dependency review workflows run on every pull request so
they can safely be made required public-launch checks.

Preview the policy payload:

```sh
npm run branch-policy:dry-run
```

After the release owner has made the repositories public and the first public
workflow run has created the status check names, apply the policy:

```sh
npm run branch-policy:apply
```

The helper sets strict required checks, one approving review, code owner review,
stale-review dismissal, latest-push approval, conversation resolution, admin
enforcement, and force-push/deletion blocks on `main`. It does not create
rulesets and it does not delete existing branches. If the organization has a
paid plan that supports protected private repositories and the owner wants to
configure policy before public visibility, pass `--allow-private-plan` after
the npm argument separator:

```sh
npm run branch-policy:apply -- --allow-private-plan
```

## Final Verification

Run:

```sh
npm run transfer:verify
npm run check
npm run release:preflight:private-staging
```

The transfer verifier checks organization/repository access, private visibility,
default branch, repository metadata, local remotes, stale owner links, workflow visibility,
team access, vulnerability alerts, private vulnerability reporting endpoints,
and warns when GitHub security features are unavailable or not enabled. It treats
missing Pages configuration as expected during private staging and warns if a
Pages site is already configured before public launch. It reports
whether each repository has branch protection or an active ruleset for `main`;
treat a missing branch policy warning as a launch checklist item before
accepting external pull requests. The private-staging preflight adds package
artifact checks, registry-name availability checks, private repository
visibility checks, and an explicit expectation that the Pages URL is still
missing. Use `npm run release:preflight:private-staging:branch-policy` when the
release owner wants branch policy gaps to block private staging instead of
remaining warnings.

After the release owner intentionally switches the public-facing repositories
and Pages site to public visibility, run the visibility, Pages, and branch
policy helpers. Pages setup requires the explicit public-launch flag through the
package script so Pages setup cannot hide accidental public repository
visibility:

```sh
npm run public:launch:dry-run
npm run public:launch:apply -- --accept-public-launch --confirm-public-launch=knowledge-bridge-labs --confirm-private-report-routes
```

The combined apply command runs launch-copy verification, private-staging
preflight, public visibility changes, Pages setup and deployment wait, branch
protection, public transfer verification, and
`release:preflight:public-unpublished`. To run the steps manually instead, use:

```sh
npm run visibility:public:dry-run
npm run visibility:public:apply -- --confirm-private-report-routes
npm run org:configure:pages:dry-run
npm run org:configure:pages:apply
npm run pages:publish:dispatch
npm run branch-policy:dry-run
npm run branch-policy:apply
npm run transfer:verify:public
npm run release:preflight:public-unpublished
```

Those public-launch checks require public repository visibility and a reachable
Pages URL while still expecting PyPI/npm package names to be unpublished. These
checks still do not prove plan eligibility, team membership, or monitored
security/conduct contact routes; confirm those manually in the GitHub UI and
owner-maintained contact surfaces.

For a non-default target organization, pass `--target-org=<org>` to the
transfer and verification commands, or set `LLMWIKI_TARGET_ORG=<org>` for the
same effect:

```sh
npm run release:preflight:private-staging -- --target-org=<org>
npm run release:preflight:public-unpublished -- --target-org=<org>
```
