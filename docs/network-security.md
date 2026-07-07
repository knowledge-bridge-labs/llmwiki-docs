# Network & Security

The default posture is local-first. Treat each process as an operator-controlled
component and make trust boundaries explicit before exposing it beyond a
developer workstation.

## Local Defaults

`llmwiki-serve` should bind to loopback for local development:

```sh
uv run llmwiki-serve serve ./wiki --host 127.0.0.1 --port 8765
```

Its default CORS policy is scoped to local browser origins such as
`localhost`, `127.0.0.1`, and `[::1]` with explicit ports. Passing
`--cors-origin` replaces that local allowlist with the origins you provide.

## Source Data Handling

The source wiki folder remains the source of truth. The server should expose
derived projections only and should not rewrite wiki content.

By default, pages marked as drafts or unpublished are withheld from context,
read, search, and graph responses. Enable draft access only for trusted local
inspection because it changes what downstream agents and tools can see.

Symlinked Markdown, adapter marker/config files, and graph sidecars should stay
inside the selected wiki root. Avoid configurations that let a source endpoint
project files outside the intended root.

## Browser and Token Handling

`llmwiki-chat` can connect to Agent Bridges through A2A or MCP bridge modes.
Bridge bearer tokens should be sent only as `Authorization: Bearer ...` for
bridge discovery and run calls.

Do not store runtime bearer tokens in source descriptors, package artifacts, or
local documentation examples. Keep token handling process-local or memory-only
unless a deployment adds a reviewed secret-management layer.

## Bridge Trust Boundary

`llmwiki-agent-bridge` receives selected Knowledge Source descriptors and calls
an OpenAI-compatible runtime. Run it where it can reach both the source endpoint
and the runtime endpoint, and where logs can be controlled.

For private sources, prefer loopback or a private network path. For shared
deployments, put TLS, authentication, rate limits, and request logging outside
or in front of the bridge.

## URL Policy Matrix

Different URLs cross different trust boundaries. Do not treat one allowlist as
covering all of them.

| URL | Checked by | Local/private default | Public or shared default |
| --- | --- | --- | --- |
| Knowledge Source URL in chat | Browser CORS plus source reachability. | HTTP loopback, LAN, VPN, or a private network can be acceptable for trusted users. | Prefer public HTTPS or a protected reverse proxy. |
| Agent Runtime or bridge URL in chat | Chat runtime URL policy. | Loopback HTTP(S) is allowed. Private-network runtime URLs require the local dev private-runtime override. | Public HTTPS. |
| Bridge outbound source URL | Bridge `LLMWIKI_AGENT_BRIDGE_SOURCE_POLICY` and optional source-origin allowlist. | `private-http` is convenient for local, personal, VPN, or trusted private-network workflows. | Use `public-https` or `allowlist` with explicit origins. |
| A2A source message URL | Bridge source policy after agent-card discovery. | Allowed only when the resolved message URL passes source policy. | Require HTTPS or explicit allowlisting. |
| Provider/runtime base URL used by the bridge | Bridge process configuration. | Keep provider credentials in the bridge process environment or persisted bridge config. | Protect with service auth, TLS, and reviewed secret handling. |

Diagnostics should name the boundary that rejected a request, such as
`origin`, `auth`, `source-url`, or `runtime-url`, without exposing private
allowlists, bearer tokens, or full source URLs. Use
[Diagnostics](/diagnostics) to interpret these envelopes.

## Public Exposure Checklist

Before exposing any component outside loopback:

- Use HTTPS at the edge.
- Require authentication for private or draft-capable sources.
- Set an explicit CORS allowlist.
- Confirm draft/unpublished pages are withheld unless the endpoint is trusted.
- Decide whether graph responses can reveal sensitive page titles or links.
- Remove sample runtime tokens from shell history, docs, and CI logs.
- Review logs for query, citation, and evidence payload sensitivity.
- Pin package versions and keep lockfiles in release branches.

## Vulnerability Reporting

Use the per-repository `SECURITY.md` files for report intake. This portal should
link to those policies rather than inventing a separate process.
