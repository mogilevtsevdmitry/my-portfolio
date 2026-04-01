import clsx from 'clsx';
import { HTMLAttributes } from 'react';

interface SectionProps extends HTMLAttributes<HTMLElement> {
  alt?: boolean; // alternate background
}

export function Section({ alt = false, className, children, ...props }: SectionProps) {
  return (
    <section
      className={clsx(
        'py-16 md:py-24 px-4 md:px-8',
        alt ? 'bg-bg-secondary' : 'bg-bg-primary',
        className,
      )}
      {...props}
    >
      <div className="max-w-6xl mx-auto">
        {children}
      </div>
    </section>
  );
}
