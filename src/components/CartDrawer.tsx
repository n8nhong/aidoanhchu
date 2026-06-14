import React from 'react';
import { Product, Buyer } from '../types';
import { formatCurrency } from '../utils';
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, newQty: number) => void;
  onRemoveFromCart: (productId: string) => void;
  currentBuyer: Buyer | null;
  onOpenRegister: () => void;
  onlineProducts?: any[];
}

export function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveFromCart,
  currentBuyer,
  onOpenRegister,
  onlineProducts = []
}: CartDrawerProps) {
  const totalAmount = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-screen max-w-md bg-white flex flex-col h-full shadow-2xl relative"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-red-500 to-shopee-orange text-white">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  <h2 className="text-base font-bold">Giỏ Hàng Tiếp Thị ({totalItems})</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-white/15 rounded-full text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4">
                    <div className="w-16 h-16 bg-orange-50 text-shopee-orange rounded-full flex items-center justify-center mb-4">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-800">Giỏ hàng của bạn đang trống!</h3>
                    <p className="text-xs text-gray-400 mt-2 max-w-xs leading-relaxed">
                      Hãy quay lại lướt xem các bộ sưu tập hot, váy xinh, đồ dưỡng da hoặc gợi ý độc quyền của hôm nay để chọn sản phẩm ưng ý.
                    </p>
                    <button
                      onClick={onClose}
                      className="mt-6 bg-shopee-orange text-white text-xs px-5 py-2.5 rounded hover:bg-shopee-orange-hover font-bold transition-all shadow-sm"
                    >
                      Tiếp tục mua sắm
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cartItems.map(({ product, quantity }) => (
                      <div
                        key={product.id}
                        className="flex items-start gap-3 p-3 border border-gray-100 rounded bg-white hover:shadow-xs transition-shadow"
                      >
                        <img
                          src={product.image}
                          alt=""
                          className="w-16 h-16 object-cover rounded border border-gray-100 bg-gray-50 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-gray-800 line-clamp-1 leading-snug">
                            {product.title}
                          </h4>
                          <span className="text-[10px] text-gray-400 font-mono capitalize block mt-0.5">
                            Phân phối: {product.platform}
                          </span>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[13px] text-shopee-orange font-bold">
                              {formatCurrency(product.price)}
                            </span>
                            
                            {/* Quantity selection buttons */}
                            <div className="flex items-center border border-gray-200 rounded overflow-hidden">
                              <button
                                onClick={() => onUpdateQuantity(product.id, Math.max(1, quantity - 1))}
                                className="p-1 hover:bg-gray-100 text-gray-500 transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2.5 text-xs font-bold text-gray-800 bg-gray-50/50">
                                {quantity}
                              </span>
                              <button
                                onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                                className="p-1 hover:bg-gray-100 text-gray-500 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Purge button */}
                        <button
                          onClick={() => onRemoveFromCart(product.id)}
                          className="text-gray-300 hover:text-red-500 p-1 rounded transition-colors self-start"
                          title="Xóa khỏi giỏ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Checkout with affiliate connection guidelines */}
              {cartItems.length > 0 && (
                <div className="border-t border-gray-100 p-4 bg-gray-50/50 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-650 font-medium">Tổng hóa đơn tạm tính:</span>
                    <strong className="text-base text-shopee-orange font-black">
                      {formatCurrency(totalAmount)}
                    </strong>
                  </div>

                  {/* Connected profile indicator inside cart */}
                  {currentBuyer ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-150 rounded text-xs text-emerald-800">
                      <div className="font-bold flex items-center gap-1.5 mb-1 text-emerald-900">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animation-pulse"></span>
                        Hồ sơ mua nhận quà:
                      </div>
                      <p className="leading-snug">
                        Khách: <strong>{currentBuyer.fullName}</strong> - {currentBuyer.phoneNumber} <br />
                        Địa chỉ: <span className="text-gray-650">{currentBuyer.address}</span>
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 border border-amber-150 rounded text-xs text-amber-800 space-y-1">
                      <p className="font-bold text-amber-900">💡 Khuyên dùng cho bạn:</p>
                      <p className="leading-relaxed">
                        Bạn chưa đăng ký tài khoản nhận hàng. Hãy thiết lập hồ sơ để hệ thống điền đơn mua tự động khi chuyển sang Shopee/TikTok.
                      </p>
                      <button
                        onClick={() => {
                          onClose();
                          onOpenRegister();
                        }}
                        className="text-[11px] font-bold text-shopee-orange underline hover:text-orange-600 block pt-0.5"
                      >
                        👉 Thiết lập ngay chỉ mất 10s
                      </button>
                    </div>
                  )}

                  <div className="bg-white p-3 rounded border text-[11px] text-gray-500 leading-relaxed">
                    <strong className="text-gray-700 block mb-0.5">ℹ️ Hướng dẫn thanh toán:</strong>
                    Đây là cổng liên kết Gateway. Khi nhấp vào nút bên dưới, hệ thống sẽ mở link mua sắm chính hãng trên sàn và cung cấp dữ liệu gửi quà của bạn đi kèm.
                  </div>

                  {/* Bulk or single checkout redirection */}
                  <div className="space-y-2">
                    {cartItems.map(({ product }) => {
                      const attachedGift = onlineProducts?.find((op: any) => op.id === product.attachedOnlineProductId);
                      return (
                        <div key={product.id} className="p-2 border border-orange-100 rounded bg-orange-50/10 space-y-1.5">
                          <a
                            href={product.affiliateLink}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => {
                              if (attachedGift) {
                                alert(`🎉 NHẬN QUÀ TẶNG KÈM 0đ CỦA SẢN PHẨM!\n\nBạn nhận được phần quà:\n"${attachedGift.title}"\nĐể tải về ngay lập tức, vui lòng bấm nút hoặc truy cập đường link:\n${attachedGift.downloadUrl}\n\nHệ thống đang kết nối chuyển tiếp bạn đến liên kết mua sắm gốc.`);
                              }
                            }}
                            className="w-full bg-shopee-orange hover:bg-shopee-orange-hover text-white text-xs py-2.5 px-3 rounded font-bold flex items-center justify-between transition-colors shadow-xs"
                          >
                            <span className="truncate max-w-[200px]">Mua "{product.title}"</span>
                            <span className="flex items-center gap-1 text-[10px] bg-white/10 px-2 py-0.5 rounded uppercase font-black">
                              {product.platform} <ExternalLink className="w-3 h-3" />
                            </span>
                          </a>

                          {attachedGift && (
                            <div className="p-2 bg-emerald-50 border border-emerald-150 rounded text-[11px] text-emerald-800 space-y-1">
                              <span className="font-extrabold flex items-center gap-1 text-emerald-950">🎁 Quà tặng thu hút số đính kèm (Miễn Phí):</span>
                              <p className="font-semibold text-gray-800 line-clamp-1">{attachedGift.title}</p>
                              <a 
                                href={attachedGift.downloadUrl} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-blue-700 underline font-black font-mono select-all break-all block"
                              >
                                👉 Tải nhanh tài liệu: {attachedGift.downloadUrl}
                              </a>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={onClose}
                    className="w-full text-center text-xs font-bold text-gray-500 hover:text-gray-800 py-1"
                  >
                    Bỏ qua & Xem thêm
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
