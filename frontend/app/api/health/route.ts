import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("http://127.0.0.1:8000/api/health", { signal: AbortSignal.timeout(5000) });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch {
    return NextResponse.json({ detail: "FastAPI backend is unavailable" }, { status: 503 });
  }
}
