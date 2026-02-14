import { useMemo } from 'react';
import { useAppStore } from '@/stores/app-store';

export interface PumpModelCluster {
  model: string;
  quantity: number;
}

export function usePumpStats() {
  const analyses = useAppStore((state) => state.analyses);

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
    return Array.from(clusters.entries()).map(([model, quantity]) => ({ model, quantity }));
  }, [analyses]);

  const totalPumps = useMemo(
    () => analyses.reduce((sum, a) => sum + (a.pumpQuantity || 0), 0),
    [analyses],
  );

  const modelCount = useMemo(
    () => new Set(analyses.map((a) => a.pumpType).filter(Boolean)).size,
    [analyses],
  );

  const processCount = analyses.length;

  return { pumpModelClusters, totalPumps, modelCount, processCount };
}
