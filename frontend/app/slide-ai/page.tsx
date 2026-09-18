"use client";

import { useEffect, useState, useRef } from "react";
import { api, SessionData, Slide, LessonLine } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SlideViewer from "@/components/SlideViewer";
import SlideChatbot, { SlideChatbotHandle } from "@/components/SlideChatbot";

export default function SlideAiPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [session, setSession] = useState<SessionData | null>(null);
  const [lessonLines, setLessonLines] = useState<LessonLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [mode, setMode] = useState<"detailed" | "overview">("detailed");
  const [sourceFile, setSourceFile] = useState("transcript-06.txt");
  const [totalLines, setTotalLines] = useState(32);

  const chatbotRef = useRef<SlideChatbotHandle>(null);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        setLoading(true);
        setError(null);

        const slidesRes = await api.getLessonSlides("transcript-06", mode);
        if (isMounted && slidesRes?.slides) {
          setSlides(slidesRes.slides);
          if (slidesRes.source_file) setSourceFile(slidesRes.source_file);
          if (slidesRes.total_lines) setTotalLines(slidesRes.total_lines);
        }

        try {
          const lessonRes = await api.getLesson("transcript-06");
          if (isMounted && lessonRes?.lines) {
            setLessonLines(lessonRes.lines);
            if (!slidesRes?.total_lines) setTotalLines(lessonRes.total_lines);
          }
        } catch (e) {
          console.warn("Could not load lesson lines:", e);
        }

        let activeId = typeof window !== "undefined" ? localStorage.getItem("vlearn_active_session_id") : null;
        let activeSession: SessionData | null = null;

        if (activeId) {
          try {
            activeSession = await api.getSession(activeId);
          } catch {
            activeSession = null;
          }
        }

        if (!activeSession) {
          activeSession = await api.startSession("Học viên", "transcript-06", "milo");
          if (typeof window !== "undefined") {
            localStorage.setItem("vlearn_active_session_id", activeSession.session_id);
          }
        }

        if (isMounted && activeSession) {
          setSession(activeSession);
        }
      } catch (err: any) {
        console.error("Initialization error:", err);
        if (isMounted) setError(err.message || "Không thể tải dữ liệu Slide AI.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    init();
    return () => {
      isMounted = false;
    };
  }, [mode]);

  const currentSlide = slides[currentIndex];

  const handleSwitchMode = async (newMode: "detailed" | "overview") => {
    try {
      setLoading(true);
      setMode(newMode);
      const res = await api.getLessonSlides("transcript-06", newMode);
      if (res?.slides) {
        setSlides(res.slides);
        setCurrentIndex(0);
      }
    } catch (e: any) {
      console.error("Mode switch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadCustomFile = async (text: string, filename: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.parseSlidesFromFile(text, filename);
      if (res?.slides && res.slides.length > 0) {
        setSlides(res.slides);
        setCurrentIndex(0);
        setSourceFile(filename);
        setTotalLines(res.total_lines || text.split(/\r?\n/).filter(Boolean).length);

        const lines: LessonLine[] = text
          .split(/\r?\n/)
          .filter(Boolean)
          .map((l, i) => ({ line_number: i + 1, text: l.trim() }));
        setLessonLines(lines);
      }
    } catch (e: any) {
      setError(e.message || "Không thể xử lý tệp văn bản.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (messageContent: string) => {
    if (!session || !currentSlide || isSending) return;

    setIsSending(true);
    setError(null);

    const slideContext = {
      lesson_id: "transcript-06",
      slide_id: currentSlide.slide_number,
      slide_title: currentSlide.title,
      slide_content: currentSlide.content,
      user_message: messageContent,
    };

    try {
      const updated = await api.sendMessage(session.session_id, messageContent, slideContext);
      setSession(updated);
    } catch (err: any) {
      console.error("Failed to send message:", err);
      setError(err.message || "Không thể gửi tin nhắn đến chatbot.");
    } finally {
      setIsSending(false);
    }
  };

  const handleAiAction = async (action: "explain" | "summary" | "ask" | "example") => {
    if (!currentSlide) return;

    if (action === "ask") {
      setMobileChatOpen(true);
      setTimeout(() => {
        chatbotRef.current?.focusInput();
      }, 100);
      return;
    }

    let prompt = "";
    if (action === "explain") {
      prompt = `Giải thích nội dung Trang ${currentSlide.slide_number} (${currentSlide.title}) một cách dễ hiểu và chi tiết hơn giúp tôi.`;
    } else if (action === "summary") {
      prompt = `Tóm tắt những điểm cốt lõi nhất của Trang ${currentSlide.slide_number} (${currentSlide.title}) trong 2-3 gạch đầu dòng.`;
    } else if (action === "example") {
      prompt = `Hãy cho tôi một ví dụ thực tế trực quan để hiểu rõ hơn nội dung của Trang ${currentSlide.slide_number} (${currentSlide.title}).`;
    }

    if (prompt) {
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        setMobileChatOpen(true);
      }
      await handleSendMessage(prompt);
    }
  };

  const handleNextSlide = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-neutral-100 flex flex-col overflow-hidden text-neutral-900">
        <Header activePage="slide-ai" />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white border border-neutral-200 p-8 rounded-3xl max-w-sm shadow-sm space-y-4">
            <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-neutral-900">Đang đọc text từ tệp và chuẩn bị slide</h3>
              <p className="text-xs text-neutral-500 font-mono">
                Đang đọc và phân tích {sourceFile}...
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="h-screen bg-neutral-100 flex flex-col overflow-hidden text-neutral-900">
      <Header
        activePage="slide-ai"
        sessionId={session?.session_id}
        currentTurn={session?.current_turn}
        status={session?.status}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 lg:w-[68%] flex flex-col h-full overflow-hidden">
          <SlideViewer
            slides={slides}
            currentIndex={currentIndex}
            onSelectSlide={setCurrentIndex}
            onNextSlide={handleNextSlide}
            onPrevSlide={handlePrevSlide}
            onAiAction={handleAiAction}
            lessonTitle={session?.lesson_title || "Attention Mechanism & Transformer (transcript-06)"}
            isAiThinking={isSending}
            sourceFile={sourceFile}
            totalLines={totalLines}
            mode={mode}
            onSwitchMode={handleSwitchMode}
            onLoadCustomFile={handleLoadCustomFile}
            lessonLines={lessonLines}
          />
        </div>

        <div className="hidden lg:flex lg:w-[32%] flex-col h-full border-l border-neutral-200/90 bg-white shadow-xs z-10">
          {currentSlide && (
            <SlideChatbot
              ref={chatbotRef}
              session={session}
              currentSlide={currentSlide}
              isSending={isSending}
              onSendMessage={handleSendMessage}
              lessonLines={lessonLines}
            />
          )}
        </div>

        <div className="lg:hidden fixed bottom-16 right-4 z-20">
          <button
            type="button"
            onClick={() => setMobileChatOpen(true)}
            className="flex items-center space-x-2 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2.5 rounded-full shadow-lg text-xs font-semibold cursor-pointer"
          >
            <span>💬 Chat với AI</span>
            <span className="w-5 h-5 rounded-full bg-white/20 text-[10px] font-mono flex items-center justify-center">
              {session?.messages?.length || 0}
            </span>
          </button>
        </div>

        {mobileChatOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex flex-col justify-end bg-black/40 backdrop-blur-xs">
            <div
              className="absolute inset-0"
              onClick={() => setMobileChatOpen(false)}
            />
            <div className="relative w-full h-[85vh] bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden border-t border-neutral-200">
              {currentSlide && (
                <SlideChatbot
                  ref={chatbotRef}
                  session={session}
                  currentSlide={currentSlide}
                  isSending={isSending}
                  onSendMessage={handleSendMessage}
                  lessonLines={lessonLines}
                  onCloseMobile={() => setMobileChatOpen(false)}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 max-w-md p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-mono rounded-2xl shadow-lg z-50 flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-3 text-red-500 hover:text-red-800 font-bold"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
