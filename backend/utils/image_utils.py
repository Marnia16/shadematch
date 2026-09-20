"""
Image utility functions for decoding, resizing, and quality evaluation.
"""

import base64
from typing import Tuple, Optional, Dict, Any, List
import cv2
import numpy as np


def decode_image_bytes(image_bytes: bytes) -> Optional[np.ndarray]:
    """
    Decodes raw image bytes into an OpenCV BGR image array.
    """
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img
    except Exception as e:
        print(f"Error decoding image bytes: {e}")
        return None


def decode_base64_image(b64_string: str) -> Optional[np.ndarray]:
    """
    Decodes a base64 encoded data URI or raw base64 string into an OpenCV BGR array.
    """
    try:
        if "," in b64_string:
            b64_string = b64_string.split(",", 1)[1]
        decoded = base64.b64decode(b64_string)
        return decode_image_bytes(decoded)
    except Exception as e:
        print(f"Error decoding base64 image: {e}")
        return None


def resize_image_if_needed(img: np.ndarray, max_dimension: int = 1280) -> np.ndarray:
    """
    Maintains aspect ratio while constraining maximum dimension for efficient processing.
    """
    h, w = img.shape[:2]
    if max(h, w) <= max_dimension:
        return img

    if w > h:
        new_w = max_dimension
        new_h = int(h * (max_dimension / w))
    else:
        new_h = max_dimension
        new_w = int(w * (max_dimension / h))

    return cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)


def evaluate_image_quality(img: np.ndarray) -> Dict[str, Any]:
    """
    Evaluates brightness, contrast, and sharpness using computer vision metrics.
    """
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    mean_brightness = float(np.mean(gray))
    std_contrast = float(np.std(gray))

    # Laplacian variance for blur detection
    laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())

    warnings: List[str] = []
    quality_status = "optimal"

    # Brightness diagnostics
    if mean_brightness < 40:
        warnings.append("Image is noticeably dark or underexposed. Natural daylight yields more accurate color advice.")
        quality_status = "dark"
    elif mean_brightness < 70:
        warnings.append("Lighting is somewhat dim. Results are estimated, but brighter lighting is recommended.")
        quality_status = "dim"
    elif mean_brightness > 220:
        warnings.append("Image appears overexposed or washed out with strong glare.")
        quality_status = "overexposed"

    # Contrast diagnostics
    if std_contrast < 22:
        warnings.append("Low tonal contrast detected in image.")

    # Blur diagnostics
    if laplacian_var < 45:
        warnings.append("Image appears slightly soft or blurry; ensure your camera is in focus.")

    return {
        "brightness": round(mean_brightness, 1),
        "contrast": round(std_contrast, 1),
        "sharpness": round(laplacian_var, 1),
        "quality_status": quality_status,
        "warnings": warnings,
        "is_suitable": quality_status != "dark"
    }
