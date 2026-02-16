import { useState, useId } from 'react';
import { clsx } from 'clsx';
import { useAppStore } from '@/stores/app-store';
import {
  isAnalysisCalculable,
  calculateStrategySavings,
  calculatePlannedOverhaulSavings,
  calculateArgosServiceCost,
  calculateROI,
  getROIColorClass,
} from '@/lib/calculations';

export interface ResultsPanelProps {
  analysisId: string;
}

interface FormulaTooltipProps {
  formula: string;
  tooltipId: string;
  children: React.ReactNode;
}

function FormulaTooltip({ formula, tooltipId, children }: FormulaTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span className="relative inline-flex items-center gap-1">
      {children}
      <button
        type="button"
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-xs text-gray-400 hover:text-gray-600 focus:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="View calculation formula"
        aria-describedby={isVisible ? tooltipId : undefined}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
      >
        &#9432;
      </button>
      {isVisible && (
        <span
          id={tooltipId}
          role="tooltip"
          className="absolute bottom-full left-0 z-10 mb-2 max-w-xs rounded bg-gray-800 px-3 py-2 text-sm text-white shadow-lg"
        >
          {formula}
        </span>
      )}
    </span>
  );
}

const FORMULAS_UNPLANNED = {
  totalFailureCost: '(defect events × wafer cost × wafers/batch) + (failed pumps × downtime hours × cost/hour × bottleneck multiplier)',
  argosServiceCost: 'pumps × service cost per pump/year',
  savings: 'failure cost × detection rate % − service cost',
  roi: '(savings ÷ service cost) × 100',
} as const;

const FORMULAS_PLANNED = {
  totalFailureCost: '(overhauls/year × overhaul cost) + residual failure cost',
  argosServiceCost: 'pumps × service cost per pump/year',
  savings: 'overhaul savings + residual savings − service cost',
  roi: '(savings ÷ service cost) × 100',
} as const;

function formatCurrency(value: number): string {
  if (value < 0) {
    return `-€${Math.abs(value).toLocaleString('fr-FR')}`;
  }
  return `€${value.toLocaleString('fr-FR')}`;
}

