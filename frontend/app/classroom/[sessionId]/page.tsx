"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api, SessionData, LessonLine } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ParticipantsPanel from "@/components/ParticipantsPanel";
import ClassroomChat from "@/components/ClassroomChat";
import LessonContext from "@/components/LessonContext";
import StudentInput from "@/components/StudentInput";

const STATIC_FALLBACK_LINES: LessonLine[] = [
  { line_number: 1, text: "[Bài 06: Cơ chế Chú ý (Attention Mechanism) và Kiến trúc Transformer]" },
  { line_number: 2, text: "Giảng viên: Chào các bạn, hôm nay chúng ta sẽ tìm hiểu về Attention Mechanism - bước ngoặt then chốt trong xử lý ngôn ngữ tự nhiên." },
  { line_number: 3, text: "Để hiểu Attention, trước hết ta hãy xem lại hạn chế của các mô hình tuần tự truyền thống như RNN và LSTM." },
  { line_number: 4, text: "Trong RNN truyền thống, chuỗi đầu vào được xử lý tuần tự từng từ một qua các bước thời gian t = 1, 2, ..., T." },
  { line_number: 5, text: "Mô hình cố gắng nén toàn bộ thông tin ngữ cảnh của một câu dài vào một vector ẩn cuối cùng có kích thước cố định (fixed-size hidden state)." },
  { line_number: 6, text: "Cách nén này tạo ra một điểm nghẽn thông tin nghiêm trọng (information bottleneck), đặc biệt khi xử lý các câu dài trên 20-30 từ." },
  { line_number: 7, text: "Hiện tượng suy giảm đạo hàm (vanishing gradient) cũng khiến RNN dần quên mất thông tin của những từ xuất hiện ở vị trí đầu câu." },
  { line_number: 8, text: "Cơ chế Attention ra đời nhằm giải quyết triệt để điểm nghẽn biểu diễn cố định này của mô hình tuần tự." },
  { line_number: 9, text: "Ý tưởng cốt lõi của Attention là: không bắt mô hình phải nén toàn bộ câu vào một vector duy nhất." },
  { line_number: 10, text: "Thay vào đó, ở mỗi bước tính toán, mô hình được phép nhìn lại toàn bộ các trạng thái ẩn của tất cả các token trong chuỗi đầu vào." },
  { line_number: 11, text: "Mô hình sẽ tính toán một tập hợp các trọng số chú ý (attention weights) đại diện cho mức độ liên quan giữa từ hiện tại và các từ khác." },
  { line_number: 12, text: "Cơ chế Self-Attention (tự chú ý) cho phép mỗi token trong câu kết nối trực tiếp với tất cả các token khác trong cùng chuỗi (kết nối all-to-all)." },
  { line_number: 13, text: "Một hiểu lầm rất phổ biến là cho rằng Attention chỉ ưu tiên các từ đứng gần nhau trong câu hoặc gán trọng số cố định theo vị trí liền kề." },
  { line_number: 14, text: "Đây là cách hiểu hoàn toàn sai: Attention KHÔNG phụ thuộc vào khoảng cách vật lý hay khoảng cách từ ngữ giữa các vị trí." },
  { line_number: 15, text: "Hai từ cách nhau 50 từ trong một đoạn văn bản vẫn có thể có trọng số attention cực kỳ cao nếu chúng có quan hệ tương quan ngữ nghĩa mạnh mẽ." },
  { line_number: 16, text: "Ví dụ trong câu \"Con mèo mà tôi nhìn thấy tuần trước ở công viên hôm nay lại xuất hiện\", từ \"xuất hiện\" sẽ có attention cao tới \"Con mèo\"." },
  { line_number: 17, text: "Để thực hiện tính toán Attention, mỗi token đầu vào được chiếu qua ba ma trận trọng số tuyến tính để tạo ra ba vector: Query (Q), Key (K) và Value (V)." },
  { line_number: 18, text: "Query (Q) là vector đại diện cho câu hỏi hoặc thông tin mà token hiện tại đang cần tìm kiếm từ ngữ cảnh xung quanh." },
  { line_number: 19, text: "Key (K) đóng vai trò như nhãn định danh hoặc đặc trưng của từng token trong chuỗi, dùng để đối sánh với Query." },
  { line_number: 20, text: "Value (V) chứa nội dung thông tin thực sự của token đó, sẽ được tổng hợp lại dựa trên trọng số sau khi đối sánh." },
  { line_number: 21, text: "Quá trình tính toán Attention được gọi là Scaled Dot-Product Attention, theo công thức toán học: Attention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V." },
  { line_number: 22, text: "Bước đầu tiên là nhân vô hướng (dot-product) giữa vector Query của token hiện tại với tất cả các vector Key của chuỗi: score = Q * K^T." },
  { line_number: 23, text: "Tích vô hướng này phản ánh mức độ tương đồng hoặc độ phù hợp ngữ nghĩa giữa Query và từng Key." },
  { line_number: 24, text: "Sau đó, ta chia tích vô hướng cho căn bậc hai kích thước vector Key là sqrt(d_k) để co giãn độ lớn điểm số (scaling factor)." },
  { line_number: 25, text: "Nếu không có hệ số sqrt(d_k), khi số chiều d_k lớn, tích vô hướng sẽ rất lớn, đẩy hàm softmax vào các vùng có đạo hàm cực nhỏ (gradient saturation)." },
  { line_number: 26, text: "Tiếp theo, hàm softmax được áp dụng lên điểm số đã chuẩn hóa để chuyển đổi thành phân phối xác suất có tổng bằng 1." },
  { line_number: 27, text: "Cuối cùng, ta tính tổng có trọng số của các vector Value (V) nhân với phân phối xác suất vừa thu được từ softmax." },
  { line_number: 28, text: "Nhờ cơ chế này, mô hình Transformer có thể xử lý song song toàn bộ chuỗi văn bản cùng một lúc thay vì phải chờ tuần tự từng bước như RNN." },
  { line_number: 29, text: "Cơ chế Multi-Head Attention mở rộng thêm bằng cách chia Q, K, V thành nhiều không gian biểu diễn con độc lập (h đầu chú ý)." },
  { line_number: 30, text: "Mỗi Attention Head có thể tập trung học một loại tương quan khác nhau: ví dụ một head học cú pháp, một head học quan hệ thực thể, một head học ngữ nghĩa xa." },
  { line_number: 31, text: "Tóm lại, Attention là cơ chế kết nối linh hoạt, tính toán tương quan ngữ nghĩa thông qua Q, K, V, hoàn toàn không phụ thuộc vào khoảng cách từ gần kề." },
  { line_number: 32, text: "Học viên cần nắm vững: Attention không phải hàm gán cố định theo vị trí, mà là hàm tính tương quan động dựa trên nội dung biểu diễn." },
];

