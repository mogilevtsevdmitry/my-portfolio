'use client';

import type { CSSProperties } from 'react';

interface AuroraProps {
  className?: string;
  style?: CSSProperties;
  /** base accent color (gold) */
  colorA?: string;
  /** secondary accent */
  colorB?: string;
  /** tertiary accent */
  colorC?: string;
  /** blend opacity */
  opacity?: number;
}

/**
 * Soft animated aurora gradient background.
 * Renders three conic/radial gradient blobs that slowly drift.
 * No WebGL — pure CSS, 60fps.
 */
export function Aurora({
  className = '',
  style,
  colorA = 'rgba(201, 168, 76, 0.28)',
  colorB = 'rgba(232, 200, 120, 0.18)',
  colorC = 'rgba(120, 90, 30, 0.22)',
  opacity = 1,
}: AuroraProps) {
  return (
    <div
      aria-hidden
      className={`aurora-root ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        opacity,
        ...style,
      }}
    >
      <div
        className="aurora-blob aurora-blob-1"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${colorA} 0%, transparent 60%)`,
        }}
      />
      <div
        className="aurora-blob aurora-blob-2"
        style={{
          background: `radial-gradient(ellipse 55% 45% at 50% 50%, ${colorB} 0%, transparent 65%)`,
        }}
      />
      <div
        className="aurora-blob aurora-blob-3"
        style={{
          background: `radial-gradient(ellipse 50% 40% at 50% 50%, ${colorC} 0%, transparent 60%)`,
        }}
      />
    </div>
  );
}
