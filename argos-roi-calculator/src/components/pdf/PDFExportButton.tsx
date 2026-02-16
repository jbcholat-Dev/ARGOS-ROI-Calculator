import { useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { useAppStore } from '@/stores/app-store';
import { generatePDF } from '@/lib/pdf-generator';
import { DocumentIcon } from './DocumentIcon';
import { usePDFExport } from './usePDFExport';

export interface PDFExportButtonProps {
  variant?: 'default' | 'compact';
  className?: string;
}

/**
 * PDF Export Button with progress state management and error handling.
 *
 * States: idle -> generating -> success -> idle (after 2s)
 *                             -> error -> idle (toast with retry)
 *
 * After 2 failed retries (3 total attempts), shows escalated error message.
 * Retry counter resets on success and on fresh manual click.
 * Disabled when no calculable analyses exist.
 * Compact variant for NavigationBar (icon-only with tooltip).
 */
export function PDFExportButton({
  variant = 'default',
  className,
}: PDFExportButtonProps) {
  const onExport = useCallback(async () => {
    const {
      analyses: freshAnalyses,
      globalParams: freshGlobalParams,
      excludedFromGlobal: freshExcludedFromGlobal,
    } = useAppStore.getState();

    const excludedSnapshot = new Set(freshExcludedFromGlobal);

    const blob = await generatePDF(freshAnalyses, freshGlobalParams, excludedSnapshot);
    const filename = `ARGOS-ROI-Analysis-${new Date().toISOString().split('T')[0]}.pdf`;

    return { blob, filename };
  }, []);

  const {
    exportState,
    hasCalculableAnalyses,
    isDisabled,
    toast,
    handleExport,
    handleDismissToast,
  } = usePDFExport({ onExport, successMessage: 'PDF exported successfully' });

  const buttonLabel = exportState === 'generating' ? 'Generating...' : 'Export PDF';

  const compactButton = (
    <button
      type="button"
      onClick={handleExport}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-label={isDisabled && !hasCalculableAnalyses ? 'Export PDF \u2014 Create analyses first' : 'Export PDF'}
      aria-busy={exportState === 'generating'}
      title={isDisabled && !hasCalculableAnalyses ? 'Create analyses first' : 'Export PDF'}
      className={`inline-flex items-center justify-center px-3 py-1.5 text-sm rounded text-gray-500 hover:text-pfeiffer-red hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-pfeiffer-red focus:ring-offset-2 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''} ${className ?? ''}`}
    >
      {exportState === 'generating' ? (
        <div
          className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"
          role="status"
          aria-label="Generating PDF"
        />
      ) : (
        <DocumentIcon className="h-5 w-5" />
      )}
    </button>
  );

  const defaultButton = (
    <Button
      variant="primary"
      size="md"
      loading={exportState === 'generating'}
      disabled={isDisabled}
      onClick={handleExport}
      aria-label={isDisabled && !hasCalculableAnalyses ? 'Export PDF \u2014 Create analyses first' : 'Export PDF'}
      aria-disabled={isDisabled}
      title={isDisabled && !hasCalculableAnalyses ? 'Create analyses first' : undefined}
      className={className}
    >
      {exportState !== 'generating' && (
        <DocumentIcon className="mr-2 h-5 w-5" />
      )}
      {buttonLabel}
    </Button>
  );

  return (
    <>
      {variant === 'compact' ? compactButton : defaultButton}

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
