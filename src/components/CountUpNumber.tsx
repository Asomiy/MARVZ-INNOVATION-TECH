import React, { useEffect, useRef, useState } from 'react';

interface CountUpNumberProps {
  value: number;
  durationMs?: number;
  suffix?: string;
  className?: string;
}

/**
 * Animates genuine numeric counts smoothly once they enter the viewport.
 * Honors prefers-reduced-motion and renders tabular figures for crisp layout stability.
 */
export const CountUpNumber: React.FC<CountUpNumberProps> = ({
  value,
  durationMs = 700,
  suffix = '',
  className = '',
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState<number>(value);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      setDisplayValue(value);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const startAnimation = () => {
      if (hasAnimatedRef.current) return;
      hasAnimatedRef.current = true;
      const startTime = performance.now();

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * value);
        setDisplayValue(current);
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          setDisplayValue(value);
        }
      };

      setDisplayValue(0);
      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          startAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [value, durationMs]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {displayValue}
      {suffix}
    </span>
  );
};
