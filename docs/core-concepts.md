# Core Concepts

This toolchain is a serving and integration layer for existing Markdown or
LLM Wiki-style knowledge folders. It does not own authoring, ingestion,
compilation, model serving, or long-term memory storage.

## Knowledge Source

A Knowledge Source is a read-only endpoint that exposes a wiki folder to agents
and clients. In the default path, `llmwiki-serve` reads Markdown files, links,
front matter, headings, source references, and optional graph sidecars from a
local folder, then serves derived views without rewriting the source tree.

Knowledge Sources can be queried through HTTP and MCP-oriented tools. A2A
source discovery is an optional compatibility adapter for A2A-native clients.
These surfaces are public-preview contracts, not certified conformance claims
unless a separate conformance process says otherwise.
For the concrete folder shapes and metadata fields that `llmwiki-serve` reads,
see [Knowledge Source Format](/knowledge-source-format).

## Served Source Bundle

A served source bundle is the read-only boundary that `llmwiki-serve` exposes
for one Knowledge Source. It contains the source manifest, approved pages,
chunks, links, tags, graph projections, and raw-origin records as served views.
The bundle can originate from a local folder or future packed format, but
clients should interact with it through the same source protocols.

`llmwiki-serve` owns bundle identity and opaque handles for sources, pages,
chunks, sections, edges, and graph facts. Agents, bridges, and host surfaces may
store or pass those handles back to `llmwiki-serve`, but should not parse them
or rely on local filesystem layout.

Source-bundle and current-evidence descriptors are coordination metadata at
this same boundary. They can help a host loop or bridge loop request deeper
approved evidence when available, but they do not grant raw file access or move
source ownership out of `llmwiki-serve`.

## Context Pack

A context pack is the primary answer to a retrieval request. It contains the
query, ranked evidence, important orientation pages, limitations, citations,
and graph hints. Agents should treat it as grounded input, not as a final answer
unless they intentionally run in direct retrieval mode.

## Evidence And Citations

Evidence is the selected source material returned from one or more Knowledge
Sources. Citations preserve source IDs, page IDs, titles, scores, snippets, and
source references when available. `llmwiki-agent-bridge` and `llmwiki-chat`
carry those citations into answer artifacts and UI traces so users can inspect
where a claim came from.

Raw-origin metadata is the provenance layer beneath citations. When available,
it should identify the original path or URL, source reference, commit or
snapshot, heading, and line or byte range that produced returned evidence.
Public deployments may redact private path details, but should keep enough
origin information for audits and tests.

## Graph Projection

The graph is a projection of pages, links, tags, references, and optional
sidecar facts. It is rebuilt from files on disk and should be treated as
derived state. The Markdown folder remains the durable source of truth.

Retrieval should become graph-aware: search and context calls can return graph
hints, read calls can resolve opaque handles, and graph calls can expand
neighborhoods, paths, references, and sidecar facts with origin records.

## Agent Runtime

An Agent Runtime is the external system that plans, calls tools, and writes an
answer. Hermes, DeepAgents, generic OpenAI-compatible local gateways, IDE
agents, Codex, Claude Code, and scripts can all be runtime or client paths
depending on their environment. Bridge profiles describe integration paths, not
vendor-certified support.

Host agents own the direct search loop when they call `llmwiki-serve`
themselves. In that mode, the host decides which search, read, context, and
graph calls to make, then performs any prompt assembly, model calls, ranking,
answer memory, and citation display outside the source server.

## Bridge

`llmwiki-agent-bridge` is an optional local companion service. It accepts a
question and selected Knowledge Sources, gathers evidence, and then runs one of
three loops: evidence-only, delegated-runtime, or hybrid. Only runtime-backed
modes call an OpenAI-compatible runtime profile before returning a normalized
artifact with answer text, citations, graph data, and trace steps.

