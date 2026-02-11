import { useEffect, useMemo, useCallback } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { ROUTES, buildComparisonRoute } from '@/lib/constants';
import { isAnalysisCalculable } from '@/lib/calculations';
import { AppLayout } from '@/components/layout/AppLayout';
import { EditableAnalysisName, EquipmentInputs, FailureRateInput, DetectionRateInput, WaferInputs, DowntimeInputs, ResultsPanel } from '@/components/analysis';
import { useAppStore } from '@/stores/app-store';

// Validate analysis ID format (alphanumeric, dashes, max 100 chars)
const isValidAnalysisId = (id: string): boolean => {
  if (!id || id.length === 0 || id.length > 100) return false;
  // Allow alphanumeric, dashes, underscores (common ID formats)
  return /^[a-zA-Z0-9-_]+$/.test(id);
};

export function FocusMode() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const analysis = useAppStore((state) =>
    state.analyses.find((a) => a.id === id)
  );
  const activeAnalysisId = useAppStore((state) => state.activeAnalysisId);
  const updateAnalysis = useAppStore((state) => state.updateAnalysis);
  const duplicateAnalysis = useAppStore((state) => state.duplicateAnalysis);
  const setActiveAnalysis = useAppStore((state) => state.setActiveAnalysis);
  const analyses = useAppStore((state) => state.analyses);
  const allAnalysisNames = useMemo(
    () => analyses.map((a) => a.name),
    [analyses]
  );

  const analysisExists = !!analysis;

  // Set active analysis on mount (only if analysis exists in store)
  useEffect(() => {
    if (id && analysisExists) {
      setActiveAnalysis(id);
    }
  }, [id, analysisExists, setActiveAnalysis]);

  useEffect(() => {
    if (analysis) {
      document.title = `${analysis.name} - ARGOS ROI Calculator`;
    } else if (id && isValidAnalysisId(id)) {
      document.title = `Analysis ${id} - ARGOS ROI Calculator`;
    }
  }, [id, analysis]);

  // Redirect to dashboard if ID is missing or invalid
  if (!id || !isValidAnalysisId(id)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  // Redirect to dashboard if analysis doesn't exist in store
  if (!analysis) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  const handleNameUpdate = useCallback(
    (newName: string) => {
      updateAnalysis(analysis.id, { name: newName });
    },
    [analysis.id, updateAnalysis]
  );

  const handleWhatIf = useCallback(() => {
    duplicateAnalysis(analysis.id);
    const newId = useAppStore.getState().activeAnalysisId;
    if (newId) {
      updateAnalysis(newId, { name: `${analysis.name} (What If)` });
      navigate(buildComparisonRoute(analysis.id, newId));
    }
  }, [analysis.id, analysis.name, duplicateAnalysis, updateAnalysis, navigate]);

  const canWhatIf = isAnalysisCalculable(analysis);

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <EditableAnalysisName
            analysisId={analysis.id}
            currentName={analysis.name}
            onUpdate={handleNameUpdate}
            showActiveBadge={activeAnalysisId === analysis.id}
            existingNames={allAnalysisNames}
          />
          <button
            onClick={handleWhatIf}
            disabled={!canWhatIf}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            What If
          </button>
        </div>
        <div className="flex flex-col gap-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <EquipmentInputs analysisId={id} />
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <FailureRateInput analysisId={id} />
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <DetectionRateInput analysisId={id} />
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <WaferInputs analysisId={id} />
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <DowntimeInputs analysisId={id} />
          </div>
          <div className="mt-2 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <ResultsPanel analysisId={id} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
