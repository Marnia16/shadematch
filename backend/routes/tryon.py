"""
Virtual Try-On Router for ShadeMatch.
Provides endpoints for open-source AI Virtual Try-On using real garment photography and OOTDiffusion.
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

from services.garment_catalog import garment_catalog
from services.virtual_tryon_service import virtual_tryon_service
from utils.image_utils import decode_base64_image

router = APIRouter(prefix="/try-on", tags=["Virtual Try-On"])


class TryOnJsonRequest(BaseModel):
    image_base64: str = Field(..., description="Base64 encoded user portrait image")
    dress_type: str = Field(default="Casual Wear", description="Selected silhouette (e.g. Saree, Gown, Shirt, Kurti)")
    color_name: str = Field(..., description="Recommended color name (e.g. Emerald Green)")
    color_hex: Optional[str] = Field(default="#0D7A53", description="Hex color code (e.g. #0D7A53)")
    occasion: Optional[str] = Field(default="Casual", description="Optional styling occasion")


@router.get("/garments")
def get_available_garments():
    """
    Returns the list of real garment reference photography assets available in the catalog.
    """
    return {
        "status": "success",
        "garments": garment_catalog.get_available_garments()
    }


@router.post("")
async def create_virtual_tryon(
    image: UploadFile = File(..., description="User portrait photo"),
    dress_type: str = Form("Casual Wear"),
    color_name: str = Form(...),
    color_hex: Optional[str] = Form("#0D7A53"),
    occasion: Optional[str] = Form("Casual")
):
    """
    Generates a virtual try-on visual representation from an uploaded image file via open-source OOTDiffusion.
    """
    # 1. Read uploaded image bytes
    contents = await image.read()
    if not contents or len(contents) < 500:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded image file is empty or corrupted."
        )

    # 2. Execute Virtual Try-On
    result = await virtual_tryon_service.run_try_on(
        person_bytes=contents,
        dress_type=dress_type,
        color_name=color_name,
        color_hex=color_hex
    )

    return result


@router.post("-json")
async def create_virtual_tryon_json(request: TryOnJsonRequest):
    """
    Generates a virtual try-on visual representation from a base64 encoded user image via open-source OOTDiffusion.
    """
    # 1. Decode base64 image
    img_bgr = decode_base64_image(request.image_base64)
    if img_bgr is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not decode the base64 image payload."
        )

    import cv2
    _, buffer = cv2.imencode(".jpg", img_bgr)
    person_bytes = buffer.tobytes()

    # 2. Execute Virtual Try-On
    result = await virtual_tryon_service.run_try_on(
        person_bytes=person_bytes,
        dress_type=request.dress_type,
        color_name=request.color_name,
        color_hex=request.color_hex
    )

    return result
