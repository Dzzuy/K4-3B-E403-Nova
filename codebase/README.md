# 🎓 Mô phỏng Lớp học Multi-Agent (Track D1)

Đây là ứng dụng CLI Chat tương tác mô phỏng một phòng học với nhiều AI Agent đóng vai trò khác nhau (Trợ giảng, Giảng viên, Bạn học Alex). Hệ thống sử dụng **LangGraph** để xây dựng luồng hội thoại và **RAG (Retrieval-Augmented Generation)** để trích xuất kiến thức từ các file bài giảng.

## 🌟 Tính năng chính

- **Chế độ 1 - Hỏi Trợ giảng (ASK_TA):** Bạn đặt câu hỏi, Trợ giảng (TA) sẽ dùng phương pháp Socratic để gợi mở tư duy (không đưa đáp án trực tiếp). Sau khi bạn trả lời, Giảng viên sẽ xuất hiện chốt lại kiến thức cùng trích dẫn RAG chính xác.
- **Chế độ 2 - Ôn bài với Bạn học (REVIEW_CONCEPT):** Bạn nhập một khái niệm. Bạn học "Alex" sẽ tung ra một câu phát biểu sai hoặc hiểu nhầm. Nhiệm vụ của bạn là giải thích lại cho Alex. Bộ chấm điểm (Evaluator Node) sẽ kiểm tra câu trả lời của bạn, nếu đúng thì Giảng viên chốt, nếu sai TA sẽ nhảy vào gợi ý.

## 📂 Cấu trúc thư mục

```text
K4-3B-E403-Nova/
├── data/vlearn-pack/transcript/ # Chứa các file markdown bài giảng (RAG Data)
├── codebase/
│   ├── agents/                  # Code của các Agent: TA, Instructor, Peer, Evaluator
│   ├── data_loader/             # Module xử lý RAG (rag_retriever.py)
│   ├── graph/                   # Chứa luồng LangGraph (builder.py)
│   ├── providers/               # Khởi tạo mô hình ngôn ngữ OpenAI/Gemini (llm.py)
│   ├── state/                   # Quản lý State của LangGraph
│   ├── .env                     # (Tự tạo) Chứa API Key
│   ├── requirement.txt          # Danh sách thư viện cần thiết
│   └── cli_chat.py              # File chạy chính của ứng dụng
└── README.md                    # File hướng dẫn này
```

## 🚀 Hướng dẫn cài đặt và chạy (Dành cho Teammate)

### 1. Cài đặt môi trường
Đảm bảo bạn đã cài đặt Python 3.9+. Khuyên dùng virtual environment (venv hoặc conda).

Mở terminal tại thư mục gốc của project (chứa file `requirement.txt`) và chạy lệnh cài đặt thư viện:
```bash
cd codebase
pip install -r requirement.txt
```

### 2. Cấu hình API Key
1. Tạo một file `.env` nằm trong thư mục `codebase/` (nếu chưa có).
2. Thêm khóa API (OpenAI hoặc Gemini) vào file `.env` như sau:

```env
OPENAI_API_KEY="sk-..."
# Hoặc nếu dùng Gemini:
# GEMINI_API_KEY="AIzaSy..."
```
*(Hệ thống sẽ ưu tiên dùng OpenAI `gpt-4o-mini` nếu có OPENAI_API_KEY. Nếu không có key, nó sẽ dùng Mock LLM tĩnh (dữ liệu giả) để test code).*

### 3. Khởi chạy Ứng dụng
Tại thư mục gốc, hãy gọi lệnh chạy file `cli_chat.py`:

```bash
python .\codebase\cli_chat.py
```

Khi chạy thành công, bạn sẽ thấy log hệ thống ghi `[HỆ THỐNG] Đã kết nối thành công với API...`.

### 4. Các lệnh tương tác trong ứng dụng
Khi đang chat với hệ thống, bạn có thể nhập các lệnh sau:
- `/lesson <1-6>`: Đổi dữ liệu RAG sang bài học khác (VD: `/lesson 2`)
- `/mode <1 hoặc 2>`: Đổi chế độ học (1 = Hỏi TA, 2 = Dạy lại bạn học Alex)
- `/rag`: Bật/Tắt việc hiển thị văn bản bài giảng trích xuất lên màn hình (để dễ đối chiếu)
- `/quit` hoặc `/exit`: Thoát chương trình

## 🛠 Flow của Hệ thống (LangGraph)
Mô hình Graph của project có 2 luồng nhánh rẽ linh hoạt:
- Nhánh `ASK_TA`: `btn1_ta_guide` ➡️ Chờ User Reply ➡️ `instructor_conclusion`
- Nhánh `REVIEW_CONCEPT`: `btn2_peer_misconception` ➡️ Chờ User Reply ➡️ `evaluator_node`
  - Nếu `CORRECT` ➡️ `instructor_conclusion`
  - Nếu `INCORRECT` ➡️ `ta_socratic` ➡️ Chờ User Reply lần 2 ➡️ `instructor_conclusion`
