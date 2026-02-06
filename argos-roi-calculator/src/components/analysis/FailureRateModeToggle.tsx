import { Toggle } from '@/components/ui/Toggle';
import type { FailureRateMode } from '@/types';

const TOGGLE_OPTIONS = [
  { value: 'percentage', label: 'Taux (%)' },
  { value: 'absolute', label: 'Nombre de pannes/an' },
] as const;

export interface FailureRateModeToggleProps {
  mode: FailureRateMode;
  onChange: (mode: FailureRateMode) => void;
  disabled?: boolean;
  disabledMessage?: string;
}

export function FailureRateModeToggle({
  mode,
  onChange,
  disabled = false,
  disabledMessage,
}: FailureRateModeToggleProps) {
  const handleChange = (value: string) => {
    onChange(value as FailureRateMode);
  };

  return (
    <div className="flex flex-col gap-1">
      <Toggle
        options={TOGGLE_OPTIONS}
        value={mode}
        onChange={handleChange}
        label="Mode de saisie du taux de panne"
        disabled={disabled}
      />
      {disabled && disabledMessage && (
        <p className="text-sm text-gray-500">{disabledMessage}</p>
      )}
    </div>
  );
}
