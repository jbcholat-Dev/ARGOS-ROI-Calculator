import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { isAnalysisCalculable } from '@/lib/calculations';
import type { ToastAction } from '@/components/ui/Toast';

export type ExportState = 'idle' | 'generating' | 'success';

/** Maximum retry attempts after initial failure (3 total attempts). */
const MAX_RETRY_COUNT = 2;

export interface ToastState {
  variant: 'success' | 'error';
  message: string;
  action?: ToastAction;
}

export interface UsePDFExportOptions {
  onExport: () => Promise<{ blob: Blob; filename: string }>;
  successMessage?: string;
}

/**
 * Custom hook encapsulating PDF export state machine, retry logic, and toast management.
 *
 * States: idle -> generating -> success -> idle (after 2s)
 *                             -> error -> idle (toast with retry)
 *
 * After MAX_RETRY_COUNT (2) failed retries, shows escalated error message.
 * Retry counter resets on success and on fresh manual click.
 * Disabled when no calculable analyses exist.
 */
export function usePDFExport({ onExport, successMessage = 'PDF exported successfully' }: UsePDFExportOptions) {
  const analyses = useAppStore((state) => state.analyses);

  const [exportState, setExportState] = useState<ExportState>('idle');
  const [toast, setToast] = useState<ToastState | null>(null);

  const retryCountRef = useRef(0);
  const mountCountRef = useRef(0);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    mountCountRef.current += 1;
    return () => {
      mountCountRef.current += 1;
      // H7: Clear the success timeout on unmount
      if (successTimeoutRef.current !== null) {
        clearTimeout(successTimeoutRef.current);
        successTimeoutRef.current = null;
      }
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

    let blobUrl: string | undefined;

    try {
      const { blob, filename } = await onExport();
      if (mountCountRef.current !== currentMount) return;

      blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(blobUrl);
      blobUrl = undefined;

      retryCountRef.current = 0;
      setExportState('success');
      setToast({
        variant: 'success',
        message: successMessage,
      });

      successTimeoutRef.current = setTimeout(() => {
        if (mountCountRef.current === currentMount) {
          setExportState('idle');
        }
        successTimeoutRef.current = null;
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
  }, [onExport, successMessage]);

  const handleExport = useCallback(() => {
    if (isDisabled) return;
    performExport(false);
  }, [isDisabled, performExport]);

  const handleDismissToast = useCallback(() => {
    setToast(null);
  }, []);

  return {
    exportState,
    hasCalculableAnalyses,
    isDisabled,
    toast,
    handleExport,
    handleDismissToast,
  };
}
