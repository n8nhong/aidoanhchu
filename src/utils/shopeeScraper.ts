/**
 * Shopee Product Scraper - Sử dụng Shopee Search API (JSON)
 * 
 * Trang affiliate.shopee.vn là SPA (Single Page Application) render bằng JavaScript,
 * nên KHÔNG THỂ dùng cheerio để cào HTML được.
 * 
 * Giải pháp: Gọi trực tiếp Shopee Search API trả về JSON.
 * Nếu API bị chặn → dùng danh sách sản phẩm trending mặc định.
 */

import { renderPageAndExtractImage } from './puppeteerHelper';

export interface ShopeeProduct {
  title: string;
  link: string;
  imageUrl: string;
  price: number; // VND
  salesCount: number;
  commissionRate: number; // percent
  categoryId?: string;
  extraInfo?: string;
}

// Danh sách từ khóa hot để tìm kiếm sản phẩm trending trên Shopee
const TRENDING_KEYWORDS = [
  'áo thun nam', 'váy nữ đẹp', 'tai nghe bluetooth', 'kem chống nắng',
  'nồi chiên không dầu', 'giày sneaker', 'son môi', 'balo laptop',
  'đồng hồ thông minh', 'serum dưỡng da', 'áo khoác nam', 'túi xách nữ'
];

