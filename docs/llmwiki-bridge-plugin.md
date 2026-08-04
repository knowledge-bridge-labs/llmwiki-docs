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
not an npm or PyPI install.

Run these as slash commands inside an active Claude Code session:

```text
/plugin marketplace add knowledge-bridge-labs/llmwiki-plugins
/plugin install llmwiki-bridge@knowledge-bridge-labs
```

Claude `/plugin install` opens the plugin details and asks you to choose the
install scope.

If the Claude Code session was already running when you installed the plugin,
reload plugins before use:

```text
/reload-plugins
```

A newly started Claude Code session can use the plugin after install without a
`/reload-plugins` step.

Shell CLI alternative:

```sh
claude plugin marketplace add knowledge-bridge-labs/llmwiki-plugins --scope user
claude plugin install llmwiki-bridge@knowledge-bridge-labs --scope user
```

To update the marketplace snapshot and installed plugin from an active Claude
Code session:

```text
/plugin marketplace update knowledge-bridge-labs
/plugin update llmwiki-bridge@knowledge-bridge-labs
/reload-plugins
```

Shell CLI alternatives:

```sh
claude plugin marketplace update knowledge-bridge-labs
claude plugin update llmwiki-bridge@knowledge-bridge-labs --scope user
```

After a shell update, reload any already-running Claude Code session with
`/reload-plugins`; a freshly started session loads the updated plugin.

## Install In Codex

Install from the public GitHub repository-backed plugin marketplace. This is
not an npm or PyPI install. The CLI must expose `codex plugin`. This flow was
verified with Codex CLI `0.146.0`.

```sh
codex plugin marketplace add knowledge-bridge-labs/llmwiki-plugins --ref main
codex plugin add llmwiki-bridge@knowledge-bridge-labs
```

After adding the marketplace, `/plugins` inside Codex CLI is the interactive
alternative for browsing and installing the plugin.

Start a new Codex CLI session or chat after installation so the skills load.

To update the marketplace snapshot:

```sh
codex plugin marketplace upgrade knowledge-bridge-labs
```

Then start a new Codex CLI session or chat. This Codex flow has no
`codex plugin update` command and no `/reload-plugins` step.

## Official Installation References

Claude Code:

- [Discover and install prebuilt plugins](https://code.claude.com/docs/en/discover-plugins)
- [Plugins reference](https://code.claude.com/docs/en/plugins-reference)
- [Create and distribute a plugin marketplace](https://code.claude.com/docs/en/plugin-marketplaces)
- [Create plugins](https://code.claude.com/docs/en/plugins)

OpenAI and Codex:

- [Plugin directory in Codex CLI](https://learn.chatgpt.com/docs/plugins#plugin-directory-in-codex-cli)
- [`codex plugin`](https://learn.chatgpt.com/docs/developer-commands?surface=cli#codex-plugin)
- [`codex plugin marketplace`](https://learn.chatgpt.com/docs/developer-commands?surface=cli#codex-plugin-marketplace)
- [Add a marketplace from the CLI](https://developers.openai.com/plugins/build/plugins#add-a-marketplace-from-the-cli)

## Start Using The Plugin

Use natural-language prompts to start the plugin-guided workflows:

```text
Set up llmwiki-bridge for ./wiki using the direct local source path.
Check llmwiki-bridge status for this workspace, but do not start processes.
Run a read-only llmwiki-bridge doctor check and explain any blockers.
```

Claude Code supports documented namespaced commands
`/llmwiki-bridge:setup`, `/llmwiki-bridge:status`, and
`/llmwiki-bridge:doctor` after installation, reload, or a new session. Codex
should start a new session after installation or update, then use
natural-language prompts or explicitly name the installed skill.

## Skill Usage

The plugin ID is `llmwiki-bridge`. Version `0.1.1` includes three skills:

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

Release `llmwiki-bridge v0.1.1` was published on
`2026-08-03T17:03:25Z`. The release asset is
`llmwiki-bridge-0.1.1-codex-skills.zip`.

Windows x64 and Ubuntu 24.04 ARM64/DGX Spark marketplace install and
plugin-skill validation were verified for v0.1.0. v0.1.1 is an OpenAI
directory metadata/test documentation patch; runtime and skill behavior are
identical to v0.1.0. This is validation of the
marketplace install path and plugin skills, not vendor certification, hosted
runtime certification, or model answer quality evidence.

## Links

| Resource | Link |
| --- | --- |
| Plugin repository | [knowledge-bridge-labs/llmwiki-plugins](https://github.com/knowledge-bridge-labs/llmwiki-plugins) |
| v0.1.1 release | [llmwiki-bridge v0.1.1](https://github.com/knowledge-bridge-labs/llmwiki-plugins/releases/tag/v0.1.1) |
| Privacy | [PRIVACY.md](https://github.com/knowledge-bridge-labs/llmwiki-plugins/blob/main/PRIVACY.md) |
| Terms | [TERMS.md](https://github.com/knowledge-bridge-labs/llmwiki-plugins/blob/main/TERMS.md) |
