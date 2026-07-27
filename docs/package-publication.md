# Package Publication

Use this runbook when a maintainer is preparing a future package release or
verifying the current public-preview package baseline. The current public
package baseline is published:

| Package | Published baseline | Registry | Publication evidence |
| --- | --- | --- | --- |
| `llmwiki-serve` | `0.2.2` | PyPI | Public registry version check |
| `llmwiki-bridge-start` | `0.0.2` | npm | Trusted Publisher/OIDC verified via workflow_dispatch on 2026-07-27 |
| `llmwiki-agent-bridge` | `0.2.1` | npm | Public registry version check |
| `llmwiki-chat` | `0.1.6` | npm | Trusted Publisher/OIDC verified via workflow_dispatch on 2026-07-27 |

Source checkouts remain supported for development, bundled fixtures, and
release verification. Public-unpublished gates that expected PyPI `404` or npm
`E404` were pre-first-release checks; they are historical for this baseline.

Package publication is intentionally a maintainer-owner gate. Do not publish
from ad hoc local credentials, CI secrets, or generated tokens that are not part
of an approved release process.

## Current Registry Checks

For the current baseline, verify that the public registries return the
published versions:

```sh
npm view llmwiki-chat version --json
npm view llmwiki-bridge-start version --json
npm view llmwiki-agent-bridge version --json
```

```sh
python - <<'PY'
import json
import urllib.error
import urllib.request

for name in ["llmwiki-serve"]:
    try:
        with urllib.request.urlopen(f"https://pypi.org/pypi/{name}/json", timeout=10) as response:
            print(name, response.status, json.load(response)["info"].get("version"))
    except urllib.error.HTTPError as error:
        print(name, error.code)
PY
```

PowerShell equivalent:

```powershell
try {
  $response = Invoke-RestMethod -Uri "https://pypi.org/pypi/llmwiki-serve/json" -TimeoutSec 10
  "llmwiki-serve $($response.info.version)"
} catch {
  $status = $_.Exception.Response.StatusCode.value__
  "llmwiki-serve $status"
}
```

These checks should report `llmwiki-serve` `0.2.2`,
`llmwiki-bridge-start` `0.0.2`, `llmwiki-agent-bridge` `0.2.1`, and
`llmwiki-chat` `0.1.6`. A PyPI HTTP `404` or npm `E404` is no longer a
successful current-state result for these packages; it means the package is
unavailable from that registry view or the query failed.

The initial bridge-start release was manually first-published and remains
historical first-publish evidence only. `llmwiki-bridge-start@0.0.2` is the
current first-run package baseline and was verified through npm Trusted
Publisher/OIDC via GitHub Actions workflow_dispatch on 2026-07-27.
`llmwiki-chat@0.1.6` was verified through the same Trusted Publisher/OIDC path
on 2026-07-27.

Before publishing a future version, also verify that the target GitHub
organization, repository URLs, Pages URL, and current package baseline resolve
publicly:

```sh
npm run release:preflight:published
gh repo view knowledge-bridge-labs/llmwiki-serve
gh repo view knowledge-bridge-labs/llmwiki-agent-bridge
gh repo view knowledge-bridge-labs/llmwiki-chat
gh repo view knowledge-bridge-labs/llmwiki-docs
curl -I https://knowledge-bridge-labs.github.io/llmwiki-docs/
```

If the release owner chose a different target organization, run the preflight
with `LLMWIKI_TARGET_ORG=<org>` and replace the `gh repo view` and Pages URL
checks with that organization name.

For a local copy-only check of the published baseline, use:

```sh
npm run launch-copy:check:published
npm run release:preflight:published
```

Those modes fail if the expected packages are missing from PyPI/npm and warn or
block on published-version drift according to strict preflight mode.

## Historical Pre-First-Release Checks

Before the first package upload, private staging and public-unpublished gates
intentionally expected missing packages:

```sh
npm run release:preflight:private-staging
npm run release:preflight:public-unpublished
```

In that historical phase, npm `E404` or PyPI HTTP `404` meant the package name
was not yet published from that registry view. Use those modes only when
rehearsing a brand-new organization or package namespace before any package has
ever been uploaded. They are not the current validation gates for the published
`llmwiki-*` baseline.

## Shared Release Order

1. Confirm `npm run launch-copy:check:published` and
   `npm run release:preflight:published` pass from clean sibling checkouts.
2. Confirm the GitHub organization, teams, public repository visibility, branch
   protection, vulnerability reporting, Pages settings, and current package
   ownership are configured.
3. Run every repository's documented local and CI gate.
4. Confirm third-party notices retain the license text, copyright notices, and
   attribution files required by redistributed source, wheel, npm, browser, and
   Pages artifacts.
5. Update `CHANGELOG.md` and [Release Status & Compatibility](/status) with the
   intended release version, current registry state, protocol caveats, and
   validation commands. Public-facing docs should keep the already published
   baseline clear while any future version is still pending upload.
6. Build artifacts from a clean checkout.
7. Publish only through an owner-approved registry account or trusted publishing
   path.
8. Create tags only after package artifacts and repository SHAs are final.
9. Verify package install from the public registry in a clean directory.

## `llmwiki-serve` PyPI Gate

Run from the `llmwiki-serve` repository:

```sh
uv run ruff format --check .
uv run ruff check .
uv run mypy src
PYTHONDONTWRITEBYTECODE=1 uv run pytest -p no:cacheprovider
uv build
uv run python scripts/release_smoke.py --wheel dist/*.whl --sdist dist/*.tar.gz
```

