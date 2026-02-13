import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within, act } from '@testing-library/react';
import { PreFilledContext } from './PreFilledContext';
import { useAppStore } from '@/stores/app-store';
import type { Analysis } from '@/types';

function createTestAnalysis(overrides: Partial<Analysis> = {}): Analysis {
  return {
    id: crypto.randomUUID(),
    name: 'Test Process',
    pumpType: 'A3004XN',
    pumpQuantity: 4,
    failureRateMode: 'percentage' as const,
    failureRatePercentage: 5,
    waferType: 'batch' as const,
    waferQuantity: 125,
    waferCost: 500,
    downtimeDuration: 8,
    downtimeCostPerHour: 1000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function renderPreFilledContext() {
  return render(<PreFilledContext />);
}

function getSection() {
  return screen.getByRole('region', {
    name: 'Pre-filled context from ROI analyses',
  });
}

describe('PreFilledContext', () => {
  beforeEach(() => {
    useAppStore.setState({
      analyses: [],
      activeAnalysisId: null,
      globalParams: { detectionRate: 70, serviceCostPerPump: 2500 },
      unsavedChanges: false,
    });
  });

  describe('Total pumps (AC1)', () => {
    it('shows total pumps summed from multiple analyses', () => {
      useAppStore.setState({
        analyses: [
          createTestAnalysis({ name: 'Poly Etch', pumpQuantity: 8, pumpType: 'A3004XN' }),
          createTestAnalysis({ name: 'Metal Dep', pumpQuantity: 12, pumpType: 'HiPace 300' }),
          createTestAnalysis({ name: 'CVD', pumpQuantity: 6, pumpType: 'A3004XN' }),
        ],
      });

      renderPreFilledContext();

      const section = getSection();
      expect(within(section).getByText('26')).toBeInTheDocument();
      expect(within(section).getByText('Total Pumps to Monitor')).toBeInTheDocument();
    });
  });

  describe('Pump model clustering (AC2)', () => {
    it('shows pump model clusters grouped correctly', () => {
      useAppStore.setState({
        analyses: [
          createTestAnalysis({ name: 'Poly Etch', pumpQuantity: 8, pumpType: 'A3004XN' }),
          createTestAnalysis({ name: 'Metal Dep', pumpQuantity: 12, pumpType: 'HiPace 300' }),
          createTestAnalysis({ name: 'CVD', pumpQuantity: 6, pumpType: 'A3004XN' }),
        ],
      });

      renderPreFilledContext();

      expect(screen.getByText('A3004XN: 14')).toBeInTheDocument();
      expect(screen.getByText('HiPace 300: 12')).toBeInTheDocument();
    });

    it('shows each pump model with correct quantity', () => {
      useAppStore.setState({
        analyses: [
          createTestAnalysis({ name: 'Process A', pumpQuantity: 5, pumpType: 'ModelX' }),
          createTestAnalysis({ name: 'Process B', pumpQuantity: 3, pumpType: 'ModelY' }),
        ],
      });

      renderPreFilledContext();

      expect(screen.getByText('ModelX: 5')).toBeInTheDocument();
      expect(screen.getByText('ModelY: 3')).toBeInTheDocument();
    });

    it('excludes analyses with empty pumpType from clusters', () => {
      useAppStore.setState({
        analyses: [
          createTestAnalysis({ name: 'A', pumpQuantity: 5, pumpType: 'A3004XN' }),
          createTestAnalysis({ name: 'B', pumpQuantity: 3, pumpType: '' }),
        ],
      });

      renderPreFilledContext();

      expect(screen.getByText('A3004XN: 5')).toBeInTheDocument();
      expect(screen.queryByText(/: 3$/)).not.toBeInTheDocument();
    });

    it('shows single cluster when all analyses have same pumpType', () => {
      useAppStore.setState({
        analyses: [
          createTestAnalysis({ name: 'A', pumpQuantity: 4, pumpType: 'SameModel' }),
          createTestAnalysis({ name: 'B', pumpQuantity: 6, pumpType: 'SameModel' }),
        ],
      });

      renderPreFilledContext();

      expect(screen.getByText('SameModel: 10')).toBeInTheDocument();
      const badges = screen.getAllByText(/: \d+$/);
      expect(badges).toHaveLength(1);
    });
  });

  describe('Process count and names (AC3)', () => {
    it('shows process count scoped to section', () => {
      useAppStore.setState({
        analyses: [
          createTestAnalysis({ name: 'Poly Etch' }),
          createTestAnalysis({ name: 'Metal Dep' }),
          createTestAnalysis({ name: 'CVD' }),
        ],
      });

      renderPreFilledContext();

      const section = getSection();
      expect(within(section).getByText('Processes')).toBeInTheDocument();
      expect(within(section).getByText('3')).toBeInTheDocument();
    });

    it('shows process names listed', () => {
      useAppStore.setState({
        analyses: [
          createTestAnalysis({ name: 'Poly Etch' }),
          createTestAnalysis({ name: 'Metal Dep' }),
          createTestAnalysis({ name: 'CVD' }),
        ],
      });

      renderPreFilledContext();

      expect(screen.getByText('Poly Etch, Metal Dep, CVD')).toBeInTheDocument();
    });
  });

  describe('Visual distinction (AC4)', () => {
    it('shows "From ROI Analysis" label', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis()],
      });

      renderPreFilledContext();

      expect(screen.getByText('From ROI Analysis')).toBeInTheDocument();
    });

    it('has gray background styling', () => {
      renderPreFilledContext();

      const section = getSection();
      expect(section.className).toContain('bg-gray-50');
      expect(section.className).toContain('border-gray-200');
    });

    it('displays values as read-only (no input elements)', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis()],
      });

      renderPreFilledContext();

      const section = getSection();
      const inputs = within(section).queryAllByRole('textbox');
      const spinbuttons = within(section).queryAllByRole('spinbutton');
      expect(inputs).toHaveLength(0);
      expect(spinbuttons).toHaveLength(0);
    });
  });

  describe('Empty state (AC6)', () => {
    it('shows dash for total pumps and processes when no analyses', () => {
      renderPreFilledContext();

      const section = getSection();
      expect(within(section).getByText('Total Pumps to Monitor')).toBeInTheDocument();
      expect(within(section).getByText('Processes')).toBeInTheDocument();
      const dashes = within(section).getAllByText('—');
      expect(dashes).toHaveLength(2);
    });

    it('shows "None" for processes when no analyses', () => {
      renderPreFilledContext();

      const section = getSection();
      expect(within(section).getByText('None')).toBeInTheDocument();
    });

    it('handles analyses with missing names in process list', () => {
      useAppStore.setState({
        analyses: [
          createTestAnalysis({ name: 'Valid Process' }),
          createTestAnalysis({ name: '' }),
        ],
      });

      renderPreFilledContext();

      const section = getSection();
      expect(within(section).getByText('1')).toBeInTheDocument();
      expect(screen.getByText('Valid Process')).toBeInTheDocument();
    });

    it('does not show pump model clusters when no analyses', () => {
      renderPreFilledContext();

      expect(screen.queryByText('Pump Models')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility (AC7)', () => {
    it('has correct aria attributes for screen readers', () => {
      renderPreFilledContext();

      const section = getSection();
      expect(section).toBeInTheDocument();
      expect(section.tagName).toBe('SECTION');
    });

    it('uses semantic HTML elements for read-only values', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis({ pumpQuantity: 10 })],
      });

      renderPreFilledContext();

      const section = getSection();
      const inputs = within(section).queryAllByRole('textbox');
      expect(inputs).toHaveLength(0);
    });
  });

  describe('Dynamic updates (AC5)', () => {
    it('updates values when a new analysis is added to the store', () => {
      const analysis1 = createTestAnalysis({ name: 'Etch', pumpQuantity: 5, pumpType: 'A3004XN' });
      useAppStore.setState({ analyses: [analysis1] });

      renderPreFilledContext();

      const section = getSection();
      expect(within(section).getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Etch')).toBeInTheDocument();

      const analysis2 = createTestAnalysis({ name: 'Dep', pumpQuantity: 7, pumpType: 'HiPace 300' });
      act(() => {
        useAppStore.setState({ analyses: [analysis1, analysis2] });
      });

      expect(within(section).getByText('12')).toBeInTheDocument();
      expect(screen.getByText('Etch, Dep')).toBeInTheDocument();
    });

    it('updates values when an analysis is deleted from the store', () => {
      const analysis1 = createTestAnalysis({ name: 'A', pumpQuantity: 10, pumpType: 'X' });
      const analysis2 = createTestAnalysis({ name: 'B', pumpQuantity: 6, pumpType: 'Y' });
      useAppStore.setState({ analyses: [analysis1, analysis2] });

      renderPreFilledContext();

      const section = getSection();
      expect(within(section).getByText('16')).toBeInTheDocument();

      act(() => {
        useAppStore.setState({ analyses: [analysis1] });
      });

      expect(within(section).getByText('10')).toBeInTheDocument();
      expect(screen.queryByText('B')).not.toBeInTheDocument();
    });

    it('updates values when an analysis is renamed', () => {
      const analysis = createTestAnalysis({ name: 'Old Name', pumpQuantity: 3 });
      useAppStore.setState({ analyses: [analysis] });

      renderPreFilledContext();

      expect(screen.getByText('Old Name')).toBeInTheDocument();

      act(() => {
        useAppStore.setState({ analyses: [{ ...analysis, name: 'New Name' }] });
      });

      expect(screen.getByText('New Name')).toBeInTheDocument();
      expect(screen.queryByText('Old Name')).not.toBeInTheDocument();
    });

    it('updates values when pump quantity changes', () => {
      const analysis = createTestAnalysis({ name: 'Process', pumpQuantity: 5, pumpType: 'Model' });
      useAppStore.setState({ analyses: [analysis] });

      renderPreFilledContext();

      const section = getSection();
      expect(within(section).getByText('5')).toBeInTheDocument();

      act(() => {
        useAppStore.setState({ analyses: [{ ...analysis, pumpQuantity: 15 }] });
      });

      expect(within(section).getByText('15')).toBeInTheDocument();
    });

    it('recalculates total pumps correctly after store change', () => {
      const a1 = createTestAnalysis({ name: 'A', pumpQuantity: 3, pumpType: 'X' });
      const a2 = createTestAnalysis({ name: 'B', pumpQuantity: 7, pumpType: 'Y' });
      useAppStore.setState({ analyses: [a1, a2] });

      renderPreFilledContext();

      const section = getSection();
      expect(within(section).getByText('10')).toBeInTheDocument();

      const a3 = createTestAnalysis({ name: 'C', pumpQuantity: 5, pumpType: 'Z' });
      act(() => {
        useAppStore.setState({ analyses: [a1, a2, a3] });
      });

      expect(within(section).getByText('15')).toBeInTheDocument();
      expect(screen.getByText('A, B, C')).toBeInTheDocument();
    });

    it('updates pump model clusters when analysis added with new pumpType', () => {
      const a1 = createTestAnalysis({ name: 'A', pumpQuantity: 4, pumpType: 'ModelA' });
      useAppStore.setState({ analyses: [a1] });

      renderPreFilledContext();

      expect(screen.getByText('ModelA: 4')).toBeInTheDocument();

      const a2 = createTestAnalysis({ name: 'B', pumpQuantity: 6, pumpType: 'ModelB' });
      act(() => {
        useAppStore.setState({ analyses: [a1, a2] });
      });

      expect(screen.getByText('ModelA: 4')).toBeInTheDocument();
      expect(screen.getByText('ModelB: 6')).toBeInTheDocument();
    });

    it('merges pump model clusters when analysis added with existing pumpType', () => {
      const a1 = createTestAnalysis({ name: 'A', pumpQuantity: 4, pumpType: 'SharedModel' });
      useAppStore.setState({ analyses: [a1] });

      renderPreFilledContext();

      expect(screen.getByText('SharedModel: 4')).toBeInTheDocument();

      const a2 = createTestAnalysis({ name: 'B', pumpQuantity: 8, pumpType: 'SharedModel' });
      act(() => {
        useAppStore.setState({ analyses: [a1, a2] });
      });

      expect(screen.getByText('SharedModel: 12')).toBeInTheDocument();
    });
  });
});
