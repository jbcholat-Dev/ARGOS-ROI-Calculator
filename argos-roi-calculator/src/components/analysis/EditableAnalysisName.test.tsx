import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditableAnalysisName } from './EditableAnalysisName';

describe('EditableAnalysisName', () => {
  const defaultProps = {
    analysisId: 'test-id-1',
    currentName: 'Poly Etch - Chamber 04',
    onUpdate: vi.fn(),
    existingNames: ['Poly Etch - Chamber 04', 'CVD Process'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders current name as static text', () => {
    render(<EditableAnalysisName {...defaultProps} />);
    expect(screen.getByText('Poly Etch - Chamber 04')).toBeInTheDocument();
  });

  it('enters edit mode when name is clicked', async () => {
    const user = userEvent.setup();
    render(<EditableAnalysisName {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /Rename/ }));

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('Poly Etch - Chamber 04');
  });

  it('auto-focuses input and selects text in edit mode', async () => {
    const user = userEvent.setup();
    render(<EditableAnalysisName {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /Rename/ }));

    await waitFor(() => {
      const input = screen.getByRole('textbox');
      expect(document.activeElement).toBe(input);
      expect(input).toHaveProperty('selectionStart', 0);
      expect(input).toHaveProperty('selectionEnd', 'Poly Etch - Chamber 04'.length);
    });
  });

  it('saves valid name on Enter key', async () => {
    const handleUpdate = vi.fn();
    const user = userEvent.setup();
    render(<EditableAnalysisName {...defaultProps} onUpdate={handleUpdate} />);

    await user.click(screen.getByRole('button', { name: /Rename/ }));
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'New Process Name{Enter}');

    expect(handleUpdate).toHaveBeenCalledWith('New Process Name');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('saves valid name on blur', async () => {
    const handleUpdate = vi.fn();
    const user = userEvent.setup();
    render(
      <div>
        <EditableAnalysisName {...defaultProps} onUpdate={handleUpdate} />
        <button>Other element</button>
      </div>
    );

    await user.click(screen.getByRole('button', { name: /Rename/ }));
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'Blur Save Name');
    await user.click(screen.getByText('Other element'));

    expect(handleUpdate).toHaveBeenCalledWith('Blur Save Name');
  });

  it('cancels edit on Escape key', async () => {
    const handleUpdate = vi.fn();
    const user = userEvent.setup();
    render(<EditableAnalysisName {...defaultProps} onUpdate={handleUpdate} />);

    await user.click(screen.getByRole('button', { name: /Rename/ }));
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'Different Name');
    await user.keyboard('{Escape}');

    expect(handleUpdate).not.toHaveBeenCalled();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('Poly Etch - Chamber 04')).toBeInTheDocument();
  });

  it('shows validation error for empty name', async () => {
    const user = userEvent.setup();
    render(<EditableAnalysisName {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /Rename/ }));
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.keyboard('{Enter}');

    expect(screen.getByText('Name cannot be empty')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('shows validation error for name exceeding 100 characters', async () => {
    const user = userEvent.setup();
    render(<EditableAnalysisName {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /Rename/ }));
    const input = screen.getByRole('textbox');
    // Use fireEvent.change to bypass HTML maxLength for validation testing
    const longName = 'A'.repeat(101);
    fireEvent.change(input, { target: { value: longName } });
    await user.keyboard('{Enter}');

    expect(screen.getByText('Name cannot exceed 100 characters')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('shows validation error for duplicate name (case-insensitive)', async () => {
    const user = userEvent.setup();
    render(<EditableAnalysisName {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /Rename/ }));
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'cvd process{Enter}');

    expect(screen.getByText('This name already exists')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('allows saving the current name (not flagged as duplicate)', async () => {
    const handleUpdate = vi.fn();
    const user = userEvent.setup();
    render(<EditableAnalysisName {...defaultProps} onUpdate={handleUpdate} />);

    await user.click(screen.getByRole('button', { name: /Rename/ }));
    // Just press Enter without changing the name
    await user.keyboard('{Enter}');

    // No error, no update called (name unchanged)
    expect(screen.queryByText('This name already exists')).not.toBeInTheDocument();
    expect(handleUpdate).not.toHaveBeenCalled();
  });

  it('calls onUpdate with trimmed name', async () => {
    const handleUpdate = vi.fn();
    const user = userEvent.setup();
    render(<EditableAnalysisName {...defaultProps} onUpdate={handleUpdate} />);

    await user.click(screen.getByRole('button', { name: /Rename/ }));
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '  Trimmed Name  {Enter}');

    expect(handleUpdate).toHaveBeenCalledWith('Trimmed Name');
  });

  it('displays error with correct styling (red border)', async () => {
    const user = userEvent.setup();
    render(<EditableAnalysisName {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /Rename/ }));
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.keyboard('{Enter}');

    expect(input).toHaveClass('border-red-600');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('clears error when user types valid input', async () => {
    const user = userEvent.setup();
    render(<EditableAnalysisName {...defaultProps} />);

    // Trigger error
    await user.click(screen.getByRole('button', { name: /Rename/ }));
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.keyboard('{Enter}');
    expect(screen.getByText('Name cannot be empty')).toBeInTheDocument();

    // Type valid input
    await user.type(input, 'Valid');
    expect(screen.queryByText('Name cannot be empty')).not.toBeInTheDocument();
  });

  it('edit mode persists when validation fails', async () => {
    const user = userEvent.setup();
    render(<EditableAnalysisName {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /Rename/ }));
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.keyboard('{Enter}');

    // Still in edit mode
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders badge when showActiveBadge is true', async () => {
    render(<EditableAnalysisName {...defaultProps} showActiveBadge={true} />);
    expect(screen.getByText('Active Analysis')).toBeInTheDocument();
  });

  it('does not render badge when showActiveBadge is false', () => {
    render(<EditableAnalysisName {...defaultProps} showActiveBadge={false} />);
    expect(screen.queryByText('Active Analysis')).not.toBeInTheDocument();
  });

  it('has aria-describedby linking input to error', async () => {
    const user = userEvent.setup();
    render(<EditableAnalysisName {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /Rename/ }));
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.keyboard('{Enter}');

    const errorElement = screen.getByRole('alert');
    expect(input).toHaveAttribute('aria-describedby', errorElement.id);
  });
});
