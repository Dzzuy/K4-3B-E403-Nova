"""
Evaluator Agent Node.
Evaluates user explanation against RAG retrieved lesson context.
"""

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any
from pydantic import BaseModel, Field
from codebase.state.classroom_state import ClassroomState
from codebase.providers.llm import get_llm
from codebase.data_loader.rag_retriever import get_relevant_transcript_context

llm = get_llm(temperature=0.1)

class EvaluatorOutput(BaseModel):
    eval_status: str = Field(
        description="Must be either 'CORRECT' if user explained correctly according to lesson material, or 'INCORRECT' if user gave wrong/incomplete info."
    )

def evaluator_node(state: ClassroomState) -> Dict[str, Any]:
    """
    Evaluates User's explanation in Button 2 against RAG retrieved context.
    """
    lesson_id = state.get("lesson_id", state.get("topic_id", 1))
    context = state.get("source_context") or get_relevant_transcript_context(query=state['user_prompt'], lesson_id=lesson_id, top_k=3)

    prompt = f"""Tài liệu RAG bài giảng gốc:
{context}

Vấn đề ôn tập: {state['user_prompt']}
Alex phát biểu sai: {state.get('peer_statement', '')}
User vừa giảng lại: {state.get('user_response', '')}

Nhiệm vụ: Hãy đánh giá lời giảng lại của User.
- Trả về 'CORRECT' nếu User chỉ ra đúng chỗ sai của Alex và giải thích chuẩn xác theo tài liệu RAG.
- Trả về 'INCORRECT' nếu User giải thích sai thêm, bị lẫn lộn hoặc chưa thỏa đáng.

Chỉ trả về 1 từ duy nhất: CORRECT hoặc INCORRECT.
"""
    try:
        if hasattr(llm, "with_structured_output"):
            structured_llm = llm.with_structured_output(EvaluatorOutput)
            res = structured_llm.invoke(prompt)
            raw_status = res.eval_status if hasattr(res, "eval_status") else str(res)
        else:
            res = llm.invoke(prompt)
            raw_status = res.content if hasattr(res, "content") else str(res)
    except Exception:
        res = llm.invoke(prompt)
        raw_status = res.content if hasattr(res, "content") else str(res)

    raw_upper = str(raw_status).strip().upper()
    if "INCORRECT" in raw_upper:
        status = "INCORRECT"
    elif "CORRECT" in raw_upper:
        status = "CORRECT"
    else:
        status = "INCORRECT"

    trace_path = Path(__file__).resolve().parents[1] / "logs" / "ai_calls.jsonl"
    trace_path.parent.mkdir(parents=True, exist_ok=True)
    with trace_path.open("a", encoding="utf-8") as trace_file:
        trace_file.write(json.dumps({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "node": "evaluator",
            "user_prompt": state.get("user_prompt", ""),
            "peer_statement": state.get("peer_statement", ""),
            "user_response": state.get("user_response", ""),
            "raw_response": str(raw_status),
            "eval_status": status,
            "provider": getattr(llm, "provider", "openrouter"),
            "model": getattr(llm, "model", "openai/gpt-4.1-mini"),
        }, ensure_ascii=False) + "\n")

    return {"eval_status": status}
