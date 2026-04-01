import clsx from 'clsx';
import { HTMLAttributes } from 'react';

interface GlowTextProps extends HTMLAttributes<HTMLSpanElement> {
  as?: 'h1' | 'h2' | 'h3' | 'span';
}

export function GlowText({ as: Tag = 'span', className, children, ...props }: GlowTextProps) {
  return (
    <Tag
      className={clsx('glow-text', className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
