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
    'font-semibold text-[#09090A]',
    'transition-all duration-300',
    'hover:-translate-y-0.5',
  ].join(' '),
  outline: [
    'transition-all duration-300',
    'hover:-translate-y-0.5',
  ].join(' '),
  ghost: [
    'transition-colors duration-200',
  ].join(' '),
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-4 py-2 text-xs rounded-full',
  md: 'px-6 py-3 text-sm rounded-full',
  lg: 'px-8 py-4 text-sm rounded-full',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, style, ...props }, ref) => {
    const variantStyle =
      variant === 'primary'
        ? { background: 'var(--accent)', boxShadow: '0 0 28px var(--accent-glow-strong)', color: '#09090A', fontFamily: 'var(--font-syne)', fontWeight: 600, letterSpacing: '0.08em' }
        : variant === 'outline'
        ? { border: '1px solid var(--border-hover)', color: 'var(--accent)', fontFamily: 'var(--font-syne)', fontWeight: 600, letterSpacing: '0.08em' }
        : { color: 'var(--text-muted)', fontFamily: 'var(--font-dm-sans)' };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          'inline-flex items-center justify-center gap-2',
          'focus-visible:outline-none focus-visible:ring-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        style={{ ...variantStyle, ...style }}
        {...props}
      >
        {loading && (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';
