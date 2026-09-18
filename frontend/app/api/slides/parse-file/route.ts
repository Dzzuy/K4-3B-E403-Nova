import { NextResponse } from "next/server";
import { parseCustomTextFileToSlides } from "@/lib/slide_data";

const FASTAPI_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const text = body.text || "";
    const filename = body.filename || "custom_document.txt";

    try {
      const res = await fetch(`${FASTAPI_URL}/api/slides/parse-file`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, filename }),
        signal: AbortSignal.timeout(1500),
      });
      if (res.ok) {
        return NextResponse.json(await res.json());
      }
    } catch {}

    const slidesData = parseCustomTextFileToSlides(text, filename);
    return NextResponse.json(slidesData);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
