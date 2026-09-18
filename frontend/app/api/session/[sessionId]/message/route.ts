import { NextResponse } from "next/server";
import { handleLocalStudentMessage } from "@/lib/orchestrator";

const FASTAPI_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const body = await req.json().catch(() => ({}));

    if (!sessionId) {
      return NextResponse.json({ detail: "Thiếu session ID" }, { status: 400 });
    }

    // 1. Try FastAPI backend
    try {
      const res = await fetch(`${FASTAPI_URL}/api/session/${sessionId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(1500),
      });
      if (res.ok) {
        return NextResponse.json(await res.json());
      }
    } catch {}

    // 2. Fallback to internal orchestrator
    const updated = handleLocalStudentMessage(sessionId, body.content || "");
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 400 });
  }
}
