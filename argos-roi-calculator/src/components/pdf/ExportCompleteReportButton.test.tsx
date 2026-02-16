import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExportCompleteReportButton } from './ExportCompleteReportButton';
import { useAppStore } from '@/stores/app-store';
import type { Analysis } from '@/types';

// Mock the pdf-generator module
vi.mock('@/lib/pdf-generator', () => ({
  generateCompletePDF: vi.fn(),
  captureDiagramAsImage: vi.fn(),
  generateCompleteFilename: vi.fn(),
}));

// Import the mocked module to control return values
import { generateCompletePDF, captureDiagramAsImage, generateCompleteFilename } from '@/lib/pdf-generator';
const mockGenerateCompletePDF = vi.mocked(generateCompletePDF);
const mockCaptureDiagramAsImage = vi.mocked(captureDiagramAsImage);
const mockGenerateCompleteFilename = vi.mocked(generateCompleteFilename);

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

describe('ExportCompleteReportButton', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    localStorage.removeItem('argos-roi-data');
    useAppStore.setState({
      analyses: [],
      activeAnalysisId: null,
      globalParams: { detectionRate: 70, serviceCostPerPump: 2500 },
      excludedFromGlobal: new Set<string>(),
      deploymentMode: 'pilot',
      connectionType: 'ethernet',
      unsavedChanges: false,
    });
    mockGenerateCompletePDF.mockReset();
    mockGenerateCompletePDF.mockResolvedValue(new Blob(['test'], { type: 'application/pdf' }));
    mockCaptureDiagramAsImage.mockReset();
    mockCaptureDiagramAsImage.mockResolvedValue(null);
    mockGenerateCompleteFilename.mockReset();
    mockGenerateCompleteFilename.mockReturnValue('ARGOS-Complete-Proposal-2026-02-16.pdf');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // ========== Idle State (AC1) ==========
  describe('idle state', () => {
    it('renders with "Export Complete Report" text', () => {
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<ExportCompleteReportButton />);

      expect(screen.getByRole('button', { name: /export complete report/i })).toBeInTheDocument();
      expect(screen.getByText('Export Complete Report')).toBeInTheDocument();
    });

    it('renders document icon', () => {
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<ExportCompleteReportButton />);

      const button = screen.getByRole('button', { name: /export complete report/i });
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });

    it('applies custom className', () => {
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<ExportCompleteReportButton className="ml-4" />);

      const button = screen.getByRole('button', { name: /export complete report/i });
      expect(button).toHaveClass('ml-4');
    });
  });

  // ========== Disabled State ==========
  describe('disabled state', () => {
    it('is disabled when no analyses exist', () => {
      useAppStore.setState({ analyses: [] });

      render(<ExportCompleteReportButton />);

      const button = screen.getByRole('button', { name: /export complete report/i });
      expect(button).toBeDisabled();
    });

    it('is disabled when analyses exist but none are calculable', () => {
      useAppStore.setState({ analyses: [createIncompleteAnalysis()] });

      render(<ExportCompleteReportButton />);

      const button = screen.getByRole('button', { name: /export complete report/i });
      expect(button).toBeDisabled();
    });

    it('has aria-disabled attribute when no calculable analyses', () => {
      useAppStore.setState({ analyses: [] });

      render(<ExportCompleteReportButton />);

      const button = screen.getByRole('button', { name: /export complete report/i });
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('shows tooltip "Create analyses first" when disabled', () => {
      useAppStore.setState({ analyses: [] });

      render(<ExportCompleteReportButton />);

      const button = screen.getByRole('button', { name: /export complete report/i });
      expect(button).toHaveAttribute('title', 'Create analyses first');
    });

    it('does not call generateCompletePDF when clicked while disabled', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      useAppStore.setState({ analyses: [] });

      render(<ExportCompleteReportButton />);

      const button = screen.getByRole('button', { name: /export complete report/i });
      await user.click(button);

      expect(mockGenerateCompletePDF).not.toHaveBeenCalled();
    });
  });

  // ========== Enabled State ==========
  describe('enabled state', () => {
    it('is enabled when at least one calculable analysis exists', () => {
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<ExportCompleteReportButton />);

      const button = screen.getByRole('button', { name: /export complete report/i });
      expect(button).not.toBeDisabled();
    });

    it('is enabled with mix of calculable and non-calculable analyses', () => {
      useAppStore.setState({
        analyses: [createCalculableAnalysis(), createIncompleteAnalysis()],
      });

      render(<ExportCompleteReportButton />);

      const button = screen.getByRole('button', { name: /export complete report/i });
      expect(button).not.toBeDisabled();
    });
  });

  // ========== Generating State (AC2) ==========
  describe('generating state', () => {
    it('shows "Generating..." text when clicked', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      let resolveGenerate: (blob: Blob) => void;
      mockGenerateCompletePDF.mockReturnValue(
        new Promise((resolve) => {
          resolveGenerate = resolve;
        }),
      );
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<ExportCompleteReportButton />);

      await user.click(screen.getByRole('button', { name: /export complete report/i }));

      expect(screen.getByText('Generating...')).toBeInTheDocument();

      resolveGenerate!(new Blob(['test'], { type: 'application/pdf' }));
    });

    it('disables button during generation (prevents double-click)', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      let resolveGenerate: (blob: Blob) => void;
      mockGenerateCompletePDF.mockReturnValue(
        new Promise((resolve) => {
          resolveGenerate = resolve;
        }),
      );
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<ExportCompleteReportButton />);

      await user.click(screen.getByRole('button', { name: /export complete report/i }));

      const button = screen.getByRole('button', { name: /export complete report/i });
      expect(button).toBeDisabled();

      resolveGenerate!(new Blob(['test'], { type: 'application/pdf' }));
    });

    it('sets aria-busy during generation', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      let resolveGenerate: (blob: Blob) => void;
      mockGenerateCompletePDF.mockReturnValue(
        new Promise((resolve) => {
          resolveGenerate = resolve;
        }),
      );
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<ExportCompleteReportButton />);

      await user.click(screen.getByRole('button', { name: /export complete report/i }));

      const button = screen.getByRole('button', { name: /export complete report/i });
      expect(button).toHaveAttribute('aria-busy', 'true');

      resolveGenerate!(new Blob(['test'], { type: 'application/pdf' }));
    });
  });

  // ========== Success State (AC3) ==========
  describe('success state', () => {
    it('calls generateCompletePDF with correct arguments', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const analysis = createCalculableAnalysis();
      const globalParams = { detectionRate: 70, serviceCostPerPump: 2500 };
      const excludedFromGlobal = new Set<string>();
      useAppStore.setState({
        analyses: [analysis],
        globalParams,
        excludedFromGlobal,
        deploymentMode: 'pilot',
        connectionType: 'ethernet',
      });

      render(<ExportCompleteReportButton />);

      await user.click(screen.getByRole('button', { name: /export complete report/i }));

      await waitFor(() => {
        expect(mockGenerateCompletePDF).toHaveBeenCalledWith(
          [analysis],
          globalParams,
          expect.any(Set),
          expect.objectContaining({
            deploymentMode: 'pilot',
            connectionType: 'ethernet',
            totalPumps: 10,
            processCount: 1,
          }),
        );
      });
    });

    it('shows success toast after generation completes', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<ExportCompleteReportButton />);

      await user.click(screen.getByRole('button', { name: /export complete report/i }));

      await waitFor(() => {
        expect(screen.getByText('Complete report exported successfully')).toBeInTheDocument();
      });
    });

    it('returns to idle state after 2 seconds', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<ExportCompleteReportButton />);

      await user.click(screen.getByRole('button', { name: /export complete report/i }));

      await waitFor(() => {
        expect(screen.getByText('Complete report exported successfully')).toBeInTheDocument();
      });

      vi.advanceTimersByTime(2100);

      await waitFor(() => {
        expect(screen.getByText('Export Complete Report')).toBeInTheDocument();
      });
      expect(screen.getByRole('button', { name: /export complete report/i })).not.toBeDisabled();
    });

    it('uses correct filename pattern', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<ExportCompleteReportButton />);

      await user.click(screen.getByRole('button', { name: /export complete report/i }));

      await waitFor(() => {
        expect(mockGenerateCompleteFilename).toHaveBeenCalled();
      });
    });

    it('captures diagram before PDF generation', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<ExportCompleteReportButton />);

      await user.click(screen.getByRole('button', { name: /export complete report/i }));

      await waitFor(() => {
        expect(mockCaptureDiagramAsImage).toHaveBeenCalled();
      });
    });

    it('passes captured diagram image to generateCompletePDF', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockCaptureDiagramAsImage.mockResolvedValue('data:image/png;base64,testimage');
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<ExportCompleteReportButton />);

      await user.click(screen.getByRole('button', { name: /export complete report/i }));

      await waitFor(() => {
        expect(mockGenerateCompletePDF).toHaveBeenCalledWith(
          expect.any(Array),
          expect.any(Object),
          expect.any(Set),
          expect.objectContaining({
            diagramImage: 'data:image/png;base64,testimage',
          }),
        );
      });
    });

    it('passes undefined diagramImage when capture returns null', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockCaptureDiagramAsImage.mockResolvedValue(null);
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<ExportCompleteReportButton />);

      await user.click(screen.getByRole('button', { name: /export complete report/i }));

      await waitFor(() => {
        expect(mockGenerateCompletePDF).toHaveBeenCalledWith(
          expect.any(Array),
          expect.any(Object),
          expect.any(Set),
          expect.objectContaining({
            diagramImage: undefined,
          }),
        );
      });
    });

    it('triggers browser download via blob URL', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      const mockBlob = new Blob(['test-pdf'], { type: 'application/pdf' });
      mockGenerateCompletePDF.mockResolvedValue(mockBlob);

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

      render(<ExportCompleteReportButton />);

      await user.click(screen.getByRole('button', { name: /export complete report/i }));

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

  // ========== Error State ==========
  describe('error state', () => {
    it('shows error toast when generation fails', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockGenerateCompletePDF.mockRejectedValue(new Error('Generation failed'));
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<ExportCompleteReportButton />);

      await user.click(screen.getByRole('button', { name: /export complete report/i }));

      await waitFor(() => {
        expect(screen.getByText(/pdf generation failed\. please try again\./i)).toBeInTheDocument();
      });
    });

    it('returns button to idle on error', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockGenerateCompletePDF.mockRejectedValue(new Error('Generation failed'));
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<ExportCompleteReportButton />);

      await user.click(screen.getByRole('button', { name: /export complete report/i }));

      await waitFor(() => {
        expect(screen.getByText('Export Complete Report')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /export complete report/i })).not.toBeDisabled();
      });
    });

    it('shows retry button in error toast', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockGenerateCompletePDF.mockRejectedValue(new Error('Generation failed'));
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<ExportCompleteReportButton />);

      await user.click(screen.getByRole('button', { name: /export complete report/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
      });
    });

    it('retry button triggers re-generation', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockGenerateCompletePDF
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockResolvedValueOnce(new Blob(['test'], { type: 'application/pdf' }));
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<ExportCompleteReportButton />);

      await user.click(screen.getByRole('button', { name: /export complete report/i }));
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Retry' }));

      await waitFor(() => {
        expect(screen.getByText('Complete report exported successfully')).toBeInTheDocument();
      });
      expect(mockGenerateCompletePDF).toHaveBeenCalledTimes(2);
    });

    it('shows escalated message after 2 retries (3 total attempts)', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockGenerateCompletePDF
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockRejectedValueOnce(new Error('Fail 3'));
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<ExportCompleteReportButton />);

      // First attempt
      await user.click(screen.getByRole('button', { name: /export complete report/i }));
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
      mockGenerateCompletePDF
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockRejectedValueOnce(new Error('Fail 3'));
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<ExportCompleteReportButton />);

      await user.click(screen.getByRole('button', { name: /export complete report/i }));
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Retry' }));
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Retry' }));
      await waitFor(() => {
        expect(screen.getByText(/multiple attempts/i)).toBeInTheDocument();
      });
      expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    });

    it('handles component unmount during generation without React warning', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const consoleSpy = vi.spyOn(console, 'error');

      let resolveGenerate: (blob: Blob) => void;
      mockGenerateCompletePDF.mockImplementation(
        () => new Promise((resolve) => {
          resolveGenerate = resolve;
        }),
      );
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      const { unmount } = render(<ExportCompleteReportButton />);

      await user.click(screen.getByRole('button', { name: /export complete report/i }));

      unmount();

      resolveGenerate!(new Blob(['test'], { type: 'application/pdf' }));

      await vi.advanceTimersByTimeAsync(100);

      const unmountedWarnings = consoleSpy.mock.calls.filter(
        (call) => typeof call[0] === 'string' && call[0].includes('unmounted'),
      );
      expect(unmountedWarnings).toHaveLength(0);
    });

    it('error toast uses alert role for accessibility', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockGenerateCompletePDF.mockRejectedValue(new Error('Generation failed'));
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<ExportCompleteReportButton />);

      await user.click(screen.getByRole('button', { name: /export complete report/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });

  // ========== Deployment Mode ==========
  describe('deployment mode', () => {
    it('reads pilot deployment mode from store', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      useAppStore.setState({
        analyses: [createCalculableAnalysis()],
        deploymentMode: 'pilot',
      });

      render(<ExportCompleteReportButton />);

      await user.click(screen.getByRole('button', { name: /export complete report/i }));

      await waitFor(() => {
        expect(mockGenerateCompletePDF).toHaveBeenCalledWith(
          expect.any(Array),
          expect.any(Object),
          expect.any(Set),
          expect.objectContaining({ deploymentMode: 'pilot' }),
        );
      });
    });

    it('reads production deployment mode from store', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      useAppStore.setState({
        analyses: [createCalculableAnalysis()],
        deploymentMode: 'production',
      });

      render(<ExportCompleteReportButton />);

      await user.click(screen.getByRole('button', { name: /export complete report/i }));

      await waitFor(() => {
        expect(mockGenerateCompletePDF).toHaveBeenCalledWith(
          expect.any(Array),
          expect.any(Object),
          expect.any(Set),
          expect.objectContaining({ deploymentMode: 'production' }),
        );
      });
    });
  });

  // ========== Connection Type ==========
  describe('connection type', () => {
    it('reads connection type from store', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      useAppStore.setState({
        analyses: [createCalculableAnalysis()],
        connectionType: 'wifi',
      });

      render(<ExportCompleteReportButton />);

      await user.click(screen.getByRole('button', { name: /export complete report/i }));

      await waitFor(() => {
        expect(mockGenerateCompletePDF).toHaveBeenCalledWith(
          expect.any(Array),
          expect.any(Object),
          expect.any(Set),
          expect.objectContaining({ connectionType: 'wifi' }),
        );
      });
    });
  });

  // ========== Accessibility ==========
  describe('accessibility', () => {
    it('has button role', () => {
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<ExportCompleteReportButton />);

      expect(screen.getByRole('button', { name: /export complete report/i })).toBeInTheDocument();
    });

    it('has accessible label', () => {
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      render(<ExportCompleteReportButton />);

      const button = screen.getByRole('button', { name: /export complete report/i });
      expect(button).toHaveAttribute('aria-label', 'Export Complete Report');
    });

    it('has accessible label with hint in disabled state', () => {
      useAppStore.setState({ analyses: [] });

      render(<ExportCompleteReportButton />);

      const button = screen.getByRole('button', { name: /export complete report/i });
      expect(button).toHaveAttribute('aria-label', expect.stringContaining('Create analyses first'));
    });
  });

  // ========== Data reactivity ==========
  describe('data reactivity', () => {
    it('becomes enabled when a calculable analysis is added', () => {
      useAppStore.setState({ analyses: [] });

      const { rerender } = render(<ExportCompleteReportButton />);

      expect(screen.getByRole('button', { name: /export complete report/i })).toBeDisabled();

      useAppStore.setState({ analyses: [createCalculableAnalysis()] });
      rerender(<ExportCompleteReportButton />);

      expect(screen.getByRole('button', { name: /export complete report/i })).not.toBeDisabled();
    });

    it('becomes disabled when all analyses become non-calculable', () => {
      useAppStore.setState({ analyses: [createCalculableAnalysis()] });

      const { rerender } = render(<ExportCompleteReportButton />);

      expect(screen.getByRole('button', { name: /export complete report/i })).not.toBeDisabled();

      useAppStore.setState({ analyses: [createIncompleteAnalysis()] });
      rerender(<ExportCompleteReportButton />);

      expect(screen.getByRole('button', { name: /export complete report/i })).toBeDisabled();
    });
  });
});
