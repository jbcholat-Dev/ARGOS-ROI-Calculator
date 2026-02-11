import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('full flow: 3 analyses in store → navigate to /global → hero metrics + comparison table visible', () => {
    const analyses = [
      createTestAnalysis({ name: 'Process A', pumpQuantity: 10 }),
      createTestAnalysis({ name: 'Process B', pumpQuantity: 8 }),
      createTestAnalysis({ name: 'Process C', pumpQuantity: 8 }),
    ];
    useAppStore.setState({ analyses });

    renderPage();

    // Verify hero section is rendered
    expect(screen.getByRole('region', { name: 'Aggregated ROI metrics' })).toBeInTheDocument();

    // Verify Total Pumps = 26
    const pumpsHeading = screen.getByText('Total Pumps Monitored');
    expect(within(pumpsHeading.parentElement!).getByText('26')).toBeInTheDocument();

    // Verify Processes Analyzed = 3
    const processesHeading = screen.getByText('Processes Analyzed');
    expect(within(processesHeading.parentElement!).getByText('3')).toBeInTheDocument();

    // Verify headings
    expect(screen.getByText('Total Savings')).toBeInTheDocument();
    expect(screen.getByText('Overall ROI')).toBeInTheDocument();
    expect(screen.getByText('Total Failure Cost')).toBeInTheDocument();
    expect(screen.getByText('Total Service Cost')).toBeInTheDocument();

    // Verify comparison table is rendered
    expect(screen.getByRole('heading', { level: 2, name: 'Process Comparison' })).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();

    // Verify 3 process names are clickable
    expect(screen.getByRole('button', { name: 'Process A' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Process B' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Process C' })).toBeInTheDocument();
  });

  it('click process name in table → navigates to /analysis/:id', async () => {
    const user = userEvent.setup();
    const analysisId = 'nav-test-id';
    useAppStore.setState({
      analyses: [createTestAnalysis({ id: analysisId, name: 'Nav Process' })],
    });

    renderPage();

    await user.click(screen.getByRole('button', { name: 'Nav Process' }));

    expect(mockNavigate).toHaveBeenCalledWith(`/analysis/${analysisId}`);
  });

  it('global param change → table values update', () => {
    useAppStore.setState({
      analyses: [createTestAnalysis({ pumpQuantity: 10 })],
    });

    renderPage();

    // Initial: serviceCost = 10 * 2500 = 25,000
    const initialServiceMatches = screen.getAllByText(/€25[\s\u00a0]000/);
    expect(initialServiceMatches.length).toBeGreaterThanOrEqual(1);

    // Change service cost per pump to 5000
    act(() => {
      useAppStore.setState({
        globalParams: { detectionRate: 70, serviceCostPerPump: 5000 },
      });
    });

    // Now: serviceCost = 10 * 5000 = 50,000 (in both hero and table)
    const updatedMatches = screen.getAllByText(/€50[\s\u00a0]000/);
    expect(updatedMatches.length).toBeGreaterThanOrEqual(1);
  });

  it('sort interaction → rows reorder correctly', async () => {
    const user = userEvent.setup();
    useAppStore.setState({
      analyses: [
        createTestAnalysis({ name: 'Process A', pumpQuantity: 10 }),
        createTestAnalysis({ name: 'Process B', pumpQuantity: 15 }),
        createTestAnalysis({ name: 'Process C', pumpQuantity: 6 }),
      ],
    });

    renderPage();

    // Click on Pumps header to sort by Pumps descending
    await user.click(screen.getByText('Pumps'));

    const buttons = screen.getAllByRole('button');
    const processNames = buttons
      .filter((btn) => ['Process A', 'Process B', 'Process C'].includes(btn.textContent!))
      .map((btn) => btn.textContent);

    // Pumps descending: B (15) > A (10) > C (6)
    expect(processNames).toEqual(['Process B', 'Process A', 'Process C']);
  });

  it('mixed data (2 calculable + 1 incomplete) → only 2 rows in table', () => {
    useAppStore.setState({
      analyses: [
        createTestAnalysis({ name: 'Valid A', pumpQuantity: 10 }),
        createTestAnalysis({ name: 'Valid B', pumpQuantity: 8 }),
        createTestAnalysis({ name: 'Incomplete', pumpQuantity: 0 }),
      ],
    });

    renderPage();

    // Table should have 2 rows
    const table = screen.getByRole('table');
    const tbody = table.querySelector('tbody');
    const rows = within(tbody as HTMLElement).getAllByRole('row');
    expect(rows).toHaveLength(2);

    // Only valid processes visible
    expect(screen.getByRole('button', { name: 'Valid A' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Valid B' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Incomplete' })).not.toBeInTheDocument();

    // Excluded note
    expect(screen.getByText('1 analysis excluded (incomplete data)')).toBeInTheDocument();
  });

  it('incomplete analysis excluded from aggregation', () => {
    useAppStore.setState({
      analyses: [
        createTestAnalysis({ pumpQuantity: 10 }),
        createTestAnalysis({ pumpQuantity: 0 }),
      ],
    });

    renderPage();

    expect(screen.getByText('1 analysis excluded (incomplete data)')).toBeInTheDocument();
    const pumpsHeading = screen.getByText('Total Pumps Monitored');
    expect(within(pumpsHeading.parentElement!).getByText('10')).toBeInTheDocument();
  });

  it('add analysis → count increases', () => {
    useAppStore.setState({
      analyses: [createTestAnalysis({ pumpQuantity: 10 })],
    });

    renderPage();

    const processesHeading = screen.getByText('Processes Analyzed');
    expect(within(processesHeading.parentElement!).getByText('1')).toBeInTheDocument();

    act(() => {
      useAppStore.setState({
        analyses: [
          createTestAnalysis({ pumpQuantity: 10 }),
          createTestAnalysis({ pumpQuantity: 8 }),
        ],
      });
    });

    expect(within(processesHeading.parentElement!).getByText('2')).toBeInTheDocument();
  });
});
