import { clsx } from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={clsx(
        // Layout
        'inline-flex items-center justify-center',
        'rounded',
        // Spacing (size variants)
        size === 'sm' && 'px-4 py-2',
        size === 'md' && 'px-6 py-3',
        size === 'lg' && 'px-8 py-4',
        // Typography (size variants)
        size === 'sm' && 'text-sm',
        size === 'md' && 'text-base',
        size === 'lg' && 'text-lg',
        'font-medium',
        // Colors (variant-based)
        variant === 'primary' && 'bg-pfeiffer-red text-white',
        variant === 'secondary' && 'bg-gray-200 text-gray-700',
        variant === 'ghost' && 'bg-transparent text-pfeiffer-red',
        variant === 'danger' && 'bg-pfeiffer-red text-white',
        // Effects
        'transition-all duration-200',
        variant === 'primary' && 'hover:bg-pfeiffer-red-dark',
        variant === 'secondary' && 'hover:bg-gray-300',
        variant === 'ghost' && 'hover:bg-gray-100',
        variant === 'danger' && 'hover:bg-pfeiffer-red-dark',
        // States
        'focus:outline-none focus:ring-2 focus:ring-pfeiffer-red focus:ring-offset-2',
        isDisabled && 'opacity-50 cursor-not-allowed',

        className,
      )}
      disabled={isDisabled}
      aria-busy={loading}
      {...rest}
    >
      {loading && (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
      )}
      {children}
    </button>
  );
}
