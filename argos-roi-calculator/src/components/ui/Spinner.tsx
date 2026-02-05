import { clsx } from 'clsx';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps {
  size?: SpinnerSize;
  color?: 'red' | 'gray';
  className?: string;
}

export function Spinner({ size = 'md', color = 'red', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-12 w-12 border-4',
  };

  const colorClasses = {
    red: 'border-pfeiffer-red border-r-transparent',
    gray: 'border-gray-400 border-r-transparent',
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={clsx(
        'inline-block animate-spin rounded-full border-solid',
        sizeClasses[size],
        colorClasses[color],
        className,
      )}
    />
  );
}
