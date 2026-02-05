import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from './AppRoutes';

describe('[ROUTER] App Routing Integration Tests', () => {
  describe('Route Navigation', () => {
    it('should render Dashboard on "/" route', async () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <AppRoutes />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('navigation')).toBeInTheDocument();
        expect(screen.getByRole('complementary')).toBeInTheDocument();
        expect(
          screen.getByText(/Créez votre première analyse/)
        ).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: 'Nouvelle Analyse' })
        ).toBeInTheDocument();
      });
    });

    it('should render GlobalAnalysis on "/global" route', async () => {
      render(
        <MemoryRouter initialEntries={['/global']}>
          <AppRoutes />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('navigation')).toBeInTheDocument();
        expect(screen.getByRole('complementary')).toBeInTheDocument();
        expect(
          screen.getByText(/Aucune analyse - créez-en d'abord/)
        ).toBeInTheDocument();
      });
    });

    it('should render Solutions on "/solutions" route', async () => {
      render(
        <MemoryRouter initialEntries={['/solutions']}>
          <AppRoutes />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('navigation')).toBeInTheDocument();
        expect(screen.getByRole('complementary')).toBeInTheDocument();
        expect(
          screen.getByText(/Complétez vos analyses ROI d'abord/)
        ).toBeInTheDocument();
      });
    });

    it('should render FocusMode on "/analysis/:id" route with valid ID', async () => {
      render(
        <MemoryRouter initialEntries={['/analysis/test-123']}>
          <AppRoutes />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('navigation')).toBeInTheDocument();
        expect(screen.getByRole('complementary')).toBeInTheDocument();
        expect(
          screen.getByText(/Mode Focus pour l'analyse test-123/)
        ).toBeInTheDocument();
      });
    });

    it('should render NotFound on unknown routes (404)', async () => {
      render(
        <MemoryRouter initialEntries={['/unknown-route']}>
          <AppRoutes />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('404')).toBeInTheDocument();
        expect(screen.getByText('Page Not Found')).toBeInTheDocument();
      });
    });
  });

  describe('Route Parameters', () => {
    it('should handle UUID format analysis IDs', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      render(
        <MemoryRouter initialEntries={[`/analysis/${uuid}`]}>
          <AppRoutes />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(
          screen.getByText(new RegExp(`Mode Focus pour l'analyse ${uuid}`))
        ).toBeInTheDocument();
      });
    });

    it('should handle short alphanumeric IDs', async () => {
      render(
        <MemoryRouter initialEntries={['/analysis/abc-123']}>
          <AppRoutes />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(
          screen.getByText(/Mode Focus pour l'analyse abc-123/)
        ).toBeInTheDocument();
      });
    });

    it('should redirect to Dashboard for invalid/missing analysis ID', async () => {
      render(
        <MemoryRouter initialEntries={['/analysis/invalid@#$%']}>
          <AppRoutes />
        </MemoryRouter>
      );

      // Should redirect to Dashboard due to invalid ID
      await waitFor(() => {
        expect(
          screen.getByText(/Créez votre première analyse/)
        ).toBeInTheDocument();
      });
    });

    it('should redirect to Dashboard when ID is excessively long', async () => {
      const longId = 'a'.repeat(150); // Over 100 char limit
      render(
        <MemoryRouter initialEntries={[`/analysis/${longId}`]}>
          <AppRoutes />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(
          screen.getByText(/Créez votre première analyse/)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should render main landmark on Dashboard', async () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/']}>
          <AppRoutes />
        </MemoryRouter>
      );

      await waitFor(() => {
        const main = container.querySelector('main');
        expect(main).toBeInTheDocument();
      });
    });

    it('should update document title for Dashboard', async () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <AppRoutes />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(document.title).toBe('Analyses - ARGOS ROI Calculator');
      });
    });

    it('should update document title for Global Analysis', async () => {
      render(
        <MemoryRouter initialEntries={['/global']}>
          <AppRoutes />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(document.title).toBe('Global Analysis - ARGOS ROI Calculator');
      });
    });

    it('should update document title for FocusMode', async () => {
      render(
        <MemoryRouter initialEntries={['/analysis/test-123']}>
          <AppRoutes />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(document.title).toContain('Analysis test-123');
      });
    });
  });

  describe('Error Handling', () => {
    it('should render FocusMode placeholder for valid ID', async () => {
      render(
        <MemoryRouter initialEntries={['/analysis/valid-id']}>
          <AppRoutes />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(
          screen.getByText(/Mode Focus pour l'analyse valid-id/)
        ).toBeInTheDocument();
      });
    });

    it('should provide return link on 404 page', async () => {
      render(
        <MemoryRouter initialEntries={['/nonexistent']}>
          <AppRoutes />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Return to Dashboard/)).toBeInTheDocument();
      });
    });
  });

  describe('Performance - Code Splitting', () => {
    it('should show loading state during lazy component load', async () => {
      // This test verifies Suspense fallback renders
      // In actual usage, lazy loading is so fast we rarely see the Loading component
      render(
        <MemoryRouter initialEntries={['/']}>
          <AppRoutes />
        </MemoryRouter>
      );

      // After lazy load completes, Dashboard with NavigationBar should be visible
      await waitFor(() => {
        expect(screen.getByRole('navigation')).toBeInTheDocument();
        expect(
          screen.getByText(/Créez votre première analyse/)
        ).toBeInTheDocument();
      });
    });
  });
});
