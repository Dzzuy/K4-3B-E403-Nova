import fs from "fs";
import path from "path";

export interface Message {
  id: string;
  turn: number;
  sender: "PEER" | "TA" | "INSTRUCTOR" | "STUDENT";
  sender_name: string;
  content: string;
  citation: string | null;
  timestamp: string;
}

export interface SessionData {
  session_id: string;
  lesson_id: string;
  lesson_title: string;
  student_name: string;
  status: "IN_PROGRESS" | "ACHIEVED";
  current_turn: number;
  phase: string;
  active_agent: string;
  peer_id?: string;
  peer_name?: string;
  difficulty_level?: number;
  misconception_resolved: boolean;
  learning_evidence: {
    initial_understanding: string;
    misconception: string;
    student_responses: Array<{ turn: number; content: string; timestamp: string }>;
    ta_interventions: Array<{ turn: number; type: string; message: string }>;
    instructor_feedback: Array<{ turn: number; message: string }>;
    final_explanation: string;
    learning_outcome: "PENDING" | "ACHIEVED" | "NOT_ACHIEVED";
  };
  messages: Message[];
}

export interface ScenarioConfig {
  lesson_id: string;
  lesson_title: string;
  misconception: string;
  peer_name: string;
  peer_persona: string;
  ta_name: string;
  ta_persona: string;
  instructor_name: string;
  instructor_persona: string;
  citation_rule: string;
}

export const PEER_PROFILES: Record<string, { id: string; name: string; difficulty: number; persona: string; initial_misconception: string }> = {
  milo: {
    id: "milo",
    name: "Milo (Curious Beginner)",
    difficulty: 1,
    persona: "Curious Beginner · Hỏi ngây thơ, misconception rõ ràng về khoảng cách từ gần kề, cần giải thích đơn giản.",
    initial_misconception:
      "Chào cả lớp và thầy cô, mình vừa đọc phần Attention xong. Theo mình hiểu thì Attention chỉ đơn giản là một cơ chế hard-coding gán trọng số cố định theo khoảng cách vị trí: từ nào đứng gần nhau ngay sát nhau thì luôn có attention cao nhất, còn từ ở xa thì bỏ qua không chú ý đến [transcript-06, lines 13-16]. Có đúng không mọi người?",
  },
  kai: {
    id: "kai",
    name: "Kai (Confident Challenger)",
    difficulty: 2,
    persona: "Confident Challenger · Đưa misconception rất plausible về context length và all-to-all.",
    initial_misconception:
      "Chào cả lớp và thầy cô, mình vừa đọc phần Attention xong. Theo mình hiểu thì nếu Attention tính tương quan all-to-all không phụ thuộc khoảng cách vật lý [transcript-06, lines 13-16], thì chẳng phải từ nào đứng gần nhau cũng có attention cao như nhau sao? Liệu Attention có thực sự khác gì một hàm gán trọng số theo vị trí?",
  },
  nova: {
    id: "nova",
    name: "Nova (Analytical Skeptic)",
    difficulty: 3,
    persona: "Analytical Skeptic · Dùng counterexample, edge case, hỏi sâu về Scaling factor và Softmax gradient saturation.",
    initial_misconception:
      "Chào thầy và các bạn, nếu Attention chỉ đơn giản là tính tích vô hướng score = Q * K^T [transcript-06, lines 21-23], thì tại sao lại phải chia cho sqrt(d_k) và softmax? Chẳng phải cứ nhân vô hướng là ra điểm tương quan không phụ thuộc khoảng cách rồi sao [transcript-06, lines 21-27]?",
  },
};

declare global {
  var __vlearn_sessions: Map<string, SessionData> | undefined;
  var __vlearn_scenario: ScenarioConfig | undefined;
}

if (!global.__vlearn_sessions) {
  global.__vlearn_sessions = new Map<string, SessionData>();
}

export const sessions = global.__vlearn_sessions;

