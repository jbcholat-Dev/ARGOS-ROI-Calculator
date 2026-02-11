import { formatCurrency } from '@/lib/utils';
import { DEFAULT_DETECTION_RATE, DEFAULT_SERVICE_COST_PER_PUMP } from '@/lib/constants';
import type { Analysis, GlobalParams } from '@/types';

export interface AnalysisSummaryProps {
  analysis: Analysis;
  globalParams: GlobalParams;
}

export function AnalysisSummary({ analysis, globalParams }: AnalysisSummaryProps) {
  const detectionRate = analysis.detectionRate ?? globalParams.detectionRate ?? DEFAULT_DETECTION_RATE;
  const waferQuantity = analysis.waferType === 'mono' ? 1 : analysis.waferQuantity;

  return (
    <div className="flex flex-col gap-6">
      {/* Equipment Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Equipment</h3>
        <div className="flex flex-col gap-3">
          <div>
            <span className="text-sm text-gray-500">Pump Model</span>
            <p className="text-base font-medium text-gray-900">
              {analysis.pumpType || '—'}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Pumps</span>
            <p className="text-base font-medium text-gray-900">
              {analysis.pumpQuantity}
            </p>
          </div>
        </div>
      </div>

      {/* Failure Rate Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Failure Rate</h3>
        <div>
          <span className="text-sm text-gray-500">
            {analysis.failureRateMode === 'absolute' ? 'Failures' : 'Failure Rate'}
          </span>
          <p className="text-base font-medium text-gray-900">
            {analysis.failureRateMode === 'absolute' && analysis.absoluteFailureCount !== undefined
              ? `${analysis.absoluteFailureCount} / ${analysis.pumpQuantity} pumps = ${analysis.failureRatePercentage.toFixed(1)}%`
              : `${analysis.failureRatePercentage.toFixed(1)}% (Percentage mode)`}
          </p>
        </div>
      </div>

      {/* Detection Rate Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Detection Rate</h3>
        <div>
          <span className="text-sm text-gray-500">Detection Rate</span>
          <p className="text-base font-medium text-gray-900">
            {detectionRate}%
          </p>
        </div>
      </div>

      {/* Wafer Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Wafer</h3>
        <div className="flex flex-col gap-3">
          <div>
            <span className="text-sm text-gray-500">Type</span>
            <p className="text-base font-medium text-gray-900">
              {analysis.waferType === 'mono' ? 'Mono' : 'Batch'}
            </p>
          </div>
          {analysis.waferType === 'batch' && (
            <div>
              <span className="text-sm text-gray-500">Wafers/Batch</span>
              <p className="text-base font-medium text-gray-900">
                {waferQuantity}
              </p>
            </div>
          )}
          <div>
            <span className="text-sm text-gray-500">Cost per Wafer</span>
            <p className="text-base font-medium text-gray-900">
              {formatCurrency(analysis.waferCost)}
            </p>
          </div>
        </div>
      </div>

      {/* Downtime Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Downtime</h3>
        <div className="flex flex-col gap-3">
          <div>
            <span className="text-sm text-gray-500">Duration</span>
            <p className="text-base font-medium text-gray-900">
              {analysis.downtimeDuration}h
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Cost/Hour</span>
            <p className="text-base font-medium text-gray-900">
              {formatCurrency(analysis.downtimeCostPerHour)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
