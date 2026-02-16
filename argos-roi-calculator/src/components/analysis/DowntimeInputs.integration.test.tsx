import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DowntimeInputs } from './DowntimeInputs';
import { useAppStore } from '@/stores/app-store';
import { calculateTotalFailureCost } from '@/lib/calculations';
import type { Analysis } from '@/types';

const createTestAnalysis = (overrides?: Partial<Analysis>): Analysis => ({
  id: 'test-analysis-1',
  name: 'Poly Etch - Chamber 04',
  pumpType: 'HiPace 700',
  pumpQuantity: 10,
  failureRateMode: 'percentage',
  failureRatePercentage: 10,
  waferType: 'batch',
  waferQuantity: 125,
  waferCost: 8000,
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

describe('DowntimeInputs Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.setState({
      analyses: [createTestAnalysis()],
      activeAnalysisId: 'test-analysis-1',
      globalParams: { detectionRate: 70, serviceCostPerPump: 2500 },
      unsavedChanges: false,
    });
  });

  describe('Complete downtime input flow', () => {
    it('enters duration and cost, store updates trigger calculation changes', async () => {
      const user = userEvent.setup();
      render(<DowntimeInputs analysisId="test-analysis-1" />);

      // Step 1: Enter downtime hours
      const durationInput = screen.getByLabelText(/Duration per Failure \(hours\)/);
      await user.type(durationInput, '6');

      let state = useAppStore.getState();
      expect(state.analyses[0].downtimeDuration).toBe(6);

      // Step 2: Enter downtime cost
      const costInput = screen.getByLabelText(/Cost per Hour of Downtime/);
      await user.click(costInput);
      await user.type(costInput, '15000');

      state = useAppStore.getState();
      expect(state.analyses[0].downtimeCostPerHour).toBe(15000);

      // Step 3: Verify calculation engine uses these values
      const analysis = state.analyses[0];
      const totalCost = calculateTotalFailureCost(
        analysis.pumpQuantity,
        analysis.failureRatePercentage,
        analysis.waferCost,
        analysis.waferQuantity,
        analysis.downtimeDuration,
        analysis.downtimeCostPerHour,
        analysis.waferDefectEventsPerYear,
      );

      // Decoupled: waferDefectCost = 0 (no defect events), downtimeCost = 1 * 6 * 15000 = 90,000
      expect(totalCost).toBe(90000);
    });
  });

  describe('Validation flow', () => {
    it('rejects invalid input then accepts valid input', async () => {
      const user = userEvent.setup();
      render(<DowntimeInputs analysisId="test-analysis-1" />);

      const durationInput = screen.getByLabelText(/Duration per Failure \(hours\)/);

      // Step 1: Enter invalid (negative)
      await user.type(durationInput, '-5');
      expect(screen.getByText('Must be a positive number')).toBeInTheDocument();
      // Value should not be saved (store has 0 from before)
      expect(useAppStore.getState().analyses[0].downtimeDuration).toBe(0);

      // Step 2: Clear and enter valid
      await user.clear(durationInput);
      await user.type(durationInput, '6');
      expect(screen.queryByText('Must be a positive number')).not.toBeInTheDocument();
      expect(useAppStore.getState().analyses[0].downtimeDuration).toBe(6);
    });
  });

  describe('Real-time calculation update', () => {
    it('changing downtime hours updates total failure cost immediately', async () => {
      const user = userEvent.setup();
      useAppStore.setState({
        analyses: [
          createTestAnalysis({
            downtimeDuration: 6,
            downtimeCostPerHour: 15000,
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
      render(<DowntimeInputs analysisId="test-analysis-1" />);

      // Decoupled: waferDefectCost = 0, downtimeCost = 1 * 6 * 15000 = 90,000
      let analysis = useAppStore.getState().analyses[0];
      let initialCost = calculateTotalFailureCost(
        analysis.pumpQuantity,
        analysis.failureRatePercentage,
        analysis.waferCost,
        analysis.waferQuantity,
        analysis.downtimeDuration,
        analysis.downtimeCostPerHour,
        analysis.waferDefectEventsPerYear,
      );
      expect(initialCost).toBe(90000);

      // Change duration from 6 to 12
      const durationInput = screen.getByLabelText(/Duration per Failure \(hours\)/);
      await user.clear(durationInput);
      await user.type(durationInput, '12');

      // Decoupled: waferDefectCost = 0, downtimeCost = 1 * 12 * 15000 = 180,000
      analysis = useAppStore.getState().analyses[0];
      const updatedCost = calculateTotalFailureCost(
        analysis.pumpQuantity,
        analysis.failureRatePercentage,
        analysis.waferCost,
        analysis.waferQuantity,
        analysis.downtimeDuration,
        analysis.downtimeCostPerHour,
        analysis.waferDefectEventsPerYear,
      );
      expect(updatedCost).toBe(180000);

      // Downtime component doubled from 90,000 to 180,000
      const downtimeDelta = updatedCost - initialCost;
      expect(downtimeDelta).toBe(90000);
    });
  });

  describe('Calculation engine verification', () => {
    it('calculates correctly with downtime = 0 and defect events (only wafer cost)', () => {
      // Decoupled: waferDefectCost = 1 * 8000 * 125 = 1,000,000, downtimeCost = 0
      const cost = calculateTotalFailureCost(10, 10, 8000, 125, 0, 0, 1);
      expect(cost).toBe(1000000);
    });

    it('calculates correctly with downtime > 0 and defect events (wafer + downtime)', () => {
      // Decoupled: waferDefectCost = 1 * 8000 * 125 = 1,000,000, downtimeCost = 1 * 6 * 500 = 3,000
      const cost = calculateTotalFailureCost(10, 10, 8000, 125, 6, 500, 1);
      expect(cost).toBe(1003000);
    });

    it('calculates correctly with waferCost = 0, only downtime', () => {
      // Decoupled: waferDefectCost = 0, downtimeCost = 1 * 6 * 15000 = 90,000
      const cost = calculateTotalFailureCost(10, 10, 0, 0, 6, 15000, 0);
      expect(cost).toBe(90000);
    });

    it('calculates correctly with realistic values (6h, 15000 EUR/h)', () => {
      // Decoupled: waferDefectCost = 1 * 8000 * 125 = 1,000,000, downtimeCost = 1 * 6 * 15000 = 90,000
      const cost = calculateTotalFailureCost(10, 10, 8000, 125, 6, 15000, 1);
      expect(cost).toBe(1090000);
    });

    it('handles edge case: high downtime cost per hour', () => {
      // Decoupled: waferDefectCost = 0, downtimeCost = 1 * 24 * 50000 = 1,200,000
      const cost = calculateTotalFailureCost(10, 10, 0, 0, 24, 50000, 0);
      expect(cost).toBe(1200000);
    });
  });

  describe('Store downtime field verification', () => {
    it('updateAnalysis updates downtimeDuration', () => {
      useAppStore.getState().updateAnalysis('test-analysis-1', { downtimeDuration: 8 });
      expect(useAppStore.getState().analyses[0].downtimeDuration).toBe(8);
    });

    it('updateAnalysis updates downtimeCostPerHour', () => {
      useAppStore.getState().updateAnalysis('test-analysis-1', { downtimeCostPerHour: 25000 });
      expect(useAppStore.getState().analyses[0].downtimeCostPerHour).toBe(25000);
    });

    it('store rejects negative downtimeDuration and preserves previous value', () => {
      // Set a valid value first
      useAppStore.getState().updateAnalysis('test-analysis-1', { downtimeDuration: 6 });
      expect(useAppStore.getState().analyses[0].downtimeDuration).toBe(6);

      // Attempt negative update - store should preserve previous value
      useAppStore.getState().updateAnalysis('test-analysis-1', { downtimeDuration: -5 });
      expect(useAppStore.getState().analyses[0].downtimeDuration).toBe(6);
    });
  });
});
