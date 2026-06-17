import { fetchShopeeProducts } from "../src/utils/shopeeScraper";
import { generateProductContent } from "../src/utils/geminiClient";
import { getSupabase } from "../src/utils/supabaseClient";
import { inferCategory } from "../src/utils/categoryMapper";

/**
 * Cloud Function that runs the full pipeline: scrape, generate content & image, upsert to Supabase.
 * Triggered via HTTP (GET or POST). Returns JSON summary.
 */
export const fetchAndPublish = async (req: any, res: any) => {
  try {
    const products = await fetchShopeeProducts();
    const supabase = getSupabase();
    const results: any[] = [];
    for (const product of products) {
      const description = await generateProductContent(product.title, product.salesCount, product.commissionRate);
      const category = inferCategory(product.title);
      const record = {
        title: product.title,
        description,
        image_url: product.imageUrl,
        price: product.price,
        original_price: Math.round(product.price * 1.2),
        commission_rate: product.commissionRate,
        sales_count: product.salesCount,
        post_date: new Date().toISOString(),
        category
      };
      const { data, error } = await supabase.from("online_products").upsert(record);
      if (error) console.error("Supabase upsert error:", error);
      else results.push(data);
    }
    res.status(200).json({ success: true, processed: products.length, details: results });
  } catch (e: any) {
    console.error("Fetch & Publish pipeline error:", e);
    res.status(500).json({ error: e.message });
  }
};