export default function ClassroomPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<SessionData | null>(null);
  const [lessonLines, setLessonLines] = useState<LessonLine[]>(STATIC_FALLBACK_LINES);
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [highlightRange, setHighlightRange] = useState<[number, number] | null>([13, 16]);
  const [activeCitation, setActiveCitation] = useState<string | null>("transcript-06, lines 13-16");
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [showLeftPanel, setShowLeftPanel] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!sessionId) return;
      setLoading(true);
      setError("");

      try {
        let sessData: SessionData;
        try {
          sessData = await api.getSession(sessionId);
        } catch (fetchErr: any) {
          console.warn("Session not found, initializing fresh session for ID:", sessionId);
          sessData = await api.startSession("Học viên", "transcript-06");
          router.replace(`/classroom/${sessData.session_id}`);
          return;
        }

        setSession(sessData);

        // Fetch lesson lines from server
        try {
          const lData = await api.getLesson("transcript-06");
          if (lData && lData.lines && lData.lines.length > 0) {
            setLessonLines(lData.lines);
          }
        } catch (lessonErr) {
          console.warn("Using built-in transcript lines:", lessonErr);
        }

        const lastMsg = sessData.messages[sessData.messages.length - 1];
        if (lastMsg && lastMsg.citation) {
          parseAndHighlight(lastMsg.citation);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Lỗi tải dữ liệu phòng học.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [sessionId, router]);

  const parseAndHighlight = (citationStr: string) => {
    setActiveCitation(citationStr);
    const match = citationStr.match(/lines?\s+(\d+)(?:-(\d+))?/i);
    if (match) {
      const start = parseInt(match[1], 10);
      const end = match[2] ? parseInt(match[2], 10) : start;
      setHighlightRange([start, end]);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isSending || session?.status === "ACHIEVED") return;

    setIsSending(true);
    setError("");

    try {
      const currentSessionId = session?.session_id || sessionId;
      const updated = await api.sendMessage(currentSessionId, content);
      setSession(updated);

      const lastAgentMsg = updated.messages[updated.messages.length - 1];
      if (lastAgentMsg && lastAgentMsg.citation) {
        parseAndHighlight(lastAgentMsg.citation);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Không thể gửi tin nhắn. Hãy kiểm tra máy chủ backend.");
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-neutral-100 flex flex-col justify-between">
        <Header activePage="classroom" sessionId={sessionId} />
        <div className="flex-1 flex flex-col items-center justify-center space-y-3 font-mono text-sm text-neutral-600">
          <div className="w-6 h-6 border-2 border-neutral-800 border-t-transparent rounded-full animate-spin" />
          <span>Đang vào phòng học mô phỏng AI...</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="h-screen bg-neutral-100 flex flex-col justify-between">
        <Header activePage="classroom" sessionId={sessionId} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white border border-neutral-300 p-8 rounded-lg max-w-md shadow-sm space-y-4">
            <div className="text-xl">⚠️</div>
            <h2 className="text-base font-bold text-neutral-900">Không thể kết nối phòng học</h2>
            <p className="text-xs text-neutral-600 leading-relaxed font-mono">{error}</p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-block bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold px-4 py-2 rounded transition"
              >
                ← Quay lại danh sách bài học
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="h-screen bg-neutral-100 flex flex-col overflow-hidden text-neutral-900">
      {/* Top Header */}
      <Header
        activePage="classroom"
        sessionId={session?.session_id}
        currentTurn={session?.current_turn}
        status={session?.status}
      />

      {/* 3-Panel AI Virtual Classroom Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Panel 1: PARTICIPANTS */}
        {showLeftPanel && (
          <ParticipantsPanel
            session={session}
            activeAgent={session?.active_agent}
            isAgentThinking={isSending}
          />
        )}

        {/* Panel 2: CLASSROOM CHAT */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-neutral-100 min-w-0">
          {/* Subheader Toolbar */}
          <div className="h-9 bg-white border-b border-neutral-300 px-4 flex items-center justify-between shrink-0 text-xs select-none">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowLeftPanel(!showLeftPanel)}
                className="text-[11px] font-mono text-neutral-600 hover:text-neutral-900 px-1.5 py-0.5 rounded border border-neutral-200 hover:bg-neutral-100 transition cursor-pointer"
                title="Bật/tắt panel người tham gia"
              >
                {showLeftPanel ? "⇥ Ẩn thành viên" : "⇤ Thành viên"}
              </button>
              <span className="text-neutral-300">|</span>
              <span className="font-semibold text-neutral-800 text-[11px]">
                {session?.student_name}
              </span>
              <span className="text-neutral-400 font-mono text-[10px]">
                · Lượt {session?.current_turn}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Link
                href="/slide-ai"
                className="text-[11px] font-mono text-neutral-700 hover:text-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-200 hover:bg-neutral-100 transition flex items-center space-x-1 font-semibold"
                title="Chuyển sang học tương tác với Slide AI"
              >
                <span>📚</span>
                <span>Slide AI</span>
              </Link>
              <span className="text-neutral-300">|</span>
              <button
                onClick={() => setShowRightPanel(!showRightPanel)}
                className="text-[11px] font-mono text-neutral-600 hover:text-neutral-900 px-1.5 py-0.5 rounded border border-neutral-200 hover:bg-neutral-100 transition cursor-pointer"
                title="Bật/tắt panel tài liệu bài học"
              >
                {showRightPanel ? "Ẩn bài học ⇥" : "⇤ Xem bài học"}
              </button>
            </div>
          </div>

          {/* Classroom Chat Stream */}
          <ClassroomChat
            messages={session?.messages || []}
            isAgentThinking={isSending}
            activeAgent={session?.active_agent}
            misconceptionResolved={session?.misconception_resolved || false}
            misconceptionText={session?.learning_evidence?.misconception}
            onCitationClick={parseAndHighlight}
            error={error}
            lessonLines={lessonLines}
          />

          {/* Student Input Box */}
          <StudentInput
            onSendMessage={handleSendMessage}
            disabled={isSending}
            isSending={isSending}
            isAchieved={session?.status === "ACHIEVED"}
            sessionId={session?.session_id || sessionId}
            onViewSummary={() => router.push(`/summary/${session?.session_id || sessionId}`)}
          />
        </div>

        {/* Panel 3: LESSON CONTEXT */}
        {showRightPanel && (
          <div className="w-80 md:w-96 shrink-0 h-full flex flex-col overflow-hidden">
            <LessonContext
              lines={lessonLines}
              highlightRange={highlightRange}
              activeCitation={activeCitation}
              currentConcept="Attention vs Sequential Bottleneck (Scaled Dot-Product)"
              learningState={session?.status}
              misconceptionResolved={session?.misconception_resolved}
              onLineClick={(lineNumber) => {
                setHighlightRange([lineNumber, lineNumber]);
                setActiveCitation(`transcript-06, line ${lineNumber}`);
              }}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
