'use client';

import { useEffect, useRef } from 'react';

interface DotGridProps {
  className?: string;
  /** dot size in px */
  dotSize?: number;
  /** distance between dots in px */
  gap?: number;
  /** base dot color */
  color?: string;
  /** hover highlight color */
  activeColor?: string;
  /** radius of mouse influence in px */
  proximity?: number;
}

/**
 * Canvas dot grid that brightens near the cursor.
 * Lightweight — repaints only when mouse moves.
 */
export function DotGrid({
  className = '',
  dotSize = 1.5,
  gap = 26,
  color = 'rgba(201, 168, 76, 0.18)',
  activeColor = 'rgba(232, 200, 120, 1)',
  proximity = 140,
}: DotGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    const parseColor = (c: string): [number, number, number] => {
      const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!m) return [255, 255, 255];
      return [Number(m[1]), Number(m[2]), Number(m[3])];
    };
    const [ar, ag, ab] = parseColor(activeColor);
    const baseAlpha = Number((color.match(/rgba?\([^)]*,\s*([0-9.]+)\)/) || [])[1] ?? 0.2);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const cols = Math.ceil(width / gap) + 1;
      const rows = Math.ceil(height / gap) + 1;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * gap;
          const y = j * gap;
          const dx = x - mouseRef.current.x;
          const dy = y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < proximity) {
            const t = 1 - dist / proximity;
            ctx.fillStyle = `rgba(${ar}, ${ag}, ${ab}, ${Math.min(1, baseAlpha + t)})`;
            const size = dotSize + t * 2.4;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, dotSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    };

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    };

    const onLeave = () => {
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, [dotSize, gap, color, activeColor, proximity]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    />
  );
}
