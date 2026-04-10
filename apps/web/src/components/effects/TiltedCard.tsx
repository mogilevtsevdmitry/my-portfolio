'use client';

import { useRef, type CSSProperties, type ReactNode } from 'react';

interface TiltedCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** maximum tilt angle in deg */
  maxTilt?: number;
  /** max translation on z axis in px */
  scale?: number;
  /** glare highlight */
  glare?: boolean;
}

/**
 * 3D tilt on mouse hover — CSS-only transforms, no libraries.
 * Wraps children in a perspective container and applies rotateX/Y based on cursor.
 */
export function TiltedCard({
  children,
  className = '',
  style,
  maxTilt = 10,
  scale = 1.02,
  glare = true,
}: TiltedCardProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const glareRef = useRef<HTMLDivElement | null>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;
    const rect = wrap.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = x / rect.width - 0.5;
    const py = y / rect.height - 0.5;
    const rx = -py * maxTilt * 2;
    const ry = px * maxTilt * 2;
    inner.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`;
    if (glareRef.current) {
      glareRef.current.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.15), transparent 60%)`;
      glareRef.current.style.opacity = '1';
    }
  };

  const onLeave = () => {
    const inner = innerRef.current;
    if (inner) inner.style.transform = 'perspective(900px) rotateX(0) rotateY(0) scale(1)';
    if (glareRef.current) glareRef.current.style.opacity = '0';
  };

  return (
    <div
      ref={wrapRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{ perspective: '900px', ...style }}
    >
      <div
        ref={innerRef}
        style={{
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 350ms cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'transform',
        }}
      >
        {children}
        {glare && (
          <div
            ref={glareRef}
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              mixBlendMode: 'screen',
              transition: 'opacity 300ms ease',
              opacity: 0,
              borderRadius: 'inherit',
            }}
          />
        )}
      </div>
    </div>
  );
}
