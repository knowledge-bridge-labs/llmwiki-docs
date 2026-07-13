# Knowledge Source Format

A Knowledge Source is the directory that `llmwiki-serve` reads and projects as
agent-readable context. The source folder stays read-only from the server's
point of view. Markdown files, metadata, links, tags, source references, and
optional graph sidecars are parsed into derived API responses.

This page describes the public-preview source contract. It is intentionally
broader than one LLMWiki implementation because `llmwiki-serve` is meant to
serve several Markdown/wiki variants through one interface.

## Source Root

Start the server with the directory that owns the wiki content:

```sh
uv run llmwiki-serve serve ./examples/sample-wiki --host 127.0.0.1 --port 8765
```

The same root is used by the CLI commands:

```sh
uv run llmwiki-serve manifest ./examples/sample-wiki
uv run llmwiki-serve query ./examples/sample-wiki "release readiness"
```

One `llmwiki-serve` process is usually best matched to one Knowledge Source.
Run multiple server processes when you want to expose several unrelated wiki
folders with independent network, draft, or token policies.

When the configured root is a repository that contains generated OpenWiki
documentation under `openwiki/`, the native Markdown adapter treats that
`openwiki/` folder as the served source root. You can also point directly at the
`openwiki/` folder.

## Supported Folder Shapes

`llmwiki-serve` auto-detects the first matching adapter for the configured
root. Detection is based on files and marker directories under that root.

| Shape | Detection signal | Parsed content |
| --- | --- | --- |
| Native LLMWiki Markdown | `wiki/` or `openwiki/` with hub pages or typed topic directories, a root-level hub plus typed directories, `quickstart.md` in an OpenWiki source root, or `.wiki-compiler.json` | Markdown pages below the source root |
| Generic Markdown | Any supported Markdown files under the root | Markdown pages below the root |
| Obsidian | `.obsidian/` plus Markdown files | Markdown, YAML frontmatter, wikilinks, and tags |
| Foam | `.foam/` or a VS Code extension hint for Foam | Markdown workspace pages and wikilinks |
| Quartz | `quartz.config.*`, preferably with `content/` | Markdown pages under `content/` when present |
| Dendron | `dendron.yml` | Configured vault Markdown files and dotted hierarchy |
| Logseq | `logseq/config.edn`, or `pages/` plus `journals/` | Markdown and Org files under Logseq pages and journals |

Common runtime and build directories such as `.git`, `node_modules`, `.venv`,
`__pycache__`, `dist`, and `build` are ignored.

## Markdown Page Fields

Each Markdown page may include YAML frontmatter:

```md
---
id: release-checklist
title: Release Checklist
wiki_title: Sample Packaging LLMWiki
description: Synthetic packaging operations knowledge base.
review_state: approved
source_refs:
  - SRC-RELEASE
tags:
  - release
updated_at: 2026-07-03
---

# Release Checklist

Link to [[requester-return]] and cite #ship-checks.
```

Supported public-preview fields:

| Field | Meaning |
| --- | --- |
| `id` or `object_id` | Stable page identifier. Falls back to the relative file path without `.md` or `.org`. |
| `title` | Display title. Falls back to the first heading, then the file stem. |
| `wiki_title` | Wiki title when present on `index.md`, `overview.md`, or OpenWiki `quickstart.md`. |
| `description` | Wiki description when present on `index.md`, `overview.md`, or OpenWiki `quickstart.md`. |
| `source_refs` or `sources` | Citation/source labels projected as source reference graph nodes. |
| `tags` | Tags projected as graph nodes. Inline hashtags are also extracted from the body. |
| `review_state` or `state` | Review state used by draft filtering. |
| `status` | Optional publication status used by draft filtering. |
| `draft`, `published`, `publish` | Boolean publication flags used by draft filtering. |
| `updated_at` or `last_updated` | Optional timestamp carried on the parsed page. |

Top-level `hot.md`, `index.md`, and `overview.md` files receive special roles.
Top-level `quickstart.md` is treated as an `index` role for OpenWiki-generated
documentation, where that file is the entrypoint and navigation page. Other
Markdown files are projected as topic pages.

Frontmatter must parse as a YAML mapping. Invalid or non-mapping frontmatter is
ignored instead of failing the server startup path.

## Draft And Publication Rules

Draft filtering is on by default for network-facing surfaces. A page is withheld
unless draft access is explicitly enabled when any of these are true:

| Signal | Effect |
| --- | --- |
| `draft: true` | Withheld |
| `published: false` | Withheld |
| `publish: false` | Withheld |
| `review_state: draft` | Withheld |
| `review_state: proposed` | Withheld |
| `review_state: needs_review` | Withheld |
| `status` values such as `draft`, `proposed`, `needs_review`, `blocked`, `unpublished`, `private`, `hidden`, `embargoed`, `confidential`, `internal`, or `withheld` | Withheld |

