import { clsx } from 'clsx';

export interface ToggleOption {
  value: string;
  label: string;
}

export interface ToggleProps {
  options: [ToggleOption, ToggleOption];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({
  options,
  value,
  onChange,
  label,
  disabled = false,
}: ToggleProps) {

  const handleKeyDown = (
    e: React.KeyboardEvent,
    optionValue: string,
  ) => {
    if (disabled) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(optionValue);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      // Toggle to other option
      const currentIndex = options.findIndex((opt) => opt.value === value);
      const nextIndex = e.key === 'ArrowLeft' ? 0 : 1;
      if (nextIndex !== currentIndex) {
        onChange(options[nextIndex].value);
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <span className="text-base font-medium text-gray-900">{label}</span>
      )}
      <div
        role="radiogroup"
        aria-label={label}
        className="inline-flex gap-2 rounded-lg bg-gray-100 p-1"
      >
        {options.map((option) => {
          const isActive = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              disabled={disabled}
              onClick={() => !disabled && onChange(option.value)}
              onKeyDown={(e) => handleKeyDown(e, option.value)}
              className={clsx(
                // Layout & spacing
                'px-4 py-2',
                'rounded-md',
                // Typography
                'text-sm font-medium',
                'transition-all duration-200',
                // Active state
                isActive
                  ? 'bg-pfeiffer-red text-white shadow-sm'
                  : 'bg-transparent text-gray-700 hover:bg-gray-200',
                // Disabled state
                disabled && 'opacity-50 cursor-not-allowed',
                // Focus state
                'focus:outline-none focus:ring-2 focus:ring-pfeiffer-red focus:ring-offset-2',
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
