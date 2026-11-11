import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackTitle?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  fallbackTitle,
  ...props
}) => {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className={`w-full h-full bg-[#081426] border border-slate-800 flex flex-col items-center justify-center p-4 text-center ${className}`}>
        <div className="w-10 h-10 rounded-xl bg-[#2563EB]/15 border border-[#2563EB]/30 flex items-center justify-center text-[#06B6D4] mb-2">
          <ImageIcon className="w-5 h-5" />
        </div>
        <span className="text-xs font-semibold text-slate-300">
          {fallbackTitle || alt || 'Technology Reference'}
        </span>
        <span className="text-[11px] text-slate-500 mt-0.5">
          Authentic Engineering Imagery
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
      {...props}
    />
  );
};
