"""
ShadeMatch Virtual Try-On (VTON) Service.

Hosted & Open-Source Generative AI Virtual Try-On integration based on OOTDiffusion:
https://github.com/levihsu/OOTDiffusion
Official Hugging Face Space: https://huggingface.co/spaces/levihsu/OOTDiffusion

OOTDiffusion is a real latent diffusion virtual try-on model that takes a human portrait
and a real garment image and synthesizes realistic, physics-grounded fabric draping.

Architecture:
- Hosted Provider (Default): Connects to the official hosted OOTDiffusion Hugging Face Space
  via gradio_client. Inference runs remotely on Hugging Face GPU hardware, requiring NO local GPU.
- Worker Provider (Optional): Connects to a self-hosted remote worker (e.g., Google Colab with T4 GPU)
  via OOTD_WORKER_URL if explicitly configured.
"""

import os
import io
import time
import base64
import tempfile
import asyncio
import logging
from typing import Dict, Any, Optional, List
import httpx

logger = logging.getLogger("shadematch.vton")

# Load local environment if dotenv is available
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from services.garment_catalog import garment_catalog


def map_category_and_endpoint(garment_category: str) -> Dict[str, Any]:
    """
    Maps internal garment category to OOTDiffusion Gradio Space endpoints & parameters:
    - Upper-body garments (kurti, shirt, t-shirt) -> /process_hd (or /process_dc with category 'Upper-body')
    - Dresses / Gowns / Sarees (saree, lehenga, gown, dress) -> /process_dc with category 'Dress'
    - Lower-body garments (pants, skirts) -> /process_dc with category 'Lower-body'
    """
    cat_lower = (garment_category or "").lower().strip()
    if cat_lower in ("dress", "one-pieces", "saree", "gown", "lehenga"):
        return {
            "api_name": "/process_dc",
            "category": "Dress",
            "supported": True
        }
    elif cat_lower in ("upperbody", "tops", "shirt", "kurti", "t-shirt"):
        return {
            "api_name": "/process_hd",
            "category": "Upper-body",
            "supported": True
        }
    elif cat_lower in ("lowerbody", "bottoms", "pants", "skirt"):
        return {
            "api_name": "/process_dc",
            "category": "Lower-body",
            "supported": True
        }
    else:
        return {
            "api_name": "",
            "category": "",
            "supported": False
        }


def _extract_image_reference(result: Any) -> Optional[str]:
    """Extracts the output image file path or URL from Gradio prediction output."""
    if isinstance(result, list) and len(result) > 0:
        first = result[0]
        if isinstance(first, dict):
            return first.get("image")
        elif isinstance(first, str):
            return first
    elif isinstance(result, dict):
        return result.get("image")
    elif isinstance(result, str):
        return result
    return None


def _load_image_bytes(image_ref: str, space_identifier: str, hf_token: Optional[str] = None) -> bytes:
    """
    Safely retrieves the generated image bytes.
    Handles:
    1. Local temporary files downloaded by gradio_client.
    2. Direct HTTP/HTTPS URLs.
    3. Remote Gradio Space /file= paths if not already downloaded locally.
    """
    # 1. Check local file system
    if os.path.exists(image_ref) and os.path.isfile(image_ref):
        with open(image_ref, "rb") as f:
            return f.read()

    # 2. Remote HTTP/HTTPS URL
    if image_ref.startswith("http://") or image_ref.startswith("https://"):
        headers = {"Authorization": f"Bearer {hf_token}"} if hf_token else {}
        with httpx.Client(timeout=45.0) as http_client:
            resp = http_client.get(image_ref, headers=headers)
            resp.raise_for_status()
            return resp.content

    # 3. Remote Gradio Space file endpoint (e.g. /file=... or /tmp/gradio/...)
    base_host = space_identifier.replace("/", "-") if "/" in space_identifier else space_identifier
    space_base_url = f"https://{base_host}.hf.space"
    file_path = image_ref.lstrip("/")
    if not file_path.startswith("file="):
        file_url = f"{space_base_url}/file={file_path}"
    else:
        file_url = f"{space_base_url}/{file_path}"

    headers = {"Authorization": f"Bearer {hf_token}"} if hf_token else {}
    with httpx.Client(timeout=45.0) as http_client:
        resp = http_client.get(file_url, headers=headers)
        resp.raise_for_status()
        return resp.content


