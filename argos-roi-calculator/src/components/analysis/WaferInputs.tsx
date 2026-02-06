import { useState } from 'react';
import { clsx } from 'clsx';
import { Input } from '@/components/ui/Input';
import { useAppStore } from '@/stores/app-store';
import {
  validateWaferQuantity,
  validateWaferCost,
  formatEuroCurrency,
} from '@/lib/validation/wafer-validation';
import type { WaferType } from '@/types';

export interface WaferInputsProps {
  analysisId: string;
}

export function WaferInputs({ analysisId }: WaferInputsProps) {
  const analysis = useAppStore((state) =>
    state.analyses.find((a) => a.id === analysisId)
  );
  const updateAnalysis = useAppStore((state) => state.updateAnalysis);

  const [quantityError, setQuantityError] = useState<string | undefined>();
  const [costError, setCostError] = useState<string | undefined>();
  const [isCostFocused, setIsCostFocused] = useState(false);
  const [costInputValue, setCostInputValue] = useState<string>('');

  if (!analysis) {
    return null;
  }

  const handleWaferTypeChange = (newType: WaferType) => {
    updateAnalysis(analysisId, {
      waferType: newType,
      waferQuantity: newType === 'mono' ? 1 : 125,
    });
    // Clear quantity error when switching types (auto-fill valid defaults)
    setQuantityError(undefined);
  };

  const handleWaferQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow clearing the field (store 0 so controlled input reflects empty)
    if (value.trim() === '') {
      setQuantityError(undefined);
      updateAnalysis(analysisId, { waferQuantity: 0 });
      return;
    }

    const result = validateWaferQuantity(value);

    if (result.isValid) {
      setQuantityError(undefined);
      updateAnalysis(analysisId, { waferQuantity: parseInt(value, 10) });
    } else {
      setQuantityError(result.error);
    }
  };

  const handleWaferCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setCostInputValue(rawValue);

    // Remove spaces that may come from formatted input
    const cleaned = rawValue.replace(/\s/g, '');

    if (cleaned === '') {
      setCostError(undefined);
      return;
    }

    const result = validateWaferCost(cleaned);

    if (result.isValid) {
      setCostError(undefined);
      updateAnalysis(analysisId, { waferCost: parseFloat(cleaned) });
    } else {
      setCostError(result.error);
    }
  };

  const handleCostFocus = () => {
    setIsCostFocused(true);
    // Show raw number for easy editing
    setCostInputValue(analysis.waferCost > 0 ? String(analysis.waferCost) : '');
  };

  const handleCostBlur = () => {
    setIsCostFocused(false);
    setCostInputValue('');
  };

  // Display value: formatted when not focused, raw when focused
  const costDisplayValue = isCostFocused
    ? costInputValue
    : analysis.waferCost > 0
      ? formatEuroCurrency(analysis.waferCost)
      : '';

  return (
    <section aria-label="Wafer">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Wafer</h2>
      <div className="flex flex-col gap-4">
        {/* Wafer Type Radio Buttons */}
        <fieldset>
          <legend className="mb-2 text-base font-medium text-gray-900">
            Type de wafer
          </legend>
          <div className="flex gap-6">
            <label
              className={clsx(
                'flex cursor-pointer items-center gap-2',
                'rounded px-3 py-2',
                'transition-colors',
                analysis.waferType === 'mono' && 'bg-red-50'
              )}
            >
              <input
                type="radio"
                name={`wafer-type-${analysisId}`}
                value="mono"
                checked={analysis.waferType === 'mono'}
                onChange={() => handleWaferTypeChange('mono')}
                className={clsx(
                  'h-4 w-4',
                  'border-gray-300',
                  'text-pfeiffer-red',
                  'focus:ring-2 focus:ring-pfeiffer-red focus:ring-offset-2'
                )}
              />
              <span className="text-base text-gray-900">Mono-wafer</span>
            </label>
            <label
              className={clsx(
                'flex cursor-pointer items-center gap-2',
                'rounded px-3 py-2',
                'transition-colors',
                analysis.waferType === 'batch' && 'bg-red-50'
              )}
            >
              <input
                type="radio"
                name={`wafer-type-${analysisId}`}
                value="batch"
                checked={analysis.waferType === 'batch'}
                onChange={() => handleWaferTypeChange('batch')}
                className={clsx(
                  'h-4 w-4',
                  'border-gray-300',
                  'text-pfeiffer-red',
                  'focus:ring-2 focus:ring-pfeiffer-red focus:ring-offset-2'
                )}
              />
              <span className="text-base text-gray-900">Batch</span>
            </label>
          </div>
        </fieldset>

        {/* Wafers per batch - conditional on batch mode */}
        {analysis.waferType === 'batch' && (
          <Input
            label="Wafers par lot"
            type="number"
            placeholder="ex: 125"
            value={analysis.waferQuantity === 0 ? '' : String(analysis.waferQuantity)}
            onChange={handleWaferQuantityChange}
            error={quantityError}
            min={1}
            max={1000}
          />
        )}

        {/* Wafer cost - always visible */}
        <Input
          label="Coût par wafer (€)"
          type="text"
          placeholder="ex: 8000"
          value={costDisplayValue}
          onChange={handleWaferCostChange}
          onFocus={handleCostFocus}
          onBlur={handleCostBlur}
          error={costError}
        />
      </div>
    </section>
  );
}
