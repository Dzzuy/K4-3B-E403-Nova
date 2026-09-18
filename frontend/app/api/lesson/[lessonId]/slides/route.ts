import { NextResponse } from "next/server";
import { getLessonSlidesData } from "@/lib/slide_data";

const FASTAPI_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const { lessonId } = await params;
    const url = new URL(req.url);
    const mode = (url.searchParams.get("mode") || "detailed") as "detailed" | "overview";

    try {
      const res = await fetch(`${FASTAPI_URL}/api/lessons/${lessonId}/slides?mode=${mode}`, {
        signal: AbortSignal.timeout(1200),
      });
      if (res.ok) {
        return NextResponse.json(await res.json());
      }
    } catch {}

    const slidesData = getLessonSlidesData(lessonId, mode);
    return NextResponse.json(slidesData);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
