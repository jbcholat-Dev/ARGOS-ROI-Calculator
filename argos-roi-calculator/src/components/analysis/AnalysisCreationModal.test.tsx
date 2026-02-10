import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnalysisCreationModal } from './AnalysisCreationModal';

describe('AnalysisCreationModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when isOpen is true', () => {
    render(<AnalysisCreationModal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<AnalysisCreationModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('displays modal title "New Analysis"', () => {
    render(<AnalysisCreationModal {...defaultProps} />);
    expect(screen.getByText('New Analysis')).toBeInTheDocument();
  });

  it('auto-focuses name input when modal opens', async () => {
    render(<AnalysisCreationModal {...defaultProps} />);

    await waitFor(() => {
      const input = screen.getByLabelText('Analysis Name');
      expect(document.activeElement).toBe(input);
    });
  });

  it('updates input value when typing', async () => {
    const user = userEvent.setup();
    render(<AnalysisCreationModal {...defaultProps} />);

    const input = screen.getByLabelText('Analysis Name');
    await user.type(input, 'Poly Etch');
    expect(input).toHaveValue('Poly Etch');
  });

  it('calls onSubmit with trimmed name when "Create" is clicked', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();
    render(<AnalysisCreationModal {...defaultProps} onSubmit={handleSubmit} />);

    const input = screen.getByLabelText('Analysis Name');
    await user.type(input, '  Poly Etch  ');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(handleSubmit).toHaveBeenCalledWith('Poly Etch');
  });

  it('shows validation error when submitting empty name', async () => {
    const user = userEvent.setup();
    render(<AnalysisCreationModal {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(screen.getByText(/Analysis name is required/)).toBeInTheDocument();
  });

  it('shows validation error when name is whitespace only', async () => {
    const user = userEvent.setup();
    render(<AnalysisCreationModal {...defaultProps} />);

    const input = screen.getByLabelText('Analysis Name');
    await user.type(input, '   ');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(screen.getByText(/Analysis name is required/)).toBeInTheDocument();
  });

  it('does not call onSubmit when validation fails', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();
    render(<AnalysisCreationModal {...defaultProps} onSubmit={handleSubmit} />);

    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('calls onClose when "Cancel" is clicked', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();
    render(<AnalysisCreationModal {...defaultProps} onClose={handleClose} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();
    render(<AnalysisCreationModal {...defaultProps} onClose={handleClose} />);

    await user.keyboard('{Escape}');
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when overlay is clicked', () => {
    const handleClose = vi.fn();
    render(<AnalysisCreationModal {...defaultProps} onClose={handleClose} />);

    const overlay = screen.getByTestId('modal-overlay');
    fireEvent.click(overlay);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('submits form on Enter key when name is valid', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();
    render(<AnalysisCreationModal {...defaultProps} onSubmit={handleSubmit} />);

    const input = screen.getByLabelText('Analysis Name');
    await user.type(input, 'Test Process');
    await user.keyboard('{Enter}');

    expect(handleSubmit).toHaveBeenCalledWith('Test Process');
  });

  it('does not submit on Enter when name is empty', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();
    render(<AnalysisCreationModal {...defaultProps} onSubmit={handleSubmit} />);

    const input = screen.getByLabelText('Analysis Name');
    input.focus();
    await user.keyboard('{Enter}');

    expect(handleSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/Analysis name is required/)).toBeInTheDocument();
  });

  it('displays error with correct English text', async () => {
    const user = userEvent.setup();
    render(<AnalysisCreationModal {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(screen.getByRole('alert')).toHaveTextContent("Analysis name is required");
  });

  it('marks input as aria-invalid when validation fails', async () => {
    const user = userEvent.setup();
    render(<AnalysisCreationModal {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Create' }));

    const input = screen.getByLabelText('Analysis Name');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('clears error when user types valid input after error', async () => {
    const user = userEvent.setup();
    render(<AnalysisCreationModal {...defaultProps} />);

    // Trigger error
    await user.click(screen.getByRole('button', { name: 'Create' }));
    expect(screen.getByText(/Analysis name is required/)).toBeInTheDocument();

    // Type valid input
    const input = screen.getByLabelText('Analysis Name');
    await user.type(input, 'Valid Name');

    expect(screen.queryByText(/Analysis name is required/)).not.toBeInTheDocument();
  });

  it('shows real-time validation when user types then clears input', async () => {
    const user = userEvent.setup();
    render(<AnalysisCreationModal {...defaultProps} />);

    const input = screen.getByLabelText('Analysis Name');
    await user.type(input, 'A');
    // No error while valid
    expect(screen.queryByText(/Analysis name is required/)).not.toBeInTheDocument();

    // Clear the input
    await user.clear(input);
    // Error should appear (real-time validation)
    expect(screen.getByText(/Analysis name is required/)).toBeInTheDocument();
  });

  it('resets state when modal reopens', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<AnalysisCreationModal {...defaultProps} />);

    // Trigger error state
    const input = screen.getByLabelText('Analysis Name');
    await user.type(input, 'Test');
    await user.clear(input);
    expect(screen.getByText(/Analysis name is required/)).toBeInTheDocument();

    // Close and reopen
    rerender(<AnalysisCreationModal {...defaultProps} isOpen={false} />);
    rerender(<AnalysisCreationModal {...defaultProps} isOpen={true} />);

    // Error should be gone, input should be empty
    expect(screen.queryByText(/Analysis name is required/)).not.toBeInTheDocument();
    expect(screen.getByLabelText('Analysis Name')).toHaveValue('');
  });

  it('has correct placeholder text', () => {
    render(<AnalysisCreationModal {...defaultProps} />);
    expect(screen.getByPlaceholderText('e.g.: Poly Etch - Chamber 04')).toBeInTheDocument();
  });

  it('has correct input label', () => {
    render(<AnalysisCreationModal {...defaultProps} />);
    expect(screen.getByLabelText('Analysis Name')).toBeInTheDocument();
  });

  it('has maxLength attribute on input', () => {
    render(<AnalysisCreationModal {...defaultProps} />);
    const input = screen.getByLabelText('Analysis Name');
    expect(input).toHaveAttribute('maxLength', '100');
  });

  it('buttons have visible focus ring classes', () => {
    render(<AnalysisCreationModal {...defaultProps} />);
    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
    const createBtn = screen.getByRole('button', { name: 'Create' });
    expect(cancelBtn).toHaveClass('focus:ring-2');
    expect(createBtn).toHaveClass('focus:ring-2');
  });

  it('traps focus with Shift+Tab (backward navigation)', async () => {
    const user = userEvent.setup();
    render(<AnalysisCreationModal {...defaultProps} />);

    // Wait for auto-focus on input
    await waitFor(() => {
      expect(screen.getByLabelText('Analysis Name')).toHaveFocus();
    });

    // Shift+Tab from input should wrap to last focusable (Create button)
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(screen.getByRole('button', { name: 'Create' })).toHaveFocus();

    // Shift+Tab from Create should go to Cancel
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();

    // Shift+Tab from Cancel should go back to input
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(screen.getByLabelText('Analysis Name')).toHaveFocus();
  });
});
