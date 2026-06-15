"""
Máy chủ tạo ảnh sản phẩm chạy trên GPU local (RTX 3060 12GB).
Pipeline: tách nền sản phẩm (rembg) -> tạo nền cảnh (Stable Diffusion) -> ghép ảnh.

Chạy: python server.py
API: http://127.0.0.1:8765
"""

from __future__ import annotations

import base64
import io
import os
import time
from typing import Optional

import requests
import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageOps
from pydantic import BaseModel

app = FastAPI(title="Affilishop Local Image AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prompt nền theo ngành hàng
CATEGORY_PROMPTS = {
    "1": "professional men's fashion boutique interior, warm studio lighting, wooden shelves, shallow depth of field, photorealistic product display background",
    "7": "elegant women's fashion boutique, soft natural light, minimalist display, pastel tones, bokeh background, photorealistic",
    "2": "luxury cosmetics counter, marble surface, soft pink lighting, beauty product photography background, clean and elegant",
    "3": "modern tech desk setup, minimalist workspace, soft blue ambient light, product photography background, clean",
    "4": "modern kitchen interior, bright natural light, clean countertop, home appliance product photography background",
    "5": "wellness spa atmosphere, green plants, soft natural light, health product photography background",
    "6": "cozy nursery room, soft warm lighting, pastel colors, baby product photography background",
}

DEFAULT_PROMPT = "professional e-commerce product photography background, soft studio lighting, clean modern interior, shallow depth of field, photorealistic, 8k"

_sd_pipe = None
_device = "cuda" if torch.cuda.is_available() else "cpu"


class ProcessRequest(BaseModel):
    image_url: str
    prompt: Optional[str] = None
    category_id: Optional[str] = "1"
    product_name: Optional[str] = ""
    strength: Optional[float] = 0.42


def get_sd_pipeline():
    global _sd_pipe
    if _sd_pipe is not None:
        return _sd_pipe

    from diffusers import StableDiffusionImg2ImgPipeline

    model_id = os.environ.get("SD_MODEL_ID", "runwayml/stable-diffusion-v1-5")
    dtype = torch.float16 if _device == "cuda" else torch.float32

    print(f"[Local AI] Đang tải model {model_id} lên {_device}...")
    pipe = StableDiffusionImg2ImgPipeline.from_pretrained(
        model_id,
        torch_dtype=dtype,
        safety_checker=None,
        requires_safety_checker=False,
    )

    if _device == "cuda":
        pipe = pipe.to("cuda")
        try:
            pipe.enable_attention_slicing()
        except Exception:
            pass
    else:
        print("[Local AI] Cảnh báo: Không có CUDA, chạy trên CPU sẽ rất chậm.")

    _sd_pipe = pipe
    print("[Local AI] Model đã sẵn sàng.")
    return _sd_pipe


def download_image(url: str) -> Image.Image:
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    resp = requests.get(url, headers=headers, timeout=30)
    resp.raise_for_status()
    return Image.open(io.BytesIO(resp.content)).convert("RGB")


def remove_background(img: Image.Image) -> Image.Image:
    from rembg import remove

    rgba = remove(img)
    if isinstance(rgba, bytes):
        rgba = Image.open(io.BytesIO(rgba))
    return rgba.convert("RGBA")


def build_prompt(req: ProcessRequest) -> str:
    if req.prompt and req.prompt.strip():
        return req.prompt.strip()
    cat_prompt = CATEGORY_PROMPTS.get(str(req.category_id or "1"), DEFAULT_PROMPT)
    name = (req.product_name or "").strip()
    if name:
        return f"{name}, product photo, {cat_prompt}, keep product intact, no text, no watermark"
    return cat_prompt


def composite_product_on_image(product_rgba: Image.Image, background: Image.Image) -> Image.Image:
    bg = background.convert("RGBA").resize((768, 768), Image.Resampling.LANCZOS)
    product = ImageOps.contain(product_rgba, (int(768 * 0.78), int(768 * 0.78)), Image.Resampling.LANCZOS)
    canvas = bg.copy()
    x = (bg.width - product.width) // 2
    y = (bg.height - product.height) // 2
    canvas.paste(product, (x, y), product)
    return canvas.convert("RGB")


def generate_background(pipe, init_image: Image.Image, prompt: str, strength: float) -> Image.Image:
    resized = init_image.resize((512, 512), Image.Resampling.LANCZOS)
    negative = "blurry, low quality, text, watermark, logo, deformed, ugly, bad anatomy"
    with torch.inference_mode():
        result = pipe(
            prompt=prompt,
            negative_prompt=negative,
            image=resized,
            strength=strength,
            num_inference_steps=28,
            guidance_scale=7.0,
        ).images[0]
    return result.resize((768, 768), Image.Resampling.LANCZOS)


@app.get("/health")
def health():
    gpu_name = torch.cuda.get_device_name(0) if torch.cuda.is_available() else None
    vram_gb = round(torch.cuda.get_device_properties(0).total_memory / 1024**3, 1) if torch.cuda.is_available() else 0
    return {
        "status": "ok",
        "device": _device,
        "gpu": gpu_name,
        "vram_gb": vram_gb,
        "model_loaded": _sd_pipe is not None,
    }


@app.post("/process")
def process_image(req: ProcessRequest):
    if not req.image_url:
        raise HTTPException(status_code=400, detail="image_url is required")

    t0 = time.time()
    try:
        original = download_image(req.image_url)
        product_rgba = remove_background(original)
        prompt = build_prompt(req)
        pipe = get_sd_pipeline()
        background = generate_background(pipe, original, prompt, req.strength or 0.42)
        final = composite_product_on_image(product_rgba, background)

        buf = io.BytesIO()
        final.save(buf, format="JPEG", quality=92, optimize=True)
        b64 = base64.b64encode(buf.getvalue()).decode("ascii")

        elapsed = round(time.time() - t0, 1)
        print(f"[Local AI] Xử lý xong trong {elapsed}s | {req.product_name or req.image_url[:40]}")
        return {
            "success": True,
            "image_base64": b64,
            "mime": "image/jpeg",
            "prompt_used": prompt,
            "elapsed_seconds": elapsed,
        }
    except Exception as e:
        print(f"[Local AI] Lỗi: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("LOCAL_SD_PORT", "8765"))
    print("=" * 60)
    print("  Affilishop Local Image AI")
    print(f"  GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'}")
    print(f"  URL: http://127.0.0.1:{port}")
    print("  Giữ cửa sổ này mở khi xử lý ảnh sản phẩm.")
    print("=" * 60)
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="info")
