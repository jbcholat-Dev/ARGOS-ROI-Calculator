import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { FocusMode } from './FocusMode';
import { useAppStore } from '@/stores/app-store';
import type { Analysis } from '@/types';

// Mock EquipmentInputs to keep tests focused
vi.mock('@/components/analysis/EquipmentInputs', () => ({
  EquipmentInputs: ({ analysisId }: { analysisId: string }) => (
    <div data-testid="equipment-inputs">{analysisId}</div>
  ),
}));

// Mock FailureRateInput
vi.mock('@/components/analysis/FailureRateInput', () => ({
  FailureRateInput: () => <div data-testid="failure-rate-input" />,
}));

// Mock WaferInputs
vi.mock('@/components/analysis/WaferInputs', () => ({
  WaferInputs: ({ analysisId }: { analysisId: string }) => (
    <div data-testid="wafer-inputs">{analysisId}</div>
  ),
}));

// Mock DowntimeInputs
vi.mock('@/components/analysis/DowntimeInputs', () => ({
  DowntimeInputs: ({ analysisId }: { analysisId: string }) => (
    <div data-testid="downtime-inputs">{analysisId}</div>
  ),
}));

// Mock ResultsPanel
vi.mock('@/components/analysis/ResultsPanel', () => ({
  ResultsPanel: ({ analysisId }: { analysisId: string }) => (
    <div data-testid="results-panel">{analysisId}</div>
  ),
}));

const createTestAnalysis = (overrides: Partial<Analysis> = {}): Analysis => ({
  id: 'test-id-1',
  name: 'Poly Etch - Chamber 04',
  pumpType: 'A3004XN',
  pumpQuantity: 2,
  failureRateMode: 'percentage',
  failureRatePercentage: 5,
  waferType: 'batch',
  waferQuantity: 125,
  waferCost: 500,
  downtimeDuration: 8,
  downtimeCostPerHour: 1000,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const renderFocusMode = (analysisId: string) => {
  return render(
    <MemoryRouter initialEntries={[`/analysis/${analysisId}`]}>
      <Routes>
        <Route path="/analysis/:id" element={<FocusMode />} />
        <Route path="/" element={<div>Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('FocusMode - EditableAnalysisName Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.setState({
      analyses: [createTestAnalysis()],
      activeAnalysisId: null,
      globalParams: { detectionRate: 70, serviceCostPerPump: 2500 },
      unsavedChanges: false,
    });
  });

  it('renders EditableAnalysisName with correct analysis name', () => {
    renderFocusMode('test-id-1');
    expect(screen.getByText('Poly Etch - Chamber 04')).toBeInTheDocument();
  });

  it('updates analysis name in store when renamed', async () => {
    const user = userEvent.setup();
    renderFocusMode('test-id-1');

    await user.click(screen.getByRole('button', { name: /Renommer/ }));
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'New Name{Enter}');

    const state = useAppStore.getState();
    const analysis = state.analyses.find((a) => a.id === 'test-id-1');
    expect(analysis?.name).toBe('New Name');
  });

  it('shows active badge when analysis is active', () => {
    useAppStore.setState({ activeAnalysisId: 'test-id-1' });
    renderFocusMode('test-id-1');
    expect(screen.getByText('Analyse active')).toBeInTheDocument();
  });

  it('sets activeAnalysisId on mount', async () => {
    renderFocusMode('test-id-1');

    await waitFor(() => {
      expect(useAppStore.getState().activeAnalysisId).toBe('test-id-1');
    });
  });

  it('shows active badge after mount sets active state', async () => {
    renderFocusMode('test-id-1');

    await waitFor(() => {
      expect(screen.getByText('Analyse active')).toBeInTheDocument();
    });
  });
});

describe('FocusMode - WaferInputs Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.setState({
      analyses: [createTestAnalysis()],
      activeAnalysisId: null,
      globalParams: { detectionRate: 70, serviceCostPerPump: 2500 },
      unsavedChanges: false,
    });
  });

  it('renders WaferInputs component in FocusMode', () => {
    renderFocusMode('test-id-1');
    expect(screen.getByTestId('wafer-inputs')).toBeInTheDocument();
  });

  it('passes analysisId to WaferInputs', () => {
    renderFocusMode('test-id-1');
    expect(screen.getByTestId('wafer-inputs')).toHaveTextContent('test-id-1');
  });

  it('renders components in correct order: Equipment → Failure Rate → Wafer', () => {
    renderFocusMode('test-id-1');
    const equipment = screen.getByTestId('equipment-inputs');
    const failureRate = screen.getByTestId('failure-rate-input');
    const wafer = screen.getByTestId('wafer-inputs');

    // Verify all exist
    expect(equipment).toBeInTheDocument();
    expect(failureRate).toBeInTheDocument();
    expect(wafer).toBeInTheDocument();

    // Verify order via DOM position
    const equipmentPos = equipment.compareDocumentPosition(failureRate);
    expect(equipmentPos & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    const failureRatePos = failureRate.compareDocumentPosition(wafer);
    expect(failureRatePos & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});

describe('FocusMode - ResultsPanel Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.setState({
      analyses: [createTestAnalysis()],
      activeAnalysisId: null,
      globalParams: { detectionRate: 70, serviceCostPerPump: 2500 },
      unsavedChanges: false,
    });
  });

  it('renders ResultsPanel component in FocusMode', () => {
    renderFocusMode('test-id-1');
    expect(screen.getByTestId('results-panel')).toBeInTheDocument();
  });

  it('passes analysisId to ResultsPanel', () => {
    renderFocusMode('test-id-1');
    expect(screen.getByTestId('results-panel')).toHaveTextContent('test-id-1');
  });

  it('renders ResultsPanel after all input sections', () => {
    renderFocusMode('test-id-1');
    const downtime = screen.getByTestId('downtime-inputs');
    const results = screen.getByTestId('results-panel');

    // Results should come after downtime inputs
    const position = downtime.compareDocumentPosition(results);
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
