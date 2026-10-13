"""
ShadeMatch Backend Test Suite.
Verifies ML Predictor, Recommendation Engine, Image Analysis,
Garment Catalog, and Hosted OOTDiffusion Gradio VTON integration with mocked calls.

NOTE: As per project requirements, external model calls are mocked to avoid
consuming Hugging Face quota. Tests verify backend integration, input validation,
endpoint selection, error handling, and response contracts.
"""

import sys
import os
import base64
import tempfile
import unittest
from unittest.mock import patch, MagicMock
import numpy as np
import cv2
from fastapi.testclient import TestClient

from main import app
from models.predictor import predict_skin_tone
from services.image_processor import ImageProcessor
from services.skin_tone_analyzer import SkinToneAnalyzer
from services.recommendation_engine import recommendation_engine
from services.garment_catalog import garment_catalog
from services.virtual_tryon_service import (
    virtual_tryon_service,
    HostedOOTDiffusionProvider,
    map_category_and_endpoint,
    _extract_image_reference,
    _load_image_bytes,
    _bytes_to_data_url
)


def test_ml_and_recommendations():
    print("\n--- 1. Testing ML Predictor & Recommendation Engine ---")
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
    print(f"✓ ML Predictor OK -> Skin Tone: {pred['skin_tone']}, Undertone: {pred['undertone']}, Confidence: {pred['confidence']}")

    recs = recommendation_engine.generate_recommendations(
        skin_tone="Medium",
        undertone="Warm",
        dress_type="Saree",
        occasion="Wedding"
    )
    assert len(recs["recommended_colors"]) > 0, "No recommended colors returned"
    assert "outfit_combination" in recs, "No outfit combination returned"
    assert "styling_advice" in recs, "No styling advice returned"
    print(f"✓ Recommendation Engine OK -> Recommended {len(recs['recommended_colors'])} colors, Hero: {recs['outfit_combination']['dress']['name']}")


def test_garment_catalog():
    print("\n--- 2. Testing Data-Driven Garment Catalog (Real Photography) ---")
    available = garment_catalog.get_available_garments()
    assert len(available) >= 4, f"Expected at least 4 available garments on disk, got {len(available)}"
    print(f"✓ Available real photography garments: {len(available)}")
    for g in available:
        print(f"   • {g['title']} ({g['color_name']} {g['dress_type']})")

    # A. Test exact match for Emerald Green Saree
    saree = garment_catalog.get_garment("Saree", "Emerald Green", "#0D7A53")
    assert saree is not None, "Emerald Green Saree should exist on disk"
    assert len(saree["image_bytes"]) > 1000, "Garment image bytes empty"
    assert saree["category"] == "dress", "Category mapping mismatch"
    assert saree["is_placeholder"] is False, "Garment must NOT be a placeholder"
    print(f"✓ Found real garment asset: {saree['filename']} ({len(saree['image_bytes'])} bytes)")

    # B. Test alias match (Burgundy matches Maroon Saree)
    maroon_saree = garment_catalog.get_garment("Saree", "Burgundy", "#800020")
    assert maroon_saree is not None, "Burgundy should match Maroon Saree via alias"
    print(f"✓ Found via alias: {maroon_saree['filename']}")

    # C. Test Navy Shirt
    navy_shirt = garment_catalog.get_garment("Shirt", "Navy Blue", "#12263F")
    assert navy_shirt is not None, "Navy Blue Shirt should exist on disk"
    assert navy_shirt["category"] == "upperbody"
    print(f"✓ Found tops asset: {navy_shirt['filename']}")

    # D. Test unavailable garment returns None (Zero fake polygon guarantee)
    neon_tux = garment_catalog.get_garment("Tuxedo", "Neon Orange", "#FF5F1F")
    assert neon_tux is None, "Unavailable garment must return None (NO fake polygons)"
    print("✓ Unavailable garment returns None (Zero fake templates confirmed)")