def _bytes_to_data_url(img_bytes: bytes, filename: Optional[str] = None) -> str:
    """Encodes image bytes into a browser-renderable data URL."""
    mime = "image/jpeg"
    if img_bytes.startswith(b"RIFF") and b"WEBP" in img_bytes[:16]:
        mime = "image/webp"
    elif img_bytes.startswith(b"\x89PNG"):
        mime = "image/png"
    elif img_bytes.startswith(b"\xff\xd8"):
        mime = "image/jpeg"
    elif filename:
        ext = os.path.splitext(filename)[1].lower().lstrip(".")
        if ext in ("webp", "png", "jpeg", "jpg"):
            mime = f"image/{'jpeg' if ext == 'jpg' else ext}"
    b64 = base64.b64encode(img_bytes).decode("utf-8")
    return f"data:{mime};base64,{b64}"


def _execute_gradio_predict(
    person_path: str,
    garment_path: str,
    endpoint_info: Dict[str, Any],
    space_name: str,
    hf_token: Optional[str] = None
) -> Any:
    """
    Blocking call to gradio_client executed inside asyncio.to_thread.
    Does not block the main FastAPI async event loop.
    """
    from gradio_client import Client, handle_file

    has_token = bool(hf_token)
    api_name = endpoint_info["api_name"]
    category_param = endpoint_info.get("category")

    logger.info(
        "Calling Gradio Client | Space: %s | Endpoint: %s | Category: %s | Token present: %s",
        space_name,
        api_name,
        category_param,
        has_token
    )

    # Pass token and explicit Authorization header for Hugging Face proxy compatibility
    headers = {"Authorization": f"Bearer {hf_token}"} if hf_token else None
    client = Client(space_name, token=hf_token, headers=headers)

    if api_name == "/process_dc":
        return client.predict(
            vton_img=handle_file(person_path),
            garm_img=handle_file(garment_path),
            category=category_param,
            n_samples=1,
            n_steps=20,
            image_scale=2.0,
            seed=-1,
            api_name="/process_dc"
        )
    else:  # /process_hd
        return client.predict(
            vton_img=handle_file(person_path),
            garm_img=handle_file(garment_path),
            n_samples=1,
            n_steps=20,
            image_scale=2.0,
            seed=-1,
            api_name="/process_hd"
        )


