# Open-Source AI Virtual Try-On Setup (OOTDiffusion)

ShadeMatch integrates the official hosted open-source **[OOTDiffusion](https://github.com/levihsu/OOTDiffusion)** latent diffusion model for AI Virtual Try-On.

---

## 1. Primary Route: Official Hosted OOTDiffusion (Gradio API)

The primary integration connects directly to the official hosted Hugging Face Space:
**`https://huggingface.co/spaces/levihsu/OOTDiffusion`**

### Architecture & Capabilities:
- **Client**: `gradio_client` Python SDK.
- **Hosted Inference**: Model weights and neural diffusion execute remotely on Hugging Face GPU hardware.
- **Zero Local GPU Needed**: Neither your local machine (MacBook Air M4) nor your Render backend server needs an NVIDIA GPU.
- **Endpoints Used**:
  - `/process_hd`: Specialized high-definition half-body model used for upper-body garments (Shirts, Kurtis, T-Shirts).
  - `/process_dc`: Outfitting model supporting full dresses and traditional wear with category `'Dress'` (Sarees, Gowns, Lehengas) and `'Lower-body'`.

### Configuration (Environment Variables):
- `OOTD_GRADIO_SPACE`: Hugging Face Space identifier (defaults to `levihsu/OOTDiffusion`).
- `HF_TOKEN` *(optional)*: Your free personal Hugging Face user access token. Adding this helps avoid anonymous IP queue throttling and rate limits.

---

## 2. Usage Limits, Licensing & Privacy Notice

### Hugging Face Space Queue & Limits
- The official Space is hosted publicly on Hugging Face. Free usage is subject to community queue loads and temporary compute rate limits (HTTP 429).
- If the public space is under heavy queue load, requests may take longer or time out.
- For dedicated throughput, users can duplicate the Space to their own Hugging Face account and set `OOTD_GRADIO_SPACE=your-username/OOTDiffusion` with their `HF_TOKEN`.

### Licensing Restriction (CC BY-NC-SA 4.0)
- The official OOTDiffusion model and weights are released under **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)**.
- **Non-Commercial**: The model is intended for academic research, education, and personal non-commercial projects. It cannot be used for commercial product monetization without licensing.

### Privacy Notice
- When a user clicks **"✨ Try This Look"**, their uploaded portrait is transmitted to the hosted Hugging Face Space to perform fabric draping.
- The ShadeMatch backend treats all user portraits as strictly ephemeral, deleting temporary input files immediately after inference completes. No portraits are persisted to disk or database.

---

## 3. Alternative Route: Self-Hosted Google Colab Worker (Free T4 GPU)

If the public Hugging Face Space is offline, you can run an independent self-hosted worker on Google Colab:

1. Open [Google Colab](https://colab.research.google.com) and set runtime to **T4 GPU** (Free).
2. Clone OOTDiffusion and install dependencies:
   ```bash
   !git clone https://github.com/levihsu/OOTDiffusion.git
   %cd OOTDiffusion
   !pip install -r requirements.txt
   !pip install fastapi uvicorn pyngrok nest-asyncio
   ```
3. Expose the worker using ngrok:
   ```python
   from pyngrok import ngrok
   ngrok.set_auth_token("YOUR_FREE_NGROK_TOKEN")
   public_url = ngrok.connect(8001).public_url
   print(f"Colab Worker URL: {public_url}")
   ```
4. Set `OOTD_WORKER_URL=https://your-tunnel.ngrok-free.app` in `backend/.env`.

---

## 4. Garment Reference Catalog

The catalog is stored on disk in `backend/assets/garments/`:
- `sarees/` (Emerald Green Silk Saree, Heritage Maroon Saree)
- `dresses/` (Emerald Green Crepe Satin Evening Dress)
- `shirts/` (Emerald Green Tailored Shirt, Classic Navy Oxford Shirt)
- `kurtis/` (Emerald Green Festive Kurti)

To expand the catalog, add clean product photos on a white background to the appropriate folders. If a requested garment is not in the catalog, ShadeMatch returns `GARMENT_ASSET_UNAVAILABLE` rather than drawing synthetic shapes.
