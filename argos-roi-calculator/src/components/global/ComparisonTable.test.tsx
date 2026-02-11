import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComparisonTable } from './ComparisonTable';
import type { AnalysisRowData } from '@/types';

function createRow(overrides: Partial<AnalysisRowData> = {}): AnalysisRowData {
  return {
    id: crypto.randomUUID(),
    name: 'Poly Etch',
    pumpQuantity: 10,
    failureRate: 10,
    totalFailureCost: 1_003_000,
    argosServiceCost: 25_000,
    savings: 677_100,
    roiPercentage: 2708.4,
    ...overrides,
  };
}

describe('ComparisonTable', () => {
  const mockNavigate = vi.fn();

  const defaultRows: AnalysisRowData[] = [
    createRow({ id: 'a1', name: 'Poly Etch', savings: 677_100, roiPercentage: 2708.4 }),
    createRow({ id: 'a2', name: 'Metal Dep', pumpQuantity: 15, savings: 487_500, roiPercentage: 1300 }),
    createRow({ id: 'a3', name: 'CMP Batch', pumpQuantity: 6, savings: 195_000, roiPercentage: 1300 }),
  ];

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('column headers', () => {
    it('renders table with correct column headers', () => {
      render(<ComparisonTable rows={defaultRows} onNavigateToAnalysis={mockNavigate} />);

      expect(screen.getByText('Process Name')).toBeInTheDocument();
      expect(screen.getByText('Pumps')).toBeInTheDocument();
      expect(screen.getByText('Failure Rate')).toBeInTheDocument();
      expect(screen.getByText('Failure Cost')).toBeInTheDocument();
      expect(screen.getByText('ARGOS Cost')).toBeInTheDocument();
      expect(screen.getByText('Savings')).toBeInTheDocument();
      expect(screen.getByText('ROI (%)')).toBeInTheDocument();
    });

    it('renders section heading "Process Comparison"', () => {
      render(<ComparisonTable rows={defaultRows} onNavigateToAnalysis={mockNavigate} />);

      expect(screen.getByRole('heading', { level: 2, name: 'Process Comparison' })).toBeInTheDocument();
    });
  });

  describe('row rendering', () => {
    it('renders correct number of rows for given data', () => {
      render(<ComparisonTable rows={defaultRows} onNavigateToAnalysis={mockNavigate} />);

      const tbody = screen.getByRole('table').querySelector('tbody');
      const rows = within(tbody!).getAllByRole('row');
      expect(rows).toHaveLength(3);
    });

    it('renders Process Name and is clickable', () => {
      render(<ComparisonTable rows={defaultRows} onNavigateToAnalysis={mockNavigate} />);

      expect(screen.getByRole('button', { name: 'Poly Etch' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Metal Dep' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'CMP Batch' })).toBeInTheDocument();
    });

    it('renders Pumps as number', () => {
      render(<ComparisonTable rows={[createRow({ pumpQuantity: 10 })]} onNavigateToAnalysis={mockNavigate} />);

      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('renders Failure Rate with % format', () => {
      render(<ComparisonTable rows={[createRow({ failureRate: 10 })]} onNavigateToAnalysis={mockNavigate} />);

      // French format: "10,0 %"
      expect(screen.getByText(/10,0\s*%/)).toBeInTheDocument();
    });

    it('renders Failure Cost with EUR format', () => {
      render(<ComparisonTable rows={[createRow({ totalFailureCost: 1_003_000 })]} onNavigateToAnalysis={mockNavigate} />);

      expect(screen.getByText(/€1[\s\u00a0]003[\s\u00a0]000/)).toBeInTheDocument();
    });

    it('renders ARGOS Cost with EUR format', () => {
      render(<ComparisonTable rows={[createRow({ argosServiceCost: 25_000 })]} onNavigateToAnalysis={mockNavigate} />);

      expect(screen.getByText(/€25[\s\u00a0]000/)).toBeInTheDocument();
    });

    it('renders Savings with EUR format', () => {
      render(<ComparisonTable rows={[createRow({ savings: 677_100 })]} onNavigateToAnalysis={mockNavigate} />);

      expect(screen.getByText(/€677[\s\u00a0]100/)).toBeInTheDocument();
    });
  });

  describe('ROI traffic-light colors', () => {
    it('renders green for ROI > 15%', () => {
      const { container } = render(
        <ComparisonTable rows={[createRow({ roiPercentage: 2708.4 })]} onNavigateToAnalysis={mockNavigate} />,
      );

      // Find the ROI cell with traffic-light color
      const greenCells = container.querySelectorAll('.text-green-600');
      expect(greenCells.length).toBeGreaterThan(0);
    });

    it('renders orange for ROI between 0 and 15%', () => {
      const { container } = render(
        <ComparisonTable rows={[createRow({ roiPercentage: 10 })]} onNavigateToAnalysis={mockNavigate} />,
      );

      const orangeCells = container.querySelectorAll('.text-orange-500');
      expect(orangeCells.length).toBeGreaterThan(0);
    });

    it('renders red for ROI < 0%', () => {
      const { container } = render(
        <ComparisonTable rows={[createRow({ roiPercentage: -50 })]} onNavigateToAnalysis={mockNavigate} />,
      );

      const redCells = container.querySelectorAll('.text-red-600');
      expect(redCells.length).toBeGreaterThan(0);
    });
  });

  describe('sorting', () => {
    it('sorts by Savings descending by default', () => {
      render(<ComparisonTable rows={defaultRows} onNavigateToAnalysis={mockNavigate} />);

      const buttons = screen.getAllByRole('button');
      const processNames = buttons
        .filter((btn) => ['Poly Etch', 'Metal Dep', 'CMP Batch'].includes(btn.textContent!))
        .map((btn) => btn.textContent);

      // Savings descending: Poly Etch (677,100) > Metal Dep (487,500) > CMP Batch (195,000)
      expect(processNames).toEqual(['Poly Etch', 'Metal Dep', 'CMP Batch']);
    });

    it('clicking column header sorts by that column descending', async () => {
      const user = userEvent.setup();
      render(<ComparisonTable rows={defaultRows} onNavigateToAnalysis={mockNavigate} />);

      // Click on Pumps header
      await user.click(screen.getByText('Pumps'));

      const buttons = screen.getAllByRole('button');
      const processNames = buttons
        .filter((btn) => ['Poly Etch', 'Metal Dep', 'CMP Batch'].includes(btn.textContent!))
        .map((btn) => btn.textContent);

      // Pumps descending: Metal Dep (15) > Poly Etch (10) > CMP Batch (6)
      expect(processNames).toEqual(['Metal Dep', 'Poly Etch', 'CMP Batch']);
    });

    it('clicking same header again toggles to ascending', async () => {
      const user = userEvent.setup();
      render(<ComparisonTable rows={defaultRows} onNavigateToAnalysis={mockNavigate} />);

      // Click Savings twice (it's already sorted by Savings desc)
      await user.click(screen.getByText('Savings'));

      const buttons = screen.getAllByRole('button');
      const processNames = buttons
        .filter((btn) => ['Poly Etch', 'Metal Dep', 'CMP Batch'].includes(btn.textContent!))
        .map((btn) => btn.textContent);

      // Savings ascending: CMP Batch (195,000) > Metal Dep (487,500) > Poly Etch (677,100)
      expect(processNames).toEqual(['CMP Batch', 'Metal Dep', 'Poly Etch']);
    });

    it('clicking Process Name header sorts alphabetically (string sort)', async () => {
      const user = userEvent.setup();
      render(<ComparisonTable rows={defaultRows} onNavigateToAnalysis={mockNavigate} />);

      // Click on Process Name header
      await user.click(screen.getByText('Process Name'));

      const buttons = screen.getAllByRole('button');
      const processNames = buttons
        .filter((btn) => ['Poly Etch', 'Metal Dep', 'CMP Batch'].includes(btn.textContent!))
        .map((btn) => btn.textContent);

      // Process Name descending (reverse alphabetical): Poly Etch > Metal Dep > CMP Batch
      expect(processNames).toEqual(['Poly Etch', 'Metal Dep', 'CMP Batch']);

      // Click again → ascending (alphabetical): CMP Batch > Metal Dep > Poly Etch
      await user.click(screen.getByText('Process Name'));

      const buttonsAsc = screen.getAllByRole('button');
      const processNamesAsc = buttonsAsc
        .filter((btn) => ['Poly Etch', 'Metal Dep', 'CMP Batch'].includes(btn.textContent!))
        .map((btn) => btn.textContent);

      expect(processNamesAsc).toEqual(['CMP Batch', 'Metal Dep', 'Poly Etch']);
    });

    it('sort indicator arrow visible on active column', () => {
      render(<ComparisonTable rows={defaultRows} onNavigateToAnalysis={mockNavigate} />);

      // Default sort: Savings descending → ↓
      const savingsHeader = screen.getByText('Savings').closest('th');
      expect(savingsHeader!.textContent).toContain('↓');
    });
  });

  describe('navigation', () => {
    it('clicking Process Name calls onNavigateToAnalysis with correct ID', async () => {
      const user = userEvent.setup();
      render(<ComparisonTable rows={defaultRows} onNavigateToAnalysis={mockNavigate} />);

      await user.click(screen.getByRole('button', { name: 'Poly Etch' }));

      expect(mockNavigate).toHaveBeenCalledWith('a1');
    });

    it('keyboard: Enter on process name triggers navigation', async () => {
      const user = userEvent.setup();
      render(<ComparisonTable rows={defaultRows} onNavigateToAnalysis={mockNavigate} />);

      const link = screen.getByRole('button', { name: 'Poly Etch' });
      link.focus();
      await user.keyboard('{Enter}');

      expect(mockNavigate).toHaveBeenCalledWith('a1');
    });
  });

  describe('keyboard sorting', () => {
    it('Enter on header triggers sort', async () => {
      const user = userEvent.setup();
      render(<ComparisonTable rows={defaultRows} onNavigateToAnalysis={mockNavigate} />);

      const pumpsHeader = screen.getByText('Pumps');
      pumpsHeader.focus();
      await user.keyboard('{Enter}');

      // Should now be sorted by Pumps descending
      const buttons = screen.getAllByRole('button');
      const processNames = buttons
        .filter((btn) => ['Poly Etch', 'Metal Dep', 'CMP Batch'].includes(btn.textContent!))
        .map((btn) => btn.textContent);

      expect(processNames).toEqual(['Metal Dep', 'Poly Etch', 'CMP Batch']);
    });

    it('Space on header triggers sort', async () => {
      const user = userEvent.setup();
      render(<ComparisonTable rows={defaultRows} onNavigateToAnalysis={mockNavigate} />);

      const pumpsHeader = screen.getByText('Pumps');
      pumpsHeader.focus();
      await user.keyboard(' ');

      const buttons = screen.getAllByRole('button');
      const processNames = buttons
        .filter((btn) => ['Poly Etch', 'Metal Dep', 'CMP Batch'].includes(btn.textContent!))
        .map((btn) => btn.textContent);

      expect(processNames).toEqual(['Metal Dep', 'Poly Etch', 'CMP Batch']);
    });
  });

  describe('layout and styling', () => {
    it('has horizontal scroll container with overflow-x-auto', () => {
      const { container } = render(
        <ComparisonTable rows={defaultRows} onNavigateToAnalysis={mockNavigate} />,
      );

      const scrollContainer = container.querySelector('.overflow-x-auto');
      expect(scrollContainer).toBeInTheDocument();
    });

    it('has alternating row colors', () => {
      const { container } = render(
        <ComparisonTable rows={defaultRows} onNavigateToAnalysis={mockNavigate} />,
      );

      const tbody = container.querySelector('tbody');
      const rows = tbody!.querySelectorAll('tr');

      // Even rows (index 0, 2): bg-white; Odd rows (index 1): bg-gray-50
      expect(rows[0].className).toContain('bg-white');
      expect(rows[1].className).toContain('bg-gray-50');
      expect(rows[2].className).toContain('bg-white');
    });

    it('has hover styling class on rows', () => {
      const { container } = render(
        <ComparisonTable rows={defaultRows} onNavigateToAnalysis={mockNavigate} />,
      );

      const tbody = container.querySelector('tbody');
      const rows = tbody!.querySelectorAll('tr');

      rows.forEach((row) => {
        expect(row.className).toContain('hover:bg-gray-100');
      });
    });
  });

  describe('accessibility', () => {
    it('has scope="col" on all column headers', () => {
      render(<ComparisonTable rows={defaultRows} onNavigateToAnalysis={mockNavigate} />);

      const headers = screen.getAllByRole('columnheader');
      headers.forEach((header) => {
        expect(header).toHaveAttribute('scope', 'col');
      });
    });

    it('has aria-sort attributes on headers', () => {
      render(<ComparisonTable rows={defaultRows} onNavigateToAnalysis={mockNavigate} />);

      const headers = screen.getAllByRole('columnheader');
      headers.forEach((header) => {
        expect(header).toHaveAttribute('aria-sort');
      });

      // Savings is the active sort column → descending
      const savingsHeader = screen.getByText('Savings').closest('th');
      expect(savingsHeader).toHaveAttribute('aria-sort', 'descending');

      // Other headers → none
      const pumpsHeader = screen.getByText('Pumps').closest('th');
      expect(pumpsHeader).toHaveAttribute('aria-sort', 'none');
    });

    it('uses semantic table elements', () => {
      const { container } = render(
        <ComparisonTable rows={defaultRows} onNavigateToAnalysis={mockNavigate} />,
      );

      expect(container.querySelector('table')).toBeInTheDocument();
      expect(container.querySelector('thead')).toBeInTheDocument();
      expect(container.querySelector('tbody')).toBeInTheDocument();
      expect(container.querySelectorAll('th').length).toBe(7);
      expect(container.querySelectorAll('td').length).toBe(21); // 3 rows * 7 columns
    });
  });

  describe('empty state', () => {
    it('returns null when rows array is empty', () => {
      const { container } = render(
        <ComparisonTable rows={[]} onNavigateToAnalysis={mockNavigate} />,
      );

      expect(container.innerHTML).toBe('');
    });
  });
});
