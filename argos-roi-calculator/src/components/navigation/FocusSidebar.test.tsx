import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { FocusSidebar } from './FocusSidebar';
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
    downtimeDuration: 6,
    downtimeCostPerHour: 500,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('FocusSidebar', () => {
  const analyses: Analysis[] = [
    createAnalysis({ id: 'a1', name: 'Poly Etch' }),
    createAnalysis({ id: 'a2', name: 'Metal Dep' }),
    createAnalysis({ id: 'a3', name: 'CVD' }),
  ];

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
    it('should render mini-cards for all analyses', () => {
      render(
        <FocusSidebar
          analyses={analyses}
          activeAnalysisId="a1"
          onSelectAnalysis={() => {}}
        />
      );

      expect(screen.getByText('Poly Etch')).toBeInTheDocument();
      expect(screen.getByText('Metal Dep')).toBeInTheDocument();
      expect(screen.getByText('CVD')).toBeInTheDocument();
    });

    it('should render Analyses heading', () => {
      render(
        <FocusSidebar
          analyses={analyses}
          activeAnalysisId="a1"
          onSelectAnalysis={() => {}}
        />
      );

      expect(screen.getByText('Analyses')).toBeInTheDocument();
    });

    it('should highlight active analysis', () => {
      render(
        <FocusSidebar
          analyses={analyses}
          activeAnalysisId="a2"
          onSelectAnalysis={() => {}}
        />
      );

      const activeCard = screen.getByLabelText('Analysis Metal Dep');
      expect(activeCard).toHaveClass('bg-red-50/30');

      const inactiveCard = screen.getByLabelText('Analysis Poly Etch');
      expect(inactiveCard).not.toHaveClass('bg-red-50/30');
    });

    it('should render service cost field', () => {
      render(
        <FocusSidebar
          analyses={analyses}
          activeAnalysisId="a1"
          onSelectAnalysis={() => {}}
        />
      );

      expect(screen.getByLabelText('ARGOS Service Cost (per pump/year)')).toBeInTheDocument();
    });

    it('should render empty state gracefully', () => {
      render(
        <FocusSidebar
          analyses={[]}
          activeAnalysisId=""
          onSelectAnalysis={() => {}}
        />
      );

      expect(screen.getByText('Analyses')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Analysis/ })).not.toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('should call onSelectAnalysis when mini-card clicked', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(
        <FocusSidebar
          analyses={analyses}
          activeAnalysisId="a1"
          onSelectAnalysis={onSelect}
        />
      );

      await user.click(screen.getByLabelText('Analysis Metal Dep'));

      expect(onSelect).toHaveBeenCalledWith('a2');
    });
  });

  describe('scrollable container', () => {
    it('should have scrollable container for mini-cards', () => {
      render(
        <FocusSidebar
          analyses={analyses}
          activeAnalysisId="a1"
          onSelectAnalysis={() => {}}
        />
      );

      const sidebar = screen.getByRole('complementary');
      const scrollableContainer = sidebar.querySelector('.overflow-y-auto');
      expect(scrollableContainer).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have aria-label for navigation', () => {
      render(
        <FocusSidebar
          analyses={analyses}
          activeAnalysisId="a1"
          onSelectAnalysis={() => {}}
        />
      );

      expect(screen.getByLabelText('Analysis Navigation')).toBeInTheDocument();
    });

    it('should allow keyboard navigation through mini-cards', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(
        <FocusSidebar
          analyses={analyses}
          activeAnalysisId="a1"
          onSelectAnalysis={onSelect}
        />
      );

      const metalDepCard = screen.getByLabelText('Analysis Metal Dep');
      metalDepCard.focus();
      await user.keyboard('{Enter}');

      expect(onSelect).toHaveBeenCalledWith('a2');
    });
  });
});
