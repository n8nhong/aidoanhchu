/**
 * Published Products Tracker UI Component
 * Hiển thị và quản lý sản phẩm đã đăng
 */

import React, { useState, useEffect } from 'react';
import { PublishedProduct, getTrackerInstance } from '../utils/publishedProductsTracker';
import { verifyProductInfo, generateVerificationSummary } from '../utils/productVerification';
import { Trash2, RefreshCw, CheckCircle, AlertCircle, Clock, Eye, Copy, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PublishedProductsTrackerProps {
  onRefresh?: () => void;
}

export function PublishedProductsTracker({ onRefresh }: PublishedProductsTrackerProps) {
  const [publishedProducts, setPublishedProducts] = useState<PublishedProduct[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const tracker = getTrackerInstance();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    const products = tracker.getAllProducts();
    setPublishedProducts(products);
  };

  const sources = Array.from(new Set(publishedProducts.map(p => p.csvSource)));
  const filtered = selectedSource === 'all'
    ? publishedProducts
    : publishedProducts.filter(p => p.csvSource === selectedSource);

  const handleVerify = async (product: PublishedProduct) => {
    setVerifyingId(product.id);
    try {
      const result = await verifyProductInfo(
        product.shopeeLink,
        product.productName,
        product.imageUrl,
        product.description
      );

      tracker.updateVerificationStatus(
        product.id,
        result.status as 'verified' | 'mismatch' | 'not_checked',
        result.message,
        result.details ? {
          title: result.details.shopeeTitle,
          image: result.details.shopeeImage,
          description: result.details.shopeeDescription
        } : undefined
      );

      loadProducts();
    } catch (error) {
      console.error('Verification error:', error);
    } finally {
      setVerifyingId(null);
    }
  };

  const handleDelete = (productId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi lịch sử?')) {
      tracker.deleteProduct(productId);
      loadProducts();
    }
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    alert('✅ Đã copy link affiliate');
  };

  const getStatusBadge = (product: PublishedProduct) => {
    if (product.status === 'failed') {
      return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">❌ Thất bại</span>;
    }
    if (!product.verificationStatus || product.verificationStatus === 'not_checked') {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded">⏳ Chưa kiểm tra</span>;
    }
    if (product.verificationStatus === 'verified') {
      return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">✅ Verified</span>;
    }
    return <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded">⚠️ Không khớp</span>;
  };

  return (
    <div className="space-y-4 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            📋 Lịch Sử Sản Phẩm Đã Đăng
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Theo dõi và kiểm tra các sản phẩm đã publish thành công
          </p>
        </div>
        <button
          onClick={() => {
            loadProducts();
            onRefresh?.();
          }}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Làm mới
        </button>
      </div>

      {publishedProducts.length === 0 ? (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-600">Chưa có sản phẩm nào được đăng</p>
          <p className="text-xs text-gray-500 mt-1">Chạy Auto Publish từ CSV để thêm sản phẩm vào lịch sử</p>
        </div>
      ) : (
        <>
          {/* Filter by Source */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedSource('all')}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
                selectedSource === 'all'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả ({publishedProducts.length})
            </button>
            {sources.map(source => (
              <button
                key={source}
                onClick={() => setSelectedSource(source)}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
                  selectedSource === source
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {source.replace('_', ' ')} ({publishedProducts.filter(p => p.csvSource === source).length})
              </button>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="text-xs text-green-600 font-bold">Verified</div>
              <div className="text-2xl font-black text-green-700">
                {filtered.filter(p => p.verificationStatus === 'verified').length}
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="text-xs text-yellow-600 font-bold">Chưa kiểm tra</div>
              <div className="text-2xl font-black text-yellow-700">
                {filtered.filter(p => !p.verificationStatus || p.verificationStatus === 'not_checked').length}
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="text-xs text-orange-600 font-bold">Không khớp</div>
              <div className="text-2xl font-black text-orange-700">
                {filtered.filter(p => p.verificationStatus === 'mismatch').length}
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="text-xs text-red-600 font-bold">Thất bại</div>
              <div className="text-2xl font-black text-red-700">
                {filtered.filter(p => p.status === 'failed').length}
              </div>
            </div>
          </div>

          {/* Products List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {filtered.map(product => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition"
                >
                  {/* Header */}
                  <button
                    onClick={() => setExpandedId(expandedId === product.id ? null : product.id)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div>
                          <img
                            src={product.imageUrl}
                            alt={product.productName}
                            className="w-10 h-10 rounded object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=Img';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 truncate text-sm">
                            {product.productName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {product.csvSource} • {new Date(product.publishedAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      {getStatusBadge(product)}
                      <Eye className="w-4 h-4 text-gray-400" />
                    </div>
                  </button>

                  {/* Details */}
                  <AnimatePresence>
                    {expandedId === product.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-200 bg-gray-50 px-4 py-3 space-y-3"
                      >
                        {/* Links */}
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs font-bold text-gray-600 mb-1">🔗 Link Shopee:</p>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={product.shopeeLink}
                                readOnly
                                className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-xs font-mono text-gray-600"
                              />
                              <button
                                onClick={() => handleCopyLink(product.shopeeLink)}
                                className="px-2 py-1 bg-cyan-100 hover:bg-cyan-200 rounded text-cyan-700 text-xs font-bold"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                              <a
                                href={product.shopeeLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 bg-orange-100 hover:bg-orange-200 rounded text-orange-700 text-xs font-bold"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs font-bold text-gray-600 mb-1">🎯 Affiliate Link:</p>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={product.affiliateLink}
                                readOnly
                                className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-xs font-mono text-gray-600"
                              />
                              <button
                                onClick={() => handleCopyLink(product.affiliateLink)}
                                className="px-2 py-1 bg-cyan-100 hover:bg-cyan-200 rounded text-cyan-700 text-xs font-bold"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <p className="text-xs font-bold text-gray-600 mb-1">📝 Mô tả:</p>
                          <p className="text-xs text-gray-700 bg-white border border-gray-200 rounded p-2 max-h-24 overflow-y-auto">
                            {product.description.substring(0, 200)}
                            {product.description.length > 200 ? '...' : ''}
                          </p>
                        </div>

                        {/* Verification */}
                        {product.verificationStatus === 'mismatch' && product.verificationMessage && (
                          <div className="bg-orange-50 border border-orange-200 rounded p-2">
                            <p className="text-xs font-bold text-orange-800 flex items-center gap-1 mb-1">
                              <AlertCircle className="w-3 h-3" />
                              {product.verificationMessage}
                            </p>
                            {product.shopeeProductTitle && (
                              <p className="text-xs text-gray-700 mt-1">
                                <strong>Shopee Title:</strong> {product.shopeeProductTitle.substring(0, 100)}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVerify(product)}
                            disabled={verifyingId === product.id}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded text-xs font-bold flex items-center gap-1"
                          >
                            {verifyingId === product.id ? (
                              <>
                                <span className="animate-spin">⏳</span>
                                Kiểm tra...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-3 h-3" />
                                Verify Info
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-bold flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Xóa
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}
