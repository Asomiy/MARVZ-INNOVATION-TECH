import React, { useEffect, useRef, useState } from 'react';

interface RevealProps {
  children: React.ReactNode;
  delayMs?: number;
  className?: string;
  yOffset?: number;
}

/**
 * Lightweight IntersectionObserver scroll-reveal wrapper.
 * - Uses compositor-only transform + opacity transitions.
 * - Immediately reveals content if already within viewport or prefers-reduced-motion is set.
 * - Never leaves content trapped invisible on anchor jumps or slow scroll events.
 */
export const Reveal: React.FC<RevealProps> = ({
  children,
  delayMs = 0,
  className = '',
  yOffset = 14,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  });

  useEffect(() => {
    if (isVisible) return;
    const node = ref.current;
    if (!node) {
      setIsVisible(true);
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.96) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight) {
            setIsVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.06, rootMargin: '0px 0px -24px 0px' }
    );

    observer.observe(node);

    // Safety fallback so fast anchor scrolling never hides content
    const safetyTimer = window.setTimeout(() => {
      const currentRect = node.getBoundingClientRect();
      if (currentRect.top < window.innerHeight + 120) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, 900);

    return () => {
      observer.disconnect();
      window.clearTimeout(safetyTimer);
    };
  }, [isVisible]);

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: isVisible ? `${delayMs}ms` : '0ms',
        transform: isVisible ? 'translate3d(0, 0, 0)' : `translate3d(0, ${yOffset}px, 0)`,
      }}
      className={`transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
};
