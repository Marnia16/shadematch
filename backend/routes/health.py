"""
Health check route.
"""

from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/health")
def get_health():
    return {
        "status": "healthy",
        "service": "ShadeMatch CV/ML API",
        "version": "1.0.0",
        "capabilities": [
            "OpenCV Face & Skin ROI Detection",
            "CIELAB & ITA Colorimetry",
            "Scikit-Learn Predictor Interface",
            "Context-Aware Fashion Recommendation Engine"
        ]
    }
