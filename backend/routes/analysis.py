"""
Analysis route.
Accepts image upload (multipart or base64 JSON), preprocesses with OpenCV,
extracts skin features, predicts skin tone, and returns recommendations.
"""

from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Body
from pydantic import BaseModel
from utils.image_utils import decode_image_bytes, decode_base64_image
from services.image_processor import ImageProcessor
from services.skin_tone_analyzer import SkinToneAnalyzer
from services.recommendation_engine import recommendation_engine

router = APIRouter(tags=["Analysis"])

image_processor = ImageProcessor()
skin_analyzer = SkinToneAnalyzer()


class Base64AnalysisRequest(BaseModel):
    image_base64: str
    dress_type: Optional[str] = "Casual Wear"
    occasion: Optional[str] = "Casual"


@router.post("/analyze")
async def analyze_image_multipart(
    image: Optional[UploadFile] = File(None),
    dress_type: Optional[str] = Form("Casual Wear"),
    occasion: Optional[str] = Form("Casual")
):
    """
    Accepts multipart/form-data image upload.
    """
    if image is None:
        raise HTTPException(
            status_code=400,
            detail="No image provided. Please upload an image file or capture a photo."
        )

    image_bytes = await image.read()
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="The uploaded image file was empty.")

    cv_img = decode_image_bytes(image_bytes)
    if cv_img is None:
        raise HTTPException(
            status_code=400,
            detail="Could not decode the uploaded image. Please ensure it is a valid JPEG, PNG, or WEBP file."
        )

    return _execute_analysis_pipeline(cv_img, dress_type or "Casual Wear", occasion or "Casual")


@router.post("/analyze-json")
async def analyze_image_json(payload: Base64AnalysisRequest):
    """
    Accepts JSON body with base64 data URI (convenient for direct webcam canvas captures).
    """
    if not payload.image_base64:
        raise HTTPException(status_code=400, detail="No base64 image data provided.")

    cv_img = decode_base64_image(payload.image_base64)
    if cv_img is None:
        raise HTTPException(
            status_code=400,
            detail="Could not decode base64 image data. Please ensure it is a valid image."
        )

    return _execute_analysis_pipeline(cv_img, payload.dress_type or "Casual Wear", payload.occasion or "Casual")


def _execute_analysis_pipeline(cv_img, dress_type: str, occasion: str):
    # 1. OpenCV Preprocessing & Face/Skin ROI Extraction
    processed = image_processor.process_image(cv_img)

    # 2. Skin tone & undertone estimation
    tone_data = skin_analyzer.analyze_skin_tone(processed["rgb"], processed["quality"])

    # 3. Context-aware Fashion Recommendations
    recs = recommendation_engine.generate_recommendations(
        skin_tone=tone_data["skin_tone"],
        undertone=tone_data["undertone"],
        dress_type=dress_type,
        occasion=occasion
    )

    # 4. Construct structured response
    return {
        "skin_tone": tone_data["skin_tone"],
        "undertone": tone_data["undertone"],
        "confidence": tone_data["confidence"],
        "sampled_hex": processed["hex"],
        "recommended_colors": recs["recommended_colors"],
        "palette_groups": recs["palette_groups"],
        "outfit_combination": recs["outfit_combination"],
        "styling_advice": recs["styling_advice"],
        "tone_description": tone_data["description"],
        "undertone_description": tone_data["undertone_description"],
        "color_metrics": tone_data["color_metrics"],
        "face_detected": processed["face_detected"],
        "face_rect": processed["face_rect"],
        "lighting_quality": processed["quality"]["quality_status"],
        "lighting_score": processed["quality"]["brightness"],
        "warnings": processed["warnings"],
        "model_metadata": tone_data["model_metadata"],
        "disclaimer": recs["disclaimer"]
    }