def test_category_and_endpoint_mapping():
    print("\n--- 3. Testing Category & Gradio Endpoint Mapping ---")
    # Upper-body mappings -> /process_hd
    for cat in ("upperbody", "tops", "shirt", "kurti"):
        mapping = map_category_and_endpoint(cat)
        assert mapping["supported"] is True
        assert mapping["api_name"] == "/process_hd"
    print("✓ Upper-body correctly routes to /process_hd")

    # Dress mappings -> /process_dc with category Dress
    for cat in ("dress", "one-pieces", "saree", "gown"):
        mapping = map_category_and_endpoint(cat)
        assert mapping["supported"] is True
        assert mapping["api_name"] == "/process_dc"
        assert mapping["category"] == "Dress"
    print("✓ Dress / Traditional wear correctly routes to /process_dc (Dress)")

    # Lower-body mappings -> /process_dc with category Lower-body
    for cat in ("lowerbody", "bottoms", "pants", "skirt"):
        mapping = map_category_and_endpoint(cat)
        assert mapping["supported"] is True
        assert mapping["api_name"] == "/process_dc"
        assert mapping["category"] == "Lower-body"
    print("✓ Lower-body correctly routes to /process_dc (Lower-body)")

    # Unsupported category
    unsupported = map_category_and_endpoint("footwear")
    assert unsupported["supported"] is False
    print("✓ Unsupported categories correctly flagged (supported = False)")


def test_image_loading_and_retrieval():
    print("\n--- 4. Testing Output Image Extraction & Retrieval ---")
    # Extract reference from gallery response list
    res_list = [{"image": "/tmp/gradio/test.webp", "caption": None}]
    assert _extract_image_reference(res_list) == "/tmp/gradio/test.webp"

    # Test local file retrieval
    with tempfile.NamedTemporaryFile(suffix=".webp", delete=False) as tf:
        dummy_webp = b"RIFF\x1a\x00\x00\x00WEBPVP8 \x0e\x00\x00\x00"
        tf.write(dummy_webp)
        tf.flush()
        tf_name = tf.name

    try:
        retrieved_bytes = _load_image_bytes(tf_name, "levihsu/OOTDiffusion")
        assert retrieved_bytes == dummy_webp
        data_url = _bytes_to_data_url(retrieved_bytes, tf_name)
        assert data_url.startswith("data:image/webp;base64,")
        print("✓ Local file output extraction and data URL conversion verified")
    finally:
        if os.path.exists(tf_name):
            os.remove(tf_name)

    # Test remote URL retrieval via mocked httpx
    mock_resp = MagicMock()
    mock_resp.content = b"\xff\xd8\xff\xe0test_jpeg"
    with patch("httpx.Client.get", return_value=mock_resp):
        url_bytes = _load_image_bytes("https://example.com/styled.jpg", "levihsu/OOTDiffusion")
        assert url_bytes == b"\xff\xd8\xff\xe0test_jpeg"
        print("✓ Remote URL output retrieval verified")


def test_hosted_ootdiffusion_without_cuda():
    print("\n--- 5. Testing Hosted Provider Availability (Callable Without CUDA) ---")
    with patch.dict(os.environ, {"OOTD_WORKER_URL": ""}, clear=True):
        provider = HostedOOTDiffusionProvider()
        assert provider.is_available is True
        assert provider.is_configured is True
        assert "levihsu/OOTDiffusion" in provider.environment_type
        print("✓ Hosted provider accurately reports is_available = True without local CUDA")


