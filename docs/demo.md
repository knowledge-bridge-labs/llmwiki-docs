<script setup>
import { withBase } from 'vitepress'
</script>

# Demo

This first-run demo shows the ownership boundary in one minute: an upstream
workflow creates Markdown, `llmwiki-serve` projects that folder into read-only
APIs, and agents, bridge, or chat consume the served Knowledge Source.

<div class="demo-video-panel">
  <video
    controls
    muted
    playsinline
    preload="metadata"
    :poster="withBase('/demo/first-run/first-run-poster.png')"
  >
    <source :src="withBase('/demo/first-run/first-run.webm')" type="video/webm" />
    <track
      :src="withBase('/demo/first-run/first-run.vtt')"
      kind="captions"
      srclang="en"
      label="English"
      default
    />
    Download the demo video from
    <a :href="withBase('/demo/first-run/first-run.webm')">first-run.webm</a>.
  </video>
</div>

The demo intentionally uses a placeholder upstream command. The public OSS
components in this organization do not ingest raw documents or run a compiler.
They start after compatible Markdown or wiki files already exist.

## What The Demo Shows

| Stage | Owner | What happens |
| --- | --- | --- |
| Raw material | Your team workflow | Notes, docs, tickets, PDFs, and exports remain outside the serving layer. |
| Markdown wiki creation | Your upstream compiler, authoring tool, script, or CI job | Compatible Markdown pages, links, tags, frontmatter, source references, and optional graph sidecars are written. |
| Read-only projection | `llmwiki-serve` | The folder is parsed into `/manifest`, `/source-bundle`, `/query`, `/search`, `/read`, `/graph`, and MCP tools. |
| Direct agent use | Codex, Claude Code, Copilot-style agents, IDEs, scripts, or host apps | The host retrieves evidence and owns planning, prompting, synthesis, and final UX. |
| Optional orchestration | `llmwiki-agent-bridge` | Selected sources can be queried together and optionally passed to a runtime for a normalized result artifact. |
| Optional inspection | `llmwiki-chat` | A browser workbench can test the source, inspect pages and graph context, and review citations and traces. |

For the text version of this flow, read [Data Flow](/data-flow). For the
hands-on path, start with [Quickstart](/quickstart).

## Regenerate The Demo

The committed media is generated from source:

```sh
npm run demo:first-run
```

The script uses local Chrome or Chromium plus `ffmpeg`. Set `CHROME_PATH` if the
browser is not installed in a standard location.
