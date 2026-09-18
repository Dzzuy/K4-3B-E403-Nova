"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ScenarioData, api } from "@/lib/api";
import ScenarioEditor from "@/components/ScenarioEditor";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function InstructorPage() {
  const [scenario, setScenario] = useState<ScenarioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadScenario() {
      try {
        const data = await api.getScenario();
        setScenario(data);
      } catch (err: any) {
        console.error(err);
        setError("Không thể tải kịch bản giảng dạy: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadScenario();
  }, []);

  return (
    <div className="h-screen bg-neutral-50/60 flex flex-col overflow-hidden text-neutral-900">
      {/* Top Header */}
      <Header activePage="instructor" />

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Card */}
          <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 md:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-mono text-[10px] font-bold bg-neutral-900 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Instructor Studio
              </span>
              <span className="text-xs font-mono text-neutral-400">
                Track D1 Scenario Designer
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Thiết kế Kịch bản & Persona Tác tử
            </h1>
            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
              Tùy chỉnh persona của 3 tác tử (Peer, TA, Instructor), soạn thảo misconception khởi đầu và thiết lập ranh giới Knowledge Grounding cho các phiên học mô phỏng.
            </p>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm font-mono text-neutral-400">
              Đang tải cấu hình kịch bản...
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-mono rounded-2xl">
              {error}
            </div>
          ) : (
            <ScenarioEditor
              initialData={scenario}
              onSaved={(updated) => setScenario(updated)}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
