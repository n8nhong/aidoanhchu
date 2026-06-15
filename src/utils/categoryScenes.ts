/**
 * Ảnh nền cảnh phù hợp theo từng ngành hàng (Unsplash, miễn phí dùng CDN).
 * Dùng khi ghép sản phẩm gốc lên nền mới.
 */
export const CATEGORY_SCENE_BACKGROUNDS: Record<string, string> = {
  '1': 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=800', // Cửa hàng thời trang nam
  '7': 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=800', // Boutique thời trang nữ
  '2': 'https://images.unsplash.com/photo-1596462502278-27bfdd403348?auto=format&fit=crop&q=80&w=800', // Bàn trang điểm / mỹ phẩm
  '3': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800', // Bàn làm việc công nghệ
  '4': 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&q=80&w=800', // Nhà bếp hiện đại
  '5': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800', // Wellness / sức khỏe
  '6': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=800', // Phòng trẻ em
};

export const getSceneBackgroundForCategory = (categoryId: string): string =>
  CATEGORY_SCENE_BACKGROUNDS[categoryId] || CATEGORY_SCENE_BACKGROUNDS['1'];
