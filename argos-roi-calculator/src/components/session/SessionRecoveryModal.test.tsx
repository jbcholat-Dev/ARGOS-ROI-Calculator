import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionRecoveryModal } from './SessionRecoveryModal';

describe('SessionRecoveryModal', () => {
  const mockOnResume = vi.fn();
  const mockOnStartNew = vi.fn();

  beforeEach(() => {
    mockOnResume.mockClear();
    mockOnStartNew.mockClear();
  });

  describe('Rendering', () => {
    it('renders when isOpen is true', () => {
      render(
        <SessionRecoveryModal
          isOpen={true}
          onResume={mockOnResume}
          onStartNew={mockOnStartNew}
        />,
      );

      expect(screen.getByText('Previous session detected')).toBeInTheDocument();
      expect(
        screen.getByText(/Data from a previous session was found/),
      ).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(
        <SessionRecoveryModal
          isOpen={false}
          onResume={mockOnResume}
          onStartNew={mockOnStartNew}
        />,
      );

      expect(screen.queryByText('Previous session detected')).not.toBeInTheDocument();
    });

    it('renders Resume and Start new session buttons', () => {
      render(
        <SessionRecoveryModal
          isOpen={true}
          onResume={mockOnResume}
          onStartNew={mockOnStartNew}
        />,
      );

      expect(screen.getByRole('button', { name: /Resume previous session/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Start new session/i })).toBeInTheDocument();
    });

    it('does not show close button', () => {
      render(
        <SessionRecoveryModal
          isOpen={true}
          onResume={mockOnResume}
          onStartNew={mockOnStartNew}
        />,
      );

      expect(screen.queryByRole('button', { name: /close modal/i })).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onResume when Resume button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <SessionRecoveryModal
          isOpen={true}
          onResume={mockOnResume}
          onStartNew={mockOnStartNew}
        />,
      );

      await user.click(screen.getByRole('button', { name: /Resume previous session/i }));

      expect(mockOnResume).toHaveBeenCalledTimes(1);
      expect(mockOnStartNew).not.toHaveBeenCalled();
    });

    it('calls onStartNew when Start new session button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <SessionRecoveryModal
          isOpen={true}
          onResume={mockOnResume}
          onStartNew={mockOnStartNew}
        />,
      );

      await user.click(screen.getByRole('button', { name: /Start new session/i }));

      expect(mockOnStartNew).toHaveBeenCalledTimes(1);
      expect(mockOnResume).not.toHaveBeenCalled();
    });

    it('calls onResume when Escape key is pressed', async () => {
      const user = userEvent.setup();
      render(
        <SessionRecoveryModal
          isOpen={true}
          onResume={mockOnResume}
          onStartNew={mockOnStartNew}
        />,
      );

      await user.keyboard('{Escape}');

      expect(mockOnResume).toHaveBeenCalledTimes(1);
    });

    it('does not close when overlay is clicked', () => {
      render(
        <SessionRecoveryModal
          isOpen={true}
          onResume={mockOnResume}
          onStartNew={mockOnStartNew}
        />,
      );

      const overlay = screen.getByTestId('modal-overlay');
      overlay.click();

      expect(mockOnResume).not.toHaveBeenCalled();
      expect(mockOnStartNew).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility (WCAG AA)', () => {
    it('has proper ARIA attributes from Modal primitive', () => {
      render(
        <SessionRecoveryModal
          isOpen={true}
          onResume={mockOnResume}
          onStartNew={mockOnStartNew}
        />,
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby');
      expect(dialog).toHaveAttribute('aria-describedby');
    });

    it('implements focus trap with Tab navigation', async () => {
      const user = userEvent.setup();
      render(
        <SessionRecoveryModal
          isOpen={true}
          onResume={mockOnResume}
          onStartNew={mockOnStartNew}
        />,
      );

      const startNewButton = screen.getByRole('button', { name: /Start new session/i });
      const resumeButton = screen.getByRole('button', { name: /Resume previous session/i });

      // No close button, so only 2 focusable elements
      await user.tab();
      expect(document.activeElement).toBe(startNewButton);

      await user.tab();
      expect(document.activeElement).toBe(resumeButton);

      // Tab wraps to first
      await user.tab();
      expect(document.activeElement).toBe(startNewButton);
    });

    it('implements focus trap with Shift+Tab (backward navigation)', async () => {
      const user = userEvent.setup();
      render(
        <SessionRecoveryModal
          isOpen={true}
          onResume={mockOnResume}
          onStartNew={mockOnStartNew}
        />,
      );

      const startNewButton = screen.getByRole('button', { name: /Start new session/i });
      const resumeButton = screen.getByRole('button', { name: /Resume previous session/i });

      // Focus first button
      startNewButton.focus();

      // Shift+Tab wraps to last
      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(document.activeElement).toBe(resumeButton);

      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(document.activeElement).toBe(startNewButton);
    });
  });
});
