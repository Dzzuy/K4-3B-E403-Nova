"""Minimal CP3 web wrapper around Chuong's existing Peer/Evaluator/TA/Instructor nodes."""

from __future__ import annotations

from copy import deepcopy
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

from codebase.agents.evaluator_agent import evaluator_node
from codebase.agents.instructor_agent import instructor_conclusion_node
from codebase.agents.ta_agent import ta_socratic_node
from codebase.graph.builder import classroom_app


app = FastAPI(title="CP3 Classroom API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)
SESSIONS: dict[str, dict] = {}


def _message(raw: dict, index: int) -> dict:
    role = raw.get("role", "system")
    sender = {"peer": "PEER", "ta": "TA", "instructor_chot": "INSTRUCTOR", "student": "STUDENT"}.get(role, "TA")
    names = {"PEER": "Alex (Bạn học)", "TA": "Linh (Trợ giảng)", "INSTRUCTOR": "Giảng viên", "STUDENT": "Học viên"}
    return {
        "id": f"msg_{index}",
        "turn": index,
        "sender": sender,
        "sender_name": names[sender],
        "content": raw.get("content", ""),
        "citation": raw.get("citation"),
        "timestamp": raw.get("timestamp", "2026-09-18T00:00:00Z"),
    }


def _session_payload(session_id: str, state: dict, student_name: str) -> dict:
    messages = [_message(message, index) for index, message in enumerate(state.get("messages", []))]
    evidence = {
        "initial_understanding": "",
        "misconception": state.get("peer_statement") or "",
        "student_responses": [
            {"turn": message["turn"], "content": message["content"], "timestamp": message["timestamp"]}
            for message in messages if message["sender"] == "STUDENT"
        ],
        "ta_interventions": [
            {"turn": message["turn"], "type": "SOCRATIC", "message": message["content"]}
            for message in messages if message["sender"] == "TA"
        ],
        "instructor_feedback": [
            {"turn": message["turn"], "message": message["content"]}
            for message in messages if message["sender"] == "INSTRUCTOR"
        ],
        "final_explanation": next((message["content"] for message in reversed(messages) if message["sender"] == "INSTRUCTOR"), ""),
        "learning_outcome": "ACHIEVED" if state.get("completed") else "PENDING",
    }
    active_agent = state.get("active_agent", "PEER")
    return {
        "session_id": session_id,
        "lesson_id": "transcript-06",
        "lesson_title": "Attention Mechanism (transcript-06)",
        "student_name": student_name,
        "status": "ACHIEVED" if state.get("completed") else "IN_PROGRESS",
        "current_turn": len(evidence["student_responses"]) + 1,
        "phase": state.get("eval_status") or "WAITING_STUDENT_1",
        "active_agent": str(active_agent).upper().replace("INSTRUCTOR_CHOT", "INSTRUCTOR"),
        "peer_name": "Alex (Bạn học)",
        "misconception_resolved": bool(state.get("completed")),
        "learning_evidence": evidence,
        "messages": messages,
    }


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "source": "fastapi", "provider": "openrouter"}


@app.post("/api/session/start", status_code=201)
async def start_session(request: Request) -> dict:
    body = await request.json()
    session_id = f"sess_{uuid4().hex[:10]}"
    student_name = str(body.get("student_name") or "Học viên")
    state = {
        "mode": "REVIEW_CONCEPT",
        "lesson_id": 6,
        "topic_id": "transcript-06",
        "source_context": "",
        "user_prompt": "Attention Mechanism",
        "user_response": None,
        "ta_thinking_hint": None,
        "peer_statement": None,
        "eval_status": None,
        "messages": [],
        "active_agent": "PEER",
        "completed": False,
    }
    try:
        state.update(classroom_app.invoke(state))
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Peer live call failed: {exc}") from exc
    SESSIONS[session_id] = {"state": state, "student_name": student_name}
    return _session_payload(session_id, state, student_name)


@app.get("/api/session/{session_id}")
def get_session(session_id: str) -> dict:
    session = SESSIONS.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return _session_payload(session_id, session["state"], session["student_name"])


@app.post("/api/session/{session_id}/message")
async def send_message(session_id: str, request: Request) -> dict:
    session = SESSIONS.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    body = await request.json()
    content = str(body.get("content") or "").strip()
    if not content:
        raise HTTPException(status_code=400, detail="Student message is required")

    state = deepcopy(session["state"])
    state["user_response"] = content
    state["messages"] = [*state.get("messages", []), {"role": "student", "content": content}]
    try:
        state.update(evaluator_node(state))
        if state["eval_status"] == "CORRECT":
            state.update(instructor_conclusion_node(state))
            state["active_agent"] = "INSTRUCTOR"
            state["completed"] = True
        else:
            state.update(ta_socratic_node(state))
            state["active_agent"] = "TA"
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Evaluator live call failed: {exc}") from exc

    session["state"] = state
    return _session_payload(session_id, state, session["student_name"])


@app.get("/api/lesson/{lesson_id}")
def lesson(lesson_id: str) -> dict:
    return {"lesson_id": lesson_id, "title": "Attention Mechanism", "total_lines": 0, "lines": []}
