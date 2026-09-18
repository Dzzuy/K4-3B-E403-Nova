"use client";

import { useState } from "react";

interface StudentInputProps {
  onSendMessage: (content: string) => Promise<void>;
  disabled?: boolean;
  isSending?: boolean;
  isAchieved?: boolean;
  sessionId?: string;
  onViewSummary?: () => void;
}

export default function StudentInput({
  onSendMessage,
  disabled,
  isSending,
  isAchieved,
  sessionId,
  onViewSummary,
}: StudentInputProps) {
  const [content, setContent] = useState("");

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() || disabled || isSending || isAchieved) return;

    const sendingText = content.trim();
    setContent("");
    await onSendMessage(sendingText);
  };

  const handleQuickInsert = (suggestion: string) => {
    setContent((prev) => (prev ? `${prev} ${suggestion}` : suggestion));
  };

  if (isAchieved) {
    return (
      <div className="p-4 bg-neutral-50/80 border-t border-neutral-200">
        <div className="max-w-2xl mx-auto text-center space-y-2.5">
          <div className="inline-flex items-center space-x-2 text-xs font-mono font-bold bg-neutral-900 text-white px-3.5 py-1.5 rounded-full shadow-xs">
            <span>🎉 HOÀN THÀNH MỤC TIÊU HỌC TẬP (ACHIEVED)</span>
          </div>
          <p className="text-xs text-neutral-600">
            Bạn đã phản biện chuẩn xác và tự giải thích đúng bản chất của Attention Mechanism.
          </p>
          {onViewSummary && (
            <button
              onClick={onViewSummary}
              className="inline-flex items-center space-x-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-xs cursor-pointer"
            >
              <span>Xem Báo cáo Bằng chứng Học tập (Summary) →</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3.5 bg-white border-t border-neutral-200/80 shrink-0">
      {/* Quick Context Hints */}
      <div className="mb-2 flex items-center space-x-2 overflow-x-auto pb-1 text-[11px] text-neutral-500 font-mono select-none">
        <span className="shrink-0 text-neutral-400">Gợi ý phản biện:</span>
        <button
          type="button"
          onClick={() =>
            handleQuickInsert(
              "Bạn Minh hiểu nhầm rồi, Attention không phụ thuộc vào vị trí gần nhau mà kết nối all-to-all qua Query và Key [transcript-06, lines 12-16]."
            )
          }
          className="shrink-0 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border border-neutral-200 px-2.5 py-1 rounded-full transition cursor-pointer truncate max-w-xs"
        >
          "Attention không phụ thuộc vị trí gần nhau..."
        </button>
        <button
          type="button"
          onClick={() =>
            handleQuickInsert(
              "Trợ giảng giải thích thêm giúp mình vai trò của Scaled Dot-Product Attention trong bài học được không?"
            )
          }
          className="shrink-0 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border border-neutral-200 px-2.5 py-1 rounded-full transition cursor-pointer truncate max-w-xs"
        >
          "Giải thích thêm về Scaled Dot-Product..."
        </button>
      </div>

      {/* Input Box Form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex items-end space-x-2 bg-neutral-50/70 border border-neutral-200 rounded-2xl p-2 focus-within:bg-white focus-within:border-neutral-900 focus-within:ring-2 focus-within:ring-neutral-900/5 transition-all">
          <textarea
            rows={2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={disabled || isSending}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Gõ phản biện bạn Minh, đặt câu hỏi cho trợ giảng hoặc giải thích lại..."
            className="flex-1 bg-transparent border-none text-sm p-1.5 focus:outline-none resize-none placeholder-neutral-400 leading-relaxed"
          />

          <button
            type="submit"
            disabled={disabled || isSending || !content.trim()}
            className="bg-neutral-900 hover:bg-neutral-800 text-white font-medium px-4 py-2 rounded-xl text-xs transition-all flex items-center space-x-1.5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-xs shrink-0"
          >
            <span>{isSending ? "Đang gửi..." : "Gửi"}</span>
            <span className="text-[10px] font-mono text-neutral-400 font-normal">
              ↵
            </span>
          </button>
        </div>

        <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono px-1 select-none">
          <span>Nhấn Enter để gửi · Shift + Enter để xuống dòng</span>
          <span>Orchestrator đảm bảo chỉ 1 tác tử nói mỗi lượt</span>
        </div>
      </form>
    </div>
  );
}
