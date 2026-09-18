> Artifact kế hoạch. Emergency MVP CP3 thực tế đã được giản lược thành evaluator nhị phân `CORRECT` / `INCORRECT` được mô tả trong `spec.md` và `CP3_README.md`. Không coi các mục 3-route chưa triển khai bên dưới là tính năng đã hoàn thành.

# CP3 Integration Specification — K4-3B-E403-Nova

## Purpose

Build one small, real Attention practice flow. A learner replies to a peer's misconception. The backend makes the central AI decision. The UI only shows the resulting state.

`spec.md` from Dat remains the course/evidence specification. This file is the technical contract for CP3 integration and follows the supplied TIP.

## Scope

Included:

- One Attention topic with grounded sources.
- Real OpenRouter call for the central student assessor.
- Three assessor outcomes: `CORRECT`, `NEEDS_HINT`, `OFF_SCOPE`.
- LangGraph routing, in-memory session state, FastAPI endpoints, traces, and real golden-set evaluation.
- An's static classroom visual UI connected to the backend.

Not included:

- Auth, database, Redis, WebSocket/SSE, deployment, multi-topic learning paths, animation, or a vector database.
- A mock result presented as a CP3 live result.

## Authoritative Flow

```text
load context → peer challenge → wait for learner
                              ↓
                       central assessor
               ┌──────────────┼──────────────┐
            CORRECT       NEEDS_HINT      OFF_SCOPE
               ↓               ↓               ↓
          peer ack         TA hint        scope guard
               ↓               ↓               ↓
      instructor conclusion  wait          wait
```

- `CORRECT`: Peer acknowledges the misconception, then Instructor gives a short grounded conclusion.
- `NEEDS_HINT`: Peer stays silent and TA gives one Socratic hint. At most two hints and three learner attempts are allowed.
- `OFF_SCOPE`: Scope Guard refuses the unrelated/injected request and redirects to the current Attention claim.
- After the attempt cap, Instructor gives a grounded correction and asks one short explain-back question.

## Deterministic UI Actions

| Action | Backend behaviour | LLM call |
|---|---|---|
| `VIEW_SOURCE` | Return approved source/citation data | No |
| `EDIT_MESSAGE` | Keep the learner draft editable | No |
| `SKIP_HINT` | Mark the hint skipped and wait for the next learner response | No |
| `SUBMIT_RESPONSE` | Invoke the LangGraph learner-turn route | Yes, through the assessor |

Buttons never determine assessment status, agents, mastery, or routing.

## API Contract

| Endpoint | Request | Response responsibility |
|---|---|---|
| `GET /health` | — | backend readiness only |
| `POST /api/session` | `topic`, optional `pre_explanation` | create session, retrieve context, emit Peer event |
| `POST /api/session/{id}/turn` | `message`, `action` | deterministic action or actual graph result |

Each response exposes only UI state: `session_id`, `active_agent`, `events`, `route`, and safe citations. It never exposes API keys or full private source packs.

## Provider and Trace Contract

- Provider: OpenRouter via the OpenAI-compatible Python SDK.
- Required variables: `OPENROUTER_API_KEY`, `OPENROUTER_MODEL=openai/gpt-4.1-mini`, `OPENROUTER_BASE_URL=https://openrouter.ai/api/v1`.
- Missing key must stop live execution with the exact message in the TIP; it must not silently use a mock.
- Each real call writes one JSONL trace with node, provider, model, source IDs, parsed route, latency, and error. API keys and private full source text are excluded.

## Evaluation Contract

- `eval/golden_set.json` is the only canonical golden set.
- The evaluator sends each case through the actual backend/graph.
- `observed_route` comes from the graph result, never from `expected_routing`.
- A passing case needs the expected route, required content checks, and citation validation where the case needs grounding.
- Generated evidence is written to `eval/run1_results.json` and `eval/run_results.md`. No figures are invented.

## Acceptance Trace

| Requirement | Evidence after implementation |
|---|---|
| Central decision is real and graph-routed | graph smoke tests and trace entries |
| Correct/hint/off-scope routes work | deterministic test cases plus live smoke test |
| Source view is deterministic | action test with zero new trace entry |
| Golden set is valid and complete | JSON validation and coverage summary |
| Frontend has no AI fallback | repository search and frontend build |
| Secrets/private data stay out of Git | `.gitignore`, `.env.example`, and secret scan |

## Implementation References

- [LangGraph conditional edges](https://reference.langchain.com/python/langgraph/graph/state/StateGraph/add_conditional_edges)
- [OpenRouter OpenAI-SDK quickstart](https://openrouter.ai/docs/quickstart)
- [FastAPI CORS middleware](https://fastapi.tiangolo.com/tutorial/cors/)
- [Next.js environment variables](https://nextjs.org/docs/pages/guides/environment-variables)
