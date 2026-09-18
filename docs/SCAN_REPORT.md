# SCAN REPORT — CP3 Integration

Generated: 2026-09-18
Scope: Dat `dc7bdbb`, Chuong `308d664`, and the `frontend/` directory from An `a8cd8ca`.

## TECH_STACK

- Language: Python and TypeScript
- Backend: LangGraph state graph, LangChain-based baseline provider/RAG, FastAPI not yet present
- Frontend: Next.js 15, React 19, Tailwind CSS 3
- Database/Auth: None; CP3 uses an in-memory session store
- State: `ClassroomState` in the backend; React local state in the frontend
- Other: BM25-style transcript retriever, OpenRouter provider stub, JSON golden set

## EXISTING_MODULES

- `eval/golden_set.json`: Dat's 22-case CP3 golden set.
- `spec.md`: Dat's course/product spec. It remains the evidence and product-behaviour source.
- `codebase/graph/builder.py`: Existing LangGraph foundation.
- `codebase/agents/`: Peer, TA, Instructor, and evaluator nodes.
- `codebase/data_loader/rag_retriever.py`: Lightweight retriever to retain for CP3.
- `codebase/providers/`: Provider abstraction with an OpenRouter entry point.
- `frontend/`: An's visual classroom UI and API client structure.

## PATTERNS_DETECTED

- Backend nodes return state patches and messages.
- The graph currently stops after initial peer output; the CLI manually calls the evaluator and follow-up agents.
- Frontend currently proxies through Next API routes and falls back to its own TypeScript orchestrator.
- Existing RAG context carries source tags such as `[T06-040]`.

## REUSABLE_COMPONENTS

- `frontend/components/ClassroomChat.tsx`: chat rendering.
- `frontend/components/ParticipantsPanel.tsx`: active-agent display.
- `frontend/components/LessonContext.tsx`: source-panel UI.
- `frontend/lib/api.ts`: API-client starting point.
- `codebase/data_loader/rag_retriever.py`: simple retrieval baseline.
- `codebase/graph/builder.py`: StateGraph starting point.

## GAPS_DETECTED

- Evaluator only returns `CORRECT` or `INCORRECT`; CP3 needs `CORRECT`, `NEEDS_HINT`, and `OFF_SCOPE`.
- The live evaluator copies golden-set expected routing into observed routing, so the metric is invalid.
- No FastAPI endpoint, in-memory session API, CORS, trace writer, or live-call guard exists.
- `codebase/eval/golden_set.json` duplicates Dat's canonical `eval/golden_set.json`.
- `frontend/lib/orchestrator.ts` and `frontend/app/api/**` contain fake orchestration, hard-coded transcript text, fallback success, and an absolute `/Users/...` path.
- The backend's configured transcript directory is not present on the integrated branch. Real source chunks must be supplied/verified before a grounded live run.
- There are no automated tests and no checked-in `.env.example` for CP3.

## CODE_HEALTH

- Type safety: strict TypeScript; Python type coverage is partial.
- Linting: no lint command configured.
- Tests: none found.
- Debug artifacts: frontend fallback logs and a legacy evaluation result are present in source history; not used as CP3 evidence.
- TODO/FIXME: none found, but the architectural gaps above are P0.

## ESTIMATED_SIZE

- Frontend: 36 files, about 4,265 lines.
- Backend baseline: 24 files, about 2,962 lines.
- API routes/endpoints: frontend has 8 internal routes; the canonical FastAPI API is still to be built.

## INTEGRATION DECISIONS

1. Keep Dat's `spec.md` and `eval/golden_set.json` unchanged as the product/evaluation sources.
2. Retain Chuong's StateGraph and retriever, but move central routing into the graph.
3. Retain An's layouts and components only. Remove the TypeScript orchestrator and all fake fallback routes.
4. Do not fabricate transcript provenance or a real evaluation result when the source data/API key is absent.
