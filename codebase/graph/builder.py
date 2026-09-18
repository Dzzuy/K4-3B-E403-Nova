"""
LangGraph Builder for Classroom Simulation.
"""

from langgraph.graph import StateGraph, END
from codebase.state.classroom_state import ClassroomState
from codebase.agents.ta_agent import btn1_ta_guide_node, ta_socratic_node
from codebase.agents.peer_agent import btn2_peer_misconception_node
from codebase.agents.evaluator_agent import evaluator_node
from codebase.agents.instructor_agent import instructor_conclusion_node

def route_initial_mode(state: ClassroomState) -> str:
    """Conditional entry point based on user's mode button."""
    if state["mode"] == "ASK_TA":
        return "btn1_ta_guide"
    return "btn2_peer_misconception"

def route_after_eval(state: ClassroomState) -> str:
    """Conditional router after evaluation in Button 2."""
    if state.get("eval_status") == "CORRECT":
        return "instructor_conclusion"
    return "ta_socratic"

def build_classroom_graph():
    """Builds and compiles the StateGraph workflow."""
    builder = StateGraph(ClassroomState)

    # 1. Add Nodes
    builder.add_node("btn1_ta_guide", btn1_ta_guide_node)
    builder.add_node("btn2_peer_misconception", btn2_peer_misconception_node)
    builder.add_node("evaluator", evaluator_node)
    builder.add_node("ta_socratic", ta_socratic_node)
    builder.add_node("instructor_conclusion", instructor_conclusion_node)

    # 2. Set Dynamic Entry Points
    builder.set_conditional_entry_point(
        route_initial_mode,
        {
            "btn1_ta_guide": "btn1_ta_guide",
            "btn2_peer_misconception": "btn2_peer_misconception"
        }
    )

    # 3. Add Edges & Conditional Routes
    builder.add_conditional_edges(
        "evaluator",
        route_after_eval,
        {
            "instructor_conclusion": "instructor_conclusion",
            "ta_socratic": "ta_socratic"
        }
    )

    # Terminal edges (waiting for next user input step)
    builder.add_edge("btn1_ta_guide", END)
    builder.add_edge("btn2_peer_misconception", END)
    builder.add_edge("ta_socratic", END)
    builder.add_edge("instructor_conclusion", END)

    return builder.compile()

# Instantiated compiled graph app
classroom_app = build_classroom_graph()
