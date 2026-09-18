"""
LLM Provider Abstraction.
Provides ChatGoogleGenerativeAI instance or fallback Mock LLM when API key is not present.
"""

import os
from typing import Any, List
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import BaseMessage, AIMessage
from langchain_core.outputs import ChatResult, ChatGeneration
from langchain_google_genai import ChatGoogleGenerativeAI
from codebase.config import DEFAULT_MODEL, TEMPERATURE

class MockClassroomLLM(BaseChatModel):
    """Fallback LLM for offline testing when GOOGLE_API_KEY is not set."""
    temperature: float = 0.3

    def _generate(
        self,
        messages: List[BaseMessage],
        stop: Any = None,
        run_manager: Any = None,
        **kwargs: Any,
    ) -> ChatResult:
        prompt_text = str(messages)
        
        if "Giảng viên" in prompt_text or "đứng lớp" in prompt_text:
            text = "Qua thảo luận vừa rồi, Giảng viên nhận xét các bạn đã nắm sát kiến thức cốt lõi. Bằng chứng chuẩn xác theo trích dẫn bài giảng: [T01-008], [T01-009] (đối với Bài 1) hoặc [T06-040], [T06-042] (đối với Bài 6)."
        elif "Trợ giảng" in prompt_text or "Socratic" in prompt_text:
            text = "Bạn hãy chú ý đến chi tiết quan trọng trong bài giảng vừa được trích xuất [Txx-NNN] ở trên để định hướng lại câu trả lời nhé!"
        elif "Alex" in prompt_text or "bạn học" in prompt_text:
            text = "Ủa tui nghĩ là cái này chỉ là nhập luật thủ công thôi chứ đâu có cần nhiều tầng lớp hay tự trích xuất đặc trưng đâu nhỉ?"
        elif "Đánh giá" in prompt_text or "Evaluator" in prompt_text:
            text = "CORRECT"
        else:
            text = "Kiến thức đã được làm rõ dựa trên trích dẫn bài giảng."

        message = AIMessage(content=text)
        return ChatResult(generations=[ChatGeneration(message=message)])

    @property
    def _llm_type(self) -> str:
        return "mock_classroom_llm"


def get_llm(model_name: str = DEFAULT_MODEL, temperature: float = TEMPERATURE):
    """Returns an initialized ChatGoogleGenerativeAI instance or ChatOpenAI or Mock fallback."""
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if api_key:
        print("\n[HỆ THỐNG] Đã kết nối thành công với API (Gemini)...")
        from langchain_google_genai import ChatGoogleGenerativeAI
        return ChatGoogleGenerativeAI(
            model=model_name,
            temperature=temperature,
            google_api_key=api_key
        )
    
    openai_key = os.environ.get("OPENAI_API_KEY")
    if openai_key:
        print("\n[HỆ THỐNG] Đã kết nối thành công với API (OpenAI gpt-4o-mini)...")
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model="gpt-4o-mini",
            temperature=temperature,
            api_key=openai_key
        )

    print("\n[HỆ THỐNG] CẢNH BÁO: Không tìm thấy API Key (Gemini/OpenAI). Đang dùng Mock LLM (Dữ liệu giả).")
    return MockClassroomLLM(temperature=temperature)
