from fastapi import APIRouter
from services.virtual_tryon_service import virtual_tryon_service

router = APIRouter(tags=["Health"])


@router.get("/health")
def get_health():
    vton_info = virtual_tryon_service.get_status()
    return {
        "status": "healthy",
        "service": "ShadeMatch CV/ML & VTON API",
        "version": "1.4.0",
        "vton_available": vton_info["available"],
        "vton": vton_info,
        "capabilities": [
            "OpenCV Face & Skin ROI Detection",
            "CIELAB & ITA Colorimetry",
            "Scikit-Learn Predictor Interface",
            "Context-Aware Fashion Recommendation Engine",
            "Hosted Generative AI Virtual Try-On (OOTDiffusion)"
        ]
    }
