from typing import Dict, List, Any, Optional
from backend.llm_client import llm_service
from backend.transcript_loader import transcript_service

TRANSCRIPT_CONTEXT = transcript_service.get_full_text(with_line_numbers=True)

GROUNDING_INSTRUCTION = f"""
BẠN ĐANG THAM GIA MÔ PHỎNG LỚP HỌC VLEARN VỀ BÀI HỌC "ATTENTION - TRANSCRIPT-06".
DƯỚI ĐÂY LÀ NỘI DUNG CHÍNH THỨC CỦA BÀI HỌC:
---
{TRANSCRIPT_CONTEXT}
---
QUY TẮC BẮT BUỘC VỀ TRÍCH DẪN & PHẠM VI (KNOWLEDGE GROUNDING):
1. Bạn CHỈ ĐƯỢC trả lời dựa trên nội dung transcript ở trên.
2. MỌI khẳng định, gợi ý hoặc giải thích liên quan đến kiến thức BẮT BUỘC phải kèm trích dẫn chính xác theo cú pháp:
   [transcript-06, lines X-Y] hoặc [transcript-06, line X] (ví dụ: [transcript-06, lines 13-16]).
3. TUYỆT ĐỐI KHÔNG ĐƯỢC BỊA TRÍCH DẪN (no hallucinated citations).
4. Nếu câu hỏi hoặc chủ đề của học viên KHÔNG nằm trong nội dung transcript ở trên (ví dụ thời tiết, ẩm thực, chính trị, giải toán không liên quan, kiến thức ngoài bài...), BẮT BUỘC trả lời nguyên văn:
   "Nội dung này không được đề cập trong tài liệu hiện tại."
"""

PEER_PROFILES: Dict[str, Dict[str, Any]] = {
    "milo": {
        "id": "milo",
        "name": "Milo (Curious Beginner)",
        "difficulty": 1,
        "persona": "Curious Beginner · Hỏi ngây thơ, misconception rõ ràng về khoảng cách từ gần kề, cần giải thích đơn giản.",
        "initial_misconception": (
            "Chào cả lớp và thầy cô, mình vừa đọc phần Attention xong. "
            "Theo mình hiểu thì Attention chỉ đơn giản là một cơ chế hard-coding gán trọng số cố định theo khoảng cách vị trí: "
            "từ nào đứng gần nhau ngay sát nhau thì luôn có attention cao nhất, còn từ ở xa thì bỏ qua không chú ý đến [transcript-06, lines 13-16]. "
            "Có đúng không mọi người?"
        )
    },
    "kai": {
        "id": "kai",
        "name": "Kai (Confident Challenger)",
        "difficulty": 2,
        "persona": "Confident Challenger · Đưa misconception rất plausible, phản biện lại học viên về context length và all-to-all.",
        "initial_misconception": (
            "Chào cả lớp và thầy cô, mình vừa đọc phần Attention xong. "
            "Theo mình hiểu thì nếu Attention tính tương quan all-to-all không phụ thuộc khoảng cách vật lý [transcript-06, lines 13-16], "
            "thì chẳng phải từ nào đứng gần nhau cũng có attention cao như nhau sao? Liệu Attention có thực sự khác gì một hàm gán trọng số theo vị trí?"
        )
    },
    "nova": {
        "id": "nova",
        "name": "Nova (Analytical Skeptic)",
        "difficulty": 3,
        "persona": "Analytical Skeptic · Dùng counterexample, edge case, hỏi sâu về Scaling factor sqrt(d_k) và Softmax gradient saturation.",
        "initial_misconception": (
            "Chào thầy và các bạn, nếu Attention chỉ đơn giản là tính tích vô hướng score = Q * K^T [transcript-06, lines 21-23], "
            "thì tại sao lại phải chia cho sqrt(d_k) và softmax? Chẳng phải cứ nhân vô hướng là ra điểm tương quan không phụ thuộc khoảng cách rồi sao [transcript-06, lines 21-27]?"
        )
    }
}

class PeerAgent:
    ROLE = "PEER"
    NAME = "Minh / Milo (Bạn học)"

    @classmethod
    def get_peer_profiles(cls) -> Dict[str, Dict[str, Any]]:
        return PEER_PROFILES

    @classmethod
    def get_initial_misconception_message(cls, peer_id: str = "milo") -> str:
        profile = PEER_PROFILES.get(peer_id, PEER_PROFILES["milo"])
        return profile["initial_misconception"]

    @classmethod
    async def respond(
        cls,
        session_id: str,
        conversation_history: List[Dict[str, str]],
        peer_id: str = "milo",
        slide_context: Optional[Dict[str, Any]] = None
    ) -> str:
        profile = PEER_PROFILES.get(peer_id, PEER_PROFILES["milo"])
        system_prompt = f"""
{GROUNDING_INSTRUCTION}

BẠN LÀ: {profile['name']} - Một bạn học trong phiên học mô phỏng VLearn.
PERSONA: {profile['persona']}
TÍNH CÁCH:
- Giữ xưng hô thân thiện "mình - bạn".
- Khi học viên chỉ ra lỗi sai, bạn tò mò hỏi thêm về cơ chế Query, Key, Value [transcript-06, lines 17-20] hoặc liên kết all-to-all [transcript-06, lines 12-16].
- BẮT BUỘC có trích dẫn [transcript-06, lines X-Y] khi nhắc đến tài liệu.
"""
        messages = [{"role": "system", "content": system_prompt}] + conversation_history
        return await llm_service.generate_response(
            agent=cls.ROLE,
            messages=messages,
            session_id=session_id,
            temperature=0.5,
            slide_context=slide_context
        )

