import { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { Card } from '@/components/ui';
import {
  calculateTotalFailureCost,
  calculateArgosServiceCost,
  calculateSavings,
  calculateROI,
  getROIColorClass,
} from '@/lib/calculations';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { DEFAULT_DETECTION_RATE, DEFAULT_SERVICE_COST_PER_PUMP } from '@/lib/constants';
import { useAppStore } from '@/stores/app-store';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import type { Analysis } from '@/types';

export interface AnalysisCardProps {
  /**
   * The analysis to display
   */
  analysis: Analysis;
  /**
   * Whether this analysis is the active one (highlighted border)
   */
  isActive: boolean;
  /**
   * Optional click handler for navigation to Focus Mode (Story 3.2)
   */
  onClick?: () => void;
}

/**
 * AnalysisCard displays a summary of an analysis for the Dashboard Grid.
 *
 * Shows: process name, pump count, ROI percentage (with traffic-light color), and savings amount.
 *
 * @example
 * <AnalysisCard analysis={analysis} isActive={true} />
 */
export function AnalysisCard({ analysis, isActive, onClick }: AnalysisCardProps) {
  // State for context menu and delete confirmation modal (Story 3.3)
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Store actions (Story 3.3: duplicate/delete)
  const duplicateAnalysis = useAppStore((state) => state.duplicateAnalysis);
  const deleteAnalysis = useAppStore((state) => state.deleteAnalysis);
  const navigate = useNavigate();

  // Calculate wafer quantity based on type
  const waferQuantity = analysis.waferType === 'mono' ? 1 : analysis.waferQuantity;

  // Use per-analysis detection rate, fallback to global default (Story 2.9 pattern)
  const detectionRate = analysis.detectionRate ?? DEFAULT_DETECTION_RATE;

  // Memoize calculations to prevent unnecessary re-computation (NFR-P6: 5 concurrent analyses)
  const { totalFailureCost, argosServiceCost, savings, roi } = useMemo(() => {
    const totalCost = calculateTotalFailureCost(
      analysis.pumpQuantity,
      analysis.failureRatePercentage,
      analysis.waferCost,
      waferQuantity,
      analysis.downtimeDuration,
      analysis.downtimeCostPerHour,
    );

    const serviceCost = calculateArgosServiceCost(
      analysis.pumpQuantity,
      DEFAULT_SERVICE_COST_PER_PUMP,
    );

    const calculatedSavings = calculateSavings(totalCost, serviceCost, detectionRate);
    const calculatedROI = calculateROI(calculatedSavings, serviceCost);

    return {
      totalFailureCost: totalCost,
      argosServiceCost: serviceCost,
      savings: calculatedSavings,
      roi: calculatedROI,
    };
  }, [
    analysis.pumpQuantity,
    analysis.failureRatePercentage,
    analysis.waferCost,
    waferQuantity,
    analysis.downtimeDuration,
    analysis.downtimeCostPerHour,
    detectionRate,
  ]);

  // Traffic-light color for ROI
  const roiColorClass = getROIColorClass(roi);

  // Click-outside handler to close menu (Story 3.3)
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Close if clicked outside both menu and button
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Escape key handler to close menu (Story 3.3)
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus(); // Return focus to trigger button
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen]);

  // Duplicate handler (Story 3.3 AC2)
  const handleDuplicate = () => {
    setIsMenuOpen(false);
    duplicateAnalysis(analysis.id);
    // Navigate to duplicate in Focus Mode
    const newActiveId = useAppStore.getState().activeAnalysisId;
    if (newActiveId) {
      navigate(`/analysis/${newActiveId}`);
    }
  };

  // Delete handler - opens confirmation modal (Story 3.3 AC3)
  const handleDelete = () => {
    setIsMenuOpen(false);
    setIsDeleteModalOpen(true);
  };

  // Delete confirmation handler (Story 3.3 AC4)
  const handleDeleteConfirm = () => {
    const currentAnalyses = useAppStore.getState().analyses;
    const wasActive = useAppStore.getState().activeAnalysisId === analysis.id;

    deleteAnalysis(analysis.id);
    setIsDeleteModalOpen(false);

    // Navigation after delete (AC4)
    if (wasActive) {
      const newActiveId = useAppStore.getState().activeAnalysisId;
      if (newActiveId) {
        navigate(`/analysis/${newActiveId}`);
      } else {
        navigate('/'); // No analyses remain, go to Dashboard empty state
      }
    }
  };

  return (
    <>
      <Card
        aria-label={`Analyse ${analysis.name}`}
        onClick={onClick}
        className={clsx(
          // Active state border
          isActive && 'border-primary border-2',
          // Relative positioning for absolute menu
          'relative',
        )}
      >
        {/* Three-dot menu button (Story 3.3 AC1) */}
        <button
          ref={menuButtonRef}
          onClick={(e) => {
            e.stopPropagation(); // Prevent card onClick navigation
            setIsMenuOpen(!isMenuOpen);
          }}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-pfeiffer-red transition-colors rounded hover:bg-gray-100"
          aria-label={`Actions pour l'analyse ${analysis.name}`}
          aria-expanded={isMenuOpen}
          aria-haspopup="menu"
        >
          <span className="text-xl leading-none" aria-hidden="true">
            ⋮
          </span>
        </button>

        {/* Context menu dropdown (Story 3.3 AC1) */}
        {isMenuOpen && (
          <div
            ref={menuRef}
            role="menu"
            aria-label="Actions de l'analyse"
            className="absolute top-12 right-4 bg-white shadow-lg border border-gray-200 rounded-lg py-1 z-10 min-w-[150px]"
          >
            <button
              role="menuitem"
              onClick={handleDuplicate}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <span aria-hidden="true">⎘</span>
              Dupliquer
            </button>
            <button
              role="menuitem"
              onClick={handleDelete}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <span aria-hidden="true">🗑</span>
              Supprimer
            </button>
          </div>
        )}

        {/* Process Name */}
        <h3 className="mb-3 text-xl font-semibold text-gray-900 pr-12">
          {analysis.name}
        </h3>

      {/* Pump Count */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm font-medium text-gray-600">Pompes:</span>
        <span className="text-base font-semibold text-gray-900">{analysis.pumpQuantity}</span>
      </div>

      {/* ROI Percentage (Hero Number) */}
      <div className="mb-2">
        <div className="text-sm font-medium text-gray-600 mb-1">ROI</div>
        <div className={clsx('text-4xl font-bold', roiColorClass)} data-testid="roi-percentage">
          {formatPercentage(roi)}
        </div>
      </div>

      {/* Savings Amount */}
      <div>
        <div className="text-sm font-medium text-gray-600 mb-1">Économies Réalisées</div>
        <div className="text-lg font-semibold text-gray-900" data-testid="savings-amount">
          {formatCurrency(savings)}
        </div>
      </div>
      </Card>

      {/* Delete confirmation modal (Story 3.3 AC3) */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        analysisName={analysis.name}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </>
  );
}
