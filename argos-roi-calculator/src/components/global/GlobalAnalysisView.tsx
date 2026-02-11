import { useMemo } from 'react';
import { useAppStore } from '@/stores/app-store';
import { calculateAggregatedMetrics, getROIColorClass } from '@/lib/calculations';
import { formatCurrency, formatPercentage } from '@/lib/utils';

export function GlobalAnalysisView() {
  const analyses = useAppStore((state) => state.analyses);
  const globalParams = useAppStore((state) => state.globalParams);

  const aggregated = useMemo(
    () => calculateAggregatedMetrics(analyses, globalParams),
    [analyses, globalParams],
  );

  const roiColorClass = getROIColorClass(aggregated.overallROI);
  const savingsColorClass =
    aggregated.totalSavings > 0
      ? 'text-green-600'
      : aggregated.totalSavings < 0
        ? 'text-red-600'
        : 'text-gray-700';

  if (aggregated.processCount === 0) {
    if (aggregated.excludedCount > 0) {
      return (
        <p className="text-center text-gray-500">
          {`${aggregated.excludedCount} ${aggregated.excludedCount > 1 ? 'analyses' : 'analysis'} with incomplete data — fill in all required fields to see aggregated metrics`}
        </p>
      );
    }
    return null;
  }

  return (
    <section role="region" aria-label="Aggregated ROI metrics">
      <div className="rounded-xl bg-gray-50 p-8 md:p-12">
        <div className="grid grid-cols-2 gap-8 md:gap-12">
          <div>
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Total Savings
            </h2>
            <p className={`mt-2 text-4xl font-bold ${savingsColorClass}`}>
              {formatCurrency(aggregated.totalSavings)}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Overall ROI
            </h2>
            <p className={`mt-2 text-4xl font-bold ${roiColorClass}`}>
              {formatPercentage(aggregated.overallROI)}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Total Pumps Monitored
            </h2>
            <p className="mt-2 text-2xl font-semibold text-gray-700">
              {aggregated.totalPumps.toLocaleString('fr-FR')}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Processes Analyzed
            </h2>
            <p className="mt-2 text-2xl font-semibold text-gray-700">
              {aggregated.processCount}
            </p>
          </div>
        </div>

        <hr className="my-8 border-gray-200" />

        <div className="grid grid-cols-2 gap-8">
          <div>
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Total Failure Cost
            </h2>
            <p className="mt-2 text-xl font-medium text-gray-600">
              {formatCurrency(aggregated.totalFailureCost)}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Total Service Cost
            </h2>
            <p className="mt-2 text-xl font-medium text-gray-600">
              {formatCurrency(aggregated.totalServiceCost)}
            </p>
          </div>
        </div>
      </div>

      {aggregated.excludedCount > 0 && (
        <p className="mt-4 text-sm text-gray-500">
          {`${aggregated.excludedCount} ${aggregated.excludedCount > 1 ? 'analyses' : 'analysis'} excluded (incomplete data)`}
        </p>
      )}
    </section>
  );
}
