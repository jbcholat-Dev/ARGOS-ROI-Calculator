import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { useAppStore } from '@/stores/app-store';
import { AnalysisCard } from './AnalysisCard';
import type { Analysis } from '@/types';

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('AnalysisCard', () => {
  const baseAnalysis: Analysis = {
    id: 'test-id-123',
    name: 'CVD Chamber 04',
    pumpType: 'A3004XN',
    pumpQuantity: 10,
    failureRateMode: 'percentage',
    failureRatePercentage: 10,
    waferType: 'batch',
    waferQuantity: 125,
    waferCost: 8000,
    downtimeDuration: 6,
    downtimeCostPerHour: 500,
    detectionRate: 70,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  it('renders with analysis data', () => {
    render(<AnalysisCard analysis={baseAnalysis} isActive={false} />);

    expect(screen.getByText('CVD Chamber 04')).toBeInTheDocument();
    expect(screen.getByText(/Pumps/)).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('displays process name correctly', () => {
    render(<AnalysisCard analysis={baseAnalysis} isActive={false} />);

    const heading = screen.getByRole('heading', { name: 'CVD Chamber 04' });
    expect(heading).toBeInTheDocument();
  });

  it('displays pump quantity with "Pompes" label', () => {
    render(<AnalysisCard analysis={baseAnalysis} isActive={false} />);

    expect(screen.getByText(/Pumps/)).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('calculates and displays ROI percentage', () => {
    render(<AnalysisCard analysis={baseAnalysis} isActive={false} />);

    // Expected calculation:
    // Total failure cost = (10 × 0.10) × (8000 × 125 + 6 × 500) = 1 × 1,003,000 = 1,003,000
    // Service cost = 10 × 2500 = 25,000
    // Savings = 1,003,000 × 0.70 - 25,000 = 702,100 - 25,000 = 677,100
    // ROI = (677,100 / 25,000) × 100 = 2708.4%
    // French locale uses comma as decimal separator: 2 708,4
    const roiElement = screen.getByTestId('roi-percentage');
    expect(roiElement.textContent).toMatch(/2[\s\u00a0\u202f]708,4/);
  });

  it('displays ROI with red color for negative ROI', () => {
    const analysisWithNegativeROI: Analysis = {
      ...baseAnalysis,
      failureRatePercentage: 1, // Very low failure rate
      pumpQuantity: 100, // Very high service cost
      waferCost: 100, // Very low wafer cost
      detectionRate: 10, // Very low detection rate
    };

    render(<AnalysisCard analysis={analysisWithNegativeROI} isActive={false} />);

    // Total failure cost = (100 × 0.01) × (100 × 125 + 6 × 500) = 1 × (12,500 + 3,000) = 15,500
    // Service cost = 100 × 2500 = 250,000
    // Savings = 15,500 × 0.10 - 250,000 = 1,550 - 250,000 = -248,450 (negative!)
    // ROI = (-248,450 / 250,000) × 100 = -99.38% (red!)
    const roiElement = screen.getByTestId('roi-percentage');
    expect(roiElement.className).toMatch(/text-red-600/);
  });

  it('displays ROI with orange color for ROI between 0-15%', () => {
    const analysisWithLowROI: Analysis = {
      ...baseAnalysis,
      pumpQuantity: 1,
      failureRatePercentage: 100, // Simplified: 1 failure per year
      waferType: 'mono', // 1 wafer
      waferCost: 8000,
      downtimeDuration: 6,
      downtimeCostPerHour: 500,
      detectionRate: 25, // Low detection rate to get ROI ~10%
    };

    render(<AnalysisCard analysis={analysisWithLowROI} isActive={false} />);

    // Total failure cost = (1 × 1.0) × (8000 × 1 + 6 × 500) = 1 × 11,000 = 11,000
    // Service cost = 1 × 2500 = 2,500
    // Savings = 11,000 × 0.25 - 2,500 = 2,750 - 2,500 = 250
    // ROI = (250 / 2,500) × 100 = 10% (orange!)
    const roiElement = screen.getByTestId('roi-percentage');
    expect(roiElement.className).toMatch(/text-orange-500/);
  });

  it('displays ROI with green color for ROI >15%', () => {
    render(<AnalysisCard analysis={baseAnalysis} isActive={false} />);

    // Base analysis has very high ROI (>2000%)
    const roiElement = screen.getByTestId('roi-percentage');
    expect(roiElement.className).toMatch(/text-green-600/);
  });

  it('displays savings amount with EUR formatting', () => {
    render(<AnalysisCard analysis={baseAnalysis} isActive={false} />);

    // Expected savings = 677,100 EUR
    const savingsText = screen.getByText(/€.*677[\s\u00a0\u202f]100/);
    expect(savingsText).toBeInTheDocument();
  });

  it('active analysis has red border', () => {
    const { container } = render(<AnalysisCard analysis={baseAnalysis} isActive={true} />);

    const card = container.firstChild as HTMLElement;
    expect(card.className).toMatch(/border-primary/);
    expect(card.className).toMatch(/border-2/);
  });

  it('inactive analysis has default border', () => {
    const { container } = render(<AnalysisCard analysis={baseAnalysis} isActive={false} />);

    const card = container.firstChild as HTMLElement;
    expect(card.className).not.toMatch(/border-primary/);
    expect(card.className).not.toMatch(/border-2/);
  });

  it('uses analysis.detectionRate if present', () => {
    const analysisWithCustomDetection: Analysis = {
      ...baseAnalysis,
      detectionRate: 85,
    };

    render(<AnalysisCard analysis={analysisWithCustomDetection} isActive={false} />);

    // With 85% detection rate, savings should be higher
    // Savings = 1,003,000 × 0.85 - 25,000 = 852,550 - 25,000 = 827,550
    // ROI = (827,550 / 25,000) × 100 = 3310.2%
    // French locale uses comma: 3 310,2
    const roiElement = screen.getByTestId('roi-percentage');
    expect(roiElement.textContent).toMatch(/3[\s\u00a0\u202f]310,2/);
  });

  it('falls back to global detectionRate (70) if analysis.detectionRate is undefined', () => {
    const analysisWithoutDetectionRate: Analysis = {
      ...baseAnalysis,
      detectionRate: undefined,
    };

    render(<AnalysisCard analysis={analysisWithoutDetectionRate} isActive={false} />);

    // Should use 70% (global default)
    // Savings = 1,003,000 × 0.70 - 25,000 = 677,100
    const savingsText = screen.getByText(/€.*677[\s\u00a0\u202f]100/);
    expect(savingsText).toBeInTheDocument();
  });

  it('savings calculation matches ResultsPanel (same formulas)', () => {
    render(<AnalysisCard analysis={baseAnalysis} isActive={false} />);

    // This test verifies that AnalysisCard uses the same calculation functions
    // as ResultsPanel, ensuring consistency across the app
    // Expected: 677,100 EUR (calculated using lib/calculations.ts functions)
    const savingsText = screen.getByText(/€.*677[\s\u00a0\u202f]100/);
    expect(savingsText).toBeInTheDocument();
  });

  it('calculates with waferQuantity=1 for mono wafer even if analysis.waferQuantity > 1', () => {
    const monoAnalysisWithHighQuantity: Analysis = {
      ...baseAnalysis,
      waferType: 'mono',
      waferQuantity: 100, // This should be IGNORED for mono type
      waferCost: 8000,
    };

    render(<AnalysisCard analysis={monoAnalysisWithHighQuantity} isActive={false} />);

    // Expected calculation with waferQuantity = 1 (NOT 100):
    // Total failure cost = (10 × 0.10) × (8000 × 1 + 6 × 500) = 1 × 11,000 = 11,000
    // Service cost = 10 × 2500 = 25,000
    // Savings = 11,000 × 0.70 - 25,000 = 7,700 - 25,000 = -17,300 (negative!)
    // ROI = (-17,300 / 25,000) × 100 = -69.2% (red!)
    const roiElement = screen.getByTestId('roi-percentage');
    expect(roiElement.textContent).toMatch(/-69,2/);
    expect(roiElement.className).toMatch(/text-red-600/);
  });

  describe('Card Navigation (Story 3.2)', () => {
    it('calls onClick handler when card is clicked', async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();

      render(<AnalysisCard analysis={baseAnalysis} isActive={false} onClick={onClick} />);

      const card = screen.getByLabelText('Analysis CVD Chamber 04');
      await user.click(card);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('is clickable when onClick is provided', () => {
      const onClick = vi.fn();
      render(<AnalysisCard analysis={baseAnalysis} isActive={false} onClick={onClick} />);

      const card = screen.getByLabelText('Analysis CVD Chamber 04');
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('is not clickable when onClick is not provided', () => {
      render(<AnalysisCard analysis={baseAnalysis} isActive={false} />);

      const card = screen.getByLabelText('Analysis CVD Chamber 04');
      expect(card).toBeInTheDocument();
      expect(card).not.toHaveAttribute('tabIndex');
      expect(card).not.toHaveAttribute('role');
    });

    it('calls onClick when Enter key is pressed', async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();

      render(<AnalysisCard analysis={baseAnalysis} isActive={false} onClick={onClick} />);

      const card = screen.getByLabelText('Analysis CVD Chamber 04');
      card.focus();
      await user.keyboard('{Enter}');

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick when Space key is pressed', async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();

      render(<AnalysisCard analysis={baseAnalysis} isActive={false} onClick={onClick} />);

      const card = screen.getByLabelText('Analysis CVD Chamber 04');
      card.focus();
      await user.keyboard(' ');

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('has hover styles when clickable', () => {
      const onClick = vi.fn();
      const { container } = render(
        <AnalysisCard analysis={baseAnalysis} isActive={false} onClick={onClick} />,
      );

      const card = container.firstChild as HTMLElement;
      expect(card.className).toMatch(/cursor-pointer/);
      expect(card.className).toMatch(/hover:shadow-lg/);
    });

    it('does not have hover styles when not clickable', () => {
      const { container } = render(<AnalysisCard analysis={baseAnalysis} isActive={false} />);

      const card = container.firstChild as HTMLElement;
      expect(card.className).not.toMatch(/cursor-pointer/);
    });
  });

  // Story 3.3: Duplicate and Delete Actions
  describe('Context Menu (Story 3.3)', () => {
    beforeEach(() => {
      mockNavigate.mockClear();
      // Reset store to clean state
      useAppStore.setState({
        analyses: [baseAnalysis],
        activeAnalysisId: baseAnalysis.id,
      });
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('renders three-dot menu button', () => {
      render(
        <MemoryRouter>
          <AnalysisCard analysis={baseAnalysis} isActive={false} />
        </MemoryRouter>,
      );

      const menuButton = screen.getByLabelText(/Actions for analysis CVD Chamber 04/i);
      expect(menuButton).toBeInTheDocument();
      expect(menuButton).toHaveAttribute('aria-haspopup', 'menu');
    });

    it('opens context menu when three-dot button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <AnalysisCard analysis={baseAnalysis} isActive={false} />
        </MemoryRouter>,
      );

      const menuButton = screen.getByLabelText(/Actions for analysis CVD Chamber 04/i);
      await user.click(menuButton);

      expect(screen.getByRole('menu')).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /Duplicate/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /Delete/i })).toBeInTheDocument();
    });

    it('closes menu when clicking outside', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <AnalysisCard analysis={baseAnalysis} isActive={false} />
        </MemoryRouter>,
      );

      // Open menu
      const menuButton = screen.getByLabelText(/Actions for analysis CVD Chamber 04/i);
      await user.click(menuButton);
      expect(screen.getByRole('menu')).toBeInTheDocument();

      // Click outside (on document body)
      await user.click(document.body);

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });

    it('closes menu when Escape key is pressed', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <AnalysisCard analysis={baseAnalysis} isActive={false} />
        </MemoryRouter>,
      );

      // Open menu
      const menuButton = screen.getByLabelText(/Actions for analysis CVD Chamber 04/i);
      await user.click(menuButton);
      expect(screen.getByRole('menu')).toBeInTheDocument();

      // Press Escape
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });

    it('three-dot button click does not trigger card onClick', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <MemoryRouter>
          <AnalysisCard analysis={baseAnalysis} isActive={false} onClick={onClick} />
        </MemoryRouter>,
      );

      const menuButton = screen.getByLabelText(/Actions for analysis CVD Chamber 04/i);
      await user.click(menuButton);

      // Card onClick should NOT be called (stopPropagation)
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('Duplicate Action (Story 3.3 AC2)', () => {
    beforeEach(() => {
      mockNavigate.mockClear();
      useAppStore.setState({
        analyses: [baseAnalysis],
        activeAnalysisId: baseAnalysis.id,
      });
    });

    it('duplicates analysis when "Dupliquer" is clicked', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <AnalysisCard analysis={baseAnalysis} isActive={false} />
        </MemoryRouter>,
      );

      // Open menu and click Dupliquer
      const menuButton = screen.getByLabelText(/Actions for analysis CVD Chamber 04/i);
      await user.click(menuButton);

      const duplicateButton = screen.getByRole('menuitem', { name: /Duplicate/i });
      await user.click(duplicateButton);

      // Verify duplicate was created in store
      const analyses = useAppStore.getState().analyses;
      expect(analyses).toHaveLength(2);
      expect(analyses[1].name).toBe('CVD Chamber 04 (copie)');
      expect(analyses[1].pumpQuantity).toBe(baseAnalysis.pumpQuantity);
      expect(analyses[1].id).not.toBe(baseAnalysis.id);
    });

    it('navigates to duplicate in Focus Mode after duplication', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <AnalysisCard analysis={baseAnalysis} isActive={false} />
        </MemoryRouter>,
      );

      // Open menu and click Dupliquer
      const menuButton = screen.getByLabelText(/Actions for analysis CVD Chamber 04/i);
      await user.click(menuButton);

      const duplicateButton = screen.getByRole('menuitem', { name: /Duplicate/i });
      await user.click(duplicateButton);

      // Verify navigation to duplicate
      const newActiveId = useAppStore.getState().activeAnalysisId;
      expect(mockNavigate).toHaveBeenCalledWith(`/analysis/${newActiveId}`);
    });

    it('duplicate has all values copied from original', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <AnalysisCard analysis={baseAnalysis} isActive={false} />
        </MemoryRouter>,
      );

      // Open menu and click Dupliquer
      const menuButton = screen.getByLabelText(/Actions for analysis CVD Chamber 04/i);
      await user.click(menuButton);

      const duplicateButton = screen.getByRole('menuitem', { name: /Duplicate/i });
      await user.click(duplicateButton);

      // Verify all fields copied
      const duplicate = useAppStore.getState().analyses[1];
      expect(duplicate.pumpType).toBe(baseAnalysis.pumpType);
      expect(duplicate.failureRatePercentage).toBe(baseAnalysis.failureRatePercentage);
      expect(duplicate.waferType).toBe(baseAnalysis.waferType);
      expect(duplicate.waferCost).toBe(baseAnalysis.waferCost);
      expect(duplicate.detectionRate).toBe(baseAnalysis.detectionRate);
    });

    it('closes menu after duplication', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <AnalysisCard analysis={baseAnalysis} isActive={false} />
        </MemoryRouter>,
      );

      // Open menu and click Dupliquer
      const menuButton = screen.getByLabelText(/Actions for analysis CVD Chamber 04/i);
      await user.click(menuButton);

      const duplicateButton = screen.getByRole('menuitem', { name: /Duplicate/i });
      await user.click(duplicateButton);

      // Menu should close
      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });
  });

  describe('Delete Action (Story 3.3 AC3-AC4)', () => {
    beforeEach(() => {
      mockNavigate.mockClear();
      useAppStore.setState({
        analyses: [baseAnalysis],
        activeAnalysisId: baseAnalysis.id,
      });
    });

    it('opens delete confirmation modal when "Supprimer" is clicked', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <AnalysisCard analysis={baseAnalysis} isActive={false} />
        </MemoryRouter>,
      );

      // Open menu and click Supprimer
      const menuButton = screen.getByLabelText(/Actions for analysis CVD Chamber 04/i);
      await user.click(menuButton);

      const deleteButton = screen.getByRole('menuitem', { name: /Delete/i });
      await user.click(deleteButton);

      // Verify modal opened with title
      expect(screen.getByText(/Delete analysis\?/i)).toBeInTheDocument();
      // Verify modal contains the message with analysis name
      expect(screen.getByText(/This action is irreversible/i)).toBeInTheDocument();
    });

    it('does not delete analysis when canceling confirmation', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <AnalysisCard analysis={baseAnalysis} isActive={false} />
        </MemoryRouter>,
      );

      // Open menu and click Supprimer
      const menuButton = screen.getByLabelText(/Actions for analysis CVD Chamber 04/i);
      await user.click(menuButton);
      await user.click(screen.getByRole('menuitem', { name: /Delete/i }));

      // Cancel deletion
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await user.click(cancelButton);

      // Analysis should still exist
      const analyses = useAppStore.getState().analyses;
      expect(analyses).toHaveLength(1);
      expect(analyses[0].id).toBe(baseAnalysis.id);
    });

    it('deletes analysis when confirming deletion', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <AnalysisCard analysis={baseAnalysis} isActive={false} />
        </MemoryRouter>,
      );

      // Open menu and click Supprimer
      const menuButton = screen.getByLabelText(/Actions for analysis CVD Chamber 04/i);
      await user.click(menuButton);
      await user.click(screen.getByRole('menuitem', { name: /Delete/i }));

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: /Delete/i });
      await user.click(confirmButton);

      // Analysis should be deleted
      const analyses = useAppStore.getState().analyses;
      expect(analyses).toHaveLength(0);
    });

    it('navigates to Dashboard when deleting last analysis', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <AnalysisCard analysis={baseAnalysis} isActive={true} />
        </MemoryRouter>,
      );

      // Open menu, delete, and confirm
      const menuButton = screen.getByLabelText(/Actions for analysis CVD Chamber 04/i);
      await user.click(menuButton);
      await user.click(screen.getByRole('menuitem', { name: /Delete/i }));

      // Get all Delete buttons (menu + modal), click modal button
      const suppressButtons = screen.getAllByRole('button', { name: /Delete/i });
      const modalDeleteButton = suppressButtons.find(btn => btn.textContent === 'Delete' && btn.className.includes('pfeiffer-red'));
      await user.click(modalDeleteButton!);

      // Should navigate to Dashboard
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('navigates to first remaining analysis when deleting active analysis', async () => {
      // Setup: 2 analyses, second is active
      const secondAnalysis: Analysis = {
        ...baseAnalysis,
        id: 'second-id',
        name: 'Process 2',
      };
      useAppStore.setState({
        analyses: [baseAnalysis, secondAnalysis],
        activeAnalysisId: secondAnalysis.id,
      });

      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <AnalysisCard analysis={secondAnalysis} isActive={true} />
        </MemoryRouter>,
      );

      // Delete second analysis
      const menuButton = screen.getByLabelText(/Actions for analysis Process 2/i);
      await user.click(menuButton);
      await user.click(screen.getByRole('menuitem', { name: /Delete/i }));

      // Click modal delete button
      const suppressButtons = screen.getAllByRole('button', { name: /Delete/i });
      const modalDeleteButton = suppressButtons.find(btn => btn.textContent === 'Delete' && btn.className.includes('pfeiffer-red'));
      await user.click(modalDeleteButton!);

      // Should navigate to first analysis (baseAnalysis)
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(`/analysis/${baseAnalysis.id}`);
      });
      expect(useAppStore.getState().activeAnalysisId).toBe(baseAnalysis.id);
    });

    it('does not navigate when deleting non-active analysis', async () => {
      // Setup: 2 analyses, first is active
      const secondAnalysis: Analysis = {
        ...baseAnalysis,
        id: 'second-id',
        name: 'Process 2',
      };
      useAppStore.setState({
        analyses: [baseAnalysis, secondAnalysis],
        activeAnalysisId: baseAnalysis.id,
      });

      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <AnalysisCard analysis={secondAnalysis} isActive={false} />
        </MemoryRouter>,
      );

      // Delete second analysis (not active)
      const menuButton = screen.getByLabelText(/Actions for analysis Process 2/i);
      await user.click(menuButton);
      await user.click(screen.getByRole('menuitem', { name: /Delete/i }));
      await user.click(screen.getAllByRole('button', { name: /Delete/i })[1]);

      // Should NOT navigate (active analysis unchanged)
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(useAppStore.getState().activeAnalysisId).toBe(baseAnalysis.id);
    });
  });
});
