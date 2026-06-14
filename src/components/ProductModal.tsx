import { Product } from '../types';
import { formatCurrency } from '../utils';
import { X, ExternalLink, Share2, Play, Info, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { UniversalVideoPlayer } from './UniversalVideoPlayer';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onlineProducts?: any[];
}

export function ProductModal({ product, onClose, onAddToCart, onlineProducts = [] }: ProductModalProps) {
  const [activeMedia, setActiveMedia] = useState<'image' | 'video'>('video');
  const [isZoomed, setIsZoomed] = useState(false);

  if (!product) return null;

  const hasVideo = !!product.videoUrl;

  const handleBuy = () => {
    const gift = onlineProducts?.find((op: any) => op.id === product.attachedOnlineProductId);
    if (gift) {
      try {
        alert(`🎉 BỘ QUÀ TẶNG SỐ/TÀI LIỆU ĐÃ ĐƯỢC KÍCH HOẠT!\n\nNhận ngay tài liệu quà tặng:\n"${gift.title}"\nLink tải tài liệu tải trực tiếp:\n${gift.downloadUrl}\n\nHệ thống sẽ tự động chuyển hướng bạn sang trang mua sắm chính hãng!`);
      } catch (e) {
        console.warn("Alert blocked in sandbox environment", e);
      }
    }
    try {
      window.open(product.affiliateLink, '_blank');
    } catch (e) {
      console.warn("Popup blocked, trying regular redirection", e);
      try {
        window.location.href = product.affiliateLink;
      } catch (err) {
        console.error("Redirection failed:", err);
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-lg shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
          onClick={e => e.stopPropagation()}
        >
          {/* Media Section */}
          <div className="w-full md:w-1/2 bg-gray-100 flex flex-col relative group shrink-0 h-[35vh] md:h-auto md:max-h-none">
            <button 
              onClick={onClose}
              className="absolute top-2 left-2 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex-1 min-h-0 flex items-center justify-center relative bg-black">
              {hasVideo && activeMedia === 'video' ? (
                <UniversalVideoPlayer url={product.videoUrl!} className="w-full h-full" />
              ) : (
                <img 
                  src={product.image} 
                  alt={product.title} 
                  onClick={() => setIsZoomed(true)}
                  className="w-full h-full object-cover object-top md:object-contain md:object-center bg-white cursor-zoom-in"
                />
              )}
            </div>
            
            {/* Media Toggles */}
            {hasVideo && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                <button 
                  onClick={() => setActiveMedia('video')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1 transition-all ${activeMedia === 'video' ? 'bg-shopee-orange text-white shadow-md' : 'bg-white text-gray-700 shadow-sm'}`}
                >
                  <Play className="w-3 h-3" /> Video
                </button>
                <button 
                  onClick={() => setActiveMedia('image')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1 transition-all ${activeMedia === 'image' ? 'bg-shopee-orange text-white shadow-md' : 'bg-white text-gray-700 shadow-sm'}`}
                >
                  Hình ảnh
                </button>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="w-full md:w-1/2 flex flex-col bg-white overflow-y-auto">
            <div className="flex justify-end p-2 hidden md:flex">
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                {product.platform === 'tiktok' && <span className="text-xs bg-black text-white px-2 py-1 rounded-sm font-semibold">Sản phẩm TikTok</span>}
                {product.platform === 'shopee' && <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-sm font-semibold">Shopee Mall</span>}
                {product.platform === 'lazada' && <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-sm font-semibold">Lazada Mall</span>}
              </div>
              
              <h1 className="text-xl font-medium text-gray-900 leading-tight mb-4">
                {product.title}
              </h1>

              <div className="bg-gray-50 p-4 rounded-md mb-6 border border-gray-100">
                <div className="flex items-end gap-3 mb-2">
                  <span className="text-3xl font-medium text-shopee-orange">{formatCurrency(product.price)}</span>
                  {product.discountPercent > 0 && (
                    <>
                      <span className="text-lg text-gray-400 line-through mb-1">{formatCurrency(product.originalPrice)}</span>
                      <span className="text-xs font-bold text-white bg-shopee-orange px-1.5 py-0.5 rounded-sm mb-1 uppercase">
                        Giảm {product.discountPercent}%
                      </span>
                    </>
                  )}
                </div>
                <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-4 text-sm text-gray-650">
                    <div className="flex items-center gap-1.5">
                      <span className="text-black font-medium">5.0</span>
                      <div className="flex text-yellow-400 text-xs">★★★★★</div>
                    </div>
                    <div className="w-px h-3 bg-gray-300"></div>
                    <div className="text-gray-700 font-medium">📅 Ngày đăng: <span className="text-shopee-orange">{product.postDate || '27/05/2026'}</span></div>
                  </div>
                  <div className="text-[11.5px] text-gray-400 bg-orange-50/30 p-2 rounded-sm border border-dashed border-orange-200 leading-normal text-left">
                    <span className="font-bold text-shopee-orange">💡 Chú ý nghiên cứu kỹ:</span> Khi mua hàng, vui lòng chuyển tiếp qua liên kết Shopee/TikTok/Lazada bên dưới để đọc đánh giá chi tiết, xem livestream và tìm hiểu kỹ hơn tại trang sản phẩm của sàn gốc trước khi đặt hàng.
                  </div>
                </div>
              </div>

              <div className="mb-6 flex-1">
                <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-gray-500" />
                  Chi tiết sản phẩm
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed bg-white text-justify whitespace-pre-line font-medium text-gray-700">
                  {product.description || "Chưa có mô tả chi tiết cho sản phẩm này."}
                </p>
              </div>

              {product.isDirectProduct && (
                <div className="mb-6 bg-indigo-50 border border-indigo-100 p-4 rounded-md shadow-sm">
                  <h4 className="font-bold text-indigo-800 text-sm mb-1">📦 Sản phẩm được Shop bán trực tiếp</h4>
                  <p className="text-xs text-indigo-700 leading-relaxed mb-3">Shop có thể giao hàng qua Giao Hàng Tiết Kiệm, Viettel Post, Ninjavan... hoặc qua bưu điện. Bạn vui lòng liên hệ (nhắn tin/gọi) qua Zalo của Shop để chốt đơn, cung cấp địa chỉ và chọn phương thức vận chuyển nhé!</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const phone = localStorage.getItem('admin_zalo') || 'https://zalo.me/';
                        window.open(phone, '_blank');
                      }}
                      className="flex-1 bg-[#0068ff] hover:bg-[#005AE0] text-white py-2.5 px-4 rounded text-sm font-bold shadow transition-colors flex justify-center items-center gap-2 cursor-pointer"
                    >
                      <img src="https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/Zalo_Official_Logo.svg/1024px-Zalo_Official_Logo.svg.png" className="w-4 h-4 brightness-0 invert" alt="zalo" />
                      Nhắn Qua Zalo Mua Hàng
                    </button>
                  </div>
                </div>
              )}

              {product.attachedOnlineProductId && (
                <div className="mb-6 p-3 bg-emerald-50 border border-emerald-150 rounded text-xs text-emerald-800 space-y-1 my-2">
                  <strong className="text-emerald-900 block mb-0.5 flex items-center gap-1">🎁 Nhận Ngay Tài Liệu Quà Tặng 0đ Kèm Theo:</strong>
                  <p className="font-extrabold text-gray-800">{onlineProducts.find((op: any) => op.id === product.attachedOnlineProductId)?.title || 'Sản phẩm trực tuyến'}</p>
                  <p className="text-gray-500 text-[11px]">Bấm nút mua ngay bên dưới, đường dẫn sẽ mở link sản phẩm và tự động kích hoạt link download tài liệu quà tặng này cho bạn!</p>
                  <a 
                    href={onlineProducts.find((op: any) => op.id === product.attachedOnlineProductId)?.downloadUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-blue-700 font-black underline flex items-center gap-1 mt-1 hover:text-blue-800 select-all font-mono"
                  >
                    👉 Tải nhanh quà tặng: {onlineProducts.find((op: any) => op.id === product.attachedOnlineProductId)?.downloadUrl}
                  </a>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-4 border-t border-gray-100 sticky bottom-0 bg-white pb-2 z-10">
                <div className="flex gap-2">
                  <button 

                    onClick={() => {
                      const shareUrl = `${window.location.origin}${window.location.pathname}?product=${product.id}`;
                      if (navigator.share) {
                        navigator.share({
                          title: product.title,
                          text: `Xem ngay sản phẩm: ${product.title}`,
                          url: shareUrl
                        }).catch(console.error);
                      } else {
                        navigator.clipboard.writeText(shareUrl)
                          .then(() => alert('Đã sao chép link sản phẩm!'))
                          .catch(() => alert('Không thể sao chép link!'));
                      }
                    }}
                    className="p-3 border border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50 transition-colors flex items-center justify-center cursor-pointer"
                    title="Chia sẻ sản phẩm"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => {
                      onAddToCart(product);
                      onClose();
                    }}
                    className="p-3 border border-orange-200 text-shopee-orange bg-orange-50 hover:bg-orange-100 rounded-sm transition-colors flex items-center justify-center gap-2 font-bold text-sm cursor-pointer"
                    title="Thêm vào giỏ hàng"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span className="hidden sm:inline">Thêm giỏ hàng</span>
                  </button>
                </div>
                {product.affiliateLink && (
                  <button 
                    onClick={handleBuy}
                    className="flex-1 bg-shopee-orange hover:bg-shopee-orange-hover text-white py-3 px-4 rounded-sm font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <ExternalLink className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Mua tại {product.platform === 'tiktok' ? 'TikTok Shop' : product.platform === 'shopee' ? 'Shopee' : 'Xem liên kết'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
      {isZoomed && (
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="fixed inset-0 z-[60] bg-black/90 flex flex-col items-center justify-center p-4 cursor-zoom-out"
           onClick={() => setIsZoomed(false)}
        >
          <div className="absolute top-4 right-4 text-white p-2 md:hidden">
            <X className="w-8 h-8" />
          </div>
          <img src={product.image} className="max-w-full max-h-full object-contain" alt="Phóng to" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
