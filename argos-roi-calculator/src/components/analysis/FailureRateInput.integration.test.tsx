import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FailureRateInput } from './FailureRateInput';
import { useAppStore } from '@/stores/app-store';
import type { Analysis } from '@/types';

const createTestAnalysis = (overrides?: Partial<Analysis>): Analysis => ({
  id: 'integration-failure-1',
  name: 'Integration Failure Test',
  pumpType: 'HiPace 700',
  pumpQuantity: 8,
  failureRateMode: 'percentage',
  failureRatePercentage: 0,
  absoluteFailureCount: undefined,
  waferType: 'mono',
  waferQuantity: 1,
  waferCost: 0,
  downtimeDuration: 0,
  downtimeCostPerHour: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('FailureRateInput Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.setState({
      analyses: [createTestAnalysis()],
      activeAnalysisId: 'integration-failure-1',
      globalParams: { detectionRate: 70, serviceCostPerPump: 2500 },
      unsavedChanges: false,
    });
  });

  it('complete percentage mode flow', async () => {
    const user = userEvent.setup();
    render(<FailureRateInput analysisId="integration-failure-1" />);

    // Verify default mode is "Rate (%)"
    const percentageRadio = screen.getByRole('radio', { name: 'Rate (%)' });
    expect(percentageRadio).toHaveAttribute('aria-checked', 'true');

    // Enter "15" in percentage input
    const input = screen.getByLabelText('Failure Rate (%)');
    await user.type(input, '15');

    // Verify store updated
    expect(
      useAppStore.getState().analyses[0].failureRatePercentage,
    ).toBe(15);

    // Verify no errors
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('complete count mode flow', async () => {
    const user = userEvent.setup();
    useAppStore.setState({
      analyses: [createTestAnalysis({ pumpQuantity: 8 })],
    });
    render(<FailureRateInput analysisId="integration-failure-1" />);

    // Switch to count mode
    await user.click(screen.getByText('Failures Count/year'));

    // Enter "3" in count input
    const input = screen.getByLabelText(
      'Failures Count (last year)',
    );
    await user.type(input, '3');

    // Verify calculated percentage displays
    expect(screen.getByText(/Calculated rate/)).toBeInTheDocument();
    expect(screen.getByText(/37.5%/)).toBeInTheDocument();

    // Verify store updated
    const analysis = useAppStore.getState().analyses[0];
    expect(analysis.failureRatePercentage).toBe(37.5);
    expect(analysis.absoluteFailureCount).toBe(3);
  });

  it('mode switching flow preserves values', async () => {
    const user = userEvent.setup();
    useAppStore.setState({
      analyses: [createTestAnalysis({ pumpQuantity: 8 })],
    });
    render(<FailureRateInput analysisId="integration-failure-1" />);

    // Switch to count mode and enter 3
    await user.click(screen.getByText('Failures Count/year'));
    const countInput = screen.getByLabelText(
      'Failures Count (last year)',
    );
    await user.type(countInput, '3');

    // Verify calculated percentage
    expect(
      useAppStore.getState().analyses[0].failureRatePercentage,
    ).toBe(37.5);

    // Switch back to percentage mode
    await user.click(screen.getByText('Rate (%)'));

    // Verify percentage field shows calculated value
    const percentageInput = screen.getByLabelText(
      'Failure Rate (%)',
    );
    expect(percentageInput).toHaveValue(37.5);

    // absoluteFailureCount should still be in store
    expect(
      useAppStore.getState().analyses[0].absoluteFailureCount,
    ).toBe(3);
  });

  it('validation flow: invalid → error → valid → error clears', async () => {
    const user = userEvent.setup();
    render(<FailureRateInput analysisId="integration-failure-1" />);

    const input = screen.getByLabelText('Failure Rate (%)');

    // Enter invalid value "-5"
    await user.type(input, '-5');
    expect(
      screen.getByText('Must be a positive number'),
    ).toBeInTheDocument();

    // Verify store NOT updated
    expect(
      useAppStore.getState().analyses[0].failureRatePercentage,
    ).toBe(0);

    // Clear and enter "110"
    await user.clear(input);
    await user.type(input, '110');
    expect(
      screen.getByText('Rate must be between 0 and 100%'),
    ).toBeInTheDocument();

    // Clear and enter valid "10"
    await user.clear(input);
    await user.type(input, '10');

    // Error clears
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    // Store updated
    expect(
      useAppStore.getState().analyses[0].failureRatePercentage,
    ).toBe(10);
  });

  it('disabled count mode when pump quantity is 0', () => {
    useAppStore.setState({
      analyses: [createTestAnalysis({ pumpQuantity: 0 })],
    });
    render(<FailureRateInput analysisId="integration-failure-1" />);

    // Count mode toggle should be disabled
    const radios = screen.getAllByRole('radio');
    radios.forEach((radio) => {
      expect(radio).toBeDisabled();
    });

    // Helper message should display
    expect(
      screen.getByText("Enter pump quantity first"),
    ).toBeInTheDocument();

    // Percentage input should still be available
    expect(
      screen.getByLabelText('Failure Rate (%)'),
    ).toBeInTheDocument();
  });

  it('persistence flow: values persist across re-renders', async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <FailureRateInput analysisId="integration-failure-1" />,
    );

    // Enter percentage
    const input = screen.getByLabelText('Failure Rate (%)');
    await user.type(input, '25');

    // Verify store
    expect(
      useAppStore.getState().analyses[0].failureRatePercentage,
    ).toBe(25);

    // Unmount and re-render
    unmount();
    render(<FailureRateInput analysisId="integration-failure-1" />);

    // Value should persist from store
    expect(
      screen.getByLabelText('Failure Rate (%)'),
    ).toHaveValue(25);
  });

  it('count validation: rejects decimal values', async () => {
    const user = userEvent.setup();
    useAppStore.setState({
      analyses: [
        createTestAnalysis({
          failureRateMode: 'absolute',
          pumpQuantity: 8,
        }),
      ],
    });
    render(<FailureRateInput analysisId="integration-failure-1" />);

    const input = screen.getByLabelText(
      'Failures Count (last year)',
    );
    await user.type(input, '3.5');

    expect(
      screen.getByText('Must be a positive integer'),
    ).toBeInTheDocument();
  });
});
