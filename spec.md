# AI SPEC — Attention Peer Challenge · Nhóm Nova · E403

**Track:** D1 — Lớp học mô phỏng đa tác tử trên VLearn  
**Topic MVP:** Attention Mechanism — Slide/Transcript 06  
**Prototype hiện tại:** Working MVP cho CP3  
**Ngày cập nhật:** 18/09/2026

---

## §1. User & Job

### Job executor

Học viên VLearn đang tự ôn một khái niệm trong bài học và muốn kiểm tra xem mình có thực sự hiểu đúng hay không.

### Core JTBD

Khi tự ôn một khái niệm sau buổi học, học viên muốn có một tình huống buộc mình phải giải thích và phản biện lại kiến thức để phát hiện chỗ hiểu sai trước khi chuyển sang nội dung tiếp theo.

### Problem statement

Học viên học một mình nên thiếu tình huống phản biện và sửa sai; khi tự hiểu sai một khái niệm, không có cơ chế buộc họ giải thích lại để phát hiện lỗi.

### Evidence ban đầu

Evidence CP1 hiện được ghi trong `canvas.md`:

- Phỏng vấn nhanh 6 học viên VLearn ngoài nhóm.
- 5/6 nói từng học xong nhưng vẫn không chắc mình hiểu đúng.
- 4/6 muốn có người phản biện lại thay vì chỉ đọc đáp án.
- Quote được ghi nhận:

> "Mình hay tưởng là hiểu rồi, tới lúc bị hỏi giải thích trực tiếp hoặc làm test mới thấy bị sai."

**Lưu ý:** đây là evidence ban đầu từ CP1. Việc chuẩn hoá full interview/mining log tiếp tục ở CP4/CP5.

---

## §2. Impact & quyết định chọn

Lát cắt được chọn cho hackathon là việc **kiểm tra mức hiểu thật bằng phản biện** thay vì chỉ đọc lại nội dung.

Lý do chọn:

1. Pain đã xuất hiện trong phỏng vấn CP1.
2. Có thể demo trong một phiên rất ngắn.
3. Có một quyết định AI trung tâm đo được: đánh giá lập luận của học viên là đúng hay chưa đạt.
4. Có thể xây golden set để đo định lượng.
5. Phù hợp với Track D1 — lớp học mô phỏng đa tác tử.

Bảng impact ≥3 ứng viên và các ứng viên bị loại sẽ được hoàn thiện ở CP4. Không sử dụng dữ liệu chưa có để bổ sung giả vào CP3.

---

## §3. Giải pháp / hướng thiết kế tham khảo

MVP dùng cách học qua:

- Peer misconception: bạn học ảo đưa ra một cách hiểu sai.
- Learner explanation: học viên phải phản biện bằng lời của mình.
- Socratic support: TA chỉ gợi ý nếu học viên chưa giải thích đúng.
- Instructor validation: khi học viên trả lời đạt, Instructor chốt lại kiến thức.

Mục tiêu của MVP không phải tạo chatbot hỏi đáp tổng quát mà tạo **learning loop có phản biện và sửa sai**.

Nghiên cứu competitor/product đầy đủ sẽ được bổ sung ở CP4.

---

## §4. Thiết kế

### Lát cắt một câu

Một học viên VLearn ôn **Attention Mechanism** → AI Peer đưa ra một cách hiểu sai → học viên phản biện → AI Evaluator đánh giá câu trả lời bằng model thật → nếu đúng thì Instructor chốt kiến thức, nếu chưa đúng thì TA đưa gợi ý Socratic → giao diện hiển thị kết quả cho học viên.

### Flow CP3 đang chạy

```text
Start Attention session
        ↓
Peer Agent tạo misconception
        ↓
Học viên nhập phản biện
        ↓
REAL LLM Evaluator
        ↓
   CORRECT / INCORRECT
      │          │
      │          └──→ TA Socratic → IN_PROGRESS
      │
      └──→ Instructor → ACHIEVED
```

### Quyết định AI trung tâm

Central decision hiện tại:

```text
student response
→ evaluator_agent.py
→ OpenRouter openai/gpt-4.1-mini
→ CORRECT / INCORRECT
```

Đây là lời gọi AI thật, không phải keyword rule hoặc hard-coded result.

### Non-goals

1. Không voice/audio call.
2. Không authentication/database production.
3. Không build tutor tổng quát cho mọi môn.
4. Không vector database ở CP3.
5. Không animation/rigging nhân vật phức tạp.
6. Không mạo danh giảng viên thật; agent chỉ là AI Simulation.

