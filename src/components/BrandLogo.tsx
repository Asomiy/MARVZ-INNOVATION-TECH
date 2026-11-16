import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  showTagline = false,
  className = '',
}) => {
  const iconDimensions =
    size === 'sm' ? 'w-9 h-9' : size === 'lg' ? 'w-14 h-14' : 'w-11 h-11';

  const titleClasses =
    size === 'sm'
      ? 'text-xs'
      : size === 'lg'
      ? 'text-base sm:text-lg'
      : 'text-sm';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official MARVZ & INNOVATION TECH Emblem — Original Proportions Preserved */}
      <div
        className={`${iconDimensions} rounded-xl overflow-hidden bg-[#181B20] border border-[#E5E7EB] flex items-center justify-center shrink-0 shadow-xs p-0.5`}
      >
        <img
          src="/assets/aistudio/Capture.JPG11_7f7b0bf9.JPG"
          alt="MARVZ & INNOVATION TECH Official Logo"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Brand Wordmark */}
      {showText && (
        <div className="flex flex-col">
          <span
            className={`${titleClasses} font-bold tracking-tight text-[#202124] leading-tight whitespace-nowrap`}
          >
            MARVZ <span className="text-[#777777] font-semibold">&</span> INNOVATION TECH
          </span>
          {showTagline && (
            <span className="text-[11px] font-medium text-[#777777] tracking-wide leading-tight mt-0.5">
              Think Beyond. Build Tomorrow.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
