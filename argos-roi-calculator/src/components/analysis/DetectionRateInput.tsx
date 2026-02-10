/**
 * DetectionRateInput - Per-Analysis Detection Rate Input
 * Story 2.9: Detection Rate Per Analysis
 *
 * Allows users to specify ARGOS detection rate for each analysis.
 * Different failure types have different detectability:
 * - Bearing failures: ~85% detection rate
 * - Process failures: ~50% detection rate
 */

import { useCallback, useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Input } from '@/components/ui/Input';
import { validateDetectionRate } from '@/lib/validation/equipment-validation';
import { DEFAULT_DETECTION_RATE } from '@/lib/constants';

export interface DetectionRateInputProps {
  analysisId: string;
}

/**
 * Detection Rate Input Component
 *
 * Provides input for per-analysis ARGOS detection rate percentage (0-100).
 * Falls back to default 70% if analysis doesn't have detectionRate set.
 */
export function DetectionRateInput({ analysisId }: DetectionRateInputProps) {
  const [error, setError] = useState<string | null>(null);

  // MEDIUM-4 FIX: Optimized single selector for analysis data
  const analysis = useAppStore((state) =>
    state.analyses.find((a) => a.id === analysisId)
  );
  const updateAnalysis = useAppStore((state) => state.updateAnalysis);

  const detectionRate = analysis?.detectionRate ?? DEFAULT_DETECTION_RATE;
  const analysisExists = !!analysis;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value);

      // Check if value is NaN (happens when input is empty or invalid)
      if (isNaN(value)) {
        return;
      }

      // Validate range (0-100)
      const validationError = validateDetectionRate(value);
      if (validationError) {
        // MEDIUM-1 FIX: Display validation error to user
        setError(validationError);
        return;
      }

      // Clear error if validation passes
      setError(null);

      // Valid value - update store
      updateAnalysis(analysisId, { detectionRate: value });
    },
    [analysisId, updateAnalysis]
  );

  // Return null if analysis not found
  if (!analysisExists) {
    return null;
  }

  return (
    <div className="space-y-2">
      <label
        htmlFor={`detection-rate-${analysisId}`}
        className="block text-sm font-medium text-gray-700"
      >
        ARGOS Detection Rate (%)
      </label>
      <Input
        id={`detection-rate-${analysisId}`}
        type="number"
        min={0}
        max={100}
        step={1}
        value={detectionRate}
        onChange={handleChange}
        aria-describedby={`detection-rate-helper-${analysisId}`}
        aria-invalid={error ? 'true' : 'false'}
      />
      {/* MEDIUM-2 FIX: Follow Epic 2 error display pattern */}
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <p
        id={`detection-rate-helper-${analysisId}`}
        className="text-sm text-gray-500"
      >
        Probability of detecting a failure before it occurs (default: 70%)
      </p>
    </div>
  );
}