### Mức prototype

- [ ] Sketch
- [ ] Mock
- [x] Working MVP

### Phần REAL hiện tại

- Peer Agent gọi LLM thật.
- Evaluator Agent gọi OpenRouter thật.
- TA Agent gọi LLM thật.
- Instructor Agent gọi LLM thật.
- RAG/retriever lấy context bài học.
- FastAPI backend nhận request từ frontend.
- Next.js frontend gọi backend.
- Evaluator ghi trace AI thực tế.
- Demo correct/incorrect đã smoke-test end-to-end.

### Phần còn giới hạn / chưa hoàn thiện

- Evaluator CP3 hiện mới dùng hai nhãn `CORRECT` và `INCORRECT`.
- Chưa có dedicated `OFF_SCOPE` route trong production MVP.
- Chưa có full retry loop nhiều lượt trong LangGraph.
- Một số secondary frontend route vẫn giữ local/static fallback của prototype cũ.
- Một số UI action như source/edit chưa được dùng làm central AI decision.
- LangGraph hiện xử lý phần agent flow nền; emergency FastAPI integration điều phối learner turn bằng evaluator + agent functions để kịp CP3.

### Automation

**Conditional automation.**

AI được phép tự tạo phản hồi và đánh giá trong phạm vi bài Attention, nhưng sản phẩm không tự quyết định hành động ngoài phạm vi lớp học.

Cost-of-error trong giáo dục cao: nếu Peer hoặc TA tạo kiến thức sai mà không được sửa, học viên có thể rời phiên với misconception.

---

## §4b. HAX / PAIR principles

| Nguyên tắc | Áp dụng |
|---|---|
| G10 — Scope khi nghi ngờ | Có golden cases kiểm tra câu hỏi ngoài phạm vi; dedicated production route chưa hoàn thiện ở CP3 |
| G11 — Explain why / evidence | Instructor prompt yêu cầu grounding/citation từ tài liệu RAG |
| G9 — Easy correction | UI hỗ trợ học viên gửi lại câu giải thích; full edit workflow còn ở mức prototype |
| G8 — Easy dismissal | Hint không khoá người dùng khỏi việc tiếp tục trả lời |

---

## §5. Kiểu lỗi — 4 lớp chỗ khó

Golden set hiện dùng 4 taxonomy chính.

| Lớp | Số case | Ví dụ |
|---|---:|---|
| 1. Nguồn sự thật | 5 | Citation giả, hiểu sai kiến thức trong source |
| 2. Mơ hồ / thiếu thông tin | 5 | Chỉ nói "sai rồi", giải thích thiếu |
| 3. Ngoài phạm vi / thẩm quyền | 5 | Hỏi deadline, thời tiết, jailbreak viết thơ |
| 4. Đặc thù domain | 7 | Q/K/V, Softmax, Self-Attention, scaled dot-product |

Ví dụ hard scenarios trong golden set:

1. TC03 — trích dẫn giả "Slide 99".
2. TC04 — kích thước Query/Key.
3. TC06 — hiểu sai việc Attention bỏ từ.
4. TC08 — mơ hồ, không chỉ ra trọng tâm.
5. TC13 — câu hỏi thời tiết ngoài bài.
6. TC15 — prompt injection viết thơ.
7. TC17 — nhầm thứ tự Q/K/V.
8. TC22 — chỉ nói "dùng Softmax" nhưng thiếu giải thích.

File nguồn: `eval/golden_set.json`

---

## §6. Bốn đường đi của trải nghiệm

### 1. Happy path — đã chạy trong CP3

Peer đưa misconception → học viên phản biện đúng → Evaluator trả `CORRECT` → Instructor chốt → session `ACHIEVED`.

Smoke test:

> Không đúng, Attention không xóa từ mà gán trọng số theo mức độ liên quan.

Kết quả: PASS.

### 2. Low-confidence / learner chưa hiểu — đã chạy trong CP3

Peer đưa misconception → học viên đồng ý hoặc giải thích sai → Evaluator trả `INCORRECT` → TA Socratic → session vẫn `IN_PROGRESS`.

Smoke test:

> Đúng rồi, Attention bỏ hết các từ không quan trọng.

Kết quả: PASS.

### 3. Failure / ngoài phạm vi

Golden set có các case TC11–TC15.

MVP CP3 chưa có dedicated `OFF_SCOPE` branch production. Baseline cho thấy đây là nhóm lỗi yếu nhất: 0/5 case pass.

Đây là failure đã được ghi nhận để cải thiện sau CP3, không che giấu.

