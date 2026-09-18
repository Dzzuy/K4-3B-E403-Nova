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
      const res = await fetch(`${FASTAPI_URL}/api/session/${sessionId}`, {
        signal: AbortSignal.timeout(1200),
      });
      if (res.ok) {
        return NextResponse.json(await res.json());
      }
    } catch {}

    // 2. Fallback to local memory/disk/auto-recovery
    const sess = getSessionLocal(sessionId);
    return NextResponse.json(sess);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
