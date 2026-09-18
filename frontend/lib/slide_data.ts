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

export const DETAILED_16_SLIDES: Slide[] = [
  {
    id: 1,
    slide_number: 1,
    title: "Tổng quan Bài học & Bước ngoặt Attention Mechanism",
    subtitle: "Khởi đầu kỷ nguyên kiến trúc Transformer trong NLP",
    concept: "Attention Paradigm & Historical Turning Point",
    content: "Giảng viên: Chào các bạn, hôm nay chúng ta sẽ tìm hiểu về Attention Mechanism - bước ngoặt then chốt trong xử lý ngôn ngữ tự nhiên.",
    bullet_points: [
      "Chuyên đề: Cơ chế Chú ý (Attention Mechanism) và Kiến trúc Transformer.",
      "Bước ngoặt then chốt mang tính cách mạng trong xử lý ngôn ngữ tự nhiên (NLP).",
      "Nền tảng của các mô hình ngôn ngữ lớn (LLM) hiện đại."
    ],
    key_takeaway: "Attention Mechanism là bước ngoặt giải phóng năng lực xử lý ngữ nghĩa trong AI.",
    source_lines: [1, 2],
    source_citation: "transcript-06, lines 1-2",
    source_excerpt: "[Bài 06: Cơ chế Chú ý (Attention Mechanism) và Kiến trúc Transformer]\nGiảng viên: Chào các bạn, hôm nay chúng ta sẽ tìm hiểu về Attention Mechanism - bước ngoặt then chốt trong xử lý ngôn ngữ tự nhiên.",
    diagram: {
      type: "summary_mindmap",
      title: "Tổng quan chuyên đề",
      description: "Attention Mechanism ──> Bước ngoặt NLP ──> Kiến trúc Transformer"
    },
    sample_questions: [
      "Vì sao Attention được gọi là bước ngoặt then chốt trong NLP?",
      "Attention Mechanism giải quyết thách thức lịch sử nào của mô hình ngôn ngữ?"
    ]
  },
  {
    id: 2,
    slide_number: 2,
    title: "Mô hình Tuần tự Truyền thống (RNN/LSTM)",
    subtitle: "Cơ chế xử lý chuỗi từng bước thời gian t = 1, 2, ..., T",
    concept: "Sequential Step-by-Step Processing",
    content: "Trong RNN truyền thống, chuỗi đầu vào được xử lý tuần tự từng từ một qua các bước thời gian t = 1, 2, ..., T.",
    bullet_points: [
      "Các mô hình tiền thân kinh điển: RNN (Recurrent Neural Network) và LSTM.",
      "Chuỗi đầu vào bắt buộc phải xử lý tuần tự từng từ một qua các bước thời gian t = 1, 2, ..., T.",
      "Từ sau phải đợi từ trước xử lý xong, gây ra độ trễ tính toán lớn."
    ],
    key_takeaway: "Mô hình tuần tự RNN xử lý từng bước, không thể tận dụng tối đa khả năng tính toán song song.",
    source_lines: [3, 4],
    source_citation: "transcript-06, lines 3-4",
    source_excerpt: "Để hiểu Attention, trước hết ta hãy xem lại hạn chế của các mô hình tuần tự truyền thống như RNN và LSTM.\nTrong RNN truyền thống, chuỗi đầu vào được xử lý tuần tự từng từ một qua các bước thời gian t = 1, 2, ..., T.",
    diagram: {
      type: "sequence_bottleneck",
      title: "Quy trình tuần tự trong RNN",
      description: "t=1 (Từ 1) → t=2 (Từ 2) → t=3 (Từ 3) → ... → t=T (Từ cuối)"
    },
    sample_questions: [
      "Cách thức xử lý tuần tự t = 1..T của RNN gây ra hạn chế gì về hiệu năng?",
      "Tại sao RNN không thể tính toán song song toàn bộ chuỗi token cùng lúc?"
    ]
  },
  {
    id: 3,
    slide_number: 3,
    title: "Điểm nghẽn Biểu diễn (Information Bottleneck)",
    subtitle: "Áp lực nén toàn bộ câu vào một vector ẩn có kích thước cố định",
    concept: "Fixed-size Hidden State Information Bottleneck",
    content: "Mô hình cố gắng nén toàn bộ thông tin ngữ cảnh của một câu dài vào một vector ẩn cuối cùng có kích thước cố định (fixed-size hidden state). Cách nén này tạo ra một điểm nghẽn thông tin nghiêm trọng (information bottleneck), đặc biệt khi xử lý các câu dài trên 20-30 từ.",
    bullet_points: [
      "Mô hình cố nén toàn bộ thông tin ngữ cảnh của câu dài vào một vector ẩn cuối cùng có kích thước cố định.",
      "Tạo ra một điểm nghẽn thông tin nghiêm trọng (information bottleneck).",
      "Đặc biệt nghiêm trọng khi xử lý các câu dài trên 20-30 từ."
    ],
    key_takeaway: "Vector ẩn kích thước cố định là nút thắt cổ chai làm tràn và mất mát ngữ cảnh của câu dài.",
    source_lines: [5, 6],
    source_citation: "transcript-06, lines 5-6",
    source_excerpt: "Mô hình cố gắng nén toàn bộ thông tin ngữ cảnh của một câu dài vào một vector ẩn cuối cùng có kích thước cố định (fixed-size hidden state).\nCách nén này tạo ra một điểm nghẽn thông tin nghiêm trọng (information bottleneck), đặc biệt khi xử lý các câu dài trên 20-30 từ.",
    diagram: {
      type: "sequence_bottleneck",
      title: "Điểm nghẽn thông tin (Information Bottleneck)",
      description: "Câu dài (20-30+ từ) ──> [Vector ẩn cố định (Bottleneck)] ──> Quá tải dung lượng biểu diễn"
    },
    sample_questions: [
      "Information Bottleneck xảy ra khi nào và hậu quả là gì?",
      "Vì sao câu dài trên 20-30 từ lại khiến vector ẩn cố định của RNN quá tải?"
    ]
  },
  {
    id: 4,
    slide_number: 4,
    title: "Hiện tượng Suy giảm Đạo hàm (Vanishing Gradient)",
    subtitle: "Sự đứt gãy ký ức đối với các từ xuất hiện ở vị trí đầu câu",
    concept: "Vanishing Gradient & Memory Degradation",
    content: "Hiện tượng suy giảm đạo hàm (vanishing gradient) cũng khiến RNN dần quên mất thông tin của những từ xuất hiện ở vị trí đầu câu.",
    bullet_points: [
      "Khi lan truyền ngược qua thời gian (BPTT), đạo hàm bị suy giảm theo cấp số nhân.",
      "RNN dần quên mất thông tin của những từ xuất hiện ở vị trí đầu câu.",
      "Các phụ thuộc ngữ nghĩa tầm xa (long-range dependencies) bị đứt đoạn."
    ],
    key_takeaway: "Vanishing gradient khiến RNN bị 'mất trí nhớ tầm xa', không duy trì được mối liên kết giữa đầu và cuối câu.",
    source_lines: [7, 7],
    source_citation: "transcript-06, line 7",
    source_excerpt: "Hiện tượng suy giảm đạo hàm (vanishing gradient) cũng khiến RNN dần quên mất thông tin của những từ xuất hiện ở vị trí đầu câu.",
    diagram: {
      type: "sequence_bottleneck",
      title: "Suy giảm đạo hàm theo chiều dài câu",
      description: "Từ đầu câu (Gradient → 0: Quên) ────────> Từ cuối câu (Gradient mạnh)"
    },
    sample_questions: [
      "Hiện tượng vanishing gradient ảnh hưởng thế nào đến các từ đầu câu?",
      "Làm thế nào để nhận biết mô hình đang bị mất ngữ cảnh tầm xa?"
    ]
  },
  {
    id: 5,
    slide_number: 5,
    title: "Sự ra đời & Ý tưởng Cốt lõi của Attention",
    subtitle: "Giải phóng mô hình: Xóa bỏ hoàn toàn việc ép nén vào một vector duy nhất",
    concept: "No Fixed-Vector Compression Paradigm",
    content: "Cơ chế Attention ra đời nhằm giải quyết triệt để điểm nghẽn biểu diễn cố định này của mô hình tuần tự. Ý tưởng cốt lõi của Attention là: không bắt mô hình phải nén toàn bộ câu vào một vector duy nhất.",
    bullet_points: [
      "Cơ chế Attention ra đời nhằm giải quyết triệt để điểm nghẽn biểu diễn cố định này.",
      "Ý tưởng cốt lõi: KHÔNG bắt mô hình phải nén toàn bộ câu vào một vector duy nhất.",
      "Mở ra lối đi trực tiếp giữa mọi vị trí đầu vào và đầu ra."
    ],
    key_takeaway: "Ý tưởng cốt lõi của Attention: Thay vì nén cố định, hãy mở rộng kết nối trực tiếp đến mọi trạng thái ẩn.",
    source_lines: [8, 9],
    source_citation: "transcript-06, lines 8-9",
    source_excerpt: "Cơ chế Attention ra đời nhằm giải quyết triệt để điểm nghẽn biểu diễn cố định này của mô hình tuần tự.\nÝ tưởng cốt lõi của Attention là: không bắt mô hình phải nén toàn bộ câu vào một vector duy nhất.",
    diagram: {
      type: "attention_overview",
      title: "Sự thay đổi mô hình biểu diễn",
      description: "Cũ: Câu dài → 1 Vector duy nhất | Mới (Attention): Không nén ép → Truy cập tự do"
    },
    sample_questions: [
      "Ý tưởng cốt lõi của Attention khác biệt như thế nào so với cách nén của RNN?",
      "Tại sao việc không bắt mô hình nén vào 1 vector lại giải quyết được điểm nghẽn?"
    ]
  },
  {
    id: 6,
    slide_number: 6,
    title: "Nhìn lại Toàn bộ Trạng thái ẩn & Trọng số Chú ý",
    subtitle: "Đo lường định lượng mức độ liên quan giữa từ hiện tại và các từ khác",
    concept: "Dynamic Attention Weights Allocation",
    content: "Thay vào đó, ở mỗi bước tính toán, mô hình được phép nhìn lại toàn bộ các trạng thái ẩn của tất cả các token trong chuỗi đầu vào. Mô hình sẽ tính toán một tập hợp các trọng số chú ý (attention weights) đại diện cho mức độ liên quan giữa từ hiện tại và các từ khác.",
    bullet_points: [
      "Ở mỗi bước tính toán, mô hình được phép nhìn lại toàn bộ trạng thái ẩn của tất cả các token.",
      "Tính toán tập hợp trọng số chú ý (attention weights) linh hoạt.",
      "Trọng số biểu diễn mức độ liên quan ngữ nghĩa giữa từ hiện tại và các từ khác trong chuỗi."
    ],
    key_takeaway: "Trọng số chú ý (Attention Weights) cho phép mô hình linh hoạt tập trung vào các từ quan trọng nhất.",
    source_lines: [10, 11],
    source_citation: "transcript-06, lines 10-11",
    source_excerpt: "Thay vào đó, ở mỗi bước tính toán, mô hình được phép nhìn lại toàn bộ các trạng thái ẩn của tất cả các token trong chuỗi đầu vào.\nMô hình sẽ tính toán một tập hợp các trọng số chú ý (attention weights) đại diện cho mức độ liên quan giữa từ hiện tại và các từ khác.",
    diagram: {
      type: "attention_overview",
      title: "Cơ chế tính trọng số chú ý",
      description: "Token hiện tại ──> Attention Weights [w_1, w_2, ..., w_T] ──> Tất cả trạng thái ẩn"
    },
    sample_questions: [
      "Trọng số chú ý (attention weights) thể hiện điều gì?",
      "Làm thế nào mô hình biết được từ nào cần chú ý nhiều hơn?"
    ]
  },
  {
    id: 7,
    slide_number: 7,
    title: "Cơ chế Self-Attention: Kết nối All-to-All",
    subtitle: "Mỗi token kết nối trực tiếp với tất cả token khác trong cùng một chuỗi",
    concept: "All-to-All Direct Connectivity",
    content: "Cơ chế Self-Attention (tự chú ý) cho phép mỗi token trong câu kết nối trực tiếp với tất cả các token khác trong cùng chuỗi (kết nối all-to-all).",
    bullet_points: [
      "Cơ chế Self-Attention (tự chú ý) kết nối mỗi token với tất cả các token khác trong cùng chuỗi.",
      "Kết nối all-to-all: Mọi cặp từ đều có đường truyền trực tiếp với nhau.",
      "Độ dài đường truyền thông tin giữa bất kỳ 2 từ nào luôn là O(1) bước."
    ],
    key_takeaway: "Self-Attention thiết lập liên kết all-to-all, xóa bỏ hoàn toàn khoảng cách vật lý trong cấu trúc chuỗi.",
    source_lines: [12, 12],
    source_citation: "transcript-06, line 12",
    source_excerpt: "Cơ chế Self-Attention (tự chú ý) cho phép mỗi token trong câu kết nối trực tiếp với tất cả các token khác trong cùng chuỗi (kết nối all-to-all).",
    diagram: {
      type: "all_to_all_connection",
      title: "Mạng lưới kết nối All-to-All",
      description: "Mọi token i ⟷ Mọi token j (Đường truyền thông tin trực tiếp 1 bước)"
    },
    sample_questions: [
      "Kết nối all-to-all trong Self-Attention mang lại lợi ích gì so với RNN?",
      "Tại sao Self-Attention lại rút ngắn khoảng cách truyền thông tin giữa các từ?"
    ]
  },
  {
    id: 8,
    slide_number: 8,
    title: "Bác bỏ Hiểu lầm: Tính Độc lập với Khoảng cách",
    subtitle: "Hiểu lầm phổ biến: Cho rằng Attention chỉ ưu tiên các từ đứng gần nhau",
    concept: "Distance Invariance & Refutation of Proximity Misconception",
    content: "Một hiểu lầm rất phổ biến là cho rằng Attention chỉ ưu tiên các từ đứng gần nhau trong câu hoặc gán trọng số cố định theo vị trí liền kề. Đây là cách hiểu hoàn toàn sai: Attention KHÔNG phụ thuộc vào khoảng cách vật lý hay khoảng cách từ ngữ giữa các vị trí. Hai từ cách nhau 50 từ trong một đoạn văn bản vẫn có thể có trọng số attention cực kỳ cao nếu chúng có quan hệ tương quan ngữ nghĩa mạnh mẽ.",
    bullet_points: [
      "Hiểu lầm rất phổ biến: Nghĩ rằng Attention chỉ ưu tiên các từ đứng gần nhau hoặc gán cố định theo vị trí liền kề.",
      "Đây là cách hiểu HOÀN TOÀN SAI: Attention KHÔNG phụ thuộc vào khoảng cách vật lý.",
      "Hai từ cách nhau 50 từ vẫn có thể có trọng số attention cực cao nếu tương quan ngữ nghĩa mạnh."
    ],
    key_takeaway: "Cực kỳ quan trọng: Attention không phải hàm gán theo khoảng cách; tương quan ngữ nghĩa mới quyết định trọng số.",
    source_lines: [13, 15],
    source_citation: "transcript-06, lines 13-15",
    source_excerpt: "Một hiểu lầm rất phổ biến là cho rằng Attention chỉ ưu tiên các từ đứng gần nhau trong câu hoặc gán trọng số cố định theo vị trí liền kề.\nĐây là cách hiểu hoàn toàn sai: Attention KHÔNG phụ thuộc vào khoảng cách vật lý hay khoảng cách từ ngữ giữa các vị trí.\nHai từ cách nhau 50 từ trong một đoạn văn bản vẫn có thể có trọng số attention cực kỳ cao nếu chúng có quan hệ tương quan ngữ nghĩa mạnh mẽ.",
    diagram: {
      type: "all_to_all_connection",
      title: "Tính độc lập với khoảng cách vật lý",
      description: "Khoảng cách = 1 từ hay 50 từ ──> Attention Weight phụ thuộc NỘI DUNG, KHÔNG phụ thuộc VỊ TRÍ"
    },
    sample_questions: [
      "Vì sao quan niệm 'Attention ưu tiên từ đứng gần' lại là hiểu lầm hoàn toàn sai?",
      "Nếu hai từ cách nhau 50 từ thì Attention hoạt động thế nào?"
    ]
  },
  {
    id: 9,
    slide_number: 9,
    title: "Phân tích Ví dụ Thực tế: 'Con mèo ... xuất hiện'",
    subtitle: "Minh chứng trực quan từ bài giảng về liên kết ngữ nghĩa vượt khoảng cách xa",
    concept: "Long-Range Semantic Dependency Concrete Proof",
    content: "Ví dụ trong câu \"Con mèo mà tôi nhìn thấy tuần trước ở công viên hôm nay lại xuất hiện\", từ \"xuất hiện\" sẽ có attention cao tới \"Con mèo\".",
    bullet_points: [
      "Câu ví dụ: \"Con mèo mà tôi nhìn thấy tuần trước ở công viên hôm nay lại xuất hiện\".",
      "Khoảng cách giữa chủ ngữ \"Con mèo\" và vị ngữ \"xuất hiện\" là hơn 10 từ bổ nghĩa.",
      "Mặc dù ở xa nhau, từ \"xuất hiện\" vẫn có trọng số attention cao nhất tới \"Con mèo\"."
    ],
    key_takeaway: "Ví dụ 'Con mèo... xuất hiện' chứng minh hùng hồn rằng ngữ nghĩa vượt qua mọi rào cản khoảng cách.",
    source_lines: [16, 16],
    source_citation: "transcript-06, line 16",
    source_excerpt: "Ví dụ trong câu \"Con mèo mà tôi nhìn thấy tuần trước ở công viên hôm nay lại xuất hiện\", từ \"xuất hiện\" sẽ có attention cao tới \"Con mèo\".",
    diagram: {
      type: "all_to_all_connection",
      title: "Ví dụ thực tế từ bài học",
      description: "[Con mèo] ──── (tuần trước ở công viên hôm nay lại...) ──── [xuất hiện] (Trọng số attention cực cao)"
    },
    sample_questions: [
      "Trong câu ví dụ ở dòng 16, tại sao 'xuất hiện' lại chú ý nhiều nhất tới 'Con mèo'?",
      "Nếu dùng RNN thì câu ví dụ này gặp nguy cơ gì ở từ cuối?"
    ]
  },
  {
    id: 10,
    slide_number: 10,
    title: "Bộ ba Vector Biểu diễn: Query, Key và Value (Q, K, V)",
    subtitle: "Chiếu tuyến tính token vào 3 không gian chức năng chuyên biệt",
    concept: "Linear Projections for Query, Key, and Value",
    content: "Để thực hiện tính toán Attention, mỗi token đầu vào được chiếu qua ba ma trận trọng số tuyến tính để tạo ra ba vector: Query (Q), Key (K) và Value (V). Query (Q) là vector đại diện cho câu hỏi hoặc thông tin mà token hiện tại đang cần tìm kiếm từ ngữ cảnh xung quanh.",
    bullet_points: [
      "Mỗi token đầu vào được chiếu qua ba ma trận trọng số tuyến tính W_Q, W_K, W_V.",
      "Tạo ra ba vector: Query (Q), Key (K) và Value (V).",
      "Query (Q): Vector đại diện cho câu hỏi hoặc thông tin token hiện tại đang cần tìm kiếm."
    ],
    key_takeaway: "Query đại diện cho nhu cầu tìm kiếm thông tin của token từ ngữ cảnh xung quanh.",
    source_lines: [17, 18],
    source_citation: "transcript-06, lines 17-18",
    source_excerpt: "Để thực hiện tính toán Attention, mỗi token đầu vào được chiếu qua ba ma trận trọng số tuyến tính để tạo ra ba vector: Query (Q), Key (K) và Value (V).\nQuery (Q) là vector đại diện cho câu hỏi hoặc thông tin mà token hiện tại đang cần tìm kiếm từ ngữ cảnh xung quanh.",
    diagram: {
      type: "qkv_triplet",
      title: "Phép chiếu sinh vector Query",
      description: "Token đầu vào x_i ──(nhân ma trận W_Q)──> Vector Query Q_i (Nhu cầu tìm kiếm)"
    },
    sample_questions: [
      "Mỗi token được chiếu qua những ma trận nào để tạo ra Q, K, V?",
      "Bản chất và vai trò của vector Query (Q) là gì?"
    ]
  },
  {
    id: 11,
    slide_number: 11,
    title: "Vai trò của Key (K) và Value (V) trong Đối sánh",
    subtitle: "Định danh đặc trưng và kho nội dung ngữ nghĩa thực tế",
    concept: "Key Identifier Matching & Value Aggregation",
    content: "Key (K) đóng vai trò như nhãn định danh hoặc đặc trưng của từng token trong chuỗi, dùng để đối sánh với Query. Value (V) chứa nội dung thông tin thực sự của token đó, sẽ được tổng hợp lại dựa trên trọng số sau khi đối sánh.",
    bullet_points: [
      "Key (K): Đóng vai trò như nhãn định danh hoặc đặc trưng của từng token trong chuỗi, dùng để đối sánh với Query.",
      "Value (V): Chứa nội dung thông tin thực sự của token đó.",
      "Nội dung Value sẽ được tổng hợp lại dựa trên trọng số sau khi đối sánh Query với Key."
    ],
    key_takeaway: "Key là nhãn để so khớp; Value là kho thông tin thực tế được tổng hợp theo trọng số.",
    source_lines: [19, 20],
    source_citation: "transcript-06, lines 19-20",
    source_excerpt: "Key (K) đóng vai trò như nhãn định danh hoặc đặc trưng của từng token trong chuỗi, dùng để đối sánh với Query.\nValue (V) chứa nội dung thông tin thực sự của token đó, sẽ được tổng hợp lại dựa trên trọng số sau khi đối sánh.",
    diagram: {
      type: "qkv_triplet",
      title: "Đối sánh Key và Tổng hợp Value",
      description: "Query (câu hỏi) × Key (nhãn) ──> Trọng số xác suất ──> Nhân Value (nội dung thực)"
    },
    sample_questions: [
      "Key và Value khác nhau như thế nào về mặt chức năng?",
      "Tại sao không nhân trực tiếp Query với Value mà phải qua Key?"
    ]
  },
  {
    id: 12,
    slide_number: 12,
    title: "Scaled Dot-Product: Tích Vô hướng & Đo Tương đồng",
    subtitle: "Công thức tổng quát và bước nhân vô hướng giữa Query và Key",
    concept: "Dot-Product Semantic Similarity Measurement",
    content: "Quá trình tính toán Attention được gọi là Scaled Dot-Product Attention, theo công thức toán học: Attention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V. Bước đầu tiên là nhân vô hướng (dot-product) giữa vector Query của token hiện tại với tất cả các vector Key của chuỗi: score = Q * K^T. Tích vô hướng này phản ánh mức độ tương đồng hoặc độ phù hợp ngữ nghĩa giữa Query và từng Key.",
    bullet_points: [
      "Công thức chuẩn: Attention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V.",
      "Bước đầu tiên: Nhân vô hướng (dot-product) score = Q * K^T.",
      "Tích vô hướng phản ánh độ tương đồng hướng hoặc độ phù hợp ngữ nghĩa giữa Query và từng Key."
    ],
    key_takeaway: "Tích vô hướng Q · K^T là thước đo độ tương đồng ngữ nghĩa toán học cốt lõi.",
    source_lines: [21, 23],
    source_citation: "transcript-06, lines 21-23",
    source_excerpt: "Quá trình tính toán Attention được gọi là Scaled Dot-Product Attention, theo công thức toán học: Attention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V.\nBước đầu tiên là nhân vô hướng (dot-product) giữa vector Query của token hiện tại với tất cả các vector Key của chuỗi: score = Q * K^T.\nTích vô hướng này phản ánh mức độ tương đồng hoặc độ phù hợp ngữ nghĩa giữa Query và từng Key.",
    diagram: {
      type: "scaled_dot_product_flow",
      title: "Bước 1: Nhân vô hướng Query và Key",
      description: "Vector Query Q_i · Vector Key K_j^T ──> Điểm tương đồng score_ij"
    },
    sample_questions: [
      "Tích vô hướng giữa Query và Key thể hiện điều gì?",
      "Khi hai vector Q và K cùng hướng thì điểm số score sẽ thế nào?"
    ]
  },
  {
    id: 13,
    slide_number: 13,
    title: "Hệ số Co giãn √d_k & Phòng ngừa Bão hòa Gradient",
    subtitle: "Nguyên lý toán học đằng sau việc chia cho căn bậc hai số chiều d_k",
    concept: "Scaling Factor sqrt(d_k) & Softmax Saturation Guard",
    content: "Sau đó, ta chia tích vô hướng cho căn bậc hai kích thước vector Key là sqrt(d_k) để co giãn độ lớn điểm số (scaling factor). Nếu không có hệ số sqrt(d_k), khi số chiều d_k lớn, tích vô hướng sẽ rất lớn, đẩy hàm softmax vào các vùng có đạo hàm cực nhỏ (gradient saturation).",
    bullet_points: [
      "Chia tích vô hướng cho căn bậc hai kích thước vector Key sqrt(d_k) để co giãn độ lớn điểm số.",
      "Nếu không có sqrt(d_k), khi số chiều d_k lớn, tích vô hướng sẽ rất lớn.",
      "Tích vô hướng quá lớn đẩy hàm softmax vào vùng có đạo hàm cực nhỏ (gradient saturation), triệt tiêu việc cập nhật trọng số."
    ],
    key_takeaway: "Hệ số sqrt(d_k) bảo vệ mô hình khỏi bão hòa gradient, đảm bảo quá trình học diễn ra ổn định.",
    source_lines: [24, 25],
    source_citation: "transcript-06, lines 24-25",
    source_excerpt: "Sau đó, ta chia tích vô hướng cho căn bậc hai kích thước vector Key là sqrt(d_k) để co giãn độ lớn điểm số (scaling factor).\nNếu không có hệ số sqrt(d_k), khi số chiều d_k lớn, tích vô hướng sẽ rất lớn, đẩy hàm softmax vào các vùng có đạo hàm cực nhỏ (gradient saturation).",
    code_snippet: {
      language: "python",
      code: `import torch
import math

# Minh họa vai trò của sqrt(d_k):
d_k = 64
scale = math.sqrt(d_k)  # = 8.0

# Nếu không chia sqrt(d_k), tích vô hướng có thể đạt 80:
# softmax([80.0, 10.0]) -> [1.0, 0.0] => Gradient xấp xỉ 0 (Bão hòa!)
# Khi chia cho 8.0, điểm số trở về [10.0, 1.25] => Gradient mượt mà!`
    },
    diagram: {
      type: "scaled_dot_product_flow",
      title: "Hệ số co giãn sqrt(d_k)",
      description: "Điểm số lớn Q·K^T ──(chia sqrt(d_k))──> Điểm số chuẩn hóa (Ngừa bão hòa đạo hàm)"
    },
    sample_questions: [
      "Tại sao khi d_k lớn thì tích vô hướng lại có độ lớn rất lớn?",
      "Hiện tượng gradient saturation trong softmax nguy hiểm thế nào đối với việc huấn luyện?"
    ]
  },
  {
    id: 14,
    slide_number: 14,
    title: "Chuẩn hóa Softmax & Tổng hợp Vector Value (V)",
    subtitle: "Chuyển đổi điểm số thành phân phối xác suất và lấy tổng có trọng số",
    concept: "Softmax Probability Distribution & Weighted Value Sum",
    content: "Tiếp theo, hàm softmax được áp dụng lên điểm số đã chuẩn hóa để chuyển đổi thành phân phối xác suất có tổng bằng 1. Cuối cùng, ta tính tổng có trọng số của các vector Value (V) nhân với phân phối xác suất vừa thu được từ softmax.",
    bullet_points: [
      "Hàm softmax được áp dụng lên điểm số đã chuẩn hóa để chuyển đổi thành phân phối xác suất có tổng bằng 1.",
      "Cuối cùng: Tính tổng có trọng số của các vector Value (V) nhân với phân phối xác suất thu được.",
      "Kết quả đầu ra là một vector biểu diễn ngữ cảnh phong phú cho từng vị trí."
    ],
    key_takeaway: "Softmax biến điểm thô thành phân phối trọng số xác suất, kết hợp các Value thành biểu diễn hoàn chỉnh.",
    source_lines: [26, 27],
    source_citation: "transcript-06, lines 26-27",
    source_excerpt: "Tiếp theo, hàm softmax được áp dụng lên điểm số đã chuẩn hóa để chuyển đổi thành phân phối xác suất có tổng bằng 1.\nCuối cùng, ta tính tổng có trọng số của các vector Value (V) nhân với phân phối xác suất vừa thu được từ softmax.",
    code_snippet: {
      language: "python",
      code: `import torch
import torch.nn.functional as F

def scaled_dot_product_attention(Q, K, V):
    """
    Q, K: [batch, seq_len, d_k]
    V:    [batch, seq_len, d_v]
    """
    d_k = Q.size(-1)
    scores = torch.matmul(Q, K.transpose(-2, -1)) / (d_k ** 0.5)
    weights = F.softmax(scores, dim=-1)
    output = torch.matmul(weights, V)
    return output, weights`
    },
    diagram: {
      type: "scaled_dot_product_flow",
      title: "Bước Softmax & Nhân Value",
      description: "Điểm đã co giãn ──> Softmax (Tổng = 1) ──(nhân ma trận V)──> Vector đầu ra"
    },
    sample_questions: [
      "Vai trò của hàm Softmax trong công thức Attention là gì?",
      "Biểu diễn đầu ra của Attention được tổng hợp từ những thành phần nào?"
    ]
  },
  {
    id: 15,
    slide_number: 15,
    title: "Tính toán Song song trong Transformer trên GPU",
    subtitle: "Khắc phục triệt để sự phụ thuộc thời gian tuần tự của RNN",
    concept: "Full Sequence Parallel Processing Power",
    content: "Nhờ cơ chế này, mô hình Transformer có thể xử lý song song toàn bộ chuỗi văn bản cùng một lúc thay vì phải chờ tuần tự từng bước như RNN.",
    bullet_points: [
      "Nhờ cơ chế Attention, Transformer có thể xử lý song song toàn bộ chuỗi văn bản cùng một lúc.",
      "Không cần chờ đợi tuần tự từng bước thời gian t = 1..T như RNN.",
      "Tận dụng tối đa kiến trúc phần cứng tăng tốc GPU/TPU, rút ngắn thời gian huấn luyện từ hàng tuần xuống hàng giờ."
    ],
    key_takeaway: "Khả năng tính toán song song là yếu tố then chốt cho phép đào tạo các mô hình ngôn ngữ khổng lồ.",
    source_lines: [28, 28],
    source_citation: "transcript-06, line 28",
    source_excerpt: "Nhờ cơ chế này, mô hình Transformer có thể xử lý song song toàn bộ chuỗi văn bản cùng một lúc thay vì phải chờ tuần tự từng bước như RNN.",
    diagram: {
      type: "multi_head_architecture",
      title: "Xử lý song song trên GPU",
      description: "Toàn bộ chuỗi [Token 1, Token 2, ..., Token T] ──> Xử lý ĐỒNG THỜI trên GPU"
    },
    sample_questions: [
      "Tại sao Attention lại cho phép xử lý song song còn RNN thì không?",
      "Tính toán song song đã thúc đẩy sự bùng nổ của các mô hình LLM như thế nào?"
    ]
  },
  {
    id: 16,
    slide_number: 16,
    title: "Multi-Head Attention & Tổng kết Nguyên lý Cốt lõi",
    subtitle: "Không gian biểu diễn đa chiều và định nghĩa bản chất cuối cùng",
    concept: "Multi-Head Subspaces & Content-Based Principle",
    content: "Cơ chế Multi-Head Attention mở rộng thêm bằng cách chia Q, K, V thành nhiều không gian biểu diễn con độc lập (h đầu chú ý). Mỗi Attention Head có thể tập trung học một loại tương quan khác nhau: ví dụ một head học cú pháp, một head học quan hệ thực thể, một head học ngữ nghĩa xa. Tóm lại, Attention là cơ chế kết nối linh hoạt, tính toán tương quan ngữ nghĩa thông qua Q, K, V, hoàn toàn không phụ thuộc vào khoảng cách từ gần kề. Học viên cần nắm vững: Attention không phải hàm gán cố định theo vị trí, mà là hàm tính tương quan động dựa trên nội dung biểu diễn.",
    bullet_points: [
      "Multi-Head Attention: Chia Q, K, V thành nhiều không gian biểu diễn con độc lập (h đầu chú ý).",
      "Mỗi Head học một loại tương quan khác nhau: cú pháp ngữ pháp, quan hệ thực thể, ngữ cảnh xa.",
      "TỔNG KẾT: Attention là cơ chế kết nối linh hoạt, tính toán tương quan động dựa trên nội dung biểu diễn qua Q-K-V, hoàn toàn không phụ thuộc khoảng cách vị trí."
    ],
    key_takeaway: "Ghi nhớ cốt lõi: Attention không phải hàm gán cố định theo vị trí, mà là hàm tính tương quan động dựa trên nội dung.",
    source_lines: [29, 32],
    source_citation: "transcript-06, lines 29-32",
    source_excerpt: "Cơ chế Multi-Head Attention mở rộng thêm bằng cách chia Q, K, V thành nhiều không gian biểu diễn con độc lập (h đầu chú ý).\nMỗi Attention Head có thể tập trung học một loại tương quan khác nhau: ví dụ một head học cú pháp, một head học quan hệ thực thể, một head học ngữ nghĩa xa.\nTóm lại, Attention là cơ chế kết nối linh hoạt, tính toán tương quan ngữ nghĩa thông qua Q, K, V, hoàn toàn không phụ thuộc vào khoảng cách từ gần kề.\nHọc viên cần nắm vững: Attention không phải hàm gán cố định theo vị trí, mà là hàm tính tương quan động dựa trên nội dung biểu diễn.",
    diagram: {
      type: "summary_mindmap",
      title: "Tổng kết kiến trúc Attention",
      description: "Multi-Head (h heads) ⟷ Q, K, V Projections ⟷ Scaled Dot-Product ⟷ Dynamic Content Correlation"
    },
    sample_questions: [
      "Multi-Head Attention mang lại lợi thế gì so với Single-Head?",
      "Hãy nhắc lại định nghĩa cốt lõi của Attention Mechanism bằng một câu ngắn gọn."
    ]
  }
];

