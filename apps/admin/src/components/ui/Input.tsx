import { InputHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={clsx('input-base', error && 'border-red-500/60', className)}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  ),
);
Input.displayName = 'Input';
