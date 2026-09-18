"use client";

import { useMemo } from "react";
import { LessonLine } from "@/lib/api";

interface SourceExcerptCardProps {
  citation: string;
  lines?: LessonLine[];
  onLineClick?: (line: number) => void;
  isCollapsible?: boolean;
  onClose?: () => void;
}

export default function SourceExcerptCard({
  citation,
  lines = [],
  onLineClick,
  isCollapsible = false,
  onClose,
}: SourceExcerptCardProps) {
  // Parse range from citation (e.g. "transcript-06, lines 12-16")
  const range = useMemo<[number, number]>(() => {
    if (!citation) return [12, 16];
    const match = citation.match(/lines?\s+(\d+)(?:-(\d+))?/i);
    if (match) {
      const s = parseInt(match[1], 10);
      const e = match[2] ? parseInt(match[2], 10) : s;
      return [s, e];
    }
    return [12, 16];
  }, [citation]);

  // Extract verbatim lines from lessonLines
  const excerptLines = useMemo(() => {
    if (!lines || lines.length === 0) return [];
    const [start, end] = range;
    return lines.filter(
      (l) => l && l.line_number >= start && l.line_number <= end
    );
  }, [lines, range]);

  return (
    <div className="bg-white border border-neutral-200/90 rounded-3xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-3 font-sans transition-all">
      {/* Card Header: Icon + Title + Line Badge */}
      <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
        <div className="flex items-center space-x-2">
          <span className="text-sm">📖</span>
          <span className="font-mono font-bold text-xs uppercase tracking-wider text-neutral-900">
            SOURCE EXCERPT
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="font-mono text-xs font-bold bg-neutral-950 text-white px-3 py-0.5 rounded-full shadow-2xs">
            Lines {range[0]}–{range[1]}
          </span>
          {isCollapsible && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-700 text-xs font-mono px-1.5 py-0.5 rounded hover:bg-neutral-100 cursor-pointer"
              title="Thu gọn trích đoạn"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Card Body: Line by Line Verbatim Quotation in Inner Box */}
      <div className="bg-neutral-50/70 border border-neutral-200/80 rounded-2xl p-3.5 space-y-2.5 text-xs">
        {excerptLines.length > 0 ? (
          excerptLines.map((line) => (
            <div
              key={line.line_number}
              onClick={() => onLineClick && onLineClick(line.line_number)}
              className={`flex items-start space-x-2 leading-relaxed transition-colors ${
                onLineClick ? "cursor-pointer hover:text-neutral-950" : ""
              }`}
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
          <div className="text-neutral-400 font-mono text-[11px] italic py-2 text-center">
            Đang đối chiếu trích đoạn từ transcript-06.txt...
          </div>
        )}
      </div>

      {/* Card Footer: Metadata info */}
      <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-0.5 select-none">
        <span>Đối chiếu trực tiếp transcript-06.txt</span>
        <span>{excerptLines.length} câu trích</span>
      </div>
    </div>
  );
}
