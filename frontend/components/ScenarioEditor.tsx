"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ScenarioData, api } from "@/lib/api";

interface ScenarioEditorProps {
  initialData?: ScenarioData | null;
  onSaved?: (updated: ScenarioData) => void;
}

export default function ScenarioEditor({
  initialData,
  onSaved,
}: ScenarioEditorProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<ScenarioData>({
    lesson_id: "transcript-06",
    lesson_title: "Attention Mechanism (transcript-06)",
    misconception:
      "Chào cả lớp và thầy cô, mình vừa đọc phần Attention xong. Theo mình hiểu thì Attention chỉ đơn giản là một cơ chế hard-coding gán trọng số cố định theo khoảng cách vị trí: từ nào đứng gần nhau ngay sát nhau thì luôn có attention cao nhất, còn từ ở xa thì bỏ qua không chú ý đến [transcript-06, lines 13-16]. Có đúng không mọi người?",
    peer_name: "Minh (Bạn học)",
    peer_persona:
      "Minh - Bạn học cùng lớp, trình độ trung bình, mang hiểu lầm về khoảng cách vị trí.",
    ta_name: "Linh (Trợ giảng)",
    ta_persona:
      "Linh - Trợ giảng sư phạm, dùng phương pháp Socratic, không cho đáp án sẵn.",
    instructor_name: "Thầy Hoàng (Giảng viên)",
    instructor_persona:
      "Thầy Hoàng - Giảng viên, kiểm tra, phản biện, chốt kiến thức và đánh giá outcome.",
    citation_rule:
      "Mọi khẳng định liên quan phải có trích dẫn [transcript-06, lines X-Y].",
  });

  const [saving, setSaving] = useState(false);
  const [starting, setStarting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (field: keyof ScenarioData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetDefault = () => {
    setFormData({
      lesson_id: "transcript-06",
      lesson_title: "Attention Mechanism (transcript-06)",
      misconception:
        "Chào cả lớp và thầy cô, mình vừa đọc phần Attention xong. Theo mình hiểu thì Attention chỉ đơn giản là một cơ chế hard-coding gán trọng số cố định theo khoảng cách vị trí: từ nào đứng gần nhau ngay sát nhau thì luôn có attention cao nhất, còn từ ở xa thì bỏ qua không chú ý đến [transcript-06, lines 13-16]. Có đúng không mọi người?",
      peer_name: "Minh (Bạn học)",
      peer_persona:
        "Minh - Bạn học cùng lớp, trình độ trung bình, mang hiểu lầm về khoảng cách vị trí.",
      ta_name: "Linh (Trợ giảng)",
      ta_persona:
        "Linh - Trợ giảng sư phạm, dùng phương pháp Socratic, không cho đáp án sẵn.",
      instructor_name: "Thầy Hoàng (Giảng viên)",
      instructor_persona:
        "Thầy Hoàng - Giảng viên, kiểm tra, phản biện, chốt kiến thức và đánh giá outcome.",
      citation_rule:
        "Mọi khẳng định liên quan phải có trích dẫn [transcript-06, lines X-Y].",
    });
    setMessage({ type: "success", text: "Đã khôi phục thiết lập mặc định của kịch bản Attention." });
  };

  const handleSaveScenario = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const updated = await api.updateScenario(formData);
      setMessage({ type: "success", text: "✓ Đã lưu kịch bản và cấu hình tác tử thành công!" });
      if (onSaved) onSaved(updated);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Không thể lưu cấu hình kịch bản.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleStartClassroom = async () => {
    setStarting(true);
    try {
      await api.updateScenario(formData);
      const session = await api.startSession("Học viên thử nghiệm", formData.lesson_id);
      if (typeof window !== "undefined") {
        localStorage.setItem("vlearn_active_session_id", session.session_id);
      }
      router.push(`/classroom/${session.session_id}`);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Không thể khởi động phòng học.",
      });
      setStarting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert message */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-mono border ${
            message.type === "success"
              ? "bg-neutral-50 border-neutral-300 text-neutral-900"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Top Action Toolbar */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <span className="font-mono text-xs font-bold text-neutral-800">
            {formData.lesson_title}
          </span>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="text-xs font-medium bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-700 px-3.5 py-2 rounded-xl transition cursor-pointer"
          >
            👁 Xem trước kịch bản
          </button>

          <button
            type="button"
            onClick={handleSaveScenario}
            disabled={saving}
            className="text-xs font-medium bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-900 px-4 py-2 rounded-xl transition disabled:opacity-50 cursor-pointer font-semibold"
          >
            {saving ? "Đang lưu..." : "💾 Lưu kịch bản"}
          </button>

          <button
            type="button"
            onClick={handleStartClassroom}
            disabled={starting}
            className="text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-xl transition disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {starting ? "Đang mở lớp..." : "🚀 Vào lớp ngay"}
          </button>
        </div>
      </div>

      {/* Lesson Configuration */}
      <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 md:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
        <h2 className="text-base font-bold text-neutral-900 border-b border-neutral-100 pb-3">
          1. Thông tin bài học & Grounding
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
              Lesson ID
            </label>
            <input
              type="text"
              value={formData.lesson_id}
              disabled
              className="w-full text-xs font-mono bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 text-neutral-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
              Tiêu đề bài giảng
            </label>
            <input
              type="text"
              value={formData.lesson_title}
              onChange={(e) => handleChange("lesson_title", e.target.value)}
              className="w-full text-xs border border-neutral-200 rounded-xl p-2.5 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10 transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
            Quy tắc trích dẫn bắt buộc (Citation Grounding)
          </label>
          <input
            type="text"
            value={formData.citation_rule}
            onChange={(e) => handleChange("citation_rule", e.target.value)}
            className="w-full text-xs font-mono border border-neutral-200 rounded-xl p-2.5 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10 transition"
          />
        </div>
      </div>

      {/* Misconception Configuration */}
      <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 md:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <h2 className="text-base font-bold text-neutral-900">
            2. Misconception khởi đầu (Hiểu lầm của Bạn học)
          </h2>
          <span className="text-[10px] font-mono bg-neutral-100 text-neutral-700 px-2.5 py-0.5 rounded-full border border-neutral-200 font-semibold">
            Bắt buộc sửa
          </span>
        </div>

        <p className="text-xs text-neutral-500">
          Đây là lời phát biểu mở đầu phiên học của bạn học Minh. Học viên bắt buộc phải nhận diện điểm sai và phản biện trước khi được hoàn thành.
        </p>

        <textarea
          rows={4}
          value={formData.misconception}
          onChange={(e) => handleChange("misconception", e.target.value)}
          className="w-full text-xs font-mono border border-neutral-200 rounded-2xl p-3.5 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10 leading-relaxed transition bg-neutral-50/50"
        />
      </div>

      {/* Agents Persona Configuration */}
      <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 md:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-5">
        <h2 className="text-base font-bold text-neutral-900 border-b border-neutral-100 pb-3">
          3. Cấu hình Persona 3 Tác tử (Multi-Agent Personas)
        </h2>

        {/* Peer Agent */}
        <div className="p-4 border border-neutral-200/80 rounded-2xl bg-neutral-50/60 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase bg-neutral-200 text-neutral-800 px-2 py-0.5 rounded-md">
              PEER AGENT (Bạn học)
            </span>
            <input
              type="text"
              value={formData.peer_name}
              onChange={(e) => handleChange("peer_name", e.target.value)}
              className="text-xs border border-neutral-200 rounded-lg px-2.5 py-1 bg-white focus:outline-none"
              placeholder="Tên bạn học..."
            />
          </div>
          <textarea
            rows={2}
            value={formData.peer_persona}
            onChange={(e) => handleChange("peer_persona", e.target.value)}
            className="w-full text-xs border border-neutral-200 rounded-xl p-2.5 bg-white focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10 transition"
          />
        </div>

        {/* TA Agent */}
        <div className="p-4 border border-neutral-200/80 rounded-2xl bg-neutral-50/60 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase bg-neutral-800 text-white px-2 py-0.5 rounded-md">
              TA AGENT (Trợ giảng Socratic)
            </span>
            <input
              type="text"
              value={formData.ta_name}
              onChange={(e) => handleChange("ta_name", e.target.value)}
              className="text-xs border border-neutral-200 rounded-lg px-2.5 py-1 bg-white focus:outline-none"
              placeholder="Tên trợ giảng..."
            />
          </div>
          <textarea
            rows={2}
            value={formData.ta_persona}
            onChange={(e) => handleChange("ta_persona", e.target.value)}
            className="w-full text-xs border border-neutral-200 rounded-xl p-2.5 bg-white focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10 transition"
          />
        </div>

        {/* Instructor Agent */}
        <div className="p-4 border border-neutral-200/80 rounded-2xl bg-neutral-50/60 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase bg-black text-white px-2 py-0.5 rounded-md">
              INSTRUCTOR AGENT (Giảng viên)
            </span>
            <input
              type="text"
              value={formData.instructor_name}
              onChange={(e) => handleChange("instructor_name", e.target.value)}
              className="text-xs border border-neutral-200 rounded-lg px-2.5 py-1 bg-white focus:outline-none"
              placeholder="Tên giảng viên..."
            />
          </div>
          <textarea
            rows={2}
            value={formData.instructor_persona}
            onChange={(e) => handleChange("instructor_persona", e.target.value)}
            className="w-full text-xs border border-neutral-200 rounded-xl p-2.5 bg-white focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10 transition"
          />
        </div>
      </div>

      {/* Buttons Action Bar */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={handleResetDefault}
          className="text-xs font-mono text-neutral-500 hover:text-neutral-900 border border-neutral-200 hover:bg-neutral-100 px-4 py-2 rounded-xl transition cursor-pointer"
        >
          Khôi phục mặc định
        </button>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleSaveScenario}
            disabled={saving}
            className="text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-2.5 rounded-xl transition disabled:opacity-50 cursor-pointer shadow-xs font-mono"
          >
            {saving ? "Đang lưu..." : "Lưu kịch bản"}
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-[10px] font-bold bg-neutral-900 text-white px-2 py-0.5 rounded-full">
                  PREVIEW
                </span>
                <h3 className="text-base font-bold text-neutral-900">
                  Kịch Bản Mô Phỏng Phiên Học
                </h3>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="text-neutral-400 hover:text-neutral-900 text-sm font-mono cursor-pointer"
              >
                ✕ Đóng
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80">
                <div className="font-mono font-bold text-neutral-800 mb-1">
                  1. Mở đầu phiên: {formData.peer_name}
                </div>
                <p className="italic text-neutral-700 whitespace-pre-wrap leading-relaxed">
                  "{formData.misconception}"
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80">
                <div className="font-mono font-bold text-neutral-800 mb-1">
                  2. Trợ giảng: {formData.ta_name}
                </div>
                <p className="text-neutral-600">
                  {formData.ta_persona}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80">
                <div className="font-mono font-bold text-neutral-800 mb-1">
                  3. Giảng viên đánh giá: {formData.instructor_name}
                </div>
                <p className="text-neutral-600">
                  {formData.instructor_persona}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-100/70 border border-neutral-200 font-mono text-[11px] text-neutral-600">
                Quy tắc trích dẫn: {formData.citation_rule}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-neutral-100">
              <button
                onClick={() => setShowPreview(false)}
                className="text-xs font-mono px-4 py-2 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition cursor-pointer"
              >
                Đóng
              </button>
              <button
                onClick={handleStartClassroom}
                disabled={starting}
                className="text-xs font-mono bg-neutral-900 hover:bg-neutral-800 text-white px-5 py-2 rounded-xl transition font-bold cursor-pointer shadow-xs"
              >
                {starting ? "Đang mở lớp..." : "Khởi động phòng học ngay →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
