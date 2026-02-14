import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ArchitectureDiagram } from './ArchitectureDiagram';
import { DiagramControls } from './DiagramControls';
import { ConnectionLine } from './ConnectionLine';
import { useAppStore } from '@/stores/app-store';
import type { Analysis } from '@/types';

function createTestAnalysis(overrides: Partial<Analysis> = {}): Analysis {
  return {
    id: crypto.randomUUID(),
    name: 'Test Process',
    pumpType: 'A3004XN',
    pumpQuantity: 4,
    failureRateMode: 'percentage' as const,
    failureRatePercentage: 5,
    waferType: 'batch' as const,
    waferQuantity: 125,
    waferCost: 500,
    downtimeDuration: 8,
    downtimeCostPerHour: 1000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('ArchitectureDiagram', () => {
  beforeEach(() => {
    useAppStore.setState({
      analyses: [],
      activeAnalysisId: null,
      globalParams: { detectionRate: 70, serviceCostPerPump: 2500 },
      excludedFromGlobal: new Set<string>(),
      deploymentMode: 'pilot',
      connectionType: 'ethernet',
      unsavedChanges: false,
    });
  });

  describe('Empty state (AC6)', () => {
    it('shows empty state message when no analyses', () => {
      render(<ArchitectureDiagram />);
      expect(screen.getByText('Add ROI analyses to see your deployment architecture')).toBeInTheDocument();
    });

    it('has role="img" on empty state container', () => {
      render(<ArchitectureDiagram />);
      const diagram = screen.getByRole('img');
      expect(diagram).toBeInTheDocument();
    });

    it('has descriptive aria-label for empty state', () => {
      render(<ArchitectureDiagram />);
      const diagram = screen.getByRole('img');
      expect(diagram).toHaveAttribute('aria-label', 'Architecture diagram — no analyses configured');
    });
  });

  describe('Pump data integration (AC5)', () => {
    it('shows pump clusters from store analyses', () => {
      useAppStore.setState({
        analyses: [
          createTestAnalysis({ name: 'Poly Etch', pumpQuantity: 8, pumpType: 'A3004XN' }),
          createTestAnalysis({ name: 'Metal Dep', pumpQuantity: 12, pumpType: 'HiPace 300' }),
          createTestAnalysis({ name: 'CVD', pumpQuantity: 6, pumpType: 'A3004XN' }),
        ],
      });

      render(<ArchitectureDiagram />);

      // Should merge A3004XN clusters: 8 + 6 = 14
      const svg = screen.getByRole('img');
      expect(svg).toHaveAttribute('aria-label', expect.stringContaining('26 pumps'));
      expect(svg).toHaveAttribute('aria-label', expect.stringContaining('2 models'));
    });

    it('updates diagram when analyses change', () => {
      const a1 = createTestAnalysis({ name: 'A', pumpQuantity: 5, pumpType: 'ModelX' });
      useAppStore.setState({ analyses: [a1] });

      render(<ArchitectureDiagram />);

      const svg = screen.getByRole('img');
      expect(svg).toHaveAttribute('aria-label', expect.stringContaining('5 pumps'));

      const a2 = createTestAnalysis({ name: 'B', pumpQuantity: 7, pumpType: 'ModelY' });
      act(() => {
        useAppStore.setState({ analyses: [a1, a2] });
      });

      expect(svg).toHaveAttribute('aria-label', expect.stringContaining('12 pumps'));
    });

    it('renders correct number of pump cluster groups', () => {
      useAppStore.setState({
        analyses: [
          createTestAnalysis({ name: 'A', pumpQuantity: 8, pumpType: 'A3004XN' }),
          createTestAnalysis({ name: 'B', pumpQuantity: 6, pumpType: 'A1803H' }),
          createTestAnalysis({ name: 'C', pumpQuantity: 4, pumpType: 'A2104LM' }),
        ],
      });

      render(<ArchitectureDiagram />);

      // Each pump cluster has aria-label
      expect(screen.getByLabelText('8 A3004XN pumps')).toBeInTheDocument();
      expect(screen.getByLabelText('6 A1803H pumps')).toBeInTheDocument();
      expect(screen.getByLabelText('4 A2104LM pumps')).toBeInTheDocument();
    });
  });

  describe('Pilot topology (AC2)', () => {
    it('shows micro-PC components in pilot mode', () => {
      useAppStore.setState({
        analyses: [
          createTestAnalysis({ name: 'A', pumpQuantity: 8, pumpType: 'A3004XN' }),
        ],
      });

      render(<ArchitectureDiagram />);

      expect(screen.getByLabelText(/Micro-PC near tool cluster 1/)).toBeInTheDocument();
    });

    it('shows manual sync component in pilot mode', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis()],
      });

      render(<ArchitectureDiagram />);

      expect(screen.getByLabelText(/Manual daily data retrieval/)).toBeInTheDocument();
    });

    it('shows correct pump count on micro-PC', () => {
      useAppStore.setState({
        analyses: [
          createTestAnalysis({ name: 'A', pumpQuantity: 8, pumpType: 'A3004XN' }),
        ],
      });

      render(<ArchitectureDiagram />);

      expect(screen.getByLabelText(/8 pumps connected/)).toBeInTheDocument();
    });

    it('does not show central server in pilot mode', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis()],
      });

      render(<ArchitectureDiagram />);

      // Server element exists in DOM but is hidden via opacity-0 on parent group
      const server = screen.getByLabelText(/Central on-premise server/);
      const parent = server.closest('g[class*="opacity-0"]');
      expect(parent).toBeTruthy();
    });
  });

  describe('Production topology (AC3)', () => {
    it('shows central server in production mode', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis()],
        deploymentMode: 'production',
      });

      render(<ArchitectureDiagram />);

      expect(screen.getByLabelText(/Central on-premise server/)).toBeInTheDocument();
    });

    it('shows auto pipeline in production mode', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis()],
        deploymentMode: 'production',
      });

      render(<ArchitectureDiagram />);

      expect(screen.getByLabelText(/Automated data pipeline/)).toBeInTheDocument();
    });

    it('hides micro-PCs in production mode', () => {
      useAppStore.setState({
        analyses: [
          createTestAnalysis({ name: 'A', pumpQuantity: 8, pumpType: 'A3004XN' }),
        ],
        deploymentMode: 'production',
      });

      render(<ArchitectureDiagram />);

      // Micro-PC exists in DOM but is hidden via opacity-0 on parent group
      const microPC = screen.getByLabelText(/Micro-PC near tool cluster/);
      const parent = microPC.closest('g[class*="opacity-0"]');
      expect(parent).toBeTruthy();
    });
  });

  describe('Fixed components across topologies (AC7)', () => {
    it('shows cloud platform in both modes', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis()],
      });

      render(<ArchitectureDiagram />);

      expect(screen.getByLabelText(/ARGOS Cloud platform/)).toBeInTheDocument();

      act(() => {
        useAppStore.setState({ deploymentMode: 'production' });
      });

      expect(screen.getByLabelText(/ARGOS Cloud platform/)).toBeInTheDocument();
    });

    it('shows pump clusters in both modes', () => {
      useAppStore.setState({
        analyses: [
          createTestAnalysis({ name: 'A', pumpQuantity: 8, pumpType: 'A3004XN' }),
        ],
      });

      render(<ArchitectureDiagram />);

      expect(screen.getByLabelText('8 A3004XN pumps')).toBeInTheDocument();

      act(() => {
        useAppStore.setState({ deploymentMode: 'production' });
      });

      expect(screen.getByLabelText('8 A3004XN pumps')).toBeInTheDocument();
    });
  });

  describe('Accessibility (AC9)', () => {
    it('SVG has role="img" with descriptive aria-label', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis({ pumpQuantity: 10, pumpType: 'TestPump' })],
      });

      render(<ArchitectureDiagram />);

      const svg = screen.getByRole('img');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('aria-label', expect.stringContaining('Pilot'));
      expect(svg).toHaveAttribute('aria-label', expect.stringContaining('10 pumps'));
    });

    it('updates aria-label when topology changes', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis({ pumpQuantity: 10, pumpType: 'TestPump' })],
      });

      render(<ArchitectureDiagram />);

      const svg = screen.getByRole('img');
      expect(svg).toHaveAttribute('aria-label', expect.stringContaining('Pilot'));

      act(() => {
        useAppStore.setState({ deploymentMode: 'production' });
      });

      expect(svg).toHaveAttribute('aria-label', expect.stringContaining('Production'));
    });

    it('has aria-live region for topology change announcements', () => {
      useAppStore.setState({
        analyses: [createTestAnalysis()],
      });

      const { container } = render(<ArchitectureDiagram />);

      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
    });
  });
});

