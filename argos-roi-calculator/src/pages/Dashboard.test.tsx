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
      expect(screen.getByText('No analyses created')).toBeInTheDocument();
    });

    it('renders empty state subheading with call-to-action text', () => {
      renderDashboard();
      expect(
        screen.getByText('Create your first analysis to get started'),
      ).toBeInTheDocument();
    });

    it('renders NewAnalysisButton in empty state', () => {
      renderDashboard();
      expect(
        screen.getByRole('button', { name: 'New Analysis' }),
      ).toBeInTheDocument();
    });

    it('does not render empty state when analyses exist', () => {
      useAppStore.setState({ analyses: [createTestAnalysis()] });
      renderDashboard();
      expect(screen.queryByText('No analyses created')).not.toBeInTheDocument();
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
        screen.getByRole('button', { name: 'New Analysis' }),
      ).toBeInTheDocument();
    });
  });

  describe('Analysis Grid (Story 3.1)', () => {
    it('renders empty state when no analyses', () => {
      renderDashboard();
      expect(screen.getByText('No analyses created')).toBeInTheDocument();
    });

    it('renders AnalysisCard grid when analyses exist', () => {
      const analysis = createTestAnalysis({
        name: 'CVD Chamber 04',
        pumpQuantity: 10,
      });
      useAppStore.setState({ analyses: [analysis] });
      renderDashboard();

      expect(screen.getByText('CVD Chamber 04')).toBeInTheDocument();
      expect(screen.queryByText('No analyses created')).not.toBeInTheDocument();
    });

    it('renders correct number of cards (match analyses count)', () => {
      const analyses = [
        createTestAnalysis({ id: '1', name: 'Analysis 1' }),
        createTestAnalysis({ id: '2', name: 'Analysis 2' }),
        createTestAnalysis({ id: '3', name: 'Analysis 3' }),
      ];
      useAppStore.setState({ analyses });
      renderDashboard();

      expect(screen.getByText('Analysis 1')).toBeInTheDocument();
      expect(screen.getByText('Analysis 2')).toBeInTheDocument();
      expect(screen.getByText('Analysis 3')).toBeInTheDocument();
    });

    it('highlights active analysis card', () => {
      const analyses = [
        createTestAnalysis({ id: 'active-id', name: 'Active Analysis' }),
        createTestAnalysis({ id: 'inactive-id', name: 'Inactive Analysis' }),
      ];
      useAppStore.setState({
        analyses,
        activeAnalysisId: 'active-id',
      });
      renderDashboard();

      // Both cards should render
      expect(screen.getByText('Active Analysis')).toBeInTheDocument();
      expect(screen.getByText('Inactive Analysis')).toBeInTheDocument();

      // Verify active card has red border (border-primary border-2)
      const activeCard = screen.getByText('Active Analysis').closest('[class*="p-6"]');
      expect(activeCard?.className).toMatch(/border-primary/);
      expect(activeCard?.className).toMatch(/border-2/);

      // Verify inactive card does NOT have active border
      const inactiveCard = screen.getByText('Inactive Analysis').closest('[class*="p-6"]');
      expect(inactiveCard?.className).not.toMatch(/border-primary/);
    });

    it('grid uses responsive columns (check className presence)', () => {
      useAppStore.setState({ analyses: [createTestAnalysis()] });
      const { container } = renderDashboard();

      // Grid should have responsive classes
      const grid = container.querySelector('[class*="grid"]');
      expect(grid).toBeInTheDocument();
      expect(grid?.className).toMatch(/grid/);
    });

    it('shows PlaceholderMessage when empty', () => {
      renderDashboard();
      expect(screen.getByText('No analyses created')).toBeInTheDocument();
    });

    it('shows NewAnalysisButton when empty', () => {
      renderDashboard();
      expect(screen.getByRole('button', { name: 'New Analysis' })).toBeInTheDocument();
    });
  });

  describe('Modal Integration', () => {
    it('opens modal when NewAnalysisButton is clicked', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(screen.getByRole('button', { name: 'New Analysis' }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('closes modal when Annuler is clicked', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(screen.getByRole('button', { name: 'New Analysis' }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Card Navigation (Story 3.2)', () => {
    it('navigates to Focus Mode when card is clicked', async () => {
      const analysis = createTestAnalysis({
        id: 'test-123',
        name: 'CVD Chamber',
        pumpQuantity: 10,
      });
      useAppStore.setState({ analyses: [analysis], activeAnalysisId: null });
      const user = userEvent.setup();
      renderDashboard();

      const card = screen.getByLabelText('Analysis CVD Chamber');
      await user.click(card);

      expect(mockNavigate).toHaveBeenCalledWith('/analysis/test-123');
    });

    it('sets analysis as active when card is clicked', async () => {
      const analysis = createTestAnalysis({
        id: 'test-123',
        name: 'Test Analysis',
      });
      useAppStore.setState({ analyses: [analysis], activeAnalysisId: null });
      const user = userEvent.setup();
      renderDashboard();

      const card = screen.getByLabelText('Analysis Test Analysis');
      await user.click(card);

      const state = useAppStore.getState();
      expect(state.activeAnalysisId).toBe('test-123');
    });

    it('navigates with correct ID for each card', async () => {
      const analyses = [
        createTestAnalysis({ id: 'id-1', name: 'Analysis 1' }),
        createTestAnalysis({ id: 'id-2', name: 'Analysis 2' }),
        createTestAnalysis({ id: 'id-3', name: 'Analysis 3' }),
      ];
      useAppStore.setState({ analyses, activeAnalysisId: null });
      const user = userEvent.setup();
      renderDashboard();

      const card2 = screen.getByLabelText('Analysis Analysis 2');
      await user.click(card2);

      expect(mockNavigate).toHaveBeenCalledWith('/analysis/id-2');
      expect(useAppStore.getState().activeAnalysisId).toBe('id-2');
    });

    it('supports keyboard navigation (focus + Enter)', async () => {
      const analysis = createTestAnalysis({
        id: 'test-123',
        name: 'Test Analysis',
      });
      useAppStore.setState({ analyses: [analysis], activeAnalysisId: null });
      const user = userEvent.setup();
      renderDashboard();

      // Focus the card
      const card = screen.getByLabelText('Analysis Test Analysis');
      card.focus();
      expect(document.activeElement).toBe(card);

      // Press Enter
      await user.keyboard('{Enter}');

      expect(mockNavigate).toHaveBeenCalledWith('/analysis/test-123');
    });

    it('supports Space key navigation', async () => {
      const analysis = createTestAnalysis({
        id: 'test-123',
        name: 'Test Analysis',
      });
      useAppStore.setState({ analyses: [analysis], activeAnalysisId: null });
      const user = userEvent.setup();
      renderDashboard();

      const card = screen.getByLabelText('Analysis Test Analysis');
      card.focus();
      await user.keyboard(' ');

      expect(mockNavigate).toHaveBeenCalledWith('/analysis/test-123');
    });
  });

  describe('Analysis Creation (handleCreateAnalysis)', () => {
    it('adds analysis to store with correct structure', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(screen.getByRole('button', { name: 'New Analysis' }));
      const input = screen.getByLabelText('Analysis Name');
      await user.type(input, 'Poly Etch - Chamber 04');
      await user.click(screen.getByRole('button', { name: 'Create' }));

      const state = useAppStore.getState();
      expect(state.analyses).toHaveLength(1);
      expect(state.analyses[0].name).toBe('Poly Etch - Chamber 04');
    });

    it('navigates to Focus Mode with correct analysis ID', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(screen.getByRole('button', { name: 'New Analysis' }));
      const input = screen.getByLabelText('Analysis Name');
      await user.type(input, 'Test Process');
      await user.click(screen.getByRole('button', { name: 'Create' }));

      const state = useAppStore.getState();
      const analysisId = state.analyses[0].id;
      expect(mockNavigate).toHaveBeenCalledWith(`/analysis/${analysisId}`);
    });

    it('closes modal after successful creation', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(screen.getByRole('button', { name: 'New Analysis' }));
      const input = screen.getByLabelText('Analysis Name');
      await user.type(input, 'Test Process');
      await user.click(screen.getByRole('button', { name: 'Create' }));

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('creates analysis with valid UUID format', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(screen.getByRole('button', { name: 'New Analysis' }));
      const input = screen.getByLabelText('Analysis Name');
      await user.type(input, 'Test');
      await user.click(screen.getByRole('button', { name: 'Create' }));

      const state = useAppStore.getState();
      expect(state.analyses[0].id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it('trims analysis name on creation', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(screen.getByRole('button', { name: 'New Analysis' }));
      const input = screen.getByLabelText('Analysis Name');
      await user.type(input, '  Poly Etch  ');
      await user.click(screen.getByRole('button', { name: 'Create' }));

      const state = useAppStore.getState();
      expect(state.analyses[0].name).toBe('Poly Etch');
    });

    it('sets correct default values for new analysis', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(screen.getByRole('button', { name: 'New Analysis' }));
      const input = screen.getByLabelText('Analysis Name');
      await user.type(input, 'Test');
      await user.click(screen.getByRole('button', { name: 'Create' }));

      const analysis = useAppStore.getState().analyses[0];
      expect(analysis.pumpType).toBe('');
      expect(analysis.pumpQuantity).toBe(0);
      expect(analysis.failureRateMode).toBe('percentage');
      expect(analysis.failureRatePercentage).toBe(10);
      expect(analysis.waferType).toBe('mono');
      expect(analysis.waferQuantity).toBe(1);
      expect(analysis.waferCost).toBe(0);
      expect(analysis.downtimeDuration).toBe(0);
      expect(analysis.downtimeCostPerHour).toBe(0);
    });

    it('sets new analysis as activeAnalysisId in store', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(screen.getByRole('button', { name: 'New Analysis' }));
      const input = screen.getByLabelText('Analysis Name');
      await user.type(input, 'Test');
      await user.click(screen.getByRole('button', { name: 'Create' }));

      const state = useAppStore.getState();
      expect(state.activeAnalysisId).toBe(state.analyses[0].id);
    });
  });
});
