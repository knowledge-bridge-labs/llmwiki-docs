# External Gateways

`llmwiki-agent-bridge` can run behind an external agent gateway, API gateway,
managed agent platform, reverse proxy, or internal service mesh when that
system already owns ingress and policy. In that placement, the bridge is an
LLMWiki Knowledge Gateway target or companion for evidence assembly.

The external gateway or operator owns authentication, authorization, routing,
TLS, public network exposure, rate limits, tenancy, scaling, deployment,
observability, credential storage, and hosted operations. The bridge owns
selected-source fan-out, evidence normalization, citations, graph context,
source-bundle metadata, diagnostics, trace steps, and optional runtime calls.

Use direct `llmwiki-serve` calls first when an agent can safely retrieve and
synthesize on its own. Add `llmwiki-agent-bridge` when a client needs one
normalized `llmwiki_agent_result` artifact. Add an external gateway in front
only when that gateway already controls the deployment boundary.

## Placement Patterns

| Pattern | Flow | Use when |
| --- | --- | --- |
| Direct source | `agent -> llmwiki-serve` | The agent owns retrieval planning, prompting, and answer composition. |
| Bridge companion | `client -> llmwiki-agent-bridge -> llmwiki-serve -> optional runtime` | The client wants source fan-out, citations, graph context, and one answer artifact. |
| Gateway-fronted bridge | `client -> external gateway -> llmwiki-agent-bridge -> llmwiki-serve -> optional runtime` | The operator already has a gateway for ingress, policy, routing, TLS, scaling, and hosted operations. |

## Bridge Responsibilities

Behind an external gateway, the bridge should stay focused on LLMWiki evidence:

- registered Knowledge Source selection
- bounded fan-out across selected `llmwiki-serve` sources
- HTTP, MCP-style, and A2A-style source retrieval
- graph-neighborhood context when requested with `graphContext`
- citation and source-bundle normalization
- evidence-only responses when no model runtime should be called
- runtime-backed responses through the configured bridge runtime adapter

Do not move source projection into the bridge. `llmwiki-serve` remains the
source projection and retrieval owner.

## MCP 2026-07-28 Compatibility Slice

The bridge documents a conservative MCP `2026-07-28` compatibility slice for
the bridge endpoint:

- `server/discover`
- version advertising for `2026-07-28`, `2025-06-18`, and `2024-11-05`
- sessionless `tools/list`
- sessionless `tools/call` for `llmwiki_agent_run` and read-only source tools

The bridge docs do not claim broad MCP conformance. Operators should validate
their gateway version against the exact bridge methods they plan to expose,
including request `_meta`, `resultType` handling, caching behavior, and
transport policy.

## Docker MCP Gateway

Docker MCP Gateway centralizes MCP server lifecycle, routing, authentication,
credentials, profiles, and container isolation. It can be evaluated as a
fronting gateway or catalog/profile workflow for `llmwiki-agent-bridge`.

Current reviewed Docker documentation and repository README did not document
MCP `2026-07-28` protocol-version support. Treat the bridge as a candidate
target and validate the deployed Docker MCP Gateway version before relying on
`server/discover` or sessionless MCP tool calls through that path.

## agentgateway

agentgateway is designed for MCP, A2A, and LLM traffic and documents virtual
MCP, federation patterns, MCP `2026-07-28` stateless/sessionless flow,
`server/discover`, and automatic version negotiation.

Typical local placement:

```text
client -> agentgateway -> llmwiki-agent-bridge /mcp -> llmwiki-serve sources
```

Use the bridge as the LLMWiki evidence target. Keep gateway policy, identity,
routing, observability, and platform operations in agentgateway.

## AWS Bedrock AgentCore Gateway

AWS Bedrock AgentCore Gateway is a fully managed gateway for agent, tool, and
model traffic. It can aggregate MCP targets, HTTP passthrough targets, and
inference routing with inbound and outbound authentication plus CloudWatch
observability. AWS documentation reviewed for this planning pass mentions MCP
server target support for protocol version `2026-07-28`.

Use an MCP target when the gateway should call bridge tools such as
`llmwiki_agent_run`, `llmwiki_context`, `llmwiki_search`, `llmwiki_read`,
`llmwiki_graph`, or `llmwiki_graph_neighbors`. Use HTTP passthrough only when
the operator intentionally fronts bridge HTTP routes such as `/message:send`.

## Operator Validation

Validate direct bridge behavior first:

```sh
curl -s http://127.0.0.1:8788/health
```

```sh
curl -s http://127.0.0.1:8788/mcp \
  -H 'content-type: application/json' \
  --data '{"jsonrpc":"2.0","id":1,"method":"server/discover","params":{}}'
```

```sh
curl -s http://127.0.0.1:8788/mcp \
  -H 'content-type: application/json' \
  --data '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
```

Then repeat the same checks through the external gateway. For shared
deployments, keep bridge bearer auth enabled, use an explicit source-origin
policy, terminate TLS at the gateway or platform edge, and keep private source
content out of logs unless the operator has explicitly approved that telemetry
path.

## References Reviewed

These links are reference points for the placement guidance above. Re-check
them when updating gateway-specific examples:

- [MCP 2026-07-28 `server/discover`](https://modelcontextprotocol.io/specification/2026-07-28/server/discover)
- [MCP 2026-07-28 changelog](https://modelcontextprotocol.io/specification/2026-07-28/changelog)
- [Docker MCP Gateway](https://docs.docker.com/ai/mcp-catalog-and-toolkit/mcp-gateway/)
- [agentgateway MCP spec compatibility](https://agentgateway.dev/docs/standalone/latest/documentation/mcp/spec-compatibility/)
- [AWS Bedrock AgentCore Gateway](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway.html)
- [AWS AgentCore MCP server targets](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway-target-MCPservers.html)
