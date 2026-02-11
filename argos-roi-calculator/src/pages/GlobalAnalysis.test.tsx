import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { GlobalAnalysis } from './GlobalAnalysis';
import { useAppStore } from '@/stores/app-store';
import type { Analysis } from '@/types';

const mockNavigate = vi.hoisted(() => vi.fn());
vi.mock('react-router-dom', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...mod,
    useNavigate: () => mockNavigate,
  };
});

function createTestAnalysis(overrides: Partial<Analysis> = {}): Analysis {
  return {
    id: crypto.randomUUID(),
    name: 'Test Analysis',
    pumpType: 'HiPace (turbo)',
    pumpQuantity: 10,
    failureRateMode: 'percentage',
    failureRatePercentage: 10,
    waferType: 'batch',
    waferQuantity: 125,
    waferCost: 8000,
    downtimeDuration: 6,
    downtimeCostPerHour: 500,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('GlobalAnalysis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.setState({
      analyses: [],
      activeAnalysisId: null,
      globalParams: { detectionRate: 70, serviceCostPerPump: 2500 },
      unsavedChanges: false,
    });
  });

  const renderPage = () => {
    return render(
      <MemoryRouter initialEntries={['/global']}>
        <GlobalAnalysis />
      </MemoryRouter>,
    );
  };

  describe('page heading and title', () => {
    it('renders h1 heading "Global Analysis"', () => {
      renderPage();

      expect(screen.getByRole('heading', { level: 1, name: 'Global Analysis' })).toBeInTheDocument();
    });

    it('sets document title correctly', () => {
      renderPage();

      expect(document.title).toBe('Global Analysis — ARGOS ROI Calculator');
    });
  });

  describe('empty state', () => {
    it('renders placeholder message when 0 analyses', () => {
      renderPage();

      expect(screen.getByText('No analyses yet — create one first')).toBeInTheDocument();
    });

    it('renders CTA button "Create Analysis"', () => {
      renderPage();

      expect(screen.getByRole('button', { name: 'Create Analysis' })).toBeInTheDocument();
    });

    it('CTA button navigates to Dashboard (/)', async () => {
      const user = userEvent.setup();
      renderPage();

      const button = screen.getByRole('button', { name: 'Create Analysis' });
      await user.click(button);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('does not render GlobalAnalysisView when 0 analyses', () => {
      renderPage();

      expect(screen.queryByRole('region', { name: 'Aggregated ROI metrics' })).not.toBeInTheDocument();
    });
  });

  describe('with analyses', () => {
    it('renders GlobalAnalysisView when analyses exist', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis()],
      });

      renderPage();

      expect(screen.getByRole('region', { name: 'Aggregated ROI metrics' })).toBeInTheDocument();
    });

    it('does not render placeholder when analyses exist', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis()],
      });

      renderPage();

      expect(screen.queryByText('No analyses yet — create one first')).not.toBeInTheDocument();
    });
  });
});
