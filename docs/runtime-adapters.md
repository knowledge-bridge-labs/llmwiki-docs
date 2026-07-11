# Runtime Adapters

Runtime adapters decide how a question becomes a model-produced answer. They
are separate from Knowledge Source adapters, which decide how context is read
from `llmwiki-serve`-compatible endpoints.

The default path is local-first. Use a direct source call when the agent can
retrieve context and synthesize the answer itself. Add a bridge or runtime
adapter only when a browser, runtime, or client wants source fan-out,
normalized trace/citation artifacts, or model-backed synthesis.

## Decision Tree

```text
Do you only need source context?
  -> Yes: call llmwiki-serve directly through HTTP or MCP tools.
  -> No: continue.

Do you have llmwiki-agent-bridge running near the runtime or sources?
  -> Yes: choose Agent Bridge A2A or Agent Bridge MCP in llmwiki-chat.
  -> No: continue.

Are you checking only the browser UI with deterministic mock output?
  -> Yes: use Local Development Runtime in llmwiki-chat as a testing adapter.
  -> No: continue.

Do you need bridge/source fan-out without a model runtime?
  -> Yes: run llmwiki-agent-bridge and send mode: "evidence-only".
  -> No: continue.

Does the runtime expose OpenAI-compatible /v1/chat/completions?
  -> Yes: run llmwiki-agent-bridge with hermes, deepagents, or generic profile.
  -> No: write or operate a runtime adapter outside this toolchain first.

Can the component doing retrieval reach the selected Knowledge Source URLs?
  -> Yes: continue with direct host calls or bridge fan-out.
  -> No: run the bridge near the sources, expose sources through public HTTPS,
     or use an allowlisted private network path.
```

## Adapter Matrix

| Adapter or profile | Lives in | Purpose | Readiness signal | Status posture |
| --- | --- | --- | --- | --- |
| Agent Bridge A2A | `llmwiki-chat` + `llmwiki-agent-bridge` | Connect to a bridge that exposes an A2A-compatible agent card and `message:send`. | Bridge agent card loads, message URL passes policy, `Test bridge` marks it ready. | Primary browser-to-bridge path for evidence-only or runtime-backed runs; not a vendor certification claim. |
| Agent Bridge MCP | `llmwiki-chat` + `llmwiki-agent-bridge` | Connect to a bridge that exposes MCP `llmwiki_agent_run` for the same grounded artifact. | `/mcp tools/list` exposes `llmwiki_agent_run`, `Test bridge` marks it ready. | Primary tool-oriented bridge path for evidence-only or runtime-backed MCP clients. |
| Local Development Runtime | `llmwiki-chat` | Deterministic UI exercise path using the development mock adapter while still calling selected sources. | Runtime is ready by default; selected source is ready; trace shows source tool calls. | Testing and UI checks only, not answer quality validation. |
| Hermes profile | `llmwiki-agent-bridge` | Runtime profile for Hermes-compatible local gateways. | Bridge `/health` reports `runtimeProfile: "hermes"` and `modelConfigured: true`. | Compatibility path, not product certification. |
| DeepAgents profile | `llmwiki-agent-bridge` | Runtime profile for DeepAgents-compatible local gateways. | Bridge `/health` reports `runtimeProfile: "deepagents"` and `modelConfigured: true`. | Compatibility path, not product certification. |
| Generic OpenAI-compatible profile | `llmwiki-agent-bridge` | Send evidence bundles to a `/v1/chat/completions` compatible endpoint. | Bridge `/health` reports `runtimeProfile: "generic"` and `modelConfigured: true`. | Runtime-profiled bridge path. |

## Agent Bridge In Chat

Use an Agent Bridge when the browser should hand selected Knowledge Sources to a
companion service for evidence fan-out, trace/citation normalization, and
optional runtime synthesis. The default local bridge URL is
`http://127.0.0.1:8788`.
Chat selects the local Agent Bridge path by default. If no bridge is running,
switch to Local Development Runtime from the testing/developer runtime area for
UI-only smoke tests.

