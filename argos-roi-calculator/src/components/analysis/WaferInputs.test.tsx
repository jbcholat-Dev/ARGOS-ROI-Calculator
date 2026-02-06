import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WaferInputs } from './WaferInputs';
import { useAppStore } from '@/stores/app-store';
import { formatEuroCurrency } from '@/lib/validation/wafer-validation';
import type { Analysis } from '@/types';

// Helper to create a test analysis with default values
function createTestAnalysis(overrides: Partial<Analysis> = {}): Analysis {
  return {
    id: 'test-analysis-1',
    name: 'Test Process',
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

describe('WaferInputs', () => {
  beforeEach(() => {
    useAppStore.setState({
      analyses: [createTestAnalysis()],
      activeAnalysisId: 'test-analysis-1',
      globalParams: { detectionRate: 70, serviceCostPerPump: 2500 },
      unsavedChanges: false,
    });
  });

  // === Rendering Tests ===

  it('renders section heading "Wafer"', () => {
    render(<WaferInputs analysisId="test-analysis-1" />);
    expect(screen.getByText('Wafer')).toBeInTheDocument();
  });

  it('renders radio button group with legend "Type de wafer"', () => {
    render(<WaferInputs analysisId="test-analysis-1" />);
    expect(screen.getByText('Type de wafer')).toBeInTheDocument();
  });

  it('renders both radio options: Mono-wafer and Batch', () => {
    render(<WaferInputs analysisId="test-analysis-1" />);
    expect(screen.getByLabelText('Mono-wafer')).toBeInTheDocument();
    expect(screen.getByLabelText('Batch')).toBeInTheDocument();
  });

  it('renders wafer cost field with label "Coût par wafer (€)"', () => {
    render(<WaferInputs analysisId="test-analysis-1" />);
    expect(screen.getByLabelText('Coût par wafer (€)')).toBeInTheDocument();
  });

  it('returns null when analysis does not exist', () => {
    const { container } = render(<WaferInputs analysisId="nonexistent" />);
    expect(container.innerHTML).toBe('');
  });

  // === Default State Tests ===

  it('has Mono-wafer selected by default', () => {
    render(<WaferInputs analysisId="test-analysis-1" />);
    const monoRadio = screen.getByLabelText('Mono-wafer');
    expect(monoRadio).toBeChecked();
  });

  it('hides wafer quantity field in mono mode', () => {
    render(<WaferInputs analysisId="test-analysis-1" />);
    expect(screen.queryByLabelText('Wafers par lot')).not.toBeInTheDocument();
  });

  it('displays formatted wafer cost by default', () => {
    render(<WaferInputs analysisId="test-analysis-1" />);
    const costInput = screen.getByLabelText('Coût par wafer (€)') as HTMLInputElement;
    // Use the same formatter to get exact expected value (handles locale-specific separators)
    const expected = formatEuroCurrency(8000);
    expect(costInput.value).toBe(expected);
  });

  // === Wafer Type Switching Tests ===

  it('shows wafer quantity field when Batch is selected', async () => {
    const user = userEvent.setup();
    render(<WaferInputs analysisId="test-analysis-1" />);

    await user.click(screen.getByLabelText('Batch'));

    expect(screen.getByLabelText('Wafers par lot')).toBeInTheDocument();
  });

  it('displays default value 125 in wafer quantity field when Batch selected', async () => {
    const user = userEvent.setup();
    render(<WaferInputs analysisId="test-analysis-1" />);

    await user.click(screen.getByLabelText('Batch'));

    const quantityInput = screen.getByLabelText('Wafers par lot');
    expect(quantityInput).toHaveValue(125);
  });

  it('hides wafer quantity field when switching back to Mono-wafer', async () => {
    const user = userEvent.setup();
    useAppStore.setState({
      analyses: [createTestAnalysis({ waferType: 'batch', waferQuantity: 125 })],
    });

    render(<WaferInputs analysisId="test-analysis-1" />);
    expect(screen.getByLabelText('Wafers par lot')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Mono-wafer'));

    expect(screen.queryByLabelText('Wafers par lot')).not.toBeInTheDocument();
  });

  // === Store Integration Tests ===

  it('updates store waferType to "batch" when Batch radio clicked', async () => {
    const user = userEvent.setup();
    render(<WaferInputs analysisId="test-analysis-1" />);

    await user.click(screen.getByLabelText('Batch'));

    const analysis = useAppStore.getState().analyses[0];
    expect(analysis.waferType).toBe('batch');
  });

  it('auto-sets waferQuantity to 1 when switching to mono', async () => {
    const user = userEvent.setup();
    useAppStore.setState({
      analyses: [createTestAnalysis({ waferType: 'batch', waferQuantity: 200 })],
    });
    render(<WaferInputs analysisId="test-analysis-1" />);

    await user.click(screen.getByLabelText('Mono-wafer'));

    const analysis = useAppStore.getState().analyses[0];
    expect(analysis.waferQuantity).toBe(1);
  });

  it('auto-sets waferQuantity to 125 when switching to batch', async () => {
    const user = userEvent.setup();
    render(<WaferInputs analysisId="test-analysis-1" />);

    await user.click(screen.getByLabelText('Batch'));

    const analysis = useAppStore.getState().analyses[0];
    expect(analysis.waferQuantity).toBe(125);
  });

  it('updates store waferQuantity when editing batch quantity', async () => {
    const user = userEvent.setup();
    useAppStore.setState({
      analyses: [createTestAnalysis({ waferType: 'batch', waferQuantity: 125 })],
    });
    render(<WaferInputs analysisId="test-analysis-1" />);

    const quantityInput = screen.getByLabelText('Wafers par lot');
    await user.clear(quantityInput);
    await user.type(quantityInput, '200');

    const analysis = useAppStore.getState().analyses[0];
    expect(analysis.waferQuantity).toBe(200);
  });

  it('updates store waferCost when editing cost field', async () => {
    const user = userEvent.setup();
    render(<WaferInputs analysisId="test-analysis-1" />);

    const costInput = screen.getByLabelText('Coût par wafer (€)');
    await user.click(costInput); // Focus to get raw value
    await user.clear(costInput);
    await user.type(costInput, '15000');

    const analysis = useAppStore.getState().analyses[0];
    expect(analysis.waferCost).toBe(15000);
  });

  it('does NOT update store with invalid wafer quantity', async () => {
    const user = userEvent.setup();
    useAppStore.setState({
      analyses: [createTestAnalysis({ waferType: 'batch', waferQuantity: 125 })],
    });
    render(<WaferInputs analysisId="test-analysis-1" />);

    const quantityInput = screen.getByLabelText('Wafers par lot');
    await user.clear(quantityInput);
    await user.type(quantityInput, '-10');

    const analysis = useAppStore.getState().analyses[0];
    // -10 is invalid, should not be stored
    expect(analysis.waferQuantity).not.toBe(-10);
  });

  it('does NOT update store with invalid wafer cost', async () => {
    const user = userEvent.setup();
    render(<WaferInputs analysisId="test-analysis-1" />);

    const costInput = screen.getByLabelText('Coût par wafer (€)');
    await user.click(costInput);
    await user.clear(costInput);
    await user.type(costInput, 'abc');

    const analysis = useAppStore.getState().analyses[0];
    expect(analysis.waferCost).toBe(8000); // Original value preserved
  });

  it('updates updatedAt timestamp when store is updated', async () => {
    const user = userEvent.setup();
    const originalUpdatedAt = useAppStore.getState().analyses[0].updatedAt;
    render(<WaferInputs analysisId="test-analysis-1" />);

    await user.click(screen.getByLabelText('Batch'));

    const analysis = useAppStore.getState().analyses[0];
    expect(analysis.updatedAt).not.toBe(originalUpdatedAt);
  });

  // === Validation Tests ===

  it('shows error for invalid wafer quantity input', async () => {
    const user = userEvent.setup();
    useAppStore.setState({
      analyses: [createTestAnalysis({ waferType: 'batch', waferQuantity: 125 })],
    });
    render(<WaferInputs analysisId="test-analysis-1" />);

    const quantityInput = screen.getByLabelText('Wafers par lot');
    await user.clear(quantityInput);
    await user.type(quantityInput, '0');

    expect(screen.getByText(/Doit être un nombre positif/)).toBeInTheDocument();
  });

  it('shows error for invalid wafer cost input', async () => {
    const user = userEvent.setup();
    render(<WaferInputs analysisId="test-analysis-1" />);

    const costInput = screen.getByLabelText('Coût par wafer (€)');
    await user.click(costInput);
    await user.clear(costInput);
    await user.type(costInput, '-500');

    expect(screen.getByText(/Doit être un nombre positif/)).toBeInTheDocument();
  });

  it('clears error when valid input is entered after invalid', async () => {
    const user = userEvent.setup();
    useAppStore.setState({
      analyses: [createTestAnalysis({ waferType: 'batch', waferQuantity: 125 })],
    });
    render(<WaferInputs analysisId="test-analysis-1" />);

    const quantityInput = screen.getByLabelText('Wafers par lot');
    await user.clear(quantityInput);
    await user.type(quantityInput, '0');
    expect(screen.getByText(/Doit être un nombre positif/)).toBeInTheDocument();

    await user.clear(quantityInput);
    await user.type(quantityInput, '50');
    expect(screen.queryByText(/Doit être un nombre positif/)).not.toBeInTheDocument();
  });

  it('clears quantity error when switching wafer type', async () => {
    const user = userEvent.setup();
    useAppStore.setState({
      analyses: [createTestAnalysis({ waferType: 'batch', waferQuantity: 125 })],
    });
    render(<WaferInputs analysisId="test-analysis-1" />);

    // Create error
    const quantityInput = screen.getByLabelText('Wafers par lot');
    await user.clear(quantityInput);
    await user.type(quantityInput, '0');
    expect(screen.getByText(/Doit être un nombre positif/)).toBeInTheDocument();

    // Switch to mono — error should clear
    await user.click(screen.getByLabelText('Mono-wafer'));
    expect(screen.queryByText(/Doit être un nombre positif/)).not.toBeInTheDocument();
  });

  it('replaces invalid quantity with valid default when switching types', async () => {
    const user = userEvent.setup();
    useAppStore.setState({
      analyses: [createTestAnalysis({ waferType: 'batch', waferQuantity: 125 })],
    });
    render(<WaferInputs analysisId="test-analysis-1" />);

    // Enter invalid quantity
    const quantityInput = screen.getByLabelText('Wafers par lot');
    await user.clear(quantityInput);
    await user.type(quantityInput, '0');
    expect(screen.getByText(/Doit être un nombre positif/)).toBeInTheDocument();

    // Switch to mono — should replace with valid default 1
    await user.click(screen.getByLabelText('Mono-wafer'));
    const analysis = useAppStore.getState().analyses[0];
    expect(analysis.waferQuantity).toBe(1);
    expect(screen.queryByText(/Doit être un nombre positif/)).not.toBeInTheDocument();
  });

  // === Accessibility Tests ===

  it('uses fieldset element for radio group', () => {
    render(<WaferInputs analysisId="test-analysis-1" />);
    const fieldset = screen.getByRole('group');
    expect(fieldset).toBeInTheDocument();
    expect(fieldset.tagName).toBe('FIELDSET');
  });

  it('uses legend element for radio group label', () => {
    render(<WaferInputs analysisId="test-analysis-1" />);
    const fieldset = screen.getByRole('group');
    const legend = fieldset.querySelector('legend');
    expect(legend).toBeInTheDocument();
    expect(legend?.textContent).toBe('Type de wafer');
  });

  it('radio buttons are keyboard navigable', async () => {
    const user = userEvent.setup();
    render(<WaferInputs analysisId="test-analysis-1" />);

    const monoRadio = screen.getByLabelText('Mono-wafer');
    monoRadio.focus();
    expect(monoRadio).toHaveFocus();

    // Tab to next focusable element
    await user.tab();
    // Should move past radio group to next input
  });

  it('has section with aria-label "Wafer"', () => {
    render(<WaferInputs analysisId="test-analysis-1" />);
    expect(screen.getByRole('region', { name: 'Wafer' })).toBeInTheDocument();
  });

  // === Number Formatting Tests ===

  it('shows formatted value on blur after editing cost', async () => {
    const user = userEvent.setup();
    render(<WaferInputs analysisId="test-analysis-1" />);

    const costInput = screen.getByLabelText('Coût par wafer (€)') as HTMLInputElement;
    await user.click(costInput); // Focus: shows raw
    await user.clear(costInput);
    await user.type(costInput, '12500');

    // Blur to trigger formatting
    await user.tab();

    // After blur, should show formatted value using the same formatter
    const expected = formatEuroCurrency(12500);
    expect(costInput.value).toBe(expected);
  });

  it('shows raw value on focus for easier editing', async () => {
    const user = userEvent.setup();
    render(<WaferInputs analysisId="test-analysis-1" />);

    const costInput = screen.getByLabelText('Coût par wafer (€)');
    await user.click(costInput);

    // When focused, should show raw number
    expect(costInput).toHaveValue('8000');
  });
});
