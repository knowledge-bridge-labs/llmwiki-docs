# Community

This page collects the public-preview contribution, support, and security
routes for the LLM Wiki-style toolchain documentation portal.

Repository links point at the `knowledge-bridge-labs` GitHub organization. Use
local sibling checkouts when working offline, testing mirrors, or preparing
unpublished changes.

## Contributing

Use the per-repository contribution guides when changing package behavior:

| Repository | Use it for |
| --- | --- |
| `llmwiki-serve` | Knowledge source projection, HTTP endpoints, MCP-style tools, and A2A-style source surfaces. |
| `llmwiki-agent-bridge` | Runtime profiles, source adapters, grounded answer artifacts, and trace behavior. |
| `llmwiki-chat` | Browser workbench UX, source connection flows, bridge selection, and accessibility. |
| `llmwiki-docs` | Cross-repository quickstart, architecture, protocol, operations, and release documentation. |

For docs-only changes, open a pull request against:

```txt
https://github.com/knowledge-bridge-labs/llmwiki-docs
```

Keep compatibility claims conservative. The public preview describes
HTTP, MCP-style, and A2A-style surfaces; it does not claim certified protocol
conformance unless a future release gate explicitly adds that status.

## Support

Use GitHub issues for reproducible setup, packaging, integration, and
documentation problems after the public-preview repositories are live.

Include:

- repository and version or commit
- operating system and runtime versions
- commands used to start the server, bridge, or chat client
- sanitized request/response snippets for source, bridge, or runtime calls
- whether the connection is loopback, private network, or intentionally public

## Security

Do not paste private wiki content, runtime credentials, private-network
topology details, private network names, or unpublished repository links into
public issues.

For vulnerabilities or sensitive reports, follow the repository `SECURITY.md`
route. Do not disclose sensitive details in public issues.

## Code of Conduct

Project spaces use the repository Code of Conduct. For public-preview launch,
each repository should expose a private conduct-reporting route for sensitive
reports. Use that route instead of public issues when conduct details should
not be public.

The canonical Code of Conduct lives at:

```txt
https://github.com/knowledge-bridge-labs/llmwiki-docs/blob/main/CODE_OF_CONDUCT.md
```

## Documentation Issues

For documentation problems, prefer a small pull request when the fix is
unambiguous. Use an issue when the problem depends on missing design context,
release timing, or cross-repository behavior.
