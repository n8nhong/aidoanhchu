import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Product, Category, VisitorStats, Buyer, SearchQueryTrack } from '../types';
import { MOCK_STATS } from '../mockData';
import { formatCurrency, setItemResilient, compressImage } from '../utils';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  Lightbulb, 
  Megaphone, 
  Percent,
  PlusCircle,
  PackageSearch,
  Trash2,
  Star,
  LogOut,
  Sparkles,
  Shirt,
  Smartphone,
  Home,
  HeartPulse,
  Baby,
  ShoppingBag,
  Plus,
  ExternalLink,
  MessageSquare,
  Edit2,
  XCircle,
  Search,
  MapPin,
  Calendar,
  Sparkle,
  Loader2,
  Upload,
  Image,
  Play,
  Video,
  Facebook,
  Link2,
  Globe,
  Key,
  QrCode,
  Copy,
  Share2,
  Edit3,
  FileEdit,
  Database,
  ShieldCheck,
  Wand2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getSlidesForTopic } from '../utils/giftSlidesData';

// compressImage is now imported from ../utils

interface AdminDashboardProps {
  products: Product[];
  categories: Category[];
  onSetCategories?: React.Dispatch<React.SetStateAction<Category[]>>;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onToggleSuggest: (id: string) => void;
  onUpdateProduct: (product: Product) => void; // Cho phép sửa sản phẩm (đổi link, lưu link)
  onLogout: () => void;
  adminRole: 'super' | 'client';
  buyers: Buyer[]; // Danh sách thông tin khách đăng ký
  searchTracks: SearchQueryTrack[]; // Lịch sử tìm kiếm của khách
  onClearAllProducts: () => void;
  onClearAllBuyers: () => void;
  onClearSearchTracks: () => void;
  giftMaterials: any[];
  onSetGiftMaterials: React.Dispatch<React.SetStateAction<any[]>>;
  giftCampaigns: any[];
  onSetGiftCampaigns: React.Dispatch<React.SetStateAction<any[]>>;
  giftClaimLink: string;
  onSetGiftClaimLink: React.Dispatch<React.SetStateAction<string>>;
  geminiKeys: any[];
  onSetGeminiKeys: React.Dispatch<React.SetStateAction<any[]>>;
  guaranteedWinSpins: number;
  onSetGuaranteedWinSpins: React.Dispatch<React.SetStateAction<number>>;
}

const CATEGORY_ICONS: Record<string, any> = {
  Shirt,
  ShoppingBag,
  Sparkles,
  Smartphone,
  Home,
  HeartPulse,
  Baby
};

// Automatic Categorizer based on title words or link keywords
const autoCategorize = (text: string): string => {
  const lower = text.toLowerCase();
  if (lower.includes('váy') || lower.includes('đầm') || lower.includes('chân váy') || lower.includes('yếm') || lower.includes('nữ') || lower.includes('croptop')) {
    return '7'; // Thời Trang Nữ (id 7)
  }
  if (lower.includes('nam') || lower.includes('áo thun nam') || lower.includes('sơ mi nam') || lower.includes('polo') || lower.includes('quần nam') || lower.includes('quần tây')) {
    return '1'; // Thời Trang Nam (id 1)
  }
  if (lower.includes('makeup') || lower.includes('son') || lower.includes('kem') || lower.includes('dưỡng da') || lower.includes('serum') || lower.includes('sữa rửa mặt') || lower.includes('mỹ phẩm') || lower.includes('phấn')) {
    return '2'; // Mỹ Phẩm (id 2)
  }
  if (lower.includes('điện thoại') || lower.includes('tai nghe') || lower.includes('bluetooth') || lower.includes('sạc') || lower.includes('laptop') || lower.includes('vga') || lower.includes('bàn phím') || lower.includes('loa') || lower.includes('chuột')) {
    return '3'; // Đồ Điện Tử (id 3)
  }
  if (lower.includes('nồi') || lower.includes('kệ') || lower.includes('bình') || lower.includes('gia dụng') || lower.includes('chảo') || lower.includes('dọn dẹp') || lower.includes('ghế') || lower.includes('bàn') || lower.includes('chổi')) {
    return '4'; // Đồ Gia Dụng (id 4)
  }
  if (lower.includes('sức khoẻ') || lower.includes('thuốc') || lower.includes('bổ') || lower.includes('vitamin') || lower.includes('khẩu trang') || lower.includes('calci')) {
    return '5'; // Sức Khoẻ (id 5)
  }
  if (lower.includes('mẹ') || lower.includes('bé') || lower.includes('bỉm') || lower.includes('sữa') || lower.includes('trẻ') || lower.includes('đồ chơi')) {
    return '6'; // Mẹ & Bé (id 6)
  }
  return '1'; // Trả về mặc định
};

