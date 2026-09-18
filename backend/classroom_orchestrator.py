import re
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple, TypedDict
from backend.agents import PeerAgent, TAAgent, InstructorAgent, PEER_PROFILES
from backend.logger import save_session_log
from backend.transcript_loader import transcript_service

class AssessmentResult(TypedDict):
    understanding_level: str  # "CORRECT" | "STRUGGLE" | "OFF_SCOPE" | "ONE_WORD" | "DEMAND_ANSWER"
    pedagogical_decision: str  # "PEER_DEBATE" | "TA_SOCRATIC" | "SCOPE_GUARD" | "INSTRUCTOR_WRAPUP"
    confidence_score: float
    reasoning: str

class ClassroomOrchestrator:
    def __init__(self):
        self.sessions: Dict[str, Dict[str, Any]] = {}
        self.scenario_config = {
            "lesson_id": "transcript-06",
            "lesson_title": "Attention Mechanism (transcript-06)",
            "misconception": PeerAgent.get_initial_misconception_message("milo"),
            "peer_name": "Milo (Curious Beginner)",
            "peer_persona": "Milo - Bạn học trình độ 1, hiểu lầm ngây thơ về khoảng cách vị trí gần kề.",
            "ta_name": TAAgent.NAME,
            "ta_persona": "Linh - Trợ giảng sư phạm, dùng phương pháp Socratic, không cho đáp án sẵn.",
            "instructor_name": InstructorAgent.NAME,
            "instructor_persona": "Thầy Hoàng - Giảng viên, kiểm tra, phản biện, chốt kiến thức và đánh giá outcome.",
            "citation_rule": "Mọi khẳng định liên quan phải có trích dẫn [transcript-06, lines X-Y]."
        }

    def get_scenario_config(self) -> Dict[str, Any]:
        return self.scenario_config

    def update_scenario_config(self, updates: Dict[str, Any]) -> Dict[str, Any]:
        for k, v in updates.items():
            if k in self.scenario_config and v is not None:
                self.scenario_config[k] = v
        return self.scenario_config

    def create_session(
        self,
        student_name: str = "Học viên",
        lesson_id: str = "transcript-06",
        peer_id: str = "milo"
    ) -> Dict[str, Any]:
        session_id = f"sess_{uuid.uuid4().hex[:10]}"
        profile = PEER_PROFILES.get(peer_id, PEER_PROFILES["milo"])
        initial_misconception = self.scenario_config.get("misconception") or profile["initial_misconception"]

        session = {
            "session_id": session_id,
            "lesson_id": lesson_id,
            "lesson_title": "Attention Mechanism (transcript-06)",
            "student_name": student_name,
            "status": "IN_PROGRESS",  # IN_PROGRESS | ACHIEVED
            "current_turn": 1,
            "phase": "WAITING_STUDENT_1",
            "active_agent": "PEER",
            "peer_id": profile["id"],
            "peer_name": profile["name"],
            "difficulty_level": profile["difficulty"],
            "misconception_resolved": False,
            "central_assessor_logs": [],
            "learning_evidence": {
                "initial_understanding": f"Học viên bắt đầu phiên học cùng {profile['name']} để nhận diện và phản biện hiểu sai về Attention Mechanism.",
                "misconception": initial_misconception,
                "student_responses": [],
                "ta_interventions": [],
                "instructor_feedback": [],
                "final_explanation": "",
                "learning_outcome": "PENDING"  # PENDING | ACHIEVED | NOT_ACHIEVED
            },
            "messages": [
                {
                    "id": "msg_0",
                    "turn": 0,
                    "sender": "PEER",
                    "sender_name": profile["name"],
                    "content": initial_misconception,
                    "citation": "transcript-06, lines 13-16",
                    "timestamp": datetime.utcnow().isoformat() + "Z"
                }
            ]
        }

        self.sessions[session_id] = session
        save_session_log(session)
        return session

    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        if session_id in self.sessions:
            return self.sessions[session_id]

        # Try to restore from disk logs/sessions/{session_id}.json
        from backend.config import LOGS_DIR
        disk_file = LOGS_DIR / "sessions" / f"{session_id}.json"
        if disk_file.exists():
            try:
                import json
                with open(disk_file, "r", encoding="utf-8") as f:
                    loaded = json.load(f)
                    self.sessions[session_id] = loaded
                    return loaded
            except Exception as e:
                print(f"[Orchestrator] Failed reading session {session_id} from disk: {e}")

        # Auto-recover / initialize gracefully
        session = self.create_session(student_name="Học viên", lesson_id="transcript-06")
        session["session_id"] = session_id
        self.sessions[session_id] = session
        save_session_log(session)
        return session

    def extract_citation(self, text: str) -> Optional[str]:
        match = re.search(r"\[(transcript-06,?\s+lines?\s+\d+(?:-\d+)?)\]", text, re.IGNORECASE)
        if match:
            return match.group(1)
        match_nobracket = re.search(r"(transcript-06,?\s+lines?\s+\d+(?:-\d+)?)", text, re.IGNORECASE)
        if match_nobracket:
            return match_nobracket.group(1)
        return None

    def assess_student_understanding(self, text: str, phase: str) -> AssessmentResult:
        """
        CENTRAL AI ASSESSOR: Evaluates student reasoning and determines pedagogical routing.
        """
        text_lower = text.strip().lower()

        # 1. Scope Guard
        out_of_scope_terms = [
            "thời tiết", "weather", "món ăn", "ăn gì", "du lịch", "đá bóng",
            "chứng khoán", "tổng thống", "vi tích phân", "đạo hàm riêng", "bóng đá", "quantum", "lượng tử"
        ]
        if any(term in text_lower for term in out_of_scope_terms):
            return {
                "understanding_level": "OFF_SCOPE",
                "pedagogical_decision": "SCOPE_GUARD",
                "confidence_score": 0.98,
                "reasoning": "Câu hỏi nằm ngoài tài liệu bài giảng Attention."
            }

        # 2. Demand Answer
        demand_terms = ["cho đáp án", "nói luôn đáp án", "đáp án là gì", "nói luôn đi", "giải luôn hộ", "cho tôi đáp án"]
        if any(term in text_lower for term in demand_terms):
            return {
                "understanding_level": "DEMAND_ANSWER",
                "pedagogical_decision": "TA_SOCRATIC",
                "confidence_score": 0.95,
                "reasoning": "Học viên xin đáp án trực tiếp, TA cần từ chối và hướng dẫn Socratic."
            }

        # 3. One-word
        words = text.strip().split()
        if len(words) <= 2 and text_lower in ["đúng", "sai", "chuẩn", "không", "ừ", "uh", "ko biết", "chịu"]:
            return {
                "understanding_level": "ONE_WORD",
                "pedagogical_decision": "TA_SOCRATIC",
                "confidence_score": 0.90,
                "reasoning": "Câu trả lời quá vắn tắt, yêu cầu học viên giải thích chi tiết."
            }

        # 4. Refutation and Technical concepts
        has_refutation = any(k in text_lower for k in [
            "không phụ thuộc", "không phải", "sai rồi", "nhầm rồi", "bác bỏ", "khác biệt", "chưa đúng"
        ])
        has_technical = any(k in text_lower for k in [
            "query", "key", "value", "q, k, v", "tương quan", "ngữ nghĩa", "all-to-all",
            "khoảng cách", "xa nhau", "50 từ", "scaled dot-product", "softmax"
        ])

        if has_refutation and has_technical:
            return {
                "understanding_level": "CORRECT",
                "pedagogical_decision": "INSTRUCTOR_WRAPUP" if ("nhầm rồi" in text_lower or "thầy" in text_lower) else "PEER_DEBATE",
                "confidence_score": 0.92,
                "reasoning": "Học viên phản biện đúng bản chất Attention và chỉ ra điểm sai về khoảng cách vị trí."
            }
        elif has_technical or has_refutation:
            return {
                "understanding_level": "STRUGGLE",
                "pedagogical_decision": "TA_SOCRATIC",
                "confidence_score": 0.80,
                "reasoning": "Học viên đã chạm đến khái niệm nhưng chưa liên kết đầy đủ, cần TA gợi ý Socratic."
            }

        return {
            "understanding_level": "STRUGGLE",
            "pedagogical_decision": "PEER_DEBATE" if any(k in text_lower for k in ["bạn minh", "minh ơi", "tại sao", "sao lại"]) else "TA_SOCRATIC",
            "confidence_score": 0.75,
            "reasoning": "Học viên đang trao đổi và tìm hiểu, điều phối tác tử phù hợp theo lượt."
        }

    async def handle_student_message(self, session_id: str, student_content: str, slide_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        session = self.get_session(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")

        student_content = student_content.strip()
        current_turn = session["current_turn"]
        peer_id = session.get("peer_id", "milo")

        # 1. Add student message
        student_msg_id = f"msg_{len(session['messages'])}"
        student_msg = {
            "id": student_msg_id,
            "turn": current_turn,
            "sender": "STUDENT",
            "sender_name": session["student_name"],
            "content": student_content,
            "citation": None,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        if slide_context:
            student_msg["slide_context"] = {
                "slide_id": slide_context.get("slide_id"),
                "slide_title": slide_context.get("slide_title")
            }
            session["active_slide_id"] = slide_context.get("slide_id")
        session["messages"].append(student_msg)
        session["learning_evidence"]["student_responses"].append({
            "turn": current_turn,
            "content": student_content,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        })

        # Format conversation history for LLM
        history_for_llm = []
        for m in session["messages"]:
            role = "user" if m["sender"] == "STUDENT" else "assistant"
            tag = ""
            if m.get("slide_context") and m["slide_context"].get("slide_id"):
                tag = f" [Slide {m['slide_context']['slide_id']}]"
            history_for_llm.append({
                "role": role,
                "content": f"[{m['sender']} - {m['sender_name']}{tag}]: {m['content']}"
            })

        # 2. CENTRAL ASSESSOR EVALUATION
        current_phase = session["phase"]
        assessment = self.assess_student_understanding(student_content, current_phase)
        session.setdefault("central_assessor_logs", []).append({
            "turn": current_turn,
            "assessment": assessment,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        })

        selected_agent_role = "TA"
        selected_agent_name = TAAgent.NAME
        agent_response = ""
        citation = None

        # 3. CONDITIONAL ROUTING BASED ON ASSESSOR
        if assessment["understanding_level"] == "OFF_SCOPE":
            selected_agent_role = "TA"
            selected_agent_name = TAAgent.NAME
            agent_response = "Nội dung này không được đề cập trong tài liệu hiện tại."
            session["learning_evidence"]["ta_interventions"].append({
                "turn": current_turn,
                "type": "OUT_OF_SCOPE_GUARD",
                "message": agent_response
            })

        elif assessment["understanding_level"] in ["DEMAND_ANSWER", "ONE_WORD"]:
            selected_agent_role = "TA"
            selected_agent_name = TAAgent.NAME
            agent_response = await TAAgent.respond(session_id, history_for_llm, slide_context=slide_context)
            citation = self.extract_citation(agent_response) or "transcript-06, lines 13-16"
            session["learning_evidence"]["ta_interventions"].append({
                "turn": current_turn,
                "type": f"SOCRATIC_{assessment['understanding_level']}",
                "message": agent_response
            })
            session["phase"] = "WAITING_STUDENT_AFTER_TA"

        elif current_phase == "WAITING_STUDENT_1":
            # TC14 / Direct Comprehensive Refutation
            if assessment["understanding_level"] == "CORRECT" and ("nhầm rồi" in student_content.lower() or "thầy" in student_content.lower() or "all-to-all" in student_content.lower()):
                selected_agent_role = "INSTRUCTOR"
                selected_agent_name = InstructorAgent.NAME
                agent_response = await InstructorAgent.respond(session_id, history_for_llm, slide_context=slide_context)
                citation = self.extract_citation(agent_response) or "transcript-06, lines 12-16"
                session["learning_evidence"]["instructor_feedback"].append({
                    "turn": current_turn,
                    "message": agent_response
                })
                session["phase"] = "WAITING_FINAL_EXPLANATION"
            elif any(k in student_content.lower() for k in ["bạn minh", "minh ơi", "tại sao", "sao lại", "khoảng cách", "chưa đúng", "không đúng", "chưa hẳn"]):
                # Step 1: Peer AI responds first to discuss
                selected_agent_role = "PEER"
                selected_agent_name = session.get("peer_name", PeerAgent.NAME)
                agent_response = await PeerAgent.respond(session_id, history_for_llm, peer_id=peer_id, slide_context=slide_context)
                citation = self.extract_citation(agent_response) or "transcript-06, lines 13-16"
                session["phase"] = "WAITING_TA_GUIDANCE"
            else:
                # Step 2: TA intervenes with Socratic guidance
                selected_agent_role = "TA"
                selected_agent_name = TAAgent.NAME
                agent_response = await TAAgent.respond(session_id, history_for_llm, slide_context=slide_context)
                citation = self.extract_citation(agent_response) or "transcript-06, lines 13-16"
                session["learning_evidence"]["ta_interventions"].append({
                    "turn": current_turn,
                    "type": "SOCRATIC_GUIDANCE",
                    "message": agent_response
                })
                session["phase"] = "WAITING_STUDENT_AFTER_TA"

        elif current_phase == "WAITING_TA_GUIDANCE":
            # Step 2: TA follows up with Socratic questioning
            selected_agent_role = "TA"
            selected_agent_name = TAAgent.NAME
            agent_response = await TAAgent.respond(session_id, history_for_llm, slide_context=slide_context)
            citation = self.extract_citation(agent_response) or "transcript-06, lines 12-16"
            session["learning_evidence"]["ta_interventions"].append({
                "turn": current_turn,
                "type": "SOCRATIC_GUIDANCE",
                "message": agent_response
            })
            session["phase"] = "WAITING_STUDENT_AFTER_TA"

        elif current_phase == "WAITING_STUDENT_AFTER_TA":
            # Step 3: Instructor steps in to evaluate and request final synthesis
            selected_agent_role = "INSTRUCTOR"
            selected_agent_name = InstructorAgent.NAME
            agent_response = await InstructorAgent.respond(session_id, history_for_llm, slide_context=slide_context)
            citation = self.extract_citation(agent_response) or "transcript-06, lines 12-16"
            session["learning_evidence"]["instructor_feedback"].append({
                "turn": current_turn,
                "message": agent_response
            })
            session["phase"] = "WAITING_FINAL_EXPLANATION"

        elif current_phase == "WAITING_FINAL_EXPLANATION":
            # Student submitted final explanation
            selected_agent_role = "INSTRUCTOR"
            selected_agent_name = InstructorAgent.NAME

            is_valid_explanation = (
                len(student_content.split()) >= 8 and
                any(k in student_content.lower() for k in ["khoảng cách", "không phụ thuộc", "vị trí", "all-to-all"]) and
                any(k in student_content.lower() for k in ["tương quan", "query", "key", "value", "ngữ nghĩa", "rnn", "điểm nghẽn"])
            )

            if is_valid_explanation:
                agent_response = (
                    "Xuất sắc! Giảng viên công nhận: Bạn đã hiểu đúng và giải thích chuẩn xác bản chất của Attention Mechanism "
                    "theo [transcript-06, lines 12-16, lines 21-27]. Cơ chế tính tương quan all-to-all không phụ thuộc vào khoảng cách từ "
                    "đã hoàn toàn bác bỏ hiểu lầm ban đầu của bạn học. Phiên học chính thức hoàn thành ĐẠT MỤC TIÊU (ACHIEVED)!"
                )
                citation = "transcript-06, lines 12-16"
                session["status"] = "ACHIEVED"
                session["misconception_resolved"] = True
                session["learning_evidence"]["learning_outcome"] = "ACHIEVED"
                session["learning_evidence"]["final_explanation"] = student_content
                session["phase"] = "COMPLETED"
                # Difficulty adaptation: +1 level on independent success
                session["difficulty_level"] = min(3, session.get("difficulty_level", 1) + 1)
            elif slide_context and any(k in student_content.lower() for k in ["giải thích", "tóm tắt", "ví dụ", "như thế nào", "tại sao", "công thức", "slide", "là gì", "hỏi", "đối chiếu", "ngữ cảnh"]):
                agent_response = await InstructorAgent.respond(session_id, history_for_llm, slide_context=slide_context)
                citation = self.extract_citation(agent_response) or "transcript-06, lines 12-16"
            else:
                agent_response = (
                    "Lời giải thích của bạn đã có tiến bộ nhưng chưa hoàn toàn đầy đủ theo [transcript-06, lines 13-16, lines 17-20]. "
                    "Hãy nêu rõ: vì sao hai từ ở xa nhau vẫn có thể có attention cao, và vai trò của Query - Key trong việc tính điểm tương quan là gì? "
                    "Misconception chưa được sửa triệt để, mời bạn hoàn thiện thêm."
                )
                citation = "transcript-06, lines 13-16"
                session["learning_evidence"]["final_explanation"] = student_content

            session["learning_evidence"]["instructor_feedback"].append({
                "turn": current_turn,
                "message": agent_response
            })

        # Ensure citation formatting in response if missing
        if citation and f"[{citation}]" not in agent_response and citation not in agent_response and assessment["understanding_level"] != "OFF_SCOPE":
            agent_response += f" [{citation}]"

        # Record agent message (Exactly ONE agent speaks per turn)
        agent_msg_id = f"msg_{len(session['messages'])}"
        session["messages"].append({
            "id": agent_msg_id,
            "turn": current_turn,
            "sender": selected_agent_role,
            "sender_name": selected_agent_name,
            "content": agent_response,
            "citation": citation,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        })

        session["active_agent"] = selected_agent_role
        session["current_turn"] += 1
        save_session_log(session)
        return session

    def get_session_summary(self, session_id: str) -> Optional[Dict[str, Any]]:
        session = self.get_session(session_id)
        if not session:
            return None

        evidence = session.get("learning_evidence") or {}
        return {
            "session_id": session.get("session_id", session_id),
            "lesson_id": session.get("lesson_id", "transcript-06"),
            "lesson_title": session.get("lesson_title", "Attention Mechanism (transcript-06)"),
            "student_name": session.get("student_name", "Học viên"),
            "status": session.get("status", "IN_PROGRESS"),
            "total_turns": session.get("current_turn", 1),
            "peer_name": session.get("peer_name", "Minh / Milo"),
            "difficulty_level": session.get("difficulty_level", 1),
            "misconception_resolved": session.get("misconception_resolved", False),
            "initial_understanding": evidence.get("initial_understanding", ""),
            "misconception": evidence.get("misconception", ""),
            "student_responses": evidence.get("student_responses", []),
            "ta_interventions": evidence.get("ta_interventions", []),
            "instructor_feedback": evidence.get("instructor_feedback", []),
            "final_explanation": evidence.get("final_explanation", ""),
            "learning_outcome": evidence.get("learning_outcome", "PENDING"),
            "citations_used": [
                m.get("citation") for m in session.get("messages", []) if isinstance(m, dict) and m.get("citation")
            ]
        }

    def list_sessions(self) -> List[Dict[str, Any]]:
        result = []
        for s_id, s in self.sessions.items():
            result.append({
                "session_id": s_id,
                "lesson_title": s.get("lesson_title", "Attention Mechanism"),
                "student_name": s.get("student_name", "Học viên"),
                "status": s.get("status", "IN_PROGRESS"),
                "current_turn": s.get("current_turn", 1),
                "peer_name": s.get("peer_name", "Milo"),
                "difficulty_level": s.get("difficulty_level", 1),
                "misconception_resolved": s.get("misconception_resolved", False),
                "learning_outcome": s.get("learning_evidence", {}).get("learning_outcome", "PENDING"),
                "created_at": s.get("messages", [{}])[0].get("timestamp", "")
            })
        return list(reversed(result))

classroom_orchestrator = ClassroomOrchestrator()
