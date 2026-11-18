import React, { useEffect, useState } from 'react';

/**
 * Minimal, non-blocking corporate loading indicator using the official MARVZ logo.
 * Runs briefly on initial visit (~480ms), honors prefers-reduced-motion, and stays light
 * so LCP and user interaction are never hindered.
 */
export const BrandedLoader: React.FC = () => {
  const [phase, setPhase] = useState<'active' | 'fading' | 'done'>(() => {
    if (typeof window === 'undefined') return 'done';
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return 'done';
    if (sessionStorage.getItem('marvz_loader_shown')) return 'done';
    return 'active';
  });

  useEffect(() => {
    if (phase !== 'active') return;
    sessionStorage.setItem('marvz_loader_shown', '1');

    const fadeTimer = window.setTimeout(() => setPhase('fading'), 440);
    const doneTimer = window.setTimeout(() => setPhase('done'), 720);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
    };
  }, [phase]);

  if (phase === 'done') return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[70] bg-white/98 backdrop-blur-xs flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300 ${
        phase === 'fading' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-4 px-6">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#181B20] border border-[#E5E7EB] p-1 shadow-sm animate-marvz-hero-in">
          <img
            src="/assets/aistudio/Capture.JPG11_7f7b0bf9.JPG"
            alt="MARVZ & INNOVATION TECH"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="text-center space-y-1">
          <div className="text-xs font-bold tracking-wider uppercase text-[#202124]">
            MARVZ &amp; INNOVATION TECH
          </div>
          <div className="w-36 h-[2px] bg-[#E5E7EB] rounded-full overflow-hidden mx-auto">
            <div className="h-full w-full bg-gradient-to-r from-[#30343B] via-[#DC2626] to-[#30343B] animate-marvz-loader-bar" />
          </div>
        </div>
      </div>
    </div>
  );
};
