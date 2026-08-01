---
layout: home

hero:
  name: Wiki Knowledge Sources for Agents
  text: Make project wikis readable by coding agents.
  tagline: Run llmwiki-serve beside an existing LLMWiki, Markdown, or Obsidian folder. Agents retrieve project context over HTTP and MCP. Bridge and chat stay optional.
  actions:
    - theme: brand
      text: Serve a folder in 10 minutes
      link: /quickstart
    - theme: alt
      text: Use with coding agents
      link: /direct-agent-integrations
    - theme: alt
      text: Benchmark evidence
      link: /evidence
    - theme: alt
      text: Watch the demo
      link: /demo
---

<script setup>
import { withBase } from 'vitepress'
</script>

<section class="home-demo">
  <div>
    <p class="section-kicker">Conceptual architecture demo</p>
    <h2>See the folder-to-agent flow before you install.</h2>
    <p>
      Upstream workflows create compatible Markdown or wiki files.
      <code>llmwiki-serve</code> projects that folder read-only, and agents,
      bridge, or chat consume the served Knowledge Source.
      The committed media is conceptual until screenshots are regenerated for
      the latest quickstart and logging controls.
    </p>
    <a href="./demo">Open the full demo notes</a>
  </div>
  <div class="home-demo-video">
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
</section>

<div class="intro-feature-grid">
  <a href="./quickstart">
    <strong>Use the folder you already have</strong>
    <span>Keep project knowledge in its current LLMWiki, Markdown, or Obsidian folder. Serve it read-only instead of migrating it into a hosted RAG app.</span>
  </a>
  <a href="./direct-agent-integrations">
    <strong>Let agents pull focused context</strong>
    <span>Coding agents and scripts can query page, search, context, graph, HTTP, and MCP surfaces before planning edits or answering.</span>
  </a>
  <a href="./runtime-adapters">
    <strong>Add orchestration only when needed</strong>
    <span>Use the bridge for multi-source evidence and runtime-backed answers. Use chat to test connections, citations, traces, and graph context.</span>
  </a>
</div>

<section class="purpose-panel" id="what-this-is">
  <div>
    <p class="section-kicker">Public preview for AX and coding-agent workflows</p>
    <h2>Turn scattered project wikis into local Knowledge Sources.</h2>
    <p>
      These components are for teams that already have project knowledge spread across
      LLMWiki, Markdown, or Obsidian folders. Instead of combining everything into
      one large RAG application, run a small source server beside each folder and
      let the coding agent retrieve the context it needs.
    </p>
    <p>
      The default path is intentionally small: serve one folder, verify the
      served view, and connect it to Codex, Claude Code, Copilot-style agents, IDE
      extensions, or scripts. Bridge and chat are optional layers for multi-source
      evidence, runtime delegation, and human inspection.
    </p>
  </div>
  <div class="purpose-card">
    <strong>Use it when you want to...</strong>
    <ul>
      <li>Reuse an existing project wiki without moving the files.</li>
      <li>Give a coding agent project-specific memory on demand.</li>
      <li>Keep evidence, citations, and graph context visible during agent work.</li>
      <li>Connect several wiki folders only when one workflow needs them together.</li>
    </ul>
  </div>
</section>

<div class="preview-panel">
  <div>
    <strong>Minimum useful path</strong>
    <span>Run <code>llmwiki-serve</code> on your own wiki folder or <code>./examples/sample-wiki</code>, then query <code>/query</code>. Stop there if direct retrieval is enough.</span>
  </div>
  <div>
    <strong>Public-preview install</strong>
    <span>Use source checkouts or the published packages: <code>llmwiki-serve==0.2.6</code>, <code>llmwiki-bridge-start@0.0.3</code>, <code>llmwiki-agent-bridge@0.3.0</code>, and <code>llmwiki-chat@0.1.6</code>.</span>
  </div>
  <div>
    <strong>Protocol posture</strong>
    <span>Source access is HTTP/MCP first. A2A source compatibility is opt-in, and bridge runtime surfaces are described as A2A-style and MCP-style compatibility.</span>
  </div>
