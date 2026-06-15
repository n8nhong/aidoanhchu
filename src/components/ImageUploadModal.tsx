import React, { useState } from 'react';
import { AlertCircle, CheckCircle, XCircle, Loader2, Upload, Lock } from 'lucide-react';
import { uploadImageWithProductBinding } from '../utils/imageUploadHandler';

interface ImageUploadModalProps {
  productId: string;
  productName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (imageUrl: string) => void;
  supabase: any;
}

export function ImageUploadModal({
  productId,
  productName,
  isOpen,
  onClose,
  onSuccess,
  supabase
}: ImageUploadModalProps) {
  const [preview, setPreview] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setErrorMsg('❌ File quá lớn (max 5MB)');
      return;
    }

    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      setErrorMsg('❌ File phải là ảnh (JPG, PNG, WebP, etc.)');
      return;
    }

    setFile(selectedFile);
    setErrorMsg('');

    // Generate preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus('uploading');
    setErrorMsg('');
    setProgress(0);

    try {
      await uploadImageWithProductBinding(
        file,
        productId,
        supabase,
        (percent, message) => {
          setProgress(percent);
          console.log(`${percent}% - ${message}`);
        }
      );

      setStatus('success');
      
      // Get the uploaded image URL
      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(`products/${productId}/img_${productId}_${Date.now()}.${file.name.split('.').pop()}`);

      setTimeout(() => {
        onSuccess(data.publicUrl);
        onClose();
      }, 1500);
    } catch (error: any) {
      setStatus('error');
      setErrorMsg(error.message || 'Upload failed');
      setProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full space-y-5 p-6 md:p-8">
        {/* Header */}
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Upload className="w-6 h-6 text-blue-600" />
            Tải Ảnh Lên Sản Phẩm
          </h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1">
            <p className="text-sm font-bold text-gray-700">
              ✅ Sản phẩm: <span className="text-blue-600">{productName}</span>
            </p>
            <p className="text-xs text-gray-600 font-mono">ID: {productId}</p>
          </div>
        </div>

        {/* Preview */}
        {preview && (
          <div className="border-2 border-blue-300 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-cyan-50 space-y-3">
            <p className="text-sm font-bold text-gray-700">📸 Xem Trước:</p>
            <img
              src={preview}
              alt="Preview"
              className="w-full h-64 object-cover rounded-lg shadow-md"
            />
            <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
              <div className="bg-white p-2 rounded border border-gray-200">
                <p className="font-bold text-gray-700">📦 File</p>
                <p className="truncate">{file?.name}</p>
              </div>
              <div className="bg-white p-2 rounded border border-gray-200">
                <p className="font-bold text-gray-700">💾 Size</p>
                <p>{((file?.size || 0) / 1024 / 1024).toFixed(2)}MB</p>
              </div>
              <div className="bg-white p-2 rounded border border-gray-200">
                <p className="font-bold text-gray-700">🎨 Type</p>
                <p>{file?.type.split('/')[1]}</p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Input */}
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={status === 'uploading'}
          />
          {!preview && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Chọn ảnh hoặc kéo thả vào đây</p>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {status === 'uploading' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-sm font-bold text-blue-700">Đang upload...</span>
              </div>
              <span className="text-sm font-bold text-blue-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Status Messages */}
        {status === 'success' && (
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-green-700">✅ Upload thành công!</p>
              <p className="text-xs text-green-600">Ảnh đã được lưu và bind với sản phẩm này</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 flex items-start gap-3">
            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-700">❌ Lỗi</p>
              <p className="text-xs text-red-600 mt-1 whitespace-pre-wrap">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Warning */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-700 space-y-1">
            <p className="font-bold">⚠️ Quan Trọng - Ngăn Nhầm Ảnh:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-1">
              <li><strong>Ảnh sẽ bind riêng</strong> với sản phẩm: <strong>{productName}</strong></li>
              <li><strong>Hash ảnh được lưu</strong> - Nếu upload ảnh trùng, sẽ báo lỗi ngay</li>
              <li><strong>Không thể sửa sau upload</strong> (bảo vệ tính toàn vẹn dữ liệu)</li>
              <li><strong>Max 5MB/ảnh</strong> - Chỉ hỗ trợ file hình ảnh</li>
            </ul>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={status === 'uploading'}
            className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || status === 'uploading' || status === 'success'}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {status === 'uploading' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang tải... ({progress}%)
              </>
            ) : status === 'success' ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Thành công
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Xác Nhận Upload
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-center text-gray-500 border-t border-gray-200 pt-4">
          💡 Tip: Upload ảnh chất lượng cao để kết quả được tốt nhất
        </p>
      </div>
    </div>
  );
}
