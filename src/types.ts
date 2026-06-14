export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  image: string;
  videoUrl?: string; // Optional video
  categoryId: string;
  affiliateLink: string;
  platform: 'shopee' | 'tiktok' | 'lazada' | 'other';
  soldCount: number;
  description?: string;
  isSuggested?: boolean; // Flag to indicate if product is featured in user selected "Gợi Ý Hôm nay"
  isDirectProduct?: boolean; // Flag to indicate if product is sold directly by the shop
  postDate?: string; // Added publish date
  attachedOnlineProductId?: string; // Optional attached digital product/gift link
  isDeleted?: boolean; // Soft delete flag
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
}

export interface VisitorStats {
  totalVisitors: number;
  activeUsers: number;
  conversionRate: number;
  popularCategory: string;
}

export interface Buyer {
  fullName: string;
  phoneNumber: string;
  address: string;
  registeredAt: string;
  deviceInfo?: string;
  os?: string;
  browser?: string;
}

export interface SearchQueryTrack {
  query: string;
  count: number;
  lastSearchedAt: string;
  deviceInfo?: string;
}
