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

`llmwiki-serve==0.2.13` includes a default-off System-One/Jev query-action
judgment gate after normal context assembly. `llmwiki-agent-bridge@0.6.1` adds
the bridge-side opt-in System-One/Jev integration as a release candidate. The
current published bridge npm baseline remains `llmwiki-agent-bridge@0.6.0`
until registry publication and install-smoke finish.

## Recommended Placement

```text
raw wiki folder
  -> llmwiki-serve read-only projection
  -> optional serve query-action judgment
  -> bridge or host retrieval narrowing
  -> deterministic masking and minimization
  -> external typed judgment gate
  -> code-owned thresholds and fallback
  -> runtime synthesis or abstain
```

By default, `llmwiki-serve` stays model-free. It projects local Markdown,
Obsidian, or LLMWiki folders into context, search, read, graph, source refs,
and source bundle responses. Serve 0.2.13 can optionally call System-One/Jev
after `/query` only when the operator enables `--query-action-judge
system-one` or `LLMWIKI_QUERY_ACTION_JUDGE=system-one`. `llmwiki-agent-bridge`,
a host agent, or an external gateway can still own broader source-routing,
runtime-route, evidence-relevance, and answer-support judgments.

In the 0.6.1 bridge slice, System-One is off by default. Runtime-route judgment
can run in `report-only` or explicit `enforce` mode. Source-routing,
evidence-relevance, citation-support, MCP progressive-disclosure, and
graph-expansion judgments are report-only diagnostics.

In Serve 0.2.13, query-action judgment is also off by default. When enabled, it
returns additive `retrieval_action_guidance` with a recommended next retrieval
action such as `stop`, `read`, `search`, `graph`, or `ask_clarification`. It
does not rerank evidence, synthesize answers, change draft visibility, or
rewrite the source. Use `LLMWIKI_QUERY_ACTION_JUDGE_API_KEY` for the provider
key; `TYPESAFE_API_KEY` and `JEV_API_KEY` are accepted as compatibility aliases.
Provider keys stay in environment variables, not CLI arguments or public issue
logs.

The release-candidate bridge sends structural provider state by default. Source
names and descriptions, page titles and snippets, graph labels and relations,
answer text, and cited claim snippets are reduced to counts and shape signals
before the provider call. Graph-expansion and citation-support report-only gates
also skip the provider call when there is no graph, multi-source, source-bundle,
or cited-anchor state to evaluate.

## Mask Before Calling

Served context is not declassified data. Even approved network responses can
include sensitive titles, graph labels, source refs, snippets, or project
structure. Before sending source-derived state to an external decision model,
the bridge or host should:

- include only fields needed for the specific typed question;
- mask credentials, bearer tokens, API keys, URLs, private endpoints, local
  roots, email addresses, phone numbers, source ids, page ids, bundle ids,
  source refs, and graph node ids;
- reduce source/page/graph/answer wording to structural signals unless the
  operator has made a separate explicit decision to share text with a provider;
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
| Optional post-query action hint | `llmwiki-serve` when explicitly enabled |
| Source admission, auth, CORS, and URL policy | Bridge, gateway, or deployment |
| External judgment masking/export policy | Bridge or host |
| Typed judgment provider call | Bridge, host, or external gateway |
| Thresholds and fallback behavior | Bridge or host code |
| Final answer synthesis | Runtime adapter or host agent |

## Good First Gates

Start with report-only gates before changing runtime behavior:

1. Evidence usefulness: decide whether each retrieved passage should be kept,
   dropped, or reviewed using minimized source/citation shape first.
2. Source routing: choose a small set of source bundles before fan-out.
3. Citation support: start with cited-anchor coverage and structural support
   signals before considering any text-sharing policy.
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
and artifacts. Report-only graph-expansion and citation-support modes skip
provider calls when the request has no evaluable structural graph/multi-source
or cited-anchor state.