if (!global.__vlearn_scenario) {
  global.__vlearn_scenario = {
    lesson_id: "transcript-06",
    lesson_title: "Attention Mechanism (transcript-06)",
    misconception: PEER_PROFILES["milo"].initial_misconception,
    peer_name: "Milo (Curious Beginner)",
    peer_persona: PEER_PROFILES["milo"].persona,
    ta_name: "Linh (Trợ giảng Socratic)",
    ta_persona: "Linh - Trợ giảng sư phạm, dùng phương pháp Socratic, không cho đáp án sẵn.",
    instructor_name: "Thầy Hoàng (AI Instructor)",
    instructor_persona: "Thầy Hoàng - Giảng viên, kiểm tra, phản biện, chốt kiến thức và đánh giá outcome.",
    citation_rule: "Mọi khẳng định liên quan phải có trích dẫn [transcript-06, lines X-Y].",
  };
}

export function getScenario(): ScenarioConfig {
  return global.__vlearn_scenario!;
}

export function updateScenario(updates: Partial<ScenarioConfig>): ScenarioConfig {
  global.__vlearn_scenario = { ...global.__vlearn_scenario!, ...updates };
  return global.__vlearn_scenario;
}

const DEFAULT_TRANSCRIPT = [
  "[Bài 06: Cơ chế Chú ý (Attention Mechanism) và Kiến trúc Transformer]",
  "Giảng viên: Chào các bạn, hôm nay chúng ta sẽ tìm hiểu về Attention Mechanism - bước ngoặt then chốt trong xử lý ngôn ngữ tự nhiên.",
  "Để hiểu Attention, trước hết ta hãy xem lại hạn chế của các mô hình tuần tự truyền thống như RNN và LSTM.",
  "Trong RNN truyền thống, chuỗi đầu vào được xử lý tuần tự từng từ một qua các bước thời gian t = 1, 2, ..., T.",
  "Mô hình cố gắng nén toàn bộ thông tin ngữ cảnh của một câu dài vào một vector ẩn cuối cùng có kích thước cố định (fixed-size hidden state).",
  "Cách nén này tạo ra một điểm nghẽn thông tin nghiêm trọng (information bottleneck), đặc biệt khi xử lý các câu dài trên 20-30 từ.",
  "Hiện tượng suy giảm đạo hàm (vanishing gradient) cũng khiến RNN dần quên mất thông tin của những từ xuất hiện ở vị trí đầu câu.",
  "Cơ chế Attention ra đời nhằm giải quyết triệt để điểm nghẽn biểu diễn cố định này của mô hình tuần tự.",
  "Ý tưởng cốt lõi của Attention là: không bắt mô hình phải nén toàn bộ câu vào một vector duy nhất.",
  "Thay vào đó, ở mỗi bước tính toán, mô hình được phép nhìn lại toàn bộ các trạng thái ẩn của tất cả các token trong chuỗi đầu vào.",
  "Mô hình sẽ tính toán một tập hợp các trọng số chú ý (attention weights) đại diện cho mức độ liên quan giữa từ hiện tại và các từ khác.",
  "Cơ chế Self-Attention (tự chú ý) cho phép mỗi token trong câu kết nối trực tiếp với tất cả các token khác trong cùng chuỗi (kết nối all-to-all).",
  "Một hiểu lầm rất phổ biến là cho rằng Attention chỉ ưu tiên các từ đứng gần nhau trong câu hoặc gán trọng số cố định theo vị trí liền kề.",
  "Đây là cách hiểu hoàn toàn sai: Attention KHÔNG phụ thuộc vào khoảng cách vật lý hay khoảng cách từ ngữ giữa các vị trí.",
  "Hai từ cách nhau 50 từ trong một đoạn văn bản vẫn có thể có trọng số attention cực kỳ cao nếu chúng có quan hệ tương quan ngữ nghĩa mạnh mẽ.",
  "Ví dụ trong câu 'Con mèo mà tôi nhìn thấy tuần trước ở công viên hôm nay lại xuất hiện', từ 'xuất hiện' sẽ có attention cao tới 'Con mèo'.",
  "Để thực hiện tính toán Attention, mỗi token đầu vào được chiếu qua ba ma trận trọng số tuyến tính để tạo ra ba vector: Query (Q), Key (K) và Value (V).",
  "Query (Q) là vector đại diện cho câu hỏi hoặc thông tin mà token hiện tại đang cần tìm kiếm từ ngữ cảnh xung quanh.",
  "Key (K) đóng vai trò như nhãn định danh hoặc đặc trưng của từng token trong chuỗi, dùng để đối sánh với Query.",
  "Value (V) chứa nội dung thông tin thực sự của token đó, sẽ được tổng hợp lại dựa trên trọng số sau khi đối sánh.",
  "Quá trình tính toán Attention được gọi là Scaled Dot-Product Attention, theo công thức toán học: Attention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V.",
  "Bước đầu tiên là nhân vô hướng (dot-product) giữa vector Query của token hiện tại với tất cả các vector Key của chuỗi: score = Q * K^T.",
  "Tích vô hướng này phản ánh mức độ tương đồng hoặc độ phù hợp ngữ nghĩa giữa Query và từng Key.",
  "Sau đó, ta chia tích vô hướng cho căn bậc hai kích thước vector Key là sqrt(d_k) để co giãn độ lớn điểm số (scaling factor).",
  "Nếu không có hệ số sqrt(d_k), khi số chiều d_k lớn, tích vô hướng sẽ rất lớn, đẩy hàm softmax vào các vùng có đạo hàm cực nhỏ (gradient saturation).",
  "Tiếp theo, hàm softmax được áp dụng lên điểm số đã chuẩn hóa để chuyển đổi thành phân phối xác suất có tổng bằng 1.",
  "Cuối cùng, ta tính tổng có trọng số của các vector Value (V) nhân với phân phối xác suất vừa thu được từ softmax.",
  "Nhờ cơ chế này, mô hình Transformer có thể xử lý song song toàn bộ chuỗi văn bản cùng một lúc thay vì phải chờ tuần tự từng bước như RNN.",
  "Cơ chế Multi-Head Attention mở rộng thêm bằng cách chia Q, K, V thành nhiều không gian biểu diễn con độc lập (h đầu chú ý).",
  "Mỗi Attention Head có thể tập trung học một loại tương quan khác nhau: ví dụ một head học cú pháp, một head học quan hệ thực thể, một head học ngữ nghĩa xa.",
  "Tóm lại, Attention là cơ chế kết nối linh hoạt, tính toán tương quan ngữ nghĩa thông qua Q, K, V, hoàn toàn không phụ thuộc vào khoảng cách từ gần kề.",
  "Học viên cần nắm vững: Attention không phải hàm gán cố định theo vị trí, mà là hàm tính tương quan động dựa trên nội dung biểu diễn.",
];

