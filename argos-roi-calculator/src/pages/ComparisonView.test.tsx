import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ComparisonView } from './ComparisonView';
import { useAppStore } from '@/stores/app-store';
import type { Analysis } from '@/types';

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock input components to keep tests focused
vi.mock('@/components/analysis/EquipmentInputs', () => ({
  EquipmentInputs: ({ analysisId }: { analysisId: string }) => (
    <div data-testid="equipment-inputs">{analysisId}</div>
  ),
}));

vi.mock('@/components/analysis/FailureRateInput', () => ({
  FailureRateInput: ({ analysisId }: { analysisId: string }) => (
    <div data-testid="failure-rate-input">{analysisId}</div>
  ),
}));

vi.mock('@/components/analysis/DetectionRateInput', () => ({
  DetectionRateInput: ({ analysisId }: { analysisId: string }) => (
    <div data-testid="detection-rate-input">{analysisId}</div>
  ),
}));

vi.mock('@/components/analysis/WaferInputs', () => ({
  WaferInputs: ({ analysisId }: { analysisId: string }) => (
    <div data-testid="wafer-inputs">{analysisId}</div>
  ),
}));

vi.mock('@/components/analysis/DowntimeInputs', () => ({
  DowntimeInputs: ({ analysisId }: { analysisId: string }) => (
    <div data-testid="downtime-inputs">{analysisId}</div>
  ),
}));

