"""
Peer Student (Alex) Agent Node.
Uses RAG retrieval for active lesson to generate targeted misconception statements.
"""

from typing import Dict, Any
from codebase.state.classroom_state import ClassroomState
from codebase.providers.llm import get_llm
from codebase.data_loader.rag_retriever import get_relevant_transcript_context

llm = get_llm(temperature=0.5)

def btn2_peer_misconception_node(state: ClassroomState) -> Dict[str, Any]:
    """
    Button 2 Handler:
    Invoked when User wants to review a concept with Peer Student (REVIEW_CONCEPT mode).
    Peer Student Alex makes a common misconception statement (WRONG or PARTIALLY CORRECT) based on RAG materials.
    """
    lesson_id = state.get("lesson_id", state.get("topic_id", 1))
    context = get_relevant_transcript_context(query=state['user_prompt'], lesson_id=lesson_id, top_k=3)

    prompt = f"""Bạn là bạn học Alex trong lớp.
{context}

Học viên muốn cùng bạn ôn tập về vấn đề trong Bài {lesson_id}: "{state['user_prompt']}"

Nhiệm vụ: Dựa vào thông tin tài liệu trên, phát biểu 1 câu mang tính HIỂU SAI hoặc GẦN ĐÚNG (thiếu chi tiết cốt lõi) về vấn đề này bằng khẩu ngữ học viên tự nhiên ('Ủa tui nghĩ là...', 'Theo mình thì...'), để kích thích User giảng lại cho bạn.
"""
    res = llm.invoke(prompt)
    msgs = list(state.get("messages", []))
    msgs.append({"role": "peer", "content": f"🙋‍♂️ Alex (Bạn học): {res.content}"})
    return {"source_context": context, "peer_statement": res.content, "messages": msgs}
