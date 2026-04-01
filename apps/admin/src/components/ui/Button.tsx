import { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'outline' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  size?: 'sm' | 'md';
}

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-bg-primary font-semibold hover:opacity-90 shadow-[0_0_16px_rgba(74,222,128,0.25)]',
  outline: 'border border-[var(--border-hover)] text-accent hover:bg-[var(--accent-glow)]',
  ghost: 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]',
  danger: 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'active:scale-[0.97]',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
