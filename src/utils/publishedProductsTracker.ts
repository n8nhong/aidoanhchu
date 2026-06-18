/**
 * Published Products Tracker - Lưu và kiểm tra sản phẩm đã đăng
 * Giúp tránh lặp đăng và verify thông tin sản phẩm
 */

export interface PublishedProduct {
  id: string;
  csvSource: string; // Tên file CSV hoặc URL
  productName: string;
  shopeeLink: string; // Link gốc từ CSV
  affiliateLink: string; // Link affiliate được tạo
  imageUrl: string;
  description: string;
  price: number;
  originalPrice: number;
  categoryId: string;
  publishedAt: string;
  status: 'success' | 'failed' | 'pending_verify'; // pending_verify: lưu nhưng chưa verify
  verificationStatus?: 'verified' | 'mismatch' | 'not_checked'; // Kiểm tra link vs mô tả vs ảnh
  verificationMessage?: string;
  shopeeProductTitle?: string;
  shopeeProductImage?: string;
  shopeeProductDescription?: string;
}

// Store published products in localStorage + in-memory
const STORAGE_KEY = 'published_products_tracker';

export class PublishedProductsTracker {
  private products: PublishedProduct[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      this.products = data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Error loading published products:', e);
      this.products = [];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.products));
    } catch (e) {
      console.warn('Error saving published products:', e);
    }
  }

  /**
   * Thêm sản phẩm đã đăng
   */
  addPublishedProduct(product: PublishedProduct) {
    const existing = this.products.find(
      p => p.shopeeLink === product.shopeeLink && p.csvSource === product.csvSource
    );

    if (existing) {
      console.log('Product already tracked:', product.productName);
      return;
    }

    this.products.push({
      ...product,
      id: `pub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      publishedAt: new Date().toISOString()
    });

    this.saveToStorage();
  }

  /**
   * Kiểm tra sản phẩm có đã đăng chưa
   */
  isProductPublished(shopeeLink: string, csvSource?: string): boolean {
    return this.products.some(p => 
      p.shopeeLink === shopeeLink && (!csvSource || p.csvSource === csvSource)
    );
  }

  /**
   * Lấy sản phẩm đã đăng
   */
  getPublishedProduct(shopeeLink: string, csvSource?: string): PublishedProduct | undefined {
    return this.products.find(p =>
      p.shopeeLink === shopeeLink && (!csvSource || p.csvSource === csvSource)
    );
  }

  /**
   * Lấy tất cả sản phẩm từ một CSV source
   */
  getProductsBySource(csvSource: string): PublishedProduct[] {
    return this.products.filter(p => p.csvSource === csvSource);
  }

  /**
   * Lấy tất cả sản phẩm chưa verify
   */
  getUnverifiedProducts(): PublishedProduct[] {
    return this.products.filter(
      p => !p.verificationStatus || p.verificationStatus === 'mismatch'
    );
  }

  /**
   * Update verification status
   */
  updateVerificationStatus(
    productId: string,
    status: 'verified' | 'mismatch' | 'not_checked',
    message?: string,
    shopeeInfo?: {
      title?: string;
      image?: string;
      description?: string;
    }
  ) {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      product.verificationStatus = status;
      product.verificationMessage = message;
      if (shopeeInfo) {
        product.shopeeProductTitle = shopeeInfo.title;
        product.shopeeProductImage = shopeeInfo.image;
        product.shopeeProductDescription = shopeeInfo.description;
      }
      this.saveToStorage();
    }
  }

  /**
   * Lấy tất cả sản phẩm
   */
  getAllProducts(): PublishedProduct[] {
    return this.products;
  }

  /**
   * Xóa sản phẩm
   */
  deleteProduct(productId: string) {
    this.products = this.products.filter(p => p.id !== productId);
    this.saveToStorage();
  }

  /**
   * Xóa tất cả từ một CSV source
   */
  deleteBySource(csvSource: string) {
    this.products = this.products.filter(p => p.csvSource !== csvSource);
    this.saveToStorage();
  }

  /**
   * Clear all
   */
  clear() {
    this.products = [];
    localStorage.removeItem(STORAGE_KEY);
  }
}

// Singleton instance
let instance: PublishedProductsTracker | null = null;

export const getTrackerInstance = (): PublishedProductsTracker => {
  if (!instance) {
    instance = new PublishedProductsTracker();
  }
  return instance;
};
