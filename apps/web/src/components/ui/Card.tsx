import { HTMLAttributes } from 'react';
import clsx from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

export function Card({ glow = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'glass-card p-6',
        glow && 'accent-glow',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