The GitHub Actions CI gate also runs `uv sync --extra dev --locked`, Python
3.11 and 3.12 matrix jobs, and release smoke with `--allow-network-install`.
The local publication gate above is intentionally stricter about bytecode and
cache output so the release owner can inspect a clean artifact set.

Before uploading:

- Confirm `pyproject.toml` project URLs point to the final organization.
- Confirm `README.md`, `LICENSE`, `SECURITY.md`, `SUPPORT.md`,
  `THIRD_PARTY_NOTICES.md`, and `docs/` are included in the source
  distribution.
- Prefer PyPI trusted publishing from GitHub Actions once the organization and
  repository ownership are stable.
- Keep PyPI tokens out of commits, logs, shell history, and CI variables unless
  a maintainer has explicitly approved that fallback.

After publishing, verify:

```sh
uv tool install llmwiki-serve
llmwiki-serve --help
```

## `llmwiki-bridge-start` npm Gate

Run from the `llmwiki-bridge-start` repository:

```sh
npm ci
npm run check
npm audit --audit-level=moderate
```

Before publishing a future version:

- Confirm the npm tarball contains the CLI entrypoint, source files, public
  release metadata, retained license artifacts, and governance files only.
- Confirm examples and docs use generic private-runtime placeholders such as
  `OpenAI-compatible local endpoint`, `http://127.0.0.1:8642/v1`,
  `local-model`, and `runtimeProfile=generic|hermes|deepagents`.
- Confirm no private endpoints, concrete private model names, local vault
  content, generated logs, credentials, or OTP material are included.
- Keep npm Trusted Publisher/OIDC configured. The `0.0.2` baseline verified
  this path via workflow_dispatch on 2026-07-27; the manually published initial
  release remains historical first-publish evidence only.

After publishing a future version, verify from a clean directory:

```sh
npm exec --package llmwiki-bridge-start@<version> -- llmwiki-bridge-start --help
```

## `llmwiki-agent-bridge` npm Gate

Run from the `llmwiki-agent-bridge` repository:

```sh
npm ci
npm run check
npm run audit
```

Before publishing:

- Confirm the npm tarball contains `bin/`, `src/`, `docs/`, `integrations/`, and
  public release metadata only.
- Confirm `CHANGELOG.md` no longer marks the published version as pending.
- Keep npm Trusted Publisher/OIDC configured for future owner-approved releases
  where available. The current `0.2.1` baseline was confirmed by public npm
  registry version check.
- Keep npm tokens out of commits, logs, shell history, and CI variables unless a
  maintainer has explicitly approved that fallback.

After publishing, verify from a clean directory:

```sh
mkdir llmwiki-agent-bridge-install-smoke
cd llmwiki-agent-bridge-install-smoke
npm init -y
npm install llmwiki-agent-bridge@<version>
node -e "import('llmwiki-agent-bridge').then((m) => { if (typeof m.startAgentBridge !== 'function') process.exit(1); console.log('llmwiki-agent-bridge export ok') })"
```

## `llmwiki-chat` npm Gate

Run from the `llmwiki-chat` repository:

```sh
npm ci
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run test:e2e:live -- --project=desktop
npm run test:e2e:a2a-runtime
npm run build
npm run pack:dry-run
npm audit --audit-level=moderate
```

Before publishing:

- Confirm the npm tarball contains the freshly rebuilt `dist/`, public docs,
  package metadata, retained license artifacts, and governance files only.
- Confirm it does not include bridge binaries or embedded bridge implementation
  scripts; runtime bridge workflows belong to `llmwiki-agent-bridge`.
- Confirm `node --check scripts/run-live-serve-e2e.mjs` passes before relying on
  `npm run test:e2e:live`; the live command provisions two sibling
  `llmwiki-serve` sample endpoints by default and must pass all 4 desktop
  tests, including two-source provenance.
- Confirm external URL-list mode with
  `LLMWIKI_LIVE_SERVE_URLS=http://127.0.0.1:1,http://127.0.0.1:2 npm run test:e2e:live -- --list --project=desktop`;
  `--list` should not start local sample servers.
- Confirm no Playwright traces, local artifacts, credentials, private URLs, or
  screenshots with private infrastructure are included.
- Keep npm Trusted Publisher/OIDC configured. The `0.1.6` baseline verified
  this path via workflow_dispatch on 2026-07-27.

After publishing, verify from a clean directory:

```sh
mkdir llmwiki-chat-install-smoke
cd llmwiki-chat-install-smoke
npm init -y
npm install llmwiki-chat@<version>
node -e "const fs = require('node:fs'); const root = require.resolve('llmwiki-chat/package.json').replace('package.json', ''); const pkg = require('llmwiki-chat/package.json'); if (pkg.bin) process.exit(1); if (!fs.existsSync(root + 'dist/index.html')) process.exit(1); if (!fs.existsSync(root + 'dist/THIRD_PARTY_LICENSES.md')) process.exit(1); console.log('llmwiki-chat package metadata and dist ok')"
```

## Do Not Publish Yet If

- The target GitHub organization or maintainer teams are not configured.
- The package name has been claimed by someone else.
- CI is failing or local release gates were not run.
- The release requires private endpoints, local vault content, or non-redacted
  logs to reproduce.
- The status matrix has not been intentionally prepared for this release, or it
  no longer matches the current registry state.
- The current published baseline cannot be verified with
  `npm run release:preflight:published`.
