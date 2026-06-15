/** ID danh mục ngành hàng chuẩn trên trang chủ */
export const INDUSTRY_CATEGORY_IDS = ['1', '2', '3', '4', '5', '6', '7'] as const;

export const INDUSTRY_CATEGORY_NAMES: Record<string, string> = {
  '1': 'Thời Trang Nam',
  '2': 'Mỹ Phẩm',
  '3': 'Đồ Điện Tử',
  '4': 'Đồ Gia Dụng',
  '5': 'Sức Khoẻ',
  '6': 'Mẹ & Bé',
  '7': 'Thời Trang Nữ',
};

export const isIndustryCategoryId = (id?: string | null): boolean =>
  !!id && INDUSTRY_CATEGORY_IDS.includes(id as (typeof INDUSTRY_CATEGORY_IDS)[number]);

/**
 * Tự động phân loại sản phẩm theo tên / từ khóa.
 * Trả về ID danh mục ngành hàng (1–7).
 */
export const autoCategorize = (text: string): string => {
  const lower = text.toLowerCase();

  if (
    lower.includes('váy') || lower.includes('đầm') || lower.includes('chân váy') ||
    lower.includes('yếm') || lower.includes('croptop') || lower.includes('áo bra') ||
    lower.includes('nữ') || lower.includes('bikini') || lower.includes('túi xách nữ')
  ) {
    return '7';
  }
  if (
    lower.includes('nam') || lower.includes('áo thun nam') || lower.includes('sơ mi nam') ||
    lower.includes('polo') || lower.includes('quần nam') || lower.includes('quần tây') ||
    lower.includes('vest nam') || lower.includes('giày nam')
  ) {
    return '1';
  }
  if (
    lower.includes('makeup') || lower.includes('son') || lower.includes('kem') ||
    lower.includes('dưỡng da') || lower.includes('serum') || lower.includes('sữa rửa mặt') ||
    lower.includes('mỹ phẩm') || lower.includes('phấn') || lower.includes('nước hoa') ||
    lower.includes('mascara') || lower.includes('toner')
  ) {
    return '2';
  }
  if (
    lower.includes('điện thoại') || lower.includes('tai nghe') || lower.includes('bluetooth') ||
    lower.includes('sạc') || lower.includes('laptop') || lower.includes('vga') ||
    lower.includes('bàn phím') || lower.includes('loa') || lower.includes('chuột') ||
    lower.includes('smartwatch') || lower.includes('tablet') || lower.includes('camera')
  ) {
    return '3';
  }
  if (
    lower.includes('nồi') || lower.includes('kệ') || lower.includes('bình') ||
    lower.includes('gia dụng') || lower.includes('chảo') || lower.includes('dọn dẹp') ||
    lower.includes('ghế') || lower.includes('bàn') || lower.includes('chổi') ||
    lower.includes('máy xay') || lower.includes('nồi chiên')
  ) {
    return '4';
  }
  if (
    lower.includes('sức khoẻ') || lower.includes('sức khỏe') || lower.includes('thuốc') ||
    lower.includes('bổ') || lower.includes('vitamin') || lower.includes('khẩu trang') ||
    lower.includes('calci') || lower.includes('omega')
  ) {
    return '5';
  }
  if (
    lower.includes('mẹ') || lower.includes('bé') || lower.includes('bỉm') ||
    lower.includes('sữa bột') || lower.includes('trẻ em') || lower.includes('đồ chơi trẻ') ||
    lower.includes('nôi') || lower.includes('xe đẩy')
  ) {
    return '6';
  }
  return '1';
};

/** Chuẩn hóa categoryId: nếu là danh mục shop (store_*) thì phân loại lại theo tên sản phẩm */
export const normalizeCategoryId = (title: string, currentId?: string | null): string => {
  if (isIndustryCategoryId(currentId)) return currentId!;
  return autoCategorize(title);
};
