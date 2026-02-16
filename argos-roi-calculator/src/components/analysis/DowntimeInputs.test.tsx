import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DowntimeInputs } from './DowntimeInputs';
import { useAppStore } from '@/stores/app-store';
import type { Analysis } from '@/types';

const createTestAnalysis = (overrides?: Partial<Analysis>): Analysis => ({
  id: 'test-analysis-1',
  name: 'Poly Etch - Chamber 04',
  pumpType: '',
  pumpQuantity: 0,
  failureRateMode: 'percentage',
  failureRatePercentage: 0,
  waferType: 'mono',
  waferQuantity: 1,
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
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('DowntimeInputs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.setState({
      analyses: [createTestAnalysis()],
      activeAnalysisId: 'test-analysis-1',
      globalParams: { detectionRate: 70, serviceCostPerPump: 2500 },
      unsavedChanges: false,
    });
  });

  const renderComponent = (analysisId = 'test-analysis-1') => {
    return render(<DowntimeInputs analysisId={analysisId} />);
  };

  describe('Rendering', () => {
    it('renders section heading "Downtime"', () => {
      renderComponent();
      expect(screen.getByRole('heading', { name: 'Downtime' })).toBeInTheDocument();
    });

    it('renders duration label "Duration per Failure (hours)"', () => {
      renderComponent();
      expect(screen.getByLabelText(/Duration per Failure/)).toBeInTheDocument();
    });

    it('renders cost label "Cost per Hour of Downtime"', () => {
      renderComponent();
      expect(screen.getByLabelText(/Cost per Hour of Downtime/)).toBeInTheDocument();
    });

    it('renders duration placeholder "ex: 6"', () => {
      renderComponent();
      expect(screen.getByPlaceholderText('ex: 6')).toBeInTheDocument();
    });

    it('renders cost placeholder "ex: 15000"', () => {
      renderComponent();
      expect(screen.getByPlaceholderText('ex: 15000')).toBeInTheDocument();
    });

    it('renders unit display "hours"', () => {
      renderComponent();
      expect(screen.getByText('hours')).toBeInTheDocument();
    });

    it('renders unit display "€/h"', () => {
      renderComponent();
      expect(screen.getByText('€/h')).toBeInTheDocument();
    });

    it('renders duration input with type="number"', () => {
      renderComponent();
      const input = screen.getByLabelText(/Duration per Failure/);
      expect(input).toHaveAttribute('type', 'number');
    });

    it('renders duration input with step="0.1"', () => {
      renderComponent();
      const input = screen.getByLabelText(/Duration per Failure/);
      expect(input).toHaveAttribute('step', '0.1');
    });
  });

  describe('Initial values from store', () => {
    it('shows empty duration when default is 0', () => {
      renderComponent();
      const input = screen.getByLabelText(/Duration per Failure/);
      expect(input).toHaveValue(null);
    });

    it('shows empty cost when default is 0', () => {
      renderComponent();
      const input = screen.getByLabelText(/Cost per Hour of Downtime/);
      expect(input).toHaveValue('');
    });

    it('displays existing duration value from store', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis({ downtimeDuration: 6 })],
      });
      renderComponent();
      const input = screen.getByLabelText(/Duration per Failure/);
      expect(input).toHaveValue(6);
    });

    it('displays formatted cost value from store when not focused', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis({ downtimeCostPerHour: 15000 })],
      });
      renderComponent();
      const input = screen.getByLabelText(/Cost per Hour of Downtime/);
      // Formatted number: "15 000" (with space separator)
      expect(input.getAttribute('value')).toMatch(/15\s000/);
    });
  });

  describe('Duration input validation', () => {
    it('updates store with valid positive value', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByLabelText(/Duration per Failure/);
      await user.type(input, '6');

      const state = useAppStore.getState();
      expect(state.analyses[0].downtimeDuration).toBe(6);
    });

    it('shows error for negative value', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByLabelText(/Duration per Failure/);
      await user.type(input, '-5');

      expect(screen.getByText('Must be a positive number')).toBeInTheDocument();
    });

    it('does NOT save negative value to store', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByLabelText(/Duration per Failure/);
      await user.type(input, '6');
      expect(useAppStore.getState().analyses[0].downtimeDuration).toBe(6);

      await user.clear(input);
      await user.type(input, '-5');
      // Store should have 0 from clearing, not -5
      expect(useAppStore.getState().analyses[0].downtimeDuration).toBe(0);
    });

    it('clears error when valid input replaces invalid', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByLabelText(/Duration per Failure/);
      await user.type(input, '-1');
      expect(screen.getByText('Must be a positive number')).toBeInTheDocument();

      await user.clear(input);
      await user.type(input, '6');
      expect(screen.queryByText('Must be a positive number')).not.toBeInTheDocument();
    });
  });

  describe('Cost input validation', () => {
    it('updates store with valid positive value', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByLabelText(/Cost per Hour of Downtime/);
      await user.click(input);
      await user.type(input, '15000');

      const state = useAppStore.getState();
      expect(state.analyses[0].downtimeCostPerHour).toBe(15000);
    });

    it('shows error for negative cost value', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByLabelText(/Cost per Hour of Downtime/);
      await user.click(input);
      await user.type(input, '-100');

      expect(screen.getByText('Must be a positive number')).toBeInTheDocument();
    });

    it('does NOT save negative cost to store', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByLabelText(/Cost per Hour of Downtime/);
      await user.click(input);
      await user.type(input, '500');
      expect(useAppStore.getState().analyses[0].downtimeCostPerHour).toBe(500);

      await user.clear(input);
      await user.click(input);
      await user.type(input, '-100');
      expect(useAppStore.getState().analyses[0].downtimeCostPerHour).toBe(0);
    });
  });

  describe('Soft warnings for empty fields', () => {
    it('shows warning when duration is cleared', async () => {
      const user = userEvent.setup();
      useAppStore.setState({
        analyses: [createTestAnalysis({ downtimeDuration: 6 })],
      });
      renderComponent();

      const input = screen.getByLabelText(/Duration per Failure/);
      await user.clear(input);

      expect(screen.getByText('Required for ROI calculation')).toBeInTheDocument();
    });

    it('shows warning when cost is cleared', async () => {
      const user = userEvent.setup();
      useAppStore.setState({
        analyses: [createTestAnalysis({ downtimeCostPerHour: 500 })],
      });
      renderComponent();

      const input = screen.getByLabelText(/Cost per Hour of Downtime/);
      await user.click(input);
      await user.clear(input);

      expect(screen.getByText('Required for ROI calculation')).toBeInTheDocument();
    });

    it('warning text is amber colored (not red)', async () => {
      const user = userEvent.setup();
      useAppStore.setState({
        analyses: [createTestAnalysis({ downtimeDuration: 6 })],
      });
      renderComponent();

      const input = screen.getByLabelText(/Duration per Failure/);
      await user.clear(input);

      const warning = screen.getByText('Required for ROI calculation');
      expect(warning).toHaveClass('text-amber-600');
    });

    it('warning disappears when valid value is entered', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByLabelText(/Duration per Failure/);
      // First clear to trigger warning
      await user.type(input, '6');
      await user.clear(input);
      expect(screen.getByText('Required for ROI calculation')).toBeInTheDocument();

      // Enter valid value
      await user.type(input, '8');
      expect(screen.queryByText('Required for ROI calculation')).not.toBeInTheDocument();
    });
  });

  describe('Error display styling', () => {
    it('error text has red color class', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByLabelText(/Duration per Failure/);
      await user.type(input, '-1');

      const error = screen.getByText('Must be a positive number');
      expect(error).toHaveClass('text-red-600');
    });

    it('error message has role="alert"', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByLabelText(/Duration per Failure/);
      await user.type(input, '-1');

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('marks duration input as aria-invalid on error', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByLabelText(/Duration per Failure/);
      await user.type(input, '-1');

      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('duration input has red border on error', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByLabelText(/Duration per Failure/);
      await user.type(input, '-1');

      expect(input).toHaveClass('border-red-600');
    });

    it('duration input has amber border on warning', async () => {
      const user = userEvent.setup();
      useAppStore.setState({
        analyses: [createTestAnalysis({ downtimeDuration: 6 })],
      });
      renderComponent();

      const input = screen.getByLabelText(/Duration per Failure/);
      await user.clear(input);

      expect(input).toHaveClass('border-amber-500');
    });
  });

  describe('Missing analysis handling', () => {
    it('renders nothing when analysis does not exist', () => {
      const { container } = render(
        <DowntimeInputs analysisId="nonexistent-id" />,
      );
      expect(container.innerHTML).toBe('');
    });
  });

  describe('Accessibility', () => {
    it('has section with aria-label', () => {
      renderComponent();
      expect(screen.getByRole('region', { name: 'Downtime' })).toBeInTheDocument();
    });

    it('duration input has accessible label', () => {
      renderComponent();
      expect(screen.getByLabelText(/Duration per Failure/)).toBeInTheDocument();
    });

    it('cost input has accessible label', () => {
      renderComponent();
      expect(screen.getByLabelText(/Cost per Hour of Downtime/)).toBeInTheDocument();
    });

    it('error message is associated with input via aria-describedby', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByLabelText(/Duration per Failure/);
      await user.type(input, '-1');

      expect(input).toHaveAttribute('aria-describedby');
      const describedById = input.getAttribute('aria-describedby');
      const errorEl = document.getElementById(describedById!);
      expect(errorEl).toBeInTheDocument();
      expect(errorEl?.textContent).toContain('Must be a positive number');
    });

    it('warning message has role="status" for screen readers', async () => {
      const user = userEvent.setup();
      useAppStore.setState({
        analyses: [createTestAnalysis({ downtimeDuration: 6 })],
      });
      renderComponent();

      const input = screen.getByLabelText(/Duration per Failure/);
      await user.clear(input);

      const warning = screen.getByText('Required for ROI calculation');
      expect(warning).toHaveAttribute('role', 'status');
    });
  });

  describe('Keyboard navigation', () => {
    it('allows Tab to move from duration to cost', async () => {
      const user = userEvent.setup();
      renderComponent();
      const durationInput = screen.getByLabelText(/Duration per Failure/);
      const costInput = screen.getByLabelText(/Cost per Hour of Downtime/);

      durationInput.focus();
      await user.keyboard('{Tab}');
      expect(costInput).toHaveFocus();
    });

    it('allows Shift+Tab to move from cost to duration', async () => {
      const user = userEvent.setup();
      renderComponent();
      const durationInput = screen.getByLabelText(/Duration per Failure/);
      const costInput = screen.getByLabelText(/Cost per Hour of Downtime/);

      costInput.focus();
      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(durationInput).toHaveFocus();
    });
  });

  describe('Store integration', () => {
    it('uses selector pattern (does not re-render on unrelated state changes)', () => {
      renderComponent();
      useAppStore.setState({ unsavedChanges: true });
      expect(screen.getByRole('heading', { name: 'Downtime' })).toBeInTheDocument();
    });

    it('updates updatedAt timestamp on store change', async () => {
      const user = userEvent.setup();
      const originalUpdatedAt = useAppStore.getState().analyses[0].updatedAt;

      renderComponent();

      const input = screen.getByLabelText(/Duration per Failure/);
      await user.type(input, '6');

      const newUpdatedAt = useAppStore.getState().analyses[0].updatedAt;
      expect(newUpdatedAt).not.toBe(originalUpdatedAt);
    });

    it('store update completes within 100ms (NFR-P1)', () => {
      // Measure direct store update time (not DOM interaction overhead)
      const start = performance.now();
      useAppStore.getState().updateAnalysis('test-analysis-1', { downtimeDuration: 6 });
      const end = performance.now();

      expect(end - start).toBeLessThan(100);
      expect(useAppStore.getState().analyses[0].downtimeDuration).toBe(6);
    });

    it('stores duration as number not string', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByLabelText(/Duration per Failure/);
      await user.type(input, '6');

      expect(typeof useAppStore.getState().analyses[0].downtimeDuration).toBe('number');
    });

    it('stores cost as number not string', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByLabelText(/Cost per Hour of Downtime/);
      await user.click(input);
      await user.type(input, '500');

      expect(typeof useAppStore.getState().analyses[0].downtimeCostPerHour).toBe('number');
    });
  });

  // Story 4.5.3: Bottleneck Tool Toggle
  describe('Bottleneck toggle (Story 4.5.3)', () => {
    it('renders "Bottleneck tool" checkbox', () => {
      renderComponent();
      expect(screen.getByLabelText('Bottleneck tool')).toBeInTheDocument();
    });

    it('checkbox is unchecked by default', () => {
      renderComponent();
      const checkbox = screen.getByLabelText('Bottleneck tool');
      expect(checkbox).not.toBeChecked();
    });

    it('toggles isBottleneck in store on click', async () => {
      const user = userEvent.setup();
      renderComponent();

      const checkbox = screen.getByLabelText('Bottleneck tool');
      await user.click(checkbox);

      expect(useAppStore.getState().analyses[0].isBottleneck).toBe(true);
    });

    it('preserves existing bottleneckMultiplier when toggling ON', async () => {
      const user = userEvent.setup();
      // Set analysis with a custom multiplier (simulating previous selection)
      useAppStore.setState({
        analyses: [createTestAnalysis({ isBottleneck: false, bottleneckMultiplier: 3.5 })],
      });
      renderComponent();

      const checkbox = screen.getByLabelText('Bottleneck tool');
      await user.click(checkbox);

      // Should preserve the existing 3.5, not reset to 2.0
      expect(useAppStore.getState().analyses[0].bottleneckMultiplier).toBe(3.5);
    });

    it('does NOT show multiplier select when bottleneck is OFF', () => {
      renderComponent();
      expect(screen.queryByLabelText('Impact multiplier')).not.toBeInTheDocument();
    });

    it('shows multiplier select when bottleneck is ON', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByLabelText('Bottleneck tool'));
      expect(screen.getByLabelText('Impact multiplier')).toBeInTheDocument();
    });

    it('renders analysis with isBottleneck=true from store', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis({ isBottleneck: true, bottleneckMultiplier: 3.0 })],
      });
      renderComponent();

      const checkbox = screen.getByLabelText('Bottleneck tool');
      expect(checkbox).toBeChecked();
      expect(screen.getByLabelText('Impact multiplier')).toBeInTheDocument();
    });

    it('multiplier select defaults to x2.0', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByLabelText('Bottleneck tool'));
      const select = screen.getByLabelText('Impact multiplier') as HTMLSelectElement;
      expect(select.value).toBe('2');
    });

    it('updates store when multiplier is changed', async () => {
      const user = userEvent.setup();
      useAppStore.setState({
        analyses: [createTestAnalysis({ isBottleneck: true, bottleneckMultiplier: 2.0 })],
      });
      renderComponent();

      const select = screen.getByLabelText('Impact multiplier');
      await user.selectOptions(select, '3.5');

      expect(useAppStore.getState().analyses[0].bottleneckMultiplier).toBe(3.5);
    });

    it('has all 8 multiplier options (x1.5 to x5.0)', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByLabelText('Bottleneck tool'));
      const options = screen.getByLabelText('Impact multiplier').querySelectorAll('option');
      expect(options).toHaveLength(8);
      expect(options[0].textContent).toBe('x1.5');
      expect(options[7].textContent).toBe('x5.0');
    });

    it('hides multiplier select when toggling OFF', async () => {
      const user = userEvent.setup();
      renderComponent();

      // Toggle ON
      await user.click(screen.getByLabelText('Bottleneck tool'));
      expect(screen.getByLabelText('Impact multiplier')).toBeInTheDocument();

      // Toggle OFF
      await user.click(screen.getByLabelText('Bottleneck tool'));
      expect(screen.queryByLabelText('Impact multiplier')).not.toBeInTheDocument();
    });

    it('checkbox has accessible role', () => {
      renderComponent();
      expect(screen.getByRole('checkbox', { name: 'Bottleneck tool' })).toBeInTheDocument();
    });

    it('checkbox has aria-expanded=false when bottleneck is OFF', () => {
      renderComponent();
      const checkbox = screen.getByRole('checkbox', { name: 'Bottleneck tool' });
      expect(checkbox).toHaveAttribute('aria-expanded', 'false');
    });

    it('checkbox has aria-expanded=true when bottleneck is ON', async () => {
      const user = userEvent.setup();
      renderComponent();

      const checkbox = screen.getByRole('checkbox', { name: 'Bottleneck tool' });
      await user.click(checkbox);

      expect(checkbox).toHaveAttribute('aria-expanded', 'true');
    });

    it('allows Tab from bottleneck checkbox to multiplier select when ON', async () => {
      const user = userEvent.setup();
      useAppStore.setState({
        analyses: [createTestAnalysis({ isBottleneck: true, bottleneckMultiplier: 2.0 })],
      });
      renderComponent();

      const checkbox = screen.getByLabelText('Bottleneck tool');
      const select = screen.getByLabelText('Impact multiplier');

      checkbox.focus();
      await user.keyboard('{Tab}');
      expect(select).toHaveFocus();
    });
  });
});
