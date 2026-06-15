import { getSupabase } from './supabaseClient';

/**
 * Generate article content for a product using Gemini API.
 * Expects GEMINI_API_KEY stored in localStorage under 'gemini_key' (free key).
 */
export async function generateProductContent(title: string, sales: number, commission: number): Promise<string> {
  const apiKey = localStorage.getItem('gemini_key');
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  const prompt = `Viết một bài mô tả ngắn gọn, hấp dẫn (khoảng 150-200 từ) cho sản phẩm "${title}". ` +
    `Sản phẩm đã bán hơn ${sales} đơn và có tỷ lệ hoa hồng ${commission}% trên Shopee. ` +
    `Nên nêu lợi ích, chất lượng, và khuyến khích người đọc mua ngay. ` +
    `Sử dụng giọng điệu thân thiện, chuẩn SEO, và chèn hashtag liên quan.`;

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini error ${response.status}: ${err}`);
  }
  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return text || '';
}