</div>

## First Run At A Glance

<div class="quickstart-track">
  <a class="quickstart-step" href="./quickstart#start-llmwiki-serve">
    <span>Step 1</span>
    <strong>Start your source</strong>
    <p>Serve an existing wiki folder, or use <code>./examples/sample-wiki</code> for a known-good smoke.</p>
  </a>
  <a class="quickstart-step" href="./quickstart#verify-one-query">
    <span>Step 2</span>
    <strong>Verify served view</strong>
    <p>Call <code>/health</code>, <code>/manifest</code>, and <code>/query</code>. Stop here if direct retrieval is enough.</p>
  </a>
  <a class="quickstart-step" href="./quickstart#optional-bridge-start-handoff">
    <span>Optional</span>
    <strong>Run bridge starter</strong>
    <p>Use <code>llmwiki-bridge-start</code> for guided discovery, source startup, bridge registration, and smoke checks. Connect a runtime only when the bridge should synthesize answers.</p>
  </a>
  <a class="quickstart-step" href="./examples#chat-workbench">
    <span>Optional</span>
    <strong>Open chat</strong>
    <p>Test the source and bridge, ask a question, then inspect citations, graph context, artifacts, and run details.</p>
  </a>
</div>

## Repositories

<div class="repo-grid">
  <a class="repo-card" href="https://github.com/knowledge-bridge-labs/llmwiki-serve">
    <span>Knowledge Source</span>
    <strong>llmwiki-serve</strong>
    <p>Serves one existing LLMWiki, Markdown, or Obsidian folder as read-only HTTP/MCP context, search, page, graph, and manifest APIs.</p>
  </a>
  <a class="repo-card" href="https://github.com/knowledge-bridge-labs/llmwiki-bridge-start">
    <span>First-run entrypoint</span>
    <strong>llmwiki-bridge-start</strong>
    <p>Discovers existing wiki folders, validates startable sources, starts loopback source servers, and optionally registers them with the bridge.</p>
  </a>
  <a class="repo-card" href="https://github.com/knowledge-bridge-labs/llmwiki-agent-bridge">
    <span>Optional coordinator</span>
    <strong>llmwiki-agent-bridge</strong>
    <p>Connects one or more sources, gathers cited evidence, optionally delegates synthesis to a runtime, and returns normalized artifacts.</p>
  </a>
  <a class="repo-card" href="https://github.com/knowledge-bridge-labs/llmwiki-chat">
    <span>Optional workbench</span>
    <strong>llmwiki-chat</strong>
    <p>Lets humans configure sources and bridge runtimes, ask questions, and inspect citations, graph context, artifacts, and traces.</p>
  </a>
</div>

## When To Add Bridge Or Chat

| Need | Recommended path |
| --- | --- |
| One coding agent should read one wiki folder while it works | Run `llmwiki-serve` and connect the agent directly. |
| You want a guided local first run from existing wiki folders | Run `llmwiki-bridge-start` first, then keep the direct source URLs or add the bridge. |
| Several wiki folders must be searched together | Run one `llmwiki-serve` per folder and connect them through `llmwiki-agent-bridge`. |
| A service should gather evidence and call a model runtime for a cited answer | Use `llmwiki-agent-bridge` in delegated-runtime or hybrid mode. |
| A human needs to test setup, inspect evidence, or debug traces | Open `llmwiki-chat` as the browser workbench. |
| You only need package status, release support, or protocol details | Read [Release Status](/status), [Protocols](/protocols), and [API Reference](/api-reference). |

## Module Map

