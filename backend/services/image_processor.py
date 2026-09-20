"""
OpenCV Image Processor Service for ShadeMatch.
Handles face detection, skin ROI isolation, and lighting analysis.
"""

import os
from typing import Dict, Any, Optional, Tuple, List
import cv2
import numpy as np
from utils.image_utils import resize_image_if_needed, evaluate_image_quality


class ImageProcessor:
    def __init__(self):
        # Initialize OpenCV Haar Cascade face detector
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        if os.path.exists(cascade_path):
            self.face_cascade = cv2.CascadeClassifier(cascade_path)
        else:
            self.face_cascade = None
            print("Warning: Haar cascade XML not found at default path.")

    def process_image(self, img: np.ndarray) -> Dict[str, Any]:
        """
        Process the image:
        1. Resizes for performance
        2. Evaluates lighting/quality
        3. Detects face and samples skin regions (forehead, cheeks)
        4. Extracts mean RGB and BGR color values
        """
        img = resize_image_if_needed(img, max_dimension=1080)
        quality = evaluate_image_quality(img)

        # Detect face
        face_detected = False
        face_rect = None
        skin_pixels_bgr = []

        if self.face_cascade is not None:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            # Histogram equalization for reliable face detection under diverse lighting
            equalized = cv2.equalizeHist(gray)
            faces = self.face_cascade.detectMultiScale(
                equalized,
                scaleFactor=1.1,
                minNeighbors=4,
                minSize=(80, 80)
            )

            if len(faces) > 0:
                # Select the largest face by area
                largest_face = max(faces, key=lambda f: f[2] * f[3])
                face_detected = True
                x, y, w, h = largest_face
                face_rect = {"x": int(x), "y": int(y), "width": int(w), "height": int(h)}

                # Extract targeted facial patches to isolate pure skin:
                # 1. Forehead patch (centered horizontally, above eyebrows, below hairline)
                fh_y1 = int(y + 0.16 * h)
                fh_y2 = int(y + 0.30 * h)
                fh_x1 = int(x + 0.30 * w)
                fh_x2 = int(x + 0.70 * w)
                forehead_patch = img[fh_y1:fh_y2, fh_x1:fh_x2]

                # 2. Left cheek patch
                lc_y1 = int(y + 0.52 * h)
                lc_y2 = int(y + 0.68 * h)
                lc_x1 = int(x + 0.18 * w)
                lc_x2 = int(x + 0.38 * w)
                left_cheek_patch = img[lc_y1:lc_y2, lc_x1:lc_x2]

                # 3. Right cheek patch
                rc_y1 = int(y + 0.52 * h)
                rc_y2 = int(y + 0.68 * h)
                rc_x1 = int(x + 0.62 * w)
                rc_x2 = int(x + 0.82 * w)
                right_cheek_patch = img[rc_y1:rc_y2, rc_x1:rc_x2]

                for patch in [forehead_patch, left_cheek_patch, right_cheek_patch]:
                    if patch.size > 0:
                        reshaped = patch.reshape(-1, 3)
                        skin_pixels_bgr.append(reshaped)

        # Fallback if no Haar face was detected: skin color segmentation in central area
        if not face_detected or len(skin_pixels_bgr) == 0:
            h, w = img.shape[:2]
            # Center crop (central 50%)
            cy1, cy2 = int(h * 0.20), int(h * 0.80)
            cx1, cx2 = int(w * 0.20), int(w * 0.80)
            center_crop = img[cy1:cy2, cx1:cx2]

            # YCrCb skin segmentation range
            ycrcb = cv2.cvtColor(center_crop, cv2.COLOR_BGR2YCrCb)
            # Standard skin chromaticity boundaries: Cr in [133, 173], Cb in [77, 127]
            skin_mask = cv2.inRange(ycrcb, np.array([0, 133, 77], dtype=np.uint8),
                                          np.array([255, 173, 127], dtype=np.uint8))

            skin_pixels = center_crop[skin_mask > 0]
            if len(skin_pixels) > 50:
                skin_pixels_bgr.append(skin_pixels)
            else:
                # If even skin segmentation found very few pixels, sample center square
                mid_patch = center_crop.reshape(-1, 3)
                skin_pixels_bgr.append(mid_patch)

        # Aggregate sampled pixels and compute median/mean
        all_pixels = np.vstack(skin_pixels_bgr)
        # Use median for robustness against specular highlights and shadows
        median_bgr = np.median(all_pixels, axis=0)
        mean_bgr = np.mean(all_pixels, axis=0)

        # Filter out extreme outliers
        b, g, r = int(median_bgr[0]), int(median_bgr[1]), int(median_bgr[2])
        hex_color = f"#{r:02X}{g:02X}{b:02X}"

        return {
            "face_detected": face_detected,
            "face_rect": face_rect,
            "sampled_pixel_count": int(len(all_pixels)),
            "bgr": [b, g, r],
            "rgb": [r, g, b],
            "hex": hex_color,
            "quality": quality,
            "warnings": quality["warnings"] + ([] if face_detected else [
                "We couldn't detect a clear front-facing face in this image. We estimated skin tone from central image regions."
            ])
        }
