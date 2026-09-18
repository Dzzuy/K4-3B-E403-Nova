import { NextResponse } from "next/server";
import { getTranscriptLines } from "@/lib/orchestrator";

const FASTAPI_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const { lessonId } = await params;

    // 1. Try FastAPI
    try {
      const res = await fetch(`${FASTAPI_URL}/api/lesson/${lessonId}`, {
        signal: AbortSignal.timeout(1200),
      });
      if (res.ok) {
        return NextResponse.json(await res.json());
      }
    } catch {}

    // 2. Fallback to transcript lines
    const rawLines = getTranscriptLines();
    return NextResponse.json({
      lesson_id: "transcript-06",
      title: "Attention Mechanism (transcript-06)",
      total_lines: rawLines.length,
      lines: rawLines.map((text, idx) => ({ line_number: idx + 1, text })),
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
