import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FailureRateInput } from './FailureRateInput';
import { useAppStore } from '@/stores/app-store';
import type { Analysis } from '@/types';

const createTestAnalysis = (overrides?: Partial<Analysis>): Analysis => ({
  id: 'test-failure-1',
  name: 'Failure Rate Test',
  pumpType: 'HiPace 700',
  pumpQuantity: 8,
  failureRateMode: 'percentage',
  failureRatePercentage: 10,
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

describe('FailureRateInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.setState({
      analyses: [createTestAnalysis()],
      activeAnalysisId: 'test-failure-1',
      globalParams: { detectionRate: 70, serviceCostPerPump: 2500 },
      unsavedChanges: false,
    });
  });

  const renderComponent = (analysisId = 'test-failure-1') => {
    return render(<FailureRateInput analysisId={analysisId} />);
  };

  describe('Rendering', () => {
    it('renders section heading "Failure Rate"', () => {
      renderComponent();
      expect(screen.getByText('Failure Rate')).toBeInTheDocument();
    });

    it('renders in percentage mode by default', () => {
      renderComponent();
      expect(
        screen.getByLabelText('Failure Rate (%)'),
      ).toBeInTheDocument();
    });

    it('renders percentage mode with correct placeholder', () => {
      renderComponent();
      expect(screen.getByPlaceholderText('ex: 10')).toBeInTheDocument();
    });

    it('renders mode toggle with both options', () => {
      renderComponent();
      expect(screen.getByText('Rate (%)')).toBeInTheDocument();
      expect(screen.getByText('Failures Count/year')).toBeInTheDocument();
    });

    it('renders nothing when analysis does not exist', () => {
      const { container } = render(
        <FailureRateInput analysisId="nonexistent-id" />,
      );
      expect(container.innerHTML).toBe('');
    });
  });

  describe('Percentage mode', () => {
    it('displays initial percentage value from store', () => {
      renderComponent();
      const input = screen.getByLabelText('Failure Rate (%)');
      expect(input).toHaveValue(10);
    });

    it('shows empty field when percentage is 0', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis({ failureRatePercentage: 0 })],
      });
      renderComponent();
      const input = screen.getByLabelText('Failure Rate (%)');
      expect(input).toHaveValue(null);
    });

    it('updates store on valid percentage input', async () => {
      const user = userEvent.setup();
      useAppStore.setState({
        analyses: [createTestAnalysis({ failureRatePercentage: 0 })],
      });
      renderComponent();

      const input = screen.getByLabelText('Failure Rate (%)');
      await user.type(input, '15');

      const state = useAppStore.getState();
      expect(state.analyses[0].failureRatePercentage).toBe(15);
    });

    it('shows error for value > 100', async () => {
      const user = userEvent.setup();
      useAppStore.setState({
        analyses: [createTestAnalysis({ failureRatePercentage: 0 })],
      });
      renderComponent();

      const input = screen.getByLabelText('Failure Rate (%)');
      await user.type(input, '101');

      expect(
        screen.getByText('Rate must be between 0 and 100%'),
      ).toBeInTheDocument();
    });

    it('shows error for negative value', async () => {
      const user = userEvent.setup();
      useAppStore.setState({
        analyses: [createTestAnalysis({ failureRatePercentage: 0 })],
      });
      renderComponent();

      const input = screen.getByLabelText('Failure Rate (%)');
      await user.type(input, '-5');

      expect(
        screen.getByText('Must be a positive number'),
      ).toBeInTheDocument();
    });

    it('does NOT update store with invalid values', async () => {
      const user = userEvent.setup();
      useAppStore.setState({
        analyses: [createTestAnalysis({ failureRatePercentage: 0 })],
      });
      renderComponent();

      const input = screen.getByLabelText('Failure Rate (%)');
      await user.type(input, '-5');

      // Store should remain at 0
      expect(useAppStore.getState().analyses[0].failureRatePercentage).toBe(0);
    });
  });

  describe('Count mode', () => {
    it('shows count input when mode is absolute', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis({ failureRateMode: 'absolute' })],
      });
      renderComponent();
      expect(
        screen.getByLabelText('Nombre de pannes (last year)'),
      ).toBeInTheDocument();
    });

    it('shows pump quantity context in count mode', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis({ failureRateMode: 'absolute' })],
      });
      renderComponent();
      expect(screen.getByText('For 8 pumps')).toBeInTheDocument();
    });

    it('shows count mode placeholder', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis({ failureRateMode: 'absolute' })],
      });
      renderComponent();
      expect(screen.getByPlaceholderText('ex: 3')).toBeInTheDocument();
    });

    it('calculates and displays percentage from count', async () => {
      const user = userEvent.setup();
      useAppStore.setState({
        analyses: [
          createTestAnalysis({
            failureRateMode: 'absolute',
            failureRatePercentage: 0,
            absoluteFailureCount: undefined,
          }),
        ],
      });
      renderComponent();

      const input = screen.getByLabelText(
        'Nombre de pannes (last year)',
      );
      await user.type(input, '3');

      expect(screen.getByText(/Taux calculé/)).toBeInTheDocument();
      expect(screen.getByText(/37.5%/)).toBeInTheDocument();
    });

    it('updates store with both count and calculated percentage', async () => {
      const user = userEvent.setup();
      useAppStore.setState({
        analyses: [
          createTestAnalysis({
            failureRateMode: 'absolute',
            failureRatePercentage: 0,
            absoluteFailureCount: undefined,
          }),
        ],
      });
      renderComponent();

      const input = screen.getByLabelText(
        'Nombre de pannes (last year)',
      );
      await user.type(input, '3');

      const state = useAppStore.getState();
      expect(state.analyses[0].absoluteFailureCount).toBe(3);
      expect(state.analyses[0].failureRatePercentage).toBe(37.5);
    });
  });

  describe('Mode switching', () => {
    it('switches to count mode when toggle clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByText('Failures Count/year'));

      expect(
        screen.getByLabelText('Nombre de pannes (last year)'),
      ).toBeInTheDocument();
    });

    it('preserves percentage when switching from count to percentage', async () => {
      const user = userEvent.setup();
      useAppStore.setState({
        analyses: [
          createTestAnalysis({
            failureRateMode: 'absolute',
            failureRatePercentage: 37.5,
            absoluteFailureCount: 3,
          }),
        ],
      });
      renderComponent();

      // Switch to percentage mode
      await user.click(screen.getByText('Rate (%)'));

      const input = screen.getByLabelText('Failure Rate (%)');
      expect(input).toHaveValue(37.5);
    });
  });

  describe('Disabled count mode', () => {
    it('disables toggle when pump quantity is 0', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis({ pumpQuantity: 0 })],
      });
      renderComponent();

      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toBeDisabled();
      });
    });

    it('shows helper message when pump quantity is 0', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis({ pumpQuantity: 0 })],
      });
      renderComponent();

      expect(
        screen.getByText("Entrez d'abord le Pump Quantity"),
      ).toBeInTheDocument();
    });

    it('forces percentage mode display when pump quantity is 0', () => {
      useAppStore.setState({
        analyses: [
          createTestAnalysis({
            pumpQuantity: 0,
            failureRateMode: 'absolute',
          }),
        ],
      });
      renderComponent();

      // Even if store says absolute, should show percentage input
      // because count mode is disabled
      expect(
        screen.getByLabelText('Failure Rate (%)'),
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has section with aria-label', () => {
      renderComponent();
      expect(
        screen.getByRole('region', { name: 'Failure Rate' }),
      ).toBeInTheDocument();
    });

    it('percentage input has accessible label', () => {
      renderComponent();
      expect(
        screen.getByLabelText('Failure Rate (%)'),
      ).toBeInTheDocument();
    });

    it('count input has accessible label', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis({ failureRateMode: 'absolute' })],
      });
      renderComponent();
      expect(
        screen.getByLabelText('Nombre de pannes (last year)'),
      ).toBeInTheDocument();
    });

    it('error message has role="alert"', async () => {
      const user = userEvent.setup();
      useAppStore.setState({
        analyses: [createTestAnalysis({ failureRatePercentage: 0 })],
      });
      renderComponent();

      const input = screen.getByLabelText('Failure Rate (%)');
      await user.type(input, '-1');

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('calculated percentage has aria-describedby association when count > 0', () => {
      useAppStore.setState({
        analyses: [
          createTestAnalysis({
            failureRateMode: 'absolute',
            failureRatePercentage: 37.5,
            absoluteFailureCount: 3,
          }),
        ],
      });
      renderComponent();

      const input = screen.getByLabelText(
        'Nombre de pannes (last year)',
      );
      expect(input).toHaveAttribute('aria-describedby');
      const describedById = input.getAttribute('aria-describedby');
      const describedEl = document.getElementById(describedById!);
      expect(describedEl).toBeInTheDocument();
      expect(describedEl?.textContent).toContain('37.5%');
    });

    it('does not have aria-describedby when count is 0', () => {
      useAppStore.setState({
        analyses: [
          createTestAnalysis({
            failureRateMode: 'absolute',
            failureRatePercentage: 0,
            absoluteFailureCount: 0,
          }),
        ],
      });
      renderComponent();

      const input = screen.getByLabelText(
        'Nombre de pannes (last year)',
      );
      expect(input).not.toHaveAttribute('aria-describedby');
    });
  });

  describe('Store integration', () => {
    it('updates failureRateMode in store on mode switch', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByText('Failures Count/year'));

      expect(useAppStore.getState().analyses[0].failureRateMode).toBe(
        'absolute',
      );
    });

    it('updates updatedAt timestamp on change', async () => {
      const user = userEvent.setup();
      const originalUpdatedAt =
        useAppStore.getState().analyses[0].updatedAt;
      renderComponent();

      const input = screen.getByLabelText('Failure Rate (%)');
      await user.clear(input);
      await user.type(input, '20');

      const newUpdatedAt = useAppStore.getState().analyses[0].updatedAt;
      expect(newUpdatedAt).not.toBe(originalUpdatedAt);
    });

    it('store update completes within 100ms (NFR-P1)', () => {
      // Measure store update directly (not userEvent which adds overhead)
      const start = performance.now();
      useAppStore.getState().updateAnalysis('test-failure-1', {
        failureRatePercentage: 25,
      });
      const end = performance.now();

      expect(end - start).toBeLessThan(100);
      expect(useAppStore.getState().analyses[0].failureRatePercentage).toBe(
        25,
      );
    });

    it('preserves absoluteFailureCount in store on mode switch', async () => {
      const user = userEvent.setup();
      useAppStore.setState({
        analyses: [
          createTestAnalysis({
            failureRateMode: 'absolute',
            absoluteFailureCount: 3,
            failureRatePercentage: 37.5,
          }),
        ],
      });
      renderComponent();

      // Switch to percentage
      await user.click(screen.getByText('Rate (%)'));

      // absoluteFailureCount should still be in store
      expect(
        useAppStore.getState().analyses[0].absoluteFailureCount,
      ).toBe(3);
    });
  });
});
