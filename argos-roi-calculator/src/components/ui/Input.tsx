import { clsx } from 'clsx';
import { useId, type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className,
  id: providedId,
  disabled,
  ...rest
}: InputProps) {
  const generatedId = useId();
  const id = providedId || generatedId;
  const errorId = `${id}-error`;
  const helperTextId = `${id}-helper`;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-base font-medium text-gray-900">
          {label}
        </label>
      )}
      <input
        id={id}
        className={clsx(
          // Layout & spacing
          'px-4 py-2',
          'rounded',
          // Typography
          'text-base',
          // Colors & borders
          'border',
          'bg-white text-gray-900',
          'transition-colors',
          // Focus state
          'focus:border-pfeiffer-red focus:outline-none focus:ring-2 focus:ring-pfeiffer-red',
          // Error state
          error
            ? 'border-pfeiffer-red'
            : 'border-gray-300',
          // Disabled state
          disabled && 'bg-gray-100 opacity-60 cursor-not-allowed',
          className,
        )}
        disabled={disabled}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={
          error ? errorId : helperText ? helperTextId : undefined
        }
        {...rest}
      />
      {error && (
        <p
          id={errorId}
          className="text-xs text-pfeiffer-red"
          role="alert"
        >
          <span aria-hidden="true">⚠️ </span>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperTextId} className="text-xs text-gray-600">
          {helperText}
        </p>
      )}
    </div>
  );
}
