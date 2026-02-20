import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MiniCard } from './MiniCard';
import { useAppStore } from '@/stores/app-store';
import type { Analysis } from '@/types';

function createAnalysis(overrides: Partial<Analysis> = {}): Analysis {
  return {
    id: 'test-id',
    name: 'Poly Etch',
    pumpType: 'A3004XN',
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
    maintenanceStrategy: 'unplanned' as const,
    overhaulCostPerPump: 0,
    pmIntervalMonths: 12,
    argosMtbfExtensionPercent: 15,
    unplannedDespitePM: 0,
  mtbf: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('MiniCard', () => {
  beforeEach(() => {
    useAppStore.setState({
      analyses: [],
      activeAnalysisId: null,
      globalParams: {
        detectionRate: 70,
        serviceCostPerPump: 2500,
      },
      unsavedChanges: false,
    });
  });

  describe('rendering', () => {
    it('should render process name', () => {
      const analysis = createAnalysis({ name: 'Poly Etch' });
      render(<MiniCard analysis={analysis} isActive={false} onClick={() => {}} />);

      expect(screen.getByText('Poly Etch')).toBeInTheDocument();
    });

    it('should render savings with EUR format', () => {
      const analysis = createAnalysis();
      render(<MiniCard analysis={analysis} isActive={false} onClick={() => {}} />);

      // Decoupled: waferDefectCost=1*8000*125=1,000,000, downtimeCost=1*6*500=3,000
      // totalFailureCost = 1,003,000, serviceCost = 25,000
      // savings = 1,003,000 * 0.7 - 25,000 = 677,100
      expect(screen.getByText(/677/)).toBeInTheDocument();
    });

    it('should render ROI percentage', () => {
      const analysis = createAnalysis();
      render(<MiniCard analysis={analysis} isActive={false} onClick={() => {}} />);

      // ROI = (677,100 / 25,000) * 100 = 2708.4%
      expect(screen.getByText(/2[\s\u202f]708/)).toBeInTheDocument();
    });

    it('should truncate long process names', () => {
      const analysis = createAnalysis({ name: 'Very Long Process Name That Should Be Truncated' });
      render(<MiniCard analysis={analysis} isActive={false} onClick={() => {}} />);

      const nameElement = screen.getByText('Very Long Process Name That Should Be Truncated');
      expect(nameElement).toHaveClass('truncate');
    });
  });

  describe('ROI color coding', () => {
    it('should display green badge for ROI > 15%', () => {
      const analysis = createAnalysis();
      render(<MiniCard analysis={analysis} isActive={false} onClick={() => {}} />);

      const badge = screen.getByTestId('roi-badge');
      expect(badge).toHaveStyle({ backgroundColor: '#28A745' });
    });

    it('should display orange badge for ROI 0-15%', () => {
      // Decoupled formula:
      // waferDefectCost = 1 × 3000 × 1 = 3,000
      // downtimeCost = (1 × 1.0) × 1 × 929 = 929
      // totalFailureCost = 3,929
      // serviceCost = 1 × 2500 = 2,500
      // savings = 3,929 × 0.7 - 2,500 = 250.3
      // ROI = (250.3 / 2,500) × 100 = 10.01% → orange
      const marginAnalysis = createAnalysis({
        pumpQuantity: 1,
        failureRatePercentage: 100,
        waferCost: 3000,
        waferQuantity: 1,
        waferType: 'mono',
        waferDefectEventsPerYear: 1,
        downtimeDuration: 1,
        downtimeCostPerHour: 929,
        isBottleneck: false,
        bottleneckMultiplier: 2.0,
        maintenanceStrategy: 'unplanned' as const,
        overhaulCostPerPump: 0,
        pmIntervalMonths: 12,
        argosMtbfExtensionPercent: 15,
        unplannedDespitePM: 0,
  mtbf: 0,
      });

      render(<MiniCard analysis={marginAnalysis} isActive={false} onClick={() => {}} />);

      const badge = screen.getByTestId('roi-badge');
      expect(badge).toHaveStyle({ backgroundColor: '#FF8C00' });
    });

    it('should display red badge for ROI < 0%', () => {
      const analysis = createAnalysis({
        pumpQuantity: 1,
        failureRatePercentage: 1,
        waferCost: 10,
        waferQuantity: 1,
        waferType: 'mono',
        downtimeDuration: 1,
        downtimeCostPerHour: 10,
        isBottleneck: false,
        bottleneckMultiplier: 2.0,
        maintenanceStrategy: 'unplanned' as const,
        overhaulCostPerPump: 0,
        pmIntervalMonths: 12,
        argosMtbfExtensionPercent: 15,
        unplannedDespitePM: 0,
  mtbf: 0,
      });

      render(<MiniCard analysis={analysis} isActive={false} onClick={() => {}} />);

      const badge = screen.getByTestId('roi-badge');
      expect(badge).toHaveStyle({ backgroundColor: '#CC0000' });
    });
  });

  describe('incomplete analysis', () => {
    it('should show dashes for incomplete analysis', () => {
      const analysis = createAnalysis({
        pumpQuantity: 0,
        failureRatePercentage: 0,
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
  mtbf: 0,
      });

      render(<MiniCard analysis={analysis} isActive={false} onClick={() => {}} />);

      const dashes = screen.getAllByText('--');
      expect(dashes.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('active state', () => {
    it('should apply active styling when isActive is true', () => {
      const analysis = createAnalysis();
      render(<MiniCard analysis={analysis} isActive={true} onClick={() => {}} />);

      const button = screen.getByRole('button', { name: /Analysis Poly Etch/i });
      expect(button).toHaveClass('bg-red-50/30');
    });

    it('should not apply active styling when isActive is false', () => {
      const analysis = createAnalysis();
      render(<MiniCard analysis={analysis} isActive={false} onClick={() => {}} />);

      const button = screen.getByRole('button', { name: /Analysis Poly Etch/i });
      expect(button).not.toHaveClass('bg-red-50/30');
    });
  });

  describe('interaction', () => {
    it('should call onClick when clicked', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const analysis = createAnalysis();
      render(<MiniCard analysis={analysis} isActive={false} onClick={onClick} />);

      await user.click(screen.getByRole('button', { name: /Analysis Poly Etch/i }));

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick when Enter key pressed', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const analysis = createAnalysis();
      render(<MiniCard analysis={analysis} isActive={false} onClick={onClick} />);

      const button = screen.getByRole('button', { name: /Analysis Poly Etch/i });
      button.focus();
      await user.keyboard('{Enter}');

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('should have aria-label with analysis name', () => {
      const analysis = createAnalysis({ name: 'Metal Dep' });
      render(<MiniCard analysis={analysis} isActive={false} onClick={() => {}} />);

      expect(screen.getByLabelText('Analysis Metal Dep')).toBeInTheDocument();
    });

    it('should have button role', () => {
      const analysis = createAnalysis();
      render(<MiniCard analysis={analysis} isActive={false} onClick={() => {}} />);

      expect(screen.getByRole('button', { name: /Analysis Poly Etch/i })).toBeInTheDocument();
    });

    it('should be focusable via tabIndex', () => {
      const analysis = createAnalysis();
      render(<MiniCard analysis={analysis} isActive={false} onClick={() => {}} />);

      const button = screen.getByRole('button', { name: /Analysis Poly Etch/i });
      expect(button).not.toHaveAttribute('tabIndex', '-1');
    });

    it('should set aria-current on active card', () => {
      const analysis = createAnalysis();
      render(<MiniCard analysis={analysis} isActive={true} onClick={() => {}} />);

      const button = screen.getByRole('button', { name: /Analysis Poly Etch/i });
      expect(button).toHaveAttribute('aria-current', 'true');
    });

    it('should not set aria-current on inactive card', () => {
      const analysis = createAnalysis();
      render(<MiniCard analysis={analysis} isActive={false} onClick={() => {}} />);

      const button = screen.getByRole('button', { name: /Analysis Poly Etch/i });
      expect(button).not.toHaveAttribute('aria-current');
    });
  });
});
