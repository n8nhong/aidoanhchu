/**
 * HuggingFace API - Tạo ảnh nền sản phẩm
 * Sử dụng model Stable Diffusion 2 miễn phí từ HuggingFace
 */

export interface HFGenerateResult {
  imageBlob: Blob;
  imageId: string;
  timestamp: string;
}

/**
 * Gọi HuggingFace API để tạo ảnh nền
 * @param prompt Prompt tiếng Anh mô tả nền ảnh
 * @param hfToken HuggingFace API token
 * @param productId ID sản phẩm (để tạo imageId unique)
 */
export async function generateBackgroundImageHF(
  prompt: string,
  hfToken: string,
  productId: string
): Promise<HFGenerateResult> {
  if (!hfToken) {
    throw new Error('HuggingFace token not configured. Add token in Settings tab.');
  }

  if (!prompt || prompt.trim().length === 0) {
    throw new Error('Prompt cannot be empty');
  }

  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2',
      {
        headers: { Authorization: `Bearer ${hfToken}` },
        method: 'POST',
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            negative_prompt: 'watermark, text, logo, blurry, distorted, low quality',
            num_inference_steps: 25,
            guidance_scale: 7.5
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      
      if (response.status === 401) {
        throw new Error('❌ HuggingFace token không hợp lệ. Kiểm tra lại token trong Settings.');
      }
      
      if (response.status === 429) {
        throw new Error('⏳ HuggingFace bận. Hãy chờ 1 phút rồi thử lại.');
      }

      throw new Error(`API error ${response.status}: ${errorData.error || 'Unknown error'}`);
    }

    const imageBlob = await response.blob();
    const imageId = `bg_${productId}_${Date.now()}`;
    const timestamp = new Date().toISOString();

    return { imageBlob, imageId, timestamp };
  } catch (error: any) {
    console.error('HuggingFace API error:', error);
    throw error;
  }
}

/**
 * Test HuggingFace token (để verify token hợp lệ)
 */
export async function testHuggingFaceToken(hfToken: string): Promise<boolean> {
  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2',
      {
        headers: { Authorization: `Bearer ${hfToken}` },
        method: 'POST',
        body: JSON.stringify({
          inputs: 'test prompt'
        }),
      }
    );

    // Nếu không phải 401, token là hợp lệ (dù request có fail vì lý do khác)
    return response.status !== 401;
  } catch (error) {
    console.error('Token test error:', error);
    return false;
  }
}
