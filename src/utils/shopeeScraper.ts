/**
 * Shopee Product Scraper - Sử dụng Shopee Search API (JSON)
 * 
 * Trang affiliate.shopee.vn là SPA (Single Page Application) render bằng JavaScript,
 * nên KHÔNG THỂ dùng cheerio để cào HTML được.
 * 
 * Giải pháp: Gọi trực tiếp Shopee Search API trả về JSON.
 * Nếu API bị chặn → dùng danh sách sản phẩm trending mặc định.
 */

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
