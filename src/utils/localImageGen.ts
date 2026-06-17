/**
 * Gọi máy chủ tạo ảnh chạy trên GPU local (RTX 3060).
 * Chạy local-ai/start.bat trước khi xử lý ảnh.
 */

export const DEFAULT_LOCAL_SD_URL = 'http://127.0.0.1:8765';
const STORAGE_KEY = 'local_sd_url';

export const getLocalSdUrl = (): string => {
  try {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_LOCAL_SD_URL;
  } catch {
    return DEFAULT_LOCAL_SD_URL;
  }
};

export const setLocalSdUrl = (url: string): void => {
  localStorage.setItem(STORAGE_KEY, url.trim() || DEFAULT_LOCAL_SD_URL);
};

export interface LocalImageHealth {
  status: string;
  device?: string;
  gpu?: string;
  vram_gb?: number;
  model_loaded?: boolean;
}

export interface ProcessLocalImageParams {
  imageUrl: string;
  prompt?: string;
  categoryId?: string;
  productName?: string;
  baseUrl?: string;
}

/** Kiểm tra máy tạo ảnh local có đang chạy không */
export async function checkLocalImageService(baseUrl?: string): Promise<LocalImageHealth | null> {
  // Disable local GPU checks when running in deployed Cloud Run / production environments
  try {
    if (typeof window !== 'undefined' && /run\.app$/.test(window.location.hostname)) {
      return null;
    }
  } catch {
    // fallthrough
  }

  const url = (baseUrl || getLocalSdUrl()).replace(/\/$/, '');
  try {
    const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function isLocalImageServiceAvailable(baseUrl?: string): Promise<boolean> {
  try {
    if (typeof window !== 'undefined' && /run\.app$/.test(window.location.hostname)) {
      return false;
    }
  } catch {
    // ignore
  }
  const health = await checkLocalImageService(baseUrl);
  return health?.status === 'ok';
}

/**
 * Tạo ảnh sản phẩm bằng GPU local.
 * Trả về data URL (data:image/jpeg;base64,...).
 */
export async function processProductImageLocal(params: ProcessLocalImageParams): Promise<string> {
  // Prevent calling local GPU service in deployed environments
  try {
    if (typeof window !== 'undefined' && /run\.app$/.test(window.location.hostname)) {
      throw new Error('Local image generation disabled in deployed app');
    }
  } catch (e) {
    // If window is undefined (SSR) or regex throws, continue to attempt local call
    if (typeof window !== 'undefined' && /run\.app$/.test(window.location.hostname)) {
      throw new Error('Local image generation disabled in deployed app');
    }
  }

  const base = (params.baseUrl || getLocalSdUrl()).replace(/\/$/, '');

  const res = await fetch(`${base}/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_url: params.imageUrl,
      prompt: params.prompt,
      category_id: params.categoryId || '1',
      product_name: params.productName || '',
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Local AI lỗi HTTP ${res.status}`);
  }

  const data = await res.json();
  if (!data.image_base64) {
    throw new Error('Local AI không trả về ảnh');
  }

  const mime = data.mime || 'image/jpeg';
  return `data:${mime};base64,${data.image_base64}`;
}
