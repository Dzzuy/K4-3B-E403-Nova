"""Small OpenRouter client used by the existing CP3 agent functions."""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI


MISSING_KEY_MESSAGE = "Paste OPENROUTER_API_KEY into codebase/.env now."


@dataclass
class LLMResponse:
    content: str


class OpenRouterLLM:
    """Provides the existing agents' small invoke(prompt) surface."""

    def __init__(self, model: str, temperature: float) -> None:
        self.model = model
        self.temperature = temperature
        self.provider = "openrouter"
        self.client = OpenAI(
            api_key=os.environ["OPENROUTER_API_KEY"],
            base_url=os.environ["OPENROUTER_BASE_URL"],
        )

    def invoke(self, prompt: str) -> LLMResponse:
        completion = self.client.chat.completions.create(
            model=self.model,
            temperature=self.temperature,
            messages=[{"role": "user", "content": prompt}],
        )
        return LLMResponse(content=completion.choices[0].message.content or "")


def get_llm(model_name: str | None = None, temperature: float = 0.3) -> OpenRouterLLM:
    """Return a live provider. CP3 must never silently fall back to mock output."""

    project_root = Path(__file__).resolve().parents[2]
    load_dotenv(project_root / "codebase" / ".env", override=False)
    api_key = os.getenv("OPENROUTER_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError(MISSING_KEY_MESSAGE)

    os.environ.setdefault("OPENROUTER_MODEL", "openai/gpt-4.1-mini")
    os.environ.setdefault("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
    model = model_name or os.environ["OPENROUTER_MODEL"]
    print(f"LIVE LLM: openrouter/{model}")
    return OpenRouterLLM(model=model, temperature=temperature)