class HostedOOTDiffusionProvider:
    """
    Hosted OOTDiffusion Provider using official Hugging Face Space Gradio API.
    Does NOT require a local GPU; inference executes remotely on Hugging Face.
    """

    def __init__(self):
        self.default_space = "levihsu/OOTDiffusion"

    @property
    def space_name(self) -> str:
        return os.environ.get("OOTD_GRADIO_SPACE", self.default_space).strip() or self.default_space

    @property
    def hf_token(self) -> Optional[str]:
        raw = os.environ.get("HF_TOKEN", "") or os.environ.get("HUGGING_FACE_HUB_TOKEN", "")
        tok = raw.strip().strip('"').strip("'")
        return tok if tok else None

    @property
    def is_token_configured(self) -> bool:
        return bool(self.hf_token)

    @property
    def name(self) -> str:
        return "OOTDiffusion (Hosted Gradio)"

    @property
    def is_configured(self) -> bool:
        return bool(self.space_name)

    @property
    def is_available(self) -> bool:
        # Available because inference is hosted remotely on Hugging Face
        return self.is_configured

    @property
    def environment_type(self) -> str:
        return f"Hosted Hugging Face Space ({self.space_name})"

    async def generate_tryon(
        self,
        person_bytes: bytes,
        garment_bytes: bytes,
        garment_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Executes remote OOTDiffusion try-on prediction via Gradio API.
        """
        category = garment_info.get("category", "dress")
        endpoint_info = map_category_and_endpoint(category)

        logger.info(
            "generate_tryon start | Garment: %s (%s) | Category: %s | Endpoint: %s | Token configured: %s",
            garment_info.get("garment_id"),
            garment_info.get("dress_type"),
            category,
            endpoint_info.get("api_name"),
            self.is_token_configured
        )

        if not endpoint_info["supported"]:
            return {
                "success": False,
                "error": "UNSUPPORTED_GARMENT_CATEGORY",
                "code": "UNSUPPORTED_GARMENT_CATEGORY",
                "message": f"Virtual try-on is not supported for garment category '{category}'. OOTDiffusion supports upper-body, lower-body, and dresses."
            }

        # Ephemeral file handling: write input images to temporary files with cleanup
        person_tmp = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False)
        garment_tmp = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False)

        try:
            person_tmp.write(person_bytes)
            person_tmp.flush()
            person_tmp.close()

            garment_tmp.write(garment_bytes)
            garment_tmp.flush()
            garment_tmp.close()

            # Execute blocking prediction in thread pool
            result = await asyncio.to_thread(
                _execute_gradio_predict,
                person_tmp.name,
                garment_tmp.name,
                endpoint_info,
                self.space_name,
                self.hf_token
            )

            image_ref = _extract_image_reference(result)
            if not image_ref:
                return {
                    "success": False,
                    "error": "VTON_INVALID_OUTPUT",
                    "code": "VTON_INVALID_OUTPUT",
                    "message": "OOTDiffusion completed but did not return a valid output image."
                }

            # Retrieve generated image bytes
            try:
                img_bytes = _load_image_bytes(image_ref, self.space_name, self.hf_token)
            except Exception as e:
                return {
                    "success": False,
                    "error": "VTON_IMAGE_RETRIEVAL_FAILED",
                    "code": "VTON_IMAGE_RETRIEVAL_FAILED",
                    "message": f"Failed to retrieve generated try-on image from hosted space: {str(e)}"
                }

            # Clean up downloaded file if on local disk
            if os.path.exists(image_ref) and os.path.isfile(image_ref):
                try:
                    os.remove(image_ref)
                except Exception:
                    pass

            data_url = _bytes_to_data_url(img_bytes, filename=image_ref)

            return {
                "success": True,
                "image_url": data_url,
                "provider": self.name,
                "space": self.space_name,
                "endpoint": endpoint_info["api_name"],
                "garment": {
                    "garment_id": garment_info.get("garment_id"),
                    "color_name": garment_info.get("color_name"),
                    "color_hex": garment_info.get("color_hex"),
                    "dress_type": garment_info.get("dress_type"),
                    "category": category
                },
                "message": f"Successfully generated look in {garment_info.get('color_name')} {garment_info.get('dress_type')} via {self.name}."
            }

        except Exception as e:
            err_str = str(e)
            resp = getattr(e, "response", None)
            status_code = getattr(resp, "status_code", None) or getattr(e, "status_code", None)
            has_token = self.is_token_configured

            # Safe diagnostic logging: error type, status code, token presence (NEVER the token value)
            logger.error(
                "Hosted OOTDiffusion prediction failed | Type: %s | Status: %s | Token configured: %s | Detail: %s",
                type(e).__name__,
                status_code,
                has_token,
                err_str,
                exc_info=True
            )

            # 1. Authentication failure (401 / invalid token)
            if (
                status_code == 401
                or "401" in err_str
                or "unauthorized" in err_str.lower()
                or "invalid token" in err_str.lower()
                or "token is invalid" in err_str.lower()
            ):
                return {
                    "success": False,
                    "error": "VTON_AUTH_FAILED",
                    "code": "VTON_AUTH_FAILED",
                    "status_code": 401,
                    "token_configured": has_token,
                    "message": (
                        "Hugging Face authentication failed (401). The configured HF_TOKEN is invalid or expired. "
                        "Please verify your token in Render environment variables."
                    )
                }

            # 2. Permission denied (403 / forbidden / wrong scope)
            if (
                status_code == 403
                or "403" in err_str
                or "forbidden" in err_str.lower()
                or "permission denied" in err_str.lower()
            ):
                return {
                    "success": False,
                    "error": "VTON_FORBIDDEN",
                    "code": "VTON_FORBIDDEN",
                    "status_code": 403,
                    "token_configured": has_token,
                    "message": (
                        "Hugging Face permission denied (403). Ensure your HF_TOKEN has 'Read' access "
                        "to public repositories and Spaces (not just 'Inference Providers')."
                    )
                }

            # 3. ZeroGPU daily quota specifically exceeded
            if "gpu quota" in err_str.lower() or "exceeded your gpu quota" in err_str.lower():
                if has_token:
                    return {
                        "success": False,
                        "error": "VTON_ZEROGPU_QUOTA_EXCEEDED",
                        "code": "VTON_ZEROGPU_QUOTA_EXCEEDED",
                        "token_configured": True,
                        "message": (
                            "Hugging Face ZeroGPU daily quota exceeded for your account. "
                            "ZeroGPU imposes a daily GPU quota on free accounts. "
                            "Please wait for your quota to reset or upgrade to Hugging Face PRO."
                        )
                    }
                else:
                    return {
                        "success": False,
                        "error": "VTON_ZEROGPU_QUOTA_EXCEEDED",
                        "code": "VTON_ZEROGPU_QUOTA_EXCEEDED",
                        "token_configured": False,
                        "message": (
                            "Hugging Face ZeroGPU quota exceeded for anonymous shared IP. "
                            "Please configure a free Hugging Face User Access Token (HF_TOKEN) in Render environment variables."
                        )
                    }

            # 4. HTTP 429 Rate Limit
            if (
                status_code == 429
                or "429" in err_str
                or "rate limit" in err_str.lower()
                or "too many requests" in err_str.lower()
            ):
                if has_token:
                    return {
                        "success": False,
                        "error": "VTON_RATE_LIMITED",
                        "code": "VTON_RATE_LIMITED",
                        "status_code": 429,
                        "token_configured": True,
                        "message": (
                            "Hugging Face rate limit reached. Too many requests were sent in a short period. "
                            "Please wait a moment before trying again."
                        )
                    }
                else:
                    return {
                        "success": False,
                        "error": "VTON_RATE_LIMITED",
                        "code": "VTON_RATE_LIMITED",
                        "status_code": 429,
                        "token_configured": False,
                        "message": (
                            "Hosted OOTDiffusion Space rate limit reached for anonymous requests. "
                            "Please wait a moment or configure an HF_TOKEN in Render environment variables."
                        )
                    }

            # 5. Timeout
            if isinstance(e, (asyncio.TimeoutError, httpx.TimeoutException)) or "timeout" in err_str.lower():
                return {
                    "success": False,
                    "error": "VTON_TIMEOUT",
                    "code": "VTON_TIMEOUT",
                    "message": (
                        "Hosted OOTDiffusion inference timed out. The Hugging Face Space may be under heavy queue load. "
                        "Please try again."
                    )
                }

            # 6. Generic inference failure
            return {
                "success": False,
                "error": "VTON_INFERENCE_FAILED",
                "code": "VTON_INFERENCE_FAILED",
                "status_code": status_code,
                "token_configured": has_token,
                "message": f"Hosted OOTDiffusion generation failed: {err_str[:250]}"
            }

        finally:
            # Ephemeral security: Guarantee cleanup of input portraits
            for tmp_path in (person_tmp.name, garment_tmp.name):
                if os.path.exists(tmp_path):
                    try:
                        os.remove(tmp_path)
                    except Exception:
                        pass


class WorkerOOTDiffusionProvider:
    """
    Remote Self-Hosted GPU Worker Provider (e.g., Google Colab with T4 GPU via tunnel).
    Active only when OOTD_WORKER_URL is explicitly set.
    """

    @property
    def worker_url(self) -> str:
        return os.environ.get("OOTD_WORKER_URL", "").strip().rstrip("/")

    @property
    def name(self) -> str:
        return "OOTDiffusion (Remote Worker)"

    @property
    def is_configured(self) -> bool:
        return bool(self.worker_url)

    @property
    def is_available(self) -> bool:
        return bool(self.worker_url)

    @property
    def environment_type(self) -> str:
        return f"Remote GPU Worker ({self.worker_url})"

    async def generate_tryon(
        self,
        person_bytes: bytes,
        garment_bytes: bytes,
        garment_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        person_b64 = f"data:image/jpeg;base64,{base64.b64encode(person_bytes).decode('utf-8')}"
        garment_data_uri = garment_info.get("image_data_uri")
        if not garment_data_uri:
            garment_b64 = f"data:image/jpeg;base64,{base64.b64encode(garment_bytes).decode('utf-8')}"
        else:
            garment_b64 = garment_data_uri

        category = garment_info.get("category", "dress")

        try:
            payload = {
                "model_image": person_b64,
                "garment_image": garment_b64,
                "category": category,
                "n_samples": 1,
                "scale": 2.0
            }
            async with httpx.AsyncClient(timeout=120.0) as client:
                res = await client.post(f"{self.worker_url}/run", json=payload)
                if res.status_code == 200:
                    data = res.json()
                    image_url = data.get("image_url") or data.get("output")
                    if image_url:
                        return {
                            "success": True,
                            "image_url": image_url,
                            "provider": self.name,
                            "environment": self.environment_type,
                            "garment": {
                                "garment_id": garment_info.get("garment_id"),
                                "color_name": garment_info.get("color_name"),
                                "color_hex": garment_info.get("color_hex"),
                                "dress_type": garment_info.get("dress_type"),
                                "category": category
                            },
                            "message": f"Successfully generated look in {garment_info.get('color_name')} {garment_info.get('dress_type')} via {self.name}."
                        }
                return {
                    "success": False,
                    "error": "VTON_WORKER_ERROR",
                    "code": "VTON_WORKER_ERROR",
                    "message": f"OOTDiffusion worker returned status {res.status_code}: {res.text[:200]}"
                }
        except Exception as e:
            return {
                "success": False,
                "error": "VTON_WORKER_UNREACHABLE",
                "code": "VTON_WORKER_UNREACHABLE",
                "message": f"Could not reach OOTDiffusion worker at {self.worker_url}: {str(e)}"
            }


class VirtualTryOnService:
    """
    Central orchestration service for Virtual Try-On using open-source OOTDiffusion.
    Prioritizes official hosted Gradio API on Hugging Face (requiring zero local GPU),
    with support for custom remote GPU worker if OOTD_WORKER_URL is set.
    """

    def __init__(self):
        self.hosted_provider = HostedOOTDiffusionProvider()
        self.worker_provider = WorkerOOTDiffusionProvider()

    @property
    def active_provider(self):
        # If OOTD_WORKER_URL is explicitly provided, prioritize the self-hosted worker
        if self.worker_provider.is_configured:
            return self.worker_provider
        return self.hosted_provider

    @property
    def is_available(self) -> bool:
        return self.active_provider.is_available

    @property
    def provider_name(self) -> str:
        return self.active_provider.name

    def get_status(self) -> Dict[str, Any]:
        available_garments = garment_catalog.get_available_garments()
        provider = self.active_provider
        has_token = bool(getattr(provider, "hf_token", None))
        return {
            "provider": provider.name,
            "mode": "worker" if provider is self.worker_provider else "hosted",
            "available": provider.is_available,
            "configured": provider.is_configured,
            "environment": provider.environment_type,
            "space": getattr(provider, "space_name", None),
            "token_configured": has_token,
            "available_garments_count": len(available_garments)
        }

    async def run_try_on(
        self,
        person_bytes: bytes,
        dress_type: str,
        color_name: str,
        color_hex: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes try-on request with real garment asset and active OOTDiffusion provider.
        """
        # 1. Look up real garment photography asset
        garment_info = garment_catalog.get_garment(
            dress_type=dress_type,
            color_name=color_name,
            color_hex=color_hex
        )

        if not garment_info or not garment_info.get("image_bytes"):
            available = garment_catalog.get_available_garments()
            return {
                "success": False,
                "error": "GARMENT_ASSET_UNAVAILABLE",
                "code": "GARMENT_ASSET_UNAVAILABLE",
                "message": "Virtual try-on isn't available for this outfit yet. We only generate try-ons with real garment photography to ensure quality.",
                "requested": {
                    "dress_type": dress_type,
                    "color_name": color_name
                },
                "available_garments": available
            }

        # 2. Check if provider is available
        if not self.is_available:
            return {
                "success": False,
                "error": "VTON_MODEL_UNAVAILABLE",
                "code": "VTON_MODEL_UNAVAILABLE",
                "message": "AI Virtual Try-On is currently unavailable. No hosted Space or GPU worker is configured.",
                "garment": {
                    "garment_id": garment_info.get("garment_id"),
                    "color_name": garment_info.get("color_name"),
                    "dress_type": garment_info.get("dress_type")
                }
            }

        # 3. Call active provider
        return await self.active_provider.generate_tryon(
            person_bytes=person_bytes,
            garment_bytes=garment_info["image_bytes"],
            garment_info=garment_info
        )


# Singleton service instance
virtual_tryon_service = VirtualTryOnService()
