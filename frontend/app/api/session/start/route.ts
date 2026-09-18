import { NextResponse } from "next/server";
import { createLocalSession } from "@/lib/orchestrator";

const FASTAPI_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    // 1. Try FastAPI backend with 1.2s timeout
    try {
      const res = await fetch(`${FASTAPI_URL}/api/session/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(1200),
      });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data, { status: 201 });
      }
    } catch {}

    // 2. Fallback to internal orchestrator
    const session = createLocalSession(body.student_name, body.lesson_id);
    return NextResponse.json(session, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || "Lỗi khởi tạo phiên" },
      { status: 400 }
    );
  }
}
