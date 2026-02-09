/**
 * DetectionRateInput - Per-Analysis Detection Rate Input
 * Story 2.9: Detection Rate Per Analysis
 *
 * Allows users to specify ARGOS detection rate for each analysis.
 * Different failure types have different detectability:
 * - Bearing failures: ~85% detection rate
 * - Process failures: ~50% detection rate
 */

import { useCallback } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Input } from '@/components/ui/Input';
import { validateDetectionRate } from '@/lib/validation/equipment-validation';

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
  // Zustand selector pattern: subscribe only to specific analysis detectionRate
  const detectionRate = useAppStore(
    (state) =>
      state.analyses.find((a) => a.id === analysisId)?.detectionRate ?? 70
  );
  const updateAnalysis = useAppStore((state) => state.updateAnalysis);

  // Check if analysis exists
  const analysisExists = useAppStore((state) =>
    state.analyses.some((a) => a.id === analysisId)
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value);

      // Check if value is NaN (happens when input is empty or invalid)
      if (isNaN(value)) {
        return;
      }

      // Validate range (0-100)
      const error = validateDetectionRate(value);
      if (error) {
        // Validation error - don't update store
        return;
      }

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
        Taux de Détection ARGOS (%)
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
      />
      <p
        id={`detection-rate-helper-${analysisId}`}
        className="text-sm text-gray-500"
      >
        Probabilité de détecter une panne avant qu'elle ne se produise (défaut:
        70%)
      </p>
    </div>
  );
}
