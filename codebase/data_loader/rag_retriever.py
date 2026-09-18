"""
RAG Retriever for Lesson Transcripts (Lessons 1 to 6).
Splits transcript markdown files into [Txx-NNN] chunks and performs BM25/keyword relevance retrieval.
Prevents passing full 100KB transcript script files into LLM prompts.
"""

import os
import re
import math
from typing import List, Dict, Any, Union, Optional
from codebase.config import TRANSCRIPT_DIR

def parse_lesson_id(lesson_input: Union[int, str]) -> int:
    """Helper to convert lesson inputs like 1, "1", "01", "transcript-01", "transcript-06-clean.md" into integer 1..6."""
    if isinstance(lesson_input, int):
        return lesson_input
    match = re.search(r"(\d+)", str(lesson_input))
    if match:
        return int(match.group(1))
    return 1

class TranscriptChunk:
    def __init__(self, tag: str, lesson_id: int, section_header: str, content: str):
        self.tag = tag                        # e.g. "[T01-005]"
        self.lesson_id = lesson_id            # e.g. 1
        self.section_header = section_header  # e.g. "Kỹ năng xác định bài toán mơ hồ"
        self.content = content                # full chunk text including tag
        self.tokens = self._tokenize(f"{section_header} {content}")

    @staticmethod
    def _tokenize(text: str) -> List[str]:
        # Lowercase and split words, removing punctuation
        cleaned = re.sub(r"[^\w\s]", " ", text.lower())
        return [w for w in cleaned.split() if len(w) > 1]

class TranscriptRAGRetriever:
    """
    RAG Retriever for all 6 cleaned transcript files in data/vlearn-pack/transcript/.
    """
    def __init__(self, transcript_dir: str = TRANSCRIPT_DIR):
        self.transcript_dir = transcript_dir
        self.chunks: List[TranscriptChunk] = []
        self._load_and_index()

    def _load_and_index(self):
        """Loads transcript-01-clean.md through transcript-06-clean.md and builds chunk index."""
        if not os.path.exists(self.transcript_dir):
            return

        for lesson_num in range(1, 7):
            filename = f"transcript-0{lesson_num}-clean.md"
            filepath = os.path.join(self.transcript_dir, filename)
            if not os.path.exists(filepath):
                continue

            with open(filepath, "r", encoding="utf-8") as f:
                raw_text = f.read()

            current_header = f"Bài học {lesson_num}"
            lines = raw_text.splitlines()
            current_tag = None
            current_buffer = []

            for line in lines:
                line_str = line.strip()
                if line_str.startswith("## "):
                    current_header = line_str.replace("## ", "").strip()
                
                # Check for tag marker e.g. **[T01-001]** or [T01-001]
                tag_match = re.search(r"\[(T\d{2}-\d{3})\]", line_str)
                if tag_match:
                    # If we already had a buffer, save previous chunk
                    if current_tag and current_buffer:
                        text_body = "\n".join(current_buffer).strip()
                        if text_body:
                            self.chunks.append(
                                TranscriptChunk(
                                    tag=current_tag,
                                    lesson_id=lesson_num,
                                    section_header=current_header,
                                    content=text_body
                                )
                            )
                    current_tag = f"[{tag_match.group(1)}]"
                    current_buffer = [line_str]
                else:
                    if current_tag:
                        current_buffer.append(line_str)

            # Flush last chunk
            if current_tag and current_buffer:
                text_body = "\n".join(current_buffer).strip()
                if text_body:
                    self.chunks.append(
                        TranscriptChunk(
                            tag=current_tag,
                            lesson_id=lesson_num,
                            section_header=current_header,
                            content=text_body
                        )
                    )

    def retrieve(
        self,
        query: str,
        lesson_id: Union[int, str] = 1,
        top_k: int = 3,
        include_previous_lessons: bool = False
    ) -> List[TranscriptChunk]:
        """
        Retrieves top_k relevant chunks for the specified lesson_id.
        If include_previous_lessons is True, searches across lessons 1..lesson_id.
        """
        target_lesson = parse_lesson_id(lesson_id)
        
        # Filter candidate chunks by lesson
        if include_previous_lessons:
            candidates = [c for c in self.chunks if c.lesson_id <= target_lesson]
        else:
            candidates = [c for c in self.chunks if c.lesson_id == target_lesson]

        if not candidates:
            candidates = self.chunks

        query_tokens = TranscriptChunk._tokenize(query)
        if not query_tokens:
            return candidates[:top_k]

        avg_doc_len = sum(len(c.tokens) for c in candidates) / (len(candidates) or 1)
        k1 = 1.5
        b = 0.75

        idf = {}
        N = len(candidates)
        for qt in query_tokens:
            df = sum(1 for c in candidates if qt in c.tokens)
            idf[qt] = math.log((N - df + 0.5) / (df + 0.5) + 1.0)

        scored_chunks = []
        for chunk in candidates:
            score = 0.0
            doc_len = len(chunk.tokens)
            for qt in query_tokens:
                tf = chunk.tokens.count(qt)
                if tf > 0:
                    term_score = idf[qt] * (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (doc_len / avg_doc_len)))
                    score += term_score

            query_lower = query.lower()
            if any(term in chunk.content.lower() for term in query_lower.split() if len(term) > 3):
                score += 0.5
            if chunk.section_header.lower() in query_lower:
                score += 2.0

            scored_chunks.append((score, chunk))

        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        return [c for score, c in scored_chunks[:top_k]]

    def get_formatted_context(
        self,
        query: str,
        lesson_id: Union[int, str] = 1,
        top_k: int = 3
    ) -> str:
        """
        Returns a formatted string of top retrieved RAG chunks ready for LLM prompt injection.
        """
        chunks = self.retrieve(query=query, lesson_id=lesson_id, top_k=top_k)
        target_num = parse_lesson_id(lesson_id)
        if not chunks:
            return f"[Không tìm thấy trích dẫn phù hợp trong Bài học {target_num}]"

        formatted = [f"=== TÀI LIỆU RAG TRÍCH XUẤT TỪ BÀI HỌC {target_num} (Top {len(chunks)} đoạn liên quan nhất) ==="]
        for c in chunks:
            formatted.append(f"📌 [{c.section_header}]\n{c.content}")

        return "\n\n".join(formatted)

# Global singleton instance
_rag_instance = None

def get_rag_retriever() -> TranscriptRAGRetriever:
    global _rag_instance
    if _rag_instance is None:
        _rag_instance = TranscriptRAGRetriever()
    return _rag_instance

def get_relevant_transcript_context(query: str, lesson_id: Union[int, str] = 1, top_k: int = 3) -> str:
    """Convenience function to get top-k formatted RAG context for prompts."""
    retriever = get_rag_retriever()
    return retriever.get_formatted_context(query=query, lesson_id=lesson_id, top_k=top_k)
