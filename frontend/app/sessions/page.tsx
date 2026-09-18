"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { apiFetch } from "@/lib/api";

interface SessionItem {
  session_id: string;
  lesson_title: string;
  student_name: string;
  status: "IN_PROGRESS" | "ACHIEVED";
  current_turn: number;
  misconception_resolved: boolean;
  learning_outcome: string;
  created_at: string;
}

export default function SessionsPage() {
  const [sessionsList, setSessionsList] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const data = await apiFetch<SessionItem[]>("/api/sessions");
        setSessionsList(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, []);

  return (
    <div className="h-screen bg-neutral-50/60 flex flex-col overflow-hidden text-neutral-900">
      <Header activePage="sessions" />

      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 md:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="font-mono text-[10px] font-bold bg-neutral-900 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Sessions History
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 mt-2">
                Lịch sử Các Phiên Học Mô Phỏng
              </h1>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Danh sách toàn bộ các phiên học AI đa tác tử đã diễn ra trên VLearn.
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <Link
                href="/slide-ai"
                className="bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-300 text-xs font-semibold px-4 py-2.5 rounded-xl transition inline-flex items-center space-x-1.5 shadow-2xs"
              >
                <span>📚 Học với Slide AI</span>
              </Link>
              <Link
                href="/"
                className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition inline-flex items-center space-x-1.5 shadow-xs"
              >
                <span>+ Bắt đầu phiên mới</span>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm font-mono text-neutral-400">
              Đang tải danh sách phiên học...
            </div>
          ) : sessionsList.length === 0 ? (
            <div className="bg-white border border-neutral-200/80 rounded-3xl p-12 text-center space-y-3 shadow-xs">
              <p className="text-sm font-semibold text-neutral-800">
                Chưa có phiên học nào được ghi nhận.
              </p>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Hãy chọn bài học Attention Mechanism và bắt đầu buổi học đầu tiên để lưu vết bằng chứng học tập!
              </p>
              <Link
                href="/"
                className="inline-block bg-neutral-900 text-white text-xs font-medium px-5 py-2.5 rounded-xl transition shadow-xs"
              >
                Vào trang bài học →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {sessionsList.map((s) => {
                const isAchieved = s.learning_outcome === "ACHIEVED" || s.status === "ACHIEVED";

                return (
                  <div
                    key={s.session_id}
                    className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-neutral-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-neutral-900">
                          {s.session_id}
                        </span>
                        <span className="text-neutral-300">·</span>
                        <span className="text-xs font-medium text-neutral-700">
                          {s.student_name}
                        </span>
                        {isAchieved ? (
                          <span className="text-[10px] font-mono font-bold bg-neutral-900 text-white px-2 py-0.5 rounded-full">
                            ACHIEVED
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono bg-neutral-100 text-neutral-700 border border-neutral-200 px-2 py-0.5 rounded-full">
                            IN_PROGRESS
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-neutral-800">
                        {s.lesson_title}
                      </div>
                      <div className="text-[11px] font-mono text-neutral-400 flex items-center space-x-3">
                        <span>Lượt: {s.current_turn}</span>
                        <span>·</span>
                        <span>
                          Misconception: {s.misconception_resolved ? "✓ Đã sửa" : "⚠ Chưa sửa"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <Link
                        href="/slide-ai"
                        className="text-xs font-medium bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-700 px-3 py-2 rounded-xl transition flex items-center space-x-1"
                        title="Học bài giảng tương tác với Slide AI"
                      >
                        <span>📚 Slide</span>
                      </Link>
                      <Link
                        href={`/classroom/${s.session_id}`}
                        className="text-xs font-medium bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-800 px-3.5 py-2 rounded-xl transition"
                      >
                        Vào lớp →
                      </Link>
                      <Link
                        href={`/summary/${s.session_id}`}
                        className="text-xs font-medium bg-neutral-900 hover:bg-neutral-800 text-white px-3.5 py-2 rounded-xl transition shadow-xs"
                      >
                        Báo cáo →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