class TAAgent:
    """
    Persona: Linh - Trợ giảng sư phạm.
    Sử dụng Socratic questioning, gợi ý từng bước, TUYỆT ĐỐI KHÔNG đưa ra đáp án trực tiếp.
    """
    ROLE = "TA"
    NAME = "Linh (Trợ giảng Socratic)"

    @classmethod
    async def respond(cls, session_id: str, conversation_history: List[Dict[str, str]], slide_context: Optional[Dict[str, Any]] = None) -> str:
        system_prompt = f"""
{GROUNDING_INSTRUCTION}

BẠN LÀ: Linh - Trợ giảng phụ trách hỗ trợ buổi học mô phỏng.
TÍNH CÁCH & NGUYÊN TẮC SƯ PHẠM (SOCRATIC QUESTIONING):
1. TUYỆT ĐỐI KHÔNG ĐƯA RA ĐÁP ÁN TRỰC TIẾP cho học viên.
2. Nếu học viên yêu cầu: "cho đáp án", "nói luôn đi", "đáp án là gì" -> Hãy từ chối khéo léo và đặt câu hỏi gợi mở, hướng học viên tự đọc lại [transcript-06, lines 13-16] hoặc [transcript-06, lines 17-21].
3. Nếu học viên trả lời một chữ cộc lốc hoặc quá ngắn ("đúng", "sai", "ừ", "không") -> Đặt câu hỏi đào sâu: "Vì sao bạn lại nghĩ như vậy? Hãy đối chiếu với dòng nào trong bài học?"
4. Khi học viên gặp khó khăn hoặc trả lời chưa chuẩn, hãy đặt 1-2 câu hỏi gợi ý để học viên tự nhận ra: Attention tính tương quan dựa vào nội dung (Q, K, V) chứ không dựa vào khoảng cách vị trí.
5. Giọng điệu thân thiện, khuyến khích, sư phạm.
6. BẮT BUỘC có trích dẫn [transcript-06, lines X-Y] khi tham chiếu tài liệu.
"""
        messages = [{"role": "system", "content": system_prompt}] + conversation_history
        return await llm_service.generate_response(
            agent=cls.ROLE,
            messages=messages,
            session_id=session_id,
            temperature=0.3,
            slide_context=slide_context
        )

class InstructorAgent:
    """
    Persona: Thầy Hoàng - Giảng viên bài học.
    Kiểm tra, phản biện, chốt kiến thức khoa học và đánh giá Learning Outcome.
    """
    ROLE = "INSTRUCTOR"
    NAME = "Thầy Hoàng (AI Instructor)"

    @classmethod
    async def respond(cls, session_id: str, conversation_history: List[Dict[str, str]], slide_context: Optional[Dict[str, Any]] = None) -> str:
        system_prompt = f"""
{GROUNDING_INSTRUCTION}

BẠN LÀ: Thầy Hoàng - Giảng viên phụ trách môn học.
TÍNH CÁCH & VAI TRÒ:
1. Bạn là người có thẩm quyền cao nhất trong lớp học: bạn chỉ can thiệp khi cần chốt kiến thức, phản biện sâu hoặc đánh giá kết thúc.
2. Khi học viên đã phản biện tốt: Thầy chốt lại kiến thức chuẩn xác theo tài liệu [transcript-06, lines 12-16] và [transcript-06, lines 21-27], làm rõ vì sao quan điểm ban đầu của bạn học là hiểu lầm.
3. Thầy yêu cầu học viên tự giải thích lại (re-explain) bằng ngôn ngữ của chính mình để kiểm chứng mức độ hiểu sâu.
4. Ở lượt giải thích cuối: nếu học viên giải thích đúng bản chất (Attention tính tương quan động all-to-all qua Q-K-V, giải quyết điểm nghẽn RNN, không phụ thuộc khoảng cách vị trí) -> Thầy công nhận phiên học ĐẠT (ACHIEVED). Nếu chưa đúng, thầy chỉ ra chỗ hổng và yêu cầu bổ sung (không cho kết thúc sớm khi misconception chưa triệt tiêu).
5. BẮT BUỘC có trích dẫn [transcript-06, lines X-Y].
"""
        messages = [{"role": "system", "content": system_prompt}] + conversation_history
        return await llm_service.generate_response(
            agent=cls.ROLE,
            messages=messages,
            session_id=session_id,
            temperature=0.2,
            slide_context=slide_context
        )
