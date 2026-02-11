import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { GlobalAnalysis } from './GlobalAnalysis';
import { useAppStore } from '@/stores/app-store';
import type { Analysis } from '@/types';

const mockNavigate = vi.hoisted(() => vi.fn());
vi.mock('react-router-dom', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...mod,
    useNavigate: () => mockNavigate,
  };
});

function createTestAnalysis(overrides: Partial<Analysis> = {}): Analysis {
  return {
    id: crypto.randomUUID(),
    name: 'Test Analysis',
    pumpType: 'HiPace (turbo)',
    pumpQuantity: 10,
    failureRateMode: 'percentage',
    failureRatePercentage: 10,
    waferType: 'batch',
    waferQuantity: 125,
    waferCost: 8000,
    downtimeDuration: 6,
    downtimeCostPerHour: 500,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('GlobalAnalysis Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.setState({
      analyses: [],
      activeAnalysisId: null,
      globalParams: { detectionRate: 70, serviceCostPerPump: 2500 },
      unsavedChanges: false,
    });
  });

  const renderPage = () => {
    return render(
      <MemoryRouter initialEntries={['/global']}>
        <GlobalAnalysis />
      </MemoryRouter>,
    );
  };

  it('full flow: add 3 analyses to store → navigate to /global → verify aggregated values', () => {
    const analyses = [
      createTestAnalysis({ name: 'Process A', pumpQuantity: 10 }),
      createTestAnalysis({ name: 'Process B', pumpQuantity: 8 }),
      createTestAnalysis({ name: 'Process C', pumpQuantity: 8 }),
    ];
    useAppStore.setState({ analyses });

    renderPage();

    // Verify hero section is rendered
    expect(screen.getByRole('region', { name: 'Aggregated ROI metrics' })).toBeInTheDocument();

    // Verify Total Pumps = 26 (scoped to metric container)
    const pumpsHeading = screen.getByText('Total Pumps Monitored');
    expect(within(pumpsHeading.parentElement!).getByText('26')).toBeInTheDocument();

    // Verify Processes Analyzed = 3 (scoped to metric container)
    const processesHeading = screen.getByText('Processes Analyzed');
    expect(within(processesHeading.parentElement!).getByText('3')).toBeInTheDocument();

    // Verify headings
    expect(screen.getByText('Total Savings')).toBeInTheDocument();
    expect(screen.getByText('Overall ROI')).toBeInTheDocument();
    expect(screen.getByText('Total Failure Cost')).toBeInTheDocument();
    expect(screen.getByText('Total Service Cost')).toBeInTheDocument();
  });

  it('global param change → metrics update', () => {
    useAppStore.setState({
      analyses: [createTestAnalysis({ pumpQuantity: 10 })],
    });

    renderPage();

    // Initial: serviceCost = 10 * 2500 = 25,000
    expect(screen.getByText(/25[\s\u00a0]000/)).toBeInTheDocument();

    // Change service cost per pump to 5000
    act(() => {
      useAppStore.setState({
        globalParams: { detectionRate: 70, serviceCostPerPump: 5000 },
      });
    });

    // Now: serviceCost = 10 * 5000 = 50,000
    expect(screen.getByText(/50[\s\u00a0]000/)).toBeInTheDocument();
  });

  it('add analysis → count increases', () => {
    useAppStore.setState({
      analyses: [createTestAnalysis({ pumpQuantity: 10 })],
    });

    renderPage();

    // Initially 1 process (scoped to metric container)
    const processesHeading = screen.getByText('Processes Analyzed');
    expect(within(processesHeading.parentElement!).getByText('1')).toBeInTheDocument();

    // Add another analysis
    act(() => {
      useAppStore.setState({
        analyses: [
          createTestAnalysis({ pumpQuantity: 10 }),
          createTestAnalysis({ pumpQuantity: 8 }),
        ],
      });
    });

    // Now 2 processes
    expect(within(processesHeading.parentElement!).getByText('2')).toBeInTheDocument();
  });

  it('incomplete analysis excluded from aggregation', () => {
    useAppStore.setState({
      analyses: [
        createTestAnalysis({ pumpQuantity: 10 }),
        createTestAnalysis({ pumpQuantity: 0 }), // incomplete
      ],
    });

    renderPage();

    // Only 1 calculable
    expect(screen.getByText('1 analysis excluded (incomplete data)')).toBeInTheDocument();
    // Process count = 1 (not 2)
    // Total Pumps = 10 (not 10 + 0) — scoped to metric container
    const pumpsHeading = screen.getByText('Total Pumps Monitored');
    expect(within(pumpsHeading.parentElement!).getByText('10')).toBeInTheDocument();
  });
});