// Danh sách sản phẩm dự phòng khi API bị chặn
const FALLBACK_PRODUCTS: ShopeeProduct[] = [
  {
    title: '🔥 Áo Thun Nam Cotton Cổ Tròn Phong Cách Hàn Quốc',
    link: 'https://shopee.vn/search?keyword=%C3%A1o+thun+nam',
    imageUrl: 'https://down-vn.img.susercontent.com/file/sg-11134201-22120-placeholder1',
    price: 89000, salesCount: 5200, commissionRate: 15,
    categoryId: '1', extraInfo: 'Chất cotton 100%, mềm mịn, nhiều màu'
  },
  {
    title: '✨ Váy Liền Công Sở Nữ Thanh Lịch Dáng Chữ A',
    link: 'https://shopee.vn/search?keyword=v%C3%A1y+n%E1%BB%AF',
    imageUrl: 'https://down-vn.img.susercontent.com/file/sg-11134201-22120-placeholder2',
    price: 159000, salesCount: 3800, commissionRate: 18,
    categoryId: '7', extraInfo: 'Chất vải đũi cao cấp, form chuẩn'
  },
  {
    title: '🎧 Tai Nghe Bluetooth 5.3 Chống Ồn Chủ Động ANC',
    link: 'https://shopee.vn/search?keyword=tai+nghe+bluetooth',
    imageUrl: 'https://down-vn.img.susercontent.com/file/sg-11134201-22120-placeholder3',
    price: 249000, salesCount: 12000, commissionRate: 14,
    categoryId: '3', extraInfo: 'Pin 40 giờ, mic HD, chống nước IPX5'
  },
  {
    title: '☀️ Kem Chống Nắng Tone Up SPF50+ PA++++ Hàn Quốc',
    link: 'https://shopee.vn/search?keyword=kem+ch%E1%BB%91ng+n%E1%BA%AFng',
    imageUrl: 'https://down-vn.img.susercontent.com/file/sg-11134201-22120-placeholder4',
    price: 125000, salesCount: 8500, commissionRate: 20,
    categoryId: '2', extraInfo: 'Nâng tone da, không bết dính, kiềm dầu 12h'
  },
  {
    title: '🍳 Nồi Chiên Không Dầu 6L Điều Khiển Cảm Ứng',
    link: 'https://shopee.vn/search?keyword=n%E1%BB%93i+chi%C3%AAn+kh%C3%B4ng+d%E1%BA%A7u',
    imageUrl: 'https://down-vn.img.susercontent.com/file/sg-11134201-22120-placeholder5',
    price: 890000, salesCount: 4200, commissionRate: 12,
    categoryId: '4', extraInfo: 'Dung tích 6L, 8 chế độ nấu, màn hình LED'
  },
  {
    title: '👟 Giày Sneaker Nam Nữ Tăng Chiều Cao 5cm Phong Cách',
    link: 'https://shopee.vn/search?keyword=gi%C3%A0y+sneaker',
    imageUrl: 'https://down-vn.img.susercontent.com/file/sg-11134201-22120-placeholder6',
    price: 199000, salesCount: 6700, commissionRate: 16,
    categoryId: '1', extraInfo: 'Đế êm, chống trượt, nhiều size 36-44'
  },
  {
    title: '💄 Son Kem Lì Colourpop Ultra Matte Lip Chính Hãng',
    link: 'https://shopee.vn/search?keyword=son+m%C3%B4i',
    imageUrl: 'https://down-vn.img.susercontent.com/file/sg-11134201-22120-placeholder7',
    price: 145000, salesCount: 9800, commissionRate: 22,
    categoryId: '2', extraInfo: 'Bền màu 12h, mịn như nhung, chuẩn auth'
  },
  {
    title: '🎒 Balo Laptop Chống Nước 15.6 inch Có Cổng Sạc USB',
    link: 'https://shopee.vn/search?keyword=balo+laptop',
    imageUrl: 'https://down-vn.img.susercontent.com/file/sg-11134201-22120-placeholder8',
    price: 219000, salesCount: 3400, commissionRate: 15,
    categoryId: '3', extraInfo: 'Chống nước, nhiều ngăn, có USB sạc ngoài'
  },
  {
    title: '⌚ Đồng Hồ Thông Minh Smartwatch Theo Dõi Sức Khỏe',
    link: 'https://shopee.vn/search?keyword=%C4%91%E1%BB%93ng+h%E1%BB%93+th%C3%B4ng+minh',
    imageUrl: 'https://down-vn.img.susercontent.com/file/sg-11134201-22120-placeholder9',
    price: 350000, salesCount: 7600, commissionRate: 13,
    categoryId: '3', extraInfo: 'Đo nhịp tim, SpO2, bước chân, chống nước IP68'
  },
  {
    title: '🧴 Serum Vitamin C Dưỡng Trắng Da Mờ Thâm 30ml',
    link: 'https://shopee.vn/search?keyword=serum+d%C6%B0%E1%BB%A1ng+da',
    imageUrl: 'https://down-vn.img.susercontent.com/file/sg-11134201-22120-placeholder10',
    price: 98000, salesCount: 11000, commissionRate: 25,
    categoryId: '2', extraInfo: 'Vitamin C 20%, làm sáng da sau 2 tuần'
  },
  {
    title: '🧥 Áo Khoác Gió Nam Nữ 2 Lớp Chống Nắng UV',
    link: 'https://shopee.vn/search?keyword=%C3%A1o+kho%C3%A1c',
    imageUrl: 'https://down-vn.img.susercontent.com/file/sg-11134201-22120-placeholder11',
    price: 179000, salesCount: 5100, commissionRate: 17,
    categoryId: '1', extraInfo: 'Chất vải gió 2 lớp, chống UV 99%, siêu nhẹ'
  },
  {
    title: '👜 Túi Xách Nữ Đeo Chéo Da PU Thời Trang Hàn Quốc',
    link: 'https://shopee.vn/search?keyword=t%C3%BAi+x%C3%A1ch+n%E1%BB%AF',
    imageUrl: 'https://down-vn.img.susercontent.com/file/sg-11134201-22120-placeholder12',
    price: 135000, salesCount: 4500, commissionRate: 19,
    categoryId: '7', extraInfo: 'Da PU cao cấp, nhiều ngăn, dây đeo điều chỉnh'
  },
  {
    title: '📱 Sạc Dự Phòng 20000mAh Sạc Nhanh PD 22.5W',
    link: 'https://shopee.vn/search?keyword=s%E1%BA%A1c+d%E1%BB%B1+ph%C3%B2ng',
    imageUrl: 'https://down-vn.img.susercontent.com/file/sg-11134201-22120-placeholder13',
    price: 299000, salesCount: 8900, commissionRate: 14,
    categoryId: '3', extraInfo: 'Sạc nhanh PD 22.5W, 2 cổng USB-C, LED hiển thị'
  },
  {
    title: '🍼 Bình Sữa Cho Bé Chống Sặc Pigeon 240ml Chính Hãng',
    link: 'https://shopee.vn/search?keyword=b%C3%ACnh+s%E1%BB%AFa+cho+b%C3%A9',
    imageUrl: 'https://down-vn.img.susercontent.com/file/sg-11134201-22120-placeholder14',
    price: 189000, salesCount: 3200, commissionRate: 15,
    categoryId: '6', extraInfo: 'Núm ti mềm, chống sặc, an toàn BPA free'
  },
  {
    title: '💊 Vitamin Tổng Hợp DHC Nhật Bản 60 Ngày',
    link: 'https://shopee.vn/search?keyword=vitamin+t%E1%BB%95ng+h%E1%BB%A3p',
    imageUrl: 'https://down-vn.img.susercontent.com/file/sg-11134201-22120-placeholder15',
    price: 165000, salesCount: 6300, commissionRate: 16,
    categoryId: '5', extraInfo: 'Bổ sung 13 loại vitamin, hàng nội địa Nhật'
  },
  {
    title: '🏠 Máy Hút Bụi Cầm Tay Mini Không Dây Sạc USB',
    link: 'https://shopee.vn/search?keyword=m%C3%A1y+h%C3%BAt+b%E1%BB%A5i',
    imageUrl: 'https://down-vn.img.susercontent.com/file/sg-11134201-22120-placeholder16',
    price: 259000, salesCount: 4800, commissionRate: 13,
    categoryId: '4', extraInfo: 'Lực hút 12000Pa, không dây, pin 2000mAh'
  },
  {
    title: '👗 Set Bộ Đồ Nữ Mặc Nhà Pijama Lụa Satin Cao Cấp',
    link: 'https://shopee.vn/search?keyword=pijama+n%E1%BB%AF',
    imageUrl: 'https://down-vn.img.susercontent.com/file/sg-11134201-22120-placeholder17',
    price: 149000, salesCount: 7200, commissionRate: 20,
    categoryId: '7', extraInfo: 'Chất lụa satin mát lạnh, freesize 45-65kg'
  },
  {
    title: '🔌 Ổ Cắm Điện Đa Năng Có USB Chống Quá Tải',
    link: 'https://shopee.vn/search?keyword=%E1%BB%95+c%E1%BA%AFm+%C4%91i%E1%BB%87n',
    imageUrl: 'https://down-vn.img.susercontent.com/file/sg-11134201-22120-placeholder18',
    price: 85000, salesCount: 9500, commissionRate: 12,
    categoryId: '4', extraInfo: '3 ổ AC + 2 USB, dây 1.8m, chống quá tải'
  },
  {
    title: '🧢 Mũ Lưỡi Trai Unisex Thêu Logo Phong Cách Streetwear',
    link: 'https://shopee.vn/search?keyword=m%C5%A9+l%C6%B0%E1%BB%A1i+trai',
    imageUrl: 'https://down-vn.img.susercontent.com/file/sg-11134201-22120-placeholder19',
    price: 59000, salesCount: 5600, commissionRate: 18,
    categoryId: '1', extraInfo: 'Chất liệu cotton, thoáng khí, điều chỉnh size'
  },
  {
    title: '🪥 Bàn Chải Đánh Răng Điện Sonic Sạc USB 5 Chế Độ',
    link: 'https://shopee.vn/search?keyword=b%C3%A0n+ch%E1%BA%A3i+%C4%91i%E1%BB%87n',
    imageUrl: 'https://down-vn.img.susercontent.com/file/sg-11134201-22120-placeholder20',
    price: 175000, salesCount: 4100, commissionRate: 14,
    categoryId: '5', extraInfo: '40000 lần/phút, chống nước IPX7, kèm 4 đầu'
  }
];

