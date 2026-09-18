"use client";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  if (!isOpen) return null;

  const handleClearCache = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("vlearn_active_session_id");
      alert("Đã làm sạch bộ nhớ cache phiên học cục bộ!");
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-white border border-neutral-300 rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl text-neutral-900">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold bg-neutral-900 text-white px-2 py-0.5 rounded">
              VLEARN SETTINGS
            </span>
            <h3 className="text-sm font-bold text-neutral-900">
              Cấu hình & Thông tin Hệ thống
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-900 text-sm font-mono cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3 rounded bg-neutral-50 border border-neutral-200 space-y-1">
            <span className="font-bold text-neutral-800 block">Đề tài D1:</span>
            <p className="text-neutral-600">
              Lớp học mô phỏng đa tác tử (Simulated Multi-Agent Classroom) với cơ chế Socratic Tutoring và Knowledge Grounding.
            </p>
          </div>

          <div className="p-3 rounded bg-neutral-50 border border-neutral-200 space-y-1 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-neutral-500">Bài học trọng tâm:</span>
              <span className="font-bold text-neutral-800">transcript-06.txt</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Số dòng tài liệu:</span>
              <span className="font-bold text-neutral-800">32 dòng chuẩn</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Quy tắc trích dẫn:</span>
              <span className="font-bold text-neutral-800">[transcript-06, lines X-Y]</span>
            </div>
          </div>

          <div className="p-3 rounded bg-neutral-50 border border-neutral-200 space-y-2">
            <span className="font-bold text-neutral-800 block">Quản lý Dữ liệu:</span>
            <button
              onClick={handleClearCache}
              className="w-full text-xs font-mono bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 py-1.5 rounded transition cursor-pointer"
            >
              🗑 Làm sạch Cache & Đặt lại Phiên học
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-neutral-200">
          <button
            onClick={onClose}
            className="text-xs font-mono bg-neutral-900 text-white px-4 py-2 rounded hover:bg-neutral-800 transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
