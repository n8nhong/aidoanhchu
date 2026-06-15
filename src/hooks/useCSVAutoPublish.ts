/**
 * useCSVAutoPublish Hook - Xử lý auto-publish sản phẩm từ file CSV
 * 
 * Tính năng:
 * 1. Đọc file CSV
 * 2. Lấy thông tin chi tiết từ từng link
 * 3. Thay background ảnh
 * 4. Auto-fill form
 * 5. Tự động đăng bài
 */

import { useState, useCallback } from 'react';
import { parseCSV, readCSVFile, parsePrice, ShopeeProduct } from '../utils/csvProcessor';
import { replaceBackground, PRESET_BACKGROUNDS } from '../utils/imageProcessor';
import { createFallbackProduct } from '../utils/shopeeDetailExtractor';

export interface AutoPublishConfig {
  backgroundColor: string;
  autoDescription: boolean;
  autoPriceMarkup: number; // Phần trăm tăng giá (ví dụ: 10 = 10%)
  autoCategory: boolean;
}

export interface AutoPublishProgress {
  current: number;
  total: number;
  status: 'idle' | 'processing' | 'completed' | 'error';
  currentProduct?: string;
  message: string;
}

export const useCSVAutoPublish = () => {
  const [progress, setProgress] = useState<AutoPublishProgress>({
    current: 0,
    total: 0,
    status: 'idle',
    message: ''
  });

  const [config, setConfig] = useState<AutoPublishConfig>({
    backgroundColor: PRESET_BACKGROUNDS.WHITE,
    autoDescription: true,
    autoPriceMarkup: 20,
    autoCategory: true
  });

  /**
   * Đọc và parse file CSV
   */
  const importCSVFile = useCallback(async (file: File): Promise<ShopeeProduct[]> => {
    try {
      setProgress({
        current: 0,
        total: 0,
        status: 'processing',
        message: 'Đang đọc file CSV...'
      });

      const csvContent = await readCSVFile(file);
      const products = parseCSV(csvContent);

      setProgress({
        current: 0,
        total: products.length,
        status: 'processing',
        message: `Đã tìm thấy ${products.length} sản phẩm`
      });

      return products;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Lỗi không xác định';
      setProgress({
        current: 0,
        total: 0,
        status: 'error',
        message: `Lỗi đọc file: ${errorMsg}`
      });
      throw error;
    }
  }, []);

  /**
   * Xử lý từng sản phẩm
   */
  const processProduct = useCallback(
    async (product: ShopeeProduct, index: number) => {
      try {
        setProgress(prev => ({
          ...prev,
          current: index + 1,
          currentProduct: product.itemName,
          message: `Đang xử lý: ${product.itemName.substring(0, 40)}...`
        }));

        // Parse giá
        const price = parsePrice(product.price);
        const markupPrice = Math.round(price * (1 + config.autoPriceMarkup / 100));

        // Tạo dữ liệu sản phẩm
        const productData = {
          title: product.itemName,
          price: markupPrice,
          originalPrice: price,
          image: '', // Sẽ fetch từ Shopee hoặc dùng fallback
          description: product.itemName,
          affiliateLink: product.offerLink || product.productLink,
          categoryId: '1',
          platform: 'shopee' as const,
          sales: parseInt(product.sales.replace(/[^\d]/g, '')) || 0
        };

        return productData;
      } catch (error) {
        console.error(`Lỗi xử lý sản phẩm ${index}:`, error);
        return null;
      }
    },
    [config.autoPriceMarkup]
  );

  /**
   * Batch process tất cả sản phẩm
   */
  const processAllProducts = useCallback(
    async (products: ShopeeProduct[], onProductProcessed?: (product: any) => void) => {
      const results = [];

      for (let i = 0; i < products.length; i++) {
        if (progress.status === 'error') break; // Stop if error occurred

        const processedProduct = await processProduct(products[i], i);
        
        if (processedProduct) {
          results.push(processedProduct);
          
          if (onProductProcessed) {
            onProductProcessed(processedProduct);
          }
        }

        // Delay để avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setProgress(prev => ({
        ...prev,
        status: 'completed',
        message: `✅ Đã xử lý xong ${results.length} sản phẩm!`
      }));

      return results;
    },
    [processProduct, progress.status]
  );

  /**
   * Reset progress
   */
  const resetProgress = useCallback(() => {
    setProgress({
      current: 0,
      total: 0,
      status: 'idle',
      message: ''
    });
  }, []);

  /**
   * Cancel processing
   */
  const cancelProcessing = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      status: 'error',
      message: 'Đã hủy xử lý'
    }));
  }, []);

  return {
    progress,
    config,
    setConfig,
    importCSVFile,
    processProduct,
    processAllProducts,
    resetProgress,
    cancelProcessing
  };
};

/**
 * Hook để quản lý form state
 */
export interface FormState {
  title: string;
  price: number;
  originalPrice: number;
  image: string;
  description: string;
  categoryId: string;
  affiliateLink: string;
  platform: 'shopee' | 'tiktok' | 'lazada';
  videoUrl?: string;
  isSuggested?: boolean;
}

export const useAutoFillForm = () => {
  const [formState, setFormState] = useState<FormState>({
    title: '',
    price: 0,
    originalPrice: 0,
    image: '',
    description: '',
    categoryId: '1',
    affiliateLink: '',
    platform: 'shopee',
    videoUrl: '',
    isSuggested: true
  });

  const fillForm = useCallback((data: Partial<FormState>) => {
    setFormState(prev => ({ ...prev, ...data }));
  }, []);

  const resetForm = useCallback(() => {
    setFormState({
      title: '',
      price: 0,
      originalPrice: 0,
      image: '',
      description: '',
      categoryId: '1',
      affiliateLink: '',
      platform: 'shopee',
      videoUrl: '',
      isSuggested: true
    });
  }, []);

  return {
    formState,
    fillForm,
    resetForm,
    setFormState
  };
};
