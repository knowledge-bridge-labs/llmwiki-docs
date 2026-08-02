# Compatibility & Benchmark Evidence

This page records public compatibility-smoke evidence and deterministic
benchmark summaries for
[`llmwiki-serve`](https://github.com/knowledge-bridge-labs/llmwiki-serve).
It is not quality certification, runtime certification, upstream endorsement,
or a public answer-quality claim.

Package registry status is tracked in
[Release Status & Compatibility](/status). This page does not restate the
current package baseline or claim package quality for that baseline. The smoke
report summary below is compatibility-only; the deterministic benchmark rows
remain strict quality-gate records and do not create a public quality claim.

The compatibility-smoke input summarized here is a Windows upstream
compatibility-smoke report with schema
`llmwiki-serve-upstream-candidate-smoke-v1`, mode `smoke`, and evidence track
`compatibility-smoke`. A stable tracked public report artifact is pending; this
page intentionally does not link local or untracked report paths.

The deterministic benchmark summary also records Windows and Ubuntu/DGX parity
for OpenWiki and Pratiyush. The Ubuntu/DGX run used Ubuntu 24.04 on `aarch64`
with the NVIDIA GB10 class hardware bucket / DGX Spark. OpenWiki and Pratiyush
semantic metrics and payload-token metrics match the Windows deterministic
runs.

## Summary

| Signal | Value |
| --- | --- |
| Compatibility cases | 12 |
| Source files projected | 1,397 |
| Pages projected | 501 |
| Approved pages projected | 501 |
| Graph nodes projected | 2,092 |
| Graph edges projected | 2,887 |
| Mutation status | All cases recorded unchanged checkout status and unchanged source hash. |
| License evidence | 7 cases reported an SPDX-style license value; 5 cases require license review because the report did not find an explicit repository content license at the pinned commit. |
| Deterministic parity | OpenWiki and Pratiyush semantic and payload-token metrics match across Windows and Ubuntu/DGX deterministic runs. |

All cases met their per-case smoke minimums for page counts and graph counts in
the report. The smoke checks projection compatibility for pinned public static
sources. It does not judge source content quality, retrieval quality, answer
correctness, model behavior, or vendor-runtime conformance. No quality metrics
are guessed on this page.

## Environment Coverage

| Environment | Evidence status |
| --- | --- |
| [Windows](https://www.microsoft.com/windows) | Verified by the current compatibility-smoke report and the finalized retrieval metric rows below. |
| [Ubuntu](https://ubuntu.com/) | Deterministic parity verified on Ubuntu 24.04, `aarch64`; OpenWiki and Pratiyush semantic and payload-token metrics match Windows deterministic runs. |
| [NVIDIA DGX](https://www.nvidia.com/en-us/data-center/dgx-systems/) | Deterministic parity verified in the NVIDIA GB10 class hardware bucket / DGX Spark. This is not Qwen Agent tier validation. |
| [macOS](https://www.apple.com/macos/) | Not tested. |

## Compatibility Cases

| Case | Product | Pinned commit | Adapter | Source files / pages / approved pages | Graph nodes / edges | License evidence | Mutation status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `atomic-compiler-basic` | [atomicstrata/llm-wiki-compiler](https://github.com/atomicstrata/llm-wiki-compiler) | `69701f609ae166e9da194c2d340699eb43abf77e` | `llmwiki-markdown` | 8 / 8 / 8 | 65 / 96 | MIT | Clean |
| `samuraigpt-agent` | [SamurAIGPT/llm-wiki-agent](https://github.com/SamurAIGPT/llm-wiki-agent) | `11f66f1166994b35de2d7d3d0b246cb28847bbf2` | `llmwiki-markdown` | 30 / 3 / 3 | 11 / 9 | MIT | Clean |
| `pratiyush-llm-wiki` | [Pratiyush/llm-wiki](https://github.com/Pratiyush/llm-wiki) | `b1088890ee0743810a92577aecad946c6b3eb2d2` | `llmwiki-markdown` | 563 / 22 / 22 | 86 / 108 | MIT | Clean |
| `logseq-exporter-test-graph` | [logseq/logseq](https://github.com/logseq/logseq) | `a9a67f61ab29972d2e2b6c7a5864e6e3306c0d9a` | `logseq` | 73 / 54 / 54 | 105 / 73 | AGPL-3.0 | Clean |
| `foam-template` | [foambubble/foam-template](https://github.com/foambubble/foam-template) | `84fa1844270d214520aca32c01d4e27c6728d12e` | `foam` | 116 / 79 / 79 | 785 / 940 | needs-review: no explicit repository content license found at pinned commit | Clean |
| `dendron-test-workspace` | [dendronhq/dendron](https://github.com/dendronhq/dendron) | `4420715a421756518863c47005c8c49a38e37621` | `dendron` | 202 / 154 / 154 | 403 / 440 | Apache-2.0 | Clean |
| `karpathy-llm-wiki-vault` | [jason-effi-lab/karpathy-llm-wiki-vault](https://github.com/jason-effi-lab/karpathy-llm-wiki-vault) | `18f4e71518af7d0c51a2fc65f5e3ec3043668e54` | `llmwiki-markdown` | 19 / 19 / 19 | 163 / 315 | needs-review: no explicit repository content license found at pinned commit | Clean |
| `langchain-openwiki-self-docs` | [langchain-ai/openwiki](https://github.com/langchain-ai/openwiki) | `9c253af17f264ac2589ab6781e79e9bb5b5d1238` | `llmwiki-markdown` | 14 / 13 / 13 | 116 / 125 | MIT | Clean |
| `microsoft-llmwiki-fixtures` | [microsoft/llmwiki](https://github.com/microsoft/llmwiki) | `74a8a5bf0011b1092f135e5cbc51bbb44c1e07e7` | `generic-markdown` | 5 / 5 / 5 | 13 / 8 | MIT | Clean |
| `luotwo-llm-wiki` | [luotwo/llm-wiki](https://github.com/luotwo/llm-wiki) | `9ab20ee0e9db3ca0bc7998b1b4a97ba7c821279f` | `llmwiki-markdown` | 15 / 11 / 11 | 51 / 95 | needs-review: no explicit repository content license found at pinned commit | Clean |
| `nishio-llm-wiki-about-delite` | [nishio/llm-wiki-about-delite](https://github.com/nishio/llm-wiki-about-delite) | `4181dd42ff78d72a5e5a05512a59dc37d7ef97a2` | `quartz` | 318 / 129 / 129 | 261 / 648 | needs-review: no explicit repository content license found at pinned commit; Quartz/tooling license is not treated as sampled content license | Clean |
| `iblinkq-llm-wiki-obsidian-blink` | [iBlinkQ/llm-wiki-obsidian-blink](https://github.com/iBlinkQ/llm-wiki-obsidian-blink) | `a9e8399cc29dbcce75fb47f61f1f2034a9dfc199` | `obsidian` | 34 / 4 / 4 | 33 / 30 | needs-review: no explicit repository content license found at pinned commit | Clean |

`Clean` means the smoke report recorded both
`checkout_status_unchanged: true` and `source_hash_unchanged: true` for that
case.

## Sidecar Boundary

Native `hot.md`, `index.md`, `overview.md`, and root `quickstart.md` files are
untouched. The managed-context sidecar is a generic-only external opaque
sidecar outside the served root. It is not a source page or graph file.

The sidecar boundary keeps managed-context metadata separate from native source
content. Clients should continue to treat source pages and graph files as the
served projection inputs, and should not infer local files or private storage
layout from opaque handles.

## Retrieval Quality

Deterministic retrieval metrics are recorded for the verified OpenWiki and
Pratiyush summaries. Ubuntu/DGX parity is verified on Ubuntu 24.04, `aarch64`,
NVIDIA GB10 class hardware bucket / DGX Spark; semantic metrics and
payload-token metrics match the Windows deterministic runs, so separate metric
tables are not duplicated here.
`public_quality_claim=false` for every listed row, and no quality pass is
claimed.

Tokenizer accounting used
`Qwen/Qwen3.6-35B-A3B`, revision
`53c43178507d69762986fbfa314f6e8d4d859409`, with `Qwen2Tokenizer`.
The reports record local Qwen tokenizer-load verification and no byte/mock
token-count proxy.

| Case | Variant | Corpus records | Queries | Qrels | Gate | `public_quality_claim` |
| --- | --- | ---: | ---: | ---: | --- | --- |
| OpenWiki | native | 13 | 57 | 164 | fail | false |
| OpenWiki | generic-shadow | 13 | 55 | 141 | fail | false |
| Pratiyush | native | 22 | 60 | 172 | fail | false |
| Pratiyush | generic-shadow | 22 | 55 | 144 | fail | false |

Native cold evidence rows use `service_context` runs. Native managed-on
evidence is an exact no-op versus managed off for these reports: ranking,
citation metrics, negative FPR, and payload tokens are unchanged.

| Case | Managed | Recall@5 | MRR | nDCG@10 | Citation P/R | Negative FPR | Payload p50/p95 tokens | Gate |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| OpenWiki | off | 0.9169 | 0.9054 | 0.8424 | 0.4877 / 0.8742 | 1.0000 | 8400 / 8410 | fail |
| OpenWiki | on | 0.9169 | 0.9054 | 0.8424 | 0.4877 / 0.8742 | 1.0000 | 8400 / 8410 | fail |
| Pratiyush | off | 0.8527 | 0.8815 | 0.8006 | 0.3986 / 0.7436 | 1.0000 | 7390 / 7421 | fail |
| Pratiyush | on | 0.8527 | 0.8815 | 0.8006 | 0.3986 / 0.7436 | 1.0000 | 7390 / 7421 | fail |

## Managed Context On/Off

Generic-shadow cold evidence rows use `service_context` runs. Managed-on
evidence is unchanged versus managed off; only payload tokens changed.

| Case | Managed | Recall@5 | MRR | nDCG@10 | Citation P/R | Negative FPR | Payload p50/p95 tokens | Gate |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| OpenWiki | off | 0.9960 | 0.9667 | 0.9200 | 0.4909 / 0.9926 | 1.0000 | 7386 / 7397 | fail |
| OpenWiki | on | 0.9960 | 0.9667 | 0.9200 | 0.4909 / 0.9926 | 1.0000 | 7319 / 7330 | fail |
| Pratiyush | off | 0.8570 | 0.8533 | 0.8037 | 0.3647 / 0.7405 | 1.0000 | 6963 / 6991 | fail |
| Pratiyush | on | 0.8570 | 0.8533 | 0.8037 | 0.3647 / 0.7405 | 1.0000 | 6892 / 6928 | fail |

| Case | Evidence delta | Samples |
| --- | --- | ---: |
| OpenWiki | evidence unchanged; token delta mean -67, CI95 [-67, -67] | 1000 |
| Pratiyush | evidence unchanged; token delta mean -71.3, CI95 [-77.7, -65.6] | 1000 |

Generic-shadow cold orientation rows use `service_context_orientation` runs.
Managed context improved orientation retrieval, but negative FPR stayed at
`1.0000` and all quality gates still failed.

| Case | Managed | Recall@5 | MRR | nDCG@10 | Citation precision | Citation recall | Negative FPR | Payload p50/p95 tokens |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| OpenWiki | off | 0.1527 | 0.1600 | 0.0955 | 0.1455 | 0.1765 | 1.0000 | 7386 / 7397 |
| OpenWiki | on | 0.5153 | 0.7200 | 0.5140 | 0.6091 | 0.4926 | 1.0000 | 7319 / 7330 |
| Pratiyush | off | 0.0000 | 0.0000 | 0.0000 | 0.0000 | 0.0000 | 1.0000 | 6963 / 6991 |
| Pratiyush | on | 0.5540 | 0.7700 | 0.5300 | 0.5514 | 0.4504 | 1.0000 | 6892 / 6928 |

OpenWiki orientation point deltas were recall +0.3627, MRR +0.5600, and
nDCG +0.4185. The verified OpenWiki report does not emit paired off/on
orientation bootstrap CI, so none is claimed.

Pratiyush orientation deltas with CI95 and 1000 samples were recall +0.5540
CI [0.4607, 0.6457], MRR +0.7700 CI [0.6700, 0.8600], nDCG +0.5300
CI [0.4519, 0.6024], and payload tokens mean -188.3 CI [-427.9, -69.1].

Cold latency changed across runs and is noisy. This page makes no latency
improvement or public latency claim. Pratiyush evidence cold latency improved
in CI, but OpenWiki evidence and orientation cold latency worsened.

No public retrieval-quality claim is made. The current blockers are:
negative FPR is `1.0000` for all listed cold evidence and orientation rows,
above the `<=0.05` threshold; citation precision is below `0.95` in all listed
evidence and orientation rows; OpenWiki native evidence `nDCG@10` is `0.8424`,
below `0.85`; Pratiyush native and generic-shadow evidence miss recall and/or
nDCG/citation-recall thresholds as listed by report gates; selected
search-read token p95 gates still fail in the verified reports; Qwen agent-tier
validation is pending; and macOS remains untested.

## Qwen Agent Tier

[`Qwen Agent`](https://github.com/QwenLM/Qwen-Agent) tier metrics remain
pending. The deterministic retrieval summaries verify tokenizer accounting for
Qwen payload measurements on Windows and Ubuntu/DGX, but they do not verify
Qwen Agent tool use, tool-call failure rate, source-report integrity, citation
integrity, or model-answer quality.

No public Qwen Agent quality or tier claim is made.

## Non-Claims

- Not quality certification.
- Not MCP, A2A, Qwen Agent, or vendor-runtime certification.
- Not a model-answer quality benchmark.
- Not an endorsement or affiliation claim for any upstream producer.
- Not proof that private wiki content is safe to expose without operator review,
  network controls, authentication, and logging policy.
