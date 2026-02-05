import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NavigationBar } from './NavigationBar';

describe('NavigationBar', () => {
  const renderWithRouter = (initialRoute = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <NavigationBar />
      </MemoryRouter>
    );
  };

  describe('rendering', () => {
    it('should render all navigation items', () => {
      renderWithRouter();

      expect(screen.getByText('Analyses')).toBeInTheDocument();
      expect(screen.getByText('Global Analysis')).toBeInTheDocument();
      expect(screen.getByText('Solutions')).toBeInTheDocument();
    });

    it('should render ARGOS logo placeholder', () => {
      renderWithRouter();

      expect(screen.getByText('ARGOS')).toBeInTheDocument();
    });

    it('should have navigation role', () => {
      renderWithRouter();

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });
  });

  describe('active link highlighting', () => {
    it('should highlight Analyses link when on dashboard route', () => {
      renderWithRouter('/');

      const analysesLink = screen.getByRole('link', { name: 'Analyses' });
      expect(analysesLink).toHaveAttribute('aria-current', 'page');
      expect(analysesLink).toHaveClass('border-pfeiffer-red');
    });

    it('should highlight Global Analysis link when on global route', () => {
      renderWithRouter('/global');

      const globalLink = screen.getByRole('link', { name: 'Global Analysis' });
      expect(globalLink).toHaveAttribute('aria-current', 'page');
      expect(globalLink).toHaveClass('border-pfeiffer-red');
    });

    it('should highlight Solutions link when on solutions route', () => {
      renderWithRouter('/solutions');

      const solutionsLink = screen.getByRole('link', { name: 'Solutions' });
      expect(solutionsLink).toHaveAttribute('aria-current', 'page');
      expect(solutionsLink).toHaveClass('border-pfeiffer-red');
    });

    it('should not highlight inactive links', () => {
      renderWithRouter('/');

      const globalLink = screen.getByRole('link', { name: 'Global Analysis' });
      const solutionsLink = screen.getByRole('link', { name: 'Solutions' });

      expect(globalLink).not.toHaveAttribute('aria-current');
      expect(solutionsLink).not.toHaveAttribute('aria-current');
      expect(globalLink).toHaveClass('text-gray-700');
      expect(solutionsLink).toHaveClass('text-gray-700');
    });
  });

  describe('ARIA attributes', () => {
    it('should set aria-current="page" on active link', () => {
      renderWithRouter('/global');

      const globalLink = screen.getByRole('link', { name: 'Global Analysis' });
      expect(globalLink).toHaveAttribute('aria-current', 'page');
    });

    it('should have proper link roles', () => {
      renderWithRouter();

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(3);
    });
  });

  describe('keyboard navigation', () => {
    it('should be keyboard accessible with Tab', () => {
      renderWithRouter();

      const analysesLink = screen.getByRole('link', { name: 'Analyses' });
      const globalLink = screen.getByRole('link', { name: 'Global Analysis' });
      const solutionsLink = screen.getByRole('link', { name: 'Solutions' });

      expect(analysesLink).not.toHaveAttribute('tabIndex', '-1');
      expect(globalLink).not.toHaveAttribute('tabIndex', '-1');
      expect(solutionsLink).not.toHaveAttribute('tabIndex', '-1');
    });

    it('should have visible focus ring on focus', () => {
      renderWithRouter();

      const analysesLink = screen.getByRole('link', { name: 'Analyses' });
      expect(analysesLink).toHaveClass('focus:ring-2');
      expect(analysesLink).toHaveClass('focus:ring-pfeiffer-red');
    });
  });
});
