import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResultsPanel } from './ResultsPanel';
import { useAppStore } from '@/stores/app-store';
import type { Analysis } from '@/types';

const createTestAnalysis = (overrides?: Partial<Analysis>): Analysis => ({
  id: 'test-analysis-1',
  name: 'Poly Etch - Chamber 04',
  pumpType: 'A3004XN',
  pumpQuantity: 0,
  failureRateMode: 'percentage',
  failureRatePercentage: 0,
  waferType: 'mono',
  waferQuantity: 1,
  waferCost: 0,
  waferDefectEventsPerYear: 0,
  downtimeDuration: 0,
  downtimeCostPerHour: 0,
  isBottleneck: false,
  bottleneckMultiplier: 2.0,
  maintenanceStrategy: 'unplanned' as const,
  overhaulCostPerPump: 0,
  pmIntervalMonths: 12,
  argosMtbfExtensionPercent: 15,
  unplannedDespitePM: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// Full data analysis: 10 pumps, 10% failure, €8000/wafer, 125 wafers/batch, 6h downtime, €500/h, 1 defect event
// Decoupled formula (Story 4.5.2):
//   waferDefectCost = 1 × 8000 × 125 = 1,000,000
//   downtimeCost = (10 × 0.10) × 6 × 500 = 1 × 3,000 = 3,000
//   totalFailureCost = 1,000,000 + 3,000 = 1,003,000
// serviceCost = 10 × 2500 = 25,000
// savings = 1,003,000 × 0.70 - 25,000 = 702,100 - 25,000 = 677,100
// roi = (677,100 / 25,000) × 100 = 2708.4
const fullDataAnalysis = (): Analysis =>
  createTestAnalysis({
    pumpQuantity: 10,
    failureRatePercentage: 10,
    waferType: 'batch',
    waferQuantity: 125,
    waferCost: 8000,
    waferDefectEventsPerYear: 1,
    downtimeDuration: 6,
    downtimeCostPerHour: 500,
    isBottleneck: false,
    bottleneckMultiplier: 2.0,
    maintenanceStrategy: 'unplanned' as const,
    overhaulCostPerPump: 0,
    pmIntervalMonths: 12,
    argosMtbfExtensionPercent: 15,
    unplannedDespitePM: 0,
  });

describe('ResultsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.setState({
      analyses: [createTestAnalysis()],
      activeAnalysisId: 'test-analysis-1',
      globalParams: { detectionRate: 70, serviceCostPerPump: 2500 },
      unsavedChanges: false,
    });
  });

  const renderComponent = (analysisId = 'test-analysis-1') => {
    return render(<ResultsPanel analysisId={analysisId} />);
  };

  // ========== Rendering Tests ==========

  describe('Rendering', () => {
    it('renders section heading "Results"', () => {
      renderComponent();
      expect(screen.getByRole('heading', { level: 2, name: 'Results' })).toBeInTheDocument();
    });

    it('renders all 4 metric labels', () => {
      renderComponent();
      expect(screen.getByText('Total Failure Cost')).toBeInTheDocument();
      expect(screen.getByText('ARGOS Service Cost')).toBeInTheDocument();
      expect(screen.getByText('Savings Realized')).toBeInTheDocument();
      expect(screen.getByText('ROI')).toBeInTheDocument();
    });

    it('renders metric labels as h3 headings', () => {
      renderComponent();
      const headings = screen.getAllByRole('heading', { level: 3 });
      expect(headings.length).toBe(4);
    });

    it('renders null when analysis not found', () => {
      const { container } = render(<ResultsPanel analysisId="nonexistent-id" />);
      expect(container.innerHTML).toBe('');
    });

    it('shows incomplete data message when inputs are missing', () => {
      renderComponent();
      expect(screen.getByText('Complete the data to see results')).toBeInTheDocument();
    });
  });

  // ========== Incomplete Data Handling ==========

  describe('Incomplete data handling', () => {
    it('shows "--" placeholder for all metrics when no data entered (all zeros)', () => {
      renderComponent();
      const placeholders = screen.getAllByText('--');
      expect(placeholders.length).toBe(4);
    });

    it('shows "--" for total failure cost and savings/ROI with only pumpQuantity', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis({ pumpQuantity: 5 })],
      });
      renderComponent();

      // Total failure cost should be "--" (need all inputs)
      expect(screen.getByTestId('total-failure-cost-value')).toHaveTextContent('--');
      // Savings and ROI should be "--"
      expect(screen.getByTestId('savings-value')).toHaveTextContent('--');
      expect(screen.getByTestId('roi-value')).toHaveTextContent('--');
    });

    it('shows ARGOS Service Cost when only pumpQuantity > 0', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis({ pumpQuantity: 5 })],
      });
      renderComponent();

      // ARGOS Service Cost: 5 × 2500 = 12,500
      expect(screen.getByTestId('argos-service-cost-value')).not.toHaveTextContent('--');
      expect(screen.getByTestId('argos-service-cost-value').textContent).toMatch(/12\s?500/);
    });

    it('does not show incomplete message when all data is present', () => {
      useAppStore.setState({
        analyses: [fullDataAnalysis()],
      });
      renderComponent();

      expect(screen.queryByText('Complete the data to see results')).not.toBeInTheDocument();
    });

    it('never shows NaN or Infinity', () => {
      renderComponent();
      const content = document.body.textContent || '';
      expect(content).not.toContain('NaN');
      expect(content).not.toContain('Infinity');
    });
  });

  // ========== Calculation Display ==========

  describe('Calculation display', () => {
    beforeEach(() => {
      useAppStore.setState({
        analyses: [fullDataAnalysis()],
      });
    });

    it('displays Total Failure Cost correctly (€1 003 000)', () => {
      renderComponent();
      const value = screen.getByTestId('total-failure-cost-value').textContent!;
      // French formatting: €1 003 000 (with non-breaking spaces)
      expect(value).toMatch(/€.*1[\s\u00a0\u202f]003[\s\u00a0\u202f]000/);
    });

    it('displays ARGOS Service Cost correctly (€25 000)', () => {
      renderComponent();
      const value = screen.getByTestId('argos-service-cost-value').textContent!;
      expect(value).toMatch(/€.*25[\s\u00a0\u202f]000/);
    });

    it('displays Savings correctly (€677 100)', () => {
      renderComponent();
      const value = screen.getByTestId('savings-value').textContent!;
      expect(value).toMatch(/€.*677[\s\u00a0\u202f]100/);
    });

    it('displays ROI correctly (2 708,4 %)', () => {
      renderComponent();
      const value = screen.getByTestId('roi-value').textContent!;
      expect(value).toMatch(/2[\s\u00a0\u202f]708,4\s?%/);
    });

    it('calculates correctly with mono wafer type (forces waferQuantity=1)', () => {
      // Mono mode should use waferQuantity=1 regardless of stored value
      useAppStore.setState({
        analyses: [
          createTestAnalysis({
            pumpQuantity: 10,
            failureRatePercentage: 10,
            waferType: 'mono',
            waferQuantity: 50, // This should be overridden to 1
            waferCost: 8000,
            waferDefectEventsPerYear: 1,
            downtimeDuration: 6,
            downtimeCostPerHour: 500,
            isBottleneck: false,
            bottleneckMultiplier: 2.0,
            maintenanceStrategy: 'unplanned' as const,
            overhaulCostPerPump: 0,
            pmIntervalMonths: 12,
            argosMtbfExtensionPercent: 15,
            unplannedDespitePM: 0,
          }),
        ],
      });
      renderComponent();

      // Decoupled formula with mono (waferQuantity forced to 1):
      //   waferDefectCost = 1 × 8000 × 1 = 8,000
      //   downtimeCost = (10 × 0.10) × 6 × 500 = 3,000
      //   totalFailureCost = 8,000 + 3,000 = 11,000
      const value = screen.getByTestId('total-failure-cost-value').textContent!;
      expect(value).toMatch(/€.*11[\s\u00a0\u202f]000/);
    });

    it('formats negative savings with proper "-€" prefix', () => {
      useAppStore.setState({
        analyses: [
          createTestAnalysis({
            pumpQuantity: 10,
            failureRatePercentage: 1,
            waferType: 'mono',
            waferQuantity: 1,
            waferCost: 100,
            waferDefectEventsPerYear: 0,
            downtimeDuration: 1,
            downtimeCostPerHour: 100,
            isBottleneck: false,
            bottleneckMultiplier: 2.0,
            maintenanceStrategy: 'unplanned' as const,
            overhaulCostPerPump: 0,
            pmIntervalMonths: 12,
            argosMtbfExtensionPercent: 15,
            unplannedDespitePM: 0,
          }),
        ],
      });
      renderComponent();

      // savings is negative → should display as "-€..."
      const savingsText = screen.getByTestId('savings-value').textContent!;
      expect(savingsText).toMatch(/^-€/);
    });
  });

  // ========== Color Coding ==========

  describe('ROI color coding', () => {
    it('shows red class for negative ROI', () => {
      // Scenario: very low failure rate, high service cost → negative savings → negative ROI
      useAppStore.setState({
        analyses: [
          createTestAnalysis({
            pumpQuantity: 10,
            failureRatePercentage: 1,
            waferType: 'mono',
            waferQuantity: 1,
            waferCost: 100,
            waferDefectEventsPerYear: 0,
            downtimeDuration: 1,
            downtimeCostPerHour: 100,
            isBottleneck: false,
            bottleneckMultiplier: 2.0,
            maintenanceStrategy: 'unplanned' as const,
            overhaulCostPerPump: 0,
            pmIntervalMonths: 12,
            argosMtbfExtensionPercent: 15,
            unplannedDespitePM: 0,
          }),
        ],
      });
      renderComponent();

      const roiEl = screen.getByTestId('roi-value');
      expect(roiEl).toHaveClass('text-red-600');
    });

    it('shows orange class for ROI between 0-15%', () => {
      // Decoupled formula: need totalFailureCost such that ROI is 0-15%
      // serviceCost = 10 × 2500 = 25,000
      // waferDefectCost = 10 × 3600 × 1 = 36,000
      // downtimeCost = (10 × 1.0) × 1 × 100 = 1,000
      // totalFailureCost = 37,000
      // savings = 37,000 × 0.70 - 25,000 = 25,900 - 25,000 = 900
      // ROI = (900 / 25,000) × 100 = 3.6% → orange
      useAppStore.setState({
        analyses: [
          createTestAnalysis({
            pumpQuantity: 10,
            failureRatePercentage: 100,
            waferType: 'mono',
            waferQuantity: 1,
            waferCost: 3600,
            waferDefectEventsPerYear: 10,
            downtimeDuration: 1,
            downtimeCostPerHour: 100,
            isBottleneck: false,
            bottleneckMultiplier: 2.0,
            maintenanceStrategy: 'unplanned' as const,
            overhaulCostPerPump: 0,
            pmIntervalMonths: 12,
            argosMtbfExtensionPercent: 15,
            unplannedDespitePM: 0,
          }),
        ],
      });
      renderComponent();

      const roiEl = screen.getByTestId('roi-value');
      expect(roiEl).toHaveClass('text-orange-500');
    });

    it('shows green class for ROI >= 15%', () => {
      useAppStore.setState({
        analyses: [fullDataAnalysis()],
      });
      renderComponent();

      // ROI = 2708.4% → green
      const roiEl = screen.getByTestId('roi-value');
      expect(roiEl).toHaveClass('text-green-600');
    });
  });

  describe('Savings color coding', () => {
    it('shows green for positive savings', () => {
      useAppStore.setState({
        analyses: [fullDataAnalysis()],
      });
      renderComponent();

      const savingsEl = screen.getByTestId('savings-value');
      expect(savingsEl).toHaveClass('text-green-600');
    });

    it('shows red for negative savings', () => {
      useAppStore.setState({
        analyses: [
          createTestAnalysis({
            pumpQuantity: 10,
            failureRatePercentage: 1,
            waferType: 'mono',
            waferQuantity: 1,
            waferCost: 100,
            waferDefectEventsPerYear: 0,
            downtimeDuration: 1,
            downtimeCostPerHour: 100,
            isBottleneck: false,
            bottleneckMultiplier: 2.0,
            maintenanceStrategy: 'unplanned' as const,
            overhaulCostPerPump: 0,
            pmIntervalMonths: 12,
            argosMtbfExtensionPercent: 15,
            unplannedDespitePM: 0,
          }),
        ],
      });
      renderComponent();

      // totalFailureCost = (10 × 0.01) × (100 + 100) = 0.1 × 200 = 20
      // savings = 20 × 0.70 - 25,000 = 14 - 25,000 = -24,986 → negative
      const savingsEl = screen.getByTestId('savings-value');
      expect(savingsEl).toHaveClass('text-red-600');
    });
  });

  // ========== Number Formatting ==========

  describe('Number formatting', () => {
    beforeEach(() => {
      useAppStore.setState({
        analyses: [fullDataAnalysis()],
      });
    });

    it('includes EUR symbol on monetary values', () => {
      renderComponent();

      expect(screen.getByTestId('total-failure-cost-value').textContent).toContain('€');
      expect(screen.getByTestId('argos-service-cost-value').textContent).toContain('€');
      expect(screen.getByTestId('savings-value').textContent).toContain('€');
    });

    it('shows "/an" suffix on annual values', () => {
      renderComponent();
      const annualTexts = screen.getAllByText('/an');
      expect(annualTexts.length).toBeGreaterThanOrEqual(3);
    });

    it('shows ROI with percentage formatting', () => {
      renderComponent();
      const roiText = screen.getByTestId('roi-value').textContent!;
      expect(roiText).toContain('%');
    });

    it('ROI has one decimal place', () => {
      renderComponent();
      const roiText = screen.getByTestId('roi-value').textContent!;
      // Should match pattern like "2 708,4 %"
      expect(roiText).toMatch(/,\d\s?%/);
    });
  });

  // ========== Real-Time Updates ==========

  describe('Real-time updates', () => {
    it('updates results when pumpQuantity changes in store', () => {
      useAppStore.setState({
        analyses: [fullDataAnalysis()],
      });
      const { rerender } = render(<ResultsPanel analysisId="test-analysis-1" />);

      // Change pump quantity
      act(() => {
        useAppStore.getState().updateAnalysis('test-analysis-1', { pumpQuantity: 20 });
      });

      rerender(<ResultsPanel analysisId="test-analysis-1" />);

      // New service cost: 20 × 2500 = 50,000
      const serviceCostText = screen.getByTestId('argos-service-cost-value').textContent!;
      expect(serviceCostText).toMatch(/€.*50[\s\u00a0\u202f]000/);
    });

    it('updates results when globalParams.detectionRate changes', () => {
      useAppStore.setState({
        analyses: [fullDataAnalysis()],
      });
      render(<ResultsPanel analysisId="test-analysis-1" />);

      // Change detection rate from 70 to 90
      act(() => {
        useAppStore.getState().updateGlobalParams({ detectionRate: 90 });
      });

      // New savings: 1,003,000 × 0.90 - 25,000 = 902,700 - 25,000 = 877,700
      const savingsText = screen.getByTestId('savings-value').textContent!;
      expect(savingsText).toMatch(/€.*877[\s\u00a0\u202f]700/);
    });

    it('calculation + render completes within 100ms (NFR-P1)', () => {
      useAppStore.setState({
        analyses: [fullDataAnalysis()],
      });

      const start = performance.now();
      render(<ResultsPanel analysisId="test-analysis-1" />);
      const end = performance.now();

      expect(end - start).toBeLessThan(100);
    });
  });

  // ========== Accessibility ==========

  describe('Accessibility', () => {
    it('has section element with aria-label "Results"', () => {
      renderComponent();
      expect(screen.getByRole('region', { name: 'Results' })).toBeInTheDocument();
    });

    it('uses semantic heading hierarchy (h2 for section, h3 for metrics)', () => {
      renderComponent();
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      expect(screen.getAllByRole('heading', { level: 3 }).length).toBe(4);
    });
  });

  // ========== Planned Mode Tests ==========

  describe('Planned mode display', () => {
    // 12 pumps, 12 months interval, €30,000 overhaul, 20% MTBF extension
    // currentOverhauls = 12 / (12/12) = 12
    // argosOverhauls = 12 / (14.4/12) = 12 / 1.2 = 10
    // overhaulsSaved = 2
    // overhaulSavings = 2 × 30,000 = 60,000
    // serviceCost = 12 × 2500 = 30,000
    // totalFailureCost = 12 × 30,000 = 360,000
    // savings = 60,000 - 30,000 = 30,000
    // ROI = (30,000 / 30,000) × 100 = 100.0%
    const fullPlannedAnalysis = (): Analysis =>
      createTestAnalysis({
        pumpQuantity: 12,
        maintenanceStrategy: 'planned' as const,
        overhaulCostPerPump: 30000,
        pmIntervalMonths: 12,
        argosMtbfExtensionPercent: 20,
        unplannedDespitePM: 0,
        failureRatePercentage: 0,
        waferDefectEventsPerYear: 0,
        downtimeDuration: 0,
        downtimeCostPerHour: 0,
      });

    it('shows "Total Maintenance Cost" label instead of "Total Failure Cost"', () => {
      useAppStore.setState({ analyses: [fullPlannedAnalysis()] });
      renderComponent();

      expect(screen.getByText('Total Maintenance Cost')).toBeInTheDocument();
      expect(screen.queryByText('Total Failure Cost')).not.toBeInTheDocument();
    });

    it('shows "Overhaul Savings Breakdown" instead of "Cost Avoided Breakdown"', () => {
      useAppStore.setState({ analyses: [fullPlannedAnalysis()] });
      renderComponent();

      expect(screen.getByText('Overhaul Savings Breakdown')).toBeInTheDocument();
      expect(screen.queryByText('Cost Avoided Breakdown')).not.toBeInTheDocument();
    });

    it('displays Total Maintenance Cost correctly (€360 000)', () => {
      useAppStore.setState({ analyses: [fullPlannedAnalysis()] });
      renderComponent();

      const value = screen.getByTestId('total-failure-cost-value').textContent!;
      expect(value).toMatch(/€.*360[\s\u00a0\u202f]000/);
    });

    it('displays Savings correctly (€30 000)', () => {
      useAppStore.setState({ analyses: [fullPlannedAnalysis()] });
      renderComponent();

      const value = screen.getByTestId('savings-value').textContent!;
      expect(value).toMatch(/€.*30[\s\u00a0\u202f]000/);
    });

    it('displays ROI correctly (100,0 %)', () => {
      useAppStore.setState({ analyses: [fullPlannedAnalysis()] });
      renderComponent();

      const value = screen.getByTestId('roi-value').textContent!;
      expect(value).toMatch(/100,0\s?%/);
    });

    it('shows overhauls saved in breakdown', () => {
      useAppStore.setState({ analyses: [fullPlannedAnalysis()] });
      renderComponent();

      expect(screen.getByTestId('overhauls-saved')).toHaveTextContent('2,0');
    });

    it('shows overhaul savings in breakdown (€60 000)', () => {
      useAppStore.setState({ analyses: [fullPlannedAnalysis()] });
      renderComponent();

      const value = screen.getByTestId('overhaul-savings').textContent!;
      expect(value).toMatch(/€.*60[\s\u00a0\u202f]000/);
    });

    it('shows MTBF extension percentage in breakdown', () => {
      useAppStore.setState({ analyses: [fullPlannedAnalysis()] });
      renderComponent();

      expect(screen.getByText('+20%')).toBeInTheDocument();
    });

    it('shows planned formula tooltips', async () => {
      const user = userEvent.setup();
      useAppStore.setState({ analyses: [fullPlannedAnalysis()] });
      renderComponent();

      const infoButtons = screen.getAllByLabelText('View calculation formula');

      // Total failure cost formula (planned)
      await user.hover(infoButtons[0]);
      expect(screen.getByRole('tooltip')).toHaveTextContent(
        '(overhauls/year × overhaul cost) + residual failure cost',
      );
      await user.unhover(infoButtons[0]);

      // Savings formula (planned)
      await user.hover(infoButtons[2]);
      expect(screen.getByRole('tooltip')).toHaveTextContent(
        'overhaul savings + residual savings − service cost',
      );
    });
  });

  // ========== Formula Tooltip Tests ==========

  describe('Formula tooltips', () => {
    it('renders info icon next to each metric label', () => {
      renderComponent();
      const infoButtons = screen.getAllByLabelText('View calculation formula');
      expect(infoButtons.length).toBe(4);
    });

    it('shows tooltip on hover', async () => {
      const user = userEvent.setup();
      renderComponent();

      const infoButtons = screen.getAllByLabelText('View calculation formula');
      await user.hover(infoButtons[0]);

      expect(screen.getByRole('tooltip')).toBeInTheDocument();
      expect(screen.getByRole('tooltip')).toHaveTextContent(
        '(defect events × wafer cost × wafers/batch) + (failed pumps × downtime hours × cost/hour × bottleneck multiplier)',
      );
    });

    it('shows tooltip on keyboard focus', async () => {
      const user = userEvent.setup();
      renderComponent();

      const infoButtons = screen.getAllByLabelText('View calculation formula');
      await user.tab();
      // Tab to first info button
      infoButtons[0].focus();

      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('shows correct formula for each metric', async () => {
      const user = userEvent.setup();
      renderComponent();

      const infoButtons = screen.getAllByLabelText('View calculation formula');

      // Total Failure Cost formula
      await user.hover(infoButtons[0]);
      expect(screen.getByRole('tooltip')).toHaveTextContent(
        '(defect events × wafer cost × wafers/batch) + (failed pumps × downtime hours × cost/hour × bottleneck multiplier)',
      );
      await user.unhover(infoButtons[0]);

      // ARGOS Service Cost formula
      await user.hover(infoButtons[1]);
      expect(screen.getByRole('tooltip')).toHaveTextContent(
        'pumps × service cost per pump/year',
      );
      await user.unhover(infoButtons[1]);

      // Savings formula
      await user.hover(infoButtons[2]);
      expect(screen.getByRole('tooltip')).toHaveTextContent(
        'failure cost × detection rate % − service cost',
      );
      await user.unhover(infoButtons[2]);

      // ROI formula
      await user.hover(infoButtons[3]);
      expect(screen.getByRole('tooltip')).toHaveTextContent(
        '(savings ÷ service cost) × 100',
      );
    });

    it('tooltip has aria-describedby link from info button only when visible', async () => {
      const user = userEvent.setup();
      renderComponent();

      const infoButtons = screen.getAllByLabelText('View calculation formula');

      // Before hover: aria-describedby should NOT be set (tooltip not in DOM)
      expect(infoButtons[0]).not.toHaveAttribute('aria-describedby');

      // After hover: aria-describedby should link to tooltip
      await user.hover(infoButtons[0]);
      const tooltip = screen.getByRole('tooltip');
      const tooltipId = tooltip.getAttribute('id');
      expect(infoButtons[0]).toHaveAttribute('aria-describedby', tooltipId);
    });

    it('tooltip disappears on mouse leave', async () => {
      const user = userEvent.setup();
      renderComponent();

      const infoButtons = screen.getAllByLabelText('View calculation formula');
      await user.hover(infoButtons[0]);
      expect(screen.getByRole('tooltip')).toBeInTheDocument();

      await user.unhover(infoButtons[0]);
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });
});
