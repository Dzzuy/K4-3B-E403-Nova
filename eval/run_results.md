# CP3 Run 1

Provider: OpenAI
Model: default
Date/time: 2026-09-18T14:50:54.753963

This is the existing committed live baseline at `codebase/runs/eval_run_openai_20260918T145054.json`. A fresh 22-case run was not started during the emergency integration window.

Cases: 22
Passed: 7
Failed: 15
Pass rate: 31.82%

Main failures:
- All 5 out-of-scope cases failed in the baseline.
- Medium and hard cases still need better grounded routing and response checks.

The CP3 web smoke test now uses OpenRouter `openai/gpt-4.1-mini`; its live evaluator trace is stored locally in `codebase/logs/ai_calls.jsonl`.
