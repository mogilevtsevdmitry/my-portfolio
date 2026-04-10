'use client';

import { useRef, type CSSProperties, type ReactNode } from 'react';

interface MagnetProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** max pull distance in px */
  strength?: number;
  /** activation radius multiplier — 1 = element bounds, 1.5 = 50% beyond */
  padding?: number;
}

/**
 * Wraps children and tugs them toward the cursor when it's inside
 * the element's proximity box. CSS-only, GPU accelerated.
 */
export function Magnet({
  children,
  className = '',
  style,
  strength = 14,
  padding = 1.3,
}: MagnetProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;
    const rect = wrap.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const activeW = rect.width * padding;
    const activeH = rect.height * padding;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    if (Math.abs(dx) > activeW / 2 || Math.abs(dy) > activeH / 2) {
      inner.style.transform = 'translate(0, 0)';
      return;
    }
    const tx = (dx / (activeW / 2)) * strength;
    const ty = (dy / (activeH / 2)) * strength;
    inner.style.transform = `translate(${tx}px, ${ty}px)`;
  };

  const onLeave = () => {
    const inner = innerRef.current;
    if (inner) inner.style.transform = 'translate(0, 0)';
  };

  return (
    <div
      ref={wrapRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={style}
    >
      <div
        ref={innerRef}
        style={{
          display: 'inline-block',
          willChange: 'transform',
          transition: 'transform 340ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
