import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { NewAnalysisButton } from '@/components/analysis/NewAnalysisButton';
import { AnalysisCreationModal } from '@/components/analysis/AnalysisCreationModal';
import { useAppStore } from '@/stores/app-store';
import { buildFocusModeRoute } from '@/lib/constants';
import type { Analysis } from '@/types';

export function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const analyses = useAppStore((state) => state.analyses);
  const addAnalysis = useAppStore((state) => state.addAnalysis);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Analyses - ARGOS ROI Calculator';
  }, []);

  const handleCreateAnalysis = useCallback(
    (name: string) => {
      const newAnalysis: Analysis = {
        id: crypto.randomUUID(),
        name: name.trim(),
        pumpType: '',
        pumpQuantity: 0,
        failureRateMode: 'percentage',
        failureRatePercentage: 10,
        absoluteFailureCount: undefined,
        waferType: 'mono',
        waferQuantity: 1,
        waferCost: 0,
        downtimeDuration: 0,
        downtimeCostPerHour: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const prevCount = useAppStore.getState().analyses.length;
      addAnalysis(newAnalysis);

      // Verify analysis was actually added before navigating
      if (useAppStore.getState().analyses.length > prevCount) {
        setIsModalOpen(false);
        navigate(buildFocusModeRoute(newAnalysis.id));
      }
    },
    [addAnalysis, navigate],
  );

  const hasAnalyses = analyses.length > 0;

  return (
    <AppLayout>
      {hasAnalyses ? (
        <div>
          <div className="flex justify-end mb-6">
            <NewAnalysisButton onClick={() => setIsModalOpen(true)} />
          </div>
          {/* Analysis grid — Story 3.1 */}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-6">
          <svg
            className="w-16 h-16 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900">
            Aucune analyse créée
          </h2>
          <p className="text-base text-gray-600">
            Créez votre première analyse pour commencer
          </p>
          <NewAnalysisButton onClick={() => setIsModalOpen(true)} />
        </div>
      )}

      <AnalysisCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateAnalysis}
      />
    </AppLayout>
  );
}
