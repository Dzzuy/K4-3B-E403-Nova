> Artifact kế hoạch. Emergency MVP CP3 thực tế đã được giản lược thành evaluator nhị phân `CORRECT` / `INCORRECT` được mô tả trong `spec.md` và `CP3_README.md`. Không coi các mục 3-route chưa triển khai bên dưới là tính năng đã hoàn thành.

# BLUEPRINT: K4-3B-E403-Nova CP3 Integration
## Vibecode Kit v6.0

### PROJECT INFO

| Field | Value |
|---|---|
| Project | K4-3B-E403-Nova — Track D1 classroom |
| Nature | One web learning flow, short-lived in-memory sessions, local CP3 demo scale |
| Date | 2026-09-18 |
| Contract source | `TIP-CP3-INTEGRATION`, `spec.md`, `eval/golden_set.json` |

### GOALS

**Primary Goal:** Demonstrate one real AI assessment and grounded multi-agent learning route for Attention.

**Target Audience:** A VLearn learner reviewing an Attention misconception.
**Key Message:** The learner can see a real backend decision, its grounded response, and the source used.

### ARCHITECTURE

```text
Next.js UI
  │  NEXT_PUBLIC_API_BASE_URL
  ▼
FastAPI session layer ── in-memory sessions
  │
  ▼
LangGraph learner-turn graph
  ├─ load_context → peer_challenge
  └─ assess_student (OpenRouter, structured output)
       ├─ CORRECT → peer_ack → instructor_conclusion
       ├─ NEEDS_HINT → ta_socratic
       └─ OFF_SCOPE → scope_guard
  │
  ├─ simple RAG retriever → approved source IDs
  └─ JSONL trace writer → local ignored trace file
```

The HTTP layer retains the small session dictionary between turns. The graph owns assessment and routing. The frontend never owns pedagogical logic.

### DESIGN SYSTEM

Reuse An's neutral classroom UI, layouts, components, static agent presentation, loading states, and source-panel interaction.

- Keep: chat stream, source pane, participants panel, static character treatment, Tailwind styling.
- Remove: `frontend/lib/orchestrator.ts`, Next API proxy/fallback routes, hard-coded source copies, and fake completion state.
- Error behaviour: show the backend error and Retry; never invent a successful answer.

### TECH STACK

| Layer | Chosen stack | Why |
|---|---|---|
| Orchestration | Existing Python LangGraph `StateGraph` | It already exists and conditional edges put the important route in one visible place. |
| Live model | OpenRouter + OpenAI-compatible SDK | One provider and one model reduce setup risk for CP3. |
| Retrieval | Existing lightweight BM25-style retriever plus a small approved concept map if needed | It is enough for one topic and avoids a vector DB. |
| HTTP | FastAPI + explicit local CORS origin | Minimal typed API for the Next frontend. |
| UI | Existing Next.js/React/Tailwind frontend | Preserves An's assigned visual work. |
| Evaluation | Python runner over Dat's canonical JSON | Lets results come from the actual graph instead of a copied expected route. |

### TARGET FILE STRUCTURE

```text
codebase/
  agents/                 # peer, TA, instructor, structured assessor
  graph/builder.py        # CP3 nodes and conditional routes
  data_loader/            # retained lightweight retriever
  providers/              # single OpenRouter client for live calls
  api.py                  # FastAPI health/session/turn endpoints
  tracing.py               # safe JSONL call trace helper
  run_eval.py              # actual graph evaluator
  .env.example
eval/
  golden_set.json          # canonical test input
  run1_results.json        # generated only after a real run
  run_results.md           # measured summary only
frontend/
  lib/api.ts               # direct FastAPI client
  app/, components/        # UI rendering only
tests/
  test_cp3_flow.py         # deterministic action and route contracts
docs/
  SCAN_REPORT.md
  CP3_VIDEO_SCRIPT.md
```

### REQUIREMENTS MATRIX

The user supplied a locked TIP rather than a separate RRI. Its P0 requirements are mapped below; no product requirement is invented.

| Blueprint section | Requirements | Source |
|---|---|---|
| Graph architecture | central assessor, 3 routes, loop guard, peer acknowledgement | TIP §§8–11 |
| Data and evaluation | canonical golden set, provenance truthfulness, actual observed routes | TIP §§6, 14–15 |
| Provider and trace | OpenRouter-only CP3 path, `.env.example`, safe JSONL trace | TIP §§7, 13 |
| API and UI | session endpoints, deterministic actions, backend-authoritative Next UI | TIP §§16–18 |
| Artifacts and quality | run report, demo docs, 18 acceptance criteria, incremental commits | TIP §§19–21 |

### TASK DECOMPOSITION PREVIEW

```text
TIP-CP3-01: Make golden set canonical and validate its coverage
TIP-CP3-02: Implement OpenRouter client, structured assessor, trace writer, and graph routes
TIP-CP3-03: Add minimal FastAPI session API and backend smoke tests
TIP-CP3-04: Connect An's UI directly to FastAPI and remove fake orchestration
TIP-CP3-05: Run actual evaluation, produce CP3 artifacts, and verify acceptance criteria
```

### RISKS & ASSUMPTIONS

| Risk | Level | Mitigation |
|---|---|---|
| `OPENROUTER_API_KEY` is absent | P0 | Stop live runs with the exact TIP message; do not fabricate results. |
| Source transcript pack is absent | P0 | Keep unverified provenance marked `NEEDS_USER_EVIDENCE`; do not claim a grounded live run. |
| Model route varies on edge cases | P1 | Record real failures and analyse them; do not tune by copying expected routes. |
| Frontend build breaks after fake API removal | P1 | Update the direct API client and run `npm run build` before claiming integration. |
| Legacy provider imports pull extra dependencies | P1 | Use one small OpenRouter wrapper and keep package changes minimal. |

Assumptions:

- CP3 is a local demonstration, so an in-memory session dictionary is enough.
- The 22 Dat cases are canonical but their claimed source provenance needs actual source evidence before being asserted as verified.
- The user instruction to continue after this blueprint is approval to execute its listed CP3 tasks.

### CHECKPOINT

- [x] Architecture follows the supplied TIP and existing ownership boundaries.
- [x] UI direction preserves An's work and removes duplicated intelligence.
- [x] Requirements map to the supplied TIP; no open architecture choice remains.
- [x] Task decomposition is small enough for CP3.
