/**
 * Story 4.3: Navigation Links and Session Stability
 * Task 3: Event Listener Cleanup Audit Tests (AC: 4)
 *
 * Verifies that document event listeners are properly cleaned up on unmount,
 * preventing memory leaks during long sessions (NFR-R5).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useAppStore } from '@/stores/app-store';
import type { Analysis } from '@/types';

// Mock navigate
vi.mock('react-router-dom', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...mod,
    useNavigate: () => vi.fn(),
  };
});

// Mock child components for FocusMode to keep tests focused
vi.mock('@/components/analysis/EquipmentInputs', () => ({
  EquipmentInputs: () => <div data-testid="equipment-inputs" />,
}));
vi.mock('@/components/analysis/FailureRateInput', () => ({
  FailureRateInput: () => <div data-testid="failure-rate-input" />,
}));
vi.mock('@/components/analysis/WaferInputs', () => ({
  WaferInputs: () => <div data-testid="wafer-inputs" />,
}));
vi.mock('@/components/analysis/DowntimeInputs', () => ({
  DowntimeInputs: () => <div data-testid="downtime-inputs" />,
}));
vi.mock('@/components/analysis/ResultsPanel', () => ({
  ResultsPanel: () => <div data-testid="results-panel" />,
}));

function createTestAnalysis(overrides: Partial<Analysis> = {}): Analysis {
  return {
    id: 'cleanup-test-id',
    name: 'Cleanup Test',
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

describe('Event Listener Cleanup Audit (AC: 4)', () => {
  let addSpy: ReturnType<typeof vi.spyOn>;
  let removeSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.setState({
      analyses: [createTestAnalysis()],
      activeAnalysisId: 'cleanup-test-id',
      globalParams: { detectionRate: 70, serviceCostPerPump: 2500 },
      unsavedChanges: false,
    });

    addSpy = vi.spyOn(document, 'addEventListener');
    removeSpy = vi.spyOn(document, 'removeEventListener');
  });

  afterEach(() => {
    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('FocusMode mount/unmount does not leak event listeners', async () => {
    // Dynamically import to avoid hoisting issues
    const { FocusMode } = await import('@/pages/FocusMode');

    // Warm-up render: React registers singleton event delegation listeners on first mount
    const warmup = render(
      <MemoryRouter initialEntries={['/analysis/cleanup-test-id']}>
        <Routes>
          <Route path="/analysis/:id" element={<FocusMode />} />
          <Route path="/" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>,
    );
    warmup.unmount();

    // Measured render: only app-level listeners should appear
    const addCountBefore = addSpy.mock.calls.length;
    const removeCountBefore = removeSpy.mock.calls.length;

    const { unmount } = render(
      <MemoryRouter initialEntries={['/analysis/cleanup-test-id']}>
        <Routes>
          <Route path="/analysis/:id" element={<FocusMode />} />
          <Route path="/" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>,
    );

    const addCountAfterMount = addSpy.mock.calls.length - addCountBefore;

    unmount();

    const removeCountAfterUnmount = removeSpy.mock.calls.length - removeCountBefore;

    // Every addEventListener should have a matching removeEventListener
    expect(removeCountAfterUnmount).toBeGreaterThanOrEqual(addCountAfterMount);
  });

  it('repeated mount/unmount cycles (10x) do not accumulate listeners', async () => {
    const { FocusMode } = await import('@/pages/FocusMode');

    for (let i = 0; i < 10; i++) {
      const addCountBefore = addSpy.mock.calls.length;
      const removeCountBefore = removeSpy.mock.calls.length;

      const { unmount } = render(
        <MemoryRouter initialEntries={['/analysis/cleanup-test-id']}>
          <Routes>
            <Route path="/analysis/:id" element={<FocusMode />} />
            <Route path="/" element={<div>Dashboard</div>} />
          </Routes>
        </MemoryRouter>,
      );

      const addedDuringMount = addSpy.mock.calls.length - addCountBefore;

      unmount();

      const removedDuringUnmount = removeSpy.mock.calls.length - removeCountBefore;

      // Each cycle: removals should match or exceed additions
      expect(removedDuringUnmount).toBeGreaterThanOrEqual(addedDuringMount);
    }
  });

  it('GlobalAnalysis mount/unmount does not leak event listeners', async () => {
    const { GlobalAnalysis } = await import('@/pages/GlobalAnalysis');

    const addCountBefore = addSpy.mock.calls.length;
    const removeCountBefore = removeSpy.mock.calls.length;

    const { unmount } = render(
      <MemoryRouter initialEntries={['/global']}>
        <GlobalAnalysis />
      </MemoryRouter>,
    );

    const addCountAfterMount = addSpy.mock.calls.length - addCountBefore;

    unmount();

    const removeCountAfterUnmount = removeSpy.mock.calls.length - removeCountBefore;

    expect(removeCountAfterUnmount).toBeGreaterThanOrEqual(addCountAfterMount);
  });

  it('Dashboard mount/unmount does not leak event listeners', async () => {
    const { Dashboard } = await import('@/pages/Dashboard');

    const addCountBefore = addSpy.mock.calls.length;
    const removeCountBefore = removeSpy.mock.calls.length;

    const { unmount } = render(
      <MemoryRouter initialEntries={['/']}>
        <Dashboard />
      </MemoryRouter>,
    );

    const addCountAfterMount = addSpy.mock.calls.length - addCountBefore;

    unmount();

    const removeCountAfterUnmount = removeSpy.mock.calls.length - removeCountBefore;

    expect(removeCountAfterUnmount).toBeGreaterThanOrEqual(addCountAfterMount);
  });

  it('AnalysisCard context menu open/close cleans up listeners on unmount', async () => {
    const { Dashboard } = await import('@/pages/Dashboard');
    const user = userEvent.setup();

    const { unmount } = render(
      <MemoryRouter initialEntries={['/']}>
        <Dashboard />
      </MemoryRouter>,
    );

    // Track baseline before opening menu
    const addCountBeforeMenu = addSpy.mock.calls.length;

    // Open context menu (triggers document listeners for click-outside + keydown)
    const menuButton = screen.getByLabelText('Actions for analysis Cleanup Test');
    await user.click(menuButton);

    // Count listeners added specifically by the menu open
    const menuListenersAdded = addSpy.mock.calls.length - addCountBeforeMenu;

    // Unmount while menu is open — should clean up menu listeners
    const removeCountBeforeUnmount = removeSpy.mock.calls.length;
    unmount();
    const removeCountAfterUnmount = removeSpy.mock.calls.length - removeCountBeforeUnmount;

    // Unmount should remove at least the menu-specific listeners
    expect(removeCountAfterUnmount).toBeGreaterThanOrEqual(menuListenersAdded);
  });
});
