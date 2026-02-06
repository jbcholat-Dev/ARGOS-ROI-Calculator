import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WaferInputs } from './WaferInputs';
import { useAppStore } from '@/stores/app-store';
import { formatEuroCurrency } from '@/lib/validation/wafer-validation';
import type { Analysis } from '@/types';

// Helper to create a test analysis matching store defaults
function createTestAnalysis(overrides: Partial<Analysis> = {}): Analysis {
  return {
    id: 'integration-test-1',
    name: 'Integration Test Process',
    pumpType: 'HiPace 700',
    pumpQuantity: 10,
    failureRateMode: 'percentage',
    failureRatePercentage: 5,
    waferType: 'mono',
    waferQuantity: 1,
    waferCost: 8000,
    downtimeDuration: 6,
    downtimeCostPerHour: 500,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('WaferInputs Integration Tests', () => {
  beforeEach(() => {
    useAppStore.setState({
      analyses: [createTestAnalysis()],
      activeAnalysisId: 'integration-test-1',
      globalParams: { detectionRate: 70, serviceCostPerPump: 2500 },
      unsavedChanges: false,
    });
  });

  it('completes full happy path: load → select batch → enter values → verify store', async () => {
    const user = userEvent.setup();
    render(<WaferInputs analysisId="integration-test-1" />);

    // Step 1: Verify initial state — mono selected
    const monoRadio = screen.getByLabelText('Mono-wafer');
    expect(monoRadio).toBeChecked();
    expect(screen.queryByLabelText('Wafers par lot')).not.toBeInTheDocument();

    // Step 2: Switch to batch mode
    await user.click(screen.getByLabelText('Batch'));
    expect(screen.getByLabelText('Batch')).toBeChecked();

    // Step 3: Verify quantity field appears with default 125
    const quantityInput = screen.getByLabelText('Wafers par lot');
    expect(quantityInput).toHaveValue(125);

    // Step 4: Verify store — waferType=batch, waferQuantity=125
    let analysis = useAppStore.getState().analyses[0];
    expect(analysis.waferType).toBe('batch');
    expect(analysis.waferQuantity).toBe(125);

    // Step 5: Edit wafer quantity to 200
    await user.clear(quantityInput);
    await user.type(quantityInput, '200');
    analysis = useAppStore.getState().analyses[0];
    expect(analysis.waferQuantity).toBe(200);

    // Step 6: Edit wafer cost to 15000
    const costInput = screen.getByLabelText('Coût par wafer (€)') as HTMLInputElement;
    await user.click(costInput);
    await user.clear(costInput);
    await user.type(costInput, '15000');
    analysis = useAppStore.getState().analyses[0];
    expect(analysis.waferCost).toBe(15000);

    // Step 7: Blur cost field — verify formatting
    await user.tab();
    const expected = formatEuroCurrency(15000);
    expect(costInput.value).toBe(expected);
  });

  it('completes mode switching flow: mono → batch → edit → mono → verify reset', async () => {
    const user = userEvent.setup();
    render(<WaferInputs analysisId="integration-test-1" />);

    // Start: mono mode, quantity=1
    let analysis = useAppStore.getState().analyses[0];
    expect(analysis.waferType).toBe('mono');
    expect(analysis.waferQuantity).toBe(1);

    // Switch to batch
    await user.click(screen.getByLabelText('Batch'));
    analysis = useAppStore.getState().analyses[0];
    expect(analysis.waferType).toBe('batch');
    expect(analysis.waferQuantity).toBe(125);

    // Edit batch quantity to 300
    const quantityInput = screen.getByLabelText('Wafers par lot');
    await user.clear(quantityInput);
    await user.type(quantityInput, '300');
    analysis = useAppStore.getState().analyses[0];
    expect(analysis.waferQuantity).toBe(300);

    // Switch back to mono — quantity should reset to 1
    await user.click(screen.getByLabelText('Mono-wafer'));
    analysis = useAppStore.getState().analyses[0];
    expect(analysis.waferType).toBe('mono');
    expect(analysis.waferQuantity).toBe(1);
    expect(screen.queryByLabelText('Wafers par lot')).not.toBeInTheDocument();
  });

  it('completes validation flow: invalid → error → correct → error clears → store updated', async () => {
    const user = userEvent.setup();
    render(<WaferInputs analysisId="integration-test-1" />);

    // Enter invalid cost
    const costInput = screen.getByLabelText('Coût par wafer (€)');
    await user.click(costInput);
    await user.clear(costInput);
    await user.type(costInput, '-100');

    // Error should display
    expect(screen.getByText(/Doit être un nombre positif/)).toBeInTheDocument();

    // Store should NOT be updated to -100
    let analysis = useAppStore.getState().analyses[0];
    expect(analysis.waferCost).toBe(8000); // Original preserved

    // Correct the input
    await user.clear(costInput);
    await user.type(costInput, '10000');

    // Error should clear
    expect(screen.queryByText(/Doit être un nombre positif/)).not.toBeInTheDocument();

    // Store should be updated
    analysis = useAppStore.getState().analyses[0];
    expect(analysis.waferCost).toBe(10000);
  });
});
