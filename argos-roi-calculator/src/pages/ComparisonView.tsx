import { useState, useRef, useCallback } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import { useAppStore } from '@/stores/app-store';
import {
  calculateTotalFailureCost,
  calculateArgosServiceCost,
  calculateSavings,
  calculateROI,
} from '@/lib/calculations';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { AnalysisSummary } from '@/components/comparison/AnalysisSummary';
import { DeltaIndicator } from '@/components/comparison/DeltaIndicator';
import { ComparisonActionBar } from '@/components/comparison/ComparisonActionBar';
import { ModifiedFieldHighlight } from '@/components/comparison/ModifiedFieldHighlight';
import { ReplaceConfirmationModal } from '@/components/comparison/ReplaceConfirmationModal';
import { NavigationBar } from '@/components/layout/NavigationBar';
import {
  EquipmentInputs,
  FailureRateInput,
  DetectionRateInput,
  WaferInputs,
  DowntimeInputs,
} from '@/components/analysis';
import type { Analysis } from '@/types';

type MetricsInput = Pick<Analysis, 'pumpQuantity' | 'failureRatePercentage' | 'waferCost' | 'waferType' | 'waferQuantity' | 'downtimeDuration' | 'downtimeCostPerHour' | 'detectionRate'>;

function computeMetrics(analysis: MetricsInput, serviceCostPerPump: number, globalDetectionRate: number) {
  const waferQuantity = analysis.waferType === 'mono' ? 1 : analysis.waferQuantity;
  const detectionRate = analysis.detectionRate ?? globalDetectionRate;

  const totalFailureCost = calculateTotalFailureCost(
    analysis.pumpQuantity,
    analysis.failureRatePercentage,
    analysis.waferCost,
    waferQuantity,
    analysis.downtimeDuration,
    analysis.downtimeCostPerHour,
  );

  const argosServiceCost = calculateArgosServiceCost(
    analysis.pumpQuantity,
    serviceCostPerPump,
  );

  const savings = calculateSavings(totalFailureCost, argosServiceCost, detectionRate);
  const roi = calculateROI(savings, argosServiceCost);

  return { totalFailureCost, argosServiceCost, savings, roi };
}