export function parseCustomTextFileToSlides(text: string, filename: string = "custom.txt"): LessonSlidesResponse {
  const rawLines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (rawLines.length === 0) {
    return {
      lesson_id: "empty",
      lesson_title: "Tài liệu trống",
      source_file: filename,
      total_lines: 0,
      mode: "custom_file",
      total_slides: 1,
      estimated_reading_time: "1 phút",
      slides: [
        {
          id: 1,
          slide_number: 1,
          title: "Tài liệu không có nội dung",
          concept: "Empty File",
          content: "Vui lòng kiểm tra lại nội dung file text đã tải lên.",
          bullet_points: ["File trống."],
          key_takeaway: "Không có dữ liệu.",
          source_lines: [1, 1],
          source_citation: `${filename}, line 1`,
          source_excerpt: "",
        },
      ],
    };
  }

  const chunkSize = Math.max(1, Math.min(3, Math.ceil(rawLines.length / 16)));
  const slides: Slide[] = [];

  for (let i = 0; i < rawLines.length; i += chunkSize) {
    const chunk = rawLines.slice(i, i + chunkSize);
    const slideNum = Math.floor(i / chunkSize) + 1;
    const startLine = i + 1;
    const endLine = Math.min(rawLines.length, i + chunkSize);

    let cleanTitle = chunk[0].replace(/^[#\-\*\d\.\s\[\]]+/, "").trim();
    if (cleanTitle.length > 60) cleanTitle = cleanTitle.substring(0, 57) + "...";
    if (!cleanTitle) cleanTitle = `Chủ đề phần ${slideNum}`;

    slides.push({
      id: slideNum,
      slide_number: slideNum,
      title: `Trang ${slideNum}: ${cleanTitle}`,
      subtitle: `Trích đoạn từ dòng ${startLine} đến dòng ${endLine}`,
      concept: `Phân đoạn từ file ${filename}`,
      content: chunk.join(" "),
      bullet_points: chunk.map((line) => (line.length > 80 ? line.substring(0, 80) + "..." : line)),
      key_takeaway: `Nội dung cốt lõi: ${chunk[0].substring(0, 100)}...`,
      source_lines: [startLine, endLine],
      source_citation: `${filename}, lines ${startLine}-${endLine}`,
      source_excerpt: chunk.join("\n"),
      diagram: {
        type: "summary_mindmap",
        title: `Sơ đồ tóm tắt trang ${slideNum}`,
        description: `Dòng ${startLine}-${endLine} ──> ${cleanTitle}`,
      },
    });
  }

  return {
    lesson_id: filename.replace(/\.[^/.]+$/, ""),
    lesson_title: `Tài liệu bài học: ${filename}`,
    source_file: filename,
    total_lines: rawLines.length,
    mode: "custom_file",
    total_slides: slides.length,
    estimated_reading_time: `${Math.ceil(slides.length * 1.2)} phút`,
    slides,
  };
}

export function getLessonSlidesData(
  lessonId: string = "transcript-06",
  mode: "detailed" | "overview" = "detailed"
): LessonSlidesResponse {
  return {
    lesson_id: lessonId,
    lesson_title: "Attention Mechanism & Transformer (transcript-06)",
    source_file: "transcript-06.txt",
    total_lines: 32,
    mode,
    total_slides: DETAILED_16_SLIDES.length,
    estimated_reading_time: "15-20 phút",
    slides: DETAILED_16_SLIDES,
  };
}
