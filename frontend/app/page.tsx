"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, checkBackendHealth } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function LessonsPage() {
  const router = useRouter();
  const [studentName, setStudentName] = useState("Võ Trường An");
  const [selectedLesson, setSelectedLesson] = useState("transcript-06");
  const [selectedPeer, setSelectedPeer] = useState("milo");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [backendStatus, setBackendStatus] = useState<{
    online: boolean;
    source: "fastapi" | "internal";
  }>({ online: true, source: "internal" });

  useEffect(() => {
    async function verifyBackend() {
      const status = await checkBackendHealth();
      setBackendStatus(status);
    }
    verifyBackend();
  }, []);

  const handleStartSession = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!studentName.trim()) {
      setError("Vui lòng nhập họ và tên của bạn để bắt đầu phiên học.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const session = await api.startSession(studentName.trim(), selectedLesson, selectedPeer);
      if (typeof window !== "undefined") {
        localStorage.setItem("vlearn_active_session_id", session.session_id);
      }
      router.push(`/classroom/${session.session_id}`);
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ||
          "Không thể khởi tạo phòng học. Hãy kiểm tra máy chủ backend."
      );
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-neutral-50/60 text-neutral-900 flex flex-col overflow-hidden">
      {/* Top Header */}
      <Header activePage="home" />

      {/* Main Workspace */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col items-center justify-center">
        <div className="max-w-4xl w-full space-y-6">
          {/* Header Banner */}
          <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 md:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-[10px] font-bold bg-neutral-900 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  VLearn Track D1
                </span>
                <div className="flex items-center space-x-1.5 text-[11px] font-mono text-neutral-500">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      backendStatus.online ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />
                  <span>
                    Engine: {backendStatus.source === "fastapi" ? "FastAPI Live Backend" : "Next.js AI Engine"}
                  </span>
                </div>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900">
                Lớp học mô phỏng đa tác tử
              </h1>
              <p className="text-xs md:text-sm text-neutral-500 max-w-xl leading-relaxed">
                Tương tác phản biện cùng 3 tác tử AI chuyên biệt: Bạn học (Peer) mang hiểu sai ban đầu, 
                Trợ giảng (TA) dùng Socratic questioning, và Giảng viên (AI Instructor) kiểm tra & chốt kiến thức.
              </p>
            </div>

            {/* Learner Name Input Widget */}
            <div className="w-full md:w-72 shrink-0 bg-neutral-50 border border-neutral-200/80 rounded-2xl p-4 space-y-1.5">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold">
                Họ tên người học
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Nhập họ tên của bạn..."
                className="w-full text-xs font-medium border border-neutral-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10 transition shadow-2xs"
              />
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-mono rounded-2xl">
              ⚠ {error}
            </div>
          )}

          {/* Primary Lesson Card: Attention Mechanism */}
          <div className="bg-white border-2 border-neutral-900 rounded-3xl p-6 md:p-8 transition-all shadow-md ring-1 ring-neutral-900/5 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-[10px] font-bold bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-md text-neutral-800">
                    SCENARIO MVP
                  </span>
                  <span className="font-mono text-xs text-neutral-400">
                    transcript-06.txt · 32 dòng chuẩn
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-neutral-900 tracking-tight">
                  Attention Mechanism & Transformer
                </h2>
                <p className="text-xs text-neutral-500 leading-relaxed max-w-2xl">
                  Khám phá cơ chế Self-Attention, khắc phục điểm nghẽn nén cố định (fixed-size bottleneck) của RNN, và phản biện quan niệm sai lầm về khoảng cách vị trí liền kề.
                </p>
              </div>

              <div className="shrink-0">
                <span className="inline-block font-mono text-xs bg-neutral-50 border border-neutral-200 px-3 py-1.5 rounded-full text-neutral-700 font-semibold">
                  ⏱ 5–10 minutes
                </span>
              </div>
            </div>

            {/* Peer Profile & Difficulty Selector */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-700">
                  Chọn bạn học phản biện (Peer Difficulty Level):
                </span>
                <span className="text-[10px] font-mono text-neutral-400">
                  Adaptive Interaction State
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPeer("milo")}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedPeer === "milo"
                      ? "border-neutral-900 bg-neutral-50 shadow-xs ring-1 ring-neutral-900/10"
                      : "border-neutral-200/80 bg-white hover:border-neutral-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-neutral-900">Milo</span>
                    <span className="text-[10px] font-mono bg-neutral-200 text-neutral-800 px-2 py-0.5 rounded-full font-semibold">
                      Level 1
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 leading-snug">
                    Curious Beginner · Hiểu lầm ngây thơ về khoảng cách vị trí gần kề.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPeer("kai")}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedPeer === "kai"
                      ? "border-neutral-900 bg-neutral-50 shadow-xs ring-1 ring-neutral-900/10"
                      : "border-neutral-200/80 bg-white hover:border-neutral-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-neutral-900">Kai</span>
                    <span className="text-[10px] font-mono bg-neutral-800 text-white px-2 py-0.5 rounded-full font-semibold">
                      Level 2
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 leading-snug">
                    Confident Challenger · Phản biện sắc bén về context length và all-to-all.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPeer("nova")}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedPeer === "nova"
                      ? "border-neutral-900 bg-neutral-50 shadow-xs ring-1 ring-neutral-900/10"
                      : "border-neutral-200/80 bg-white hover:border-neutral-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-neutral-900">Nova</span>
                    <span className="text-[10px] font-mono bg-black text-white px-2 py-0.5 rounded-full font-semibold">
                      Level 3
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 leading-snug">
                    Analytical Skeptic · Edge cases, Scaling factor sqrt(d_k) và Softmax.
                  </p>
                </button>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-neutral-100">
              <div className="text-[11px] font-mono text-neutral-400">
                Grounding bắt buộc: <span className="text-neutral-700 font-semibold">[transcript-06, lines X-Y]</span>
              </div>

              <button
                type="button"
                onClick={() => handleStartSession()}
                disabled={loading}
                className="w-full sm:w-auto bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-mono font-bold px-8 py-3.5 rounded-2xl transition-all flex items-center justify-center space-x-2.5 disabled:opacity-50 cursor-pointer shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang khởi tạo phòng học...</span>
                  </>
                ) : (
                  <span>VÀO PHÒNG HỌC (START CLASSROOM) →</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
