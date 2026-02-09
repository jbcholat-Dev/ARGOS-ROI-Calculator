import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnalysisCard } from './AnalysisCard';
import type { Analysis } from '@/types';

describe('AnalysisCard', () => {
  const baseAnalysis: Analysis = {
    id: 'test-id-123',
    name: 'CVD Chamber 04',
    pumpType: 'A3004XN',
    pumpQuantity: 10,
    failureRateMode: 'percentage',
    failureRatePercentage: 10,
    waferType: 'batch',
    waferQuantity: 125,
    waferCost: 8000,
    downtimeDuration: 6,
    downtimeCostPerHour: 500,
    detectionRate: 70,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  it('renders with analysis data', () => {
    render(<AnalysisCard analysis={baseAnalysis} isActive={false} />);

    expect(screen.getByText('CVD Chamber 04')).toBeInTheDocument();
    expect(screen.getByText(/Pompes/)).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('displays process name correctly', () => {
    render(<AnalysisCard analysis={baseAnalysis} isActive={false} />);

    const heading = screen.getByRole('heading', { name: 'CVD Chamber 04' });
    expect(heading).toBeInTheDocument();
  });

  it('displays pump quantity with "Pompes" label', () => {
    render(<AnalysisCard analysis={baseAnalysis} isActive={false} />);

    expect(screen.getByText(/Pompes/)).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('calculates and displays ROI percentage', () => {
    render(<AnalysisCard analysis={baseAnalysis} isActive={false} />);

    // Expected calculation:
    // Total failure cost = (10 × 0.10) × (8000 × 125 + 6 × 500) = 1 × 1,003,000 = 1,003,000
    // Service cost = 10 × 2500 = 25,000
    // Savings = 1,003,000 × 0.70 - 25,000 = 702,100 - 25,000 = 677,100
    // ROI = (677,100 / 25,000) × 100 = 2708.4%
    // French locale uses comma as decimal separator: 2 708,4
    const roiElement = screen.getByTestId('roi-percentage');
    expect(roiElement.textContent).toMatch(/2[\s\u00a0\u202f]708,4/);
  });

  it('displays ROI with red color for negative ROI', () => {
    const analysisWithNegativeROI: Analysis = {
      ...baseAnalysis,
      failureRatePercentage: 1, // Very low failure rate
      pumpQuantity: 100, // Very high service cost
      waferCost: 100, // Very low wafer cost
      detectionRate: 10, // Very low detection rate
    };

    render(<AnalysisCard analysis={analysisWithNegativeROI} isActive={false} />);

    // Total failure cost = (100 × 0.01) × (100 × 125 + 6 × 500) = 1 × (12,500 + 3,000) = 15,500
    // Service cost = 100 × 2500 = 250,000
    // Savings = 15,500 × 0.10 - 250,000 = 1,550 - 250,000 = -248,450 (negative!)
    // ROI = (-248,450 / 250,000) × 100 = -99.38% (red!)
    const roiElement = screen.getByTestId('roi-percentage');
    expect(roiElement.className).toMatch(/text-red-600/);
  });

  it('displays ROI with orange color for ROI between 0-15%', () => {
    const analysisWithLowROI: Analysis = {
      ...baseAnalysis,
      pumpQuantity: 1,
      failureRatePercentage: 100, // Simplified: 1 failure per year
      waferType: 'mono', // 1 wafer
      waferCost: 8000,
      downtimeDuration: 6,
      downtimeCostPerHour: 500,
      detectionRate: 25, // Low detection rate to get ROI ~10%
    };

    render(<AnalysisCard analysis={analysisWithLowROI} isActive={false} />);

    // Total failure cost = (1 × 1.0) × (8000 × 1 + 6 × 500) = 1 × 11,000 = 11,000
    // Service cost = 1 × 2500 = 2,500
    // Savings = 11,000 × 0.25 - 2,500 = 2,750 - 2,500 = 250
    // ROI = (250 / 2,500) × 100 = 10% (orange!)
    const roiElement = screen.getByTestId('roi-percentage');
    expect(roiElement.className).toMatch(/text-orange-500/);
  });

  it('displays ROI with green color for ROI >15%', () => {
    render(<AnalysisCard analysis={baseAnalysis} isActive={false} />);

    // Base analysis has very high ROI (>2000%)
    const roiElement = screen.getByTestId('roi-percentage');
    expect(roiElement.className).toMatch(/text-green-600/);
  });

  it('displays savings amount with EUR formatting', () => {
    render(<AnalysisCard analysis={baseAnalysis} isActive={false} />);

    // Expected savings = 677,100 EUR
    const savingsText = screen.getByText(/€.*677[\s\u00a0\u202f]100/);
    expect(savingsText).toBeInTheDocument();
  });

  it('active analysis has red border', () => {
    const { container } = render(<AnalysisCard analysis={baseAnalysis} isActive={true} />);

    const card = container.firstChild as HTMLElement;
    expect(card.className).toMatch(/border-primary/);
    expect(card.className).toMatch(/border-2/);
  });

  it('inactive analysis has default border', () => {
    const { container } = render(<AnalysisCard analysis={baseAnalysis} isActive={false} />);

    const card = container.firstChild as HTMLElement;
    expect(card.className).not.toMatch(/border-primary/);
    expect(card.className).not.toMatch(/border-2/);
  });

  it('uses analysis.detectionRate if present', () => {
    const analysisWithCustomDetection: Analysis = {
      ...baseAnalysis,
      detectionRate: 85,
    };

    render(<AnalysisCard analysis={analysisWithCustomDetection} isActive={false} />);

    // With 85% detection rate, savings should be higher
    // Savings = 1,003,000 × 0.85 - 25,000 = 852,550 - 25,000 = 827,550
    // ROI = (827,550 / 25,000) × 100 = 3310.2%
    // French locale uses comma: 3 310,2
    const roiElement = screen.getByTestId('roi-percentage');
    expect(roiElement.textContent).toMatch(/3[\s\u00a0\u202f]310,2/);
  });

  it('falls back to global detectionRate (70) if analysis.detectionRate is undefined', () => {
    const analysisWithoutDetectionRate: Analysis = {
      ...baseAnalysis,
      detectionRate: undefined,
    };

    render(<AnalysisCard analysis={analysisWithoutDetectionRate} isActive={false} />);

    // Should use 70% (global default)
    // Savings = 1,003,000 × 0.70 - 25,000 = 677,100
    const savingsText = screen.getByText(/€.*677[\s\u00a0\u202f]100/);
    expect(savingsText).toBeInTheDocument();
  });

  it('savings calculation matches ResultsPanel (same formulas)', () => {
    render(<AnalysisCard analysis={baseAnalysis} isActive={false} />);

    // This test verifies that AnalysisCard uses the same calculation functions
    // as ResultsPanel, ensuring consistency across the app
    // Expected: 677,100 EUR (calculated using lib/calculations.ts functions)
    const savingsText = screen.getByText(/€.*677[\s\u00a0\u202f]100/);
    expect(savingsText).toBeInTheDocument();
  });

  it('calculates with waferQuantity=1 for mono wafer even if analysis.waferQuantity > 1', () => {
    const monoAnalysisWithHighQuantity: Analysis = {
      ...baseAnalysis,
      waferType: 'mono',
      waferQuantity: 100, // This should be IGNORED for mono type
      waferCost: 8000,
    };

    render(<AnalysisCard analysis={monoAnalysisWithHighQuantity} isActive={false} />);

    // Expected calculation with waferQuantity = 1 (NOT 100):
    // Total failure cost = (10 × 0.10) × (8000 × 1 + 6 × 500) = 1 × 11,000 = 11,000
    // Service cost = 10 × 2500 = 25,000
    // Savings = 11,000 × 0.70 - 25,000 = 7,700 - 25,000 = -17,300 (negative!)
    // ROI = (-17,300 / 25,000) × 100 = -69.2% (red!)
    const roiElement = screen.getByTestId('roi-percentage');
    expect(roiElement.textContent).toMatch(/-69,2/);
    expect(roiElement.className).toMatch(/text-red-600/);
  });

  describe('Card Navigation (Story 3.2)', () => {
    it('calls onClick handler when card is clicked', async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();

      render(<AnalysisCard analysis={baseAnalysis} isActive={false} onClick={onClick} />);

      const card = screen.getByLabelText('Analyse CVD Chamber 04');
      await user.click(card);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('is clickable when onClick is provided', () => {
      const onClick = vi.fn();
      render(<AnalysisCard analysis={baseAnalysis} isActive={false} onClick={onClick} />);

      const card = screen.getByLabelText('Analyse CVD Chamber 04');
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('is not clickable when onClick is not provided', () => {
      render(<AnalysisCard analysis={baseAnalysis} isActive={false} />);

      const card = screen.getByLabelText('Analyse CVD Chamber 04');
      expect(card).toBeInTheDocument();
      expect(card).not.toHaveAttribute('tabIndex');
      expect(card).not.toHaveAttribute('role');
    });

    it('calls onClick when Enter key is pressed', async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();

      render(<AnalysisCard analysis={baseAnalysis} isActive={false} onClick={onClick} />);

      const card = screen.getByLabelText('Analyse CVD Chamber 04');
      card.focus();
      await user.keyboard('{Enter}');

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick when Space key is pressed', async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();

      render(<AnalysisCard analysis={baseAnalysis} isActive={false} onClick={onClick} />);

      const card = screen.getByLabelText('Analyse CVD Chamber 04');
      card.focus();
      await user.keyboard(' ');

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('has hover styles when clickable', () => {
      const onClick = vi.fn();
      const { container } = render(
        <AnalysisCard analysis={baseAnalysis} isActive={false} onClick={onClick} />,
      );

      const card = container.firstChild as HTMLElement;
      expect(card.className).toMatch(/cursor-pointer/);
      expect(card.className).toMatch(/hover:shadow-lg/);
    });

    it('does not have hover styles when not clickable', () => {
      const { container } = render(<AnalysisCard analysis={baseAnalysis} isActive={false} />);

      const card = container.firstChild as HTMLElement;
      expect(card.className).not.toMatch(/cursor-pointer/);
    });
  });
});
