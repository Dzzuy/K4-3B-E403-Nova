"use client";

interface AgentBadgeProps {
  role: "PEER" | "TA" | "INSTRUCTOR" | "STUDENT";
  customName?: string;
  size?: "sm" | "md";
  showState?: "thinking" | "speaking" | "waiting";
}

export default function AgentBadge({
  role,
  customName,
  size = "sm",
  showState,
}: AgentBadgeProps) {
  const isSm = size === "sm";

  const getRoleConfig = () => {
    switch (role) {
      case "PEER":
        return {
          label: "PEER",
          name: customName || "Minh (Bạn học)",
          badgeBg: "bg-neutral-100 text-neutral-800 border-neutral-200",
          desc: "Bạn cùng lớp · Mang hiểu lầm ban đầu",
        };
      case "TA":
        return {
          label: "TA",
          name: customName || "Linh (Trợ giảng)",
          badgeBg: "bg-neutral-800 text-white border-neutral-700",
          desc: "Socratic Questioning · Gợi ý từng bước",
        };
      case "INSTRUCTOR":
        return {
          label: "INSTRUCTOR",
          name: customName || "Thầy Hoàng (Giảng viên)",
          badgeBg: "bg-black text-white border-neutral-800",
          desc: "Chốt kiến thức · Đánh giá hoàn thành",
        };
      case "STUDENT":
        return {
          label: "YOU",
          name: customName || "Học viên",
          badgeBg: "bg-white text-neutral-900 border-neutral-300",
          desc: "Người học · Phản biện và giải thích",
        };
    }
  };

  const config = getRoleConfig();

  return (
    <div className="inline-flex items-center space-x-2 select-none">
      <span
        className={`inline-flex items-center font-mono font-bold uppercase tracking-wider rounded-md border shadow-xs ${
          config.badgeBg
        } ${isSm ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2.5 py-1"}`}
      >
        {config.label}
      </span>
      <span
        className={`font-semibold text-neutral-900 ${
          isSm ? "text-xs" : "text-sm"
        }`}
      >
        {config.name}
      </span>

      {showState && (
        <span className="inline-flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-600">
          {showState === "speaking" && (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Đang nói</span>
            </>
          )}
          {showState === "thinking" && (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Đang nghĩ...</span>
            </>
          )}
          {showState === "waiting" && (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
              <span>Lắng nghe</span>
            </>
          )}
        </span>
      )}
    </div>
  );
}
