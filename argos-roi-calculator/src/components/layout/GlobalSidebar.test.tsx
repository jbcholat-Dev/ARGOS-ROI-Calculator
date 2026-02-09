import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GlobalSidebar } from './GlobalSidebar';
import { useAppStore } from '@/stores/app-store';

describe('GlobalSidebar', () => {
  beforeEach(() => {
    // Reset store to default values before each test
    const store = useAppStore.getState();
    store.globalParams.detectionRate = 70;
    store.globalParams.serviceCostPerPump = 2500;
  });

  describe('rendering', () => {
    it('should render Global Parameters heading', () => {
      render(<GlobalSidebar />);

      expect(screen.getByText('Global Parameters')).toBeInTheDocument();
    });

    // Story 2.9: Detection rate removed from GlobalSidebar (now per-analysis)
    it('should display only service cost (not detection rate)', () => {
      render(<GlobalSidebar />);

      expect(screen.getByText(/Service Cost per Pump:/)).toBeInTheDocument();
      // French locale uses space separator: "2 500"
      expect(screen.getByText(/€2\s500/)).toBeInTheDocument();
      // Detection rate should NOT be displayed
      expect(screen.queryByText(/Detection Rate:/)).not.toBeInTheDocument();
    });

    it('should format service cost with French locale', () => {
      render(<GlobalSidebar />);

      // French formatting uses space as thousands separator
      const formattedCost = screen.getByText(/€2.*500/);
      expect(formattedCost).toBeInTheDocument();
    });
  });

  describe('Zustand store integration', () => {
    // Story 2.9: Detection rate tests removed (now per-analysis)
    it('should read service cost from store selector', () => {
      const store = useAppStore.getState();
      store.globalParams.serviceCostPerPump = 3000;

      render(<GlobalSidebar />);

      // French locale uses space separator: "3 000"
      expect(screen.getByText(/€3\s000/)).toBeInTheDocument();
    });

    it('should update when service cost changes', () => {
      const { rerender } = render(<GlobalSidebar />);
      expect(screen.getByText(/€2\s500/)).toBeInTheDocument();

      const store = useAppStore.getState();
      store.globalParams.serviceCostPerPump = 3500;

      rerender(<GlobalSidebar />);
      expect(screen.getByText(/€3\s500/)).toBeInTheDocument();
    });
  });

  describe('ARIA attributes', () => {
    it('should have complementary role', () => {
      render(<GlobalSidebar />);

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toBeInTheDocument();
    });

    it('should have aria-label', () => {
      render(<GlobalSidebar />);

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveAttribute('aria-label', 'Global Parameters');
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
