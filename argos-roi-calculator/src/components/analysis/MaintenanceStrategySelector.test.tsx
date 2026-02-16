import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MaintenanceStrategySelector } from './MaintenanceStrategySelector';
import { useAppStore } from '@/stores/app-store';
import type { Analysis } from '@/types';

describe('MaintenanceStrategySelector', () => {
  const mockAnalysisId = 'test-strategy-id';

  const createTestAnalysis = (overrides: Partial<Analysis> = {}): Analysis => ({
    id: mockAnalysisId,
    name: 'Test Analysis',
    pumpType: 'HiPace (turbo)',
    pumpQuantity: 10,
    failureRateMode: 'percentage',
    failureRatePercentage: 10,
    waferType: 'batch',
    waferQuantity: 125,
    waferCost: 8000,
    waferDefectEventsPerYear: 1,
    downtimeDuration: 6,
    downtimeCostPerHour: 500,
    isBottleneck: false,
    bottleneckMultiplier: 2.0,
    maintenanceStrategy: 'unplanned',
    overhaulCostPerPump: 0,
    pmIntervalMonths: 12,
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

  it('should render Unplanned and Planned radio buttons', () => {
    useAppStore.getState().addAnalysis(createTestAnalysis());
    render(<MaintenanceStrategySelector analysisId={mockAnalysisId} />);

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);
  });

  it('should default to Unplanned selected', () => {
    useAppStore.getState().addAnalysis(createTestAnalysis());
    render(<MaintenanceStrategySelector analysisId={mockAnalysisId} />);

    const radios = screen.getAllByRole('radio');
    // First radio is "Unplanned", second is "Planned"
    expect(radios[0]).toBeChecked();
    expect(radios[1]).not.toBeChecked();
  });

  it('should switch to Planned when clicked', async () => {
    const user = userEvent.setup();
    useAppStore.getState().addAnalysis(createTestAnalysis());
    render(<MaintenanceStrategySelector analysisId={mockAnalysisId} />);

    const radios = screen.getAllByRole('radio');
    await user.click(radios[1]); // Click "Planned"

    const analysis = useAppStore.getState().analyses.find((a) => a.id === mockAnalysisId);
    expect(analysis?.maintenanceStrategy).toBe('planned');
  });

  it('should switch back to Unplanned from Planned', async () => {
    const user = userEvent.setup();
    useAppStore.getState().addAnalysis(createTestAnalysis({ maintenanceStrategy: 'planned' }));
    render(<MaintenanceStrategySelector analysisId={mockAnalysisId} />);

    const radios = screen.getAllByRole('radio');
    await user.click(radios[0]); // Click "Unplanned"

    const analysis = useAppStore.getState().analyses.find((a) => a.id === mockAnalysisId);
    expect(analysis?.maintenanceStrategy).toBe('unplanned');
  });

  it('should render nothing when analysis is not found', () => {
    const { container } = render(<MaintenanceStrategySelector analysisId="nonexistent" />);
    expect(container.firstChild).toBeNull();
  });

  it('should have accessible fieldset with legend', () => {
    useAppStore.getState().addAnalysis(createTestAnalysis());
    render(<MaintenanceStrategySelector analysisId={mockAnalysisId} />);

    expect(screen.getByRole('group', { name: /maintenance strategy/i })).toBeInTheDocument();
  });

  it('should show strategy descriptions', () => {
    useAppStore.getState().addAnalysis(createTestAnalysis());
    render(<MaintenanceStrategySelector analysisId={mockAnalysisId} />);

    expect(screen.getByText(/run to fail/i)).toBeInTheDocument();
    expect(screen.getByText(/fixed-interval pm/i)).toBeInTheDocument();
  });
});
