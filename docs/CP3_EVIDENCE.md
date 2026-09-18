# CP3 Verification Map

| CP3 requirement | Status | Repository evidence |
|---|---|---|
| Prototype can be operated end-to-end | PASS | `frontend/`, `codebase/api.py` |
| At least one real AI call at central decision | PASS | `codebase/agents/evaluator_agent.py` |
| No silent mock fallback for central evaluator | PASS | `codebase/providers/llm.py` |
| Golden set ≥20 | PASS | `eval/golden_set.json` — 22 cases |
| Four difficult-case classes represented | PASS | 5 / 5 / 5 / 7 cases |
| First full measurement exists | PASS | `eval/run_results.md` |
| Raw first-run evidence exists | PASS | `codebase/runs/eval_run_openai_20260918T145054.json` |
| Pass/fail percentage reported | PASS | 7/22 = 31.82% |
| Failures analysed | PASS | `eval/run_results.md` |
| AI trace available | PASS locally; copy for repo evidence | `codebase/logs/ai_calls.jsonl` → `eval/traces/cp3_ai_calls.jsonl` |
| API key excluded from Git | PASS | `.gitignore` |
| Prototype real/mock status declared honestly | PASS after replacing | `spec.md` |
| 30-second realtime video | EXTERNAL SUBMISSION | Google Form / submitted video |

## Live demo provider

```text
OpenRouter
openai/gpt-4.1-mini
```

## Live demo smoke tests

```text
Correct rebuttal
Peer → Evaluator → Instructor → ACHIEVED
PASS
```

```text
Incorrect response
Peer → Evaluator → TA → IN_PROGRESS
PASS
```

## Known gaps

The following are intentionally not claimed as completed CP3 features:

- dedicated OFF_SCOPE graph route;
- advanced retry loop;
- production persistence;
- adaptive difficulty;
- complete user-validation package;
- polished character animation.
