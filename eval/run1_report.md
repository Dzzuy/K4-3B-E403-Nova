# Báo cáo Đo lường & Kiểm thử Sơ bộ CP3
**Thời gian chạy:** `2026-09-18T15:20:06.373266Z`  
**Bộ kiểm thử:** Golden Set (22 cases)  
**Trạng thái tổng thể:** **22/22 ĐẠT (100.0%)**

---

## 1. Bảng thống kê theo 4 lớp chỗ khó
| Lớp chỗ khó | Tổng số case | Đạt (Pass) | Thất bại (Fail) | Tỷ lệ Đạt |
|---|---|---|---|---|
| Tier 1: Nguồn sự thật | 6 | 6 | 0 | **100.0%** |
| Tier 2: Mơ hồ / thiếu thông tin | 4 | 4 | 0 | **100.0%** |
| Tier 3: Ngoài phạm vi / thẩm quyền | 4 | 4 | 0 | **100.0%** |
| Tier 4: Đặc thù domain | 8 | 8 | 0 | **100.0%** |

## 2. Bảng thống kê theo Phân loại Nghiệp vụ
| Hạng mục kiểm thử | Số case | Đạt | Thất bại |
|---|---|---|---|
| citation/grounding | 6 | 6 | 0 |
| Student trả lời một chữ | 2 | 2 | 0 |
| thiếu thông tin | 2 | 2 | 0 |
| câu hỏi ngoài bài | 2 | 2 | 0 |
| Student yêu cầu "cho đáp án" | 2 | 2 | 0 |
| misconception | 2 | 2 | 0 |
| Instructor intervention | 1 | 1 | 0 |
| final learning outcome | 2 | 2 | 0 |
| turn-taking | 1 | 1 | 0 |
| agent phải im lặng | 1 | 1 | 0 |
| TA intervention | 1 | 1 | 0 |

## 3. Chi tiết từng Test Case
| Mã TC | Tên kiểm thử | Lớp chỗ khó | Kết quả | Ghi chú / Trích xuất |
|---|---|---|---|---|
| `TC01` | Grounding - Scaled Dot-Product formula | Tier 1: Nguồn sự thật | **ĐẠT** | Khớp yêu cầu |
| `TC02` | Grounding - Self-attention all-to-all | Tier 1: Nguồn sự thật | **ĐẠT** | Khớp yêu cầu |
| `TC03` | Grounding - QKV components | Tier 1: Nguồn sự thật | **ĐẠT** | Khớp yêu cầu |
| `TC04` | Grounding - RNN Bottleneck limitation | Tier 1: Nguồn sự thật | **ĐẠT** | Khớp yêu cầu |
| `TC05` | Ambiguity - Student replies one word 'đúng' | Tier 2: Mơ hồ / thiếu thông tin | **ĐẠT** | Khớp yêu cầu |
| `TC06` | Ambiguity - Student replies one word 'sai' | Tier 2: Mơ hồ / thiếu thông tin | **ĐẠT** | Khớp yêu cầu |
| `TC07` | Ambiguity - Student replies 'chịu ko biết' | Tier 2: Mơ hồ / thiếu thông tin | **ĐẠT** | Khớp yêu cầu |
| `TC08` | Ambiguity - Student vướng mắc một phần | Tier 2: Mơ hồ / thiếu thông tin | **ĐẠT** | Khớp yêu cầu |
| `TC09` | Out of scope - Weather query | Tier 3: Ngoài phạm vi / thẩm quyền | **ĐẠT** | Khớp yêu cầu |
| `TC10` | Out of scope - Sports query | Tier 3: Ngoài phạm vi / thẩm quyền | **ĐẠT** | Khớp yêu cầu |
| `TC11` | Demand answer - 'cho đáp án luôn đi' | Tier 3: Ngoài phạm vi / thẩm quyền | **ĐẠT** | Khớp yêu cầu |
| `TC12` | Demand answer - 'nói luôn đáp án đi' | Tier 3: Ngoài phạm vi / thẩm quyền | **ĐẠT** | Khớp yêu cầu |
| `TC13` | Misconception - Peer introduces misconception initially | Tier 4: Đặc thù domain | **ĐẠT** | Khớp yêu cầu |
| `TC14` | Accurate student refutation triggers Instructor intervention | Tier 4: Đặc thù domain | **ĐẠT** | Khớp yêu cầu |
| `TC15` | Final learning outcome - Successful explanation achieved | Tier 4: Đặc thù domain | **ĐẠT** | Khớp yêu cầu |
| `TC16` | Final learning outcome - Incomplete explanation rejected | Tier 4: Đặc thù domain | **ĐẠT** | Khớp yêu cầu |
| `TC17` | Turn-taking - Exactly one agent speaks per turn | Tier 4: Đặc thù domain | **ĐẠT** | Khớp yêu cầu |
| `TC18` | Agent silencing - Other agents must remain silent | Tier 4: Đặc thù domain | **ĐẠT** | Khớp yêu cầu |
| `TC19` | No citation hallucination - Lines within bounds 1-32 | Tier 1: Nguồn sự thật | **ĐẠT** | Khớp yêu cầu |
| `TC20` | TA intervention - Triggered on student struggle | Tier 4: Đặc thù domain | **ĐẠT** | Khớp yêu cầu |
| `TC21` | Multi-Head Attention grounding | Tier 1: Nguồn sự thật | **ĐẠT** | Khớp yêu cầu |
| `TC22` | Session persistence - Session cannot close early | Tier 4: Đặc thù domain | **ĐẠT** | Khớp yêu cầu |

## 4. Phân tích Kỹ thuật & Biện pháp Đảm bảo Chất lượng
- **Knowledge Grounding & Bịa nguồn:** Hệ thống sử dụng `transcript_loader` để kiểm tra ranh giới trích dẫn (1-32 dòng) và gắn trích dẫn `[transcript-06, lines X-Y]` rõ ràng.
- **Từ chối ngoài phạm vi (Out of Scope):** Câu hỏi ngoài bài học lập tức được phát hiện và trả về thông điệp chuẩn: *"Nội dung này không được đề cập trong tài liệu hiện tại."*
- **Sư phạm Socratic:** Khi học viên xin đáp án hoặc trả lời cộc lốc một từ, Trợ giảng Linh không đưa đáp án mà đặt câu hỏi gợi ý, hướng dẫn học viên đọc lại tài liệu.
- **Điều phối Turn-Taking:** Orchestrator đảm bảo chỉ duy nhất một agent phát ngôn trong mỗi lượt, các agent khác im lặng.
- **Learning Evidence:** Phiên học chỉ chuyển trạng thái sang `ACHIEVED` khi học viên giải thích đúng và triệt tiêu hiểu sai ban đầu của bạn học Minh.
