/**
 * Image Processing - Xử lý ảnh sản phẩm
 * - Thay background ảnh
 * - Resize ảnh
 * - Thêm watermark
 */

/**
 * Thay background ảnh thành màu solid hoặc gradient
 */
export const replaceBackground = async (
  imageUrl: string,
  backgroundColor: string = '#ffffff'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      // Đặt kích thước canvas
      canvas.width = img.width;
      canvas.height = img.height;

      // Vẽ background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Vẽ ảnh gốc lên (sẽ mất background nếu ảnh gốc đã có background)
      ctx.drawImage(img, 0, 0);

      // Convert canvas thành data URL
      const resultUrl = canvas.toDataURL('image/jpeg', 0.95);
      resolve(resultUrl);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageUrl;
  });
};

/**
 * Thay background bằng hình ảnh khác
 */
export const replaceBackgroundWithImage = async (
  productImageUrl: string,
  backgroundImageUrl: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    const productImg = new Image();
    const bgImg = new Image();
    let loadedCount = 0;

    const onImageLoaded = () => {
      loadedCount++;
      if (loadedCount !== 2) return;

      // Đặt kích thước canvas bằng ảnh sản phẩm
      canvas.width = productImg.width;
      canvas.height = productImg.height;

      // Vẽ background image (scale để fit canvas)
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

      // Vẽ sản phẩm lên trên
      ctx.drawImage(productImg, 0, 0);

      // Convert thành data URL
      const resultUrl = canvas.toDataURL('image/jpeg', 0.95);
      resolve(resultUrl);
    };

    productImg.crossOrigin = 'anonymous';
    bgImg.crossOrigin = 'anonymous';
    
    productImg.onload = onImageLoaded;
    bgImg.onload = onImageLoaded;

    productImg.onerror = () => {
      reject(new Error('Failed to load product image'));
    };

    bgImg.onerror = () => {
      reject(new Error('Failed to load background image'));
    };

    productImg.src = productImageUrl;
    bgImg.src = backgroundImageUrl;
  });
};

/**
 * Resize ảnh
 */
export const resizeImage = async (
  imageUrl: string,
  width: number,
  height: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      const resultUrl = canvas.toDataURL('image/jpeg', 0.95);
      resolve(resultUrl);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageUrl;
  });
};

/**
 * Thêm gradient background
 */
export const addGradientBackground = async (
  imageUrl: string,
  gradientColors: string[] = ['#FFE5E5', '#FFFFFF']
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Tạo gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradientColors.forEach((color, index) => {
        gradient.addColorStop(index / (gradientColors.length - 1), color);
      });

      // Vẽ gradient background
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Vẽ ảnh lên trên
      ctx.drawImage(img, 0, 0);

      const resultUrl = canvas.toDataURL('image/jpeg', 0.95);
      resolve(resultUrl);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageUrl;
  });
};

/**
 * Danh sách background color có sẵn
 */
export const PRESET_BACKGROUNDS = {
  WHITE: '#FFFFFF',
  LIGHT_PINK: '#FFE5E5',
  LIGHT_BLUE: '#E5F2FF',
  LIGHT_YELLOW: '#FFFBE5',
  LIGHT_GREEN: '#E5F9E5',
  LIGHT_PURPLE: '#F5E5FF',
  LIGHT_ORANGE: '#FFE5CC',
  GRADIENT_PINK_WHITE: ['#FFE5E5', '#FFFFFF'],
  GRADIENT_BLUE_WHITE: ['#E5F2FF', '#FFFFFF'],
  GRADIENT_YELLOW_WHITE: ['#FFFBE5', '#FFFFFF'],
};

/**
 * Danh sách background image có sẵn
 */
export const PRESET_BACKGROUND_IMAGES = {
  SOFT_PINK: 'https://images.unsplash.com/photo-1615182736281-e56f6b25f829?auto=format&fit=crop&q=80&w=800',
  SOFT_BLUE: 'https://images.unsplash.com/photo-1620634886369-0341f1f2e47a?auto=format&fit=crop&q=80&w=800',
  GEOMETRIC: 'https://images.unsplash.com/photo-1557672172-298e090d0f80?auto=format&fit=crop&q=80&w=800',
  MINIMAL_WHITE: 'https://images.unsplash.com/photo-1548013146-72ede33f1464?auto=format&fit=crop&q=80&w=800',
};

/**
 * Lấy file từ URL và convert thành File object
 */
export const urlToFile = async (url: string, filename: string): Promise<File> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
};

/**
 * Compress ảnh
 */
export const compressImage = async (
  imageUrl: string,
  quality: number = 0.7
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      const resultUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(resultUrl);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageUrl;
  });
};
