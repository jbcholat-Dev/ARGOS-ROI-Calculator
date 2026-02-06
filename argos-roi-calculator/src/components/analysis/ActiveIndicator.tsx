import { clsx } from 'clsx';

export interface ActiveIndicatorProps {
  variant: 'badge' | 'dot';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const dotSizes = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
} as const;

const badgeSizes = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-3 py-1 gap-1.5',
  lg: 'text-base px-4 py-1.5 gap-2',
} as const;

export function ActiveIndicator({
  variant,
  size = 'md',
  className,
}: ActiveIndicatorProps) {
  if (variant === 'dot') {
    return (
      <span
        role="status"
        aria-label="Analyse active"
        className={clsx(
          'inline-block rounded-full bg-green-600',
          dotSizes[size],
          className
        )}
      />
    );
  }

  return (
    <span
      role="status"
      aria-label="Analyse active"
      className={clsx(
        'inline-flex items-center rounded-full bg-green-600 text-white font-medium',
        badgeSizes[size],
        className
      )}
    >
      <svg
        className={clsx(
          size === 'sm' && 'w-3 h-3',
          size === 'md' && 'w-4 h-4',
          size === 'lg' && 'w-5 h-5'
        )}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      Analyse active
    </span>
  );
}