/**
 * Thử gọi Shopee Search API để lấy sản phẩm thật.
 * Nếu bị chặn → trả về danh sách sản phẩm trending dự phòng.
 */
export async function fetchShopeeProducts(): Promise<ShopeeProduct[]> {
  const allProducts: ShopeeProduct[] = [];

  // Chiến lược 1: Thử gọi Shopee Search API (JSON)
  try {
    const keyword = TRENDING_KEYWORDS[Math.floor(Math.random() * TRENDING_KEYWORDS.length)];
    const searchUrl = `https://shopee.vn/api/v4/search/search_items?by=relevancy&keyword=${encodeURIComponent(keyword)}&limit=50&newest=0&order=desc&page_type=search&scenario=PAGE_GLOBAL_SEARCH&version=2`;
    
    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://shopee.vn/',
        'X-Shopee-Language': 'vi',
        'X-Requested-With': 'XMLHttpRequest',
        'af-ac-enc-dat': '',
      },
      signal: AbortSignal.timeout(8000), // timeout 8 giây
    });

    if (res.ok) {
      const json = await res.json();
      const items = json?.items || json?.data?.items || [];
      
      for (const item of items) {
        const itemData = item.item_basic || item;
        if (!itemData || !itemData.name) continue;

        const shopId = itemData.shopid || itemData.shop_id || 0;
        const itemId = itemData.itemid || itemData.item_id || 0;
        const title = itemData.name || '';
        const price = Math.round((itemData.price || 0) / 100000); // Shopee API trả giá * 100000
        const originalPrice = Math.round((itemData.price_before_discount || itemData.price || 0) / 100000);
        const salesCount = itemData.sold || itemData.historical_sold || 0;
        const imageHash = itemData.image || '';
        const imageUrl = imageHash ? `https://down-vn.img.susercontent.com/file/${imageHash}` : '';
        const link = `https://shopee.vn/${encodeURIComponent(title.replace(/\s+/g, '-'))}-i.${shopId}.${itemId}`;

        allProducts.push({
          title,
          link,
          imageUrl,
          price,
          salesCount,
          commissionRate: 15, // Shopee API không trả commission, dùng mặc định
          categoryId: String(itemData.catid || '1'),
          extraInfo: `${salesCount} đã bán | ⭐ ${(itemData.item_rating?.rating_star || 0).toFixed(1)}`
        });
      }
    }
  } catch (err) {
    console.log('Shopee Search API không khả dụng (có thể bị chặn):', (err as Error).message);
  }

  // Chiến lược 2: Thử gọi Shopee Recommend API
  if (allProducts.length === 0) {
    try {
      const recUrl = 'https://shopee.vn/api/v4/recommend/recommend?bundle=daily_discover_main&limit=50&offset=0';
      const res = await fetch(recUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Referer': 'https://shopee.vn/',
          'X-Shopee-Language': 'vi',
        },
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) {
        const json = await res.json();
        const sections = json?.data?.sections || [];
        for (const section of sections) {
          const items = section.data?.item || [];
          for (const itemData of items) {
            if (!itemData || !itemData.name) continue;
            const shopId = itemData.shopid || 0;
            const itemId = itemData.itemid || 0;
            const title = itemData.name || '';
            const price = Math.round((itemData.price || 0) / 100000);
            const salesCount = itemData.sold || itemData.historical_sold || 0;
            const imageHash = itemData.image || '';
            const imageUrl = imageHash ? `https://down-vn.img.susercontent.com/file/${imageHash}` : '';
            const link = `https://shopee.vn/${encodeURIComponent(title.replace(/\s+/g, '-'))}-i.${shopId}.${itemId}`;

            allProducts.push({
              title, link, imageUrl, price, salesCount,
              commissionRate: 15,
              categoryId: String(itemData.catid || '1'),
              extraInfo: `${salesCount} đã bán`
            });
          }
        }
      }
    } catch (err) {
      console.log('Shopee Recommend API không khả dụng:', (err as Error).message);
    }
  }

  // Chiến lược 3: Dùng danh sách sản phẩm trending dự phòng
  if (allProducts.length === 0) {
    console.log('⚠️ Không thể kết nối Shopee API. Sử dụng danh sách sản phẩm trending dự phòng.');
    // Xáo trộn ngẫu nhiên để mỗi lần chạy khác nhau
    const shuffled = [...FALLBACK_PRODUCTS].sort(() => Math.random() - 0.5);
    return shuffled;
  }

  return allProducts;
}

