'use client';

import { useEffect } from 'react';

/**
 * Global click-spark effect: appends a full-screen canvas layer and draws a
 * radial burst of particles wherever the user clicks. Zero visual footprint
 * when idle. Mounted once near the root.
 */
export function ClickSpark({
  color = '#e8c878',
  particleCount = 10,
  distance = 44,
  life = 520,
}: {
  color?: string;
  particleCount?: number;
  distance?: number;
  life?: number;
}) {
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    interface Burst {
      x: number;
      y: number;
      start: number;
    }
    const bursts: Burst[] = [];

    const onDown = (e: MouseEvent) => {
      // Ignore right-clicks and clicks on form inputs/editors where a spark would be noisy.
      if (e.button !== 0) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('input, textarea, [contenteditable="true"]')) return;
      bursts.push({ x: e.clientX, y: e.clientY, start: performance.now() });
      if (!rafId) loop();
    };

    let rafId = 0;
    const loop = () => {
      const now = performance.now();
      ctx.clearRect(0, 0, width, height);
      for (let b = bursts.length - 1; b >= 0; b--) {
        const burst = bursts[b];
        const t = (now - burst.start) / life;
        if (t >= 1) {
          bursts.splice(b, 1);
          continue;
        }
        const easeOut = 1 - Math.pow(1 - t, 3);
        const alpha = 1 - t;
        ctx.strokeStyle = color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 1.4;
        ctx.lineCap = 'round';
        for (let i = 0; i < particleCount; i++) {
          const angle = (i / particleCount) * Math.PI * 2;
          const r = easeOut * distance;
          const x0 = burst.x + Math.cos(angle) * (r * 0.35);
          const y0 = burst.y + Math.sin(angle) * (r * 0.35);
          const x1 = burst.x + Math.cos(angle) * r;
          const y1 = burst.y + Math.sin(angle) * r;
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(x1, y1);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      if (bursts.length) {
        rafId = requestAnimationFrame(loop);
      } else {
        rafId = 0;
      }
    };

    window.addEventListener('mousedown', onDown);
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousedown', onDown);
      cancelAnimationFrame(rafId);
      canvas.remove();
    };
  }, [color, particleCount, distance, life]);

  return null;
}