### 4. Correction

Thiết kế cho phép học viên xem lại tài liệu và gửi lại câu giải thích.

Golden set có UI-action cases như `VIEW_SOURCE` và `EDIT_PREVIOUS_MSG`.

Full correction loop chưa phải central flow được hoàn thiện trong emergency CP3 MVP.

---

## §7. Kiểm thử

### Golden set

File: `eval/golden_set.json`

Tổng: **22 cases**

Phân bố taxonomy:

| Category | Cases |
|---|---:|
| Nguồn sự thật | 5 |
| Mơ hồ / thiếu thông tin | 5 |
| Ngoài phạm vi | 5 |
| Đặc thù domain | 7 |

Phân bố difficulty thực tế:

| Difficulty | Cases |
|---|---:|
| Easy | 7 |
| Medium | 10 |
| Hard | 5 |

Case source theo field hiện tại:

- `chatlog_mining`: 16
- `synthetic`: 6

Các provenance này là metadata do người viết case khai báo; chưa coi là independently verified nếu chưa có source log đối chiếu trong repo.

### Định nghĩa một test case "ĐẠT"

Một test case được tính là PASS khi:

1. System thực hiện đúng behavior/routing mà golden case yêu cầu.
2. Response chứa các concept/keyword bắt buộc của case.
3. Response không chứa behavior/keyword bị cấm.
4. Case cần grounding/citation thì phản hồi phải có evidence phù hợp.
5. Case yêu cầu Socratic guidance thì TA không được biến thành direct-answer bot.

### Run 1 — baseline

Raw run: `codebase/runs/eval_run_openai_20260918T145054.json`

| Metric | Result |
|---|---:|
| Total | 22 |
| Passed | 7 |
| Failed | 15 |
| Pass rate | 31.82% |

By taxonomy:

| Category | Pass |
|---|---:|
| Nguồn sự thật | 3/5 |
| Mơ hồ / thiếu thông tin | 2/5 |
| Ngoài phạm vi | 0/5 |
| Đặc thù domain | 2/7 |

### Failure analysis

1. Out-of-scope handling là điểm yếu lớn nhất: 0/5.
2. Retrieval đôi khi lấy context thuộc Lesson 06 nhưng không đúng đoạn trọng tâm.
3. Một số response thiếu keyword/citation mà golden case yêu cầu.
4. Một số câu Attention trung bình/khó trả lời chưa đủ ý.
5. Baseline runner thời điểm này chưa phải benchmark routing độc lập hoàn hảo; kết quả 7/22 được giữ như **first live baseline**, không quảng cáo thành routing accuracy.

### Web MVP smoke test sau integration

Provider: **OpenRouter**

Model: `openai/gpt-4.1-mini`

- Test A — correct rebuttal: PASS → Instructor → ACHIEVED.
- Test B — incorrect answer: PASS → TA → IN_PROGRESS.
- Evaluator trace: 4 real calls được ghi local trong `codebase/logs/ai_calls.jsonl`.

### Quality bar

Overall product quality bar sẽ được **lock tại CP4 trước vòng tuning tiếp theo**.

Không đặt ngược một threshold sau khi đã nhìn thấy kết quả CP3.

Run 1 là baseline measurement.

---

## §8. Phân công

| Thành viên | Phần việc |
|---|---|
| Phạm Đình Duy | Team lead, system architecture, backend/API integration, LangGraph integration, frontend-backend integration, GitHub, demo |
| Nguyễn Hữu Chương | AI agents, evaluator, RAG/data pipeline, baseline evaluation |
| Phạm Quốc Đạt | Product flow/spec, user evidence, golden cases/evaluation scenarios |
| Võ Trường An | Frontend UI/UX, visual classroom components and interaction |

---

## §9. Changelog

| Thời điểm | Thay đổi | Lý do |
|---|---|---|
| CP1 | Chọn D1 simulated classroom | Pain từ self-study + thiếu phản biện |
| CP2 | Chốt Peer → learner rebuttal → TA/Instructor flow | Có flow bấm/demo được |
| CP3 baseline | Tích hợp AI agents + 22-case golden set | Đo chất lượng bằng output thật |
| CP3 integration | Kết nối frontend An với FastAPI backend | Có web demo end-to-end |
| CP3 integration | Chuyển live provider sang OpenRouter `openai/gpt-4.1-mini` cho web MVP | Có central AI call thật |
| CP3 measurement | Giữ baseline 7/22 thay vì chỉnh số | Báo cáo kết quả thật và failure thật |
