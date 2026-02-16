import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { OverhaulCostInput } from './OverhaulCostInput';
import { useAppStore } from '@/stores/app-store';
import type { Analysis } from '@/types';

describe('OverhaulCostInput', () => {
  const mockAnalysisId = 'test-overhaul-id';

  const createTestAnalysis = (overrides: Partial<Analysis> = {}): Analysis => ({
    id: mockAnalysisId,
    name: 'Test Analysis',
    pumpType: 'A3004XN',
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

  it('renders overhaul cost input with label', () => {
    useAppStore.getState().addAnalysis(createTestAnalysis());
    render(<OverhaulCostInput analysisId={mockAnalysisId} />);

    expect(screen.getByLabelText(/overhaul cost per pump/i)).toBeInTheDocument();
  });

  it('renders section heading', () => {
    useAppStore.getState().addAnalysis(createTestAnalysis());
    render(<OverhaulCostInput analysisId={mockAnalysisId} />);

    expect(screen.getByRole('heading', { level: 2, name: /overhaul cost/i })).toBeInTheDocument();
  });

  it('has accessible section label', () => {
    useAppStore.getState().addAnalysis(createTestAnalysis());
    render(<OverhaulCostInput analysisId={mockAnalysisId} />);

    expect(screen.getByRole('region', { name: /overhaul cost/i })).toBeInTheDocument();
  });

  it('shows empty when overhaulCostPerPump is 0', () => {
    useAppStore.getState().addAnalysis(createTestAnalysis({ overhaulCostPerPump: 0 }));
    render(<OverhaulCostInput analysisId={mockAnalysisId} />);

    const input = screen.getByLabelText(/overhaul cost per pump/i);
    expect(input).toHaveValue('');
  });

  it('displays French-formatted value when cost is set', () => {
    useAppStore.getState().addAnalysis(createTestAnalysis({ overhaulCostPerPump: 25000 }));
    render(<OverhaulCostInput analysisId={mockAnalysisId} />);

    const input = screen.getByLabelText(/overhaul cost per pump/i) as HTMLInputElement;
    // French formatting: 25 000 (with narrow no-break space or regular space)
    expect(input.value).toMatch(/25[\s\u00a0\u202f]000/);
  });

  it('updates store when user types a value', async () => {
    const user = userEvent.setup();
    useAppStore.getState().addAnalysis(createTestAnalysis({ overhaulCostPerPump: 0 }));
    render(<OverhaulCostInput analysisId={mockAnalysisId} />);

    const input = screen.getByLabelText(/overhaul cost per pump/i);
    await user.click(input);
    await user.type(input, '30000');

    const analysis = useAppStore.getState().analyses.find((a) => a.id === mockAnalysisId);
    expect(analysis?.overhaulCostPerPump).toBe(30000);
  });

  it('renders nothing when analysis is not found', () => {
    const { container } = render(<OverhaulCostInput analysisId="nonexistent" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders with unplanned strategy', () => {
    useAppStore.getState().addAnalysis(createTestAnalysis({ maintenanceStrategy: 'unplanned' }));
    render(<OverhaulCostInput analysisId={mockAnalysisId} />);

    expect(screen.getByLabelText(/overhaul cost per pump/i)).toBeInTheDocument();
  });

  it('renders with planned strategy', () => {
    useAppStore.getState().addAnalysis(createTestAnalysis({ maintenanceStrategy: 'planned' }));
    render(<OverhaulCostInput analysisId={mockAnalysisId} />);

    expect(screen.getByLabelText(/overhaul cost per pump/i)).toBeInTheDocument();
  });
});
