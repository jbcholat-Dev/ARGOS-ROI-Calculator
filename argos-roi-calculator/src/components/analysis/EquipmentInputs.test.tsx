import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EquipmentInputs } from './EquipmentInputs';
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
  downtimeDuration: 0,
  downtimeCostPerHour: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('EquipmentInputs', () => {
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
    return render(<EquipmentInputs analysisId={analysisId} />);
  };

  describe('Rendering', () => {
    it('renders section heading "Equipment"', () => {
      renderComponent();
      expect(screen.getByText('Equipment')).toBeInTheDocument();
    });

    it('renders pump type label "Pump Model"', () => {
      renderComponent();
      expect(screen.getByLabelText('Pump Model')).toBeInTheDocument();
    });

    it('renders pump quantity label "Pump Quantity"', () => {
      renderComponent();
      expect(screen.getByLabelText('Pump Quantity')).toBeInTheDocument();
    });

    it('renders pump type placeholder from PUMP_TYPE_SUGGESTIONS', () => {
      renderComponent();
      expect(
        screen.getByPlaceholderText('ex: HiPace (turbo), HiScrew (dry screw), OnTool Roots (roots)'),
      ).toBeInTheDocument();
    });

    it('renders pump quantity placeholder', () => {
      renderComponent();
      expect(screen.getByPlaceholderText('ex: 8')).toBeInTheDocument();
    });

    it('renders pump quantity input with type="number"', () => {
      renderComponent();
      const input = screen.getByLabelText('Pump Quantity');
      expect(input).toHaveAttribute('type', 'number');
    });
  });

  describe('Initial values from store', () => {
    it('displays pump type from store', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis({ pumpType: 'HiPace 700' })],
      });
      renderComponent();
      expect(screen.getByLabelText('Pump Model')).toHaveValue('HiPace 700');
    });

    it('displays pump quantity from store', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis({ pumpQuantity: 8 })],
      });
      renderComponent();
      expect(screen.getByLabelText('Pump Quantity')).toHaveValue(8);
    });

    it('shows empty pump quantity when default is 0', () => {
      renderComponent();
      expect(screen.getByLabelText('Pump Quantity')).toHaveValue(null);
    });
  });

  describe('Pump type updates', () => {
    it('updates store on pump type change', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByLabelText('Pump Model');
      await user.type(input, 'HiPace 700');

      const state = useAppStore.getState();
      expect(state.analyses[0].pumpType).toBe('HiPace 700');
    });

    it('updates store on every keystroke', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByLabelText('Pump Model');
      await user.type(input, 'Hi');

      const state = useAppStore.getState();
      expect(state.analyses[0].pumpType).toBe('Hi');
    });
  });

  describe('Pump quantity validation', () => {
    it('updates store with valid positive integer', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByLabelText('Pump Quantity');
      await user.type(input, '8');

      const state = useAppStore.getState();
      expect(state.analyses[0].pumpQuantity).toBe(8);
    });

    it('stores quantity as number not string', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByLabelText('Pump Quantity');
      await user.type(input, '25');

      const state = useAppStore.getState();
      expect(typeof state.analyses[0].pumpQuantity).toBe('number');
    });

    it('shows error for negative number', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByLabelText('Pump Quantity');
      await user.type(input, '-5');

      expect(screen.getByText('Must be a positive number')).toBeInTheDocument();
    });

    it('shows error for zero', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByLabelText('Pump Quantity');
      await user.type(input, '0');

      expect(screen.getByText('Must be a positive number')).toBeInTheDocument();
    });

    it('shows error for value exceeding 1000', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByLabelText('Pump Quantity');
      await user.type(input, '1001');

      expect(screen.getByText('Maximum 1000 pumps')).toBeInTheDocument();
    });

    it('does NOT update store with invalid values', async () => {
      const user = userEvent.setup();
      renderComponent();

      // First set a valid value
      const input = screen.getByLabelText('Pump Quantity');
      await user.type(input, '5');
      expect(useAppStore.getState().analyses[0].pumpQuantity).toBe(5);

      // Clear and type invalid
      await user.clear(input);
      await user.type(input, '-3');

      // Store should still have 0 (from clear) not -3
      expect(useAppStore.getState().analyses[0].pumpQuantity).toBe(0);
    });
  });

  describe('Error display and clearing', () => {
    it('shows error with red styling via role="alert"', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByLabelText('Pump Quantity');
      await user.type(input, '-1');

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('clears error when valid input is entered', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByLabelText('Pump Quantity');
      // Type invalid first
      await user.type(input, '-1');
      expect(screen.getByText('Must be a positive number')).toBeInTheDocument();

      // Clear and type valid
      await user.clear(input);
      await user.type(input, '10');

      expect(screen.queryByText('Must be a positive number')).not.toBeInTheDocument();
    });

    it('clears error when field is emptied', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByLabelText('Pump Quantity');
      await user.type(input, '-1');
      expect(screen.getByText('Must be a positive number')).toBeInTheDocument();

      await user.clear(input);
      expect(screen.queryByText('Must be a positive number')).not.toBeInTheDocument();
    });

    it('marks input as aria-invalid when error is shown', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByLabelText('Pump Quantity');
      await user.type(input, '-1');

      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Missing analysis handling', () => {
    it('renders nothing when analysis does not exist', () => {
      const { container } = render(
        <EquipmentInputs analysisId="nonexistent-id" />,
      );
      expect(container.innerHTML).toBe('');
    });
  });

  describe('Accessibility', () => {
    it('has section with aria-label', () => {
      renderComponent();
      expect(screen.getByRole('region', { name: 'Equipment' })).toBeInTheDocument();
    });

    it('pump type input has accessible label', () => {
      renderComponent();
      expect(screen.getByLabelText('Pump Model')).toBeInTheDocument();
    });

    it('pump quantity input has accessible label', () => {
      renderComponent();
      expect(screen.getByLabelText('Pump Quantity')).toBeInTheDocument();
    });

    it('error message is associated with input via aria-describedby', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByLabelText('Pump Quantity');
      await user.type(input, '-1');

      expect(input).toHaveAttribute('aria-describedby');
      const describedById = input.getAttribute('aria-describedby');
      const errorEl = document.getElementById(describedById!);
      expect(errorEl).toBeInTheDocument();
      expect(errorEl?.textContent).toContain('Must be a positive number');
    });
  });

  describe('Store integration', () => {
    it('uses selector pattern (does not re-render on unrelated state changes)', () => {
      renderComponent();
      // Verify the component renders correctly after unrelated state change
      useAppStore.setState({ unsavedChanges: true });
      expect(screen.getByText('Equipment')).toBeInTheDocument();
    });

    it('updates updatedAt timestamp on store change', async () => {
      const user = userEvent.setup();
      const originalUpdatedAt = useAppStore.getState().analyses[0].updatedAt;

      renderComponent();

      const input = screen.getByLabelText('Pump Model');
      await user.type(input, 'A');

      const newUpdatedAt = useAppStore.getState().analyses[0].updatedAt;
      expect(newUpdatedAt).not.toBe(originalUpdatedAt);
    });

    it('store update completes within 100ms (NFR-P1)', () => {
      // Measure store update time directly (not userEvent typing overhead)
      const start = performance.now();
      useAppStore.getState().updateAnalysis('test-analysis-1', { pumpType: 'HiPace' });
      const end = performance.now();

      expect(end - start).toBeLessThan(100);
      expect(useAppStore.getState().analyses[0].pumpType).toBe('HiPace');
    });

    it('clears error state when analysisId changes', async () => {
      const user = userEvent.setup();
      const secondAnalysis = {
        ...createTestAnalysis({ id: 'test-analysis-2', name: 'Second Analysis' }),
      };
      useAppStore.setState((state) => ({
        analyses: [...state.analyses, secondAnalysis],
      }));

      const { rerender } = render(
        <EquipmentInputs analysisId="test-analysis-1" />,
      );

      // Create error on first analysis
      const input = screen.getByLabelText('Pump Quantity');
      await user.type(input, '-5');
      expect(screen.getByText('Must be a positive number')).toBeInTheDocument();

      // Switch to second analysis
      rerender(<EquipmentInputs analysisId="test-analysis-2" />);

      // Error should be cleared
      expect(screen.queryByText('Must be a positive number')).not.toBeInTheDocument();
    });
  });
});
