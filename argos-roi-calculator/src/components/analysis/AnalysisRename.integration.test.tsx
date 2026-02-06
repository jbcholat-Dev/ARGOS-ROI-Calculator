import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { FocusMode } from '@/pages/FocusMode';
import { useAppStore } from '@/stores/app-store';
import { ActiveIndicator } from './ActiveIndicator';
import type { Analysis } from '@/types';

// Mock EquipmentInputs to keep integration tests focused on rename
vi.mock('@/components/analysis/EquipmentInputs', () => ({
  EquipmentInputs: () => <div data-testid="equipment-inputs" />,
}));

// Mock FailureRateInput
vi.mock('@/components/analysis/FailureRateInput', () => ({
  FailureRateInput: () => <div data-testid="failure-rate-input" />,
}));

// Mock WaferInputs
vi.mock('@/components/analysis/WaferInputs', () => ({
  WaferInputs: () => <div data-testid="wafer-inputs" />,
}));

// Mock DowntimeInputs
vi.mock('@/components/analysis/DowntimeInputs', () => ({
  DowntimeInputs: () => <div data-testid="downtime-inputs" />,
}));

const createTestAnalysis = (overrides: Partial<Analysis> = {}): Analysis => ({
  id: 'analysis-1',
  name: 'Process A',
  pumpType: 'A3004XN',
  pumpQuantity: 2,
  failureRateMode: 'percentage',
  failureRatePercentage: 5,
  waferType: 'batch',
  waferQuantity: 125,
  waferCost: 500,
  downtimeDuration: 8,
  downtimeCostPerHour: 1000,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const renderFocusMode = (analysisId: string) => {
  return render(
    <MemoryRouter initialEntries={[`/analysis/${analysisId}`]}>
      <Routes>
        <Route path="/analysis/:id" element={<FocusMode />} />
        <Route path="/" element={<div>Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('Analysis Rename - Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.setState({
      analyses: [
        createTestAnalysis({ id: 'analysis-1', name: 'Process A' }),
        createTestAnalysis({ id: 'analysis-2', name: 'Process B' }),
      ],
      activeAnalysisId: null,
      globalParams: { detectionRate: 70, serviceCostPerPump: 2500 },
      unsavedChanges: false,
    });
  });

  it('completes full rename flow: click → edit → type → save → store updated', async () => {
    const user = userEvent.setup();
    renderFocusMode('analysis-1');

    // 1. Verify initial name
    expect(screen.getByText('Process A')).toBeInTheDocument();

    // 2. Click on name to enter edit mode
    await user.click(screen.getByRole('button', { name: /Renommer/ }));

    // 3. Input enters edit mode with focus
    const input = screen.getByRole('textbox');
    expect(document.activeElement).toBe(input);
    expect(input).toHaveValue('Process A');

    // 4. Type new name
    await user.clear(input);
    await user.type(input, 'Process C');

    // 5. Press Enter
    await user.keyboard('{Enter}');

    // 6. Store updated with new name
    const state = useAppStore.getState();
    const analysis = state.analyses.find((a) => a.id === 'analysis-1');
    expect(analysis?.name).toBe('Process C');

    // 7. UI displays new name (static text, not input)
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('Process C')).toBeInTheDocument();
  });

  it('completes validation flow: empty error → fix → save', async () => {
    const user = userEvent.setup();
    renderFocusMode('analysis-1');

    // 1. Enter edit mode
    await user.click(screen.getByRole('button', { name: /Renommer/ }));

    // 2. Clear name (empty)
    const input = screen.getByRole('textbox');
    await user.clear(input);

    // 3. Press Enter
    await user.keyboard('{Enter}');

    // 4. Error displays, edit mode persists
    expect(screen.getByText('Le nom ne peut pas être vide')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();

    // 5. Type valid name
    await user.type(input, 'Fixed Name');

    // 6. Error clears
    expect(screen.queryByText('Le nom ne peut pas être vide')).not.toBeInTheDocument();

    // 7. Save succeeds
    await user.keyboard('{Enter}');
    expect(useAppStore.getState().analyses.find((a) => a.id === 'analysis-1')?.name).toBe('Fixed Name');
  });

  it('completes cancel flow: edit → type → Escape → revert', async () => {
    const user = userEvent.setup();
    renderFocusMode('analysis-1');

    // 1. Enter edit mode
    await user.click(screen.getByRole('button', { name: /Renommer/ }));

    // 2. Type new name
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'New Name');

    // 3. Press Escape
    await user.keyboard('{Escape}');

    // 4. Name reverts to original
    expect(screen.getByText('Process A')).toBeInTheDocument();

    // 5. No store update (name unchanged)
    expect(useAppStore.getState().analyses.find((a) => a.id === 'analysis-1')?.name).toBe('Process A');
  });

  it('validates unique name across analyses', async () => {
    const user = userEvent.setup();
    renderFocusMode('analysis-1');

    // 1. Enter edit mode
    await user.click(screen.getByRole('button', { name: /Renommer/ }));
    const input = screen.getByRole('textbox');

    // 2. Try to rename to existing "Process B"
    await user.clear(input);
    await user.type(input, 'Process B');
    await user.keyboard('{Enter}');

    // 3. Validation error shows
    expect(screen.getByText('Ce nom existe déjà')).toBeInTheDocument();

    // 4. Fix: rename to "Process C" (unique)
    await user.clear(input);
    await user.type(input, 'Process C');
    await user.keyboard('{Enter}');

    // 5. Save succeeds
    expect(useAppStore.getState().analyses.find((a) => a.id === 'analysis-1')?.name).toBe('Process C');
  });
});

describe('ActiveIndicator - Dashboard Usage Examples (Story 3.1 Reference)', () => {
  it('renders dot variant for card usage', () => {
    render(<ActiveIndicator variant="dot" size="sm" />);
    const indicator = screen.getByRole('status');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('bg-green-600');
    expect(indicator).toHaveClass('w-3', 'h-3');
  });

  it('shows active indicator only for active analysis card', () => {
    // Simulating card-level active indicator logic
    const activeId = 'analysis-1';
    const cards = [
      { id: 'analysis-1', name: 'Process A' },
      { id: 'analysis-2', name: 'Process B' },
    ];

    const { container } = render(
      <div>
        {cards.map((card) => (
          <div key={card.id} data-testid={`card-${card.id}`}>
            <span>{card.name}</span>
            {card.id === activeId && <ActiveIndicator variant="dot" size="sm" />}
          </div>
        ))}
      </div>
    );

    // Active card has indicator
    const activeCard = screen.getByTestId('card-analysis-1');
    expect(activeCard.querySelector('[role="status"]')).toBeInTheDocument();

    // Inactive card does not
    const inactiveCard = screen.getByTestId('card-analysis-2');
    expect(inactiveCard.querySelector('[role="status"]')).not.toBeInTheDocument();
  });

  it('dot variant has accessible aria-label', () => {
    render(<ActiveIndicator variant="dot" />);
    expect(screen.getByLabelText('Analyse active')).toBeInTheDocument();
  });
});
