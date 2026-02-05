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
        // Layout & spacing
        'inline-flex items-center justify-center',
        'rounded font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-pfeiffer-red focus:ring-offset-2',

        // Size variants
        size === 'sm' && 'px-4 py-2 text-sm',
        size === 'md' && 'px-6 py-3 text-base',
        size === 'lg' && 'px-8 py-4 text-lg',

        // Color variants
        variant === 'primary' &&
          'bg-pfeiffer-red text-white hover:bg-pfeiffer-red-dark',
        variant === 'secondary' &&
          'bg-gray-200 text-gray-700 hover:bg-gray-300',
        variant === 'ghost' &&
          'bg-transparent text-pfeiffer-red hover:bg-gray-100',
        variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',

        // Disabled/loading state
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
