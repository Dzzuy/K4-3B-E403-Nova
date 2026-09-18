"use client";

import { useState, useEffect, useRef } from "react";
import { Slide, LessonLine } from "@/lib/api";

interface SlideViewerProps {
  slides: Slide[];
  currentIndex: number;
  onSelectSlide: (index: number) => void;
  onNextSlide: () => void;
  onPrevSlide: () => void;
  onAiAction: (action: "explain" | "summary" | "ask" | "example") => void;
  lessonTitle?: string;
  isAiThinking?: boolean;
  sourceFile?: string;
  totalLines?: number;
  mode?: "detailed" | "overview" | "custom_file";
  onSwitchMode?: (mode: "detailed" | "overview") => void;
  onLoadCustomFile?: (text: string, filename: string) => void;
  lessonLines?: LessonLine[];
}

export default function SlideViewer({
  slides,
  currentIndex,
  onSelectSlide,
  onNextSlide,
  onPrevSlide,
  onAiAction,
  lessonTitle = "Attention Mechanism & Transformer (transcript-06)",
  isAiThinking = false,
  sourceFile = "transcript-06.txt",
  totalLines = 32,
  mode = "detailed",
  onSwitchMode,
  onLoadCustomFile,
  lessonLines = [],
}: SlideViewerProps) {
  const [showSlideList, setShowSlideList] = useState(false);
  const [showRawText, setShowRawText] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showExcerpt, setShowExcerpt] = useState(false);
  const [customText, setCustomText] = useState("");
  const [customFileName, setCustomFileName] = useState("my_lesson.txt");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const slide = slides[currentIndex];
  const totalSlides = slides.length;
  const progressPercent = totalSlides > 0 ? Math.round(((currentIndex + 1) / totalSlides) * 100) : 0;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        if (currentIndex < totalSlides - 1) onNextSlide();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        if (currentIndex > 0) onPrevSlide();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, totalSlides, onNextSlide, onPrevSlide]);

  const handleCopyCode = () => {
    if (slide?.code_snippet?.code) {
      navigator.clipboard.writeText(slide.code_snippet.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && onLoadCustomFile) {
        onLoadCustomFile(content, file.name);
        setShowUploadModal(false);
      }
    };
    reader.readAsText(file);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim() || !onLoadCustomFile) return;
    onLoadCustomFile(customText.trim(), customFileName.trim() || "document.txt");
    setShowUploadModal(false);
    setCustomText("");
  };

  if (!slide) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-neutral-400 font-mono text-xs">
        Đang nạp dữ liệu slide bài học...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-neutral-100/60 select-none">
      {/* 1. Subheader Controls Bar */}
      <div className="h-11 bg-white border-b border-neutral-200 px-3 md:px-6 flex items-center justify-between shrink-0 text-xs z-10">
        <div className="flex items-center space-x-2 truncate">
          <span className="font-mono text-[10px] bg-neutral-900 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider shrink-0">
            Slide AI
          </span>
          <span className="text-neutral-300">|</span>
          <span className="font-semibold text-neutral-800 truncate font-sans text-xs">
            {lessonTitle}
          </span>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {onSwitchMode && (
            <div className="hidden sm:flex items-center p-0.5 bg-neutral-100 rounded-lg border border-neutral-200 text-[11px] font-medium text-neutral-600">
              <button
                type="button"
                onClick={() => onSwitchMode("detailed")}
                className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                  mode === "detailed"
                    ? "bg-white text-neutral-900 font-bold shadow-2xs"
                    : "hover:text-neutral-900"
                }`}
                title="16 slide chi tiết đọc trực tiếp từng dòng từ file"
              >
                16 Slide Chi tiết
              </button>
              <button
                type="button"
                onClick={() => onSwitchMode("overview")}
                className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                  mode === "overview"
                    ? "bg-white text-neutral-900 font-bold shadow-2xs"
                    : "hover:text-neutral-900"
                }`}
                title="7 slide tóm tắt cô đọng"
              >
                7 Slide Khái quát
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowRawText(!showRawText)}
            className={`hidden md:flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition cursor-pointer ${
              showRawText
                ? "bg-neutral-900 text-white border-neutral-900 shadow-2xs"
                : "border-neutral-200 hover:bg-neutral-50 text-neutral-700"
            }`}
            title="Bật/tắt chế độ xem văn bản gốc từ file"
          >
            <span>📄 File gốc</span>
            <span className="text-[10px] font-mono opacity-70">({totalLines} dòng)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition cursor-pointer"
            title="Đọc từ file text khác (.txt, .md)"
          >
            <span>📁 Đọc file text</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSlideList(!showSlideList)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition cursor-pointer"
            title="Xem danh sách tất cả các slide"
          >
            <span>📑 Mục lục</span>
            <span className="text-[10px] font-mono text-neutral-400">
              ({currentIndex + 1}/{totalSlides})
            </span>
            <span className="text-[10px] text-neutral-400">
              {showSlideList ? "▴" : "▾"}
            </span>
          </button>
        </div>
      </div>

      {/* File Source Banner */}
      <div className="h-7 bg-neutral-100/90 border-b border-neutral-200/80 px-4 flex items-center justify-between text-[11px] font-mono text-neutral-500 shrink-0">
        <div className="flex items-center space-x-2 truncate">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-neutral-400">Tệp nguồn:</span>
          <span className="font-semibold text-neutral-800 underline decoration-neutral-300">
            {sourceFile}
          </span>
          <span className="text-neutral-300">·</span>
          <span>{totalLines} dòng văn bản</span>
          <span className="text-neutral-300">·</span>
          <span className="text-neutral-700 font-semibold">{totalSlides} trang slide</span>
        </div>

        <div className="text-[10px] text-neutral-400 hidden sm:block">
          Dòng {slide.source_lines[0]} - {slide.source_lines[1]}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-neutral-200 w-full shrink-0 relative overflow-hidden">
        <div
          className="h-full bg-neutral-900 transition-all duration-300 ease-out rounded-r-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Slide Drawer / Multi-Page Thumbnail Selector */}
      {showSlideList && (
        <div className="bg-white border-b border-neutral-200 p-3 shadow-md max-h-56 overflow-y-auto grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 z-20 shrink-0">
          {slides.map((s, idx) => (
            <button
              key={s.id || idx}
              onClick={() => {
                onSelectSlide(idx);
                setShowSlideList(false);
              }}
              className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                idx === currentIndex
                  ? "border-neutral-900 bg-neutral-900 text-white shadow-xs"
                  : "border-neutral-200/80 bg-neutral-50 hover:bg-neutral-100 text-neutral-800"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-1">
                <span>Trang {s.slide_number}</span>
                {idx === currentIndex && <span>●</span>}
              </div>
              <p
                className={`text-[11px] font-medium line-clamp-2 leading-snug ${
                  idx === currentIndex ? "text-neutral-200" : "text-neutral-600"
                }`}
              >
                {s.title}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* 2. Main Slide Display Canvas or Raw File Viewer */}
      <div className="flex-1 overflow-y-auto p-3 md:p-6 flex flex-col items-center">
        {showRawText ? (
          <div className="w-full max-w-4xl bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="space-y-0.5">
                <h3 className="font-bold text-sm text-neutral-900">
                  Nội dung tệp gốc: {sourceFile}
                </h3>
                <p className="text-xs text-neutral-500 font-mono">
                  Bấm vào dòng bất kỳ để chuyển tới slide tương ứng
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRawText(false)}
                className="text-xs px-3 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-mono cursor-pointer"
              >
                ← Quay lại Chế độ Slide
              </button>
            </div>

            <div className="space-y-1.5 font-mono text-xs max-h-[65vh] overflow-y-auto pr-2">
              {(lessonLines.length > 0
                ? lessonLines
                : slide.source_excerpt.split("\n").map((t, i) => ({ line_number: i + 1, text: t }))
              ).map((line) => {
                const isCurrentSlideLine =
                  line.line_number >= slide.source_lines[0] &&
                  line.line_number <= slide.source_lines[1];
                return (
                  <div
                    key={line.line_number}
                    onClick={() => {
                      const targetIdx = slides.findIndex(
                        (s) =>
                          line.line_number >= s.source_lines[0] &&
                          line.line_number <= s.source_lines[1]
                      );
                      if (targetIdx !== -1) onSelectSlide(targetIdx);
                    }}
                    className={`flex items-start space-x-3 p-2 rounded-xl transition cursor-pointer ${
                      isCurrentSlideLine
                        ? "bg-neutral-900 text-white font-medium"
                        : "hover:bg-neutral-100 text-neutral-700"
                    }`}
                  >
                    <span
                      className={`text-[10px] w-8 text-right shrink-0 pt-0.5 ${
                        isCurrentSlideLine ? "text-neutral-400" : "text-neutral-400"
                      }`}
                    >
                      L{line.line_number}
                    </span>
                    <span className="flex-1 font-sans text-xs leading-relaxed">
                      {line.text}
                    </span>
                    {isCurrentSlideLine && (
                      <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded shrink-0">
                        Slide {slide.slide_number}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl bg-white border border-neutral-200/90 rounded-3xl p-6 md:p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-4">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold bg-neutral-100 text-neutral-800 px-2.5 py-1 rounded-lg border border-neutral-200">
                  TRANG {slide.slide_number} / {totalSlides}
                </span>
                <span className="text-[11px] font-mono text-neutral-500 bg-neutral-50 px-2.5 py-1 rounded-lg border border-neutral-200/60">
                  {slide.concept}
                </span>
              </div>

              <div className="flex items-center space-x-2 text-[11px] font-mono text-neutral-400">
                <span>Nguồn text:</span>
                <button
                  type="button"
                  onClick={() => setShowExcerpt(!showExcerpt)}
                  className="text-neutral-800 font-semibold underline decoration-neutral-300 hover:decoration-neutral-800 transition cursor-pointer"
                  title="Bấm để xem trích đoạn từ file"
                >
                  {slide.source_citation}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-neutral-900 font-sans">
                {slide.title}
              </h1>
              {slide.subtitle && (
                <p className="text-xs md:text-sm text-neutral-500 font-medium leading-relaxed">
                  {slide.subtitle}
                </p>
              )}
            </div>

            {showExcerpt && (
              <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 uppercase tracking-wider font-bold">
                  <span>Văn bản trích xuất trực tiếp từ file ({slide.source_citation})</span>
                  <button
                    type="button"
                    onClick={() => setShowExcerpt(false)}
                    className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
                  >
                    ✕ Đóng
                  </button>
                </div>
                <p className="font-sans italic text-neutral-800 leading-relaxed whitespace-pre-wrap pl-2 border-l-2 border-neutral-400">
                  "{slide.source_excerpt}"
                </p>
              </div>
            )}

            <div className="p-4 bg-neutral-50/70 border border-neutral-200/70 rounded-2xl text-xs md:text-sm text-neutral-800 leading-relaxed font-sans">
              {slide.content}
            </div>

            <div className="space-y-2.5">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500">
                Nội dung trọng tâm đọc từ file:
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {slide.bullet_points.map((point, i) => (
                  <div
                    key={i}
                    className="flex items-start space-x-3 p-3 rounded-xl bg-white border border-neutral-200/80 hover:border-neutral-300 transition text-xs md:text-sm text-neutral-800 leading-relaxed shadow-2xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-800 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-neutral-200">
                      {i + 1}
                    </span>
                    <span className="flex-1 font-sans">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {slide.diagram && (
              <div className="p-4 bg-gradient-to-br from-neutral-50 to-neutral-100/70 border border-neutral-200 rounded-2xl space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs">📊</span>
                  <span className="text-xs font-mono font-bold text-neutral-800 uppercase tracking-wider">
                    {slide.diagram.title}
                  </span>
                </div>
                <div className="p-3 bg-white border border-neutral-200 rounded-xl font-mono text-xs text-neutral-700 leading-relaxed">
                  {slide.diagram.description}
                </div>
              </div>
            )}

            {slide.code_snippet && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-600">
                    Mã nguồn minh họa ({slide.code_snippet.language}):
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="inline-flex items-center space-x-1 text-[11px] font-mono px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition cursor-pointer"
                  >
                    <span>{copiedCode ? "✓ Đã chép" : "📋 Sao chép code"}</span>
                  </button>
                </div>

                <div className="bg-neutral-950 text-neutral-100 p-4 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed border border-neutral-800 shadow-inner">
                  <pre>{slide.code_snippet.code}</pre>
                </div>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-neutral-900 text-white space-y-1 shadow-xs">
              <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-wider text-neutral-300 font-bold">
                <span>💡 Ghi nhớ trọng tâm:</span>
              </div>
              <p className="text-xs md:text-sm font-medium leading-relaxed font-sans text-neutral-100">
                {slide.key_takeaway}
              </p>
            </div>

            <div className="pt-2 border-t border-neutral-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 font-bold">
                  Tương tác cùng AI Chatbot về trang này:
                </span>
                <span className="text-[10px] font-mono text-neutral-400">
                  {slide.source_citation}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  type="button"
                  onClick={() => onAiAction("explain")}
                  disabled={isAiThinking}
                  className="flex items-center justify-center space-x-1.5 p-3 rounded-2xl border border-neutral-200 hover:border-neutral-900 bg-white hover:bg-neutral-50 text-neutral-900 text-xs font-semibold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  <span>💡</span>
                  <span>Giải thích slide này</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAiAction("summary")}
                  disabled={isAiThinking}
                  className="flex items-center justify-center space-x-1.5 p-3 rounded-2xl border border-neutral-200 hover:border-neutral-900 bg-white hover:bg-neutral-50 text-neutral-900 text-xs font-semibold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  <span>📝</span>
                  <span>Tóm tắt</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAiAction("example")}
                  disabled={isAiThinking}
                  className="flex items-center justify-center space-x-1.5 p-3 rounded-2xl border border-neutral-200 hover:border-neutral-900 bg-white hover:bg-neutral-50 text-neutral-900 text-xs font-semibold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  <span>🎯</span>
                  <span>Ví dụ thực tế</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAiAction("ask")}
                  className="flex items-center justify-center space-x-1.5 p-3 rounded-2xl border border-neutral-900 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
                >
                  <span>❓</span>
                  <span>Đặt câu hỏi</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Slide Navigation Controls */}
      <div className="h-14 bg-white border-t border-neutral-200 px-4 md:px-8 flex items-center justify-between shrink-0 select-none z-10">
        <button
          type="button"
          onClick={onPrevSlide}
          disabled={currentIndex === 0}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-800 text-xs font-semibold transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
        >
          <span>← Trước</span>
        </button>

        <div className="flex items-center space-x-2">
          <div className="hidden sm:flex items-center space-x-1 overflow-x-auto max-w-xs px-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => onSelectSlide(idx)}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentIndex
                    ? "bg-neutral-900 w-4"
                    : "bg-neutral-300 hover:bg-neutral-400"
                }`}
                title={`Trang ${idx + 1}`}
              />
            ))}
          </div>
          <span className="text-xs font-mono font-bold text-neutral-700 ml-2">
            Trang {currentIndex + 1} / {totalSlides}
          </span>
        </div>

        <button
          type="button"
          onClick={onNextSlide}
          disabled={currentIndex === totalSlides - 1}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-xs"
        >
          <span>Tiếp theo →</span>
        </button>
      </div>

      {/* 5. Custom File Upload / Input Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 border border-neutral-200">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="space-y-0.5">
                <h3 className="font-bold text-sm text-neutral-900">
                  📁 Đọc text từ file để tạo Slide nhiều trang
                </h3>
                <p className="text-xs text-neutral-500">
                  AI sẽ đọc trực tiếp nội dung text và tự động chia thành nhiều trang slide.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-2xl text-center space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="text-xl">📄</div>
              <p className="text-xs text-neutral-600 font-medium">
                Tải lên tệp văn bản (.txt, .md) từ máy tính
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium rounded-xl cursor-pointer shadow-xs"
              >
                Chọn tệp văn bản...
              </button>
            </div>

            <div className="flex items-center space-x-2 text-[11px] text-neutral-400 font-mono">
              <div className="h-px bg-neutral-200 flex-1" />
              <span>hoặc dán nội dung text</span>
              <div className="h-px bg-neutral-200 flex-1" />
            </div>

            <form onSubmit={handleCustomSubmit} className="space-y-3">
              <input
                type="text"
                value={customFileName}
                onChange={(e) => setCustomFileName(e.target.value)}
                placeholder="Tên tệp (ví dụ: my_lecture.txt)..."
                className="w-full text-xs border border-neutral-200 rounded-xl px-3 py-2 bg-neutral-50 focus:bg-white focus:outline-none focus:border-neutral-900"
              />
              <textarea
                rows={4}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Dán nội dung bài học hoặc transcript tại đây..."
                className="w-full text-xs border border-neutral-200 rounded-xl p-3 bg-neutral-50 focus:bg-white focus:outline-none focus:border-neutral-900 resize-none font-mono"
              />
              <div className="flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!customText.trim()}
                  className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium disabled:opacity-40"
                >
                  Tạo Slide từ Text →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
