import { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary: [
    'bg-accent text-bg-primary font-semibold',
    'hover:bg-opacity-90 hover:shadow-lg',
    'shadow-[0_0_20px_rgba(74,222,128,0.3)]',
    'active:scale-[0.98]',
  ].join(' '),
  outline: [
    'border border-[var(--border-hover)] text-accent',
    'hover:bg-[var(--accent-glow)]',
    'active:scale-[0.98]',
  ].join(' '),
  ghost: [
    'text-[var(--text-muted)]',
    'hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]',
  ].join(' '),
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm rounded-lg',
  md: 'px-6 py-3 text-base rounded-xl',
  lg: 'px-8 py-4 text-lg rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  ),
);

Button.displayName = 'Button';
