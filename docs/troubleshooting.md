# Troubleshooting

## The Docs Site Or Local Preview Does Not Load

For local documentation work, start VitePress from the docs checkout and open
the printed loopback URL:

```sh
npm ci
npm run dev
```

For a production Pages URL, confirm that the repository's Pages workflow has
completed and that your browser is using the documented base path.

## The Chat Workbench Cannot Query a Source

Check the Knowledge Source first:

```sh
curl -s http://127.0.0.1:8765/health
curl -s http://127.0.0.1:8765/manifest
```

Use your configured source port if you started `llmwiki-serve` on a different
port. Then confirm the browser origin is allowed by the `serve` subcommand's
`--cors-origin` option. Loopback origins are allowed by default when no
explicit CORS origins are set:

```sh
llmwiki-serve serve /path/to/wiki --cors-origin http://127.0.0.1:5173
```

If chat shows a diagnostic report, read `scope`, `phase`, `protocol`, and
`observations` together instead of looking for a product-specific failure code.
For example, `scope: "client"` with `phase: "connection"` means the browser
could not reach the source; `scope: "bridge"` with `phase: "request"` means the
bridge process reached the source path but the request failed. See
[Diagnostics](/diagnostics).

## HTTP Sources Are Rejected

HTTP Knowledge Sources are intended for local, private, or explicitly trusted
networks. If a browser, bridge, or deployment policy rejects an HTTP source,
either keep the source on loopback/private network or put TLS and authentication
in front of it.

Use the [URL Policy Matrix](/network-security#url-policy-matrix) to identify
which component is rejecting the URL. Chat runtime URL policy, browser-to-source
CORS, bridge outbound source policy, and A2A source message URL checks are
separate boundaries.

Loopback URLs are process-local. If the browser is on one machine and the bridge
is on another, `http://127.0.0.1:8765` points at different machines. Use a URL
that is reachable from the component that is making the call.

## No Evidence Is Returned

Check whether the relevant pages are approved for serving. Draft, proposed,
`published: false`, `publish: false`, and draft review-state pages are withheld
from default network responses.

For source layout issues, run the local CLI query against the same root:

```sh
llmwiki-serve query /path/to/wiki "what is in this wiki?"
```

## Recent Generated Output Is Not Visible

Keep the default strict source scan for local authoring and most generated
wiki smoke tests. If `llmwiki-serve` was started with
`--producer-manifest <path>`, the producer must update that marker after every
source-changing build. A source file change without a marker update can leave
the cached projection visible.

When in doubt, remove `--producer-manifest`, confirm the marker is a
non-symlink file inside the served root, or restart the server after the
producer build completes. The marker is only a freshness signal; it is not the
public `projection.signature` or `bundle_id`.

## The Bridge Returns Source Query Failed

Verify each selected source has:

- `status: "ready"`
- a supported protocol: `llmwiki-http`, `mcp`, or `a2a`
- a reachable URL
- `selected` unset or `true`
- an origin allowed by the bridge source policy

Bridge diagnostics should identify whether the failure was observed during
configuration, discovery, authorization, connection, request, or response. When
the run still has usable evidence from other sources, per-source failures appear
as warning or error trace steps inside the returned answer artifact instead of
failing the whole request.

## Bridge MCP Source Tools Cannot Select a Source

Check the bridge registry first:

```sh
curl -s http://127.0.0.1:8788/health
```

`sourceRegistry.selectedReadySourceCount` should be greater than zero when you
expect registered sources from `/settings` to be usable. The same redacted
readiness summary appears in the agent card metadata. It reports counts only;
it does not expose Knowledge Source endpoint URLs.

For MCP clients, call `tools/list` and then `llmwiki_list_sources`. The source
list text is URL-free and useful for choosing a source ID. If more than one
ready selected source is available, source-specific tools such as
`llmwiki_context`, `llmwiki_search`, `llmwiki_read`, `llmwiki_graph`,
`llmwiki_graph_neighbors`, and `llmwiki_source_bundle` require `sourceId` or
an inline `knowledgeSources` array. Use `llmwiki_context` first for
orientation; use `llmwiki_graph_neighbors` after you have a graph node or
page/source-ref seed.

These source tools do not call the configured runtime. If you need the bridge
to produce one grounded answer artifact with citations and trace steps, call
`llmwiki_agent_run` or `POST /message:send` instead.

## CI Fails After Documentation Edits

Run the same local checks before pushing:

```sh
npm ci
npm run check
```

If only Pages deploy is skipped, confirm whether Pages is enabled for the
repository and whether the workflow has the required write permissions.
