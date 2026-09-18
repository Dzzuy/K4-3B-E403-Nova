"use client";

import { useEffect, useRef } from "react";
import { Message, LessonLine } from "@/lib/api";
import AgentMessage from "./AgentMessage";
import AgentBadge from "./AgentBadge";

interface ClassroomChatProps {
  messages: Message[];
  isAgentThinking: boolean;
  activeAgent?: string;
  misconceptionResolved: boolean;
  misconceptionText?: string;
  onCitationClick?: (citation: string) => void;
  error?: string;
  lessonLines?: LessonLine[];
}

export default function ClassroomChat({
  messages,
  isAgentThinking,
  activeAgent = "TA",
  misconceptionResolved,
  misconceptionText,
  onCitationClick,
  error,
  lessonLines = [],
}: ClassroomChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAgentThinking]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-neutral-50/50">
      {/* Misconception Alert Banner */}
      <div className="shrink-0 p-3 bg-white border-b border-neutral-200/80">
        {misconceptionResolved ? (
          <div className="flex items-center justify-between px-3.5 py-2 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-emerald-700 font-bold">✓</span>
              <span className="font-semibold text-emerald-950">
                Hiểu lầm ban đầu đã được giải thích và khắc phục thành công!
              </span>
            </div>
            <span className="text-[10px] font-mono bg-emerald-700 text-white px-2 py-0.5 rounded-full font-bold">
              RESOLVED
            </span>
          </div>
        ) : (
          <div className="flex items-start justify-between px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-800">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="font-bold text-neutral-900 font-mono text-[10px] uppercase tracking-wider">
                  Hiểu lầm cần phản biện
                </span>
                <span className="text-neutral-400">·</span>
                <span className="text-neutral-600 text-[11px]">
                  Bạn học Minh:
                </span>
              </div>
              <p className="text-neutral-700 italic text-[11px] pl-4">
                "Attention chỉ gán trọng số cố định theo vị trí gần kề, từ ở xa thì bỏ qua."
              </p>
            </div>
            <span className="text-[10px] font-mono bg-neutral-200/80 text-neutral-700 px-2 py-0.5 rounded-full shrink-0 ml-2 font-medium">
              Bắt buộc sửa
            </span>
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((message, index) => (
          <AgentMessage
            key={message.id || index}
            message={message}
            onCitationClick={onCitationClick}
            isLatest={index === messages.length - 1}
            lessonLines={lessonLines}
          />
        ))}

        {/* Live Thinking / Turn-Taking Indicator */}
        {isAgentThinking && (
          <div className="flex items-center space-x-3 p-3 rounded-2xl bg-white border border-neutral-200 shadow-xs max-w-md animate-pulse">
            <AgentBadge
              role={(activeAgent as any) || "TA"}
              size="sm"
              showState="thinking"
            />
            <span className="text-xs text-neutral-500 font-mono">
              Orchestrator đang xử lý...
            </span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-mono">
            ⚠ {error}
          </div>
        )}

        <div ref={scrollRef} />
      </div>
    </div>
  );
}
