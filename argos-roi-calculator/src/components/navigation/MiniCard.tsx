import { clsx } from 'clsx';
import { useAppStore } from '@/stores/app-store';
import {
  calculateTotalFailureCost,
  calculateArgosServiceCost,
  calculateSavings,
  calculateROI,
  isAnalysisCalculable,
} from '@/lib/calculations';
import { ROI_NEGATIVE_THRESHOLD, ROI_WARNING_THRESHOLD } from '@/lib/constants';
import type { Analysis } from '@/types';

export interface MiniCardProps {
  analysis: Analysis;
  isActive: boolean;
  onClick: () => void;
}

function getRoiBadgeColor(roi: number): string {
  if (roi < ROI_NEGATIVE_THRESHOLD) return '#CC0000';
  if (roi < ROI_WARNING_THRESHOLD) return '#FF8C00';
  return '#28A745';
}

function getRoiBorderColor(roi: number): string {
  if (roi < ROI_NEGATIVE_THRESHOLD) return 'border-l-[#CC0000]';
  if (roi < ROI_WARNING_THRESHOLD) return 'border-l-[#FF8C00]';
  return 'border-l-[#28A745]';
}

function formatCompactCurrency(value: number): string {
  if (value < 0) {
    return `-€${Math.abs(value).toLocaleString('fr-FR')}`;
  }
  return `€${value.toLocaleString('fr-FR')}`;
}

function formatCompactROI(roi: number): string {
  return `${roi.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;
}

export function MiniCard({ analysis, isActive, onClick }: MiniCardProps) {
  const globalParams = useAppStore((state) => state.globalParams);

  const calculable = isAnalysisCalculable(analysis);

  const waferQuantity = analysis.waferType === 'mono' ? 1 : analysis.waferQuantity;

  const totalFailureCost = calculable
    ? calculateTotalFailureCost(
        analysis.pumpQuantity,
        analysis.failureRatePercentage,
        analysis.waferCost,
        waferQuantity,
        analysis.downtimeDuration,
        analysis.downtimeCostPerHour,
      )
    : null;

  const argosServiceCost = calculable
    ? calculateArgosServiceCost(analysis.pumpQuantity, globalParams.serviceCostPerPump)
    : null;

  const detectionRate = analysis.detectionRate ?? globalParams.detectionRate;

  const savings =
    totalFailureCost !== null && argosServiceCost !== null
      ? calculateSavings(totalFailureCost, argosServiceCost, detectionRate)
      : null;

  const roi =
    savings !== null && argosServiceCost !== null
      ? calculateROI(savings, argosServiceCost)
      : null;

  const borderColorClass =
    roi !== null ? getRoiBorderColor(roi) : 'border-l-gray-300';

  return (
    <button
      type="button"
      aria-label={`Analysis ${analysis.name}`}
      aria-current={isActive ? 'true' : undefined}
      className={clsx(
        'w-full p-3 rounded-lg border-l-2 text-left transition-colors',
        borderColorClass,
        isActive
          ? 'bg-red-50/30 border border-[#CC0000]'
          : 'bg-white hover:bg-gray-50 border border-transparent',
      )}
      onClick={onClick}
    >
      <p className="text-sm font-semibold text-gray-900 truncate">
        {analysis.name}
      </p>
      <p className="mt-1 text-base font-bold text-gray-900">
        {savings !== null ? formatCompactCurrency(savings) : '--'}
      </p>
      <div className="mt-1 flex items-center gap-1.5">
        {roi !== null ? (
          <>
            <span
              data-testid="roi-badge"
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: getRoiBadgeColor(roi) }}
            />
            <span className="text-xs font-medium text-gray-600">
              {formatCompactROI(roi)}
            </span>
          </>
        ) : (
          <span className="text-xs text-gray-400">--</span>
        )}
      </div>
    </button>
  );
}
