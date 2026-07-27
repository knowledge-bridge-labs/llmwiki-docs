# Deployment

The toolchain is local-first. Choose the smallest network shape that lets the
intended clients reach the Knowledge Source and runtime bridge.

## Local Workstation

Use loopback when the browser, bridge, runtime, and wiki server run on the same
machine.

```sh
llmwiki-serve serve /path/to/wiki --host 127.0.0.1 --port 18765
```

This is the safest default for development because the server is not reachable
from other machines.

## Private Network

Use a private IP, VPN, private overlay network, or SSH tunnel when another
trusted machine needs access.

Prefer an SSH or VPN tunnel when possible, because `llmwiki-serve` does not
provide built-in authentication:

```sh
ssh -L 18765:127.0.0.1:18765 user@wiki-host
```

If you must bind the source directly, bind to a specific trusted private
interface rather than all interfaces:

```sh
llmwiki-serve serve /path/to/wiki --host <trusted-private-interface-ip> --port 18765 \
  --cors-origin http://<trusted-client-host>:5173
```

Before any non-loopback bind:

- choose a private network route before a public route
- bind to a specific private interface instead of `0.0.0.0`
- restrict browser origins with `--cors-origin`
- keep draft serving disabled unless the workflow is trusted
- avoid sharing raw response logs from private wikis
- put authentication, TLS, and firewall controls in front of shared endpoints

## Agent Bridge

Run `llmwiki-agent-bridge` on loopback unless a remote client must call it. A
public or shared bind should use an explicit bearer token and restrictive source
policy.

```sh
LLMWIKI_AGENT_BRIDGE_BASE_URL=http://127.0.0.1:8642/v1 \
LLMWIKI_AGENT_BRIDGE_MODEL=local-agent \
LLMWIKI_AGENT_BRIDGE_RUNTIME_PROFILE=generic \
npx llmwiki-agent-bridge@latest
```

For shared hosts, review the bridge's `LLMWIKI_AGENT_BRIDGE_SOURCE_POLICY`,
`LLMWIKI_AGENT_BRIDGE_ALLOWED_SOURCE_ORIGINS`, and
`LLMWIKI_AGENT_BRIDGE_BEARER_TOKEN` settings.

## Public Preview

Do not treat the preview defaults as a production security boundary. For public
or internet-reachable deployments:

- serve behind TLS
- add authentication and authorization outside the preview server
- review source content before serving it
- disable draft access
- keep Knowledge Source URLs and runtime tokens out of client-visible logs
- document the exact protocol caveats in the deployment README

## Hosted Docs

The documentation site is built by GitHub Actions. The included Pages deployment
job publishes the VitePress artifact when GitHub Pages is enabled for the docs
repository.
