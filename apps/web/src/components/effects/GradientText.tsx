'use client';

import type { CSSProperties, ElementType, ReactNode } from 'react';

interface GradientTextProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  colors?: string[];
  /** animation duration in seconds; 0 disables animation */
  speed?: number;
}

export function GradientText({
  children,
  as: Tag = 'span',
  className = '',
  style,
  colors = ['#c9a84c', '#e8c878', '#c9a84c', '#a47c2a', '#e8c878'],
  speed = 8,
}: GradientTextProps) {
  const grad = `linear-gradient(110deg, ${colors.join(', ')})`;
  return (
    <Tag
      className={className}
      style={{
        backgroundImage: grad,
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        WebkitTextFillColor: 'transparent',
        animation: speed ? `shiny-sweep ${speed}s linear infinite` : undefined,
        display: 'inline-block',
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