Chat should present A2A and MCP as connection modes on a bridge card:

| Mode | Discovery | Run call |
| --- | --- | --- |
| A2A | `GET /.well-known/agent-card.json` | `POST /message:send` |
| MCP | `POST /mcp` `tools/list` | `POST /mcp` `tools/call` with `llmwiki_agent_run` |

Each bridge card may expose an `Open bridge settings` link. The link points to
the bridge's advertised settings URL when present, otherwise to `/settings` on
the configured bridge origin. The settings page is owned by
`llmwiki-agent-bridge`; chat only links to it.

The settings page guides first-time setup:

1. Connect runtime through `PUT /settings/config.json` when runtime synthesis is needed.
2. Register Knowledge Sources through `GET/PUT /settings/sources.json`.
3. Verify Bridge by sending `POST /message:send` from the page. Evidence-only verification does not require a model runtime.

After the bridge is ready, chat asks the bridge for registered Knowledge
Sources through the bridge MCP `llmwiki_list_sources` tool. Sources returned by
the bridge are displayed in chat as bridge-managed, read-only source cards.
Edit or remove those sources in bridge settings. Use direct source cards in
chat only when you want to test or debug a `llmwiki-serve` endpoint without
going through a bridge.

Diagnostics/advanced contains network, auth, CORS, timeout, source-policy, and
bind controls. Host and port changes are saved for the next bridge start, so
they require a restart before chat should reconnect to the new address.

When a bridge run completes, chat keeps the run details anchored with the
assistant answer. Citations and evidence buttons are displayed in runtime read
order when the bridge/runtime supplies structured citation ids on trace steps;
inline markdown citation links continue to resolve to the original runtime
citations even when the visible evidence list is reordered.
Source trace steps may include `citationIds`, `citationRefs`, and compact
evidence path/title previews so the completed run can show which source
evidence was gathered before runtime synthesis.

If a delegated runtime returns citations but the answer markdown contains no
`[n](#citation-n)` anchors, the bridge appends a bounded `Evidence used:`
fallback anchor list. Treat that as runtime output normalization only; source
evidence still belongs to the selected Knowledge Source.

## Local Development Runtime

Use Local Development Runtime when you need deterministic browser behavior
without operating a real model runtime or bridge.

Run:

```sh
cd ../llmwiki-serve
uv run llmwiki-serve serve ./examples/sample-wiki --host 127.0.0.1 --port 8765
```

```sh
cd ../llmwiki-chat
npm run dev
```

Readiness checks:

| Check | Expected result |
| --- | --- |
| `http://127.0.0.1:8765/health` | `{ "status": "ok" }` |
| Chat source card | Default source URL is ready. |
| Runtime selection | `Local Development Runtime` is available under testing/developer runtime options. |
| Ask flow | Answer appears with trace steps, citations, and graph context when the selected source returns them. |

Use this adapter for:

- UI regression checks
- citation rendering checks
- graph continuity checks
- source selection and cancellation behavior
- local demo flows that should not depend on model quality

Do not use it as evidence that Hermes, DeepAgents, Copilot, or any other
external runtime is correctly configured. Do not confuse it with bridge
evidence-only mode: Local Development Runtime is a chat mock path, while
bridge evidence-only mode exercises the real bridge and selected sources
without a model call.

## A2A Bridge Mode

Use A2A bridge mode when the selected bridge exposes an A2A-style discovery
card and `message:send` endpoint.

Bridge/A2A URL expectations:

- Public HTTPS is accepted.
- Loopback HTTP(S) is accepted for local development.
- Private-network bridge URLs require
  `VITE_LLMWIKI_CHAT_ALLOW_PRIVATE_AGENT_RUNTIME_URLS=true` in local dev.
- The agent card `message:send` URL must also pass the bridge URL policy.

Readiness checks:

