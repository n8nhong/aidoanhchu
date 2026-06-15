import { getSupabase } from './supabaseClient';

/**
 * Generate article content for a product using Gemini API.
 * Supports multiple API keys with rotation and retry logic.
 */
export interface GeminiProductParams {
  apiKeys?: string[];  // Array of API keys to try (rotate between them)
  apiKey?: string;     // Fallback: single API key
  productName: string;
  rawLinkInput?: string;
  categoryId?: string;
  extraInfo?: string;
  productImageBase64?: string;
  price?: number;
  originalPrice?: number;
  onProgress?: (msg: string) => void;  // Callback for progress
}

export interface GeminiProductResult {
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  imageKeyword: string;
}

/**
 * Create fallback description (used when all API keys fail)
 */
function createFallbackDescription(params: GeminiProductParams): GeminiProductResult {
  const { productName, extraInfo, price, originalPrice } = params;
  
  return {
    title: `✨ ${productName}`,
    description: `✨ ${productName}\n\n${extraInfo || 'Sản phẩm chất lượng cao, được tin dùng bởi hàng nghìn khách hàng trên Shopee.'}\n\n📌 TỔNG QUAN SẢN PHẨM\nSản phẩm mang đến giá trị vượt trội với thiết kế tinh tế, chất liệu bền bỉ và mức giá cạnh tranh. Đây là lựa chọn lý tưởng cho những ai muốn sở hữu sản phẩm chất lượng mà không tốn quá nhiều chi phí.\n\n🎯 ĐIỂM NỔI BẬT\n✅ Chất lượng đảm bảo, nguồn gốc rõ ràng\n✅ Thiết kế hiện đại, phù hợp nhiều phong cách\n✅ Giá tốt, ưu đãi hấp dẫn khi mua qua liên kết\n✅ Được nhiều khách hàng đánh giá tích cực\n\n💡 HƯỚNG DẪN SỬ DỤNG\nSử dụng sản phẩm theo hướng dẫn trên bao bì hoặc mô tả của shop gốc. Bảo quản nơi khô ráo, thoáng mát để giữ chất lượng lâu dài.\n\n🛒 KÊU GỌI MUA HÀNG\nĐừng bỏ lỡ cơ hội sở hữu ${productName} với mức giá ưu đãi! Nhấn nút mua hàng bên dưới để chuyển đến trang Shopee chính thức, xem đánh giá thực tế và đặt hàng ngay hôm nay! 🎁`,
    price: price || 0,
    originalPrice: originalPrice || 0,
    imageKeyword: `${productName}, high-resolution product photo, on white background, realistic, masterpiece, highly detailed`
  };
}

/**
 * Try a single API call with specific model and key
 */
async function tryGeminiCall(
  apiKey: string,
  model: string,
  prompt: string,
  retries: number = 2
): Promise<GeminiProductResult | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { response_mime_type: "application/json" }
          }),
        }
      );

      if (!response.ok) {
        const err = await response.text();
        
        // 429 = Rate Limited, 503 = Service Unavailable - try next attempt
        if (response.status === 429 || response.status === 503) {
          if (attempt < retries) {
            await new Promise(r => setTimeout(r, 1000 * attempt)); // Exponential backoff
            continue;
          }
          return null;
        }
        
        // 404 = Model not found with this key - skip to next key/model
        if (response.status === 404) {
          return null;
        }
        
        throw new Error(`HTTP ${response.status}: ${err.substring(0, 100)}`);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) return null;

      const cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanText);
      return parsed as GeminiProductResult;

    } catch (error: any) {
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 500 * attempt));
        continue;
      }
      console.warn(`❌ Attempt ${attempt} failed for model ${model}:`, error.message);
      return null;
    }
  }

  return null;
}

/**
 * Generate article content using Gemini API with key rotation and fallback
 */
export async function generateProductContent(params: GeminiProductParams): Promise<GeminiProductResult> {
  const prompt = `Bạn là một chuyên gia viết nội dung tiếp thị liên kết Shopee và chuyên gia tạo prompt (câu lệnh) cho AI vẽ ảnh.
Sản phẩm: "${params.productName}"
Thông tin thêm: "${params.extraInfo || ''}"
Giá: ${params.price || 0} VNĐ

YÊU CẦU TRẢ VỀ DƯỚI DẠNG JSON HỢP LỆ THEO CẤU TRÚC SAU (không chứa markdown block):
{
  "title": "Tiêu đề hấp dẫn ngắn gọn (kèm emoji)",
  "description": "Bài mô tả sản phẩm chi tiết, sinh động, chuẩn SEO. Chia mục bằng emoji: 📌 TỔNG QUAN, 🎯 ĐIỂM NỔI BẬT (4-6 bullet), 💡 MẸO SỬ DỤNG, 🛒 KÊU GỌI MUA HÀNG. TỐI ĐA 500 TỪ (không vượt quá). TUYỆT ĐỐI KHÔNG NHẮC HOA HỒNG hay thông tin nội bộ Shopee.",
  "price": ${params.price || 0},
  "originalPrice": ${params.originalPrice || 0},
  "imageKeyword": "Câu lệnh tiếng Anh chi tiết để vẽ ảnh nền mới cho sản phẩm này. Hãy tưởng tượng bối cảnh đẹp và phù hợp (ví dụ: đang ở bãi biển, con đường làng, quán cafe đẹp, không gian sang trọng). BẮT BUỘC giữ nguyên sản phẩm, người mẫu. Câu lệnh phải bắt đầu bằng: '${params.productName}, high-resolution product photo, placed on/in [new background description], realistic, masterpiece, highly detailed, keep original product intact, no extra text'"
}`;

  // Get list of keys to try
  const keysToTry = params.apiKeys && params.apiKeys.length > 0 
    ? params.apiKeys 
    : (params.apiKey ? [params.apiKey] : []);

  if (keysToTry.length === 0) {
    throw new Error('Không có Gemini API key. Vui lòng thiết lập ít nhất 1 key.');
  }

  // Models to try — ưu tiên bản free tier
  const modelsToTry = [
    'gemini-1.5-flash',
    'gemini-2.0-flash-exp',
    'gemini-1.0-pro',
  ];

  // Try each key with each model
  for (let keyIndex = 0; keyIndex < keysToTry.length; keyIndex++) {
    const key = keysToTry[keyIndex];
    
    for (let modelIndex = 0; modelIndex < modelsToTry.length; modelIndex++) {
      const model = modelsToTry[modelIndex];
      
      params.onProgress?.(`🔄 Thử key ${keyIndex + 1}/${keysToTry.length} với model ${model}...`);

      const result = await tryGeminiCall(key, model, prompt, 2);
      
      if (result) {
        params.onProgress?.(`✅ Thành công với key ${keyIndex + 1} + model ${model}!`);
        return result;
      }

      // Wait before trying next model
      await new Promise(r => setTimeout(r, 300));
    }
  }

  // All keys/models failed - use fallback
  params.onProgress?.(`⚠️ Tất cả key/model đã hết quota. Dùng mô tả mặc định...`);
  return createFallbackDescription(params);
}
