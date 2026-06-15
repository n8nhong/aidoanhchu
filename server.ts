import express from "express";
import { fetchShopeeProducts } from "./utils/shopeeScraper";
import { generateProductContent } from "./utils/geminiClient";
import { generateBackgroundImage } from "./utils/stableDiffusion";
import { getSupabase } from "./utils/supabaseClient";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // --- BEGIN SHARED LINK FIX ---
  // Store data persistently during instance lifetime so "tạo rồi chia sẻ link" works
  // Ensure Supabase storage bucket for product images exists
async function ensureProductImagesBucket() {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    // @ts-ignore Supabase storage createBucket may be available in the client
    const { data, error } = await supabase.storage.createBucket('product-images', { public: true });
    if (error) {
      // If bucket already exists, Supabase returns a specific error message
      if (error.message && error.message.includes('already exists')) {
        console.log('Bucket product-images already exists.');
      } else {
        console.error('Error creating Supabase bucket product-images:', error);
      }
    } else {
      console.log('Supabase bucket product-images created successfully.');
    }
  } catch (e) {
    console.error('Exception while ensuring bucket exists:', e);
  }
}

// Call bucket initialization at server start
ensureProductImagesBucket();

// API Route for Auto Publish (Stream)
app.get("/api/auto-publish/stream", async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendEvent = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const limit = Number(req.query.limit) || 20; // default 20 products per run
    
    sendEvent({ type: 'log', message: 'Bắt đầu cào dữ liệu từ Shopee...' });
    const rawProducts = await fetchShopeeProducts();
    const filtered = rawProducts.filter(p => (p.sales || 0) > 1000 && (p.commissionRate || 0) >= 12);
    const toProcess = filtered.slice(0, limit);

    sendEvent({ type: 'log', message: `Đã tìm thấy ${toProcess.length} sản phẩm thỏa mãn điều kiện (>1000 lượt bán, hoa hồng >=12%).` });

    const supabase = getSupabase();
    if (!supabase) {
      sendEvent({ type: 'error', message: 'Supabase chưa được cấu hình. Vui lòng kiểm tra tab Database.' });
      return res.end();
    }

    const results: any[] = [];
    for (let i = 0; i < toProcess.length; i++) {
      const prod = toProcess[i];
      try {
        sendEvent({ type: 'progress', current: i + 1, total: toProcess.length, message: `Đang xử lý: ${prod.title.substring(0, 40)}...` });
        
        sendEvent({ type: 'log', message: `[${i + 1}/${toProcess.length}] Tạo nội dung AI cho sản phẩm...` });
        const contentRes = await generateProductContent({
          productName: prod.title,
          rawLinkInput: prod.link,
          categoryId: prod.categoryId,
          extraInfo: prod.extraInfo,
          productImageBase64: ''
        });

        sendEvent({ type: 'log', message: `[${i + 1}/${toProcess.length}] Tạo ảnh nền bằng Stable Diffusion...` });
        let imageBase64 = '';
        try {
          imageBase64 = await generateBackgroundImage({ prompt: contentRes.imageKeyword });
        } catch (imgErr: any) {
           sendEvent({ type: 'log', message: `[${i + 1}/${toProcess.length}] Lỗi tạo ảnh (bỏ qua): ${imgErr.message}` });
        }

        let imageUrl = '';
        if (imageBase64) {
          sendEvent({ type: 'log', message: `[${i + 1}/${toProcess.length}] Tải ảnh lên Supabase Storage...` });
          const fileExt = 'png';
          const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 8)}.${fileExt}`;
          const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, Buffer.from(imageBase64, 'base64'));
          
          if (uploadError) {
            sendEvent({ type: 'log', message: `[${i + 1}/${toProcess.length}] Lỗi tải ảnh lên: ${uploadError.message}` });
          } else {
            const { publicURL } = supabase.storage.from('product-images').getPublicUrl(fileName);
            imageUrl = publicURL || '';
          }
        }

        sendEvent({ type: 'log', message: `[${i + 1}/${toProcess.length}] Lưu sản phẩm vào cơ sở dữ liệu...` });
        const { error: dbError } = await supabase.from('products').upsert({
          title: contentRes.title,
          description: contentRes.description,
          image_url: imageUrl,
          price: contentRes.price,
          original_price: contentRes.originalPrice,
          affiliate_link: prod.link,
          category_id: autoCategorize(prod.title) // automatically assign category
        }, { returning: 'minimal' });

        if (dbError) {
          sendEvent({ type: 'log', message: `[${i + 1}/${toProcess.length}] Lỗi lưu sản phẩm (products): ${dbError.message}` });
        } else {
          results.push({ title: contentRes.title, status: 'published' });
          sendEvent({ type: 'log', message: `[${i + 1}/${toProcess.length}] ✅ Đã đăng thành công.` });
        }
      } catch (prodErr: any) {
        sendEvent({ type: 'log', message: `[${i + 1}/${toProcess.length}] ❌ Bỏ qua sản phẩm do lỗi: ${prodErr.message}` });
      }
    }

    sendEvent({ type: 'log', message: `Đang đồng bộ dữ liệu vào bảng online_products...` });
    const onlineProducts = toProcess.map(p => ({
      id: p.id,
      title: p.title,
      type: 'digital',
      price: p.price,
      originalprice: p.originalPrice,
      isfree: false,
      downloadurl: null,
      htmlcontent: null,
      isshowonhome: true,
      issystemgenerated: true,
      ispubliclyclaimable: true,
      allowedbuyerids: null
    }));
    
    if (onlineProducts.length > 0) {
      const { error: opError } = await supabase.from('online_products').upsert(onlineProducts, { returning: 'minimal' });
      if (opError) {
        sendEvent({ type: 'log', message: `Lỗi đồng bộ online_products: ${opError.message}` });
      } else {
        sendEvent({ type: 'log', message: `Đã đồng bộ ${onlineProducts.length} sản phẩm vào online_products.` });
      }
    }

    sendEvent({ type: 'done', processed: results.length, details: results });
  } catch (e: any) {
    console.error('Auto publish error:', e);
    sendEvent({ type: 'error', message: e.message });
  } finally {
    res.end();
  }
});

  let tmpDbData: any = {};
  let globalSupabaseConfig = {
    url: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://encpsaatojnxgyjjcvnx.supabase.co',
    key: process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
  };
  try {
    if (fs.existsSync(DB_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      tmpDbData = parsed.tmpDbData || {};
      globalSupabaseConfig = parsed.globalSupabaseConfig || globalSupabaseConfig;
    }
  } catch (e) {}

  const saveToDisk = () => {
    try { fs.writeFileSync(DB_FILE, JSON.stringify({ tmpDbData, globalSupabaseConfig })); } catch (e) {}
  };

  app.get("/api/db-config", (req, res) => {
    res.json(globalSupabaseConfig);
  });

  app.post("/api/db-config", (req, res) => {
    try {
      const { url, key } = req.body;
      if (url) globalSupabaseConfig.url = url;
      if (key) globalSupabaseConfig.key = key;
      saveToDisk();
      res.json({ success: true, config: globalSupabaseConfig });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/sync-data", (req, res) => {
    res.json(tmpDbData);
  });
  app.post("/api/sync-data", (req, res) => {
    try {
      tmpDbData = { ...tmpDbData, ...req.body };
      saveToDisk();
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
  // --- END SHARED LINK FIX ---

  // In-memory data store for Client Licenses
  const clientLicenses: {
    id: string;
    customerName: string;
    maxDevices: number;
    devices: string[];
    status: 'active' | 'paused';
    createdAt: string;
  }[] = [];

  app.post("/api/license/create", (req, res) => {
    try {
      const { customerName, maxDevices } = req.body;
      const id = 'LIC-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      const newLicense = {
        id,
        customerName: customerName || "Khách Vãng Lai",
        maxDevices: maxDevices || 3,
        devices: [],
        status: 'active' as const,
        createdAt: new Date().toISOString()
      };
      clientLicenses.push(newLicense);
      res.json({ success: true, license: newLicense });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/license/list", (req, res) => {
    res.json({ licenses: clientLicenses });
  });

  app.post("/api/license/toggle", (req, res) => {
    const { id } = req.body;
    const lic = clientLicenses.find(l => l.id === id);
    if (!lic) return res.status(404).json({ error: "Không tìm thấy giấy phép" });
    lic.status = lic.status === 'active' ? 'paused' : 'active';
    res.json({ success: true, license: lic });
  });

  app.post("/api/license/delete", (req, res) => {
    const { id } = req.body;
    const idx = clientLicenses.findIndex(l => l.id === id);
    if (idx !== -1) {
      clientLicenses.splice(idx, 1);
    }
    res.json({ success: true });
  });

  app.post("/api/license/validate", (req, res) => {
    try {
      const { id, deviceId } = req.body;
      const lic = clientLicenses.find(l => l.id === id);
      if (!lic) return res.status(400).json({ error: "Giấy phép không tồn tại hoặc đã bị xoá." });
      if (lic.status === 'paused') return res.status(400).json({ error: "Giấy phép này đang bị tạm ngừng." });
      
      if (!lic.devices.includes(deviceId)) {
        if (lic.devices.length >= lic.maxDevices) {
          return res.status(400).json({ error: "Giấy phép này đã đạt giới hạn thiết bị tối đa (" + lic.maxDevices + ")." });
        }
        lic.devices.push(deviceId);
      }
      res.json({ success: true, license: lic });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API Route for Gemini marketing content generation
  app.post("/api/gemini/generate-content", async (req, res) => {
    try {
      const apiKey = (req.headers["x-gemini-key"] as string) || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ 
          error: "Chưa cấu hình GEMINI_API_KEY trong hệ thống. Vui lòng thiết lập khóa API tại Settings > Secrets hoặc nhập Khóa API tự cung cấp tại Tab Quản trị." 
        });
      }

      // Initialize the official @google/genai SDK
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const { productName, rawLinkInput, categoryId, extraInfo, productImageBase64 } = req.body;

      // Fast data extraction persona instruction
      const systemInstruction = `Bạn là một AI trích xuất dữ liệu sản phẩm SIÊU TỐC. Nhiệm vụ của bạn là bóc tách các trường thông tin (tên, giá, giá gốc, mô tả, từ khóa) thật nhanh, chính xác. KHÔNG sáng tác rườm rà. Nếu trong đầu vào / ảnh đã có nội dung mô tả, HÃY GIỮ Y NGUYÊN 100% không chế cháo thêm để tiết kiệm tối đa thời gian xử lý.`;

      // Build multimodal parts for Gemini
      const queryParts: any[] = [];

      if (productImageBase64) {
        try {
          const match = productImageBase64.match(/^data:([^;]+);base64,(.*)$/);
          if (match) {
            queryParts.push({
              inlineData: {
                mimeType: match[1],
                data: match[2]
              }
            });
          } else {
            queryParts.push({
              inlineData: {
                mimeType: "image/jpeg",
                data: productImageBase64
              }
            });
          }
        } catch (imgErr) {
          console.error("Lỗi xử lý base64 ảnh gửi tới Gemini:", imgErr);
        }
      }

      let promptText = `Hãy TRÍCH XUẤT NHANH các thông tin sản phẩm sau đây vào định dạng JSON. KHÔNG VIẾT LẠI dài dòng, ưu tiên tốc độ số 1!`;
      if (productImageBase64) {
        promptText += `\nBóc tách thông tin từ ảnh chụp. Trích xuất đúng tên sản phẩm, các thông số kĩ thuật, ưu điểm, giá. Nếu trong ảnh đã có nội dung rõ ràng, hãy ghi lại y nguyên không cần AI viết lại.`;
      }
      
      promptText += `
- Tên sản phẩm gửi lên (nếu có): "${productName || ''}"
- Nội dung văn bản dán vào hoặc thông tin thêm: "${extraInfo || ''}"

Yêu cầu trả về cấu trúc JSON hợp lệ tuyệt đối các trường sau (trả kết quả NGAY LẬP TỨC):
1. "title": Tên sản phẩm chính xác, ngắn gọn, cắt bớt các ký hiệu thừa.
2. "description": Nếu người dùng đã dán nội dung mô tả ở trên, HÃY SAO CHÉP Y NGUYÊN. Nếu chưa có, viết một đoạn mô tả NGẮN GỌN (tối đa 4-5 dòng) có kèm emoji nổi bật thông số, không viết lan man tốn thời gian. Tuyệt đối KHÔNG sử dụng bất kỳ hashtag (#) nào.
3. "imageKeyword": Cần duy nhất 1 từ tiếng Anh chung chung (như shirt, shoe, dress, laptop).
4. "price": Giá bán (số nguyên VND lớn hơn 0, ví dụ 120000). Trích xuất đúng nếu thấy trong ảnh hoặc nội dung, nếu không tự đoán một mức giá hợp lý.
5. "originalPrice": Giá gốc ban đầu (số nguyên lớn hơn 'price', ví dụ 250000).`;

      queryParts.push({ text: promptText });

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: queryParts,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              imageKeyword: { type: Type.STRING },
              price: { type: Type.INTEGER },
              originalPrice: { type: Type.INTEGER }
            },
            required: ["title", "description", "imageKeyword", "price", "originalPrice"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Không lấy được kết quả từ máy chủ Gemini API.");
      }

      const parsedData = JSON.parse(responseText.trim());
      
      // Khử hashtag (nếu có)
      if (parsedData.description) {
        parsedData.description = parsedData.description.replace(/#\S+/g, "").replace(/[ \t]+$/gm, "");
      }

      // Smart collection of standard stock images based on AI keyword outputs
      // Sáng suốt chọn ảnh mặc định theo ngành hàng (categoryId) của người dùng trước để tránh việc lỗi/mặc định ra đồng hồ
      let imageUrl = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=500"; // Default watch fallback
      
      const catIdStr = String(categoryId || '1');
      if (catIdStr === '1') {
        imageUrl = "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=500"; // Men's T-shirt / Fashion
      } else if (catIdStr === '7') {
        imageUrl = "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=500"; // Women's Dress
      } else if (catIdStr === '2') {
        imageUrl = "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=500"; // Cosmetics Son / Mỹ phẩm
      } else if (catIdStr === '3') {
        imageUrl = "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=500"; // Electronics Headphones
      } else if (catIdStr === '4') {
        imageUrl = "https://images.unsplash.com/photo-1626806787426-5910811b6325?auto=format&fit=crop&q=80&w=500"; // Air fryer / Gia dụng
      } else if (catIdStr === '5') {
        imageUrl = "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=500"; // Health / Sức khoẻ
      } else if (catIdStr === '6') {
        imageUrl = "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=500"; // Baby toys / Mẹ & Bé
      }

      const kw = (parsedData.imageKeyword || "").toLowerCase();
      // If keyword specifies a specific sub-item, refine the imageUrl with precise matches
      if (kw.includes("jacket") || kw.includes("coat") || kw.includes("hoodie") || kw.includes("windbreaker") || kw.includes("cardigan") || kw.includes("blazer") || kw.includes("áo khoác") || kw.includes("áo gió") || kw.includes("chống nắng") || kw.includes("chong nang")) {
        imageUrl = "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=500"; // Overcoat / Jacket / Áo chống nắng
      } else if (kw.includes("sneaker") || kw.includes("shoe") || kw.includes("giày") || kw.includes("sandal") || kw.includes("boot")) {
        imageUrl = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=500"; // Shoes
      } else if (kw.includes("t-shirt") || kw.includes("shirt") || kw.includes("polo") || kw.includes("tee") || kw.includes("áo thun") || kw.includes("áo sơ mi") || kw.includes("sơ mi")) {
        imageUrl = "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=500"; // T-Shirt/Shirt
      } else if (kw.includes("dress") || kw.includes("skirt") || kw.includes("váy") || kw.includes("đầm") || kw.includes("clothing") || kw.includes("fashion")) {
        imageUrl = "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=500"; // Váy/Dress
      } else if (kw.includes("lip") || kw.includes("lipstick") || kw.includes("makeup") || kw.includes("cosmetic") || kw.includes("mỹ phẩm") || kw.includes("son")) {
        imageUrl = "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=500"; // Lipstick / Son
      } else if (kw.includes("headphone") || kw.includes("earphone") || kw.includes("bluetooth") || kw.includes("audio") || kw.includes("tai nghe")) {
        imageUrl = "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=500"; // Headphones
      } else if (kw.includes("cream") || kw.includes("skincare") || kw.includes("serum") || kw.includes("dưỡng da") || kw.includes("sữa rửa mặt") || kw.includes("body")) {
        imageUrl = "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=500"; // Skincare cream
      } else if (kw.includes("watch") || kw.includes("clock") || kw.includes("đồng hồ")) {
        imageUrl = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=500"; // Watch
      } else if (kw.includes("phone") || kw.includes("mobile") || kw.includes("device") || kw.includes("điện thoại") || kw.includes("laptop") || kw.includes("pc")) {
        imageUrl = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=500"; // Smart device
      } else if (kw.includes("kitchen") || kw.includes("cook") || kw.includes("pot") || kw.includes("bếp") || kw.includes("gia dụng") || kw.includes("nồi")) {
        imageUrl = "https://images.unsplash.com/photo-1626806787426-5910811b6325?auto=format&fit=crop&q=80&w=500"; // Air fryer/Cookware
      } else if (kw.includes("bag") || kw.includes("purse") || kw.includes("backpack") || kw.includes("túi")) {
        imageUrl = "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=500"; // Bag / Túi xách
      } else if (kw.includes("baby") || kw.includes("kid") || kw.includes("toy") || kw.includes("bỉm") || kw.includes("sữa")) {
        imageUrl = "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=500"; // Toy
      } else if (kw.includes("med") || kw.includes("health") || kw.includes("vitamin") || kw.includes("thuốc")) {
        imageUrl = "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=500"; // Health pill
      }

      res.json({
        title: parsedData.title,
        description: parsedData.description,
        imageKeyword: parsedData.imageKeyword,
        suggestedImage: imageUrl,
        price: parsedData.price,
        originalPrice: parsedData.originalPrice
      });
    } catch (e: any) {
      console.error("Gemini Creator processing error:", e);
      res.status(500).json({ error: e.message || "Lỗi xử lý sinh nội dung AI. Vui lòng kiểm tra lại cấu hình." });
    }
  });

  // API Route for Gemini Customer Database Analysis & Marketing Report
  app.post("/api/gemini/generate-report", async (req, res) => {
    try {
      const apiKey = (req.headers["x-gemini-key"] as string) || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ 
          error: "Chưa cấu hình GEMINI_API_KEY trong hệ thống. Vui lòng thiết lập khóa API tại Settings > Secrets hoặc nhập Khóa API tự cung cấp tại Tab Quản trị." 
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const { buyers, searchTracks, scheduleType } = req.body;

      const systemInstruction = `Bạn là Giám đốc Phân tích Khách hàng & Copywriter lỗi lạc của sàn Thương mại điện tử.
Hãy trả về một báo cáo phân tích sâu sắc về tệp dữ liệu khách hàng hiện tại và tự động sáng tạo bài viết cùng với hình ảnh đại diện thích hợp nhất cho chiến dịch phễu tương lai.`;

      const promptText = `
Hãy đồng hành cùng nhà bán hàng phân tích dữ liệu kho khách hàng (database) sau đây:
- Danh sách người mua đăng ký: ${JSON.stringify(buyers || [])}
- Danh sách từ khóa người dùng đã tìm kiếm nóng nhất: ${JSON.stringify(searchTracks || [])}
- Lịch trình báo cáo đã cài đặt: "${scheduleType || 'Tự động'}"

Yêu cầu trả về cấu trúc JSON chuẩn và hợp lệ bao gồm các trường:
1. "customerAnalysis": Thống kê phân tích xu hướng mua sắm chính, dự báo độ tuổi/địa lý/nhóm sở thích thịnh hành và đưa ra 3 kết luận tối ưu hóa chiến lược bán hàng (Đừng giải thích dài dòng ở cuối, viết súc tích rõ ý).
2. "marketingArticle": Trực tiếp viết một bài đăng mạng xã hội (Facebook, Zalo, Tiktok post) lôi cuốn để quảng bá sản phẩm trực tuyến (Ví dụ: Khóa học affiliate tiếp thị liên kết 0đ, Mã nguồn website bán hàng, hay Tặng tài liệu/ebook hướng dẫn kiếm tiền online). Bài viết bùng nổ, giàu biểu tượng cảm xúc (emojis) và có sẵn lời mời bốc thăm trúng quà. Tuyệt đối KHÔNG sử dụng bất kỳ hashtag (#) nào trong bài viết.
3. "imageQuery": Từ khóa tiếng Anh duy nhất để lấy ảnh minh hoạ phù hợp nhất từ kho ảnh Unsplash (Ví dụ: "office", "education", "gifting", "software", "marketing").
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: promptText,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              customerAnalysis: { type: Type.STRING },
              marketingArticle: { type: Type.STRING },
              imageQuery: { type: Type.STRING }
            },
            required: ["customerAnalysis", "marketingArticle", "imageQuery"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Không lấy được kết quả phân tích từ Gemini API.");
      }

      const parsedData = JSON.parse(responseText.trim());
      
      // Xóa tất cả các hashtag (nếu AI lỡ tạo ra) 
      if (parsedData.marketingArticle) {
        parsedData.marketingArticle = parsedData.marketingArticle.replace(/#\S+/g, "").replace(/[ \t]+$/gm, "");
      }

      // Find stock image based on generated imageQuery keyword
      let selectedImage = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=500"; // marketing default
      const kw = (parsedData.imageQuery || "").toLowerCase();
      if (kw.includes("software") || kw.includes("code") || kw.includes("computer") || kw.includes("tech")) {
        selectedImage = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=500";
      } else if (kw.includes("gift") || kw.includes("box") || kw.includes("present") || kw.includes("win")) {
        selectedImage = "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=500";
      } else if (kw.includes("course") || kw.includes("book") || kw.includes("learn") || kw.includes("education")) {
        selectedImage = "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=500";
      } else if (kw.includes("cosmetic") || kw.includes("beauty") || kw.includes("woman")) {
        selectedImage = "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=500";
      }

      res.json({
        customerAnalysis: parsedData.customerAnalysis,
        marketingArticle: parsedData.marketingArticle,
        imageQuery: parsedData.imageQuery,
        suggestedImage: selectedImage
      });

    } catch (e: any) {
      console.error("Gemini Report processing error:", e);
      res.status(500).json({ error: e.message || "Lỗi xử lý phân tích dữ liệu AI." });
    }
  });

  // API Route for Gemini Chatbot Q&A Assistant
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const apiKey = (req.headers["x-gemini-key"] as string) || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ 
          error: "Chưa cấu hình GEMINI_API_KEY trong hệ thống. Vui lòng thiết lập khóa API tại Settings > Secrets hoặc nhập Khóa API tự cung cấp tại Tab Quản trị." 
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const { message, history, products, onlineProducts } = req.body;

      const systemInstruction = `Bạn là Trợ lý Ảo Thông Minh "Remix AI Assistant" chính thức của trang web tiếp thị liên kết "AffiliShop". 
Nhiệm vụ của bạn là giải đáp tất cả thắc mắc của khách hàng một cách thân thiện, lôi cuốn, chuyên nghiệp bằng tiếng Việt.

Hệ thống của chúng ta hoạt động với các tính năng sau (Phân tích dựa trên mã nguồn thực tế của website):
1. Cửa hàng tiếp thị liên kết (AffiliShop): Cho phép chủ shop đăng bán sản phẩm tiếp thị (Affiliate marketing) từ Shopee, Tiktok Shop, Lazada, v.v. Có hỗ trợ zoom giao diện (compact, normal, large), giỏ hàng ảo, đăng ký tài khoản nâng cao để nhận quà 0đ.
2. Mục Quản trị (Admin Panel): Đăng bán sản phẩm tiếp thị liên kết, xem danh sách khách hàng đăng ký (được tìm kiếm theo tên hoặc SĐT), quản lý báo cáo marketing báo cáo dữ liệu dùng AI, điều chỉnh link liên hệ mạng xã hội như Facebook, Zalo hoặc kênh TikTok ID của riêng admin. Nhập mật khẩu quản trị là: "112231vn" để vào trang quản trị trực tiếp mà không cần username.
3. Phần mềm số & Sản phẩm Online (Phễu khích lệ): Nơi trưng bày các giáo trình, khóa học, file mã nguồn hữu ích cho khách. Khách hàng có thể quay vòng quay may mắn (bốc thăm 0đ VIP) để nhận tài liệu/phần mềm hoàn toàn miễn phí sau khi đăng ký họ tên + số điện thoại nhận hàng.
4. Bạn có khả năng đọc và hiểu toàn bộ cấu trúc code của website này (được xây dựng bằng Express làm Backend + React 19 làm Single Page Application + Tailwind CSS cho giao diện + @google/genai phục vụ trí tuệ nhân tạo).

Dưới đây là DỮ LIỆU CỐT LÕI THỰC TẾ TRÊN HỆ THỐNG để bạn tư vấn đúng 100% mục tiêu:
- DS Sản phẩm Tiếp thị thông thường (Vật lý): ${JSON.stringify(products || [])}
- DS Sản phẩm Số, Phần mềm, Khóa học (Kỹ thuật số): ${JSON.stringify(onlineProducts || [])}

QUY TẮC CÂU TRẢ LỜI CỦA BẠN:
1. Nếu khách hỏi về TRANG WEB (về chúng tôi, về tính năng, về giao diện, về mã nguồn/code máy tính tự xây dựng): Hãy trả lời chi tiết và thông minh dựa trên thông tin về hệ thống ở trên. Nhấn mạnh việc trang web được lập trình hiện đại, tối ưu SEO, giao diện mượt mà và tính năng tự động hóa cao.
2. Nếu khách hỏi/quan tâm đến PHẦN MỀM SỐ (Software) hoặc KHÓA HỌC trực tuyến: Trích xuất các sản phẩm số thích hợp nhất từ danh sách "DS Sản phẩm Số" được cung cấp ở trên. Chỉ rõ tên, tính năng tiêu biểu của phần mềm/khóa học đó, hướng dẫn khách nhấn qua Tab "Sản Phẩm Số & Bốc Thăm (Thu Phễu)" ở thanh điều hướng để sở hữu hoặc bốc thăm trúng thưởng 0đ!
3. Nếu khách hỏi về SẢN PHẨM PHỔ THÔNG (Váy, giày, đồ gia dụng, tai nghe...): Tìm các sản phẩm khớp hoặc gần khớp trong "DS Sản phẩm Tiếp thị thông thường", trả lời mô tả về sản phẩm đó, khuyến khích họ nhấn vào sản phẩm để xem thêm và lấy Link tiếp thị liên kết để mua hàng trên Shopee/Tiktok/Lazada.
4. RÀNG BUỘC PHẢN HỒI AN TOÀN TRUY XUẤT (VÔ CÙNG QUAN TRỌNG): Nếu khách hỏi về bất kì sản phẩm, dịch vụ hay khóa học gì KHÔNG có trong danh sách được cung cấp bên trên, bạn PHẢI trả lời khách là "Chưa có thông tin", tuyệt đối không được tự ý bịa vẽ, suy diễn hay điền thông tin sai lệch không khớp với dữ liệu thực tế đã cung cấp ở trên. KHÔNG tự ý sáng tạo thông tin sản phẩm hoặc dịch vụ sai lệch.
5. QUAN TRỌNG: Bạn cần trả về một cấu trúc JSON hợp lệ bao gồm hai trường:
- "reply": Nội dung câu trả lời bằng Markdown tiếng Việt đầy thuyết phục, có bullet points, emoji sinh động, giới thiệu thông tin chính xác.
- "recommendedProduct": (Tùy chọn) Nếu câu trả lời gợi ý hoặc nhắc tới sản phẩm nào cụ thể, hãy trả về một object chứa ID của sản phẩm tiếp thị đó (ví dụ: { "id": "p1", "isOnline": false }) hoặc sản phẩm online (với trường "isOnline": true) để giao diện có thể hiển thị trực tiếp một chiếc thẻ giới thiệu sản phẩm thật kèm nút bấm dẫn đến Link mua trực tiếp hoặc bốc thăm VIP.

Hãy luôn giữ thái độ niềm nở, khuyến khích khách mua hàng hoặc tham gia bốc thăm trúng thưởng 0đ!`;

      const contents: any[] = [];
      if (history && history.length > 0) {
        for (const h of history) {
          contents.push({
            role: h.role === "model" ? "model" : "user",
            parts: [{ text: h.parts?.[0]?.text || h.message || "" }]
          });
        }
      }
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: contents,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: { type: Type.STRING },
              recommendedProduct: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  isOnline: { type: Type.BOOLEAN }
                },
                required: ["id"]
              }
            },
            required: ["reply"]
          }
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("Không nhận được câu trả lời từ Gemini API.");
      }

      res.json(JSON.parse(text.trim()));

    } catch (e: any) {
      console.error("Gemini Chat Q&A Error:", e);
      res.status(500).json({ error: e.message || "Lỗi xử lý câu hỏi từ Gemini." });
    }
  });

  // API Route to test a Gemini API key validity and status
  app.post("/api/gemini/test-key", async (req, res) => {
    try {
      const { apiKey } = req.body;
      if (!apiKey) {
        return res.status(405).json({ valid: false, error: "Thiếu mã API Key để kiểm tra." });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Quick minimal check call
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: "Hi",
      });

      if (response && response.text) {
        return res.json({ valid: true });
      }
      return res.json({ valid: false, error: "Không thể lấy thông tin phản hồi văn bản từ API." });
    } catch (e: any) {
      console.error("Test API Key failed:", e);
      // Treat free quota exhaustion as valid so it can be saved (the system will round-robin it)
      if (e.message && (e.message.includes('429') || e.message.includes('QUOTA') || e.message.includes('exhausted') || String(e.status) === '429')) {
        return res.json({
          valid: true,
          error: "API Key hợp lệ nhưng hiện tại đã hết lượt dùng miễn phí trong ngày (429)."
        });
      }
      return res.json({ 
        valid: false, 
        error: e.message || "Khóa API không hợp lệ hoặc sai ký tự." 
      });
    }
  });

  // API Route to generate/continue gift slides content dynamically using Gemini AI
  app.post("/api/gemini/generate-gift-slides", async (req, res) => {
    try {
      const apiKey = (req.headers["x-gemini-key"] as string) || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Fallback response when GEMINI_API_KEY is not configured
        const { customTitle, countToGenerate } = req.body;
        const requestedCount = countToGenerate || 5;
        const dummySlides = Array.from({ length: requestedCount }).map((_, i) => ({
          slideNumber: i + 1,
          title: `📄 ${customTitle || "Tài Liệu Hướng Dẫn Kỹ Năng"} - Trang ${i + 1}`,
          subtitle: "🔹 NỘI DUNG MÔ PHỎNG",
          p1: "Hệ thống chưa tìm thấy GEMINI_API_KEY. Vui lòng thiết lập khóa API tại Settings > Secrets hoặc nhập Khóa API hỗ trợ vào phần cài đặt Quản trị để tạo nội dung bằng AI thực tế.",
          p2: "Đây là dữ liệu văn bản giả lập để bạn tiếp tục test luồng giao diện mà không gặp lỗi.",
          imageKeyword: "placeholder concept",
          imagePrompt: "An abstract placeholder image, glowing neon lines, professional setup.",
          image: `https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80&sig=${Math.random()}`,
          isLastOne: false,
          badges: ["⚠ Lỗi Chưa API Key", "Mô phỏng Trực Quan"]
        }));

        return res.json({
          slides: dummySlides,
          category: "Demo Draft"
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const { customTitle, suggestions, authorName, countToGenerate, existingSlides } = req.body;

      const systemInstruction = `Bạn là Trợ lý AI Biên Soạn Tài Liệu Quà Tặng & Cẩm Nang Điện Tử (Ebook/Web-Doc) độc quyền đỉnh cao.
Nhiệm vụ của bạn là đọc kỹ yêu cầu quà tặng tùy chọn của khách hàng và tự tay viết các trang nội dung hoàn chỉnh, vô cùng lôi cuốn, thực tế từ đầu đến cuối, tuyệt đối KHÔNG áp đặt sẵn một bộ đề cương hay mục lục rập khuôn lỗi thời, cứng nhắc cho tất cả mọi người.
LƯU Ý CỰC KỲ QUAN TRỌNG: Quán triệt việc viết TỈ MỈ, TỪNG BƯỚC một cách chi tiết trong MỖI trang quà tặng. Tuyệt đối TRÁNH việc chỉ nêu tên bí quyết mà không có hướng dẫn thực hành. Mỗi phần, mỗi trang phải mô tả cặn kẽ để một người mới bắt đầu cũng có thể đọc hiểu và làm theo được ngay lập tức (giống kiểu cầm tay chỉ việc). (Ví dụ: nếu khách yêu cầu chia sẻ "19 bí quyết", hãy liệt kê và hướng dẫn chi tiết từng bí quyết một).
Mỗi trang cần có tiêu đề sáng tạo riêng, phần mô tả phân tích chuyên sâu lôi cuốn, một prompt (câu lệnh tiếng Anh) chi tiết để vẽ ảnh minh họa chuyên nghiệp cho trang đó, mỏ neo hành động nổi bật và checklist/action plan thực tiễn.
YÊU CẦU ĐẶC BIỆT: Hãy chèn các biểu tượng cảm xúc (emoji/icon) phù hợp vào đầu "title" (vd: "🔥 Bí quyết..."), "badge" (vd: "💡 TƯ DUY GỐC RỄ"), và từng đầu mục trong "list" hành động để bài viết trở nên sinh động, lôi cuốn, sinh động từ đầu đến cuối!`;

      let promptText = `Hãy biên soạn thêm một loạt trang nội dung mới cho cuốn tài liệu quà tặng điện tử.
- Tên tài liệu/Chủ đề: "${customTitle}"
- Yêu cầu chi tiết từ khách hàng: "${suggestions}"
- Biên soạn bởi tác giả: "${authorName}"
- Số lượng trang cần viết trong lượt này: ${countToGenerate || 5} trang`;

      if (existingSlides && existingSlides.length > 0) {
        promptText += `\n\nLƯU Ý QUAN TRỌNG: Cuốn tài liệu này ĐÃ CÓ ${existingSlides.length} trang được viết trước đó. Để không bị lặp lại nội dung hoặc ý tưởng, hãy đọc kỹ thông tin các trang hiện hữu này và viết tiếp các phần tiếp theo một cách mượt mà, sâu sắc, hấp dẫn và sáng tạo để nối dài tài liệu:`;
        existingSlides.forEach((slide: any, idx: number) => {
          promptText += `\nTrang ${idx + 1}: ${slide.title} (Subtitle: ${slide.subtitle})`;
        });
        promptText += `\n\nHãy tiếp tục viết bắt đầu với Trang số ${existingSlides.length + 1} thật xuất sắc, đầy sức thuyết phục!`;
      } else {
        promptText += `\n\nĐây là những trang đầu tiên của tài liệu quà tặng. Hãy mở đầu thật cuốn hút, đưa độc giả tiếp cận giải pháp đắt giá ngay lập tức!`;
      }

      promptText += `

Yêu cầu trả về cấu trúc JSON đúng chuẩn bao gồm mảng các "slides" mới được tạo:
Mỗi slide trong mảng cần có cấu trúc:
1. "title": Tiêu đề trang sáng tạo, lôi cuốn, bám sát nội dung trang này và chủ đề quà tặng.
2. "subtitle": Phụ đề nhỏ bổ trợ ý nghĩa cho tiêu đề chính.
3. "badge": Nhãn chủ đề ấn tượng hợp xu hướng (ví dụ: "TƯ DUY GỐC RỄ", "CHIẾN LƯỢC ĐỘT PHÁ", "HÀNH ĐỘNG THỰC THI").
4. "p1": Đoạn phân tích chuyên sâu lôi cuốn số 1 (khoảng 3-4 câu mô tả thực tế, cung cấp giá trị dồi dào, thu hút cực tốt, mang tính truyền cảm hứng mạnh mẽ).
5. "p2": Đoạn hướng dẫn, mở rộng và định hướng hành động số 2 đầy thực tế hằng ngày (khoảng 2-3 câu).
6. "highlight": Câu châm ngôn, triết lý hoặc mỏ neo hành động ngắn gọn đắt giá tạo điểm nhấn.
7. "list": Mảng chứa đúng 3 chuỗi hành động cụ thể, gãy gọn để người đọc tự thực hành ngay.
8. "imageKeyword": Cụm từ nghệ thuật tiếng Anh ngắn gọn làm từ khóa tìm ảnh cực kỳ đặc trưng cho nội dung slide trên Unsplash (ví dụ: "mindfulness meditation", "workspace team brainstorming", "corporate financial plan").
9. "imagePrompt": Một câu lệnh tiếng Anh (prompt) thật chi tiết và chuyên nghiệp dùng cho AI vẽ ảnh (Midjourney/DALL-E) sát nội dung trang này. QUAN TRỌNG: Phải ghi chú thêm kích thước khung hình ở cuối, ví dụ: "..., ${req.body.aspectRatio === '9:16' ? 'portrait, --ar 9:16' : 'landscape, --ar 16:9'}".`;

      let response;
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: promptText,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                slides: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      subtitle: { type: Type.STRING },
                      badge: { type: Type.STRING },
                      p1: { type: Type.STRING },
                      p2: { type: Type.STRING },
                      highlight: { type: Type.STRING },
                      list: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      },
                      imageKeyword: { type: Type.STRING },
                      imagePrompt: { type: Type.STRING }
                    },
                    required: ["title", "subtitle", "badge", "p1", "p2", "highlight", "list", "imageKeyword", "imagePrompt"]
                  }
                }
              },
              required: ["slides"]
            }
          }
        });
      } catch (firstError: any) {
        console.warn("First attempt with gemini-3.1-flash-lite failed (possibly 503/overloaded), falling back internally...", firstError);
        response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: promptText,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                slides: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      subtitle: { type: Type.STRING },
                      badge: { type: Type.STRING },
                      p1: { type: Type.STRING },
                      p2: { type: Type.STRING },
                      highlight: { type: Type.STRING },
                      list: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      },
                      imageKeyword: { type: Type.STRING },
                      imagePrompt: { type: Type.STRING }
                    },
                    required: ["title", "subtitle", "badge", "p1", "p2", "highlight", "list", "imageKeyword", "imagePrompt"]
                  }
                }
              },
              required: ["slides"]
            }
          }
        });
      }

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Không lấy được kết quả biên soạn tài liệu từ Gemini.");
      }

      const parsedJSON = JSON.parse(responseText.trim());
      const generatedNewSlides = parsedJSON.slides || [];

      // Default to beautiful AI generated image from keywords mapping on the backend directly!
      const slidesWithImages = generatedNewSlides.map((slide: any, idx: number) => {
        const kw = slide.imageKeyword || "abstract learning technology";
        const sig = Math.floor(Math.random() * 100000) + idx;
        const cleanedKw = kw.replace(/[^a-zA-Z0-9\s]/g, "").trim();
        const imageUrl = sig % 2 === 0
          ? `https://images.unsplash.com/featured/800x600/?${encodeURIComponent(cleanedKw)}&sig=${sig}`
          : `https://loremflickr.com/800/600/${encodeURIComponent(cleanedKw)}?lock=${sig}`;
        return {
          ...slide,
          image: imageUrl
        };
      });

      res.json({ slides: slidesWithImages });

    } catch (e: any) {
      console.error("Lỗi AI Biên soạn tài liệu quà tặng:", e);
      // Fallback to dummy data instead of completely crashing the user flow on 503 Overloaded or 429 Quota Exceeded
      if (e.message?.includes('503') || e.message?.includes('experiencing high demand') || e.message?.includes('429') || e.message?.toLowerCase().includes('quota')) {
        const reqBody = req.body;
        const countToGenerate = reqBody.countToGenerate || 5;
        const customTitle = reqBody.customTitle || "Tài Liệu Hướng Dẫn";
        
        const dummySlides = Array.from({ length: countToGenerate }).map((_, i) => ({
          slideNumber: i + 1,
          title: `📄 ${customTitle} - Trang ${i + 1} (Hệ thống AI quá tải)`,
          subtitle: "🔹 NỘI DUNG MÔ PHỎNG",
          p1: "Hệ thống AI đang được bảo trì hoặc tạm thời quá tải do lưu lượng tìm kiếm tăng cao đột biến (Lỗi 503).",
          p2: "Đây là dữ liệu văn bản giả lập để bạn tiếp tục bài viết, bạn có thể tự thay đổi nội dung này.",
          imageKeyword: "error placeholder",
          imagePrompt: "A futuristic data center glowing with red warning signals indicating overloaded servers, professional.",
          image: `https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80&sig=${Math.random()}`,
          isLastOne: false,
          badges: ["⚠ Lỗi AI Quá Tải", "Dữ Liệu Dự Phòng"]
        }));

        return res.json({ slides: dummySlides });
      }
      res.status(500).json({ error: e.message || "Lỗi xử lý tạo slide quà tặng tự động từ máy chủ AI." });
    }
  });

  // API Route to rewrite a single slide based on user instruction
  app.post("/api/gemini/rewrite-slide", async (req, res) => {
    try {
      const apiKey = (req.headers["x-gemini-key"] as string) || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(401).json({ error: "Missing API Key" });
      }
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const { slideTopic, currentContent, rewriteInstruction } = req.body;

      const systemInstruction = `Bạn là Trợ lý AI Biên Soạn Tài Liệu Quà Tặng & Cẩm Nang Điện Tử (Ebook/Web-Doc) độc quyền đỉnh cao.
Nhiệm vụ của bạn là VIẾT LẠI một trang (slide) theo yêu cầu chỉnh sửa của Admin.
- Hãy giữ đúng định dạng JSON Schema yêu cầu.
- Lắng nghe tuyệt đối yêu cầu chỉnh sửa từ Admin.
LƯU Ý CỰC KỲ QUAN TRỌNG: Quán triệt việc viết TỈ MỈ, TỪNG BƯỚC một cách chi tiết.`;

      const promptText = `Nội dung slide hiện tại:
${JSON.stringify(currentContent, null, 2)}

Yêu cầu chỉnh sửa từ Admin (rất quan trọng phải tuân thủ):
"${rewriteInstruction}"

Hãy viết lại toàn bộ nội dung slide này theo đúng yêu cầu trên. Trả về JSON theo định dạng chuẩn của một slide. Đối với "imagePrompt", hãy giữ nguyên hướng dẫn và nhớ thêm ${req.body.aspectRatio === '9:16' ? 'portrait, --ar 9:16' : 'landscape, --ar 16:9'} vào cuối prompt.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: promptText,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              newSlide: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  subtitle: { type: Type.STRING },
                  badge: { type: Type.STRING },
                  p1: { type: Type.STRING },
                  p2: { type: Type.STRING },
                  highlight: { type: Type.STRING },
                  list: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  imageKeyword: { type: Type.STRING },
                  imagePrompt: { type: Type.STRING }
                },
                required: ["title", "subtitle", "badge", "p1", "p2", "highlight", "list", "imageKeyword", "imagePrompt"]
              }
            },
            required: ["newSlide"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Không lấy được kết quả từ Gemini.");
      }

      const parsedJSON = JSON.parse(responseText.trim());
      res.json({ newSlide: parsedJSON.newSlide });

    } catch (e: any) {
      console.error("Lỗi AI Viết lại slide:", e);
      res.status(500).json({ error: e.message || "Lỗi xử lý viết lại slide." });
    }
  });

  // API Route to generate/regenerate slide image on demand using Gemini AI
  app.post("/api/gemini/generate-slide-image", async (req, res) => {
    try {
      const apiKey = (req.headers["x-gemini-key"] as string) || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Fallback dummy image when no API key is set
        const { title } = req.body;
        const kw = title ? title.replace(/[^a-zA-Z0-9\s]/g, "").trim() : "success";
        const rand = Math.floor(Math.random() * 10000);
        const imageUrl = `https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80&sig=${rand}&q=${encodeURIComponent(kw)}`;
        return res.json({ imageUrl });
      }
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const { title, subtitle, p1 } = req.body;

      // Plan: AI keyword representation + high-quality copyright-free Stock query lookup
      // Ask Gemini to write a perfect, high-quality, aesthetic Unsplash English keyword to represent the slide.
      const systemInstruction = `Bạn là chuyên gia thiết kế mỹ thuật và lựa chọn chất liệu hình ảnh hàng đầu thế giới.
Nhiệm vụ của bạn là phân tích tiêu đề và nội dung để đề xuất đúng 1 từ khóa hoặc cụm từ tìm kiếm tiếng Anh xuất sắc (English Search Query) tìm trên Unsplash được những bức ảnh nghệ thuật, truyền cảm hứng, chuyên nghiệp và có chiều sâu mỹ thuật cao nhất.`;

      const promptText = `Hãy phân tích nội dung sau để đề xuất đúng 1 cụm từ khóa tiếng Anh tìm ảnh trên Unsplash minh họa hoàn hảo:
- Tiêu đề slide: "${title}"
- Phụ đề slide: "${subtitle || ''}"
- Nội dung tóm tắt: "${p1 || ''}"

Trả về định dạng JSON chứa đúng một trường "keyword". Ví dụ: {"keyword": "neon computer networking code"}`;

      let response;
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: promptText,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                keyword: { type: Type.STRING }
              },
              required: ["keyword"]
            }
          }
        });
      } catch (firstError) {
        console.warn("Fallback to gemini-3.1-flash-lite for slide image keyword generation...", firstError);
        response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: promptText,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                keyword: { type: Type.STRING }
              },
              required: ["keyword"]
            }
          }
        });
      }

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Không thể liên kết với máy chủ AI để sinh từ khóa ảnh.");
      }

      const parsed = JSON.parse(responseText.trim());
      const kw = parsed.keyword || "abstract office technology";
      const sig = Math.floor(Math.random() * 100000);
      const cleanedKw = kw.replace(/[^a-zA-Z0-9\s]/g, "").trim();
      
      const imageUrl = sig % 2 === 0
        ? `https://images.unsplash.com/featured/800x600/?${encodeURIComponent(cleanedKw)}&sig=${sig}`
        : `https://loremflickr.com/800/600/${encodeURIComponent(cleanedKw)}?lock=${sig}`;

      res.json({ imageUrl });

    } catch (e: any) {
      console.error("Lỗi AI Tạo ảnh slide:", e);
      res.status(500).json({ error: e.message || "Lỗi xử lý tạo ảnh slide từ máy chủ AI." });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