interface ShopeeProductDetail {
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

const normalizeShopeeImageUrl = (imageHash: string): string => {
  if (!imageHash) return '';
  return imageHash.startsWith('http')
    ? imageHash
    : `https://down-vn.img.susercontent.com/file/${imageHash}`;
};

/** Create a default product when API and HTML extraction fail */
const createDefaultShopeeProduct = (finalUrl: string): ShopeeProductDetail => {
  return {
    title: 'Shopee Product',
    price: 0,
    originalPrice: 0,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400'],
    mainImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400',
    description: 'Product from Shopee (image will be regenerated with AI)',
    sales: 0,
    rating: 0,
    shop: 'Shopee',
    category: 'General',
    link: finalUrl,
  };
};

const resolveShopeeRedirect = async (link: string): Promise<string> => {
  try {
    const url = new URL(link.trim());
    const hostname = url.hostname.toLowerCase();
    if (hostname === 's.shopee.vn' || hostname === 'shp.ee') {
      const redirectRes = await fetch(link, {
        method: 'GET',
        redirect: 'follow',
        signal: AbortSignal.timeout(8000),
      });
      return redirectRes.url || link;
    }
  } catch {
    // Ignore invalid URLs
  }
  return link;
};

const extractShopeeIdsFromUrl = (link: string): { shopId?: string; itemId?: string } => {
  try {
    const url = new URL(link.trim());
    const pathname = url.pathname;
    const search = url.searchParams;

    const affiliateMatch = pathname.match(/\/opaanlp\/(\d+)\/(\d+)/);
    if (affiliateMatch) return { shopId: affiliateMatch[1], itemId: affiliateMatch[2] };

    const directMatch = pathname.match(/-i\.(\d+)\.(\d+)/);
    if (directMatch) return { shopId: directMatch[1], itemId: directMatch[2] };

    const productPathMatch = pathname.match(/\/product\/(\d+)\/(\d+)/);
    if (productPathMatch) return { shopId: productPathMatch[1], itemId: productPathMatch[2] };

    const itemId = search.get('itemid') || search.get('item_id') || search.get('product_id');
    const shopId = search.get('shopid') || search.get('shop_id');
    if (itemId && shopId) return { shopId, itemId };

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
        if (pattern.source.startsWith('itemid=')) return { shopId: match[2], itemId: match[1] };
        if (pattern.source.startsWith('shopid=')) return { shopId: match[1], itemId: match[2] };
        return { shopId: match[1], itemId: match[2] };
      }
    }
  } catch {
    // Ignore invalid URLs
  }
  return {};
};

