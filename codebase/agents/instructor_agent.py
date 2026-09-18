"""
Instructor Agent Node.
Provides the authoritative summary and conclusion with required citations [Txx-NNN].
Uses RAG retrieval to fetch exact relevant chunks rather than raw full files.
"""

from typing import Dict, Any
from codebase.state.classroom_state import ClassroomState
from codebase.providers.llm import get_llm
from codebase.data_loader.rag_retriever import get_relevant_transcript_context

llm = get_llm(temperature=0.3)

def instructor_conclusion_node(state: ClassroomState) -> Dict[str, Any]:
    """
    Final Resolution Node for both Button 1 and Button 2:
    Provides the authoritative wrap-up and ALWAYS cites the exact transcript tags [Txx-NNN] as evidence.
    """
    lesson_id = state.get("lesson_id", state.get("topic_id", 1))
    query = state.get("user_prompt", "")
    
    # Retrieve top RAG context if not already present or refresh for precise citation
    context = state.get("source_context", "")
    if not context or "=== TÀI LIỆU RAG" not in context:
        context = get_relevant_transcript_context(query=query, lesson_id=lesson_id, top_k=4)

    if state["mode"] == "ASK_TA":
        context_summary = f"Học viên hỏi: '{state['user_prompt']}'. Sau gợi mở của TA, Học viên trả lời: '{state.get('user_response', '')}'."
    else:
        context_summary = f"Ôn tập vấn đề: '{state['user_prompt']}'. Alex phát biểu: '{state.get('peer_statement', '')}'. User giảng lại: '{state.get('user_response', '')}'."

    prompt = f"""Bạn là Giảng viên đứng lớp.
{context}

Tóm tắt diễn biến:
{context_summary}

Nhiệm vụ:
1. Nhận xét ngắn gọn, khích lệ quá trình trao đổi của cả Alex, TA và Học viên.
2. Tổng hợp và chốt lại định nghĩa/kiến thức chuẩn xác nhất dựa trên nội dung bài giảng trích xuất phía trên (trả lời trực tiếp vào vấn đề).
3. BẮT BUỘC chỉ rõ và trích dẫn trực tiếp mã trích dẫn [Txx-NNN] (ví dụ: [T01-019], [T01-027]) từ tài liệu RAG phía trên để làm bằng chứng cụ thể cho kết luận.
"""
    res = llm.invoke(prompt)
    msgs = list(state.get("messages", []))
    msgs.append({"role": "instructor_chot", "content": f"👨‍🏫 Giảng viên chốt: {res.content}"})
    return {"source_context": context, "messages": msgs}
