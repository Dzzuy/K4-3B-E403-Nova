"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { LessonLine } from "@/lib/api";

interface LessonContextProps {
  lines: LessonLine[];
  highlightRange: [number, number] | null;
  onLineClick?: (line: number) => void;
  activeCitation?: string | null;
  currentConcept?: string;
  learningState?: "IN_PROGRESS" | "ACHIEVED" | string;
  misconceptionResolved?: boolean;
}

export default function LessonContext({
  lines,
  highlightRange,
  onLineClick,
  activeCitation = "transcript-06, lines 12-16",
  currentConcept = "Attention vs Sequential Bottleneck (Scaled Dot-Product)",
  learningState = "IN_PROGRESS",
  misconceptionResolved = false,
}: LessonContextProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Range helper
  const range = useMemo<[number, number]>(() => {
    if (highlightRange && highlightRange[0]) {
      return highlightRange;
    }
    if (activeCitation) {
      const match = activeCitation.match(/lines?\s+(\d+)(?:-(\d+))?/i);
      if (match) {
        const s = parseInt(match[1], 10);
        const e = match[2] ? parseInt(match[2], 10) : s;
        return [s, e];
      }
    }
    return [12, 16];
  }, [highlightRange, activeCitation]);

  // Auto-scroll when range changes
  useEffect(() => {
    if (range[0]) {
      const el = document.getElementById(`lesson-line-${range[0]}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [range]);

  const filteredLines = (lines || []).filter((line) =>
    line && searchTerm
      ? (line?.text || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(line?.line_number || "").includes(searchTerm)
      : true
  );

  return (
    <aside className="w-full h-full flex flex-col bg-white border-l border-neutral-200/80 select-text overflow-hidden">
      {/* 1. Panel Header & Concept Info */}
      <div className="p-3.5 border-b border-neutral-100 bg-neutral-50/50 shrink-0 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
            Lesson Context
          </span>
          <span className="text-[10px] font-mono bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full border border-neutral-200">
            transcript-06.txt
          </span>
        </div>

        <div>
          <h2 className="text-xs font-bold text-neutral-900 tracking-tight">
            Attention Mechanism
          </h2>
          <div className="text-[11px] text-neutral-500 font-medium truncate">
            {currentConcept}
          </div>
        </div>

        {/* Current Learning State Badge & Active Lines */}
        <div className="flex items-center justify-between pt-1.5 border-t border-neutral-200/60 text-[10px] font-mono">
          <div className="flex items-center space-x-1.5 text-neutral-500">
            <span>Đang đối chiếu:</span>
            <span className="font-bold text-neutral-900 bg-neutral-100 px-1.5 py-0.2 rounded border border-neutral-200">
              Lines {range[0]}–{range[1]}
            </span>
          </div>

          {learningState === "ACHIEVED" || misconceptionResolved ? (
            <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              ✓ ACHIEVED
            </span>
          ) : (
            <span className="font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              ⚠ ACTIVE
            </span>
          )}
        </div>
      </div>

      {/* 2. Search Box */}
      <div className="p-2.5 border-b border-neutral-100 bg-neutral-50/50 shrink-0">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm dòng, từ khóa (Q, K, V, softmax)..."
            className="w-full text-xs font-mono border border-neutral-200 rounded-xl px-3 py-1.5 bg-white placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1.5 text-xs text-neutral-400 hover:text-neutral-700 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 3. Full Transcript List with Highlighted Lines */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-3 space-y-1 font-mono text-xs leading-relaxed"
      >
        {filteredLines.length === 0 ? (
          <div className="p-4 text-center text-neutral-400 text-xs italic">
            Không tìm thấy dòng khớp với "{searchTerm}"
          </div>
        ) : (
          filteredLines.map((line) => {
            const isHighlighted =
              line.line_number >= range[0] && line.line_number <= range[1];

            return (
              <div
                key={line.line_number}
                id={`lesson-line-${line.line_number}`}
                onClick={() => onLineClick && onLineClick(line.line_number)}
                className={`group flex items-start py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer ${
                  isHighlighted
                    ? "bg-neutral-100 border-l-3 border-neutral-900 font-semibold text-neutral-900 shadow-2xs"
                    : "hover:bg-neutral-50 text-neutral-700"
                }`}
                title="Bấm để đối chiếu dòng này"
              >
                <span
                  className={`w-6 shrink-0 select-none text-right mr-2.5 font-mono text-[11px] ${
                    isHighlighted
                      ? "text-neutral-900 font-bold"
                      : "text-neutral-300 group-hover:text-neutral-500"
                  }`}
                >
                  {line.line_number}
                </span>
                <span className="flex-1 leading-relaxed">{line.text}</span>
                {isHighlighted && (
                  <span className="text-[9px] font-mono bg-neutral-900 text-white px-1.5 py-0.2 rounded-full ml-1.5 shrink-0">
                    CITED
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Grounding Notice Footer */}
      <div className="p-2.5 border-t border-neutral-100 bg-neutral-50/50 text-[10px] text-neutral-400 font-mono shrink-0 flex items-center justify-between">
        <span>Click dòng để đối chiếu</span>
        <span className="font-semibold text-neutral-600">32 dòng dữ liệu</span>
      </div>
    </aside>
  );
}