export function getTranscriptLines(): string[] {
  const candidatePaths = [
    path.resolve(process.cwd(), "data", "transcript-06.txt"),
    path.resolve(process.cwd(), "..", "data", "transcript-06.txt"),
    path.resolve("/Users/truongan/K4-3B-E403-Nova/data/transcript-06.txt"),
  ];

  for (const p of candidatePaths) {
    try {
      if (fs.existsSync(p)) {
        const lines = fs
          .readFileSync(p, "utf-8")
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        if (lines.length > 0) return lines;
      }
    } catch {}
  }

  return DEFAULT_TRANSCRIPT;
}

export function getSessionLocal(sessionId: string): SessionData {
  if (sessions.has(sessionId)) {
    return sessions.get(sessionId)!;
  }

  const candidateDirs = [
    path.resolve(process.cwd(), "logs", "sessions"),
    path.resolve(process.cwd(), "..", "logs", "sessions"),
    path.resolve("/Users/truongan/K4-3B-E403-Nova/logs/sessions"),
  ];

  for (const dir of candidateDirs) {
    const file = path.join(dir, `${sessionId}.json`);
    try {
      if (fs.existsSync(file)) {
        const raw = fs.readFileSync(file, "utf-8");
        const loaded: SessionData = JSON.parse(raw);
        sessions.set(sessionId, loaded);
        return loaded;
      }
    } catch {}
  }

  const newSess = createLocalSession("Học viên", "transcript-06", "milo");
  newSess.session_id = sessionId;
  sessions.set(sessionId, newSess);
  return newSess;
}

