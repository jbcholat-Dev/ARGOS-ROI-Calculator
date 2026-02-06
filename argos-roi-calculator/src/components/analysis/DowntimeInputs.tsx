import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { useId } from 'react';
import { useAppStore } from '@/stores/app-store';
import {
  validateDowntimeDuration,
  validateDowntimeCostPerHour,
  formatFrenchNumber,
} from '@/lib/validation/downtime-validation';

export interface DowntimeInputsProps {
  analysisId: string;
}

export function DowntimeInputs({ analysisId }: DowntimeInputsProps) {
  const analysis = useAppStore((state) =>
    state.analyses.find((a) => a.id === analysisId)
  );
  const updateAnalysis = useAppStore((state) => state.updateAnalysis);

  const [durationError, setDurationError] = useState<string | undefined>();
  const [durationWarning, setDurationWarning] = useState<string | undefined>();
  const [costError, setCostError] = useState<string | undefined>();
  const [costWarning, setCostWarning] = useState<string | undefined>();
  const [isCostFocused, setIsCostFocused] = useState(false);
  // Local state for raw cost input to preserve invalid text (e.g., "-100") during editing
  const [costRawValue, setCostRawValue] = useState('');

  const durationInputId = useId();
  const costInputId = useId();
  const durationErrorId = `${durationInputId}-error`;
  const durationWarningId = `${durationInputId}-warning`;
  const costErrorId = `${costInputId}-error`;
  const costWarningId = `${costInputId}-warning`;

  // Sync local cost raw value from store when not focused (e.g., on mount or external update)
  useEffect(() => {
    if (!isCostFocused && analysis) {
      setCostRawValue(
        analysis.downtimeCostPerHour === 0 ? '' : String(analysis.downtimeCostPerHour)
      );
    }
  }, [isCostFocused, analysis?.downtimeCostPerHour]);

  if (!analysis) {
    return null;
  }

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value.trim() === '') {
      setDurationError(undefined);
      setDurationWarning('Requis pour le calcul ROI');
      updateAnalysis(analysisId, { downtimeDuration: 0 });
      return;
    }

    const result = validateDowntimeDuration(value);

    if (result.isValid) {
      setDurationError(undefined);
      setDurationWarning(result.warning);
      updateAnalysis(analysisId, { downtimeDuration: Number(value) });
    } else {
      setDurationError(result.error);
      setDurationWarning(undefined);
    }
  };

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;
    // Strip any French thousand separator spaces before validation
    const cleanedValue = rawInput.replace(/[\s\u00A0\u202F]/g, '');
    setCostRawValue(cleanedValue);

    if (cleanedValue.trim() === '') {
      setCostError(undefined);
      setCostWarning('Requis pour le calcul ROI');
      updateAnalysis(analysisId, { downtimeCostPerHour: 0 });
      return;
    }

    const result = validateDowntimeCostPerHour(cleanedValue);

    if (result.isValid) {
      setCostError(undefined);
      setCostWarning(result.warning);
      updateAnalysis(analysisId, { downtimeCostPerHour: Number(cleanedValue) });
    } else {
      setCostError(result.error);
      setCostWarning(undefined);
    }
  };

  const handleCostFocus = () => {
    setIsCostFocused(true);
    // Show raw number when focused (strip formatting)
    setCostRawValue(
      analysis.downtimeCostPerHour === 0 ? '' : String(analysis.downtimeCostPerHour)
    );
  };

  const handleCostBlur = () => {
    setIsCostFocused(false);
    // Clear raw value so the formatted display takes over
    setCostRawValue(
      analysis.downtimeCostPerHour === 0 ? '' : String(analysis.downtimeCostPerHour)
    );
  };

  const getDurationDescribedBy = () => {
    if (durationError) return durationErrorId;
    if (durationWarning) return durationWarningId;
    return undefined;
  };

  const getCostDescribedBy = () => {
    if (costError) return costErrorId;
    if (costWarning) return costWarningId;
    return undefined;
  };

  // Display formatted cost value when not focused, raw value when focused
  const costDisplayValue = (): string => {
    if (isCostFocused) {
      return costRawValue;
    }
    if (analysis.downtimeCostPerHour === 0) return '';
    return formatFrenchNumber(analysis.downtimeCostPerHour);
  };

  return (
    <section aria-label="Temps d'arrêt">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Temps d&apos;arrêt
      </h2>
      <div className="flex flex-col gap-4">
        {/* Downtime Duration Field */}
        <div className="flex flex-col gap-1">
          <label htmlFor={durationInputId} className="text-base font-medium text-gray-900">
            Heures d&apos;arrêt par panne
          </label>
          <div className="relative">
            <input
              id={durationInputId}
              type="number"
              step="0.1"
              min="0"
              placeholder="ex: 6"
              value={analysis.downtimeDuration === 0 ? '' : String(analysis.downtimeDuration)}
              onChange={handleDurationChange}
              aria-invalid={durationError ? 'true' : 'false'}
              aria-describedby={getDurationDescribedBy()}
              className={clsx(
                'w-full px-4 py-2 pr-16',
                'rounded',
                'text-base',
                'border',
                'bg-white text-gray-900',
                'transition-colors',
                'focus:border-pfeiffer-red focus:outline-none focus:ring-2 focus:ring-pfeiffer-red',
                durationError
                  ? 'border-red-600'
                  : durationWarning
                    ? 'border-amber-500'
                    : 'border-gray-300',
              )}
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
              heures
            </span>
          </div>
          {durationError && (
            <p
              id={durationErrorId}
              className="text-xs text-red-600"
              role="alert"
            >
              <span aria-hidden="true">&#9888;&#65039; </span>
              {durationError}
            </p>
          )}
          {durationWarning && !durationError && (
            <p
              id={durationWarningId}
              className="text-xs text-amber-600"
            >
              {durationWarning}
            </p>
          )}
        </div>

        {/* Downtime Cost Per Hour Field */}
        <div className="flex flex-col gap-1">
          <label htmlFor={costInputId} className="text-base font-medium text-gray-900">
            Coût horaire d&apos;arrêt
          </label>
          <div className="relative">
            <input
              id={costInputId}
              type="text"
              inputMode="numeric"
              placeholder="ex: 15000"
              value={costDisplayValue()}
              onChange={handleCostChange}
              onFocus={handleCostFocus}
              onBlur={handleCostBlur}
              aria-invalid={costError ? 'true' : 'false'}
              aria-describedby={getCostDescribedBy()}
              className={clsx(
                'w-full px-4 py-2 pr-12',
                'rounded',
                'text-base',
                'border',
                'bg-white text-gray-900',
                'transition-colors',
                'focus:border-pfeiffer-red focus:outline-none focus:ring-2 focus:ring-pfeiffer-red',
                costError
                  ? 'border-red-600'
                  : costWarning
                    ? 'border-amber-500'
                    : 'border-gray-300',
              )}
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
              €/h
            </span>
          </div>
          {costError && (
            <p
              id={costErrorId}
              className="text-xs text-red-600"
              role="alert"
            >
              <span aria-hidden="true">&#9888;&#65039; </span>
              {costError}
            </p>
          )}
          {costWarning && !costError && (
            <p
              id={costWarningId}
              className="text-xs text-amber-600"
            >
              {costWarning}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
