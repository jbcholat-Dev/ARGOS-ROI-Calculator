import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PlaceholderMessage } from '@/components/PlaceholderMessage';
import { GlobalAnalysisView } from '@/components/global/GlobalAnalysisView';
import { useAppStore } from '@/stores/app-store';

export function GlobalAnalysis() {
  const analysesCount = useAppStore((state) => state.analyses.length);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Global Analysis — ARGOS ROI Calculator';
  }, []);

  return (
    <AppLayout>
      <div className="p-6">
        <h1 className="mb-6 text-2xl font-semibold">Global Analysis</h1>
        {analysesCount === 0 ? (
          <PlaceholderMessage
            message="No analyses yet — create one first"
            actionText="Create Analysis"
            onAction={() => navigate('/')}
          />
        ) : (
          <GlobalAnalysisView />
        )}
      </div>
    </AppLayout>
  );
}
