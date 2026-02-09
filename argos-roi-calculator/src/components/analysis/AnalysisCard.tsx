import { useMemo } from 'react';
import { clsx } from 'clsx';
import { Card } from '@/components/ui';
import {
  calculateTotalFailureCost,
  calculateArgosServiceCost,
  calculateSavings,
  calculateROI,
  getROIColorClass,
} from '@/lib/calculations';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { DEFAULT_DETECTION_RATE, DEFAULT_SERVICE_COST_PER_PUMP } from '@/lib/constants';
import type { Analysis } from '@/types';

export interface AnalysisCardProps {
  /**
   * The analysis to display
   */
  analysis: Analysis;
  /**
   * Whether this analysis is the active one (highlighted border)
   */
  isActive: boolean;
}

/**
 * AnalysisCard displays a summary of an analysis for the Dashboard Grid.
 *
 * Shows: process name, pump count, ROI percentage (with traffic-light color), and savings amount.
 *
 * @example
 * <AnalysisCard analysis={analysis} isActive={true} />
 */
export function AnalysisCard({ analysis, isActive }: AnalysisCardProps) {
  // Calculate wafer quantity based on type
  const waferQuantity = analysis.waferType === 'mono' ? 1 : analysis.waferQuantity;

  // Use per-analysis detection rate, fallback to global default (Story 2.9 pattern)
  const detectionRate = analysis.detectionRate ?? DEFAULT_DETECTION_RATE;

  // Memoize calculations to prevent unnecessary re-computation (NFR-P6: 5 concurrent analyses)
  const { totalFailureCost, argosServiceCost, savings, roi } = useMemo(() => {
    const totalCost = calculateTotalFailureCost(
      analysis.pumpQuantity,
      analysis.failureRatePercentage,
      analysis.waferCost,
      waferQuantity,
      analysis.downtimeDuration,
      analysis.downtimeCostPerHour,
    );

    const serviceCost = calculateArgosServiceCost(
      analysis.pumpQuantity,
      DEFAULT_SERVICE_COST_PER_PUMP,
    );

    const calculatedSavings = calculateSavings(totalCost, serviceCost, detectionRate);
    const calculatedROI = calculateROI(calculatedSavings, serviceCost);

    return {
      totalFailureCost: totalCost,
      argosServiceCost: serviceCost,
      savings: calculatedSavings,
      roi: calculatedROI,
    };
  }, [
    analysis.pumpQuantity,
    analysis.failureRatePercentage,
    analysis.waferCost,
    waferQuantity,
    analysis.downtimeDuration,
    analysis.downtimeCostPerHour,
    detectionRate,
  ]);

  // Traffic-light color for ROI
  const roiColorClass = getROIColorClass(roi);

  return (
    <Card
      role="article"
      aria-label={`Analyse ${analysis.name}`}
      className={clsx(
        // Active state border
        isActive && 'border-primary border-2',
      )}
    >
      {/* Process Name */}
      <h3 className="mb-3 text-xl font-semibold text-gray-900">
        {analysis.name}
      </h3>

      {/* Pump Count */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm font-medium text-gray-600">Pompes:</span>
        <span className="text-base font-semibold text-gray-900">{analysis.pumpQuantity}</span>
      </div>

      {/* ROI Percentage (Hero Number) */}
      <div className="mb-2">
        <div className="text-sm font-medium text-gray-600 mb-1">ROI</div>
        <div className={clsx('text-4xl font-bold', roiColorClass)} data-testid="roi-percentage">
          {formatPercentage(roi)}
        </div>
      </div>

      {/* Savings Amount */}
      <div>
        <div className="text-sm font-medium text-gray-600 mb-1">Économies Réalisées</div>
        <div className="text-lg font-semibold text-gray-900" data-testid="savings-amount">
          {formatCurrency(savings)}
        </div>
      </div>
    </Card>
  );
}
