'use client';

import type { CSSProperties, ReactNode } from 'react';

interface ShinyTextProps {
  children: ReactNode;
  className?: string;
  speed?: number; // seconds per sweep
  disabled?: boolean;
}

/**
 * Animated "shiny" text — a bright highlight sweeps across the baseline color.
 * Uses a gradient mask in background-clip:text, so it works on any font.
 */
export function ShinyText({
  children,
  className = '',
  speed = 4,
  disabled = false,
}: ShinyTextProps) {
  const style: CSSProperties = {
    backgroundImage:
      'linear-gradient(110deg, rgba(184,149,65,0.55) 20%, rgba(232,200,120,1) 50%, rgba(184,149,65,0.55) 80%)',
    backgroundSize: '200% 100%',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    WebkitTextFillColor: 'transparent',
    animation: disabled ? undefined : `shiny-sweep ${speed}s linear infinite`,
  };

  return (
    <span className={className} style={style}>
      {children}
    </span>
  );
}
