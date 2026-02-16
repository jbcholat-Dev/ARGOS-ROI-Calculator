import { useAppStore } from '@/stores/app-store';
import type { MaintenanceStrategy } from '@/types';

export interface MaintenanceStrategySelectorProps {
  analysisId: string;
}

const STRATEGIES: { value: MaintenanceStrategy; label: string; description: string }[] = [
  {
    value: 'unplanned',
    label: 'Unplanned',
    description: 'Run to fail — ARGOS anticipates failures',
  },
  {
    value: 'planned',
    label: 'Planned',
    description: 'Fixed-interval PM — ARGOS extends interval',
  },
];

export function MaintenanceStrategySelector({ analysisId }: MaintenanceStrategySelectorProps) {
  const analysis = useAppStore((state) =>
    state.analyses.find((a) => a.id === analysisId),
  );
  const updateAnalysis = useAppStore((state) => state.updateAnalysis);

  if (!analysis) return null;

  const handleChange = (strategy: MaintenanceStrategy) => {
    updateAnalysis(analysisId, { maintenanceStrategy: strategy });
  };

  return (
    <fieldset aria-label="Maintenance Strategy">
      <legend className="mb-3 text-lg font-semibold text-gray-900">
        Maintenance Strategy
      </legend>
      <div className="flex gap-3">
        {STRATEGIES.map((s) => {
          const isSelected = analysis.maintenanceStrategy === s.value;
          const inputId = `strategy-${s.value}-${analysisId}`;
          return (
            <label
              key={s.value}
              htmlFor={inputId}
              className={`flex flex-1 cursor-pointer flex-col rounded-lg border-2 p-4 transition-colors ${
                isSelected
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  id={inputId}
                  type="radio"
                  name={`maintenance-strategy-${analysisId}`}
                  value={s.value}
                  checked={isSelected}
                  onChange={() => handleChange(s.value)}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-base font-medium text-gray-900">
                  {s.label}
                </span>
              </div>
              <p className="mt-1 pl-6 text-sm text-gray-500">
                {s.description}
              </p>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
