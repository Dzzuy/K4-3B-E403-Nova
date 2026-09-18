"""
Main entry point for Track D1 Classroom Simulation.
Launches interactive terminal chat or automated demo mode.
"""

import sys
from codebase.cli_chat import interactive_chat_session
from codebase.data_loader.rag_retriever import get_relevant_transcript_context
from codebase.graph.builder import classroom_app


def run_button_1_demo(lesson_id: int = 1):
    print("=" * 70)
    print(f"🔵 DEMO NÚT 1: USER HỎI TRỢ GIẢNG (ASK_TA) - BÀI HỌC {lesson_id}")
    print("=" * 70)
    
    questions = {
        1: "Product Manager khác Project Manager ở điểm cốt lõi nào vậy ạ?",
        2: "Automation khác Augmentation như thế nào trong ứng dụng AI?",
        3: "Tư duy thiết kế Prompt cho LLM cần chú ý gì?",
        4: "RAG giải quyết được vấn đề gì của Mô hình Ngôn ngữ lớn?",
        5: "Quy trình xây dựng Agent trong thực tế nên bắt đầu từ đâu?",
        6: "Sự khác biệt giữa Machine Learning và Deep Learning là gì ạ?"
    }
    
    user_question = questions.get(lesson_id, questions[1])
    print(f"📚 Bài học đang chọn: Bài {lesson_id}")
    print(f"👤 User hỏi: {user_question}\n")

    rag_preview = get_relevant_transcript_context(query=user_question, lesson_id=lesson_id, top_k=2)
    print(f"🔍 [RAG RETRIEVER] Đã truy vấn đoạn nội dung liên quan nhất:\n{rag_preview}\n")

    state = {
        "mode": "ASK_TA",
        "lesson_id": lesson_id,
        "topic_id": f"transcript-0{lesson_id}",
        "source_context": rag_preview,
        "user_prompt": user_question,
        "user_response": None,
        "ta_thinking_hint": None,
        "peer_statement": None,
        "eval_status": None,
        "messages": []
    }
    
    res1 = classroom_app.invoke(state)
    for msg in res1["messages"]:
        print(f"{msg['content']}\n")

    user_ans = "Em nghĩ điểm cốt lõi là theo tài liệu RAG đã nêu ở trên ạ!"
    print(f"👤 User trả lời: {user_ans}\n")
    res1["user_response"] = user_ans

    from codebase.agents.instructor_agent import instructor_conclusion_node
    final_res = instructor_conclusion_node(res1)
    print(f"{final_res['messages'][-1]['content']}\n")


def run_button_2_demo(lesson_id: int = 6):
    print("=" * 70)
    print(f"🟢 DEMO NÚT 2: USER ÔN BÀI VỚI BẠN HỌC (REVIEW_CONCEPT) - BÀI HỌC {lesson_id}")
    print("=" * 70)
    
    topics = {
        1: "Phân biệt Product Manager và Project Manager",
        2: "Khái niệm Automation vs Augmentation",
        3: "Kỹ thuật Prompting & System Prompt",
        4: "Kiến trúc RAG và Vector Database",
        5: "Quy trình thiết kế AI Agent",
        6: "Sự khác biệt giữa Machine Learning và Deep Learning"
    }
    
    topic = topics.get(lesson_id, topics[6])
    print(f"📚 Bài học đang chọn: Bài {lesson_id}")
    print(f"📌 Topic ôn tập: {topic}\n")

    rag_preview = get_relevant_transcript_context(query=topic, lesson_id=lesson_id, top_k=2)
    print(f"🔍 [RAG RETRIEVER] Đã truy vấn đoạn nội dung liên quan nhất:\n{rag_preview}\n")

    state = {
        "mode": "REVIEW_CONCEPT",
        "lesson_id": lesson_id,
        "topic_id": f"transcript-0{lesson_id}",
        "source_context": rag_preview,
        "user_prompt": topic,
        "user_response": None,
        "ta_thinking_hint": None,
        "peer_statement": None,
        "eval_status": None,
        "messages": []
    }
    
    res = classroom_app.invoke(state)
    for msg in res["messages"]:
        print(f"{msg['content']}\n")

    user_explain = "Alex hiểu nhầm rồi, Deep Learning dùng Mạng Nơ-ron nhiều tầng lớp và tự trích ra đặc điểm chứ không phải nhập luật thủ công!"
    print(f"👤 User giảng lại cho Alex: {user_explain}\n")
    res["user_response"] = user_explain

    from codebase.agents.evaluator_agent import evaluator_node
    from codebase.agents.instructor_agent import instructor_conclusion_node
    
    eval_res = evaluator_node(res)
    res["eval_status"] = eval_res["eval_status"]
    print(f"🔍 Evaluator đánh giá: {eval_res['eval_status']}\n")

    final_res = instructor_conclusion_node(res)
    print(f"{final_res['messages'][-1]['content']}\n")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1].lower() in ("demo", "demo1", "demo2", "1", "2"):
        mode_arg = sys.argv[1]
        lesson_arg = int(sys.argv[2]) if len(sys.argv) > 2 else (1 if mode_arg in ("1", "demo1") else 6)
        if mode_arg in ("2", "demo2"):
            run_button_2_demo(lesson_id=lesson_arg)
        else:
            run_button_1_demo(lesson_id=lesson_arg)
    else:
        # Default: Launch Interactive Terminal Chat Session
        interactive_chat_session()
