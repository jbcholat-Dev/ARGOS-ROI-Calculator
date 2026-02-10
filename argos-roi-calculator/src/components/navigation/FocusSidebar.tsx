import { MiniCard } from './MiniCard';
import { ServiceCostInput } from '@/components/shared/ServiceCostInput';
import type { Analysis } from '@/types';

export interface FocusSidebarProps {
  analyses: Analysis[];
  activeAnalysisId: string;
  onSelectAnalysis: (id: string) => void;
}

export function FocusSidebar({ analyses, activeAnalysisId, onSelectAnalysis }: FocusSidebarProps) {
  return (
    <aside
      role="complementary"
      aria-label="Analysis Navigation"
      className="w-[280px] h-full bg-white border-r border-surface-alternate flex flex-col"
    >
      <div className="p-4 pb-2">
        <h2 className="text-lg font-semibold text-gray-900">Analyses</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-2">
        {analyses.map((analysis) => (
          <MiniCard
            key={analysis.id}
            analysis={analysis}
            isActive={analysis.id === activeAnalysisId}
            onClick={() => onSelectAnalysis(analysis.id)}
          />
        ))}
      </div>

      <div className="border-t border-gray-200 p-4">
        <ServiceCostInput />
      </div>
    </aside>
  );
}
