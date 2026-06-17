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
  const num = parseFloat(cleaned) || 0;

  if (priceStr.toLowerCase().includes('k')) {
    return Math.round(num * 1000);
  }
  if (priceStr.toLowerCase().includes('m')) {
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
const resolveShopeeRedirect = async (link: string): Promise<string> => {
  try {
    const url = new URL(link.trim());
    const hostname = url.hostname.toLowerCase();
    if (hostname === 's.shopee.vn' || hostname === 'shp.ee') {
      const res = await fetch(link, { method: 'GET', redirect: 'follow' });
      return res.url || link;
    }
  } catch {
    return link;
  }
  return link;
};

const extractShopeeIdsFromUrl = (link: string): { shopId?: string; itemId?: string } => {
  try {
    const url = new URL(link.trim());
    const search = url.searchParams;
    const pathname = url.pathname;

    // E.g. https://shopee.vn/...-i.shopId.itemId
    const directMatch = pathname.match(/-i\.(\d+)\.(\d+)/);
    if (directMatch) {
      return { shopId: directMatch[1], itemId: directMatch[2] };
    }

    // E.g. https://shopee.vn/product/shopId/itemId
    const productPathMatch = pathname.match(/\/product\/(\d+)\/(\d+)/);
    if (productPathMatch) {
      return { shopId: productPathMatch[1], itemId: productPathMatch[2] };
    }

    // Some affiliate / offer URLs include query parameters
    const itemId = search.get('itemid') || search.get('item_id') || search.get('product_id');
    const shopId = search.get('shopid') || search.get('shop_id');
    if (itemId && shopId) {
      return { shopId, itemId };
    }

    // Fallback to regex on the full link string for other shapes
    const normalized = link.replace(/https?:\/\//gi, '').replace(/www\./gi, '');
    const patterns: Array<RegExp> = [
      /-i\.(\d+)\.(\d+)/,
      /\/product\/(\d+)\/(\d+)/,
      /itemid=(\d+).*?shopid=(\d+)/,
      /shopid=(\d+).*?itemid=(\d+)/
    ];

    for (const pattern of patterns) {
      const match = normalized.match(pattern);
      if (match) {
        if (pattern.source.includes('itemid=') && pattern.source.startsWith('itemid')) {
          return { shopId: match[2], itemId: match[1] };
        }
        if (pattern.source.includes('itemid=') && pattern.source.startsWith('shopid')) {
          return { shopId: match[1], itemId: match[2] };
        }
        return { shopId: match[1], itemId: match[2] };
      }
    }
  } catch {
    // Ignore invalid URLs and fall through to return empty object
  }

  return {};
};

export interface ShopeeProductDetail {
  title: string;
  price: number;
  originalPrice: number;
  images: string[];
  mainImage: string;
  description: string;
  sales: number;
  rating: number;
  shop: string;
  category: string;
  link: string;
}

export const fetchShopeeProductDetails = async (productLink: string): Promise<ShopeeProductDetail | null> => {
  try {
    if (!productLink) return null;
    const endpoint = `/api/shopee-detail?url=${encodeURIComponent(productLink.trim())}`;
    const response = await fetch(endpoint, {
      headers: {
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      console.warn('Shopee detail proxy returned lỗi:', response.status);
      return null;
    }
    const data = await response.json();
    return data || null;
  } catch (error) {
    console.error('Lỗi fetchShopeeProductDetails:', error);
    return null;
  }
};

export const validateShopeeLink = (link: string): boolean => {
  if (!link) return false;
  try {
    const url = new URL(link.trim());
    const hostname = url.hostname.toLowerCase();
    const validShort = ['s.shopee.vn', 'shp.ee'];
    const validDomains = ['shopee.vn', 'shopee.com', 'affiliate.shopee.vn'];

    if (validShort.includes(hostname)) return true;
    if (!validDomains.some(domain => hostname.includes(domain))) return false;

    const path = url.pathname;
    return path.includes('/product/') || /-i\.\d+\.\d+/.test(path) || /itemid=\d+/.test(url.search);
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
    const shopeeDetails = await fetchShopeeProductDetails(productLink);
    if (shopeeDetails?.mainImage) {
      return shopeeDetails.mainImage;
    }
    if (shopeeDetails?.images?.length) {
      return shopeeDetails.images[0];
    }
    return '';
  } catch (error) {
    console.error('Lỗi tải ảnh từ Shopee:', error);
    return '';
  }
};