export function createLocalSession(
  studentName: string = "Học viên",
  lessonId: string = "transcript-06",
  peerId: string = "milo"
): SessionData {
  const scenario = getScenario();
  const profile = PEER_PROFILES[peerId] || PEER_PROFILES["milo"];
  const sessionId = `sess_${Math.random().toString(36).substring(2, 12)}`;
  const initialMisconception = profile.initial_misconception || scenario.misconception;

  const session: SessionData = {
    session_id: sessionId,
    lesson_id: lessonId,
    lesson_title: scenario.lesson_title,
    student_name: studentName,
    status: "IN_PROGRESS",
    current_turn: 1,
    phase: "WAITING_STUDENT_1",
    active_agent: "PEER",
    peer_id: profile.id,
    peer_name: profile.name,
    difficulty_level: profile.difficulty,
    misconception_resolved: false,
    learning_evidence: {
      initial_understanding: `Học viên bắt đầu phiên học cùng ${profile.name} để nhận diện và phản biện hiểu sai về Attention Mechanism.`,
      misconception: initialMisconception,
      student_responses: [],
      ta_interventions: [],
      instructor_feedback: [],
      final_explanation: "",
      learning_outcome: "PENDING",
    },
    messages: [
      {
        id: "msg_0",
        turn: 0,
        sender: "PEER",
        sender_name: profile.name,
        content: initialMisconception,
        citation: "transcript-06, lines 13-16",
        timestamp: new Date().toISOString(),
      },
    ],
  };

  sessions.set(sessionId, session);
  return session;
}

