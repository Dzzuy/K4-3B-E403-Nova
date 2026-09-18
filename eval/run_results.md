# CP3 — Evaluation Run 1

## Run information

- Date: 2026-09-18
- Golden set: `eval/golden_set.json`
- Total cases: **22**
- Execution: **LIVE API baseline**
- Provider in recorded run: **OpenAI**
- Raw result: `codebase/runs/eval_run_openai_20260918T145054.json`

> This is the first committed live baseline. The score is intentionally kept unchanged even though it is low.

## Summary

| Metric | Result |
|---|---:|
| Total cases | 22 |
| Passed | 7 |
| Failed | 15 |
| Pass rate | **31.82%** |

## Results by taxonomy

| Taxonomy | Passed | Total | Pass rate |
|---|---:|---:|---:|
| Source truth | 3 | 5 | 60.00% |
| Ambiguous / missing information | 2 | 5 | 40.00% |
| Out-of-scope / authority | 0 | 5 | 0.00% |
| Domain-specific | 2 | 7 | 28.57% |

## Main failures

### 1. Out-of-scope handling

All 5 out-of-scope cases failed.

Observed problems included:

- answering questions that should have been redirected;
- following prompt-injection style instructions;
- answering advanced topics beyond the current lesson instead of narrowing scope.

### 2. Retrieval / grounding

Some retrieved context was related to Lesson 06 but was not the most relevant passage for the learner's exact claim.

### 3. Missing required content or citation

Some responses were directionally correct but missed required technical concepts or citation expectations.

### 4. Medium / hard domain cases

Several cases involving Q/K/V, Softmax, Self-Attention and deeper technical reasoning were incomplete.

## Important limitation of Run 1

The original Run 1 runner was an early baseline. Its live response generation was real, but routing instrumentation was not yet a fully independent routing benchmark.

Therefore:

**31.82% is reported as the first end-to-end case-pass baseline, not as a pure routing-accuracy score.**

The number is preserved because CP3 values honest measurement and failure analysis over a fabricated high score.

---

# Current Web MVP Smoke Test

After frontend/backend integration, the live demo uses:

- Provider: **OpenRouter**
- Model: **`openai/gpt-4.1-mini`**

## Test A — correct rebuttal

Input:

> Không đúng, Attention không xóa từ mà gán trọng số theo mức độ liên quan.

Result: **PASS**

```text
Peer → real Evaluator → Instructor → ACHIEVED
```

## Test B — incorrect response

Input:

> Đúng rồi, Attention bỏ hết các từ không quan trọng.

Result: **PASS**

```text
Peer → real Evaluator → TA → IN_PROGRESS
```

## Trace

Runtime evaluator trace:

`codebase/logs/ai_calls.jsonl`

Safe repo evidence copy:

`eval/traces/cp3_ai_calls.jsonl`

The API key is never included in evaluator trace output.
