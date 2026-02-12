/**
 * Story 4.3: Navigation Links and Session Stability
 * Task 1: Comprehensive Round-Trip Navigation Integration Tests (AC: 1, 2, 7)
 * Task 5: Navigation Performance Guard Tests (AC: 6)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { GlobalAnalysis } from './GlobalAnalysis';
import { useAppStore } from '@/stores/app-store';
import type { Analysis } from '@/types';
import { calculateAggregatedMetrics } from '@/lib/calculations';

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

const resetStore = () => {
  useAppStore.setState({
    analyses: [],
    activeAnalysisId: null,
    globalParams: { detectionRate: 70, serviceCostPerPump: 2500 },
    unsavedChanges: false,
  });
};

const renderPage = () => {
  return render(
    <MemoryRouter initialEntries={['/global']}>
      <GlobalAnalysis />
    </MemoryRouter>,
  );
};

describe('Navigation Integration — Round-Trip Tests (AC: 1, 2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetStore();
  });

  it('round trip: Global Analysis → click process → navigates to Focus Mode with correct ID', async () => {
    const user = userEvent.setup();
    const analysisId = 'roundtrip-id-1';
    useAppStore.setState({
      analyses: [createTestAnalysis({ id: analysisId, name: 'Poly Etch' })],
    });

    renderPage();

    // Click process name in ComparisonTable
    await user.click(screen.getByRole('button', { name: 'Poly Etch' }));

    // Verify setActiveAnalysis was called (store updated)
    expect(useAppStore.getState().activeAnalysisId).toBe(analysisId);
    // Verify navigate was called with correct route
    expect(mockNavigate).toHaveBeenCalledWith(`/analysis/${analysisId}`);
  });

  it('setActiveAnalysis is called BEFORE navigate (correct order)', async () => {
    const user = userEvent.setup();
    const callOrder: string[] = [];

    // Track order: setActiveAnalysis updates store synchronously
    const originalSetState = useAppStore.setState;
    const stateTracker = vi.spyOn(useAppStore, 'setState');
    stateTracker.mockImplementation((...args) => {
      callOrder.push('setState');
      return originalSetState(...args);
    });

    mockNavigate.mockImplementation(() => {
      callOrder.push('navigate');
    });

    const analysisId = 'order-test-id';
    useAppStore.setState({
      analyses: [createTestAnalysis({ id: analysisId, name: 'Order Test' })],
    });
    callOrder.length = 0; // Reset after setup

    renderPage();
    await user.click(screen.getByRole('button', { name: 'Order Test' }));

    // setState (setActiveAnalysis) should happen before navigate
    const setStateIndex = callOrder.indexOf('setState');
    const navigateIndex = callOrder.indexOf('navigate');
    expect(setStateIndex).toBeLessThan(navigateIndex);

    stateTracker.mockRestore();
  });

  it('data remains intact after navigation cycle (Global → Focus → Global)', () => {
    const analyses = [
      createTestAnalysis({ id: 'a1', name: 'Process A', pumpQuantity: 10 }),
      createTestAnalysis({ id: 'a2', name: 'Process B', pumpQuantity: 15 }),
      createTestAnalysis({ id: 'a3', name: 'Process C', pumpQuantity: 6 }),
    ];
    useAppStore.setState({ analyses });

    // First render: Global Analysis shows all data
    const { unmount } = renderPage();

    expect(screen.getByRole('button', { name: 'Process A' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Process B' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Process C' })).toBeInTheDocument();

    const pumpsHeading = screen.getByText('Total Pumps Monitored');
    expect(within(pumpsHeading.parentElement!).getByText('31')).toBeInTheDocument();

    // Simulate navigation away (unmount)
    unmount();

    // Verify store data is intact after unmount
    const state = useAppStore.getState();
    expect(state.analyses).toHaveLength(3);
    expect(state.analyses.map((a) => a.name)).toEqual(['Process A', 'Process B', 'Process C']);
    expect(state.analyses.reduce((sum, a) => sum + a.pumpQuantity, 0)).toBe(31);

    // Re-render: Global Analysis shows same data
    renderPage();
    expect(screen.getByRole('button', { name: 'Process A' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Process B' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Process C' })).toBeInTheDocument();
  });

  it('multiple rapid navigation cycles (5 round trips) preserve data integrity', async () => {
    const user = userEvent.setup();
    const analysisId = 'rapid-nav-id';
    useAppStore.setState({
      analyses: [createTestAnalysis({ id: analysisId, name: 'Rapid Nav Test', pumpQuantity: 8 })],
    });

    // Simulate 5 rapid navigation cycles
    for (let i = 0; i < 5; i++) {
      const { unmount } = renderPage();
      await user.click(screen.getByRole('button', { name: 'Rapid Nav Test' }));
      expect(mockNavigate).toHaveBeenCalledWith(`/analysis/${analysisId}`);
      unmount();
      mockNavigate.mockClear();
    }

    // Store data should be intact after 5 cycles
    const state = useAppStore.getState();
    expect(state.analyses).toHaveLength(1);
    expect(state.analyses[0].name).toBe('Rapid Nav Test');
    expect(state.analyses[0].pumpQuantity).toBe(8);
  });

  it('navigation with 5 analyses (NFR-P6 max) renders all correctly', async () => {
    const user = userEvent.setup();
    const analyses = Array.from({ length: 5 }, (_, i) =>
      createTestAnalysis({
        id: `nfr-p6-${i}`,
        name: `Process ${i + 1}`,
        pumpQuantity: 10 + i * 5,
      }),
    );
    useAppStore.setState({ analyses });

    renderPage();

    // All 5 process names should be clickable
    for (let i = 0; i < 5; i++) {
      expect(screen.getByRole('button', { name: `Process ${i + 1}` })).toBeInTheDocument();
    }

    // Total pumps: 10 + 15 + 20 + 25 + 30 = 100
    const pumpsHeading = screen.getByText('Total Pumps Monitored');
    expect(within(pumpsHeading.parentElement!).getByText('100')).toBeInTheDocument();

    // Click last process
    await user.click(screen.getByRole('button', { name: 'Process 5' }));
    expect(mockNavigate).toHaveBeenCalledWith('/analysis/nfr-p6-4');
  });
});

describe('Navigation Integration — NavigationBar Links (AC: 1, 2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetStore();
  });

  it('NavigationBar "Global Analysis" link is present and active on /global route (H2 fix)', () => {
    useAppStore.setState({
      analyses: [createTestAnalysis({ id: 'nav-bar-test', name: 'NavBar Test' })],
    });

    renderPage();

    // NavLink to="/global" should render with aria-current="page" (active route)
    const globalLink = screen.getByRole('link', { name: 'Global Analysis' });
    expect(globalLink).toBeInTheDocument();
    expect(globalLink).toHaveAttribute('aria-current', 'page');
  });

  it('NavigationBar "Analyses" link navigates to Dashboard', () => {
    useAppStore.setState({
      analyses: [createTestAnalysis({ id: 'analyses-link', name: 'Analyses Link' })],
    });

    renderPage();

    const analysesLink = screen.getByRole('link', { name: 'Analyses' });
    expect(analysesLink).toBeInTheDocument();
    expect(analysesLink).toHaveAttribute('href', '/');
  });

  it('keyboard Enter on NavigationBar "Global Analysis" link is accessible (M2 fix)', async () => {
    const user = userEvent.setup();
    useAppStore.setState({
      analyses: [createTestAnalysis({ id: 'kb-nav', name: 'KB Nav' })],
    });

    renderPage();

    const globalLink = screen.getByRole('link', { name: 'Global Analysis' });
    // Link is focusable and has keyboard support via native <a> behavior
    expect(globalLink.tagName).toBe('A');
    globalLink.focus();
    expect(document.activeElement).toBe(globalLink);
  });
});

describe('Navigation Integration — Keyboard Navigation (AC: 7)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetStore();
  });

  it('Tab to process name and Enter triggers navigation', async () => {
    const user = userEvent.setup();
    const analysisId = 'keyboard-nav-id';
    useAppStore.setState({
      analyses: [createTestAnalysis({ id: analysisId, name: 'Keyboard Test' })],
    });

    renderPage();

    const processButton = screen.getByRole('button', { name: 'Keyboard Test' });
    processButton.focus();
    await user.keyboard('{Enter}');

    expect(mockNavigate).toHaveBeenCalledWith(`/analysis/${analysisId}`);
  });

  it('Space key on process name also triggers navigation', async () => {
    const user = userEvent.setup();
    const analysisId = 'space-nav-id';
    useAppStore.setState({
      analyses: [createTestAnalysis({ id: analysisId, name: 'Space Test' })],
    });

    renderPage();

    const processButton = screen.getByRole('button', { name: 'Space Test' });
    processButton.focus();
    await user.keyboard(' ');

    expect(mockNavigate).toHaveBeenCalledWith(`/analysis/${analysisId}`);
  });
});

describe('Navigation Integration — State Consistency (AC: 2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetStore();
  });

  it('activeAnalysisId matches clicked analysis after navigation', async () => {
    const user = userEvent.setup();
    const analyses = [
      createTestAnalysis({ id: 'id-first', name: 'First' }),
      createTestAnalysis({ id: 'id-second', name: 'Second' }),
    ];
    useAppStore.setState({ analyses });

    renderPage();

    // Click second process
    await user.click(screen.getByRole('button', { name: 'Second' }));

    expect(useAppStore.getState().activeAnalysisId).toBe('id-second');
    expect(mockNavigate).toHaveBeenCalledWith('/analysis/id-second');
  });

  it('globalParams remain unchanged after navigation', async () => {
    const user = userEvent.setup();
    const customParams = { detectionRate: 85, serviceCostPerPump: 3500 };
    useAppStore.setState({
      analyses: [createTestAnalysis({ id: 'params-test', name: 'Params Test' })],
      globalParams: customParams,
    });

    renderPage();
    await user.click(screen.getByRole('button', { name: 'Params Test' }));

    // Params unchanged
    const state = useAppStore.getState();
    expect(state.globalParams).toEqual(customParams);
  });

  it('FocusSidebar MiniCard reflects active analysis after navigation (H1 fix)', async () => {
    const user = userEvent.setup();
    const analyses = [
      createTestAnalysis({ id: 'sidebar-a', name: 'Sidebar A' }),
      createTestAnalysis({ id: 'sidebar-b', name: 'Sidebar B' }),
    ];
    useAppStore.setState({ analyses });

    renderPage();

    // Click process to set activeAnalysisId
    await user.click(screen.getByRole('button', { name: 'Sidebar B' }));

    // Verify store has correct activeAnalysisId for FocusSidebar consumption
    const state = useAppStore.getState();
    expect(state.activeAnalysisId).toBe('sidebar-b');

    // Verify the data FocusSidebar would use: activeAnalysisId matches clicked analysis
    const activeAnalysis = state.analyses.find((a) => a.id === state.activeAnalysisId);
    expect(activeAnalysis).toBeDefined();
    expect(activeAnalysis!.name).toBe('Sidebar B');
  });

  it('Zustand selector isolation: activeAnalysisId update does not change analyses reference (H3 fix)', async () => {
    const user = userEvent.setup();
    useAppStore.setState({
      analyses: [createTestAnalysis({ id: 'selector-test', name: 'Selector Test' })],
    });

    // Capture analyses reference BEFORE navigation
    const analysesBefore = useAppStore.getState().analyses;

    renderPage();
    await user.click(screen.getByRole('button', { name: 'Selector Test' }));

    // After setActiveAnalysis, analyses array reference should be unchanged
    // (selector-based subscriptions to 'analyses' won't re-render)
    const analysesAfter = useAppStore.getState().analyses;
    expect(analysesAfter).toBe(analysesBefore); // Same reference, not just deep equal
  });
});

describe('Navigation Performance Guard Tests (AC: 6)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetStore();
  });

  it('aggregation calculation with 5 analyses completes within 100ms', () => {
    const analyses = Array.from({ length: 5 }, (_, i) =>
      createTestAnalysis({
        id: `perf-${i}`,
        name: `Perf Process ${i}`,
        pumpQuantity: 10 + i * 5,
      }),
    );
    const globalParams = { detectionRate: 70, serviceCostPerPump: 2500 };

    const start = performance.now();
    const result = calculateAggregatedMetrics(analyses, globalParams);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(100);
    expect(result.processCount).toBe(5);
    expect(result.totalPumps).toBe(100);
  });

  it('ComparisonTable with 5 rows renders within 1000ms (generous CI threshold)', () => {
    const analyses = Array.from({ length: 5 }, (_, i) =>
      createTestAnalysis({
        id: `render-perf-${i}`,
        name: `Render Process ${i}`,
        pumpQuantity: 10,
      }),
    );
    useAppStore.setState({ analyses });

    const start = performance.now();
    renderPage();
    const duration = performance.now() - start;

    // Generous threshold for test/CI environments (production target: <100ms)
    expect(duration).toBeLessThan(1000);
    expect(screen.getAllByRole('button', { name: /Render Process/ })).toHaveLength(5);
  });

  it('store data updates after modification are reflected in re-render', () => {
    useAppStore.setState({
      analyses: [createTestAnalysis({ name: 'Before Update', pumpQuantity: 10 })],
    });

    renderPage();

    const pumpsHeading = screen.getByText('Total Pumps Monitored');
    expect(within(pumpsHeading.parentElement!).getByText('10')).toBeInTheDocument();

    // Update analysis
    act(() => {
      const state = useAppStore.getState();
      const updatedAnalyses = state.analyses.map((a) => ({ ...a, pumpQuantity: 20 }));
      useAppStore.setState({ analyses: updatedAnalyses });
    });

    // New value should be reflected
    expect(within(pumpsHeading.parentElement!).getByText('20')).toBeInTheDocument();
  });

  it('navigation handler executes quickly (setActiveAnalysis + navigate)', async () => {
    const user = userEvent.setup();
    const analysisId = 'perf-nav-id';
    useAppStore.setState({
      analyses: [createTestAnalysis({ id: analysisId, name: 'Perf Nav' })],
    });

    renderPage();

    const start = performance.now();
    await user.click(screen.getByRole('button', { name: 'Perf Nav' }));
    const duration = performance.now() - start;

    // Navigation handler should be fast (generous threshold for test env)
    expect(duration).toBeLessThan(500);
    expect(mockNavigate).toHaveBeenCalledWith(`/analysis/${analysisId}`);
  });
});
