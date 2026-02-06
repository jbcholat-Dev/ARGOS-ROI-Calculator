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

  it('displays modal title "Nouvelle Analyse"', () => {
    render(<AnalysisCreationModal {...defaultProps} />);
    expect(screen.getByText('Nouvelle Analyse')).toBeInTheDocument();
  });

  it('auto-focuses name input when modal opens', async () => {
    render(<AnalysisCreationModal {...defaultProps} />);

    await waitFor(() => {
      const input = screen.getByLabelText('Nom du process');
      expect(document.activeElement).toBe(input);
    });
  });

  it('updates input value when typing', async () => {
    const user = userEvent.setup();
    render(<AnalysisCreationModal {...defaultProps} />);

    const input = screen.getByLabelText('Nom du process');
    await user.type(input, 'Poly Etch');
    expect(input).toHaveValue('Poly Etch');
  });

  it('calls onSubmit with trimmed name when "Créer" is clicked', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();
    render(<AnalysisCreationModal {...defaultProps} onSubmit={handleSubmit} />);

    const input = screen.getByLabelText('Nom du process');
    await user.type(input, '  Poly Etch  ');
    await user.click(screen.getByRole('button', { name: 'Créer' }));

    expect(handleSubmit).toHaveBeenCalledWith('Poly Etch');
  });

  it('shows validation error when submitting empty name', async () => {
    const user = userEvent.setup();
    render(<AnalysisCreationModal {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Créer' }));

    expect(screen.getByText(/Le nom de l'analyse est requis/)).toBeInTheDocument();
  });

  it('shows validation error when name is whitespace only', async () => {
    const user = userEvent.setup();
    render(<AnalysisCreationModal {...defaultProps} />);

    const input = screen.getByLabelText('Nom du process');
    await user.type(input, '   ');
    await user.click(screen.getByRole('button', { name: 'Créer' }));

    expect(screen.getByText(/Le nom de l'analyse est requis/)).toBeInTheDocument();
  });

  it('does not call onSubmit when validation fails', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();
    render(<AnalysisCreationModal {...defaultProps} onSubmit={handleSubmit} />);

    await user.click(screen.getByRole('button', { name: 'Créer' }));

    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('calls onClose when "Annuler" is clicked', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();
    render(<AnalysisCreationModal {...defaultProps} onClose={handleClose} />);

    await user.click(screen.getByRole('button', { name: 'Annuler' }));
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

    const input = screen.getByLabelText('Nom du process');
    await user.type(input, 'Test Process');
    await user.keyboard('{Enter}');

    expect(handleSubmit).toHaveBeenCalledWith('Test Process');
  });

  it('does not submit on Enter when name is empty', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();
    render(<AnalysisCreationModal {...defaultProps} onSubmit={handleSubmit} />);

    const input = screen.getByLabelText('Nom du process');
    input.focus();
    await user.keyboard('{Enter}');

    expect(handleSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/Le nom de l'analyse est requis/)).toBeInTheDocument();
  });

  it('displays error with correct French text', async () => {
    const user = userEvent.setup();
    render(<AnalysisCreationModal {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Créer' }));

    expect(screen.getByRole('alert')).toHaveTextContent("Le nom de l'analyse est requis");
  });

  it('marks input as aria-invalid when validation fails', async () => {
    const user = userEvent.setup();
    render(<AnalysisCreationModal {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Créer' }));

    const input = screen.getByLabelText('Nom du process');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('clears error when user types valid input after error', async () => {
    const user = userEvent.setup();
    render(<AnalysisCreationModal {...defaultProps} />);

    // Trigger error
    await user.click(screen.getByRole('button', { name: 'Créer' }));
    expect(screen.getByText(/Le nom de l'analyse est requis/)).toBeInTheDocument();

    // Type valid input
    const input = screen.getByLabelText('Nom du process');
    await user.type(input, 'Valid Name');

    expect(screen.queryByText(/Le nom de l'analyse est requis/)).not.toBeInTheDocument();
  });

  it('shows real-time validation when user types then clears input', async () => {
    const user = userEvent.setup();
    render(<AnalysisCreationModal {...defaultProps} />);

    const input = screen.getByLabelText('Nom du process');
    await user.type(input, 'A');
    // No error while valid
    expect(screen.queryByText(/Le nom de l'analyse est requis/)).not.toBeInTheDocument();

    // Clear the input
    await user.clear(input);
    // Error should appear (real-time validation)
    expect(screen.getByText(/Le nom de l'analyse est requis/)).toBeInTheDocument();
  });

  it('resets state when modal reopens', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<AnalysisCreationModal {...defaultProps} />);

    // Trigger error state
    const input = screen.getByLabelText('Nom du process');
    await user.type(input, 'Test');
    await user.clear(input);
    expect(screen.getByText(/Le nom de l'analyse est requis/)).toBeInTheDocument();

    // Close and reopen
    rerender(<AnalysisCreationModal {...defaultProps} isOpen={false} />);
    rerender(<AnalysisCreationModal {...defaultProps} isOpen={true} />);

    // Error should be gone, input should be empty
    expect(screen.queryByText(/Le nom de l'analyse est requis/)).not.toBeInTheDocument();
    expect(screen.getByLabelText('Nom du process')).toHaveValue('');
  });

  it('has correct placeholder text', () => {
    render(<AnalysisCreationModal {...defaultProps} />);
    expect(screen.getByPlaceholderText('ex: Poly Etch - Chamber 04')).toBeInTheDocument();
  });

  it('has correct input label', () => {
    render(<AnalysisCreationModal {...defaultProps} />);
    expect(screen.getByLabelText('Nom du process')).toBeInTheDocument();
  });

  it('has maxLength attribute on input', () => {
    render(<AnalysisCreationModal {...defaultProps} />);
    const input = screen.getByLabelText('Nom du process');
    expect(input).toHaveAttribute('maxLength', '100');
  });

  it('buttons have visible focus ring classes', () => {
    render(<AnalysisCreationModal {...defaultProps} />);
    const annulerBtn = screen.getByRole('button', { name: 'Annuler' });
    const creerBtn = screen.getByRole('button', { name: 'Créer' });
    expect(annulerBtn).toHaveClass('focus:ring-2');
    expect(creerBtn).toHaveClass('focus:ring-2');
  });

  it('traps focus with Shift+Tab (backward navigation)', async () => {
    const user = userEvent.setup();
    render(<AnalysisCreationModal {...defaultProps} />);

    // Wait for auto-focus on input
    await waitFor(() => {
      expect(screen.getByLabelText('Nom du process')).toHaveFocus();
    });

    // Shift+Tab from input should wrap to last focusable (Créer button)
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(screen.getByRole('button', { name: 'Créer' })).toHaveFocus();

    // Shift+Tab from Créer should go to Annuler
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(screen.getByRole('button', { name: 'Annuler' })).toHaveFocus();

    // Shift+Tab from Annuler should go back to input
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(screen.getByLabelText('Nom du process')).toHaveFocus();
  });
});
