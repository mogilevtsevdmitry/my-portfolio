import clsx from 'clsx';
import { HTMLAttributes } from 'react';

interface SectionProps extends HTMLAttributes<HTMLElement> {
  alt?: boolean;
}

export function Section({ alt = false, className, children, ...props }: SectionProps) {
  return (
    <section
      className={clsx('py-24 md:py-36 px-6 md:px-16 lg:px-24', className)}
      style={{ background: alt ? 'var(--bg-secondary)' : 'var(--bg-primary)', minHeight: '100vh' }}
      {...props}
    >
      <div className="max-w-[1400px] mx-auto">
        {children}
      </div>
    </section>
  );
}
