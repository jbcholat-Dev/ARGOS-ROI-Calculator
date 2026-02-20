import { useId } from 'react';
import { clsx } from 'clsx';
import { useAppStore } from '@/stores/app-store';

export interface MtbfInputProps {
  analysisId: string;
}

export function MtbfInput({ analysisId }: MtbfInputProps) {
  const analysis = useAppStore((state) =>
    state.analyses.find((a) => a.id === analysisId),
  );
  const updateAnalysis = useAppStore((state) => state.updateAnalysis);

  const mtbfInputId = useId();
  const mtbfHintId = useId();

  if (!analysis) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.trim() === '') {
      updateAnalysis(analysisId, { mtbf: 0 });
      return;
    }
    const num = Number(value);
    if (Number.isFinite(num) && num >= 0) {
      updateAnalysis(analysisId, { mtbf: num });
    }
  };

  return (
    <section aria-label="MTBF">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">MTBF</h2>
      <div className="flex flex-col gap-1">
        <label htmlFor={mtbfInputId} className="text-base font-medium text-gray-900">
          MTBF (months)
        </label>
        <div className="relative">
          <input
            id={mtbfInputId}
            type="number"
            min="0"
            step="1"
            placeholder="ex: 18"
            value={analysis.mtbf === 0 ? '' : String(analysis.mtbf)}
            onChange={handleChange}
            aria-invalid="false"
            aria-describedby={mtbfHintId}
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
        <p id={mtbfHintId} className="text-xs text-gray-500">
          Informational — not used in ROI calculation
        </p>
      </div>
    </section>
  );
}