export function AdminDashboard({ 
  products, 
  categories, 
  onSetCategories,
  onAddProduct, 
  onDeleteProduct, 
  onToggleSuggest,
  onUpdateProduct,
  onLogout,
  adminRole,
  buyers,
  searchTracks,
  onClearAllProducts,
  onClearAllBuyers,
  onClearSearchTracks,
  giftMaterials,
  onSetGiftMaterials,
  giftCampaigns,
  onSetGiftCampaigns,
  giftClaimLink,
  onSetGiftClaimLink,
  geminiKeys,
  onSetGeminiKeys,
  guaranteedWinSpins,
  onSetGuaranteedWinSpins
}: AdminDashboardProps) {
  const stats = MOCK_STATS;

  // Active sub-tab in admin panel
  const [adminTab, setAdminTab] = useState<'listings' | 'analytics' | 'social' | 'online_campaigns' | 'gemini_keys' | 'licenses' | 'database'>('listings');

  const [licenses, setLicenses] = useState<any[]>([]);
  const [newLicenseName, setNewLicenseName] = useState('');
  const [showPublicLinkModal, setShowPublicLinkModal] = useState(false);
  
  // Gift Distribution Modal States
  const [showDistrModal, setShowDistrModal] = useState(false);
  const [distrProduct, setDistrProduct] = useState<any>(null);
  const [distrIsShowOnHome, setDistrIsShowOnHome] = useState(false);
  const [distrIsPublic, setDistrIsPublic] = useState(true);
  const [distrBuyers, setDistrBuyers] = useState<string[]>([]);
  
  // Custom Brand State
  const [adminBrandName, setAdminBrandName] = useState(() => localStorage.getItem('custom_brand') || 'AffiliShop');
  const [newLicenseBrandName, setNewLicenseBrandName] = useState('');
  
  // Edit Online Product Modal States
  const [showEditOpModal, setShowEditOpModal] = useState(false);
  const [editOpData, setEditOpData] = useState<any>(null);
  const [isEditHtmlFullscreen, setIsEditHtmlFullscreen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwOld, setPwOld] = useState('');
  const [pwNew, setPwNew] = useState('');
  
  // Database Supabase States
  const [dbSupabaseUrl, setDbSupabaseUrl] = useState(() => localStorage.getItem('supabase_url') || 'https://encpsaatojnxgyjjcvnx.supabase.co');
  const [dbSupabaseKey, setDbSupabaseKey] = useState(() => localStorage.getItem('supabase_key') || '');

  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    let url = (dbSupabaseUrl.trim() || localStorage.getItem('supabase_url') || '') as string;
    const key = (dbSupabaseKey.trim() || localStorage.getItem('supabase_key')) as string;
    if (!url || !key) {
      alert("Vui lòng cấu hình Supabase URL và Key ở tab Hệ Thống trước khi upload ảnh.");
      return null;
    }
    if (!url.startsWith('http') && !url.includes('.')) url = `https://${url}.supabase.co`;
    const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;

    try {
      const supabase = createClient(cleanUrl, key);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (error) {
        console.error("Lỗi upload Supabase:", error);
        alert("Lỗi upload ảnh lên Cloud: " + error.message);
        return null;
      }

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (e: any) {
      console.error(e);
      alert("Lỗi kết nối upload: " + e.message);
      return null;
    }
  };
  
  const fetchLicenses = async () => {
    try {
      const saved = localStorage.getItem('affili_licenses_store');
      if (saved) {
        setLicenses(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  };
  
  const openDistrModal = (product: any) => {
    setDistrProduct(product);
    setDistrIsShowOnHome(product.isShowOnHome || false);
    setDistrIsPublic(product.isPubliclyClaimable !== false);
    setDistrBuyers(product.allowedBuyerIds || []);
    setShowDistrModal(true);
  };
  
  // Notice we use state updater function but we need to update onlineProducts list
  // which is initialized further down. We'll update the global localStorage manually 
  // and trigger a custom event or let React state catch up. Wait, onlineProducts 
  // is defined further below. I'll define handleSaveDistr where onlineProducts is.
  useEffect(() => {
    const fetchGlobalDbConfig = async () => {
      if (!localStorage.getItem('supabase_key')) {
        try {
          const configRes = await fetch('/api/db-config');
          if (configRes.ok) {
            const config = await configRes.json();
            if (config.key) {
              setDbSupabaseKey(config.key);
              setDbSupabaseUrl(config.url || 'https://encpsaatojnxgyjjcvnx.supabase.co');
              localStorage.setItem('supabase_key', config.key);
              localStorage.setItem('supabase_url', config.url || 'https://encpsaatojnxgyjjcvnx.supabase.co');
            }
          }
        } catch(e) {}
      }
    };
    fetchGlobalDbConfig();
  }, []);

  useEffect(() => {
    if (adminRole === 'super' && adminTab === 'licenses') {
      fetchLicenses();
    }
  }, [adminRole, adminTab]);

  const handleCreateLicense = async () => {
    try {
      const id = 'LIC-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      const newLicense = {
        id,
        customerName: newLicenseName || "Khách Vãng Lai",
        maxDevices: 3,
        devices: [],
        status: 'active' as const,
        createdAt: new Date().toISOString()
      };
      
      const updatedLicenses = [newLicense, ...licenses];
      setLicenses(updatedLicenses);
      localStorage.setItem('affili_licenses_store', JSON.stringify(updatedLicenses));
      
      setNewLicenseName('');
      let link = `${window.location.origin}/?license=${id}`;
      if (newLicenseBrandName.trim()) {
        link += `&brand=${encodeURIComponent(newLicenseBrandName.trim())}`;
      }
      setNewLicenseBrandName('');
      alert(`✅ Đã tạo Giấy phép mới thành công!\nLink giao cho khách: ${link}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleLicense = async (id: string) => {
    try {
      const updatedLicenses = licenses.map(lic => {
        if (lic.id === id) {
          return { ...lic, status: lic.status === 'active' ? 'paused' : 'active' };
        }
        return lic;
      });
      setLicenses(updatedLicenses);
      localStorage.setItem('affili_licenses_store', JSON.stringify(updatedLicenses));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteLicense = async (id: string) => {
    if (!confirm('Bạn có chắc xoá giấy phép này? Khách hàng sẽ bị thu hồi quyền truy cập ngay lập tức.')) return;
    try {
      const updatedLicenses = licenses.filter(lic => lic.id !== id);
      setLicenses(updatedLicenses);
      localStorage.setItem('affili_licenses_store', JSON.stringify(updatedLicenses));
    } catch (e) {
      console.error(e);
    }
  };

  // Multi-key form variables
  const [newKeyVal, setNewKeyVal] = useState('');
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [testingKeyId, setTestingKeyId] = useState<string | null>(null);

  const handleAddKey = () => {
    if (!newKeyVal.trim()) {
      setErrorMsg('Vui lòng điền mã Khóa API!');
      setTimeout(() => setErrorMsg(''), 5000);
      return;
    }
    const safeKeys = geminiKeys || [];
    const alreadyExists = safeKeys.some((k: any) => k.key === newKeyVal.trim());
    if (alreadyExists) {
      setErrorMsg('Khóa API này đã tồn tại trong danh sách.');
      setTimeout(() => setErrorMsg(''), 5000);
      return;
    }

    const newKeyObj = {
      id: 'key_' + Date.now(),
      key: newKeyVal.trim(),
      label: newKeyLabel.trim() || `Khóa Gemini ${safeKeys.length + 1}`,
      status: 'unchecked',
      isActive: safeKeys.length === 0
    };

    onSetGeminiKeys(prev => [...(prev || []), newKeyObj]);
    setNewKeyVal('');
    setNewKeyLabel('');
  };

  const handleDeleteKey = (id: string) => {
    if (window.confirm('Bạn có thực sự muốn xóa khóa API này?')) {
      onSetGeminiKeys(prev => {
        const next = prev.filter(k => k.id !== id);
        if (next.length > 0 && !next.some(k => k.isActive)) {
          next[0].isActive = { ...next[0], isActive: true }.isActive; // Toggle first key to active
        }
        return next.map((keyIt, index) => {
          if (index === 0 && !next.some(k => k.isActive)) {
            return { ...keyIt, isActive: true };
          }
          return keyIt;
        });
      });
    }
  };

  const handleSetActiveKey = (id: string) => {
    onSetGeminiKeys(prev => prev.map(k => ({
      ...k,
      isActive: k.id === id
    })));
  };

  const handleTestKey = async (id: string, keyVal: string) => {
    setTestingKeyId(id);
    try {
      const response = await fetch('/api/gemini/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: keyVal })
      });
      const data = await response.json();
      if (response.ok && data.valid) {
        onSetGeminiKeys(prev => prev.map(k => k.id === id ? { ...k, status: 'valid', error: data.error } : k));
        setSuccessMsg(data.error ? '✅ ' + data.error : '✅ Kết nối thành công! Khóa API này hợp lệ và sẵn sàng hoạt động.');
        setTimeout(() => setSuccessMsg(''), 5000);
      } else {
        const errorMsg = data.error || 'Khóa không hoạt động hoặc không chính xác.';
        onSetGeminiKeys(prev => prev.map(k => k.id === id ? { ...k, status: 'invalid', error: errorMsg } : k));
        setErrorMsg('❌ Kiểm tra thất bại: ' + errorMsg);
        setTimeout(() => setErrorMsg(''), 5000);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Lỗi mạng không thể liên kết.';
      onSetGeminiKeys(prev => prev.map(k => k.id === id ? { ...k, status: 'invalid', error: errorMsg } : k));
      setErrorMsg('❌ Lỗi kết nối mạng: ' + errorMsg);
      setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setTestingKeyId(null);
    }
  };

  // New Product Form State
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [image, setImage] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '1');
  const [affiliateLink, setAffiliateLink] = useState('');
  const [platform, setPlatform] = useState<Product['platform']>('shopee');
  const [description, setDescription] = useState('');
  const [isSuggested, setIsSuggested] = useState(false);
  const [isDirectProduct, setIsDirectProduct] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [postDate, setPostDate] = useState('');
  const [attachedOnlineProductId, setAttachedOnlineProductId] = useState('');
  const [searchBuyerQuery, setSearchBuyerQuery] = useState('');
  const [adminFacebook, setAdminFacebook] = useState(() => localStorage.getItem('admin_facebook') || 'https://facebook.com/vietnam.affiliates');
  const [adminZalo, setAdminZalo] = useState(() => localStorage.getItem('admin_zalo') || 'https://zalo.me/0981234567');
  const [adminTiktok, setAdminTiktok] = useState(() => localStorage.getItem('admin_tiktok') || '@giamgia_tiktok');

  // Social Links management states
  const [socials, setSocials] = useState(() => {
    try {
      const saved = localStorage.getItem('affili_social_channels');
      if (saved && saved !== 'undefined') return JSON.parse(saved);
    } catch (e) {
      console.error("Error parsing affili_social_channels in AdminDashboard", e);
    }
    return {
      facebooks: ['https://facebook.com/vietnam.affiliates', 'https://facebook.com/groups/shopee.sales'],
      zalos: ['https://zalo.me/0981234567', 'https://zalo.me/g/zaloshopping'],
      tiktoks: ['https://tiktok.com/@giamgia_tiktok', 'https://tiktok.com/@shopee_live_deals'],
      shopees: ['https://shopee.vn/my_outlet_store', 'https://shopee.vn/uu_dai_shopee']
    };
  });

  const [inputFb, setInputFb] = useState('');
  const [inputZalo, setInputZalo] = useState('');
  const [inputTiktok, setInputTiktok] = useState('');
  const [inputShopee, setInputShopee] = useState('');

  // Online Products list management
  const [onlineProducts, setOnlineProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('affili_online_products');
      if (saved && saved !== 'undefined') return JSON.parse(saved);
    } catch (e) {
      console.error("Error parsing affili_online_products in AdminDashboard", e);
    }
    return [];
  });

  // Online product creation form states
  const [opTitle, setOpTitle] = useState('');
  const [opType, setOpType] = useState('mienphi');
  const [opPrice, setOpPrice] = useState<number>(0);
  const [opOriginalPrice, setOpOriginalPrice] = useState<number>(0);
  const [opDownloadUrl, setOpDownloadUrl] = useState('');

  // AI report states
  const [reportLoading, setReportLoading] = useState(false);
  const [aiReport, setAiReport] = useState<any>(null);
  const [scheduleType, setScheduleType] = useState('hang_ngay'); // hang_ngay, hang_tuan, dinh_ky

  const saveSocials = (channels: any) => {
    setSocials(channels);
    setItemResilient('affili_social_channels', JSON.stringify(channels));
  };

  const saveOnlineProducts = (items: any[]) => {
    setOnlineProducts(items);
    setItemResilient('affili_online_products', JSON.stringify(items));
    // Also dispatch event for cross-component sync
    window.dispatchEvent(new Event('storage'));
    
    // Push API to Supabase Cloud
    const pushCloud = async () => {
      let url = localStorage.getItem('supabase_url') || 'https://encpsaatojnxgyjjcvnx.supabase.co';
      let key = localStorage.getItem('supabase_key');
      if (!key) {
        try {
          const configRes = await fetch('/api/db-config');
          if (configRes.ok) {
            const config = await configRes.json();
            if (config.key) {
              key = config.key;
              if (config.url) url = config.url;
            }
          }
        } catch (e) {}
      }
      
      if (url && key) {
        try {
          // Delete missing ones
          const idsToKeep = ['__SITE_CONFIG__', ...items.map(i => i.id)];
          const joinedIds = idsToKeep.join(',');
          await fetch(`${url}/rest/v1/online_products?id=not.in.(${joinedIds})`, {
            method: 'DELETE',
            headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
          }).catch(e => console.error("Cloud purge error", e));

          const tryPush = async (payloadItems: any[]) => {
            // Chunk items to allow "thoải mái số lượng" without hitting Supabase payload limits
            const chunkSize = 20;
            for (let i = 0; i < payloadItems.length; i += chunkSize) {
              const chunk = payloadItems.slice(i, i + chunkSize);
              const res = await fetch(`${url}/rest/v1/online_products?on_conflict=id`, {
                method: 'POST',
                headers: { 
                  'apikey': key, 
                  'Authorization': `Bearer ${key}`,
                  'Content-Type': 'application/json',
                  'Prefer': 'resolution=merge-duplicates'
                },
                body: JSON.stringify(chunk)
              });
              if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText);
              }
            }
          };

          if (items.length > 0) {
            try {
              await tryPush(items.map(item => ({
                 id: item.id,
                 title: item.title || '',
                 type: item.type || null,
                 price: item.price || 0,
                 originalPrice: item.originalPrice || 0,
                 isFree: item.isFree !== undefined ? item.isFree : false,
                 downloadUrl: item.downloadUrl || null,
                 htmlContent: item.htmlContent || null,
                 isShowOnHome: item.isShowOnHome !== undefined ? item.isShowOnHome : false,
                 isSystemGenerated: item.isSystemGenerated !== undefined ? item.isSystemGenerated : false,
                 isPubliclyClaimable: item.isPubliclyClaimable !== undefined ? item.isPubliclyClaimable : true,
                 allowedBuyerIds: item.allowedBuyerIds || null
              })));
            } catch (e: any) {
              const msg = e.message || String(e);
              if (msg.includes("Could not find the") && msg.includes("column")) {
                await tryPush(items.map(item => ({
                   id: item.id,
                   title: item.title || '',
                   type: item.type || null,
                   price: item.price || 0,
                   originalprice: item.originalPrice || 0,
                   isfree: item.isFree !== undefined ? item.isFree : false,
                   downloadurl: item.downloadUrl || null,
                   htmlcontent: item.htmlContent || null,
                   isshowonhome: item.isShowOnHome !== undefined ? item.isShowOnHome : false,
                   issystemgenerated: item.isSystemGenerated !== undefined ? item.isSystemGenerated : false,
                   ispubliclyclaimable: item.isPubliclyClaimable !== undefined ? item.isPubliclyClaimable : true,
                   allowedbuyerids: item.allowedBuyerIds || null
                })));
              } else {
                throw e;
              }
            }
          }
        } catch (e) {
          console.error('Failed to sync onlineProducts to cloud', e);
        }
      }
    };
    pushCloud();
  };

  const handleSaveDistr = () => {
    if (!distrProduct) return;
    const updated = onlineProducts.map((op: any) => {
      if (op.id === distrProduct.id) {
        return {
          ...op,
          isShowOnHome: distrIsShowOnHome,
          isPubliclyClaimable: distrIsPublic,
          allowedBuyerIds: distrIsPublic ? [] : distrBuyers
        };
      }
      return op;
    });
    saveOnlineProducts(updated);
    setShowDistrModal(false);
  };

  const openEditOpModal = (product: any) => {
    setEditOpData({ ...product });
    setShowEditOpModal(true);
  };

  const handleSaveEditOp = () => {
    if (!editOpData) return;
    const updated = onlineProducts.map((op: any) => {
      if (op.id === editOpData.id) {
        return {
          ...op,
          ...editOpData,
          price: Number(editOpData.price) || 0,
          originalPrice: Number(editOpData.originalPrice) || 0
        };
      }
      return op;
    });
    saveOnlineProducts(updated);
    setShowEditOpModal(false);
  };

  const handleResumeAIEdit = (product: any) => {
    if (product.rawSlides && product.rawSlides.length > 0) {
      setGenTopic('custom');
      setGenCustomTopicName(product.title);
      setGenAuthor(product.originalAuthor || genAuthor);
      setGenValue(product.originalPrice || genValue);
      setCurrentCustomSlides(product.rawSlides);
      setGenLength(product.rawSlides.length);
      setShowEditOpModal(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      alert("Đã tải tài liệu vào hệ thống AI bên trên. Vui lòng kéo lên phần [Tự Động Biên Soạn & Tạo Tài Liệu] để tiếp tục sửa trang, yêu cầu AI viết lại, hoặc thêm/xóa nội dung.");
    } else {
      alert("Tài liệu này không chứa dữ liệu bộ khung AI ban đầu (có thể do được tạo trước bản cập nhật này). Không thể chỉnh sửa bằng AI.");
    }
  };

  // State variables for auto document generator
  const [genTopic, setGenTopic] = useState('affiliate_guide');
  const [genAuthor, setGenAuthor] = useState('Hệ thống Tiếp thị Liên Kết Thông Minh');
  const [genValue, setGenValue] = useState(250000);
  const [genCustomTopicName, setGenCustomTopicName] = useState('');
  const [genCustomTopicContentSuggested, setGenCustomTopicContentSuggested] = useState('');
  const [genLength, setGenLength] = useState(15);
  const [genAspectRatio, setGenAspectRatio] = useState('16:9');
  const [giftDocLoading, setGiftDocLoading] = useState(false);
  const [currentCustomSlides, setCurrentCustomSlides] = useState<any[]>([]);
  const [currentGiftDocTitle, setCurrentGiftDocTitle] = useState('');
  const [currentGiftDocCat, setCurrentGiftDocCat] = useState('');
  const [generatingImageIdxs, setGeneratingImageIdxs] = useState<Record<number, boolean>>({});

  const handleGenerateAIImageForSlide = async (sIdx: number) => {
    const slide = currentCustomSlides[sIdx];
    if (!slide) return;

    setGeneratingImageIdxs(prev => ({ ...prev, [sIdx]: true }));
    try {
      const activeKeyObj = geminiKeys?.find((k: any) => k.isActive) || geminiKeys?.[0];
      const fetchHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
      if (activeKeyObj && activeKeyObj.key) {
        fetchHeaders['x-gemini-key'] = activeKeyObj.key;
      }

      const response = await fetch('/api/gemini/generate-slide-image', {
        method: 'POST',
        headers: fetchHeaders,
        body: JSON.stringify({
          title: slide.title,
          subtitle: slide.subtitle,
          p1: slide.p1
        })
      });

      if (!response.ok) {
        let errData;
        try { errData = await response.json(); } catch(e) {}
        throw new Error(errData?.error || `Lỗi máy chủ AI: ${response.status}`);
      }

      const data = await response.json();
      const imageUrl = data.imageUrl;

      if (!imageUrl) {
        throw new Error("Không lấy được link ảnh AI từ máy chủ.");
      }

      const updated = [...currentCustomSlides];
      updated[sIdx].image = imageUrl;
      setCurrentCustomSlides(updated);

      packageAndSaveSlides(updated, currentGiftDocTitle || 'Tài Liệu Quà Tặng', currentGiftDocCat || 'Quà Tặng VIP', genAuthor, genValue);

    } catch (err: any) {
      console.error("Lỗi AI tạo ảnh slide:", err);
      alert(`Lỗi khi tạo ảnh bằng AI: ${err.message || 'vui lòng kiểm tra lại cấu hình.'}`);
    } finally {
      setGeneratingImageIdxs(prev => ({ ...prev, [sIdx]: false }));
    }
  };

  const packageAndSaveSlides = (slides: any[], title: string, category: string, author: string, value: number) => {
    // Build the dynamic components
    const sidebarItems = slides.map((s, idx) => `
      <button class="sidebar-item w-full text-left px-3.5 py-3 rounded-lg text-[13px] font-medium transition-all border-l-4 border-transparent hover:bg-slate-50 flex items-start gap-2 select-none">
        <span class="font-mono text-indigo-400 text-xs mt-0.5 font-bold">${(idx + 1).toString().padStart(2, '0')}.</span>
        <span class="truncate pr-1">${s.title}</span>
      </button>
    `).join('');

    const slideContentHTML = slides.map((s, idx) => `
      <div id="slide-sec-${idx}" class="slide-content flex-col gap-6 hidden w-full">
        <!-- Title & Header -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-indigo-100 pb-4">
          <div>
            <span class="bg-indigo-100/90 text-indigo-700 font-extrabold px-3 py-1 rounded-full text-[10px] uppercase tracking-wider badge-glow inline-flex items-center gap-1">✨ ${s.badge || 'Kiến Thức Thực Chiến'}</span>
            <h2 class="text-xl md:text-2xl font-black text-slate-900 mt-1.5 heading-font hover:text-indigo-600 transition-colors">${s.title}</h2>
            <p class="text-indigo-650 text-xs font-bold uppercase tracking-wider mt-0.5 mt-0.5">${s.subtitle}</p>
          </div>
          <div class="bg-indigo-50 text-indigo-800 rounded px-2.5 py-1 text-xs font-mono font-bold no-print border border-indigo-100">
            Trang ${idx + 1} / ${slides.length}
          </div>
        </div>

        <!-- Slide Layout Container -->
        <div class="flex flex-col md:flex-row gap-6">
          <!-- Main Visual 1/3 -->
          <div class="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md group bg-slate-950 flex items-center justify-center md:w-1/3 min-h-[300px] h-fit">
            <img 
              src="${s.image}" 
              alt="${s.title}" 
              class="max-w-full max-h-[80vh] md:max-h-none w-full object-contain group-hover:scale-105 transition-transform duration-1000 ease-out brightness-95 group-hover:brightness-100"
              referrerpolicy="no-referrer"
            />
            <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-900/10 to-transparent flex items-end p-4 transition-all duration-300 group-hover:via-slate-950/20 pointer-events-none">
              <div class="space-y-1 w-full">
                <p class="text-indigo-300 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> TRỰC QUAN SINH ĐỘNG
                </p>
                <p class="text-white/95 text-xs italic font-medium flex items-center gap-1.5 truncate">
                  🖼️ Hình ảnh minh họa đặc quyền: "${s.title}"
                </p>
              </div>
            </div>
          </div>

          <!-- Content 2/3 -->
          <div class="md:w-2/3 space-y-5 text-slate-700 text-content-body transition-all duration-300" style="font-size: var(--body-fs, 14px);">
            <div class="relative pl-4 border-l-4 border-indigo-500/80 py-1 transition-all duration-300 hover:border-indigo-600 bg-indigo-50/20 rounded-r-lg pr-3">
              <p class="leading-relaxed font-normal">${s.p1}</p>
            </div>
            
            ${s.highlight ? `
              <div class="bg-gradient-to-r from-indigo-50/60 via-amber-50/40 to-indigo-50/30 p-4 rounded-xl border border-indigo-200/60 italic text-indigo-950 font-semibold flex items-start gap-2.5 leading-relaxed shadow-sm hover:scale-[1.01] transition-transform" style="font-size: calc(var(--body-fs, 14px) * 0.95);">
                <span class="text-lg float-decoration">✨</span>
                <span>"${s.highlight}"</span>
              </div>
            ` : ''}

            <p class="leading-relaxed text-slate-650">${s.p2}</p>

            ${s.list && s.list.length > 0 ? `
              <div class="bg-indigo-950/[0.02] p-5 rounded-xl border border-indigo-100/80 space-y-3 shadow-inner">
                <h4 class="font-bold text-indigo-950 text-[11px] md:text-xs uppercase tracking-wider flex items-center gap-1.5 font-sans">
                  <span class="flex h-2 w-2 relative">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                  <span>🔥 HOẠT ĐỘNG THỰC HÀNH KHUYÊN DÙNG:</span>
                </h4>
                <ul class="space-y-2.5 text-slate-700">
                  ${s.list.map(l => `
                    <li class="flex items-start gap-2.5 p-2 rounded-lg border border-transparent hover:border-indigo-100 bg-white/50 hover:bg-white transition-all duration-250 hover:translate-x-1.5 shadow-xs">
                      <span class="text-indigo-600 font-black shrink-0">✓</span> 
                      <span>${l}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `).join('');

    const printCopyHTML = slides.map((s, idx) => `
      <div class="print-page flex flex-col gap-5 border border-slate-200 rounded-3xl p-8 bg-white shadow-sm mb-12">
        <div class="flex justify-between items-center border-b pb-3 mb-2">
          <div>
            <span class="text-[9px] uppercase tracking-widest text-slate-400 font-extrabold">Sách Bản Quyền PDF 2026 - Tác giả: ${author}</span>
            <h2 class="text-xl font-extrabold text-slate-900 mt-1">${s.title}</h2>
            <p class="text-xs text-slate-500 font-bold uppercase tracking-wider">${s.subtitle}</p>
          </div>
          <span class="text-xs font-mono text-slate-500 font-bold border border-slate-200 rounded px-2.5 py-0.5">Trang ${idx + 1} / ${slides.length}</span>
        </div>
        
        <div class="w-full mb-4 flex justify-center">
          <img src="${s.image}" alt="${s.title}" class="max-w-full h-auto rounded-xl shadow-sm" style="max-height: 80vh;" referrerpolicy="no-referrer" />
        </div>

        <div class="space-y-3.5 text-xs text-slate-700 leading-relaxed">
          <p class="font-medium text-slate-800">${s.p1}</p>
          
          ${s.highlight ? `
            <div class="bg-slate-55 p-3 rounded-lg border border-slate-300 italic text-slate-800 text-[11px] font-semibold">
              "💡 ${s.highlight}"
            </div>
          ` : ''}

          <p>${s.p2}</p>

          ${s.list && s.list.length > 0 ? `
            <div class="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h4 class="font-bold text-slate-900 text-[10.5px] uppercase mb-2">✓ KẾ HOẠCH HÀNH ĐỘNG CHI TIẾT:</h4>
              <ul class="space-y-1 text-[11px]">
                ${s.list.map(l => `<li>- ${l}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
        <div class="mt-auto pt-4 text-center border-t border-slate-100 text-[9px] text-slate-400">
          © 2026 ${author}. Thiết kế bởi Trình Tự Động Biên Soạn Web-Doc Thông Minh.
        </div>
      </div>
    `).join('');

    const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
        
        body { 
            font-family: 'Plus Jakarta Sans', sans-serif; 
            background: radial-gradient(at 0% 0%, rgba(244, 245, 247, 0.9) 0, transparent 50%), 
                        radial-gradient(at 50% 0%, rgba(224, 231, 255, 0.4) 0, transparent 50%), 
                        radial-gradient(at 100% 0%, rgba(245, 243, 255, 0.6) 0, transparent 50%),
                        #f8fafc;
        }

        .heading-font {
            font-family: 'Space Grotesk', 'Plus Jakarta Sans', sans-serif;
        }

        .mono-font {
            font-family: 'JetBrains Mono', monospace;
        }

        .ambient-blur {
            position: absolute;
            width: 300px;
            height: 300px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.04) 50%, transparent 100%);
            filter: blur(40px);
            z-index: 0;
            pointer-events: none;
        }
        
        .fade-in {
            animation: fadeInAnim 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeInAnim {
            from { opacity: 0; transform: translateY(12px) scale(0.99); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .badge-glow {
            animation: pulseGlow 3s infinite ease-in-out;
        }
        @keyframes pulseGlow {
            0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.2); }
            50% { box-shadow: 0 0 12px 4px rgba(99, 102, 241, 0.1) ; }
        }

        .float-decoration {
            display: inline-block;
            animation: floatAnim 6s ease-in-out infinite;
        }
        @keyframes floatAnim {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-6px) rotate(3deg); }
        }

        @media screen {
            .print-only {
                position: absolute !important;
                width: 1px !important;
                height: 1px !important;
                padding: 0 !important;
                margin: -1px !important;
                overflow: hidden !important;
                clip: rect(0, 0, 0, 0) !important;
                white-space: nowrap !important;
                border: 0 !important;
            }
        }
        
        @media print {
            .no-print {
                display: none !important;
            }
            .print-only {
                display: block !important;
                position: static !important;
                width: auto !important;
                height: auto !important;
                overflow: visible !important;
            }
            body {
                background: white !important;
                color: #0f172a !important;
            }
            .print-page {
                page-break-after: always !important;
                break-after: page !important;
                box-shadow: none !important;
                border: 1px solid #e2e8f0 !important;
                border-radius: 12px !important;
                margin-bottom: 0 !important;
                padding: 1.5in !important;
                height: 10.5in !important;
                max-height: 10.5in !important;
                box-sizing: border-box !important;
            }
        }
    </style>
</head>
<body class="text-slate-800 min-h-screen flex flex-col relative overflow-x-hidden">

    <div class="ambient-blur top-20 left-10"></div>
    <div class="ambient-blur bottom-40 right-10"></div>

    <!-- Web View Content Container -->
    <div class="web-viewer-container no-print flex-1 flex flex-col relative z-10">
        <!-- Main Top Bar -->
        <header class="bg-white/90 backdrop-blur-md border-b border-indigo-100 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-0 z-50 shadow-sm">
            <div class="flex items-center gap-3">
                <div class="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white font-black text-lg shadow-md select-none float-decoration">📖</div>
                <div>
                    <h1 class="font-extrabold text-slate-900 leading-tight text-sm md:text-base heading-font">${title}</h1>
                    <p class="text-xs text-slate-500 font-semibold mt-0.5">Xuất bản bởi: <span class="text-indigo-600">${author}</span> • Trị giá: <span class="text-emerald-600 font-bold">${(Number(value) || 250000).toLocaleString('vi-VN')}₫</span></p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <div class="flex items-center border border-indigo-100 rounded-xl overflow-hidden shadow-sm mr-2 no-print bg-white">
                  <button id="btn-font-dec" class="px-3 py-2 text-indigo-700 hover:bg-indigo-50 transition-colors font-bold text-xs" title="Thu nhỏ chữ">A-</button>
                  <div class="w-px h-4 bg-indigo-100"></div>
                  <button id="btn-font-inc" class="px-3 py-2 text-indigo-700 hover:bg-indigo-50 transition-colors font-bold text-base" title="Phóng to chữ">A+</button>
                </div>
                <button id="main-toggle-toc-btn" class="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:scale-[0.98] font-extrabold py-2 px-3 rounded-xl text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer uppercase tracking-wider border border-indigo-200">
                  <span id="toc-toggle-icon">◀</span> Mục lục
                </button>
                <button 
                  onclick="window.print()" 
                  class="bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-extrabold py-2 px-4 rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                >
                  🖨️ Lưu file PDF / In Sách
                </button>
            </div>
        </header>

        <!-- Main Body Grid Layout -->
        <div class="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6 transition-all duration-300">
            
            <!-- Left Side Navbar (Table of Contents) -->
            <aside id="toc-sidebar" class="lg:col-span-4 bg-white/95 backdrop-blur border border-indigo-100 rounded-2xl p-4 flex flex-col h-[calc(100vh-140px)] sticky top-24 shadow-sm overflow-hidden transition-all duration-300">
                <h3 class="font-black text-slate-900 border-b border-indigo-50 pb-3 mb-3 text-xs uppercase tracking-wider flex items-center gap-1.5 select-none heading-font">
                  <span class="text-indigo-605">📌 Mục lục hướng dẫn (${slides.length} Chương)</span>
                </h3>
                <div class="flex-1 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
                    ${sidebarItems}
                </div>
                <div class="border-t border-slate-100 pt-3 mt-3 text-center text-[10px] text-slate-400 font-bold select-none">
                  💡 Nhấn chọn từng chương để mở khóa chương học tương ứng
                </div>
            </aside>

            <!-- Main Slide Focus Frame -->
            <main id="main-content-area" class="lg:col-span-8 bg-white/95 backdrop-blur border border-indigo-100 rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-md min-h-[500px] transition-all duration-300">
                
                <!-- Main Slides Frame -->
                <div class="flex-1 mb-8">
                    ${slideContentHTML}
                </div>

                <!-- Footer Navigation Panel -->
                <div class="border-t border-slate-100 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <!-- Progress meter -->
                    <div class="flex items-center gap-3 w-full sm:w-auto">
                        <span class="text-xs font-bold text-slate-500 font-mono select-none">TIẾN ĐỘ ĐỌC:</span>
                        <div class="w-full sm:w-48 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <div id="progress-bar-fill" class="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500" style="width: 6%"></div>
                        </div>
                        <span class="text-xs font-black text-slate-700 font-mono select-none">
                            <span id="current-page-num font-bold text-indigo-600">1</span>/${slides.length}
                        </span>
                    </div>

                    <!-- Button Groups -->
                    <div class="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                        <button 
                            id="btn-prev" 
                            class="flex-1 sm:flex-initial border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-5 rounded-xl text-xs transition-all cursor-pointer select-none flex items-center justify-center gap-1 hover:border-indigo-300"
                        >
                            ← Quay lại
                        </button>
                        <button 
                            id="btn-next" 
                            class="flex-1 sm:flex-initial bg-indigo-950 hover:bg-slate-900 text-white font-extrabold py-2.5 px-6 rounded-xl text-xs transition-all cursor-pointer shadow-lg select-none flex items-center justify-center gap-1 active:scale-95"
                        >
                            Đọc trang tiếp →
                        </button>
                    </div>
                </div>
            </main>
        </div>
    </div>

    <!-- Pristine Print Area (visible during window.print) -->
    <div class="print-only max-w-4xl mx-auto p-4 space-y-8 bg-white min-h-screen">
        <div class="text-center space-y-2 border-b-2 border-slate-900 pb-6 mb-12">
            <h1 class="text-4xl font-extrabold text-slate-900 tracking-tight">${title}</h1>
            <p class="text-base text-slate-500 font-semibold uppercase tracking-wider">Ấn bản học tập lưu hành nội bộ dạng PDF</p>
            <p class="text-xs font-medium text-slate-400">Tác giả biên soạn: ${author} • Hệ thống bốc thăm trực tuyến</p>
        </div>
        ${printCopyHTML}
    </div>

    <script>
      let currentSlide = 0;
      const totalSlides = ${slides.length};
      
      const sidebarItems = document.querySelectorAll('.sidebar-item');
      const progressFill = document.getElementById('progress-bar-fill');
      const currentPageNum = document.getElementById('current-page-num');
      const btnPrev = document.getElementById('btn-prev');
      const btnNext = document.getElementById('btn-next');
      
      const btnFontDec = document.getElementById('btn-font-dec');
      const btnFontInc = document.getElementById('btn-font-inc');
      
      let baseFs = 14;
      if (btnFontDec && btnFontInc) {
        btnFontDec.addEventListener('click', () => {
          if (baseFs > 10) baseFs -= 1;
          document.documentElement.style.setProperty('--body-fs', baseFs + 'px');
        });
        btnFontInc.addEventListener('click', () => {
          if (baseFs < 24) baseFs += 1;
          document.documentElement.style.setProperty('--body-fs', baseFs + 'px');
        });
      }
      
      const btnToggleToc = document.getElementById('main-toggle-toc-btn');
      const tocIcon = document.getElementById('toc-toggle-icon');
      const asideSidebar = document.getElementById('toc-sidebar');
      const mainContent = document.getElementById('main-content-area');
      
      let isTocVisible = true;
      if (btnToggleToc) {
        btnToggleToc.addEventListener('click', () => {
          isTocVisible = !isTocVisible;
          if (isTocVisible) {
            asideSidebar.classList.remove('hidden', 'lg:hidden');
            mainContent.classList.remove('lg:col-span-12');
            mainContent.classList.add('lg:col-span-8');
            tocIcon.textContent = '◀';
          } else {
            asideSidebar.classList.add('hidden', 'lg:hidden');
            mainContent.classList.remove('lg:col-span-8');
            mainContent.classList.add('lg:col-span-12');
            tocIcon.textContent = '▶';
          }
        });
      }

      function showSlide(index) {
        if (index < 0 || index >= totalSlides) return;
        currentSlide = index;
        
        // Hide all slides
        const slides = document.querySelectorAll('.slide-content');
        slides.forEach((slide, i) => {
          if (i === index) {
            slide.classList.remove('hidden');
            slide.classList.add('flex', 'fade-in');
          } else {
            slide.classList.add('hidden');
            slide.classList.remove('flex', 'fade-in');
          }
        });
        
        // Update active state in sidebar
        sidebarItems.forEach((item, i) => {
          if (i === index) {
            item.classList.add('bg-indigo-50', 'text-indigo-700', 'border-l-4', 'border-indigo-600', 'font-black');
            item.classList.remove('text-slate-600', 'border-transparent', 'font-medium');
            
            // Scroll sidebar-item into view
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          } else {
            item.classList.remove('bg-indigo-50', 'text-indigo-700', 'border-l-4', 'border-indigo-600', 'font-black');
            item.classList.add('text-slate-600', 'border-transparent', 'font-medium');
          }
        });
        
        // Update indicators
        currentPageNum.textContent = currentSlide + 1;
        progressFill.style.width = ((currentSlide + 1) / totalSlides * 100) + '%';
        
        // Update button states
        btnPrev.disabled = currentSlide === 0;
        btnNext.disabled = currentSlide === totalSlides - 1;
        
        if (currentSlide === 0) {
          btnPrev.classList.add('opacity-40', 'cursor-not-allowed');
        } else {
          btnPrev.classList.remove('opacity-40', 'cursor-not-allowed');
        }
        
        if (currentSlide === totalSlides - 1) {
          btnNext.classList.add('opacity-40', 'cursor-not-allowed');
        } else {
          btnNext.classList.remove('opacity-40', 'cursor-not-allowed');
        }
      }

      // Bind clicks
      sidebarItems.forEach((item, index) => {
        item.addEventListener('click', () => showSlide(index));
      });

      btnPrev.addEventListener('click', () => {
        if (currentSlide > 0) showSlide(currentSlide - 1);
      });

      btnNext.addEventListener('click', () => {
        if (currentSlide < totalSlides - 1) showSlide(currentSlide + 1);
      });
      
      // Initialize First view
      showSlide(0);
    </script>
</body>
</html>`;

    const newId = 'gen_' + Date.now();
    
    // Create new Gift Material with htmlContent
    const newGift = {
      id: newId,
      title: title,
      categoryType: category,
      downloadUrl: `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`,
      value: Number(value) || 250000,
      isAutoGeneratedWebDoc: true,
      htmlContent: htmlContent
    };

    // 1. Add to giftMaterials
    onSetGiftMaterials(prev => {
      const filtered = prev.filter(p => p.title !== title);
      return [newGift, ...filtered];
    });

    // 2. Add to onlineProducts as free public gift (0đ) for matching
    const newOnlineProduct = {
      id: 'op_' + newId,
      title: title,
      type: 'mienphi',
      price: 0,
      originalPrice: Number(value) || 250000,
      isFree: true,
      downloadUrl: `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`,
      isAutoGeneratedWebDoc: true,
      htmlContent: htmlContent,
      rawSlides: slides,
      originalAuthor: author
    };

    const filteredOnlineProducts = onlineProducts.filter(p => p.title !== title);
    saveOnlineProducts([...filteredOnlineProducts, newOnlineProduct]);

    setSuccessMsg(`🎉 ĐÃ BIÊN XOẠN TỰ ĐỘNG THÀNH CÔNG! Tài liệu "${title}" đã được lưu trữ trực tiếp trên máy chủ web này. Người dùng có thể bốc thăm trúng giải hoặc xem & tải trực tiếp ở trang chủ mà KHÔNG cần thông tin driver!`);
    setTimeout(() => setSuccessMsg(''), 7000);
  };

  const handleAutoGenerateGiftDoc = async () => {
    if (genTopic === 'custom') {
      if (!genCustomTopicName.trim()) {
        setErrorMsg('Vui lòng điền tên chủ đề tự chọn trước khi biên soạn.');
        setTimeout(() => setErrorMsg(''), 5000);
        return;
      }
      setGiftDocLoading(true);
      setErrorMsg('');

      let currentSlides: any[] = [];
      let failCount = 0;
      let usedKeyIndex = geminiKeys?.findIndex((k: any) => k.isActive) ?? 0;
      if (usedKeyIndex < 0) usedKeyIndex = 0;

      const imagesList = [
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1516280440614-37939bbacd6a?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80"
      ];

      try {
        while (currentSlides.length < genLength && failCount < 3) {
          const activeKeyObj = geminiKeys?.[usedKeyIndex];
          const fetchHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
          if (activeKeyObj && activeKeyObj.key) {
            fetchHeaders['x-gemini-key'] = activeKeyObj.key;
          }

          const countToGenerate = Math.max(1, Math.min(5, genLength - currentSlides.length));

          try {
            const response = await fetch('/api/gemini/generate-gift-slides', {
              method: 'POST',
              headers: fetchHeaders,
              body: JSON.stringify({
                customTitle: genCustomTopicName,
                suggestions: genCustomTopicContentSuggested,
                authorName: genAuthor,
                countToGenerate,
                existingSlides: currentSlides,
                aspectRatio: genAspectRatio
              })
            });

            if (!response.ok) {
              let errData;
              try { errData = await response.json(); } catch(e) {}
              throw new Error(errData?.error || `Lỗi máy chủ AI: ${response.status}`);
            }

            const data = await response.json();
            const slides = data.slides || [];
            
            if (slides.length === 0) {
              throw new Error("Không có nội dung trả về từ AI.");
            }
            
            const mappedSlides = slides.map((s: any, idx: number) => ({
              ...s,
              image: s.image || imagesList[(currentSlides.length + idx) % imagesList.length]
            }));

            currentSlides = [...currentSlides, ...mappedSlides];
            setCurrentCustomSlides([...currentSlides]);
            setCurrentGiftDocTitle(genCustomTopicName);
            setCurrentGiftDocCat('Đề Xuất Quản Trị');
            failCount = 0; // reset fail on success
          } catch (fetchErr: any) {
            failCount++;
            console.error("AI round failed:", fetchErr);
            if (geminiKeys && geminiKeys.length > 1) {
              usedKeyIndex = (usedKeyIndex + 1) % geminiKeys.length;
            }
          }
        }

        if (currentSlides.length > 0) {
          packageAndSaveSlides(currentSlides, genCustomTopicName, 'Đề Xuất Quản Trị', genAuthor, genValue);
        }
        
        if (currentSlides.length < genLength) {
          setErrorMsg(`Tiến trình xoay vòng Key đã dừng do lỗi liên tục. Chỉ tạo được ${currentSlides.length} trang.`);
          setTimeout(() => setErrorMsg(''), 7000);
        }
      } catch (e: any) {
        console.error("AI slide initial generation error:", e);
        setErrorMsg(`Lỗi khi biên soạn bằng AI: ${e.message || "Vui lòng kiểm tra cấu hình API."}`);
        setTimeout(() => setErrorMsg(''), 7000);
      } finally {
        setGiftDocLoading(false);
      }
      return;
    }

    // Default synchronous flow for standard channels
    const result = getSlidesForTopic(genTopic, genAuthor, genCustomTopicName, genCustomTopicContentSuggested, genLength);
    const title = result.title;
    const category = result.category;
    const slides = result.slides;
    setCurrentCustomSlides(slides);
    setCurrentGiftDocTitle(title);
    setCurrentGiftDocCat(category);
    packageAndSaveSlides(slides, title, category, genAuthor, genValue);
  };

  const handleContinueGenerateGiftDocAI = async () => {
    setGiftDocLoading(true);
    setErrorMsg('');
    try {
      const activeKeyObj = geminiKeys?.find((k: any) => k.isActive) || geminiKeys?.[0];
      const fetchHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
      if (activeKeyObj && activeKeyObj.key) {
        fetchHeaders['x-gemini-key'] = activeKeyObj.key;
      }

      const currentCount = currentCustomSlides.length;
      // Write next chunk up to 5 slides or target size
      const countToGenerate = Math.max(1, Math.min(5, genLength - currentCount));

      const response = await fetch('/api/gemini/generate-gift-slides', {
        method: 'POST',
        headers: fetchHeaders,
        body: JSON.stringify({
          customTitle: genCustomTopicName,
          suggestions: genCustomTopicContentSuggested,
          authorName: genAuthor,
          countToGenerate,
          existingSlides: currentCustomSlides,
          aspectRatio: genAspectRatio
        })
      });

      if (!response.ok) {
        let errData;
        try { errData = await response.json(); } catch(e) {}
        throw new Error(errData?.error || `Lỗi máy chủ AI: ${response.status}`);
      }

      const data = await response.json();
      const newSlides = data.slides || [];
      
      const imagesList = [
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1516280440614-37939bbacd6a?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80"
      ];
      
      const mappedNewSlides = newSlides.map((s: any, idx: number) => ({
        ...s,
        image: s.image || imagesList[(currentCount + idx) % imagesList.length]
      }));

      const combinedSlides = [...currentCustomSlides, ...mappedNewSlides];
      setCurrentCustomSlides(combinedSlides);
      packageAndSaveSlides(combinedSlides, currentGiftDocTitle || genCustomTopicName, currentGiftDocCat || 'Đề Xuất Quản Trị', genAuthor, genValue);

    } catch (e: any) {
      console.error("AI slide continuation error:", e);
      setErrorMsg(`Lỗi viết tiếp: ${e.message || "Vui lòng kiểm tra kết nối API."}`);
      setTimeout(() => setErrorMsg(''), 7000);
    } finally {
      setGiftDocLoading(false);
    }
  };

  const handleGenerateReportAI = async () => {
    setReportLoading(true);
    setErrorMsg('');
    try {
      const activeKeyObj = geminiKeys?.find((k: any) => k.isActive) || geminiKeys?.[0];
      const fetchHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
      if (activeKeyObj && activeKeyObj.key) {
        fetchHeaders['x-gemini-key'] = activeKeyObj.key;
      }

      const response = await fetch('/api/gemini/generate-report', {
        method: 'POST',
        headers: fetchHeaders,
        body: JSON.stringify({
          buyers,
          searchTracks,
          scheduleType
        })
      });
      const data = await response.json();
      if (data.error) {
        setErrorMsg(data.error);
      } else {
        setAiReport(data);
        setSuccessMsg('Đã kết nối cơ sở dữ liệu & Phân tích báo cáo bằng AI thành công!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg('Lỗi kết nối máy chủ để phân tích dữ liệu.');
    } finally {
      setReportLoading(false);
    }
  };

  // Track product being edited (if any)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Track product deletion confirmations inside iframe safely
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Status feedback
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Quick link parsing helper
  const [rawLinkInput, setRawLinkInput] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  
  // High fidelity input for raw text pasting and base64 screenshot upload/paste (clipboard)
  const [pasteTextInput, setPasteTextInput] = useState('');
  const [previewImgBase64, setPreviewImgBase64] = useState('');
  const [scannedImages, setScannedImages] = useState<string[]>([]);

  // Auto-categorize title when it is typed
  const handleTitleChange = (val: string) => {
    setTitle(val);
    const suggestedCat = autoCategorize(val);
    setCategoryId(suggestedCat);
  };

  const handleGenerateAI = async () => {
    let inputProduct = title.trim();
    let url = rawLinkInput.trim();
    let pasteText = pasteTextInput.trim();

    if (!inputProduct && !url && !pasteText && !previewImgBase64) {
      setErrorMsg('Vui lòng cung cấp ít nhất đối tượng dữ liệu: dán đường dẫn sản phẩm, nhập tên thô, dán văn bản thuộc tính sao chép hoặc ảnh chụp màn hình sản phẩm để AI viết bài!');
      return;
    }

    setIsGeneratingAI(true);
    setErrorMsg('');
    setSuccessMsg('⏳ Đang phân tích dữ liệu & dải băng ký tự thông tin để soạn kịch bản bán hàng...');

    // Auto find any link pasted in text area if input is currently empty
    const urlRegex = /(https?:\/\/[^\s?#]+)/g;
    const foundUrls = (pasteText + ' ' + url).match(urlRegex);
    if (foundUrls && foundUrls.length > 0 && !url) {
      url = foundUrls[0].replace(/[,.'")\]}]*$/, '');
    }

    try {
      // If we only have URL/Text and no title, run the quick local parser first to extract a meaningful title slug
      let tempTitle = inputProduct;
      if (!tempTitle && url) {
        setSuccessMsg('⏳ Đang giải mã đường dẫn để trích xuất tên gốc của sản phẩm...');
        let parsedName = '';
        try {
          const urlObj = new URL(url);
          let pathSegments = urlObj.pathname.split('/');
          let productSegment = pathSegments.find(segment => {
            const decoded = decodeURIComponent(segment);
            return decoded.length > 5 && /[a-zA-Z-]{5,}/.test(decoded);
          }) || '';

          if (!productSegment) {
            productSegment = pathSegments.reverse().find(s => s && isNaN(Number(s))) || '';
          }

          if (productSegment) {
            let decoded = decodeURIComponent(productSegment);
            decoded = decoded.replace(/\.html$/i, '');
            decoded = decoded.replace(/-i\.\d+\.\d+$/i, '');
            const words = decoded.split(/[-_]/).filter(w => w.length > 0);
            if (words.length > 0) {
              const cleanedWords = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
              parsedName = cleanedWords
                .join(' ')
                .replace(/\b(Shopee|Tiktok|Lazada|Mall|Affiliate|Vip|Hot|Sale)\b/gi, '')
                .trim()
                .replace(/\s+/g, ' ');
            }
          }
        } catch (e) {
          const sanitized = (url || '').replace(/https?:\/\/[^\/]+\//, '');
          const parts = sanitized.split(/[?\/]/)[0].split(/[-_]/).filter(Boolean);
          if (parts.length > 0) {
            parsedName = parts
              .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
              .join(' ')
              .replace(/\b(Shopee|Tiktok|Lazada|Mall|Affiliate|Vip|Hot|Sale)\b/gi, '')
              .trim()
              .replace(/\s+/g, ' ');
          }
        }
        tempTitle = parsedName || 'Sản Phẩm Tiếp Thị Mới';
        setTitle(tempTitle);
      }

      let data = null;
      let attempt = 0;
      let currentKeyIdx = geminiKeys?.findIndex((k: any) => k.isActive);
      if (currentKeyIdx === undefined || currentKeyIdx === -1) currentKeyIdx = 0;

      let maxAttempts = geminiKeys?.length ? geminiKeys.length * 2 : 4;

      while (attempt < maxAttempts) {
        if (attempt === 0) setSuccessMsg('⏳ Trí tuệ nhân tạo Gemini AI đang xử lý (bóc tách ảnh & viết bài)...');
        
        const activeKeyObj = geminiKeys?.[currentKeyIdx] || geminiKeys?.[0];
        const fetchHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
        if (activeKeyObj && activeKeyObj.key) {
          fetchHeaders['x-gemini-key'] = activeKeyObj.key;
        }

        const response = await fetch('/api/gemini/generate-content', {
          method: 'POST',
          headers: fetchHeaders,
          body: JSON.stringify({
            productName: tempTitle || 'Sản phẩm Hot',
            rawLinkInput: url,
            categoryId: categoryId,
            extraInfo: pasteText || 'Hãy tạo nội dung mô tả sống động, có chia thành 2-3 mẩu ngắn thân thiện kèm icon/emoji.',
            productImageBase64: (previewImgBase64 && previewImgBase64.startsWith('data:image/')) ? previewImgBase64 : null
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          const errorMsg = errorData.error || 'Server trả lỗi phân tích AI.';
          
          if (errorMsg.includes('503') || errorMsg.includes('UNAVAILABLE') || response.status === 503) {
            if (attempt < maxAttempts - 1) {
              const sleepTime = 2000;
              setSuccessMsg(`⏳ Máy chủ AI bận (503). Đang đợi ${sleepTime/1000}s thử lại...`);
              await new Promise(resolve => setTimeout(resolve, sleepTime));
              attempt++;
              continue;
            }
          } else if (errorMsg.includes('429') || errorMsg.includes('QUOTA') || errorMsg.includes('hết lượt') || response.status === 429) {
            if (geminiKeys && geminiKeys.length > 1 && attempt < maxAttempts - 1) {
              currentKeyIdx = (currentKeyIdx + 1) % geminiKeys.length;
              setSuccessMsg(`⏳ Khóa API hiện tại hết hạn mức (429). Đổi sang khóa số ${currentKeyIdx + 1}...`);
              attempt++;
              continue;
            } else if (attempt < maxAttempts - 1) {
              const match = errorMsg.match(/sau ([\d.]+) giây/);
              let sleepTime = 5000;
              if (match && match[1]) {
                sleepTime = Math.ceil(parseFloat(match[1])) * 1000 + 1000; 
              }
              if (sleepTime > 30000) {
                 // If the delay is > 30s, it's likely a daily quota exhaustion.
                 // We shouldn't wait for 24 hours. We must break so the user can see the error.
                 if ((geminiKeys || []).length <= 1) {
                    throw new Error("Tài khoản (API Key) của bạn đã hết hạn mức (20 lượt/ngày). Vui lòng cấu hình THÊM khóa API dự phòng trong mục Sinh Bài bằng AI để quay vòng tự động.");
                 }
              } else {
                 setSuccessMsg(`⏳ Quá nhiều yêu cầu. Đang đợi ${sleepTime/1000}s...`);
                 await new Promise(resolve => setTimeout(resolve, sleepTime));
                 attempt++;
                 continue;
              }
            }
          }
          throw new Error(errorMsg);
        }

        data = await response.json();
        break;
      }
      
      if (!data) throw new Error("Không nhận được phản hồi từ AI sau nhiều lần thử.");
      
      if (data.title) setTitle(data.title);
      if (data.description) setDescription(data.description);
      if (data.price) setPrice(data.price);
      if (data.originalPrice) setOriginalPrice(data.originalPrice);
      
      // Keep their customized uploaded/screenshot image as primary product photo, or fallback to AI stock keyword photo
      if (previewImgBase64) {
        setImage(previewImgBase64);
        setSuccessMsg('🎉 Gemini AI đã đọc xong ảnh chụp & viết content tiếp thị xuất sắc!');
      } else if (data.suggestedImage) {
        setImage(data.suggestedImage);
        setSuccessMsg('🎉 Đã viết content bán hàng & tìm kiếm hình ảnh minh họa phù hợp thành công!');
      } else {
        setSuccessMsg('🎉 Đã lập mô tả content tiếp thị thành công!');
      }
      
      if (url) {
        setAffiliateLink(url);
        const isShopee = url.includes('shopee') || url.includes('shope.ee');
        const isTiktok = url.includes('tiktok');
        const isLazada = url.includes('lazada');
        setPlatform(isShopee ? 'shopee' : isTiktok ? 'tiktok' : isLazada ? 'lazada' : 'other');
      }

      // Automatically auto-categorize the new title generated by AI
      if (data.title) {
        const suggestedCat = autoCategorize(data.title);
        setCategoryId(suggestedCat);
      }

      setPasteTextInput('');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Lỗi AI: ${err.message || 'Không thể lấy kết quả từ Gemini API. Hãy chắc chắn bạn đã chạy server và cấu hình API Key.'}`);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleParseLink = () => {
    if (!rawLinkInput.trim()) return;
    
    setErrorMsg('');
    setSuccessMsg('Đang quét thông tin từ đường dẫn tiếp thị...');
    
    setTimeout(() => {
      try {
        const url = rawLinkInput.trim();
        const isShopee = url.includes('shopee') || url.includes('shope.ee');
        const isTiktok = url.includes('tiktok');
        const isLazada = url.includes('lazada');
        
        const detectedPlatform = isShopee ? 'shopee' : isTiktok ? 'tiktok' : isLazada ? 'lazada' : 'other';
        setPlatform(detectedPlatform);
        setAffiliateLink(url);
        
        // Smart Vietnamese URL slug reader
        let parsedName = '';
        try {
          const urlObj = new URL(url);
          let pathSegments = urlObj.pathname.split('/');
          let productSegment = pathSegments.find(segment => {
            const decoded = decodeURIComponent(segment);
            return decoded.length > 5 && /[a-zA-Z-]{5,}/.test(decoded);
          }) || '';

          if (!productSegment) {
            productSegment = pathSegments.reverse().find(s => s && isNaN(Number(s))) || '';
          }

          if (productSegment) {
            let decoded = decodeURIComponent(productSegment);
            decoded = decoded.replace(/\.html$/i, '');
            decoded = decoded.replace(/-i\.\d+\.\d+$/i, '');
            const words = decoded.split(/[-_]/).filter(w => w.length > 0);
            if (words.length > 0) {
              const cleanedWords = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
              parsedName = cleanedWords
                .join(' ')
                .replace(/\b(Shopee|Tiktok|Lazada|Mall|Affiliate|Vip|Hot|Sale)\b/gi, '')
                .trim()
                .replace(/\s+/g, ' ');
            }
          }
        } catch (e) {
          const sanitized = (url || '').replace(/https?:\/\/[^\/]+\//, '');
          const parts = sanitized.split(/[?\/]/)[0].split(/[-_]/).filter(Boolean);
          if (parts.length > 0) {
            parsedName = parts
              .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
              .join(' ')
              .replace(/\b(Shopee|Tiktok|Lazada|Mall|Affiliate|Vip|Hot|Sale)\b/gi, '')
              .trim()
              .replace(/\s+/g, ' ');
          }
        }

        let autoName = parsedName || 'Sản Phẩm Tiếp Thị Cao Cấp';
        
        // Ensure accurate matches based on Vietnamese words
        const norm = autoName.toLowerCase();
        let autoImg = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400';
        let autoCat = '1';
        let autoPrice = 150000;
        let autoOrigPrice = 299000;
        let autoDesc = `Sản phẩm [${autoName}] chính hãng chất lượng cực kỳ tốt, kiểu dáng hiện đại thiết kế tinh tế hợp xu hướng mới nhất hiện nay.`;

        if (norm.includes('vay') || norm.includes('đầm') || norm.includes('dam') || norm.includes('váy')) {
          autoImg = 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=400';
          autoCat = '7'; // Thời trang Nữ
          autoPrice = 189000;
          autoOrigPrice = 350000;
          autoDesc = `Váy đầm thiết kế cao cấp thướt tha cực xinh, chất liệu voan tơ tằm mềm mịn 2 lớp dày dặn, tôn vinh nét quyến rũ trẻ trung đầy nữ tính của phái đẹp.`;
        }
        else if (norm.includes('chong nang') || norm.includes('chống nắng') || norm.includes('jacket') || norm.includes('khoac') || norm.includes('khoác') || norm.includes('gio') || norm.includes('gió')) {
          autoImg = 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=400';
          autoCat = norm.includes('nam') ? '1' : '7'; // Thời trang Nữ vs Nam
          autoPrice = 169000;
          autoOrigPrice = 350000;
          autoDesc = `Áo khoác / áo chống nắng thông hơi Airism cản tia cực tím UPF 50+ siêu tốt, giữ cơ thể mát mẻ dễ chịu toàn diện khi di chuyển ngoài đường đông.`;
        }
        else if (norm.includes('son') || norm.includes('lip') || norm.includes('makeup') || norm.includes('trang diem') || norm.includes('phấn') || norm.includes('phan')) {
          autoImg = 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=400';
          autoCat = '2'; // Mỹ phẩm
          autoPrice = 99000;
          autoOrigPrice = 220000;
          autoDesc = `Son môi lì tơi mịn nhẹ như nhung dưỡng ẩm tốt, giữ tone rạng ngời kéo dài suốt ngày không làm khô hay thâm sạm da môi nhạy cảm.`;
        }
        else if (norm.includes('kem') || norm.includes('duong da') || norm.includes('dưỡng da') || norm.includes('skincare') || norm.includes('serum') || norm.includes('sua rua mat') || norm.includes('sữa rửa mặt') || norm.includes('tẩy trang') || norm.includes('tay trang')) {
          autoImg = 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400';
          autoCat = '2'; // Mỹ phẩm
          autoPrice = 265000;
          autoOrigPrice = 450000;
          autoDesc = `Kem dưỡng chăm sóc da chuyên sâu, khôi phục hàng rào ẩm bảo vệ da khỏe khoắn, kích thích tăng sinh biểu bì tươi trẻ căng mọng hồng hào.`;
        }
        else if (norm.includes('nhung') || norm.includes('nu') || norm.includes('nữ') || norm.includes('croptop') || norm.includes('chân váy') || norm.includes('chan vay') || norm.includes('túi') || norm.includes('tui')) {
          autoImg = 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=400';
          autoCat = '7'; // Thời trang Nữ
          autoPrice = 145000;
          autoOrigPrice = 290000;
        }
        else if (norm.includes('tai nghe') || norm.includes('headphone') || norm.includes('bluetooth') || norm.includes('earphone')) {
          autoImg = 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=400';
          autoCat = '3'; // Đồ điện tử
          autoPrice = 220000;
          autoOrigPrice = 500000;
          autoDesc = `Tai nghe Bluetooth không dây chống ồn đỉnh cao, thời lượng pin trâu dùng liên tục, âm bass bùng nổ mang lại cảm giác sống động tối thượng.`;
        }
        else if (norm.includes('dien thoai') || norm.includes('điện thoại') || norm.includes('phone') || norm.includes('smartphone') || norm.includes('tivi') || norm.includes('ti vi') || norm.includes('laptop') || norm.includes('máy tính') || norm.includes('phím') || norm.includes('chuột') || norm.includes('chuot')) {
          autoImg = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=400';
          autoCat = '3'; // Đồ điện tử
          autoPrice = 3250000;
          autoOrigPrice = 5900000;
        }
        else if (norm.includes('dong ho') || norm.includes('đồng hồ') || norm.includes('watch')) {
          autoImg = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400';
          autoCat = norm.includes('nam') ? '1' : (norm.includes('nu') || norm.includes('nữ') ? '7' : '1');
          autoPrice = 280000;
          autoOrigPrice = 550000;
        }
        else if (norm.includes('áo thun') || norm.includes('ao thun') || norm.includes('sơ mi') || norm.includes('so mi') || norm.includes('polo') || norm.includes('nam') || norm.includes('quan') || norm.includes('quần')) {
          autoImg = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400';
          autoCat = '1'; // Nam
          autoPrice = 95000;
          autoOrigPrice = 190000;
        }
        else if (norm.includes('noi') || norm.includes('nồi') || norm.includes('chao') || norm.includes('chảo') || norm.includes('gia dung') || norm.includes('gia dụng') || norm.includes('bếp') || norm.includes('bep')) {
          autoImg = 'https://images.unsplash.com/photo-1626806787426-5910811b6325?auto=format&fit=crop&q=80&w=400';
          autoCat = '4'; // Đồ gia dụng
          autoPrice = 550000;
          autoOrigPrice = 990000;
        }
        else if (norm.includes('bỉm') || norm.includes('bim') || norm.includes('ta') || norm.includes('tã') || norm.includes('sữa') || norm.includes('sua') || norm.includes('mẹ') || norm.includes('bé') || norm.includes('be') || norm.includes('tre em') || norm.includes('đồ chơi') || norm.includes('do choi')) {
          autoImg = 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=400';
          autoCat = '6'; // Mẹ & bé
          autoPrice = 195000;
          autoOrigPrice = 350000;
        }
        else if (norm.includes('thuoc') || norm.includes('thuốc') || norm.includes('bo') || norm.includes('bổ') || norm.includes('khau trang') || norm.includes('khẩu trang') || norm.includes('suc khoe') || norm.includes('sức khỏe')) {
          autoImg = 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=400';
          autoCat = '5'; // Sức khỏe
          autoPrice = 145000;
          autoOrigPrice = 280000;
        }
        else {
          if (norm.includes('giày') || norm.includes('giay') || norm.includes('sneaker') || norm.includes('shoes')) {
            autoImg = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400';
            autoCat = '1';
          } else {
            autoImg = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400';
            autoCat = '1';
          }
        }

        setTitle(autoName);
        setPrice(autoPrice);
        setOriginalPrice(autoOrigPrice);
        setImage(autoImg);
        setDescription(autoDesc);
        setCategoryId(autoCat);

        setSuccessMsg(`Tự động quét thành công sản phẩm: "${autoName}"!`);
        setRawLinkInput('');
      } catch (err) {
        setErrorMsg('Không thể tự động quét link này. Vui lòng dán link và điền các trường bên dưới.');
      }
    }, 800);
  };

  const base64ToFile = (base64: string, filename: string): File => {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập "Tên sản phẩm". Đây là trường thông tin bắt buộc.');
      return;
    }
    
    // Auto-fallback for empty price to prevent user blocking
    let finalPrice = Number(price);
    if (!finalPrice || finalPrice <= 0) {
      finalPrice = 150000; // 150,000đ fallback
    }

    let finalOriginalPrice = Number(originalPrice);
    if (!finalOriginalPrice || finalOriginalPrice <= 0) {
      finalOriginalPrice = finalPrice * 2; // e.g. 300,000đ fallback
    }

    if (!affiliateLink.trim()) {
      setErrorMsg('Vui lòng dán "Đường dẫn tiếp thị (Affiliate Link)" của bạn.');
      return;
    }
    if (!image.trim()) {
      setErrorMsg('Vui lòng điền "Đường dẫn ảnh sản phẩm" (hoặc chọn ảnh mẫu nhanh / đính kèm ảnh chụp màn hình).');
      return;
    }

    let finalImageUrl = image;
    if (image.startsWith('data:image/')) {
      setSuccessMsg('⏳ Đang tải ảnh lên máy chủ (Cloud)...');
      const file = base64ToFile(image, 'upload.jpg');
      const uploadedUrl = await uploadImageToSupabase(file);
      if (uploadedUrl) {
        finalImageUrl = uploadedUrl;
        setImage(uploadedUrl);
      } else {
        setErrorMsg('Lỗi khi tải ảnh. Vui lòng kiểm tra lại cấu hình Supabase.');
        return;
      }
    }

    const calculatedDiscount = finalOriginalPrice > finalPrice 
      ? Math.round(((finalOriginalPrice - finalPrice) / finalOriginalPrice) * 100) 
      : 0;

    if (editingProduct) {
      // In EDIT MODE -> update existing link
      const updated: Product = {
        ...editingProduct,
        title,
        price: finalPrice,
        originalPrice: finalOriginalPrice,
        discountPercent: calculatedDiscount,
        image: finalImageUrl,
        categoryId,
        affiliateLink,
        platform,
        description,
        isSuggested,
        isDirectProduct,
        videoUrl,
        postDate: postDate || '27/05/2026',
        attachedOnlineProductId: attachedOnlineProductId || undefined
      };
      onUpdateProduct(updated);
      setEditingProduct(null);
      setSuccessMsg('Đã cập nhật đổi link mới thành công!');
    } else {
      // In CREATE MODE -> add new link
      const newProduct: Product = {
        id: 'p_' + Date.now(),
        title,
        price: finalPrice,
        originalPrice: finalOriginalPrice,
        discountPercent: calculatedDiscount,
        image: finalImageUrl,
        categoryId,
        affiliateLink,
        platform,
        soldCount: Math.floor(Math.random() * 500) + 12, // Random starting sales count
        description,
        isSuggested,
        isDirectProduct,
        videoUrl,
        postDate: postDate || '27/05/2026',
        attachedOnlineProductId: attachedOnlineProductId || undefined
      };
      onAddProduct(newProduct);
      setSuccessMsg('Đã lưu & đăng tải sản phẩm tiếp thị mới thành công!');
    }
    
    // Reset Form
    setTitle('');
    setPrice(0);
    setOriginalPrice(0);
    setImage('');
    setRawLinkInput('');
    setDescription('');
    setPasteTextInput('');
    setPreviewImgBase64('');
    setScannedImages([]);
    setVideoUrl('');
    setPostDate('');
    setIsSuggested(false);
    setAttachedOnlineProductId('');
    setErrorMsg('');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Turn edit mode on for a specfic product
  const startEditProduct = (item: Product) => {
    setEditingProduct(item);
    setTitle(item.title);
    setPrice(item.price);
    setOriginalPrice(item.originalPrice);
    setImage(item.image);
    setCategoryId(item.categoryId);
    setPlatform(item.platform);
    setAffiliateLink(item.affiliateLink);
    setDescription(item.description || '');
    setIsSuggested(item.isSuggested || false);
    setIsDirectProduct(item.isDirectProduct || false);
    setVideoUrl(item.videoUrl || '');
    setPostDate(item.postDate || '');
    setAttachedOnlineProductId(item.attachedOnlineProductId || '');
    
    // Smooth scroll back to form top
    window.scrollTo({ top: 150, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setTitle('');
    setPrice(0);
    setOriginalPrice(0);
    setImage('');
    setCategoryId(categories[0]?.id || '1');
    setPlatform('shopee');
    setAffiliateLink('');
    setDescription('');
    setIsSuggested(false);
    setIsDirectProduct(false);
    setScannedImages([]);
    setVideoUrl('');
    setAttachedOnlineProductId('');
  };

  // Helper for quick image suggestions
  const setQuickImage = (url: string) => {
    setImage(url);
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto py-6 px-4">
      {/* Mini Breadcrumbs & Log Out */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <span>Quản Lý Hệ Thống Thiết Lập</span>
            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">Admin Mode</span>
          </h2>
          <p className="text-gray-500 text-xs mt-0.5 font-medium">Đăng sản phẩm tiếp thị, đổi link affiliate, lưu link, theo dõi nhu cầu khách hàng.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowPublicLinkModal(true)}
            className="flex items-center gap-2 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-4 py-2 border border-indigo-100 rounded-md shadow-sm transition-all font-bold cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5" /> Link cửa hàng / QR
          </button>
          <button 
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center gap-2 text-xs bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-shopee-orange px-4 py-2 border rounded-md shadow-sm transition-all font-semibold cursor-pointer"
          >
            <Key className="w-3.5 h-3.5" /> {adminRole === 'super' ? 'Đổi mật khẩu Admin' : 'Cài đặt mật khẩu'}
          </button>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 text-xs bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 px-4 py-2 border rounded-md shadow-sm transition-all font-semibold cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Đăng Xuất Admin
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Tổng lượt truy cập" value={stats.totalVisitors.toLocaleString()} icon={<Users className="w-5 h-5" />} color="bg-blue-100 text-blue-600" trend="+12.5%" />
        <StatCard title="Người dùng trực tuyến" value={stats.activeUsers.toLocaleString()} icon={<Activity className="w-5 h-5" />} color="bg-green-100 text-green-600" />
        <StatCard title="Tỷ lệ chuyển đổi" value={`${stats.conversionRate}%`} icon={<Target className="w-5 h-5" />} color="bg-purple-100 text-purple-600" trend="+1.2%" />
        <StatCard title="Ngành hàng top 1" value={stats.popularCategory} icon={<BarChart3 className="w-5 h-5" />} color="bg-orange-100 text-shopee-orange" />
      </div>

      {/* Modern Administrative Tab Selectors */}
      <div className="flex border-b border-gray-200 mb-6 text-xs gap-3 overflow-x-auto whitespace-nowrap pb-1">
        <button 
          onClick={() => setAdminTab('listings')}
          className={`pb-3 px-4 font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${adminTab === 'listings' ? 'border-shopee-orange text-shopee-orange' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
        >
          📦 Đăng bài & Quản lý link ({products.length})
        </button>
        <button 
          onClick={() => setAdminTab('analytics')}
          className={`pb-3 px-4 font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer relative ${adminTab === 'analytics' ? 'border-shopee-orange text-shopee-orange' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
        >
          👥 Khách hàng & Phân tích AI
          {buyers.length > 0 && (
            <span className="ml-1.5 bg-[#ee4d2d] text-white text-[9px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
              {buyers.length}
            </span>
          )}
        </button>
        <button 
          onClick={() => setAdminTab('social')}
          className={`pb-3 px-4 font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${adminTab === 'social' ? 'border-shopee-orange text-shopee-orange' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
        >
          📱 Liên kết MXH & Cửa hàng
        </button>
        <button 
          onClick={() => setAdminTab('online_campaigns')}
          className={`pb-3 px-4 font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer relative ${adminTab === 'online_campaigns' ? 'border-shopee-orange text-shopee-orange' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
        >
          🎓 Sản Phẩm Trực Tuyến & Quà Tặng ({onlineProducts.length})
        </button>
        <button 
          onClick={() => setAdminTab('gemini_keys')}
          className={`pb-3 px-4 font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer relative ${adminTab === 'gemini_keys' ? 'border-shopee-orange text-shopee-orange' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
        >
          🔑 Cấu Hình Khóa AI Gemini ({geminiKeys ? geminiKeys.length : 0})
        </button>
        <button 
          onClick={() => setAdminTab('database')}
          className={`pb-3 px-4 font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer relative ${adminTab === 'database' ? 'border-shopee-orange text-shopee-orange' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
        >
          💾 Lưu Trữ Đám Mây (Supabase)
        </button>
        {adminRole === 'super' && (
          <button 
            onClick={() => setAdminTab('licenses')}
            className={`pb-3 px-4 font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer relative ${adminTab === 'licenses' ? 'border-shopee-orange text-shopee-orange' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            🛡️ Bán Web / Giấy phép
          </button>
        )}
      </div>

      {adminTab === 'listings' && (
        /* ================= TAB 1: LISTINGS MANAGEMENT ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Management / Addition Forms */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Smart parse link */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-5 space-y-4">
            <div>
              <h3 className="font-bold text-gray-800 text-sm mb-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
                Trợ Lý Sáng Tạo Content & Quét Link Bằng AI
              </h3>
              <p className="text-[11px] text-gray-500">Dán link sản phẩm Shopee, TikTok, Lazada hoặc gõ tên sản phẩm, sau đó dùng AI để tự bóc tách & viết kịch bản chào hàng.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-extrabold text-gray-500 mb-1">
                  Đường dẫn liên kết / Tên sản phẩm nguồn
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Dán link sản học gõ tên sản phẩm..."
                    className="flex-1 border border-gray-300 rounded-sm px-3 py-1.5 text-xs focus:outline-none focus:border-shopee-orange"
                    value={rawLinkInput}
                    onChange={e => setRawLinkInput(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={handleParseLink}
                    className="bg-gray-750 hover:bg-black text-white px-2.5 py-1.5 rounded-sm text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer"
                    title="Đọc nhanh tên từ link cục bộ"
                  >
                    Đọc Nháp Link
                  </button>
                </div>
              </div>

              {/* Paste Textarea for raw content */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-extrabold text-gray-500 mb-1 flex justify-between">
                  <span>Dán văn bản chi tiết sản phẩm sao chép được *</span>
                  <span className="text-gray-400 font-normal normal-case">Tự động bóc tách thông số</span>
                </label>
                <textarea 
                  rows={2}
                  placeholder="Dán mô tả thuộc tính, giá cả, hoặc chữ copy từ Shopee/TikTok vào đây..."
                  className="w-full border border-gray-300 rounded-sm px-3 py-1.5 text-xs focus:outline-none focus:border-shopee-orange bg-gray-50/30"
                  value={pasteTextInput}
                  onChange={e => setPasteTextInput(e.target.value)}
                  onPaste={(e) => {
                    const clipboardData = e.clipboardData;
                    if (!clipboardData) return;

                    // 1. Check for binary images (like direct screenshots)
                    const items = clipboardData.items;
                    let foundImage = false;
                    for (let i = 0; i < items.length; i++) {
                      if (items[i].type.indexOf('image') !== -1) {
                        const file = items[i].getAsFile();
                        if (file) {
                          foundImage = true;
                          const reader = new FileReader();
                          reader.onload = async (event) => {
                            if (event.target?.result) {
                              const b64 = event.target.result as string;
                              const compressed = await compressImage(b64);
                              setPreviewImgBase64(compressed);
                              setImage(compressed);
                              setSuccessMsg('📋 Đã nhận & tối ưu hóa ảnh từ khay nhớ tạm!');
                              setTimeout(() => setSuccessMsg(''), 3000);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }
                    }

                    // 2. Extract image from HTML if pasting rich text containing images from Shopee/TikTok
                    if (!foundImage) {
                      const html = clipboardData.getData('text/html');
                      if (html) {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');
                        const imgElements = Array.from(doc.querySelectorAll('img'));
                        
                        const relevantImages: string[] = [];
                        const seenSrcs = new Set<string>();

                        for (const el of imgElements) {
                          const src = el.src?.trim() || el.getAttribute('data-src')?.trim() || el.getAttribute('src')?.trim();
                          if (!src) continue;

                          // Skip duplicates
                          if (seenSrcs.has(src)) continue;
                          seenSrcs.add(src);

                          const s = src.toLowerCase();
                          const alt = (el.getAttribute('alt') || '').toLowerCase();
                          const cls = (el.className || '').toLowerCase();
                          const id = (el.getAttribute('id') || '').toLowerCase();

                          // Skip small tracking elements or decorative icons
                          const wAttr = el.getAttribute('width');
                          const hAttr = el.getAttribute('height');
                          if (wAttr && parseInt(wAttr, 10) < 120) continue;
                          if (hAttr && parseInt(hAttr, 10) < 120) continue;

                          // Skip very short base64 lines that are obviously tiny loaders or pixels
                          if (s.startsWith('data:image/') && s.length < 2000) {
                            continue;
                          }

                          // Irrelevant keywords check (for review stars, avatars, badges, UI arrows, social logos)
                          const irrelevantKeywords = [
                            'icon', 'avatar', 'logo', 'star', 'badge', 'banner', 'rating', 'decor', 'footer', 'header',
                            'chevron', 'loading', 'arrow', 'gif', 'smiley', 'emoji', 'pixel', 'spacer', 'sprite',
                            'btn', 'button', 'close', 'play-button', 'inactive', 'overlay', 'shopee-rating', 'heart',
                            'tick', 'comment', 'user', 'mall_badge', 'like', 'dislike', 'seller', 'shop', 'voucher',
                            'policy', 'trust', 'free_shipping', 'star-active', 'star-inactive', 'facebook', 'youtube',
                            'tiktok-logo', 'shopee-logo', 'lazada-logo', 'play_icon', 'play-icon', 'arrow-right', 'arrow-left'
                          ];

                          let isCool = true;
                          for (const kw of irrelevantKeywords) {
                            if (s.includes(kw) || alt.includes(kw) || cls.includes(kw) || id.includes(kw)) {
                              isCool = false;
                              break;
                            }
                          }

                          if (isCool) {
                            relevantImages.push(src);
                          }
                        }

                        const finalImages = relevantImages.slice(0, 2);

                        if (finalImages.length > 0) {
                          setScannedImages(finalImages);
                          const primaryImg = finalImages[0];
                          if (primaryImg.startsWith('data:image/')) {
                            compressImage(primaryImg).then(compressed => {
                              setPreviewImgBase64(compressed);
                              setImage(compressed);
                            });
                          } else {
                            setPreviewImgBase64(primaryImg);
                            setImage(primaryImg);
                          }
                          setSuccessMsg(`📋 Đã chọn lọc & hiển thị ${finalImages.length} ảnh sản phẩm liên quan nhất!`);
                          setTimeout(() => setSuccessMsg(''), 3000);
                        } else {
                          // Fallback to the first image in doc if absolutely nothing is filtered as relevant
                          const firstImg = imgElements.find(el => el.src);
                          if (firstImg) {
                            const src = firstImg.src;
                            setScannedImages([src]);
                            if (src.startsWith('data:image/')) {
                              compressImage(src).then(compressed => {
                                setPreviewImgBase64(compressed);
                                setImage(compressed);
                              });
                            } else {
                              setPreviewImgBase64(src);
                              setImage(src);
                            }
                          }
                        }
                      }
                    }
                  }}
                />
              </div>

              {/* Multimodal screenshot drag paste block */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-extrabold text-gray-500 mb-1 flex justify-between">
                  <span>Dán ảnh chụp màn hình sàn gốc (Clipboard) 📋</span>
                  <span className="text-shopee-orange font-bold normal-case">Hỗ trợ chụp & ấn Ctrl+V liên tục</span>
                </label>
                <div 
                  className={`border-2 border-dashed rounded p-3 text-center transition-all bg-gray-50/40 cursor-pointer focus:outline-none focus:ring-1 focus:ring-shopee-orange ${
                    previewImgBase64 ? 'border-emerald-500 bg-emerald-55/10' : 'border-gray-250 hover:border-shopee-orange'
                  }`}
                  onClick={(e) => {
                    // Click focuses the container so that paste is immediately captured
                    e.currentTarget.focus();
                  }}
                  onPaste={(e) => {
                    const clipboardData = e.clipboardData;
                    if (!clipboardData) return;

                    // 1. Check for binary images (like direct screenshots)
                    const items = clipboardData.items;
                    let foundImage = false;
                    for (let i = 0; i < items.length; i++) {
                      if (items[i].type.indexOf('image') !== -1) {
                        const file = items[i].getAsFile();
                        if (file) {
                          foundImage = true;
                          const reader = new FileReader();
                          reader.onload = async (event) => {
                            if (event.target?.result) {
                              const b64 = event.target.result as string;
                              const compressed = await compressImage(b64);
                              setPreviewImgBase64(compressed);
                              setImage(compressed);
                              setScannedImages(prev => {
                                if (prev.includes(compressed)) return prev;
                                return [...prev, compressed].slice(0, 2);
                              });
                              setSuccessMsg('📋 Đã nhận & tối ưu hóa ảnh chụp màn hình từ khay nhớ tạm!');
                              setTimeout(() => setSuccessMsg(''), 3000);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }
                    }

                    // 2. Extract image from HTML if pasting rich text containing images from Shopee/TikTok
                    if (!foundImage) {
                      const html = clipboardData.getData('text/html');
                      if (html) {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');
                        const imgElements = Array.from(doc.querySelectorAll('img'));
                        
                        const relevantImages: string[] = [];
                        const seenSrcs = new Set<string>();

                        for (const el of imgElements) {
                          const src = el.src?.trim() || el.getAttribute('data-src')?.trim() || el.getAttribute('src')?.trim();
                          if (!src) continue;

                          // Skip duplicates
                          if (seenSrcs.has(src)) continue;
                          seenSrcs.add(src);

                          const s = src.toLowerCase();
                          const alt = (el.getAttribute('alt') || '').toLowerCase();
                          const cls = (el.className || '').toLowerCase();
                          const id = (el.getAttribute('id') || '').toLowerCase();

                          // Skip small tracking elements or decorative icons
                          const wAttr = el.getAttribute('width');
                          const hAttr = el.getAttribute('height');
                          if (wAttr && parseInt(wAttr, 10) < 120) continue;
                          if (hAttr && parseInt(hAttr, 10) < 120) continue;

                          // Skip very short base64 lines that are obviously tiny loaders or pixels
                          if (s.startsWith('data:image/') && s.length < 2000) {
                            continue;
                          }

                          // Irrelevant keywords check (for review stars, avatars, badges, UI arrows, social logos)
                          const irrelevantKeywords = [
                            'icon', 'avatar', 'logo', 'star', 'badge', 'banner', 'rating', 'decor', 'footer', 'header',
                            'chevron', 'loading', 'arrow', 'gif', 'smiley', 'emoji', 'pixel', 'spacer', 'sprite',
                            'btn', 'button', 'close', 'play-button', 'inactive', 'overlay', 'shopee-rating', 'heart',
                            'tick', 'comment', 'user', 'mall_badge', 'like', 'dislike', 'seller', 'shop', 'voucher',
                            'policy', 'trust', 'free_shipping', 'star-active', 'star-inactive', 'facebook', 'youtube',
                            'tiktok-logo', 'shopee-logo', 'lazada-logo', 'play_icon', 'play-icon', 'arrow-right', 'arrow-left'
                          ];

                          let isCool = true;
                          for (const kw of irrelevantKeywords) {
                            if (s.includes(kw) || alt.includes(kw) || cls.includes(kw) || id.includes(kw)) {
                              isCool = false;
                              break;
                            }
                          }

                          if (isCool) {
                            relevantImages.push(src);
                          }
                        }

                        const finalImages = relevantImages.slice(0, 2);

                        if (finalImages.length > 0) {
                          setScannedImages(finalImages);
                          const primaryImg = finalImages[0];
                          if (primaryImg.startsWith('data:image/')) {
                            compressImage(primaryImg).then(compressed => {
                              setPreviewImgBase64(compressed);
                              setImage(compressed);
                            });
                          } else {
                            setPreviewImgBase64(primaryImg);
                            setImage(primaryImg);
                          }
                          setSuccessMsg(`📋 Đã chọn lọc & hiển thị ${finalImages.length} ảnh sản phẩm liên quan nhất!`);
                          setTimeout(() => setSuccessMsg(''), 3000);
                        } else {
                          // Fallback to the first image in doc if absolutely nothing is filtered as relevant
                          const firstImg = imgElements.find(el => el.src);
                          if (firstImg) {
                            const src = firstImg.src;
                            setScannedImages([src]);
                            if (src.startsWith('data:image/')) {
                              compressImage(src).then(compressed => {
                                setPreviewImgBase64(compressed);
                                setImage(compressed);
                              });
                            } else {
                              setPreviewImgBase64(src);
                              setImage(src);
                            }
                          }
                        }
                      }
                    }
                  }}
                  tabIndex={0}
                  title="Để dán ảnh: Nhấp chuột vào ô này, chụp màn hình Shopee/TikTok rồi dùng tổ hợp phím Ctrl+V để dán."
                >
                  {scannedImages.length > 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-1">
                      <div className="flex flex-wrap items-center justify-center gap-4">
                        {scannedImages.slice(0, 2).map((imgUrl, idx) => {
                          const isActive = previewImgBase64 === imgUrl;
                          return (
                            <div 
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (imgUrl.startsWith('data:image/')) {
                                  compressImage(imgUrl).then(compressed => {
                                    setPreviewImgBase64(compressed);
                                    setImage(compressed);
                                  });
                                } else {
                                  setPreviewImgBase64(imgUrl);
                                  setImage(imgUrl);
                                }
                              }}
                              className={`relative group cursor-pointer transition-all border-2 rounded-md p-1 bg-white shadow-xs ${
                                isActive 
                                  ? 'border-shopee-orange ring-2 ring-orange-100 scale-102' 
                                  : 'border-gray-200 hover:border-gray-350 opacity-80 hover:opacity-100'
                              }`}
                            >
                              <img 
                                src={imgUrl} 
                                className="h-24 w-24 object-cover rounded-sm" 
                                alt={`Ảnh chọn lọc ${idx + 1}`} 
                              />
                              <div className="absolute top-1 left-1 bg-black/60 text-white font-mono text-[9px] px-1 rounded-xs">
                                Ảnh {idx + 1}
                              </div>
                              {isActive && (
                                <div className="absolute -top-1.5 -right-1.5 bg-shopee-orange text-white rounded-full p-0.5 shadow-sm">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="flex gap-3 justify-center items-center">
                        <span className="text-[10.5px] text-emerald-600 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          ✓ Chọn ảnh (Đã lọc rác Shopee)
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewImgBase64('');
                            setScannedImages([]);
                            if (image === previewImgBase64) setImage('');
                          }}
                          className="text-[10px] text-red-500 hover:underline font-bold bg-white px-2 py-0.5 rounded border border-gray-200 shadow-2xs hover:bg-gray-50"
                        >
                          Xóa tất cả ảnh
                        </button>
                      </div>
                      <p className="text-[9px] text-gray-400 font-normal">
                        Mẹo: Click vào khoảng trống của ô này rồi nhấn <span className="text-shopee-orange font-bold">Ctrl+V</span> để dán ảnh mới đè lên bất cứ lúc nào!
                      </p>
                    </div>
                  ) : previewImgBase64 ? (
                    <div className="flex flex-col items-center justify-center gap-2">
                      <img 
                        src={previewImgBase64} 
                        className="h-28 max-w-full object-contain rounded border border-emerald-200 shadow-md" 
                        alt="Screenshot sản phẩm" 
                      />
                      <div className="flex gap-2.5 items-center">
                        <span className="text-[10px] text-emerald-600 font-bold">✓ Đã chụp và đính kèm ảnh thành công!</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewImgBase64('');
                            setScannedImages([]);
                            if (image === previewImgBase64) setImage('');
                          }}
                          className="text-[10px] text-red-500 hover:underline font-bold bg-white px-2 py-0.5 rounded border"
                        >
                          Xóa
                        </button>
                      </div>
                      <p className="text-[9px] text-gray-400 font-normal">
                        Mẹo: Click vào khoảng trống của ô này và nhấn <span className="text-shopee-orange font-bold">Ctrl+V</span> để dán ảnh chụp màn hình mới đè lên!
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4 text-gray-500 bg-gray-50/20 rounded">
                      <Image className="w-6 h-6 mb-1 text-shopee-orange animate-pulse" />
                      <p className="text-[11.5px] font-bold text-gray-800">
                        Nhấp chuột vào đây & Nhấn <span className="text-shopee-orange">Ctrl+V</span> để dán ảnh sản phẩm
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1 max-w-xs leading-normal select-none">
                        Chụp ảnh màn hình (hoặc sao chép ảnh trên web), sau đó chọn ô này và dán trực tiếp.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 grid grid-cols-1 gap-1.5">
                <button 
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={isGeneratingAI}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-2 px-3 rounded text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isGeneratingAI ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Gemini đang lên bài viết...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>🪄 Dùng AI Viết Bài & Tìm Ảnh Tự Động</span>
                    </>
                  )}
                </button>
                <p className="text-[9.5px] text-center text-gray-400">
                  (Sử dụng công nghệ <strong>Gemini 3.5-flash</strong> tự viết bài & map hình ảnh tương ứng)
                </p>
              </div>
            </div>

            {/* Explanation box on scraping feasibility */}
            <div className="p-3 bg-blue-50/70 border border-blue-200/50 rounded text-[11px] text-gray-700 leading-relaxed">
              <strong className="text-blue-800 font-bold block mb-1">💡 Cơ Chế Hoạt Động & Tính Khả Thi:</strong>
              <ul className="list-disc pl-4 space-y-1.5 text-gray-600">
                <li>
                  <strong className="text-gray-800">Rào cản CORS & Bảo mật:</strong> Các sàn lớn chặn tải HTML trực tiếp từ trình duyệt của khách (<span className="font-mono text-[10px] bg-white px-1 py-0.5 rounded border border-gray-200">CORS</span>). Do đó, việc tự tải html trực tiếp tại trình duyệt là không khả thi.
                </li>
                <li>
                  <strong className="text-gray-800">Cơ chế thông minh siêu tốc:</strong> Phần mềm giải quyết bằng cách đọc <strong className="text-orange-600">Vietnamese URL Slug</strong> để tách thành tên thô chính xác 95%.
                </li>
                <li>
                  <strong className="text-gray-800">Thăng hoa với Trợ lý Gemini AI:</strong> Khi bấm nút AI viết bài, hệ thống kết hợp khóa Gemini tự động viết tiêu đề giật gân, soạn bài 2-3 đoạn ngắn bắt mắt kèm biểu tượng cảm xúc nhộn nhịp, tự động map hình ảnh chất lượng cao để sẵn sàng bán sản phẩm thật!
                </li>
              </ul>
            </div>
          </div>

          {/* Clean dashboard command center */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-5 space-y-3.5">
            <div>
              <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider flex items-center gap-1.5 text-red-600">
                <XCircle className="w-4 h-4 text-red-500" />
                Vùng Dọn Dẹp Dữ Liệu Demo - Làm Thật
              </h3>
              <p className="text-[11px] text-gray-400 mt-1 leading-snug">
                Sử dụng các lối tắt bên dưới để xóa các sản phẩm mẫu có sẵn, danh sách khách hàng mẫu và từ khóa thử nghiệm để sẵn sàng đưa website vào hoạt động kinh doanh thật!
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-1">
              <button 
                type="button"
                onClick={() => {
                  if (window.confirm("⚠️ Bạn có chắc chắn muốn XÓA SẠCH toàn bộ danh sách sản phẩm hiện tại? Hành động này không thể hoàn tác.")) {
                    onClearAllProducts();
                    setSuccessMsg("Đã xóa sạch toàn bộ sản phẩm!");
                  }
                }}
                className="w-full bg-red-50 hover:bg-red-100/80 text-red-700 text-[11px] font-bold py-2 border border-red-200/70 rounded transition-colors text-center cursor-pointer"
              >
                🗑️ Xóa toàn bộ sản phẩm ({products.length})
              </button>

              <button 
                type="button"
                onClick={() => {
                  if (window.confirm("⚠️ Bạn có chắc chắn muốn XÓA SẠCH toàn bộ lịch sử phân tích từ khóa tìm kiếm demo?")) {
                    onClearSearchTracks();
                    setSuccessMsg("Đã hoàn thành làm trống dữ liệu phân tích từ khóa!");
                  }
                }}
                className="w-full bg-orange-50 hover:bg-orange-100/80 text-orange-700 text-[11px] font-bold py-2 border border-orange-200/70 rounded transition-colors text-center cursor-pointer"
              >
                📊 Xóa phân tích từ khóa hot ({searchTracks.length})
              </button>

              <button 
                type="button"
                onClick={() => {
                  if (window.confirm("⚠️ Bạn có chắc chắn muốn LÀM TRỐNG cơ sở dữ liệu khách đăng ký nhận quà để nhận dữ liệu thật?")) {
                    onClearAllBuyers();
                    setSuccessMsg("Đã hoàn thành làm trống danh sách khách hàng!");
                  }
                }}
                className="w-full bg-emerald-50 hover:bg-emerald-100/80 text-emerald-850 text-[11px] font-bold py-2 border border-emerald-200/70 rounded transition-all text-center cursor-pointer"
              >
                👥 Xóa danh sách khách hàng mẫu ({buyers.length})
              </button>
            </div>
          </div>

          {/* Quản lý danh mục ngành hàng */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-5 space-y-3.5">
            <div>
              <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider flex items-center gap-1.5 text-indigo-600">
                <PlusCircle className="w-4 h-4 text-indigo-500" />
                Quản Lý Danh Mục Ngành Hàng ({categories.length})
              </h3>
              <p className="text-[11.5px] text-gray-400 mt-1 leading-snug">
                Thêm danh mục ngành hàng mới để bán những dòng sản phẩm chưa có trên web.
              </p>
            </div>

            {/* Form thêm ngành hàng */}
            <div className="flex gap-2">
              <input 
                type="text" 
                id="new-category-input"
                placeholder="Tên ngành hàng..." 
                className="flex-1 border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const btn = document.getElementById('btn-add-cat');
                    if (btn) btn.click();
                  }
                }}
              />
              <button 
                type="button"
                id="btn-add-cat"
                onClick={() => {
                  const input = document.getElementById('new-category-input') as HTMLInputElement;
                  if (!input || !input.value.trim()) {
                    alert('Vui lòng nhập tên ngành hàng!');
                    return;
                  }
                  const newCatName = input.value.trim();
                  const exist = categories.some(c => c.name.toLowerCase() === newCatName.toLowerCase());
                  if (exist) {
                    alert('Ngành hàng này đã tồn tại!');
                    return;
                  }
                  const newCatObj = {
                    id: 'cat_' + Date.now(),
                    name: newCatName,
                    iconName: 'ShoppingBag'
                  };
                  if (onSetCategories) {
                    onSetCategories(prev => [...prev, newCatObj]);
                    input.value = '';
                    setSuccessMsg(`Đã thêm danh mục "${newCatName}" thành công!`);
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded text-xs transition-colors cursor-pointer"
              >
                + Thêm
              </button>
            </div>

            {/* Danh sách ngành hàng hiện tại */}
            <div className="max-h-40 overflow-y-auto border border-gray-150 rounded text-xs">
              <div className="divide-y divide-gray-100 bg-white">
                {categories.map(cat => (
                  <div key={cat.id} className="flex justify-between items-center px-2.5 py-1.5 hover:bg-gray-50/50">
                    <span className="font-semibold text-gray-700">{cat.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Bạn có chắc chắn muốn xóa ngành hàng "${cat.name}"?`)) {
                          if (onSetCategories) {
                            onSetCategories(prev => prev.filter(c => c.id !== cat.id));
                            setSuccessMsg(`Đã xóa ngành hàng "${cat.name}"!`);
                          }
                        }
                      }}
                      className="text-red-500 hover:text-red-700 font-bold text-[10px] cursor-pointer"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form Create Product */}
          <div className={`bg-white rounded-md shadow-sm border p-5 transition-all duration-300 ${editingProduct ? 'border-orange-400 bg-orange-50/10 ring-1 ring-orange-200' : 'border-gray-200'}`}>
            <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2 pb-2 border-b">
              {editingProduct ? (
                <>
                  <Edit2 className="w-4 h-4 text-orange-600 animate-pulse" />
                  <span>Sửa & Cập Nhật Thay Đổi Link</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-green-605" />
                  <span>Đăng Bài Viết Sản Phẩm Mới</span>
                </>
              )}
            </h3>

            {successMsg && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-sm text-xs font-medium">
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-800 p-3 rounded-sm text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <div className="mb-5 p-4 border border-blue-200 bg-blue-50 rounded-sm">
              <h3 className="text-xs font-bold text-blue-800 flex items-center gap-1 mb-2">
                <Wand2 className="w-4 h-4" /> Nhập Nhanh Nhờ AI Khác (ChatGPT / Claude V.v...)
              </h3>
              <p className="text-[11px] text-blue-700 mb-3">
                Nếu công cụ AI tích hợp sẵn quá tải, bạn có thể sao chép đoạn lệnh Prompt bên dưới sang ChatGPT/Gemini ngoài để nhờ AI viết nội dung. Sau khi có kết quả, dán vào ô bên dưới, hệ thống sẽ tự bóc tách và điền vào form!
              </p>
              <button 
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`Bạn là một chuyên gia Copywriter. Hãy đọc nội dung/link sản phẩm tôi cung cấp sau đó viết một bài tiếp thị hấp dẫn và TRẢ VỀ THEO ĐÚNG ĐỊNH DẠNG JSON SAU (Không in ra bất cứ chữ nào khác bên ngoài khối JSON này):
{
  "title": "(Tên sản phẩm, viết lại cho cuốn hút, độ dài vừa phải)",
  "price": (Giá bán thực tế bằng số nguyên, không có chữ. VD: 150000),
  "originalPrice": (Giá gốc bằng số nguyên, VD: 200000),
  "description": "(Nội dung quảng cáo bán hàng cực cháy, dùng icon, chèn vài thông tin gây FOMO, \n xuống dòng hợp lý bằng \\n)"
}`);
                  setSuccessMsg('Đã copy câu lệnh Prompt! Giờ hãy dán sang ChatGPT/Gemini để yêu cầu nó viết.');
                  setTimeout(() => setSuccessMsg(''), 4000);
                }}
                className="mb-3 px-3 py-1.5 bg-blue-600 text-white text-[11px] font-bold shadow-sm rounded-sm hover:bg-blue-700 transition"
              >
                📋 Copy Lệnh Chuyên Gia & Dán Vào ChatGPT
              </button>

              <textarea
                placeholder="Dán toàn bộ nội dung JSON hoặc chữ mà AI trả về vào đây..."
                className="w-full h-20 border border-blue-200 rounded-sm px-3 py-2 text-[11px] focus:outline-none focus:border-blue-500 font-mono text-gray-700 bg-white"
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) return;
                  try {
                    const match = val.match(/\{[\s\S]*?\}/);
                    if (match) {
                      const parsed = JSON.parse(match[0]);
                      if (parsed.title) setTitle(parsed.title);
                      if (parsed.price) setPrice(Number(parsed.price));
                      if (parsed.originalPrice) setOriginalPrice(Number(parsed.originalPrice));
                      if (parsed.description) setDescription(parsed.description);
                      setSuccessMsg('Đã bóc tách và tự động điền form thành công!');
                      setTimeout(() => setSuccessMsg(''), 3000);
                    } else {
                      // Basic regex fallback
                      const pMatch = val.match(/(?:\"?price\"?|\Giá bán)[^\d]*(\d+[\d,.]*)/i);
                      if (pMatch) setPrice(Number(pMatch[1].replace(/\D/g, '')));
                      
                      const tMatch = val.match(/(?:\"?title\"?|\Tên sản phẩm):?\s*"?([^"\n]+)/i);
                      if (tMatch) setTitle(tMatch[1].trim());

                      const opMatch = val.match(/(?:\"?originalPrice\"?|\Giá gốc)[^\d]*(\d+[\d,.]*)/i);
                      if (opMatch) setOriginalPrice(Number(opMatch[1].replace(/\D/g, '')));
                    }
                  } catch (err) {
                    console.error("Paste parsing error", err);
                  }
                }}
              />
            </div>

            <form onSubmit={handleCreateProduct} noValidate className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tên sản phẩm *
                </label>
                <input 
                  type="text" 
                  placeholder="Ví dụ: Áo sơ mi voan lụa tay bồng..." 
                  className="w-full border border-gray-300 rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-shopee-orange focus:ring-1 focus:ring-shopee-orange"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Giá bán mới (VND) *
                  </label>
                  <input 
                    type="number" 
                    placeholder="Ví dụ: 120000" 
                    className="w-full border border-gray-300 rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-shopee-orange"
                    value={price || ''}
                    onChange={e => setPrice(Number(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Giá gốc ban đầu (VND)
                  </label>
                  <input 
                    type="number" 
                    placeholder="Ví dụ: 250000" 
                    className="w-full border border-gray-300 rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-shopee-orange"
                    value={originalPrice || ''}
                    onChange={e => setOriginalPrice(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Danh mục ngành hàng
                  </label>
                  <select 
                    className="w-full border border-gray-300 rounded-sm px-2 py-2 text-xs focus:outline-none focus:border-shopee-orange bg-white"
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Sàn phân phối
                  </label>
                  <select 
                    className="w-full border border-gray-300 rounded-sm px-2 py-2 text-xs focus:outline-none focus:border-shopee-orange bg-white"
                    value={platform}
                    onChange={e => setPlatform(e.target.value as any)}
                  >
                    <option value="shopee">Shopee</option>
                    <option value="tiktok">TikTok Shop</option>
                    <option value="lazada">Lazada</option>
                    <option value="other">Trang cá nhân/Khác</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Đường dẫn liên kết tiếp thị (Affiliate Link) *
                </label>
                <input 
                  type="text" 
                  placeholder="Dán mã link affiliate của bạn..." 
                  className="w-full border border-gray-300 rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-shopee-orange"
                  value={affiliateLink}
                  onChange={e => setAffiliateLink(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex justify-between">
                  <span>Địa chỉ URL của ảnh minh họa *</span>
                </label>
                <input 
                  type="text" 
                  placeholder="https://images.unsplash.com/photo-..." 
                  className="w-full border border-gray-300 rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-shopee-orange"
                  value={image}
                  onChange={e => setImage(e.target.value)}
                  required
                />
                
                {/* Image Quick Presets */}
                <div className="mt-2">
                  <span className="text-[10px] text-gray-500 font-bold block mb-1">Chọn ảnh mẫu nhanh (gợi ý):</span>
                  <div className="flex gap-2 flex-wrap">
                    <button 
                      type="button"
                      onClick={() => setQuickImage('https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400')}
                      className="text-[10px] bg-gray-100 hover:bg-orange-100 border px-2 py-1 rounded"
                    >
                      👟 Giày Thể Thao
                    </button>
                    <button 
                      type="button"
                      onClick={() => setQuickImage('https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=400')}
                      className="text-[10px] bg-gray-100 hover:bg-orange-100 border px-2 py-1 rounded"
                    >
                      👗 Váy Thiết Kế
                    </button>
                    <button 
                      type="button"
                      onClick={() => setQuickImage('https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400')}
                      className="text-[10px] bg-gray-100 hover:bg-orange-100 border px-2 py-1 rounded"
                    >
                      🧴 Mỹ Phẩm
                    </button>
                    <button 
                      type="button"
                      onClick={() => setQuickImage('https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=400')}
                      className="text-[10px] bg-gray-100 hover:bg-orange-100 border px-2 py-1 rounded"
                    >
                      🎧 Tai Nghe
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex justify-between">
                  <span>Video sản phẩm (Video/Clip minh họa) 🎬</span>
                  <span className="text-gray-400 font-normal normal-case">Tải lên hoặc dán link video</span>
                </label>
                <div className="space-y-2">
                  <input 
                    type="text" 
                    placeholder="Dán link video liên kết (ví dụ: https://www.w3schools.com/html/mov_bbb.mp4)..." 
                    className="w-full border border-gray-300 rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-shopee-orange font-mono"
                    value={videoUrl}
                    onChange={e => setVideoUrl(e.target.value)}
                  />
                  
                  <div className="flex items-center gap-2">
                    <input 
                      type="file" 
                      accept="video/*"
                      className="hidden" 
                      id="advanced-video-picker"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 20 * 1024 * 1024) {
                            alert("Kích thước video tối đa là 20MB để đảm bảo hiệu năng tải trang.");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              setVideoUrl(event.target.result as string);
                              setSuccessMsg('🎞️ Đã tải và đồng bộ video từ máy tính thành công!');
                              setTimeout(() => setSuccessMsg(''), 3000);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <label 
                      htmlFor="advanced-video-picker"
                      className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-1.5 border rounded font-semibold cursor-pointer shadow-2xs transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Tải clip dưới máy lên
                    </label>

                    {videoUrl && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10.5px] text-emerald-600 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          ✓ Đã gán video
                        </span>
                        <button
                          type="button"
                          onClick={() => setVideoUrl('')}
                          className="text-[10px] text-red-500 hover:underline font-bold bg-white px-2 py-0.5 rounded border shadow-2xs hover:bg-gray-50"
                        >
                          Xóa video
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {videoUrl && (
                  <div className="mt-2 p-2 bg-gray-50 border rounded flex flex-col items-center">
                    <span className="text-[10px] text-gray-500 self-start mb-1 font-bold">Xem trước video sản phẩm:</span>
                    <video 
                      key={videoUrl}
                      src={videoUrl} 
                      controls 
                      className="max-h-36 max-w-full rounded border bg-black"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Mô tả sản phẩm
                </label>
                <textarea 
                  rows={2}
                  placeholder="Chất vải dầy dặn, giặt không xù, phom dáng Hàn Quốc..." 
                  className="w-full border border-gray-300 rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-shopee-orange"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Ngày đăng bài (Ví dụ: 27/05/2026 hoặc Hôm nay)
                </label>
                <input 
                  type="text" 
                  placeholder="Điền ngày đăng bài hoặc bỏ trống để tự động lấy thời gian thực..." 
                  className="w-full border border-gray-300 rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-shopee-orange"
                  value={postDate}
                  onChange={e => setPostDate(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3 bg-orange-50/50 p-3 rounded border border-orange-100">
                <input 
                  type="checkbox" 
                  id="form-suggest_cb"
                  className="w-4 h-4 text-shopee-orange border-gray-300 rounded focus:ring-shopee-orange cursor-pointer"
                  checked={isSuggested}
                  onChange={e => setIsSuggested(e.target.checked)}
                />
                <label htmlFor="form-suggest_cb" className="text-xs font-bold text-gray-800 cursor-pointer select-none">
                  Hiển thị bài này ở mục "Gợi Ý Hôm Nay" trên trang chủ
                </label>
              </div>

              <div className="flex items-center gap-3 bg-indigo-50/50 p-3 rounded border border-indigo-100">
                <input 
                  type="checkbox" 
                  id="form-direct_cb"
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-600 cursor-pointer"
                  checked={isDirectProduct}
                  onChange={e => setIsDirectProduct(e.target.checked)}
                />
                <label htmlFor="form-direct_cb" className="text-xs font-bold text-gray-800 cursor-pointer select-none">
                  Sản phẩm Shop tự bán trực tiếp (Giao hàng tận nơi)
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Đính kèm sản phẩm số / Quà tặng 🎁 (Chọn nếu có):
                </label>
                <select 
                  className="w-full border border-gray-300 rounded-sm px-2 py-2 text-xs focus:outline-none focus:border-shopee-orange bg-white"
                  value={attachedOnlineProductId}
                  onChange={e => setAttachedOnlineProductId(e.target.value)}
                >
                  <option value="">-- Không đính kèm sản phẩm số/quà --</option>
                  {onlineProducts.map((op: any) => (
                    <option key={op.id} value={op.id}>
                      [{op.isFree ? '🎁 Quà' : '💰 Bán'}] {op.title}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-1">Khi đính kèm, khách mua hàng sẽ tự động nhận được link tải tài liệu này khi nhấn nút Mua.</p>
              </div>

              <div className="flex gap-2 mt-2">
                {editingProduct && (
                  <button 
                    type="button"
                    onClick={cancelEdit}
                    className="flex-1 bg-gray-150 hover:bg-gray-200 text-gray-700 py-2.5 rounded-sm text-xs font-bold tracking-wide transition-colors flex items-center justify-center cursor-pointer"
                  >
                    Hủy Sửa
                  </button>
                )}
                <button 
                  type="submit"
                  className="flex-[2] bg-shopee-orange hover:bg-shopee-orange-hover text-white py-2.5 rounded-sm text-xs font-bold tracking-wide transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  {editingProduct ? <CheckCircle2 className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                  <span>{editingProduct ? 'Lưu Thay Đổi Link' : 'Đăng & Lưu Sản Phẩm'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Manage Product Listings */}
        <div className="lg:col-span-7 space-y-6">

          {/* AI Strategy Suggestions (Retained asset) */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 p-4 border-b border-orange-100 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-shopee-orange" />
              <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wide">Đề xuất tối ưu hóa (AI)</h3>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-gray-50 rounded border border-gray-150">
                <span className="font-bold text-gray-800 block mb-1">🌸 Đẩy mạnh Thời Trang Nữ</span>
                <p className="text-gray-500 leading-relaxed">Bạn vừa thêm danh mục Thời Trang Nữ! Khách truy cập nữ chiếm 62% lưu lượng hàng đêm. Hãy ghim ít nhất 2 váy xinh vào "Gợi ý Hôm nay".</p>
              </div>
              <div className="p-3 bg-gray-50 rounded border border-gray-150">
                <span className="font-bold text-gray-800 block mb-1">⚡ Tối ưu tỷ lệ nhấp liên kết</span>
                <p className="text-gray-500 leading-relaxed">Sản phẩm có mô tả chi tiết kèm video thường có tỉ lệ click cao hơn 40%. Đăng kèm mô tả chân thực để giữ chân độc giả tốt nhất.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-gray-100 mb-4">
              <div>
                <h3 className="font-bold text-gray-800 text-sm">
                  Danh Sách Sản Phẩm Được Đăng ({products.length})
                </h3>
                <p className="text-xs text-gray-500">Nhấp <span className="text-orange-500 font-bold">★ Ngôi sao và Bật</span> để đưa vào "Gợi ý Hôm nay". Có thể xóa vĩnh viễn tin đăng.</p>
              </div>
              <div className="text-xs bg-gray-50 px-2 py-1 rounded border text-gray-500">
                Đang đề xuất: <span className="font-bold text-shopee-orange">{products.filter(p => p.isSuggested).length}</span> bài
              </div>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-md">
                <PackageSearch className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <span className="text-sm font-semibold text-gray-500 block">Chưa tìm thấy sản phẩm nào!</span>
                <p className="text-xs text-gray-400 mt-1">Sử dụng biểu mẫu bên trái để tải lên sản phẩm tiếp thị đầu tiên của bạn.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {products.map(item => {
                  const CatIcon = CATEGORY_ICONS[categories.find(c => c.id === item.categoryId)?.iconName || 'Shirt'] || Shirt;
                  
                  return (
                    <motion.div 
                      key={item.id}
                      layoutId={`manage-row-${item.id}`}
                      className={`flex flex-col md:flex-row items-start md:items-center justify-between p-3 border rounded transition-all gap-4 ${item.isSuggested ? 'border-orange-200 bg-orange-50/20 shadow-xs' : 'border-gray-200 bg-white'} ${item.isDeleted ? 'opacity-50 grayscale' : ''}`}
                    >
                      {/* Left: thumb and content info */}
                      <div className="flex items-center gap-3 flex-1">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt="" 
                            className="w-12 h-12 rounded object-cover shadow-xs bg-gray-100 border border-gray-200 shrink-0" 
                          />
                        ) : (
                          <div className="w-12 h-12 rounded object-cover shadow-xs bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center text-[8px] text-gray-400">
                            No Img
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-gray-800 line-clamp-1 leading-snug">{item.title}</h4>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[10px] text-gray-500">
                            <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5 capitalize">
                              {item.platform}
                            </span>
                            <span className="bg-orange-50 text-shopee-orange px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                              <CatIcon className="w-2.5 h-2.5" />
                              {categories.find(c => c.id === item.categoryId)?.name || 'Thời Trang'}
                            </span>
                            <span className="font-bold text-gray-700">{formatCurrency(item.price)}</span>
                            {item.discountPercent > 0 && <span className="text-red-500">(-{item.discountPercent}%)</span>}
                            {item.attachedOnlineProductId && (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-150 px-1.5 py-0.5 rounded text-[10px] font-black flex items-center gap-0.5">
                                🎁 Quà tặng kèm: {onlineProducts.find((op: any) => op.id === item.attachedOnlineProductId)?.title || 'Sản phẩm số'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-2 md:pt-0 shrink-0">
                        {/* Suggest Tab Indicator Toggle */}
                        <button 
                          onClick={() => onToggleSuggest(item.id)}
                          className={`flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded font-bold border transition-colors cursor-pointer ${item.isSuggested ? 'bg-orange-500 hover:bg-orange-600 border-orange-500 text-white shadow-xs' : 'bg-white hover:bg-gray-50 border-gray-300 text-gray-600'}`}
                          title={item.isSuggested ? "Bỏ gợi ý hôm nay" : "Ghim vào Gợi ý hôm nay"}
                        >
                          <Star className={`w-3.5 h-3.5 ${item.isSuggested ? 'fill-white' : ''}`} />
                          <span>{item.isSuggested ? 'Đã Gợi Ý' : 'Gợi Ý'}</span>
                        </button>

                        {/* Edit Button */}
                        <button 
                          onClick={() => startEditProduct(item)}
                          type="button"
                          className="p-1.5 border border-amber-300 text-amber-600 hover:text-amber-800 bg-amber-50 rounded hover:bg-amber-100 transition-colors cursor-pointer"
                          title="Sửa bài viết / Đổi link"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <a 
                          href={item.affiliateLink}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 border border-gray-300 text-gray-500 hover:text-gray-800 bg-white rounded hover:bg-gray-100 cursor-pointer"
                          title="Xem link tiếp thị"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        {/* Soft Delete Control */}
                        {item.isDeleted ? (
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateProduct({ ...item, isDeleted: false });
                            }}
                            className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-650 px-2 py-1.5 rounded transition-colors cursor-pointer text-[10px] font-bold"
                          >
                            Khôi phục
                          </button>
                        ) : confirmDeleteId === item.id ? (
                          <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded p-1">
                            <span className="text-[10.5px] font-bold text-red-700 px-1">Xác nhận?</span>
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteProduct(item.id);
                                setConfirmDeleteId(null);
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white text-[10px] px-2 py-1 rounded font-bold cursor-pointer"
                            >
                              Xóa
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] px-2 py-1 rounded font-bold cursor-pointer border border-gray-300"
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <button 
                            type="button"
                            onClick={() => setConfirmDeleteId(item.id)}
                            className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-650 p-1.5 rounded transition-colors cursor-pointer"
                            title="Xóa vĩnh viễn"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      )}
      
      {adminTab === 'analytics' && (
        /* ================= TAB 2: REGISTERED BUYERS & SEARCH KEYWORDS ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
          
          {/* Left Column: AI-Powered Customer alignment and strategies recommendation */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 p-4 text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
                <h3 className="font-extrabold text-xs uppercase tracking-widest">Trợ Lý Phân Tích & Báo Cáo AI</h3>
              </div>
              <div className="p-5 space-y-4">
                
                {/* Visual Radar matching search trends */}
                <div className="p-4 bg-orange-50/50 rounded border border-orange-100">
                  <span className="text-xs font-bold text-gray-800 block mb-1">🚀 Xu Hướng Quan Tâm Hiện Tại:</span>
                  {searchTracks && searchTracks.length > 0 ? (
                    <div className="space-y-2 mt-2">
                      <p className="text-xs text-gray-655 leading-relaxed font-semibold">
                        Khách mua đang tìm kiếm tích cực nhất từ khóa <strong className="text-red-650 text-[13px]">"{[...searchTracks].sort((a, b) => b.count - a.count)[0].query}"</strong> với <span className="font-bold">{[...searchTracks].sort((a, b) => b.count - a.count)[0].count} lượt tra cứu</span>.
                      </p>
                      <div className="text-[11px] text-gray-500 bg-white p-2.5 rounded border leading-relaxed">
                        <strong className="text-shopee-orange block mb-0.5">💡 Khuyên dùng cho bạn:</strong>
                        Hãy dán và giới thiệu sản phẩm liên quan đến từ khóa <span className="underline font-bold text-gray-800">{[...searchTracks].sort((a, b) => b.count - a.count)[0].query}</span> để đón đầu xu thế mua sắm nhé!
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 leading-relaxed mt-1">
                      Chưa ghi nhận từ khóa tìm kiếm trực tiếp từ khách hàng. Khuyên bạn nên dán các link liên quan tới thời trang, phụ kiện để kích thích truy cập.
                    </p>
                  )}
                </div>

                {/* Report scheduler setting block */}
                <div className="p-4 bg-gray-50 rounded border border-gray-200 text-xs text-gray-700 space-y-3">
                  <span className="font-bold text-gray-800 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#ee4d2d]" /> Cấu hình Lập Lịch Báo Cáo Định Kỳ:
                  </span>
                  <div>
                    <select 
                      value={scheduleType}
                      onChange={e => setScheduleType(e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none"
                    >
                      <option value="hang_ngay">Báo cáo bám đuổi Hàng ngày (Tự động gửi email/zalo khách hàng)</option>
                      <option value="hang_tuan">Tự động tổng hợp Hàng tuần gửi Admin</option>
                      <option value="dinh_ky">Tự động đề xuất ý tưởng Marketing mỗi khi có từ khóa HOT mới</option>
                    </select>
                    <p className="text-[10px] text-gray-450 mt-1">Mỗi khi đến lịch trình, hệ thống sẽ sử dụng AI quét tệp database người mua để tìm xem họ quan tâm mặt hàng gì rồi tự soạn bài viết tiếp thị.</p>
                  </div>
                </div>

                <button 
                  onClick={handleGenerateReportAI}
                  disabled={reportLoading}
                  className="w-full bg-[#ee4d2d] hover:bg-orange-600 text-white font-bold py-2.5 rounded text-xs tracking-wide shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {reportLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang phân tích và sáng tạo bài viết...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                      <span>Chạy Phân Tích Database (Sáng tạo bài AI + Tự tìm ảnh)</span>
                    </>
                  )}
                </button>

                {errorMsg && (
                  <div className="p-3 bg-red-55/60 border border-red-200 rounded text-red-600 text-xs font-semibold">
                    {errorMsg}
                  </div>
                )}

                {aiReport && (
                  <div className="mt-4 p-4 border border-emerald-150 bg-emerald-50/20 rounded-md xl:p-5 space-y-4 animate-fadeIn">
                    <div className="flex items-center gap-2 pb-2 border-b border-emerald-100">
                      <Sparkle className="w-4.5 h-4.5 text-emerald-600 animate-spin" />
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Kết Quả Phân Tích & Sáng Tạo Từ AI</span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="text-[11px] uppercase font-bold text-gray-500 block">📊 1. Nhận định tệp khách hàng:</span>
                        <div className="text-xs text-gray-800 bg-white p-3 rounded shadow-xs border leading-relaxed border-gray-150 mt-1 font-mono whitespace-pre-wrap">
                          {aiReport.customerAnalysis}
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] uppercase font-bold text-gray-500 block">✍️ 2. Bài viết tiếp thị xã hội tự động:</span>
                        <div className="text-xs text-gray-800 bg-orange-50/30 p-3 rounded shadow-xs border leading-relaxed border-orange-100 mt-1 whitespace-pre-wrap relative group">
                          <p>{aiReport.marketingArticle}</p>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(aiReport.marketingArticle);
                              alert('Đã copy bài viết tiếp thị của AI vào khay nhớ tạm!');
                            }}
                            className="absolute top-2 right-2 bg-white border px-2 py-0.5 rounded text-[10px] text-shopee-orange font-bold hover:bg-orange-50"
                          >
                            Copy bài đăng
                          </button>
                        </div>
                      </div>

                      {aiReport.suggestedImage && (
                        <div>
                          <span className="text-[11px] uppercase font-bold text-gray-500 block">🖼️ 3. Hình ảnh tự động tìm kiếm:</span>
                          <div className="mt-1 rounded overflow-hidden border">
                            <img 
                              src={aiReport.suggestedImage} 
                              alt="Generated representation from Unsplash query" 
                              className="w-full h-44 object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="bg-gray-55/60 p-2 text-[10px] text-gray-500 text-center font-mono">
                              Keyword gợi ý: <strong className="text-gray-900">"{aiReport.imageQuery || 'marketing'}"</strong>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Right Column: Search Tracks and Buyers Lists */}
          <div className="lg:col-span-12 xl:col-span-7 space-y-6">
            
            {/* Box 1: Search Statistics logs */}
            <div className="bg-white rounded-md shadow-sm border border-gray-200 p-5">
              <h3 className="font-bold text-gray-800 text-sm mb-1 flex items-center gap-1.5">
                <Search className="w-4 h-4 text-orange-500" />
                Dữ Liệu Lượt Tìm Kiếm Của Khách (Thời Gian Thực)
              </h3>
              <p className="text-xs text-gray-500 mb-4">Các từ khoá người dùng gõ tìm kiếm sẽ tự xếp hạng giảm dần.</p>
              
              {!searchTracks || searchTracks.length === 0 ? (
                <div className="text-center py-8 text-gray-400 border border-dashed rounded text-xs">
                  Chưa ghi nhận từ khóa tìm kiếm nào dạo gần đây.
                </div>
              ) : (
                <div className="border border-gray-200 rounded-sm overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="p-2.5 font-bold text-gray-700">STT</th>
                        <th className="p-2.5 font-bold text-gray-700">Từ Khóa Tra Cứu</th>
                        <th className="p-2.5 font-bold text-gray-700 text-center">Số Lần</th>
                        <th className="p-2.5 font-bold text-gray-700">Thiết bị</th>
                        <th className="p-2.5 font-bold text-gray-700">Lần cuối</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150">
                      {[...searchTracks].sort((a,b) => b.count - a.count).map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50/50">
                          <td className="p-2.5 text-gray-500">{index + 1}</td>
                          <td className="p-2.5 font-bold text-gray-800">
                            {item.query}
                          </td>
                          <td className="p-2.5 text-center font-black text-shopee-orange bg-orange-50/20">{item.count}</td>
                          <td className="p-2.5 text-gray-500 text-[10px]">
                            {item.deviceInfo || 'Unknown'}
                          </td>
                          <td className="p-2.5 text-gray-500 font-mono text-[10px]">
                            {new Date(item.lastSearchedAt).toLocaleTimeString('vi-VN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Box 2: Registered Buyers database table */}
            <div className="bg-white rounded-md shadow-sm border border-gray-200 p-5">
              <h3 className="font-bold text-gray-800 text-sm mb-1 flex items-center gap-1.5 font-sans">
                <Users className="w-4 h-4 text-shopee-orange" />
                Danh Sách Khách Hàng Đăng Ký ({buyers ? buyers.length : 0})
              </h3>
              <p className="text-xs text-gray-500 mb-4 font-sans">Kiểm tra thông tin chi tiết họ tên, số điện thoại và địa chỉ của từng khách hàng đăng ký.</p>

              {(() => {
                const filteredBuyers = (buyers || []).filter(buyer => {
                  const q = searchBuyerQuery.toLowerCase().trim();
                  if (!q) return true;
                  return (
                    (buyer.fullName || '').toLowerCase().includes(q) ||
                    (buyer.phoneNumber || '').toLowerCase().includes(q)
                  );
                });

                return (
                  <>
                    <div className="mb-4 flex gap-2">
                      <div className="relative flex-1">
                        <input 
                          type="text"
                          placeholder="🔍 Nhập Tên hoặc Số Điện Thoại để tìm kiếm & kiểm tra khách hàng..."
                          className="w-full border border-gray-300 rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-shopee-orange bg-white text-gray-800"
                          value={searchBuyerQuery}
                          onChange={e => setSearchBuyerQuery(e.target.value)}
                        />
                      </div>
                      {searchBuyerQuery && (
                        <button 
                          onClick={() => setSearchBuyerQuery('')}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-750 px-3 py-2 rounded-sm text-xs font-bold cursor-pointer transition-colors"
                        >
                          Xoá lọc
                        </button>
                      )}
                    </div>

                    {filteredBuyers.length === 0 ? (
                      <div className="text-center py-10 text-gray-450 border border-dashed border-gray-250 rounded text-xs bg-gray-50/50">
                        {searchBuyerQuery.trim() ? "Không tìm thấy khách hàng nào khớp với tìm kiếm." : "Chưa có người mua mới nào thực hiện đăng ký tài khoản liên kết."}
                      </div>
                    ) : (
                      <div className="border border-gray-200 rounded-sm overflow-hidden text-xs">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-250">
                              <th className="p-2.5 font-bold text-gray-700">Tên Người Mua</th>
                              <th className="p-2.5 font-bold text-gray-700">Số ĐT</th>
                              <th className="p-2.5 font-bold text-gray-700">Địa Chỉ Nhận Hàng</th>
                              <th className="p-2.5 font-bold text-gray-700">Thiết Bị</th>
                              <th className="p-2.5 font-bold text-gray-700">Liên hệ</th>
                              <th className="p-2.5 font-bold text-gray-700">Đăng ký ngày</th>
                              <th className="p-2.5 font-bold text-gray-700">Hành Động</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-150 bg-white">
                            {filteredBuyers.map((buyer, idx) => (
                              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                <td className="p-2.5 font-bold text-gray-900">{buyer.fullName}</td>
                                <td className="p-2.5 font-mono text-gray-800 font-bold">{buyer.phoneNumber}</td>
                                <td className="p-2.5 text-gray-650 max-w-[200px] truncate" title={buyer.address}>
                                  {buyer.address}
                                </td>
                                <td className="p-2.5 text-gray-500 text-[10px]">
                                  {buyer.deviceInfo ? (
                                    <div className="flex flex-col">
                                      <span className="font-bold text-indigo-600">{buyer.os} · {buyer.browser}</span>
                                      <span className="truncate max-w-[120px]">{buyer.deviceInfo}</span>
                                    </div>
                                  ) : (
                                    <span className="italic">Không có dl</span>
                                  )}
                                </td>
                                <td className="p-2.5">
                                  <a 
                                    href={`https://zalo.me/${(buyer.phoneNumber || '').replace(/^0/, '84')}`} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="inline-flex bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-black hover:bg-blue-100 transition-colors uppercase"
                                  >
                                    Zalo
                                  </a>
                                </td>
                                <td className="p-2.5 text-[10px] text-gray-500 font-mono">
                                  {new Date(buyer.registeredAt).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="p-2.5">
                                  <button
                                    type="button"
                                    onClick={() => alert(`Đã gửi bộ Quà tặng đặc biệt qua Zalo/Email cho khách hàng ${buyer.fullName}.`)}
                                    className="inline-flex items-center gap-1 bg-pink-50 text-pink-600 border border-pink-200 px-2 py-0.5 rounded text-[10px] font-bold hover:bg-pink-100 transition-all active:scale-95"
                                  >
                                    🎁 Tặng Quà
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

          </div>
        </div>
      )}

      {adminTab === 'social' && (
        /* ================= TAB 3: SOCIAL MEDIA LINKS & STORE MANAGEMENT ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 animate-fadeIn">
          
          <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 space-y-6">
            <div>
              <h3 className="font-bold text-gray-800 text-sm mb-1">📱 Liên Kết Nhiều Tài Khoản & Kênh Mạng Xã Hội</h3>
              <p className="text-xs text-gray-500">Phần mềm cho phép người quản trị gắn nhiều tài khoản Facebook, Zalo, Tiktok, Shopee liên kết.</p>
            </div>

            {/* Cài đặt liên kết chính của Quản trị viên */}
            <div className="bg-orange-50/40 p-4 rounded border border-orange-200 space-y-3 font-sans">
              <span className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                ⚙️ CÀI ĐẶT LIÊN HỆ CHÍNH CỦA SHOP (ADMIN CONTACTS)
              </span>
              <p className="text-[10px] text-gray-500 leading-relaxed">Nhập các đường dẫn chính của bạn để hiển thị trực tiếp lên thanh công cụ đầu trang và các mục liên hệ hỗ trợ.</p>
              
              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Tên Cửa Hàng / Thương Hiệu Web (Hiển thị thay chữ AffiliShop):</label>
                  <input 
                    type="text"
                    className="w-full border border-gray-300 rounded-sm px-2.5 py-1.5 text-xs focus:outline-none focus:border-shopee-orange bg-white text-gray-800 font-bold"
                    placeholder="Ví dụ: AffiliShop, Mẹ & Bé Store, TapHoa..."
                    value={adminBrandName}
                    onChange={e => {
                      setAdminBrandName(e.target.value);
                      localStorage.setItem('custom_brand', e.target.value);
                      window.dispatchEvent(new Event('storage'));
                    }}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Đường dẫn Facebô0k (Facebook) chính:</label>
                  <input 
                    type="url"
                    className="w-full border border-gray-300 rounded-sm px-2.5 py-1.5 text-xs focus:outline-none focus:border-shopee-orange bg-white text-gray-800 font-medium"
                    placeholder="Ví dụ: https://facebook.com/username..."
                    value={adminFacebook}
                    onChange={e => {
                      setAdminFacebook(e.target.value);
                      setItemResilient('admin_facebook', e.target.value);
                      window.dispatchEvent(new Event('storage'));
                    }}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Liên kết / Số ĐT Zalo chính:</label>
                  <input 
                    type="text"
                    className="w-full border border-gray-300 rounded-sm px-2.5 py-1.5 text-xs focus:outline-none focus:border-shopee-orange bg-white text-gray-800 font-medium"
                    placeholder="Ví dụ: https://zalo.me/0981234567..."
                    value={adminZalo}
                    onChange={e => {
                      setAdminZalo(e.target.value);
                      setItemResilient('admin_zalo', e.target.value);
                      window.dispatchEvent(new Event('storage'));
                    }}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-0.5">ID kênh TikTok chính (TikTok ID):</label>
                  <input 
                    type="text"
                    className="w-full border border-gray-300 rounded-sm px-2.5 py-1.5 text-xs focus:outline-none focus:border-shopee-orange bg-white text-gray-800 font-medium"
                    placeholder="Ví dụ: @giamgia_tiktok..."
                    value={adminTiktok}
                    onChange={e => {
                      setAdminTiktok(e.target.value);
                      setItemResilient('admin_tiktok', e.target.value);
                      window.dispatchEvent(new Event('storage'));
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Add Facebook */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Gắn thêm Tài khoản/Group Facebook:</label>
                <div className="flex gap-2">
                  <input 
                    type="url" 
                    placeholder="https://facebook.com/your-fanpage"
                    className="flex-1 border rounded px-3 py-1.5 focus:outline-none focus:border-shopee-orange"
                    value={inputFb}
                    onChange={e => setInputFb(e.target.value)}
                  />
                  <button 
                    onClick={() => {
                      if (!inputFb) return;
                      const next = { ...socials, facebooks: [...socials.facebooks, inputFb] };
                      saveSocials(next);
                      setInputFb('');
                    }}
                    className="bg-shopee-orange text-white px-3 py-1.5 rounded font-bold hover:bg-[#e03d1d] cursor-pointer"
                  >
                    Gắn liên kết
                  </button>
                </div>
              </div>

              {/* Add Zalo */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Gắn thêm Phone/Group Chat Zalo:</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="https://zalo.me/g/..."
                    className="flex-1 border rounded px-3 py-1.5 focus:outline-none focus:border-shopee-orange"
                    value={inputZalo}
                    onChange={e => setInputZalo(e.target.value)}
                  />
                  <button 
                    onClick={() => {
                      if (!inputZalo) return;
                      const next = { ...socials, zalos: [...socials.zalos, inputZalo] };
                      saveSocials(next);
                      setInputZalo('');
                    }}
                    className="bg-shopee-orange text-white px-3 py-1.5 rounded font-bold hover:bg-[#e03d1d] cursor-pointer"
                  >
                    Gắn liên kết
                  </button>
                </div>
              </div>

              {/* Add Tiktok */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Gắn thêm Kênh/TikTok Shop kết nối:</label>
                <div className="flex gap-2">
                  <input 
                    type="url" 
                    placeholder="https://tiktok.com/@your-shop"
                    className="flex-1 border rounded px-3 py-1.5 focus:outline-none focus:border-shopee-orange"
                    value={inputTiktok}
                    onChange={e => setInputTiktok(e.target.value)}
                  />
                  <button 
                    onClick={() => {
                      if (!inputTiktok) return;
                      const next = { ...socials, tiktoks: [...socials.tiktoks, inputTiktok] };
                      saveSocials(next);
                      setInputTiktok('');
                    }}
                    className="bg-shopee-orange text-white px-3 py-1.5 rounded font-bold hover:bg-[#e03d1d] cursor-pointer"
                  >
                    Gắn liên kết
                  </button>
                </div>
              </div>

              {/* Add Shopee Store */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Gắn thêm Cửa Hàng Liên Kết Trên Shopee:</label>
                <div className="flex gap-2">
                  <input 
                    type="url" 
                    placeholder="https://shopee.vn/your-affiliated-store"
                    className="flex-1 border rounded px-3 py-1.5 focus:outline-none focus:border-shopee-orange"
                    value={inputShopee}
                    onChange={e => setInputShopee(e.target.value)}
                  />
                  <button 
                    onClick={() => {
                      if (!inputShopee) return;
                      const next = { ...socials, shopees: [...socials.shopees, inputShopee] };
                      saveSocials(next);
                      setInputShopee('');
                    }}
                    className="bg-shopee-orange text-white px-3 py-1.5 rounded font-bold hover:bg-[#e03d1d] cursor-pointer"
                  >
                    Gắn liên kết
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
            <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider pb-3 border-b mb-4">Các Kênh MXH Đã Kết Nối Thực Tế</h4>
            
            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2">
              {/* Facebook Channels list */}
              <div>
                <span className="flex items-center gap-1 text-xs font-bold text-blue-700 mb-1.5">
                  <Facebook className="w-3.5 h-3.5 text-blue-800" /> Facebook Accounts / Groups ({socials.facebooks.length})
                </span>
                <div className="space-y-1">
                  {socials.facebooks.map((fb: string, i: number) => (
                    <div key={i} className="flex justify-between items-center text-[11px] bg-blue-50/50 hover:bg-blue-50 p-2 rounded-sm border border-blue-100">
                      <a href={fb} target="_blank" rel="noreferrer" className="text-blue-900 truncate max-w-[280px] font-mono hover:underline">{fb}</a>
                      <button 
                        onClick={() => {
                          const nextArr = socials.facebooks.filter((_: any, idx: number) => idx !== i);
                          saveSocials({ ...socials, facebooks: nextArr });
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Zalo Channels list */}
              <div>
                <span className="flex items-center gap-1 text-xs font-bold text-teal-700 mb-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-teal-850" /> Zalo Phone contacts & Chat rooms ({socials.zalos.length})
                </span>
                <div className="space-y-1">
                  {socials.zalos.map((z: string, i: number) => (
                    <div key={i} className="flex justify-between items-center text-[11px] bg-teal-50/55 hover:bg-teal-50 p-2 rounded-sm border border-teal-100">
                      <a href={z} target="_blank" rel="noreferrer" className="text-teal-900 truncate max-w-[280px] font-mono hover:underline">{z}</a>
                      <button 
                        onClick={() => {
                          const nextArr = socials.zalos.filter((_: any, idx: number) => idx !== i);
                          saveSocials({ ...socials, zalos: nextArr });
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tiktok Accounts list */}
              <div>
                <span className="flex items-center gap-1 text-xs font-bold text-gray-800 mb-1.5">
                  <Globe className="w-3.5 h-3.5 text-gray-900" /> TikTok Accounts / Shop channels ({socials.tiktoks.length})
                </span>
                <div className="space-y-1">
                  {socials.tiktoks.map((tk: string, i: number) => (
                    <div key={i} className="flex justify-between items-center text-[11px] bg-gray-50 hover:bg-gray-100 p-2 rounded-sm border border-gray-150">
                      <a href={tk} target="_blank" rel="noreferrer" className="text-gray-900 truncate max-w-[280px] font-mono hover:underline">{tk}</a>
                      <button 
                        onClick={() => {
                          const nextArr = socials.tiktoks.filter((_: any, idx: number) => idx !== i);
                          saveSocials({ ...socials, tiktoks: nextArr });
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shopee Shops list */}
              <div>
                <span className="flex items-center gap-1 text-xs font-bold text-orange-700 mb-1.5">
                  <Link2 className="w-3.5 h-3.5 text-orange-855" /> Shopee Outlet stores linked ({socials.shopees.length})
                </span>
                <div className="space-y-1">
                  {socials.shopees.map((sh: string, i: number) => (
                    <div key={i} className="flex justify-between items-center text-[11px] bg-orange-50/50 hover:bg-orange-50 p-2 rounded-sm border border-orange-100">
                      <a href={sh} target="_blank" rel="noreferrer" className="text-orange-900 truncate max-w-[280px] font-mono hover:underline">{sh}</a>
                      <button 
                        onClick={() => {
                          const nextArr = socials.shopees.filter((_: any, idx: number) => idx !== i);
                          saveSocials({ ...socials, shopees: nextArr });
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {adminTab === 'online_campaigns' && (
        /* ================= TAB 4: ONLINE DIGITAL PRODUCTS & FREEBIE FUNNELS ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
          
          {/* Creator Form column */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-800 text-sm mb-1 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#ee4d2d]" />
                Thiết Lập Sản Phẩm Trực Tuyến & Quà Tặng
              </h3>
              <p className="text-xs text-gray-500 mb-5">Admin đăng bán các công cụ phần mềm, khóa học trả phí hoặc sách/tài liệu miễn phí tặng khách bốc thăm trúng thưởng.</p>

              <form onSubmit={e => {
                e.preventDefault();
                if (!opTitle || !opDownloadUrl) return alert('Vui lòng điền đầy đủ Tên sản phẩm và Link tải file!');
                const newItem = {
                  id: 'op_' + Date.now(),
                  title: opTitle,
                  type: opType,
                  price: opType === 'mienphi' ? 0 : Number(opPrice),
                  originalPrice: Number(opOriginalPrice) || Number(opPrice) + 100000,
                  isFree: opType === 'mienphi',
                  downloadUrl: opDownloadUrl
                };
                saveOnlineProducts([...onlineProducts, newItem]);
                setOpTitle('');
                setOpDownloadUrl('');
                setOpPrice(0);
                setOpOriginalPrice(0);
                setSuccessMsg('Đăng sản phẩm trực tuyến thành công!');
                setTimeout(() => setSuccessMsg(''), 4000);
              }} className="space-y-4 text-xs">
                
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Tên sản phẩm số / tài liệu quà tặng:</label>
                  <input 
                    type="text" 
                    placeholder="Ebook hoặc Khóa học Video đỉnh cao..."
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:border-shopee-orange"
                    value={opTitle}
                    onChange={e => setOpTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Loại hình mặt hàng:</label>
                  <select 
                    className="w-full border rounded px-3 py-2 focus:outline-none"
                    value={opType}
                    onChange={e => setOpType(e.target.value)}
                  >
                    <option value="mienphi">🎁 Sách & Tài liệu Miễn phí (Quà Tặng)</option>
                    <option value="phanmem">💻 Công cụ & Phần mềm bản quyền</option>
                    <option value="web">🎨 Giao diện Website & Sourcecode</option>
                    <option value="khoahoc">📚 Khóa học bồi dưỡng chuyên đề</option>
                  </select>
                </div>

                {opType !== 'mienphi' && (
                  <div className="grid grid-cols-2 gap-3 animate-fadeIn">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Giá khuyến mãi (đ):</label>
                      <input 
                        type="number" 
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:border-shopee-orange"
                        value={opPrice}
                        onChange={e => setOpPrice(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Giá gốc niêm yết (đ):</label>
                      <input 
                        type="number" 
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:border-shopee-orange"
                        value={opOriginalPrice}
                        onChange={e => setOpOriginalPrice(Number(e.target.value))}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 border-t border-gray-100 pt-3 mt-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <label className="block font-bold text-gray-700 mb-0.5">Đường dẫn tệp quà tặng / link download (sẽ tự động gửi sau khi giao dịch hoặc trúng giải):</label>
                    <label className="bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 px-2.5 py-1.5 rounded text-xs cursor-pointer font-bold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap self-start md:self-auto shadow-sm">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Tải file từ thiết bị</span>
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          if (file.size > 3.5 * 1024 * 1024) { 
                             alert('Vui lòng chọn file dưới 3.5MB. Nếu file nặng hơn, vui lòng đưa lên Google Drive và dán link vào ô bên dưới thay vì tải trực tiếp qua trình duyệt.');
                             return;
                          }
                          
                          setSuccessMsg('Đang nạp dữ liệu tài liệu để phân phối làm quà tặng...');
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const dataUrl = ev.target?.result as string;
                            setOpDownloadUrl(dataUrl);
                            if (!opTitle) {
                              setOpTitle(file.name);
                            }
                            setSuccessMsg('✅ Đã đính kèm tài liệu thành công! Hãy ấn "Xuất Bản Sản Phẩm" để bắt đầu.');
                            setTimeout(() => setSuccessMsg(''), 5000);
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  </div>
                  <input 
                    type="url" 
                    placeholder="https://drive.google.com/file/... hoặc tải tệp lên từ máy để mã hóa thành link download"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-shopee-orange"
                    value={opDownloadUrl}
                    onChange={e => setOpDownloadUrl(e.target.value)}
                  />
                  {opDownloadUrl && opDownloadUrl.startsWith('data:') && (
                     <div className="text-[10px] text-emerald-700 font-bold bg-emerald-50 p-2 rounded border border-emerald-100 flex items-start gap-1 mt-1">
                       <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" /> 
                       <span>Tệp tài liệu an toàn đã được đính kèm trực tiếp. Khách hàng sẽ nhận được quyền tải xuống tệp này cách thức hoàn toàn giống với cách phân phối do AI tạo ra.</span>
                     </div>
                  )}
                </div>

                <button 
                  type="submit"
                  className="w-full bg-shopee-orange hover:bg-orange-600 text-white font-bold py-2.5 rounded hover:shadow cursor-pointer tracking-wider"
                >
                  + Xuất Bản Sản Phẩm Trực Tuyến
                </button>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <label className="font-bold text-gray-700 text-xs">🎯 Lượt quay tối đa để chắc chắn trúng quà:</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="VD: 10"
                    className="w-20 border rounded px-2 py-1 text-center font-bold text-red-600 focus:outline-none"
                    value={guaranteedWinSpins === 0 ? '' : guaranteedWinSpins}
                    onChange={(e) => onSetGuaranteedWinSpins(Number(e.target.value) || 0)}
                  />
                </div>
                <p className="text-[9.5px] italic text-gray-500 m-0 leading-tight">Nếu đặt 0, hệ thống dựa theo xác suất 25% trượt. Nếu đặt giá trị (ví dụ 10), đến lần quay thứ 10 khách hàng chắc chắn 100% nhận quà (Áp dụng chống thất vọng).</p>
                
              </form>
            </div>

            {/* ⚙️ EXCLUSIVE AUTOMATED DOCUMENT CREATOR CARD */}
            <div className="bg-gradient-to-br from-indigo-50 to-amber-50 rounded-md p-6 border border-indigo-200 shadow-sm space-y-4">
              <div className="border-b border-indigo-150 pb-2">
                <span className="bg-indigo-600 text-white font-extrabold px-2 py-0.5 rounded text-[9.5px] uppercase tracking-wider inline-block">Tính Năng Độc Quyền</span>
                <h3 className="font-extrabold text-indigo-900 text-sm mt-1.5 flex items-center gap-1">
                  🤖 Trình Tự Động Biên Soạn & Tạo Tài Liệu VIP 0đ
                </h3>
                <p className="text-[10.5px] text-gray-600 mt-0.5 leading-relaxed">
                  Thiết kế & Số hóa tức thì các tài liệu học tập, cẩm nang đẹp mắt dưới định dạng **Trực Tuyến đẹp mắt (.html)** hoặc chuẩn **PDF độc quyền**. Khách hàng trúng thưởng sẽ tải file trực tiếp từ web của bạn về máy, **hoàn toàn loại bỏ sự phụ thuộc vào link Google Drive!**
                </p>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">🎯 Chọn Chủ Đề / Topic Biên Soạn:</label>
                  <select 
                    className="w-full border rounded px-3 py-2 focus:outline-none bg-white font-medium"
                    value={genTopic}
                    onChange={e => setGenTopic(e.target.value)}
                  >
                    <option value="affiliate_guide">💡 [Affiliate TTLK] Bí kíp xây kênh Tiktok & Shopee nghìn đơn</option>
                    <option value="skincare_guide">💄 [Mỹ Phẩm / Thời Trang] Cẩm nang SkinCare Da Mụn Chuẩn Y Khoa</option>
                    <option value="nutrition_ebook">🥗 [Sức Khỏe] Thực dưỡng & Kế hoạch ăn sạch Eat-Clean 14 ngày</option>
                    <option value="fashion_tips">👗 [Phong Cách] Bí truyền phối đồ thời trang đón đầu xu hướng 2026</option>
                    <option value="custom">🔮 [Tự Chọn] Tự nhập chủ đề biên soạn quà tặng tùy ý</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">📄 Số Trang Tài Liệu Quà Tặng (10 - 30 trang):</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="range" 
                      min="10" 
                      max="30" 
                      step="1"
                      className="w-full accent-indigo-600 cursor-pointer h-2 bg-indigo-100 rounded-lg"
                      value={genLength}
                      onChange={e => setGenLength(Number(e.target.value))}
                      onInput={e => setGenLength(Number((e.target as HTMLInputElement).value))}
                    />
                    <div className="flex items-center bg-indigo-50 border border-indigo-250 rounded shadow-sm overflow-hidden min-w-[75px]">
                      <input 
                        type="number" 
                        min="10" 
                        max="30" 
                        className="w-12 font-mono text-xs font-black text-indigo-900 px-2 py-1 outline-none bg-transparent text-center"
                        value={genLength}
                        onChange={e => setGenLength(Number(e.target.value))}
                        onBlur={e => {
                          const val = Number(e.target.value);
                          if (val < 10) setGenLength(10);
                          else if (val > 30) setGenLength(30);
                        }}
                      />
                      <span className="text-[10px] font-bold text-indigo-700 pr-2">trang</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">🖼️ Kích Thước Ảnh Trực Quan Cho Trang:</label>
                  <select
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:border-indigo-500 text-xs"
                    value={genAspectRatio}
                    onChange={e => setGenAspectRatio(e.target.value)}
                  >
                    <option value="16:9">16:9 (Ảnh Ngang - Phù hợp màn hình máy tính)</option>
                    <option value="9:16">9:16 (Ảnh Dọc - Phù hợp màn hình điện thoại)</option>
                  </select>
                </div>

                {genTopic === 'custom' && (
                  <div className="space-y-3 bg-indigo-50/60 p-3.5 rounded border border-indigo-250 transition-all">
                    <div>
                      <label className="block font-bold text-indigo-900 mb-1">🔮 Tên Chủ Đề Tự Chọn:</label>
                      <input 
                        type="text" 
                        placeholder="Ví dụ: Bí quyết lập trình React cho người mới bắt đầu..."
                        className="w-full border border-indigo-200 rounded px-3 py-2 focus:outline-none bg-white font-medium text-slate-800 placeholder-slate-400"
                        value={genCustomTopicName}
                        onChange={e => setGenCustomTopicName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-indigo-900 mb-1">💡 Gợi Ý Nội Dung Chi Tiết (Nâng cao):</label>
                      <textarea 
                        rows={2}
                        placeholder="Ví dụ: Các hook cơ bản, xây dựng kiến trúc thư mục, tối ưu hóa state..."
                        className="w-full border border-indigo-200 rounded px-3 py-2 focus:outline-none bg-white font-medium text-slate-800 placeholder-slate-400 resize-none"
                        value={genCustomTopicContentSuggested}
                        onChange={e => setGenCustomTopicContentSuggested(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">✍️ Người biên soạn / Tác giả:</label>
                    <input 
                      type="text" 
                      placeholder="Mã nguồn tiếp thị..."
                      className="w-full border rounded px-3 py-2 focus:outline-none bg-white"
                      value={genAuthor}
                      onChange={e => setGenAuthor(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">💎 Trị giá danh nghĩa (đ):</label>
                    <input 
                      type="number" 
                      className="w-full border rounded px-3 py-2 focus:outline-none bg-white"
                      value={genValue}
                      onChange={e => setGenValue(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <button 
                    type="button"
                    onClick={handleAutoGenerateGiftDoc}
                    disabled={giftDocLoading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:from-slate-400 disabled:to-slate-500 text-white font-extrabold py-3 px-4 rounded shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs uppercase tracking-wide relative overflow-hidden"
                  >
                    <span className={`flex items-center gap-1.5 justify-center ${giftDocLoading ? 'opacity-100' : 'opacity-0 absolute'}`}>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Đang biên soạn bằng AI...
                    </span>
                    <span className={`${!giftDocLoading ? 'opacity-100' : 'opacity-0 absolute'}`}>
                      ⚡ Tự Động Tạo Web-Doc & Phát Hành Quà Tặng
                    </span>
                  </button>

                  {genTopic === 'custom' && currentCustomSlides.length > 0 && (
                    <div className="bg-indigo-50/80 p-3 rounded border border-indigo-200 flex flex-col gap-2 transition-all">
                      <div className="flex justify-between items-center text-xs font-semibold text-indigo-950">
                        <span>📊 Tiến độ AI: {currentCustomSlides.length} / {genLength} trang</span>
                        {currentCustomSlides.length < genLength ? (
                          <span className="text-amber-600 font-bold animate-pulse">Cần viết thêm...</span>
                        ) : (
                          <span className="text-emerald-650 font-bold">✓ Đủ số trang yêu cầu</span>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-1.5 mt-1 border border-indigo-100 p-2.5 rounded bg-white">
                        <label className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider flex items-center justify-between">
                          <span>💡 Gợi ý AI viết tiếp (Tùy chọn):</span>
                          <span className="text-[9px] font-medium text-slate-400 capitalize normal-case">Dẫn dắt các trang tiếp theo</span>
                        </label>
                        <textarea 
                          rows={2}
                          placeholder={`Ví dụ: Hãy viết tiếp sang nội dung 3 bước... (Tùy chọn)`}
                          className="w-full border border-indigo-100 rounded px-2.5 py-1.5 text-xs focus:outline-none bg-slate-50 focus:bg-white text-slate-700 font-medium placeholder-slate-400 resize-none transition-all shadow-inner"
                          value={genCustomTopicContentSuggested}
                          onChange={e => setGenCustomTopicContentSuggested(e.target.value)}
                        />
                      </div>
                      
                      <button
                        type="button"
                        disabled={giftDocLoading}
                        onClick={handleContinueGenerateGiftDocAI}
                        className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-slate-400 text-white font-extrabold py-2 px-3 rounded text-[11px] uppercase tracking-wide transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {giftDocLoading ? (
                          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        ) : null}
                        ✍️ AI Tạo Tiếp Phần Nội Dung Còn Lại ({currentCustomSlides.length < genLength ? `Đến ${genLength} Trang` : "+5 Trang Nâng Cao"})
                      </button>
                    </div>
                  )}

                  {currentCustomSlides.length > 0 && (
                    <div className="bg-[#f8fafc] p-4 rounded-xl border border-indigo-150 transition-all space-y-3 shadow-inner">
                      <div className="flex justify-between items-center border-b border-indigo-100 pb-2">
                        <span className="font-extrabold text-indigo-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                          🖼️ Quản Lý Ảnh & Tiêu Đề Slide ({currentCustomSlides.length})
                        </span>
                        <span className="text-[9px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded-full select-none">Tự Động Lưu</span>
                      </div>
                      
                      <p className="text-[10.5px] text-indigo-900/70 leading-relaxed font-medium">
                        Bạn có thể sửa trực tiếp tiêu đề bài viết hoặc thay đổi liên kết ảnh (Cover Image URL). Bấm đổi nhanh mẫu ảnh hoặc tự phát ảnh ngẫu nhiên từ Unsplash!
                      </p>

                      <div className="bg-indigo-50/50 p-2 rounded-md mb-2">
                        <label className="block text-[10px] font-bold text-indigo-900 uppercase tracking-wider mb-1">
                          Tiêu Đề Sách/Tài Liệu Của Lần Tạo Này:
                        </label>
                        <input 
                          type="text" 
                          value={currentGiftDocTitle}
                          onChange={(e) => setCurrentGiftDocTitle(e.target.value)}
                          onBlur={() => {
                            if (currentCustomSlides.length > 0) {
                              packageAndSaveSlides(currentCustomSlides, currentGiftDocTitle || 'Tài Liệu Quà Tặng', currentGiftDocCat || 'Quà Tặng VIP', genAuthor, genValue);
                            }
                          }}
                          className="w-full border border-indigo-200 rounded px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 shadow-inner"
                        />
                        <p className="text-[9px] text-slate-500 mt-1 italic">
                          (Click chuột ra ngoài ô này để lưu lại tiêu đề sách mới)
                        </p>
                      </div>

                      <div className="max-h-[340px] overflow-y-auto space-y-4 pr-1 divide-y divide-indigo-100/50">
                        {currentCustomSlides.map((slide, sIdx) => {
                          const currentTitleText = currentGiftDocTitle || 'Tài Liệu Quà Tặng';
                          const currentCatText = currentGiftDocCat || 'Quà Tặng VIP';

                          return (
                            <div key={sIdx} className="pt-3.5 first:pt-0 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-[10px] font-black text-indigo-600 bg-indigo-100/60 px-1.5 py-0.5 rounded-md">Trang {sIdx + 1}</span>
                                <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">{slide.badge || 'TÀI LIỆU'}</span>
                              </div>

                              <div className="flex gap-2.5 items-start">
                                {slide.image ? (
                                  <img src={slide.image} className="w-12 h-12 rounded-lg object-cover border border-indigo-100 shadow-xs shrink-0 bg-slate-100" referrerPolicy="no-referrer" />
                                ) : (
                                  <div className="w-12 h-12 rounded-lg border border-indigo-100 shadow-xs shrink-0 bg-slate-100 flex items-center justify-center">
                                    <span className="text-[8px] text-slate-400">Trống</span>
                                  </div>
                                )}
                                <div className="flex-1 space-y-1.5 min-w-0">
                                  <div>
                                    <label className="block text-[9.5px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Tiêu đề slide:</label>
                                    <input 
                                      type="text" 
                                      className="w-full border border-indigo-100 rounded px-2 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-400 bg-white shadow-xs"
                                      value={slide.title || ''}
                                      onChange={(e) => {
                                        const updated = [...currentCustomSlides];
                                        updated[sIdx].title = e.target.value;
                                        setCurrentCustomSlides(updated);
                                        packageAndSaveSlides(updated, currentTitleText, currentCatText, genAuthor, genValue);
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[9.5px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Link ảnh bìa:</label>
                                    <div className="flex items-center gap-1.5">
                                      <input 
                                        type="text" 
                                        placeholder="Dán link hoặc 📋 Paste trực tiếp file ảnh vào đây (Ctrl+V)..."
                                        className="flex-1 border border-indigo-100 rounded px-2 py-0.5 text-[10px] font-mono text-slate-600 focus:outline-none focus:border-indigo-400 bg-white shadow-xs"
                                        value={slide.image || ''}
                                        onChange={(e) => {
                                          const updated = [...currentCustomSlides];
                                          updated[sIdx].image = e.target.value;
                                          setCurrentCustomSlides(updated);
                                          packageAndSaveSlides(updated, currentTitleText, currentCatText, genAuthor, genValue);
                                        }}
                                        onPaste={(e) => {
                                          const clipboardData = e.clipboardData;
                                          if (!clipboardData) return;

                                          const items = clipboardData.items;
                                          let foundImage = false;
                                          if (items) {
                                            for (let i = 0; i < items.length; i++) {
                                              if (items[i].type.indexOf('image') !== -1) {
                                                const file = items[i].getAsFile();
                                                if (file) {
                                                  foundImage = true;
                                                  e.preventDefault();
                                                  const reader = new FileReader();
                                                  reader.onload = (evt) => {
                                                    const base64 = evt.target?.result as string;
                                                    const img = new window.Image();
                                                    img.onload = () => {
                                                      const canvas = document.createElement('canvas');
                                                      const MAX_WIDTH = 400;
                                                      let width = img.width;
                                                      let height = img.height;
                                                      if (width > 250) {
                                                        height = Math.round(height * 250 / width);
                                                        width = 250;
                                                      }
                                                      canvas.width = width;
                                                      canvas.height = height;
                                                      const ctx = canvas.getContext('2d');
                                                      if (ctx) {
                                                        ctx.drawImage(img, 0, 0, width, height);
                                                        const resizedBase64 = canvas.toDataURL('image/webp', 0.4);
                                                        const updated = [...currentCustomSlides];
                                                        updated[sIdx].image = resizedBase64;
                                                        setCurrentCustomSlides(updated);
                                                        packageAndSaveSlides(updated, currentTitleText, currentCatText, genAuthor, genValue);
                                                      }
                                                    };
                                                    img.src = base64;
                                                  };
                                                  reader.readAsDataURL(file);
                                                }
                                              }
                                            }
                                          }

                                          if (!foundImage) {
                                            const html = clipboardData.getData('text/html');
                                            if (html) {
                                              const parser = new DOMParser();
                                              const doc = parser.parseFromString(html, 'text/html');
                                              const imgElements = Array.from(doc.querySelectorAll('img'));
                                              for (const el of imgElements) {
                                                const src = el.src?.trim() || el.getAttribute('data-src')?.trim() || el.getAttribute('src')?.trim();
                                                if (src && !src.includes('base64') && !src.includes('avatar') && !src.includes('logo') && !src.includes('icon')) {
                                                  e.preventDefault();
                                                  const updated = [...currentCustomSlides];
                                                  updated[sIdx].image = src;
                                                  setCurrentCustomSlides(updated);
                                                  packageAndSaveSlides(updated, currentTitleText, currentCatText, genAuthor, genValue);
                                                  return; // Stop after first valid image
                                                }
                                              }
                                            }
                                          }
                                        }}
                                      />
                                      <button 
                                        type="button" 
                                        className="shrink-0 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 w-6 h-6 rounded flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-sm relative group"
                                        title="Tải ảnh từ máy tính"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              const reader = new FileReader();
                                              reader.onload = (evt) => {
                                                const base64 = evt.target?.result as string;
                                                const img = new window.Image();
                                                img.onload = () => {
                                                  const canvas = document.createElement('canvas');
                                                  const MAX_WIDTH = 400;
                                                  let width = img.width;
                                                  let height = img.height;
                                                  if (width > 250) {
                                                    height = Math.round(height * 250 / width);
                                                    width = 250;
                                                  }
                                                  canvas.width = width;
                                                  canvas.height = height;
                                                  const ctx = canvas.getContext('2d');
                                                  if (ctx) {
                                                    ctx.drawImage(img, 0, 0, width, height);
                                                    const resizedBase64 = canvas.toDataURL('image/webp', 0.4);
                                                    const updated = [...currentCustomSlides];
                                                    updated[sIdx].image = resizedBase64;
                                                    setCurrentCustomSlides(updated);
                                                    packageAndSaveSlides(updated, currentTitleText, currentCatText, genAuthor, genValue);
                                                  }
                                                };
                                                img.src = base64;
                                              };
                                              reader.readAsDataURL(file);
                                            }
                                          }}
                                        />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Beautiful Preset Suggestions */}
                              <div className="flex items-center gap-1 flex-wrap">
                                <span className="text-[9.5px] text-slate-400 font-bold">Mẫu ảnh đẹp:</span>
                                {[
                                  { label: '💻 Công Nghệ', query: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80' },
                                  { label: '📈 Kinh Doanh', query: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80' },
                                  { label: '🤝 Nhân Sự', query: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80' },
                                  { label: '🎯 Chiến Lược', query: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80' },
                                  { label: '📊 Tài Chính', query: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80' }
                                ].map((preset, pIdx) => (
                                  <button
                                    key={pIdx}
                                    type="button"
                                    onClick={() => {
                                      const updated = [...currentCustomSlides];
                                      updated[sIdx].image = preset.query;
                                      setCurrentCustomSlides(updated);
                                      packageAndSaveSlides(updated, currentTitleText, currentCatText, genAuthor, genValue);
                                    }}
                                    className="text-[9px] bg-white hover:bg-indigo-50 border border-slate-200 text-slate-705 px-1.5 py-0.5 rounded font-semibold transition-all active:scale-95 shadow-xs"
                                  >
                                    {preset.label}
                                  </button>
                                ))}

                                <button
                                  type="button"
                                  onClick={() => {
                                    // Thay thế prompt() bị sandbox chặn bằng việc dùng thẳng AI/Title củaslide để tìm ảnh tự động
                                    const kw = (slide.title || "").replace(/[^a-zA-Z0-9\s]/g, "").trim() || "success";
                                    const rand = Math.floor(Math.random() * 1000);
                                    const customUrl = `https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80&sig=${rand}&q=${encodeURIComponent(kw)}`;
                                    
                                    const updated = [...currentCustomSlides];
                                    updated[sIdx].image = customUrl;
                                    setCurrentCustomSlides(updated);
                                    packageAndSaveSlides(updated, currentTitleText, currentCatText, genAuthor, genValue);
                                  }}
                                  className="text-[9px] bg-gradient-to-r from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-205 border border-pink-200 text-pink-700 px-1.5 py-0.5 rounded font-extrabold transition-all active:scale-95 shadow-xs animate-pulse"
                                >
                                  🎨 Tải Ảnh Ngẫu Nhiên...
                                </button>

                                <button
                                  type="button"
                                  disabled={generatingImageIdxs[sIdx]}
                                  onClick={() => handleGenerateAIImageForSlide(sIdx)}
                                  className="text-[9px] bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-400 disabled:text-slate-600 px-2.5 py-0.5 rounded font-black transition-all active:scale-95 shadow-xs flex items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed relative overflow-hidden h-6 min-w-[90px]"
                                >
                                  <span className={`flex items-center gap-1 justify-center ${generatingImageIdxs[sIdx] ? 'opacity-100' : 'opacity-0 absolute'}`}>
                                    <span className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span>
                                    Đang vẽ...
                                  </span>
                                  <span className={`flex items-center gap-1 justify-center ${!generatingImageIdxs[sIdx] ? 'opacity-100' : 'opacity-0 absolute'}`}>
                                    🤖 AI Tạo Ảnh
                                  </span>
                                </button>
                              </div>
                              
                              {slide.imagePrompt && (
                                <div className="mt-2 bg-slate-50 border border-slate-200 p-2 rounded flex flex-col gap-1.5">
                                  <label className="text-[9.5px] font-semibold text-slate-500 uppercase tracking-wider">🌟 AI Image Gen Prompt (Dành cho Midjourney/DALL-E):</label>
                                  <div className="flex gap-2">
                                    <textarea 
                                      className="flex-1 border border-indigo-50 rounded px-2 py-1 text-[9.5px] font-mono text-slate-700 bg-white shadow-xs resize-none"
                                      value={slide.imagePrompt}
                                      readOnly
                                      rows={2}
                                    />
                                    <button
                                      type="button"
                                      className="shrink-0 text-[10px] bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 px-2 py-1 rounded font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                                      onClick={() => {
                                        navigator.clipboard.writeText(slide.imagePrompt);
                                        alert("Đã chép Prompt tạo ảnh! Bạn có thể dán vào Midjourney/DALL-E để tạo ảnh minh họa cực đẹp.");
                                      }}
                                    >
                                      📋 Copy Prompt
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* New Editors for Content */}
                              <div className="mt-2 space-y-2 border border-slate-200 bg-slate-50 p-2 rounded relative">
                                <span className="absolute -top-2 left-2 bg-slate-200 text-slate-600 px-1 py-0.5 rounded text-[8px] font-bold">CHỈNH SỬA VĂN BẢN (KHÔNG BẮT BUỘC)</span>
                                <div>
                                  <label className="block text-[9.5px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Phần phân tích chuyên sâu (p1):</label>
                                  <textarea 
                                    className="w-full border border-indigo-100 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-indigo-400 bg-white shadow-xs"
                                    rows={2}
                                    value={slide.p1 || ''}
                                    onChange={(e) => {
                                      const updated = [...currentCustomSlides];
                                      updated[sIdx].p1 = e.target.value;
                                      setCurrentCustomSlides(updated);
                                      packageAndSaveSlides(updated, currentTitleText, currentCatText, genAuthor, genValue);
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[9.5px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Thực hành / Định hướng (p2):</label>
                                  <textarea 
                                    className="w-full border border-indigo-100 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-indigo-400 bg-white shadow-xs"
                                    rows={2}
                                    value={slide.p2 || ''}
                                    onChange={(e) => {
                                      const updated = [...currentCustomSlides];
                                      updated[sIdx].p2 = e.target.value;
                                      setCurrentCustomSlides(updated);
                                      packageAndSaveSlides(updated, currentTitleText, currentCatText, genAuthor, genValue);
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[9.5px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Mỏ neo điểm nhấn (highlight):</label>
                                  <input 
                                    type="text" 
                                    className="w-full border border-indigo-100 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-indigo-400 bg-white shadow-xs"
                                    value={slide.highlight || ''}
                                    onChange={(e) => {
                                      const updated = [...currentCustomSlides];
                                      updated[sIdx].highlight = e.target.value;
                                      setCurrentCustomSlides(updated);
                                      packageAndSaveSlides(updated, currentTitleText, currentCatText, genAuthor, genValue);
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[9.5px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Mảng Checklist hành động (list):</label>
                                  <textarea 
                                    className="w-full border border-indigo-100 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-indigo-400 bg-white shadow-xs"
                                    rows={3}
                                    value={(slide.list || []).join('\n')}
                                    placeholder="Mỗi hành động trên 1 dòng..."
                                    onChange={(e) => {
                                      const updated = [...currentCustomSlides];
                                      updated[sIdx].list = e.target.value.split('\n').filter((l: string) => l.trim() !== '');
                                      setCurrentCustomSlides(updated);
                                      packageAndSaveSlides(updated, currentTitleText, currentCatText, genAuthor, genValue);
                                    }}
                                  />
                                </div>
                                <div className="flex justify-start pt-1">
                                  <div className="flex flex-wrap gap-2">
                                    <button
                                      type="button"
                                      disabled={giftDocLoading}
                                      onClick={async () => {
                                        const pwPrompt = prompt("Nhập yêu cầu để AI viết lại/chỉnh sửa nội dung riêng slide này:\n(Ví dụ: 'Hãy viết ngắn gọn hơn', 'Thêm ví dụ thực tế vào p2', 'Đổi giọng điệu sang hài hước hóm hỉnh'):");
                                        if (!pwPrompt) return;
                                        setGiftDocLoading(true);
                                        try {
                                          const fetchHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
                                          const activeKeyObj = geminiKeys?.find((k: any) => k.isActive) || geminiKeys?.[0];
                                          if (activeKeyObj?.key) {
                                            fetchHeaders['x-gemini-key'] = activeKeyObj.key;
                                          }

                                          const res = await fetch('/api/gemini/rewrite-slide', {
                                            method: 'POST',
                                            headers: fetchHeaders,
                                            body: JSON.stringify({
                                              slideTopic: slide.title,
                                              currentContent: slide,
                                              rewriteInstruction: pwPrompt,
                                              aspectRatio: genAspectRatio
                                            })
                                          });

                                          const data = await res.json();
                                          if (!res.ok) throw new Error(data.error || 'Lỗi từ API');

                                          if (data.newSlide) {
                                            const updated = [...currentCustomSlides];
                                            updated[sIdx] = { ...updated[sIdx], ...data.newSlide, image: updated[sIdx].image }; 
                                            setCurrentCustomSlides(updated);
                                            packageAndSaveSlides(updated, currentTitleText, currentCatText, genAuthor, genValue);
                                            alert("✓ Đã cập nhật lại nội dung slide bằng AI thành công!");
                                          }
                                        } catch (err: any) {
                                          alert("Lỗi AI viết lại: " + err.message);
                                        } finally {
                                          setGiftDocLoading(false);
                                        }
                                      }}
                                      className="text-[10px] bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 px-2.5 py-1 rounded font-bold transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50"
                                    >
                                      ✨ AI Viết Lại Trang Này
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...currentCustomSlides];
                                        updated.splice(sIdx + 1, 0, { ...slide, title: slide.title + ' (Bản sao)' });
                                        setCurrentCustomSlides(updated);
                                        packageAndSaveSlides(updated, currentTitleText, currentCatText, genAuthor, genValue);
                                      }}
                                      className="text-[10px] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded font-bold transition-all flex items-center gap-1 active:scale-95"
                                    >
                                      <Plus className="w-3 h-3" /> Chèn Thêm Trang (Trùng lặp)
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!confirm("Bạn có chắc chắn muốn xóa trang này?")) return;
                                        const updated = [...currentCustomSlides];
                                        updated.splice(sIdx, 1);
                                        setCurrentCustomSlides(updated);
                                        packageAndSaveSlides(updated, currentTitleText, currentCatText, genAuthor, genValue);
                                      }}
                                      className="text-[10px] bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 px-2.5 py-1 rounded font-bold transition-all flex items-center gap-1 active:scale-95 ml-auto"
                                    >
                                      <Trash2 className="w-3 h-3" /> Xóa Trang
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* List column */}
          <div className="lg:col-span-7 bg-white p-6 rounded-md shadow-sm border border-gray-200">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-4">
              <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider">Kho Sản Phẩm Số Đang Kinh Doanh ({onlineProducts.length})</h4>
              <span className="text-[10px] bg-red-150 text-red-600 font-bold px-2 py-0.5 rounded-full">Quà Tặng Khách Hàng</span>
            </div>

            <div className="space-y-3">
              {onlineProducts.map((op: any) => (
                <div key={op.id} className="p-3 border rounded border-gray-200 flex justify-between items-center bg-gray-50/40 hover:bg-gray-50/80 transition-all text-xs">
                  <div className="space-y-1">
                    <span className="inline-block px-1.5 py-0.5 bg-orange-100 text-shopee-orange font-bold text-[9px] rounded-full mr-2">
                      {op.type === 'mienphi' ? 'FREEBIE' : (op.type || 'Sản phẩm').toUpperCase()}
                    </span>
                    <strong className="text-gray-900 block font-medium mt-1">{op.title}</strong>
                    <div className="text-gray-500 text-[10.5px]">
                      Giá bán: <span className="text-red-650 font-bold">{op.isFree ? 'Miễn phí 0đ' : formatCurrency(op.price)}</span>
                      {op.originalPrice > op.price && (
                        <span className="line-through ml-2 text-gray-400">{formatCurrency(op.originalPrice)}</span>
                      )}
                    </div>
                    {op.isFree && (
                      <label className="flex items-center gap-1.5 cursor-pointer mt-1.5 mb-1 select-none">
                        <input
                          type="checkbox"
                          checked={giftMaterials.some(gm => gm.title === op.title)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              onSetGiftMaterials(prev => [...prev.filter(g => g.title !== op.title), { id: 'gm_' + Date.now(), title: op.title, categoryType: 'Quà Tặng Tự Chọn', downloadUrl: op.downloadUrl, value: op.price || 0, isAutoGeneratedWebDoc: op.isAutoGeneratedWebDoc, htmlContent: op.htmlContent }]);
                            } else {
                              onSetGiftMaterials(prev => prev.filter(g => g.title !== op.title));
                            }
                          }}
                          className="accent-[#ee4d2d] cursor-pointer"
                        />
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          🎁 Đưa vào vòng quay trúng thưởng
                        </span>
                      </label>
                    )}
                    {op.isAutoGeneratedWebDoc ? (
                      <div className="flex flex-wrap gap-2 mt-1.5 pt-0.5">
                        <button
                          type="button" 
                          onClick={(e) => {
                            try {
                              e.preventDefault();
                              let rawHtml = '';
                              if (op.htmlContent) {
                                rawHtml = op.htmlContent;
                              } else if (op.downloadUrl) {
                                if (op.downloadUrl.startsWith('data:')) {
                                  const parts = op.downloadUrl.split(',');
                                  rawHtml = decodeURIComponent(parts.slice(1).join(','));
                                } else {
                                  window.open(op.downloadUrl, '_blank');
                                  return;
                                }
                              } else {
                                alert("Lỗi: Không tìm thấy nội dung tài liệu. Vui lòng liên hệ Admin!");
                                return;
                              }
                              const blob = new Blob([rawHtml], { type: 'text/html;charset=utf-8' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.style.display = 'none';
                              a.href = url;
                              a.download = `${op.title || 'Tai-Lieu'}.html`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              setTimeout(() => URL.revokeObjectURL(url), 30000);
                            } catch (err) {
                              console.error(err);
                              alert("Lỗi tải xuống tài liệu!");
                            }
                          }}
                          className="inline-flex items-center gap-1 text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-2 py-1 rounded border border-indigo-200 transition-all cursor-pointer"
                        >
                          📥 Tải tài liệu (.html)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              let rawHtml = '';
                              if (op.htmlContent) {
                                rawHtml = op.htmlContent;
                              } else if (op.downloadUrl) {
                                if (op.downloadUrl.startsWith('data:')) {
                                  const parts = op.downloadUrl.split(',');
                                  rawHtml = decodeURIComponent(parts.slice(1).join(','));
                                } else {
                                  window.open(op.downloadUrl, '_blank');
                                  return;
                                }
                              } else {
                                alert("Lỗi: Không tìm thấy nội dung tài liệu. Vui lòng liên hệ Admin!");
                                return;
                              }
                              const blob = new Blob([rawHtml], { type: 'text/html;charset=utf-8' });
                              const url = URL.createObjectURL(blob);
                              const newWindow = window.open(url, "_blank");
                              if (!newWindow) {
                                alert("Vui lòng cho phép quyền Popups để đọc trực tiếp trên trình duyệt!");
                              }
                            } catch (err) {
                              console.error(err);
                              alert("Lỗi mở tài liệu!");
                            }
                          }}
                          className="inline-flex items-center gap-1 text-[10px] bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold px-2 py-1 rounded border border-amber-200 transition-all cursor-pointer"
                        >
                          👁️ Đọc trực tuyến VIP
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/?directGift=${op.id}`);
                            alert('Đã copy Link Tặng Nhận Quà (Trực tiếp)! Người nhận link này sẽ vào đọc/tải luôn không cần Spin.');
                          }}
                          className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded border border-emerald-200 transition-all cursor-pointer"
                        >
                          🔗 Copy Link Tặng Nhanh
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 mt-1">
                        <span className="text-[10px] text-gray-400 truncate max-w-[340px] block font-mono">Link file: {op.downloadUrl}</span>
                        <div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/?directGift=${op.id}`);
                              alert('Đã copy Link Tặng Nhận Quà (Trực tiếp)! Người nhận link này sẽ vào đọc/tải luôn không cần Spin.');
                            }}
                            className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded border border-emerald-200 transition-all cursor-pointer"
                          >
                            🔗 Copy Link Tặng Nhanh
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-1.5 items-end">
                    <button 
                      onClick={() => openDistrModal(op)}
                      className="inline-flex items-center gap-1 p-1 px-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-[10px] rounded border border-blue-200 transition-all cursor-pointer whitespace-nowrap"
                    >
                      <Share2 className="w-3.5 h-3.5" /> Phân Quyền
                    </button>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => openEditOpModal(op)}
                        className="p-1 px-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 hover:text-amber-800 rounded border border-transparent hover:border-amber-200 cursor-pointer"
                        title="Chỉnh sửa sản phẩm/quà tặng"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => {
                          const next = onlineProducts.filter((p: any) => p.id !== op.id);
                          saveOnlineProducts(next);
                        }}
                        className="p-1 px-1.5 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 rounded border border-transparent hover:border-red-200 cursor-pointer"
                        title="Xóa sản phẩm này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {adminTab === 'gemini_keys' && (
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 space-y-6 animate-fadeIn font-sans">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-base font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-600 animate-pulse" />
              Cấu hình Khóa API Gemini Cho Quản Trị

            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Nhập và kiểm tra các khóa API Gemini miễn phí để viết bài, phân tích dữ liệu, và vận hành chatbot thu hút khách hàng trực tiếp trên web mà không cần cấu hình phía máy chủ. Hệ thống sẽ tự động sử dụng Khóa được kích hoạt hiện tại.
            </p>
          </div>

          <div className="space-y-3 empty:hidden">
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded text-xs font-semibold animate-fadeIn">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded text-xs font-semibold animate-fadeIn">
                {successMsg}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Box: Add new key form */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#ee4d2d] border-b border-slate-200 pb-2 flex items-center gap-1">
                ➕ Thêm Khóa API Mới
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-600 font-bold mb-1">Mã Khóa API (*):</label>
                  <input
                    type="text"
                    placeholder="AIzaSy..."
                    className="w-full border rounded px-3 py-2 text-xs focus:ring-1 focus:ring-shopee-orange focus:outline-none"
                    value={newKeyVal}
                    onChange={e => setNewKeyVal(e.target.value)}
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Lấy từ Google AI Studio.</p>
                </div>
                <div>
                  <label className="block text-gray-600 font-bold mb-1">Tên gợi nhớ / Ghi chú:</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Key phụ 1, Key dự phòng"
                    className="w-full border rounded px-3 py-2 text-xs focus:ring-1 focus:ring-shopee-orange focus:outline-none"
                    value={newKeyLabel}
                    onChange={e => setNewKeyLabel(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddKey}
                  className="w-full bg-[#ee4d2d] text-white font-extrabold py-2 px-4 rounded text-xs hover:bg-[#d13c1f] transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1"
                >
                  📥 Thêm & Lưu Khóa
                </button>
              </div>
            </div>

            {/* Right Box: Key list table */}
            <div className="md:col-span-2 space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-700 bg-gray-50 p-2.5 rounded border border-gray-200 flex items-center justify-between">
                <span>📋 Danh sách Khóa API đang lưu</span>
                <span className="text-[10.5px] text-gray-500 normal-case font-normal">Cài đặt lưu trong trình duyệt của bạn</span>
              </h3>

              {(!geminiKeys || geminiKeys.length === 0) ? (
                <div className="text-center p-8 border border-dashed border-gray-200 rounded-lg bg-gray-50">
                  <Key className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 font-bold">Chưa có khóa API nào được nhập.</p>
                  <p className="text-[10.5px] text-gray-400 mt-0.5">Vui lòng nhập khóa API ở cột bên trái để bắt đầu bẻ khóa AI miễn phí!</p>
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden bg-white shadow-3xs max-h-[400px] overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 uppercase text-[9.5px] tracking-wider border-b font-sans">
                        <th className="p-3 font-extrabold">Trạng thái</th>
                        <th className="p-3 font-extrabold">Ghi chú</th>
                        <th className="p-3 font-extrabold">Mã API Key (Ẩn)</th>
                        <th className="p-3 font-extrabold text-right">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {geminiKeys.map((k: any) => {
                        const maskKey = k.key ? `${k.key.substring(0, 6)}...${k.key.slice(-4)}` : '';
                        return (
                          <tr key={k.id} className={`hover:bg-slate-55 transition-colors ${k.isActive ? 'bg-orange-50/50' : ''}`}>
                            <td className="p-3 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                {k.isActive ? (
                                  <span className="bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded text-[10px] flex items-center gap-1 border border-green-200">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                                    ONLINE
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleSetActiveKey(k.id)}
                                    className="bg-gray-100 hover:bg-slate-200 text-gray-700 font-bold px-2 py-0.5 rounded text-[10px] border tracking-wide cursor-pointer transition-colors"
                                  >
                                    Kích hoạt
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="font-bold text-gray-850 truncate max-w-[120px]" title={k.label}>{k.label}</div>
                            </td>
                            <td className="p-3 font-mono text-gray-500 select-all">{maskKey}</td>
                            <td className="p-3 text-right whitespace-nowrap">
                              <div className="inline-flex gap-1">
                                <button
                                  type="button"
                                  disabled={testingKeyId === k.id}
                                  onClick={() => handleTestKey(k.id, k.key)}
                                  className={`px-2 py-1 select-none text-[10px] font-bold rounded flex items-center gap-0.5 transition-colors cursor-pointer border ${
                                    k.status === 'valid'
                                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                      : k.status === 'invalid'
                                      ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                                      : 'bg-indigo-50 border-indigo-100 text-indigo-700 hover:bg-indigo-100'
                                  }`}
                                  title="Kiểm tra hạn mức & tính hợp lệ của key này"
                                >
                                  {testingKeyId === k.id ? (
                                    <span className="animate-spin text-[9px]">⌛ Đang check...</span>
                                  ) : (
                                    <>🔍 Test Key</>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteKey(k.id)}
                                  className="px-2 py-1 text-[10px] font-bold bg-white text-gray-500 border hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded transition-colors cursor-pointer flex items-center gap-0.5"
                                  title="Xóa khóa này"
                                >
                                  🗑️ Xóa
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* API Key Problem Notifications / Warning Banner */}
              {geminiKeys && geminiKeys.some((k: any) => k.status === 'invalid') && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 text-xs text-red-800 leading-relaxed font-sans shadow-2xs space-y-1.5 animate-fadeIn">
                  <div className="font-extrabold flex items-center gap-1.5 text-red-900 border-b border-red-100 pb-1">
                    ⚠️ PHÁT HIỆN SỰ CỐ VỀ KHÓA API GEMINI:
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] font-normal">
                    {geminiKeys.filter((k: any) => k.status === 'invalid').map((k: any) => (
                      <li key={k.id}>
                        Khóa <strong>"{k.label}"</strong> báo lỗi/quota: <span className="underline italic text-red-950 font-mono break-all">{k.error || "Lỗi chưa rõ nguyên nhân."}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-red-600 font-bold bg-red-100/50 p-1 rounded mt-2 text-center">
                    Gợi ý: Đổi sang khóa API khác hoặc kích hoạt lại khóa đang hoạt động tốt để các tính năng ổn định!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {adminTab === 'licenses' && adminRole === 'super' && (
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 space-y-6 animate-fadeIn font-sans">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-base font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-600 animate-pulse" />
              Quản lý bản quyền / Bán Web cho khách
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Bạn có thể tạo các link web riêng cho khách hàng. Khách mở link đó trên trình duyệt của họ sẽ sở hữu một trang web hoàn chỉnh, có quyền quản trị y hệt bạn, nhưng tuyệt đối không được phép tạo link web khác. Tối đa 3 thiết bị mỗi link.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-2">
            <input 
              type="text" 
              placeholder="Nhập tên khách hàng..." 
              value={newLicenseName} 
              onChange={e => setNewLicenseName(e.target.value)} 
              className="border border-gray-300 rounded-md px-3 py-2 text-sm max-w-[200px] flex-1 outline-none focus:ring-1 focus:ring-shopee-orange"
            />
            <input 
              type="text" 
              placeholder="Tên Website/Brand (Tùy chọn)..." 
              value={newLicenseBrandName} 
              onChange={e => setNewLicenseBrandName(e.target.value)} 
              className="border border-gray-300 rounded-md px-3 py-2 text-sm max-w-[200px] flex-1 outline-none focus:ring-1 focus:ring-shopee-orange"
            />
            <button 
              onClick={handleCreateLicense}
              className="bg-shopee-orange hover:bg-[#d8401a] text-white px-4 py-2 rounded-md font-bold text-sm shadow cursor-pointer transition-colors"
            >
              Tạo Giấy Phép Mới
            </button>
          </div>

          <div className="overflow-x-auto mt-4 border rounded-md shadow-3xs max-h-[400px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-[9.5px] tracking-wider border-b font-sans">
                  <th className="p-3 font-extrabold">Trạng thái</th>
                  <th className="p-3 font-extrabold">Tên KH</th>
                  <th className="p-3 font-extrabold">Mã Giấy Phép / Link truy cập</th>
                  <th className="p-3 font-extrabold text-center">Thiết bị</th>
                  <th className="p-3 font-extrabold text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {licenses.map(lic => (
                  <tr key={lic.id} className="hover:bg-slate-50">
                    <td className="p-3 whitespace-nowrap">
                      {lic.status === 'active' ? (
                        <span className="bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded text-[10px]">Đang hoạt động</span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-800 font-bold px-2 py-0.5 rounded text-[10px]">Tạm dừng</span>
                      )}
                    </td>
                    <td className="p-3 font-bold text-gray-800">{lic.customerName}</td>
                    <td className="p-3 font-mono text-gray-500">
                      <div className="flex items-center gap-2">
                        {lic.id}
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/?license=${lic.id}&brand=${encodeURIComponent(lic.customerName)}`);
                            alert(`Đã copy Link với thương hiệu: ${lic.customerName}`);
                          }}
                          className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-1 rounded text-[9px] font-bold cursor-pointer hover:bg-indigo-100"
                        >
                          Copy Link
                        </button>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span className="font-bold">{lic.devices.length} / {lic.maxDevices}</span> thiết bị
                    </td>
                    <td className="p-3 text-right">
                      <div className="inline-flex gap-1 justify-end">
                        <button 
                          onClick={() => handleToggleLicense(lic.id)}
                          className="px-2 py-1 text-[10px] font-bold bg-gray-50 border text-gray-600 rounded hover:bg-gray-100"
                        >
                          {lic.status === 'active' ? '⏸️ Tạm Dừng' : '▶️ Mở lại'}
                        </button>
                        <button 
                          onClick={() => handleDeleteLicense(lic.id)}
                          className="px-2 py-1 text-[10px] font-bold bg-red-50 border border-red-200 text-red-600 rounded hover:bg-red-100"
                        >
                          🗑️ Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {licenses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-500 font-bold">Chưa tạo giấy phép quản trị nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {adminTab === 'database' && (
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 space-y-6 animate-fadeIn font-sans">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-base font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600 animate-pulse" />
              Lưu Trữ Dữ Liệu Đám Mây (Supabase)
            </h2>
            <p className="text-xs text-gray-500 mt-2">
              Kết nối dự án tới cơ sở dữ liệu Supabase để tự động lưu & đồng bộ Quà Tặng / Khách Hàng. Khi kết nối, hệ thống sẽ lưu qua Đám mây thay vì Bộ nhớ đệm.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Supabase Project URL</label>
                <input 
                  type="url" 
                  value={dbSupabaseUrl}
                  onChange={e => setDbSupabaseUrl(e.target.value)}
                  placeholder="https://xxxx.supabase.co"
                  className="w-full border rounded px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 bg-gray-50 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Supabase Anon/Public Key</label>
                <input 
                  type="password" 
                  value={dbSupabaseKey}
                  onChange={e => setDbSupabaseKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6I..."
                  className="w-full border rounded px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 bg-gray-50 font-mono"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={async () => {
                    let url = dbSupabaseUrl.trim();
                    const key = dbSupabaseKey.trim();
                    if(!url || !key) {
                      alert("Vui lòng nhập cả URL và Key trước khi lưu.");
                      return;
                    }
                    
                    if (!url.startsWith('http') && !url.includes('.')) {
                        url = `https://${url}.supabase.co`;
                    }
                    
                    try {
                      const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
                      const [bRes, pRes] = await Promise.all([
                        fetch(`${cleanUrl}/rest/v1/buyers?select=id`, { headers: { apikey: key, Authorization: `Bearer ${key}` } }),
                        fetch(`${cleanUrl}/rest/v1/online_products?select=id`, { headers: { apikey: key, Authorization: `Bearer ${key}` } })
                      ]);
                      
                      const textB = await bRes.text();
                      if (bRes.ok && pRes.ok) {
                        try {
                          JSON.parse(textB); // verify it's JSON
                          localStorage.setItem('supabase_url', cleanUrl);
                          localStorage.setItem('supabase_key', key);
                          setDbSupabaseUrl(cleanUrl);
                          await fetch('/api/db-config', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ url: cleanUrl, key: key })
                          }).catch(() => {});
                          alert('✅ Cấu hình Supabase đã được lưu!\n\nKết nối thành công tới Database. Đã đồng bộ với Cloud. Khách hàng giờ đây có thể nhìn thấy dữ liệu.');
                        } catch (parseErr) {
                          alert("❌ Lỗi lưu cấu hình: URL không hợp lệ (không trả về cấu trúc dữ liệu JSON đúng của Supabase).");
                        }
                      } else {
                        alert("❌ Lỗi: URL hoặc Key chưa đúng, kết nối thất bại. Vui lòng kiểm tra lại URL/Key hoặc bạn chưa chạy mã SQL để tạo bảng dữ liệu.");
                      }
                    } catch (e) {
                      alert("❌ Lỗi mạng khi kiểm tra kết nối Database. Vui lòng kiểm tra URL có chính xác không.");
                    }
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-4 rounded shadow-sm transition-colors cursor-pointer flex-1"
                >
                  Lưu Cấu Hình Key & Áp Dụng Ngay
                </button>
                <button
                  onClick={async () => {
                   let url = (dbSupabaseUrl.trim() || localStorage.getItem('supabase_url') || '') as string;
                   const key = (dbSupabaseKey.trim() || localStorage.getItem('supabase_key')) as string;
                   if(!url || !key) { alert("Vui lòng nhập URL và Key trước!"); return; }
                   
                   if (!url.startsWith('http') && !url.includes('.')) {
                       url = `https://${url}.supabase.co`;
                   }
                   
                   try {
                     const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
                     const [bRes, pRes] = await Promise.all([
                       fetch(`${cleanUrl}/rest/v1/buyers?select=id`, { headers: { apikey: key, Authorization: `Bearer ${key}` } }),
                       fetch(`${cleanUrl}/rest/v1/online_products?select=id`, { headers: { apikey: key, Authorization: `Bearer ${key}` } })
                     ]);
                     
                     const textB = await bRes.text();
                     const textP = await pRes.text();

                     if(bRes.ok && pRes.ok) {
                       try {
                         const bData = JSON.parse(textB);
                         const pData = JSON.parse(textP);
                         alert(`✅ Trạng thái Máy chủ Đám mây:\n\n- Đã đồng bộ kết nối thành công.\n- Đã đồng bộ ${bData.length} Khách Hàng.\n- Đã lưu trữ ${pData.length} Quà tặng/Tài liệu.\n\nAPI đang chạy bình thường.`);
                       } catch (parseErr) {
                         alert("❌ Lỗi: Phản hồi từ Server không phải là dữ liệu hợp lệ (không phải JSON). Vui lòng kiểm tra lại chính xác Project URL của Supabase (thường có định dạng https://[PROJECT_ID].supabase.co).");
                       }
                     } else {
                       let errMsg = `❌ Lỗi kết nối (${bRes.status}): Không thể tải bản ghi.`;
                       try {
                         const errResp = JSON.parse(textB);
                         if (errResp.message) errMsg += `\nChi tiết: ${errResp.message}`;
                       } catch(e) { /* ignore */ }
                       alert(errMsg + `\n\nURL/Key chưa đúng tài nguyên, hoặc chưa chạy mã SQL tạo bảng bên dưới.`);
                     }
                   } catch(e) {
                     alert("Lỗi mạng khi gọi Cloud Database (Có thể do sai URL hoặc bị chặn CORS): " + e);
                   }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-2.5 px-4 rounded shadow-sm transition-colors cursor-pointer sm:w-auto"
                >
                  👁️ Xem Thống Kê DB
                </button>
                <button
                  onClick={async () => {
                    let url = (dbSupabaseUrl.trim() || localStorage.getItem('supabase_url') || '') as string;
                    const key = (dbSupabaseKey.trim() || localStorage.getItem('supabase_key')) as string;
                    if(!url || !key) { alert("Vui lòng nhập URL và Key trước!"); return; }
                    if (!url.startsWith('http') && !url.includes('.')) url = `https://${url}.supabase.co`;
                    try {
                      const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
                      const siteConfig = {
                         categories,
                         giftCampaigns,
                         giftClaimLink: giftClaimLink || '',
                         guaranteedWinSpins: guaranteedWinSpins || 0,
                         socials,
                         adminFacebook,
                         adminZalo,
                         adminTiktok,
                         geminiKeys: (geminiKeys || []).filter(k => k.status === 'valid').map(k => ({...k, key: btoa(k.key)}))
                      };
                      
                      const siteConfigItem = {
                        id: '__SITE_CONFIG__',
                        title: 'System Configuration',
                        price: 0,
                        originalPrice: 0,
                        isFree: true,
                        htmlContent: JSON.stringify(siteConfig),
                        isShowOnHome: false,
                        isSystemGenerated: true
                      };
                      
                      setSuccessMsg("⏳ Đang đẩy dữ liệu lên Database, vui lòng chờ...");

                      const tryPushToTable = async (tableName: string, payloadItems: any[]) => {
                        const chunkSize = 20;
                        for (let i = 0; i < payloadItems.length; i += chunkSize) {
                          const chunk = payloadItems.slice(i, i + chunkSize);
                          const res = await fetch(`${cleanUrl}/rest/v1/${tableName}?on_conflict=id`, {
                            method: 'POST',
                            headers: { 
                              'apikey': key, 
                              'Authorization': `Bearer ${key}`,
                              'Content-Type': 'application/json',
                              'Prefer': 'resolution=merge-duplicates'
                            },
                            body: JSON.stringify(chunk)
                          });
                          if (!res.ok) {
                             const errText = await res.text();
                             throw new Error(`Error in ${tableName}: ` + errText);
                          }
                        }
                      };
                      
                      try {
                         // 1. Digital Products + Config
                         const digitalItems = [siteConfigItem, ...onlineProducts].map(p => ({
                               id: p.id,
                               title: p.title || '',
                               price: p.price || 0,
                               "originalPrice": p.originalPrice || 0,
                               "isFree": p.isFree !== undefined ? p.isFree : false,
                               "downloadUrl": p.downloadUrl || null,
                               "htmlContent": p.htmlContent || null,
                               "isShowOnHome": p.isShowOnHome !== undefined ? p.isShowOnHome : false,
                               "isSystemGenerated": p.isSystemGenerated !== undefined ? p.isSystemGenerated : false,
                               "isPubliclyClaimable": p.isPubliclyClaimable !== undefined ? p.isPubliclyClaimable : true,
                               "allowedBuyerIds": p.allowedBuyerIds || null
                         }));
                         const digIds = digitalItems.map(p => p.id);
                         await fetch(`${cleanUrl}/rest/v1/digital_products?id=not.in.(${digIds.join(',')})`, { method: 'DELETE', headers: { 'apikey': key, 'Authorization': `Bearer ${key}` } }).catch(()=>{});
                         if (digitalItems.length > 0) await tryPushToTable('digital_products', digitalItems);

                         // 2. Affiliate Products
                         const affItems = products.map(p => ({
                             id: p.id,
                             title: p.title || '',
                             price: p.price || 0,
                             "originalPrice": p.originalPrice || 0,
                             "discountPercent": p.discountPercent || 0,
                             image: p.image || '',
                             "videoUrl": p.videoUrl || null,
                             "categoryId": p.categoryId || null,
                             "affiliateLink": p.affiliateLink || '',
                             platform: p.platform || 'other',
                             "soldCount": p.soldCount || 0,
                             description: p.description || null,
                             "isSuggested": p.isSuggested !== undefined ? p.isSuggested : false,
                             "isDirectProduct": p.isDirectProduct !== undefined ? p.isDirectProduct : false,
                             "postDate": p.postDate || null
                         }));
                         const affIds = affItems.length > 0 ? affItems.map(p => p.id) : ['dummy'];
                         await fetch(`${cleanUrl}/rest/v1/affiliate_products?id=not.in.(${affIds.join(',')})`, { method: 'DELETE', headers: { 'apikey': key, 'Authorization': `Bearer ${key}` } }).catch(()=>{});
                         if (affItems.length > 0) await tryPushToTable('affiliate_products', affItems);

                         // 3. Gifts
                         const giftItems = giftMaterials.map((g: any) => ({
                             id: g.id || 'g_' + Date.now(),
                             title: g.title || '',
                             "htmlContent": g.htmlContent || null,
                             "isPubliclyClaimable": g.isPubliclyClaimable !== undefined ? g.isPubliclyClaimable : true
                         }));
                         const giftIds = giftItems.length > 0 ? giftItems.map(p => p.id) : ['dummy'];
                         await fetch(`${cleanUrl}/rest/v1/gifts?id=not.in.(${giftIds.join(',')})`, { method: 'DELETE', headers: { 'apikey': key, 'Authorization': `Bearer ${key}` } }).catch(()=>{});
                         if (giftItems.length > 0) await tryPushToTable('gifts', giftItems);
                         setSuccessMsg('');
                         alert("✅ Đã đẩy Toàn Bộ Sản phẩm Affiliate, Quà Tặng và Cấu Hình lên Cloud thành công!\n\nWebsite của khách khi khởi chạy sẽ tự lấy dữ liệu từ Database này. Tất cả khách hàng sẽ thấy cùng một nội dung.");
                      } catch (e: any) {
                         setSuccessMsg('');
                         alert("❌ Lỗi khi đẩy lên Cloud: " + (e.message || String(e)));
                      }
                    } catch (outerErr: any) {
                       alert("❌ Lỗi kết nối Cloud (Lỗi mạng hoặc sai URL): " + outerErr);
                    }
                  }}
                  className="bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-bold py-2.5 px-4 rounded shadow-sm transition-colors cursor-pointer sm:w-auto"
                >
                  🚀 Đẩy Toàn Bộ Dữ Liệu Lên Cloud
                </button>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded p-4 text-emerald-400 font-mono text-[10px] overflow-auto shadow-inner relative max-h-80">
              <div className="text-white font-bold opacity-80 mb-2 border-b border-slate-800 pb-2">📦 MÃ SQL TẠO BẢNG CHUẨN (Chạy ở SQL Editor Supabase)</div>
              <button 
                onClick={() => {
                  const sql = `-- Chạy mã này trong Supabase > SQL Editor để tạo bảng:
CREATE TABLE IF NOT EXISTS public.buyers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "phoneNumber" text UNIQUE NOT NULL,
  "fullName" text NOT NULL,
  address text,
  email text,
  "registeredAt" text
);

CREATE TABLE IF NOT EXISTS public.digital_products (
  id text PRIMARY KEY,
  title text NOT NULL,
  price numeric,
  "originalPrice" numeric,
  "isFree" boolean,
  "downloadUrl" text,
  "htmlContent" text,
  "isShowOnHome" boolean,
  "isSystemGenerated" boolean,
  "isPubliclyClaimable" boolean,
  "allowedBuyerIds" jsonb
);

CREATE TABLE IF NOT EXISTS public.gifts (
  id text PRIMARY KEY,
  title text NOT NULL,
  "htmlContent" text,
  "isPubliclyClaimable" boolean
);

CREATE TABLE IF NOT EXISTS public.affiliate_products (
  id text PRIMARY KEY,
  title text NOT NULL,
  price numeric,
  "originalPrice" numeric,
  "discountPercent" numeric,
  image text,
  "videoUrl" text,
  "categoryId" text,
  "affiliateLink" text,
  platform text,
  "soldCount" numeric,
  description text,
  "isSuggested" boolean,
  "isDirectProduct" boolean,
  "postDate" text
);

insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true) on conflict (id) do nothing;
create policy "Allow public read access on product-images" on storage.objects for select using ( bucket_id = 'product-images' );
create policy "Allow all uploads on product-images" on storage.objects for insert with check ( bucket_id = 'product-images' );

ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow ALL" ON public.buyers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow ALL" ON public.digital_products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow ALL" ON public.gifts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow ALL" ON public.affiliate_products FOR ALL USING (true) WITH CHECK (true);
`;
                  navigator.clipboard.writeText(sql);
                  alert('Đã copy mã SQL!');
                }}
                className="absolute top-2 right-2 bg-slate-700 hover:bg-slate-600 text-white px-2 py-0.5 rounded text-[9px] cursor-pointer"
              >
                Copy SQL
              </button>
              <pre className="whitespace-pre-wrap leading-relaxed select-all">
{`-- Chạy mã này trong Supabase > SQL Editor để tạo các bảng riêng biệt:

CREATE TABLE IF NOT EXISTS public.buyers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "phoneNumber" text UNIQUE NOT NULL,
  "fullName" text NOT NULL,
  address text,
  email text,
  "registeredAt" text
);

CREATE TABLE IF NOT EXISTS public.digital_products (
  id text PRIMARY KEY,
  title text NOT NULL,
  price numeric,
  "originalPrice" numeric,
  "isFree" boolean,
  "downloadUrl" text,
  "htmlContent" text,
  "isShowOnHome" boolean,
  "isSystemGenerated" boolean,
  "isPubliclyClaimable" boolean,
  "allowedBuyerIds" jsonb
);

CREATE TABLE IF NOT EXISTS public.gifts (
  id text PRIMARY KEY,
  title text NOT NULL,
  "htmlContent" text,
  "isPubliclyClaimable" boolean
);

CREATE TABLE IF NOT EXISTS public.affiliate_products (
  id text PRIMARY KEY,
  title text NOT NULL,
  price numeric,
  "originalPrice" numeric,
  "discountPercent" numeric,
  image text,
  "videoUrl" text,
  "categoryId" text,
  "affiliateLink" text,
  platform text,
  "soldCount" numeric,
  description text,
  "isSuggested" boolean,
  "isDirectProduct" boolean,
  "postDate" text
);

-- Tự động tạo Storage Bucket để chứa ảnh
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Allow public read access on product-images"
  on storage.objects for select
  using ( bucket_id = 'product-images' );

create policy "Allow all uploads on product-images"
  on storage.objects for insert
  with check ( bucket_id = 'product-images' );

-- Bật RLS và cấp quyền Public (Cho phép tải dễ dàng)
ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow ALL" ON public.buyers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow ALL" ON public.digital_products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow ALL" ON public.gifts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow ALL" ON public.affiliate_products FOR ALL USING (true) WITH CHECK (true);
`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Public Link Share Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowPasswordModal(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-auto relative overflow-hidden"
            >
              <button 
                onClick={() => setShowPasswordModal(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-full p-1 cursor-pointer transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
              
              <div className="text-center mb-5">
                <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-sm font-black text-gray-900 uppercase">Đổi Mật Khẩu</h3>
                <p className="text-[11px] text-gray-500 mt-1">Cập nhật mật khẩu đang dùng cho phân quyền {adminRole === 'super' ? 'Admin' : 'Khách VIP'}</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Mật khẩu hiện tại</label>
                  <input type="password" value={pwOld} onChange={e => setPwOld(e.target.value)} className="w-full border p-2 text-sm rounded bg-gray-50" placeholder="Để trống nếu mặc định..." />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Mật khẩu mới (tối thiểu 6 ký tự)</label>
                  <input type="password" value={pwNew} onChange={e => setPwNew(e.target.value)} className="w-full border p-2 text-sm rounded bg-gray-50" placeholder="Ký tự an toàn..." />
                </div>
                <button 
                  onClick={() => {
                    if (adminRole === 'super') {
                      const currentDefault = localStorage.getItem('admin_password') || '112231vn';
                      if ((pwOld || '') !== currentDefault) { alert("Mật khẩu hiện tại không đúng!"); return; }
                      if (pwNew.length < 6) { alert("Mật khẩu mới phải từ 6 ký tự!"); return; }
                      localStorage.setItem('admin_password', pwNew);
                      alert("Đổi mật khẩu Admin thành công!");
                    } else {
                      const currentDefault = localStorage.getItem('client_password');
                      if (currentDefault && (pwOld || '') !== currentDefault) { alert("Mật khẩu hiện tại không đúng!"); return; }
                      if (pwNew.length < 6) { alert("Mật khẩu mới phải từ 6 ký tự!"); return; }
                      localStorage.setItem('client_password', pwNew);
                      alert("Đổi mật khẩu tài khoản Khách thành công!");
                    }
                    setShowPasswordModal(false);
                    setPwOld(''); setPwNew('');
                  }}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded text-sm transition-colors"
                >
                  Xác Nhận Đổi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPublicLinkModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowPublicLinkModal(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-auto relative overflow-hidden"
            >
              <button 
                onClick={() => setShowPublicLinkModal(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-full p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>

              <div className="text-center mb-5">
                <div className="mx-auto w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center mb-3">
                  <QrCode className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-black text-gray-900 leading-tight">Chia sẻ trang web</h3>
                <p className="text-xs text-gray-500 mt-1 font-medium px-4">Gửi link hoặc mã QR cho khách vãng lai xem trang của bạn mà không cần đăng nhập.</p>
              </div>

              <div className="flex justify-center mb-5">
                <div className="p-3 bg-white border-2 border-gray-100 rounded-lg shadow-sm">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.origin)}`} 
                    alt="Web QR Code" 
                    className="w-[180px] h-[180px]"
                  />
                </div>
              </div>

              <div className="relative">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Đường dẫn Website:</div>
                <div className="flex shadow-sm rounded-md overflow-hidden border border-gray-200">
                  <input 
                    type="text" 
                    readOnly 
                    value={window.location.origin}
                    className="flex-1 bg-gray-50 text-xs text-gray-600 px-3 py-2.5 outline-none font-mono"
                  />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.origin);
                      alert('Đã copy đường dẫn website!');
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <button 
                  onClick={() => {
                    const text = `Ghé thăm cửa hàng của chúng tôi tại: ${window.location.origin}`;
                    window.open(`https://zalo.me/share?v=4&link=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(text)}`);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-2 rounded-md flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <img src="https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/Zalo_Official_Logo.svg/1024px-Zalo_Official_Logo.svg.png" className="w-3.5 h-3.5 brightness-0 invert" alt="zalo" />
                  Gửi Zalo
                </button>
                <button 
                  onClick={() => {
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`);
                  }}
                  className="bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold py-2 rounded-md flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <Facebook className="w-3.5 h-3.5 fill-current" />
                  Chia sẻ FB
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Gift Distribution / Phân Quyền Modal */}
      {showDistrModal && distrProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-md shadow-xl max-w-lg w-full overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]"
          >
            <div className="bg-indigo-600 px-4 py-3 text-white flex justify-between items-center shrink-0">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Phân quyền Quà: {distrProduct.title}
              </h2>
              <button 
                onClick={() => setShowDistrModal(false)} 
                className="text-white/80 hover:text-white p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-sm bg-gray-50/50">
              <div className="bg-white p-3 rounded border border-gray-200">
                <label className="flex items-center gap-2 font-semibold text-gray-800 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={distrIsShowOnHome}
                    onChange={(e) => setDistrIsShowOnHome(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded"
                  />
                  👁️ Hiển thị công khai lên Bảng tin Trang Chủ
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  Nếu chọn, món quà sẽ hiện ở phần Gợi ý trên trang chủ để khách vãng lai dễ thấy.
                </p>
              </div>

              <div className="bg-white p-3 rounded border border-gray-200 space-y-3">
                <h3 className="font-bold text-gray-800 border-b pb-2 mb-2">📥 CHẾ ĐỘ NHẬN QUÀ QUA LINK TRỰC TIẾP</h3>
                
                <label className="flex gap-2 font-semibold text-gray-800 cursor-pointer">
                  <input 
                    type="radio" 
                    name="distrType"
                    checked={distrIsPublic}
                    onChange={() => setDistrIsPublic(true)}
                    className="w-4 h-4 accent-indigo-600 mt-0.5"
                  />
                  <div>
                    Mở Rộng (Public)
                    <p className="text-xs text-gray-500 font-normal">Bất cứ ai có Link Tặng Quà đều có thể truy cập & tải về luôn mà không cần phải đăng nhập hay nhập SĐT.</p>
                  </div>
                </label>

                <label className="flex gap-2 font-semibold text-gray-800 cursor-pointer">
                  <input 
                    type="radio" 
                    name="distrType"
                    checked={!distrIsPublic}
                    onChange={() => setDistrIsPublic(false)}
                    className="w-4 h-4 accent-indigo-600 mt-0.5"
                  />
                  <div>
                    Chọn Lọc Theo Tệp Khách (Private)
                    <p className="text-xs text-gray-500 font-normal">Chỉ những khách hàng có SĐT trong danh sách bạn chọn bên dưới mới có quyền nhận.</p>
                  </div>
                </label>
              </div>

              {!distrIsPublic && (
                <div className="bg-white p-3 rounded border border-gray-200 flex flex-col h-[200px]">
                  <div className="flex justify-between items-center mb-2 pb-2 border-b">
                    <h3 className="font-bold text-gray-800 text-xs">Phân quyền cho Danh Sách Khách Hàng:</h3>
                    <button 
                      onClick={() => {
                        if (distrBuyers.length === buyers.length) {
                          setDistrBuyers([]);
                        } else {
                          setDistrBuyers(buyers.map(b => b.phoneNumber));
                        }
                      }}
                      className="text-indigo-600 hover:text-indigo-800 font-bold text-xs cursor-pointer bg-indigo-50 px-2 py-1 rounded"
                    >
                      {distrBuyers.length === buyers.length ? 'Bỏ chọn tất cả' : 'Tích chọn tắt cả'}
                    </button>
                  </div>
                  
                  <div className="overflow-y-auto flex-1 pr-2 space-y-1 scrollbar-thin">
                    {buyers.length === 0 ? (
                      <p className="text-gray-500 text-xs italic text-center py-4">Chưa có khách hàng nào trong hệ thống.</p>
                    ) : (
                      buyers.map(b => (
                        <label key={b.phoneNumber} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer border border-transparent hover:border-gray-100 transition-colors">
                          <input 
                            type="checkbox"
                            checked={distrBuyers.includes(b.phoneNumber)}
                            onChange={(e) => {
                              if (e.target.checked) setDistrBuyers([...distrBuyers, b.phoneNumber]);
                              else setDistrBuyers(distrBuyers.filter(id => id !== b.phoneNumber));
                            }}
                            className="accent-indigo-600"
                          />
                          <div className="text-xs">
                            <span className="font-bold text-gray-800">{b.fullName}</span> 
                            <span className="text-gray-500 italic ml-1">- {b.phoneNumber}</span>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-white shrink-0">
              <button 
                onClick={() => setShowDistrModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded text-xs transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleSaveDistr}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded text-xs shadow-sm transition-colors"
              >
                Lưu Cấu Hình
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Online Product Modal */}
      {showEditOpModal && editOpData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-md shadow-xl max-w-lg w-full overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]"
          >
            <div className="bg-amber-600 px-4 py-3 text-white flex justify-between items-center shrink-0">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                Chỉnh sửa: {editOpData.title}
              </h2>
              <button 
                onClick={() => setShowEditOpModal(false)} 
                className="text-white/80 hover:text-white p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-sm bg-gray-50/50">
              {editOpData.isAutoGeneratedWebDoc && editOpData.rawSlides && editOpData.rawSlides.length > 0 && (
                <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-md shadow-sm mb-2">
                  <div className="flex justify-between items-center mb-2">
                     <h4 className="font-bold text-indigo-900 text-xs uppercase tracking-wider">Trình Biên Soạn AI & HTML</h4>
                     <span className="bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">Sửa Văn Bản</span>
                  </div>
                  <p className="text-xs text-indigo-700 leading-relaxed mb-3">Tài liệu quà tặng này được tạo tự động bởi Hệ thống AI. Bạn có thể mở lại trong Bộ Biên Soạn để thêm trang, sửa ảnh, làm lại nội dung, hoặc sửa mã HTML gốc.</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => handleResumeAIEdit(editOpData)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded shadow-sm text-xs transition-colors flex justify-center items-center gap-1.5"
                    >
                      🚀 Sửa qua AI 
                    </button>
                    <button 
                      onClick={() => setIsEditHtmlFullscreen(true)}
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 rounded shadow-sm text-xs transition-colors flex justify-center items-center gap-1.5"
                    >
                      <FileEdit className="w-3.5 h-3.5" /> Sửa HTML Toàn Màn Hình
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white p-3 rounded border border-gray-200 space-y-3">
                <h3 className="font-bold text-gray-800 border-b pb-2 mb-2">Thông tin cài đặt gốc</h3>
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tên:</label>
                  <input 
                    type="text"
                    value={editOpData.title}
                    onChange={e => setEditOpData({...editOpData, title: e.target.value})}
                    className="w-full border rounded px-3 py-1.5 focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Link Tải:</label>
                  <input 
                    type="text"
                    value={editOpData.downloadUrl}
                    onChange={e => setEditOpData({...editOpData, downloadUrl: e.target.value})}
                    className="w-full border rounded px-3 py-1.5 focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>

                {!editOpData.isAutoGeneratedWebDoc && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Giá bán (đ):</label>
                      <input 
                        type="number"
                        value={editOpData.price}
                        onChange={e => setEditOpData({...editOpData, price: e.target.value})}
                        className="w-full border rounded px-3 py-1.5 focus:outline-none focus:border-amber-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Giá gốc (đ):</label>
                      <input 
                        type="number"
                        value={editOpData.originalPrice}
                        onChange={e => setEditOpData({...editOpData, originalPrice: e.target.value})}
                        className="w-full border rounded px-3 py-1.5 focus:outline-none focus:border-amber-500 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-white shrink-0">
              <button 
                onClick={() => setShowEditOpModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded text-xs transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleSaveEditOp}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded text-xs shadow-sm transition-colors"
              >
                Lưu Thay Đổi
              </button>
            </div>
            
            {/* HTML Full Screen Editor */}
            {isEditHtmlFullscreen && (
              <div className="fixed inset-0 z-[110] bg-white flex flex-col">
                <div className="bg-slate-900 px-4 py-3 text-white flex justify-between items-center shadow-md">
                  <h2 className="text-sm font-bold flex items-center gap-2">
                    <FileEdit className="w-4 h-4 text-emerald-400" />
                    CHỈNH SỬA MÃ HTML TOÀN MÀN HÌNH: {editOpData.title}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsEditHtmlFullscreen(false)} 
                      className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded"
                    >
                      Đóng
                    </button>
                    <button 
                      onClick={() => {
                        handleSaveEditOp();
                        setIsEditHtmlFullscreen(false);
                      }} 
                      className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded shadow-sm"
                    >
                      Lưu Thay Đổi HTML
                    </button>
                  </div>
                </div>
                <div className="flex-1 bg-slate-50 p-4">
                  <textarea 
                    value={editOpData.htmlContent || ''}
                    onChange={(e) => {
                      const newContent = e.target.value;
                      setEditOpData({
                        ...editOpData,
                        htmlContent: newContent,
                        // Ensure downloadUrl reflects changes!
                        downloadUrl: `data:text/html;charset=utf-8,${encodeURIComponent(newContent)}`
                      });
                    }}
                    className="w-full h-full p-4 font-mono text-xs border border-slate-300 rounded-md focus:outline-none focus:border-indigo-500 shadow-inner resize-none bg-white"
                    placeholder="Mã HTML của tài liệu..."
                  ></textarea>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

    </div>
  );
}

function StatCard({ title, value, icon, color, trend }: { title: string, value: string, icon: any, color: string, trend?: string }) {
  return (
    <div className="bg-white p-4 rounded-md shadow-xs border border-gray-200 flex items-center justify-between animate-fadeIn">
      <div>
        <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">{title}</p>
        <div className="flex items-end gap-2">
          <h4 className="text-xl font-extrabold text-gray-950 leading-none">{value}</h4>
          {trend && (
             <span className="text-[10px] font-bold text-green-600 mb-0.5">{trend}</span>
          )}
        </div>
      </div>
      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${color} shrink-0`}>
        {icon}
      </div>
    </div>
  );
}

function Activity(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>;
}

function CheckCircle2(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  );
}

