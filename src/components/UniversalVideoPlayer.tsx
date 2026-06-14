import React from 'react';
import { Play, ExternalLink, Video } from 'lucide-react';

interface UniversalVideoPlayerProps {
  url: string;
  className?: string;
}

export function UniversalVideoPlayer({ url, className = '' }: UniversalVideoPlayerProps) {
  if (!url) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-900 text-gray-400 p-6 ${className}`}>
        <Video className="w-10 h-10 mb-2 opacity-50" />
        <span className="text-xs">Không có video</span>
      </div>
    );
  }

  const trimmedUrl = url.trim();

  // Helper to extract YouTube video ID
  const getYouTubeId = (urlStr: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = urlStr.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Helper to check Google Drive streamable pattern
  const getDriveId = (urlStr: string) => {
    const match = urlStr.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\//) || 
                  urlStr.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const ytId = getYouTubeId(trimmedUrl);
  const driveId = getDriveId(trimmedUrl);
  const isDirectVideo = trimmedUrl.match(/\.(mp4|webm|ogg|mov|avi|m4v)(\?.*)?$/i) || trimmedUrl.startsWith('data:video/');

  if (ytId) {
    return (
      <div className={`relative overflow-hidden w-full h-full bg-black ${className}`}>
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&rel=0`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full"
        ></iframe>
      </div>
    );
  }

  if (driveId) {
    return (
      <div className={`relative overflow-hidden w-full h-full bg-black ${className}`}>
        <iframe
          src={`https://drive.google.com/file/d/${driveId}/preview`}
          title="Google Drive video player"
          frameBorder="0"
          allow="autoplay"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full"
        ></iframe>
      </div>
    );
  }

  // Handle Facebook Videos
  if (trimmedUrl.includes('facebook.com') || trimmedUrl.includes('fb.watch')) {
    const encodedUrl = encodeURIComponent(trimmedUrl);
    return (
      <div className={`relative overflow-hidden w-full h-full bg-black ${className} flex flex-col justify-between`}>
        <div className="flex-1 w-full h-full flex items-center justify-center relative">
          <iframe
            src={`https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=0&autoplay=1`}
            scrolling="no"
            frameBorder="0"
            allowFullScreen={true}
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            className="absolute top-0 left-0 w-full h-full"
          ></iframe>
        </div>
        <div className="bg-gray-900 p-2 text-center">
          <a
            href={trimmedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:underline"
          >
            Mở video trực tiếp trên Facebook <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  if (isDirectVideo) {
    return (
      <video
        src={trimmedUrl}
        controls
        autoPlay
        muted
        loop
        playsInline
        className={`w-full h-full object-contain bg-black ${className}`}
      />
    );
  }

  // Fallback placeholder for other platforms (TikTok, Instagram, etc.) with a button to open / jump to main page
  const platformName = trimmedUrl.includes('tiktok.com') 
    ? 'TikTok' 
    : trimmedUrl.includes('instagram.com') 
    ? 'Instagram' 
    : 'Nền tảng liên kết';

  return (
    <div className={`relative flex flex-col items-center justify-center text-center bg-gray-950 text-white p-6 ${className}`}>
      <div className="w-16 h-16 rounded-full bg-red-600/10 border border-red-500/30 flex items-center justify-center mb-4 animate-pulse">
        <Play className="w-8 h-8 text-red-500" />
      </div>
      <div>
        <h4 className="text-sm font-bold mb-1">Xem video minh họa sản phẩm</h4>
        <p className="text-[11px] text-gray-400 max-w-xs mx-auto mb-4 leading-normal">
          Video được lưu trữ trên <strong className="text-white">{platformName}</strong>. Hãy bấm nút dưới đây để xem trực tiếp hoặc chuyển hướng đến nội dung gốc.
        </p>
        <button
          onClick={() => {
            try {
              window.open(trimmedUrl, '_blank');
            } catch (err) {
              console.warn("Popup blocked, trying parent redirection", err);
              try {
                window.location.href = trimmedUrl;
              } catch (e) {
                console.error("Redirection failed:", e);
              }
            }
          }}
          className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-750 text-white font-bold text-xs py-2 px-4 rounded-full transition-all shadow-md cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" /> Xem Ngay Trên {platformName}
        </button>
      </div>
    </div>
  );
}
