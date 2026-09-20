"""
Skin Tone Analyzer Service.
Converts sampled skin pixels to scientific color spaces (CIELAB, HSV),
computes Individual Typology Angle (ITA), and invokes the ML Predictor.
"""

import math
from typing import Dict, Any, List
import cv2
import numpy as np
from models.predictor import predict_skin_tone


# Tone descriptions crafted with respectful, high-fashion vocabulary
TONE_DESCRIPTIONS = {
    "Fair": "Porcelain to ivory luminosity with delicate undertones. Harmonizes beautifully with crisp jewels, ethereal pastels, and saturated contrast.",
    "Light": "Soft alabaster to light-sand radiance. Naturally complements rich berry tones, coastal blues, and warm earthy accents.",
    "Medium": "Golden beige to warm honey complexion. Striking with royal jewel tones, vibrant jewel reds, emeralds, and warm metallics.",
    "Olive / Tan": "Warm amber, bronze, or subtle olive undertones. Stunning with rich terracotta, deep teal, warm ochres, and metallic gold accents.",
    "Deep": "Rich espresso, mahogany, and deep bronze depth. Breathtaking against vibrant electric colors, jewel tones, pristine whites, and brilliant metallics."
}

UNDERTONE_DESCRIPTIONS = {
    "Warm": "Golden, peachy, or honey undertones that glow alongside warm metals (gold, copper, brass) and earth/spice hues.",
    "Cool": "Rosy, pink, or soft bluish undertones that shimmer alongside silver, platinum, cool jewels, and icy tones.",
    "Neutral": "Harmonious equilibrium of warm and cool undertones with exceptional versatility across both gold and silver accents."
}


class SkinToneAnalyzer:
    def analyze_skin_tone(self, rgb: List[int], quality_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates colorimetric metrics and estimates skin-tone range.
        """
        r, g, b = rgb[0], rgb[1], rgb[2]

        # Convert 1x1 pixel to CIELAB and HSV using OpenCV
        rgb_pixel = np.uint8([[[r, g, b]]])
        lab_pixel = cv2.cvtColor(rgb_pixel, cv2.COLOR_RGB2LAB)
        hsv_pixel = cv2.cvtColor(rgb_pixel, cv2.COLOR_RGB2HSV)

        # OpenCV scales L to [0, 255] (L_std = L_cv * 100 / 255)
        # a and b are shifted by +128 in OpenCV (a_std = a_cv - 128, b_std = b_cv - 128)
        L_std = float(lab_pixel[0, 0, 0]) * 100.0 / 255.0
        a_std = float(lab_pixel[0, 0, 1]) - 128.0
        b_std = float(lab_pixel[0, 0, 2]) - 128.0

        hue = float(hsv_pixel[0, 0, 0]) * 2.0  # scale to 0-360 deg
        sat = float(hsv_pixel[0, 0, 1])
        val = float(hsv_pixel[0, 0, 2])

        # Individual Typology Angle (ITA)
        # ITA = (arctan((L* - 50) / b*)) * (180 / pi)
        if abs(b_std) < 0.01:
            ita = 90.0 if L_std > 50 else -90.0
        else:
            ita = math.atan((L_std - 50.0) / b_std) * (180.0 / math.pi)

        features = {
            "L": L_std,
            "a": a_std,
            "b": b_std,
            "ita": ita,
            "hue": hue,
            "saturation": sat,
            "value": val
        }

        # Predict using the ML / Colorimetric Predictor
        prediction = predict_skin_tone(features)

        skin_tone = prediction["skin_tone"]
        undertone = prediction["undertone"]
        confidence = prediction["confidence"]

        # Adjust confidence slightly if lighting is dim or low contrast
        if quality_data.get("quality_status") == "dim":
            confidence = max(0.65, confidence * 0.90)
        elif quality_data.get("quality_status") == "dark":
            confidence = max(0.50, confidence * 0.75)

        return {
            "skin_tone": skin_tone,
            "undertone": undertone,
            "confidence": round(confidence, 2),
            "sampled_hex": f"#{r:02X}{g:02X}{b:02X}",
            "description": TONE_DESCRIPTIONS.get(skin_tone, "Complementary color harmony palette."),
            "undertone_description": UNDERTONE_DESCRIPTIONS.get(undertone, "Balanced undertone harmony."),
            "color_metrics": {
                "L_lightness": round(L_std, 1),
                "a_chroma": round(a_std, 1),
                "b_chroma": round(b_std, 1),
                "ita_angle": round(ita, 1),
            },
            "model_metadata": {
                "is_placeholder": prediction.get("is_placeholder", True),
                "model_type": prediction.get("model_type", "ColorimetricBaseline")
            }
        }
