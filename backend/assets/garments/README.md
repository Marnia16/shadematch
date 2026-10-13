# Real Garment Photography Catalog

This directory stores high-resolution reference product photography for garments used by the ShadeMatch AI Virtual Try-On (VTON) engine with OOTDiffusion.

## Architecture

OOTDiffusion requires **real product photography** (e.g., flat lay or ghost-mannequin product shots against a clean, isolated white background) to realistically warp and drape fabrics onto user portraits.

**Zero Synthetic Fallbacks**: If an outfit is requested that does not exist in this catalog, the backend returns `code: "GARMENT_ASSET_UNAVAILABLE"` and displays available alternative garments to the user rather than drawing fake geometric shapes.

## Directory Structure

```
backend/assets/garments/
├── dresses/
│   └── emerald_green_dress.jpg
├── kurtis/
│   └── emerald_green_kurti.jpg
├── sarees/
│   ├── emerald_green_saree.jpg
│   └── maroon_saree.jpg
└── shirts/
    ├── emerald_green_shirt.jpg
    └── navy_shirt.jpg
```

## Adding New Garment Assets

To add new outfits to the catalog:

1. Obtain a high-quality product photo of the garment:
   - **Background**: Pure white or transparent.
   - **Form**: Ghost mannequin or clean flat lay (no human model visible).
   - **Format**: JPG, PNG, or WebP.
2. Place the image in the appropriate silhouette subfolder (e.g., `sarees/`, `shirts/`, `dresses/`, `kurtis/`).
3. Name the file using the convention: `<color_slug>_<dress_slug>.jpg` or `<dress_slug>_<color_slug>.jpg`.
   - Examples: `ruby_red_saree.jpg`, `black_shirt.jpg`, `mustard_kurti.jpg`.
4. Register the metadata in `backend/services/garment_catalog.py` if custom display titles or descriptions are desired.
