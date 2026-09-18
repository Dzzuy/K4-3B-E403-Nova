"use client";

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { SessionData, Message, LessonLine, Slide } from "@/lib/api";
import AgentMessage from "./AgentMessage";
import AgentBadge from "./AgentBadge";

export interface SlideChatbotHandle {
  focusInput: () => void;
  prefillMessage: (text: string) => void;
}

interface SlideChatbotProps {
  session: SessionData | null;
  currentSlide: Slide;
  isSending: boolean;
  onSendMessage: (content: string) => Promise<void>;
  lessonLines?: LessonLine[];
  onCitationClick?: (citation: string) => void;
  onCloseMobile?: () => void;
}

const SlideChatbot = forwardRef<SlideChatbotHandle, SlideChatbotProps>(function SlideChatbot(
  {
    session,
    currentSlide,
    isSending,
    onSendMessage,
    lessonLines = [],
    onCitationClick,
    onCloseMobile,
  },
  ref
) {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    focusInput: () => {
      textareaRef.current?.focus();
    },
    prefillMessage: (text: string) => {
      setContent(text);
      textareaRef.current?.focus();
    },
  }));

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session?.messages, isSending]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() || isSending) return;

    const sendingText = content.trim();
    setContent("");
    await onSendMessage(sendingText);
  };

  const messages: Message[] = session?.messages || [];
  const isAchieved = session?.status === "ACHIEVED";

  return (
    <div className="flex flex-col h-full overflow-hidden bg-neutral-50/50">
      {/* 1. Chatbot Header */}
      <div className="h-11 bg-white border-b border-neutral-200 px-4 flex items-center justify-between shrink-0 select-none z-10">
        <div className="flex items-center space-x-2 truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-xs text-neutral-900 font-sans">
            AI Chatbot Bài Học
          </span>
          <span className="text-[10px] font-mono text-neutral-400">
            · Lượt {session?.current_turn ?? 1}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {isAchieved ? (
            <span className="text-[10px] font-mono bg-neutral-900 text-white px-2 py-0.5 rounded-full font-bold">
              ✓ ACHIEVED
            </span>
          ) : (
            <span className="text-[10px] font-mono bg-neutral-100 text-neutral-600 border border-neutral-200 px-2 py-0.5 rounded-full">
              IN_PROGRESS
            </span>
          )}

          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden w-7 h-7 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-600 flex items-center justify-center text-xs cursor-pointer"
              title="Đóng bảng chat"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 2. Slide Context Banner */}
      <div className="p-2.5 bg-neutral-100/80 border-b border-neutral-200 shrink-0 text-xs select-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 truncate">
            <span className="text-[11px]">📌</span>
            <span className="font-mono text-[10px] uppercase font-bold text-neutral-500">
              Ngữ cảnh:
            </span>
            <span className="font-semibold text-neutral-900 truncate font-sans text-xs">
              Trang {currentSlide.slide_number}: {currentSlide.title}
            </span>
          </div>
          <span className="text-[10px] font-mono text-neutral-400 bg-white px-1.5 py-0.5 rounded border border-neutral-200 shrink-0 ml-1">
            Active
          </span>
        </div>
      </div>

      {/* 3. Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.length === 0 && (
          <div className="text-center py-8 space-y-2 text-neutral-400 text-xs">
            <div className="text-2xl">💬</div>
            <p className="font-medium">Chưa có tin nhắn trong phiên học này.</p>
            <p className="text-[11px]">
              Bấm các nút tương tác bên slide hoặc gõ câu hỏi phía dưới để trò chuyện cùng AI!
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <AgentMessage
            key={message.id || index}
            message={message}
            onCitationClick={onCitationClick}
            isLatest={index === messages.length - 1}
            lessonLines={lessonLines}
          />
        ))}

        {/* Live Thinking / Turn Indicator */}
        {isSending && (
          <div className="flex items-center space-x-2.5 p-3 rounded-2xl bg-white border border-neutral-200 shadow-xs max-w-xs animate-pulse">
            <AgentBadge role="TA" size="sm" showState="thinking" />
            <span className="text-xs text-neutral-500 font-mono">
              AI đang đối chiếu bài học...
            </span>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* 4. Quick Context Chips */}
      <div className="px-3 py-1.5 bg-white border-t border-neutral-100 flex items-center space-x-2 overflow-x-auto text-[11px] text-neutral-500 font-mono select-none shrink-0">
        <span className="shrink-0 text-neutral-400 text-[10px]">Hỏi nhanh:</span>
        <button
          type="button"
          onClick={() => {
            setContent(`Giải thích rõ hơn vì sao ${currentSlide.concept} lại quan trọng?`);
            textareaRef.current?.focus();
          }}
          className="shrink-0 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border border-neutral-200 px-2 py-0.5 rounded-full transition cursor-pointer truncate max-w-[200px]"
        >
          Vì sao quan trọng?
        </button>
        <button
          type="button"
          onClick={() => {
            setContent("Công thức và cơ chế này khắc phục hạn chế gì của RNN?");
            textareaRef.current?.focus();
          }}
          className="shrink-0 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border border-neutral-200 px-2 py-0.5 rounded-full transition cursor-pointer truncate max-w-[200px]"
        >
          Khắc phục hạn chế gì?
        </button>
      </div>

      {/* 5. Input Form */}
      <div className="p-3 bg-white border-t border-neutral-200 shrink-0">
        <form onSubmit={handleSubmit} className="space-y-1.5">
          <div className="flex items-end space-x-2 bg-neutral-50 border border-neutral-200 rounded-2xl p-2 focus-within:bg-white focus-within:border-neutral-900 focus-within:ring-1 focus-within:ring-neutral-900/10 transition">
            <textarea
              ref={textareaRef}
              rows={2}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSending}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={`Hỏi AI về Trang ${currentSlide.slide_number}... (Enter để gửi)`}
              className="flex-1 bg-transparent border-none text-xs p-1 focus:outline-none resize-none placeholder-neutral-400 leading-relaxed"
            />

            <button
              type="submit"
              disabled={isSending || !content.trim()}
              className="bg-neutral-900 hover:bg-neutral-800 text-white font-medium px-3 py-1.5 rounded-xl text-xs transition flex items-center space-x-1 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-xs shrink-0"
            >
              <span>{isSending ? "..." : "Gửi"}</span>
              <span className="text-[10px] font-mono text-neutral-400 font-normal">↵</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono px-1 select-none">
            <span>Enter để gửi · Shift + Enter để xuống dòng</span>
            <span>Grounding: transcript-06</span>
          </div>
        </form>
      </div>
    </div>
  );
});

export default SlideChatbot;
