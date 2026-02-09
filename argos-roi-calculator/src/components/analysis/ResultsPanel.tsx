import { useState, useId } from 'react';
import { clsx } from 'clsx';
import { useAppStore } from '@/stores/app-store';
import {
  calculateTotalFailureCost,
  calculateArgosServiceCost,
  calculateSavings,
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
        aria-label="Voir la formule de calcul"
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

const FORMULAS = {
  totalFailureCost: '(pumps × failure rate %) × (wafer cost × wafers/batch + downtime hours × cost/hour)',
  argosServiceCost: 'pumps × service cost per pump/year',
  savings: 'failure cost × detection rate % − service cost',
  roi: '(savings ÷ service cost) × 100',
} as const;

function formatCurrency(value: number): string {
  if (value < 0) {
    return `-€${Math.abs(value).toLocaleString('fr-FR')}`;
  }
  return `€${value.toLocaleString('fr-FR')}`;
}

function formatROI(roi: number): string {
  return `${roi.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;
}

export function ResultsPanel({ analysisId }: ResultsPanelProps) {
  const tooltipBaseId = useId();
  const analysis = useAppStore((state) =>
    state.analyses.find((a) => a.id === analysisId)
  );
  const globalParams = useAppStore((state) => state.globalParams);

  if (!analysis) return null;

  const waferQuantity = analysis.waferType === 'mono' ? 1 : analysis.waferQuantity;

  const isFullyCalculable =
    analysis.pumpQuantity > 0 &&
    analysis.failureRatePercentage > 0 &&
    analysis.waferCost > 0 &&
    analysis.downtimeDuration > 0 &&
    analysis.downtimeCostPerHour > 0;

  const canShowServiceCost = analysis.pumpQuantity > 0;

  const totalFailureCost = isFullyCalculable
    ? calculateTotalFailureCost(
        analysis.pumpQuantity,
        analysis.failureRatePercentage,
        analysis.waferCost,
        waferQuantity,
        analysis.downtimeDuration,
        analysis.downtimeCostPerHour,
      )
    : null;

  const argosServiceCost = canShowServiceCost
    ? calculateArgosServiceCost(analysis.pumpQuantity, globalParams.serviceCostPerPump)
    : null;

  // Story 2.9: Use per-analysis detection rate, fallback to global if undefined
  const detectionRate = analysis.detectionRate ?? globalParams.detectionRate;

  const savingsValue =
    totalFailureCost !== null && argosServiceCost !== null
      ? calculateSavings(totalFailureCost, argosServiceCost, detectionRate)
      : null;

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

  const showIncompleteMessage = !isFullyCalculable;

  return (
    <section aria-label="Résultats">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Résultats</h2>

      {showIncompleteMessage && (
        <p className="mb-4 text-sm text-gray-500">
          Complétez les données pour voir les résultats
        </p>
      )}

      <div className="flex flex-col gap-4">
        {/* Act 1 — The Risk: Total Failure Cost */}
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
          <h3 className="text-sm font-medium text-gray-600">
            <FormulaTooltip formula={FORMULAS.totalFailureCost} tooltipId={`${tooltipBaseId}-total-failure-cost`}>
              Coût Total des Pannes
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
            <FormulaTooltip formula={FORMULAS.argosServiceCost} tooltipId={`${tooltipBaseId}-argos-service-cost`}>
              Coût du Service ARGOS
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
            <FormulaTooltip formula={FORMULAS.savings} tooltipId={`${tooltipBaseId}-savings`}>
              Économies Réalisées
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

        {/* Act 3 — The Proof: ROI */}
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
          <h3 className="text-sm font-medium text-gray-600">
            <FormulaTooltip formula={FORMULAS.roi} tooltipId={`${tooltipBaseId}-roi`}>
              ROI
            </FormulaTooltip>
          </h3>
          <p
            className={clsx('mt-1 text-4xl font-bold', roiValue !== null ? roiColorClass : 'text-gray-900')}
            data-testid="roi-value"
          >
            {roiValue !== null ? formatROI(roiValue) : '--'}
          </p>
        </div>
      </div>
    </section>
  );
}