Use the bridge when you want one runtime-facing endpoint for source fan-out and
answer normalization. Skip it when the agent can call `llmwiki-serve` directly
through a skill, command, HTTP client, or MCP-style tool.

The bridge owns a companion loop, not the source bundle. It accepts selected
Knowledge Source descriptors or registered endpoints and gathers evidence from
`llmwiki-serve`. Evidence-only mode returns that evidence without a runtime
call. Delegated-runtime and hybrid modes call the selected runtime profile and
return a bridge-owned answer artifact. Source trace steps expose
`citationIds`, `citationRefs`, and short evidence path/title previews so
clients can inspect which source evidence fed the answer.

When a delegated runtime returns citations but omits all inline
`[n](#citation-n)` markdown anchors, the bridge appends a bounded fallback
anchor list headed `Evidence used:`. This corrects runtime answer formatting;
it does not move evidence ownership away from the selected source.
It does not read local wiki files directly or resolve raw-origin paths outside
the source endpoint.

## Chat Workbench

`llmwiki-chat` is a browser workbench for selecting Knowledge Sources,
inspecting graph context, choosing an Agent Bridge or testing runtime, asking
questions, and reviewing citations and trace steps. It does not bundle a
production model runtime or host private wiki data by itself. In the Pages and
Details panels, selecting a page lazy-loads the full markdown through the
source's `/read/{page}` endpoint or MCP `llmwiki_read` tool and renders it for
inspection. Links in and out are clickable page navigation, not separate answer
citations.

## Host-Owned Surface RAG

Host-owned surface RAG is the application or workflow layer that presents
retrieval and answers to users. It may combine `llmwiki-serve` evidence with
other indexes, policies, caches, prompts, answer memory, and product telemetry.
Those choices remain outside the served source bundle boundary.

## Draft Filtering

Draft and unpublished pages are withheld by default from `llmwiki-serve`
context, search, read, graph, MCP-style, and optional A2A-style network
surfaces when enabled.
Operators can enable draft serving for trusted local workflows, but should not
expose draft-enabled endpoints without a deliberate network and logging policy.

## Local-First Network Posture

The default workflow binds services to loopback, keeps private wiki folders on
the operator's machine, and treats public exposure as an explicit deployment
choice. For private networks, use explicit source URLs, CORS origins, bearer
tokens when needed, and a source policy that matches the trust boundary.

## Package Boundaries

| Package | Owns | Does not own |
| --- | --- | --- |
| `llmwiki-serve` | Served source bundle boundary, read-only projection, opaque handles, raw-origin metadata, context/search/read/graph APIs, HTTP and MCP tool surfaces, optional A2A source compatibility. | Markdown authoring, ingestion, model runtime, answer synthesis, host-owned surface RAG. |
| `llmwiki-agent-bridge` | Evidence fan-out, companion bridge loop, bridge A2A/MCP endpoints, optional runtime profile call, normalized evidence-only or runtime-backed artifact. | Source bundle ownership, raw file access, model hosting, vector storage, hosted multi-tenant RAG, UI. |
| `llmwiki-chat` | Browser source/bridge workbench, graph/citation/trace inspection. | Production runtime operation, wiki compilation, credential storage, host private wiki storage. |
| `llmwiki-docs` | Cross-repo quickstart, concepts, reference, operations, and release posture. | Runtime code or package publication by itself. |
| Host agents | Direct search loop, tool iteration, answer composition, prompt policy, workflow integration. | Source bundle internals, opaque handle semantics, delegated runtime implementation. |
| Delegated runtimes | Model invocation, local gateway behavior, runtime-specific tool execution, streaming and token behavior. | Source discovery, source bundle state, raw-origin resolution, host UI state. |
| Host-owned surface RAG | User-facing retrieval UX, auth and policy, cross-system ranking, prompt assembly, answer memory, telemetry, cache policy. | `llmwiki-serve` bundle boundary, canonical source parsing, raw-origin provenance. |
