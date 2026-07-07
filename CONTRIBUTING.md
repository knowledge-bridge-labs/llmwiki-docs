# Contributing

Thanks for improving the LLM Wiki Toolchain Docs. Keep changes focused and make
the affected workflow clear in the pull request.

## Local Checks

```sh
npm ci
npm run check
```

The docs site builds with VitePress from `docs`. The workflow always runs build
checks. Pages deployment starts after the repository is public or hosted in an
organization plan that supports GitHub Pages.

## Pull Requests

- Keep documentation changes scoped to one workflow or topic.
- Prefer links to repo-local README, release, support, and security files over
  copying entire sections.
- Use conservative protocol wording: MCP-style and A2A-style unless certified
  conformance is explicitly documented.
- Do not add real credentials, private URLs, raw logs, screenshots, or private
  wiki content.
- Run `npm run check` and mention any skipped validation.
- For cross-repo quickstart, release posture, protocol, public-launch, or
  agent-assisted work, link a plan under `docs/dev/plans/` or explain why the
  change is too small to need one.
- Include exact checks run, expected failures, skipped validations, and affected
  repositories/modules in the pull request.
- If subagents or generated patches contributed materially, summarize their
  scope and the maintainer verification that reviewed the result.

## Style

- Write for a user trying to complete a concrete setup or integration task.
- Keep examples local-first by default.
- Explain trust boundaries when network exposure, runtimes, tokens, or private
  sources are involved.
