# Examples

Use this page after the [Quickstart](/quickstart) when you want concrete graph
choices, representative JSON output, or a copyable source-plus-bridge
transcript. The canonical shortest path remains:

1. Start `llmwiki-serve`.
2. Verify `/query`.
3. Add `llmwiki-agent-bridge` and `llmwiki-chat` only when needed.

## Knowledge Graph Options

| Graph path | Use when | Expected adapter |
| --- | --- | --- |
| `/path/to/your/wiki` | You already have a Markdown, Obsidian, or LLMWiki-style graph. | Detected from the folder layout. |
| `/path/to/repo` with `openwiki/quickstart.md` | You want to serve OpenWiki-generated repository docs from a repo root or `openwiki/` folder. | `llmwiki-markdown` |
| `./examples/sample-wiki` | You want the bundled repository sample. | `llmwiki-markdown` |
| `./tests/fixtures/obsidian-vault` | You want to smoke an Obsidian-shaped fixture. | `obsidian` |
| `./tests/fixtures/llmwiki-compiler-output` | You want to smoke compiler-style topic wiki output. | `llmwiki-markdown` |

The bundled paths are optional source-checkout fixtures relative to the
`llmwiki-serve` checkout. They are useful for preview validation; the public
first-run path uses the installed PyPI package and your own graph or the tiny
local sample from [10-Minute Agent Context Quickstart](/serve-agent-quickstart).

## Sample Wiki Commands

The bundled sample contains approved pages, wikilinks, source references, and
one draft page that is withheld unless draft serving is explicitly enabled.

Run it only when you are using a `llmwiki-serve` source checkout:

```sh
uv run llmwiki-serve manifest ./examples/sample-wiki
uv run llmwiki-serve query ./examples/sample-wiki "release readiness" --limit 4
uv run llmwiki-serve serve ./examples/sample-wiki --host 127.0.0.1 --port 8765
```

To use an existing graph from the PyPI package, use `llmwiki-serve` directly
and replace `./examples/sample-wiki` with the folder that contains your wiki.

## Source And Bridge Transcript

The transcript below is a source-checkout sample transcript under one
workspace. The JSON blocks are representative, trimmed expected output. Field
order, generated IDs, scores, and exact answer text can vary by release and
runtime.

Start the read-only Knowledge Source:

```sh
cd ../llmwiki-serve
uv run llmwiki-serve serve ./examples/sample-wiki --host 127.0.0.1 --port 8765
```

In another terminal, verify the HTTP surface:

```sh
curl -s http://127.0.0.1:8765/health
```

Representative output:

```json
{ "status": "ok" }
```

```sh
curl -s http://127.0.0.1:8765/manifest
```

Representative output:

```json
{
  "title": "Sample Packaging LLMWiki",
  "description": "Synthetic packaging operations knowledge base.",
  "root": "",
  "adapter": "llmwiki-markdown",
  "implementation": "llmwiki-markdown",
  "page_count": 5,
  "approved_page_count": 4,
  "hot_page": "hot.md",
  "index_page": "index.md",
  "overview_page": "",
  "source_id": "sample-packaging-llmwiki",
  "bundle_id": "sample-packaging-llmwiki:sha256:abc123...",
  "public_uri": "llmwiki://sample-packaging-llmwiki",
  "projection": {
    "signature": "sha256:abc123...",
    "page_count": 5,
    "approved_page_count": 4,
    "graph_node_count": 15,
    "graph_edge_count": 15
  },
  "raw_origins": {
    "enabled": false,
    "metadata_only": true,
    "public_root_labels": []
  },
  "capabilities": [
    "llmwiki_source_bundle",
    "llmwiki_context",
    "llmwiki_search",
    "llmwiki_read",
    "llmwiki_graph",
    "llmwiki_source_refs",
    "mcp-jsonrpc",
    "mcp-streamable-http"
  ]
}
```

```sh
curl -s http://127.0.0.1:8765/source-bundle
```

Representative output:

```json
{
  "source_id": "sample-packaging-llmwiki",
  "bundle_id": "sample-packaging-llmwiki:sha256:abc123...",
  "title": "Sample Packaging LLMWiki",
  "projection": {
    "page_count": 5,
    "approved_page_count": 4
  },
  "source_refs": [
    {
      "id": "src-hot",
      "label": "SRC-HOT",
      "uri": "llmwiki://sample-packaging-llmwiki/source-refs/src-hot",
      "linked_page_ids": ["hot"]
    }
  ]
}
```

```sh
curl -s http://127.0.0.1:8765/query \
  -H 'content-type: application/json' \
  -d '{"query":"required copy release readiness","limit":4}'
```

Representative output:

```json
{
  "query": "required copy release readiness",
  "wiki_title": "Sample Packaging LLMWiki",
  "description": "Synthetic packaging operations knowledge base.",
  "adapter": "llmwiki-markdown",
  "implementation": "llmwiki-markdown",
  "page_count": 5,
  "approved_page_count": 4,
  "answerable": true,
  "orientation": [
    {
      "page_id": "hot",
      "title": "Current Focus",
      "path": "hot.md",
      "score": 1,
      "snippet": "The current focus is required label copy...",
      "role": "hot",
      "source_refs": ["SRC-HOT"],
      "route": "orientation"
    }
  ],
  "evidence": [
    {
      "page_id": "hot",
      "title": "Current Focus",
      "path": "hot.md",
      "score": 5.35,
      "snippet": "The current focus is required label copy...",
      "role": "hot",
      "source_refs": ["SRC-HOT"],
      "route": "search"
    }
  ],
  "limitations": ["1 draft or unapproved page(s) were withheld."],
  "graph": {
    "nodes": [
      {
        "id": "page:hot",
        "label": "Current Focus",
        "kind": "hot",
        "path": "hot.md",
        "metadata": {}
      }
    ],
    "edges": [
      {
        "source": "page:index",
        "target": "page:hot",
        "relation": "links_to",
        "metadata": {}
      }
    ]
  }
}
```

