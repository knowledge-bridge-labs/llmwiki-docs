# Package Publication

Use this runbook only after the repositories have moved to the target GitHub
organization and the release owner has approved the first public preview.

Package publication is intentionally a maintainer-owner gate. Do not publish
from ad hoc local credentials, CI secrets, or generated tokens that are not part
of an approved release process.

## Current Registry Checks

Before publishing, verify that the package names are still available or owned by
the project:

```sh
npm view llmwiki-chat version --json
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

An HTTP 404 or npm E404 means the package name is not currently published from
that registry view. Re-check immediately before release because registry state
can change.

Before publishing, also verify that the target GitHub organization, repository
URLs, and Pages URL resolve publicly:

```sh
npm run release:preflight:public-unpublished
gh repo view knowledge-bridge-labs/llmwiki-serve
gh repo view knowledge-bridge-labs/llmwiki-agent-bridge
gh repo view knowledge-bridge-labs/llmwiki-chat
gh repo view knowledge-bridge-labs/llmwiki-docs
curl -I https://knowledge-bridge-labs.github.io/llmwiki-docs/
```

If the release owner chose a different target organization, run the preflight
with `LLMWIKI_TARGET_ORG=<org>` and replace the `gh repo view` and Pages URL
checks with that organization name.

During private staging, the expected registry result is still npm `E404` or
PyPI HTTP `404`; use `npm run release:preflight:private-staging` only after the
target organization exists and the transferred private repositories are
accessible to the authenticated GitHub CLI user. That mode requires the target
repositories to exist and remain private, and it expects the public Pages URL to
remain missing. Private collaborator access belongs to this private-staging
gate, not to package publication. Target organization, repository, and Pages
URLs must not fail for the public preview release gate.

After the first packages are published, use:

```sh
npm run release:preflight:published
```

That mode fails if the expected packages are still missing from PyPI/npm and
warns or blocks on published-version drift according to strict preflight mode.

## Shared Release Order

1. Confirm `npm run release:preflight:public-unpublished` passes from clean
   sibling checkouts. Do not publish packages while this gate is failing.
2. Confirm the GitHub organization, teams, public repository visibility, branch
   protection, vulnerability reporting, and Pages settings are configured.
3. Run every repository's documented local and CI gate.
4. Confirm third-party notices retain the license text, copyright notices, and
   attribution files required by redistributed source, wheel, npm, browser, and
   Pages artifacts.
5. Update `CHANGELOG.md` and [Release Status & Compatibility](/status) with the
   intended release version, current registry state, protocol caveats, and
   validation commands. In the public-unpublished phase, the matrix should still
   accurately mark registry publication as pending until upload and install
   verification finish.
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
- Prefer npm provenance or trusted publishing once the organization and
  repository ownership are stable.
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
- Prefer npm provenance or trusted publishing once the organization and
  repository ownership are stable.

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
