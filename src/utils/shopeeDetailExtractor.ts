/**
 * Shopee Detail Extractor - Lấy thông tin chi tiết từ link sản phẩm Shopee
 */

export interface ShopeeDetailedProduct {
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

/**
 * Lấy thông tin chi tiết từ link sản phẩm Shopee
 * Client-side scraping sử dụng OpenGraph meta tags
 */
export const getShopeeProductDetail = async (productLink: string): Promise<ShopeeDetailedProduct | null> => {
  try {
    // Fetch trang và parse HTML
    const response = await fetch(productLink, {
      mode: 'no-cors', // Bypass CORS nếu có
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    // Vì mode: 'no-cors', response.text() sẽ null, cần dùng server API
    // Tạm thời return null, sẽ xử lý qua server-side
    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
};

/**
 * Parse JSON-LD structured data từ trang Shopee
 * (khi có Server-side rendering hoặc API)
 */
export const parseShopeeJSON = (htmlContent: string): ShopeeDetailedProduct | null => {
  try {
    // Tìm <script type="application/ld+json">
    const jsonMatch = htmlContent.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
    if (!jsonMatch) return null;

    const jsonData = JSON.parse(jsonMatch[1]);
    
    // Extract từ structured data
    return {
      title: jsonData.name || 'Unknown',
      price: parseFloat(jsonData.offers?.price || 0),
      originalPrice: parseFloat(jsonData.offers?.price || 0),
      images: jsonData.image ? (Array.isArray(jsonData.image) ? jsonData.image : [jsonData.image]) : [],
      mainImage: jsonData.image ? (Array.isArray(jsonData.image) ? jsonData.image[0] : jsonData.image) : '',
      description: jsonData.description || '',
      sales: parseInt(jsonData.potentialAction?.actionStatistic?.[0]?.userInteractionCount || 0),
      rating: parseFloat(jsonData.aggregateRating?.ratingValue || 0),
      shop: jsonData.brand?.name || 'Unknown Shop',
      category: jsonData.about?.name || 'General',
      link: productLink
    };
  } catch (error) {
    console.error('Error parsing JSON-LD:', error);
    return null;
  }
};

/**
 * Extract Open Graph meta tags từ HTML
 */
export const parseOpenGraph = (htmlContent: string, productLink: string): ShopeeDetailedProduct | null => {
  try {
    const getMetaContent = (property: string) => {
      const regex = new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)`);
      const match = htmlContent.match(regex);
      return match ? match[1] : '';
    };

    return {
      title: getMetaContent('og:title') || 'Unknown',
      price: 0, // OG tags thường không có price
      originalPrice: 0,
      images: [getMetaContent('og:image')].filter(Boolean),
      mainImage: getMetaContent('og:image'),
      description: getMetaContent('og:description') || '',
      sales: 0,
      rating: 0,
      shop: 'Shopee',
      category: 'General',
      link: productLink
    };
  } catch (error) {
    console.error('Error parsing OG tags:', error);
    return null;
  }
};

/**
 * Extract dữ liệu từ API Response (nếu có)
 */
export const parseShopeeAPI = (apiResponse: any): ShopeeDetailedProduct | null => {
  try {
    const product = apiResponse.data?.item || apiResponse.data;
    
    if (!product) return null;

    return {
      title: product.name || product.title || 'Unknown',
      price: product.price || product.price_current || 0,
      originalPrice: product.original_price || product.price_max || product.price || 0,
      images: product.images || [product.image],
      mainImage: product.image || (product.images ? product.images[0] : ''),
      description: product.description || product.cate_and_attr || '',
      sales: product.sold || product.view_count || 0,
      rating: product.rating || product.rating_average || 0,
      shop: product.shop?.name || product.shop_name || 'Unknown Shop',
      category: product.category || product.cate_name || 'General',
      link: apiResponse.link || ''
    };
  } catch (error) {
    console.error('Error parsing API response:', error);
    return null;
  }
};

/**
 * Fallback generic product data
 */
export const createFallbackProduct = (title: string, link: string): ShopeeDetailedProduct => {
  return {
    title: title || 'Sản phẩm từ Shopee',
    price: 150000,
    originalPrice: 299000,
    images: [],
    mainImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400',
    description: 'Sản phẩm chất lượng cao từ Shopee. Nhiều người yêu thích.',
    sales: Math.floor(Math.random() * 10000) + 100,
    rating: 4 + Math.random(),
    shop: 'Shopee Store',
    category: 'General',
    link: link
  };
};
