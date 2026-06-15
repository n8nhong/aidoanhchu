/**
 * Simple keyword‑based category mapper.
 * Returns one of the predefined sector strings (tính năng) or "Khác".
 */
export function inferCategory(title: string): string {
  const lower = title.toLowerCase();
  const mapping: Record<string, string[]> = {
    // thời trang nam
    "nam": ["áo nam", "quần nam", "giày nam", "đồ nam", "male", "men"],
    // thời trang nữ
    "nữ": ["áo nữ", "quần nữ", "giày nữ", "đồ nữ", "female", "women"],
    // gia dụng
    "đồ gia dụng": ["bếp", "máy", "nồi", "đồ nấu ăn", "đồ gia dụng", "kitchen", "appliance"],
    // điện tử
    "điện tử": ["tai nghe", "điện thoại", "laptop", "tablet", "camera", "điện tử", "electronics"],
    // mỹ phẩm
    "mỹ phẩm": ["son", "kem", "mỹ phẩm", "cosmetic", "makeup"],
    // đồ chơi trẻ em
    "đồ chơi": ["búp bê", "đồ chơi", "toy", "baby", "kids"]
  };

  for (const [cat, keywords] of Object.entries(mapping)) {
    if (keywords.some(kw => lower.includes(kw))) {
      return cat;
    }
  }
  return "khác";
}
