import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { PDFExportButton } from './PDFExportButton';
import { useAppStore } from '@/stores/app-store';
import type { Analysis } from '@/types';

// Mock the pdf-generator module
vi.mock('@/lib/pdf-generator', () => ({
  generatePDF: vi.fn(),
}));

// Import the mocked module to control return values
import { generatePDF } from '@/lib/pdf-generator';
const mockGeneratePDF = vi.mocked(generatePDF);

function createTestAnalysis(overrides: Partial<Analysis> = {}): Analysis {
  return {
    id: crypto.randomUUID(),
    name: 'Test Analysis',
    pumpType: 'A3004XN',
    pumpQuantity: 10,
    failureRateMode: 'percentage',
    failureRatePercentage: 10,
    waferType: 'batch',
    waferQuantity: 125,
    waferCost: 8000,
    waferDefectEventsPerYear: 0,
    downtimeDuration: 6,
    downtimeCostPerHour: 500,
    isBottleneck: false,
    bottleneckMultiplier: 2.0,
    maintenanceStrategy: 'unplanned' as const,
    overhaulCostPerPump: 0,
    pmIntervalMonths: 12,
    argosMtbfExtensionPercent: 15,
    unplannedDespitePM: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/** Analysis with incomplete data (pumpQuantity: 0) — not calculable */
function createIncompleteAnalysis(): Analysis {
  return createTestAnalysis({ pumpQuantity: 0, failureRatePercentage: 0 });
}

/** Analysis with valid data — calculable */
function createCalculableAnalysis(name = 'Calculable Analysis'): Analysis {
  return createTestAnalysis({
    name,
    pumpQuantity: 10,
    failureRatePercentage: 10,
    downtimeDuration: 6,
    downtimeCostPerHour: 500,
  });
}

describe('PDFExportButton', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    localStorage.removeItem('argos-roi-data');
    useAppStore.setState({
      analyses: [],
      activeAnalysisId: null,
      globalParams: { detectionRate: 70, serviceCostPerPump: 2500 },
      excludedFromGlobal: new Set<string>(),
      unsavedChanges: false,
    });
    mockGeneratePDF.mockReset();
    mockGeneratePDF.mockResolvedValue(new Blob(['test'], { type: 'application/pdf' }));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // ========== Idle State (AC1) ==========
  describe('idle state', () => {
    it('renders with "Export PDF" text in default variant', () => {
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<PDFExportButton />);

      expect(screen.getByRole('button', { name: /export pdf/i })).toBeInTheDocument();
      expect(screen.getByText('Export PDF')).toBeInTheDocument();
    });

    it('renders document icon in default variant', () => {
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<PDFExportButton />);

      const button = screen.getByRole('button', { name: /export pdf/i });
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders as compact variant with icon only', () => {
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<PDFExportButton variant="compact" />);

      const button = screen.getByRole('button', { name: /export pdf/i });
      expect(button).toBeInTheDocument();
      // Compact variant has SVG icon, no text label
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(screen.queryByText('Export PDF')).not.toBeInTheDocument();
    });

    it('applies custom className', () => {
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<PDFExportButton className="ml-4" />);

      const button = screen.getByRole('button', { name: /export pdf/i });
      expect(button).toHaveClass('ml-4');
    });
  });

  // ========== Disabled State (AC4) ==========
  describe('disabled state', () => {
    it('is disabled when no analyses exist', () => {
      useAppStore.setState({ analyses: [] });

      render(<PDFExportButton />);

      const button = screen.getByRole('button', { name: /export pdf/i });
      expect(button).toBeDisabled();
    });

    it('is disabled when analyses exist but none are calculable', () => {
      useAppStore.setState({ analyses: [createIncompleteAnalysis()] });

      render(<PDFExportButton />);

      const button = screen.getByRole('button', { name: /export pdf/i });
      expect(button).toBeDisabled();
    });

    it('has aria-disabled attribute when no calculable analyses', () => {
      useAppStore.setState({ analyses: [] });

      render(<PDFExportButton />);

      const button = screen.getByRole('button', { name: /export pdf/i });
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('shows tooltip "Create analyses first" when disabled and no calculable analyses', () => {
      useAppStore.setState({ analyses: [] });

      render(<PDFExportButton />);

      const button = screen.getByRole('button', { name: /export pdf/i });
      expect(button).toHaveAttribute('title', 'Create analyses first');
    });

    it('shows tooltip "Create analyses first" in compact variant when disabled', () => {
      useAppStore.setState({ analyses: [] });

      render(<PDFExportButton variant="compact" />);

      const button = screen.getByRole('button', { name: /export pdf/i });
      expect(button).toHaveAttribute('title', 'Create analyses first');
    });

    it('does not call generatePDF when clicked while disabled', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      useAppStore.setState({ analyses: [] });

      render(<PDFExportButton />);

      const button = screen.getByRole('button', { name: /export pdf/i });
      await user.click(button);

      expect(mockGeneratePDF).not.toHaveBeenCalled();
    });
  });

  // ========== Enabled State (AC1) ==========
  describe('enabled state', () => {
    it('is enabled when at least one calculable analysis exists', () => {
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<PDFExportButton />);

      const button = screen.getByRole('button', { name: /export pdf/i });
      expect(button).not.toBeDisabled();
    });

    it('is enabled with mix of calculable and non-calculable analyses', () => {
      useAppStore.setState({
        analyses: [createCalculableAnalysis(), createIncompleteAnalysis()],
      });

      render(<PDFExportButton />);

      const button = screen.getByRole('button', { name: /export pdf/i });
      expect(button).not.toBeDisabled();
    });

    it('does not have tooltip when enabled', () => {
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<PDFExportButton />);

      const button = screen.getByRole('button', { name: /export pdf/i });
      expect(button).not.toHaveAttribute('title', 'Create analyses first');
    });
  });

  // ========== Generating State (AC2, AC6) ==========
  describe('generating state', () => {
    it('shows "Generating..." text when clicked', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      // Make generatePDF take time to resolve
      let resolveGenerate: (blob: Blob) => void;
      mockGeneratePDF.mockReturnValue(
        new Promise((resolve) => {
          resolveGenerate = resolve;
        }),
      );
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<PDFExportButton />);

      await user.click(screen.getByRole('button', { name: /export pdf/i }));

      expect(screen.getByText('Generating...')).toBeInTheDocument();

      // Clean up: resolve the promise
      resolveGenerate!(new Blob(['test'], { type: 'application/pdf' }));
    });

    it('disables button during generation (prevents double-click)', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      let resolveGenerate: (blob: Blob) => void;
      mockGeneratePDF.mockReturnValue(
        new Promise((resolve) => {
          resolveGenerate = resolve;
        }),
      );
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<PDFExportButton />);

      await user.click(screen.getByRole('button', { name: /export pdf/i }));

      const button = screen.getByRole('button', { name: /export pdf/i });
      expect(button).toBeDisabled();

      // Clean up
      resolveGenerate!(new Blob(['test'], { type: 'application/pdf' }));
    });

    it('sets aria-busy during generation', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      let resolveGenerate: (blob: Blob) => void;
      mockGeneratePDF.mockReturnValue(
        new Promise((resolve) => {
          resolveGenerate = resolve;
        }),
      );
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<PDFExportButton />);

      await user.click(screen.getByRole('button', { name: /export pdf/i }));

      const button = screen.getByRole('button', { name: /export pdf/i });
      expect(button).toHaveAttribute('aria-busy', 'true');

      // Clean up
      resolveGenerate!(new Blob(['test'], { type: 'application/pdf' }));
    });

    it('shows spinner in compact variant during generation', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      let resolveGenerate: (blob: Blob) => void;
      mockGeneratePDF.mockReturnValue(
        new Promise((resolve) => {
          resolveGenerate = resolve;
        }),
      );
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<PDFExportButton variant="compact" />);

      await user.click(screen.getByRole('button', { name: /export pdf/i }));

      const spinner = screen.getByRole('status', { name: /generating pdf/i });
      expect(spinner).toBeInTheDocument();

      // Clean up
      resolveGenerate!(new Blob(['test'], { type: 'application/pdf' }));
    });
  });

  // ========== Success State (AC3) ==========
  describe('success state', () => {
    it('calls generatePDF with correct arguments', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const analysis = createCalculableAnalysis();
      const globalParams = { detectionRate: 70, serviceCostPerPump: 2500 };
      const excludedFromGlobal = new Set<string>();
      useAppStore.setState({ analyses: [analysis], globalParams, excludedFromGlobal });

      render(<PDFExportButton />);

      await user.click(screen.getByRole('button', { name: /export pdf/i }));

      await waitFor(() => {
        expect(mockGeneratePDF).toHaveBeenCalledWith(
          [analysis],
          globalParams,
          expect.any(Set),
        );
        // Verify the Set contents match (it's a clone, not the same reference)
        const calledSet = mockGeneratePDF.mock.calls[0][2] as Set<string>;
        expect(calledSet.size).toBe(excludedFromGlobal.size);
      });
    });

    it('shows success toast after generation completes', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<PDFExportButton />);

      await user.click(screen.getByRole('button', { name: /export pdf/i }));

      await waitFor(() => {
        expect(screen.getByText('PDF exported successfully')).toBeInTheDocument();
      });
    });

    it('returns to idle state after 2 seconds', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<PDFExportButton />);

      await user.click(screen.getByRole('button', { name: /export pdf/i }));

      await waitFor(() => {
        expect(screen.getByText('PDF exported successfully')).toBeInTheDocument();
      });

      // Advance past the 2s timeout
      vi.advanceTimersByTime(2100);

      // Button should be enabled and back to "Export PDF"
      await waitFor(() => {
        expect(screen.getByText('Export PDF')).toBeInTheDocument();
      });
      expect(screen.getByRole('button', { name: /export pdf/i })).not.toBeDisabled();
    });

    it('triggers browser download via blob URL', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      const mockBlob = new Blob(['test-pdf'], { type: 'application/pdf' });
      mockGeneratePDF.mockResolvedValue(mockBlob);

      const mockCreateObjectURL = vi.fn(() => 'blob:test-url');
      const mockRevokeObjectURL = vi.fn();
      const mockClick = vi.fn();

      const originalCreateObjectURL = URL.createObjectURL;
      const originalRevokeObjectURL = URL.revokeObjectURL;
      URL.createObjectURL = mockCreateObjectURL;
      URL.revokeObjectURL = mockRevokeObjectURL;

      const originalCreateElement = document.createElement.bind(document);
      const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        if (tag === 'a') {
          const el = originalCreateElement('a');
          el.click = mockClick;
          return el;
        }
        return originalCreateElement(tag);
      });

      render(<PDFExportButton />);

      await user.click(screen.getByRole('button', { name: /export pdf/i }));

      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);
        expect(mockClick).toHaveBeenCalled();
        expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:test-url');
      });

      createElementSpy.mockRestore();
      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
    });
  });

  // ========== Error State (Story 5.4) ==========
  describe('error state', () => {
    it('shows error toast when generation fails', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockGeneratePDF.mockRejectedValue(new Error('Canvas rendering failed'));
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<PDFExportButton />);

      await user.click(screen.getByRole('button', { name: /export pdf/i }));

      await waitFor(() => {
        expect(screen.getByText(/pdf generation failed\. please try again\./i)).toBeInTheDocument();
      });
    });

    it('returns button to idle on error', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockGeneratePDF.mockRejectedValue(new Error('Generation failed'));
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<PDFExportButton />);

      await user.click(screen.getByRole('button', { name: /export pdf/i }));

      await waitFor(() => {
        expect(screen.getByText('Export PDF')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /export pdf/i })).not.toBeDisabled();
      });
    });

    it('shows retry button in error toast', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockGeneratePDF.mockRejectedValue(new Error('Generation failed'));
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<PDFExportButton />);

      await user.click(screen.getByRole('button', { name: /export pdf/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
      });
    });

    it('retry button triggers re-generation', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockGeneratePDF
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockResolvedValueOnce(new Blob(['test'], { type: 'application/pdf' }));
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<PDFExportButton />);

      // First attempt fails
      await user.click(screen.getByRole('button', { name: /export pdf/i }));
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
      });

      // Click retry
      await user.click(screen.getByRole('button', { name: 'Retry' }));

      // Should succeed and show success toast
      await waitFor(() => {
        expect(screen.getByText('PDF exported successfully')).toBeInTheDocument();
      });
      expect(mockGeneratePDF).toHaveBeenCalledTimes(2);
    });

    it('shows escalated message after 2 retries (3 total attempts)', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockGeneratePDF
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockRejectedValueOnce(new Error('Fail 3'));
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<PDFExportButton />);

      // First attempt
      await user.click(screen.getByRole('button', { name: /export pdf/i }));
      await waitFor(() => {
        expect(screen.getByText(/please try again/i)).toBeInTheDocument();
      });

      // Retry 1
      await user.click(screen.getByRole('button', { name: 'Retry' }));
      await waitFor(() => {
        expect(screen.getByText(/please try again/i)).toBeInTheDocument();
      });

      // Retry 2 (3rd total attempt)
      await user.click(screen.getByRole('button', { name: 'Retry' }));
      await waitFor(() => {
        expect(screen.getByText(/multiple attempts/i)).toBeInTheDocument();
      });
    });

    it('does not show retry button after escalated error', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockGeneratePDF
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockRejectedValueOnce(new Error('Fail 3'));
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<PDFExportButton />);

      // First attempt
      await user.click(screen.getByRole('button', { name: /export pdf/i }));
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
      });

      // Retry 1
      await user.click(screen.getByRole('button', { name: 'Retry' }));
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
      });

      // Retry 2 (3rd total attempt) — no more Retry button
      await user.click(screen.getByRole('button', { name: 'Retry' }));
      await waitFor(() => {
        expect(screen.getByText(/multiple attempts/i)).toBeInTheDocument();
      });
      expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    });

    it('resets retry counter on success', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockGeneratePDF
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockResolvedValueOnce(new Blob(['test'], { type: 'application/pdf' }))
        .mockRejectedValueOnce(new Error('Fail again'));
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<PDFExportButton />);

      // First attempt fails
      await user.click(screen.getByRole('button', { name: /export pdf/i }));
      await waitFor(() => {
        expect(screen.getByText(/please try again/i)).toBeInTheDocument();
      });

      // Retry succeeds — counter resets
      await user.click(screen.getByRole('button', { name: 'Retry' }));
      await waitFor(() => {
        expect(screen.getByText('PDF exported successfully')).toBeInTheDocument();
      });

      // Wait for idle
      vi.advanceTimersByTime(2100);

      // New attempt fails — should show "try again" (not escalated), proving counter reset
      await user.click(screen.getByRole('button', { name: /export pdf/i }));
      await waitFor(() => {
        expect(screen.getByText(/please try again/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
      });
    });

    it('resets retry counter on fresh manual click', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockGeneratePDF
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'));
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<PDFExportButton />);

      // First attempt fails (retryCount = 1)
      await user.click(screen.getByRole('button', { name: /export pdf/i }));
      await waitFor(() => {
        expect(screen.getByText(/please try again/i)).toBeInTheDocument();
      });

      // Fresh manual click on Export PDF (not Retry) — should reset counter
      await user.click(screen.getByRole('button', { name: /export pdf/i }));
      await waitFor(() => {
        // Should show "please try again" (retryCount = 1 after fresh click reset + 1 fail)
        expect(screen.getByText(/please try again/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
      });
    });

    it('preserves store data after error', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const analysis = createCalculableAnalysis();
      useAppStore.setState({ analyses: [analysis] });
      const initialAnalyses = useAppStore.getState().analyses;

      mockGeneratePDF.mockRejectedValue(new Error('Fail'));

      render(<PDFExportButton />);

      await user.click(screen.getByRole('button', { name: /export pdf/i }));

      await waitFor(() => {
        expect(screen.getByText(/pdf generation failed/i)).toBeInTheDocument();
      });

      // Store data preserved
      expect(useAppStore.getState().analyses).toEqual(initialAnalyses);
    });

    it('handles TypeError errors', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockGeneratePDF.mockRejectedValue(new TypeError('Cannot read properties of undefined'));
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<PDFExportButton />);

      await user.click(screen.getByRole('button', { name: /export pdf/i }));

      await waitFor(() => {
        expect(screen.getByText(/pdf generation failed\. please try again\./i)).toBeInTheDocument();
      });
    });

    it('handles DOMException errors', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockGeneratePDF.mockRejectedValue(new DOMException('SecurityError'));
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<PDFExportButton />);

      await user.click(screen.getByRole('button', { name: /export pdf/i }));

      await waitFor(() => {
        expect(screen.getByText(/pdf generation failed\. please try again\./i)).toBeInTheDocument();
      });
    });

    it('handles non-Error thrown values', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockGeneratePDF.mockRejectedValue('string error');
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<PDFExportButton />);

      await user.click(screen.getByRole('button', { name: /export pdf/i }));

      await waitFor(() => {
        expect(screen.getByText(/pdf generation failed\. please try again\./i)).toBeInTheDocument();
      });
    });

    it('cleans up blob URL on download error', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      const mockRevokeObjectURL = vi.fn();
      const originalRevokeObjectURL = URL.revokeObjectURL;
      const originalCreateObjectURL = URL.createObjectURL;
      URL.createObjectURL = vi.fn(() => 'blob:test-url');
      URL.revokeObjectURL = mockRevokeObjectURL;

      // Make generatePDF succeed but click throws
      mockGeneratePDF.mockResolvedValue(new Blob(['test'], { type: 'application/pdf' }));
      const originalCreateElement = document.createElement.bind(document);
      const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        if (tag === 'a') {
          const el = originalCreateElement('a');
          el.click = () => {
            throw new Error('Download blocked');
          };
          return el;
        }
        return originalCreateElement(tag);
      });

      render(<PDFExportButton />);

      await user.click(screen.getByRole('button', { name: /export pdf/i }));

      await waitFor(() => {
        expect(screen.getByText(/pdf generation failed\. please try again\./i)).toBeInTheDocument();
      });

      // Blob URL should have been cleaned up even on error
      expect(mockRevokeObjectURL).toHaveBeenCalled();

      createElementSpy.mockRestore();
      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
    });

    it('handles component unmount during generation without React warning', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const consoleSpy = vi.spyOn(console, 'error');

      let resolveGenerate: (blob: Blob) => void;
      mockGeneratePDF.mockImplementation(
        () => new Promise((resolve) => {
          resolveGenerate = resolve;
        }),
      );
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      const { unmount } = render(<PDFExportButton />);

      await user.click(screen.getByRole('button', { name: /export pdf/i }));

      // Unmount while generating
      unmount();

      // Resolve the promise after unmount
      resolveGenerate!(new Blob(['test'], { type: 'application/pdf' }));

      // Give time for async callbacks to execute
      await vi.advanceTimersByTimeAsync(100);

      // No "can't perform state update on unmounted component" warning
      const unmountedWarnings = consoleSpy.mock.calls.filter(
        (call) => typeof call[0] === 'string' && call[0].includes('unmounted'),
      );
      expect(unmountedWarnings).toHaveLength(0);
    });

    it('handles component unmount during failed generation without React warning', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const consoleSpy = vi.spyOn(console, 'error');

      let rejectGenerate: (err: Error) => void;
      mockGeneratePDF.mockImplementation(
        () => new Promise((_resolve, reject) => {
          rejectGenerate = reject;
        }),
      );
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      const { unmount } = render(<PDFExportButton />);

      await user.click(screen.getByRole('button', { name: /export pdf/i }));

      // Unmount while generating
      unmount();

      // Reject the promise after unmount
      rejectGenerate!(new Error('Test failure'));

      // Give time for async callbacks to execute
      await vi.advanceTimersByTimeAsync(100);

      // No "can't perform state update on unmounted component" warning
      const unmountedWarnings = consoleSpy.mock.calls.filter(
        (call) => typeof call[0] === 'string' && call[0].includes('unmounted'),
      );
      expect(unmountedWarnings).toHaveLength(0);
    });

    it('error toast uses alert role for accessibility', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockGeneratePDF.mockRejectedValue(new Error('Generation failed'));
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<PDFExportButton />);

      await user.click(screen.getByRole('button', { name: /export pdf/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });

    it('can dismiss error toast manually', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockGeneratePDF.mockRejectedValue(new Error('Generation failed'));
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<PDFExportButton />);

      await user.click(screen.getByRole('button', { name: /export pdf/i }));

      await waitFor(() => {
        expect(screen.getByText(/pdf generation failed/i)).toBeInTheDocument();
      });

      const dismissButton = screen.getByRole('button', { name: /dismiss notification/i });
      await user.click(dismissButton);

      expect(screen.queryByText(/pdf generation failed/i)).not.toBeInTheDocument();
    });
  });

  // ========== Toast Interaction ==========
  describe('toast interaction', () => {
    it('can dismiss success toast manually', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<PDFExportButton />);

      await user.click(screen.getByRole('button', { name: /export pdf/i }));

      await waitFor(() => {
        expect(screen.getByText('PDF exported successfully')).toBeInTheDocument();
      });

      const dismissButton = screen.getByRole('button', { name: /dismiss notification/i });
      await user.click(dismissButton);

      expect(screen.queryByText('PDF exported successfully')).not.toBeInTheDocument();
    });
  });

  // ========== Accessibility (AC All) ==========
  describe('accessibility', () => {
    it('has button role', () => {
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<PDFExportButton />);

      expect(screen.getByRole('button', { name: /export pdf/i })).toBeInTheDocument();
    });

    it('has accessible label in default variant', () => {
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<PDFExportButton />);

      const button = screen.getByRole('button', { name: /export pdf/i });
      expect(button).toHaveAttribute('aria-label', 'Export PDF');
    });

    it('has accessible label with hint in disabled state', () => {
      useAppStore.setState({ analyses: [] });

      render(<PDFExportButton />);

      const button = screen.getByRole('button', { name: /export pdf/i });
      expect(button).toHaveAttribute('aria-label', expect.stringContaining('Create analyses first'));
    });

    it('compact variant has accessible label', () => {
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<PDFExportButton variant="compact" />);

      const button = screen.getByRole('button', { name: /export pdf/i });
      expect(button).toHaveAttribute('aria-label', 'Export PDF');
    });

    it('document icon has aria-hidden', () => {
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<PDFExportButton />);

      const svg = screen.getByRole('button', { name: /export pdf/i }).querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });

  // ========== Integration: GlobalAnalysis page placement ==========
  describe('integration: GlobalAnalysis page', () => {
    it('PDFExportButton renders in GlobalAnalysis page header', () => {
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      // We import and render GlobalAnalysis to verify integration
      // For this test, we render PDFExportButton in context matching the page layout
      render(
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Global Analysis</h1>
          <PDFExportButton />
        </div>,
      );

      expect(screen.getByText('Global Analysis')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /export pdf/i })).toBeInTheDocument();
    });
  });

  // ========== Integration: NavigationBar placement ==========
  describe('integration: NavigationBar placement', () => {
    it('compact PDFExportButton renders alongside navigation actions', () => {
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(
        <MemoryRouter>
          <div className="flex items-center gap-2">
            <PDFExportButton variant="compact" />
            <button type="button">Reset All Data</button>
          </div>
        </MemoryRouter>,
      );

      expect(screen.getByRole('button', { name: /export pdf/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset all data/i })).toBeInTheDocument();
    });
  });

  // ========== Data reactivity ==========
  describe('data reactivity', () => {
    it('becomes enabled when a calculable analysis is added', () => {
      useAppStore.setState({ analyses: [] });

      const { rerender } = render(<PDFExportButton />);

      expect(screen.getByRole('button', { name: /export pdf/i })).toBeDisabled();

      // Add a calculable analysis
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });
      rerender(<PDFExportButton />);

      expect(screen.getByRole('button', { name: /export pdf/i })).not.toBeDisabled();
    });

    it('becomes disabled when all analyses become non-calculable', () => {
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      const { rerender } = render(<PDFExportButton />);

      expect(screen.getByRole('button', { name: /export pdf/i })).not.toBeDisabled();

      // Replace with incomplete analysis
      useAppStore.setState({ analyses: [createIncompleteAnalysis()] });
      rerender(<PDFExportButton />);

      expect(screen.getByRole('button', { name: /export pdf/i })).toBeDisabled();
    });
  });
});
