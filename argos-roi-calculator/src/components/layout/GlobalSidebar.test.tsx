import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { GlobalSidebar } from './GlobalSidebar';
import { useAppStore } from '@/stores/app-store';

describe('GlobalSidebar', () => {
  beforeEach(() => {
    // Reset store to default values before each test
    useAppStore.setState({
      analyses: [],
      activeAnalysisId: null,
      globalParams: {
        detectionRate: 70,
        serviceCostPerPump: 2500
      },
      unsavedChanges: false
    });
  });

  describe('rendering', () => {
    it('should render Paramètres Globaux heading', () => {
      render(<GlobalSidebar />);

      expect(screen.getByText('Global Parameters')).toBeInTheDocument();
    });

    it('should display detection rate input with default value', () => {
      render(<GlobalSidebar />);

      const detectionRateInput = screen.getByLabelText('ARGOS Detection Rate');
      expect(detectionRateInput).toBeInTheDocument();
      expect(detectionRateInput).toHaveValue(70);
    });

    it('should display service cost input with default value', () => {
      render(<GlobalSidebar />);

      const serviceCostInput = screen.getByLabelText('ARGOS Service Cost (per pump/year)');
      expect(serviceCostInput).toBeInTheDocument();
      expect(serviceCostInput).toHaveValue(2500);
    });

    it('should display formatted service cost when not focused', () => {
      render(<GlobalSidebar />);

      expect(screen.getByText('2 500 €')).toBeInTheDocument();
    });

    it('should display helper text for both inputs', () => {
      render(<GlobalSidebar />);

      expect(screen.getByText('Detection probability (0-100%)')).toBeInTheDocument();
      expect(screen.getByText('Amount in EUR')).toBeInTheDocument();
    });
  });

  describe('detection rate input validation', () => {
    it('should accept valid detection rate within range', async () => {
      const user = userEvent.setup();
      render(<GlobalSidebar />);

      const input = screen.getByLabelText('ARGOS Detection Rate');

      await user.clear(input);
      await user.type(input, '85');
      await user.tab(); // Blur to commit

      expect(useAppStore.getState().globalParams.detectionRate).toBe(85);
    });

    it('should reject detection rate below 0', async () => {
      const user = userEvent.setup();
      render(<GlobalSidebar />);

      const input = screen.getByLabelText('ARGOS Detection Rate');

      await user.clear(input);
      await user.type(input, '-5');
      await user.tab();

      expect(screen.getByText('Rate must be between 0 and 100')).toBeInTheDocument();
      expect(useAppStore.getState().globalParams.detectionRate).toBe(70); // Unchanged
    });

    it('should reject detection rate above 100', async () => {
      const user = userEvent.setup();
      render(<GlobalSidebar />);

      const input = screen.getByLabelText('ARGOS Detection Rate');

      await user.clear(input);
      await user.type(input, '150');
      await user.tab();

      expect(screen.getByText('Rate must be between 0 and 100')).toBeInTheDocument();
      expect(useAppStore.getState().globalParams.detectionRate).toBe(70);
    });

    it('should reject empty detection rate', async () => {
      const user = userEvent.setup();
      render(<GlobalSidebar />);

      const input = screen.getByLabelText('ARGOS Detection Rate');

      await user.clear(input);
      await user.tab();

      expect(screen.getByText('Please enter a detection rate')).toBeInTheDocument();
      expect(useAppStore.getState().globalParams.detectionRate).toBe(70);
    });

    it('should accept boundary values 0 and 100', async () => {
      const user = userEvent.setup();
      render(<GlobalSidebar />);

      const input = screen.getByLabelText('ARGOS Detection Rate');

      // Test 0%
      await user.clear(input);
      await user.type(input, '0');
      await user.tab();
      expect(useAppStore.getState().globalParams.detectionRate).toBe(0);

      // Test 100%
      await user.clear(input);
      await user.type(input, '100');
      await user.tab();
      expect(useAppStore.getState().globalParams.detectionRate).toBe(100);
    });
  });

  describe('service cost input validation', () => {
    it('should accept valid positive service cost', async () => {
      const user = userEvent.setup();
      render(<GlobalSidebar />);

      const input = screen.getByLabelText('ARGOS Service Cost (per pump/year)');

      await user.clear(input);
      await user.type(input, '3000');
      await user.tab();

      expect(useAppStore.getState().globalParams.serviceCostPerPump).toBe(3000);
    });

    it('should reject zero service cost', async () => {
      const user = userEvent.setup();
      render(<GlobalSidebar />);

      const input = screen.getByLabelText('ARGOS Service Cost (per pump/year)');

      await user.clear(input);
      await user.type(input, '0');
      await user.tab();

      expect(screen.getByText('Cost must be greater than 0')).toBeInTheDocument();
      expect(useAppStore.getState().globalParams.serviceCostPerPump).toBe(2500);
    });

    it('should reject negative service cost', async () => {
      const user = userEvent.setup();
      render(<GlobalSidebar />);

      const input = screen.getByLabelText('ARGOS Service Cost (per pump/year)');

      await user.clear(input);
      await user.type(input, '-100');
      await user.tab();

      expect(screen.getByText('Cost must be greater than 0')).toBeInTheDocument();
      expect(useAppStore.getState().globalParams.serviceCostPerPump).toBe(2500);
    });

    it('should reject empty service cost', async () => {
      const user = userEvent.setup();
      render(<GlobalSidebar />);

      const input = screen.getByLabelText('ARGOS Service Cost (per pump/year)');

      await user.clear(input);
      await user.tab();

      expect(screen.getByText('Please enter a service cost')).toBeInTheDocument();
      expect(useAppStore.getState().globalParams.serviceCostPerPump).toBe(2500);
    });

    it('should accept minimum valid value 1', async () => {
      const user = userEvent.setup();
      render(<GlobalSidebar />);

      const input = screen.getByLabelText('ARGOS Service Cost (per pump/year)');

      await user.clear(input);
      await user.type(input, '1');
      await user.tab();

      expect(useAppStore.getState().globalParams.serviceCostPerPump).toBe(1);
    });
  });

  describe('keyboard navigation', () => {
    it('should commit detection rate on Enter key', async () => {
      const user = userEvent.setup();
      render(<GlobalSidebar />);

      const input = screen.getByLabelText('ARGOS Detection Rate');

      await user.clear(input);
      await user.type(input, '80');
      await user.keyboard('{Enter}');

      expect(useAppStore.getState().globalParams.detectionRate).toBe(80);
    });

    it('should cancel detection rate edit on Escape key', async () => {
      const user = userEvent.setup();
      render(<GlobalSidebar />);

      const input = screen.getByLabelText('ARGOS Detection Rate');

      await user.clear(input);
      await user.type(input, '99');
      await user.keyboard('{Escape}');

      expect(input).toHaveValue(70); // Restored to original
      expect(useAppStore.getState().globalParams.detectionRate).toBe(70);
    });

    it('should commit service cost on Enter key', async () => {
      const user = userEvent.setup();
      render(<GlobalSidebar />);

      const input = screen.getByLabelText('ARGOS Service Cost (per pump/year)');

      await user.clear(input);
      await user.type(input, '3500');
      await user.keyboard('{Enter}');

      expect(useAppStore.getState().globalParams.serviceCostPerPump).toBe(3500);
    });

    it('should cancel service cost edit on Escape key', async () => {
      const user = userEvent.setup();
      render(<GlobalSidebar />);

      const input = screen.getByLabelText('ARGOS Service Cost (per pump/year)');

      await user.clear(input);
      await user.type(input, '9999');
      await user.keyboard('{Escape}');

      expect(input).toHaveValue(2500);
      expect(useAppStore.getState().globalParams.serviceCostPerPump).toBe(2500);
    });

    it('should clear error on Escape key', async () => {
      const user = userEvent.setup();
      render(<GlobalSidebar />);

      const input = screen.getByLabelText('ARGOS Detection Rate');

      // Create error
      await user.clear(input);
      await user.type(input, '150');
      await user.tab();
      expect(screen.getByText('Rate must be between 0 and 100')).toBeInTheDocument();

      // Escape should restore value and clear error
      input.focus();
      await user.keyboard('{Escape}');
      expect(screen.queryByText('Rate must be between 0 and 100')).not.toBeInTheDocument();
    });
  });

  describe('Zustand store integration', () => {
    it('should read detection rate from store', () => {
      useAppStore.setState({
        globalParams: {
          detectionRate: 85,
          serviceCostPerPump: 2500
        }
      });

      render(<GlobalSidebar />);

      const input = screen.getByLabelText('ARGOS Detection Rate');
      expect(input).toHaveValue(85);
    });

    it('should read service cost from store', () => {
      useAppStore.setState({
        globalParams: {
          detectionRate: 70,
          serviceCostPerPump: 3000
        }
      });

      render(<GlobalSidebar />);

      const input = screen.getByLabelText('ARGOS Service Cost (per pump/year)');
      expect(input).toHaveValue(3000);
    });
  });

  describe('ARIA attributes and accessibility', () => {
    it('should have complementary role', () => {
      render(<GlobalSidebar />);

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toBeInTheDocument();
    });

    it('should have aria-label in French', () => {
      render(<GlobalSidebar />);

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveAttribute('aria-label', 'Global Parameters');
    });

    it('should have accessible labels for inputs', () => {
      render(<GlobalSidebar />);

      expect(screen.getByLabelText('ARGOS Detection Rate')).toBeInTheDocument();
      expect(screen.getByLabelText('ARGOS Service Cost (per pump/year)')).toBeInTheDocument();
    });

    it('should set aria-invalid when validation fails', async () => {
      const user = userEvent.setup();
      render(<GlobalSidebar />);

      const input = screen.getByLabelText('ARGOS Detection Rate');

      await user.clear(input);
      await user.type(input, '150');
      await user.tab();

      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('responsive layout', () => {
    it('should have 280px width', () => {
      render(<GlobalSidebar />);

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('w-[280px]');
    });

    it('should have white background', () => {
      render(<GlobalSidebar />);

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('bg-white');
    });

    it('should have right border', () => {
      render(<GlobalSidebar />);

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('border-r');
      expect(sidebar).toHaveClass('border-surface-alternate');
    });

    it('should have internal padding', () => {
      render(<GlobalSidebar />);

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('p-6');
    });
  });
});
