"""
Backend verification script.
Tests all internal services and the FastAPI endpoints using TestClient.
"""

import sys
import numpy as np
import cv2
from fastapi.testclient import TestClient
from main import app
from models.predictor import predict_skin_tone
from services.image_processor import ImageProcessor
from services.skin_tone_analyzer import SkinToneAnalyzer
from services.recommendation_engine import recommendation_engine


def test_unit_services():
    print("Testing ML Predictor...")
    features = {
        "L": 62.0,
        "a": 14.5,
        "b": 19.2,
        "ita": 28.5,
        "hue": 22.0,
        "saturation": 85.0,
        "value": 175.0
    }
    pred = predict_skin_tone(features)
    assert "skin_tone" in pred, "Prediction missing skin_tone"
    assert "confidence" in pred, "Prediction missing confidence"
    assert "undertone" in pred, "Prediction missing undertone"
    print(f"ML Predictor OK -> Skin Tone: {pred['skin_tone']}, Undertone: {pred['undertone']}, Confidence: {pred['confidence']}")

    print("Testing Recommendation Engine...")
    recs = recommendation_engine.generate_recommendations(
        skin_tone="Medium",
        undertone="Warm",
        dress_type="Saree",
        occasion="Wedding"
    )
    assert len(recs["recommended_colors"]) > 0, "No recommended colors returned"
    assert "outfit_combination" in recs, "No outfit combination returned"
    assert "styling_advice" in recs, "No styling advice returned"
    print(f"Recommendation Engine OK -> Recommended {len(recs['recommended_colors'])} colors, Hero: {recs['outfit_combination']['dress']['name']}")


def test_fastapi_endpoints():
    print("Testing FastAPI TestClient...")
    client = TestClient(app)

    # 1. Health check
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed with {res.status_code}"
    print("Health check OK:", res.json()["status"])

    # 2. Recommendations endpoint
    res = client.post("/api/recommend", json={
        "skin_tone": "Fair",
        "undertone": "Cool",
        "dress_type": "Shirt",
        "occasion": "Office"
    })
    assert res.status_code == 200, f"Recommend failed with {res.status_code}"
    data = res.json()
    assert "palette_groups" in data, "palette_groups missing"
    print(f"API /recommend OK -> Primary colors: {[c['name'] for c in data['palette_groups']['primary_power']]}")

    # 3. Analyze endpoint with synthetic image
    # Create a synthetic image with skin tone swatch
    img = np.full((300, 300, 3), (180, 205, 235), dtype=np.uint8)  # BGR warm beige
    # Draw an oval face
    cv2.ellipse(img, (150, 150), (90, 120), 0, 0, 360, (160, 195, 225), -1)
    _, encoded = cv2.imencode(".jpg", img)
    image_bytes = encoded.tobytes()

    res = client.post(
        "/api/analyze",
        files={"image": ("test_portrait.jpg", image_bytes, "image/jpeg")},
        data={"dress_type": "Gown", "occasion": "Party"}
    )
    assert res.status_code == 200, f"Analyze failed with {res.status_code}: {res.text}"
    analyze_data = res.json()
    assert "skin_tone" in analyze_data, "skin_tone missing"
    assert "recommended_colors" in analyze_data, "recommended_colors missing"
    assert "outfit_combination" in analyze_data, "outfit_combination missing"
    print(f"API /analyze OK -> Detected: {analyze_data['skin_tone']} ({analyze_data['undertone']}), Confidence: {analyze_data['confidence']}")

    print("\nALL BACKEND UNIT & INTEGRATION TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    try:
        test_unit_services()
        test_fastapi_endpoints()
    except Exception as e:
        print(f"Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
