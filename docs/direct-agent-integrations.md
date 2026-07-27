# Direct Agent Integrations

Direct integrations let an agent retrieve context from a Knowledge Source
without using the bridge. This is the right path when the agent already has a
trusted tool, command, MCP, or HTTP route and can handle synthesis itself.

Direct source examples use `http://127.0.0.1:8765`, the default
`llmwiki-serve` loopback URL. Optional bridge examples use
`http://127.0.0.1:8788`, the default `llmwiki-agent-bridge` loopback URL. Keep
those roles separate: the source returns evidence; the optional bridge fans out
across sources and may call a configured runtime.

## Good Fits

Use direct source calls for:

- Codex skills, commands, MCP tools, or HTTP tools that can query a local source
- Claude Code skills or commands that can call the same source endpoints
- IDE agents that can consume MCP-style or HTTP tools
- backend scripts that need context retrieval but own answer composition
- test harnesses that validate source projections without model synthesis

## Direct Call Pattern

Start with a broad context query:

```sh
curl -s http://127.0.0.1:8765/query \
  -H 'content-type: application/json' \
  -d '{"query":"what should I know before release?","limit":6}'
```

Then inspect a page or graph only when the initial context points there:

```sh
curl -s http://127.0.0.1:8765/read/release-checklist
curl -s 'http://127.0.0.1:8765/graph?limit=120'
```

For MCP-style clients, call `llmwiki_context` first, then use search, read, or
graph tools as follow-up inspection.

## Host-Owned Search Loop

Direct integrations are the host-owned search loop. The host agent chooses the
retrieval sequence, performs follow-up reads or graph expansion, calls any
delegated runtime, and composes the final answer. `llmwiki-serve` only owns the
served source bundle and returns approved source views.

Typical loop:

1. Ask `llmwiki-serve` for context or search candidates.
2. Resolve only relevant opaque handles through read or graph calls.
3. Use returned citations, graph hints, and raw-origin metadata in the host
   prompt or answer surface.
4. Keep ranking, caching, answer memory, and policy decisions in the host
   surface when they are product-specific.

Handles returned by `llmwiki-serve` are intentionally opaque. Store or pass
them back to the source endpoint, but do not parse them or derive filesystem
paths from them.

## When to Use the Bridge Instead

Use `llmwiki-agent-bridge` instead of a direct source call when the client
needs one endpoint that:

- filters selected sources
- queries multiple source protocols
- builds an evidence bundle
- optionally calls a configured runtime
- returns a completed bridge result, either A2A-style or MCP structured
  content, with citations and trace steps

The bridge is especially useful for clients that do not want to implement
runtime prompts, citation normalization, or graph artifact assembly themselves.
In this mode, the bridge owns the companion loop: evidence fan-out, optional
delegated runtime call, trace assembly, and normalized artifact.

## Integration Contract

Direct agents should preserve these rules:

1. Treat the source endpoint as read-only unless a future write protocol is
   explicitly documented.
2. Keep draft access disabled unless the operator knowingly enables it for a
   trusted local workflow.
3. Cite returned source identifiers or page references when composing answers
   from retrieved context.
4. Treat source, page, chunk, section, edge, and fact handles as opaque values
   owned by `llmwiki-serve`.
5. Preserve raw-origin metadata in tests and answer traces when the source
   endpoint returns it.
6. Use source-bundle or current-evidence descriptors only as source-owned
   coordination metadata; do not infer raw file paths or bypass the source
   endpoint from them.
