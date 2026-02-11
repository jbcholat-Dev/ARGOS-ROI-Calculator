import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { useAppStore } from '@/stores/app-store';

describe('AppLayout', () => {
  beforeEach(() => {
    useAppStore.setState({
      analyses: [
        {
          id: 'test-1',
          name: 'Poly Etch',
          pumpType: 'A3004XN',
          pumpQuantity: 10,
          failureRateMode: 'percentage',
          failureRatePercentage: 10,
          waferType: 'batch',
          waferQuantity: 125,
          waferCost: 8000,
          downtimeDuration: 6,
          downtimeCostPerHour: 500,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      activeAnalysisId: 'test-1',
      globalParams: {
        detectionRate: 70,
        serviceCostPerPump: 2500,
      },
      unsavedChanges: false,
    });
  });

  const renderWithRouter = (children: React.ReactNode, route = '/') => {
    return render(
      <MemoryRouter initialEntries={[route]}>
        <AppLayout>{children}</AppLayout>
      </MemoryRouter>
    );
  };

  describe('rendering', () => {
    it('should render NavigationBar', () => {
      renderWithRouter(<div>Test Content</div>);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByText('ARGOS')).toBeInTheDocument();
    });

    it('should render children in main content area', () => {
      renderWithRouter(<div>Test Content</div>);

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should render all layout components together', () => {
      renderWithRouter(
        <div>
          <h1>Page Title</h1>
          <p>Page content goes here</p>
        </div>
      );

      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('complementary')).toBeInTheDocument();
      expect(screen.getByText('Page Title')).toBeInTheDocument();
      expect(screen.getByText('Page content goes here')).toBeInTheDocument();
    });
  });

  describe('conditional sidebar rendering', () => {
    it('should render GlobalSidebar on Dashboard route', () => {
      renderWithRouter(<div>Dashboard</div>, '/');

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveAttribute('aria-label', 'Global Parameters');
    });

    it('should render FocusSidebar on Focus Mode route', () => {
      renderWithRouter(<div>Focus Mode</div>, '/analysis/test-1');

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveAttribute('aria-label', 'Analysis Navigation');
    });

    it('should render GlobalSidebar on Global Analysis route', () => {
      renderWithRouter(<div>Global</div>, '/global');

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveAttribute('aria-label', 'Global Parameters');
    });

    it('should render GlobalSidebar on Solutions route', () => {
      renderWithRouter(<div>Solutions</div>, '/solutions');

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveAttribute('aria-label', 'Global Parameters');
    });

    // Note: ComparisonView does not use AppLayout (has its own full-screen layout).
    // Sidebar suppression is achieved by not wrapping in AppLayout, not by route detection.
  });

  describe('semantic HTML', () => {
    it('should use nav element for navigation', () => {
      renderWithRouter(<div>Test</div>);

      const nav = screen.getByRole('navigation');
      expect(nav.tagName).toBe('NAV');
    });

    it('should use aside element for sidebar', () => {
      renderWithRouter(<div>Test</div>);

      const sidebar = screen.getByRole('complementary');
      expect(sidebar.tagName).toBe('ASIDE');
    });

    it('should use main element for content area', () => {
      renderWithRouter(<div>Test</div>);

      const main = screen.getByRole('main');
      expect(main.tagName).toBe('MAIN');
    });
  });

  describe('ARIA landmarks', () => {
    it('should have navigation landmark', () => {
      renderWithRouter(<div>Test</div>);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should have complementary landmark for GlobalSidebar on Dashboard', () => {
      renderWithRouter(<div>Test</div>, '/');

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveAttribute('aria-label', 'Global Parameters');
    });

    it('should have complementary landmark for FocusSidebar on Focus Mode', () => {
      renderWithRouter(<div>Test</div>, '/analysis/test-1');

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveAttribute('aria-label', 'Analysis Navigation');
    });

    it('should have main landmark with aria-label', () => {
      renderWithRouter(<div>Test</div>);

      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('aria-label');
    });
  });

  describe('layout structure', () => {
    it('should have canvas background on main content', () => {
      renderWithRouter(<div>Test</div>);

      const main = screen.getByRole('main');
      expect(main).toHaveClass('bg-surface-canvas');
    });

    it('should have proper spacing and padding', () => {
      renderWithRouter(<div>Test</div>);

      const main = screen.getByRole('main');
      expect(main).toHaveClass('p-6');
    });
  });
});
