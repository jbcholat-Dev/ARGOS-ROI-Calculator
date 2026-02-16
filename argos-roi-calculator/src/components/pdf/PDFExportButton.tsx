import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import type { ToastAction } from '@/components/ui/Toast';
import { useAppStore } from '@/stores/app-store';
import { isAnalysisCalculable } from '@/lib/calculations';
import { generatePDF } from '@/lib/pdf-generator';

type ExportState = 'idle' | 'generating' | 'success';

/** Maximum retry attempts after initial failure (3 total attempts). */
const MAX_RETRY_COUNT = 2;

interface ToastState {
  variant: 'success' | 'error';
  message: string;
  action?: ToastAction;
}

const DocumentIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    strokeWidth="1.5"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
    />
  </svg>
);

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
 * After MAX_RETRY_COUNT (2) failed retries, shows escalated error message.
 * Retry counter resets on success and on fresh manual click.
 * Disabled when no calculable analyses exist.
 * Compact variant for NavigationBar (icon-only with tooltip).
 */
export function PDFExportButton({
  variant = 'default',
  className,
}: PDFExportButtonProps) {
  const analyses = useAppStore((state) => state.analyses);

  const [exportState, setExportState] = useState<ExportState>('idle');
  const [toast, setToast] = useState<ToastState | null>(null);

  const retryCountRef = useRef(0);
  const mountCountRef = useRef(0);

  useEffect(() => {
    mountCountRef.current += 1;
    return () => {
      mountCountRef.current += 1;
    };
  }, []);

  const hasCalculableAnalyses = useMemo(
    () => analyses.some((a) => isAnalysisCalculable(a)),
    [analyses],
  );

  const isDisabled = !hasCalculableAnalyses || exportState === 'generating';

  const performExport = useCallback(async (isRetry: boolean) => {
    if (!isRetry) {
      retryCountRef.current = 0;
    }

    const currentMount = mountCountRef.current;

    setExportState('generating');
    setToast(null);

    // Read fresh state at invocation time to avoid stale closures
    const {
      analyses: freshAnalyses,
      globalParams: freshGlobalParams,
      excludedFromGlobal: freshExcludedFromGlobal,
    } = useAppStore.getState();

    // Clone the Set to prevent mutation during async generation
    const excludedSnapshot = new Set(freshExcludedFromGlobal);

    let blobUrl: string | undefined;

    try {
      const blob = await generatePDF(freshAnalyses, freshGlobalParams, excludedSnapshot);
      if (mountCountRef.current !== currentMount) return;

      blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `ARGOS-ROI-Analysis-${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      URL.revokeObjectURL(blobUrl);
      blobUrl = undefined;

      retryCountRef.current = 0;
      setExportState('success');
      setToast({
        variant: 'success',
        message: 'PDF exported successfully',
      });

      setTimeout(() => {
        if (mountCountRef.current === currentMount) {
          setExportState('idle');
        }
      }, 2000);
    } catch {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }

      if (mountCountRef.current !== currentMount) return;

      retryCountRef.current += 1;
      setExportState('idle');

      if (retryCountRef.current > MAX_RETRY_COUNT) {
        setToast({
          variant: 'error',
          message:
            'PDF generation failed after multiple attempts. Try refreshing the page or reducing the number of analyses.',
        });
      } else {
        setToast({
          variant: 'error',
          message: 'PDF generation failed. Please try again.',
          action: {
            label: 'Retry',
            onClick: () => {
              performExport(true);
            },
          },
        });
      }
    }
  }, []);

  const handleExport = useCallback(() => {
    if (isDisabled) return;
    performExport(false);
  }, [isDisabled, performExport]);

  const handleDismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const buttonLabel = exportState === 'generating' ? 'Generating...' : 'Export PDF';

  const compactButton = (
    <button
      type="button"
      onClick={handleExport}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-label={isDisabled && !hasCalculableAnalyses ? 'Export PDF — Create analyses first' : 'Export PDF'}
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
      aria-label={isDisabled && !hasCalculableAnalyses ? 'Export PDF — Create analyses first' : 'Export PDF'}
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
