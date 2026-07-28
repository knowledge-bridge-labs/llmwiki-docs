# `llmwiki-serve`

`llmwiki-serve` is the read-only source layer for existing Markdown,
Obsidian-style, and LLMWiki folders. It projects files you already own into
agent-readable source evidence over local HTTP and MCP-style tool surfaces.

Use [QuickStart](/quickstart) for copyable first-run commands. This page
explains what the source layer owns and where its boundaries are.

## Source And Projection Ownership

The source folder remains the source of truth. Your authoring tool, compiler,
wiki workflow, or upstream producer owns the Markdown files and any sidecar
metadata it writes.

`llmwiki-serve` owns only the served projection:

- source identity and manifest metadata
- approved page discovery
- link, tag, source-ref, and graph hints derived from the files
- query, search, read, source-ref, source-bundle, and graph responses
- local process discovery for running source servers

It does not write back into the source folder, compile upstream material, run
ingestion jobs, call a model, or synthesize final answers.

## What It Reads

The server reads compatible local Markdown/wiki folders. A source can be an
existing project wiki, an Obsidian-style vault, LLMWiki compiler output, or an
OpenWiki-style Markdown folder that the adapter recognizes.

The projection can use:

- Markdown files and frontmatter
- wiki links, Markdown links, headings, tags, and page roles
- source references declared by approved pages
- optional producer or sidecar metadata when supported by the adapter

Draft and unapproved pages are withheld from default retrieval surfaces. Enable
draft serving only in a trusted local workflow where the operator expects those
pages to be visible.

## What It Serves

`llmwiki-serve` exposes a local Knowledge Source surface:

| Surface | Purpose |
| --- | --- |
| `/health` | Source readiness, version, endpoint, and capability discovery. |
| `/manifest` | Redacted source metadata and projection summary. |
| `/query` | Context packs with orientation, ranked evidence, limitations, and graph hints. |
| `/search` | Candidate pages without the full context-pack envelope. |
| `/read/{page_id}` | Full page content after a query or search identifies a page. |
| `/source-refs` | Visible source-owned citation handles. |
| `/source-bundle` | Source identity, projection metadata, capabilities, and source refs. |
| `/graph/neighborhood` | Bounded graph neighborhoods for page, source-ref, tag, or link seeds. |
| `/mcp` and `/mcp/stream` | MCP-style JSON-RPC and Streamable HTTP tool surfaces where supported. |

CLI commands such as `manifest`, `query`, `search`, `source-refs`, and
`source-bundle` run directly against a local source path. `serve` starts the
HTTP/MCP source server. `ls` and `status` inspect local running instances from
registry records and OS process command lines.

## Redaction And Security

The default first-run bind is `127.0.0.1`. Keep it on loopback until you have
reviewed draft handling, CORS policy, authentication, logging, TLS, and who can
reach the endpoint.

Network responses redact the local root where the public contract does not need
it. CLI output and local registry commands may include local operator paths so
you can verify which folder is being served; redact those before sharing logs,
issues, screenshots, or traces.

Local I/O debug logging is operator state. It may include user queries and
approved wiki content even when credential-shaped fields are redacted. Disable
or redirect it when that is not appropriate for the environment.

Local discovery is also operator state. `llmwiki-serve ls/status` reads the
per-user registry written by `serve` and can inspect local process command
lines to find unregistered `llmwiki-serve serve` processes. It does not use
default fixed-port heuristic probing; `--probe-port <port>` is only an explicit
manual diagnostic. JSON output can mark where a record came from with
`discovery_source` and where a root came from with `root_source`.

## Freshness And Caching

The strict local default checks source freshness before served responses. That
keeps edits visible during authoring and tests.

For larger sources, operators can choose a positive refresh interval to reuse
an in-memory projection between checks. That improves repeated reads but means
recent edits may not be visible until the interval expires. Generated sources
can also use a producer-owned freshness marker when the producer updates that
marker after every source-changing compile.

Projection signatures and bundle IDs are derived from the served projection, so
clients should treat them as source-owned coordination metadata instead of
trying to infer local file paths.

## Protocol Posture

The public contract is a Knowledge Source over local HTTP, plus MCP-style and
MCP Streamable HTTP surfaces where implemented by the installed package and
client. Legacy A2A-style source compatibility is opt-in when a client requires
that adapter surface.

These are integration surfaces, not broad certification claims. Do not describe
the project as certified MCP or certified A2A unless a separate conformance
effort documents that status.

## Boundaries With Other Components

| Component | Relationship to `llmwiki-serve` |
| --- | --- |
| `llmwiki-bridge-start` | Guided next step after the source layer works. It discovers folders, starts loopback sources, registers optional bridge sources, and runs smoke checks. |
| `llmwiki-agent-bridge` | Optional companion endpoint. It fans out across selected sources, can call a configured runtime, and returns a normalized cited artifact. It does not read local source files directly. |
| `llmwiki-chat` | Optional browser workbench for humans to inspect source readiness, graph context, citations, bridge settings, and traces. It does not serve the wiki files. |
| RAG apps and vector databases | Separate retrieval architectures. `llmwiki-serve` does not crawl, chunk for embeddings, manage vector indexes, or own answer quality. |
| Upstream wiki producers | Own authoring, ingestion, compilation, and source file layout. `llmwiki-serve` reads the compatible output after it exists. |

The practical rule is simple: start with one `SOURCE_PATH`, get one
`SOURCE_URL`, verify evidence, and add other components only when they remove a
specific local workflow hurdle.
