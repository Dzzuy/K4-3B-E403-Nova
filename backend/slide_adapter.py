import re
from typing import Dict, List, Any, Optional
from backend.transcript_loader import transcript_service

class SlideAdapter:
    def __init__(self):
        self._slides_cache: Dict[str, Dict[str, Any]] = {}

    def get_lesson_slides(self, lesson_id: str = "transcript-06", mode: str = "detailed") -> Optional[Dict[str, Any]]:
        cache_key = f"{lesson_id}_{mode}"
        if cache_key in self._slides_cache:
            return self._slides_cache[cache_key]

        if lesson_id != "transcript-06":
            return None

        lines = transcript_service.lines

        def get_excerpt(start: int, end: int) -> str:
            start_idx = max(0, start - 1)
            end_idx = min(len(lines), end)
            return "\n".join(lines[start_idx:end_idx])

        if mode == "overview":
            slides = self._build_7_overview_slides(get_excerpt)
        else:
            slides = self._build_16_detailed_slides(lines, get_excerpt)

        result = {
            "lesson_id": lesson_id,
            "lesson_title": "Attention Mechanism & Transformer (transcript-06)",
            "source_file": "transcript-06.txt",
            "total_lines": len(lines),
            "mode": mode,
            "total_slides": len(slides),
            "estimated_reading_time": f"{len(slides) * 1.2:.0f} phút",
            "slides": slides
        }
        self._slides_cache[cache_key] = result
        return result

    def _build_16_detailed_slides(self, lines: List[str], get_excerpt) -> List[Dict[str, Any]]:
        slides: List[Dict[str, Any]] = [
            {
                "id": 1,
                "slide_number": 1,
                "title": "Tổng quan Bài học & Bước ngoặt Attention Mechanism",
                "subtitle": "Khởi đầu kỷ nguyên kiến trúc Transformer trong NLP",
                "concept": "Attention Paradigm & Historical Turning Point",
                "content": lines[1] if len(lines) > 1 else "Tìm hiểu về Attention Mechanism trong NLP.",
                "bullet_points": [
                    "Chuyên đề: Cơ chế Chú ý (Attention Mechanism) và Kiến trúc Transformer.",
                    "Bước ngoặt then chốt mang tính cách mạng trong xử lý ngôn ngữ tự nhiên (NLP).",
                    "Nền tảng của các mô hình ngôn ngữ lớn (LLM) hiện đại."
                ],
                "key_takeaway": "Attention Mechanism là bước ngoặt giải phóng năng lực xử lý ngữ nghĩa trong AI.",
                "source_lines": [1, 2],
                "source_citation": "transcript-06, lines 1-2",
                "source_excerpt": get_excerpt(1, 2),
                "diagram": {
                    "type": "summary_mindmap",
                    "title": "Tổng quan chuyên đề",
                    "description": "Attention Mechanism ──> Bước ngoặt NLP ──> Kiến trúc Transformer"
                },
                "sample_questions": [
                    "Vì sao Attention được gọi là bước ngoặt then chốt trong NLP?",
                    "Attention Mechanism giải quyết thách thức lịch sử nào của mô hình ngôn ngữ?"
                ]
            },
            {
                "id": 2,
                "slide_number": 2,
                "title": "Mô hình Tuần tự Truyền thống (RNN/LSTM)",
                "subtitle": "Cơ chế xử lý chuỗi từng bước thời gian t = 1, 2, ..., T",
                "concept": "Sequential Step-by-Step Processing",
                "content": get_excerpt(3, 4),
                "bullet_points": [
                    "Các mô hình tiền thân kinh điển: RNN (Recurrent Neural Network) và LSTM.",
                    "Chuỗi đầu vào bắt buộc phải xử lý tuần tự từng từ một qua các bước thời gian t = 1, 2, ..., T.",
                    "Từ sau phải đợi từ trước xử lý xong, gây ra độ trễ tính toán lớn."
                ],
                "key_takeaway": "Mô hình tuần tự RNN xử lý từng bước, không thể tận dụng tối đa khả năng tính toán song song.",
                "source_lines": [3, 4],
                "source_citation": "transcript-06, lines 3-4",
                "source_excerpt": get_excerpt(3, 4),
                "diagram": {
                    "type": "sequence_bottleneck",
                    "title": "Quy trình tuần tự trong RNN",
                    "description": "t=1 (Từ 1) → t=2 (Từ 2) → t=3 (Từ 3) → ... → t=T (Từ cuối)"
                },
                "sample_questions": [
                    "Cách thức xử lý tuần tự t = 1..T của RNN gây ra hạn chế gì về hiệu năng?",
                    "Tại sao RNN không thể tính toán song song toàn bộ chuỗi token cùng lúc?"
                ]
            },
            {
                "id": 3,
                "slide_number": 3,
                "title": "Điểm nghẽn Biểu diễn (Information Bottleneck)",
                "subtitle": "Áp lực nén toàn bộ câu vào một vector ẩn có kích thước cố định",
                "concept": "Fixed-size Hidden State Information Bottleneck",
                "content": get_excerpt(5, 6),
                "bullet_points": [
                    "Mô hình cố nén toàn bộ thông tin ngữ cảnh của một câu dài vào một vector ẩn cuối cùng có kích thước cố định.",
                    "Tạo ra một điểm nghẽn thông tin nghiêm trọng (information bottleneck).",
                    "Đặc biệt nghiêm trọng khi xử lý các câu dài trên 20-30 từ."
                ],
                "key_takeaway": "Vector ẩn kích thước cố định là nút thắt cổ chai làm tràn và mất mát ngữ cảnh của câu dài.",
                "source_lines": [5, 6],
                "source_citation": "transcript-06, lines 5-6",
                "source_excerpt": get_excerpt(5, 6),
                "diagram": {
                    "type": "sequence_bottleneck",
                    "title": "Điểm nghẽn thông tin (Information Bottleneck)",
                    "description": "Câu dài (20-30+ từ) ──> [Vector ẩn cố định (Bottleneck)] ──> Quá tải dung lượng biểu diễn"
                },
                "sample_questions": [
                    "Information Bottleneck xảy ra khi nào và hậu quả là gì?",
                    "Vì sao câu dài trên 20-30 từ lại khiến vector ẩn cố định của RNN quá tải?"
                ]
            },
            {
                "id": 4,
                "slide_number": 4,
                "title": "Hiện tượng Suy giảm Đạo hàm (Vanishing Gradient)",
                "subtitle": "Sự đứt gãy ký ức đối với các từ xuất hiện ở vị trí đầu câu",
                "concept": "Vanishing Gradient & Memory Degradation",
                "content": lines[6] if len(lines) > 6 else "Hiện tượng suy giảm đạo hàm khiến RNN quên từ đầu câu.",
                "bullet_points": [
                    "Khi lan truyền ngược qua thời gian (BPTT), đạo hàm bị suy giảm theo cấp số nhân.",
                    "RNN dần quên mất thông tin của những từ xuất hiện ở vị trí đầu câu.",
                    "Các phụ thuộc ngữ nghĩa tầm xa (long-range dependencies) bị đứt đoạn."
                ],
                "key_takeaway": "Vanishing gradient khiến RNN bị 'mất trí nhớ tầm xa', không duy trì được mối liên kết giữa đầu và cuối câu.",
                "source_lines": [7, 7],
                "source_citation": "transcript-06, line 7",
                "source_excerpt": get_excerpt(7, 7),
                "diagram": {
                    "type": "sequence_bottleneck",
                    "title": "Suy giảm đạo hàm theo chiều dài câu",
                    "description": "Từ đầu câu (Gradient → 0: Quên) ────────> Từ cuối câu (Gradient mạnh)"
                },
                "sample_questions": [
                    "Hiện tượng vanishing gradient ảnh hưởng thế nào đến các từ đầu câu?",
                    "Làm thế nào để nhận biết mô hình đang bị mất ngữ cảnh tầm xa?"
                ]
            },
            {
                "id": 5,
                "slide_number": 5,
                "title": "Sự ra đời & Ý tưởng Cốt lõi của Attention",
                "subtitle": "Giải phóng mô hình: Xóa bỏ hoàn toàn việc ép nén vào một vector duy nhất",
                "concept": "No Fixed-Vector Compression Paradigm",
                "content": get_excerpt(8, 9),
                "bullet_points": [
                    "Cơ chế Attention ra đời nhằm giải quyết triệt để điểm nghẽn biểu diễn cố định này.",
                    "Ý tưởng cốt lõi: KHÔNG bắt mô hình phải nén toàn bộ câu vào một vector duy nhất.",
                    "Mở ra lối đi trực tiếp giữa mọi vị trí đầu vào và đầu ra."
                ],
                "key_takeaway": "Ý tưởng cốt lõi của Attention: Thay vì nén cố định, hãy mở rộng kết nối trực tiếp đến mọi trạng thái ẩn.",
                "source_lines": [8, 9],
                "source_citation": "transcript-06, lines 8-9",
                "source_excerpt": get_excerpt(8, 9),
                "diagram": {
                    "type": "attention_overview",
                    "title": "Sự thay đổi mô hình biểu diễn",
                    "description": "Cũ: Câu dài → 1 Vector duy nhất | Mới (Attention): Không nén ép → Truy cập tự do"
                },
                "sample_questions": [
                    "Ý tưởng cốt lõi của Attention khác biệt như thế nào so với cách nén của RNN?",
                    "Tại sao việc không bắt mô hình nén vào 1 vector lại giải quyết được điểm nghẽn?"
                ]
            },
            {
                "id": 6,
                "slide_number": 6,
                "title": "Nhìn lại Toàn bộ Trạng thái ẩn & Trọng số Chú ý",
                "subtitle": "Đo lường định lượng mức độ liên quan giữa từ hiện tại và các từ khác",
                "concept": "Dynamic Attention Weights Allocation",
                "content": get_excerpt(10, 11),
                "bullet_points": [
                    "Ở mỗi bước tính toán, mô hình được phép nhìn lại toàn bộ trạng thái ẩn của tất cả các token.",
                    "Tính toán tập hợp trọng số chú ý (attention weights) linh hoạt.",
                    "Trọng số biểu diễn mức độ liên quan ngữ nghĩa giữa từ hiện tại và các từ khác trong chuỗi."
                ],
                "key_takeaway": "Trọng số chú ý (Attention Weights) cho phép mô hình linh hoạt tập trung vào các từ quan trọng nhất.",
                "source_lines": [10, 11],
                "source_citation": "transcript-06, lines 10-11",
                "source_excerpt": get_excerpt(10, 11),
                "diagram": {
                    "type": "attention_overview",
                    "title": "Cơ chế tính trọng số chú ý",
                    "description": "Token hiện tại ──> Attention Weights [w_1, w_2, ..., w_T] ──> Tất cả trạng thái ẩn"
                },
                "sample_questions": [
                    "Trọng số chú ý (attention weights) thể hiện điều gì?",
                    "Làm thế nào mô hình biết được từ nào cần chú ý nhiều hơn?"
                ]
            },
            {
                "id": 7,
                "slide_number": 7,
                "title": "Cơ chế Self-Attention: Kết nối All-to-All",
                "subtitle": "Mỗi token kết nối trực tiếp với tất cả token khác trong cùng một chuỗi",
                "concept": "All-to-All Direct Connectivity",
                "content": lines[11] if len(lines) > 11 else "Cơ chế Self-Attention kết nối all-to-all trực tiếp.",
                "bullet_points": [
                    "Cơ chế Self-Attention (tự chú ý) kết nối mỗi token với tất cả các token khác trong cùng chuỗi.",
                    "Kết nối all-to-all: Mọi cặp từ đều có đường truyền trực tiếp với nhau.",
                    "Độ dài đường truyền thông tin giữa bất kỳ 2 từ nào luôn là O(1) bước."
                ],
                "key_takeaway": "Self-Attention thiết lập liên kết all-to-all, xóa bỏ hoàn toàn khoảng cách vật lý trong cấu trúc chuỗi.",
                "source_lines": [12, 12],
                "source_citation": "transcript-06, line 12",
                "source_excerpt": get_excerpt(12, 12),
                "diagram": {
                    "type": "all_to_all_connection",
                    "title": "Mạng lưới kết nối All-to-All",
                    "description": "Mọi token i ⟷ Mọi token j (Đường truyền thông tin trực tiếp 1 bước)"
                },
                "sample_questions": [
                    "Kết nối all-to-all trong Self-Attention mang lại lợi ích gì so với RNN?",
                    "Tại sao Self-Attention lại rút ngắn khoảng cách truyền thông tin giữa các từ?"
                ]
            },
            {
                "id": 8,
                "slide_number": 8,
                "title": "Bác bỏ Hiểu lầm: Tính Độc lập với Khoảng cách",
                "subtitle": "Hiểu lầm phổ biến: Cho rằng Attention chỉ ưu tiên các từ đứng gần nhau",
                "concept": "Distance Invariance & Refutation of Proximity Misconception",
                "content": get_excerpt(13, 15),
                "bullet_points": [
                    "Hiểu lầm rất phổ biến: Nghĩ rằng Attention chỉ ưu tiên các từ đứng gần nhau hoặc gán cố định theo vị trí liền kề.",
                    "Đây là cách hiểu HOÀN TOÀN SAI: Attention KHÔNG phụ thuộc vào khoảng cách vật lý.",
                    "Hai từ cách nhau 50 từ vẫn có thể có trọng số attention cực cao nếu tương quan ngữ nghĩa mạnh."
                ],
                "key_takeaway": "Cực kỳ quan trọng: Attention không phải hàm gán theo khoảng cách; tương quan ngữ nghĩa mới quyết định trọng số.",
                "source_lines": [13, 15],
                "source_citation": "transcript-06, lines 13-15",
                "source_excerpt": get_excerpt(13, 15),
                "diagram": {
                    "type": "all_to_all_connection",
                    "title": "Tính độc lập với khoảng cách vật lý",
                    "description": "Khoảng cách = 1 từ hay 50 từ ──> Attention Weight phụ thuộc NỘI DUNG, KHÔNG phụ thuộc VỊ TRÍ"
                },
                "sample_questions": [
                    "Vì sao quan niệm 'Attention ưu tiên từ đứng gần' lại là hiểu lầm hoàn toàn sai?",
                    "Nếu hai từ cách nhau 50 từ thì Attention hoạt động thế nào?"
                ]
            },
            {
                "id": 9,
                "slide_number": 9,
                "title": "Phân tích Ví dụ Thực tế: 'Con mèo ... xuất hiện'",
                "subtitle": "Minh chứng trực quan từ bài giảng về liên kết ngữ nghĩa vượt khoảng cách xa",
                "concept": "Long-Range Semantic Dependency Concrete Proof",
                "content": lines[15] if len(lines) > 15 else "Ví dụ trong câu Con mèo mà tôi nhìn thấy tuần trước ở công viên hôm nay lại xuất hiện.",
                "bullet_points": [
                    "Câu ví dụ: \"Con mèo mà tôi nhìn thấy tuần trước ở công viên hôm nay lại xuất hiện\".",
                    "Khoảng cách giữa chủ ngữ \"Con mèo\" và vị ngữ \"xuất hiện\" là hơn 10 từ bổ nghĩa.",
                    "Mặc dù ở xa nhau, từ \"xuất hiện\" vẫn có trọng số attention cao nhất tới \"Con mèo\"."
                ],
                "key_takeaway": "Ví dụ 'Con mèo... xuất hiện' chứng minh hùng hồn rằng ngữ nghĩa vượt qua mọi rào cản khoảng cách.",
                "source_lines": [16, 16],
                "source_citation": "transcript-06, line 16",
                "source_excerpt": get_excerpt(16, 16),
                "diagram": {
                    "type": "all_to_all_connection",
                    "title": "Ví dụ thực tế từ bài học",
                    "description": "[Con mèo] ──── (tuần trước ở công viên hôm nay lại...) ──── [xuất hiện] (Trọng số attention cực cao)"
                },
                "sample_questions": [
                    "Trong câu ví dụ ở dòng 16, tại sao 'xuất hiện' lại chú ý nhiều nhất tới 'Con mèo'?",
                    "Nếu dùng RNN thì câu ví dụ này gặp nguy cơ gì ở từ cuối?"
                ]
            },
            {
                "id": 10,
                "slide_number": 10,
                "title": "Bộ ba Vector Biểu diễn: Query, Key và Value (Q, K, V)",
                "subtitle": "Chiếu tuyến tính token vào 3 không gian chức năng chuyên biệt",
                "concept": "Linear Projections for Query, Key, and Value",
                "content": get_excerpt(17, 18),
                "bullet_points": [
                    "Mỗi token đầu vào được chiếu qua ba ma trận trọng số tuyến tính W_Q, W_K, W_V.",
                    "Tạo ra ba vector: Query (Q), Key (K) và Value (V).",
                    "Query (Q): Vector đại diện cho câu hỏi hoặc thông tin token hiện tại đang cần tìm kiếm."
                ],
                "key_takeaway": "Query đại diện cho nhu cầu tìm kiếm thông tin của token từ ngữ cảnh xung quanh.",
                "source_lines": [17, 18],
                "source_citation": "transcript-06, lines 17-18",
                "source_excerpt": get_excerpt(17, 18),
                "diagram": {
                    "type": "qkv_triplet",
                    "title": "Phép chiếu sinh vector Query",
                    "description": "Token đầu vào x_i ──(nhân ma trận W_Q)──> Vector Query Q_i (Nhu cầu tìm kiếm)"
                },
                "sample_questions": [
                    "Mỗi token được chiếu qua những ma trận nào để tạo ra Q, K, V?",
                    "Bản chất và vai trò của vector Query (Q) là gì?"
                ]
            },
            {
                "id": 11,
                "slide_number": 11,
                "title": "Vai trò của Key (K) và Value (V) trong Đối sánh",
                "subtitle": "Định danh đặc trưng và kho nội dung ngữ nghĩa thực tế",
                "concept": "Key Identifier Matching & Value Aggregation",
                "content": get_excerpt(19, 20),
                "bullet_points": [
                    "Key (K): Đóng vai trò như nhãn định danh hoặc đặc trưng của từng token trong chuỗi, dùng để đối sánh với Query.",
                    "Value (V): Chứa nội dung thông tin thực sự của token đó.",
                    "Nội dung Value sẽ được tổng hợp lại dựa trên trọng số sau khi đối sánh Query với Key."
                ],
                "key_takeaway": "Key là nhãn để so khớp; Value là kho thông tin thực tế được tổng hợp theo trọng số.",
                "source_lines": [19, 20],
                "source_citation": "transcript-06, lines 19-20",
                "source_excerpt": get_excerpt(19, 20),
                "diagram": {
                    "type": "qkv_triplet",
                    "title": "Đối sánh Key và Tổng hợp Value",
                    "description": "Query (câu hỏi) × Key (nhãn) ──> Trọng số xác suất ──> Nhân Value (nội dung thực)"
                },
                "sample_questions": [
                    "Key và Value khác nhau như thế nào về mặt chức năng?",
                    "Tại sao không nhân trực tiếp Query với Value mà phải qua Key?"
                ]
            },
            {
                "id": 12,
                "slide_number": 12,
                "title": "Scaled Dot-Product: Tích Vô hướng & Đo Tương đồng",
                "subtitle": "Công thức tổng quát và bước nhân vô hướng giữa Query và Key",
                "concept": "Dot-Product Semantic Similarity Measurement",
                "content": get_excerpt(21, 23),
                "bullet_points": [
                    "Công thức chuẩn: Attention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V.",
                    "Bước đầu tiên: Nhân vô hướng (dot-product) score = Q * K^T.",
                    "Tích vô hướng phản ánh độ tương đồng hướng hoặc độ phù hợp ngữ nghĩa giữa Query và từng Key."
                ],
                "key_takeaway": "Tích vô hướng Q · K^T là thước đo độ tương đồng ngữ nghĩa toán học cốt lõi.",
                "source_lines": [21, 23],
                "source_citation": "transcript-06, lines 21-23",
                "source_excerpt": get_excerpt(21, 23),
                "diagram": {
                    "type": "scaled_dot_product_flow",
                    "title": "Bước 1: Nhân vô hướng Query và Key",
                    "description": "Vector Query Q_i · Vector Key K_j^T ──> Điểm tương đồng score_ij"
                },
                "sample_questions": [
                    "Tích vô hướng giữa Query và Key thể hiện điều gì?",
                    "Khi hai vector Q và K cùng hướng thì điểm số score sẽ thế nào?"
                ]
            },
            {
                "id": 13,
                "slide_number": 13,
                "title": "Hệ số Co giãn √d_k & Phòng ngừa Bão hòa Gradient",
                "subtitle": "Nguyên lý toán học đằng sau việc chia cho căn bậc hai số chiều d_k",
                "concept": "Scaling Factor sqrt(d_k) & Softmax Saturation Guard",
                "content": get_excerpt(24, 25),
                "bullet_points": [
                    "Chia tích vô hướng cho căn bậc hai kích thước vector Key sqrt(d_k) để co giãn độ lớn điểm số.",
                    "Nếu không có sqrt(d_k), khi số chiều d_k lớn, tích vô hướng sẽ rất lớn.",
                    "Tích vô hướng quá lớn đẩy hàm softmax vào vùng có đạo hàm cực nhỏ (gradient saturation), triệt tiêu việc cập nhật trọng số."
                ],
                "key_takeaway": "Hệ số sqrt(d_k) bảo vệ mô hình khỏi bão hòa gradient, đảm bảo quá trình học diễn ra ổn định.",
                "source_lines": [24, 25],
                "source_citation": "transcript-06, lines 24-25",
                "source_excerpt": get_excerpt(24, 25),
                "code_snippet": {
                    "language": "python",
                    "code": (
                        "import torch\n"
                        "import math\n\n"
                        "# Minh họa vai trò của sqrt(d_k):\n"
                        "d_k = 64\n"
                        "scale = math.sqrt(d_k)  # = 8.0\n\n"
                        "# Nếu không chia sqrt(d_k), tích vô hướng có thể đạt 80:\n"
                        "# softmax([80.0, 10.0]) -> [1.0, 0.0] => Gradient xấp xỉ 0 (Bão hòa!)\n"
                        "# Khi chia cho 8.0, điểm số trở về [10.0, 1.25] => Gradient mượt mà!"
                    )
                },
                "diagram": {
                    "type": "scaled_dot_product_flow",
                    "title": "Hệ số co giãn sqrt(d_k)",
                    "description": "Điểm số lớn Q·K^T ──(chia sqrt(d_k))──> Điểm số chuẩn hóa (Ngừa bão hòa đạo hàm)"
                },
                "sample_questions": [
                    "Tại sao khi d_k lớn thì tích vô hướng lại có độ lớn rất lớn?",
                    "Hiện tượng gradient saturation trong softmax nguy hiểm thế nào đối với việc huấn luyện?"
                ]
            },
            {
                "id": 14,
                "slide_number": 14,
                "title": "Chuẩn hóa Softmax & Tổng hợp Vector Value (V)",
                "subtitle": "Chuyển đổi điểm số thành phân phối xác suất và lấy tổng có trọng số",
                "concept": "Softmax Probability Distribution & Weighted Value Sum",
                "content": get_excerpt(26, 27),
                "bullet_points": [
                    "Hàm softmax được áp dụng lên điểm số đã chuẩn hóa để chuyển đổi thành phân phối xác suất có tổng bằng 1.",
                    "Cuối cùng: Tính tổng có trọng số của các vector Value (V) nhân với phân phối xác suất thu được.",
                    "Kết quả đầu ra là một vector biểu diễn ngữ cảnh phong phú cho từng vị trí."
                ],
                "key_takeaway": "Softmax biến điểm thô thành phân phối trọng số xác suất, kết hợp các Value thành biểu diễn hoàn chỉnh.",
                "source_lines": [26, 27],
                "source_citation": "transcript-06, lines 26-27",
                "source_excerpt": get_excerpt(26, 27),
                "code_snippet": {
                    "language": "python",
                    "code": (
                        "import torch\n"
                        "import torch.nn.functional as F\n\n"
                        "def scaled_dot_product_attention(Q, K, V):\n"
                        "    d_k = Q.size(-1)\n"
                        "    scores = torch.matmul(Q, K.transpose(-2, -1)) / (d_k ** 0.5)\n"
                        "    weights = F.softmax(scores, dim=-1)\n"
                        "    output = torch.matmul(weights, V)\n"
                        "    return output, weights"
                    )
                },
                "diagram": {
                    "type": "scaled_dot_product_flow",
                    "title": "Bước Softmax & Nhân Value",
                    "description": "Điểm đã co giãn ──> Softmax (Tổng = 1) ──(nhân ma trận V)──> Vector đầu ra"
                },
                "sample_questions": [
                    "Vai trò của hàm Softmax trong công thức Attention là gì?",
                    "Biểu diễn đầu ra của Attention được tổng hợp từ những thành phần nào?"
                ]
            },
            {
                "id": 15,
                "slide_number": 15,
                "title": "Tính toán Song song trong Transformer trên GPU",
                "subtitle": "Khắc phục triệt để sự phụ thuộc thời gian tuần tự của RNN",
                "concept": "Full Sequence Parallel Processing Power",
                "content": lines[27] if len(lines) > 27 else "Transformer xử lý song song toàn bộ chuỗi cùng lúc thay vì chờ tuần tự như RNN.",
                "bullet_points": [
                    "Nhờ cơ chế Attention, Transformer có thể xử lý song song toàn bộ chuỗi văn bản cùng một lúc.",
                    "Không cần chờ đợi tuần tự từng bước thời gian t = 1..T như RNN.",
                    "Tận dụng tối đa kiến trúc phần cứng tăng tốc GPU/TPU, rút ngắn thời gian huấn luyện từ hàng tuần xuống hàng giờ."
                ],
                "key_takeaway": "Khả năng tính toán song song là yếu tố then chốt cho phép đào tạo các mô hình ngôn ngữ khổng lồ.",
                "source_lines": [28, 28],
                "source_citation": "transcript-06, line 28",
                "source_excerpt": get_excerpt(28, 28),
                "diagram": {
                    "type": "multi_head_architecture",
                    "title": "Xử lý song song trên GPU",
                    "description": "Toàn bộ chuỗi [Token 1, Token 2, ..., Token T] ──> Xử lý ĐỒNG THỜI trên GPU"
                },
                "sample_questions": [
                    "Tại sao Attention lại cho phép xử lý song song còn RNN thì không?",
                    "Tính toán song song đã thúc đẩy sự bùng nổ của các mô hình LLM như thế nào?"
                ]
            },
            {
                "id": 16,
                "slide_number": 16,
                "title": "Multi-Head Attention & Tổng kết Nguyên lý Cốt lõi",
                "subtitle": "Không gian biểu diễn đa chiều và định nghĩa bản chất cuối cùng",
                "concept": "Multi-Head Subspaces & Content-Based Principle",
                "content": get_excerpt(29, 32),
                "bullet_points": [
                    "Multi-Head Attention: Chia Q, K, V thành nhiều không gian biểu diễn con độc lập (h đầu chú ý).",
                    "Mỗi Head học một loại tương quan khác nhau: cú pháp ngữ pháp, quan hệ thực thể, ngữ cảnh xa.",
                    "TỔNG KẾT: Attention là cơ chế kết nối linh hoạt, tính toán tương quan động dựa trên nội dung biểu diễn qua Q-K-V, hoàn toàn không phụ thuộc khoảng cách vị trí."
                ],
                "key_takeaway": "Ghi nhớ cốt lõi: Attention không phải hàm gán cố định theo vị trí, mà là hàm tính tương quan động dựa trên nội dung.",
                "source_lines": [29, 32],
                "source_citation": "transcript-06, lines 29-32",
                "source_excerpt": get_excerpt(29, 32),
                "diagram": {
                    "type": "summary_mindmap",
                    "title": "Tổng kết kiến trúc Attention",
                    "description": "Multi-Head (h heads) ⟷ Q, K, V Projections ⟷ Scaled Dot-Product ⟷ Dynamic Content Correlation"
                },
                "sample_questions": [
                    "Multi-Head Attention mang lại lợi thế gì so với Single-Head?",
                    "Hãy nhắc lại định nghĩa cốt lõi của Attention Mechanism bằng một câu ngắn gọn."
                ]
            }
        ]
        return slides

    def _build_7_overview_slides(self, get_excerpt) -> List[Dict[str, Any]]:
        slides: List[Dict[str, Any]] = [
            {
                "id": 1,
                "slide_number": 1,
                "title": "Điểm nghẽn Biểu diễn của Mô hình Tuần tự (RNN/LSTM)",
                "subtitle": "Hạn chế cốt lõi dẫn đến sự ra đời của Attention Mechanism",
                "concept": "Sequential Bottleneck & Vanishing Gradient",
                "content": get_excerpt(3, 7),
                "bullet_points": [
                    "Xử lý tuần tự từng từ qua các bước thời gian t = 1, 2, ..., T.",
                    "Toàn bộ ngữ cảnh bị ép nén vào một vector ẩn kích thước cố định.",
                    "Gây ra hiện tượng điểm nghẽn thông tin khi câu dài vượt quá 20-30 từ.",
                    "Suy giảm đạo hàm (vanishing gradient) làm mất thông tin ở đầu câu."
                ],
                "key_takeaway": "Vector trạng thái ẩn cố định là nút thắt cổ chai khiến RNN không thể lưu giữ ngữ cảnh câu dài.",
                "source_lines": [1, 7],
                "source_citation": "transcript-06, lines 3-7",
                "source_excerpt": get_excerpt(3, 7),
                "diagram": {
                    "type": "sequence_bottleneck",
                    "title": "Điểm nghẽn thông tin trong RNN",
                    "description": "Token 1 → Token 2 → ... → [Vector kích thước cố định] (Mất mát ngữ cảnh xa)"
                }
            },
            {
                "id": 2,
                "slide_number": 2,
                "title": "Sự ra đời & Nguyên lý Cốt lõi của Attention",
                "subtitle": "Giải phóng mô hình khỏi điểm nghẽn biểu diễn cố định",
                "concept": "Direct Hidden State Access & Dynamic Attention Weights",
                "content": get_excerpt(8, 11),
                "bullet_points": [
                    "Không ép buộc nén toàn bộ chuỗi vào một vector ẩn duy nhất.",
                    "Mô hình được phép nhìn lại toàn bộ trạng thái ẩn tại mỗi bước.",
                    "Tính toán trọng số chú ý động giữa các từ."
                ],
                "key_takeaway": "Attention cho phép mô hình linh hoạt chọn lọc và kết nối trực tiếp đến mọi từ trong câu.",
                "source_lines": [8, 11],
                "source_citation": "transcript-06, lines 8-11",
                "source_excerpt": get_excerpt(8, 11),
                "diagram": {
                    "type": "attention_overview",
                    "title": "Cơ chế truy cập toàn bộ trạng thái ẩn",
                    "description": "Token hiện tại ⇄ Trọng số chú ý ⇄ Tất cả trạng thái ẩn"
                }
            },
            {
                "id": 3,
                "slide_number": 3,
                "title": "Self-Attention: Bác bỏ Hiểu lầm về Khoảng cách Vị trí",
                "subtitle": "Kết nối all-to-all không phụ thuộc vào vị trí vật lý gần hay xa",
                "concept": "All-to-All Semantic Correlation vs Positional Proximity",
                "content": get_excerpt(12, 16),
                "bullet_points": [
                    "Kết nối All-to-All trực tiếp giữa mọi token.",
                    "Bác bỏ hiểu lầm: Attention KHÔNG phụ thuộc khoảng cách vật lý.",
                    "Hai từ cách nhau 50 từ vẫn có thể có attention cực lớn nếu tương quan ngữ nghĩa mạnh."
                ],
                "key_takeaway": "Attention tính tương quan động dựa trên ngữ nghĩa nội dung, không phụ thuộc khoảng cách vật lý.",
                "source_lines": [12, 16],
                "source_citation": "transcript-06, lines 12-16",
                "source_excerpt": get_excerpt(12, 16),
                "diagram": {
                    "type": "all_to_all_connection",
                    "title": "Liên kết ngữ nghĩa vượt khoảng cách xa",
                    "description": "[Con mèo] ──── (cách 10+ từ ở công viên tuần trước...) ──── [xuất hiện]"
                }
            },
            {
                "id": 4,
                "slide_number": 4,
                "title": "Bộ ba Vector Biểu diễn: Query, Key và Value (Q, K, V)",
                "subtitle": "Kiến trúc tra cứu thông tin thông minh trong không gian vector",
                "concept": "Query - Key - Value Projections & Semantic Matching",
                "content": get_excerpt(17, 20),
                "bullet_points": [
                    "Query (Q): Câu hỏi / thông tin cần tìm kiếm.",
                    "Key (K): Nhãn định danh dùng để đối sánh với Query.",
                    "Value (V): Nội dung thông tin thực tế được tổng hợp."
                ],
                "key_takeaway": "Query đặt câu hỏi, Key đo độ phù hợp tương quan, và Value cung cấp nội dung tương ứng.",
                "source_lines": [17, 20],
                "source_citation": "transcript-06, lines 17-20",
                "source_excerpt": get_excerpt(17, 20),
                "diagram": {
                    "type": "qkv_triplet",
                    "title": "Mô hình truy vấn Q - K - V",
                    "description": "Token → [W_Q, W_K, W_V] → Query × Key → Điểm số → Tổng hợp Value"
                }
            },
            {
                "id": 5,
                "slide_number": 5,
                "title": "Scaled Dot-Product Attention & Công thức Toán học",
                "subtitle": "Quy trình tính toán toán học và vai trò của hệ số co giãn sqrt(d_k)",
                "concept": "Scaled Dot-Product Attention Formula & Softmax Saturation Guard",
                "content": get_excerpt(21, 27),
                "bullet_points": [
                    "Công thức: Attention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V.",
                    "Tích vô hướng Q * K^T đo độ tương đồng ngữ nghĩa.",
                    "Hệ số sqrt(d_k) ngăn chặn hiện tượng bão hòa gradient trong Softmax.",
                    "Nhân phân phối xác suất với ma trận Value V."
                ],
                "key_takeaway": "Hệ số sqrt(d_k) đóng vai trò then chốt giúp ổn định gradient trong huấn luyện sâu.",
                "source_lines": [21, 27],
                "source_citation": "transcript-06, lines 21-27",
                "source_excerpt": get_excerpt(21, 27),
                "code_snippet": {
                    "language": "python",
                    "code": (
                        "import torch\nimport torch.nn.functional as F\nimport math\n\n"
                        "def scaled_dot_product_attention(Q, K, V, mask=None):\n"
                        "    d_k = Q.size(-1)\n"
                        "    scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(d_k)\n"
                        "    if mask is not None:\n"
                        "        scores = scores.masked_fill(mask == 0, -1e9)\n"
                        "    attn_weights = F.softmax(scores, dim=-1)\n"
                        "    return torch.matmul(attn_weights, V), attn_weights"
                    )
                },
                "diagram": {
                    "type": "scaled_dot_product_flow",
                    "title": "Quy trình Scaled Dot-Product",
                    "description": "MatMul(Q, K^T) → Scale (/ sqrt(d_k)) → Softmax → MatMul(..., V) → Output"
                }
            },
            {
                "id": 6,
                "slide_number": 6,
                "title": "Multi-Head Attention & Xử lý Song song trong Transformer",
                "subtitle": "Mở rộng không gian biểu diễn đa diện và tối ưu hóa tính toán",
                "concept": "Multi-Head Subspaces & Parallel Processing Power",
                "content": get_excerpt(28, 30),
                "bullet_points": [
                    "Xử lý song song toàn bộ chuỗi token đồng thời trên GPU.",
                    "Multi-Head Attention: Chia Q, K, V thành h không gian con độc lập.",
                    "Mỗi Head học một loại tương quan khác nhau: cú pháp, thực thể, ngữ cảnh xa."
                ],
                "key_takeaway": "Multi-Head Attention cho phép mô hình học nhiều khía cạnh ngữ nghĩa song song.",
                "source_lines": [28, 30],
                "source_citation": "transcript-06, lines 28-30",
                "source_excerpt": get_excerpt(28, 30),
                "diagram": {
                    "type": "multi_head_architecture",
                    "title": "Kiến trúc Multi-Head Attention",
                    "description": "V, K, Q → [Linear x h] → [Scaled Dot-Product x h] → Concat → Linear"
                }
            },
            {
                "id": 7,
                "slide_number": 7,
                "title": "Tổng kết Trọng tâm & Đánh giá Kiến thức",
                "subtitle": "Những điểm cốt lõi cần ghi nhớ về Attention Mechanism",
                "concept": "Core Synthesis & Anti-Misconception Grounding",
                "content": get_excerpt(31, 32),
                "bullet_points": [
                    "Bản chất: Hàm tính tương quan động dựa trên nội dung biểu diễn qua Q-K-V.",
                    "Hoàn toàn không phụ thuộc khoảng cách từ gần kề.",
                    "Giải quyết triệt để điểm nghẽn biểu diễn của RNN và cho phép xử lý song song."
                ],
                "key_takeaway": "Nắm vững: Attention tính tương quan động all-to-all qua Q-K-V, không phụ thuộc khoảng cách vị trí.",
                "source_lines": [31, 32],
                "source_citation": "transcript-06, lines 31-32",
                "source_excerpt": get_excerpt(31, 32),
                "diagram": {
                    "type": "summary_mindmap",
                    "title": "Tóm tắt bản chất Attention",
                    "description": "Dynamic Correlation ⇄ All-to-all ⇄ Q-K-V Projections ⇄ Scaled Dot-Product"
                }
            }
        ]
        return slides

    def parse_custom_text_file(self, text: str, filename: str = "custom.txt") -> Dict[str, Any]:
        raw_lines = [line.strip() for line in text.splitlines() if line.strip()]
        if not raw_lines:
            raw_lines = ["Nội dung tài liệu trống."]

        chunk_size = max(1, min(3, len(raw_lines) // 10 if len(raw_lines) > 20 else 2))
        chunks = []
        for i in range(0, len(raw_lines), chunk_size):
            chunks.append(raw_lines[i:i + chunk_size])

        slides = []
        for idx, chunk in enumerate(chunks):
            slide_num = idx + 1
            chunk_text = " ".join(chunk)
            first_line = chunk[0]
            clean_title = re.sub(r"^[#\-\*\d\.\s\[\]]+", "", first_line).strip()
            if len(clean_title) > 60:
                clean_title = clean_title[:57] + "..."
            if not clean_title:
                clean_title = f"Chủ đề phần {slide_num}"

            start_line = idx * chunk_size + 1
            end_line = min(len(raw_lines), (idx + 1) * chunk_size)

            slides.append({
                "id": slide_num,
                "slide_number": slide_num,
                "title": f"Phần {slide_num}: {clean_title}",
                "subtitle": f"Trích đoạn từ dòng {start_line} đến dòng {end_line}",
                "concept": f"Phân đoạn tài liệu {filename}",
                "content": chunk_text,
                "bullet_points": [line for line in chunk if len(line) > 5],
                "key_takeaway": f"Nội dung trọng tâm dòng {start_line}-{end_line}: {chunk[0][:80]}...",
                "source_lines": [start_line, end_line],
                "source_citation": f"{filename}, lines {start_line}-{end_line}",
                "source_excerpt": "\n".join(chunk),
                "diagram": {
                    "type": "summary_mindmap",
                    "title": f"Sơ đồ phần {slide_num}",
                    "description": f"Dòng {start_line}-{end_line} ──> {clean_title}"
                }
            })

        return {
            "lesson_id": filename.replace(".txt", "").replace(".md", ""),
            "lesson_title": f"Tài liệu bài học: {filename}",
            "source_file": filename,
            "total_lines": len(raw_lines),
            "mode": "dynamic_file",
            "total_slides": len(slides),
            "estimated_reading_time": f"{len(slides) * 1.5:.0f} phút",
            "slides": slides
        }

slide_service = SlideAdapter()

def get_slide_context_response(slide_id: Optional[int], user_query: str) -> Optional[str]:
    if not slide_id:
        return None

    query_lower = user_query.lower()
    slides_data = slide_service.get_lesson_slides("transcript-06", mode="detailed")
    if not slides_data or not slides_data.get("slides"):
        return None

    slides = slides_data["slides"]
    target_slide = None
    for s in slides:
        if s["slide_number"] == slide_id or s["id"] == slide_id:
            target_slide = s
            break

    if not target_slide:
        return None

    cit = target_slide["source_citation"]
    title = target_slide["title"]
    content = target_slide["content"]
    takeaway = target_slide["key_takeaway"]
    bullets = "\n".join([f"• {b}" for b in target_slide["bullet_points"]])

    if any(k in query_lower for k in ["tóm tắt", "summary", "tóm lược", "ngắn gọn"]):
        return f"Tóm tắt Slide {slide_id} ({title}) [{cit}]:\n{bullets}\n\n💡 Ghi nhớ: {takeaway} [{cit}]."
    elif any(k in query_lower for k in ["ví dụ", "thực tế", "minh họa"]):
        if slide_id == 9 or "con mèo" in title.lower():
            return (
                f"Ví dụ thực tế trực quan theo bài giảng [{cit}]:\n"
                f"Trong câu 'Con mèo mà tôi nhìn thấy tuần trước ở công viên hôm nay lại xuất hiện', "
                f"từ 'xuất hiện' ở cuối câu liên kết trực tiếp với 'Con mèo' ở đầu câu qua Attention, "
                f"bỏ qua hơn 10 từ ngăn cách về thời gian và không gian. Đây là minh chứng rõ nhất cho việc Attention không phụ thuộc khoảng cách [{cit}]."
            )
        elif slide_id in [10, 11] or "query" in title.lower():
            return (
                f"Ví dụ thực tế trực quan [{cit}]:\n"
                f"Tương tự như tìm kiếm trên YouTube hoặc Google:\n"
                f"- Query: Bạn gõ từ khóa tìm kiếm (nhu cầu thông tin).\n"
                f"- Key: Hệ thống so khớp từ khóa với tiêu đề/tag của từng video (nhãn định danh).\n"
                f"- Value: Nội dung video được chọn để phát cho bạn xem (nội dung thực tế) [{cit}]."
            )
        elif slide_id in [12, 13, 14] or "scaled" in title.lower() or "sqrt" in title.lower():
            return (
                f"Ví dụ thực tế về hệ số sqrt(d_k) [{cit}]:\n"
                f"Khi d_k = 64, tích vô hướng giữa hai vector có thể lên tới 80. Nếu đưa 80 vào Softmax (e^80), "
                f"kết quả sẽ bằng 1 tuyệt đối và gradient bằng 0 (triệt tiêu việc học). Bằng cách chia cho sqrt(64) = 8, "
                f"điểm số trở về 10, giữ cho đạo hàm Softmax mượt mà và mô hình học ổn định [{cit}]."
            )
        else:
            return f"Ví dụ minh họa cho Slide {slide_id} ({title}) [{cit}]:\n{takeaway}\nTham chiếu trực tiếp từ dòng bài học: '{content[:120]}...' [{cit}]."
    else:
        return (
            f"Giải thích nội dung Slide {slide_id} ({title}) [{cit}]:\n"
            f"{content}\n\n"
            f"Điểm mấu chốt:\n{bullets}\n\n"
            f"💡 Ghi nhớ trọng tâm: {takeaway} [{cit}]."
        )
