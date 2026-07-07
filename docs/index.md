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
      text: Watch the demo
      link: /demo

features:
  - title: Use the folder you already have
    details: Keep project knowledge in its current LLMWiki, Markdown, or Obsidian folder. Serve it read-only instead of migrating it into a hosted RAG app.
    link: /quickstart
  - title: Let agents pull focused context
    details: Coding agents and scripts can query page, search, context, graph, HTTP, and MCP surfaces before planning edits or answering.
    link: /direct-agent-integrations
  - title: Add orchestration only when needed
    details: Use the bridge for multi-source evidence and runtime-backed answers. Use chat to test connections, citations, traces, and graph context.
    link: /quickstart#optional-chat-workbench
---

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
    <span>Use source checkouts today. PyPI and npm package commands become primary after publication gates pass.</span>
  </div>
  <div>
    <strong>Protocol posture</strong>
    <span>Source access is HTTP/MCP first. A2A source compatibility is opt-in, and bridge runtime surfaces are described as A2A-style and MCP-style compatibility.</span>
  </div>
</div>

<div class="demo-strip">
  <div>
    <strong>Not sure how the pieces map?</strong>
    <span>Watch the short demo: upstream workflows create Markdown, <code>llmwiki-serve</code> projects it read-only, and agents, bridge, or chat consume the served source.</span>
  </div>
  <a href="./demo">Watch demo</a>
</div>

## First Run At A Glance

<div class="quickstart-track">
  <a class="quickstart-step" href="./quickstart#start-llmwiki-serve">
    <span>Step 1</span>
    <strong>Start your source</strong>
    <p>Serve an existing wiki folder, or use <code>./examples/sample-wiki</code> for a known-good smoke.</p>
  </a>
  <a class="quickstart-step" href="./quickstart#query-it-directly">
    <span>Step 2</span>
    <strong>Verify served view</strong>
    <p>Call <code>/health</code>, <code>/manifest</code>, and <code>/query</code>. Stop here if direct retrieval is enough.</p>
  </a>
  <a class="quickstart-step" href="./quickstart#optional-agent-bridge">
    <span>Optional</span>
    <strong>Start the bridge</strong>
    <p>Use evidence-only source fan-out first. Connect a runtime only when the bridge should synthesize answers.</p>
  </a>
  <a class="quickstart-step" href="./quickstart#optional-chat-workbench">
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
| Several wiki folders must be searched together | Run one `llmwiki-serve` per folder and connect them through `llmwiki-agent-bridge`. |
| A service should gather evidence and call a model runtime for a cited answer | Use `llmwiki-agent-bridge` in delegated-runtime or hybrid mode. |
| A human needs to test setup, inspect evidence, or debug traces | Open `llmwiki-chat` as the browser workbench. |
| You only need package status, release support, or protocol details | Read [Release Status](/status), [Protocols](/protocols), and [API Reference](/api-reference). |

## Module Map

```mermaid
flowchart LR
  wiki["Wiki folder"]
  serve["llmwiki-serve"]
  agent["Host agent"]
  bridge["Agent bridge"]
  runtime["Runtime"]
  chat["llmwiki-chat"]

  wiki -->|project| serve
  serve -->|direct retrieval| agent
  bridge -->|query sources| serve
  bridge -->|delegate synthesis| runtime
  chat -->|configure runtime| bridge
  chat -->|inspect source| serve
```

| Module | Owns | Does not own |
| --- | --- | --- |
| `llmwiki-serve` | File projection, manifest, context packs, search, read, graph, HTTP, MCP, optional A2A source compatibility. | Wiki authoring, ingestion jobs, model calls, answer synthesis, browser UI. |
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