def test_fastapi_tryon_endpoints_mocked():
    print("\n--- 6. Testing FastAPI Try-On Endpoints (Mocked Gradio Client) ---")
    client = TestClient(app)

    # Synthetic portrait
    img = np.full((400, 400, 3), (180, 205, 235), dtype=np.uint8)
    cv2.ellipse(img, (200, 160), (70, 90), 0, 0, 360, (160, 195, 225), -1)
    _, encoded = cv2.imencode(".jpg", img)
    image_bytes = encoded.tobytes()

    created_dummy_files = []

    def _create_mock_predict_output(*args, **kwargs):
        f = tempfile.NamedTemporaryFile(suffix=".webp", delete=False)
        dummy_webp_bytes = b"RIFF\x20\x00\x00\x00WEBPVP8 \x12\x00\x00\x00\x30\x01\x00\x9d\x01\x2a"
        f.write(dummy_webp_bytes)
        f.flush()
        f.close()
        created_dummy_files.append(f.name)
        return [{"image": f.name, "caption": None}]

    mock_gradio_client = MagicMock()
    mock_gradio_client.predict.side_effect = _create_mock_predict_output

    try:
        # A. Successful Hosted Inference (Multipart endpoint with Dress -> /process_dc)
        with patch("gradio_client.Client", return_value=mock_gradio_client):
            res = client.post(
                "/api/try-on",
                files={"image": ("portrait.jpg", image_bytes, "image/jpeg")},
                data={
                    "dress_type": "Saree",
                    "color_name": "Emerald Green",
                    "color_hex": "#0D7A53"
                }
            )
            assert res.status_code == 200
            data = res.json()
            assert data["success"] is True
            assert data["provider"] == "OOTDiffusion (Hosted Gradio)"
            assert data["image_url"].startswith("data:image/webp;base64,")
            assert data["garment"]["dress_type"] == "Saree"
            assert data["endpoint"] == "/process_dc"
            # Verify predict was called with category='Dress' and api_name='/process_dc'
            call_kwargs = mock_gradio_client.predict.call_args.kwargs
            assert call_kwargs["category"] == "Dress"
            assert call_kwargs["api_name"] == "/process_dc"
            print("✓ POST /api/try-on (Dress) successfully called /process_dc with category=Dress")

        # B. Successful Hosted Inference (JSON endpoint with Shirt -> /process_hd)
        with patch("gradio_client.Client", return_value=mock_gradio_client):
            b64_str = f"data:image/jpeg;base64,{base64.b64encode(image_bytes).decode('utf-8')}"
            res_json = client.post(
                "/api/try-on-json",
                json={
                    "image_base64": b64_str,
                    "dress_type": "Shirt",
                    "color_name": "Navy Blue",
                    "color_hex": "#12263F"
                }
            )
            assert res_json.status_code == 200
            json_data = res_json.json()
            assert json_data["success"] is True
            assert json_data["endpoint"] == "/process_hd"
            call_kwargs = mock_gradio_client.predict.call_args.kwargs
            assert call_kwargs["api_name"] == "/process_hd"
            print("✓ POST /api/try-on-json (Shirt) successfully called /process_hd")

        # C. Remote Inference Failure Handling
        mock_fail_client = MagicMock()
        mock_fail_client.predict.side_effect = RuntimeError("Hugging Face Space queue full (503)")
        with patch("gradio_client.Client", return_value=mock_fail_client):
            res_err = client.post(
                "/api/try-on",
                files={"image": ("portrait.jpg", image_bytes, "image/jpeg")},
                data={
                    "dress_type": "Saree",
                    "color_name": "Emerald Green",
                    "color_hex": "#0D7A53"
                }
            )
            assert res_err.status_code == 200
            err_data = res_err.json()
            assert err_data["success"] is False
            assert err_data["error"] == "VTON_INFERENCE_FAILED"
            assert "Hugging Face Space" in err_data["message"]
            print("✓ Remote inference failure handled cleanly (error: VTON_INFERENCE_FAILED)")

        # D. Missing / Invalid Output from Space
        mock_empty_client = MagicMock()
        mock_empty_client.predict.return_value = []
        with patch("gradio_client.Client", return_value=mock_empty_client):
            res_empty = client.post(
                "/api/try-on",
                files={"image": ("portrait.jpg", image_bytes, "image/jpeg")},
                data={
                    "dress_type": "Saree",
                    "color_name": "Emerald Green",
                    "color_hex": "#0D7A53"
                }
            )
            assert res_empty.status_code == 200
            empty_data = res_empty.json()
            assert empty_data["success"] is False
            assert empty_data["error"] == "VTON_INVALID_OUTPUT"
            print("✓ Empty output handled cleanly (error: VTON_INVALID_OUTPUT)")

        # E. Unsupported Garment Category
        with patch.object(garment_catalog, "get_garment", return_value={
            "garment_id": "custom_shoes",
            "dress_type": "Shoes",
            "color_name": "Gold",
            "category": "footwear",
            "image_bytes": b"fake_bytes"
        }):
            res_unsupported = client.post(
                "/api/try-on",
                files={"image": ("portrait.jpg", image_bytes, "image/jpeg")},
                data={
                    "dress_type": "Shoes",
                    "color_name": "Gold",
                    "color_hex": "#D4AF37"
                }
            )
            assert res_unsupported.status_code == 200
            unsup_data = res_unsupported.json()
            assert unsup_data["success"] is False
            assert unsup_data["error"] == "UNSUPPORTED_GARMENT_CATEGORY"
            print("✓ Unsupported garment category handled cleanly (error: UNSUPPORTED_GARMENT_CATEGORY)")

        # F. Unavailable Garment Asset on Disk
        res_unavail = client.post(
            "/api/try-on",
            files={"image": ("portrait.jpg", image_bytes, "image/jpeg")},
            data={
                "dress_type": "Tuxedo",
                "color_name": "Neon Orange",
                "color_hex": "#FF5F1F"
            }
        )
        assert res_unavail.status_code == 200
        unavail_data = res_unavail.json()
        assert unavail_data["success"] is False
        assert unavail_data["error"] == "GARMENT_ASSET_UNAVAILABLE"
        print("✓ Missing garment asset returns GARMENT_ASSET_UNAVAILABLE")

    finally:
        for fpath in created_dummy_files:
            if os.path.exists(fpath):
                try:
                    os.remove(fpath)
                except Exception:
                    pass


