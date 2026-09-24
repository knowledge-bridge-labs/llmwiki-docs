# External Judgment Gates

External typed judgment models such as TypeSafe Jev/System-One can be useful in
front of expensive runtime synthesis. They are best used for narrow decisions:

- choose which registered Knowledge Source to inspect first;
- score whether a retrieved passage is relevant evidence;
- flag contradictions or prompt-injection-like content;
- decide whether a proposed tool/runtime path should run, be reviewed, or be
  rejected;
- check whether a generated answer is supported by cited source evidence.

They should not own source truth, authorization, draft visibility, projection
freshness, or destructive action approval.

`llmwiki-agent-bridge@0.6.1` adds the first built-in opt-in System-One/Jev
integration as a release candidate. The current published npm baseline remains
`llmwiki-agent-bridge@0.6.0` until registry publication and install-smoke finish.
Use the bridge source checkout for 0.6.1 testing before relying on package
installs.

## Recommended Placement

```text
raw wiki folder
  -> llmwiki-serve read-only projection
  -> bridge or host retrieval narrowing
  -> deterministic masking and minimization
  -> external typed judgment gate
  -> code-owned thresholds and fallback
  -> runtime synthesis or abstain
```

`llmwiki-serve` stays model-free. It projects local Markdown, Obsidian, or
LLMWiki folders into context, search, read, graph, source refs, and source
bundle responses. `llmwiki-agent-bridge`, a host agent, or an external gateway
owns optional judgment-provider calls.

In the 0.6.1 bridge slice, System-One is off by default. Runtime-route judgment
can run in `report-only` or explicit `enforce` mode. Source-routing,
evidence-relevance, citation-support, MCP progressive-disclosure, and
graph-expansion judgments are report-only diagnostics.

## Mask Before Calling

Served context is not declassified data. Even approved network responses can
include sensitive titles, graph labels, source refs, snippets, or project
structure. Before sending source-derived state to an external decision model,
the bridge or host should:

- include only fields needed for the specific typed question;
- mask credentials, bearer tokens, API keys, URLs, private endpoints, local
  roots, email addresses, phone numbers, source ids, page ids, bundle ids,
  source refs, and graph node ids;
- preserve graph/source shape with stable placeholders inside one request;
- log only model version, question schema, thresholds, redaction counts, input
  hashes, and route decisions;
- route low-confidence or provider-failure cases to review, fallback runtime,
  evidence-only answer, or abstain.

Masking is still not declassification. Operators should review provider data
retention, network path, and account policy before enabling live calls.

## What Belongs Where

| Decision | Owner |
| --- | --- |
| Source folder projection and draft filtering | `llmwiki-serve` |
| Source admission, auth, CORS, and URL policy | Bridge, gateway, or deployment |
| External judgment masking/export policy | Bridge or host |
| Typed judgment provider call | Bridge, host, or external gateway |
| Thresholds and fallback behavior | Bridge or host code |
| Final answer synthesis | Runtime adapter or host agent |

## Good First Gates

Start with report-only gates before changing runtime behavior:

1. Evidence usefulness: decide whether each retrieved passage should be kept,
   dropped, or reviewed.
2. Source routing: choose a small set of source bundles before fan-out.
3. Citation support: check whether cited snippets support the generated claim.
4. Tool/runtime risk: block or review risky proposed actions before execution.

Keep free-form answer generation with a runtime model. Use the judgment model
for bounded `yes/no`, `choice`, or `score` decisions.

## Bridge Configuration

The bridge uses `LLMWIKI_AGENT_BRIDGE_SYSTEM_ONE_*` environment variables and
accepts `LLMWIKI_AGENT_BRIDGE_EXTERNAL_JUDGMENT_*` aliases. Typical local
report-only testing starts with:

```sh
LLMWIKI_AGENT_BRIDGE_SYSTEM_ONE_API_KEY=... \
LLMWIKI_AGENT_BRIDGE_SYSTEM_ONE_MODE=report-only \
llmwiki-agent-bridge
```

Only `LLMWIKI_AGENT_BRIDGE_SYSTEM_ONE_MODE=enforce` can skip runtime synthesis,
and only for the runtime-route gate. Other System-One modes preserve source
selection, source calls, runtime prompts, answer text, citations, graph payloads,
and artifacts.
