import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackTitle?: string;
  priority?: boolean;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  fallbackTitle,
  priority = false,
  ...props
}) => {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        className={`w-full h-full bg-[#F3F4F6] border border-[#E5E7EB] flex flex-col items-center justify-center p-4 text-center ${className}`}
      >
        <div className="w-10 h-10 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#30343B] mb-2 shadow-xs">
          <ImageIcon className="w-5 h-5" />
        </div>
        <span className="text-xs font-semibold text-[#202124]">
          {fallbackTitle || alt || 'Technology Reference'}
        </span>
        <span className="text-[11px] text-[#777777] mt-0.5">
          MARVZ Engineering Hardware
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      className={className}
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
      {...props}
    />
  );
};
