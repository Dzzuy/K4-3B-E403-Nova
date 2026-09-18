"""
Teaching Assistant (TA) Agent Nodes.
Uses RAG context retrieval to provide focused Socratic hints.
"""

from typing import Dict, Any
from codebase.state.classroom_state import ClassroomState
from codebase.providers.llm import get_llm
from codebase.data_loader.rag_retriever import get_relevant_transcript_context

llm = get_llm(temperature=0.3)

def btn1_ta_guide_node(state: ClassroomState) -> Dict[str, Any]:
    """
    Button 1 Handler:
    Invoked when User asks a question (ASK_TA mode).
    TA guides the user's thinking process using a Socratic hint without giving away the answer directly.
    """
    lesson_id = state.get("lesson_id", state.get("topic_id", 1))
    context = get_relevant_transcript_context(query=state['user_prompt'], lesson_id=lesson_id, top_k=3)

    prompt = f"""Bạn là Trợ giảng (TA) nhiệt tình và sư phạm.
{context}

Học viên đang hỏi (Bài {lesson_id}): "{state['user_prompt']}"

Nhiệm vụ: Không cho đáp án trực tiếp! Đưa ra 1-2 câu gợi mở hướng suy nghĩ theo tinh thần Socratic để học viên tự suy nghĩ và thử trả lời dựa trên manh mối bài học.
"""
    res = llm.invoke(prompt)
    msgs = list(state.get("messages", []))
    msgs.append({"role": "ta", "content": f"🧑‍🏫 Trợ giảng: {res.content}"})
    return {"source_context": context, "ta_thinking_hint": res.content, "messages": msgs}


def ta_socratic_node(state: ClassroomState) -> Dict[str, Any]:
    """
    Invoked in Button 2 when User gives an incorrect/confused explanation to Alex.
    TA steps in to redirect the user's focus back to the core concept in the lesson material.
    """
    lesson_id = state.get("lesson_id", state.get("topic_id", 1))
    context = state.get("source_context") or get_relevant_transcript_context(query=state['user_prompt'], lesson_id=lesson_id, top_k=3)

    prompt = f"""{context}

Alex phát biểu sai: "{state.get('peer_statement', '')}"
User vừa giải thích chưa trúng: "{state.get('user_response', '')}"

Hãy đóng vai Trợ giảng (TA): Đưa 1 câu gợi mở hướng suy nghĩ Socratic trỏ về chi tiết trong bài giảng trên để User tư duy và điều chỉnh lại.
"""
    res = llm.invoke(prompt)
    msgs = list(state.get("messages", []))
    msgs.append({"role": "ta", "content": f"🧑‍🏫 Trợ giảng: {res.content}"})
    return {"messages": msgs}
