# Template AI Spec *(spec.md — commit trước hạn chốt spec: 21:00 18/9, tại CP4 · quality bar chốt từ thời điểm nộp)*

> Cấu trúc phủ đúng "SPEC 8 phần" của chương trình: Bằng chứng (§1-§2) · Lát cắt (§4) · Canvas (đính kèm CP1) · Augment/Automate (§4) · 4 đường đi của trải nghiệm (§6) · Kiểu lỗi (§5) · Kiểm thử (§7) · Phân công (§8). Hướng dẫn viết từng mục: `02-guide.md`.

```markdown
# AI SPEC — [Tên lát cắt] · Nhóm [XX] · Zone [X]
Hướng: [ ] A — VLearn  [ ] B — Trợ lý Học viên  [ ] C — Làn mở
Loại: [ ] Tối ưu tính năng có sẵn  [ ] Tính năng mới

## §1. User & Job
- Job executor + workflow (đính kèm worksheet JTBD / ảnh sơ đồ):
- Core JTBD (không tên sản phẩm/AI trong câu):
- Problem statement (KHÔNG chữ AI):
- Evidence (chuẩn A và/hoặc B — log đầy đủ trong repo):
  - Số liệu mining / kết quả khảo sát (n = ?, % xác nhận):
  - ≥5 quote/ví dụ nguyên văn + nguồn:

## §2. Impact & quyết định chọn
- Bảng impact ≥3 ứng viên (bao nhiêu người · tần suất · tốn gì mỗi lần · khả thi):
- Ứng viên ĐÃ LOẠI + vì sao:
- Ứng viên CHỌN + vì sao (bằng số):

## §3. Giải pháp tương tự đã nghiên cứu
- [Sản phẩm 1]: flow / đáng học / đáng né / mình khác gì
- [Sản phẩm 2]: ...

## §4. Thiết kế
- Lát cắt MỘT CÂU (1 user · 1 việc · 1 quyết định AI · 1 kết quả):
  Học viên chọn ôn khái niệm "Attention Mechanism" từ Slide 06 → AI Peer Agent đưa ra cách hiểu sai kinh điển → Học viên gửi lập luận phản biện → Hệ thống phân loại đúng/sai để điều phối (TA gợi ý Socratic nếu sai, Giảng viên chốt kiến thức có trích dẫn nếu đúng) → Học viên làm chủ khái niệm và hoàn thành phiên học.
- Non-goals (≥3 thứ KHÔNG build):
  1. Không xây dựng tính năng voice/audio call trực tiếp với agent (chỉ tập trung tương tác văn bản đa tác tử).
  2. Không build hệ thống chấm điểm tự do ngoài phạm vi tài liệu bài giảng được nạp sẵn (`data/vlearn-pack/`).
  3. Không tạo agent mạo danh danh tính giảng viên thật của trường; mọi agent đều có nhãn "AI Simulation".
- Mức prototype nhắm tới: [ ] Sketch  [x] Mock  [ ] Working – phần nào mock, phần nào thật:
  - Phần Mock: Toàn bộ phản hồi của Peer Agent, TA Agent và Giảng viên được giả lập (cố định kịch bản hội thoại chuẩn cho khái niệm Attention) để kiểm thử luồng tương tác và giao diện.
  - Phần Thật: Cấu trúc chia luồng chat 3 bên, cơ chế hiển thị pop-up trích dẫn tài liệu gốc (Citation popup), khung nhập liệu và các nút thao tác điều khiển giao diện (Sửa câu, Xem căn cứ).
- Automation: [ ] augment  [x] conditional  [ ] automate – lý do theo cost-of-error:
  - Chi phí sai sót (Cost-of-error) trong giáo dục là rất cao: Nếu để Automate hoàn toàn, Peer Agent đưa ra thông tin sai quá thuyết phục hoặc TA Agent hallucinate sẽ khiến học viên tiếp thu sai lệch bản chất kiến thức (hậu quả lâu dài, sửa rất đắt). 
  - Chọn **Conditional**: AI chỉ tự động hóa đối thoại khi các phát biểu được neo chặt chẽ (grounded) vào Slide 06 và Transcript bài học. Khi học viên đi chệch phạm vi (out-of-scope) hoặc bế tắc liên tục, hệ thống chuyển sang chế độ khóa lượt nói hoặc kích hoạt tài liệu chuẩn của Giảng viên để đối chiếu.
- §4b. Nguyên tắc đã áp dụng (≥4 – HAX/PAIR, xem guide):

| Nguyên tắc | Áp cụ thể vào đâu trong prototype |
| :--- | :--- |
| **G10 (Bắt buộc) – Thu hẹp phạm vi khi nghi ngờ** | Áp dụng ở **Bước 15–16 (Nhánh 3)**: Khi học viên hỏi câu ngoài bài học hoặc yêu cầu "cho đáp án luôn", TA Agent từ chối trả lời lan man và chủ động thu hẹp ngữ cảnh: *"Chúng ta chỉ tập trung vào cơ chế Self-Attention trong Slide 06, bạn hãy nhận xét câu của bạn trước"*. |
| **G11 – Giải thích vì sao** | Áp dụng ở **Bước 10 (Nhánh 1)**: Thông điệp chốt kiến thức của Giảng viên ảo luôn đi kèm nhãn/badge trích dẫn nguồn cụ thể. |
| **G9 – Sửa dễ dàng** | Áp dụng ở **Bước 17–18 (Nhánh 4)**: Cung cấp nút thao tác nhanh trên giao diện cho phép học viên sửa lại câu phản biện vừa gõ nếu bị nhầm lẫn mà không bị tính là một lượt hiểu sai. |
| **G8 – Gạt bỏ dễ dàng** | Áp dụng ở giao diện trò chuyện: Học viên có thể ấn nút "Bỏ qua gợi ý của Trợ giảng" để tiếp tục tự suy luận và đối chất trực tiếp với Peer Agent. |

---

## §5. Kiểu lỗi — 4 lớp chỗ khó + kịch bản (≥8) [bảng theo guide §2.5]

## §6. Bốn đường đi của trải nghiệm
- Happy path:
  - Peer Agent nêu hiểu sai: *"Attention là mô hình tự động bỏ qua toàn bộ các từ phụ trong câu?"* (Bước 5).
  - Học viên phản biện đúng: *"Không đúng, Attention gán trọng số (weights) cho từng từ để tính độ liên quan chứ không hề loại bỏ từ nào"*.
  - Peer Agent nhận sai: *"À mình hiểu rồi! Hóa ra là tính trọng số chứ không bỏ từ nào"* (Bước 8).
  - Giảng viên ảo xuất hiện chốt chuẩn hóa kiến thức (kèm trích dẫn Slide 06), đặt 1 câu hỏi mở rộng tư duy và hệ thống ghi nhận Mastery (Bước 10–11).
- Low-confidence (Chỗ khó / Cả hai cùng sai / Học viên bế tắc):
  - Học viên đồng ý với cái sai của bạn học hoặc trả lời mơ hồ: *"Chắc là đúng rồi, bỏ từ đi cho nhẹ máy"*.
  - Bộ điều phối (Orchestrator) lập tức **khóa lượt nói của Peer Agent** để tránh gây nhiễu thêm (Bước 12).
  - TA Agent can thiệp bằng câu hỏi gợi mở Socratic: *"Nếu bỏ hẳn từ phụ, câu 'not bad' sẽ bị dịch thế nào? Bạn hãy xem lại công thức tính trọng số ở Slide 06 nhé"* (Bước 14) → Học viên đọc gợi ý để suy nghĩ lại.
- Failure/không căn cứ (No-grounding) · Khi bị đòi ngoài phạm vi:
  - Học viên gõ: *"Mai thi phòng nào?"* hoặc *"Cho luôn đáp án đi, lười nghĩ quá"*.
  - Hệ thống kích hoạt bộ lọc phạm vi (G10); TA Agent phản hồi lịch sự từ chối và hướng sự tập trung quay lại phân tích câu nói của Peer Agent (Bước 16).
- Correction (user sửa trực tiếp) · Case đặc thù domain:
  - Học viên bấm nút *"Xem tài liệu gốc"* trên thanh công cụ hỗ trợ.
  - Hệ thống mở pop-up hiển thị nguyên văn đoạn trích Slide 06 và Transcript bài giảng để học viên đọc đối chiếu trực tiếp trước khi gửi lại câu trả lời (Bước 17–18).
  - Peer Agent buộc phải được sửa đúng trước khi phiên học đóng lại hoàn toàn, đảm bảo học viên không rời đi với kiến thức sai lệch.

## §7. Kiểm thử
- Chiều chất lượng + định nghĩa kiểm chứng được:
- Golden set (≥20 case theo cơ cấu trong guide §2.6, file trong eval/):
- Quality bar (chốt từ hạn chốt spec của khoá, giữ nguyên sau đó): "Đạt khi ≥ ___% qua bộ, và ___"
- Kết quả các lượt chạy (bảng % — cập nhật đến trước CP6):

## §8. Phân công & kế hoạch
- Phân công có tên: spec / evidence / prompt / code / demo
- Willing users (≥2 tên) + kế hoạch vòng validation *(bonus, nếu làm)*:
- Multi-prototype (nếu làm): trục khác biệt của ≥2 phương án + lý do chọn:

## §9. Changelog
| Thời điểm | Đổi gì | Vì sao (trỏ về feedback/case nào) |
```
