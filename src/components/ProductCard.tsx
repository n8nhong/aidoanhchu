import React from 'react';
import { Product } from '../types';
import { formatCurrency } from '../utils';
import { Play } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductCardProps {
  key?: string;
  product: Product;
  onClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  sizeMode?: 'compact' | 'normal' | 'large';
}

export function ProductCard({ product, onClick, onAddToCart, sizeMode = 'normal' }: ProductCardProps) {
  const isCompact = sizeMode === 'compact';
  const isLarge = sizeMode === 'large';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
      className={`bg-white hover:border-shopee-orange border border-transparent transition-all cursor-pointer rounded-sm overflow-hidden flex flex-col h-full group ${
        isCompact ? 'pb-1' : isLarge ? 'pb-3.5' : 'pb-2'
      }`}
      onClick={() => onClick(product)}
    >
      {/* Product Image Area */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img 
          src={product.image} 
          alt={product.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        
        {/* Direct Sale Badge */}
        {product.isDirectProduct && (
          <div className="absolute top-0 left-0 bg-indigo-600 text-white font-bold px-1.5 py-0.5 text-[10px] shadow-sm z-10">
            📦 Shop tự gửi (Zalo)
          </div>
        )}

        {/* Discount Badge */}
        {product.discountPercent > 0 && (
          <div className={`absolute top-0 right-0 bg-[#fce0ce] text-shopee-orange font-bold z-10 flex flex-col items-center shadow-sm ${
            isCompact ? 'px-1 py-0.5 text-[9px]' : 'px-1.5 py-1 text-xs'
          }`}>
            <span>{product.discountPercent}%</span>
            <span className={`uppercase font-semibold text-white bg-shopee-orange px-0.5 rounded-sm shadow-sm ${
              isCompact ? 'text-[8px] mt-0.5' : 'text-[10px] mt-0.5'
            }`}>Giảm</span>
          </div>
        )}
        
        {/* Video Indicator */}
        {product.videoUrl && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white rounded-full p-1 backdrop-blur-sm">
            <Play className="w-4 h-4" fill="currentColor" />
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className={`${isCompact ? 'p-1.5' : 'p-2'} flex border-t border-gray-50 flex-col flex-1`}>
        <h3 className={`${
          isCompact ? 'text-[11px] min-h-[30px]' : isLarge ? 'text-base min-h-[48px]' : 'text-sm min-h-[40px]'
        } text-gray-800 line-clamp-2 leading-snug`}>
          {product.platform === 'tiktok' && <span className="text-[10px] bg-black text-white px-0.5 py-0.2 rounded-sm mr-1 font-semibold">TT</span>}
          {product.platform === 'shopee' && <span className="text-[10px] bg-orange-500 text-white px-0.5 py-0.2 rounded-sm mr-1 font-semibold">SP</span>}
          {product.title}
        </h3>
        
        <div className={`mt-auto ${isCompact ? 'pt-1' : 'pt-2'} flex flex-col gap-0.5`}>
          <div className="flex items-center flex-wrap gap-1.5">
            <span className={`${
              isCompact ? 'text-xs text-shopee-orange font-bold' : isLarge ? 'text-lg text-shopee-orange font-semibold' : 'text-base text-shopee-orange font-medium'
            }`}>{formatCurrency(product.price)}</span>
            {product.discountPercent > 0 && (
              <span className={`text-[#9c9c9c] line-through ${isCompact ? 'text-[9px]' : 'text-xs'}`}>{formatCurrency(product.originalPrice)}</span>
            )}
          </div>
          <div className="flex items-center justify-between mt-1 gap-1">
            <div className={`text-gray-500 ${isCompact ? 'text-[8.5px]' : 'text-[10.5px]'} flex-1 leading-tight line-clamp-1`} title="Tìm hiểu kỹ tại link chi tiết">
              📅 Đăng: {product.postDate || '27/05/2026'}
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className={`text-white bg-shopee-orange rounded-sm shadow-sm hover:bg-shopee-orange-hover transition-colors font-medium cursor-pointer shrink-0 ${
                isCompact ? 'text-[9px] px-1.5 py-0.5' : 'text-xs px-3 py-1'
              }`}
            >
              {isCompact ? '+' : 'Thêm'}
            </button>
          </div>
          <div className="text-[8px] text-gray-400 mt-0.5 text-right select-none leading-none">
            * Nhấp xem & tìm hiểu kỹ ở Link sàn
          </div>
        </div>
      </div>
    </motion.div>
  );
}
