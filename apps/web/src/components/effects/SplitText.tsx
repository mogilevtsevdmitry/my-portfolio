'use client';

import { useEffect, useRef, useState, type CSSProperties, type ElementType } from 'react';

interface SplitTextProps {
  text: string;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  /** style merged into every individual char/word span */
  charStyle?: CSSProperties;
  delay?: number;        // initial delay in ms
  stagger?: number;      // per-char stagger in ms
  duration?: number;     // per-char duration in ms
  splitBy?: 'char' | 'word';
  startOnView?: boolean; // trigger on scroll into view
  animation?: 'rise' | 'fade' | 'blur';
}

export function SplitText({
  text,
  as: Tag = 'span',
  className = '',
  style,
  charStyle,
  delay = 0,
  stagger = 35,
  duration = 800,
  splitBy = 'char',
  startOnView = false,
  animation = 'rise',
}: SplitTextProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(!startOnView);

  useEffect(() => {
    if (!startOnView) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [startOnView]);

  const tokens =
    splitBy === 'word'
      ? text.split(/(\s+)/)
      : Array.from(text);

  const animStyles: Record<string, CSSProperties> = {
    rise: {
      transform: visible ? 'translateY(0)' : 'translateY(0.6em)',
      opacity: visible ? 1 : 0,
    },
    fade: {
      opacity: visible ? 1 : 0,
    },
    blur: {
      filter: visible ? 'blur(0)' : 'blur(12px)',
      opacity: visible ? 1 : 0,
    },
  };

  return (
    <Tag
      ref={ref as never}
      className={className}
      style={{ display: 'inline-block', ...style }}
      aria-label={text}
    >
      {tokens.map((tok, i) => {
        if (tok === ' ' || /^\s+$/.test(tok)) {
          return (
            <span key={i} aria-hidden style={{ display: 'inline-block', whiteSpace: 'pre' }}>
              {tok}
            </span>
          );
        }
        return (
          <span
            key={i}
            aria-hidden
            style={{
              display: 'inline-block',
              willChange: 'transform, opacity, filter',
              transition: `transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1), opacity ${duration}ms ease, filter ${duration}ms ease`,
              transitionDelay: `${delay + i * stagger}ms`,
              ...charStyle,
              ...animStyles[animation],
            }}
          >
            {tok}
          </span>
        );
      })}
    </Tag>
  );
}
