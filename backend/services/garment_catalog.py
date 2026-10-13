"""
ShadeMatch Garment Catalog Service.

Data-driven catalog of real garment reference photography for open-source
generative AI Virtual Try-On (OOTDiffusion). Maps recommended silhouettes
and colors to real e-commerce/ghost-mannequin product photography on disk.

ZERO fake polygon drawing or synthetic shapes: if an asset is not available
in the catalog, requests return None / GARMENT_ASSET_UNAVAILABLE.
"""

import os
import io
import base64
from typing import Dict, Any, List, Optional
from PIL import Image


# Directory where real garment photography assets are placed
GARMENT_ASSETS_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "assets",
    "garments"
)

# Silhouette Category mapping for standard VTON pipelines (OOTDiffusion: upperbody / lowerbody / dress)
DRESS_CATEGORY_MAP = {
    "saree": "dress",
    "lehenga": "dress",
    "gown": "dress",
    "dress": "dress",
    "formal wear": "dress",
    "casual wear": "dress",
    "kurti": "upperbody",
    "shirt": "upperbody",
    "t-shirt": "upperbody"
}

# Color and Silhouette Aliases for resilient matching
COLOR_ALIASES = {
    "burgundy": ["maroon", "wine", "ruby"],
    "maroon": ["burgundy", "wine"],
    "navy": ["navy_blue", "navy blue", "midnight_blue"],
    "navy_blue": ["navy", "midnight_blue"],
    "emerald_green": ["emerald", "forest_green", "green"],
    "emerald": ["emerald_green", "green"],
}

SILHOUETTE_ALIASES = {
    "casual_wear": ["dress", "shirt", "kurti"],
    "formal_wear": ["shirt", "dress", "gown"],
    "gown": ["dress"],
    "dress": ["gown"],
}


def slugify(text: str) -> str:
    """Converts a string to a clean filename-safe slug."""
    return "".join(c if c.isalnum() else "_" for c in (text or "").lower().strip()).strip("_")


