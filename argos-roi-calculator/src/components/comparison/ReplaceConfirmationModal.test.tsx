import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReplaceConfirmationModal } from './ReplaceConfirmationModal';

describe('ReplaceConfirmationModal', () => {
  it('renders title and body text when open', () => {
    render(
      <ReplaceConfirmationModal isOpen={true} onConfirm={vi.fn()} onCancel={vi.fn()} />,
    );

    expect(screen.getByText('Replace Original Analysis?')).toBeInTheDocument();
    expect(
      screen.getByText(
        'The What-If scenario will replace the original analysis. This action cannot be undone.',
      ),
    ).toBeInTheDocument();
  });

  it('fires onConfirm when Replace button is clicked', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();

    render(
      <ReplaceConfirmationModal isOpen={true} onConfirm={onConfirm} onCancel={vi.fn()} />,
    );

    await user.click(screen.getByRole('button', { name: /Replace/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('fires onCancel when Cancel button is clicked', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();

    render(
      <ReplaceConfirmationModal isOpen={true} onConfirm={vi.fn()} onCancel={onCancel} />,
    );

    await user.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('fires onCancel when Escape key is pressed', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();

    render(
      <ReplaceConfirmationModal isOpen={true} onConfirm={vi.fn()} onCancel={onCancel} />,
    );

    await user.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalled();
  });

  it('fires onCancel when backdrop is clicked', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();

    render(
      <ReplaceConfirmationModal isOpen={true} onConfirm={vi.fn()} onCancel={onCancel} />,
    );

    const overlay = screen.getByTestId('modal-overlay');
    await user.click(overlay);
    expect(onCancel).toHaveBeenCalled();
  });

  it('traps focus with Tab and Shift+Tab', async () => {
    const user = userEvent.setup();

    render(
      <ReplaceConfirmationModal isOpen={true} onConfirm={vi.fn()} onCancel={vi.fn()} />,
    );

    const closeButton = screen.getByLabelText('Close modal');
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    const replaceButton = screen.getByRole('button', { name: /Replace/i });

    // Focus the close button (first focusable)
    closeButton.focus();
    expect(document.activeElement).toBe(closeButton);

    // Tab from close → cancel → replace → wraps back to close
    await user.tab();
    expect(document.activeElement).toBe(cancelButton);

    await user.tab();
    expect(document.activeElement).toBe(replaceButton);

    await user.tab();
    expect(document.activeElement).toBe(closeButton);

    // Shift+Tab from close → wraps to replace
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(document.activeElement).toBe(replaceButton);
  });

  it('has aria-labelledby and aria-describedby on dialog', () => {
    render(
      <ReplaceConfirmationModal isOpen={true} onConfirm={vi.fn()} onCancel={vi.fn()} />,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'modal-body');
  });

  it('does not render when isOpen is false', () => {
    render(
      <ReplaceConfirmationModal isOpen={false} onConfirm={vi.fn()} onCancel={vi.fn()} />,
    );

    expect(screen.queryByText('Replace Original Analysis?')).not.toBeInTheDocument();
  });
});