/**
 * Extract fallback data from Shopee product page HTML
 * Used when API endpoints are blocked (403)
 */
async function extractShopeeDetailFromHTML(productUrl: string): Promise<ShopeeProductDetail | null> {
  try {
    const pageRes = await fetch(productUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://shopee.vn/',
        'Cache-Control': 'no-cache'
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!pageRes.ok) {
      console.warn('⚠️ HTML fetch failed, status:', pageRes.status);
      return null;
    }
    const html = await pageRes.text();

    // Extract OpenGraph image
    const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    const ogImage = ogImageMatch ? ogImageMatch[1] : '';
    console.log('  🔍 OG image:', ogImage || 'NOT FOUND');

    // Extract OpenGraph title
    const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
    const ogTitle = ogTitleMatch ? ogTitleMatch[1] : '';
    console.log('  🔍 OG title:', ogTitle || 'NOT FOUND');

    // Extract OpenGraph description
    const ogDescMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
    const ogDesc = ogDescMatch ? ogDescMatch[1] : '';
    console.log('  🔍 OG desc:', ogDesc ? ogDesc.slice(0, 50) : 'NOT FOUND');

    // Try to extract from JSON-LD structured data
    const jsonldMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
    let jsonldImage = '';
    let jsonldPrice = 0;
    if (jsonldMatch) {
      try {
        const jsonldData = JSON.parse(jsonldMatch[1]);
        jsonldImage = jsonldData.image ? (Array.isArray(jsonldData.image) ? jsonldData.image[0] : jsonldData.image) : '';
        jsonldPrice = jsonldData.offers?.price ? parseFloat(jsonldData.offers.price) : 0;
        console.log('  🔍 JSON-LD image:', jsonldImage || 'EMPTY', 'price:', jsonldPrice);
      } catch (e) {
        console.warn('  🔍 JSON-LD parse failed');
      }
    } else {
      console.log('  🔍 JSON-LD not found');
    }

    // Try to extract from inline PRELOADED_STATE (React state dump)
    let stateImage = '';
    let stateTitle = '';
    let statePrice = 0;
    const preloadedMatch = html.match(/window\.__PRELOADED_STATE__=\{([\s\S]*?)\};/i);
    if (preloadedMatch) {
      try {
        // Just look for common image patterns within the state
        const stateSnippet = preloadedMatch[0].slice(0, 50000); // First 50KB of state
        const imageInState = stateSnippet.match(/["']image["']:\s*["']([^"']+\.(?:jpg|png|jpeg|webp))["']/i);
        if (imageInState) {
          stateImage = imageInState[1].startsWith('http') ? imageInState[1] : `https://down-vn.img.susercontent.com/file/${imageInState[1]}`;
          console.log('  🔍 PRELOADED STATE image found:', stateImage.slice(0, 80));
        } else {
          console.log('  🔍 No image in PRELOADED_STATE');
        }
      } catch (e) {
        console.warn('  🔍 PRELOADED_STATE parse failed');
      }
    } else {
      console.log('  🔍 PRELOADED_STATE not found');
    }

    // Additional fallback: look for common image hosting patterns and any absolute image URLs
    let fallbackImage = '';
    const senticationImagePatterns = [
      /["']?image["']?:\s*["']([^"']*\.(?:jpg|png|jpeg|webp)[^"']*)/gi,
      /src=["']([^"']*down-vn\.img\.susercontent\.com[^"']*)/gi,
      /https:\/\/down-vn\.img\.susercontent.com\/file\/[a-zA-Z0-9_\-]+/gi,
    ];

    for (const pattern of senticationImagePatterns) {
      const m = pattern.exec(html);
      if (m && m[1]) {
        fallbackImage = m[1];
        if (fallbackImage.startsWith('http')) {
          console.log('  🔍 Fallback image found via pattern:', fallbackImage.slice(0, 200));
          break;
        }
      }
    }

    // Generic last-resort: scan for any absolute image URL in the HTML and pick the largest-looking one
    if (!fallbackImage) {
      const urlMatches = Array.from(html.matchAll(/https?:\/\/[^\"'\s<>]+\.(?:jpg|jpeg|png|webp)(?:\?[^\"'\s<>]*)?/gi)).map(m => m[0]);
      if (urlMatches.length) {
        // Prefer shopee/cf or susercontent hosts
        const prefer = urlMatches.find(u => /susercontent|cf\.shopee|down-vn|cf\.s?hopee|\/file\//i.test(u));
        if (prefer) {
          fallbackImage = prefer;
        } else {
          // As a better heuristic, HEAD each candidate (with short timeout) and pick the one with largest Content-Length
          let best = '';
          let bestSize = 0;
          const candidates = urlMatches.slice(0, 8); // limit to first 8
          for (const u of candidates) {
            try {
              const res = await fetch(u, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(4000) });
              if (res && res.ok) {
                const len = parseInt(res.headers.get('content-length') || '0');
                if (len > bestSize) {
                  bestSize = len;
                  best = u;
                }
              }
            } catch (e) {
              // ignore individual HEAD failures
            }
          }
          fallbackImage = best || urlMatches[0];
        }
        console.log('  🔍 Generic image scan found:', (fallbackImage || '').slice(0, 200));
      }
    }

    // Prioritize image sources
    const finalImage = ogImage || stateImage || jsonldImage || fallbackImage;
    const finalTitle = stateTitle || ogTitle || 'Shopee Product';
    const finalPrice = statePrice || jsonldPrice || 0;

    if (!finalImage) {
      console.warn('  ❌ No image found in any fallback source — trying Puppeteer render...');
      try {
        const puppImg = await renderPageAndExtractImage(productUrl);
        if (puppImg) {
          console.log('  ✅ Puppeteer extracted image:', puppImg.slice(0, 200));
          return {
            title: finalTitle,
            price: finalPrice,
            originalPrice: finalPrice || 150000,
            images: puppImg ? [puppImg] : [],
            mainImage: puppImg || '',
            description: ogDesc || 'Product from Shopee',
            sales: 0,
            rating: 0,
            shop: 'Shopee Store',
            category: 'General',
            link: productUrl,
          };
        }
      } catch (e) {
        console.warn('  ❌ Puppeteer extraction failed', e);
      }
      console.warn('  ❌ No image found in any fallback source');
      return null;
    }

    console.log('  ✅ HTML fallback SUCCESS: image found');
    return {
      title: finalTitle,
      price: finalPrice,
      originalPrice: finalPrice || 150000,
      images: finalImage ? [finalImage] : [],
      mainImage: finalImage,
      description: ogDesc || 'Product from Shopee',
      sales: 0,
      rating: 0,
      shop: 'Shopee Store',
      category: 'General',
      link: productUrl,
    };
  } catch (error) {
    console.warn('❌ HTML fallback extraction exception:', error);
    return null;
  }
}

export async function fetchShopeeProductDetailsFromUrl(inputUrl: string): Promise<ShopeeProductDetail | null> {
  try {
    const finalUrl = await resolveShopeeRedirect(inputUrl);
    const ids = extractShopeeIdsFromUrl(finalUrl);
    if (!ids.shopId || !ids.itemId) {
      return null;
    }

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      Accept: 'application/json, text/plain, */*',
      Referer: finalUrl,
      'X-Shopee-Language': 'vi',
      'x-requested-with': 'XMLHttpRequest',
    };

    const apiUrls = [
      `https://shopee.vn/api/v4/item/get?itemid=${ids.itemId}&shopid=${ids.shopId}`,
      `https://shopee.vn/api/v2/product/get_product_detail?product_id=${ids.itemId}&shop_id=${ids.shopId}`
    ];

    let item: any = null;
    for (const apiUrl of apiUrls) {
      try {
        const res = await fetch(apiUrl, { headers, signal: AbortSignal.timeout(10000) });
        if (!res.ok) continue;
        const json = await res.json();
        if (json?.data?.product) {
          item = json.data.product;
        } else if (json?.data) {
          item = json.data;
        }
        if (item) break;
      } catch {
        continue;
      }
    }

    if (item) {
      // API succeeded, return data from API
      const images: string[] = [];
      if (item.image) images.push(normalizeShopeeImageUrl(item.image));
      if (Array.isArray(item.images)) {
        item.images.forEach((hash: string) => {
          if (hash) images.push(normalizeShopeeImageUrl(hash));
        });
      }
      if (!images.length && item.image_url) images.push(normalizeShopeeImageUrl(item.image_url));
      if (!images.length && Array.isArray(item.image_urls)) {
        item.image_urls.forEach((hash: string) => {
          if (hash) images.push(normalizeShopeeImageUrl(hash));
        });
      }

      const uniqueImages = Array.from(new Set(images.filter(Boolean)));

      return {
        title: item.name || item.title || '',
        price: Math.round((item.price || item.price_before_discount || 0) / 100000),
        originalPrice: Math.round((item.price_before_discount || item.price || 0) / 100000),
        images: uniqueImages,
        mainImage: uniqueImages[0] || '',
        description: item.description || item.cate_and_attr || '',
        sales: item.historical_sold || item.sold || 0,
        rating: parseFloat(item.item_rating?.rating_star || '0') || 0,
        shop: item.shop?.name || item.shop_location || '',
        category: String(item.catid || item.category || 'General'),
        link: finalUrl,
      };
    }

    // API failed (likely 403), try HTML fallback
    console.warn('⚠️ Shopee API failed, trying HTML fallback for:', finalUrl);
    const htmlFallback = await extractShopeeDetailFromHTML(finalUrl);
    if (htmlFallback) {
      return htmlFallback;
    }

    // Both API and HTML extraction failed, return a default product
    // so user can regenerate image with AI
    console.warn('⚠️ Both API and HTML extraction failed, returning default product with placeholder');
    return createDefaultShopeeProduct(finalUrl);
  } catch (error) {
    console.error('❌ fetchShopeeProductDetailsFromUrl exception:', (error as Error).message);
    return null;
  }
}

/**
 * Trích xuất thông tin sản phẩm từ 1 link (rút gọn hoặc link gốc)
 */
export async function fetchShopeeProductFromUrl(inputUrl: string): Promise<ShopeeProduct | null> {
  try {
    let finalUrl = inputUrl;
    
    // Nếu là link rút gọn, làm một request HEAD để lấy URL thật
    if (inputUrl.includes('s.shopee.vn') || inputUrl.includes('shp.ee')) {
      const redirectRes = await fetch(inputUrl, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(5000) }).catch(() => null);
      if (redirectRes) {
        finalUrl = redirectRes.url;
      }
    }

    // Trích xuất shopid và itemid từ URL
    // Dạng 1: -i.1234.5678
    // Dạng 2: /product/1234/5678
    let shopId = '';
    let itemId = '';
    
    const match1 = finalUrl.match(/-i\.(\d+)\.(\d+)/);
    if (match1) {
      shopId = match1[1];
      itemId = match1[2];
    } else {
      const match2 = finalUrl.match(/\/product\/(\d+)\/(\d+)/);
      if (match2) {
        shopId = match2[1];
        itemId = match2[2];
      }
    }

    if (!shopId || !itemId) {
      console.log('Không thể trích xuất ID từ URL:', finalUrl);
      return null;
    }

    // Lấy thông tin từ API Shopee
    const apiUrl = `https://shopee.vn/api/v4/item/get?itemid=${itemId}&shopid=${shopId}`;
    const res = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Referer': finalUrl,
        'X-Shopee-Language': 'vi',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const json = await res.json();
      const itemData = json?.data;
      if (itemData) {
        const title = itemData.name || '';
        const price = Math.round((itemData.price || 0) / 100000);
        const salesCount = itemData.historical_sold || 0;
        const imageHash = itemData.image || '';
        const imageUrl = imageHash ? `https://down-vn.img.susercontent.com/file/${imageHash}` : '';
        
        return {
          title,
          link: inputUrl, // GIỮ NGUYÊN LINK GỐC CỦA NGƯỜI DÙNG
          imageUrl,
          price,
          salesCount,
          commissionRate: 15,
          categoryId: String(itemData.catid || '1'),
          extraInfo: `${salesCount} đã bán | ⭐ ${(itemData.item_rating?.rating_star || 0).toFixed(1)}`
        };
      }
    }
  } catch (e) {
    console.error('Lỗi khi cào link shopee:', e);
  }
  return null;
}
