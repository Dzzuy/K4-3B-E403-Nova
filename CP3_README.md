# CP3 Evidence

## Demo

Backend:

```bash
uvicorn codebase.api:app --reload --port 8000
```

Frontend:

```bash
cd frontend
npm run dev
```

## Live AI

- Provider: OpenRouter
- Model: `openai/gpt-4.1-mini`
- Quyết định AI trung tâm: `codebase/agents/evaluator_agent.py`

## Trace

- Bằng chứng CP3 được chuẩn bị để commit: `eval/traces/cp3_ai_calls.jsonl`
- Runtime trace local: `codebase/logs/ai_calls.jsonl`

## Golden Set

`eval/golden_set.json` — 22 cases.

## Run 1

`eval/run_results.md` — 7/22 = 31.82%.

Raw historical run: `codebase/runs/eval_run_openai_20260918T145054.json`.

## MVP Flow

Attention → Peer misconception → learner rebuttal → real LLM evaluator

`CORRECT` → Instructor

`INCORRECT` → TA

## Current Limitations

- binary evaluator only
- advanced off-scope routing not yet implemented
- some secondary UI utilities retain static/local content
- Run 1 remains below desired product quality
