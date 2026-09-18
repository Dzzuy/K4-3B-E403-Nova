"use client";

export default function Footer() {
  return (
    <footer className="h-10 border-t border-neutral-300 bg-white px-6 text-[11px] text-neutral-500 font-mono shrink-0 select-none flex items-center">
      <div className="w-full flex items-center justify-between">
        <span>Đề tài D1: Lớp học mô phỏng đa tác tử trên VLearn</span>
        <span className="hidden md:inline">Batch 04 · Lớp 3B · Nhóm Nova (Phòng E403)</span>
        <span>Next.js + FastAPI + LLM Orchestrator</span>
      </div>
    </footer>
  );
}
