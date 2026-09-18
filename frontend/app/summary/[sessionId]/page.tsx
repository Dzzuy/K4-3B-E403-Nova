"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api, SummaryData } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SessionProgress from "@/components/SessionProgress";
import LearningSummary from "@/components/LearningSummary";

export default function SummaryPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSummary() {
      try {
        const data = await api.getSessionSummary(sessionId);
        setSummary(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Không thể tải báo cáo kết quả học tập.");
      } finally {
        setLoading(false);
      }
    }

    if (sessionId) {
      fetchSummary();
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex flex-col justify-between">
        <Header activePage="summary" sessionId={sessionId} />
        <div className="flex-1 flex flex-col items-center justify-center space-y-3 font-mono text-sm text-neutral-600">
          <div className="w-6 h-6 border-2 border-neutral-800 border-t-transparent rounded-full animate-spin" />
          <span>Đang tổng hợp báo cáo bằng chứng học tập...</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen bg-neutral-100 flex flex-col justify-between">
        <Header activePage="summary" sessionId={sessionId} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white border border-neutral-300 p-8 rounded-lg max-w-md shadow-sm space-y-4">
            <div className="text-xl">⚠️</div>
            <h2 className="text-base font-bold text-neutral-900">Không tìm thấy báo cáo</h2>
            <p className="text-xs text-neutral-600 leading-relaxed font-mono">{error || "Phiên học không tồn tại."}</p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-block bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold px-4 py-2 rounded transition"
              >
                ← Quay lại trang chủ
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="h-screen bg-neutral-100 text-neutral-900 flex flex-col overflow-hidden">
      {/* Unified Header */}
      <Header
        activePage="summary"
        sessionId={summary.session_id}
        status={summary.learning_outcome}
      />

      {/* Main Workspace with Sidebar Navigation */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <SessionProgress sessionId={summary.session_id} />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-4xl mx-auto">
            <LearningSummary summary={summary} />
          </div>
        </main>
      </div>

      {/* Unified Footer */}
      <Footer />
    </div>
  );
}
