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
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageOps, ImageFilter
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
    # NEVER include product name in background generation prompt
    if req.prompt and req.prompt.strip():
        return req.prompt.strip()
    cat_prompt = CATEGORY_PROMPTS.get(str(req.category_id or "1"), DEFAULT_PROMPT)
    # Force background-only instruction with richer scene details
    # Explicitly forbid clothing/garments so the background won't become a shirt
    return f"{cat_prompt}, empty scene, no products, no items, no clothing, no garments, only background setting, studio backdrop, seamless paper, wooden or marble surface, soft studio lighting, depth, photorealistic, no people"


def composite_product_on_image(product_rgba: Image.Image, background: Image.Image) -> Image.Image:
    bg = background.convert("RGBA").resize((768, 768), Image.Resampling.LANCZOS)
    # Ensure product is constrained to a reasonable size (reduce max scale to avoid covering background)
    product = ImageOps.contain(product_rgba, (int(768 * 0.6), int(768 * 0.6)), Image.Resampling.LANCZOS)
    canvas = bg.copy()
    x = (bg.width - product.width) // 2
    # Slightly lower the product so it sits naturally on a surface
    y = int((bg.height - product.height) // 2 + bg.height * 0.08)

    # Add subtle shadow beneath product for realism
    try:
        shadow = Image.new("RGBA", product.size, (0, 0, 0, 0))
        alpha = product.split()[-1].convert("L")
        shadow.paste((0, 0, 0, 220), (0, 0), alpha)
        shadow = shadow.filter(ImageFilter.GaussianBlur(radius=12))
        # Paste shadow slightly offset
        canvas.paste(shadow, (x + 6, y + int(product.size[1] * 0.05)), shadow)
    except Exception:
        pass

    canvas.paste(product, (x, y), product)
    return canvas.convert("RGB")


def keep_largest_alpha_region(img_rgba: Image.Image) -> Image.Image:
    """Keep only the largest connected alpha region from an RGBA image.
    This removes stray objects or multiple products present in the mask.
    """
    alpha = img_rgba.split()[-1].convert("L")
    arr = np.array(alpha)
    h, w = arr.shape
    thresh = 10
    visited = np.zeros((h, w), dtype=np.bool_)
    labels = np.zeros((h, w), dtype=np.int32)
    dirs = [(1, 0), (-1, 0), (0, 1), (0, -1)]
    label = 0
    largest_label = 0
    largest_count = 0

    for y in range(h):
        for x in range(w):
            if arr[y, x] > thresh and not visited[y, x]:
                label += 1
                stack = [(x, y)]
                visited[y, x] = True
                count = 0
                while stack:
                    cx, cy = stack.pop()
                    labels[cy, cx] = label
                    count += 1
                    for dx, dy in dirs:
                        nx, ny = cx + dx, cy + dy
                        if 0 <= nx < w and 0 <= ny < h and not visited[ny, nx] and arr[ny, nx] > thresh:
                            visited[ny, nx] = True
                            stack.append((nx, ny))
                if count > largest_count:
                    largest_count = count
                    largest_label = label

    if largest_count == 0:
        return img_rgba

    mask = (labels == largest_label).astype(np.uint8) * 255
    mask_img = Image.fromarray(mask, mode="L")
    new = Image.new("RGBA", img_rgba.size, (0, 0, 0, 0))
    new.paste(img_rgba, (0, 0), mask_img)
    return new


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
        print(f"[Local AI] ✓ Tải ảnh: {original.size}")
        
        # Step 1: Tách nền sản phẩm
        product_rgba = remove_background(original)
        print(f"[Local AI] ✓ Tách nền sản phẩm: {product_rgba.size}")
        # Keep only the largest object in case multiple products were detected
        product_rgba = keep_largest_alpha_region(product_rgba)
        print(f"[Local AI] ✓ Giữ vật thể lớn nhất: {product_rgba.size}")
        
        # Step 2: Build prompt BACKGROUND ONLY - không có bất kỳ mention sản phẩm nào
        prompt = build_prompt(req)
        
        pipe = get_sd_pipeline()
        
        # Step 3: PHƯƠNG PHÁP MỚI - Generate PURE BACKGROUND mà không bị ảnh hưởng bởi sản phẩm
        # Use txt2img (strength=1.0) thay vì img2img để tránh hoàn toàn artifact từ input
        # Nó sẽ regenerate 100% từ text prompt, không reference input image
        white_canvas = Image.new("RGB", (512, 512), color=(255, 255, 255))
        
        negative = "blurry, low quality, text, watermark, logo, deformed, ugly, bad anatomy, duplicate, product, items, object, clothing, shirt, polo, shoe, headphone, earphone, device, electronics, mannequin, model, person"
        
        with torch.inference_mode():
            background = pipe(
                prompt=prompt,
                negative_prompt=negative,
                image=white_canvas,
                strength=1.0,
                num_inference_steps=75,
                guidance_scale=8.5,
            ).images[0]
        
        background = background.resize((768, 768), Image.Resampling.LANCZOS)
        print(f"[Local AI] ✓ Generate background (strength=1.0): {background.size}")
        print(f"[Local AI] ✓ Prompt: {prompt[:80]}...")
        
        # Step 4: Ghép sản phẩm DEEPCOPY lên nền (sản phẩm đã bị isolate ở bước 1)
        final = composite_product_on_image(product_rgba, background)
        print(f"[Local AI] ✓ Composite: {final.size}")

        buf = io.BytesIO()
        final.save(buf, format="JPEG", quality=92, optimize=True)
        b64 = base64.b64encode(buf.getvalue()).decode("ascii")

        elapsed = round(time.time() - t0, 1)
        print(f"[Local AI] ✅ Xử lý xong trong {elapsed}s | {req.image_url[:40]}")
        return {
            "success": True,
            "image_base64": b64,
            "mime": "image/jpeg",
            "prompt_used": prompt,
            "elapsed_seconds": elapsed,
        }
    except Exception as e:
        print(f"[Local AI] ❌ Lỗi: {e}")
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
