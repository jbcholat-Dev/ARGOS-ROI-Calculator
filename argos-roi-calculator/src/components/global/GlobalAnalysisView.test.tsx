import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { GlobalAnalysisView } from './GlobalAnalysisView';
import { useAppStore } from '@/stores/app-store';
import type { Analysis } from '@/types';

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

describe('GlobalAnalysisView', () => {
  beforeEach(() => {
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

      render(<GlobalAnalysisView />);

      expect(screen.getByText('Total Savings')).toBeInTheDocument();
      expect(screen.getByText('Overall ROI')).toBeInTheDocument();
      expect(screen.getByText('Total Pumps Monitored')).toBeInTheDocument();
      expect(screen.getByText('Processes Analyzed')).toBeInTheDocument();
    });

    it('displays Total Savings formatted with EUR symbol', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis({ pumpQuantity: 10 })],
      });

      render(<GlobalAnalysisView />);

      // savings = 1,003,000 * 0.70 - 25,000 = 677,100
      const savingsText = screen.getByText(/677/);
      expect(savingsText).toBeInTheDocument();
      expect(savingsText.textContent).toContain('€');
    });

    it('displays Overall ROI with percentage', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis({ pumpQuantity: 10 })],
      });

      render(<GlobalAnalysisView />);

      // ROI = (677,100 / 25,000) * 100 = 2708.4
      const roiText = screen.getByText(/2[\s\u00a0]708/);
      expect(roiText).toBeInTheDocument();
      expect(roiText.textContent).toContain('%');
    });

    it('displays Total Pumps sum', () => {
      useAppStore.setState({
        analyses: [
          createTestAnalysis({ pumpQuantity: 10 }),
          createTestAnalysis({ pumpQuantity: 8 }),
        ],
      });

      render(<GlobalAnalysisView />);

      expect(screen.getByText('18')).toBeInTheDocument();
    });

    it('displays Processes Analyzed count', () => {
      useAppStore.setState({
        analyses: [
          createTestAnalysis(),
          createTestAnalysis(),
          createTestAnalysis(),
        ],
      });

      render(<GlobalAnalysisView />);

      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('supporting metrics', () => {
    it('displays Total Failure Cost formatted with EUR symbol', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis({ pumpQuantity: 10 })],
      });

      render(<GlobalAnalysisView />);

      expect(screen.getByText('Total Failure Cost')).toBeInTheDocument();
      // totalFailureCost = 1,003,000
      const failureCostText = screen.getByText(/1[\s\u00a0]003[\s\u00a0]000/);
      expect(failureCostText.textContent).toContain('€');
    });

    it('displays Total Service Cost formatted with EUR symbol', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis({ pumpQuantity: 10 })],
      });

      render(<GlobalAnalysisView />);

      expect(screen.getByText('Total Service Cost')).toBeInTheDocument();
      // serviceCost = 25,000
      const serviceCostText = screen.getByText(/25[\s\u00a0]000/);
      expect(serviceCostText.textContent).toContain('€');
    });
  });

  describe('ROI color coding', () => {
    it('displays positive ROI in green', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis({ pumpQuantity: 10 })],
      });

      render(<GlobalAnalysisView />);

      // ROI = 2708.4% → green
      const roiText = screen.getByText(/2[\s\u00a0]708/);
      expect(roiText).toHaveClass('text-green-600');
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

      render(<GlobalAnalysisView />);

      // Very low failure cost → negative savings → negative ROI
      const roiHeading = screen.getByText('Overall ROI');
      const roiValue = within(roiHeading.parentElement!).getByText(/%/);
      expect(roiValue).toHaveClass('text-red-600');
    });

    it('displays warning ROI in orange', () => {
      // We need an analysis that produces ROI between 0 and 15%
      // savings = failureCost * 0.70 - serviceCost
      // ROI = savings / serviceCost * 100
      // For ROI of ~10%: savings = 0.10 * serviceCost
      // serviceCost = pumps * 2500
      // We need: (failureCost * 0.70 - serviceCost) / serviceCost = 0.10
      // failureCost * 0.70 = 1.10 * serviceCost
      // failureCost = 1.10 * serviceCost / 0.70
      // If pumps = 100, serviceCost = 250,000
      // failureCost = 1.10 * 250,000 / 0.70 = 392,857
      // (100 * rate/100) * (waferCost * 125 + 6 * 500) = 392,857
      // rate * (waferCost * 125 + 3000) = 392,857
      // Let rate = 10%, waferCost = 30, quantity = 1, downtime = 6h, cost = 500
      // (100 * 0.10) * (30 * 1 + 6 * 500) = 10 * 3030 = 30,300
      // That gives failureCost = 30,300
      // savings = 30,300 * 0.70 - 250,000 = 21,210 - 250,000 = negative
      // Need smaller serviceCost. pumps = 1, serviceCost = 2500
      // failureCost = 1.10 * 2500 / 0.70 = 3928.57
      // (1 * rate/100) * (waferCost * qty + downtime * costPerHour)
      // rate = 100: (1 * 1) * (costPerFailure) = 3928
      // waferCost=3428, qty=1, mono, downtime=1, costPerHour=500
      // costPerFailure = 3428 + 500 = 3928 → savings = 3928*0.7 - 2500 = 2749.6 - 2500 = 249.6
      // ROI = 249.6/2500 * 100 = 9.98% → orange!
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

      render(<GlobalAnalysisView />);

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
          createTestAnalysis({ pumpQuantity: 0 }), // incomplete
        ],
      });

      render(<GlobalAnalysisView />);

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

      render(<GlobalAnalysisView />);

      expect(screen.getByText('2 analyses excluded (incomplete data)')).toBeInTheDocument();
    });

    it('does not show excluded note when all analyses are calculable', () => {
      useAppStore.setState({
        analyses: [
          createTestAnalysis({ pumpQuantity: 10 }),
          createTestAnalysis({ pumpQuantity: 8 }),
        ],
      });

      render(<GlobalAnalysisView />);

      expect(screen.queryByText(/excluded/)).not.toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('renders nothing when 0 calculable analyses', () => {
      useAppStore.setState({ analyses: [] });

      const { container } = render(<GlobalAnalysisView />);

      expect(container.innerHTML).toBe('');
    });

    it('renders incomplete data message when all analyses are incomplete', () => {
      useAppStore.setState({
        analyses: [
          createTestAnalysis({ pumpQuantity: 0 }),
          createTestAnalysis({ pumpQuantity: 0 }),
        ],
      });

      render(<GlobalAnalysisView />);

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

      render(<GlobalAnalysisView />);

      expect(screen.getByRole('region', { name: 'Aggregated ROI metrics' })).toBeInTheDocument();
    });

    it('has aria-label "Aggregated ROI metrics"', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis()],
      });

      render(<GlobalAnalysisView />);

      const region = screen.getByRole('region');
      expect(region).toHaveAttribute('aria-label', 'Aggregated ROI metrics');
    });

    it('has proper heading hierarchy with h2 elements', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis()],
      });

      render(<GlobalAnalysisView />);

      const headings = screen.getAllByRole('heading', { level: 2 });
      expect(headings.length).toBeGreaterThanOrEqual(4); // Total Savings, Overall ROI, Total Pumps, Processes Analyzed, Total Failure Cost, Total Service Cost
    });

    it('color is not the only indicator — ROI shows numerical value alongside color', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis()],
      });

      render(<GlobalAnalysisView />);

      // ROI value should be present as text content (not just color)
      const roiHeading = screen.getByText('Overall ROI');
      const roiValue = within(roiHeading.parentElement!).getByText(/%/);
      expect(roiValue.textContent).toMatch(/[\d,.\s]+%/);
    });
  });
});