def test_health_check_endpoint():
    print("\n--- 7. Testing Health Check Endpoint ---")
    client = TestClient(app)
    res = client.get("/api/health")
    assert res.status_code == 200
    h = res.json()
    assert h["status"] == "healthy"
    assert h["vton_available"] is True
    assert h["vton"]["provider"] == "OOTDiffusion (Hosted Gradio)"
    assert h["vton"]["mode"] == "hosted"
    assert "token_configured" in h["vton"]
    assert isinstance(h["vton"]["token_configured"], bool)
    assert h["vton"]["available_garments_count"] >= 4
    print(f"✓ Health check OK -> Provider: {h['vton']['provider']}, Mode: {h['vton']['mode']}, Token Configured: {h['vton']['token_configured']}")


def test_vton_error_classifications_and_token_handling():
    print("\n--- 8. Testing Specific Error Classifications & Safe Diagnostics ---")
    client = TestClient(app)

    # 1. Verify token sanitization & boolean-only presence detection
    with patch.dict(os.environ, {"HF_TOKEN": "  \"hf_test_token_123\"  "}, clear=True):
        provider = HostedOOTDiffusionProvider()
        assert provider.hf_token == "hf_test_token_123"
        assert provider.is_token_configured is True

    with patch.dict(os.environ, {"HF_TOKEN": ""}, clear=True):
        provider_empty = HostedOOTDiffusionProvider()
        assert provider_empty.hf_token is None
        assert provider_empty.is_token_configured is False

    # Synthetic portrait
    img = np.full((100, 100, 3), 200, dtype=np.uint8)
    _, encoded = cv2.imencode(".jpg", img)
    portrait_bytes = encoded.tobytes()

    # 2. HTTP 401 Unauthorized -> VTON_AUTH_FAILED
    mock_auth_fail = MagicMock()
    mock_auth_fail.predict.side_effect = RuntimeError("401 Client Error: Unauthorized for url")
    with patch("gradio_client.Client", return_value=mock_auth_fail):
        res = client.post(
            "/api/try-on",
            files={"image": ("portrait.jpg", portrait_bytes, "image/jpeg")},
            data={"dress_type": "Saree", "color_name": "Emerald Green"}
        )
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is False
        assert data["error"] == "VTON_AUTH_FAILED"
        assert "401" in data["message"]
        print("✓ HTTP 401 correctly classified as VTON_AUTH_FAILED")

    # 3. HTTP 403 Forbidden -> VTON_FORBIDDEN
    mock_forbidden = MagicMock()
    mock_forbidden.predict.side_effect = RuntimeError("403 Client Error: Forbidden. Access denied.")
    with patch("gradio_client.Client", return_value=mock_forbidden):
        res = client.post(
            "/api/try-on",
            files={"image": ("portrait.jpg", portrait_bytes, "image/jpeg")},
            data={"dress_type": "Saree", "color_name": "Emerald Green"}
        )
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is False
        assert data["error"] == "VTON_FORBIDDEN"
        assert "Read" in data["message"]
        print("✓ HTTP 403 correctly classified as VTON_FORBIDDEN")

    # 4. ZeroGPU Quota Exceeded with Token -> VTON_ZEROGPU_QUOTA_EXCEEDED (account quota)
    mock_quota_fail = MagicMock()
    mock_quota_fail.predict.side_effect = RuntimeError("You have exceeded your GPU quota (60s left). Try again in 2 hours.")
    with patch.dict(os.environ, {"HF_TOKEN": "hf_valid_token"}, clear=True):
        with patch("gradio_client.Client", return_value=mock_quota_fail):
            res = client.post(
                "/api/try-on",
                files={"image": ("portrait.jpg", portrait_bytes, "image/jpeg")},
                data={"dress_type": "Saree", "color_name": "Emerald Green"}
            )
            assert res.status_code == 200
            data = res.json()
            assert data["success"] is False
            assert data["error"] == "VTON_ZEROGPU_QUOTA_EXCEEDED"
            assert data["token_configured"] is True
            assert "account" in data["message"]
            print("✓ ZeroGPU quota with token correctly explains user account quota limit")

    # 5. ZeroGPU Quota Exceeded without Token -> VTON_ZEROGPU_QUOTA_EXCEEDED (anonymous IP)
    with patch.dict(os.environ, {"HF_TOKEN": ""}, clear=True):
        with patch("gradio_client.Client", return_value=mock_quota_fail):
            res = client.post(
                "/api/try-on",
                files={"image": ("portrait.jpg", portrait_bytes, "image/jpeg")},
                data={"dress_type": "Saree", "color_name": "Emerald Green"}
            )
            assert res.status_code == 200
            data = res.json()
            assert data["success"] is False
            assert data["error"] == "VTON_ZEROGPU_QUOTA_EXCEEDED"
            assert data["token_configured"] is False
            assert "anonymous shared IP" in data["message"]
            print("✓ ZeroGPU quota without token prompts for HF_TOKEN configuration")


if __name__ == "__main__":
    try:
        test_ml_and_recommendations()
        test_garment_catalog()
        test_category_and_endpoint_mapping()
        test_image_loading_and_retrieval()
        test_hosted_ootdiffusion_without_cuda()
        test_fastapi_tryon_endpoints_mocked()
        test_health_check_endpoint()
        test_vton_error_classifications_and_token_handling()
        print("\n==================================================================")
        print("STATUS REPORT:")
        print("  • Backend Hosted OOTDiffusion Integration Tests: PASSED (0 failures)")
        print("  • Real External Hugging Face Inference: MOCKED (Preserves quota)")
        print("==================================================================\n")
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
