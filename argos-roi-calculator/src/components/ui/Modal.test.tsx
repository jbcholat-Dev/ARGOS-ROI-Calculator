import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

describe('Modal', () => {

  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()}>
        <div>Modal Content</div>
      </Modal>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <div>Modal Content</div>
      </Modal>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('displays title when provided', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
        <div>Modal Content</div>
      </Modal>,
    );
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('displays children in body', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <div>Test Body Content</div>
      </Modal>,
    );
    expect(screen.getByText('Test Body Content')).toBeInTheDocument();
  });

  it('displays footer content when provided', () => {
    render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        footer={
          <button type="button" onClick={vi.fn()}>
            Save
          </button>
        }
      >
        <div>Content</div>
      </Modal>,
    );
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test">
        <div>Content</div>
      </Modal>,
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('hides close button when showCloseButton is false', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} showCloseButton={false}>
        <div>Content</div>
      </Modal>,
    );
    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
  });

  it('calls onClose when Escape key is pressed', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Modal isOpen={true} onClose={handleClose}>
        <div>Content</div>
      </Modal>,
    );

    await user.keyboard('{Escape}');
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose on Escape when closeOnEscape is false', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Modal isOpen={true} onClose={handleClose} closeOnEscape={false}>
        <div>Content</div>
      </Modal>,
    );

    await user.keyboard('{Escape}');
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('calls onClose when overlay is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose}>
        <div>Content</div>
      </Modal>,
    );

    const overlay = screen.getByTestId('modal-overlay');
    fireEvent.click(overlay);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when overlay is clicked if closeOnOverlayClick is false', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} closeOnOverlayClick={false}>
        <div>Content</div>
      </Modal>,
    );

    const overlay = screen.getByTestId('modal-overlay');
    fireEvent.click(overlay);
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('does not call onClose when modal content is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose}>
        <div>Content</div>
      </Modal>,
    );

    const content = screen.getByText('Content');
    fireEvent.click(content);
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('has proper ARIA attributes', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
        <div>Content</div>
      </Modal>,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-describedby', 'modal-body');
  });

  it('traps focus within modal', async () => {
    const user = userEvent.setup();
    render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        title="Test"
        footer={
          <>
            <button type="button">Cancel</button>
            <button type="button">Save</button>
          </>
        }
      >
        <input type="text" placeholder="Name" />
      </Modal>,
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    const input = screen.getByPlaceholderText('Name');
    const cancelButton = screen.getByText('Cancel');
    const saveButton = screen.getByText('Save');

    // Tab through elements
    await user.tab();
    expect(closeButton).toHaveFocus();

    await user.tab();
    expect(input).toHaveFocus();

    await user.tab();
    expect(cancelButton).toHaveFocus();

    await user.tab();
    expect(saveButton).toHaveFocus();

    // Tab should wrap to first element
    await user.tab();
    expect(closeButton).toHaveFocus();
  });

  it('traps focus backwards with Shift+Tab', async () => {
    const user = userEvent.setup();
    render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        title="Test"
        footer={
          <>
            <button type="button">Cancel</button>
            <button type="button">Save</button>
          </>
        }
      >
        <input type="text" placeholder="Name" />
      </Modal>,
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    const input = screen.getByPlaceholderText('Name');
    const cancelButton = screen.getByText('Cancel');
    const saveButton = screen.getByText('Save');

    // Start at first element (close button)
    await user.tab();
    expect(closeButton).toHaveFocus();

    // Shift+Tab should wrap to last element
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(saveButton).toHaveFocus();

    // Continue backwards
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(cancelButton).toHaveFocus();

    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(input).toHaveFocus();

    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(closeButton).toHaveFocus();
  });

  it('restores focus to previous element on close', () => {
    const handleClose = vi.fn();
    const triggerButton = document.createElement('button');
    triggerButton.textContent = 'Open Modal';
    document.body.appendChild(triggerButton);
    triggerButton.focus();

    const { rerender } = render(
      <Modal isOpen={true} onClose={handleClose}>
        <div>Content</div>
      </Modal>,
    );

    // Modal should be open and focused
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Close modal
    rerender(
      <Modal isOpen={false} onClose={handleClose}>
        <div>Content</div>
      </Modal>,
    );

    // Focus should return to trigger button
    expect(document.activeElement).toBe(triggerButton);

    // Cleanup
    document.body.removeChild(triggerButton);
  });

  it('locks body scroll when modal is open', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <div>Content</div>
      </Modal>,
    );

    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <Modal isOpen={false} onClose={vi.fn()}>
        <div>Content</div>
      </Modal>,
    );

    expect(document.body.style.overflow).toBe('');
  });

  it('applies custom className to modal content', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} className="custom-modal-class">
        <div>Content</div>
      </Modal>,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('custom-modal-class');
  });

  it('close button is keyboard accessible', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Modal isOpen={true} onClose={handleClose} title="Test">
        <div>Content</div>
      </Modal>,
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    closeButton.focus();

    // Test Enter key
    await user.keyboard('{Enter}');
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
