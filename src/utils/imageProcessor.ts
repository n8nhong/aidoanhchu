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
 * Xóa background ảnh sản phẩm bằng Remove.bg API hoặc Canvas detection
 * Giữ nguyên sản phẩm, chỉ xóa background
 */
export const removeBackground = async (
  imageUrl: string,
  removeBackgroundApiKey?: string
): Promise<string> => {
  // Nếu có API key, dùng Remove.bg
  if (removeBackgroundApiKey) {
    try {
      const formData = new FormData();
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      formData.append('image_file', blob);
      formData.append('format', 'auto');

      const removeResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-API-Key': removeBackgroundApiKey
        },
        body: formData
      });

      if (removeResponse.ok) {
        const blob = await removeResponse.blob();
        return URL.createObjectURL(blob);
      }
    } catch (error) {
      console.warn('Remove.bg API failed, falling back to Canvas detection:', error);
    }
  }

  // Fallback: Canvas color threshold detection
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

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Detect background color from corner (usually background)
      const bgColor = {
        r: data[0],
        g: data[1],
        b: data[2],
        a: data[3]
      };

      // Threshold for detecting "same" color (adjust if needed)
      const threshold = 30;

      // Convert similar colors to transparent
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // If color is similar to background color, make it transparent
        if (
          Math.abs(r - bgColor.r) < threshold &&
          Math.abs(g - bgColor.g) < threshold &&
          Math.abs(b - bgColor.b) < threshold
        ) {
          data[i + 3] = 0; // Set alpha to 0 (transparent)
        }
      }

      ctx.putImageData(imageData, 0, 0);

      const resultUrl = canvas.toDataURL('image/png');
      resolve(resultUrl);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageUrl;
  });
};

/**
 * Ghép sản phẩm (đã tách nền) lên ảnh cảnh nền, căn giữa và scale vừa khung.
 */
const compositeProductOnScene = async (
  transparentProductUrl: string,
  sceneImageUrl: string,
  outputSize: number = 800
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    const productImg = new Image();
    const sceneImg = new Image();
    let loadedCount = 0;

    const onImageLoaded = () => {
      loadedCount++;
      if (loadedCount !== 2) return;

      canvas.width = outputSize;
      canvas.height = outputSize;

      // Vẽ nền cảnh (cover)
      const bgRatio = sceneImg.width / sceneImg.height;
      const canvasRatio = 1;
      let sx = 0, sy = 0, sw = sceneImg.width, sh = sceneImg.height;
      if (bgRatio > canvasRatio) {
        sw = sceneImg.height;
        sx = (sceneImg.width - sw) / 2;
      } else {
        sh = sceneImg.width;
        sy = (sceneImg.height - sh) / 2;
      }
      ctx.drawImage(sceneImg, sx, sy, sw, sh, 0, 0, outputSize, outputSize);

      // Vẽ sản phẩm căn giữa, chiếm ~82% khung
      const maxW = outputSize * 0.82;
      const maxH = outputSize * 0.82;
      const scale = Math.min(maxW / productImg.width, maxH / productImg.height);
      const w = productImg.width * scale;
      const h = productImg.height * scale;
      const x = (outputSize - w) / 2;
      const y = (outputSize - h) / 2;
      ctx.drawImage(productImg, x, y, w, h);

      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };

    productImg.crossOrigin = 'anonymous';
    sceneImg.crossOrigin = 'anonymous';
    productImg.onload = onImageLoaded;
    sceneImg.onload = onImageLoaded;
    productImg.onerror = () => reject(new Error('Failed to load product image'));
    sceneImg.onerror = () => reject(new Error('Failed to load scene background'));

    productImg.src = transparentProductUrl;
    sceneImg.src = sceneImageUrl;
  });
};

/**
 * Giữ nguyên sản phẩm gốc, xóa nền cũ và đặt lên cảnh phù hợp ngành hàng.
 */
export const processProductImageWithSceneBackground = async (
  imageUrl: string,
  sceneImageUrl: string,
  removeBackgroundApiKey?: string
): Promise<string> => {
  try {
    const transparentImageUrl = await removeBackground(imageUrl, removeBackgroundApiKey);
    return await compositeProductOnScene(transparentImageUrl, sceneImageUrl);
  } catch (error) {
    console.error('Error processing product image with scene:', error);
    return imageUrl;
  }
};

/**
 * Xóa background và thay nền mới (giữ nguyên sản phẩm)
 */
export const processProductImageWithNewBackground = async (
  imageUrl: string,
  backgroundColor: string = '#FFFFFF',
  removeBackgroundApiKey?: string
): Promise<string> => {
  try {
    // 1️⃣ Remove background
    const transparentImageUrl = await removeBackground(imageUrl, removeBackgroundApiKey);

    // 2️⃣ Create new canvas with background color + transparent product
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      const productImg = new Image();
      productImg.crossOrigin = 'anonymous';

      productImg.onload = () => {
        canvas.width = productImg.width;
        canvas.height = productImg.height;

        // Draw background color
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw product image on top (with transparency)
        ctx.drawImage(productImg, 0, 0);

        const resultUrl = canvas.toDataURL('image/jpeg', 0.95);
        resolve(resultUrl);
      };

      productImg.onerror = () => {
        reject(new Error('Failed to load product image'));
      };

      productImg.src = transparentImageUrl;
    });
  } catch (error) {
    console.error('Error processing product image:', error);
    // Fallback: return original image
    return imageUrl;
  }
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
 * Convert data URL (base64) thành File object
 */
export const dataUrlToFile = (dataUrl: string, filename: string): File => {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
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
