import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { NavigationBar } from './NavigationBar';
import { useAppStore } from '@/stores/app-store';
import type { Analysis } from '@/types';

const createTestAnalysis = (id: string, name: string): Analysis => ({
  id,
  name,
  pumpType: 'A3004XN',
  pumpQuantity: 10,
  failureRateMode: 'percentage',
  failureRatePercentage: 10,
  waferType: 'batch',
  waferQuantity: 125,
  waferCost: 5000,
  waferDefectEventsPerYear: 0,
  downtimeDuration: 4,
  downtimeCostPerHour: 1000,
  isBottleneck: false,
  bottleneckMultiplier: 2.0,
  maintenanceStrategy: 'unplanned' as const,
  overhaulCostPerPump: 0,
  pmIntervalMonths: 12,
  argosMtbfExtensionPercent: 15,
  unplannedDespitePM: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

describe('NavigationBar', () => {
  const renderWithRouter = (initialRoute = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <NavigationBar />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    localStorage.removeItem('argos-roi-data');
    useAppStore.setState({
      analyses: [],
      activeAnalysisId: null,
      globalParams: { detectionRate: 70, serviceCostPerPump: 2500 },
      excludedFromGlobal: new Set<string>(),
      unsavedChanges: false,
    });
  });

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

  // Story 4.5.1: Reset All Data button (AC4)
  describe('Reset All Data (Story 4.5.1)', () => {
    it('should render Reset All Data button', () => {
      renderWithRouter();

      expect(screen.getByRole('button', { name: /Reset All Data/i })).toBeInTheDocument();
    });

    it('should open confirmation modal when Reset All Data is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await user.click(screen.getByRole('button', { name: /Reset All Data/i }));

      expect(screen.getByText('Reset all data?')).toBeInTheDocument();
      expect(screen.getByText(/All analyses will be permanently deleted/)).toBeInTheDocument();
    });

    it('should close modal when Cancel is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await user.click(screen.getByRole('button', { name: /Reset All Data/i }));
      expect(screen.getByText('Reset all data?')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /Cancel/i }));
      expect(screen.queryByText('Reset all data?')).not.toBeInTheDocument();
    });

    it('should clear all data when Reset is confirmed', async () => {
      const user = userEvent.setup();

      // Populate store with data
      useAppStore.getState().addAnalysis(createTestAnalysis('reset-1', 'Analysis A'));
      useAppStore.getState().addAnalysis(createTestAnalysis('reset-2', 'Analysis B'));
      useAppStore.getState().updateGlobalParams({ detectionRate: 90 });
      expect(useAppStore.getState().analyses).toHaveLength(2);

      renderWithRouter();

      await user.click(screen.getByRole('button', { name: /Reset All Data/i }));
      await user.click(screen.getByRole('button', { name: /^Reset$/i }));

      // Store should be cleared
      const state = useAppStore.getState();
      expect(state.analyses).toEqual([]);
      expect(state.activeAnalysisId).toBeNull();
      expect(state.globalParams.detectionRate).toBe(70);
    });

    it('should have accessible confirmation modal with aria attributes', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await user.click(screen.getByRole('button', { name: /Reset All Data/i }));

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby');
      expect(dialog).toHaveAttribute('aria-describedby');
    });
  });
});