```sh
curl -s http://127.0.0.1:8765/mcp \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"llmwiki_context","arguments":{"query":"required copy release readiness","limit":4}}}'
```

Representative output:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "query": "required copy release readiness",
    "wiki_title": "Sample Packaging LLMWiki",
    "answerable": true,
    "evidence": [
      {
        "page_id": "hot",
        "title": "Current Focus",
        "path": "hot.md",
        "score": 5.35,
        "snippet": "The current focus is required label copy...",
        "role": "hot",
        "source_refs": ["SRC-HOT"],
        "route": "search"
      }
    ],
    "graph": {
      "nodes": [
        {
          "id": "page:hot",
          "label": "Current Focus",
          "kind": "hot",
          "path": "hot.md",
          "metadata": {}
        }
      ],
      "edges": [
        {
          "source": "page:index",
          "target": "page:hot",
          "relation": "links_to",
          "metadata": {}
        }
      ]
    }
  }
}
```

To smoke test the optional bridge without a model runtime, run the published
bridge package in a third terminal:

```sh
npx llmwiki-agent-bridge@latest
```

Send an evidence-only request:

```sh
curl -s http://127.0.0.1:8788/message:send \
  -H 'content-type: application/json' \
  -d '{
    "data": {
      "query": "release readiness",
      "mode": "evidence-only",
      "knowledgeSources": [
        {
          "id": "sample-wiki",
          "name": "Sample Wiki",
          "protocol": "llmwiki-http",
          "status": "ready",
          "url": "http://127.0.0.1:8765",
          "selected": true
        }
      ]
    }
  }'
```

Representative output:

```json
{
  "id": "generated-task-id",
  "status": {
    "state": "completed",
    "message": {
      "parts": [{ "kind": "text", "text": "Grounded answer text..." }]
    }
  },
  "message": {
    "role": "agent",
    "parts": [{ "kind": "text", "text": "Grounded answer text..." }]
  },
  "artifacts": [
    {
      "name": "llmwiki_agent_result",
      "parts": [
        {
          "kind": "data",
          "data": {
            "answer": "Evidence-only result: ...",
            "orchestrationMode": "evidence-only",
            "citations": [
              {
                "id": "sample-wiki:requester-return",
                "title": "Requester Return",
                "path": "requester-return.md",
                "snippet": "Requester return evidence...",
                "connectionId": "sample-wiki",
                "sourceRefs": []
              }
            ],
            "graph": { "nodes": [], "edges": [] },
            "sourceBundles": [
              {
                "connectionId": "sample-wiki",
                "sourceId": "sample-packaging-llmwiki",
                "bundleId": "sample-packaging-llmwiki:sha256:abc123..."
              }
            ],
            "steps": [
              { "id": "bridge-plan", "status": "done" },
              { "id": "bridge-evidence-only-answer", "status": "done" }
            ]
          }
        }
      ]
    }
  ]
}
```

## Bridge Request

`llmwiki-agent-bridge` includes a local A2A-style request payload at:

```text
examples/message-send.local.json
```

After starting `llmwiki-serve` on `127.0.0.1:8765` and the bridge on
`127.0.0.1:8788`, send the payload:

```sh
curl -s http://127.0.0.1:8788/message:send \
  -H 'content-type: application/json' \
  --data @examples/message-send.local.json
```

The bundled `examples/message-send.local.json` uses `mode: "evidence-only"`, so
it is runtime-free. The response should include a `llmwiki_agent_result`
artifact with citations, graph context, and trace steps. Configure a runtime
profile only when the bridge should synthesize the final answer.

## Chat Workbench

`llmwiki-chat` does not require a separate example fixture. The published
package is a static browser artifact with no CLI `bin`. Start the source
server, install the chat artifact, host its `dist/` directory, and use the
default direct Knowledge Source URL:

```sh
mkdir llmwiki-chat-static
cd llmwiki-chat-static
npm init -y
npm install llmwiki-chat@0.1.6
python -m http.server 5173 --directory node_modules/llmwiki-chat/dist --bind 127.0.0.1
```

The default direct source URL is `http://127.0.0.1:8765`.

In the browser workbench:

1. Open `http://127.0.0.1:5173` or the URL for your static host.
2. For direct source testing, confirm the Knowledge Source reports `ready`.
3. Use the Knowledge map, Pages, and Details panels to inspect graph context,
   source refs, and page details before asking.
4. Select a page to lazy-load its full markdown and navigate linked pages from
   the Details panel.
5. Select the local Agent Bridge and choose A2A or MCP mode when the bridge is
   already running. Registered bridge sources appear as bridge-managed,
   read-only cards and should be edited from bridge settings.
6. Use `Local Development Runtime` only for deterministic UI and source-flow
   testing without a model runtime.
7. Review the answer citations, artifacts, graph context, and trace steps before
   trusting the result.
