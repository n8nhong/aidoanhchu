// src/utils/shopee.ts
// Utility functions để lấy danh sách sản phẩm từ Shopee Affiliate bằng API (nếu có).
// Nếu chưa có API, bạn có thể thay thế bằng cách scrape trang web bằng puppeteer.
// Các tham số sau cần được điền trong file .env của dự án.

import fetch from 'node-fetch';
import crypto from 'crypto';

/**
 * Tạo chữ ký (signature) cho yêu cầu Shopee API.
 * @param partnerId  - ID đối tác (partner_id) mà Shopee cấp.
 * @param apiKey    - API key tương ứng.
 * @param timestamp - thời gian hiện tại (ms).
 * @param body      - chuỗi JSON của body (nếu có).
 */
function signRequest(partnerId: string, apiKey: string, timestamp: number, body: string = ''): string {
  const baseString = `${partnerId}${apiKey}${timestamp}${body}`;
  return crypto.createHash('sha256').update(baseString).digest('hex');
}

/**
 * Lấy danh sách sản phẩm Affiliate.
 * API mẫu: https://partner.shopeemobile.com/api/v1/item/search
 * (Bạn cần thay đổi URL và tham số theo tài liệu Shopee thực tế.)
 */
export async function fetchAffiliateProducts(): Promise<any[]> {
  const partnerId = process.env.SHOPPEE_PARTNER_ID || '';
  const apiKey = process.env.SHOPPEE_API_KEY || '';
  const shopId = process.env.SHOPPEE_SHOP_ID || '';

  if (!partnerId || !apiKey || !shopId) {
    throw new Error('Chưa thiết lập biến môi trường SHOPEE_PARTNER_ID, SHOPEE_API_KEY, SHOPEE_SHOP_ID');
  }

  const timestamp = Date.now();
  const body = JSON.stringify({
    partner_id: partnerId,
    shopid: Number(shopId),
    // Các filter tùy ý, ví dụ: lấy tất cả sản phẩm.
    // Bạn có thể thêm query để lọc theo doanh số, tỷ lệ hoa hồng ở phía client.
  });
  const signature = signRequest(partnerId, apiKey, timestamp, body);

  const url = `https://partner.shopeemobile.com/api/v1/item/search?signature=${signature}&timestamp=${timestamp}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Lỗi khi gọi Shopee API: ${res.status} ${txt}`);
  }

  const data = await res.json();
  // Dữ liệu trả về thường nằm trong data.response.item_list
  const items = data?.response?.item_list || [];
  return items;
}

/**
 * Lọc các sản phẩm thỏa mãn tiêu chí:
 * - doanh số (sale) > 1000
 * - tỷ lệ hoa hồng >= 12%
 */
export function filterHighCommissionProducts(items: any[]): any[] {
  return items.filter((it) => {
    const sales = Number(it.item_sale) || 0; // tùy vào schema thực tế
    const commission = Number(it.commission_rate) || 0; // phần trăm
    return sales > 1000 && commission >= 12;
  });
}

/**
 * Chuyển đổi dữ liệu Shopee thành kiểu Product mà hệ thống đang dùng.
 * Bạn cần điều chỉnh các trường sao cho khớp với interface Product.
 */
export function mapToProduct(item: any) {
  return {
    id: `shopee_${item.item_id || item.itemid || item.itemId}`,
    title: item.item_name || item.name || '',
    price: Number(item.item_price || item.price) / 100000, // Shopee trả giá (đơn vị VND*100)
    originalPrice: Number(item.item_price_before_discount || item.original_price || 0) / 100000,
    image: (item.item_image?.[0]) || item.image || '',
    // Correct affiliate/product link: /product/{shopId}/{itemId} or -i.{shopId}.{itemId}
    affiliateLink: `https://shopee.vn/product/${item.shopid || item.shop_id || item.shopId}/${item.itemid || item.item_id || item.itemId}`,
    platform: 'shopee',
    isPublished: false,
    // Các trường tùy chỉnh khác nếu cần
  } as any; // ép kiểu, sau này sẽ sửa lại cho đúng
}
