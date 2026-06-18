/**
 * Product Verification Utils - Kiểm tra thông tin sản phẩm khớp giữa Shopee và hệ thống
 */

import { fetchShopeeProductDetailsFromUrl } from './shopeeScraper';

export interface VerificationResult {
  status: 'verified' | 'mismatch' | 'error';
  message: string;
  details?: {
    titleMatch: boolean;
    imageMatch: boolean;
    descriptionMatch: boolean;
    linkValid: boolean;
    shopeeTitle?: string;
    shopeeImage?: string;
    shopeeDescription?: string;
  };
}

/**
 * Verify thông tin sản phẩm từ link Shopee
 */
export async function verifyProductInfo(
  shopeeLink: string,
  productTitle: string,
  imageUrl: string,
  description: string
): Promise<VerificationResult> {
  try {
    console.log('🔍 Verifying product:', shopeeLink);

    // Fetch thông tin từ Shopee
    const shopeeData = await fetchShopeeProductDetailsFromUrl(shopeeLink);
    
    if (!shopeeData) {
      return {
        status: 'error',
        message: '❌ Không thể lấy thông tin từ link Shopee. Link có thể không hợp lệ hoặc bị chặn.'
      };
    }

    // So sánh thông tin
    const titleMatch = normalizeText(shopeeData.title).includes(normalizeText(productTitle)) ||
                       normalizeText(productTitle).includes(normalizeText(shopeeData.title));
    
    const imageMatch = imageUrl && shopeeData.mainImage && 
                       (imageUrl.includes(shopeeData.mainImage) || 
                        shopeeData.mainImage.includes(imageUrl) ||
                        isSimilarImage(imageUrl, shopeeData.mainImage));
    
    const descriptionMatch = shopeeData.description && 
                             normalizeText(shopeeData.description).length > 0;

    const linkValid = !!shopeeData.link;

    const mismatches = [];
    if (!titleMatch) mismatches.push('Tên sản phẩm khác');
    if (!imageMatch) mismatches.push('Ảnh sản phẩm khác');
    if (!descriptionMatch) mismatches.push('Mô tả sản phẩm khác');
    if (!linkValid) mismatches.push('Link không hợp lệ');

    const status = mismatches.length === 0 ? 'verified' : 'mismatch';
    const message = status === 'verified'
      ? '✅ Thông tin sản phẩm khớp với Shopee'
      : `⚠️ Phát hiện ${mismatches.length} điểm khác biệt: ${mismatches.join(', ')}`;

    return {
      status,
      message,
      details: {
        titleMatch,
        imageMatch: imageMatch || false,
        descriptionMatch,
        linkValid,
        shopeeTitle: shopeeData.title,
        shopeeImage: shopeeData.mainImage,
        shopeeDescription: shopeeData.description
      }
    };
  } catch (error) {
    console.error('Verification error:', error);
    return {
      status: 'error',
      message: `❌ Lỗi kiểm tra sản phẩm: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Normalize text for comparison
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/[đ]/g, 'd')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Check if two images are similar (by comparing domain/hash)
 */
function isSimilarImage(image1: string, image2: string): boolean {
  try {
    const url1 = new URL(image1);
    const url2 = new URL(image2);

    // If from same domain
    if (url1.hostname === url2.hostname) {
      return true;
    }

    // Extract hash/ID from image URLs
    const hash1 = image1.match(/\/file\/([a-zA-Z0-9_-]+)/)?.[1] || '';
    const hash2 = image2.match(/\/file\/([a-zA-Z0-9_-]+)/)?.[1] || '';

    if (hash1 && hash2 && hash1 === hash2) {
      return true;
    }

    return false;
  } catch (e) {
    return false;
  }
}

/**
 * Generate verification summary
 */
export function generateVerificationSummary(result: VerificationResult): string {
  if (!result.details) {
    return result.message;
  }

  const { titleMatch, imageMatch, descriptionMatch, linkValid } = result.details;

  return `
    Kiểm tra thông tin:
    • Tên sản phẩm: ${titleMatch ? '✅ Khớp' : '❌ Khác'}
    • Ảnh sản phẩm: ${imageMatch ? '✅ Khớp' : '❌ Khác'}
    • Mô tả: ${descriptionMatch ? '✅ Có' : '❌ Không'}
    • Link: ${linkValid ? '✅ Hợp lệ' : '❌ Không hợp lệ'}
  `.trim();
}
