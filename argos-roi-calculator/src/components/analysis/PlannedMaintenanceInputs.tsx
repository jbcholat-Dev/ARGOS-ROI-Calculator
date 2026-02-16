import { useId } from 'react';
import { clsx } from 'clsx';
import { useAppStore } from '@/stores/app-store';
import { calculatePlannedOverhaulSavings } from '@/lib/calculations';

export interface PlannedMaintenanceInputsProps {
  analysisId: string;
}

export function PlannedMaintenanceInputs({ analysisId }: PlannedMaintenanceInputsProps) {
  const analysis = useAppStore((state) =>
    state.analyses.find((a) => a.id === analysisId),
  );
  const updateAnalysis = useAppStore((state) => state.updateAnalysis);

  const intervalId = useId();
  const mtbfId = useId();
  const residualId = useId();

  if (!analysis) return null;

  const { currentOverhauls, argosOverhauls } = calculatePlannedOverhaulSavings(
    analysis.pumpQuantity,
    analysis.pmIntervalMonths,
    analysis.overhaulCostPerPump,
    analysis.argosMtbfExtensionPercent,
  );

  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.trim() === '') {
      updateAnalysis(analysisId, { pmIntervalMonths: 0 });
      return;
    }
    const parsed = Number(value);
    if (!isNaN(parsed) && parsed >= 0) {
      updateAnalysis(analysisId, { pmIntervalMonths: parsed });
    }
  };

  const handleMtbfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    updateAnalysis(analysisId, { argosMtbfExtensionPercent: value });
  };

  const handleResidualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.trim() === '') {
      updateAnalysis(analysisId, { unplannedDespitePM: 0 });
      return;
    }
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      updateAnalysis(analysisId, { unplannedDespitePM: parsed });
    }
  };

  const formatOverhauls = (value: number): string => {
    return value.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  return (
    <section aria-label="Planned Maintenance">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Planned Maintenance
      </h2>
      <div className="flex flex-col gap-4">
        {/* PM Interval */}
        <div className="flex flex-col gap-1">
          <label htmlFor={intervalId} className="text-base font-medium text-gray-900">
            PM Interval (months)
          </label>
          <div className="relative">
            <input
              id={intervalId}
              type="number"
              step="1"
              min="1"
              placeholder="ex: 24"
              value={analysis.pmIntervalMonths === 0 ? '' : String(analysis.pmIntervalMonths)}
              onChange={handleIntervalChange}
              className={clsx(
                'w-full px-4 py-2 pr-20',
                'rounded',
                'text-base',
                'border border-gray-300',
                'bg-white text-gray-900',
                'transition-colors',
                'focus:border-pfeiffer-red focus:outline-none focus:ring-2 focus:ring-pfeiffer-red',
              )}
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
              months
            </span>
          </div>
        </div>

        {/* ARGOS MTBF Extension Slider */}
        <div className="flex flex-col gap-1">
          <label htmlFor={mtbfId} className="text-base font-medium text-gray-900">
            ARGOS MTBF Extension
          </label>
          <div className="flex items-center gap-3">
            <input
              id={mtbfId}
              type="range"
              min="10"
              max="30"
              step="5"
              value={analysis.argosMtbfExtensionPercent}
              onChange={handleMtbfChange}
              className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-600"
              aria-valuemin={10}
              aria-valuemax={30}
              aria-valuenow={analysis.argosMtbfExtensionPercent}
              aria-valuetext={`${analysis.argosMtbfExtensionPercent}%`}
            />
            <span className="w-12 text-right text-base font-medium text-gray-900">
              {analysis.argosMtbfExtensionPercent}%
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Interval extension thanks to ARGOS condition monitoring
          </p>
        </div>

        {/* Unplanned Despite PM */}
        <div className="flex flex-col gap-1">
          <label htmlFor={residualId} className="text-base font-medium text-gray-900">
            Unplanned Failures Despite PM
          </label>
          <input
            id={residualId}
            type="number"
            step="1"
            min="0"
            placeholder="0"
            value={analysis.unplannedDespitePM === 0 ? '' : String(analysis.unplannedDespitePM)}
            onChange={handleResidualChange}
            className={clsx(
              'w-full px-4 py-2',
              'rounded',
              'text-base',
              'border border-gray-300',
              'bg-white text-gray-900',
              'transition-colors',
              'focus:border-pfeiffer-red focus:outline-none focus:ring-2 focus:ring-pfeiffer-red',
            )}
          />
          <p className="text-sm text-gray-500">
            Optional: residual failures that occur despite the PM schedule
          </p>
        </div>

        {/* Calculated Overhaul Rates (read-only) */}
        {analysis.pumpQuantity > 0 && analysis.pmIntervalMonths > 0 && (
          <div className="rounded-lg bg-blue-50 p-4" aria-label="Overhaul projections">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current overhauls/year</span>
              <span className="font-medium text-gray-900" data-testid="current-overhauls">
                {formatOverhauls(currentOverhauls)}
              </span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-gray-600">Projected with ARGOS</span>
              <span className="font-medium text-green-700" data-testid="projected-overhauls">
                {formatOverhauls(argosOverhauls)}
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
