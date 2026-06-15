import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Trả về một instance Supabase đã được cấu hình hợp lệ.
 * Nếu URL hoặc Key chưa được thiết lập hoặc không hợp lệ, sẽ hiển thị cảnh báo và trả về null.
 */
export const getSupabase = (): SupabaseClient | null => {
  const isBrowser = typeof window !== 'undefined';
  const rawUrl = isBrowser ? (localStorage.getItem('supabase_url') || '').trim() : (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const rawKey = isBrowser ? (localStorage.getItem('supabase_key') || '').trim() : (process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();

  if (!rawUrl || !rawKey) {
    if (isBrowser) alert('❌ Vui lòng cấu hình Supabase URL và Key trong tab Hệ thống trước khi sử dụng.');
    return null;
  }

  // Đảm bảo URL đầy đủ dạng https://<PROJECT>.supabase.co
  let url = rawUrl;
  if (!url.startsWith('http')) {
    url = `https://${url}`;
  }
  if (!url.includes('.supabase.co')) {
    // Nếu người dùng chỉ nhập subdomain, bổ sung phần .supabase.co
    url = `${url}.supabase.co`;
  }
  // Loại bỏ dấu '/' thừa ở cuối
  url = url.replace(/\/+$/g, '');

  try {
    return createClient(url, rawKey);
  } catch (e) {
    console.error('Lỗi tạo Supabase client:', e);
    if (isBrowser) alert('❌ Không thể khởi tạo Supabase client. Kiểm tra lại URL và Key.');
    return null;
  }
};
