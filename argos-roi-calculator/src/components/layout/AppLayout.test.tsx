import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppLayout } from './AppLayout';

describe('AppLayout', () => {
  const renderWithRouter = (children: React.ReactNode) => {
    return render(
      <MemoryRouter>
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

    it('should render GlobalSidebar', () => {
      renderWithRouter(<div>Test Content</div>);

      expect(screen.getByRole('complementary')).toBeInTheDocument();
      expect(screen.getByText('Global Parameters')).toBeInTheDocument();
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

      // Navigation
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      // Sidebar
      expect(screen.getByRole('complementary')).toBeInTheDocument();
      // Main content
      expect(screen.getByText('Page Title')).toBeInTheDocument();
      expect(screen.getByText('Page content goes here')).toBeInTheDocument();
    });
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

    it('should have complementary landmark for sidebar', () => {
      renderWithRouter(<div>Test</div>);

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveAttribute('aria-label', 'Global Parameters');
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
