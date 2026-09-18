"""
Evaluator Agent Node.
Evaluates user explanation against RAG retrieved lesson context.
"""

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
Alex phát biểu sai hoặc hiểu nhầm: {state.get('peer_statement', '')}
User vừa giảng lại: {state.get('user_response', '')}

Nhiệm vụ: Bạn là một giám khảo cực kỳ KHẮT KHE. Hãy đánh giá lời giảng lại của User. 
Tiêu chí đánh giá:
1. Trả về 'CORRECT' CHỈ KHI User vạch ra được chỗ sai của Alex, ĐỒNG THỜI giải thích ĐẦY ĐỦ, CHUẨN XÁC, đi đúng vào trọng tâm của tài liệu RAG.
2. BẮT BUỘC trả về 'INCORRECT' trong các trường hợp sau:
   - User chỉ nói cụt lủn (ví dụ: "sai rồi", "đúng", "không phải") mà không giải thích vì sao.
   - User giải thích sai kiến thức, hoặc giải thích chung chung, lảng tránh, thiếu từ khóa cốt lõi của bài học.
   - User đòi hỏi đáp án hoặc thuận theo ý kiến sai của Alex.

Chỉ trả về 1 từ duy nhất: CORRECT hoặc INCORRECT. Không giải thích thêm.
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

    return {"eval_status": status}
