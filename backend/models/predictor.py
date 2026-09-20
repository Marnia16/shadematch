"""
ShadeMatch Machine Learning Predictor Module.

Provides a clean scikit-learn compatible interface for skin-tone estimation.
When a serialized model (e.g., random_forest.joblib) is provided, it predicts
using the trained estimator. Otherwise, it transparently employs a calibrated
colorimetric baseline (ITA & CIELAB chromaticity) while maintaining the exact
same feature contract.
"""

import os
from typing import Dict, Any, Optional
import numpy as np

# Categories aligned with inclusive dermatological and fashion ranges
SKIN_TONE_CATEGORIES = [
    "Fair",
    "Light",
    "Medium",
    "Olive / Tan",
    "Deep"
]

UNDERTONE_CATEGORIES = ["Warm", "Cool", "Neutral"]


class SkinTonePredictor:
    """
    Predictor abstraction for skin tone and undertone estimation.
    Designed for seamless replacement with a trained scikit-learn Classifier
    (e.g., RandomForestClassifier, SVC, or MLPClassifier).
    """

    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path
        self.trained_model = None
        self.is_trained = False

        if model_path and os.path.exists(model_path):
            self._load_model(model_path)

    def _load_model(self, path: str):
        try:
            import joblib
            self.trained_model = joblib.load(path)
            self.is_trained = True
        except Exception as e:
            print(f"Warning: Failed to load trained model from {path}: {e}. Falling back to baseline predictor.")
            self.trained_model = None
            self.is_trained = False

    def predict(self, features: Dict[str, float]) -> Dict[str, Any]:
        """
        Predict skin-tone category and undertone from extracted colorimetric features.

        Expected features:
            - L: CIELAB Lightness (0 - 100)
            - a: CIELAB green-red axis (-128 - 127)
            - b: CIELAB blue-yellow axis (-128 - 127)
            - ita: Individual Typology Angle in degrees (typical range -70° to +70°)
            - hue: HSV Hue (0 - 180 or 0 - 360)
            - saturation: HSV Saturation (0 - 255)
            - value: HSV Value (0 - 255)
        """
        if self.is_trained and self.trained_model is not None:
            feature_vector = np.array([[
                features.get("L", 60.0),
                features.get("a", 15.0),
                features.get("b", 20.0),
                features.get("ita", 30.0),
                features.get("hue", 20.0),
                features.get("saturation", 80.0),
                features.get("value", 180.0)
            ]])
            predicted_class = self.trained_model.predict(feature_vector)[0]
            confidence = 0.90
            if hasattr(self.trained_model, "predict_proba"):
                proba = self.trained_model.predict_proba(feature_vector)[0]
                confidence = float(np.max(proba))

            undertone = self._estimate_undertone(features.get("a", 15.0), features.get("b", 20.0))

            return {
                "skin_tone": str(predicted_class),
                "undertone": undertone,
                "confidence": round(confidence, 2),
                "is_placeholder": False,
                "model_type": type(self.trained_model).__name__,
                "features_summary": {k: round(v, 2) for k, v in features.items()}
            }

        # Calibrated Colorimetric Baseline (Transparent Placeholder Engine)
        # Using Individual Typology Angle (ITA) established in dermatological science:
        # ITA = (arctan((L* - 50) / b*)) * (180 / pi)
        L = features.get("L", 65.0)
        b = features.get("b", 18.0)
        a = features.get("a", 14.0)
        ita = features.get("ita", 28.0)

        # Baseline classification based on ITA & Luminance thresholds
        if ita > 45.0 or L > 75.0:
            skin_tone = "Fair"
            confidence = min(0.92, 0.80 + abs(ita - 45.0) / 100.0)
        elif ita > 25.0 or (L > 64.0 and ita > 15.0):
            skin_tone = "Light"
            confidence = min(0.90, 0.82 + abs(ita - 35.0) / 100.0)
        elif ita > 5.0 or (L > 52.0 and ita > -5.0):
            skin_tone = "Medium"
            confidence = min(0.88, 0.81 + abs(ita - 15.0) / 100.0)
        elif ita > -20.0 or L > 42.0:
            skin_tone = "Olive / Tan"
            confidence = min(0.89, 0.80 + abs(ita + 10.0) / 100.0)
        else:
            skin_tone = "Deep"
            confidence = min(0.94, 0.84 + abs(ita + 30.0) / 100.0)

        undertone = self._estimate_undertone(a, b)

        return {
            "skin_tone": skin_tone,
            "undertone": undertone,
            "confidence": round(float(confidence), 2),
            "is_placeholder": True,
            "model_type": "ColorimetricBaseline (Ready for Scikit-Learn Model)",
            "features_summary": {k: round(v, 2) for k, v in features.items()}
        }

    def _estimate_undertone(self, a: float, b: float) -> str:
        """
        Determines undertone (Warm, Cool, Neutral) based on a* (red/green) and b* (yellow/blue) channels.
        - Higher b* relative to a* indicates golden/yellow warmth.
        - Higher a* with lower b* indicates pink/rosy cool undertones.
        - Balanced values indicate neutral undertones.
        """
        ratio = b / (a + 1e-5)
        if ratio > 1.35:
            return "Warm"
        elif ratio < 0.95 or a > 17.0:
            return "Cool"
        else:
            return "Neutral"


# Singleton default predictor instance (checks for custom model path in environment)
model_env_path = os.environ.get("SKIN_TONE_MODEL_PATH")
default_predictor = SkinTonePredictor(model_env_path)


def predict_skin_tone(features: Dict[str, float]) -> Dict[str, Any]:
    """
    Standard function entry point to predict skin tone from feature dictionary.
    Can be called directly by services or routes.
    """
    return default_predictor.predict(features)
