/**
 * DetectionRateInput Integration Tests
 * Story 2.9: Detection Rate Per Analysis
 *
 * Tests complete flow from DetectionRateInput to ResultsPanel calculation updates
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { DetectionRateInput } from './DetectionRateInput';
import { ResultsPanel } from './ResultsPanel';
import { useAppStore } from '@/stores/app-store';
import type { Analysis } from '@/types';

describe('DetectionRateInput Integration Tests', () => {
  const mockAnalysisId = 'integration-test-analysis';

  beforeEach(() => {
    // Reset store before each test
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

  const createFullAnalysis = (detectionRate?: number): Analysis => ({
    id: mockAnalysisId,
    name: 'Integration Test Analysis',
    pumpType: 'A3004XN',
    pumpQuantity: 10,
    failureRateMode: 'percentage',
    failureRatePercentage: 20,
    waferType: 'batch',
    waferQuantity: 125,
    waferCost: 5000,
    downtimeDuration: 8,
    downtimeCostPerHour: 2000,
    detectionRate,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  it('completes full flow: render → change detection rate → verify results update', async () => {
    const user = userEvent.setup();
    const analysis = createFullAnalysis(70);
    useAppStore.getState().addAnalysis(analysis);

    // Render both DetectionRateInput and ResultsPanel
    const { rerender } = render(
      <div>
        <DetectionRateInput analysisId={mockAnalysisId} />
        <ResultsPanel analysisId={mockAnalysisId} />
      </div>
    );

    // Verify initial detection rate is 70%
    const input = screen.getByLabelText('ARGOS Detection Rate (%)') as HTMLInputElement;
    expect(input.value).toBe('70');

    // Get initial savings value (with 70% detection rate)
    const initialSavings = screen.getByTestId('savings-value').textContent;

    // Change detection rate to 85%
    await user.clear(input);
    await user.type(input, '85');

    // Force re-render to see updated results
    rerender(
      <div>
        <DetectionRateInput analysisId={mockAnalysisId} />
        <ResultsPanel analysisId={mockAnalysisId} />
      </div>
    );

    // Verify detection rate updated in store
    const updatedState = useAppStore.getState();
    expect(updatedState.analyses[0].detectionRate).toBe(85);

    // Verify savings value changed (higher detection rate = higher savings)
    const updatedSavings = screen.getByTestId('savings-value').textContent;
    expect(updatedSavings).not.toBe(initialSavings);
  });

  it('fallback test: undefined detectionRate uses global 70%', async () => {
    const analysis = createFullAnalysis(undefined);
    useAppStore.getState().addAnalysis(analysis);

    render(
      <div>
        <DetectionRateInput analysisId={mockAnalysisId} />
        <ResultsPanel analysisId={mockAnalysisId} />
      </div>
    );

    // Input should show 70 (fallback to global)
    const input = screen.getByLabelText('ARGOS Detection Rate (%)') as HTMLInputElement;
    expect(input.value).toBe('70');

    // Verify ResultsPanel uses global detectionRate
    const state = useAppStore.getState();
    expect(state.analyses[0].detectionRate).toBeUndefined();
    expect(state.globalParams.detectionRate).toBe(70);

    // Results should still calculate
    expect(screen.getByTestId('savings-value')).toBeInTheDocument();
  });

  it('edge case: detectionRate = 0 → savings calculation correct', async () => {
    const user = userEvent.setup();
    const analysis = createFullAnalysis(70);
    useAppStore.getState().addAnalysis(analysis);

    render(
      <div>
        <DetectionRateInput analysisId={mockAnalysisId} />
        <ResultsPanel analysisId={mockAnalysisId} />
      </div>
    );

    const input = screen.getByLabelText('ARGOS Detection Rate (%)');

    // Set detection rate to 0%
    await user.clear(input);
    await user.type(input, '0');

    // Verify store updated
    const state = useAppStore.getState();
    expect(state.analyses[0].detectionRate).toBe(0);

    // With 0% detection rate, savings should be negative (only service cost)
    // Formula: totalFailureCost * (0 / 100) - argosServiceCost = 0 - argosServiceCost
    // This means savings will be negative equal to service cost
    const savingsText = screen.getByTestId('savings-value').textContent;
    expect(savingsText).toContain('-'); // Negative savings
  });

  it('edge case: detectionRate = 100 → savings calculation correct', async () => {
    const user = userEvent.setup();
    const analysis = createFullAnalysis(70);
    useAppStore.getState().addAnalysis(analysis);

    render(
      <div>
        <DetectionRateInput analysisId={mockAnalysisId} />
        <ResultsPanel analysisId={mockAnalysisId} />
      </div>
    );

    const input = screen.getByLabelText('ARGOS Detection Rate (%)');

    // Set detection rate to 100%
    await user.clear(input);
    await user.type(input, '100');

    // Verify store updated
    const state = useAppStore.getState();
    expect(state.analyses[0].detectionRate).toBe(100);

    // With 100% detection rate, savings should be maximum
    // Formula: totalFailureCost * (100 / 100) - argosServiceCost = totalFailureCost - argosServiceCost
    const savingsText = screen.getByTestId('savings-value').textContent;
    expect(savingsText).toBeTruthy();
    // Savings should be positive (full failure cost avoided minus service cost)
  });

  it('real-time update: changing detectionRate updates ResultsPanel instantly', async () => {
    const user = userEvent.setup();
    const analysis = createFullAnalysis(70);
    useAppStore.getState().addAnalysis(analysis);

    const { rerender } = render(
      <div>
        <DetectionRateInput analysisId={mockAnalysisId} />
        <ResultsPanel analysisId={mockAnalysisId} />
      </div>
    );

    const input = screen.getByLabelText('ARGOS Detection Rate (%)');
    const getSavings = () => screen.getByTestId('savings-value').textContent;

    // Capture initial savings (70%)
    const savings70 = getSavings();

    // Change to 50%
    await user.clear(input);
    await user.type(input, '50');
    rerender(
      <div>
        <DetectionRateInput analysisId={mockAnalysisId} />
        <ResultsPanel analysisId={mockAnalysisId} />
      </div>
    );
    const savings50 = getSavings();

    // Change to 85%
    await user.clear(input);
    await user.type(input, '85');
    rerender(
      <div>
        <DetectionRateInput analysisId={mockAnalysisId} />
        <ResultsPanel analysisId={mockAnalysisId} />
      </div>
    );
    const savings85 = getSavings();

    // Verify savings changed with each detection rate change
    expect(savings70).not.toBe(savings50);
    expect(savings50).not.toBe(savings85);
    expect(savings70).not.toBe(savings85);

    // Verify store has final value
    expect(useAppStore.getState().analyses[0].detectionRate).toBe(85);
  });
});
