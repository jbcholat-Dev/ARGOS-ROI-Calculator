import { clsx } from 'clsx';
import { useEffect } from 'react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  variant: ToastVariant;
  message: string;
  onDismiss: () => void;
  autoDismiss?: boolean;
  duration?: number;
}

const variantConfig = {
  success: {
    bg: 'bg-roi-positive',
    icon: '✓',
    role: 'status' as const,
    live: 'polite' as const,
  },
  error: {
    bg: 'bg-pfeiffer-red',
    icon: '⚠️',
    role: 'alert' as const,
    live: 'assertive' as const,
  },
  warning: {
    bg: 'bg-roi-warning',
    icon: '⚡',
    role: 'alert' as const,
    live: 'assertive' as const,
  },
  info: {
    bg: 'bg-blue-500',
    icon: 'ℹ️',
    role: 'status' as const,
    live: 'polite' as const,
  },
};

export function Toast({
  variant,
  message,
  onDismiss,
  autoDismiss = true,
  duration,
}: ToastProps) {
  const config = variantConfig[variant];
  const dismissDuration = duration ?? (variant === 'error' ? 5000 : 3000);

  useEffect(() => {
    if (!autoDismiss) return;

    const timer = setTimeout(() => {
      onDismiss();
    }, dismissDuration);

    return () => clearTimeout(timer);
  }, [autoDismiss, dismissDuration, onDismiss]);

  return (
    <div
      role={config.role}
      aria-live={config.live}
      className={clsx(
        // Layout & spacing
        'flex items-center justify-between gap-4',
        'px-6 py-4',
        'min-w-[320px] max-w-md',
        'rounded-lg',
        // Colors
        config.bg,
        'text-white',
        'shadow-lg',
        // Animation
        'animate-in slide-in-from-right duration-300',
      )}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl" aria-hidden="true">
          {config.icon}
        </span>
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="text-white hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent"
        aria-label="Dismiss notification"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          strokeWidth="2"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
