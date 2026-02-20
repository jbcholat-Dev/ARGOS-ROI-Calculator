import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MtbfInput } from './MtbfInput';
import { useAppStore } from '@/stores/app-store';
import type { Analysis } from '@/types';

describe('MtbfInput', () => {
  const mockAnalysisId = 'test-mtbf-id';

  const createTestAnalysis = (overrides: Partial<Analysis> = {}): Analysis => ({
    id: mockAnalysisId,
    name: 'Test MTBF Analysis',
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
    maintenanceStrategy: 'unplanned',
    overhaulCostPerPump: 0,
    pmIntervalMonths: 12,
    argosMtbfExtensionPercent: 15,
    unplannedDespitePM: 0,
    mtbf: 0,
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

  it('should render MTBF label', () => {
    useAppStore.getState().addAnalysis(createTestAnalysis());
    render(<MtbfInput analysisId={mockAnalysisId} />);
    expect(screen.getByLabelText('MTBF (months)')).toBeInTheDocument();
  });

  it('should have section with aria-label "MTBF"', () => {
    useAppStore.getState().addAnalysis(createTestAnalysis());
    render(<MtbfInput analysisId={mockAnalysisId} />);
    expect(screen.getByRole('region', { name: 'MTBF' })).toBeInTheDocument();
  });

  it('should show empty field when MTBF is 0 (default)', () => {
    useAppStore.getState().addAnalysis(createTestAnalysis());
    render(<MtbfInput analysisId={mockAnalysisId} />);
    const input = screen.getByLabelText('MTBF (months)');
    expect(input).toHaveValue(null);
  });

  it('should display existing MTBF value from store', () => {
    useAppStore.getState().addAnalysis(createTestAnalysis({ mtbf: 18 }));
    render(<MtbfInput analysisId={mockAnalysisId} />);
    const input = screen.getByLabelText('MTBF (months)');
    expect(input).toHaveValue(18);
  });

  it('should update store on valid MTBF input', async () => {
    const user = userEvent.setup();
    useAppStore.getState().addAnalysis(createTestAnalysis());
    render(<MtbfInput analysisId={mockAnalysisId} />);

    const input = screen.getByLabelText('MTBF (months)');
    await user.type(input, '24');

    expect(useAppStore.getState().analyses[0].mtbf).toBe(24);
  });

  it('should show informational helper text', () => {
    useAppStore.getState().addAnalysis(createTestAnalysis());
    render(<MtbfInput analysisId={mockAnalysisId} />);
    expect(screen.getByText(/Informational/)).toBeInTheDocument();
  });

  it('should have placeholder "ex: 18"', () => {
    useAppStore.getState().addAnalysis(createTestAnalysis());
    render(<MtbfInput analysisId={mockAnalysisId} />);
    expect(screen.getByPlaceholderText('ex: 18')).toBeInTheDocument();
  });

  it('should have "months" unit label', () => {
    useAppStore.getState().addAnalysis(createTestAnalysis());
    render(<MtbfInput analysisId={mockAnalysisId} />);
    expect(screen.getByText('months')).toBeInTheDocument();
  });

  it('should have aria-describedby pointing to helper text', () => {
    useAppStore.getState().addAnalysis(createTestAnalysis());
    render(<MtbfInput analysisId={mockAnalysisId} />);
    const input = screen.getByLabelText('MTBF (months)');
    expect(input.getAttribute('aria-describedby')).toBeTruthy();
  });

  it('should have aria-invalid="false"', () => {
    useAppStore.getState().addAnalysis(createTestAnalysis());
    render(<MtbfInput analysisId={mockAnalysisId} />);
    const input = screen.getByLabelText('MTBF (months)');
    expect(input.getAttribute('aria-invalid')).toBe('false');
  });

  it('should return null when analysis not found', () => {
    const { container } = render(<MtbfInput analysisId="nonexistent" />);
    expect(container.firstChild).toBeNull();
  });

  it('should set mtbf to 0 when input is cleared', async () => {
    const user = userEvent.setup();
    useAppStore.getState().addAnalysis(createTestAnalysis({ mtbf: 18 }));
    render(<MtbfInput analysisId={mockAnalysisId} />);

    const input = screen.getByLabelText('MTBF (months)');
    await user.clear(input);

    expect(useAppStore.getState().analyses[0].mtbf).toBe(0);
  });
});
