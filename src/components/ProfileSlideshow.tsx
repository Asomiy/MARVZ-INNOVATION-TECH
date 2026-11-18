import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { ProfileSlide } from '../data/profileSlideshowData';

interface ProfileSlideshowProps {
  slides: ProfileSlide[];
  autoPlayMs?: number;
  aspectClassName?: string;
  compact?: boolean;
  ariaLabel?: string;
}

export const ProfileSlideshow: React.FC<ProfileSlideshowProps> = ({
  slides,
  autoPlayMs = 4500,
  aspectClassName = 'aspect-[16/10]',
  compact = false,
  ariaLabel = 'Organizational profile photo slideshow',
}) => {
  const totalSlides = slides.length;
  const hasMultipleSlides = totalSlides > 1;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [transitionDir, setTransitionDir] = useState<'next' | 'prev'>('next');

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Sync prefers-reduced-motion media query
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Pause autoplay when browser tab is backgrounded
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onVisibility = () => setIsTabHidden(document.visibilityState === 'hidden');
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // Clamp index if slides array updates
  useEffect(() => {
    if (currentIndex >= totalSlides && totalSlides > 0) {
      setCurrentIndex(0);
    }
  }, [currentIndex, totalSlides]);

  const goToNext = useCallback(() => {
    if (!hasMultipleSlides) return;
    setTransitionDir('next');
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [hasMultipleSlides, totalSlides]);

  const goToPrev = useCallback(() => {
    if (!hasMultipleSlides) return;
    setTransitionDir('prev');
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [hasMultipleSlides, totalSlides]);

  const goToIndex = useCallback(
    (index: number) => {
      if (!hasMultipleSlides || index === currentIndex) return;
      setTransitionDir(index > currentIndex ? 'next' : 'prev');
      setCurrentIndex(index);
    },
    [hasMultipleSlides, currentIndex]
  );

  // Effective autoplay state: active only for multi-slide sets, not paused by user, not hovered/focused/hidden, and not reduced-motion
  const isAutoplayActive =
    hasMultipleSlides &&
    !userPaused &&
    !isHovered &&
    !isFocused &&
    !isTabHidden &&
    !prefersReducedMotion;

  useEffect(() => {
    if (!isAutoplayActive) return;
    const timer = window.setInterval(() => {
      setTransitionDir('next');
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, autoPlayMs);
    return () => window.clearInterval(timer);
  }, [isAutoplayActive, autoPlayMs, totalSlides]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!hasMultipleSlides || e.touches.length !== 1) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!hasMultipleSlides || touchStartX.current === null || touchStartY.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = endX - touchStartX.current;
    const diffY = endY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;

    // Only trigger slide change on deliberate horizontal swipe
    if (Math.abs(diffX) >= 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!hasMultipleSlides) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goToNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goToPrev();
    } else if (e.key === ' ') {
      e.preventDefault();
      setUserPaused((p) => !p);
    }
  };

  if (totalSlides === 0) return null;

  const activeSlide = slides[currentIndex];
  const formatCounter = (n: number) => String(n).padStart(2, '0');

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setIsFocused(false);
        }
      }}
      className="group/slider rounded-2xl bg-white border border-[#E5E7EB] shadow-xs overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2"
    >
      {/* Subtle top corporate red bar */}
      <div className="h-[2px] w-full bg-[#DC2626]" aria-hidden="true" />

      {/* Viewport Stage — fixed aspect ratio prevents layout shift; object-contain preserves full uncropped original photos */}
      <div
        className={`relative w-full ${aspectClassName} bg-[#F3F4F6] border-b border-[#E5E7EB] overflow-hidden select-none`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {slides.map((slide, idx) => {
          const isCurrent = idx === currentIndex;
          const inactiveTranslate =
            transitionDir === 'next' ? '-translate-x-3' : 'translate-x-3';
          return (
            <div
              key={slide.id}
              aria-hidden={!isCurrent}
              className={`absolute inset-0 flex items-center justify-center p-2 sm:p-3 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isCurrent
                  ? 'opacity-100 translate-x-0 z-10'
                  : `opacity-0 ${inactiveTranslate} z-0 pointer-events-none`
              }`}
            >
              <img
                src={slide.imageUrl}
                alt={slide.altText}
                width={slide.aspectWidth}
                height={slide.aspectHeight}
                loading={idx === 0 ? 'eager' : 'lazy'}
                decoding="async"
                draggable={false}
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
          );
        })}

        {/* Slide Index Indicator (Top Left) */}
        <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-md bg-white/95 border border-[#E5E7EB] shadow-xs text-[11px] font-mono font-semibold text-[#202124] tabular-nums">
          {formatCounter(currentIndex + 1)} / {formatCounter(totalSlides)}
        </div>

        {/* Play / Pause Toggle (Top Right) */}
        <button
          type="button"
          onClick={() => hasMultipleSlides && setUserPaused((p) => !p)}
          disabled={!hasMultipleSlides}
          aria-pressed={userPaused}
          aria-label={
            !hasMultipleSlides
              ? 'Single organizational showcase photograph'
              : userPaused
                ? 'Resume slideshow autoplay'
                : 'Pause slideshow autoplay'
          }
          title={
            !hasMultipleSlides
              ? 'Featured photograph'
              : userPaused
                ? 'Resume Autoplay'
                : 'Pause Autoplay'
          }
          className="absolute top-3 right-3 z-20 inline-flex items-center gap-1.5 min-h-[34px] px-2.5 py-1 rounded-lg bg-white/95 hover:bg-white border border-[#E5E7EB] hover:border-[#30343B]/40 shadow-xs text-[11px] font-semibold text-[#202124] disabled:opacity-60 disabled:cursor-default transition-colors"
        >
          {userPaused || !hasMultipleSlides || prefersReducedMotion ? (
            <>
              <Play className="w-3 h-3 text-[#DC2626]" />
              <span>{hasMultipleSlides ? (prefersReducedMotion ? 'Reduced Motion' : 'Play') : 'Featured'}</span>
            </>
          ) : (
            <>
              <Pause className="w-3 h-3 text-[#30343B]" />
              <span>{isHovered || isFocused ? 'Paused' : 'Auto'}</span>
            </>
          )}
        </button>

        {/* Previous / Next Controls */}
        <button
          type="button"
          onClick={goToPrev}
          disabled={!hasMultipleSlides}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 hover:bg-[#30343B] text-[#202124] hover:text-white border border-[#E5E7EB] hover:border-[#30343B] shadow-sm flex items-center justify-center transition-colors disabled:opacity-40 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={goToNext}
          disabled={!hasMultipleSlides}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 hover:bg-[#30343B] text-[#202124] hover:text-white border border-[#E5E7EB] hover:border-[#30343B] shadow-sm flex items-center justify-center transition-colors disabled:opacity-40 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Caption & Pagination Controls */}
      <div className={`${compact ? 'p-4 sm:p-5' : 'p-5 sm:p-6'} bg-white space-y-4`}>
        <div className="space-y-1.5 min-h-[76px]">
          <div className="flex items-center justify-between gap-3 text-[11px] font-mono uppercase tracking-wider text-[#DC2626] font-semibold">
            <span>{activeSlide.sectionLabel}</span>
            <span className="text-[#777777] font-normal">Profile · Page {activeSlide.pdfPage}</span>
          </div>
          <h4 className="text-base sm:text-lg font-bold text-[#202124] leading-snug">
            {activeSlide.heading}
          </h4>
          <p className="text-xs sm:text-sm text-[#777777] leading-relaxed">
            {activeSlide.description}
          </p>
        </div>

        {/* Bottom Interactive Controls Bar */}
        <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between gap-4">
          {/* Pagination Dots */}
          <div className="flex items-center gap-2" role="tablist" aria-label="Slide pagination">
            {slides.map((slide, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-current={isActive ? 'true' : undefined}
                  aria-label={`Go to slide ${idx + 1}: ${slide.heading}`}
                  onClick={() => goToIndex(idx)}
                  className="p-1.5 -m-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] rounded"
                >
                  <span
                    className={`block h-2 rounded-full transition-all duration-300 ${
                      isActive
                        ? 'w-7 bg-[#DC2626]'
                        : 'w-2 bg-[#D1D5DB] hover:bg-[#9CA3AF]'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Compact Next/Prev & Play/Pause Actions */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={goToPrev}
              disabled={!hasMultipleSlides}
              aria-label="Previous photograph"
              className="p-2 rounded-lg border border-[#E5E7EB] bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#202124] disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => hasMultipleSlides && setUserPaused((p) => !p)}
              disabled={!hasMultipleSlides}
              aria-label={userPaused ? 'Play slideshow' : 'Pause slideshow'}
              className="px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[11px] font-semibold text-[#202124] disabled:opacity-50 disabled:pointer-events-none inline-flex items-center gap-1 transition-colors"
            >
              {userPaused ? (
                <>
                  <Play className="w-3 h-3 text-[#DC2626]" />
                  <span>Play</span>
                </>
              ) : (
                <>
                  <Pause className="w-3 h-3 text-[#30343B]" />
                  <span>Pause</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={goToNext}
              disabled={!hasMultipleSlides}
              aria-label="Next photograph"
              className="p-2 rounded-lg border border-[#E5E7EB] bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#202124] disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
