import * as cheerio from 'cheerio';

/**
 * Product data extracted from Shopee affiliate offer page.
 */
export interface ShopeeProduct {
  title: string;
  link: string;
  imageUrl: string;
  price: number; // VND
  salesCount: number;
  commissionRate: number; // percent
}

/**
 * Fetches the Shopee affiliate offer page, parses product cards, and returns a list of products.
 * Filters to only include products with salesCount > 1000 and commissionRate >= 12.
 */
export async function fetchShopeeProducts(): Promise<ShopeeProduct[]> {
  const url = 'https://affiliate.shopee.vn/offer/product_offer';
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch Shopee affiliate page: ${res.status}`);
  }
  const html = await res.text();
  const $ = cheerio.load(html);

  const products: ShopeeProduct[] = [];

  // The page renders product cards inside a container with class "shopee-search-item-result__item"
  // Adjust selectors if Shopee changes their markup.
  $('.shopee-search-item-result__item').each((_i, el) => {
    const title = $(el).find('.shopee-search-item-result__item-title').text().trim();
    const link = $(el).find('a').attr('href') || '';
    const imageUrl = $(el).find('img').attr('src') || '';
    const priceText = $(el).find('.shopee-search-item-result__price').text().replace(/[\D]/g, '');
    const price = Number(priceText) || 0;
    const salesText = $(el).find('.shopee-search-item-result__sold').text().replace(/[^0-9]/g, '');
    const salesCount = Number(salesText) || 0;
    const commissionText = $(el).find('.shopee-search-item-result__commission').text().replace('%', '').trim();
    const commissionRate = Number(commissionText) || 0;

    if (salesCount > 1000 && commissionRate >= 12) {
      products.push({ title, link, imageUrl, price, salesCount, commissionRate });
    }
  });

  return products;
}
