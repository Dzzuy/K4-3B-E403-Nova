"use client";

import { SessionData } from "@/lib/api";

interface SessionProgressProps {
  session?: SessionData | null;
  sessionId?: string;
  isAgentThinking?: boolean;
  activeAgent?: string;
}

export default function SessionProgress({
  session,
  sessionId,
  isAgentThinking,
  activeAgent,
}: SessionProgressProps) {
  const currentTurn = session?.current_turn ?? 1;
  const isAchieved = session?.status === "ACHIEVED";
  const misconceptionResolved = session?.misconception_resolved ?? false;

  const steps = [
    { title: "1. Peer nêu hiểu sai", desc: "Bạn Minh đưa misconception ban đầu" },
    { title: "2. Bạn phản biện", desc: "Học viên nhận diện và chỉ ra điểm sai" },
    { title: "3. TA gợi ý Socratic", desc: "Trợ giảng Linh hỗ trợ khi gặp khó khăn" },
    { title: "4. Giảng viên kiểm tra", desc: "Thầy Hoàng phản biện & yêu cầu chốt" },
    { title: "5. Hoàn thành ACHIEVED", desc: "Học viên tự giải thích đúng bản chất" },
  ];

  const getStepStatus = (stepIndex: number) => {
    if (isAchieved) return "completed";
    if (stepIndex === 1) return "completed";
    if (stepIndex === 2) {
      return (session?.learning_evidence?.student_responses?.length || 0) > 0
        ? "completed"
        : "current";
    }
    if (stepIndex === 3) {
      if ((session?.learning_evidence?.ta_interventions?.length || 0) > 0)
        return "completed";
      return session?.phase === "WAITING_STUDENT_AFTER_TA" ? "current" : "pending";
    }
    if (stepIndex === 4) {
      if ((session?.learning_evidence?.instructor_feedback?.length || 0) > 0)
        return "completed";
      return session?.phase === "WAITING_FINAL_EXPLANATION" ? "current" : "pending";
    }
    if (stepIndex === 5) {
      return isAchieved ? "completed" : "pending";
    }
    return "pending";
  };

  return (
    <nav className="w-64 h-full flex flex-col bg-neutral-900 text-neutral-100 border-r border-neutral-800 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-neutral-800">
        <div className="flex items-center space-x-2.5 mb-1.5">
          <span className="font-mono text-xs font-bold bg-white text-neutral-900 px-2 py-0.5 rounded shadow-xs">
            VLearn D1
          </span>
          <span className="text-xs font-semibold tracking-tight text-neutral-200">
            Multi-Agent Lab
          </span>
        </div>
        <p className="text-[11px] text-neutral-400 leading-snug">
          Mô phỏng lớp học phản biện đa tác tử với Socratic Tutoring.
        </p>
      </div>

      {/* Session Status Widget */}
      {session && (
        <div className="p-3.5 border-b border-neutral-800 bg-neutral-950/40">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono text-neutral-400">TRẠNG THÁI PHIÊN</span>
            {isAchieved ? (
              <span className="text-[9px] font-mono font-bold bg-white text-black px-2 py-0.5 rounded">
                ACHIEVED
              </span>
            ) : (
              <span className="text-[9px] font-mono font-bold bg-neutral-800 text-neutral-300 border border-neutral-700 px-2 py-0.5 rounded animate-pulse">
                IN_PROGRESS
              </span>
            )}
          </div>

          <div className="text-xs font-mono text-neutral-300 mb-1">
            Lượt hiện tại: <span className="font-bold text-white">{currentTurn}</span>
          </div>

          <div className="mt-2 pt-2 border-t border-neutral-800">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-neutral-400">Misconception:</span>
              {misconceptionResolved ? (
                <span className="font-bold text-emerald-400 text-[10px] font-mono">
                  ✓ ĐÃ SỬA XONG
                </span>
              ) : (
                <span className="font-bold text-amber-400 text-[10px] font-mono">
                  ⚠ CHƯA ĐƯỢC SỬA
                </span>
              )}
            </div>
            {!misconceptionResolved && (
              <p className="text-[10px] text-neutral-400 mt-1 leading-tight">
                Phiên học sẽ không kết thúc cho đến khi bạn sửa đúng hiểu sai của bạn Minh.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Learning Scaffold Steps */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
        <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1">
          Tiến trình buổi học (Scaffold)
        </div>

        <div className="space-y-2">
          {steps.map((step, idx) => {
            const status = getStepStatus(idx + 1);

            return (
              <div
                key={idx}
                className={`p-2.5 rounded border transition-all ${
                  status === "completed"
                    ? "bg-neutral-800/80 border-neutral-700 text-neutral-200"
                    : status === "current"
                    ? "bg-neutral-800 border-white text-white shadow-xs"
                    : "bg-neutral-950/20 border-neutral-800/60 text-neutral-500"
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-semibold">{step.title}</span>
                  {status === "completed" && (
                    <span className="text-[10px] font-mono text-neutral-300">✓ Đạt</span>
                  )}
                  {status === "current" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  )}
                </div>
                <p className="text-[10px] leading-tight opacity-80">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-neutral-800 text-[10px] font-mono text-neutral-500 text-center">
        VLearn Multi-Agent Classroom D1
      </div>
    </nav>
  );
}
