import { useState, useCallback, useRef, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Input } from '@/components/ui/Input';
import {
  validateDetectionRate,
  validateServiceCost,
  formatServiceCost
} from '@/lib/validation/global-params-validation';

export function GlobalSidebar() {
  const globalParams = useAppStore((state) => state.globalParams);
  const updateGlobalParams = useAppStore((state) => state.updateGlobalParams);

  // Detection Rate state
  const [detectionRateValue, setDetectionRateValue] = useState(
    String(globalParams.detectionRate)
  );
  const [detectionRateError, setDetectionRateError] = useState<string | undefined>();
  const [isDetectionRateFocused, setIsDetectionRateFocused] = useState(false);
  const isDetectionRateCancellingRef = useRef(false);

  // Service Cost state
  const [serviceCostValue, setServiceCostValue] = useState(
    String(globalParams.serviceCostPerPump)
  );
  const [serviceCostError, setServiceCostError] = useState<string | undefined>();
  const [isServiceCostFocused, setIsServiceCostFocused] = useState(false);
  const isServiceCostCancellingRef = useRef(false);

  // Sync local state when globalParams changes externally (and not focused)
  useEffect(() => {
    if (!isDetectionRateFocused) {
      setDetectionRateValue(String(globalParams.detectionRate));
    }
  }, [globalParams.detectionRate, isDetectionRateFocused]);

  useEffect(() => {
    if (!isServiceCostFocused) {
      setServiceCostValue(String(globalParams.serviceCostPerPump));
    }
  }, [globalParams.serviceCostPerPump, isServiceCostFocused]);

  // Detection Rate handlers
  const handleDetectionRateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDetectionRateValue(e.target.value);
      setDetectionRateError(undefined);
    },
    []
  );

  const handleDetectionRateCommit = useCallback(() => {
    const result = validateDetectionRate(detectionRateValue);
    if (result.isValid && result.value !== undefined) {
      updateGlobalParams({ detectionRate: result.value });
      setDetectionRateError(undefined);
    } else {
      setDetectionRateError(result.error);
    }
  }, [detectionRateValue, updateGlobalParams]);

  const handleDetectionRateBlur = useCallback(() => {
    setIsDetectionRateFocused(false);
    if (isDetectionRateCancellingRef.current) {
      isDetectionRateCancellingRef.current = false;
      return;
    }
    handleDetectionRateCommit();
  }, [handleDetectionRateCommit]);

  const handleDetectionRateFocus = useCallback(() => {
    setIsDetectionRateFocused(true);
  }, []);

  const handleDetectionRateKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleDetectionRateCommit();
      } else if (e.key === 'Escape') {
        isDetectionRateCancellingRef.current = true;
        setDetectionRateValue(String(globalParams.detectionRate));
        setDetectionRateError(undefined);
        (e.target as HTMLInputElement).blur();
      }
    },
    [handleDetectionRateCommit, globalParams.detectionRate]
  );

  // Service Cost handlers
  const handleServiceCostChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setServiceCostValue(e.target.value);
    setServiceCostError(undefined);
  }, []);

  const handleServiceCostCommit = useCallback(() => {
    const result = validateServiceCost(serviceCostValue);
    if (result.isValid && result.value !== undefined) {
      updateGlobalParams({ serviceCostPerPump: result.value });
      setServiceCostError(undefined);
    } else {
      setServiceCostError(result.error);
    }
  }, [serviceCostValue, updateGlobalParams]);

  const handleServiceCostBlur = useCallback(() => {
    setIsServiceCostFocused(false);
    if (isServiceCostCancellingRef.current) {
      isServiceCostCancellingRef.current = false;
      return;
    }
    handleServiceCostCommit();
  }, [handleServiceCostCommit]);

  const handleServiceCostFocus = useCallback(() => {
    setIsServiceCostFocused(true);
  }, []);

  const handleServiceCostKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleServiceCostCommit();
      } else if (e.key === 'Escape') {
        isServiceCostCancellingRef.current = true;
        setServiceCostValue(String(globalParams.serviceCostPerPump));
        setServiceCostError(undefined);
        (e.target as HTMLInputElement).blur();
      }
    },
    [handleServiceCostCommit, globalParams.serviceCostPerPump]
  );

  // Display formatted values when not focused
  const displayDetectionRate = isDetectionRateFocused
    ? detectionRateValue
    : String(globalParams.detectionRate);

  const displayServiceCost = isServiceCostFocused
    ? serviceCostValue
    : String(globalParams.serviceCostPerPump);

  return (
    <aside
      role="complementary"
      aria-label="Global Parameters"
      className="w-[280px] h-full p-6 bg-white border-r border-surface-alternate"
    >
      <div className="flex flex-col gap-6">
        <h2 className="text-lg font-semibold text-gray-900">Global Parameters</h2>

        <div className="flex flex-col gap-4">
          {/* Detection Rate Input */}
          <div>
            <Input
              label="ARGOS Detection Rate"
              type="number"
              min={0}
              max={100}
              step={1}
              value={displayDetectionRate}
              onChange={handleDetectionRateChange}
              onBlur={handleDetectionRateBlur}
              onFocus={handleDetectionRateFocus}
              onKeyDown={handleDetectionRateKeyDown}
              error={detectionRateError}
              helperText="Detection probability (0-100%)"
            />
          </div>

          {/* Service Cost Input */}
          <div>
            <Input
              label="ARGOS Service Cost (per pump/year)"
              type="number"
              min={1}
              step={100}
              value={displayServiceCost}
              onChange={handleServiceCostChange}
              onBlur={handleServiceCostBlur}
              onFocus={handleServiceCostFocus}
              onKeyDown={handleServiceCostKeyDown}
              error={serviceCostError}
              helperText="Amount in EUR"
            />
            {!isServiceCostFocused && !serviceCostError && (
              <div className="mt-1 text-sm text-gray-600">
                {formatServiceCost(globalParams.serviceCostPerPump)}
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
