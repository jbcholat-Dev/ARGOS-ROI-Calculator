import { clsx } from 'clsx';
import type { HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  clickable?: boolean;
}

export function Card({
  children,
  clickable = false,
  className,
  onClick,
  ...rest
}: CardProps) {
  const isClickable = clickable || !!onClick;

  return (
    <div
      className={clsx(
        // Layout & spacing
        'p-6',
        'rounded-lg',
        // Colors & borders
        'bg-white',
        'border border-gray-200',
        // Shadow & effects
        'shadow-md',
        'transition-shadow duration-200',
        // Hover state (if clickable)
        isClickable && 'cursor-pointer hover:shadow-lg hover:border-pfeiffer-red',
        className,
      )}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      {...rest}
    >
      {children}
    </div>
  );
}