| Check | Expected result |
| --- | --- |
| Bridge URL | Non-empty bridge URL. |
| Optional bearer token | Sent as `Authorization: Bearer ...` for discovery and message send, but not persisted by the browser app. |
| `Test bridge` | Marks the bridge ready after agent-card discovery succeeds. |
| Message response | Returns a text answer or a structured `llmwiki_agent_result` artifact. |
| Source reachability | Selected sources are reachable by the host loop, bridge, or approved proxy path that performs retrieval. |

Common failures:

| Symptom | Meaning | Next check |
| --- | --- | --- |
| Bridge URL is required | The bridge card was selected before a URL was configured. | Enter the bridge URL and run `Test bridge`. |
| URL policy error | The bridge or agent-card message URL is private, malformed, or uses an unsupported protocol. | Use public HTTPS, loopback for local dev, or enable the private bridge URL dev override. |
| Missing artifact | The runtime returned text but no `llmwiki_agent_result` data artifact. | Treat text as fallback output and inspect runtime integration. |

## Bridge Runtime Path

Use `llmwiki-agent-bridge` when the runtime exposes OpenAI-compatible
chat-completions but not the A2A-style result shape that `llmwiki-chat` expects.
The bridge accepts A2A-style or MCP tool calls, queries selected Knowledge
Sources, calls the runtime, and returns a normalized answer artifact.

Bridge path:

```text
client or llmwiki-chat
  -> llmwiki-agent-bridge
  -> selected Knowledge Sources
  -> OpenAI-compatible runtime
  -> llmwiki_agent_result artifact
```

Minimum readiness checks:

| Check | Expected result |
| --- | --- |
| Runtime endpoint | `LLMWIKI_AGENT_BRIDGE_BASE_URL` reaches an OpenAI-compatible `/v1` endpoint. |
| Model | `LLMWIKI_AGENT_BRIDGE_MODEL` names a model accepted by the runtime. |
| Profile | `LLMWIKI_AGENT_BRIDGE_RUNTIME_PROFILE` is `hermes`, `deepagents`, or `generic`. |
| Bridge health | `/health` returns `status: "ok"`, `modelConfigured: true`, and the expected `runtimeProfile`. |
| Agent card | `/.well-known/agent-card.json` returns the expected runtime identity. |
| MCP tools | `/mcp` `tools/list` returns `llmwiki_agent_run` when MCP bridge mode is enabled. |
| Source policy | Selected Knowledge Source URLs pass `LLMWIKI_AGENT_BRIDGE_SOURCE_POLICY`. |
| Settings verify | Step 3 of `/settings` sends `POST /message:send` and returns `llmwiki_agent_result` with answer, citations, graph, and steps. |

Source protocols accepted by the bridge:

| Source protocol | Bridge behavior |
| --- | --- |
| `llmwiki-http` | Calls `POST /query` on the selected Knowledge Source and may augment with compact `/search` calls. |
| `mcp` | Calls `llmwiki_context` through JSON-RPC. |
| `a2a` | Discovers the agent card, posts a message, and prefers a `llmwiki_context` artifact. |

The bridge uses these protocols to retrieve served projections. It must not
derive local paths from descriptors or handles; raw-source and current-evidence
coordination stays behind source-owned policies.

## Bridge Profiles

Profiles are configuration presets over the same bridge contract. They do not
change the source evidence shape or the returned `llmwiki_agent_result`
artifact.

### Hermes

Use this profile for a Hermes-compatible local gateway that exposes
OpenAI-compatible chat completions.

```sh
LLMWIKI_AGENT_BRIDGE_BASE_URL=http://127.0.0.1:8642/v1 \
LLMWIKI_AGENT_BRIDGE_MODEL=hermes-agent \
LLMWIKI_AGENT_BRIDGE_RUNTIME_PROFILE=hermes \
node ./bin/llmwiki-agent-bridge.mjs
```

Expected health fields:

