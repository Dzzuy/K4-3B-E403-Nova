"use client";

import { useState, useMemo } from "react";
import { Message, LessonLine } from "@/lib/api";
import AgentBadge from "./AgentBadge";

interface AgentMessageProps {
  message: Message;
  onCitationClick?: (citation: string) => void;
  isLatest?: boolean;
  lessonLines?: LessonLine[];
}

export default function AgentMessage({
  message,
  onCitationClick,
  isLatest,
  lessonLines = [],
}: AgentMessageProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isStudent = message.sender === "STUDENT";
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Extract range from citation
  const range = useMemo<[number, number]>(() => {
    if (!message.citation) return [12, 16];
    const match = message.citation.match(/lines?\s+(\d+)(?:-(\d+))?/i);
    if (match) {
      const s = parseInt(match[1], 10);
      const e = match[2] ? parseInt(match[2], 10) : s;
      return [s, e];
    }
    return [12, 16];
  }, [message.citation]);

  // Extract verbatim lines from lessonLines corresponding to message.citation
  const excerptLines = useMemo(() => {
    if (!message.citation || !lessonLines || lessonLines.length === 0) return [];
    const [start, end] = range;
    return lessonLines.filter(
      (l) => l && l.line_number >= start && l.line_number <= end
    );
  }, [message.citation, lessonLines, range]);

  const handleToggleCitation = () => {
    const nextState = !isExpanded;
    setIsExpanded(nextState);
    if (onCitationClick && message.citation) {
      onCitationClick(message.citation);
    }
  };

  return (
    <div
      className={`flex flex-col mb-4 transition-opacity duration-300 ${
        isStudent ? "items-end pl-12" : "items-start pr-8 md:pr-12"
      }`}
    >
      {/* Sender Header */}
      <div className="flex items-center space-x-2 mb-1 px-1">
        <AgentBadge
          role={message.sender}
          customName={message.sender_name}
          size="sm"
        />
        <span className="text-[10px] font-mono text-neutral-400">
          {formattedTime}
        </span>
      </div>

      {/* Bubble Container */}
      <div
        className={`relative rounded-3xl p-4 text-sm leading-relaxed max-w-2xl transition-all shadow-[0_1px_3px_rgba(0,0,0,0.03)] ${
          isStudent
            ? "bg-neutral-900 text-white rounded-tr-xs"
            : message.sender === "INSTRUCTOR"
            ? "bg-white border-2 border-neutral-900 text-neutral-900 rounded-tl-xs"
            : "bg-white border border-neutral-200/90 text-neutral-900 rounded-tl-xs"
        }`}
      >
        {/* Message Content */}
        <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
          {message.content}
        </div>

        {/* Citation Chip & Expandable Quoted Lines */}
        {message.citation && (
          <div className="mt-3.5 pt-2.5 border-t border-neutral-100 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleToggleCitation}
                className="group inline-flex items-center space-x-2 text-xs font-mono bg-neutral-50 hover:bg-neutral-100 text-neutral-900 border border-neutral-300 hover:border-neutral-900 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs"
                title="Bấm để mở rộng trích đoạn đối chiếu từ bài học"
              >
                <span>📖 Citation:</span>
                <span className="font-bold underline decoration-neutral-400 group-hover:decoration-neutral-900">
                  {message.citation}
                </span>
                <span className="text-neutral-500 text-[10px] pl-1 font-sans">
                  {isExpanded ? "▲ Thu gọn" : "▼ Xem trích đoạn"}
                </span>
              </button>

              <span className="text-[10px] font-mono text-neutral-400 hidden sm:inline select-none">
                {isExpanded ? "Đang mở rộng" : "Bấm để xem câu trích"}
              </span>
            </div>

            {/* Expandable Clean Quoted Lines */}
            {isExpanded && (
              <div className="pt-1 space-y-1.5">
                <div className="bg-neutral-50/80 border border-neutral-200/80 rounded-2xl p-3.5 space-y-2 text-xs">
                  {excerptLines.length > 0 ? (
                    excerptLines.map((line) => (
                      <div
                        key={line.line_number}
                        className="flex items-start space-x-2 leading-relaxed"
                      >
                        <span className="font-mono text-[11px] text-neutral-400 font-semibold shrink-0 select-none pt-0.5 w-7 text-right">
                          L{line.line_number}:
                        </span>
                        <p className="italic text-neutral-800 font-sans">
                          "{line.text}"
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-neutral-400 font-mono text-[11px] italic py-1">
                      Đang đối chiếu trích đoạn từ transcript-06.txt...
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 px-1 select-none">
                  <span>Đối chiếu transcript-06.txt</span>
                  <button
                    type="button"
                    onClick={() => setIsExpanded(false)}
                    className="text-neutral-500 hover:text-neutral-900 underline cursor-pointer"
                  >
                    Thu gọn ▴
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
