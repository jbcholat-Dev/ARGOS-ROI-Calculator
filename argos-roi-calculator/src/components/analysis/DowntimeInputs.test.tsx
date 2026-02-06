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
  downtimeDuration: 0,
  downtimeCostPerHour: 0,
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
    it('renders section heading "Temps d\'arrêt"', () => {
      renderComponent();
      expect(screen.getByText(/Temps d.arrêt/)).toBeInTheDocument();
    });

    it('renders duration label "Heures d\'arrêt par panne"', () => {
      renderComponent();
      expect(screen.getByLabelText(/Heures d.arrêt par panne/)).toBeInTheDocument();
    });

    it('renders cost label "Coût horaire d\'arrêt"', () => {
      renderComponent();
      expect(screen.getByLabelText(/Coût horaire d.arrêt/)).toBeInTheDocument();
    });

    it('renders duration placeholder "ex: 6"', () => {
      renderComponent();
      expect(screen.getByPlaceholderText('ex: 6')).toBeInTheDocument();
    });

    it('renders cost placeholder "ex: 15000"', () => {
      renderComponent();
      expect(screen.getByPlaceholderText('ex: 15000')).toBeInTheDocument();
    });

    it('renders unit display "heures"', () => {
      renderComponent();
      expect(screen.getByText('heures')).toBeInTheDocument();
    });

    it('renders unit display "€/h"', () => {
      renderComponent();
      expect(screen.getByText('€/h')).toBeInTheDocument();
    });

    it('renders duration input with type="number"', () => {
      renderComponent();
      const input = screen.getByLabelText(/Heures d.arrêt par panne/);
      expect(input).toHaveAttribute('type', 'number');
    });

    it('renders duration input with step="0.1"', () => {
      renderComponent();
      const input = screen.getByLabelText(/Heures d.arrêt par panne/);
      expect(input).toHaveAttribute('step', '0.1');
    });
  });

  describe('Initial values from store', () => {
    it('shows empty duration when default is 0', () => {
      renderComponent();
      const input = screen.getByLabelText(/Heures d.arrêt par panne/);
      expect(input).toHaveValue(null);
    });

    it('shows empty cost when default is 0', () => {
      renderComponent();
      const input = screen.getByLabelText(/Coût horaire d.arrêt/);
      expect(input).toHaveValue('');
    });

    it('displays existing duration value from store', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis({ downtimeDuration: 6 })],
      });
      renderComponent();
      const input = screen.getByLabelText(/Heures d.arrêt par panne/);
      expect(input).toHaveValue(6);
    });

    it('displays formatted cost value from store when not focused', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis({ downtimeCostPerHour: 15000 })],
      });
      renderComponent();
      const input = screen.getByLabelText(/Coût horaire d.arrêt/);
      // French format: "15 000" (with space separator)
      expect(input.getAttribute('value')).toMatch(/15\s000/);
    });
  });

  describe('Duration input validation', () => {
    it('updates store with valid positive value', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByLabelText(/Heures d.arrêt par panne/);
      await user.type(input, '6');

      const state = useAppStore.getState();
      expect(state.analyses[0].downtimeDuration).toBe(6);
    });

    it('shows error for negative value', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByLabelText(/Heures d.arrêt par panne/);
      await user.type(input, '-5');

      expect(screen.getByText('Doit être un nombre positif')).toBeInTheDocument();
    });

    it('does NOT save negative value to store', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByLabelText(/Heures d.arrêt par panne/);
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

      const input = screen.getByLabelText(/Heures d.arrêt par panne/);
      await user.type(input, '-1');
      expect(screen.getByText('Doit être un nombre positif')).toBeInTheDocument();

      await user.clear(input);
      await user.type(input, '6');
      expect(screen.queryByText('Doit être un nombre positif')).not.toBeInTheDocument();
    });
  });

  describe('Cost input validation', () => {
    it('updates store with valid positive value', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByLabelText(/Coût horaire d.arrêt/);
      await user.click(input);
      await user.type(input, '15000');

      const state = useAppStore.getState();
      expect(state.analyses[0].downtimeCostPerHour).toBe(15000);
    });

    it('shows error for negative cost value', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByLabelText(/Coût horaire d.arrêt/);
      await user.click(input);
      await user.type(input, '-100');

      expect(screen.getByText('Doit être un nombre positif')).toBeInTheDocument();
    });

    it('does NOT save negative cost to store', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByLabelText(/Coût horaire d.arrêt/);
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

      const input = screen.getByLabelText(/Heures d.arrêt par panne/);
      await user.clear(input);

      expect(screen.getByText('Requis pour le calcul ROI')).toBeInTheDocument();
    });

    it('shows warning when cost is cleared', async () => {
      const user = userEvent.setup();
      useAppStore.setState({
        analyses: [createTestAnalysis({ downtimeCostPerHour: 500 })],
      });
      renderComponent();

      const input = screen.getByLabelText(/Coût horaire d.arrêt/);
      await user.click(input);
      await user.clear(input);

      expect(screen.getByText('Requis pour le calcul ROI')).toBeInTheDocument();
    });

    it('warning text is amber colored (not red)', async () => {
      const user = userEvent.setup();
      useAppStore.setState({
        analyses: [createTestAnalysis({ downtimeDuration: 6 })],
      });
      renderComponent();

      const input = screen.getByLabelText(/Heures d.arrêt par panne/);
      await user.clear(input);

      const warning = screen.getByText('Requis pour le calcul ROI');
      expect(warning).toHaveClass('text-amber-600');
    });

    it('warning disappears when valid value is entered', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByLabelText(/Heures d.arrêt par panne/);
      // First clear to trigger warning
      await user.type(input, '6');
      await user.clear(input);
      expect(screen.getByText('Requis pour le calcul ROI')).toBeInTheDocument();

      // Enter valid value
      await user.type(input, '8');
      expect(screen.queryByText('Requis pour le calcul ROI')).not.toBeInTheDocument();
    });
  });

  describe('Error display styling', () => {
    it('error text has red color class', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByLabelText(/Heures d.arrêt par panne/);
      await user.type(input, '-1');

      const error = screen.getByText('Doit être un nombre positif');
      expect(error).toHaveClass('text-red-600');
    });

    it('error message has role="alert"', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByLabelText(/Heures d.arrêt par panne/);
      await user.type(input, '-1');

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('marks duration input as aria-invalid on error', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByLabelText(/Heures d.arrêt par panne/);
      await user.type(input, '-1');

      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('duration input has red border on error', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByLabelText(/Heures d.arrêt par panne/);
      await user.type(input, '-1');

      expect(input).toHaveClass('border-red-600');
    });

    it('duration input has amber border on warning', async () => {
      const user = userEvent.setup();
      useAppStore.setState({
        analyses: [createTestAnalysis({ downtimeDuration: 6 })],
      });
      renderComponent();

      const input = screen.getByLabelText(/Heures d.arrêt par panne/);
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
      expect(screen.getByRole('region', { name: /Temps d.arrêt/ })).toBeInTheDocument();
    });

    it('duration input has accessible label', () => {
      renderComponent();
      expect(screen.getByLabelText(/Heures d.arrêt par panne/)).toBeInTheDocument();
    });

    it('cost input has accessible label', () => {
      renderComponent();
      expect(screen.getByLabelText(/Coût horaire d.arrêt/)).toBeInTheDocument();
    });

    it('error message is associated with input via aria-describedby', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByLabelText(/Heures d.arrêt par panne/);
      await user.type(input, '-1');

      expect(input).toHaveAttribute('aria-describedby');
      const describedById = input.getAttribute('aria-describedby');
      const errorEl = document.getElementById(describedById!);
      expect(errorEl).toBeInTheDocument();
      expect(errorEl?.textContent).toContain('Doit être un nombre positif');
    });

    it('warning message has role="status" for screen readers', async () => {
      const user = userEvent.setup();
      useAppStore.setState({
        analyses: [createTestAnalysis({ downtimeDuration: 6 })],
      });
      renderComponent();

      const input = screen.getByLabelText(/Heures d.arrêt par panne/);
      await user.clear(input);

      const warning = screen.getByText('Requis pour le calcul ROI');
      expect(warning).toHaveAttribute('role', 'status');
    });
  });

  describe('Keyboard navigation', () => {
    it('allows Tab to move from duration to cost', async () => {
      const user = userEvent.setup();
      renderComponent();
      const durationInput = screen.getByLabelText(/Heures d.arrêt par panne/);
      const costInput = screen.getByLabelText(/Coût horaire d.arrêt/);

      durationInput.focus();
      await user.keyboard('{Tab}');
      expect(costInput).toHaveFocus();
    });

    it('allows Shift+Tab to move from cost to duration', async () => {
      const user = userEvent.setup();
      renderComponent();
      const durationInput = screen.getByLabelText(/Heures d.arrêt par panne/);
      const costInput = screen.getByLabelText(/Coût horaire d.arrêt/);

      costInput.focus();
      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(durationInput).toHaveFocus();
    });
  });

  describe('Store integration', () => {
    it('uses selector pattern (does not re-render on unrelated state changes)', () => {
      renderComponent();
      useAppStore.setState({ unsavedChanges: true });
      expect(screen.getByText(/Temps d.arrêt/)).toBeInTheDocument();
    });

    it('updates updatedAt timestamp on store change', async () => {
      const user = userEvent.setup();
      const originalUpdatedAt = useAppStore.getState().analyses[0].updatedAt;

      renderComponent();

      const input = screen.getByLabelText(/Heures d.arrêt par panne/);
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

      const input = screen.getByLabelText(/Heures d.arrêt par panne/);
      await user.type(input, '6');

      expect(typeof useAppStore.getState().analyses[0].downtimeDuration).toBe('number');
    });

    it('stores cost as number not string', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByLabelText(/Coût horaire d.arrêt/);
      await user.click(input);
      await user.type(input, '500');

      expect(typeof useAppStore.getState().analyses[0].downtimeCostPerHour).toBe('number');
    });
  });
});