describe('DiagramControls', () => {
  beforeEach(() => {
    useAppStore.setState({
      analyses: [],
      activeAnalysisId: null,
      globalParams: { detectionRate: 70, serviceCostPerPump: 2500 },
      excludedFromGlobal: new Set<string>(),
      deploymentMode: 'pilot',
      connectionType: 'ethernet',
      unsavedChanges: false,
    });
  });

  describe('Deployment mode toggle (AC1)', () => {
    it('renders pilot and production toggle buttons', () => {
      render(<DiagramControls />);

      expect(screen.getByRole('radio', { name: 'Pilot' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'Production' })).toBeInTheDocument();
    });

    it('pilot is selected by default', () => {
      render(<DiagramControls />);

      expect(screen.getByRole('radio', { name: 'Pilot' })).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByRole('radio', { name: 'Production' })).toHaveAttribute('aria-checked', 'false');
    });

    it('switches to production mode when clicked', async () => {
      const user = userEvent.setup();
      render(<DiagramControls />);

      await user.click(screen.getByRole('radio', { name: 'Production' }));

      expect(useAppStore.getState().deploymentMode).toBe('production');
      expect(screen.getByRole('radio', { name: 'Production' })).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByRole('radio', { name: 'Pilot' })).toHaveAttribute('aria-checked', 'false');
    });

    it('switches mode with Enter/Space on focused toggle', async () => {
      const user = userEvent.setup();
      render(<DiagramControls />);

      const pilotBtn = screen.getByRole('radio', { name: 'Pilot' });
      pilotBtn.focus();

      await user.keyboard('{ArrowRight}');

      expect(useAppStore.getState().deploymentMode).toBe('production');
    });

    it('shows mode badge matching current mode', () => {
      render(<DiagramControls />);
      expect(screen.getByText(/Pilot Mode/)).toBeInTheDocument();
    });

    it('updates mode badge when switching to production', async () => {
      const user = userEvent.setup();
      render(<DiagramControls />);

      await user.click(screen.getByRole('radio', { name: 'Production' }));

      expect(screen.getByText(/Production Mode/)).toBeInTheDocument();
    });
  });

  describe('Connection type dropdown (AC4)', () => {
    it('renders connection type dropdown', () => {
      render(<DiagramControls />);

      expect(screen.getByLabelText('Connection type')).toBeInTheDocument();
    });

    it('has ethernet as default connection type', () => {
      render(<DiagramControls />);

      const select = screen.getByLabelText('Connection type') as HTMLSelectElement;
      expect(select.value).toBe('ethernet');
    });

    it('changes connection type to wifi', async () => {
      const user = userEvent.setup();
      render(<DiagramControls />);

      await user.selectOptions(screen.getByLabelText('Connection type'), 'wifi');

      expect(useAppStore.getState().connectionType).toBe('wifi');
    });

    it('changes connection type to rs485', async () => {
      const user = userEvent.setup();
      render(<DiagramControls />);

      await user.selectOptions(screen.getByLabelText('Connection type'), 'rs485');

      expect(useAppStore.getState().connectionType).toBe('rs485');
    });
  });

  describe('Inline stats', () => {
    it('shows zero pumps when no analyses', () => {
      render(<DiagramControls />);

      const zeros = screen.getAllByText('0');
      expect(zeros.length).toBeGreaterThanOrEqual(3); // Pumps, Models, Processes all 0
    });

    it('shows total pumps from analyses', () => {
      useAppStore.setState({
        analyses: [
          createTestAnalysis({ pumpQuantity: 8, pumpType: 'A3004XN' }),
          createTestAnalysis({ pumpQuantity: 12, pumpType: 'HiPace 300' }),
        ],
      });

      render(<DiagramControls />);

      expect(screen.getByText('20')).toBeInTheDocument();
    });
  });

  describe('Keyboard accessibility (AC9)', () => {
    it('toggle has radiogroup role', () => {
      render(<DiagramControls />);

      expect(screen.getByRole('radiogroup', { name: 'Deployment mode' })).toBeInTheDocument();
    });

    it('dropdown is keyboard navigable', () => {
      render(<DiagramControls />);

      const select = screen.getByLabelText('Connection type');
      expect(select.tagName).toBe('SELECT');
    });
  });
});

describe('ConnectionLine styling (AC4)', () => {
  function renderLine(connectionType: 'ethernet' | 'rs485' | 'wifi') {
    return render(
      <svg>
        <ConnectionLine
          d="M 0,0 L 100,100"
          connectionType={connectionType}
          variant="pilot"
        />
      </svg>,
    );
  }

  it('renders solid line for ethernet (no stroke-dasharray)', () => {
    const { container } = renderLine('ethernet');
    const path = container.querySelector('path');
    expect(path).toBeInTheDocument();
    expect(path).not.toHaveAttribute('stroke-dasharray');
  });

  it('renders solid line for rs485 (no stroke-dasharray)', () => {
    const { container } = renderLine('rs485');
    const path = container.querySelector('path');
    expect(path).toBeInTheDocument();
    expect(path).not.toHaveAttribute('stroke-dasharray');
  });

  it('renders dotted line for wifi (stroke-dasharray="6 4")', () => {
    const { container } = renderLine('wifi');
    const path = container.querySelector('path');
    expect(path).toBeInTheDocument();
    expect(path).toHaveAttribute('stroke-dasharray', '6 4');
  });
});
