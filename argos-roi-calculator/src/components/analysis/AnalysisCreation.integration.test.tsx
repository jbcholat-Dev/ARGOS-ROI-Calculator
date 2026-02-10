import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Dashboard } from '@/pages/Dashboard';
import { useAppStore } from '@/stores/app-store';

// Mock useNavigate while keeping MemoryRouter functional
const mockNavigate = vi.hoisted(() => vi.fn());
vi.mock('react-router-dom', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...mod,
    useNavigate: () => mockNavigate,
  };
});

describe('Analysis Creation - Integration Tests', () => {
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

  it('completes happy path: Dashboard → Button → Modal → Create → Navigate', async () => {
    const user = userEvent.setup();
    renderDashboard();

    // 1. Verify empty state on Dashboard
    expect(screen.getByText('No analyses created')).toBeInTheDocument();

    // 2. Click "New Analysis" button
    await user.click(screen.getByRole('button', { name: 'New Analysis' }));

    // 3. Modal opens with correct title
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // 4. Type analysis name
    const input = screen.getByLabelText('Analysis Name');
    await user.type(input, 'Poly Etch - Chamber 04');

    // 5. Click "Create"
    await user.click(screen.getByRole('button', { name: 'Create' }));

    // 6. Analysis added to store with correct data
    const state = useAppStore.getState();
    expect(state.analyses).toHaveLength(1);
    expect(state.analyses[0].name).toBe('Poly Etch - Chamber 04');
    expect(state.analyses[0].id).toBeTruthy();
    expect(state.activeAnalysisId).toBe(state.analyses[0].id);

    // 7. Navigation called with correct Focus Mode URL
    expect(mockNavigate).toHaveBeenCalledWith(`/analysis/${state.analyses[0].id}`);

    // 8. Modal closed
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('handles validation flow: error → correct → submit', async () => {
    const user = userEvent.setup();
    renderDashboard();

    // 1. Open modal
    await user.click(screen.getByRole('button', { name: 'New Analysis' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // 2. Click "Create" without entering name
    await user.click(screen.getByRole('button', { name: 'Create' }));

    // 3. Error message displays
    expect(screen.getByText(/Analysis name is required/)).toBeInTheDocument();

    // 4. Modal remains open
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // 5. No analysis created
    expect(useAppStore.getState().analyses).toHaveLength(0);

    // 6. Enter valid name
    const input = screen.getByLabelText('Analysis Name');
    await user.type(input, 'Valid Name');

    // 7. Error clears
    expect(screen.queryByText(/Analysis name is required/)).not.toBeInTheDocument();

    // 8. Click "Create" - success
    await user.click(screen.getByRole('button', { name: 'Create' }));
    expect(useAppStore.getState().analyses).toHaveLength(1);
    expect(useAppStore.getState().analyses[0].name).toBe('Valid Name');
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('handles cancel flow: open → type → cancel → no creation', async () => {
    const user = userEvent.setup();
    renderDashboard();

    // 1. Open modal
    await user.click(screen.getByRole('button', { name: 'New Analysis' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // 2. Enter partial name
    const input = screen.getByLabelText('Analysis Name');
    await user.type(input, 'Partial Name');

    // 3. Click "Cancel"
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    // 4. Modal closes
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // 5. No analysis created
    expect(useAppStore.getState().analyses).toHaveLength(0);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('handles Escape key cancel during input', async () => {
    const user = userEvent.setup();
    renderDashboard();

    // Open modal and type
    await user.click(screen.getByRole('button', { name: 'New Analysis' }));
    const input = screen.getByLabelText('Analysis Name');
    await user.type(input, 'Some Input');

    // Press Escape
    await user.keyboard('{Escape}');

    // Modal closes, no analysis created
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(useAppStore.getState().analyses).toHaveLength(0);
  });

  it('verifies barrel exports are accessible', async () => {
    // Verify components can be imported from barrel
    const { NewAnalysisButton, AnalysisCreationModal } = await import(
      '@/components/analysis'
    );
    expect(NewAnalysisButton).toBeDefined();
    expect(AnalysisCreationModal).toBeDefined();
  });
});
