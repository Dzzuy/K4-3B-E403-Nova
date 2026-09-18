"""
State definitions for LangGraph Classroom Simulation.
"""

from typing import TypedDict, List, Dict, Optional, Literal, Union

class ClassroomState(TypedDict):
    """
    State shared across all nodes in the classroom LangGraph.
    """
    # 1. Session Mode & Context
    mode: Literal["ASK_TA", "REVIEW_CONCEPT"]         # Button 1 (ASK_TA) or Button 2 (REVIEW_CONCEPT)
    lesson_id: Union[int, str]                        # Active lesson (1..6 or "transcript-01".."transcript-06")
    topic_id: str                                     # Topic identifier / lesson name
    source_context: str                               # Grounding transcript RAG text with [Txx-NNN] tags

    # 2. Initial User Input
    user_prompt: str                                  # User question (Btn 1) or Concept topic (Btn 2)
    user_response: Optional[str]                      # Secondary response / explanation from User

    # 3. Intermediate Agent States
    ta_thinking_hint: Optional[str]                   # Socratic hint from TA (Btn 1)
    peer_statement: Optional[str]                     # Misconception statement by Peer Alex (Btn 2)
    eval_status: Optional[Literal["CORRECT", "INCORRECT"]] # Evaluation outcome from Evaluator Node

    # 4. Chat UI History
    messages: List[Dict[str, str]]                    # Chat log history