function formatROIValue(roi: number): string {
  return `${roi.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;
}

export function ResultsPanel({ analysisId }: ResultsPanelProps) {
  const tooltipBaseId = useId();
  const analysis = useAppStore((state) =>
    state.analyses.find((a) => a.id === analysisId)
  );
  const globalParams = useAppStore((state) => state.globalParams);

  if (!analysis) return null;

  const isPlanned = analysis.maintenanceStrategy === 'planned';
  const formulas = isPlanned ? FORMULAS_PLANNED : FORMULAS_UNPLANNED;
  const isFullyCalculable = isAnalysisCalculable(analysis);
  const canShowServiceCost = analysis.pumpQuantity > 0;

  let totalFailureCost: number | null = null;
  let savingsValue: number | null = null;
  let argosServiceCost: number | null = null;

  if (isFullyCalculable) {
    const result = calculateStrategySavings(analysis, globalParams);
    totalFailureCost = result.totalFailureCost;
    savingsValue = result.savings;
    argosServiceCost = result.argosServiceCost;
  } else if (canShowServiceCost) {
    argosServiceCost = calculateArgosServiceCost(analysis.pumpQuantity, globalParams.serviceCostPerPump);
  }

  const roiValue =
    savingsValue !== null && argosServiceCost !== null
      ? calculateROI(savingsValue, argosServiceCost)
      : null;

  const roiColorClass = roiValue !== null ? getROIColorClass(roiValue) : '';

  const savingsColorClass =
    savingsValue !== null
      ? savingsValue > 0
        ? 'text-green-600'
        : savingsValue < 0
          ? 'text-red-600'
          : 'text-gray-500'
      : '';

  // Strategy-specific breakdown for planned mode
  const plannedBreakdown = isPlanned && isFullyCalculable
    ? calculatePlannedOverhaulSavings(
        analysis.pumpQuantity,
        analysis.pmIntervalMonths,
        analysis.overhaulCostPerPump,
        analysis.argosMtbfExtensionPercent,
      )
    : null;

  const detectionRate = analysis.detectionRate ?? globalParams.detectionRate;

  return (
    <section aria-label="Results">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Results</h2>

      {!isFullyCalculable && (
        <p className="mb-4 text-sm text-gray-500">
          Complete the data to see results
        </p>
      )}

      <div className="flex flex-col gap-4">
        {/* Act 1 — The Risk: Total Cost */}
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
          <h3 className="text-sm font-medium text-gray-600">
            <FormulaTooltip formula={formulas.totalFailureCost} tooltipId={`${tooltipBaseId}-total-failure-cost`}>
              {isPlanned ? 'Total Maintenance Cost' : 'Total Failure Cost'}
            </FormulaTooltip>
          </h3>
          <p className="mt-1 text-4xl font-bold text-gray-900" data-testid="total-failure-cost-value">
            {totalFailureCost !== null ? formatCurrency(totalFailureCost) : '--'}
          </p>
          {totalFailureCost !== null && (
            <p className="mt-1 text-sm text-gray-500">/an</p>
          )}
        </div>

        {/* Supporting Context: ARGOS Service Cost */}
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
          <h3 className="text-sm font-medium text-gray-600">
            <FormulaTooltip formula={formulas.argosServiceCost} tooltipId={`${tooltipBaseId}-argos-service-cost`}>
              ARGOS Service Cost
            </FormulaTooltip>
          </h3>
          <p className="mt-1 text-2xl font-bold text-gray-900" data-testid="argos-service-cost-value">
            {argosServiceCost !== null ? formatCurrency(argosServiceCost) : '--'}
          </p>
          {argosServiceCost !== null && (
            <p className="mt-1 text-sm text-gray-500">/an</p>
          )}
        </div>

        {/* Act 2 — The Value: Savings */}
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
          <h3 className="text-sm font-medium text-gray-600">
            <FormulaTooltip formula={formulas.savings} tooltipId={`${tooltipBaseId}-savings`}>
              Savings Realized
            </FormulaTooltip>
          </h3>
          <p
            className={clsx('mt-1 text-4xl font-bold', savingsValue !== null ? savingsColorClass : 'text-gray-900')}
            data-testid="savings-value"
          >
            {savingsValue !== null ? formatCurrency(savingsValue) : '--'}
          </p>
          {savingsValue !== null && (
            <p className="mt-1 text-sm text-gray-500">/an</p>
          )}
        </div>

        {/* Strategy-specific breakdown */}
        {isFullyCalculable && (
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <h3 className="mb-2 text-sm font-medium text-gray-600">
              {isPlanned ? 'Overhaul Savings Breakdown' : 'Cost Avoided Breakdown'}
            </h3>
            {isPlanned && plannedBreakdown ? (
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Overhauls saved/year</span>
                  <span className="font-medium text-gray-900" data-testid="overhauls-saved">
                    {(plannedBreakdown.currentOverhauls - plannedBreakdown.argosOverhauls).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Overhaul savings</span>
                  <span className="font-medium text-green-700" data-testid="overhaul-savings">
                    {formatCurrency(plannedBreakdown.overhaulSavings)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">MTBF extension</span>
                  <span className="font-medium text-gray-900">
                    +{analysis.argosMtbfExtensionPercent}%
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Detection rate applied</span>
                  <span className="font-medium text-gray-900" data-testid="detection-rate-applied">
                    {detectionRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cost avoided (downtime + wafer defect)</span>
                  <span className="font-medium text-green-700" data-testid="cost-avoided">
                    {totalFailureCost !== null ? formatCurrency(totalFailureCost * (detectionRate / 100)) : '--'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Act 3 — The Proof: ROI */}
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
          <h3 className="text-sm font-medium text-gray-600">
            <FormulaTooltip formula={formulas.roi} tooltipId={`${tooltipBaseId}-roi`}>
              ROI
            </FormulaTooltip>
          </h3>
          <p
            className={clsx('mt-1 text-4xl font-bold', roiValue !== null ? roiColorClass : 'text-gray-900')}
            data-testid="roi-value"
          >
            {roiValue !== null ? formatROIValue(roiValue) : '--'}
          </p>
        </div>
      </div>
    </section>
  );
}
