import { useMemo } from 'react';
import { useAppStore } from '@/stores/app-store';

export function PreFilledContext() {
  const analyses = useAppStore((state) => state.analyses);

  const totalPumps = useMemo(
    () => analyses.reduce((sum, a) => sum + (a.pumpQuantity || 0), 0),
    [analyses],
  );

  const pumpModelClusters = useMemo(() => {
    const clusters = new Map<string, number>();
    analyses.forEach((a) => {
      if (a.pumpType) {
        clusters.set(
          a.pumpType,
          (clusters.get(a.pumpType) || 0) + (a.pumpQuantity || 0),
        );
      }
    });
    return Array.from(clusters.entries());
  }, [analyses]);

  const processNames = useMemo(
    () => analyses.map((a) => a.name).filter(Boolean),
    [analyses],
  );

  const isEmpty = analyses.length === 0;

  return (
    <section
      aria-label="Pre-filled context from ROI analyses"
      className="rounded-lg border p-6 border-gray-200 bg-gray-50"
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="inline-block rounded-full px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700">
          From ROI Analysis
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Total Pumps to Monitor
          </h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {isEmpty ? '—' : totalPumps}
          </p>
        </div>

        <div>
          <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Processes
          </h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {isEmpty ? '—' : processNames.length}
          </p>
          {!isEmpty && processNames.length > 0 && (
            <p className="break-words mt-1 text-sm text-gray-600">
              {processNames.join(', ')}
            </p>
          )}
          {isEmpty && (
            <p className="mt-1 text-sm text-gray-500">None</p>
          )}
        </div>

        {pumpModelClusters.length > 0 && (
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Pump Models
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {pumpModelClusters.map(([model, count]) => (
                <span
                  key={model}
                  className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-gray-200 text-gray-700"
                >
                  {model}: {count}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
