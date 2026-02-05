import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Dashboard } from '@/pages/Dashboard';
import { FocusMode } from '@/pages/FocusMode';
import { GlobalAnalysis } from '@/pages/GlobalAnalysis';
import { Solutions } from '@/pages/Solutions';

describe('[ROUTER] Routing Tests', () => {
  describe('Route Navigation - Dashboard', () => {
    it('should render Dashboard component', () => {
      render(<Dashboard />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(
        screen.getByText(/Placeholder for analysis grid/)
      ).toBeInTheDocument();
    });

    it('should have correct Tailwind classes on Dashboard', () => {
      render(<Dashboard />);

      const heading = screen.getByText('Dashboard');
      expect(heading).toHaveClass('text-2xl', 'font-bold');
    });
  });

  describe('Route Navigation - GlobalAnalysis', () => {
    it('should render GlobalAnalysis component', () => {
      render(<GlobalAnalysis />);

      expect(screen.getByText('Global Analysis')).toBeInTheDocument();
      expect(
        screen.getByText(/Placeholder for aggregated view/)
      ).toBeInTheDocument();
    });
  });

  describe('Route Navigation - Solutions', () => {
    it('should render Solutions component', () => {
      render(<Solutions />);

      expect(screen.getByText('Solutions')).toBeInTheDocument();
      expect(
        screen.getByText(/Placeholder for V11 module/)
      ).toBeInTheDocument();
    });
  });

  describe('Route Navigation - FocusMode', () => {
    it('should render FocusMode with route parameter', () => {
      render(
        <MemoryRouter initialEntries={['/analysis/test-123']}>
          <Routes>
            <Route path="/analysis/:id" element={<FocusMode />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Focus Mode')).toBeInTheDocument();
      expect(screen.getByText(/Analysis ID: test-123/)).toBeInTheDocument();
    });

    it('should handle UUID format analysis IDs', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      render(
        <MemoryRouter initialEntries={[`/analysis/${uuid}`]}>
          <Routes>
            <Route path="/analysis/:id" element={<FocusMode />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Focus Mode')).toBeInTheDocument();
      expect(screen.getByText(new RegExp(uuid))).toBeInTheDocument();
    });

    it('should extract and display different route parameters', () => {
      const testId = 'abc-def-123';
      render(
        <MemoryRouter initialEntries={[`/analysis/${testId}`]}>
          <Routes>
            <Route path="/analysis/:id" element={<FocusMode />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText(new RegExp(testId))).toBeInTheDocument();
    });

    it('should handle short IDs', () => {
      render(
        <MemoryRouter initialEntries={['/analysis/1']}>
          <Routes>
            <Route path="/analysis/:id" element={<FocusMode />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Focus Mode')).toBeInTheDocument();
      expect(screen.getByText(/Analysis ID: 1/)).toBeInTheDocument();
    });
  });

  describe('Full App Route Structure', () => {
    it('should support all routes defined in App.tsx', () => {
      // Test that all four routes can be rendered via MemoryRouter
      const routes = [
        { path: '/', component: Dashboard },
        { path: '/analysis/test', component: FocusMode },
        { path: '/global', component: GlobalAnalysis },
        { path: '/solutions', component: Solutions },
      ];

      // Just verify no errors when rendering each route
      routes.forEach(({ path, component: Component }) => {
        const { unmount } = render(
          <MemoryRouter initialEntries={[path]}>
            <Routes>
              <Route
                path={path.includes(':') ? '/analysis/:id' : path}
                element={<Component />}
              />
            </Routes>
          </MemoryRouter>
        );
        unmount();
      });
    });
  });

  describe('TypeScript Type Safety', () => {
    it('should handle typed useParams in FocusMode', () => {
      render(
        <MemoryRouter initialEntries={['/analysis/valid-id']}>
          <Routes>
            <Route path="/analysis/:id" element={<FocusMode />} />
          </Routes>
        </MemoryRouter>
      );

      // Should not throw error, should render successfully
      expect(screen.getByText('Focus Mode')).toBeInTheDocument();
    });
  });
});
