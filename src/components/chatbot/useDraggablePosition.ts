import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';

export interface Position {
  x: number;
  y: number;
}

interface UseDraggableOptions {
  elementRef: React.RefObject<HTMLElement | null>;
  storageKey: string;
  getInitialPosition: (dims: {
    width: number;
    height: number;
    viewportWidth: number;
    viewportHeight: number;
  }) => Position;
  fallbackSize: { width: number; height: number };
  edgePadding?: number;
  isActive?: boolean;
  ignoreSelector?: string;
  onDragEnd?: (pos: Position) => void;
}

const DRAG_THRESHOLD_PX = 5;

export function clampToViewport(
  x: number,
  y: number,
  width: number,
  height: number,
  viewportWidth: number,
  viewportHeight: number,
  edgePadding: number = 8
): Position {
  const maxX = Math.max(edgePadding, viewportWidth - width - edgePadding);
  const maxY = Math.max(edgePadding, viewportHeight - height - edgePadding);
  return {
    x: Math.round(Math.min(Math.max(edgePadding, x), maxX)),
    y: Math.round(Math.min(Math.max(edgePadding, y), maxY)),
  };
}

function readSavedPosition(storageKey: string): Position | null {
  try {
    const raw = sessionStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.x === 'number' &&
      Number.isFinite(parsed.x) &&
      typeof parsed.y === 'number' &&
      Number.isFinite(parsed.y)
    ) {
      return { x: parsed.x, y: parsed.y };
    }
  } catch {
    // Ignore storage read failures
  }
  return null;
}

export function useDraggablePosition({
  elementRef,
  storageKey,
  getInitialPosition,
  fallbackSize,
  edgePadding = 8,
  isActive = true,
  ignoreSelector,
  onDragEnd,
}: UseDraggableOptions) {
  const computeInitial = useCallback((): Position => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    const saved = typeof window !== 'undefined' ? readSavedPosition(storageKey) : null;
    const rawPos =
      saved ??
      getInitialPosition({
        width: fallbackSize.width,
        height: fallbackSize.height,
        viewportWidth: vw,
        viewportHeight: vh,
      });

    return clampToViewport(
      rawPos.x,
      rawPos.y,
      fallbackSize.width,
      fallbackSize.height,
      vw,
      vh,
      edgePadding
    );
  }, [storageKey, getInitialPosition, fallbackSize.width, fallbackSize.height, edgePadding]);

  const [position, setPosition] = useState<Position>(computeInitial);
  const [isDragging, setIsDragging] = useState(false);

  const posRef = useRef<Position>(position);
  posRef.current = position;

  const didDragRef = useRef(false);
  const getInitialRef = useRef(getInitialPosition);
  getInitialRef.current = getInitialPosition;
  const onDragEndRef = useRef(onDragEnd);
  onDragEndRef.current = onDragEnd;

  // Measure actual rendered element dimensions & clamp cleanly when active/opened
  useLayoutEffect(() => {
    if (!isActive || typeof window === 'undefined') return;
    const el = elementRef.current;
    const width = el?.offsetWidth || fallbackSize.width;
    const height = el?.offsetHeight || fallbackSize.height;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const saved = readSavedPosition(storageKey);
    const target =
      saved ??
      getInitialRef.current({
        width,
        height,
        viewportWidth: vw,
        viewportHeight: vh,
      });

    const clamped = clampToViewport(target.x, target.y, width, height, vw, vh, edgePadding);
    posRef.current = clamped;
    setPosition(clamped);
  }, [isActive, elementRef, storageKey, fallbackSize.width, fallbackSize.height, edgePadding]);

  // Keep inside visible screen boundaries on window resize or orientation change
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      if (!isActive) return;
      const el = elementRef.current;
      const width = el?.offsetWidth || fallbackSize.width;
      const height = el?.offsetHeight || fallbackSize.height;
      const clamped = clampToViewport(
        posRef.current.x,
        posRef.current.y,
        width,
        height,
        window.innerWidth,
        window.innerHeight,
        edgePadding
      );
      posRef.current = clamped;
      setPosition(clamped);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isActive, elementRef, fallbackSize.width, fallbackSize.height, edgePadding]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      if (ignoreSelector && (e.target as HTMLElement).closest(ignoreSelector)) {
        return;
      }

      const el = elementRef.current;
      const width = el?.offsetWidth || fallbackSize.width;
      const height = el?.offsetHeight || fallbackSize.height;
      const startClientX = e.clientX;
      const startClientY = e.clientY;
      const startPosX = posRef.current.x;
      const startPosY = posRef.current.y;

      didDragRef.current = false;

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const dx = moveEvent.clientX - startClientX;
        const dy = moveEvent.clientY - startClientY;

        if (!didDragRef.current) {
          if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
          didDragRef.current = true;
          setIsDragging(true);
          document.body.style.userSelect = 'none';
        }

        const clamped = clampToViewport(
          startPosX + dx,
          startPosY + dy,
          width,
          height,
          window.innerWidth,
          window.innerHeight,
          edgePadding
        );

        posRef.current = clamped;
        setPosition(clamped);
      };

      const cleanup = () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointercancel', handlePointerUp);
        document.body.style.userSelect = '';
      };

      const handlePointerUp = () => {
        cleanup();

        if (didDragRef.current) {
          try {
            sessionStorage.setItem(storageKey, JSON.stringify(posRef.current));
          } catch {
            // Ignore storage write failures
          }
          onDragEndRef.current?.(posRef.current);
          setIsDragging(false);

          // Prevent immediate click event after drag release from toggling UI
          setTimeout(() => {
            didDragRef.current = false;
          }, 0);
        }
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
    },
    [elementRef, fallbackSize.width, fallbackSize.height, edgePadding, ignoreSelector, storageKey]
  );

  const wasJustDragged = useCallback(() => didDragRef.current, []);

  return {
    position,
    isDragging,
    handlePointerDown,
    wasJustDragged,
  };
}
