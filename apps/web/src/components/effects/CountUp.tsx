'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';

interface CountUpProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  style?: CSSProperties;
}

export function CountUp({
  end,
  duration = 1600,
  suffix = '',
  prefix = '',
  className = '',
  style,
}: CountUpProps) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          const startAt = performance.now();
          const tick = (now: number) => {
            const t = Math.min(1, (now - startAt) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            setValue(Math.round(eased * end));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref} className={className} style={style}>
      {prefix}
      {value}
      {suffix}
    </span>
  );
}
