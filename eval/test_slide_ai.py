import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from fastapi.testclient import TestClient
from backend.main import app
from backend.slide_adapter import slide_service

client = TestClient(app)

def run_tests():
    print("============================================================")
    print(" TEST SUITE: TÍNH NĂNG SLIDE AI (MULTI-PAGE & FILE READING)")
    print("============================================================")
    passed = 0
    total = 0

    def assert_test(name, condition, details=""):
        nonlocal passed, total
        total += 1
        if condition:
            passed += 1
            print(f"[PASS] {name}")
        else:
            print(f"[FAIL] {name}: {details}")

    # 1. Test 16-Slide Detailed Mode (Directly reading from file text)
    detailed_data = slide_service.get_lesson_slides("transcript-06", mode="detailed")
    assert_test("Slide Multi-Page - Total slides = 16", detailed_data is not None and detailed_data["total_slides"] == 16)
    
    detailed_slides = detailed_data["slides"]
    assert_test("Slide 1 - Introduction & Turning Point", detailed_slides[0]["slide_number"] == 1 and "Bước ngoặt" in detailed_slides[0]["title"])
    assert_test("Slide 3 - Information Bottleneck", detailed_slides[2]["slide_number"] == 3 and "Điểm nghẽn" in detailed_slides[2]["title"])
    assert_test("Slide 8 - Distance Independence", detailed_slides[7]["slide_number"] == 8 and "Khoảng cách" in detailed_slides[7]["title"])
    assert_test("Slide 9 - Cat Example Analysis", detailed_slides[8]["slide_number"] == 9 and "Con mèo" in detailed_slides[8]["title"])
    assert_test("Slide 10 - Query Vector", detailed_slides[9]["slide_number"] == 10 and "Query" in detailed_slides[9]["title"])
    assert_test("Slide 13 - sqrt(d_k) & Saturation Guard", detailed_slides[12]["slide_number"] == 13 and detailed_slides[12].get("code_snippet") is not None)
    assert_test("Slide 14 - Softmax & PyTorch Code", detailed_slides[13]["slide_number"] == 14 and "softmax" in detailed_slides[13]["code_snippet"]["code"])
    assert_test("Slide 16 - Multi-Head Attention", detailed_slides[15]["slide_number"] == 16 and "Multi-Head" in detailed_slides[15]["title"])

    # 2. Test 7-Slide Overview Mode
    overview_data = slide_service.get_lesson_slides("transcript-06", mode="overview")
    assert_test("Slide Overview - Total slides = 7", overview_data is not None and overview_data["total_slides"] == 7)

    # 3. Test API Endpoints
    res1 = client.get("/api/lessons/transcript-06/slides?mode=detailed")
    assert_test("API Endpoint: GET /api/lessons/transcript-06/slides (detailed 16)", res1.status_code == 200 and res1.json()["total_slides"] == 16)

    res2 = client.get("/api/lessons/transcript-06/slides?mode=overview")
    assert_test("API Endpoint: GET /api/lessons/transcript-06/slides (overview 7)", res2.status_code == 200 and res2.json()["total_slides"] == 7)

    # 4. Test Dynamic File Upload / Parse Endpoint
    res_parse = client.post("/api/slides/parse-file", json={
        "text": "Đoạn 1: Giới thiệu toán học ma trận\nĐoạn 2: Không gian vector con\nĐoạn 3: Tích vô hướng và chuẩn hóa",
        "filename": "linear_algebra.txt"
    })
    assert_test("API Endpoint: POST /api/slides/parse-file", res_parse.status_code == 200 and res_parse.json()["total_slides"] >= 1)

    # 5. Test Session & Chatbot Context Integration on Slide Multi-Page
    res_session = client.post("/api/session/start", json={"student_name": "Nguyen Van A", "lesson_id": "transcript-06"})
    session_id = res_session.json()["session_id"]

    # Action 1: "Giải thích slide này" (Slide 3: Information Bottleneck)
    msg1 = client.post(f"/api/session/{session_id}/message", json={
        "content": "Giải thích nội dung Slide 3 một cách dễ hiểu",
        "lesson_id": "transcript-06",
        "slide_id": 3,
        "slide_title": detailed_slides[2]["title"],
        "slide_content": detailed_slides[2]["content"]
    })
    assert_test("Action 1: 'Giải thích slide này' (Slide 3) HTTP 200", msg1.status_code == 200)
    resp1 = msg1.json()["messages"][-1]
    assert_test("Action 1: Grounded in RNN Bottleneck & Citations", "điểm nghẽn" in resp1["content"].lower() and "transcript-06" in str(resp1.get("citation")))

    # Action 2: "Tóm tắt" (Slide 8: Distance Independence)
    msg2 = client.post(f"/api/session/{session_id}/message", json={
        "content": "Tóm tắt những điểm cốt lõi nhất của Slide 8",
        "lesson_id": "transcript-06",
        "slide_id": 8,
        "slide_title": detailed_slides[7]["title"],
        "slide_content": detailed_slides[7]["content"]
    })
    assert_test("Action 2: 'Tóm tắt' (Slide 8) HTTP 200", msg2.status_code == 200)
    resp2 = msg2.json()["messages"][-1]
    assert_test("Action 2: Grounded in all-to-all & Anti-distance bias", "khoảng cách" in resp2["content"].lower() or "vị trí" in resp2["content"].lower())

    # Action 3: "Ví dụ thực tế" (Slide 9: Cat example)
    msg3 = client.post(f"/api/session/{session_id}/message", json={
        "content": "Hãy cho tôi một ví dụ thực tế trực quan của Slide 9",
        "lesson_id": "transcript-06",
        "slide_id": 9,
        "slide_title": detailed_slides[8]["title"],
        "slide_content": detailed_slides[8]["content"]
    })
    assert_test("Action 3: 'Ví dụ thực tế' (Slide 9) HTTP 200", msg3.status_code == 200)
    resp3 = msg3.json()["messages"][-1]
    assert_test("Action 3: Mentions 'Con mèo' and line 16 citation", "con mèo" in resp3["content"].lower() and "transcript-06" in str(resp3.get("citation")))

    # Action 4: Custom question on Slide 13 (sqrt d_k)
    msg4 = client.post(f"/api/session/{session_id}/message", json={
        "content": "Tại sao trong công thức lại phải chia cho sqrt(d_k)?",
        "lesson_id": "transcript-06",
        "slide_id": 13,
        "slide_title": detailed_slides[12]["title"],
        "slide_content": detailed_slides[12]["content"]
    })
    assert_test("Action 4: Custom question on Slide 13 formula", msg4.status_code == 200)
    resp4 = msg4.json()["messages"][-1]
    assert_test("Action 4: Explains gradient saturation avoidance", "sqrt(d_k)" in resp4["content"] or "bão hòa" in resp4["content"].lower() or "gradient" in resp4["content"].lower())

    print("============================================================")
    print(f" KẾT QUẢ SLIDE AI TEST: {passed}/{total} PASS ({passed/total*100:.1f}%)")
    print("============================================================")
    return passed == total

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