export function handleLocalStudentMessage(
  sessionId: string,
  studentContent: string
): SessionData {
  const session = getSessionLocal(sessionId);
  const scenario = getScenario();
  const content = studentContent.trim();
  const lower = content.toLowerCase();
  const currentTurn = session.current_turn;

  // Add student message
  session.messages.push({
    id: `msg_${session.messages.length}`,
    turn: currentTurn,
    sender: "STUDENT",
    sender_name: session.student_name,
    content,
    citation: null,
    timestamp: new Date().toISOString(),
  });

  session.learning_evidence.student_responses.push({
    turn: currentTurn,
    content,
    timestamp: new Date().toISOString(),
  });

  // Out of scope check
  const outOfScope = [
    "thời tiết", "weather", "món ăn", "ăn gì", "du lịch", "đá bóng",
    "chứng khoán", "tổng thống", "vi tích phân", "bóng đá", "quantum", "lượng tử"
  ];
  if (outOfScope.some((kw) => lower.includes(kw))) {
    const resp = "Nội dung này không được đề cập trong tài liệu hiện tại.";
    session.messages.push({
      id: `msg_${session.messages.length}`,
      turn: currentTurn,
      sender: "TA",
      sender_name: scenario.ta_name,
      content: resp,
      citation: null,
      timestamp: new Date().toISOString(),
    });
    session.learning_evidence.ta_interventions.push({
      turn: currentTurn,
      type: "OUT_OF_SCOPE_GUARD",
      message: resp,
    });
    session.current_turn += 1;
    return session;
  }

  // Demand answer check
  const demandAnswer = [
    "cho đáp án", "nói luôn đáp án", "đáp án là gì", "nói luôn đi", "giải luôn hộ", "cho tôi đáp án"
  ];
  if (demandAnswer.some((kw) => lower.includes(kw))) {
    const resp =
      "Mình không thể đưa ra đáp án trực tiếp được vì đây là buổi thảo luận để bạn tự khám phá. Bạn hãy đọc lại [transcript-06, lines 11-16], cơ chế Attention tính toán mối tương quan giữa các từ dựa vào điểm số nào thay vì vị trí đứng gần?";
    session.messages.push({
      id: `msg_${session.messages.length}`,
      turn: currentTurn,
      sender: "TA",
      sender_name: scenario.ta_name,
      content: resp,
      citation: "transcript-06, lines 11-16",
      timestamp: new Date().toISOString(),
    });
    session.learning_evidence.ta_interventions.push({
      turn: currentTurn,
      type: "SOCRATIC_DEMAND_ANSWER",
      message: resp,
    });
    session.current_turn += 1;
    session.phase = "WAITING_STUDENT_AFTER_TA";
    return session;
  }

  // One-word response
  if (
    content.split(/\s+/).length <= 2 &&
    ["đúng", "sai", "chuẩn", "không", "ừ", "uh", "ko biết", "chịu"].includes(lower)
  ) {
    const resp =
      "Gợi ý cho bạn: Bạn hãy đọc kỹ [transcript-06, lines 13-16]. Tài liệu chỉ rõ Attention KHÔNG phụ thuộc vào khoảng cách vật lý hay từ ngữ liền kề. Hãy thử phân tích xem cơ chế này khác với mô hình tuần tự RNN ở điểm nào nhé!";
    session.messages.push({
      id: `msg_${session.messages.length}`,
      turn: currentTurn,
      sender: "TA",
      sender_name: scenario.ta_name,
      content: resp,
      citation: "transcript-06, lines 13-16",
      timestamp: new Date().toISOString(),
    });
    session.learning_evidence.ta_interventions.push({
      turn: currentTurn,
      type: "SOCRATIC_ONE_WORD",
      message: resp,
    });
    session.current_turn += 1;
    session.phase = "WAITING_STUDENT_AFTER_TA";
    return session;
  }

  const hasRefutation = [
    "không phụ thuộc", "không phải", "sai rồi", "nhầm rồi", "bác bỏ", "chưa đúng"
  ].some((k) => lower.includes(k));
  const hasTechnical = [
    "query", "key", "value", "q, k, v", "tương quan", "ngữ nghĩa", "all-to-all",
    "khoảng cách", "xa nhau", "50 từ", "softmax", "scaled dot-product"
  ].some((k) => lower.includes(k));

  if (session.phase === "WAITING_FINAL_EXPLANATION") {
    const isValid =
      content.split(/\s+/).length >= 8 &&
      (lower.includes("khoảng cách") || lower.includes("không phụ thuộc") || lower.includes("all-to-all")) &&
      (lower.includes("tương quan") || lower.includes("query") || lower.includes("key") || lower.includes("value") || lower.includes("ngữ nghĩa") || lower.includes("rnn"));

    if (isValid) {
      const resp =
        "Xuất sắc! Giảng viên công nhận: Bạn đã hiểu đúng và giải thích chuẩn xác bản chất của Attention Mechanism theo [transcript-06, lines 12-16, lines 21-27]. Cơ chế tính tương quan all-to-all không phụ thuộc vào khoảng cách từ đã hoàn toàn bác bỏ hiểu lầm ban đầu của bạn học. Phiên học chính thức hoàn thành ĐẠT MỤC TIÊU (ACHIEVED)!";
      session.messages.push({
        id: `msg_${session.messages.length}`,
        turn: currentTurn,
        sender: "INSTRUCTOR",
        sender_name: scenario.instructor_name,
        content: resp,
        citation: "transcript-06, lines 12-16",
        timestamp: new Date().toISOString(),
      });
      session.status = "ACHIEVED";
      session.misconception_resolved = true;
      session.learning_evidence.learning_outcome = "ACHIEVED";
      session.learning_evidence.final_explanation = content;
      session.phase = "COMPLETED";
    } else {
      const resp =
        "Lời giải thích của bạn đã có tiến bộ nhưng chưa hoàn toàn đầy đủ theo [transcript-06, lines 13-16, lines 17-20]. Hãy nêu rõ: vì sao hai từ ở xa nhau vẫn có thể có attention cao, và vai trò của Query - Key trong việc tính điểm tương quan là gì? Misconception chưa được sửa triệt để, mời bạn hoàn thiện thêm.";
      session.messages.push({
        id: `msg_${session.messages.length}`,
        turn: currentTurn,
        sender: "INSTRUCTOR",
        sender_name: scenario.instructor_name,
        content: resp,
        citation: "transcript-06, lines 13-16",
        timestamp: new Date().toISOString(),
      });
      session.learning_evidence.final_explanation = content;
    }
    session.learning_evidence.instructor_feedback.push({
      turn: currentTurn,
      message: session.messages[session.messages.length - 1].content,
    });
    session.current_turn += 1;
    return session;
  }

  // Multi-step Pedagogy Flow
  if (session.phase === "WAITING_STUDENT_1") {
    if (hasRefutation && hasTechnical) {
      const resp =
        "Chính xác! Giảng viên xác nhận: Attention giải quyết triệt để điểm nghẽn biểu diễn của RNN bằng cách tính toán tương quan động all-to-all giữa Query và Key, không phụ thuộc khoảng cách từ [transcript-06, lines 12-16, lines 21-27]. Bạn học đã hiểu rõ chưa? Bây giờ, mời học viên hãy tổng kết lại bằng 2 câu: Attention là gì và vì sao misconception bị bác bỏ hoàn toàn?";
      session.messages.push({
        id: `msg_${session.messages.length}`,
        turn: currentTurn,
        sender: "INSTRUCTOR",
        sender_name: scenario.instructor_name,
        content: resp,
        citation: "transcript-06, lines 12-16",
        timestamp: new Date().toISOString(),
      });
      session.learning_evidence.instructor_feedback.push({
        turn: currentTurn,
        message: resp,
      });
      session.phase = "WAITING_FINAL_EXPLANATION";
    } else if (["bạn minh", "minh ơi", "milo", "kai", "nova", "tại sao", "sao lại", "khoảng cách", "chưa đúng", "không đúng", "chưa hẳn"].some(k => lower.includes(k))) {
      // Step 1: Peer AI responds first
      const resp =
        "Ồ thật sao? Mình đọc [transcript-06, lines 13-16] thấy bảo không phụ thuộc khoảng cách vật lý, nhưng chưa hiểu vì sao nó làm được như vậy? Nếu hai từ cách nhau 50 từ như dòng 15-16 thì làm sao mô hình biết chúng liên quan đến nhau?";
      session.messages.push({
        id: `msg_${session.messages.length}`,
        turn: currentTurn,
        sender: "PEER",
        sender_name: session.peer_name || scenario.peer_name,
        content: resp,
        citation: "transcript-06, lines 13-16",
        timestamp: new Date().toISOString(),
      });
      session.phase = "WAITING_TA_GUIDANCE";
    } else {
      // Step 2: TA intervenes with Socratic hint
      const resp =
        "Rất tốt! Bạn đã chạm đúng vào bản chất: Self-Attention tạo kết nối all-to-all và tính tương quan ngữ nghĩa [transcript-06, lines 12-16]. Bạn có thể giải thích rõ hơn cho bạn học về cách bộ ba vector Q, K, V [transcript-06, lines 17-20] phối hợp để tính ra điểm chú ý không?";
      session.messages.push({
        id: `msg_${session.messages.length}`,
        turn: currentTurn,
        sender: "TA",
        sender_name: scenario.ta_name,
        content: resp,
        citation: "transcript-06, lines 12-16",
        timestamp: new Date().toISOString(),
      });
      session.learning_evidence.ta_interventions.push({
        turn: currentTurn,
        type: "SOCRATIC_GUIDANCE",
        message: resp,
      });
      session.phase = "WAITING_STUDENT_AFTER_TA";
    }
  } else if (session.phase === "WAITING_TA_GUIDANCE") {
    // Step 2: TA follows up with Socratic guidance
    const resp =
      "Gợi ý sư phạm từ Trợ giảng: Để giải thích cho bạn học, bạn hãy nhìn vào [transcript-06, lines 17-20] về bộ ba Query, Key và Value. Cơ chế này tính điểm tương quan Scaled Dot-Product như thế nào mà không phụ thuộc khoảng cách vị trí?";
    session.messages.push({
      id: `msg_${session.messages.length}`,
      turn: currentTurn,
      sender: "TA",
      sender_name: scenario.ta_name,
      content: resp,
      citation: "transcript-06, lines 17-20",
      timestamp: new Date().toISOString(),
    });
    session.learning_evidence.ta_interventions.push({
      turn: currentTurn,
      type: "SOCRATIC_GUIDANCE",
      message: resp,
    });
    session.phase = "WAITING_STUDENT_AFTER_TA";
  } else {
    // Step 3: Instructor concludes
    const resp =
      "Chính xác! Giảng viên xác nhận: Attention giải quyết triệt để điểm nghẽn biểu diễn của RNN bằng cách tính toán tương quan động all-to-all giữa Query và Key, không phụ thuộc khoảng cách từ [transcript-06, lines 12-16, lines 21-27]. Bây giờ, mời học viên hãy tổng kết lại ngắn gọn để chính thức hoàn thành buổi học.";
    session.messages.push({
      id: `msg_${session.messages.length}`,
      turn: currentTurn,
      sender: "INSTRUCTOR",
      sender_name: scenario.instructor_name,
      content: resp,
      citation: "transcript-06, lines 12-16",
      timestamp: new Date().toISOString(),
    });
    session.learning_evidence.instructor_feedback.push({
      turn: currentTurn,
      message: resp,
    });
    session.phase = "WAITING_FINAL_EXPLANATION";
  }

  session.current_turn += 1;
  return session;
}
