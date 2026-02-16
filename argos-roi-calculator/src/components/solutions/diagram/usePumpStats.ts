import { useMemo } from 'react';
import { useAppStore } from '@/stores/app-store';
import { calculatePumpStats } from '@/lib/calculations';

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

    const stats = calculatePumpStats(analyses);

    return {
      pumpClusters: clusters,
      totalPumps: stats.totalPumps,
      modelCount: new Set(analyses.map((a) => a.pumpType).filter(Boolean)).size,
      processCount: stats.processCount,
    };
  }, [analyses]);

  return { pumpClusters, totalPumps, modelCount, processCount };
}