export function ComparisonView() {
  const { originalId, whatIfId } = useParams<{ originalId: string; whatIfId: string }>();
  const navigate = useNavigate();

  const original = useAppStore((state) =>
    state.analyses.find((a) => a.id === originalId)
  );
  const whatIf = useAppStore((state) =>
    state.analyses.find((a) => a.id === whatIfId)
  );
  const globalParams = useAppStore((state) => state.globalParams);
  const updateAnalysis = useAppStore((state) => state.updateAnalysis);
  const deleteAnalysis = useAppStore((state) => state.deleteAnalysis);

  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);

  // Snapshot of original analysis values on mount (for stable comparison)
  const originalSnapshotRef = useRef<Analysis | null>(null);
  if (original && !originalSnapshotRef.current) {
    originalSnapshotRef.current = { ...original };
  }
  const snapshot = originalSnapshotRef.current;

  // Scroll sync refs
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const isSyncing = useRef(false);

  const handleScroll = useCallback((source: 'left' | 'right') => {
    if (isSyncing.current) return;
    isSyncing.current = true;

    const sourceRef = source === 'left' ? leftPanelRef : rightPanelRef;
    const targetRef = source === 'left' ? rightPanelRef : leftPanelRef;

    if (sourceRef.current && targetRef.current) {
      targetRef.current.scrollTop = sourceRef.current.scrollTop;
    }

    requestAnimationFrame(() => {
      isSyncing.current = false;
    });
  }, []);

  const handleSaveBoth = useCallback(() => {
    navigate(ROUTES.DASHBOARD);
  }, [navigate]);

  const handleDiscard = useCallback(() => {
    if (whatIfId) {
      deleteAnalysis(whatIfId);
    }
    navigate(ROUTES.DASHBOARD);
  }, [whatIfId, deleteAnalysis, navigate]);

  const handleReplaceOriginal = useCallback(() => {
    if (!originalId || !whatIf) return;
    updateAnalysis(originalId, {
      pumpType: whatIf.pumpType,
      pumpQuantity: whatIf.pumpQuantity,
      failureRateMode: whatIf.failureRateMode,
      failureRatePercentage: whatIf.failureRatePercentage,
      absoluteFailureCount: whatIf.absoluteFailureCount,
      waferType: whatIf.waferType,
      waferQuantity: whatIf.waferQuantity,
      waferCost: whatIf.waferCost,
      downtimeDuration: whatIf.downtimeDuration,
      downtimeCostPerHour: whatIf.downtimeCostPerHour,
      detectionRate: whatIf.detectionRate,
    });
    if (whatIfId) {
      deleteAnalysis(whatIfId);
    }
    navigate(ROUTES.DASHBOARD);
  }, [originalId, whatIf, whatIfId, updateAnalysis, deleteAnalysis, navigate]);

  // Redirect if either analysis not found
  if (!originalId || !whatIfId || !original || !whatIf) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  const originalMetrics = computeMetrics(original, globalParams.serviceCostPerPump, globalParams.detectionRate);
  const whatIfMetrics = computeMetrics(whatIf, globalParams.serviceCostPerPump, globalParams.detectionRate);

  // Section-level modification detection (use snapshot for stable comparison)
  const snap = snapshot ?? original;
  const isEquipmentModified =
    snap.pumpType !== whatIf.pumpType ||
    snap.pumpQuantity !== whatIf.pumpQuantity;
  const isFailureRateModified =
    snap.failureRateMode !== whatIf.failureRateMode ||
    snap.failureRatePercentage !== whatIf.failureRatePercentage ||
    snap.absoluteFailureCount !== whatIf.absoluteFailureCount;
  const isDetectionModified = snap.detectionRate !== whatIf.detectionRate;
  const isWaferModified =
    snap.waferType !== whatIf.waferType ||
    snap.waferQuantity !== whatIf.waferQuantity ||
    snap.waferCost !== whatIf.waferCost;
  const isDowntimeModified =
    snap.downtimeDuration !== whatIf.downtimeDuration ||
    snap.downtimeCostPerHour !== whatIf.downtimeCostPerHour;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <NavigationBar />
      <ComparisonActionBar
        onSaveBoth={handleSaveBoth}
        onDiscard={handleDiscard}
        onReplaceOriginal={() => setIsReplaceModalOpen(true)}
      />
      <ReplaceConfirmationModal
        isOpen={isReplaceModalOpen}
        onConfirm={handleReplaceOriginal}
        onCancel={() => setIsReplaceModalOpen(false)}
      />

      <div
        role="main"
        aria-label="Scenario Comparison"
        className="flex flex-col min-[1440px]:flex-row flex-1 overflow-hidden"
      >
        {/* Left Panel: Original (read-only) */}
        <div
          ref={leftPanelRef}
          aria-label="Original Scenario"
          className="w-full min-[1440px]:w-1/2 overflow-y-auto border-b min-[1440px]:border-b-0 min-[1440px]:border-r border-gray-200 bg-gray-50 p-6"
          onScroll={() => handleScroll('left')}
          data-testid="original-panel"
        >
          <div className="mx-auto max-w-lg">
            <AnalysisSummary analysis={original} globalParams={globalParams} />

            {/* Original Results (static) */}
            <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Results</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <span className="text-sm text-gray-500">Total Failure Cost</span>
                  <p className="text-2xl font-bold text-gray-900" data-testid="original-failure-cost">
                    {formatCurrency(originalMetrics.totalFailureCost)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">ARGOS Service Cost</span>
                  <p className="text-2xl font-bold text-gray-900" data-testid="original-service-cost">
                    {formatCurrency(originalMetrics.argosServiceCost)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Savings Realized</span>
                  <p className="text-2xl font-bold text-gray-900" data-testid="original-savings">
                    {formatCurrency(originalMetrics.savings)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">ROI</span>
                  <p className="text-2xl font-bold text-gray-900" data-testid="original-roi">
                    {formatPercentage(originalMetrics.roi)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: What-If (editable) */}
        <div
          ref={rightPanelRef}
          aria-label="What If Scenario"
          className="w-full min-[1440px]:w-1/2 overflow-y-auto bg-surface-canvas p-6"
          onScroll={() => handleScroll('right')}
          data-testid="whatif-panel"
        >
          <div className="mx-auto max-w-lg">
            <div className="flex flex-col gap-6">
              <ModifiedFieldHighlight isModified={isEquipmentModified}>
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                  <EquipmentInputs analysisId={whatIfId} />
                </div>
              </ModifiedFieldHighlight>
              <ModifiedFieldHighlight isModified={isFailureRateModified}>
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                  <FailureRateInput analysisId={whatIfId} />
                </div>
              </ModifiedFieldHighlight>
              <ModifiedFieldHighlight isModified={isDetectionModified}>
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                  <DetectionRateInput analysisId={whatIfId} />
                </div>
              </ModifiedFieldHighlight>
              <ModifiedFieldHighlight isModified={isWaferModified}>
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                  <WaferInputs analysisId={whatIfId} />
                </div>
              </ModifiedFieldHighlight>
              <ModifiedFieldHighlight isModified={isDowntimeModified}>
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                  <DowntimeInputs analysisId={whatIfId} />
                </div>
              </ModifiedFieldHighlight>
            </div>

            {/* What-If Results with Delta Indicators */}
            <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Results</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <span className="text-sm text-gray-500">Total Failure Cost</span>
                  <div className="flex items-baseline gap-3">
                    <p className="text-2xl font-bold text-gray-900" data-testid="whatif-failure-cost">
                      {formatCurrency(whatIfMetrics.totalFailureCost)}
                    </p>
                    <DeltaIndicator
                      originalValue={originalMetrics.totalFailureCost}
                      whatIfValue={whatIfMetrics.totalFailureCost}
                      format="currency"
                      invertColor
                    />
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">ARGOS Service Cost</span>
                  <div className="flex items-baseline gap-3">
                    <p className="text-2xl font-bold text-gray-900" data-testid="whatif-service-cost">
                      {formatCurrency(whatIfMetrics.argosServiceCost)}
                    </p>
                    <DeltaIndicator
                      originalValue={originalMetrics.argosServiceCost}
                      whatIfValue={whatIfMetrics.argosServiceCost}
                      format="currency"
                      invertColor
                    />
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Savings Realized</span>
                  <div className="flex items-baseline gap-3">
                    <p className="text-2xl font-bold text-gray-900" data-testid="whatif-savings">
                      {formatCurrency(whatIfMetrics.savings)}
                    </p>
                    <DeltaIndicator
                      originalValue={originalMetrics.savings}
                      whatIfValue={whatIfMetrics.savings}
                      format="currency"
                    />
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">ROI</span>
                  <div className="flex items-baseline gap-3">
                    <p className="text-2xl font-bold text-gray-900" data-testid="whatif-roi">
                      {formatPercentage(whatIfMetrics.roi)}
                    </p>
                    <DeltaIndicator
                      originalValue={originalMetrics.roi}
                      whatIfValue={whatIfMetrics.roi}
                      format="percentage"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
