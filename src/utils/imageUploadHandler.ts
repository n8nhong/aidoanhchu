/**
 * Image Upload Handler - Upload ảnh với Product Binding
 * Đảm bảo ảnh không bị nhầm lẫn giữa các sản phẩm
 */

interface ProductImage {
  id: string;
  productId: string;
  imageHash: string;
  supabaseUrl: string;
  uploadedAt: string;
  metadata: {
    size: number;
    type: string;
    width?: number;
    height?: number;
  };
}

/**
 * Tính SHA256 hash của file (để detect duplicate)
 */
export async function calculateFileHash(file: File | Blob): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Upload ảnh lên Supabase với binding product
 * @param file File ảnh được upload
 * @param productId ID sản phẩm (để bind ảnh)
 * @param supabase Supabase client
 * @param onProgress Callback để track progress (%)
 */
export async function uploadImageWithProductBinding(
  file: File,
  productId: string,
  supabase: any,
  onProgress?: (progress: number, message: string) => void
): Promise<ProductImage> {
  try {
    // 1️⃣ Calculate image hash
    onProgress?.(10, '🔐 Tính hash ảnh...');
    const imageHash = await calculateFileHash(file);

    // 2️⃣ Check duplicate (ngăn upload ảnh giống nhau)
    onProgress?.(20, '🔍 Kiểm tra trùng lặp...');
    const { data: existing, error: queryError } = await supabase
      .from('product_images')
      .select('product_id')
      .eq('image_hash', imageHash)
      .single();

    if (existing) {
      throw new Error(
        `❌ Ảnh này đã được sử dụng cho sản phẩm khác: ${existing.product_id}\n\nĐây là cơ chế bảo vệ để ngăn nhầm ảnh giữa các sản phẩm.`
      );
    }

    // 3️⃣ Upload to Supabase
    onProgress?.(30, '📤 Uploading ảnh lên Supabase...');
    const imageId = `img_${productId}_${Date.now()}`;
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${imageId}.${fileExt}`;
    const filePath = `products/${productId}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, { upsert: false });

    if (uploadError) {
      throw new Error(`Supabase upload error: ${uploadError.message}`);
    }

    onProgress?.(60, '🔗 Lấy URL công khai...');

    // 4️⃣ Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    // 5️⃣ Insert metadata vào database
    onProgress?.(80, '💾 Lưu metadata...');
    const { data: dbData, error: dbError } = await supabase
      .from('product_images')
      .insert([
        {
          id: imageId,
          product_id: productId,
          image_hash: imageHash,
          supabase_url: publicUrl,
          uploaded_at: new Date().toISOString(),
          metadata: {
            size: file.size,
            type: file.type,
            width: 0,
            height: 0
          }
        }
      ])
      .select()
      .single();

    if (dbError) {
      // Cleanup: delete từ storage nếu DB insert fail
      await supabase.storage.from('product-images').remove([filePath]);
      throw new Error(`Database error: ${dbError.message}`);
    }

    onProgress?.(100, '✅ Upload thành công!');

    return {
      id: imageId,
      productId,
      imageHash,
      supabaseUrl: publicUrl,
      uploadedAt: new Date().toISOString(),
      metadata: {
        size: file.size,
        type: file.type
      }
    };
  } catch (error: any) {
    console.error('Upload error:', error);
    throw error;
  }
}

/**
 * Get ảnh của sản phẩm
 */
export async function getProductImages(
  productId: string,
  supabase: any
): Promise<ProductImage[]> {
  const { data, error } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', productId)
    .order('uploaded_at', { ascending: false });

  if (error) {
    console.error('Error fetching product images:', error);
    return [];
  }

  return data || [];
}

/**
 * Delete ảnh của sản phẩm
 */
export async function deleteProductImage(
  imageId: string,
  supabaseUrl: string,
  supabase: any
): Promise<void> {
  try {
    // Extract file path from URL
    const urlParts = supabaseUrl.split('/storage/v1/object/public/product-images/');
    if (urlParts.length < 2) {
      throw new Error('Invalid image URL');
    }

    const filePath = urlParts[1];

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('product-images')
      .remove([filePath]);

    if (storageError) {
      console.warn('Storage deletion warning:', storageError);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId);

    if (dbError) {
      throw new Error(`Database deletion error: ${dbError.message}`);
    }
  } catch (error: any) {
    console.error('Delete image error:', error);
    throw error;
  }
}
