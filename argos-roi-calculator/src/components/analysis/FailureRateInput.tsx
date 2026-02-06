import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { useAppStore } from '@/stores/app-store';
import { FailureRateModeToggle } from './FailureRateModeToggle';
import {
  validateFailureRatePercentage,
  validateFailureCount,
  calculatePercentageFromCount,
} from '@/lib/validation/failure-rate-validation';
import type { FailureRateMode } from '@/types';

export interface FailureRateInputProps {
  analysisId: string;
}

export function FailureRateInput({ analysisId }: FailureRateInputProps) {
  const analysis = useAppStore((state) =>
    state.analyses.find((a) => a.id === analysisId),
  );
  const updateAnalysis = useAppStore((state) => state.updateAnalysis);

  const [percentageError, setPercentageError] = useState<string | undefined>();
  const [countError, setCountError] = useState<string | undefined>();

  if (!analysis) {
    return null;
  }

  const pumpQuantity = analysis.pumpQuantity;
  const isCountDisabled = pumpQuantity === 0;
  // Effective mode: force percentage when count is disabled
  const mode = isCountDisabled ? 'percentage' : analysis.failureRateMode;

  const handleModeChange = (newMode: FailureRateMode) => {
    // Don't allow switching to count mode if pump quantity is 0
    if (newMode === 'absolute' && isCountDisabled) {
      return;
    }

    setPercentageError(undefined);
    setCountError(undefined);
    updateAnalysis(analysisId, { failureRateMode: newMode });
  };

  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value.trim() === '') {
      setPercentageError(undefined);
      updateAnalysis(analysisId, { failureRatePercentage: 0 });
      return;
    }

    const result = validateFailureRatePercentage(value);

    if (result.isValid) {
      setPercentageError(undefined);
      updateAnalysis(analysisId, {
        failureRatePercentage: parseFloat(value),
      });
    } else {
      setPercentageError(result.error);
    }
  };

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value.trim() === '') {
      setCountError(undefined);
      updateAnalysis(analysisId, {
        absoluteFailureCount: 0,
        failureRatePercentage: 0,
      });
      return;
    }

    const result = validateFailureCount(value);

    if (result.isValid) {
      const count = parseInt(value, 10);
      const percentage = calculatePercentageFromCount(count, pumpQuantity);

      // Reject counts that exceed pump quantity (>100% failure rate)
      if (percentage > 100) {
        setCountError('Le nombre de pannes ne peut pas dépasser le nombre de pompes');
        return;
      }

      setCountError(undefined);
      updateAnalysis(analysisId, {
        absoluteFailureCount: count,
        failureRatePercentage: percentage,
      });
    } else {
      setCountError(result.error);
    }
  };

  const calculatedPercentageId = `${analysisId}-calculated-percentage`;

  return (
    <section aria-label="Taux de panne">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Taux de panne
      </h2>
      <div className="flex flex-col gap-4">
        <FailureRateModeToggle
          mode={isCountDisabled ? 'percentage' : mode}
          onChange={handleModeChange}
          disabled={isCountDisabled}
          disabledMessage={
            isCountDisabled
              ? "Entrez d'abord le nombre de pompes"
              : undefined
          }
        />

        {mode === 'percentage' && (
          <Input
            label="Taux de panne annuel (%)"
            type="number"
            placeholder="ex: 10"
            value={
              analysis.failureRatePercentage === 0
                ? ''
                : String(analysis.failureRatePercentage)
            }
            onChange={handlePercentageChange}
            error={percentageError}
            min={0}
            max={100}
            step={0.1}
          />
        )}

        {mode === 'absolute' && (
          <div className="flex flex-col gap-2">
            <Input
              label="Nombre de pannes (année dernière)"
              type="number"
              placeholder="ex: 3"
              value={
                analysis.absoluteFailureCount === undefined ||
                analysis.absoluteFailureCount === 0
                  ? ''
                  : String(analysis.absoluteFailureCount)
              }
              onChange={handleCountChange}
              error={countError}
              min={0}
              step={1}
              aria-describedby={
                analysis.absoluteFailureCount !== undefined &&
                analysis.absoluteFailureCount > 0
                  ? calculatedPercentageId
                  : undefined
              }
            />
            <p className="text-sm text-gray-500">
              Pour {pumpQuantity} pompes
            </p>
            {analysis.absoluteFailureCount !== undefined &&
              analysis.absoluteFailureCount > 0 && (
                <p
                  id={calculatedPercentageId}
                  className="text-sm font-medium text-gray-600"
                >
                  Taux calculé :{' '}
                  {calculatePercentageFromCount(
                    analysis.absoluteFailureCount,
                    pumpQuantity,
                  )}
                  %
                </p>
              )}
          </div>
        )}
      </div>
    </section>
  );
}
