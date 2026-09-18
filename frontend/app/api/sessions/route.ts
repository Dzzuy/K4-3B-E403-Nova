import { NextResponse } from "next/server";
import { sessions } from "@/lib/orchestrator";

const FASTAPI_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    try {
      const res = await fetch(`${FASTAPI_URL}/api/sessions`, {
        signal: AbortSignal.timeout(1200),
      });
      if (res.ok) {
        return NextResponse.json(await res.json());
      }
    } catch {}

    const result = [];
    for (const [sId, s] of sessions.entries()) {
      result.push({
        session_id: sId,
        lesson_title: s.lesson_title,
        student_name: s.student_name,
        status: s.status,
        current_turn: s.current_turn,
        misconception_resolved: s.misconception_resolved,
        learning_outcome: s.learning_evidence?.learning_outcome || "PENDING",
        created_at: s.messages[0]?.timestamp || new Date().toISOString(),
      });
    }

    return NextResponse.json(result.reverse());
  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
