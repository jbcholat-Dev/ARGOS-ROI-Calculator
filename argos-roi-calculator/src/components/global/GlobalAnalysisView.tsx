import { useMemo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/app-store';
import { calculateAggregatedMetrics, calculateAllAnalysisRows, getROIColorClass } from '@/lib/calculations';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { ComparisonTable } from './ComparisonTable';
import { Button } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { ROUTES } from '@/lib/constants';

export function GlobalAnalysisView() {
  const analyses = useAppStore((state) => state.analyses);
  const globalParams = useAppStore((state) => state.globalParams);
  const setActiveAnalysis = useAppStore((state) => state.setActiveAnalysis);
  const excludedFromGlobal = useAppStore((state) => state.excludedFromGlobal);
  const toggleExcludeFromGlobal = useAppStore((state) => state.toggleExcludeFromGlobal);
  const deleteAnalysis = useAppStore((state) => state.deleteAnalysis);
  const navigate = useNavigate();

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // All rows (including excluded) for the table display
  const allRows = useMemo(
    () => calculateAllAnalysisRows(analyses, globalParams),
    [analyses, globalParams],
  );

  // Filtered analyses for KPI calculations (exclude user-excluded processes)
  const includedAnalyses = useMemo(
    () => analyses.filter((a) => !excludedFromGlobal.has(a.id)),
    [analyses, excludedFromGlobal],
  );

  const handleNavigateToAnalysis = useCallback(
    (id: string) => {
      setActiveAnalysis(id);
      navigate(`/analysis/${id}`);
    },
    [setActiveAnalysis, navigate],
  );

  const handleNavigateToSolutions = useCallback(() => {
    navigate(ROUTES.SOLUTIONS);
  }, [navigate]);

  const handleDeleteRequest = useCallback((id: string) => {
    const row = allRows.find((r) => r.id === id);
    if (row) {
      setDeleteTarget({ id: row.id, name: row.name });
    }
  }, [allRows]);

  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget) {
      deleteAnalysis(deleteTarget.id);
      setDeleteTarget(null);
    }
  }, [deleteTarget, deleteAnalysis]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  // Aggregated metrics use only included (non-excluded) analyses
  const aggregated = useMemo(
    () => calculateAggregatedMetrics(includedAnalyses, globalParams),
    [includedAnalyses, globalParams],
  );

  const roiColorClass = getROIColorClass(aggregated.overallROI);
  const savingsColorClass =
    aggregated.totalSavings > 0
      ? 'text-green-600'
      : aggregated.totalSavings < 0
        ? 'text-red-600'
        : 'text-gray-700';

  // Process counter: active vs total calculable
  const totalCalculableCount = allRows.length;
  const activeProcessCount = allRows.filter((r) => !excludedFromGlobal.has(r.id)).length;
  const hasExcludedProcesses = activeProcessCount < totalCalculableCount;

  if (aggregated.processCount === 0 && !hasExcludedProcesses) {
    if (aggregated.excludedCount > 0) {
      return (
        <p className="text-center text-gray-500">
          {`${aggregated.excludedCount} ${aggregated.excludedCount > 1 ? 'analyses' : 'analysis'} with incomplete data — fill in all required fields to see aggregated metrics`}
        </p>
      );
    }
    return null;
  }

  return (
    <section role="region" aria-label="Aggregated ROI metrics">
      <div className="rounded-xl bg-gray-50 p-8 md:p-12">
        {hasExcludedProcesses && (
          <p className="mb-6 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg px-4 py-2" aria-live="polite">
            {`${activeProcessCount}/${totalCalculableCount} processes selected`}
          </p>
        )}

        <div className="grid grid-cols-2 gap-8 md:gap-12">
          <div>
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Total Savings
            </h2>
            <p className={`mt-2 text-4xl font-bold ${savingsColorClass}`}>
              {formatCurrency(aggregated.totalSavings)}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Overall ROI
            </h2>
            <p className={`mt-2 text-4xl font-bold ${roiColorClass}`}>
              {formatPercentage(aggregated.overallROI)}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Total Pumps Monitored
            </h2>
            <p className="mt-2 text-2xl font-semibold text-gray-700">
              {aggregated.totalPumps.toLocaleString('fr-FR')}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Processes Analyzed
            </h2>
            <p className="mt-2 text-2xl font-semibold text-gray-700">
              {aggregated.processCount}
            </p>
          </div>
        </div>

        <hr className="my-8 border-gray-200" />

        <div className="grid grid-cols-2 gap-8">
          <div>
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Total Failure Cost
            </h2>
            <p className="mt-2 text-xl font-medium text-gray-600">
              {formatCurrency(aggregated.totalFailureCost)}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Total Service Cost
            </h2>
            <p className="mt-2 text-xl font-medium text-gray-600">
              {formatCurrency(aggregated.totalServiceCost)}
            </p>
          </div>
        </div>
      </div>

      {aggregated.excludedCount > 0 && (
        <p className="mt-4 text-sm text-gray-500">
          {`${aggregated.excludedCount} ${aggregated.excludedCount > 1 ? 'analyses' : 'analysis'} excluded (incomplete data)`}
        </p>
      )}

      {allRows.length > 0 && (
        <ComparisonTable
          rows={allRows}
          onNavigateToAnalysis={handleNavigateToAnalysis}
          excludedIds={excludedFromGlobal}
          onToggleExclude={toggleExcludeFromGlobal}
          onDeleteAnalysis={handleDeleteRequest}
          totalAnalysesCount={analyses.length}
        />
      )}

      <div className="flex justify-center mt-10">
        <Button
          variant="primary"
          size="lg"
          onClick={handleNavigateToSolutions}
        >
          Configure ARGOS Solution
        </Button>
      </div>

      {deleteTarget && (
        <Modal
          isOpen={true}
          onClose={handleDeleteCancel}
          title={`Supprimer l'analyse ${deleteTarget.name} ?`}
          footer={
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={handleDeleteCancel}>
                Annuler
              </Button>
              <Button variant="danger" onClick={handleDeleteConfirm}>
                Supprimer
              </Button>
            </div>
          }
        >
          <p className="text-gray-700">
            Cette action supprimera d&eacute;finitivement l&apos;analyse et ses donn&eacute;es du calculateur. Cette action est irr&eacute;versible.
          </p>
        </Modal>
      )}
    </section>
  );
}
