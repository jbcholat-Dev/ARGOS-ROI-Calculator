import { useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { useAppStore } from '@/stores/app-store';
import { calculatePumpStats } from '@/lib/calculations';
import { generateCompletePDF, captureDiagramAsImage, generateCompleteFilename } from '@/lib/pdf-generator';
import { DocumentIcon } from './DocumentIcon';
import { usePDFExport } from './usePDFExport';

export interface ExportCompleteReportButtonProps {
  className?: string;
}

/**
 * Export Complete Report Button with progress state management and error handling.
 *
 * Generates a unified PDF containing Part 1 (ROI Analysis) and Part 2 (Technical Architecture).
 *
 * States: idle -> generating -> success -> idle (after 2s)
 *                             -> error -> idle (toast with retry)
 *
 * After 2 failed retries (3 total attempts), shows escalated error message.
 * Retry counter resets on success and on fresh manual click.
 * Disabled when no calculable analyses exist.
 */
export function ExportCompleteReportButton({
  className,
}: ExportCompleteReportButtonProps) {
  const onExport = useCallback(async () => {
    const {
      analyses: freshAnalyses,
      globalParams: freshGlobalParams,
      excludedFromGlobal: freshExcludedFromGlobal,
      deploymentMode,
      connectionType,
    } = useAppStore.getState();

    const excludedSnapshot = new Set(freshExcludedFromGlobal);
    const { totalPumps, processCount } = calculatePumpStats(freshAnalyses);

    // M2 fix: captureDiagramAsImage returns string | null; convert null to undefined
    const diagramImageResult = await captureDiagramAsImage();
    const diagramImage = diagramImageResult ?? undefined;

    const blob = await generateCompletePDF(
      freshAnalyses,
      freshGlobalParams,
      excludedSnapshot,
      {
        deploymentMode,
        connectionType,
        diagramImage,
        totalPumps,
        processCount,
      },
    );
    const filename = generateCompleteFilename();

    return { blob, filename };
  }, []);

  const {
    exportState,
    hasCalculableAnalyses,
    isDisabled,
    toast,
    handleExport,
    handleDismissToast,
  } = usePDFExport({ onExport, successMessage: 'Complete report exported successfully' });

  const buttonLabel = exportState === 'generating' ? 'Generating...' : 'Export Complete Report';

  return (
    <>
      <Button
        variant="primary"
        size="md"
        loading={exportState === 'generating'}
        disabled={isDisabled}
        onClick={handleExport}
        aria-label={
          isDisabled && !hasCalculableAnalyses
            ? 'Export Complete Report \u2014 Create analyses first'
            : 'Export Complete Report'
        }
        aria-disabled={isDisabled}
        title={isDisabled && !hasCalculableAnalyses ? 'Create analyses first' : undefined}
        className={className}
      >
        {exportState !== 'generating' && (
          <DocumentIcon className="mr-2 h-5 w-5" />
        )}
        {buttonLabel}
      </Button>

      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <Toast
            variant={toast.variant}
            message={toast.message}
            onDismiss={handleDismissToast}
            action={toast.action}
          />
        </div>
      )}
    </>
  );
}
