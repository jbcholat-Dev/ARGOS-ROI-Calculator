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
      excludedFromGlobal: new Set<string>(),
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

  // Story 4.4: Process Selection Filter & Deletion
  describe('process exclusion from Global Analysis (Story 4.4)', () => {
    it('renders checkboxes in comparison table', () => {
      useAppStore.setState({
        analyses: [
          createTestAnalysis({ id: 'a1', name: 'Process A' }),
          createTestAnalysis({ id: 'a2', name: 'Process B' }),
        ],
      });

      renderView();

      expect(screen.getByLabelText('Include Process A in global analysis')).toBeInTheDocument();
      expect(screen.getByLabelText('Include Process B in global analysis')).toBeInTheDocument();
    });

    it('unchecking a process excludes it from KPI calculations (AC2)', () => {
      const analysisA = createTestAnalysis({ id: 'a1', name: 'Process A', pumpQuantity: 10 });
      const analysisB = createTestAnalysis({ id: 'a2', name: 'Process B', pumpQuantity: 8 });
      useAppStore.setState({
        analyses: [analysisA, analysisB],
      });

      renderView();

      // Total pumps before exclusion: 10 + 8 = 18
      const pumpsHeading = screen.getByText('Total Pumps Monitored');
      expect(within(pumpsHeading.parentElement!).getByText('18')).toBeInTheDocument();

      // Exclude Process A
      act(() => {
        useAppStore.getState().toggleExcludeFromGlobal('a1');
      });

      // After exclusion: only Process B = 8 pumps
      expect(within(pumpsHeading.parentElement!).getByText('8')).toBeInTheDocument();
    });

    it('re-checking a process re-includes it in KPI calculations (AC3)', () => {
      const analysisA = createTestAnalysis({ id: 'a1', name: 'Process A', pumpQuantity: 10 });
      const analysisB = createTestAnalysis({ id: 'a2', name: 'Process B', pumpQuantity: 8 });
      useAppStore.setState({
        analyses: [analysisA, analysisB],
      });

      renderView();

      // Exclude then re-include
      act(() => {
        useAppStore.getState().toggleExcludeFromGlobal('a1');
      });

      const pumpsHeading = screen.getByText('Total Pumps Monitored');
      expect(within(pumpsHeading.parentElement!).getByText('8')).toBeInTheDocument();

      act(() => {
        useAppStore.getState().toggleExcludeFromGlobal('a1');
      });

      // Back to 18
      expect(within(pumpsHeading.parentElement!).getByText('18')).toBeInTheDocument();
    });

    it('shows process counter when processes are excluded (AC4)', () => {
      useAppStore.setState({
        analyses: [
          createTestAnalysis({ id: 'a1', name: 'Process A' }),
          createTestAnalysis({ id: 'a2', name: 'Process B' }),
          createTestAnalysis({ id: 'a3', name: 'Process C' }),
        ],
      });

      renderView();

      // No counter when all included
      expect(screen.queryByText(/processes selected/)).not.toBeInTheDocument();

      // Exclude one
      act(() => {
        useAppStore.getState().toggleExcludeFromGlobal('a1');
      });

      expect(screen.getByText('2/3 processes selected')).toBeInTheDocument();
    });

    it('process counter updates in real time (AC4)', () => {
      useAppStore.setState({
        analyses: [
          createTestAnalysis({ id: 'a1', name: 'Process A' }),
          createTestAnalysis({ id: 'a2', name: 'Process B' }),
          createTestAnalysis({ id: 'a3', name: 'Process C' }),
        ],
      });

      renderView();

      act(() => {
        useAppStore.getState().toggleExcludeFromGlobal('a1');
      });

      expect(screen.getByText('2/3 processes selected')).toBeInTheDocument();

      act(() => {
        useAppStore.getState().toggleExcludeFromGlobal('a2');
      });

      expect(screen.getByText('1/3 processes selected')).toBeInTheDocument();
    });

    it('process counter has aria-live for screen readers', () => {
      useAppStore.setState({
        analyses: [
          createTestAnalysis({ id: 'a1', name: 'Process A' }),
          createTestAnalysis({ id: 'a2', name: 'Process B' }),
        ],
      });

      renderView();

      act(() => {
        useAppStore.getState().toggleExcludeFromGlobal('a1');
      });

      const counter = screen.getByText(/processes selected/);
      expect(counter).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('delete confirmation modal (Story 4.4 AC7)', () => {
    it('shows confirmation modal when delete is triggered on excluded row', async () => {
      const user = userEvent.setup();
      useAppStore.setState({
        analyses: [
          createTestAnalysis({ id: 'a1', name: 'Process A' }),
          createTestAnalysis({ id: 'a2', name: 'Process B' }),
        ],
        excludedFromGlobal: new Set(['a1']),
      });

      renderView();

      await user.click(screen.getByLabelText('Supprimer Process A'));

      // Modal should appear with French text
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/Supprimer l'analyse Process A/)).toBeInTheDocument();
    });

    it('modal has correct French body text (AC7)', async () => {
      const user = userEvent.setup();
      useAppStore.setState({
        analyses: [
          createTestAnalysis({ id: 'a1', name: 'Process A' }),
          createTestAnalysis({ id: 'a2', name: 'Process B' }),
        ],
        excludedFromGlobal: new Set(['a1']),
      });

      renderView();

      await user.click(screen.getByLabelText('Supprimer Process A'));

      expect(screen.getByText(/Cette action supprimera/)).toBeInTheDocument();
      expect(screen.getByText(/irr/)).toBeInTheDocument();
    });

    it('modal has Annuler and Supprimer buttons (AC7)', async () => {
      const user = userEvent.setup();
      useAppStore.setState({
        analyses: [
          createTestAnalysis({ id: 'a1', name: 'Process A' }),
          createTestAnalysis({ id: 'a2', name: 'Process B' }),
        ],
        excludedFromGlobal: new Set(['a1']),
      });

      renderView();

      await user.click(screen.getByLabelText('Supprimer Process A'));

      expect(screen.getByRole('button', { name: 'Annuler' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Supprimer' })).toBeInTheDocument();
    });

    it('clicking Annuler closes modal without deleting (AC7)', async () => {
      const user = userEvent.setup();
      useAppStore.setState({
        analyses: [
          createTestAnalysis({ id: 'a1', name: 'Process A' }),
          createTestAnalysis({ id: 'a2', name: 'Process B' }),
        ],
        excludedFromGlobal: new Set(['a1']),
      });

      renderView();

      await user.click(screen.getByLabelText('Supprimer Process A'));
      await user.click(screen.getByRole('button', { name: 'Annuler' }));

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(useAppStore.getState().analyses).toHaveLength(2);
    });

    it('clicking Supprimer deletes the analysis (AC8)', async () => {
      const user = userEvent.setup();
      useAppStore.setState({
        analyses: [
          createTestAnalysis({ id: 'a1', name: 'Process A' }),
          createTestAnalysis({ id: 'a2', name: 'Process B' }),
        ],
        excludedFromGlobal: new Set(['a1']),
      });

      renderView();

      await user.click(screen.getByLabelText('Supprimer Process A'));
      await user.click(screen.getByRole('button', { name: 'Supprimer' }));

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(useAppStore.getState().analyses).toHaveLength(1);
      expect(useAppStore.getState().analyses[0].id).toBe('a2');
    });

    it('deletion cleans up excludedFromGlobal set (AC8)', async () => {
      const user = userEvent.setup();
      useAppStore.setState({
        analyses: [
          createTestAnalysis({ id: 'a1', name: 'Process A' }),
          createTestAnalysis({ id: 'a2', name: 'Process B' }),
        ],
        excludedFromGlobal: new Set(['a1']),
      });

      renderView();

      await user.click(screen.getByLabelText('Supprimer Process A'));
      await user.click(screen.getByRole('button', { name: 'Supprimer' }));

      expect(useAppStore.getState().excludedFromGlobal.has('a1')).toBe(false);
    });

    it('KPIs do not change after deleting excluded process (AC8)', async () => {
      const user = userEvent.setup();
      const analysisA = createTestAnalysis({ id: 'a1', name: 'Process A', pumpQuantity: 10 });
      const analysisB = createTestAnalysis({ id: 'a2', name: 'Process B', pumpQuantity: 8 });
      useAppStore.setState({
        analyses: [analysisA, analysisB],
        excludedFromGlobal: new Set(['a1']),
      });

      renderView();

      // Before deletion: KPIs only count Process B (8 pumps)
      const pumpsHeading = screen.getByText('Total Pumps Monitored');
      expect(within(pumpsHeading.parentElement!).getByText('8')).toBeInTheDocument();

      await user.click(screen.getByLabelText('Supprimer Process A'));
      await user.click(screen.getByRole('button', { name: 'Supprimer' }));

      // After deletion: still 8 pumps (Process A was already excluded)
      expect(within(pumpsHeading.parentElement!).getByText('8')).toBeInTheDocument();
    });

    it('Escape key closes modal (AC7)', async () => {
      const user = userEvent.setup();
      useAppStore.setState({
        analyses: [
          createTestAnalysis({ id: 'a1', name: 'Process A' }),
          createTestAnalysis({ id: 'a2', name: 'Process B' }),
        ],
        excludedFromGlobal: new Set(['a1']),
      });

      renderView();

      await user.click(screen.getByLabelText('Supprimer Process A'));
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(useAppStore.getState().analyses).toHaveLength(2);
    });

    it('modal has aria-describedby attribute (AC7)', async () => {
      const user = userEvent.setup();
      useAppStore.setState({
        analyses: [
          createTestAnalysis({ id: 'a1', name: 'Process A' }),
          createTestAnalysis({ id: 'a2', name: 'Process B' }),
        ],
        excludedFromGlobal: new Set(['a1']),
      });

      renderView();

      await user.click(screen.getByLabelText('Supprimer Process A'));

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-describedby');
      expect(dialog).toHaveAttribute('aria-labelledby');
    });

    it('focus is trapped within modal: Tab and Shift+Tab cycle (AC7)', async () => {
      const user = userEvent.setup();
      useAppStore.setState({
        analyses: [
          createTestAnalysis({ id: 'a1', name: 'Process A' }),
          createTestAnalysis({ id: 'a2', name: 'Process B' }),
        ],
        excludedFromGlobal: new Set(['a1']),
      });

      renderView();

      await user.click(screen.getByLabelText('Supprimer Process A'));
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      const closeButton = screen.getByLabelText('Close modal');
      const annulerButton = screen.getByRole('button', { name: 'Annuler' });
      const supprimerButton = screen.getByRole('button', { name: 'Supprimer' });

      // Focus the last focusable element
      supprimerButton.focus();
      expect(document.activeElement).toBe(supprimerButton);

      // Tab from last element should wrap to first (focus trap)
      await user.tab();
      expect(document.activeElement).toBe(closeButton);

      // Shift+Tab from first element should wrap to last (backward focus trap)
      await user.tab({ shift: true });
      expect(document.activeElement).toBe(supprimerButton);
    });
  });

  describe('delete cascade to Solutions module (Story 4.4 AC8)', () => {
    it('deleted analysis is removed from analyses array used by Solutions (AC8)', async () => {
      const user = userEvent.setup();
      const analysisA = createTestAnalysis({ id: 'a1', name: 'Process A', pumpQuantity: 10 });
      const analysisB = createTestAnalysis({ id: 'a2', name: 'Process B', pumpQuantity: 8 });
      useAppStore.setState({
        analyses: [analysisA, analysisB],
        excludedFromGlobal: new Set(['a1']),
      });

      renderView();

      // Verify both analyses exist before deletion
      expect(useAppStore.getState().analyses).toHaveLength(2);

      // Delete excluded analysis
      await user.click(screen.getByLabelText('Supprimer Process A'));
      await user.click(screen.getByRole('button', { name: 'Supprimer' }));

      // Solutions module reads from analyses array — verify the deleted analysis
      // is completely removed from the store (no orphaned references)
      const state = useAppStore.getState();
      expect(state.analyses).toHaveLength(1);
      expect(state.analyses.find((a) => a.id === 'a1')).toBeUndefined();
      expect(state.excludedFromGlobal.has('a1')).toBe(false);
    });
  });
});
