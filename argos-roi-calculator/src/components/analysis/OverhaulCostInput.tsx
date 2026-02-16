import { useState } from 'react';
import { useId } from 'react';
import { clsx } from 'clsx';
import { useAppStore } from '@/stores/app-store';
import { formatFrenchNumber } from '@/lib/validation/downtime-validation';

export interface OverhaulCostInputProps {
  analysisId: string;
}

export function OverhaulCostInput({ analysisId }: OverhaulCostInputProps) {
  const analysis = useAppStore((state) =>
    state.analyses.find((a) => a.id === analysisId),
  );
  const updateAnalysis = useAppStore((state) => state.updateAnalysis);

  const overhaulCostId = useId();

  const [isCostFocused, setIsCostFocused] = useState(false);
  const [costRawValue, setCostRawValue] = useState('');

  if (!analysis) return null;

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;
    const cleanedValue = rawInput.replace(/[\s\u00A0\u202F,.']/g, '');
    setCostRawValue(cleanedValue);

    if (cleanedValue.trim() === '') {
      updateAnalysis(analysisId, { overhaulCostPerPump: 0 });
      return;
    }
    const parsed = Number(cleanedValue);
    if (!isNaN(parsed) && parsed >= 0) {
      updateAnalysis(analysisId, { overhaulCostPerPump: parsed });
    }
  };

  const handleCostFocus = () => {
    setIsCostFocused(true);
    setCostRawValue(analysis.overhaulCostPerPump === 0 ? '' : String(analysis.overhaulCostPerPump));
  };

  const handleCostBlur = () => {
    setIsCostFocused(false);
  };

  const costDisplayValue = (): string => {
    if (isCostFocused) return costRawValue;
    if (analysis.overhaulCostPerPump === 0) return '';
    return formatFrenchNumber(analysis.overhaulCostPerPump);
  };

  return (
    <section aria-label="Overhaul Cost">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Overhaul Cost
      </h2>
      <div className="flex flex-col gap-1">
        <label htmlFor={overhaulCostId} className="text-base font-medium text-gray-900">
          Overhaul Cost per Pump (€)
        </label>
        <div className="relative">
          <input
            id={overhaulCostId}
            type="text"
            inputMode="numeric"
            placeholder="ex: 25000"
            value={costDisplayValue()}
            onChange={handleCostChange}
            onFocus={handleCostFocus}
            onBlur={handleCostBlur}
            className={clsx(
              'w-full px-4 py-2 pr-12',
              'rounded',
              'text-base',
              'border border-gray-300',
              'bg-white text-gray-900',
              'transition-colors',
              'focus:border-pfeiffer-red focus:outline-none focus:ring-2 focus:ring-pfeiffer-red',
            )}
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
            €
          </span>
        </div>
      </div>
    </section>
  );
}
