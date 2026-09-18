import { NextResponse } from "next/server";
import { getScenario, updateScenario } from "@/lib/orchestrator";

const FASTAPI_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    try {
      const res = await fetch(`${FASTAPI_URL}/api/scenario`, {
        signal: AbortSignal.timeout(1200),
      });
      if (res.ok) {
        return NextResponse.json(await res.json());
      }
    } catch {}

    return NextResponse.json(getScenario());
  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    try {
      const res = await fetch(`${FASTAPI_URL}/api/scenario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(1200),
      });
      if (res.ok) {
        return NextResponse.json(await res.json());
      }
    } catch {}

    const updated = updateScenario(body);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 400 });
  }
}
