"""
Recommendation route.
Allows querying the recommendation engine with specified tone, dress type, and occasion.
"""

from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel, Field
from services.recommendation_engine import recommendation_engine

router = APIRouter(tags=["Recommendations"])


class RecommendationRequest(BaseModel):
    skin_tone: str = Field(..., example="Medium")
    undertone: Optional[str] = Field("Warm", example="Warm")
    dress_type: Optional[str] = Field("Saree", example="Saree")
    occasion: Optional[str] = Field("Wedding", example="Wedding")


@router.post("/recommend")
def get_recommendations(req: RecommendationRequest):
    return recommendation_engine.generate_recommendations(
        skin_tone=req.skin_tone,
        undertone=req.undertone or "Neutral",
        dress_type=req.dress_type or "Casual Wear",
        occasion=req.occasion or "Casual"
    )
