import fs from 'fs/promises';
import path from 'path';
import { parseCSV } from '../src/utils/csvProcessor';
import { fetchShopeeProductDetailsFromUrl } from '../src/utils/shopeeScraper';
import { processProductImageLocal } from '../src/utils/localImageGen';

const DEFAULT_CSV = path.resolve(process.cwd(), '..', '..', 'BatchProductLinks20260615163313-2c01943fc2e948febc8307c17f0f6bce.csv');
const DEFAULT_LOCAL_SD_URL = 'http://127.0.0.1:8765';

const parseCsvLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
      continue;
    }
    current += char;
  }

  result.push(current);
  return result.map(value => value.trim());
};

const parseCsvContent = (csvContent: string): any[] => {
  const lines = csvContent.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  const rows: any[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const values = parseCsvLine(lines[i]);
    if (values.length !== headers.length) continue;
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });
    rows.push(row);
  }

  return rows;
};

const slugify = (value: string): string => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
};

const decodeDataUrl = (dataUrl: string): { buffer: Buffer; ext: string } => {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) throw new Error('Invalid data URL format');
  const mime = match[1];
  const base64 = match[2];
  const ext = mime.includes('png') ? 'png' : 'jpg';
  return { buffer: Buffer.from(base64, 'base64'), ext };
};

const main = async () => {
  const csvFile = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_CSV;
  const productIndex = process.argv[3] ? Number(process.argv[3]) - 1 : 0;
  const localBaseUrl = process.argv[4] || DEFAULT_LOCAL_SD_URL;

  console.log('CSV file:', csvFile);
  console.log('Product index:', productIndex + 1);
  console.log('Local AI URL:', localBaseUrl);

  const csvText = await fs.readFile(csvFile, 'utf8');
  const rows = parseCsvContent(csvText);
  if (!rows.length) {
    throw new Error('Không đọc được dòng dữ liệu nào từ file CSV');
  }
  if (productIndex < 0 || productIndex >= rows.length) {
    throw new Error(`Product index ${productIndex + 1} nằm ngoài phạm vi, tổng dòng ${rows.length}`);
  }

  const row = rows[productIndex];
  const productName = row['Item Name'] || row['itemName'] || row['ItemName'] || row['item_name'] || 'Shopee Product';
  const productLink = row['Offer Link'] || row['offerLink'] || row['Product Link'] || row['productLink'] || row['product_link'];

  if (!productLink) {
    throw new Error('Không tìm thấy cột Offer Link hoặc Product Link trong CSV');
  }

  console.log('Sản phẩm:', productName);
  console.log('Link sản phẩm:', productLink);

  console.log('Lấy ảnh sản phẩm trực tiếp từ Shopee...');
  const detail = await fetchShopeeProductDetailsFromUrl(productLink);
  if (!detail || !detail.mainImage) {
    throw new Error('Không lấy được ảnh gốc từ Shopee. Hãy kiểm tra link hoặc chuyển sang link gốc.');
  }

  const imageUrl = detail.mainImage;
  console.log('Ảnh gốc:', imageUrl);

  const categoryId = detail.category || '1';
  const prompt = `${productName}, product photo, keep product intact, beautiful e-commerce background, soft studio lighting, photorealistic, no text, no watermark`;

  console.log('Gọi local GPU để tạo ảnh mới...');
  const dataUrl = await processProductImageLocal({
    imageUrl,
    prompt,
    categoryId,
    productName,
    baseUrl: localBaseUrl
  });

  const { buffer, ext } = decodeDataUrl(dataUrl);
  const outputDir = path.resolve(path.dirname(csvFile), 'processed-images');
  await fs.mkdir(outputDir, { recursive: true });

  const outputFileName = `${productIndex + 1}_${row['Item Id'] || slugify(productName)}.${ext}`;
  const outputPath = path.join(outputDir, outputFileName);
  await fs.writeFile(outputPath, buffer);

  console.log('Ảnh tạo xong:', outputPath);
};

main().catch((error) => {
  console.error('Lỗi:', error instanceof Error ? error.message : error);
  process.exit(1);
});
