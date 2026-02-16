import { useMemo } from 'react';
import { useAppStore } from '@/stores/app-store';

export interface PumpCluster {
  id: string;
  processName: string;
  model: string;
  quantity: number;
}

export function usePumpStats() {
  const analyses = useAppStore((state) => state.analyses);

  const { pumpClusters, totalPumps, modelCount, processCount } = useMemo(() => {
    const clusters = analyses
      .filter((a) => a.name?.trim() && a.pumpType?.trim())
      .map((a) => ({
        id: a.id,
        processName: a.name,
        model: a.pumpType,
        quantity: a.pumpQuantity || 0,
      }));

    return {
      pumpClusters: clusters,
      totalPumps: analyses.reduce((sum, a) => sum + (a.pumpQuantity || 0), 0),
      modelCount: new Set(analyses.map((a) => a.pumpType).filter(Boolean)).size,
      processCount: clusters.length,
    };
  }, [analyses]);

  return { pumpClusters, totalPumps, modelCount, processCount };
}
