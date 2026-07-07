---
layout: home

hero:
  name: LLMWiki Toolchain
  text: Serve local wiki knowledge to agents.
  tagline: A small, local-first protocol layer for Markdown and LLMWiki-style knowledge folders. Serve an existing graph or bundled sample first, then add a bridge or chat workbench only when that path needs them.
  actions:
    - theme: brand
      text: Start in 10 minutes
      link: /quickstart
    - theme: alt
      text: Understand the modules
      link: /#module-map
    - theme: alt
      text: Check release status
      link: /status

features:
  - title: Source first
    details: llmwiki-serve projects one existing Markdown/wiki folder into read-only context, search, page, graph, HTTP, and MCP tool surfaces.
    link: /quickstart
  - title: Bridge only when needed
    details: llmwiki-agent-bridge gathers evidence from selected sources and can run evidence-only, delegated-runtime, or hybrid answer loops.
    link: /runtime-adapters
  - title: Inspect before trusting
    details: llmwiki-chat lets humans test sources, choose a bridge, ask, and inspect citations, graph context, artifacts, and run details.
    link: /quickstart#optional-chat-workbench
---

<div class="preview-panel">
  <div>
    <strong>Minimum useful path</strong>
    <span>Run <code>llmwiki-serve</code> on your graph or <code>./examples/sample-wiki</code>, then query <code>/query</code>. Chat and model runtimes are optional.</span>
  </div>
  <div>
    <strong>Public-preview install</strong>
    <span>Use source checkouts today. PyPI and npm package commands become primary after publication gates pass.</span>
  </div>
  <div>
    <strong>Protocol posture</strong>
    <span>HTTP and MCP source access first; A2A source compatibility is opt-in. The bridge offers A2A and MCP runtime-facing surfaces.</span>
  </div>
</div>

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

## First Run At A Glance

<div class="quickstart-track">
  <a class="quickstart-step" href="./quickstart#start-llmwiki-serve">
    <span>Step 1</span>
    <strong>Start your source</strong>
    <p>Serve an existing wiki folder, or use <code>./examples/sample-wiki</code> for a known-good smoke.</p>
  </a>
  <a class="quickstart-step" href="./quickstart#query-it-directly">
    <span>Step 2</span>
    <strong>Verify projection</strong>
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

## What To Read Next

| Goal | Page |
| --- | --- |
| Run the first local path | [Quickstart](/quickstart) |
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
