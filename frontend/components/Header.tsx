"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import SettingsModal from "./SettingsModal";
import { api } from "@/lib/api";

interface HeaderProps {
  sessionId?: string;
  currentTurn?: number;
  status?: "IN_PROGRESS" | "ACHIEVED" | string;
  activePage?: "home" | "classroom" | "summary" | "instructor" | "sessions";
}

export default function Header({
  sessionId,
  currentTurn,
  status,
  activePage,
}: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isAchieved = status === "ACHIEVED";
  const [showSettings, setShowSettings] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(sessionId || null);

  useEffect(() => {
    if (sessionId) {
      setActiveSessionId(sessionId);
      if (typeof window !== "undefined") {
        localStorage.setItem("vlearn_active_session_id", sessionId);
      }
    } else if (typeof window !== "undefined") {
      const saved = localStorage.getItem("vlearn_active_session_id");
      if (saved) setActiveSessionId(saved);
    }
  }, [sessionId]);

  const isLessons = activePage === "home" || pathname === "/";
  const isClassroom = activePage === "classroom" || pathname.startsWith("/classroom");
  const isSummary = activePage === "summary" || pathname.startsWith("/summary");
  const isInstructor = activePage === "instructor" || pathname.startsWith("/instructor");
  const isSessions = activePage === "sessions" || pathname.startsWith("/sessions");

  const handleClassroomClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (activeSessionId) {
      router.push(`/classroom/${activeSessionId}`);
      return;
    }
    try {
      const newSess = await api.startSession("Học viên", "transcript-06");
      if (typeof window !== "undefined") {
        localStorage.setItem("vlearn_active_session_id", newSess.session_id);
      }
      router.push(`/classroom/${newSess.session_id}`);
    } catch {
      router.push("/");
    }
  };

  const summaryHref = activeSessionId ? `/summary/${activeSessionId}` : "/sessions";

  return (
    <>
      <header className="h-14 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 px-4 md:px-6 flex items-center justify-between shrink-0 z-30 select-none">
        {/* Left: Modern Minimalist Brand & Navigation Switcher */}
        <div className="flex items-center space-x-6">
          <Link
            href="/"
            className="flex items-center space-x-2.5 group transition-opacity"
            title="VLearn Multi-Agent Classroom"
          >
            <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-mono font-black text-sm tracking-tighter shadow-xs">
              V
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-sm tracking-tight text-neutral-900">
                VLearn
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
                D1
              </span>
            </div>
          </Link>

          {/* Minimalist Segmented Navigation Bar */}
          <nav className="hidden md:flex items-center p-0.5 bg-neutral-100/90 rounded-lg border border-neutral-200/60 text-xs font-medium text-neutral-600">
            <Link
              href="/"
              className={`px-3 py-1 rounded-md transition-all ${
                isLessons
                  ? "bg-white text-neutral-950 font-semibold shadow-xs"
                  : "hover:text-neutral-950"
              }`}
            >
              Lessons
            </Link>

            <button
              type="button"
              onClick={handleClassroomClick}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                isClassroom
                  ? "bg-white text-neutral-950 font-semibold shadow-xs"
                  : "hover:text-neutral-950"
              }`}
            >
              Classroom
            </button>

            <Link
              href="/sessions"
              className={`px-3 py-1 rounded-md transition-all ${
                isSessions
                  ? "bg-white text-neutral-950 font-semibold shadow-xs"
                  : "hover:text-neutral-950"
              }`}
            >
              Sessions
            </Link>

            <Link
              href="/instructor"
              className={`px-3 py-1 rounded-md transition-all ${
                isInstructor
                  ? "bg-white text-neutral-950 font-semibold shadow-xs"
                  : "hover:text-neutral-950"
              }`}
            >
              Instructor
            </Link>

            <Link
              href={summaryHref}
              className={`px-3 py-1 rounded-md transition-all ${
                isSummary
                  ? "bg-white text-neutral-950 font-semibold shadow-xs"
                  : "hover:text-neutral-950"
              }`}
            >
              Summary
            </Link>
          </nav>
        </div>

        {/* Right: Live Room Status & Micro Actions */}
        <div className="flex items-center space-x-3">
          {/* Active Lesson & Turn Badge */}
          {isClassroom && (
            <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-neutral-50 border border-neutral-200 text-xs font-mono text-neutral-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-sans font-medium text-neutral-900">Attention (transcript-06)</span>
              {currentTurn !== undefined && (
                <>
                  <span className="text-neutral-300">·</span>
                  <span>Lượt {currentTurn}</span>
                </>
              )}
            </div>
          )}

          {/* Outcome Status Pill */}
          {isClassroom && (
            <div>
              {isAchieved ? (
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-neutral-900 text-white text-[11px] font-mono font-semibold shadow-xs">
                  <span>✓</span>
                  <span>ACHIEVED</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-300 text-[11px] font-mono font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>IN_PROGRESS</span>
                </span>
              )}
            </div>
          )}

          {/* Classroom -> Summary Quick Action */}
          {isClassroom && activeSessionId && (
            <Link
              href={`/summary/${activeSessionId}`}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white transition-all shadow-xs"
            >
              Xem Tóm tắt →
            </Link>
          )}

          {isSummary && activeSessionId && (
            <Link
              href={`/classroom/${activeSessionId}`}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-800 transition-all shadow-xs"
            >
              ← Vào lại lớp
            </Link>
          )}

          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(true)}
            className="w-8 h-8 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-600 flex items-center justify-center text-sm transition-colors cursor-pointer"
            title="Cài đặt & Thông tin hệ thống"
          >
            ⚙️
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center space-x-2 pl-2 border-l border-neutral-200">
            <div className="w-7 h-7 rounded-full bg-neutral-100 border border-neutral-300 text-neutral-900 text-xs font-bold flex items-center justify-center font-mono">
              AN
            </div>
            <span className="text-xs font-medium text-neutral-800 hidden sm:inline">
              Võ Trường An
            </span>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
}
