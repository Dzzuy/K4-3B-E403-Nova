"use client";

import { useState } from "react";
import Link from "next/link";
import { SummaryData } from "@/lib/api";

interface LearningSummaryProps {
  summary: SummaryData;
}

export default function LearningSummary({ summary }: LearningSummaryProps) {
  const [copied, setCopied] = useState(false);
  const isAchieved = summary.learning_outcome === "ACHIEVED";

  const handleCopy = () => {
    const textReport = `
=== VLEARN LEARNING EVIDENCE REPORT ===
Phiên học: ${summary.session_id}
Bài học: ${summary.lesson_title}
Học viên: ${summary.student_name}
Kết quả: ${summary.learning_outcome}
Tổng lượt: ${summary.total_turns}

1. HIỂU LẦM BAN ĐẦU:
"${summary.misconception}"
Trạng thái: ${summary.misconception_resolved ? "ĐÃ SỬA THÀNH CÔNG" : "CHƯA SỬA"}

2. PHẢN HỒI CỦA HỌC VIÊN:
${summary.student_responses.map((r) => `[Lượt ${r.turn}]: ${r.content}`).join("\n")}

3. GIẢI THÍCH TỔNG KẾT:
"${summary.final_explanation || "Chưa hoàn tất"}"

4. TRÍCH DẪN SỬ DỤNG:
${summary.citations_used.join(", ") || "Không có"}
========================================
    `.trim();

    navigator.clipboard.writeText(textReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="flex items-center space-x-2">
          <Link
            href={`/classroom/${summary.session_id}`}
            className="text-xs font-medium bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 px-3.5 py-1.5 rounded-xl transition text-neutral-800"
          >
            ← Vào lại lớp học
          </Link>
          <span className="text-xs font-mono text-neutral-400 hidden sm:inline">
            Phiên: {summary.session_id}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="text-xs font-medium bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-800 px-3.5 py-1.5 rounded-xl transition cursor-pointer shadow-2xs"
          >
            {copied ? "✓ Đã sao chép báo cáo" : "📋 Sao chép báo cáo"}
          </button>
          <Link
            href="/"
            className="text-xs font-medium bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-1.5 rounded-xl transition shadow-xs"
          >
            + Buổi học mới
          </Link>
        </div>
      </div>

      {/* Main Header Certificate Card */}
      <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 md:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-neutral-100 pb-6 mb-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold bg-neutral-900 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Learning Evidence
              </span>
              <span className="text-xs font-mono text-neutral-400">
                {summary.lesson_title}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Hồ sơ Bằng chứng Học tập
            </h1>
            <p className="text-xs text-neutral-500">
              Học viên: <span className="font-semibold text-neutral-800">{summary.student_name}</span> · Tổng lượt phản biện: <span className="font-mono font-semibold">{summary.total_turns}</span>
            </p>
          </div>

          {/* Outcome Status Badge */}
          <div className="shrink-0">
            {isAchieved ? (
              <div className="bg-neutral-900 text-white px-6 py-3.5 rounded-2xl text-center shadow-sm">
                <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                  KẾT QUẢ ĐÁNH GIÁ
                </div>
                <div className="text-xl font-extrabold tracking-wider font-mono text-white">
                  ACHIEVED
                </div>
                <div className="text-[11px] text-neutral-300 font-medium">
                  Đã làm chủ kiến thức
                </div>
              </div>
            ) : (
              <div className="bg-neutral-50 border border-neutral-200 text-neutral-900 px-6 py-3.5 rounded-2xl text-center">
                <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                  KẾT QUẢ ĐÁNH GIÁ
                </div>
                <div className="text-xl font-bold tracking-wider font-mono text-neutral-700">
                  IN_PROGRESS
                </div>
                <div className="text-[11px] text-neutral-500">
                  Chưa giải thích hoàn tất
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Structured Evidence Sections */}
        <div className="space-y-5 text-sm">
          {/* Section 1: Initial Misconception */}
          <div className="border border-neutral-100 rounded-2xl p-5 bg-neutral-50/50 space-y-2">
            <h2 className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              1. Hiểu lầm ban đầu cần khắc phục (Initial Misconception)
            </h2>
            <div className="bg-white border border-neutral-200/80 p-3.5 rounded-xl text-neutral-800 italic text-xs leading-relaxed">
              "{summary.misconception}"
            </div>
            <div className="flex items-center space-x-2 text-xs pt-1">
              <span className="text-neutral-500">Trạng thái giải quyết:</span>
              {summary.misconception_resolved ? (
                <span className="font-bold text-neutral-900 font-mono">
                  ✓ Đã được học viên phản biện và bác bỏ hoàn toàn
                </span>
              ) : (
                <span className="font-bold text-amber-700 font-mono">
                  ⚠ Đang trong tiến trình tranh luận
                </span>
              )}
            </div>
          </div>

          {/* Section 2: Student Reasoning Progression */}
          <div className="border border-neutral-100 rounded-2xl p-5 bg-neutral-50/50 space-y-2">
            <h2 className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              2. Tiến trình lập luận của học viên (Student Reasoning)
            </h2>
            {summary.student_responses.length === 0 ? (
              <p className="text-xs text-neutral-400 italic">Chưa có lượt gửi nào từ học viên.</p>
            ) : (
              <div className="space-y-2">
                {summary.student_responses.map((resp, i) => (
                  <div key={i} className="bg-white border border-neutral-200/80 p-3.5 rounded-xl">
                    <div className="text-[10px] font-mono text-neutral-400 mb-1 flex items-center justify-between">
                      <span>Lượt {resp.turn}</span>
                      <span>{new Date(resp.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-xs text-neutral-800 whitespace-pre-wrap leading-relaxed">
                      {resp.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: TA Socratic Scaffolding */}
          <div className="border border-neutral-100 rounded-2xl p-5 bg-neutral-50/50 space-y-2">
            <h2 className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              3. Gợi mở sư phạm từ Trợ giảng (TA Socratic Interventions)
            </h2>
            {summary.ta_interventions.length === 0 ? (
              <p className="text-xs text-neutral-500 italic">
                Học viên tự phản biện độc lập, không cần TA can thiệp hỗ trợ.
              </p>
            ) : (
              <div className="space-y-2">
                {summary.ta_interventions.map((item, idx) => (
                  <div key={idx} className="bg-white border border-neutral-200/80 p-3.5 rounded-xl">
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-1">
                      <span>Lượt {item.turn}</span>
                      <span className="bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-full text-neutral-700">
                        {item.type}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-800 leading-relaxed">{item.message}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Instructor Synthesis */}
          <div className="border border-neutral-100 rounded-2xl p-5 bg-neutral-50/50 space-y-2">
            <h2 className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              4. Giảng viên kiểm tra & Chốt chuẩn kiến thức (Instructor Feedback)
            </h2>
            {summary.instructor_feedback.length === 0 ? (
              <p className="text-xs text-neutral-400 italic">Chưa có phản hồi từ Giảng viên.</p>
            ) : (
              <div className="space-y-2">
                {summary.instructor_feedback.map((item, idx) => (
                  <div key={idx} className="bg-white border border-neutral-200/80 p-3.5 rounded-xl">
                    <div className="text-[10px] font-mono text-neutral-400 mb-1">
                      Lượt {item.turn} · Đánh giá chuẩn kiến thức
                    </div>
                    <div className="text-xs text-neutral-900 leading-relaxed font-sans">{item.message}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 5: Final Student Explanation */}
          <div className="border border-neutral-100 rounded-2xl p-5 bg-neutral-50/50 space-y-2">
            <h2 className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              5. Lời tự giải thích cuối cùng của học viên (Self-Explanation)
            </h2>
            {summary.final_explanation ? (
              <div className="bg-white border-l-3 border-neutral-900 p-4 rounded-r-xl shadow-2xs">
                <p className="text-xs text-neutral-900 leading-relaxed font-medium">
                  "{summary.final_explanation}"
                </p>
              </div>
            ) : (
              <p className="text-xs text-neutral-400 italic">
                Chưa hoàn tất lượt giải thích tổng kết.
              </p>
            )}
          </div>

          {/* Section 6: Citations Used */}
          <div className="border border-neutral-100 rounded-2xl p-5 bg-neutral-50/50 space-y-2">
            <h2 className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              6. Trích dẫn tài liệu trong phiên (Citations Recorded)
            </h2>
            {summary.citations_used.length === 0 ? (
              <p className="text-xs text-neutral-400 italic">Chưa ghi nhận trích dẫn.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(summary.citations_used)).map((cit, idx) => (
                  <span
                    key={idx}
                    className="font-mono text-xs bg-white border border-neutral-200 px-3 py-1 rounded-full text-neutral-800 shadow-2xs"
                  >
                    📖 {cit}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
