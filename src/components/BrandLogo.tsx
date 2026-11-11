import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
  theme?: 'dark' | 'light';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  showTagline = false,
  className = '',
  theme = 'dark',
}) => {
  // Proportions and dimensions for the official emblem
  const logoDimensions = {
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
  }[size];

  const titleSizes = {
    sm: 'text-sm sm:text-base font-extrabold tracking-tight',
    md: 'text-base sm:text-lg font-extrabold tracking-tight',
    lg: 'text-xl sm:text-2xl font-extrabold tracking-tight',
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official Emblem Container: Preserves original proportions, never distorted */}
      <div
        className={`${logoDimensions} rounded-xl overflow-hidden bg-[#081426] border border-slate-700/80 shadow-md shrink-0 flex items-center justify-center p-0.5 group-hover:border-[#06B6D4]/50 transition-colors`}
      >
        <img
          src="/assets/aistudio/Capture.JPG11_7f7b0bf9.JPG"
          alt="MARVZ & INNOVATION TECH Official Logo"
          className="w-full h-full object-contain object-center"
          loading="eager"
        />
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <span
            className={`${titleSizes} ${
              theme === 'light' ? 'text-[#081426]' : 'text-white'
            } whitespace-nowrap leading-tight transition-colors`}
          >
            MARVZ & INNOVATION TECH
          </span>
          {showTagline && (
            <span
              className={`text-[10px] font-mono tracking-wider uppercase mt-0.5 ${
                theme === 'light' ? 'text-[#2563EB]' : 'text-[#06B6D4]'
              }`}
            >
              Think Beyond. Build Tomorrow.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
