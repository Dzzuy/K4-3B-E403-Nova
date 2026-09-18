export interface SlideCodeSnippet {
  language: string;
  code: string;
}

export interface SlideDiagram {
  type: string;
  title: string;
  description: string;
}

export interface Slide {
  id: number;
  slide_number: number;
  title: string;
  subtitle?: string;
  concept: string;
  content: string;
  bullet_points: string[];
  key_takeaway: string;
  source_lines: [number, number];
  source_citation: string;
  source_excerpt: string;
  code_snippet?: SlideCodeSnippet;
  diagram?: SlideDiagram;
  sample_questions?: string[];
}

export interface LessonSlidesResponse {
  lesson_id: string;
  lesson_title: string;
  source_file?: string;
  total_lines?: number;
  mode?: string;
  total_slides: number;
  estimated_reading_time?: string;
  slides: Slide[];
}

export interface SlideContextPayload {
  lesson_id?: string;
  slide_id?: number | string;
  slide_title?: string;
  slide_content?: string;
  user_message?: string;
}

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

export interface SummaryData {
  session_id: string;
  lesson_id: string;
  lesson_title: string;
  student_name: string;
  status: "IN_PROGRESS" | "ACHIEVED";
  total_turns: number;
  peer_name?: string;
  difficulty_level?: number;
  misconception_resolved: boolean;
  initial_understanding: string;
  misconception: string;
  student_responses: Array<{ turn: number; content: string; timestamp: string }>;
  ta_interventions: Array<{ turn: number; type: string; message: string }>;
  instructor_feedback: Array<{ turn: number; message: string }>;
  final_explanation: string;
  learning_outcome: string;
  citations_used: string[];
}

export interface LessonLine {
  line_number: number;
  text: string;
}

export interface LessonData {
  lesson_id: string;
  title: string;
  total_lines: number;
  lines: LessonLine[];
}

export interface ScenarioData {
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

export async function checkBackendHealth(): Promise<{ online: boolean; source: "fastapi" | "internal"; error?: string }> {
  try {
    const res = await fetch("/api/health", { method: "GET", cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      return { online: true, source: data.source === "fastapi" ? "fastapi" : "internal" };
    }
  } catch (err: any) {
    return { online: false, source: "internal", error: err.message };
  }
  return { online: true, source: "internal" };
}

export async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Lỗi máy chủ (${res.status})`);
  }

  return await res.json();
}

export const api = {
  startSession: (studentName: string, lessonId: string = "transcript-06", peerId: string = "milo") =>
    apiFetch<SessionData>("/api/session/start", {
      method: "POST",
      body: JSON.stringify({ student_name: studentName, lesson_id: lessonId, peer_id: peerId }),
    }),

  sendMessage: (sessionId: string, content: string, slideContext?: SlideContextPayload) =>
    apiFetch<SessionData>(`/api/session/${sessionId}/message`, {
      method: "POST",
      body: JSON.stringify({ content, ...(slideContext || {}) }),
    }),

  getLessonSlides: (lessonId: string = "transcript-06", mode: string = "detailed") =>
    apiFetch<LessonSlidesResponse>(`/api/lesson/${lessonId}/slides?mode=${mode}`),

  parseSlidesFromFile: (text: string, filename: string = "custom.txt") =>
    apiFetch<LessonSlidesResponse>("/api/slides/parse-file", {
      method: "POST",
      body: JSON.stringify({ text, filename }),
    }),

  getSession: (sessionId: string) =>
    apiFetch<SessionData>(`/api/session/${sessionId}`),

  getSessionSummary: (sessionId: string) =>
    apiFetch<SummaryData>(`/api/session/${sessionId}/summary`),

  getLesson: (lessonId: string = "transcript-06") =>
    apiFetch<LessonData>(`/api/lesson/${lessonId}`),

  getScenario: () =>
    apiFetch<ScenarioData>("/api/scenario"),

  updateScenario: (data: Partial<ScenarioData>) =>
    apiFetch<ScenarioData>("/api/scenario", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
