"""
Provider Registry for Gemini, OpenAI, Anthropic, OpenRouter.
"""

from codebase.providers.openai_provider import OpenAIProvider
from codebase.providers.openrouter_provider import OpenRouterProvider
from codebase.providers.anthropic_provider import AnthropicProvider
from codebase.providers.gemini_provider import GeminiProvider

def make_provider(name: str):
    """
    Returns an initialized provider instance by name.
    """
    normalized = name.strip().lower()
    if normalized == "openai":
        return OpenAIProvider()
    if normalized == "openrouter":
        return OpenRouterProvider()
    if normalized == "anthropic":
        return AnthropicProvider()
    if normalized in ("gemini", "google"):
        return GeminiProvider()
    raise ValueError(f"Unknown provider: {name}. Allowed: openai, openrouter, anthropic, gemini")