```mermaid
flowchart LR
  wiki["Wiki folder"]
  start["llmwiki-bridge-start"]
  serve["llmwiki-serve"]
  agent["Host agent"]
  bridge["Agent bridge"]
  runtime["Runtime"]
  chat["llmwiki-chat"]

  wiki -->|discover/start| start
  start -->|project| serve
  start -->|optional register| bridge
  serve -->|direct retrieval| agent
  bridge -->|query sources| serve
  bridge -->|delegate synthesis| runtime
  chat -->|configure runtime| bridge
  chat -->|inspect source| serve
```

| Module | Owns | Does not own |
| --- | --- | --- |
| `llmwiki-serve` | File projection, manifest, context packs, search, read, graph, HTTP, MCP, optional A2A source compatibility. | Wiki authoring, ingestion jobs, model calls, answer synthesis, browser UI. |
| `llmwiki-bridge-start` | First-run discovery, local source startup, optional bridge registration, and smoke-test handoff for existing wiki folders. | Wiki compilation or ingestion, runtime hosting, answer synthesis, replacing the bridge. |
| `llmwiki-agent-bridge` | Source fan-out, runtime profile config, OpenAI-compatible chat completions call, normalized answer artifact, citations, graph, trace. | Reading local files directly, hosting a model, browser source selection UI. |
| `llmwiki-chat` | Source setup, bridge/runtime setup, graph inspection, answer review, run details, citation selection. | Serving wiki files, storing provider secrets, production answer quality. |
| `llmwiki-docs` | Cross-repo first-run path, architecture, protocol posture, release status, operations references. | Package runtime behavior or upstream LLM Wiki specification ownership. |

## Choose Your Path

<div class="route-grid">
  <a class="route-card" href="./quickstart">
    <span>First 10 minutes</span>
    <strong>Serve and query a wiki</strong>
    <p>Use your existing graph, or start with the bundled sample for the fastest known-good smoke.</p>
  </a>
  <a class="route-card" href="./direct-agent-integrations">
    <span>Codex, Claude Code, IDE agents</span>
    <strong>Call the source directly</strong>
    <p>Best when the agent can retrieve context and do its own planning, editing, and synthesis.</p>
  </a>
  <a class="route-card" href="./runtime-adapters">
    <span>Hermes, DeepAgents, local runtimes</span>
    <strong>Add the Agent Bridge</strong>
    <p>Use the bridge when one service should gather source evidence and return a model-backed answer artifact.</p>
  </a>
  <a class="route-card" href="./network-security">
    <span>Private or team network</span>
    <strong>Check exposure boundaries</strong>
    <p>Review loopback defaults, private HTTP, CORS, source policy, bearer tokens, and TLS before sharing endpoints.</p>
  </a>
</div>

## What To Read Next

| Goal | Page |
| --- | --- |
| Run the first local path | [Quickstart](/quickstart) |
| Understand the data flow | [Demo](/demo) and [Data Flow](/data-flow) |
| Understand the vocabulary | [Core Concepts](/core-concepts) |
| Decide direct source vs bridge vs chat | [Architecture](/architecture) and [Runtime Adapters](/runtime-adapters) |
| Connect Codex, Claude Code, Copilot-style IDE agents, or scripts | [Direct Agent Integrations](/direct-agent-integrations) and [AI Tool Support](/ai-tools) |
| Understand HTTP, MCP, and A2A-style compatibility surfaces | [Protocols](/protocols) and [API Reference](/api-reference) |
| Check SciFact benchmark and compatibility evidence | [Evidence](/evidence) |
| Expose endpoints beyond loopback | [Network & Security](/network-security) and [Deployment](/deployment) |
| Check package/public-preview status | [Release Status & Compatibility](/status) |
| Prepare endpoint operations | [Deployment](/deployment), [Network & Security](/network-security), and [Troubleshooting](/troubleshooting) |
| Check public-preview support status | [Release Status & Compatibility](/status) and [FAQ](/faq) |

::: info Public preview
This is independent community tooling for LLM Wiki-style Markdown knowledge
folders and agent-readable context. It is not an official project from Andrej
Karpathy or any upstream producer named in compatibility examples, and it does
not claim certified MCP or A2A conformance.
:::
