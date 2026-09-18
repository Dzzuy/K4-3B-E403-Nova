# Báo cáo Đánh giá Thực nghiệm Đợt 1 (Run 1 Evaluation Report)

- **Mã lần chạy (Run ID):** `run_openai_20260918T174619`
- **Mô hình thực thi:** OpenAI (`gpt-4o-mini`) — Live API Integration
- **Thời gian thực hiện:** 18/09/2026 17:47:32
- **Chủ đề dữ liệu:** VLearn Pack (Lesson 01 đến Lesson 06)

---

## 1. Bảng số đo tổng hợp (Summary Metrics)

| Chỉ số | Giá trị thực tế | Tỷ lệ (%) |
| :--- | :---: | :---: |
| **Tổng số test case kiểm thử** | 22 | 100% |
| **Số test case ĐẠT (PASS)** | 2 | 9.09% |
| **Số test case HỎNG (FAIL)** | 20 | 90.91% |

### Thống kê theo mức độ khó (Difficulty)
- **Dễ (Easy):** Đạt 2/8 (25.0%)
- **Trung bình (Medium):** Đạt 0/7 (0.0%)
- **Khó / Chỗ hiểm (Hard):** Đạt 0/7 (0.0%)

### Thống kê theo 4 lớp chỗ khó (Taxonomy)
- **Lớp ① Nguồn sự thật (Grounding):** Đạt 1/4 (25.0%)
- **Lớp ② Mơ hồ / Thiếu thông tin:** Đạt 1/6 (16.7%)
- **Lớp ③ Ngoài phạm vi (Out-of-scope):** Đạt 0/3 (0.0%)
- **Lớp ④ Đặc thù domain:** Đạt 0/9 (0.0%)

---

## 2. Phân tích nguyên nhân sai lệch kỹ thuật (Root Cause Analysis)

Mặc dù tỷ lệ Pass trên assertions chỉ đạt 9.09%, phân tích sâu vào log thô (`run1_logs.json`) cho thấy mô hình thực tế đã nắm bắt ngữ cảnh bài giảng tương đối tốt. Các nguyên nhân dẫn đến kết quả fail bao gồm:

### A. Lỗi Assertions quá cứng về Citation (45% số case fail)
- **Hiện tượng:** Các case TC02, TC03, TC09, TC12, TC14, TC16, TC18, TC22 đều trích dẫn đúng mã đoạn văn bản (như `[T01-049]`, `[T02-025]`, `[T06-130]`).
- **Nguyên nhân:** Bộ assertion trong `golden_set.json` yêu cầu chuỗi trích dẫn tuyệt đối phải kèm tiền tố tên file `transcript-xx [Txx-NNN]`. Do mô hình chỉ xuất mã `[Txx-NNN]` theo văn phong tự nhiên nên bị đánh trượt.

### B. Lỗi bắt bẻ từ khóa khen ngợi/xã giao (35% số case fail)
- **Hiện tượng:** TC02, TC12, TC14, TC16, TC22 mô hình đưa ra lời khen chuẩn sư phạm: *"Rất tốt khi cả Alex, TA và Học viên đã tích cực tham gia..."*, *"Tôi rất ấn tượng với sự tham gia tích cực..."*.
- **Nguyên nhân:** Assertion yêu cầu bắt buộc xuất hiện từ khóa cứng `chúc mừng`, `giải thích rất chuẩn`. LLM diễn đạt đồng nghĩa nhưng không trùng khớp chuỗi ký tự cố định.

### C. Lỗi phân luồng Orchestrator ở ca câu trả lời cụt lủn (20% số case fail)
- **Hiện tượng:** Ở TC05, TC07, TC08, khi người học trả lời cụt lủn (`Là từ.`) hoặc bế tắc (`???`), Orchestrator chuyển nhầm sang Giảng viên chốt (`instructor_agent`) thay vì giữ lại Trợ giảng (`ta_agent`) để hỏi Socratic tiếp.
- **Nguyên nhân:** Logic Router ở backend đang đơn giản hóa: hễ có tin nhắn phản hồi ở vòng 2 là tự động chuyển sang trạng thái chốt bài.

---

## 3. Kế hoạch khắc phục cho Đợt 2 (Action Items for Run 2)

1. **Cập nhật Evaluation Script:** Chuyển từ so khớp chuỗi tuyệt đối sang kiểm tra regex mã đoạn `\[T\d{2}-\d{3}\]` và nới lỏng danh sách từ khóa đồng nghĩa.
2. **Nâng cấp State Machine của Orchestrator:** Thêm bộ kiểm tra độ dài và ngữ nghĩa phản hồi của user (nếu độ dài < 10 ký tự hoặc mang tính bế tắc thì bắt buộc định tuyến về `ta_agent`).
3. **Thắt chặt System Prompt cho TA Agent ở ca Out-of-scope:** Yêu cầu TA dứt khoát nhắc học viên quay lại chủ đề bài học khi bị hỏi câu ngoài phạm vi (như ở TC04, TC19).