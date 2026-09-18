# CP3 Evaluation Artifacts

This folder contains evaluation evidence for the Track D1 classroom MVP.

## `golden_set.json`

Canonical golden set: **22 cases**

### Taxonomy

| Category | Count |
|---|---:|
| Source truth | 5 |
| Ambiguous / missing information | 5 |
| Out-of-scope / authority | 5 |
| Domain-specific | 7 |

### Actual difficulty distribution

| Difficulty | Count |
|---|---:|
| Easy | 7 |
| Medium | 10 |
| Hard | 5 |

### Current source labels

| Source label | Count |
|---|---:|
| `chatlog_mining` | 16 |
| `synthetic` | 6 |

### Current frequency labels

| Frequency | Count |
|---|---:|
| Common | 16 |
| Rare | 6 |

The source labels are declarations stored in the case file. They should not be interpreted as independently verified provenance unless a source log is also available.

## `run_results.md`

Human-readable first live run summary:

```text
7 / 22 PASS
31.82%
```

## `run1_results.json`

Use a copy of:

`../codebase/runs/eval_run_openai_20260918T145054.json`

The included `FINALIZE_CP3_ARTIFACTS.sh` copies it automatically when run from the repo root.

## `traces/cp3_ai_calls.jsonl`

Use a safe evidence copy of the local runtime trace:

`../codebase/logs/ai_calls.jsonl`

The included finalize script copies it if the local file exists.

## Per-case PASS definition

A case passes when all relevant assertions are satisfied:

1. expected learning behavior / agent route;
2. required concepts are present;
3. prohibited behavior is absent;
4. grounding/citation requirements are met where required;
5. Socratic cases do not become direct-answer responses.

## Run 1 interpretation

Run 1 is intentionally treated as a baseline. A low score is not rewritten or hidden.

Largest observed weakness:

**out-of-scope handling — 0/5 passed.**
