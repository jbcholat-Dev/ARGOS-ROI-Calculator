import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Dashboard } from './Dashboard';
import { useAppStore } from '@/stores/app-store';
import type { Analysis } from '@/types';

// Mock useNavigate while keeping the rest of react-router-dom intact
const mockNavigate = vi.hoisted(() => vi.fn());
vi.mock('react-router-dom', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...mod,
    useNavigate: () => mockNavigate,
  };
});

const createTestAnalysis = (overrides?: Partial<Analysis>): Analysis => ({
  id: 'test-id-1',
  name: 'Test Analysis',
  pumpType: '',
  pumpQuantity: 0,
  failureRateMode: 'percentage',
  failureRatePercentage: 0,
  waferType: 'mono',
  waferQuantity: 1,
  waferCost: 0,
  downtimeDuration: 0,
  downtimeCostPerHour: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.setState({
      analyses: [],
      activeAnalysisId: null,
      globalParams: { detectionRate: 70, serviceCostPerPump: 2500 },
      unsavedChanges: false,
    });
  });

  const renderDashboard = () => {
    return render(
      <MemoryRouter initialEntries={['/']}>
        <Dashboard />
      </MemoryRouter>,
    );
  };

  describe('Empty State', () => {
    it('renders empty state heading when no analyses exist', () => {
      renderDashboard();
      expect(screen.getByText('Aucune analyse créée')).toBeInTheDocument();
    });

    it('renders empty state subheading with call-to-action text', () => {
      renderDashboard();
      expect(
        screen.getByText('Créez votre première analyse pour commencer'),
      ).toBeInTheDocument();
    });

    it('renders NewAnalysisButton in empty state', () => {
      renderDashboard();
      expect(
        screen.getByRole('button', { name: 'Nouvelle Analyse' }),
      ).toBeInTheDocument();
    });

    it('does not render empty state when analyses exist', () => {
      useAppStore.setState({ analyses: [createTestAnalysis()] });
      renderDashboard();
      expect(screen.queryByText('Aucune analyse créée')).not.toBeInTheDocument();
    });

    it('renders icon in empty state', () => {
      renderDashboard();
      const svg = document.querySelector('svg[aria-hidden="true"]');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('With Analyses State', () => {
    it('renders NewAnalysisButton in top-right when analyses exist', () => {
      useAppStore.setState({ analyses: [createTestAnalysis()] });
      renderDashboard();
      expect(
        screen.getByRole('button', { name: 'Nouvelle Analyse' }),
      ).toBeInTheDocument();
    });
  });

  describe('Modal Integration', () => {
    it('opens modal when NewAnalysisButton is clicked', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(screen.getByRole('button', { name: 'Nouvelle Analyse' }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('closes modal when Annuler is clicked', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(screen.getByRole('button', { name: 'Nouvelle Analyse' }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Annuler' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Analysis Creation (handleCreateAnalysis)', () => {
    it('adds analysis to store with correct structure', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(screen.getByRole('button', { name: 'Nouvelle Analyse' }));
      const input = screen.getByLabelText('Nom du process');
      await user.type(input, 'Poly Etch - Chamber 04');
      await user.click(screen.getByRole('button', { name: 'Créer' }));

      const state = useAppStore.getState();
      expect(state.analyses).toHaveLength(1);
      expect(state.analyses[0].name).toBe('Poly Etch - Chamber 04');
    });

    it('navigates to Focus Mode with correct analysis ID', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(screen.getByRole('button', { name: 'Nouvelle Analyse' }));
      const input = screen.getByLabelText('Nom du process');
      await user.type(input, 'Test Process');
      await user.click(screen.getByRole('button', { name: 'Créer' }));

      const state = useAppStore.getState();
      const analysisId = state.analyses[0].id;
      expect(mockNavigate).toHaveBeenCalledWith(`/analysis/${analysisId}`);
    });

    it('closes modal after successful creation', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(screen.getByRole('button', { name: 'Nouvelle Analyse' }));
      const input = screen.getByLabelText('Nom du process');
      await user.type(input, 'Test Process');
      await user.click(screen.getByRole('button', { name: 'Créer' }));

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('creates analysis with valid UUID format', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(screen.getByRole('button', { name: 'Nouvelle Analyse' }));
      const input = screen.getByLabelText('Nom du process');
      await user.type(input, 'Test');
      await user.click(screen.getByRole('button', { name: 'Créer' }));

      const state = useAppStore.getState();
      expect(state.analyses[0].id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it('trims analysis name on creation', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(screen.getByRole('button', { name: 'Nouvelle Analyse' }));
      const input = screen.getByLabelText('Nom du process');
      await user.type(input, '  Poly Etch  ');
      await user.click(screen.getByRole('button', { name: 'Créer' }));

      const state = useAppStore.getState();
      expect(state.analyses[0].name).toBe('Poly Etch');
    });

    it('sets correct default values for new analysis', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(screen.getByRole('button', { name: 'Nouvelle Analyse' }));
      const input = screen.getByLabelText('Nom du process');
      await user.type(input, 'Test');
      await user.click(screen.getByRole('button', { name: 'Créer' }));

      const analysis = useAppStore.getState().analyses[0];
      expect(analysis.pumpType).toBe('');
      expect(analysis.pumpQuantity).toBe(0);
      expect(analysis.failureRateMode).toBe('percentage');
      expect(analysis.failureRatePercentage).toBe(0);
      expect(analysis.waferType).toBe('mono');
      expect(analysis.waferQuantity).toBe(1);
      expect(analysis.waferCost).toBe(0);
      expect(analysis.downtimeDuration).toBe(0);
      expect(analysis.downtimeCostPerHour).toBe(0);
    });

    it('sets new analysis as activeAnalysisId in store', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(screen.getByRole('button', { name: 'Nouvelle Analyse' }));
      const input = screen.getByLabelText('Nom du process');
      await user.type(input, 'Test');
      await user.click(screen.getByRole('button', { name: 'Créer' }));

      const state = useAppStore.getState();
      expect(state.activeAnalysisId).toBe(state.analyses[0].id);
    });
  });
});