Withheld pages are excluded from context, search, read, graph, MCP-style, and
optional A2A-style responses when that surface is enabled, unless the operator
starts the server with draft access and the client opts in with
`include_drafts`.
Other lifecycle or maturity `status` values are served by default; use
`draft`, publication booleans, `review_state`, or one of the explicit
non-serving status values when a page must stay out of agent-visible context.

Boolean publication flags accept booleans and common string values. Truthy
strings are `1`, `true`, `yes`, `y`, and `on`; falsey strings are `0`, `false`,
`no`, `n`, and `off`.

## Link And Graph Projection

The projection layer builds a graph from:

- Pages.
- Headings.
- `source_refs` and `sources`.
- Frontmatter and inline tags.
- Wikilinks such as `[[Release Checklist]]`.
- Markdown links to `.md` or `.org` pages.
- Dendron dotted hierarchy relationships.
- Optional `graph/graph.json` sidecars.

Resolved links point at `page:*` nodes. Unresolved links are preserved as
placeholder or external reference nodes so clients can still inspect source
intent without requiring every target to exist.

Projected graph rows use a small normalized shape:

| Row | Stable fields |
| --- | --- |
| Page node | `id`, `label`, `kind`, `path`, `metadata` |
| Graph edge | `source`, `target`, `relation`, `metadata` |
| Parsed page | `id`, `title`, `path`, `role`, `text`, `summary`, `source_refs`, `tags`, `links`, `headings`, `updated_at` |

Sidecar graph edges that duplicate Markdown links are merged by
`source`/`target`/`relation`; metadata from both rows is preserved when values
do not conflict.

## Graph Sidecar

A graph sidecar can live at either:

```text
graph/graph.json
<source_root>/graph/graph.json
```

For adapters with a nested source root, the root-level sidecar and the source
root sidecar are both considered when they are inside the configured root. For
native nested LLMWiki folders, `<source_root>/graph/graph.json` is usually
`wiki/graph/graph.json` or `openwiki/graph/graph.json`.

The sidecar can be a JSON array of edges or an object with an `edges` array:

```json
{
  "edges": [
    {
      "from": "overview",
      "to": "concepts/release",
      "type": "supports",
      "confidence": 0.91
    }
  ]
}
```

Edge endpoints may use `from`/`to` or `source`/`target`. The `type` field is
normalized into the graph edge relation. `confidence` is optional and preserved
as metadata when numeric.

Sidecar endpoints are resolved against known pages by page id, title, path, or
source-root-qualified path. Unknown endpoints become placeholder or external
reference nodes.

## Refresh Semantics

`llmwiki-serve` keeps an in-memory projection and refreshes it when the source
signature changes. The signature tracks Markdown and Org pages, graph sidecars,
adapter configuration files, marker directories, relevant source-root
directories, file size, modification time, and content digests for files that
affect the projection.

The `serve` command's local-performance option
`--refresh-interval-seconds` controls how often a running server checks that
signature. The default is `0.0`, which keeps strict per-request freshness: each
request checks whether the source changed before serving the current projection.
A positive interval opts into reusing the in-memory projection between checks.
That can reduce repeated filesystem scans for larger local graphs, but source
updates may be invisible until the interval expires. For immediate validation,
keep the default, wait for the interval to pass, or restart the process.

This means common authoring flows are reflected without restarting the server:

- Editing Markdown page body or frontmatter.
- Adding, removing, or renaming Markdown pages.
- Updating `graph/graph.json`.
- Switching draft or review-state fields.
- Changing adapter marker/config files such as `dendron.yml`,
  `quartz.config.*`, `.obsidian/`, `.foam/`, or `logseq/config.edn`.

The Markdown or wiki folder remains the durable source of truth. The projection
is derived state and can be rebuilt by restarting the process.
External ingest or compile jobs are picked up when they write, change, move, or
remove compatible Markdown pages, adapter markers, or sidecar graph files after
the server has started; `llmwiki-serve` detects those outputs but does not run
the ingest or compile job itself.

## Public Preview Guidance

- Keep source roots under a directory you trust. Symlinked files outside the
  configured root are not loaded as wiki content or sidecar facts.
- Prefer stable page IDs for pages that agents or external systems cite.
- Use `source_refs` for citations to source documents, tickets, datasets, or
  ingest records.
- Use sidecar graph edges for relationships that are not naturally expressed by
  Markdown links.
- Keep draft serving disabled unless the endpoint is local or private and the
  caller intentionally requests drafts.
