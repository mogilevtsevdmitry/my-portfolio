'use client';

import { useRef, type CSSProperties, type ReactNode } from 'react';

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** radial gradient radius */
  radius?: number;
  /** rgb triplet for the spotlight tint */
  spotColor?: string;
}

/**
 * Card with a soft radial "spotlight" that follows the mouse.
 * Pairs nicely with glass-card styling for the hero-grid cards.
 */
export function SpotlightCard({
  children,
  className = '',
  style,
  radius = 360,
  spotColor = '201, 168, 76',
}: SpotlightCardProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
    el.style.setProperty('--spot-y', `${e.clientY - rect.top}px`);
    el.style.setProperty('--spot-a', '1');
  };

  const onLeave = () => {
    const el = wrapRef.current;
    if (el) el.style.setProperty('--spot-a', '0');
  };

  return (
    <div
      ref={wrapRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`spotlight-card ${className}`}
      style={
        {
          position: 'relative',
          '--spot-x': '50%',
          '--spot-y': '50%',
          '--spot-a': '0',
          '--spot-r': `${radius}px`,
          '--spot-c': spotColor,
          ...style,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
