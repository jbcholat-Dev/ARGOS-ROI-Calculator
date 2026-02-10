import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ServiceCostInput } from './ServiceCostInput';
import { useAppStore } from '@/stores/app-store';

describe('ServiceCostInput', () => {
  beforeEach(() => {
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

  describe('rendering', () => {
    it('should render label and input', () => {
      render(<ServiceCostInput />);

      expect(screen.getByLabelText('ARGOS Service Cost (per pump/year)')).toBeInTheDocument();
    });

    it('should display default value from store', () => {
      render(<ServiceCostInput />);

      const input = screen.getByLabelText('ARGOS Service Cost (per pump/year)');
      expect(input).toHaveValue(2500);
    });

    it('should display formatted value when not focused', () => {
      render(<ServiceCostInput />);

      expect(screen.getByText('2 500 €')).toBeInTheDocument();
    });

    it('should display helper text', () => {
      render(<ServiceCostInput />);

      expect(screen.getByText('Amount in EUR')).toBeInTheDocument();
    });
  });

  describe('validation', () => {
    it('should accept valid positive numbers', async () => {
      const user = userEvent.setup();
      render(<ServiceCostInput />);

      const input = screen.getByLabelText('ARGOS Service Cost (per pump/year)');
      await user.clear(input);
      await user.type(input, '3000');
      await user.tab();

      expect(useAppStore.getState().globalParams.serviceCostPerPump).toBe(3000);
    });

    it('should reject zero value', async () => {
      const user = userEvent.setup();
      render(<ServiceCostInput />);

      const input = screen.getByLabelText('ARGOS Service Cost (per pump/year)');
      await user.clear(input);
      await user.type(input, '0');
      await user.tab();

      expect(screen.getByText('Cost must be greater than 0')).toBeInTheDocument();
      expect(useAppStore.getState().globalParams.serviceCostPerPump).toBe(2500);
    });

    it('should reject empty value', async () => {
      const user = userEvent.setup();
      render(<ServiceCostInput />);

      const input = screen.getByLabelText('ARGOS Service Cost (per pump/year)');
      await user.clear(input);
      await user.tab();

      expect(screen.getByText('Please enter a service cost')).toBeInTheDocument();
    });
  });

  describe('keyboard interaction', () => {
    it('should commit on Enter key', async () => {
      const user = userEvent.setup();
      render(<ServiceCostInput />);

      const input = screen.getByLabelText('ARGOS Service Cost (per pump/year)');
      await user.clear(input);
      await user.type(input, '4000');
      await user.keyboard('{Enter}');

      expect(useAppStore.getState().globalParams.serviceCostPerPump).toBe(4000);
    });

    it('should cancel on Escape key', async () => {
      const user = userEvent.setup();
      render(<ServiceCostInput />);

      const input = screen.getByLabelText('ARGOS Service Cost (per pump/year)');
      await user.clear(input);
      await user.type(input, '9999');
      await user.keyboard('{Escape}');

      expect(input).toHaveValue(2500);
      expect(useAppStore.getState().globalParams.serviceCostPerPump).toBe(2500);
    });
  });

  describe('store integration', () => {
    it('should read initial value from store', () => {
      useAppStore.setState({
        globalParams: { detectionRate: 70, serviceCostPerPump: 5000 },
      });

      render(<ServiceCostInput />);

      const input = screen.getByLabelText('ARGOS Service Cost (per pump/year)');
      expect(input).toHaveValue(5000);
    });

    it('should show error state on invalid input', async () => {
      const user = userEvent.setup();
      render(<ServiceCostInput />);

      const input = screen.getByLabelText('ARGOS Service Cost (per pump/year)');
      await user.clear(input);
      await user.type(input, '-100');
      await user.tab();

      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });
});
