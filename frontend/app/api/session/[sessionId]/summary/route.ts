import { NextResponse } from "next/server";
import { getSessionLocal } from "@/lib/orchestrator";

const FASTAPI_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json({ detail: "Thiếu session ID" }, { status: 400 });
    }

    // 1. Try FastAPI
    try {
      const res = await fetch(`${FASTAPI_URL}/api/session/${sessionId}/summary`, {
        signal: AbortSignal.timeout(1200),
      });
      if (res.ok) {
        return NextResponse.json(await res.json());
      }
    } catch {}

    // 2. Fallback to local memory/disk/auto-recovery
    const sess = getSessionLocal(sessionId);
    const citationsUsed = (sess.messages || [])
      .map((m) => m?.citation)
      .filter((c): c is string => Boolean(c));

    const ev = sess.learning_evidence || ({} as any);

    return NextResponse.json({
      session_id: sess.session_id,
      lesson_id: sess.lesson_id || "transcript-06",
      lesson_title: sess.lesson_title || "Attention Mechanism",
      student_name: sess.student_name || "Học viên",
      status: sess.status || "IN_PROGRESS",
      total_turns: sess.current_turn || 1,
      misconception_resolved: Boolean(sess.misconception_resolved),
      initial_understanding: ev.initial_understanding || "",
      misconception: ev.misconception || "",
      student_responses: ev.student_responses || [],
      ta_interventions: ev.ta_interventions || [],
      instructor_feedback: ev.instructor_feedback || [],
      final_explanation: ev.final_explanation || "",
      learning_outcome: ev.learning_outcome || "PENDING",
      citations_used: citationsUsed,
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
