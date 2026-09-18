from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List, Union
from backend.classroom_orchestrator import classroom_orchestrator
from backend.transcript_loader import transcript_service
from backend.slide_adapter import slide_service

app = FastAPI(
    title="VLearn Multi-Agent Classroom API",
    version="1.0.0",
    description="Backend for Track D1 - Lớp học mô phỏng đa tác tử trên VLearn"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StartSessionRequest(BaseModel):
    lesson_id: str = Field(default="transcript-06")
    student_name: str = Field(default="Học viên", min_length=1)
    peer_id: Optional[str] = Field(default="milo")

class SendMessageRequest(BaseModel):
    content: str = Field(..., min_length=1)
    lesson_id: Optional[str] = None
    slide_id: Optional[Union[str, int]] = None
    slide_title: Optional[str] = None
    slide_content: Optional[str] = None
    user_message: Optional[str] = None

class UpdateScenarioRequest(BaseModel):
    lesson_title: Optional[str] = None
    misconception: Optional[str] = None
    peer_name: Optional[str] = None
    peer_persona: Optional[str] = None
    ta_name: Optional[str] = None
    ta_persona: Optional[str] = None
    instructor_name: Optional[str] = None
    instructor_persona: Optional[str] = None
    citation_rule: Optional[str] = None

@app.get("/api/scenario")
def get_scenario():
    return classroom_orchestrator.get_scenario_config()

@app.post("/api/scenario")
def update_scenario(req: UpdateScenarioRequest):
    updates = req.dict(exclude_unset=True)
    return classroom_orchestrator.update_scenario_config(updates)

@app.get("/api/lesson")
def get_default_lesson():
    return {
        "lesson_id": "transcript-06",
        "title": "Attention Mechanism",
        "description": "Tìm hiểu cơ chế Attention, khắc phục điểm nghẽn biểu diễn của RNN và ma trận Q, K, V.",
        "source_file": "transcript-06.txt",
        "estimated_time": "5–10 minutes",
        "agents": ["Peer Agent (Minh)", "TA Agent (Linh)", "AI Instructor (Thầy Hoàng)"],
        "total_lines": transcript_service.total_lines,
        "current_concept": "Attention vs Sequential Bottleneck (Scaled Dot-Product)",
        "lines": [
            {"line_number": idx + 1, "text": text}
            for idx, text in enumerate(transcript_service.lines)
        ]
    }

@app.post("/api/instructor/scenario")
def update_instructor_scenario(req: UpdateScenarioRequest):
    updates = req.dict(exclude_unset=True)
    return classroom_orchestrator.update_scenario_config(updates)

@app.get("/api/sessions")
def get_sessions():
    return classroom_orchestrator.list_sessions()

class ParseFileSlidesRequest(BaseModel):
    text: str = Field(..., min_length=1)
    filename: Optional[str] = Field(default="custom_document.txt")

@app.get("/api/lessons/{lesson_id}/slides")
@app.get("/api/lesson/{lesson_id}/slides")
def get_lesson_slides(lesson_id: str, mode: Optional[str] = "detailed"):
    data = slide_service.get_lesson_slides(lesson_id, mode=mode or "detailed")
    if not data:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy slides cho bài học {lesson_id}")
    return data

@app.post("/api/slides/parse-file")
def parse_slides_from_file(req: ParseFileSlidesRequest):
    return slide_service.parse_custom_text_file(req.text, req.filename or "custom_document.txt")

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "vlearn-multi-agent-classroom"}

@app.get("/api/lesson/{lesson_id}")
def get_lesson(lesson_id: str):
    if lesson_id != "transcript-06":
        raise HTTPException(status_code=404, detail="Bài học không tồn tại")
    return {
        "lesson_id": lesson_id,
        "title": "Attention Mechanism (transcript-06)",
        "total_lines": transcript_service.total_lines,
        "lines": [
            {"line_number": idx + 1, "text": text}
            for idx, text in enumerate(transcript_service.lines)
        ]
    }

@app.post("/api/session/start", status_code=status.HTTP_201_CREATED)
def start_session(req: StartSessionRequest):
    session = classroom_orchestrator.create_session(
        student_name=req.student_name,
        lesson_id=req.lesson_id,
        peer_id=req.peer_id or "milo"
    )
    return session

@app.post("/api/session/{session_id}/message")
async def send_message(session_id: str, req: SendMessageRequest):
    try:
        slide_context = None
        if req.slide_id is not None or req.slide_title is not None:
            slide_context = {
                "lesson_id": req.lesson_id or "transcript-06",
                "slide_id": req.slide_id,
                "slide_title": req.slide_title,
                "slide_content": req.slide_content,
                "user_message": req.user_message or req.content
            }
        updated_session = await classroom_orchestrator.handle_student_message(
            session_id=session_id,
            student_content=req.content,
            slide_context=slide_context
        )
        return updated_session
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý tin nhắn: {str(e)}")

@app.get("/api/session/{session_id}")
def get_session(session_id: str):
    session = classroom_orchestrator.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session không tồn tại")
    return session

@app.get("/api/session/{session_id}/summary")
def get_session_summary(session_id: str):
    summary = classroom_orchestrator.get_session_summary(session_id)
    if not summary:
        raise HTTPException(status_code=404, detail="Session không tồn tại")
    return summary

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
