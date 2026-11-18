import React, { useState, useEffect } from 'react';
import { Pause, Play, X, Maximize2 } from 'lucide-react';
import { ALL_PROFILE_GALLERY_PHOTOS, ProfileSlide } from '../data/profileSlideshowData';
import { TechBackdrop } from './TechBackdrop';
import { Reveal } from './Reveal';

export const ProfileMarqueeGallery: React.FC = () => {
  const [userPaused, setUserPaused] = useState(false);
  const [touchPaused, setTouchPaused] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<ProfileSlide | null>(null);

  const isPaused = userPaused || touchPaused || selectedPhoto !== null;

  // Close lightbox on Escape key
  useEffect(() => {
    if (!selectedPhoto) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedPhoto(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedPhoto]);

  const renderCard = (photo: ProfileSlide, isDuplicate: boolean) => (
    <button
      key={`${isDuplicate ? 'dup' : 'orig'}-${photo.id}`}
      type="button"
      tabIndex={isDuplicate ? -1 : 0}
      onClick={() => setSelectedPhoto(photo)}
      aria-label={`Inspect photograph: ${photo.heading}`}
      className="group text-left shrink-0 w-[172px] sm:w-[228px] lg:w-[232px] xl:w-[244px] 2xl:w-[252px] rounded-2xl bg-white border border-[#E5E7EB] hover:border-[#DC2626]/40 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]"
    >
      {/* Fixed Rectangular Visual Frame Preserving Original Aspect Ratio */}
      <div className="relative m-2 mb-0 aspect-[4/3] rounded-xl bg-[#FAFAFB] border border-[#F3F4F6] overflow-hidden flex items-center justify-center p-1.5">
        <img
          src={photo.imageUrl}
          alt={photo.altText}
          width={photo.aspectWidth}
          height={photo.aspectHeight}
          loading="eager"
          decoding="async"
          draggable={false}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain rounded-lg transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
        />
        <span
          aria-hidden="true"
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 border border-[#E5E7EB] text-[#30343B] opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-xs"
        >
          <Maximize2 className="w-3 h-3" />
        </span>
      </div>

      {/* Clean Unboxed Card Metadata & Title */}
      <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between gap-1">
        <div className="text-[10px] sm:text-[11px] font-mono font-semibold text-[#DC2626] truncate">
          {photo.sectionLabel}
        </div>
        <h4 className="text-xs sm:text-[13px] font-bold text-[#202124] leading-snug line-clamp-2">
          {photo.heading}
        </h4>
      </div>
    </button>
  );

  return (
    <div
      id="organizational-photo-marquee"
      className="relative overflow-hidden mt-16 pt-14 border-t border-[#E5E7EB] bg-[#FFFFFF]"
    >
      <TechBackdrop variant="architecture" />

      {/* Header Row */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-1.5">
              <div className="text-xs font-mono uppercase tracking-wider text-[#DC2626] font-semibold">
                Organizational Photo Stream · Live Hardware &amp; Field Highlights
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#202124] tracking-tight text-balance">
                MARVZ &amp; Innovation Tech Across Labs, Drones &amp; Classrooms
              </h3>
              <p className="text-xs sm:text-sm text-[#777777] leading-relaxed">
                Continuous visual showcase spanning organizational workbenches, UAV engineering, humanoid robotics,
                creator mentorship, and institutional delegations. Hover or tap any photograph to pause and inspect.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
              <span className="text-xs font-mono text-[#777777] tabular-nums">
                {ALL_PROFILE_GALLERY_PHOTOS.length} Original Photos
              </span>
              <button
                type="button"
                onClick={() => setUserPaused((p) => !p)}
                aria-pressed={userPaused}
                aria-label={userPaused ? 'Resume horizontal gallery movement' : 'Pause horizontal gallery movement'}
                className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-xl border border-[#E5E7EB] bg-[#F3F4F6] hover:bg-[#E5E7EB] text-xs font-semibold text-[#202124] transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]"
              >
                {userPaused ? (
                  <>
                    <Play className="w-3.5 h-3.5 text-[#DC2626]" />
                    <span>Resume Motion</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-3.5 h-3.5 text-[#30343B]" />
                    <span>Pause Gallery</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Full-Width Seamless Infinite Horizontal Marquee Viewport */}
      <div
        className="relative z-10 marvz-marquee-viewport py-2 select-none"
        role="region"
        aria-label="MARVZ & INNOVATION TECH moving organizational photograph gallery"
        onTouchStart={() => setTouchPaused(true)}
        onTouchEnd={() => setTouchPaused(false)}
        onTouchCancel={() => setTouchPaused(false)}
      >
        {/* Subtle left/right edge fade masks for seamless gallery framing */}
        <div
          aria-hidden="true"
          className="hidden sm:block pointer-events-none absolute inset-y-0 left-0 w-10 md:w-16 z-20 bg-gradient-to-r from-white to-transparent"
        />
        <div
          aria-hidden="true"
          className="hidden sm:block pointer-events-none absolute inset-y-0 right-0 w-10 md:w-16 z-20 bg-gradient-to-l from-white to-transparent"
        />

        {/* Single Horizontal Track: Primary Sequence + Exact Duplicate Sequence for Seamless -50% Loop */}
        <div className="marvz-marquee-track" data-paused={isPaused ? 'true' : 'false'}>
          <div className="flex shrink-0 items-stretch gap-4 sm:gap-5 lg:gap-6 pr-4 sm:pr-5 lg:pr-6">
            {ALL_PROFILE_GALLERY_PHOTOS.map((photo) => renderCard(photo, false))}
          </div>
          <div
            aria-hidden="true"
            className="marvz-marquee-duplicate flex shrink-0 items-stretch gap-4 sm:gap-5 lg:gap-6 pr-4 sm:pr-5 lg:pr-6"
          >
            {ALL_PROFILE_GALLERY_PHOTOS.map((photo) => renderCard(photo, true))}
          </div>
        </div>
      </div>

      {/* Interactive Lightbox Modal for Inspecting Selected Photograph */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs"
          onClick={() => setSelectedPhoto(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="marquee-lightbox-title"
        >
          <div
            className="relative w-full max-w-2xl rounded-2xl bg-white border border-[#E5E7EB] shadow-xl p-5 sm:p-6 text-[#202124] animate-marvz-panel-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              aria-label="Close photograph preview"
              className="absolute top-4 right-4 p-2 rounded-lg text-[#777777] hover:text-[#202124] hover:bg-[#F3F4F6] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pr-10 mb-4 space-y-1">
              <div className="text-xs font-mono uppercase tracking-wider text-[#DC2626] font-semibold">
                {selectedPhoto.sectionLabel} · Profile Page {selectedPhoto.pdfPage}
              </div>
              <h4 id="marquee-lightbox-title" className="text-xl font-bold text-[#202124] leading-snug">
                {selectedPhoto.heading}
              </h4>
            </div>

            <div className="rounded-xl bg-[#FAFAFB] border border-[#E5E7EB] p-2 sm:p-3 mb-4 aspect-[16/10] flex items-center justify-center overflow-hidden">
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.altText}
                width={selectedPhoto.aspectWidth}
                height={selectedPhoto.aspectHeight}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>

            <p className="text-xs sm:text-sm text-[#777777] leading-relaxed">
              {selectedPhoto.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
