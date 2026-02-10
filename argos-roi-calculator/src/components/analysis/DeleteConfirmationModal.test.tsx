import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

describe('DeleteConfirmationModal', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();
  const testAnalysisName = 'Test Process';

  beforeEach(() => {
    mockOnConfirm.mockClear();
    mockOnCancel.mockClear();
  });

  describe('Rendering', () => {
    it('renders when isOpen is true', () => {
      render(
        <DeleteConfirmationModal
          isOpen={true}
          analysisName={testAnalysisName}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      expect(screen.getByText('Delete analysis?')).toBeInTheDocument();
      expect(
        screen.getByText(/This action is irreversible/i),
      ).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(
        <DeleteConfirmationModal
          isOpen={false}
          analysisName={testAnalysisName}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      expect(screen.queryByText('Delete analysis?')).not.toBeInTheDocument();
    });

    it('displays the analysis name in the message', () => {
      render(
        <DeleteConfirmationModal
          isOpen={true}
          analysisName={testAnalysisName}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      expect(
        screen.getByText(/Test Process/i),
      ).toBeInTheDocument();
    });

    it('renders Annuler and Supprimer buttons', () => {
      render(
        <DeleteConfirmationModal
          isOpen={true}
          analysisName={testAnalysisName}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onCancel when Annuler button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <DeleteConfirmationModal
          isOpen={true}
          analysisName={testAnalysisName}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('calls onConfirm when Supprimer button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <DeleteConfirmationModal
          isOpen={true}
          analysisName={testAnalysisName}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      const deleteButton = screen.getByRole('button', { name: /Delete/i });
      await user.click(deleteButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(mockOnCancel).not.toHaveBeenCalled();
    });

    it('calls onCancel when Escape key is pressed', async () => {
      const user = userEvent.setup();
      render(
        <DeleteConfirmationModal
          isOpen={true}
          analysisName={testAnalysisName}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      await user.keyboard('{Escape}');

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility (WCAG AA)', () => {
    it('has proper ARIA attributes from Modal primitive', () => {
      render(
        <DeleteConfirmationModal
          isOpen={true}
          analysisName={testAnalysisName}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      // Modal primitive provides aria-labelledby and aria-describedby
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
      expect(dialog).toHaveAttribute('aria-describedby');
    });

    it('implements focus trap with Tab navigation', async () => {
      const user = userEvent.setup();
      render(
        <DeleteConfirmationModal
          isOpen={true}
          analysisName={testAnalysisName}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      const closeButton = screen.getByLabelText(/Close modal/i);
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      const deleteButton = screen.getByRole('button', { name: /Delete/i });

      // Modal has 3 focusable elements: close button (×), Cancel, Delete
      // Tab through all buttons
      await user.tab();
      expect(document.activeElement).toBe(closeButton);

      await user.tab();
      expect(document.activeElement).toBe(cancelButton);

      await user.tab();
      expect(document.activeElement).toBe(deleteButton);

      // Tab again should cycle back to first (focus trap)
      await user.tab();
      expect(document.activeElement).toBe(closeButton);
    });

    it('implements focus trap with Shift+Tab (backward navigation)', async () => {
      const user = userEvent.setup();
      render(
        <DeleteConfirmationModal
          isOpen={true}
          analysisName={testAnalysisName}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      const closeButton = screen.getByLabelText(/Close modal/i);
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      const deleteButton = screen.getByRole('button', { name: /Delete/i });

      // Focus close button (first in tab order)
      closeButton.focus();

      // Shift+Tab should go to last button (backward cycle)
      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(document.activeElement).toBe(deleteButton);

      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(document.activeElement).toBe(cancelButton);

      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(document.activeElement).toBe(closeButton);
    });
  });
});
