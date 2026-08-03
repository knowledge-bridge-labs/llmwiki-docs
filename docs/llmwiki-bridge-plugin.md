# LLMWiki Bridge Plugin

The LLMWiki Bridge Plugin (`llmwiki-bridge`) is a skills-only onboarding plugin
for Claude Code and Codex. It gives agent-guided setup, status, and doctor
checks for connecting an existing LLMWiki, Markdown, or Obsidian folder as a
local Knowledge Source.

The default path is still direct `llmwiki-serve`: serve one source on loopback,
verify `/health`, `/manifest`, `/source-bundle`, `/source-refs`, and `/query`,
then let your coding agent retrieve evidence directly. Use the plugin when you
want Claude Code or Codex to walk through that setup with explicit approvals.

The Agent Bridge remains optional. Add `llmwiki-agent-bridge` only when one
companion endpoint should fan out across selected sources or return a
runtime-backed cited artifact.

## Use It When

- You use Claude Code or Codex and want guided setup for a local wiki folder.
- You want a skills workflow that asks before package installation, process
  start, client config writes, broad discovery, or remote probing.
- You want quick status and readiness checks without memorizing every source,
  bridge, or client command.
- You are connecting one direct source first, then deciding later whether the
  optional Agent Bridge is useful.

## Do Not Use It When

- You only need the shortest direct path from [QuickStart](/quickstart).
- You are looking for an npm package, PyPI package, importable module, CLI
  executable, `lb` alias, MCP server, background service, model runtime,
  crawler, compiler, or source authoring tool.
- You need vendor-certified MCP, A2A, Claude Code, Codex, IDE, runtime, or
  model-answer quality claims.
- You cannot approve the network and privacy posture for the source you are
  about to probe.

## Install In Claude Code

Install from the public GitHub repository-backed plugin marketplace. This is
not an npm or PyPI install:

```text
/plugin marketplace add knowledge-bridge-labs/llmwiki-plugins
/plugin install llmwiki-bridge@knowledge-bridge-labs
/reload-plugins
/llmwiki-bridge:setup
```

Useful follow-up skills:

```text
/llmwiki-bridge:status
/llmwiki-bridge:doctor
```

## Install In Codex

Install from the public GitHub repository-backed plugin marketplace. This is
not an npm or PyPI install:

```sh
codex plugin marketplace add knowledge-bridge-labs/llmwiki-plugins --ref main
codex plugin add llmwiki-bridge@knowledge-bridge-labs
```

Start a new Codex thread after installation so the skills load. Then use
explicit skill prompts:

```text
Use the llmwiki-bridge:setup skill to connect ./wiki.
Use the llmwiki-bridge:status skill and do not start any processes.
Use the llmwiki-bridge:doctor skill for a read-only readiness check.
```

## Skill Usage

The plugin ID is `llmwiki-bridge`. Version `0.1.0` includes three skills:

| Skill | Use | Safety posture |
| --- | --- | --- |
| `setup` | Connect a local source such as `./wiki`, install missing prerequisites only after approval, start loopback services only after approval, and optionally guide client config. | May propose writes or process starts, but asks first. |
| `status` | Inspect current source, bridge, and plugin readiness. | Use with "do not start any processes" when you need inspection only. |
| `doctor` | Run a read-only readiness check and explain blockers. | Does not install packages, start processes, or write config. |

For the direct source default, the target state is still a local server like:

```sh
llmwiki-serve serve ./wiki --host 127.0.0.1 --port 8765
```

After the source is running, a direct agent can use `POST /query`,
`/source-bundle`, `/source-refs`, `/read/{page_id}`, and MCP source tools as
documented in [Direct Agent Integrations](/direct-agent-integrations).

## Safety And Privacy

The released plugin is skills-only. It does not provide an executable, `lb`
alias, MCP server, background service, model runtime, crawler, compiler, or
local command alias. It guides the host agent through existing public tools and
asks before actions that can change local state or reach beyond loopback.

Expected approvals:

- package installation
- process start
- client config writes
- broad local discovery
- remote or non-loopback probing

Keep first-run checks on `127.0.0.1`. For remote or non-loopback sources,
remote probes, search terms, query text, URLs, and source metadata can reach
the remote endpoint operator and its logs. Use HTTPS by default. Use plain HTTP
only on a private or trusted network after explicit approval.

Review the plugin repository's
[Privacy](https://github.com/knowledge-bridge-labs/llmwiki-plugins/blob/main/PRIVACY.md)
and
[Terms](https://github.com/knowledge-bridge-labs/llmwiki-plugins/blob/main/TERMS.md)
before using it with private or team sources.

## Validation Status

Release `llmwiki-bridge v0.1.0` was published on
`2026-08-03T16:28:31Z`. The release asset is
`llmwiki-bridge-0.1.0-codex-skills.zip`.

Windows x64 and Ubuntu 24.04 ARM64/DGX Spark marketplace install and
plugin-skill validation were verified for v0.1.0. This is validation of the
marketplace install path and plugin skills, not vendor certification, hosted
runtime certification, or model answer quality evidence.

## Links

| Resource | Link |
| --- | --- |
| Plugin repository | [knowledge-bridge-labs/llmwiki-plugins](https://github.com/knowledge-bridge-labs/llmwiki-plugins) |
| v0.1.0 release | [llmwiki-bridge v0.1.0](https://github.com/knowledge-bridge-labs/llmwiki-plugins/releases/tag/v0.1.0) |
| Privacy | [PRIVACY.md](https://github.com/knowledge-bridge-labs/llmwiki-plugins/blob/main/PRIVACY.md) |
| Terms | [TERMS.md](https://github.com/knowledge-bridge-labs/llmwiki-plugins/blob/main/TERMS.md) |
