import React, { useState, useEffect, useMemo } from 'react';
import { setItemResilient, compressImage } from './utils';
import { isIndustryCategoryId } from './utils/autoCategorize';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { AdminDashboard } from './components/AdminDashboard';
import { CartDrawer } from './components/CartDrawer';
import { MOCK_PRODUCTS, CATEGORIES } from './mockData';
import { Product, Buyer, SearchQueryTrack } from './types';
import { 
  Search,
  ShoppingCart,
  Bell,
  Menu,
  ChevronRight,
  TrendingDown,
  Facebook,
  MessageCircle,
  Settings,
  Store,
  Shirt,
  Sparkles,
  Smartphone,
  Home,
  HeartPulse,
  Baby,
  ShoppingBag,
  Eye,
  EyeOff,
  Lock,
  User,
  ArrowLeft,
  MapPin,
  Phone,
  LogIn,
  CheckCircle,
  HelpCircle,
  Send,
  Bot,
  ZoomIn,
  ZoomOut,
  Trash2,
  QrCode,
  Copy,
  XCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Icon Map helper to load imported Lucide icons dynamically
const ICON_MAP: Record<string, any> = {
  Shirt, 
  ShoppingBag, 
  Sparkles, 
  Smartphone, 
  Home, 
  HeartPulse, 
  Baby
};

const isValidVietnamesePhoneNumber = (phoneNumber: string): { isValid: boolean, error?: string } => {
  const cleaned = phoneNumber.trim().replace(/[\s.-]/g, '');
  const vnPhoneRegex = /^(03|05|07|08|09|(\+843)|(\+845)|(\+847)|(\+848)|(\+849))[0-9]{8}$/;
  
  if (!vnPhoneRegex.test(cleaned)) {
    return { 
      isValid: false, 
      error: 'Số điện thoại không đúng định dạng nhà mạng Việt Nam (Viettel, Vina, Mobi, Vietnamobile, Wintel...). Vui lòng nhập số điện thoại thật của bạn!' 
    };
  }

  const digitsOnly = cleaned.startsWith('+') ? cleaned.slice(3) : cleaned.slice(1);
  const isRepetitive = /^(.)\1+$/.test(digitsOnly);
  if (isRepetitive) {
    return {
      isValid: false,
      error: 'Phát hiện số điện thoại ảo / spam (trùng lặp dãy số). Vui lòng dùng số điện thoại liên kết Zalo/nhà mạng thật!'
    };
  }

  const sequentialPatterns = ['012345678', '123456789', '987654321', '876543210'];
  if (sequentialPatterns.some(p => digitsOnly.includes(p))) {
    return {
      isValid: false,
      error: 'Phát hiện số điện thoại ảo / dãy số liên tiếp. Vui lòng nhập số thật đã đăng ký với Zalo hoặc nhà mạng!'
    };
  }

  return { isValid: true };
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'admin' | 'online_products'>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Sync state for multiple admin social channels
  const [socials, setSocials] = useState(() => {
    try {
      const saved = localStorage.getItem('affili_social_channels');
      if (saved && saved !== 'undefined') return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing affili_social_channels', e);
    }
    return {
      facebooks: ['https://facebook.com/vietnam.affiliates', 'https://facebook.com/groups/shopee.sales'],
      zalos: ['https://zalo.me/0981234567', 'https://zalo.me/g/zaloshopping'],
      tiktoks: ['https://tiktok.com/@giamgia_tiktok', 'https://tiktok.com/@shopee_live_deals'],
      shopees: ['https://shopee.vn/my_outlet_store', 'https://shopee.vn/uu_dai_shopee']
    };
  });

  const [onlineProducts, setOnlineProducts] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('affili_online_products');
      if (saved && saved !== 'undefined') return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing affili_online_products', e);
    }
    return [];
  });

  // Cross-tab / cross-component storage syncer
  useEffect(() => {
    const syncState = () => {
      try {
        const savedSocials = localStorage.getItem('affili_social_channels');
        if (savedSocials && savedSocials !== 'undefined') setSocials(JSON.parse(savedSocials));
      } catch (e) {
        console.error(e);
      }

      try {
        const savedOnline = localStorage.getItem('affili_online_products');
        if (savedOnline && savedOnline !== 'undefined') setOnlineProducts(JSON.parse(savedOnline));
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('storage', syncState);
    return () => window.removeEventListener('storage', syncState);
  }, []);

  // Fetch affiliate products from API on mount
  useEffect(() => {
    const fetchAffiliateProducts = async () => {
      try {
        const response = await fetch('/api/affiliate-products');
        if (response.ok) {
          const data = await response.json();
          if (data.products && data.products.length > 0) {
            setOnlineProducts(data.products);
            localStorage.setItem('affili_online_products', JSON.stringify(data.products));
          }
        }
      } catch (error) {
        console.error('Error fetching affiliate products:', error);
      }
    };
    fetchAffiliateProducts();
  }, []);

  // Lucky wheel spin states for guest lead conversion
  const [spinLoading, setSpinLoading] = useState(false);
  const [spinResult, setSpinResult] = useState<any>(null);
  const [spinAngle, setSpinAngle] = useState(0);
  const [spinName, setSpinName] = useState('');
  const [spinPhone, setSpinPhone] = useState('');
  const [spinEmail, setSpinEmail] = useState('');
  const [spinMessage, setSpinMessage] = useState('');

  // Load and persist products in LocalStorage
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('affili_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing local storage products", e);
      }
    }
    return []; // Return empty array instead of MOCK_PRODUCTS to prevent overwriting cloud state with 7 demo items
  });

  // Buyers list state (persisted)
  const [buyers, setBuyers] = useState<Buyer[]>(() => {
    const saved = localStorage.getItem('affili_buyers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing local storage buyers", e);
      }
    }
    // Pre-populate with some mock buyers so admin has some data immediately
    return [];
  });

  // Pull cloud data from Supabase and Express Temporary Store
  useEffect(() => {
    const fetchCloudDb = async () => {
      // 1. First sync with local-db (Express temporary memory for link sharing visibility)
      let expressDbData: any = {};
      try {
        const localRes = await fetch('/api/sync-data?t=' + Date.now(), { cache: 'no-store' });
        if (localRes.ok) {
          expressDbData = await localRes.json();
          let shouldDispatch = false;
          // Only overwrite local state if local is empty OR if local doesn't match and we want to sync
          // Actually, since visitors have empty localStorage, just applying it is enough:
          if (expressDbData.affili_online_products && expressDbData.affili_online_products.length > 0) {
            setOnlineProducts(expressDbData.affili_online_products);
            localStorage.setItem('affili_online_products', JSON.stringify(expressDbData.affili_online_products));
            shouldDispatch = true;
          }
          if (expressDbData.affili_products && expressDbData.affili_products.length > 0) {
            setProducts(expressDbData.affili_products);
            localStorage.setItem('affili_products', JSON.stringify(expressDbData.affili_products));
            shouldDispatch = true;
          }
          if (expressDbData.affili_gift_materials && expressDbData.affili_gift_materials.length > 0) {
            const isAdm = localStorage.getItem('isAdminLoggedIn') === 'true';
            if (!isAdm || !localStorage.getItem('affili_gift_materials')) {
               setGiftMaterials(expressDbData.affili_gift_materials);
               localStorage.setItem('affili_gift_materials', JSON.stringify(expressDbData.affili_gift_materials));
               shouldDispatch = true;
            }
          }
          if (expressDbData.affili_categories && expressDbData.affili_categories.length > 0) {
             setCategories(expressDbData.affili_categories);
             localStorage.setItem('affili_categories', JSON.stringify(expressDbData.affili_categories));
             shouldDispatch = true;
          }
          if (expressDbData.affili_guaranteed_win_spins !== undefined) {
             setGuaranteedWinSpins(Number(expressDbData.affili_guaranteed_win_spins));
             localStorage.setItem('affili_guaranteed_win_spins', expressDbData.affili_guaranteed_win_spins.toString());
             shouldDispatch = true;
          }
          if (expressDbData.affili_gift_claim_link !== undefined) {
             setGiftClaimLink(expressDbData.affili_gift_claim_link);
             localStorage.setItem('affili_gift_claim_link', expressDbData.affili_gift_claim_link);
             shouldDispatch = true;
          }
          if (shouldDispatch) window.dispatchEvent(new Event('storage'));
        }
      } catch (e) {
        console.error("Local sync Error:", e);
      }

      // 2. Fetch from Supabase if configured
      let url = localStorage.getItem('supabase_url') || 'https://encpsaatojnxgyjjcvnx.supabase.co';
      let key = localStorage.getItem('supabase_key');
      
      // If we don't have the key in local storage, ask the server for the global config
      if (!key) {
        try {
          const configRes = await fetch('/api/db-config?t=' + Date.now(), { cache: 'no-store' });
          if (configRes.ok) {
            const config = await configRes.json();
            if (config.key) {
              key = config.key;
              if (config.url) url = config.url;
              // we don't save to localStorage so we don't pollute local if it's just a visitor
            }
          }
        } catch (e) {}
      }

      if (url && key) {
        try {
          console.log('📡 Fetching from server...');
          
          const [digRes, affRes, giftRes] = await Promise.all([
            fetch(`${url}/rest/v1/digital_products`, { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }, cache: 'no-store' }),
            fetch(`/api/affiliate-products?url=${encodeURIComponent(url)}&key=${encodeURIComponent(key)}`, { cache: 'no-store' }),
            fetch(`${url}/rest/v1/gifts`, { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }, cache: 'no-store' })
          ]);

          console.log('✅ Digital Products Response:', digRes.status, digRes.statusText);
          console.log('✅ Affiliate Products Response:', affRes.status, affRes.statusText);
          console.log('✅ Gifts Response:', giftRes.status, giftRes.statusText);

          let fetchedSiteConfigStr = null;

          if (digRes.ok) {
            const digData = await digRes.json();
            if (digData && digData.length > 0) {
              const siteConfigRow = digData.find((p: any) => p.id === '__SITE_CONFIG__');
              const normalDigital = digData.filter((p: any) => p.id !== '__SITE_CONFIG__');
              fetchedSiteConfigStr = siteConfigRow ? (siteConfigRow.htmlContent || siteConfigRow.htmlcontent) : null;
              
              const normalizedDigital = normalDigital.map((p: any) => ({
                 ...p,
                 htmlContent: p.htmlContent || p.htmlcontent,
                 downloadUrl: p.downloadUrl || p.downloadurl,
                 originalPrice: p.originalPrice || p.originalprice,
                 isShowOnHome: p.isShowOnHome !== undefined ? p.isShowOnHome : p.isshowonhome,
                 isFree: p.isFree !== undefined ? p.isFree : p.isfree,
                 isSystemGenerated: p.isSystemGenerated !== undefined ? p.isSystemGenerated : p.issystemgenerated,
                 isPubliclyClaimable: p.isPubliclyClaimable !== undefined ? p.isPubliclyClaimable : p.ispubliclyclaimable,
                 allowedBuyerIds: p.allowedBuyerIds || p.allowedbuyerids
              }));
              if (normalizedDigital.length > 0) setOnlineProducts(normalizedDigital);
            }
          }

          if (affRes.ok) {
             const affData = await affRes.json();
             console.log('📦 Affiliate Products Data:', affData);
             if (affData && affData.length > 0) {
                 const normalizedAff = affData.map((p: any) => ({
                     ...p,
                     originalPrice: p.originalPrice || p.originalprice,
                     discountPercent: p.discountPercent || p.discountpercent,
                     videoUrl: p.videoUrl || p.videourl,
                     categoryId: p.categoryId || p.categoryid,
                     affiliateLink: p.affiliateLink || p.affiliatelink,
                     soldCount: p.soldCount || p.soldcount,
                     isSuggested: p.isSuggested !== undefined ? p.isSuggested : p.issuggested,
                     isDirectProduct: p.isDirectProduct !== undefined ? p.isDirectProduct : p.isdirectproduct,
                     postDate: p.postDate || p.postdate
                 }));
                 console.log('✅ Affiliate Products Loaded:', normalizedAff.length, 'items');
                 if (!expressDbData.affili_products || normalizedAff.length >= expressDbData.affili_products.length) {
                    setProducts(normalizedAff);
                    localStorage.setItem('affili_products', JSON.stringify(normalizedAff));
                 }
             } else {
               console.log('⚠️ Affiliate products is empty or not an array');
             }
          } else {
             // Log error if affiliate_products table has issues
             console.error('❌ Lỗi fetch affiliate_products - Status:', affRes.status);
             const affErrorText = await affRes.text();
             console.error('❌ Lỗi chi tiết:', affErrorText);
             console.error('❌ Fetch URL:', `/api/affiliate-products`);
          }

          if (giftRes.ok) {
             const giftData = await giftRes.json();
             if (giftData && giftData.length > 0) {
                 const normalizedGifts = giftData.map((g: any) => ({
                     ...g,
                     htmlContent: g.htmlContent || g.htmlcontent,
                     isPubliclyClaimable: g.isPubliclyClaimable !== undefined ? g.isPubliclyClaimable : g.ispubliclyclaimable
                 }));
                 const isAdm = localStorage.getItem('isAdminLoggedIn') === 'true';
                 if (!isAdm || !localStorage.getItem('affili_gift_materials') || normalizedGifts.length >= JSON.parse(localStorage.getItem('affili_gift_materials') || '[]').length) {
                    setGiftMaterials(normalizedGifts);
                    localStorage.setItem('affili_gift_materials', JSON.stringify(normalizedGifts));
                 }
             }
          }

          if (fetchedSiteConfigStr) {
            try {
              const sc = JSON.parse(fetchedSiteConfigStr);
              if (sc.categories && sc.categories.length > 0 && (!expressDbData.affili_categories || sc.categories.length >= expressDbData.affili_categories.length)) {
                 setCategories(sc.categories);
                 localStorage.setItem('affili_categories', JSON.stringify(sc.categories));
              }
              if (sc.giftCampaigns && sc.giftCampaigns.length > 0 && (!expressDbData.affili_gift_campaigns || sc.giftCampaigns.length >= expressDbData.affili_gift_campaigns.length)) {
                 setGiftCampaigns(sc.giftCampaigns);
                 localStorage.setItem('affili_gift_campaigns', JSON.stringify(sc.giftCampaigns));
              }
              if (sc.giftClaimLink && expressDbData.affili_gift_claim_link === undefined) setGiftClaimLink(sc.giftClaimLink);
              if (sc.guaranteedWinSpins !== undefined && expressDbData.affili_guaranteed_win_spins === undefined) setGuaranteedWinSpins(Number(sc.guaranteedWinSpins));
              if (sc.socials && !expressDbData.affili_social_channels) setSocials(sc.socials);
              
              if (sc.adminFacebook) localStorage.setItem('admin_facebook', sc.adminFacebook);
              if (sc.adminZalo) localStorage.setItem('admin_zalo', sc.adminZalo);
              if (sc.adminTiktok) localStorage.setItem('admin_tiktok', sc.adminTiktok);
              
              if (sc.geminiKeys && sc.geminiKeys.length > 0) {
                 try {
                    const loadedKeys = sc.geminiKeys.map((k: any) => {
                       if (k.key && typeof k.key === 'string' && !k.key.startsWith('AIzaSy')) {
                          try { return { ...k, key: atob(k.key) }; } catch(e) { return k; }
                       }
                       return k;
                    });
                    setGeminiKeys(loadedKeys);
                 } catch(e) {}
              }
              window.dispatchEvent(new Event('storage'));
            } catch(e) {
              console.error("Failed to parse site config from cloud", e);
            }
          }
          // Fetch buyers
          const bRes = await fetch(`${url}/rest/v1/buyers`, {
            headers: { 'apikey': key, 'Authorization': `Bearer ${key}` },
            cache: 'no-store'
          });
          if (bRes.ok) {
            const bData = await bRes.json();
            if (bData && bData.length > 0) {
              const normalizedBuyers = bData.map((b: any) => ({
                 ...b,
                 phoneNumber: b.phoneNumber || b.phonenumber,
                 fullName: b.fullName || b.fullname,
                 registeredAt: b.registeredAt || b.registeredat
              }));
              setBuyers(normalizedBuyers);
            }
          }
        } catch (e) {
          console.error("Cloud DB Fetch Error:", e);
        }
      }
    };
    fetchCloudDb();
  }, []);

  // Search track record state (persisted)
  const [searchTracks, setSearchTracks] = useState<SearchQueryTrack[]>(() => {
    const saved = localStorage.getItem('affili_search_tracks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing search tracks", e);
      }
    }
    // Prepopulated trends
    return [];
  });

  // Current logged in buyer session
  const [currentBuyer, setCurrentBuyer] = useState<Buyer | null>(() => {
    const saved = localStorage.getItem('affili_current_buyer');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing current buyer", e);
      }
    }
    return null;
  });

  const [giftMaterials, setGiftMaterials] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('affili_gift_materials');
      if (saved && saved !== 'undefined') return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing affili_gift_materials', e);
    }
    return []; // Fix: Avoid overwriting real gift materials with mock data
  });

  const [giftCampaigns, setGiftCampaigns] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('affili_gift_campaigns');
      if (saved && saved !== 'undefined') return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing affili_gift_campaigns', e);
    }
    return []; // Fix: Avoid overwriting real gift campaigns with mock data
  });

  const [giftClaimLink, setGiftClaimLink] = useState<string>(() => {
    return localStorage.getItem('affili_gift_claim_link') || 'https://zalo.me/g/nhan-qua-affili';
  });

  const [geminiKeys, setGeminiKeys] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('affili_gemini_keys');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    setItemResilient('affili_gemini_keys', JSON.stringify(geminiKeys));
  }, [geminiKeys]);

  useEffect(() => {
    setItemResilient('affili_gift_materials', JSON.stringify(giftMaterials));
  }, [giftMaterials]);

  useEffect(() => {
    setItemResilient('affili_gift_campaigns', JSON.stringify(giftCampaigns));
  }, [giftCampaigns]);

  useEffect(() => {
    setItemResilient('affili_gift_claim_link', giftClaimLink);
  }, [giftClaimLink]);

  const [guaranteedWinSpins, setGuaranteedWinSpins] = useState<number>(() => {
    return Number(localStorage.getItem('affili_guaranteed_win_spins')) || 0;
  });
  const [guestSpinCount, setGuestSpinCount] = useState<number>(0);

  useEffect(() => {
    setItemResilient('affili_guaranteed_win_spins', guaranteedWinSpins.toString());
  }, [guaranteedWinSpins]);

  const [categories, setCategories] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('affili_categories');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return []; // Fix: Avoid overwriting with default categories
  });

  // Chỉ hiển thị danh mục ngành hàng trên trang chủ (ẩn danh mục shop store_*)
  const displayCategories = useMemo(() => {
    const industry = categories.filter(c => isIndustryCategoryId(c.id));
    if (industry.length > 0) return industry;
    return categories.filter(c => !String(c.id).startsWith('store_'));
  }, [categories]);

  const [giftPreference, setGiftPreference] = useState<string>('affiliate');

  useEffect(() => {
    setItemResilient('affili_categories', JSON.stringify(categories));
  }, [categories]);

  // Buyer Registration Form Modals
  const [showBuyerRegisterModal, setShowBuyerRegisterModal] = useState(false);
  const [pendingDirectGift, setPendingDirectGift] = useState<any>(null);
  const [directGiftPhone, setDirectGiftPhone] = useState('');
  const [directGiftError, setDirectGiftError] = useState('');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regSuccessMessage, setRegSuccessMessage] = useState('');
  const [regErrorMessage, setRegErrorMessage] = useState('');

  // Persist products whenever they change
  useEffect(() => {
    setItemResilient('affili_products', JSON.stringify(products));
  }, [products]);

  // Run a one-time retroactive compression on load to fix users with huge 5MB quotas stuck at 19 products
  useEffect(() => {
    const runCompression = async () => {
      // Functional state update for products
      setProducts(prevProducts => {
        let hasDiff = false;
        const newProducts = prevProducts.map(p => {
          let newP = { ...p };
          if (newP.description && /#\S+/.test(newP.description)) {
            newP.description = newP.description.replace(/#\S+/g, "").replace(/[ \t]+$/gm, "");
            hasDiff = true;
          }
          // We bypass async image compression here to avoid locking state and causing data loss, 
          // image compression happens at product add time anyway.
          return newP;
        });
        return hasDiff ? newProducts : prevProducts;
      });

      // Functional state update for online products
      setOnlineProducts(prevOps => {
        let hasDiff = false;
        const newOps = prevOps.map(op => {
          let newOp = { ...op };
          if (newOp.description && /#\S+/.test(newOp.description)) {
            newOp.description = newOp.description.replace(/#\S+/g, "").replace(/[ \t]+$/gm, "");
            hasDiff = true;
          }
          if (newOp.htmlContent && newOp.htmlContent.length > 500000 && newOp.id === '__SITE_CONFIG__') {
            hasDiff = true;
            return { ...newOp, _isOversizedConfig: true };
          }
          return newOp;
        }).filter(op => !op._isOversizedConfig);
        
        if (hasDiff) {
           setItemResilient('affili_online_products', JSON.stringify(newOps));
           return newOps;
         }
         return prevOps;
      });
    };
    runCompression();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist buyers list & current buyer
  useEffect(() => {
    setItemResilient('affili_buyers', JSON.stringify(buyers));
    // Push to Supabase if configured
    const pushCloud = async () => {
      let url = localStorage.getItem('supabase_url') || 'https://encpsaatojnxgyjjcvnx.supabase.co';
      let key = localStorage.getItem('supabase_key');
      if (!key) {
        try {
          const configRes = await fetch('/api/db-config?t=' + Date.now(), { cache: 'no-store' });
          if (configRes.ok) {
            const config = await configRes.json();
            if (config.key) {
              key = config.key;
              if (config.url) url = config.url;
            }
          }
        } catch (e) {}
      }
      if (url && key && buyers.length > 0) {
        try {
          const tryPushBuyers = async (payload: any[]) => {
            const res = await fetch(`${url}/rest/v1/buyers?on_conflict=id`, {
              method: 'POST',
              headers: { 
                'apikey': key, 
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
              },
              body: JSON.stringify(payload)
            });
            if (!res.ok) {
              throw new Error(await res.text());
            }
          };

          try {
            await tryPushBuyers(buyers.map(b => ({
               id: b.id || null,
               phoneNumber: b.phoneNumber || '',
               password: b.password || null,
               fullName: b.fullName || '',
               address: b.address || null,
               email: b.email || null,
               registeredAt: b.registeredAt || null
            })));
          } catch (e: any) {
            const msg = e.message || String(e);
            if (msg.includes("Could not find the") && msg.includes("column")) {
               const lowerBuyers = buyers.map(b => ({
                 id: b.id || null,
                 phonenumber: b.phoneNumber || '',
                 password: b.password || null,
                 fullname: b.fullName || '',
                 address: b.address || null,
                 email: b.email || null,
                 registeredat: b.registeredAt || null
               }));
               await fetch(`${url}/rest/v1/buyers?on_conflict=id`, {
                 method: 'POST',
                 headers: { 
                   'apikey': key, 
                   'Authorization': `Bearer ${key}`,
                   'Content-Type': 'application/json',
                   'Prefer': 'resolution=merge-duplicates'
                 },
                 body: JSON.stringify(lowerBuyers)
               });
            }
          }
        } catch (e) {
          console.error('Failed to sync buyers to cloud', e);
        }
      }
    };
    pushCloud();
  }, [buyers]);

  useEffect(() => {
    if (currentBuyer) {
      setItemResilient('affili_current_buyer', JSON.stringify(currentBuyer));
    } else {
      localStorage.removeItem('affili_current_buyer');
    }
  }, [currentBuyer]);

  // Automate saving of search queries (debounce of 1.2s to prevent logging character-by-character)
  useEffect(() => {
    if (!searchQuery.trim()) return;
    const term = searchQuery.trim();
    if (term.length < 2) return;

    const delayDebounceFn = setTimeout(() => {
      setSearchTracks(prev => {
        const lowerTerm = term.toLowerCase();
        const existingIndex = prev.findIndex(item => item.query.toLowerCase() === lowerTerm);
        let updated;
        const getDeviceInfoStr = () => {
          const isMobile = window.innerWidth <= 768;
          const deviceType = isMobile ? 'Mobile' : 'Desktop';
          let os = 'Unknown';
          if (navigator.userAgent.indexOf('Android') !== -1) os = 'Android';
          else if (navigator.userAgent.indexOf('like Mac') !== -1) os = 'iOS';
          else if (navigator.userAgent.indexOf('Win') !== -1) os = 'Windows';
          else if (navigator.userAgent.indexOf('Mac') !== -1) os = 'MacOS';
          return `${deviceType} - ${os}`;
        };

        if (existingIndex !== -1) {
          updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            count: updated[existingIndex].count + 1,
            lastSearchedAt: new Date().toISOString(),
            deviceInfo: getDeviceInfoStr()
          };
        } else {
          updated = [
            ...prev,
            { query: term, count: 1, lastSearchedAt: new Date().toISOString(), deviceInfo: getDeviceInfoStr() }
          ];
        }
        setItemResilient('affili_search_tracks', JSON.stringify(updated));
        return updated;
      });
    }, 1200);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Shopping Cart state with standard local persistence
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>(() => {
    const saved = localStorage.getItem('affili_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing cart", e);
      }
    }
    return [];
  });
  const [showCart, setShowCart] = useState(false);
  const [zoomMode, setZoomMode] = useState<'compact' | 'normal' | 'large'>('normal');

  const [fontSize, setFontSizeState] = useState<'sm' | 'md' | 'lg' | 'xl'>(() => {
    return (localStorage.getItem('fontSize') as 'sm' | 'md' | 'lg' | 'xl') || 'md';
  });

  useEffect(() => {
    setItemResilient('fontSize', fontSize);
    const sizeMap = {
      sm: '13.5px',
      md: '15.5px',
      lg: '18px',
      xl: '21px'
    };
    document.documentElement.style.fontSize = sizeMap[fontSize];
  }, [fontSize]);

  useEffect(() => {
    setItemResilient('affili_cart', JSON.stringify(cart));
  }, [cart]);

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
    setShowCart(true); // Auto reveal cart when item added
  };

  const handleUpdateCartQuantity = (productId: string, newQty: number) => {
    setCart(prev => prev.map(item => item.product.id === productId ? { ...item, quantity: newQty } : item));
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  // Admin Login Session State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('isAdminLoggedIn') === 'true';
  });
  const [adminRole, setAdminRole] = useState<'super'|'client'>(() => {
    return (localStorage.getItem('adminRole') as 'super'|'client') || 'super';
  });
  const [showPublicLinkModal, setShowPublicLinkModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [customBrand, setCustomBrand] = useState(() => localStorage.getItem('custom_brand') || 'AIDOANHCHU');

  useEffect(() => {
    document.title = customBrand;
  }, [customBrand]);

  useEffect(() => {
    const handleStorageChange = () => {
      const brand = localStorage.getItem('custom_brand');
      if (brand) setCustomBrand(brand);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Custom Brand Logic from URL
    const brandParam = urlParams.get('brand');
    if (brandParam) {
      localStorage.setItem('custom_brand', brandParam);
      setCustomBrand(brandParam);
    }
    
    // Direct Gift Logic
    const directGiftParam = urlParams.get('directGift');
    if (directGiftParam && onlineProducts) {
      const gift = onlineProducts.find((op: any) => op.id === directGiftParam);
      if (gift) {
         if (gift.isPubliclyClaimable) {
           setSpinResult({
             isNoPrize: false,
             title: gift.title,
             downloadUrl: gift.downloadUrl,
             htmlContent: gift.htmlContent
           });
           setTimeout(() => {
             window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
           }, 500);
         } else {
           setPendingDirectGift(gift);
         }
         const newUrl = window.location.pathname;
         window.history.replaceState({}, document.title, newUrl);
      }
    }

    const licenseParam = urlParams.get('license');
    const existingToken = localStorage.getItem('client_license_token');

    // If there is a licenseParam in URL or they are currently logged in as 'client'
    const tokenToCheck = licenseParam || (adminRole === 'client' ? existingToken : null);

    if (tokenToCheck) {
      let deviceId = localStorage.getItem('affili_device_uuid');
      if (!deviceId) {
        deviceId = 'DEV-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('affili_device_uuid', deviceId);
      }
      
      // Offline fallback for Vercel Static Deployments
      const isTokenValid = tokenToCheck.startsWith('LIC-');
      
      if (isTokenValid) {
        setIsAdminLoggedIn(true);
        setAdminRole('client');
        localStorage.setItem('isAdminLoggedIn', 'true');
        localStorage.setItem('adminRole', 'client');
        localStorage.setItem('client_license_token', tokenToCheck);
        
        if (licenseParam) {
          // Clean URL only if it was in the URL
          window.history.replaceState({}, document.title, window.location.pathname);
          alert(`✅ Kích hoạt bản quyền Website thành công!\nĐây là trang quản trị web của riêng bạn. Bạn có thể thiết lập mật khẩu trong Tùy chọn.`);
        }
      } else {
        // If the token is invalid/paused now, kick them out
        if (licenseParam || adminRole === 'client') {
          setIsAdminLoggedIn(false);
          localStorage.removeItem('isAdminLoggedIn');
          localStorage.removeItem('adminRole');
          localStorage.removeItem('client_license_token');
          if (licenseParam) {
            alert('❌ Lỗi Kích Hoạt Giấy Phép Web: Mã không hợp lệ.');
          } else {
            alert('⚠️ Giấy phép truy cập của bạn đã bị quản trị viên tạm dừng hoặc xoá bỏ. Vui lòng liên hệ Admin.');
          }
        }
      }
    }
  }, [adminRole]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pId = urlParams.get('product');
    if (pId && (products.length > 0 || onlineProducts.length > 0)) {
       const productToOpen = products.find(p => p.id === pId) || onlineProducts.find((p: any) => p.id === pId);
       if (productToOpen) {
          setSelectedProduct(productToOpen);
          urlParams.delete('product');
          const newSearch = urlParams.toString();
          const newUrl = window.location.pathname + (newSearch ? '?' + newSearch : '');
          window.history.replaceState({}, document.title, newUrl);
       }
    }
  }, [products, onlineProducts]);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // STRICT REQUIREMENT - Admin password is "112231vn" and must remain secret and hidden
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setLoginError('Vui lòng nhập Mật khẩu quản trị.');
      return;
    }

    const savedPassword = localStorage.getItem('admin_password') || '112231vn';
    const clientPass = localStorage.getItem('client_password');

    if (password === savedPassword) {
      setIsAdminLoggedIn(true);
      setAdminRole('super');
      setItemResilient('isAdminLoggedIn', 'true');
      setItemResilient('adminRole', 'super');
      setLoginError('');
      setUsername('');
      setPassword('');
    } else if (clientPass && password === clientPass) {
      setIsAdminLoggedIn(true);
      setAdminRole('client');
      setItemResilient('isAdminLoggedIn', 'true');
      setItemResilient('adminRole', 'client');
      setLoginError('');
      setUsername('');
      setPassword('');
    } else {
      setLoginError('Sai mật khẩu quản trị!');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('isAdminLoggedIn');
    // Không xóa adminRole và client_license_token để lần sau khách vẫn có thể đăng nhập bằng mật khẩu
  };

  // AI Chatbot Assistant State & Handlers
  interface ChatMessage {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    recommendedProduct?: {
      id: string;
      isOnline: boolean;
    };
  }

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Xin chào! Tôi là **Trợ lý Ảo AI Remix** của cửa hàng **${customBrand}** 🤖. 

Tôi được tích hợp trí tuệ nhân tạo để phục vụ bạn:
* ⚙️ **Đọc và hiểu mã nguồn hệ thống**: Tôi có thể giải thích chi tiết về cấu trúc code xây dựng nên website này (React 19, Express, Tailwind CSS, API Gemini).
* 📚 **Tư vấn phần mềm số & khóa học VIP**: Giới thiệu và giúp bạn sở hữu trực tiếp các tài liệu, mã nguồn số có sẵn.
* 🎯 **Hướng dẫn cách bốc thăm & nhận quà**: Trợ giúp quy trình quay bốc thăm may mắn trúng quà 0đ.
* 🛍️ **Gợi ý sản phẩm cực chuẩn**: Đề xuất các sản phẩm tiếp thị (mỹ phẩm, thời trang, đồ điện tử...) phù hợp nhất kèm link tiếp thị liên kết (TTLK).

Bạn muốn tìm hiểu thêm về khía cạnh nào? Hãy gõ câu hỏi hoặc thử click các câu gợi ý bên dưới nhé!`
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [zoomedMessageIds, setZoomedMessageIds] = useState<string[]>([]);
  const [collapsedMessageIds, setCollapsedMessageIds] = useState<string[]>([]);
  const [msgFontSizes, setMsgFontSizes] = useState<Record<string, number>>({});

  const [zoomLevelValue, setZoomLevelValue] = useState(1); // Default normal font size for the general page

  const getMessageFontSizeClass = (id: string) => {
    const offset = msgFontSizes[id] || 0;
    if (offset === -1) return 'text-[10px]';
    if (offset === -2) return 'text-[9.5px]';
    if (offset <= -3) return 'text-[9px]';
    if (offset === 0) return 'text-xs';
    if (offset === 1) return 'text-sm';
    if (offset === 2) return 'text-base';
    if (offset === 3) return 'text-lg';
    if (offset === 4) return 'text-xl';
    return 'text-2xl';
  };

  const handleSendChatMessage = async (userInputText: string) => {
    if (!userInputText.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userInputText
    };

    // Normalize and check duplicates to reuse answers instantly
    const normInput = userInputText.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s]/g, "").replace(/\s+/g, " ");
    const previousUserMsgIndex = chatMessages.findLastIndex(m => m.sender === 'user' && m.text.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s]/g, "").replace(/\s+/g, " ") === normInput);
    
    if (previousUserMsgIndex !== -1) {
      const nextBotMsg = chatMessages.slice(previousUserMsgIndex + 1).find(m => m.sender === 'bot');
      if (nextBotMsg) {
        const cachedBotMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: `🤖 (Lấy từ Lịch sử Trả lời): ${(nextBotMsg.text || '').replace(/^(🤖 \(Lấy từ Lịch sử Trả lời\):\s*)+/, '')}`,
          recommendedProduct: nextBotMsg.recommendedProduct
        };
        setChatMessages(prev => [...prev, userMsg, cachedBotMsg]);
        setChatInput('');
        return;
      }
    }

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const historyToSend = chatMessages.slice(-10).map(m => ({
        role: m.sender === 'bot' ? 'model' : 'user',
        parts: [{ text: m.text }]
      }));

      const activeKeyObj = geminiKeys.find((k: any) => k.isActive) || geminiKeys[0];
      const fetchHeaders: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (activeKeyObj && activeKeyObj.key) {
        fetchHeaders['x-gemini-key'] = activeKeyObj.key;
      }

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: fetchHeaders,
        body: JSON.stringify({
          message: userInputText,
          history: historyToSend,
          products: products,
          onlineProducts: onlineProducts
        })
      });

      if (!res.ok) {
        throw new Error('Không thể kết nối với dịch vụ AI.');
      }

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.reply || 'Tôi đã nhận được câu hỏi nhưng đang gặp chút gián đoạn xử lý. Thử lại sau nhé!',
        recommendedProduct: data.recommendedProduct
      };

      setChatMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      console.error("AI Chatbot error:", err);
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: `⚠️ **Lỗi kết nối**: Chưa thiết lập hoặc lỗi kết nối tới dịch vụ Gemini AI. \n\n*Nếu bạn là Admin, vui lòng cấu hình \`GEMINI_API_KEY\` chính xác ở mục Settings > Secrets của không gian làm việc.*`
      };
      setChatMessages(prev => [...prev, errMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      const isBullet = line.trim().startsWith('* ') || line.trim().startsWith('- ');
      let content = isBullet ? line.trim().substring(2) : line;

      const parts = content.split(/(\*\*[^*]+\*\*)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-extrabold text-[#0d9488]">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <li key={idx} className="ml-4 list-disc text-gray-700 leading-relaxed mb-1">
            {renderedParts}
          </li>
        );
      }
      return (
        <p key={idx} className="leading-relaxed mb-2 text-gray-700">
          {renderedParts}
        </p>
      );
    });
  };

  const renderRecommendedProduct = (rec: { id: string; isOnline: boolean }) => {
    if (rec.isOnline) {
      const onlineProd = onlineProducts.find((p: any) => p.id === rec.id || p.title?.toLowerCase().includes(rec.id.toLowerCase()));
      if (!onlineProd) return null;
      return (
        <div key={onlineProd.id} className="mt-2.5 bg-orange-50 border border-orange-200 rounded p-3 max-w-sm flex items-center gap-3 shadow-xs animate-fadeIn text-xs text-gray-800">
          <div className="w-12 h-12 bg-orange-100 rounded flex items-center justify-center text-orange-600 font-extrabold text-[10px]">
            ONLINE
          </div>
          <div className="flex-1">
            <span className="bg-orange-100 text-orange-800 text-[9px] px-1.5 py-0.5 rounded font-black uppercase mb-1 inline-block">Sản phẩm số</span>
            <h4 className="font-bold text-gray-900 line-clamp-1">{onlineProd.title}</h4>
            <p className="text-gray-500 font-mono text-[10px]">{onlineProd.isFree ? "Miễn Phí 0đ (Bốc Thăm)" : `Giá: ${onlineProd.price?.toLocaleString()} VND`}</p>
          </div>
          <button 
            type="button"
            onClick={() => {
              setActiveTab('online_products');
              setTimeout(() => {
                const el = document.getElementById('digital-store-section') || document.getElementById('online-products-heading');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }, 150);
            }}
            className="bg-[#ee4d2d] hover:bg-orange-650 text-white font-bold py-1 px-2.5 rounded text-[10px] transition-all cursor-pointer whitespace-nowrap"
          >
            🎁 Nhận Quà
          </button>
        </div>
      );
    } else {
      const p = products.find(prod => prod.id === rec.id);
      if (!p) return null;
      return (
        <div key={p.id} className="mt-2.5 bg-blue-50 border border-blue-200 rounded p-3 max-w-sm flex items-center gap-3 shadow-xs animate-fadeIn text-xs text-gray-800">
          <img src={p.image} className="w-12 h-12 object-cover rounded border" alt={p.title} referrerPolicy="no-referrer" />
          <div className="flex-1">
            <span className="bg-blue-100 text-blue-800 text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase mb-1 inline-block">{p.platform.toUpperCase()} AFFILIATE</span>
            <h4 className="font-bold text-gray-900 line-clamp-1">{p.title}</h4>
            <p className="text-[#ee4d2d] font-bold text-[10.5px]">{p.price.toLocaleString()} VND</p>
          </div>
          <button 
            type="button"
            onClick={() => setSelectedProduct(p)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2.5 rounded text-[10px] transition-all cursor-pointer whitespace-nowrap"
          >
            🛒 Hiển Thị Thêm
          </button>
        </div>
      );
    }
  };

  // State modification functions passed to admin control panel
  const handleAddProduct = (newProduct: Product) => {
    setProducts(prevProducts => [newProduct, ...prevProducts]);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prevProducts => prevProducts.map(p => p.id === id ? { ...p, isDeleted: true } : p));
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prevProducts => 
      prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    );
  };

  const handleToggleSuggest = (id: string) => {
    setProducts(prevProducts => 
      prevProducts.map(p => p.id === id ? { ...p, isSuggested: !p.isSuggested } : p)
    );
  };

  const handleClearAllProducts = () => {
    setProducts(prevProducts => prevProducts.map(p => ({ ...p, isDeleted: true })));
  };

  const handleClearAllBuyers = () => {
    setBuyers([]);
  };

  const handleClearSearchTracks = () => {
    setSearchTracks([]);
  };

  // Buyer Submit Registration Flow
  const handleBuyerRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      setRegErrorMessage('Vui lòng nhập "Tên Người Mua". Đây là trường bắt buộc.');
      return;
    }
    if (!regPhone.trim()) {
      setRegErrorMessage('Vui lòng nhập "Số điện thoại nhận hàng". Chúng tôi cần thông tin này để gửi tặng quà.');
      return;
    }

    const phoneValidResult = isValidVietnamesePhoneNumber(regPhone);
    if (!phoneValidResult.isValid) {
      setRegErrorMessage(phoneValidResult.error || 'Số điện thoại không đúng định dạng nhà mạng VN thật!');
      return;
    }

    if (!regAddress.trim() || regAddress.trim().length < 8) {
      setRegErrorMessage('Vui lòng nhập "Địa chỉ chính xác" (Tối thiểu 8 ký tự: Thôn/Xóm/Đường, Xã/Phường, Huyện/Quận, Tỉnh/Thành phố) để ship quà.');
      return;
    }

    setRegErrorMessage('');

    const getDeviceInfo = () => {
      const ua = navigator.userAgent;
      let os = 'Unknown OS';
      if (ua.indexOf('Win') !== -1) os = 'Windows';
      if (ua.indexOf('Mac') !== -1) os = 'MacOS';
      if (ua.indexOf('X11') !== -1) os = 'UNIX';
      if (ua.indexOf('Linux') !== -1) os = 'Linux';
      if (ua.indexOf('Android') !== -1) os = 'Android';
      if (ua.indexOf('like Mac OS X') !== -1) os = 'iOS';

      let browser = 'Unknown Browser';
      if (ua.indexOf('Chrome') !== -1) browser = 'Chrome';
      else if (ua.indexOf('Safari') !== -1) browser = 'Safari';
      else if (ua.indexOf('Firefox') !== -1) browser = 'Firefox';
      else if (ua.indexOf('Edge') !== -1) browser = 'Edge';

      const isMobile = window.innerWidth <= 768;
      const deviceType = isMobile ? 'Mobile/Tablet' : 'Desktop';
      return {
        deviceInfo: `${deviceType} - ${window.screen.width}x${window.screen.height}`,
        os,
        browser
      };
    };

    const device = getDeviceInfo();

    const newBuyer: Buyer = {
      fullName: regName.trim(),
      phoneNumber: regPhone.trim(),
      address: regAddress.trim(),
      registeredAt: new Date().toISOString(),
      deviceInfo: device.deviceInfo,
      os: device.os,
      browser: device.browser
    };

    // Prevent duplicates in registry
    setBuyers(prev => {
      const filtered = prev.filter(b => b.phoneNumber !== newBuyer.phoneNumber);
      return [newBuyer, ...filtered];
    });

    setCurrentBuyer(newBuyer);
    setRegSuccessMessage('Đăng ký tài khoản thành công! Thông tin giao hàng đã được kết nối tự động.');
    
    setTimeout(() => {
      setRegSuccessMessage('');
      setShowBuyerRegisterModal(false);
      setRegName('');
      setRegPhone('');
      setRegAddress('');
    }, 2000);
  };

  // Filtering Products Grid
  const filteredProducts = products.filter(p => {
    if (p.isDeleted) return false;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || p.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCheckDirectGiftAccess = () => {
    if (!directGiftPhone.trim()) {
      setDirectGiftError('Vui lòng nhập số điện thoại');
      return;
    }
    const matchingBuyer = buyers.find(b => b.phone === directGiftPhone.trim());
    if (!matchingBuyer) {
      setDirectGiftError('Số điện thoại chưa từng đăng ký trên hệ thống. Vui lòng Quay vòng quay may mắn trước.');
      return;
    }
    const gift = pendingDirectGift;
    if (gift.allowedBuyerIds && gift.allowedBuyerIds.includes(matchingBuyer.id)) {
      // Success! Grant access
      setPendingDirectGift(null);
      setDirectGiftError('');
      setDirectGiftPhone('');
      setSpinResult({
        isNoPrize: false,
        title: gift.title,
        downloadUrl: gift.downloadUrl,
        htmlContent: gift.htmlContent
      });
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 500);
    } else {
      setDirectGiftError('Rất tiếc! Số điện thoại của bạn chưa được Admin chọn để nhận món quà này.');
    }
  };

  // Filter suggested products specifically for "Gợi Ý Hôm Nay"
  const suggestedProducts = filteredProducts.filter(p => p.isSuggested);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-shopee-bg">
      {/* Sticky Header */}
      <header className="bg-gradient-to-b from-[#f53d2d] to-[#ff6633] text-white sticky top-0 z-40 shadow-sm">
        {/* Top bar (Socials & Settings & Font Adjustment) */}
        <div className="flex flex-col md:flex-row justify-between items-center max-w-[1200px] mx-auto px-4 py-2 md:py-1.5 text-xs gap-2 md:gap-4 border-b border-white/10 md:border-b-0">
          <div className="flex items-center justify-between w-full md:w-auto gap-3 flex-wrap">
            <span 
              onClick={() => setActiveTab('home')} 
              className="flex items-center gap-1 hover:text-white/80 cursor-pointer transition-colors font-semibold"
            >
              <Store className="w-3.5 h-3.5" /> Kênh Affiliate Shop
            </span>
            <div className="hidden sm:block w-px h-3 bg-white/30"></div>
            <span className="flex items-center gap-2">
              Liên hệ:
              <a 
                href={localStorage.getItem('admin_facebook') || 'https://facebook.com/vietnam.affiliates'} 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-white/80 flex items-center animate-fadeIn"
                title="Facebook Shop"
              >
                <Facebook className="w-3.5 h-3.5 hover:opacity-90 cursor-pointer" />
              </a>
              <a 
                href={localStorage.getItem('admin_zalo') || 'https://zalo.me/0981234567'} 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-white/80 flex items-center animate-fadeIn"
                title="Zalo Shop"
              >
                <img src="https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/Zalo_Official_Logo.svg/1024px-Zalo_Official_Logo.svg.png" className="w-3.5 h-3.5 brightness-0 invert hover:opacity-90 cursor-pointer" alt="zalo" referrerPolicy="no-referrer" />
              </a>
              {(localStorage.getItem('admin_tiktok') || '@giamgia_tiktok') && (
                <a 
                  href={`https://tiktok.com/${(localStorage.getItem('admin_tiktok') || '@giamgia_tiktok').startsWith('@') ? '' : '@'}${localStorage.getItem('admin_tiktok') || 'giamgia_tiktok'}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-white/80 transition-colors flex items-center ml-1 text-[10px] font-mono hover:underline"
                  title="TikTok Shop"
                >
                  ID TikTok: {localStorage.getItem('admin_tiktok') || '@giamgia_tiktok'}
                </a>
              )}
            </span>
          </div>
          
          <div className="flex items-center justify-between w-full md:w-auto gap-3.5 flex-wrap sm:flex-nowrap">
            {/* Font Size Tuner - ALWAYS VISIBLE */}
            <div className="flex items-center gap-1.5 bg-black/20 p-1 rounded-sm border border-white/10 text-white shadow-inner">
              <span className="text-[10px] font-bold text-yellow-100 uppercase tracking-tight">Cỡ chữ:</span>
              <button 
                type="button"
                onClick={() => setFontSizeState('sm')}
                className={`px-2 py-0.5 rounded-[2px] text-[10.5px] font-bold cursor-pointer transition-all ${fontSize === 'sm' ? 'bg-yellow-400 text-gray-950 shadow-sm' : 'hover:bg-white/15 text-white'}`}
                title="Cỡ chữ Nhỏ"
              >
                A-
              </button>
              <button 
                type="button"
                onClick={() => setFontSizeState('md')}
                className={`px-2 py-0.5 rounded-[2px] text-[10.5px] font-bold cursor-pointer transition-all ${fontSize === 'md' ? 'bg-yellow-400 text-gray-950 shadow-sm' : 'hover:bg-white/15 text-white'}`}
                title="Cỡ chữ Vừa"
              >
                A
              </button>
              <button 
                type="button"
                onClick={() => setFontSizeState('lg')}
                className={`px-2 py-0.5 rounded-[2px] text-[10.5px] font-bold cursor-pointer transition-all ${fontSize === 'lg' ? 'bg-yellow-400 text-gray-950 shadow-sm' : 'hover:bg-white/15 text-white'}`}
                title="Cỡ chữ Lớn"
              >
                A+
              </button>
              <button 
                type="button"
                onClick={() => setFontSizeState('xl')}
                className={`px-2 py-0.5 rounded-[2px] text-[10.5px] font-bold cursor-pointer transition-all ${fontSize === 'xl' ? 'bg-yellow-400 text-gray-950 shadow-sm' : 'hover:bg-white/15 text-white'}`}
                title="Cỡ chữ Rất Lớn"
              >
                A++
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Buyer Account Panel */}
              {currentBuyer && (
                <div className="flex items-center gap-2 bg-black/15 px-2 py-0.5 rounded-sm border border-white/10">
                  <span className="text-emerald-200 font-bold flex items-center gap-0.5 text-[10px] sm:text-xs">
                    <CheckCircle className="w-3 h-3 text-emerald-300" /> Co
                  </span>
                  <span className="text-white text-[10px] sm:text-xs">
                    | <strong className="text-yellow-250">{currentBuyer.fullName}</strong>
                  </span>
                  <button 
                    onClick={() => setCurrentBuyer(null)}
                    className="text-[10px] text-red-250 hover:text-red-400 font-bold ml-1 uppercase transition-colors"
                  >
                    X
                  </button>
                </div>
              )}

              <button 
                onClick={() => setShowPublicLinkModal(true)}
                className="flex items-center gap-1.5 bg-white text-indigo-700 font-bold px-2.5 py-1 rounded-sm transition-all text-[10.5px] shadow-sm cursor-pointer hover:bg-gray-100"
              >
                <QrCode className="w-3 h-3" /> 
                Link Cửa Hàng
              </button>

              <button 
                onClick={() => setActiveTab('online_products')}
                className={`flex items-center gap-1.5 bg-yellow-450 hover:bg-yellow-350 text-gray-950 font-black px-2.5 py-1 rounded-sm transition-all text-[10.5px] shadow-sm cursor-pointer ${activeTab === 'online_products' ? 'ring-2 ring-white' : ''}`}
              >
                <Sparkles className="w-3 h-3 text-[#ee4d2d] animate-pulse" /> 
                Vòng Quay Trúng Thưởng
              </button>

              <span 
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-1 hover:text-white/80 cursor-pointer font-bold ${activeTab === 'admin' ? 'underline underline-offset-4' : ''}`}
              >
                <Settings className="w-3 h-3 animate-spin-slow" /> 
                Quản trị {isAdminLoggedIn && <span className="bg-emerald-500 text-[8px] text-white px-1 py-0.2 rounded-full ml-0.5">OK</span>}
              </span>
            </div>
          </div>
        </div>

        {/* Main Search Bar */}
        <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center justify-between gap-4 md:gap-8">
          {/* Mobile Menu Icon */}
          <button className="md:hidden p-1 text-white" onClick={() => setActiveTab(activeTab === 'home' ? 'admin' : 'home')}>
             <Menu className="w-6 h-6" />
          </button>
          
          {/* Logo Zone */}
          <div 
            className="flex flex-col items-center justify-center cursor-pointer group"
            onClick={() => {
              setActiveTab('home');
              setSelectedCategory(null);
            }}
          >
             <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2 group-hover:scale-102 transition-transform origin-left">
               <span>{customBrand}</span>
             </h1>
             <span className="text-[9px] uppercase font-bold hidden md:block opacity-90 tracking-widest mt-0.5">Tuyển Tập Affiliate Hot</span>
          </div>

          {/* Search Box */}
          <div className="flex-1 max-w-[800px] relative">
            <div className="flex bg-white rounded-sm p-1 shadow-xs h-10 w-full relative">
              <input 
                type="text" 
                placeholder="Tìm sản phẩm xịn sò, váy xinh, đồ điện tử hot..." 
                className="flex-1 px-3 text-gray-800 text-sm focus:outline-none placeholder-gray-500 bg-transparent w-full"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button className="bg-[#ee4d2d] w-14 flex items-center justify-center rounded-sm hover:bg-orange-600 transition-all cursor-pointer">
                 <Search className="w-4 h-4 text-white" />
              </button>
            </div>
            {/* Quick search tags below input (desktop) */}
            <div className="hidden md:flex gap-4 text-[11px] mt-1.5 opacity-90">
               <span onClick={() => setSearchQuery('Váy')} className="cursor-pointer hover:underline">👗 Váy Xinh</span>
               <span onClick={() => setSearchQuery('Áo')} className="cursor-pointer hover:underline">👕 Áo Thun</span>
               <span onClick={() => setSearchQuery('Dưỡng Da')} className="cursor-pointer hover:underline">🧴 Mỹ Phẩm</span>
               <span onClick={() => setSearchQuery('Tai Nghe')} className="cursor-pointer hover:underline">🎧 Tai Nghe</span>
               <span onClick={() => setSearchQuery('')} className="cursor-pointer hover:underline text-yellow-200">🔄 Làm Mới</span>
            </div>
          </div>

          {/* Cart Icon */}
          <div 
            onClick={() => setShowCart(true)}
            className="w-10 flex justify-center cursor-pointer group relative"
            title="Xem giỏ hàng"
          >
             <div className="relative p-1">
               <ShoppingCart className="w-6 h-6 md:w-8 md:h-8 group-hover:scale-105 transition-transform" />
               <span className="absolute top-0 right-0 translate-x-1 -translate-y-1 bg-white text-[#ee4d2d] rounded-full text-[9px] font-bold w-4 h-4 md:w-5 md:h-5 flex items-center justify-center border border-[#ee4d2d]">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
               </span>
             </div>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 pb-12">
        {activeTab === 'home' ? (
          <div className="max-w-[1200px] mx-auto">
            
            {/* Banners & Carousel Section */}
            <section className="bg-white mt-4 md:mt-6 p-2 rounded-sm shadow-xs hidden md:flex gap-2 h-[260px]">
              <div className="flex-[2] bg-gray-150 rounded-sm relative overflow-hidden group cursor-pointer">
                <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102" alt="Banner Sale" referrerPolicy="no-referrer" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-5 flex flex-col justify-end">
                   <h2 className="text-white text-2xl font-bold tracking-tight">Siêu Hội Đệ Nhất Tiếp Thị</h2>
                   <p className="text-white/90 text-xs mt-1">Gợi ý hôm nay tinh chọn 100% chính hãng, ưu đãi sập sàn lên tới 70%.</p>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex-1 bg-gray-200 rounded-sm relative overflow-hidden group cursor-pointer">
                  <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Giày Thể Thao" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-sm relative overflow-hidden group cursor-pointer">
                  <img src="https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Mỹ Phẩm" referrerPolicy="no-referrer" />
                </div>
              </div>
            </section>

            {/* Categories Grid (Specifically placed Thời Trang Nữ next to Thời Trang Nam) */}
            <section className="bg-white mt-4 rounded-sm shadow-xs border border-gray-100">
              <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <h2 className="text-gray-600 uppercase text-xs font-extrabold tracking-wider">Danh Mục Ngành Hàng</h2>
                  <span className="text-[10px] bg-orange-100 text-[#ee4d2d] px-2 py-0.5 rounded-full font-bold">Cuộn Trượt Ngang ↔</span>
                </div>
                {selectedCategory && (
                  <button 
                    onClick={() => setSelectedCategory(null)}
                    className="text-xs text-shopee-orange font-bold hover:underline"
                  >
                    Xóa lọc danh mục x
                  </button>
                )}
              </div>
              
              {/* Horizontally scrollable category viewport ("có thanh cuộn") */}
              <div className="p-4 flex overflow-x-auto gap-5 pb-3 scrollbar-thin scroll-smooth select-none scrollbar-thumb-orange-100">
                {displayCategories.map(cat => {
                  const Icon = ICON_MAP[cat.iconName] || Search;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <div 
                      key={cat.id} 
                      onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                      className="flex-shrink-0 flex flex-col items-center justify-center gap-1.5 cursor-pointer group text-center w-24"
                    >
                      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all relative overflow-hidden ${isSelected ? 'bg-orange-100 border-2 border-[#ee4d2d] shadow-sm' : 'bg-gray-50 group-hover:bg-orange-50 group-hover:shadow-inner'}`}>
                        <Icon className={`w-6 h-6 z-10 transition-all ${isSelected ? 'text-[#ee4d2d] scale-110' : 'text-gray-500 group-hover:text-[#ee4d2d]'}`} />
                        {/* Decorative background glow */}
                        <div className="absolute w-full h-1/2 bg-white/40 bottom-0 blur-md z-0"></div>
                      </div>
                      <span className={`text-[12px] font-bold tracking-tight line-clamp-1 transition-colors ${isSelected ? 'text-[#ee4d2d]' : 'text-gray-700 group-hover:text-[#ee4d2d]'}`}>
                        {cat.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Curated GỢI Ý HÔM NAY - If no products are suggeted, display as empty / hidden notice */}
            <section className="bg-white mt-4 md:mt-6 rounded-sm shadow-xs overflow-hidden border border-[#fce0ce]">
               <div className="bg-gradient-to-r from-red-500 via-orange-500 to-[#ff6633] px-4 py-3 flex flex-wrap gap-2 items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <TrendingDown className="w-5 h-5 text-white animate-bounce" />
                    <h2 className="text-white uppercase font-black tracking-widest text-base md:text-lg italic">
                      🔥 Gợi Ý Hôm Nay (Tinh Chọn)
                    </h2>
                  </div>
                  
                  {/* Grid layout density modifier ("nút phóng to, thu nhỏ") */}
                  <div className="flex items-center gap-1 bg-white/20 p-0.5 rounded border border-white/20 text-white">
                    <button 
                      onClick={() => setZoomMode('compact')}
                      className={`px-2.5 py-1 rounded text-[10.5px] font-bold transition-all ${
                        zoomMode === 'compact' ? 'bg-white text-gray-900 shadow-xs' : 'hover:bg-white/10 text-white'
                      }`}
                      title="Thu nhỏ tối đa để hiển thị hàng loạt sản phẩm"
                    >
                      🔎[-] Thu nhỏ
                    </button>
                    <button 
                      onClick={() => setZoomMode('normal')}
                      className={`px-2.5 py-1 rounded text-[10.5px] font-bold transition-all ${
                        zoomMode === 'normal' ? 'bg-white text-gray-900 shadow-xs' : 'hover:bg-white/10 text-white'
                      }`}
                    >
                      Mặc định
                    </button>
                    <button 
                      onClick={() => setZoomMode('large')}
                      className={`px-2.5 py-1 rounded text-[10.5px] font-bold transition-all ${
                        zoomMode === 'large' ? 'bg-white text-gray-900 shadow-xs' : 'hover:bg-white/10 text-white'
                      }`}
                      title="Phóng to ảnh chụp màn hình chi tiết"
                    >
                      🔎[+] Phóng to
                    </button>
                  </div>
               </div>
               
               <div className="p-4 bg-[#fdfbf9]">
                  {suggestedProducts.length > 0 ? (
                    <div className={`grid gap-2 ${
                      zoomMode === 'compact' 
                        ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10' 
                        : zoomMode === 'large'
                        ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                        : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
                    }`}>
                      {suggestedProducts.map(product => (
                        <ProductCard 
                          key={product.id} 
                          product={product} 
                          onClick={(p) => setSelectedProduct(p)} 
                          onAddToCart={handleAddToCart}
                          sizeMode={zoomMode}
                        />
                      ))}
                    </div>
                  ) : (
                    // Displaying Empty Area strictly based on "nếu không có để trống"
                    <div className="py-16 text-center text-gray-500 flex flex-col items-center justify-center min-h-[140px] max-w-md mx-auto">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-2 font-mono text-xl font-bold">
                        ∅
                      </div>
                      <span className="text-sm font-bold text-gray-800">Mục Gợi Ý Hiện Đang Trống</span>
                      <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                        Chủ shop chưa bật ghim gợi ý nào cho hôm nay. Xem các mục khác bên dưới hoặc quản trị viên có thể vào cài đặt để bật bài viết lên.
                      </p>
                    </div>
                  )}
               </div>
            </section>

            {/* General Discovery Feed */}
            <section className="bg-white mt-6 rounded-sm shadow-xs overflow-hidden border border-gray-150">
               <div className="bg-gray-900 px-4 py-3.5 flex flex-wrap gap-3 items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Store className="w-5 h-5 text-white" />
                    <h2 className="text-white uppercase font-bold tracking-wider text-sm">
                      🛍️ Toàn Bộ Danh Sách Bài Đăng Tiếp Thị ({filteredProducts.length})
                    </h2>
                  </div>
                  
                  {/* Inline list filter search zone */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Tìm sản phẩm nhanh..."
                        className="bg-white/10 text-white placeholder-gray-400 border border-white/20 text-xs px-8 py-1.5 rounded-sm focus:outline-none focus:bg-white focus:text-gray-900 focus:placeholder-gray-500 w-44 sm:w-56"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                      />
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                    </div>

                    {selectedCategory && (
                      <span className="text-[10px] text-yellow-300 bg-white/10 px-2 py-0.5 rounded font-bold uppercase hidden sm:inline">
                        Lọc: {displayCategories.find(c => c.id === selectedCategory)?.name || categories.find(c => c.id === selectedCategory)?.name}
                      </span>
                    )}
                  </div>
               </div>
               
               <div className="p-4 bg-white">
                  <div className={`grid gap-2 ${
                    zoomMode === 'compact' 
                      ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10' 
                      : zoomMode === 'large'
                      ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                      : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
                  }`}>
                    {filteredProducts.map(product => (
                      <ProductCard 
                        key={product.id} 
                        product={product} 
                        onClick={(p) => setSelectedProduct(p)} 
                        onAddToCart={handleAddToCart}
                        sizeMode={zoomMode}
                      />
                    ))}
                  </div>
               </div>
            </section>

            {/* About us & AI Chatbot Section */}
            <section className="bg-white mt-6 rounded-sm shadow-xs border border-gray-150 overflow-hidden font-sans">
              <div className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 p-1">
                <div className="bg-gradient-to-r from-teal-900 to-emerald-950 text-white px-4 py-4 flex flex-wrap gap-3 items-center justify-between shadow-inner">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-x-0 w-8 h-8 bg-[#20fcc2] rounded-full blur-md animate-ping opacity-60"></div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center relative border-2 border-white shadow">
                        <Bot className="w-4 h-4 text-white animate-bounce" />
                      </div>
                    </div>
                    <div>
                      <h2 className="uppercase font-extrabold tracking-widest text-[#2bfaba] text-xs sm:text-sm font-sans flex items-center gap-1.5">
                        🤖 TRỢ LÝ ĐÁP VẤN AI SIÊU CẤP ĐA NĂNG
                      </h2>
                      <p className="text-[10px] text-gray-300 font-medium leading-normal">
                        Kênh robot AI tự động tư vấn, cung cấp kịch bản xây kênh, và hỗ trợ bốc thăm trúng tài liệu miễn phí!
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 self-end">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                    <span className="text-[9px] bg-white/10 text-[#3efaa8] px-2.5 py-0.5 rounded-full font-black border border-white/10 uppercase tracking-widest">
                      GEMINI ACTIVE
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-gray-200 min-h-[480px]">
                {/* Left Column: About Us description (About Us) (4 cols) */}
                <div className="md:col-span-4 p-5 flex flex-col justify-between bg-teal-50/15 overflow-y-auto">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-teal-800 text-sm mb-1">Cửa Hàng Tiếp Thị Liên Kết Remix</h3>
                      <p className="text-xs text-gray-600 leading-relaxed text-justify">
                        Chào mừng quý khách đến với <strong>{customBrand}</strong> - Nền tảng chia sẻ và tiếp thị các sản phẩm hàng đầu từ Shopee, Tiktok Shop và Lazada, được tích hợp các tính năng công nghệ tối tân.
                      </p>
                    </div>

                    <div className="border-t border-teal-100 pt-3">
                      <h4 className="font-bold text-gray-800 text-xs mb-1">⚙️ Phân Tích Kỹ Thuật & Mã Nguồn</h4>
                      <p className="text-[11px] text-gray-500 leading-relaxed text-left">
                        Hệ thống web được thiết kế bằng kiến trúc Full-stack đỉnh cao:
                      </p>
                      <ul className="text-[11px] text-gray-600 space-y-1 mt-1 pl-4 list-disc list-inside">
                        <li><strong>Frontend:</strong> React 19, TypeScript, Tailwind CSS, Motion Animations.</li>
                        <li><strong>Backend:</strong> Node.js, Express, tsx engine, esbuild compiler.</li>
                        <li><strong>AI Core:</strong> @google/genai SDK kết nối trực tiếp đến mô hình Gemini tiên tiến để tư vấn tiếp thị trực quan.</li>
                      </ul>
                    </div>

                    <div className="border-t border-teal-100 pt-3 text-[11px] text-gray-650">
                      <p className="font-semibold text-gray-800">💡 Bạn có biết?</p>
                      <p className="mt-0.5 leading-relaxed">
                        AI Assistant của chúng tôi đã đọc và hiểu toàn bộ mã nguồn cùng danh sách sản phẩm thời trang, mỹ phẩm, hoặc tài liệu số đang có trên hệ thống để tư vấn tốt nhất cho bạn!
                      </p>
                    </div>
                  </div>

                  <div className="bg-teal-50 border border-teal-200 p-2.5 rounded-sm text-[10.5px] text-teal-900 font-medium">
                     📞 **Hỏi đáp mọi lúc**: Chỉ cần gửi câu hỏi ở mục bên cạnh để được trợ lý ảo tự động phân tách và hỗ trợ phản hồi 24/7 tức thì!
                  </div>
                </div>

                {/* Right Column: Q&A Chatbot Portal (8 cols) */}
                <div className="md:col-span-8 flex flex-col h-full bg-white relative">
                   {/* Chats area */}
                   <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin max-h-[350px]">
                     {chatMessages.map(msg => {
                       const isCollapsed = collapsedMessageIds.includes(msg.id);
                       const fSizeClass = getMessageFontSizeClass(msg.id);
                       return (
                         <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                           <div className={`flex items-start gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                             <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-teal-600 text-white'}`}>
                               {msg.sender === 'user' ? 'Kh' : 'AI'}
                             </div>
                             
                             <div className="flex flex-col space-y-1">
                               <div className={`p-3 rounded-lg leading-relaxed shadow-xs ${fSizeClass} ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                                 {isCollapsed ? (
                                   <div className="flex items-center gap-1.5 text-gray-400 italic">
                                     <span>[Nội dung câu trả lời đã thu ẩn]</span>
                                     <button 
                                       onClick={() => setCollapsedMessageIds(prev => prev.filter(x => x !== msg.id))}
                                       className="text-xs text-blue-650 hover:underline font-bold not-italic cursor-pointer"
                                     >
                                       Hiện lại
                                     </button>
                                   </div>
                                 ) : (
                                   <div>
                                     {msg.sender === 'user' ? (
                                       <p className="whitespace-pre-line">{msg.text}</p>
                                     ) : (
                                       <div>
                                         {renderFormattedText(msg.text)}
                                         {msg.recommendedProduct && renderRecommendedProduct(msg.recommendedProduct)}
                                       </div>
                                     )}
                                   </div>
                                 )}
                               </div>

                               {/* Message specific controls bar */}
                               <div className="flex flex-wrap items-center gap-1.5 px-1 text-[9.5px] text-gray-400 select-none">
                                 <span className="font-semibold text-[8.5px] uppercase tracking-wider text-gray-300">Tùy biến:</span>
                                 
                                 {/* Phóng to */}
                                 <button
                                   type="button"
                                   onClick={() => setMsgFontSizes(prev => ({ ...prev, [msg.id]: (prev[msg.id] || 0) + 1 }))}
                                   className="hover:text-blue-600 flex items-center gap-0.5 cursor-pointer bg-gray-50 hover:bg-gray-105 border border-gray-150 px-1 py-0.5 rounded-[2px]"
                                   title="Phóng to cỡ chữ"
                                 >
                                   <ZoomIn className="w-2 h-2" /> Chữ+
                                 </button>

                                 {/* Thu nhỏ */}
                                 <button
                                   type="button"
                                   onClick={() => setMsgFontSizes(prev => ({ ...prev, [msg.id]: (prev[msg.id] || 0) - 1 }))}
                                   className="hover:text-amber-600 flex items-center gap-0.5 cursor-pointer bg-gray-50 hover:bg-gray-104 border border-gray-150 px-1 py-0.5 rounded-[2px]"
                                   title="Thu nhỏ cỡ chữ"
                                 >
                                   <ZoomOut className="w-2 h-2" /> Chữ-
                                 </button>

                                 {/* Ẩn đi Toggle */}
                                 <button
                                   type="button"
                                   onClick={() => setCollapsedMessageIds(prev => prev.includes(msg.id) ? prev.filter(x => x !== msg.id) : [...prev, msg.id])}
                                   className="hover:text-purple-650 flex items-center gap-0.5 cursor-pointer bg-gray-50 hover:bg-gray-105 border border-gray-150 px-1 py-0.5 rounded-[2px]"
                                   title="Ẩn tạm thời nội dung tin nhắn"
                                 >
                                   {isCollapsed ? <>⚙️ Hiện</> : <>👁️ Ẩn đi</>}
                                 </button>

                                 {/* Xóa tin nhắn */}
                                 <button
                                   type="button"
                                   onClick={() => setChatMessages(prev => prev.filter(x => x.id !== msg.id))}
                                   className="hover:text-red-650 text-red-500 flex items-center gap-0.5 cursor-pointer bg-gray-55 hover:bg-red-50 border border-red-100 px-1 py-0.5 rounded-[2px]"
                                   title="Xóa tin nhắn này"
                                 >
                                   <Trash2 className="w-2 h-2 text-red-500" /> Xóa
                                 </button>
                               </div>
                             </div>
                           </div>
                         </div>
                       );
                     })}
                    {isChatLoading && (
                      <div className="flex justify-start animate-pulse">
                        <div className="flex items-start gap-2 max-w-[80%]">
                          <div className="w-7 h-7 rounded-full bg-teal-400 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            AI
                          </div>
                          <div className="p-3 bg-gray-100 text-gray-500 rounded-lg text-xs rounded-tl-none italic flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                            Đang đọc code và suy nghĩ trả lời...
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Suggested quick questions */}
                  <div className="px-4 py-2 bg-gray-55 border-t border-gray-100 flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto">
                     <button 
                       type="button"
                       onClick={() => handleSendChatMessage("Hệ thống website này hoạt động thế nào, code cấu trúc ra sao? ⚙️")}
                       className="bg-white hover:bg-teal-50 text-teal-850 hover:text-teal-900 border border-teal-200 px-2 py-1 rounded text-[10.5px] font-extrabold cursor-pointer transition-colors"
                       disabled={isChatLoading}
                     >
                       ⚙️ Cơ chế hoạt động & cấu trúc code?
                     </button>
                     <button 
                       type="button"
                       onClick={() => handleSendChatMessage("Tư vấn cho tôi các phần mềm số và khóa học VIP của shop! 📚")}
                       className="bg-white hover:bg-teal-50 text-teal-850 hover:text-teal-900 border border-teal-200 px-2 py-1 rounded text-[10.5px] font-extrabold cursor-pointer transition-colors"
                       disabled={isChatLoading}
                     >
                       📚 Có phần mềm & khóa học VIP nào?
                     </button>
                     <button 
                       type="button"
                       onClick={() => handleSendChatMessage("Tôi muốn bốc thăm trúng thưởng quà 0đ thì làm thế nào? 🎯")}
                       className="bg-white hover:bg-teal-50 text-teal-850 hover:text-teal-900 border border-teal-200 px-2 py-1 rounded text-[10.5px] font-extrabold cursor-pointer transition-colors"
                       disabled={isChatLoading}
                     >
                       🎯 Cách bốc thăm quà 0đ?
                     </button>
                     <button 
                       type="button"
                       onClick={() => handleSendChatMessage("Có sản phẩm nào bán chạy hay hot nhất cho tôi xin link với! 🔥")}
                       className="bg-white hover:bg-teal-50 text-teal-850 hover:text-teal-900 border border-teal-200 px-2 py-1 rounded text-[10.5px] font-extrabold cursor-pointer transition-colors"
                       disabled={isChatLoading}
                     >
                       🔥 Gợi ý sản phẩm hot ngày hôm nay?
                     </button>
                  </div>

                  {/* Inputs area */}
                  <form 
                    onSubmit={e => {
                      e.preventDefault();
                      handleSendChatMessage(chatInput);
                    }}
                    className="p-3 border-t border-gray-200 flex gap-2 bg-white"
                  >
                    <input 
                      type="text" 
                      placeholder="Nhập câu hỏi của bạn (Ví dụ: tư vấn váy xinh, hỏi thăm khóa học, hỏi về code...)..."
                      className="flex-1 border border-gray-300 rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-teal-500 bg-white text-gray-800 font-medium"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      disabled={isChatLoading}
                    />
                    <button 
                      type="submit"
                      disabled={!chatInput.trim() || isChatLoading}
                      className="bg-teal-650 hover:bg-teal-700 text-white px-4 py-2 rounded-sm text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" /> Gửi
                    </button>
                  </form>
                </div>
              </div>
            </section>
          </div>
        ) : activeTab === 'online_products' ? (
          /* ================= ONLINE PRODUCTS & LUCKY DRAW FUNNEL ================= */
          <div className="max-w-[1200px] mx-auto px-4 mt-6 animate-fadeIn">
            
            {/* Header info bar */}
            <div className="bg-gradient-to-r from-orange-600 to-red-500 rounded-sm p-6 text-white text-center shadow-xs mb-8">
              <h2 className="text-xl md:text-3xl font-black mt-2 tracking-tight">Khu Vực Quà Tặng & Sản Phẩm Số Trực Tuyến</h2>
              <p className="text-white/90 text-xs md:text-sm mt-1 max-w-2xl mx-auto">
                Điền thông tin rút thăm trúng thưởng tài liệu VIP 0đ hoặc tham khảo sở hữu ngay các giáo trình, mã nguồn và tệp tệp tiếp thị hàng đầu.
              </p>
            </div>

            {/* Warning when no gifts / active campaigns are registered */}
            {(giftMaterials.length === 0 || !giftCampaigns.some(c => c.active)) ? (
              <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-850 p-4 mb-6 rounded text-xs md:text-sm font-medium flex items-center gap-3 shadow-2xs leading-relaxed animate-pulse">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="font-extrabold text-amber-900">Ban quản trị chưa thiết lập hoặc chưa kích hoạt Giỏ quà tặng!</p>
                  <p className="text-gray-600 text-xs mt-0.5">Vui lòng chờ Admin thiết lập hoặc chọn quà tặng & kích hoạt chiến dịch trong Tab Quản trị để mở rút thưởng.</p>
                </div>
              </div>
            ) : (
              /* When configured, always show inviting invitation notice */
              <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-950 p-4 mb-6 rounded text-xs md:text-sm shadow-2xs leading-relaxed font-sans">
                <div className="flex items-center gap-3">
                  <span className="text-xl animate-bounce">🎁</span>
                  <div>
                    <strong className="text-emerald-900 font-extrabold text-[12.5px]">🔥 KÍNH MỜI TẤT CẢ MỌI NGƯỜI THAM GIA NHẬN QUÀ MIỄN PHÍ!</strong>
                    <p className="text-gray-700 text-xs mt-0.5 font-medium">Hệ thống đang mở hàng chục phần quà giá trị cực cao dưới dạng file trực tuyến. Hãy điền thông tin và tham gia quay thưởng ngay!</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Interactive Lucky Wheel Funnel (5 cols) */}
              <div className="lg:col-span-5 bg-white p-6 rounded border border-gray-200 shadow-xs space-y-6">
                <div className="pb-3 border-b">
                  <h3 className="text-gray-800 font-black text-sm flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400 animate-bounce" />
                    Vòng Quay Bốc Thăm Trúng Thưởng 0đ
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-1">Cần nhập họ tên & số điện thoại để hệ thống lưu thông tin đối soát trao giải tự động vào database.</p>
                </div>

                {/* Simulated Spinning Wheel Component visually */}
                <div className="flex flex-col items-center justify-center py-4 relative bg-gray-50 border rounded-sm overflow-hidden">
                  
                  {/* Wheel container wrapper */}
                  <div className="w-60 h-60 rounded-full border-4 border-[#ee4d2d] relative shadow flex items-center justify-center overflow-hidden bg-white mb-4">
                    
                    {/* Visual Segment Lines dividing standard gifts */}
                    <div 
                      className="absolute inset-0 transition-transform duration-[3000ms] cubic-bezier(0.1, 0.8, 0.1, 1)"
                      style={{ transform: `rotate(${spinAngle}deg)` }}
                    >
                      {/* Segment colors backdrops */}
                      <div className="absolute top-0 left-0 w-full h-full bg-orange-50/20"></div>
                      <div className="absolute top-0 left-0 w-full h-full rotate-45 bg-amber-50/20"></div>
                      <div className="absolute top-0 left-0 w-full h-full rotate-90 bg-orange-100/30"></div>
                      <div className="absolute top-0 left-0 w-full h-full rotate-[135deg] bg-yellow-100/20"></div>
                      <div className="absolute top-0 left-0 w-full h-full rotate-[180deg] bg-orange-50/40"></div>
                      <div className="absolute top-0 left-0 w-full h-full rotate-[225deg] bg-red-50/20"></div>
                      <div className="absolute top-0 left-0 w-full h-full rotate-[270deg] bg-amber-100/30"></div>
                      <div className="absolute top-0 left-0 w-full h-full rotate-[315deg] bg-emerald-50/20"></div>

                      {/* Labels on segments */}
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-gray-800 rotate-0">Ebook View</div>
                      <div className="absolute top-12 right-6 text-[9px] font-bold text-gray-800 rotate-45">Gói Kịch Bản VIP</div>
                      <div className="absolute top-1/2 right-4 -translate-y-1/2 text-[9px] font-bold text-gray-800 rotate-90">Khóa học hot</div>
                      <div className="absolute bottom-12 right-6 text-[9px] font-bold text-gray-800 rotate-[135deg]">Phiếu may mắn</div>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-gray-800 rotate-[180deg]">Quà Bí Mật</div>
                      <div className="absolute bottom-12 left-6 text-[9px] font-bold text-gray-800 rotate-[225deg]">Tài liệu Tiktok</div>
                      <div className="absolute top-1/2 left-4 -translate-y-1/2 text-[9px] font-bold text-gray-800 rotate-[270deg]">Ý tưởng KD</div>
                      <div className="absolute top-12 left-6 text-[9px] font-bold text-gray-800 rotate-[315deg]">Bí kíp Shopee</div>
                    </div>

                    {/* Wheel Center Button / Pin */}
                    <div className="absolute w-10 h-10 rounded-full bg-red-650 border-2 border-white shadow flex items-center justify-center z-10">
                      <span className="text-[10px] font-extrabold text-white">READY</span>
                    </div>

                    {/* Pointer */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-red-600 z-20"></div>

                  </div>

                  {spinResult && (() => {
                    let finalComputedUrl = spinResult.downloadUrl;
                    if (finalComputedUrl?.includes('example.com') || finalComputedUrl?.includes('zalo.me/g/nhan-qua-affili')) {
                      if (giftClaimLink && giftClaimLink !== 'https://zalo.me/g/nhan-qua-affili') {
                        finalComputedUrl = giftClaimLink;
                      } else {
                        finalComputedUrl = '';
                      }
                    }
                    const isEffectivelyNoPrize = spinResult.isNoPrize;

                    return (
                    <div className="mt-2 text-center p-4 bg-gradient-to-tr from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg max-w-sm mx-auto shadow-xs text-xs space-y-2.5 animate-bounce" style={{ animationIterationCount: 3 }}>
                      {isEffectivelyNoPrize ? (
                        <div className="space-y-2">
                          <p className="font-extrabold text-[#ee4d2d] text-xs">🍀 CHẦM CHẬM MỘT CHÚT, MAY MẮN SẼ ĐẾN SAU!</p>
                          <div className="p-3 bg-white rounded border border-orange-100 italic text-gray-700 font-semibold leading-relaxed text-[11px]">
                            "{[
                              "Cơ hội luôn mở ra cho những ai kiên trì học hỏi và hành động!",
                              "Hành trình vạn dặm khởi đầu từ những bước chân đầu tiên. Đừng bỏ cuộc bạn nhé!",
                              "Chúc bạn có một ngày tràn ngập năng lượng tích cực và may mắn trong kinh doanh!",
                              "Món quà lớn nhất chính là sự nỗ lực không ngừng nghỉ của chính bạn hôm nay!",
                              "Mỗi một ngày mới là một cơ hội mới để bạn chinh phục giới hạn bản thân!"
                            ][Math.floor(Math.random() * 5)]}"
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="font-extrabold text-emerald-700">🎉 CHÚC MỪNG BẠN ĐÃ TRÚNG GIẢI QUÀ TẶNG!</p>
                          <p className="font-bold text-gray-900 border-b border-gray-100 pb-2 text-[12px]">{spinResult.title}</p>
                          
                          <div className="p-3 bg-white rounded border border-orange-100 italic text-gray-700 font-semibold leading-relaxed text-[11px]">
                            <p className="font-extrabold text-emerald-700 mb-2">🎁 TẢI QUÀ TẶNG VỀ MÁY NGAY:</p>
                            <div className="space-y-2 text-left font-sans">
                              {(spinResult.htmlContent || (spinResult.downloadUrl?.startsWith('data:text/html'))) && (
                                <>
                                  <button
                                    type="button" 
                                    onClick={(e) => {
                                      try {
                                          e.preventDefault();
                                        let rawHtml = '';
                                        if (spinResult.htmlContent) {
                                          rawHtml = spinResult.htmlContent;
                                        } else if (spinResult.downloadUrl?.startsWith('data:text/html')) {
                                          const parts = spinResult.downloadUrl.split(',');
                                          rawHtml = decodeURIComponent(parts.slice(1).join(','));
                                        }
                                        if (!rawHtml) {
                                          alert("Lỗi tải xuống tài liệu: html trống.");
                                          return;
                                        }
                                        const blob = new Blob([rawHtml], { type: 'text/html;charset=utf-8' });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.style.display = 'none';
                                        a.href = url;
                                        a.download = `${spinResult.title || 'Tai-Lieu'}.html`;
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                        setTimeout(() => URL.revokeObjectURL(url), 30000);
                                      } catch (err) {
                                          console.error(err);
                                          alert("Lỗi tải xuống tài liệu: File quá lớn hoặc định dạng không hợp lệ.");
                                      }
                                    }}
                                    className="inline-flex items-center justify-center gap-1.5 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2 px-3 rounded text-[10.5px] shadow transition-colors cursor-pointer text-center"
                                  >
                                    📥 TẢI SÁCH / BÁO CÁO (.HTML)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      try {
                                        let rawHtml = '';
                                        if (spinResult.htmlContent) {
                                          rawHtml = spinResult.htmlContent;
                                        } else if (spinResult.downloadUrl?.startsWith('data:text/html')) {
                                          const parts = spinResult.downloadUrl.split(',');
                                          rawHtml = decodeURIComponent(parts.slice(1).join(','));
                                        }
                                        if (!rawHtml) {
                                          alert("Lỗi mở tài liệu");
                                          return;
                                        }
                                        const blob = new Blob([rawHtml], { type: 'text/html;charset=utf-8' });
                                        const url = URL.createObjectURL(blob);
                                        const newW = window.open(url, "_blank");
                                        if (!newW) {
                                          alert("Vui lòng cho phép quyền Popups để đọc sách trực tiếp!");
                                        }
                                      } catch (err) {
                                        console.error(err);
                                        alert("Lỗi mở tài liệu, vui lòng chọn tải xuống.");
                                      }
                                    }}
                                    className="inline-flex items-center justify-center gap-1.5 w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-2 px-3 rounded text-[10.5px] shadow transition-all cursor-pointer text-center"
                                  >
                                    👁️ ĐỌC TRỰC TUYẾN ĐẸP MẮT & CTRL+P
                                  </button>
                                  <p className="text-[9.5px] text-gray-500 font-sans leading-relaxed text-center">
                                    Tài liệu đã được biên dịch thành trang web độc quyền. Bạn có thể bấm **Đọc trực tuyến** rồi ấn tiếp **Ctrl + P** để lưu thành file PDF sắc nét!
                                  </p>
                                </>
                              )}
                              
                              {(!spinResult?.downloadUrl?.startsWith('data:text/html')) && (
                                (() => {
                                  let finalUrl = spinResult.downloadUrl || '';
                                  if (!finalUrl || finalUrl.includes('example.com')) {
                                     finalUrl = ''; // nullify
                                  }
                                  
                                  if (!finalUrl) {
                                     return (
                                       <button 
                                          type="button"
                                          onClick={() => alert("Phần quà này hiện chưa có file đính kèm. Vui lòng liên hệ với ban quản trị!")}
                                          className="inline-flex items-center justify-center gap-1.5 w-full bg-gray-500 hover:bg-gray-600 text-white font-black py-2 px-3 rounded text-[10.5px] shadow transition-colors cursor-pointer mt-2"
                                        >
                                          🎁 PHẦN QUÀ ĐÃ HẾT HOẶC CHƯA CẬP NHẬT
                                        </button>
                                     );
                                  }

                                  return (
                                    <>
                                      <a 
                                        href={finalUrl} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        download={spinResult.title}
                                        className="inline-flex items-center justify-center gap-1.5 w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-2 px-3 rounded text-[10.5px] shadow transition-colors cursor-pointer mt-2"
                                      >
                                        📥 TẢI TỆP QUÀ TẶNG / TÀI LIỆU GỐC
                                      </a>
                                      {finalUrl.startsWith('http') && (
                                        <p className="text-[9.5px] text-gray-400 break-all select-all font-sans text-center">Đường dẫn dự phòng: <br className="my-1"/> {finalUrl}</p>
                                      )}
                                    </>
                                  );
                                })()
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    );
                  })()}
                </div>

                {/* Gift Preference Selector */}
                <div className="bg-orange-50/20 border border-orange-200/50 rounded-md p-4 space-y-2.5 text-xs">
                  <span className="font-extrabold text-gray-800 uppercase text-[10.5px] tracking-wider block border-b border-gray-150 pb-1.5 flex items-center gap-1">
                    🎯 Tùy chọn nhu cầu quà trực tuyến của bạn:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <label className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-all ${giftPreference === 'beauty' ? 'bg-orange-50 border-[#ee4d2d] text-gray-950 font-extrabold shadow-2xs' : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'}`}>
                      <input 
                        type="radio" 
                        name="giftPreference" 
                        value="beauty"
                        checked={giftPreference === 'beauty'}
                        onChange={() => setGiftPreference('beauty')}
                        className="accent-[#ee4d2d]"
                      />
                      <span className="text-[11px] truncate">💄 Sách Làm Đẹp</span>
                    </label>

                    <label className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-all ${giftPreference === 'health' ? 'bg-orange-50 border-[#ee4d2d] text-gray-950 font-extrabold shadow-2xs' : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'}`}>
                      <input 
                        type="radio" 
                        name="giftPreference" 
                        value="health"
                        checked={giftPreference === 'health'}
                        onChange={() => setGiftPreference('health')}
                        className="accent-[#ee4d2d]"
                      />
                      <span className="text-[11px] truncate">🥗 Sức Khỏe VIP</span>
                    </label>

                    <label className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-all ${giftPreference === 'affiliate' ? 'bg-orange-50 border-[#ee4d2d] text-gray-950 font-extrabold shadow-2xs' : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'}`}>
                      <input 
                        type="radio" 
                        name="giftPreference" 
                        value="affiliate"
                        checked={giftPreference === 'affiliate'}
                        onChange={() => setGiftPreference('affiliate')}
                        className="accent-[#ee4d2d]"
                      />
                      <span className="text-[11px] truncate">💻 Tài liệu TTLK</span>
                    </label>
                  </div>
                  <p className="text-[10px] text-gray-400 italic font-sans animate-pulse">Quà trúng thưởng tải xuống sẽ được chọn lọc tự động phù hợp với nhóm chủ đề đã cho chọn ở trên.</p>
                </div>

                {/* Conditional Registration check for gifts */}
                {currentBuyer ? (
                  <div className="space-y-3 bg-emerald-50/55 p-4 rounded border border-emerald-150 text-xs">
                    <p className="font-bold text-emerald-800 text-[11.5px] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                      Chào mừng quý khách: <strong className="text-gray-900 underline">{currentBuyer.fullName}</strong>!
                    </p>
                    <p className="text-gray-600 text-[11px] leading-relaxed">
                      Bạn đã đăng ký hệ thống với số điện thoại <strong className="text-gray-900">{currentBuyer.phoneNumber}</strong> nên <strong>không cần điền thông tin</strong> để nhận quà! Bấm nút bên dưới để tham gia quay chiến dịch ngay nhé.
                    </p>
                    <button 
                      type="button"
                      disabled={spinLoading}
                      onClick={() => {
                        setSpinLoading(true);
                        setSpinResult(null);
                        setSpinMessage('Vòng quay chiến dịch đang hoạt động... Đang kiểm tra phân dải quà tặng...');

                        const randomAngle = spinAngle + 1440 + Math.floor(Math.random() * 360);
                        setSpinAngle(randomAngle);

                        setTimeout(() => {
                          setSpinLoading(false);
                          setSpinMessage('');
                          
                          setGuestSpinCount(prev => {
                            const newTotal = prev + 1;
                            let forceWin = false;
                            if (guaranteedWinSpins > 0 && newTotal >= guaranteedWinSpins) {
                               forceWin = true;
                            }
                            
                            // Evaluate the win condition inside the timeout but utilizing the fresh state
                            if (!forceWin && Math.random() < 0.85) {
                              setSpinResult({
                                title: 'Chúc bạn may mắn lần sau',
                                isNoPrize: true
                              });
                            } else {
                              const activeCamp = giftCampaigns.find(c => c.active && c.remainingSlots > 0);
                              if (activeCamp) {
                                const validGifts = (activeCamp.giftIds && activeCamp.giftIds.length > 0) ? giftMaterials.filter(gm => activeCamp.giftIds.includes(gm.id)) : giftMaterials;
                                if (validGifts.length > 0) {
                                  // Prefer real gifts over example.com mock data if they exist
                                  const realGifts = validGifts.filter(g => !g.downloadUrl?.includes('example.com'));
                                  const poolToUse = realGifts.length > 0 ? realGifts : validGifts;
                                  
                                  let matchedGifts = poolToUse;
                                  if (giftPreference === 'beauty') {
                                    matchedGifts = poolToUse.filter(g => 
                                      g.categoryType?.toLowerCase().includes('mỹ phẩm') || 
                                      g.categoryType?.toLowerCase().includes('làm đẹp') || 
                                      g.title?.toLowerCase().includes('đẹp') || g.title?.toLowerCase().includes('da')
                                    );
                                  } else if (giftPreference === 'health') {
                                    matchedGifts = poolToUse.filter(g => 
                                      g.categoryType?.toLowerCase().includes('sức khoẻ') || 
                                      g.title?.toLowerCase().includes('khỏe') || g.title?.toLowerCase().includes('dinh dưỡng')
                                    );
                                  } else if (giftPreference === 'affiliate') {
                                    matchedGifts = poolToUse.filter(g => 
                                      g.categoryType?.toLowerCase().includes('ttlk') || 
                                      g.categoryType?.toLowerCase().includes('điện tử') || 
                                      g.title?.toLowerCase().includes('affiliate') || g.title?.toLowerCase().includes('kiếm tiền')
                                    );
                                  }
                                  const finalSelection = matchedGifts.length > 0 ? matchedGifts : poolToUse;
                                  const prize = finalSelection[Math.floor(Math.random() * finalSelection.length)];
  
                                  setSpinResult({
                                    title: prize.title,
                                    downloadUrl: prize.downloadUrl,
                                    fromCampaign: activeCamp.name
                                  });
                                  setGiftCampaigns(camps => camps.map(c => c.id === activeCamp.id ? { ...c, remainingSlots: Math.max(0, c.remainingSlots - 1) } : c));
                                } else {
                                  setSpinResult({
                                    title: 'Cẩm nang tối ưu xây kênh Affiliate nghìn đơn',
                                    downloadUrl: 'https://example.com/gifts/tiktok-ad-guide.pdf'
                                  });
                                }
                              } else {
                                // general lucky draw fallback
                                const candidates = giftMaterials.length > 0 ? giftMaterials : [
                                  { title: 'Mẹo phối đồ thời trang sành điệu 2026', downloadUrl: 'https://example.com/gifts/fashion-tips.pdf' }
                                ];
                                
                                const realGifts = candidates.filter(g => !g.downloadUrl?.includes('example.com'));
                                const poolToUse = realGifts.length > 0 ? realGifts : candidates;

                                let matchedGifts = poolToUse;
                                if (giftPreference === 'beauty') {
                                  matchedGifts = poolToUse.filter(g => 
                                    g.categoryType?.toLowerCase().includes('mỹ phẩm') || 
                                    g.categoryType?.toLowerCase().includes('làm đẹp') || 
                                    g.title?.toLowerCase().includes('đẹp') || g.title?.toLowerCase().includes('da')
                                  );
                                } else if (giftPreference === 'health') {
                                  matchedGifts = poolToUse.filter(g => 
                                    g.categoryType?.toLowerCase().includes('sức khoẻ') || 
                                    g.title?.toLowerCase().includes('khỏe') || g.title?.toLowerCase().includes('dinh dưỡng')
                                  );
                                } else if (giftPreference === 'affiliate') {
                                  matchedGifts = poolToUse.filter(g => 
                                    g.categoryType?.toLowerCase().includes('ttlk') || 
                                    g.categoryType?.toLowerCase().includes('điện tử') || 
                                    g.title?.toLowerCase().includes('affiliate') || g.title?.toLowerCase().includes('kiếm tiền')
                                  );
                                }
                                const finalSelection = matchedGifts.length > 0 ? matchedGifts : poolToUse;
                                const selected = finalSelection[Math.floor(Math.random() * finalSelection.length)];
                                setSpinResult({
                                  title: selected.title,
                                  downloadUrl: selected.downloadUrl
                                });
                              }
                            }
                            return forceWin ? 0 : newTotal;
                          });
                        }, 3000);
                      }}
                      className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white font-black py-2.5 rounded tracking-wide shadow-md hover:shadow-lg cursor-pointer hover:opacity-95 transition-all text-xs disabled:opacity-50"
                    >
                      {spinLoading ? 'VÒNG QUAY ĐANG XOAY...' : '🎯 BẮT ĐẦU QUAY QUÀ NGAY (QUAY KHÔNG CẦN NHẬP FORM)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentBuyer(null)}
                      className="text-[10px] text-gray-400 hover:text-red-500 underline block text-center w-full"
                    >
                      Đổi tài khoản đăng ký khác
                    </button>
                  </div>
                ) : (
                  /* Collect Info fields to spin */
                  <form onSubmit={e => {
                    e.preventDefault();
                    if (!spinName.trim()) return alert('Vui lòng điền Họ tên!');
                    if (!spinPhone.trim()) return alert('Vui lòng điền Số điện thoại!');
                    
                    setSpinLoading(true);
                    setSpinResult(null);
                    setSpinMessage('Vòng xoay bốc thăm đang quay nhanh... Đang giao tiếp database lưu thông tin người mới...');

                    // Add guest user to the central registered buyers DB
                    const newBuyer: Buyer = {
                      fullName: spinName.trim(),
                      phoneNumber: spinPhone.trim(),
                      address: `Địa chỉ rút thăm: ${spinEmail || 'Không có email'} (IP Guest)`,
                      registeredAt: new Date().toISOString()
                    };
                    
                    // Instantly update buyers so admin panel displays immediately
                    setBuyers(prev => {
                      const filtered = prev.filter(b => b.phoneNumber !== newBuyer.phoneNumber);
                      return [newBuyer, ...filtered];
                    });
                    setCurrentBuyer(newBuyer);

                    // Random spin rotate animation simulation (3-5 full turns)
                    const randomAngle = spinAngle + 1440 + Math.floor(Math.random() * 360);
                    setSpinAngle(randomAngle);

                    setTimeout(() => {
                      setSpinLoading(false);
                      setSpinMessage('');
                      
                      setGuestSpinCount(prev => {
                        const newTotal = prev + 1;
                        let forceWin = false;
                        if (guaranteedWinSpins > 0 && newTotal >= guaranteedWinSpins) {
                           forceWin = true;
                        }

                        if (!forceWin && Math.random() < 0.85) {
                          setSpinResult({
                            title: 'Chúc bạn may mắn lần sau',
                            isNoPrize: true
                          });
                        } else {
                          const activeCamp = giftCampaigns.find(c => c.active && c.remainingSlots > 0);
                          if (activeCamp) {
                            const validGifts = (activeCamp.giftIds && activeCamp.giftIds.length > 0) ? giftMaterials.filter(gm => activeCamp.giftIds.includes(gm.id)) : giftMaterials;
                            if (validGifts.length > 0) {
                              const realGifts = validGifts.filter(g => !g.downloadUrl?.includes('example.com'));
                              const poolToUse = realGifts.length > 0 ? realGifts : validGifts;

                              let matchedGifts = poolToUse;
                              if (giftPreference === 'beauty') {
                                matchedGifts = poolToUse.filter(g => 
                                  g.categoryType?.toLowerCase().includes('mỹ phẩm') || 
                                  g.categoryType?.toLowerCase().includes('làm đẹp') || 
                                  g.title?.toLowerCase().includes('đẹp') || g.title?.toLowerCase().includes('da')
                                );
                              } else if (giftPreference === 'health') {
                                matchedGifts = poolToUse.filter(g => 
                                  g.categoryType?.toLowerCase().includes('sức khoẻ') || 
                                  g.title?.toLowerCase().includes('khỏe') || g.title?.toLowerCase().includes('dinh dưỡng')
                                );
                              } else if (giftPreference === 'affiliate') {
                                matchedGifts = poolToUse.filter(g => 
                                  g.categoryType?.toLowerCase().includes('ttlk') || 
                                  g.categoryType?.toLowerCase().includes('điện tử') || 
                                  g.title?.toLowerCase().includes('affiliate') || g.title?.toLowerCase().includes('kiếm tiền')
                                );
                              }
                              const finalSelection = matchedGifts.length > 0 ? matchedGifts : poolToUse;
                              const prize = finalSelection[Math.floor(Math.random() * finalSelection.length)];
                              setSpinResult({
                                title: prize.title,
                                downloadUrl: prize.downloadUrl,
                                fromCampaign: activeCamp.name
                              });
                              setGiftCampaigns(camps => camps.map(c => c.id === activeCamp.id ? { ...c, remainingSlots: Math.max(0, c.remainingSlots - 1) } : c));
                            } else {
                              setSpinResult({
                                title: 'Cẩm nang tối ưu xây kênh Affiliate nghìn đơn',
                                downloadUrl: 'https://example.com/gifts/tiktok-ad-guide.pdf'
                              });
                            }
                          } else {
                            const candidates = giftMaterials.length > 0 ? giftMaterials : [
                              { title: 'Mẹo phối đồ thời trang sành điệu 2026', downloadUrl: 'https://example.com/gifts/fashion-tips.pdf' }
                            ];
                            const realGifts = candidates.filter(g => !g.downloadUrl?.includes('example.com'));
                            const poolToUse = realGifts.length > 0 ? realGifts : candidates;

                            let matchedGifts = poolToUse;
                            if (giftPreference === 'beauty') {
                              matchedGifts = poolToUse.filter(g => 
                                g.categoryType?.toLowerCase().includes('mỹ phẩm') || 
                                g.categoryType?.toLowerCase().includes('làm đẹp') || 
                                g.title?.toLowerCase().includes('đẹp') || g.title?.toLowerCase().includes('da')
                              );
                            } else if (giftPreference === 'health') {
                              matchedGifts = poolToUse.filter(g => 
                                g.categoryType?.toLowerCase().includes('sức khoẻ') || 
                                g.title?.toLowerCase().includes('khỏe') || g.title?.toLowerCase().includes('dinh dưỡng')
                              );
                            } else if (giftPreference === 'affiliate') {
                              matchedGifts = poolToUse.filter(g => 
                                g.categoryType?.toLowerCase().includes('ttlk') || 
                                g.categoryType?.toLowerCase().includes('điện tử') || 
                                g.title?.toLowerCase().includes('affiliate') || g.title?.toLowerCase().includes('kiếm tiền')
                              );
                            }
                            const finalSelection = matchedGifts.length > 0 ? matchedGifts : poolToUse;
                            const selected = finalSelection[Math.floor(Math.random() * finalSelection.length)];
                            setSpinResult({
                              title: selected.title,
                              downloadUrl: selected.downloadUrl
                            });
                          }
                        }
                        return forceWin ? 0 : newTotal;
                      });
                    }, 3000);

                  }} className="space-y-3 text-xs leading-normal font-sans">
                    <h4 className="font-bold text-gray-800 text-[11px] uppercase tracking-wider">Thông Tin Nhập Cuộc (Dành riêng cho khách mới)</h4>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-0.5">Họ và Tên (*):</label>
                        <input 
                          type="text" 
                          placeholder="Nguyễn Văn A"
                          required 
                          disabled={spinLoading}
                          className="w-full border rounded px-2.5 py-1.5 focus:outline-none focus:border-shopee-orange text-xs"
                          value={spinName}
                          onChange={e => setSpinName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-0.5">Số Điện Thoại (*):</label>
                        <input 
                          type="tel" 
                          placeholder="0912xxxxxx"
                          required 
                          disabled={spinLoading}
                          className="w-full border rounded px-2.5 py-1.5 focus:outline-none focus:border-shopee-orange text-xs"
                          value={spinPhone}
                          onChange={e => setSpinPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">Địa chỉ Email (Nhận tài liệu dự phòng):</label>
                      <input 
                        type="email" 
                        placeholder="email@example.com"
                        disabled={spinLoading}
                        className="w-full border rounded px-2.5 py-1.5 focus:outline-none focus:border-shopee-orange text-xs"
                        value={spinEmail}
                        onChange={e => setSpinEmail(e.target.value)}
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={spinLoading}
                      className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white font-black py-2.5 rounded tracking-wide shadow-xs cursor-pointer hover:shadow hover:opacity-95 transition-all text-xs disabled:opacity-50"
                    >
                      {spinLoading ? 'VÒNG QUAY ĐANG XOAY...' : '🎯 GỬI THÔNG TIN VÀ ĐĂNG KÝ QUAY QUÀ'}
                    </button>
                  </form>
                )}

              </div>

              {/* Right Column: Commercial and Online Templates List (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                <div className="bg-white p-6 rounded border border-gray-200 shadow-xs">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-150 mb-5">
                    <h3 className="text-gray-900 font-extrabold text-sm flex items-center gap-1.5">
                      <Store className="w-5 h-5 text-shopee-orange" />
                      Danh Sách Các Sản Phẩm Số Trực Tuyến Bản Quyền
                    </h3>
                    <span className="text-[10px] bg-red-100 text-red-600 font-bold px-2.5 py-0.5 rounded-full">An Toàn - Nhận Link Ngay</span>
                  </div>

                  {onlineProducts && onlineProducts.filter((op: any) => op.isShowOnHome).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {onlineProducts.filter((op: any) => op.isShowOnHome).map((op: any) => (
                        <div key={op.id} className="border border-gray-200 hover:border-orange-200 rounded p-4 flex flex-col justify-between bg-gray-50/20 hover:bg-orange-50/5 transition-all relative group shadow-2xs">
                          {/* Banner Type badge */}
                          <div className="absolute top-2 right-2 text-[8px] bg-amber-100 font-extrabold text-[#ee4d2d] px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                            {op.type === 'mienphi' ? 'Quà Tặng' : op.type}
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-xs font-black text-gray-900 leading-normal pr-12 line-clamp-2 min-h-[32px]">{op.title}</h4>
                            <div className="flex items-baseline gap-1.5 pt-2">
                              <span className="text-red-600 font-extrabold text-sm">{op.isFree ? 'Quà Tặng 0đ' : `${op.price.toLocaleString('vi-VN')}đ`}</span>
                              {op.originalPrice > op.price && (
                                <span className="line-through text-gray-400 text-[10.5px]">{op.originalPrice.toLocaleString('vi-VN')}đ</span>
                              )}
                            </div>
                            <p className="text-[10px] text-gray-400">Cam kết đầy đủ file hướng dẫn, mã mở khoá trọn đời không giới hạn thiết bị.</p>
                          </div>

                          <div className="pt-4 mt-auto">
                            {op.isFree ? (
                              <div className="space-y-2">
                                {op.isAutoGeneratedWebDoc && (
                                  <div className="grid grid-cols-2 gap-2">
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
                                        } catch(err) {
                                          console.error(err);
                                          alert("Lỗi tải xuống: File có thể quá lớn.");
                                        }
                                      }}
                                      className="border border-indigo-500 text-indigo-700 hover:bg-indigo-50 py-1.5 rounded text-[9.5px] font-extrabold cursor-pointer text-center flex items-center justify-center transition-colors"
                                    >
                                      📥 Tải .html
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
                                          const newW = window.open(url, "_blank");
                                          if (!newW) {
                                            alert("Vui lòng cho phép quyền Popups để đọc trực tiếp trên trình duyệt!");
                                          }
                                        } catch(err) {
                                          console.error(err);
                                          alert("Lỗi mở tài liệu!");
                                        }
                                      }}
                                      className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white py-1.5 rounded text-[9.5px] font-bold cursor-pointer text-center"
                                    >
                                      👁️ Đọc Online
                                    </button>
                                  </div>
                                )}
                                
                                {(!op.isAutoGeneratedWebDoc && op.downloadUrl) ? (
                                  <a 
                                    href={op.downloadUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    download={op.title}
                                    className="block w-full border border-emerald-500 text-emerald-600 hover:bg-emerald-50 py-1.5 rounded text-[10px] font-bold cursor-pointer text-center transition-colors"
                                  >
                                    📥 Tải / Nhận tệp tài liệu
                                  </a>
                                ) : (
                                  !op.isAutoGeneratedWebDoc && (
                                    <button 
                                      onClick={() => {
                                        alert(`Đây là quà tặng bốc thăm. Vui lòng sử dụng "Vòng Quay May Mắn" bên trái để bốc thăm nhận quà miễn phí!`);
                                      }}
                                      className="w-full border border-dashed border-[#ee4d2d] text-shopee-orange hover:bg-orange-50/50 py-1.5 rounded text-[10px] font-bold cursor-pointer text-center"
                                    >
                                      Quay bốc thăm để nhận 🎁
                                    </button>
                                  )
                                )}
                              </div>
                            ) : (
                              <button 
                                onClick={() => {
                                  // Prompt buyer checkout code
                                  alert(`ĐỂ SỞ HỮU "${op.title}":\n\nVui lòng quét mã QR chuyển khoản ngân hàng hoặc liên hệ admin qua Zalo/Facebook để nhận tài khoản thanh toán và link download trực tiếp tức thì!\n\nLink tải file download sẽ tự kích hoạt ngay khi xác minh.`);
                                }}
                                className="w-full bg-shopee-orange hover:bg-[#ff5722] text-white py-1.5 rounded text-[10px] font-black cursor-pointer shadow-xs text-center"
                              >
                                Sở hữu ngay / Mua tài liệu
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-16 text-center text-gray-400 border border-dashed rounded text-xs">
                      Chưa có sản phẩm trực tuyến nào. Quản trị viên vui lòng đăng nhập, sang Tab "Sản phẩm online" để cấu hình tạo danh sách.
                    </div>
                  )}
                </div>



              </div>

            </div>

          </div>
        ) : (
          // Admin Security Login Check Wrap
          <div className="min-h-[500px] flex items-center justify-center p-4">
            {!isAdminLoggedIn ? (
              // Beautiful Admin Login Form Formulating
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 md:p-8 rounded-lg shadow-md border border-gray-200 max-w-md w-full relative overflow-hidden"
              >
                {/* Decorative Accent Liner */}
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-500 to-[#ee4d2d]" />
                
                <button 
                  onClick={() => setActiveTab('home')}
                  className="inline-flex items-center gap-1.5 text-xs text-shopee-orange font-bold hover:underline mb-6 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Trở về trang mua sắm
                </button>

                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-red-50 text-shopee-orange rounded-full flex items-center justify-center mx-auto mb-3 border border-red-100">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-extrabold text-gray-900">Yêu Cầu Đăng Nhập Hệ Thống</h3>
                  <p className="text-xs text-gray-500 mt-1">Mục quản trị cài đặt giới hạn quyền người dùng. Vui lòng nhập tài khoản để tiếp tục.</p>
                </div>

                {loginError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs py-2.5 px-3 rounded mb-4 font-medium">
                    {loginError}
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Mật Khẩu Quản Trị
                    </label>
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        placeholder="Nhập mật khẩu..." 
                        className="w-full border border-gray-300 rounded-sm pl-9 pr-10 py-2 text-xs focus:outline-none focus:border-shopee-orange"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                      />
                      <Lock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 hover:text-gray-800 text-gray-400"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-shopee-orange hover:bg-shopee-orange-hover text-white py-2.5 rounded text-xs font-bold tracking-wide transition-colors shadow-sm"
                  >
                    Đăng Nhập Cài Đặt
                  </button>
                </form>


              </motion.div>
            ) : (
              // Connected Dashboard View với tham số mới
              <AdminDashboard 
                products={products}
                categories={categories}
                onSetCategories={setCategories}
                onAddProduct={handleAddProduct}
                onDeleteProduct={handleDeleteProduct}
                onToggleSuggest={handleToggleSuggest}
                onUpdateProduct={handleUpdateProduct} // Prop dùng cập nhật sản phẩm
                onLogout={handleAdminLogout}
                adminRole={adminRole}
                buyers={buyers} // Thừa hưởng danh sách khách hàng
                searchTracks={searchTracks} // Thừa hưởng mảng từ khoá tìm kiếm
                onClearAllProducts={handleClearAllProducts}
                onClearAllBuyers={handleClearAllBuyers}
                onClearSearchTracks={handleClearSearchTracks}
                giftMaterials={giftMaterials}
                onSetGiftMaterials={setGiftMaterials}
                giftCampaigns={giftCampaigns}
                onSetGiftCampaigns={setGiftCampaigns}
                giftClaimLink={giftClaimLink}
                onSetGiftClaimLink={setGiftClaimLink}
                geminiKeys={geminiKeys}
                onSetGeminiKeys={setGeminiKeys}
                guaranteedWinSpins={guaranteedWinSpins}
                onSetGuaranteedWinSpins={setGuaranteedWinSpins}
              />
            )}
          </div>
        )}
      </main>

      {/* Basic Footer */}
      <footer className="bg-white border-t-4 border-shopee-orange pt-12 pb-6 mt-auto">
        <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-bold text-gray-800 mb-4 uppercase text-sm">Chăm sóc khách hàng</h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li className="hover:text-shopee-orange cursor-pointer">Trung tâm trợ giúp</li>
              <li className="hover:text-shopee-orange cursor-pointer">Hướng dẫn mua sắm</li>
              <li className="hover:text-shopee-orange cursor-pointer">Chính sách liên kết bảo mật</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 mb-4 uppercase text-sm">Về {customBrand}</h4>
            <ul className="space-y-2 text-xs text-gray-650">
              <li className="hover:text-shopee-orange cursor-pointer">Giới thiệu hệ thống</li>
              <li className="hover:text-shopee-orange cursor-pointer" onClick={() => setShowTermsModal(true)}>Điều khoản dịch vụ</li>
              <li className="hover:text-shopee-orange cursor-pointer">Chính sách tiếp thị</li>
            </ul>
          </div>
          <div>
             <h4 className="font-bold text-gray-800 mb-4 uppercase text-sm">Cửa hàng liên kết</h4>
             <div className="flex flex-wrap gap-2">
                <div className="px-3 py-1.5 bg-gray-50 rounded text-xs font-bold text-gray-600 border shadow-xs">SHOPEE</div>
                <div className="px-3 py-1.5 bg-gray-50 rounded text-xs font-bold text-gray-600 border shadow-xs">TIKTOK SHOP</div>
                <div className="px-3 py-1.5 bg-gray-50 rounded text-xs font-bold text-gray-600 border shadow-xs">LAZADA</div>
             </div>
          </div>
          <div>
             <h4 className="font-bold text-gray-800 mb-4 uppercase text-sm">Theo dõi mạng xã hội</h4>
             <ul className="space-y-3 text-xs text-gray-600">
              <li className="hover:text-shopee-orange cursor-pointer flex items-center gap-2">
                <Facebook className="w-4 h-4" /> Fanpage Facebook
              </li>
              <li className="hover:text-shopee-orange cursor-pointer flex items-center gap-2">
                <MessageCircle className="w-4 h-4" /> Kênh Chat Zalo
              </li>
            </ul>
          </div>
        </div>
        <div className="text-center text-xs text-gray-500 border-t border-gray-200 pt-6">
          © 2026 {customBrand}. Bản quyền hệ thống thuộc về Bạn. Sàn TMĐT Tiếp Thị Liên Kết Chất Lượng.
        </div>
      </footer>

      {/* Buyer Registration Modal */}
      {showBuyerRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-md shadow-xl max-w-md w-full overflow-hidden border border-gray-100"
          >
            <div className="bg-gradient-to-r from-shopee-orange to-orange-500 text-white p-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <User className="w-5 h-5" />
                Đăng Kýchỉ Một Lần - Mua Sắm Rảnh Tay
              </h3>
              <p className="text-[11px] text-white/90 mt-1">Thông tin được lưu tự động trên thiết bị. Hệ thống tự đồng bộ điền form khi chuyển tiếp sang Shopee/TikTok.</p>
            </div>
            
            <form onSubmit={handleBuyerRegister} noValidate className="p-5 space-y-4">
              {regSuccessMessage && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 rounded-sm text-xs font-medium flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  {regSuccessMessage}
                </div>
              )}

              {regErrorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-sm text-xs font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-red-655 rounded-full inline-block animate-pulse"></span>
                  {regErrorMessage}
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Tên Người Mua *</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Ví dụ: Nguyễn Văn A..." 
                    className="w-full border border-gray-300 rounded-sm px-3 py-2 pl-9 text-xs focus:outline-none focus:border-shopee-orange"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    required
                  />
                  <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Số Điện Thoại *</label>
                <div className="relative">
                  <input 
                    type="tel" 
                    placeholder="Ví dụ: 0987654321..." 
                    className="w-full border border-gray-300 rounded-sm px-3 py-2 pl-9 text-xs focus:outline-none focus:border-shopee-orange"
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    required
                  />
                  <Phone className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-500" /> Địa Chỉ Nhận Hàng Nội Địa *
                </label>
                <textarea 
                  rows={2}
                  placeholder="Điền tên đường, số nhà, phường/xã, quận/huyện, tỉnh/thành phố nhận hàng..." 
                  className="w-full border border-gray-300 rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-shopee-orange"
                  value={regAddress}
                  onChange={e => setRegAddress(e.target.value)}
                  required
                />
              </div>

              <div className="text-[11px] text-gray-500 leading-relaxed bg-blue-50/55 p-2.5 rounded border border-blue-150/40">
                <strong className="text-blue-700 block mb-0.5">💡 Tự động hóa kết nối Affiliate:</strong>
                Khi bạn bấm mua sản phẩm, hệ thống nạp sẵn hồ sơ giao hàng, giúp trải nghiệm mua sắm trên Shopee/TikTok mượt mà tức thì mà không cần khai báo lại.
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <button 
                  type="button"
                  onClick={() => setShowBuyerRegisterModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-sm text-xs font-bold transition-colors"
                >
                  Bỏ Qua
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-shopee-orange hover:bg-shopee-orange-hover text-white py-2 rounded-sm text-xs font-bold transition-colors shadow-xs"
                >
                  Đăng Ký & Liên Kết
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Direct Gift Authentication Modal */}
      {pendingDirectGift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-md shadow-xl max-w-sm w-full overflow-hidden border border-gray-100"
          >
            <div className="bg-emerald-600 px-4 py-3 text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-10 translate-x-10"></div>
              <h2 className="text-[13px] font-extrabold uppercase flex items-center gap-1.5 relative z-10">
                🎁 Xác Minh Nhận Quà
              </h2>
              <button 
                onClick={() => setPendingDirectGift(null)} 
                className="text-white/80 hover:text-white relative z-10 hover:bg-white/20 p-1 rounded transition-colors"
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="text-center">
                <p className="text-xs text-gray-700 leading-relaxed font-semibold">
                  Món quà <span className="font-bold text-emerald-700">"{pendingDirectGift.title}"</span> cần được xác minh quyền truy cập.
                </p>
                <p className="text-[11px] text-gray-500 mt-1">
                  Vui lòng nhập số điện thoại bạn đã điền lúc nhận quà (hoặc quay vòng quay) để hệ thống kiểm tra quyền.
                </p>
              </div>

              {directGiftError && (
                <div className="bg-red-50 text-red-600 p-2.5 rounded text-xs font-semibold text-center border border-red-100">
                  {directGiftError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" /> Số điện thoại đã đăng ký
                </label>
                <input 
                  type="tel" 
                  placeholder="Nhập số điện thoại..." 
                  className="w-full border border-gray-300 rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  value={directGiftPhone}
                  onChange={e => setDirectGiftPhone(e.target.value)}
                />
              </div>

              <button 
                onClick={handleCheckDirectGiftAccess}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-sm text-xs transition-colors shadow-sm uppercase tracking-wide flex items-center justify-center gap-2"
              >
                Kiểm Tra & Nhận Quà
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        onAddToCart={handleAddToCart}
        onlineProducts={onlineProducts}
      />

      {/* Cart Slider Drawer */}
      <CartDrawer 
        isOpen={showCart} 
        onClose={() => setShowCart(false)} 
        cartItems={cart} 
        onUpdateQuantity={handleUpdateCartQuantity} 
        onRemoveFromCart={handleRemoveFromCart} 
        currentBuyer={currentBuyer} 
        onOpenRegister={() => setShowBuyerRegisterModal(true)} 
        onlineProducts={onlineProducts}
      />

      {/* Public Link Share Modal */}
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
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-full p-1 cursor-pointer transition-colors"
                title="Đóng"
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
                  className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-2 rounded-md flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <img src="https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/Zalo_Official_Logo.svg/1024px-Zalo_Official_Logo.svg.png" className="w-3.5 h-3.5 brightness-0 invert" alt="zalo" />
                  Gửi Zalo
                </button>
                <button 
                  onClick={() => {
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`);
                  }}
                  className="bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold py-2 rounded-md flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <Facebook className="w-3.5 h-3.5 fill-current" />
                  Chia sẻ FB
                </button>
              </div>

              {/* Vercel instructions */}
              <div className="mt-5 bg-orange-50 border border-orange-200 rounded-md p-3">
                 <p className="text-[10px] text-orange-800 font-bold mb-1">⚠️ Quan trọng với hệ thống Vercel:</p>
                 <p className="text-[10px] text-orange-700 leading-relaxed">
                   Nếu khách hàng thấy trang web yêu cầu đăng nhập mật khẩu của Vercel (Vercel Authentication),
                   bạn cần vào <b>Vercel Dashboard</b> &gt; <b>Project Settings</b> &gt; <b>Deployment Protection</b> &gt; <b>Vercel Authentication</b> và chọn nút gạt để <b>Tắt (Disable)</b>.
                 </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Terms of Service Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowTermsModal(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full mx-auto relative overflow-hidden flex flex-col max-h-[85vh]"
            >
              <button 
                onClick={() => setShowTermsModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-full p-1 cursor-pointer transition-colors"
                title="Đóng"
              >
                <XCircle className="w-6 h-6" />
              </button>

              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b">Điều Khoản Dịch Vụ & Tuân Thủ Pháp Luật</h2>
              
              <div className="overflow-y-auto pr-2 space-y-4 text-sm text-gray-700 leading-relaxed custom-scrollbar flex-1">
                <p>
                  Chào mừng bạn đến với sàn thương mại điện tử đa người bán của chúng tôi. Bằng việc truy cập, tham gia hệ thống tiếp thị liên kết (Affiliate) hoặc kinh doanh mở gian hàng trên website này, bạn đồng ý tuân thủ các quy định dưới đây. Các điều khoản này được xây dựng dựa trên pháp luật Việt Nam về Thương Mại Điện Tử (Nghị định 52/2013/NĐ-CP, Nghị định 85/2021/NĐ-CP).
                </p>

                <div>
                  <h3 className="font-bold text-gray-900 mb-1">1. Đối với Người Bán & Quản trị viên (Cửa hàng liên kết):</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Bạn hoàn toàn chịu trách nhiệm về nội dung, tính pháp lý, và chất lượng sản phẩm dịch vụ liên kết.</li>
                    <li>Nghiêm cấm việc mua bán, quảng cáo quảng bá các sản phẩm bị cấm kinh doanh theo quy định của pháp luật Việt Nam: vũ khí, pháo nổ, ma túy, động vật hoang dã trái phép, và các sản phẩm gây kích động bạo lực.</li>
                    <li>Thông tin hiển thị phải trung thực, minh bạch, có cảnh báo an toàn rõ ràng (Ví dụ: Thực phẩm chức năng, đồ dùng trẻ em).</li>
                    <li>Sàn có quyền (kiểm duyệt bởi hệ thống Quản Trị Hệ Thống Tối Cao hoặc quản lý cấp cao) ẩn/xóa những sản phẩm/link vi phạm mà không cần báo trước.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-1">2. Đối với Nội dung truyền thông & Hình ảnh:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Tuyệt đối không đăng tải video, hình ảnh đồi trụy, trái với thuần phong mỹ tục Việt Nam.</li>
                    <li>Nghiêm cấm các nội dung mang tính phân biệt chủng tộc, tôn giáo, phản động, hoặc thông tin sai lệch gây hoang mang dư luận.</li>
                    <li>Sẽ thu hồi quyền quản trị và xóa link liên kết nếu phát hiện vi phạm bản quyền trắng trợn hoặc lừa đảo.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-1">3. Giới hạn Trách nhiệm của Sàn Hệ Thống:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Sàn chỉ đóng vai trò nền tảng công nghệ kết nối Người bán (Merchant/Affiliate) và Người mua/Người truy cập thông qua mô hình chia sẻ giao thông (Traffic Hub).</li>
                    <li>Tranh chấp giao dịch, đổi trả hàng hóa, thanh toán sẽ tuân theo bộ quy chuẩn của đối tác cuối cùng (Sh0pee, T1kTok Shop, vv) hoặc được giải quyết trực tiếp giữa người mua và chủ gian hàng độc lập.</li>
                  </ul>
                </div>

                <div className="bg-orange-50 border border-orange-200 p-3 rounded text-xs text-orange-800">
                  <span className="font-bold">Nhấn mạnh từ Quản trị nền tảng:</span> Tính năng kiểm soát quyền ẩn/hiện sản phẩm tập trung giúp chúng tôi bảo vệ một môi trường e-commerce trong sạch và đáng tin cậy. 
                </div>
              </div>

              <div className="mt-5 pt-4 border-t flex justify-end">
                <button 
                  onClick={() => setShowTermsModal(false)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded shadow-sm transition-colors cursor-pointer"
                >
                  Tôi Đã Hiểu & Đồng Ý
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

