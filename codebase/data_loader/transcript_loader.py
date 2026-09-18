"""
Transcript and Grounding Document Loader.
Loads clean transcript markdown files from data/vlearn-pack/transcript/ and provides RAG context.
"""

from typing import Union
from codebase.data_loader.rag_retriever import get_relevant_transcript_context, parse_lesson_id

def load_transcript(lesson_id_or_filename: Union[int, str] = 1, query: str = "", top_k: int = 3) -> str:
    """
    Loads relevant transcript chunks for the given lesson using RAG retrieval.
    Prevents passing full script files into LLM prompts.
    """
    lesson_num = parse_lesson_id(lesson_id_or_filename)
    search_query = query if query else "nội dung chính bài giảng khái niệm"
    return get_relevant_transcript_context(query=search_query, lesson_id=lesson_num, top_k=top_k)

