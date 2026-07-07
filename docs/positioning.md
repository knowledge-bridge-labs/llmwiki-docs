# Positioning

The LLM Wiki-style toolchain is a serving and protocol layer for existing
Markdown knowledge folders. It is not an all-in-one RAG application, a hosted
chat product, or a model runtime.

Use it when the source of truth is already a local or hosted wiki folder and an
agent, runtime, workbench, or script needs governed context from that folder.

## One Sentence

Serve any compatible Markdown or LLM Wiki-style knowledge folder as
agent-readable context, optionally fan out through a local bridge with or
without runtime synthesis, and inspect the evidence path from a browser
workbench.

## What It Optimizes For

- Keep the original Markdown folder as the source of truth.
- Expose read-only projections instead of importing content into a managed app.
- Support direct agent calls through HTTP and MCP-oriented tool surfaces.
- Keep A2A on `llmwiki-serve` as an opt-in compatibility adapter for
  A2A-native environments that must discover a source through an agent-shaped
  card.
- Keep answer synthesis outside the Knowledge Source server.
- Make citations, graph context, and trace artifacts inspectable.
- Let operators choose their network, runtime, and security posture.

## How It Compares

| Category | Examples | They are strong at | This toolchain is for |
| --- | --- | --- | --- |
| All-in-one RAG apps | Dify, RAGFlow, AnythingLLM, Open WebUI, Onyx | Document ingestion, app UI, retrieval, chat, users, and deployment in one product. | Serving an existing wiki folder as a small Knowledge Source that other agents and tools can consume. |
| Agent frameworks | LangGraph, LlamaIndex, DeepAgents | Building planners, tool loops, memory, graph workflows, and runtime logic. | Supplying wiki-derived context and graph evidence to those runtimes without owning their planning layer. |
| Memory and graph libraries | mem0, GraphRAG-style systems | Long-term memory, graph extraction, or structured retrieval pipelines. | Projecting Markdown and sidecar facts from a source folder into queryable context without making the projection the system of record. |
| IDE and coding agents | Codex, Claude Code, Copilot, Cursor | Code editing, command execution, tool use, and developer workflows. | Giving those agents a stable way to query project wikis directly or through a bridge when source fan-out or runtime delegation needs a companion service. |

The useful gap is between wiki storage and agent runtime. The toolchain makes a
wiki-shaped knowledge folder available through practical integration surfaces,
then lets downstream clients decide how to use that context.

## Component Fit

| Need | Start with |
| --- | --- |
| Query one existing wiki folder from scripts, skills, MCP clients, or IDE agents. | `llmwiki-serve` |
| Fan out across selected sources and return evidence-only or runtime-backed cited artifacts. | `llmwiki-agent-bridge` |
| Inspect sources, graph context, bridge traces, and answer citations in a browser. | `llmwiki-chat` |
| Understand setup, protocol posture, package publication, and release gates across repos. | `llmwiki-docs` |

## Boundary Claims

The public preview should keep these claims conservative:

- MCP uses official SDK-backed surfaces where implemented; legacy MCP-style
  JSON-RPC endpoints remain compatibility surfaces.
- A2A surfaces are opt-in compatibility or SDK-backed bridge surfaces where
  implemented; they are not certified conformance claims until a separate
  conformance process is documented.
- Hermes, DeepAgents, Copilot, Codex, Claude Code, and IDE agent names describe
  integration paths or runtime profiles, not vendor-certified integrations.
- The server is read-only. Ingestion, compilation, and authoring remain owned by
  the wiki variant or upstream workflow that creates the Markdown folder.
- Public deployment security belongs to the operator. The defaults are
  local-first, and the docs describe private network, HTTPS, auth, and CORS
  tradeoffs without forcing one hosting model.