```json
{
  "runtimeProfile": "hermes",
  "runtimeId": "llmwiki-agent-bridge-hermes",
  "agentRuntime": "hermes",
  "modelConfigured": true
}
```

### DeepAgents

Use this profile for a DeepAgents-compatible local runtime that exposes
OpenAI-compatible chat completions.

```sh
LLMWIKI_AGENT_BRIDGE_BASE_URL=http://127.0.0.1:8642/v1 \
LLMWIKI_AGENT_BRIDGE_MODEL=deepagents-local \
LLMWIKI_AGENT_BRIDGE_RUNTIME_PROFILE=deepagents \
node ./bin/llmwiki-agent-bridge.mjs
```

Expected health fields:

```json
{
  "runtimeProfile": "deepagents",
  "runtimeId": "llmwiki-agent-bridge-deepagents",
  "agentRuntime": "deepagents",
  "modelConfigured": true
}
```

### Generic OpenAI-Compatible

Use this profile for a local runtime that implements `/v1/chat/completions` but
does not need Hermes or DeepAgents identity.

```sh
LLMWIKI_AGENT_BRIDGE_BASE_URL=http://127.0.0.1:8642/v1 \
LLMWIKI_AGENT_BRIDGE_MODEL=local-model \
LLMWIKI_AGENT_BRIDGE_RUNTIME_PROFILE=generic \
node ./bin/llmwiki-agent-bridge.mjs
```

Expected health fields:

```json
{
  "runtimeProfile": "generic",
  "runtimeId": "llmwiki-agent-bridge-generic-openai-compatible",
  "agentRuntime": "openai-compatible",
  "modelConfigured": true
}
```

## Source Policy And Network Fit

The bridge validates every outbound Knowledge Source URL before fetching it.

| Policy | Meaning | Typical use |
| --- | --- | --- |
| `private-http` | Allows loopback, private-network, and public HTTP/HTTPS source origins. | Local, personal, VPN, and trusted private-network workflows. |
| `allowlist` | Allows only exact origins listed in `LLMWIKI_AGENT_BRIDGE_ALLOWED_SOURCE_ORIGINS`. | Shared bridge deployments with explicit source admission. |
| `public-https` | Allows loopback, exact allowlisted origins, and public HTTPS origins. Blocks private HTTP origins unless allowlisted. | Public or semi-public bridge deployments. |

For browser access to the bridge, configure
`LLMWIKI_AGENT_BRIDGE_ALLOWED_ORIGINS`. For outbound source admission, configure
`LLMWIKI_AGENT_BRIDGE_SOURCE_POLICY` and
`LLMWIKI_AGENT_BRIDGE_ALLOWED_SOURCE_ORIGINS`. These are separate controls.

## Failure Modes

| Surface | Failure | Expected behavior |
| --- | --- | --- |
| Local Development Runtime | Source not ready | Ask flow should be unavailable or return a source error trace. |
| Agent Bridge A2A | Agent card cannot be discovered | Bridge remains unavailable until `Test bridge` succeeds. |
| Agent Bridge A2A | Bridge message URL is not allowed | Discovery fails with a URL policy message. |
| Agent Bridge MCP | `llmwiki_agent_run` is missing | Bridge remains unavailable in MCP mode; check bridge version and `/mcp` routing. |
| Bridge startup | Non-loopback bind without opt-in | Startup fails and asks for `LLMWIKI_AGENT_BRIDGE_ALLOW_PUBLIC_BIND=1`. |
| Bridge request | Missing bridge bearer token | HTTP `401`. |
| Bridge browser request | Origin not allowed | HTTP `403`. |
| Bridge runtime call | Chat-completions endpoint fails | HTTP `502` from `/message:send`. |
| Bridge source call | One source fails or is blocked | Trace step records the source error; other usable sources can still continue. |

## Named Slot Caveat

Named runtime slots identify expected request and response behavior. They do
not mean the repository bundles, launches, hosts, or product-validates the
runtime. Operators still choose, configure, secure, and monitor the runtime
separately.