const originalAnalysis: Analysis = {
  id: 'original-1',
  name: 'Poly Etch - Chamber 04',
  pumpType: 'A3004XN',
  pumpQuantity: 10,
  failureRateMode: 'percentage',
  failureRatePercentage: 10,
  waferType: 'batch',
  waferQuantity: 125,
  waferCost: 8000,
  downtimeDuration: 6,
  downtimeCostPerHour: 500,
  detectionRate: 70,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const whatIfAnalysis: Analysis = {
  ...originalAnalysis,
  id: 'whatif-1',
  name: 'Poly Etch - Chamber 04 (What If)',
  pumpQuantity: 15,
};

const renderComparison = (origId = 'original-1', wifId = 'whatif-1') => {
  return render(
    <MemoryRouter initialEntries={[`/compare/${origId}/${wifId}`]}>
      <Routes>
        <Route path="/compare/:originalId/:whatIfId" element={<ComparisonView />} />
        <Route path="/" element={<div>Dashboard</div>} />
      </Routes>
    </MemoryRouter>,
  );
};

describe('ComparisonView', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    useAppStore.setState({
      analyses: [originalAnalysis, whatIfAnalysis],
      activeAnalysisId: 'original-1',
      globalParams: { detectionRate: 70, serviceCostPerPump: 2500 },
      unsavedChanges: false,
    });
  });

  it('renders two panels', () => {
    renderComparison();

    expect(screen.getByTestId('original-panel')).toBeInTheDocument();
    expect(screen.getByTestId('whatif-panel')).toBeInTheDocument();
  });

  it('renders action bar with both buttons', () => {
    renderComparison();

    expect(screen.getByRole('button', { name: /Save Both/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Discard What If/i })).toBeInTheDocument();
  });

  it('renders panel labels', () => {
    renderComparison();

    expect(screen.getByText('Original Scenario')).toBeInTheDocument();
    expect(screen.getByText('What If Scenario')).toBeInTheDocument();
  });

  it('redirects when original analysis not found', () => {
    useAppStore.setState({
      analyses: [whatIfAnalysis],
      activeAnalysisId: null,
    });

    renderComparison('nonexistent', 'whatif-1');

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('redirects when what-if analysis not found', () => {
    useAppStore.setState({
      analyses: [originalAnalysis],
      activeAnalysisId: null,
    });

    renderComparison('original-1', 'nonexistent');

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('navigates to dashboard on Save Both (both analyses preserved)', async () => {
    const user = userEvent.setup();
    renderComparison();

    await user.click(screen.getByRole('button', { name: /Save Both/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/');
    // Both analyses should still be in the store
    expect(useAppStore.getState().analyses).toHaveLength(2);
  });

  it('deletes what-if and navigates to dashboard on Discard', async () => {
    const user = userEvent.setup();
    renderComparison();

    await user.click(screen.getByRole('button', { name: /Discard What If/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/');
    // What-if should be removed
    const remaining = useAppStore.getState().analyses;
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe('original-1');
  });

  it('Escape key triggers discard', async () => {
    const user = userEvent.setup();
    renderComparison();

    await user.keyboard('{Escape}');

    expect(mockNavigate).toHaveBeenCalledWith('/');
    expect(useAppStore.getState().analyses).toHaveLength(1);
  });

  it('renders original analysis summary in left panel', () => {
    renderComparison();

    const leftPanel = screen.getByTestId('original-panel');
    expect(leftPanel).toHaveTextContent('A3004XN');
    expect(leftPanel).toHaveTextContent('10');
  });

  it('renders editable inputs in right panel with whatIfId', () => {
    renderComparison();

    expect(screen.getByTestId('equipment-inputs')).toHaveTextContent('whatif-1');
    expect(screen.getByTestId('failure-rate-input')).toHaveTextContent('whatif-1');
    expect(screen.getByTestId('wafer-inputs')).toHaveTextContent('whatif-1');
    expect(screen.getByTestId('downtime-inputs')).toHaveTextContent('whatif-1');
  });

  it('shows MODIFIED badge when what-if values differ from original', () => {
    renderComparison();

    // whatIfAnalysis has pumpQuantity: 15 vs original: 10
    // So the equipment section should have a MODIFIED badge
    const badges = screen.getAllByText('MODIFIED');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('does not show MODIFIED badge when all values match', () => {
    // Set what-if to have identical values to original
    const identicalWhatIf: Analysis = {
      ...originalAnalysis,
      id: 'whatif-1',
      name: 'Poly Etch - Chamber 04 (What If)',
    };
    useAppStore.setState({
      analyses: [originalAnalysis, identicalWhatIf],
    });

    renderComparison();

    expect(screen.queryByText('MODIFIED')).not.toBeInTheDocument();
  });

  it('Replace Original opens confirmation modal', async () => {
    const user = userEvent.setup();
    renderComparison();

    await user.click(screen.getByRole('button', { name: /Replace Original/i }));

    expect(screen.getByText('Replace Original Analysis?')).toBeInTheDocument();
    expect(
      screen.getByText(
        'The What-If scenario will replace the original analysis. This action cannot be undone.',
      ),
    ).toBeInTheDocument();
  });

  it('confirming Replace updates original values and deletes what-if', async () => {
    const user = userEvent.setup();
    renderComparison();

    // Open modal
    await user.click(screen.getByRole('button', { name: /Replace Original/i }));

    // Click Replace in modal
    const replaceButtons = screen.getAllByRole('button', { name: /Replace/i });
    const modalReplace = replaceButtons.find(
      (btn) => btn.closest('[role="dialog"]') !== null,
    );
    expect(modalReplace).toBeDefined();
    await user.click(modalReplace!);

    // Verify original analysis now has what-if values
    const state = useAppStore.getState();
    const updatedOriginal = state.analyses.find((a) => a.id === 'original-1');
    expect(updatedOriginal?.pumpQuantity).toBe(15); // was 10, what-if was 15

    // What-if should be deleted
    const whatIfRemains = state.analyses.find((a) => a.id === 'whatif-1');
    expect(whatIfRemains).toBeUndefined();

    // Should navigate to dashboard
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('canceling Replace keeps comparison view open', async () => {
    const user = userEvent.setup();
    renderComparison();

    // Open modal
    await user.click(screen.getByRole('button', { name: /Replace Original/i }));

    // Click Cancel
    await user.click(screen.getByRole('button', { name: /Cancel/i }));

    // Modal should be gone
    expect(screen.queryByText('Replace Original Analysis?')).not.toBeInTheDocument();

    // Both analyses still exist
    expect(useAppStore.getState().analyses).toHaveLength(2);

    // Did not navigate
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('MODIFIED badge disappears when what-if value reverted to match original', () => {
    renderComparison();

    // Initially modified (pumpQuantity differs)
    expect(screen.getAllByText('MODIFIED').length).toBeGreaterThan(0);

    // Revert what-if to match original
    const revertedWhatIf: Analysis = {
      ...originalAnalysis,
      id: 'whatif-1',
      name: 'Poly Etch - Chamber 04 (What If)',
    };
    useAppStore.setState({
      analyses: [originalAnalysis, revertedWhatIf],
    });

    renderComparison();

    expect(screen.queryByText('MODIFIED')).not.toBeInTheDocument();
  });

  it('has role="main" and aria-label on comparison view', () => {
    renderComparison();

    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('aria-label', 'Scenario Comparison');
  });

  it('has aria-labels on both panels', () => {
    renderComparison();

    expect(screen.getByLabelText('Original Scenario')).toBeInTheDocument();
    expect(screen.getByLabelText('What If Scenario')).toBeInTheDocument();
  });

  it('MODIFIED badges have correct aria-label', () => {
    renderComparison();

    // whatIfAnalysis has pumpQuantity: 15 vs original: 10
    const badges = screen.getAllByLabelText('Field modified from original value');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('delta indicators have descriptive aria-labels', () => {
    renderComparison();

    // DeltaIndicators exist in the results section
    const deltaLabels = screen.getAllByLabelText(/Value (increased|decreased) by/);
    expect(deltaLabels.length).toBeGreaterThan(0);
  });

  it('scroll sync: scrolling left panel syncs right panel', () => {
    renderComparison();

    const leftPanel = screen.getByTestId('original-panel');
    const rightPanel = screen.getByTestId('whatif-panel');

    // Spy on right panel scrollTop setter
    let syncedScrollTop = 0;
    Object.defineProperty(rightPanel, 'scrollTop', {
      get: () => syncedScrollTop,
      set: (value: number) => { syncedScrollTop = value; },
      configurable: true,
    });

    // Mock left panel scrollTop to simulate scroll position
    Object.defineProperty(leftPanel, 'scrollTop', {
      get: () => 200,
      configurable: true,
    });

    // Fire scroll event on left panel
    fireEvent.scroll(leftPanel);

    // Verify right panel scrollTop was set to match left panel
    expect(syncedScrollTop).toBe(200);
  });
});
