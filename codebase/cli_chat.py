"""
Interactive CLI Terminal Chat Interface for Track D1 Classroom Simulation.
Allows interactive turn-by-turn testing in the terminal for both Button 1 (ASK_TA) and Button 2 (REVIEW_CONCEPT).
"""

import sys
import os
from pathlib import Path

# Ensure project root is in sys.path
ROOT = Path(__file__).parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
if str(Path(__file__).parent) not in sys.path:
    sys.path.insert(0, str(Path(__file__).parent))

from codebase.env_loader import load_lab_env
load_lab_env(Path(__file__).parent)

from codebase.data_loader.rag_retriever import get_relevant_transcript_context, get_rag_retriever
from codebase.graph.builder import classroom_app
from codebase.agents.instructor_agent import instructor_conclusion_node
from codebase.agents.evaluator_agent import evaluator_node
from codebase.agents.ta_agent import ta_socratic_node

def print_banner():
    print("\n" + "=" * 75)
    print("🎓 MÔ PHỎNG LỚP HỌC MULTI-AGENT TRACK D1 - INTERACTIVE TERMINAL CHAT")
    print("=" * 75)
    print(" Các lệnh tiện ích khi đang chat:")
    print("   /lesson <1-6>  : Đổi bài học đang chọn (VD: /lesson 2)")
    print("   /mode <1 hoặc 2>: Đổi chế độ Button (1: Hỏi TA, 2: Ôn bài với Alex)")
    print("   /rag           : Bật/Tắt hiển thị đoạn RAG trích xuất")
    print("   /quit /exit    : Thoát ứng dụng chat")
    print("=" * 75 + "\n")


def interactive_chat_session():
    print_banner()

    current_lesson = 1
    current_mode = "ASK_TA"  # Default Button 1
    show_rag = True

    while True:
        mode_label = "🔵 NÚT 1: HỎI TRỢ GIẢNG (ASK_TA)" if current_mode == "ASK_TA" else "🟢 NÚT 2: ÔN BÀI VỚI BẠN HỌC (REVIEW_CONCEPT)"
        print(f"\n📌 [Đang ở Bài {current_lesson} | {mode_label}]")

        if current_mode == "ASK_TA":
            user_input = input("\n👤 [User - Đặt câu hỏi cho TA] > ").strip()
        else:
            user_input = input("\n📌 [User - Nhập khái niệm muốn ôn với Alex] > ").strip()

        if not user_input:
            continue

        # Command handling
        cmd = user_input.lower()
        if cmd in ("/quit", "/exit", "quit", "exit"):
            print("\n👋 Cảm ơn bạn đã trải nghiệm mô phỏng lớp học Track D1. Tạm biệt!")
            break

        if cmd.startswith("/lesson"):
            parts = user_input.split()
            if len(parts) > 1 and parts[1].isdigit() and 1 <= int(parts[1]) <= 6:
                current_lesson = int(parts[1])
                print(f"✅ Đã chuyển sang Bài {current_lesson}.")
            else:
                print("⚠️ Vui lòng nhập số bài từ 1 đến 6 (VD: /lesson 3)")
            continue

        if cmd.startswith("/mode"):
            parts = user_input.split()
            if len(parts) > 1:
                if parts[1] == "1" or parts[1].upper() == "ASK_TA":
                    current_mode = "ASK_TA"
                    print("✅ Đã chuyển sang 🔵 NÚT 1: HỎI TRỢ GIẢNG.")
                elif parts[1] == "2" or parts[1].upper() == "REVIEW_CONCEPT":
                    current_mode = "REVIEW_CONCEPT"
                    print("✅ Đã chuyển sang 🟢 NÚT 2: ÔN BÀI VỚI BẠN HỌC ALEX.")
                else:
                    print("⚠️ Vui lòng chọn mode 1 (ASK_TA) hoặc 2 (REVIEW_CONCEPT).")
            continue

        if cmd == "/rag":
            show_rag = not show_rag
            print(f"✅ Hiển thị đoạn RAG: {'BẬT' if show_rag else 'TẮT'}")
            continue

        # Process Turn
        rag_context = get_relevant_transcript_context(query=user_input, lesson_id=current_lesson, top_k=3)
        if show_rag:
            print(f"\n🔍 [RAG RETRIEVER - Bài {current_lesson}]:\n{rag_context}\n")

        state = {
            "mode": current_mode,
            "lesson_id": current_lesson,
            "topic_id": f"transcript-0{current_lesson}",
            "source_context": rag_context,
            "user_prompt": user_input,
            "user_response": None,
            "ta_thinking_hint": None,
            "peer_statement": None,
            "eval_status": None,
            "messages": []
        }

        # Step 1: Run Initial Node via LangGraph
        res = classroom_app.invoke(state)

        if current_mode == "ASK_TA":
            # Print TA Socratic hint
            ta_msg = res["messages"][-1]["content"]
            print(f"\n{ta_msg}")

            # Step 2: User responds to TA hint
            user_response = input("\n👤 [User - Trả lời câu gợi mở của TA] > ").strip()
            if not user_response:
                user_response = "Em đã hiểu định hướng của TA rồi ạ."

            res["user_response"] = user_response

            # Step 3: Instructor Wrap-up with RAG Citation
            final_res = instructor_conclusion_node(res)
            print(f"\n{final_res['messages'][-1]['content']}")

        else:  # REVIEW_CONCEPT Mode
            # Print Alex Misconception statement
            alex_msg = res["messages"][-1]["content"]
            print(f"\n{alex_msg}")

            # Step 2: User responds / explains to Alex
            user_explain = input("\n👤 [User - Giảng lại / sửa lỗi cho Alex] > ").strip()
            if not user_explain:
                user_explain = "Alex hiểu nhầm rồi, để mình giải thích lại chuẩn theo bài học nhé!"

            res["user_response"] = user_explain

            # Step 3: Evaluator Node evaluates user response
            eval_res = evaluator_node(res)
            res["eval_status"] = eval_res["eval_status"]
            print(f"\n🔍 [EVALUATOR NODE]: {eval_res['eval_status']}")

            if eval_res["eval_status"] == "CORRECT":
                # Instructor Wrap-up
                final_res = instructor_conclusion_node(res)
                print(f"\n{final_res['messages'][-1]['content']}")
            else:
                # TA steps in with Socratic guidance
                ta_res = ta_socratic_node(res)
                print(f"\n{ta_res['messages'][-1]['content']}")

                # User re-explains
                user_re_explain = input("\n👤 [User - Giảng lại sau khi TA gợi ý] > ").strip()
                res["user_response"] = user_re_explain or user_explain

                # Final Instructor Wrap-up
                final_res = instructor_conclusion_node(res)
                print(f"\n{final_res['messages'][-1]['content']}")

        print("\n" + "-" * 75)


if __name__ == "__main__":
    interactive_chat_session()