class GarmentCatalog:
    """
    Data-driven catalog of real garment photography cutouts.
    Scans backend/assets/garments/ and provides exact and alias-based matching.
    """

    def __init__(self, assets_dir: str = GARMENT_ASSETS_DIR):
        self.assets_dir = assets_dir
        os.makedirs(self.assets_dir, exist_ok=True)
        # Predefined starter catalog metadata with real product photography
        self._curated_garments: List[Dict[str, Any]] = [
            {
                "garment_id": "emerald_green_saree",
                "dress_type": "Saree",
                "color_name": "Emerald Green",
                "color_hex": "#0D7A53",
                "category": "dress",
                "relative_path": "sarees/emerald_green_saree.jpg",
                "title": "Royal Emerald Green Silk Saree",
                "description": "Luxurious woven emerald green silk saree with intricate golden zari border."
            },
            {
                "garment_id": "maroon_saree",
                "dress_type": "Saree",
                "color_name": "Maroon",
                "color_hex": "#800020",
                "category": "dress",
                "relative_path": "sarees/maroon_saree.jpg",
                "title": "Heritage Maroon Banquet Saree",
                "description": "Rich burgundy-maroon Banarasi saree with detailed traditional zari embroidery."
            },
            {
                "garment_id": "emerald_green_dress",
                "dress_type": "Gown",
                "color_name": "Emerald Green",
                "color_hex": "#0D7A53",
                "category": "dress",
                "relative_path": "dresses/emerald_green_dress.jpg",
                "title": "Emerald Green Evening Dress",
                "description": "Tailored emerald green floor-length evening dress in flowing crepe satin."
            },
            {
                "garment_id": "emerald_green_shirt",
                "dress_type": "Shirt",
                "color_name": "Emerald Green",
                "color_hex": "#0D7A53",
                "category": "upperbody",
                "relative_path": "shirts/emerald_green_shirt.jpg",
                "title": "Emerald Green Button-Down Shirt",
                "description": "Crisp tailored emerald green formal button-down shirt with structured collar."
            },
            {
                "garment_id": "navy_shirt",
                "dress_type": "Shirt",
                "color_name": "Navy Blue",
                "color_hex": "#12263F",
                "category": "upperbody",
                "relative_path": "shirts/navy_shirt.jpg",
                "title": "Classic Navy Blue Oxford Shirt",
                "description": "Crisp tailored navy blue formal oxford button-down shirt."
            },
            {
                "garment_id": "emerald_green_kurti",
                "dress_type": "Kurti",
                "color_name": "Emerald Green",
                "color_hex": "#0D7A53",
                "category": "upperbody",
                "relative_path": "kurtis/emerald_green_kurti.jpg",
                "title": "Emerald Green Festive Kurti",
                "description": "Straight-cut festive emerald green kurti with subtle neckline embellishment."
            }
        ]

    def get_available_garments(self) -> List[Dict[str, Any]]:
        """
        Returns a list of all garment items whose reference images exist on disk.
        """
        available = []
        for item in self._curated_garments:
            abs_path = os.path.join(self.assets_dir, item["relative_path"])
            if os.path.exists(abs_path):
                available.append({
                    "garment_id": item["garment_id"],
                    "dress_type": item["dress_type"],
                    "color_name": item["color_name"],
                    "color_hex": item["color_hex"],
                    "category": item["category"],
                    "title": item["title"],
                    "description": item["description"],
                    "has_real_image": True
                })
        return available

    def get_garment(self, dress_type: str, color_name: str, color_hex: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Finds a real garment photography asset matching dress_type and color_name.
        Returns complete garment metadata and image bytes if found; returns None if unavailable.
        NEVER draws fake/synthetic templates.
        """
        d_slug = slugify(dress_type)
        c_slug = slugify(color_name)

        # 1. Check curated list with exact or alias match
        candidate_item = None
        for item in self._curated_garments:
            item_d_slug = slugify(item["dress_type"])
            item_c_slug = slugify(item["color_name"])

            # Direct match
            if item_d_slug == d_slug and item_c_slug == c_slug:
                candidate_item = item
                break

            # Alias match for color (e.g. burgundy <-> maroon)
            color_aliases = COLOR_ALIASES.get(c_slug, [])
            silhouette_aliases = SILHOUETTE_ALIASES.get(d_slug, [])

            d_matches = (item_d_slug == d_slug) or (item_d_slug in silhouette_aliases)
            c_matches = (item_c_slug == c_slug) or (item_c_slug in color_aliases)

            if d_matches and c_matches:
                candidate_item = item
                break

        if candidate_item:
            abs_path = os.path.join(self.assets_dir, candidate_item["relative_path"])
            if os.path.exists(abs_path):
                return self._load_garment_file(
                    abs_path=abs_path,
                    garment_id=candidate_item["garment_id"],
                    dress_type=dress_type,
                    color_name=color_name,
                    color_hex=color_hex or candidate_item["color_hex"],
                    category=candidate_item["category"],
                    description=candidate_item["description"]
                )

        # 2. Dynamic filesystem scan in assets_dir for custom added assets
        filenames_to_check = [
            f"{d_slug}_{c_slug}.jpg",
            f"{d_slug}_{c_slug}.png",
            f"{c_slug}_{d_slug}.jpg",
            f"{c_slug}_{d_slug}.png",
        ]
        subdirs_to_check = ["", "sarees", "dresses", "shirts", "kurtis", f"{d_slug}s", d_slug]

        for sdir in subdirs_to_check:
            for fname in filenames_to_check:
                path = os.path.join(self.assets_dir, sdir, fname) if sdir else os.path.join(self.assets_dir, fname)
                if os.path.exists(path):
                    category = DRESS_CATEGORY_MAP.get(dress_type.lower().strip(), "dress")
                    return self._load_garment_file(
                        abs_path=path,
                        garment_id=f"{d_slug}_{c_slug}",
                        dress_type=dress_type,
                        color_name=color_name,
                        color_hex=color_hex or "#121212",
                        category=category,
                        description=f"Real reference photography for {color_name} {dress_type}"
                    )

        # Asset is genuinely unavailable on disk
        return None

    def _load_garment_file(
        self,
        abs_path: str,
        garment_id: str,
        dress_type: str,
        color_name: str,
        color_hex: str,
        category: str,
        description: str
    ) -> Dict[str, Any]:
        """Loads and encodes a real garment reference image from disk."""
        with open(abs_path, "rb") as f:
            img_bytes = f.read()

        ext = os.path.splitext(abs_path)[1].lower().lstrip(".")
        mime_type = "image/png" if ext == "png" else "image/jpeg"
        b64_data = base64.b64encode(img_bytes).decode("utf-8")
        data_uri = f"data:{mime_type};base64,{b64_data}"

        return {
            "garment_id": garment_id,
            "dress_type": dress_type,
            "color_name": color_name,
            "color_hex": color_hex,
            "category": category,
            "image_bytes": img_bytes,
            "image_data_uri": data_uri,
            "image_path": abs_path,
            "filename": os.path.basename(abs_path),
            "description": description,
            "is_placeholder": False
        }


# Singleton catalog instance
garment_catalog = GarmentCatalog()
