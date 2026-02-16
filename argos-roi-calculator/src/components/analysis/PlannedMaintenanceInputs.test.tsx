import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { PlannedMaintenanceInputs } from './PlannedMaintenanceInputs';
import { useAppStore } from '@/stores/app-store';
import type { Analysis } from '@/types';

describe('PlannedMaintenanceInputs', () => {
  const mockAnalysisId = 'test-planned-id';

  const createTestAnalysis = (overrides: Partial<Analysis> = {}): Analysis => ({
    id: mockAnalysisId,
    name: 'Test PM Analysis',
    pumpType: 'HiPace (turbo)',
    pumpQuantity: 20,
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
    maintenanceStrategy: 'planned',
    overhaulCostPerPump: 25_000,
    pmIntervalMonths: 24,
    argosMtbfExtensionPercent: 15,
    unplannedDespitePM: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  });

  beforeEach(() => {
    useAppStore.setState({
      analyses: [],
      activeAnalysisId: null,
      globalParams: { detectionRate: 70, serviceCostPerPump: 2500 },
      excludedFromGlobal: new Set<string>(),
      unsavedChanges: false,
    });
  });

  it('should render PM interval input', () => {
    useAppStore.getState().addAnalysis(createTestAnalysis());
    render(<PlannedMaintenanceInputs analysisId={mockAnalysisId} />);

    expect(screen.getByLabelText(/pm interval/i)).toBeInTheDocument();
  });

  it('should render MTBF extension slider', () => {
    useAppStore.getState().addAnalysis(createTestAnalysis());
    render(<PlannedMaintenanceInputs analysisId={mockAnalysisId} />);

    expect(screen.getByLabelText(/argos mtbf extension/i)).toBeInTheDocument();
  });

  it('should render unplanned despite PM input', () => {
    useAppStore.getState().addAnalysis(createTestAnalysis());
    render(<PlannedMaintenanceInputs analysisId={mockAnalysisId} />);

    expect(screen.getByLabelText(/unplanned failures despite pm/i)).toBeInTheDocument();
  });

  it('should show calculated overhaul rates when pumps and interval are set', () => {
    useAppStore.getState().addAnalysis(createTestAnalysis());
    render(<PlannedMaintenanceInputs analysisId={mockAnalysisId} />);

    // 20 pumps / (24/12) = 10 overhauls/year
    expect(screen.getByTestId('current-overhauls')).toHaveTextContent('10,0');
    expect(screen.getByTestId('projected-overhauls')).toBeInTheDocument();
  });

  it('should NOT show overhaul rates when pump quantity is 0', () => {
    useAppStore.getState().addAnalysis(createTestAnalysis({ pumpQuantity: 0 }));
    render(<PlannedMaintenanceInputs analysisId={mockAnalysisId} />);

    expect(screen.queryByTestId('current-overhauls')).not.toBeInTheDocument();
  });

  it('should update PM interval in store', async () => {
    const user = userEvent.setup();
    useAppStore.getState().addAnalysis(createTestAnalysis({ pmIntervalMonths: 0 }));
    render(<PlannedMaintenanceInputs analysisId={mockAnalysisId} />);

    const intervalInput = screen.getByLabelText(/pm interval/i);
    await user.type(intervalInput, '18');

    const analysis = useAppStore.getState().analyses.find((a) => a.id === mockAnalysisId);
    expect(analysis?.pmIntervalMonths).toBe(18);
  });

  it('should update MTBF extension in store on slider change', () => {
    useAppStore.getState().addAnalysis(createTestAnalysis({ argosMtbfExtensionPercent: 15 }));
    render(<PlannedMaintenanceInputs analysisId={mockAnalysisId} />);

    const slider = screen.getByLabelText(/argos mtbf extension/i);
    // Use fireEvent for range inputs (userEvent.clear doesn't work on range)
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(slider, '25');
    slider.dispatchEvent(new Event('change', { bubbles: true }));

    const analysis = useAppStore.getState().analyses.find((a) => a.id === mockAnalysisId);
    expect(analysis?.argosMtbfExtensionPercent).toBe(25);
  });

  it('should display current MTBF extension percentage', () => {
    useAppStore.getState().addAnalysis(createTestAnalysis({ argosMtbfExtensionPercent: 20 }));
    render(<PlannedMaintenanceInputs analysisId={mockAnalysisId} />);

    expect(screen.getByText('20%')).toBeInTheDocument();
  });

  it('should render nothing when analysis is not found', () => {
    const { container } = render(<PlannedMaintenanceInputs analysisId="nonexistent" />);
    expect(container.firstChild).toBeNull();
  });

  it('should have accessible section label', () => {
    useAppStore.getState().addAnalysis(createTestAnalysis());
    render(<PlannedMaintenanceInputs analysisId={mockAnalysisId} />);

    expect(screen.getByRole('region', { name: /planned maintenance/i })).toBeInTheDocument();
  });

  it('should update unplannedDespitePM in store', async () => {
    const user = userEvent.setup();
    useAppStore.getState().addAnalysis(createTestAnalysis({ unplannedDespitePM: 0 }));
    render(<PlannedMaintenanceInputs analysisId={mockAnalysisId} />);

    const residualInput = screen.getByLabelText(/unplanned failures despite pm/i);
    await user.type(residualInput, '3');

    const analysis = useAppStore.getState().analyses.find((a) => a.id === mockAnalysisId);
    expect(analysis?.unplannedDespitePM).toBe(3);
  });
});
