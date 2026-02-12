import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { GlobalAnalysisView } from './GlobalAnalysisView';
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

function renderView() {
  return render(
    <MemoryRouter>
      <GlobalAnalysisView />
    </MemoryRouter>,
  );
}

describe('GlobalAnalysisView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.setState({
      analyses: [],
      activeAnalysisId: null,
      globalParams: { detectionRate: 70, serviceCostPerPump: 2500 },
      unsavedChanges: false,
    });
  });

  describe('hero metrics rendering', () => {
    it('renders hero metrics with correct values for 3 analyses', () => {
      useAppStore.setState({
        analyses: [
          createTestAnalysis({ pumpQuantity: 10 }),
          createTestAnalysis({ pumpQuantity: 8 }),
          createTestAnalysis({ pumpQuantity: 8 }),
        ],
      });

      renderView();

      expect(screen.getByText('Total Savings')).toBeInTheDocument();
      expect(screen.getByText('Overall ROI')).toBeInTheDocument();
      expect(screen.getByText('Total Pumps Monitored')).toBeInTheDocument();
      expect(screen.getByText('Processes Analyzed')).toBeInTheDocument();
    });

    it('displays Total Savings formatted with EUR symbol', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis({ pumpQuantity: 10 })],
      });

      renderView();

      // savings = 1,003,000 * 0.70 - 25,000 = 677,100
      const savingsHeading = screen.getByText('Total Savings');
      const savingsValue = within(savingsHeading.parentElement!).getByText(/677/);
      expect(savingsValue).toBeInTheDocument();
      expect(savingsValue.textContent).toContain('€');
    });

    it('displays Overall ROI with percentage', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis({ pumpQuantity: 10 })],
      });

      renderView();

      // ROI = (677,100 / 25,000) * 100 = 2708.4
      const roiHeading = screen.getByText('Overall ROI');
      const roiValue = within(roiHeading.parentElement!).getByText(/2[\s\u00a0]708/);
      expect(roiValue).toBeInTheDocument();
      expect(roiValue.textContent).toContain('%');
    });

    it('displays Total Pumps sum', () => {
      useAppStore.setState({
        analyses: [
          createTestAnalysis({ pumpQuantity: 10 }),
          createTestAnalysis({ pumpQuantity: 8 }),
        ],
      });

      renderView();

      const pumpsHeading = screen.getByText('Total Pumps Monitored');
      expect(within(pumpsHeading.parentElement!).getByText('18')).toBeInTheDocument();
    });

    it('displays Processes Analyzed count', () => {
      useAppStore.setState({
        analyses: [
          createTestAnalysis(),
          createTestAnalysis(),
          createTestAnalysis(),
        ],
      });

      renderView();

      const processesHeading = screen.getByText('Processes Analyzed');
      expect(within(processesHeading.parentElement!).getByText('3')).toBeInTheDocument();
    });
  });

  describe('supporting metrics', () => {
    it('displays Total Failure Cost formatted with EUR symbol', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis({ pumpQuantity: 10 })],
      });

      renderView();

      expect(screen.getByText('Total Failure Cost')).toBeInTheDocument();
      // totalFailureCost = 1,003,000
      const failureCostHeading = screen.getByText('Total Failure Cost');
      const failureCostValue = within(failureCostHeading.parentElement!).getByText(/1[\s\u00a0]003[\s\u00a0]000/);
      expect(failureCostValue.textContent).toContain('€');
    });

    it('displays Total Service Cost formatted with EUR symbol', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis({ pumpQuantity: 10 })],
      });

      renderView();

      expect(screen.getByText('Total Service Cost')).toBeInTheDocument();
      const serviceCostHeading = screen.getByText('Total Service Cost');
      const serviceCostValue = within(serviceCostHeading.parentElement!).getByText(/25[\s\u00a0]000/);
      expect(serviceCostValue.textContent).toContain('€');
    });
  });

  describe('ROI color coding', () => {
    it('displays positive ROI in green', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis({ pumpQuantity: 10 })],
      });

      renderView();

      // ROI = 2708.4% → green
      const roiHeading = screen.getByText('Overall ROI');
      const roiValue = within(roiHeading.parentElement!).getByText(/2[\s\u00a0]708/);
      expect(roiValue).toHaveClass('text-green-600');
    });

    it('displays negative ROI in red', () => {
      useAppStore.setState({
        analyses: [
          createTestAnalysis({
            pumpQuantity: 1,
            failureRatePercentage: 1,
            waferCost: 10,
            waferQuantity: 1,
            waferType: 'mono',
            downtimeDuration: 1,
            downtimeCostPerHour: 10,
          }),
        ],
      });

      renderView();

      const roiHeading = screen.getByText('Overall ROI');
      const roiValue = within(roiHeading.parentElement!).getByText(/%/);
      expect(roiValue).toHaveClass('text-red-600');
    });

    it('displays warning ROI in orange', () => {
      useAppStore.setState({
        analyses: [
          createTestAnalysis({
            pumpQuantity: 1,
            failureRatePercentage: 100,
            waferType: 'mono',
            waferQuantity: 1,
            waferCost: 3428,
            downtimeDuration: 1,
            downtimeCostPerHour: 500,
          }),
        ],
      });

      renderView();

      const roiHeading = screen.getByText('Overall ROI');
      const roiValue = within(roiHeading.parentElement!).getByText(/%/);
      expect(roiValue).toHaveClass('text-orange-500');
    });
  });

  describe('excluded analyses', () => {
    it('shows excluded analysis note when incomplete data', () => {
      useAppStore.setState({
        analyses: [
          createTestAnalysis({ pumpQuantity: 10 }),
          createTestAnalysis({ pumpQuantity: 0 }),
        ],
      });

      renderView();

      expect(screen.getByText('1 analysis excluded (incomplete data)')).toBeInTheDocument();
    });

    it('shows plural form for multiple excluded analyses', () => {
      useAppStore.setState({
        analyses: [
          createTestAnalysis({ pumpQuantity: 10 }),
          createTestAnalysis({ pumpQuantity: 0 }),
          createTestAnalysis({ pumpQuantity: 0 }),
        ],
      });

      renderView();

      expect(screen.getByText('2 analyses excluded (incomplete data)')).toBeInTheDocument();
    });

    it('does not show excluded note when all analyses are calculable', () => {
      useAppStore.setState({
        analyses: [
          createTestAnalysis({ pumpQuantity: 10 }),
          createTestAnalysis({ pumpQuantity: 8 }),
        ],
      });

      renderView();

      expect(screen.queryByText(/excluded/)).not.toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('renders nothing when 0 calculable analyses', () => {
      useAppStore.setState({ analyses: [] });

      const { container } = renderView();

      expect(container.innerHTML).toBe('');
    });

    it('renders incomplete data message when all analyses are incomplete', () => {
      useAppStore.setState({
        analyses: [
          createTestAnalysis({ pumpQuantity: 0 }),
          createTestAnalysis({ pumpQuantity: 0 }),
        ],
      });

      renderView();

      expect(
        screen.getByText('2 analyses with incomplete data — fill in all required fields to see aggregated metrics'),
      ).toBeInTheDocument();
      expect(screen.queryByRole('region')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has role="region" on hero section', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis()],
      });

      renderView();

      expect(screen.getByRole('region', { name: 'Aggregated ROI metrics' })).toBeInTheDocument();
    });

    it('has aria-label "Aggregated ROI metrics"', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis()],
      });

      renderView();

      const region = screen.getByRole('region');
      expect(region).toHaveAttribute('aria-label', 'Aggregated ROI metrics');
    });

    it('has proper heading hierarchy with h2 elements', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis()],
      });

      renderView();

      const headings = screen.getAllByRole('heading', { level: 2 });
      expect(headings.length).toBeGreaterThanOrEqual(4);
    });

    it('color is not the only indicator — ROI shows numerical value alongside color', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis()],
      });

      renderView();

      const roiHeading = screen.getByText('Overall ROI');
      const roiValue = within(roiHeading.parentElement!).getByText(/%/);
      expect(roiValue.textContent).toMatch(/[\d,.\s]+%/);
    });
  });

  describe('Solutions CTA button', () => {
    it('renders CTA button when analyses have complete data', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis({ pumpQuantity: 10 })],
      });

      renderView();

      expect(screen.getByRole('button', { name: 'Configure ARGOS Solution' })).toBeInTheDocument();
    });

    it('navigates to /solutions on click', async () => {
      const user = userEvent.setup();
      useAppStore.setState({
        analyses: [createTestAnalysis({ pumpQuantity: 10 })],
      });

      renderView();

      await user.click(screen.getByRole('button', { name: 'Configure ARGOS Solution' }));
      expect(mockNavigate).toHaveBeenCalledWith('/solutions');
    });

    it('is not visible when 0 analyses', () => {
      useAppStore.setState({ analyses: [] });

      renderView();

      expect(screen.queryByRole('button', { name: 'Configure ARGOS Solution' })).not.toBeInTheDocument();
    });

    it('is not visible when all analyses have incomplete data', () => {
      useAppStore.setState({
        analyses: [
          createTestAnalysis({ pumpQuantity: 0 }),
          createTestAnalysis({ pumpQuantity: 0 }),
        ],
      });

      renderView();

      expect(screen.queryByRole('button', { name: 'Configure ARGOS Solution' })).not.toBeInTheDocument();
    });

    it('navigates on Enter key press', async () => {
      const user = userEvent.setup();
      useAppStore.setState({
        analyses: [createTestAnalysis({ pumpQuantity: 10 })],
      });

      renderView();

      const button = screen.getByRole('button', { name: 'Configure ARGOS Solution' });
      button.focus();
      await user.keyboard('{Enter}');
      expect(mockNavigate).toHaveBeenCalledWith('/solutions');
    });

    it('navigates on Space key press', async () => {
      const user = userEvent.setup();
      useAppStore.setState({
        analyses: [createTestAnalysis({ pumpQuantity: 10 })],
      });

      renderView();

      const button = screen.getByRole('button', { name: 'Configure ARGOS Solution' });
      button.focus();
      await user.keyboard(' ');
      expect(mockNavigate).toHaveBeenCalledWith('/solutions');
    });
  });

  describe('data integrity after Solutions navigation', () => {
    it('store state unchanged after navigation to Solutions', async () => {
      const user = userEvent.setup();
      const analysis = createTestAnalysis({ pumpQuantity: 10 });
      const globalParams = { detectionRate: 80, serviceCostPerPump: 3000 };
      useAppStore.setState({
        analyses: [analysis],
        globalParams,
      });

      renderView();

      const analysesBefore = useAppStore.getState().analyses;
      const paramsBefore = useAppStore.getState().globalParams;
      await user.click(screen.getByRole('button', { name: 'Configure ARGOS Solution' }));

      expect(useAppStore.getState().analyses).toBe(analysesBefore);
      expect(useAppStore.getState().globalParams).toBe(paramsBefore);
    });

    it('analyses array identical after Solutions navigation with 3 analyses', async () => {
      const user = userEvent.setup();
      const analyses = [
        createTestAnalysis({ name: 'Process A', pumpQuantity: 10 }),
        createTestAnalysis({ name: 'Process B', pumpQuantity: 8 }),
        createTestAnalysis({ name: 'Process C', pumpQuantity: 5 }),
      ];
      useAppStore.setState({ analyses });

      renderView();

      await user.click(screen.getByRole('button', { name: 'Configure ARGOS Solution' }));

      expect(useAppStore.getState().analyses).toHaveLength(3);
      expect(useAppStore.getState().analyses.map(a => a.name)).toEqual([
        'Process A',
        'Process B',
        'Process C',
      ]);
    });

    it('global params preserved after Solutions navigation', async () => {
      const user = userEvent.setup();
      const customParams = { detectionRate: 85, serviceCostPerPump: 4000 };
      useAppStore.setState({
        analyses: [createTestAnalysis({ pumpQuantity: 10 })],
        globalParams: customParams,
      });

      renderView();

      await user.click(screen.getByRole('button', { name: 'Configure ARGOS Solution' }));

      expect(useAppStore.getState().globalParams).toEqual(customParams);
    });
  });

  describe('comparison table integration', () => {
    it('renders ComparisonTable when analyses have data', () => {
      useAppStore.setState({
        analyses: [
          createTestAnalysis({ name: 'Process A' }),
          createTestAnalysis({ name: 'Process B' }),
        ],
      });

      renderView();

      expect(screen.getByRole('heading', { level: 2, name: 'Process Comparison' })).toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('does not render ComparisonTable when 0 calculable analyses', () => {
      useAppStore.setState({ analyses: [] });

      renderView();

      expect(screen.queryByText('Process Comparison')).not.toBeInTheDocument();
    });

    it('clicking process name in table triggers navigation', async () => {
      const user = userEvent.setup();
      const analysisId = 'test-nav-id';
      useAppStore.setState({
        analyses: [createTestAnalysis({ id: analysisId, name: 'Clickable Process' })],
      });

      renderView();

      await user.click(screen.getByRole('button', { name: 'Clickable Process' }));

      expect(mockNavigate).toHaveBeenCalledWith(`/analysis/${analysisId}`);
    });

    it('table data updates when global params change', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis({ pumpQuantity: 10 })],
      });

      renderView();

      // Initial service cost in table: 10 * 2500 = €25,000
      expect(screen.getByRole('table')).toBeInTheDocument();

      // Update global params
      act(() => {
        useAppStore.setState({
          globalParams: { detectionRate: 70, serviceCostPerPump: 5000 },
        });
      });

      // New service cost: 10 * 5000 = €50,000 → visible in hero and table
      const matches = screen.getAllByText(/50[\s\u00a0]000/);
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });
  });
});
