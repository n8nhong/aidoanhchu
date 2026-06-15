/**
 * CSV Processor - Xử lý file CSV chứa danh sách link sản phẩm Shopee
 */

export interface ShopeeProduct {
  itemId: string;
  itemName: string;
  price: string;
  sales: string;
  shopName: string;
  commissionRate: string;
  commission: string;
  productLink: string;
  offerLink: string;
}

/**
 * Đọc file CSV và chuyển đổi thành mảng object
 */
export const parseCSV = (csvContent: string): ShopeeProduct[] => {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const products: ShopeeProduct[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    
    if (values.length < 9) continue;

    products.push({
      itemId: values[0],
      itemName: values[1],
      price: values[2],
      sales: values[3],
      shopName: values[4],
      commissionRate: values[5],
      commission: values[6],
      productLink: values[7],
      offerLink: values[8]
    });
  }

  return products;
};

/**
 * Đọc file từ input
 */
export const readCSVFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve(content);
    };
    reader.onerror = reject;
    reader.readAsText(file, 'utf-8');
  });
};

/**
 * Trích xuất Product ID từ link Shopee
 */
export const extractProductIdFromLink = (link: string): string | null => {
  const match = link.match(/\/product\/(\d+)/);
  return match ? match[1] : null;
};

/**
 * Parse giá từ chuỗi (ví dụ: "343,0k" → 343000)
 */
export const parsePrice = (priceStr: string): number => {
  const cleaned = priceStr.replace(/[^\d.]/g, '');
  const num = parseFloat(cleaned);
  
  if (priceStr.includes('k') || priceStr.includes('K')) {
    return Math.round(num * 1000);
  }
  if (priceStr.includes('m') || priceStr.includes('M')) {
    return Math.round(num * 1000000);
  }
  
  return Math.round(num);
};

/**
 * Format tiền tệ VND
 */
export const formatPrice = (price: number): string => {
  return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

/**
 * Xác thực link Shopee có hợp lệ không
 */
export const validateShopeeLink = (link: string): boolean => {
  if (!link) return false;
  try {
    const url = new URL(link);
    const validDomains = ['shopee.vn', 'shopee.com', 'affiliate.shopee.vn'];
    return validDomains.some(domain => url.hostname.includes(domain)) && 
           url.pathname.includes('/product/');
  } catch {
    return false;
  }
};

/**
 * Tạo slug từ shop name để làm danh mục
 */
export const createStoreSlug = (shopName: string): string => {
  return shopName
    .toLowerCase()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/[đ]/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Tải ảnh từ link Shopee (extract image từ product page)
 */
export const fetchShopeeImage = async (productLink: string): Promise<string> => {
  try {
    // Nếu là affiliate link, chuyển thành product link
    const link = productLink.replace('affiliate.shopee.vn', 'shopee.vn');
    
    // Trích xuất product ID
    const match = link.match(/\/product\/(\d+)/);
    if (!match) return '';
    
    const productId = match[1];
    
    // Sử dụng Shopee API để lấy thông tin sản phẩm và ảnh
    const shopMatch = link.match(/\/shop\/([a-zA-Z0-9_-]+)/);
    if (!shopMatch) return '';
    
    const shopId = shopMatch[1];
    
    // API endpoint để lấy product detail
    const apiUrl = `https://shopee.vn/api/v2/product/get_product_detail?product_id=${productId}&shop_id=${shopId}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) return '';
    
    const data = await response.json();
    const imageUrl = data?.data?.product?.image;
    return imageUrl || '';
  } catch (error) {
    console.error('Lỗi tải ảnh từ Shopee:', error);
    return '';
  }
};
