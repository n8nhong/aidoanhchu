import { getSupabase } from './supabaseClient';

/**
 * Generate article content for a product using Gemini API.
 * Expects GEMINI_API_KEY stored in localStorage under 'gemini_key' (free key).
 */
export interface GeminiProductParams {
  apiKey: string;
  productName: string;
  rawLinkInput?: string;
  categoryId?: string;
  extraInfo?: string;
  productImageBase64?: string;
  price?: number;
  originalPrice?: number;
}

export interface GeminiProductResult {
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  imageKeyword: string;
}

/**
 * Generate article content and image prompt using Gemini API.
 */
export async function generateProductContent(params: GeminiProductParams): Promise<GeminiProductResult> {
  if (!params.apiKey) {
    throw new Error('Gemini API key not configured');
  }

  const prompt = `Bạn là một chuyên gia viết nội dung tiếp thị liên kết Shopee và chuyên gia tạo prompt (câu lệnh) cho AI vẽ ảnh.
Sản phẩm: "${params.productName}"
Thông tin thêm: "${params.extraInfo || ''}"
Giá: ${params.price || 0} VNĐ

YÊU CẦU TRẢ VỀ DƯỚI DẠNG JSON HỢP LỆ THEO CẤU TRÚC SAU (không chứa markdown block):
{
  "title": "Tiêu đề hấp dẫn ngắn gọn (kèm emoji)",
  "description": "Bài mô tả sản phẩm cực kỳ chi tiết, sinh động, chèn emoji, chuẩn SEO, tập trung sâu vào lợi ích, công dụng và kêu gọi mua hàng. Khoảng 300-500 từ. TUYỆT ĐỐI KHÔNG NHẮC ĐẾN TỶ LỆ HOA HỒNG hay thông tin nội bộ của Shopee.",
  "price": ${params.price || 0},
  "originalPrice": ${params.originalPrice || 0},
  "imageKeyword": "Câu lệnh tiếng Anh chi tiết để vẽ ảnh nền mới cho sản phẩm này. Hãy tưởng tượng bối cảnh đẹp và phù hợp (ví dụ: đang ở bãi biển, con đường làng, quán cafe đẹp, không gian sang trọng). BẮT BUỘC giữ nguyên sản phẩm, người mẫu. Câu lệnh phải bắt đầu bằng: '${params.productName}, high-resolution product photo, placed on/in [new background description], realistic, masterpiece, highly detailed, keep original product intact, no extra text'"
}`;

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' + params.apiKey, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { response_mime_type: "application/json" }
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    if (response.status === 429) {
       throw new Error(`Gemini API Quota Exceeded (Hết hạn mức). Vui lòng thêm API Key khác.`);
    }
    throw new Error(`Gemini error ${response.status}: ${err}`);
  }
  
  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');
  
  try {
    const cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanText);
    return parsed as GeminiProductResult;
  } catch (e) {
    throw new Error('Invalid JSON from Gemini: ' + text);
  }
}
