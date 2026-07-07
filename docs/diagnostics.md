# Diagnostics

LLMWiki components should expose failure context as observable facts, not as a
large catalog of product-specific failure codes. The goal is to help an
operator answer four questions quickly:

- Which component observed the problem?
- Which phase failed?
- What safe facts were observed?
- What can the user try next?

## Diagnostic Envelope

`llmwiki-agent-bridge` and `llmwiki-chat` use a small diagnostic envelope on
failed or degraded trace steps. Fatal bridge responses can include the same
shape alongside the normal HTTP or JSON-RPC error.

```json
{
  "schemaVersion": "llmwiki.agent-bridge.diagnostic.v1",
  "severity": "error",
  "scope": "bridge",
  "phase": "request",
  "protocol": "llmwiki-http",
  "subject": "project-wiki",
  "retryable": true,
  "redacted": true,
  "observations": [
    { "name": "httpStatus", "value": "404" },
    { "name": "latencyMs", "value": "42" },
    { "name": "policy", "value": "source-url" }
  ],
  "remediation": "Test the Knowledge Source from the bridge host, then retry.",
  "message": "The bridge could not query the selected Knowledge Source."
}
```

The stable contract is the small set of dimensions: `severity`, `scope`,
`phase`, `protocol`, `subject`, `retryable`, `observations`, and
`remediation`. `observations` are bounded name/value facts. The human text in
`message`, `remediation`, step `detail`, and step `error` is best-effort copy
and may change between releases.

## Standards Baseline

The envelope is deliberately close to existing observability patterns instead
of being a separate failure-code system:

- [RFC 9457 Problem Details](https://www.rfc-editor.org/rfc/rfc9457.html)
  is the HTTP-facing baseline: use stable top-level fields such as `status`,
  `title`, `detail`, and extension members when a plain HTTP endpoint needs a
  structured error body.
- [W3C Trace Context](https://www.w3.org/TR/trace-context/) and
  [OpenTelemetry](https://opentelemetry.io/docs/concepts/context-propagation/)
  are the correlation baseline: propagate a trace ID when possible and model
  source calls, runtime calls, retrieval, and tool execution as steps/spans.
- LLM observability tools such as
  [Langfuse](https://langfuse.com/docs/observability/overview),
  [Phoenix](https://arize.com/docs/phoenix),
  [Helicone](https://docs.helicone.ai/features/sessions),
  [OpenInference](https://arize-ai-openinference.mintlify.app/introduction),
  and [Traceloop](https://www.traceloop.com/docs/openllmetry/introduction)
  converge on traces, observations, sessions, metadata, and filtered debugging
  views rather than exhaustive product-specific error-code catalogs.

LLMWiki components should therefore keep diagnostics small, redacted, and
operator-readable. Future exporters can map these envelopes to OpenTelemetry or
LLM observability backends without changing the user-facing chat and bridge
contracts.

## Trace IDs

Every bridge run should include a `traceId`. When a client displays a failed
answer, settings verification result, or issue-report payload, include that
trace ID so the same attempt can be correlated with bridge logs.

When possible, clients and bridges should propagate W3C `traceparent` headers
on outbound HTTP calls. The trace ID is diagnostic metadata; it is not an auth
token and must not contain private source content.

## Reading Diagnostics

Read diagnostics by combining fields instead of matching a code:

| Field | Meaning |
| --- | --- |
| `scope` | The component that observed the problem: `client`, `bridge`, `runtime`, or `source`. |
| `phase` | The lifecycle phase: configuration, discovery, authorization, connection, request, response, or synthesis. |
| `protocol` | The path involved, such as `llmwiki-http`, `mcp`, `a2a`, `bridge-a2a`, `bridge-mcp`, or `chat-completions`. |
| `subject` | The source, bridge, or runtime the user was trying to use. |
| `observations` | Safe name/value facts such as HTTP status, JSON-RPC code, A2A state, timeout, latency, or policy boundary. |
| `remediation` | Best-effort operator guidance. Clients can pair this with generic UI actions such as retrying, testing a source, opening bridge settings, switching to evidence-only mode, or opening docs. |

## Common Patterns

### Browser Can Reach A Source, But The Bridge Cannot

This usually appears as:

```json
{
  "scope": "bridge",
  "phase": "connection",
  "protocol": "llmwiki-http",
  "subject": "project-wiki",
  "observations": [{ "name": "timeoutMs", "value": "120000" }]
}
```

If the source URL is `127.0.0.1` or `localhost`, remember that it is interpreted
from the process making the call. A browser running on one machine and a bridge
running on another machine do not share the same loopback address. Use a
private-network URL, private DNS name, tunnel, or colocate the bridge with the
source.

### Runtime Responded Without Cited Evidence

This is a degraded answer, not necessarily a transport failure:

```json
{
  "severity": "warning",
  "scope": "runtime",
  "phase": "synthesis",
  "protocol": "chat-completions",
  "observations": [{ "name": "latencyMs", "value": "8800" }]
}
```

Review the trace, citations, and answer body. The bridge may append bounded
fallback citation anchors when the runtime returns an answer without valid
`[n](#citation-n)` anchors.

### Origin Or Policy Boundary Blocked The Request

Policy failures should expose the boundary, not a private allowlist:

```json
{
  "scope": "bridge",
  "phase": "authorization",
  "observations": [{ "name": "policy", "value": "origin" }],
  "redacted": true
}
```

Check the URL policy matrix and the configured CORS/source policy for the
component that observed the rejection.

## Issue Reports

When filing a bug, include a redacted diagnostic report rather than raw logs.
The report should contain:

- package versions and commit hashes
- selected protocols and redacted origins
- the failing trace ID
- failed or warning trace steps
- diagnostic envelopes
- source/runtime readiness states

Do not include API keys, bearer tokens, private wiki content, local absolute
paths, or full raw source URLs with query strings.
