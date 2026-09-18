"use client";

import { useState } from "react";
import Link from "next/link";
import { SessionData } from "@/lib/api";

interface ParticipantsPanelProps {
  session?: SessionData | null;
  activeAgent?: string;
  isAgentThinking?: boolean;
}

export default function ParticipantsPanel({
  session,
  activeAgent = "PEER",
  isAgentThinking = false,
}: ParticipantsPanelProps) {
  const [showAllParticipants, setShowAllParticipants] = useState(false);
  const currentTurn = session?.current_turn ?? 1;
  const isAchieved = session?.status === "ACHIEVED";
  const misconceptionResolved = session?.misconception_resolved ?? false;

  // 4 Primary Active Role Agents
  const primaryParticipants = [
    {
      id: "student",
      role: "STUDENT",
      name: session?.student_name || "Bạn (Học viên)",
      avatarBg: "bg-neutral-900 text-white",
      avatarText: "HV",
      roleLabel: "YOU",
      desc: "Người học tích cực",
      state: isAgentThinking ? "waiting" : isAchieved ? "waiting" : "speaking",
      stateText: isAgentThinking
        ? "Lắng nghe"
        : isAchieved
        ? "Hoàn thành"
        : "Đến lượt bạn",
    },
    {
      id: "peer",
      role: "PEER",
      name: "Minh (Bạn học)",
      avatarBg: "bg-neutral-100 border border-neutral-300 text-neutral-800",
      avatarText: "P",
      roleLabel: "PEER",
      desc: "Đưa ra hiểu lầm ban đầu",
      state:
        activeAgent === "PEER" && isAgentThinking
          ? "thinking"
          : activeAgent === "PEER"
          ? "speaking"
          : "waiting",
      stateText:
        activeAgent === "PEER" && isAgentThinking
          ? "Đang suy nghĩ..."
          : activeAgent === "PEER"
          ? "Đang nói"
          : "Lắng nghe",
    },
    {
      id: "ta",
      role: "TA",
      name: "Linh (Trợ giảng)",
      avatarBg: "bg-neutral-800 text-white",
      avatarText: "TA",
      roleLabel: "TA SOCRATIC",
      desc: "Gợi ý từng bước qua câu hỏi",
      state:
        activeAgent === "TA" && isAgentThinking
          ? "thinking"
          : activeAgent === "TA"
          ? "speaking"
          : "waiting",
      stateText:
        activeAgent === "TA" && isAgentThinking
          ? "Đang soạn gợi ý..."
          : activeAgent === "TA"
          ? "Đang nói"
          : "Chờ can thiệp",
    },
    {
      id: "instructor",
      role: "INSTRUCTOR",
      name: "Thầy Hoàng (Giảng viên)",
      avatarBg: "bg-black text-white",
      avatarText: "AI",
      roleLabel: "INSTRUCTOR",
      desc: "Chốt chuẩn kiến thức & outcome",
      state:
        activeAgent === "INSTRUCTOR" && isAgentThinking
          ? "thinking"
          : activeAgent === "INSTRUCTOR"
          ? "speaking"
          : "waiting",
      stateText:
        activeAgent === "INSTRUCTOR" && isAgentThinking
          ? "Đang đối chiếu bài học..."
          : activeAgent === "INSTRUCTOR"
          ? "Đang chốt"
          : "Theo dõi lớp",
    },
  ];

  // Additional Peers / Classmates in Room
  const otherClassmates = [
    {
      id: "c1",
      name: "Trần Nam Anh",
      avatarText: "NA",
      status: "Đang theo dõi bài giảng",
      stateText: "Đang nghe",
    },
    {
      id: "c2",
      name: "Lâm Quang Anh Quân",
      avatarText: "AQ",
      status: "Đang ghi chú Q, K, V",
      stateText: "Ghi chép",
    },
    {
      id: "c3",
      name: "Mai Hoàng Anh",
      avatarText: "HA",
      status: "Đang xem slide Attention",
      stateText: "Đang xem slide",
    },
    {
      id: "c4",
      name: "Nguyễn Minh Khang",
      avatarText: "MK",
      status: "Đang đối chiếu transcript",
      stateText: "Đang đọc",
    },
    {
      id: "c5",
      name: "Phạm Quốc Đạt",
      avatarText: "QĐ",
      status: "Theo dõi phản biện",
      stateText: "Lắng nghe",
    },
    {
      id: "c6",
      name: "Nguyễn Hữu Chương",
      avatarText: "HC",
      status: "Đang quan sát lớp",
      stateText: "Trực tuyến",
    },
    {
      id: "c7",
      name: "Lê Thảo Nguyên",
      avatarText: "TN",
      status: "Đang ôn bài",
      stateText: "Đang nghe",
    },
    {
      id: "c8",
      name: "Đặng Bảo Ngọc",
      avatarText: "BN",
      status: "Đang xem transcript-06",
      stateText: "Trực tuyến",
    },
  ];

  const totalParticipantsCount = primaryParticipants.length + otherClassmates.length;

  const steps = [
    { title: "1. Peer nêu hiểu sai", done: true },
    {
      title: "2. Bạn phản biện",
      done: (session?.learning_evidence?.student_responses?.length || 0) > 0,
    },
    {
      title: "3. TA gợi ý Socratic",
      done: (session?.learning_evidence?.ta_interventions?.length || 0) > 0,
    },
    {
      title: "4. Giảng viên kiểm tra",
      done: (session?.learning_evidence?.instructor_feedback?.length || 0) > 0,
    },
    { title: "5. Tự giải thích đúng", done: isAchieved },
  ];

  return (
    <aside className="w-64 h-full flex flex-col bg-white border-r border-neutral-200/80 shrink-0 select-none overflow-hidden">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-neutral-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
            Participants
          </span>
          <span className="text-[10px] font-mono bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full border border-neutral-200 font-semibold">
            {totalParticipantsCount} trong lớp
          </span>
        </div>
        <span className="text-[10px] font-mono text-neutral-400">
          Turn {currentTurn}
        </span>
      </div>

      {/* Scrollable Body Container */}
      <div className="flex-1 overflow-y-auto">
        {/* Section 1: 4 Primary Active Role Cards */}
        <div className="p-3 space-y-2 border-b border-neutral-100">
          <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1 flex items-center justify-between">
            <span>Thảo luận chính</span>
            <span className="text-neutral-400 font-normal">4 tác tử</span>
          </div>

          {primaryParticipants.map((p) => {
            const isSpeaking = p.state === "speaking";
            const isThinking = p.state === "thinking";

            return (
              <div
                key={p.id}
                className={`p-2.5 rounded-xl border transition-all ${
                  isSpeaking
                    ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                    : isThinking
                    ? "bg-neutral-50 text-neutral-900 border-neutral-300 animate-pulse"
                    : "bg-white text-neutral-800 border-neutral-200/70 hover:border-neutral-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2.5">
                    <div
                      className={`w-6 h-6 rounded-lg ${p.avatarBg} text-[10px] font-mono font-bold flex items-center justify-center shrink-0 shadow-xs`}
                    >
                      {p.avatarText}
                    </div>
                    <div>
                      <div
                        className={`text-xs font-semibold leading-tight truncate max-w-[110px] ${
                          isSpeaking ? "text-white" : "text-neutral-900"
                        }`}
                      >
                        {p.name}
                      </div>
                      <div
                        className={`text-[10px] leading-tight truncate max-w-[110px] ${
                          isSpeaking ? "text-neutral-400" : "text-neutral-400"
                        }`}
                      >
                        {p.desc}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                      isSpeaking
                        ? "bg-neutral-800 text-neutral-300 border border-neutral-700"
                        : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                    }`}
                  >
                    {p.roleLabel}
                  </span>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center space-x-1.5 pt-1 text-[10px] font-mono">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSpeaking
                        ? "bg-emerald-400 animate-ping"
                        : isThinking
                        ? "bg-amber-400 animate-pulse"
                        : "bg-neutral-300"
                    }`}
                  />
                  <span
                    className={
                      isSpeaking
                        ? "text-neutral-300 font-medium"
                        : "text-neutral-500"
                    }
                  >
                    {p.stateText}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Section 2: Expandable Other Classmates in Room */}
        <div className="p-3 border-b border-neutral-100 bg-neutral-50/40">
          <button
            type="button"
            onClick={() => setShowAllParticipants(!showAllParticipants)}
            className="w-full flex items-center justify-between text-xs font-mono font-semibold text-neutral-700 hover:text-neutral-950 p-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 transition cursor-pointer shadow-2xs"
          >
            <div className="flex items-center space-x-2">
              <span>👥</span>
              <span>
                {showAllParticipants ? "Thu gọn danh sách" : `Xem thêm ${otherClassmates.length} bạn học khác`}
              </span>
            </div>
            <span className="text-[10px] text-neutral-400">
              {showAllParticipants ? "▴" : "▾"}
            </span>
          </button>

          {showAllParticipants && (
            <div className="mt-2.5 space-y-1.5 pt-1">
              <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 px-1 mb-1 flex items-center justify-between">
                <span>Bạn cùng phòng học</span>
                <span>{otherClassmates.length} trực tuyến</span>
              </div>

              {otherClassmates.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-white border border-neutral-200/70 text-xs hover:border-neutral-300 transition"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <div className="w-5 h-5 rounded-md bg-neutral-100 border border-neutral-300 text-[9px] font-mono font-bold text-neutral-700 flex items-center justify-center shrink-0">
                      {c.avatarText}
                    </div>
                    <div className="truncate">
                      <div className="font-medium text-neutral-800 truncate text-[11px] leading-tight">
                        {c.name}
                      </div>
                      <div className="text-[9px] text-neutral-400 truncate leading-tight">
                        {c.status}
                      </div>
                    </div>
                  </div>

                  <span className="text-[9px] font-mono text-neutral-400 bg-neutral-50 border border-neutral-200 px-1.5 py-0.2 rounded-full shrink-0 ml-1">
                    {c.stateText}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Misconception Live Status Card */}
        <div className="p-3.5 border-b border-neutral-100">
          <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
            Misconception Status
          </div>
          {misconceptionResolved ? (
            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 space-y-0.5">
              <div className="flex items-center space-x-1.5 font-bold font-mono text-[10px] text-emerald-800">
                <span>✓</span>
                <span>ĐÃ GIẢI QUYẾT XONG</span>
              </div>
              <p className="text-[11px] text-emerald-700 leading-tight">
                Học viên đã sửa đúng hiểu sai của bạn Minh.
              </p>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-800 space-y-1">
              <div className="flex items-center space-x-1.5 font-bold font-mono text-[10px] text-amber-800">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>HIỂU LẦM ĐANG MỞ</span>
              </div>
              <p className="text-[11px] text-neutral-600 leading-tight">
                Bạn Minh nghĩ Attention chỉ gán trọng số theo khoảng cách gần kề.
              </p>
            </div>
          )}
        </div>

        {/* Section 4: Learning Progression Stepper */}
        <div className="p-3.5 space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
            Tiến trình buổi học
          </div>
          <div className="space-y-1 font-mono text-[11px]">
            {steps.map((st, i) => (
              <div
                key={i}
                className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                  st.done
                    ? "bg-neutral-100 text-neutral-900 font-medium"
                    : "text-neutral-400 hover:text-neutral-600"
                }`}
              >
                <span>{st.title}</span>
                <span>{st.done ? "✓" : "○"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="p-2.5 border-t border-neutral-100 bg-neutral-50/60 grid grid-cols-3 gap-1 text-[10px] font-mono text-center text-neutral-600 shrink-0">
        <Link
          href="/"
          className="p-1 rounded hover:bg-neutral-200 transition"
          title="Về danh sách bài học"
        >
          📖 Lessons
        </Link>
        <Link
          href="/sessions"
          className="p-1 rounded hover:bg-neutral-200 transition"
          title="Lịch sử các phiên học"
        >
          📜 Sessions
        </Link>
        <Link
          href="/instructor"
          className="p-1 rounded hover:bg-neutral-200 transition"
          title="Cấu hình kịch bản"
        >
          ⚙️ Studio
        </Link>
      </div>
    </aside>
  );
}
