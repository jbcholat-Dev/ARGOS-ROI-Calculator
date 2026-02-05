import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toast } from './Toast';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders with message', () => {
    render(
      <Toast variant="success" message="Operation successful" onDismiss={() => {}} />,
    );

    expect(screen.getByText('Operation successful')).toBeInTheDocument();
  });

  it('renders success variant with correct styles and icon', () => {
    render(
      <Toast variant="success" message="Success message" onDismiss={() => {}} />,
    );

    const toast = screen.getByRole('status');
    expect(toast).toHaveClass('bg-roi-positive', 'text-white');
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('renders error variant with correct styles and icon', () => {
    render(
      <Toast variant="error" message="Error message" onDismiss={() => {}} />,
    );

    const toast = screen.getByRole('alert');
    expect(toast).toHaveClass('bg-pfeiffer-red', 'text-white');
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('renders warning variant with correct styles and icon', () => {
    render(
      <Toast variant="warning" message="Warning message" onDismiss={() => {}} />,
    );

    const toast = screen.getByRole('alert');
    expect(toast).toHaveClass('bg-roi-warning', 'text-white');
    expect(screen.getByText('⚡')).toBeInTheDocument();
  });

  it('renders info variant with correct styles and icon', () => {
    render(
      <Toast variant="info" message="Info message" onDismiss={() => {}} />,
    );

    const toast = screen.getByRole('status');
    expect(toast).toHaveClass('bg-toast-info', 'text-white');
    expect(screen.getByText('ℹ️')).toBeInTheDocument();
  });

  it('has correct aria-live attribute for success', () => {
    render(
      <Toast variant="success" message="Success" onDismiss={() => {}} />,
    );

    const toast = screen.getByRole('status');
    expect(toast).toHaveAttribute('aria-live', 'polite');
  });

  it('has correct aria-live attribute for error', () => {
    render(
      <Toast variant="error" message="Error" onDismiss={() => {}} />,
    );

    const toast = screen.getByRole('alert');
    expect(toast).toHaveAttribute('aria-live', 'assertive');
  });

  it('calls onDismiss when close button is clicked', () => {
    const handleDismiss = vi.fn();
    render(
      <Toast variant="success" message="Message" onDismiss={handleDismiss} />,
    );

    const dismissButton = screen.getByRole('button', {
      name: 'Dismiss notification',
    });
    fireEvent.click(dismissButton);

    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it('auto-dismisses after 3 seconds by default for success', () => {
    const handleDismiss = vi.fn();
    render(
      <Toast variant="success" message="Message" onDismiss={handleDismiss} />,
    );

    expect(handleDismiss).not.toHaveBeenCalled();

    vi.advanceTimersByTime(3000);

    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it('auto-dismisses after 5 seconds for error variant', () => {
    const handleDismiss = vi.fn();
    render(
      <Toast variant="error" message="Error" onDismiss={handleDismiss} />,
    );

    vi.advanceTimersByTime(4999);
    expect(handleDismiss).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not auto-dismiss when autoDismiss is false', () => {
    const handleDismiss = vi.fn();
    render(
      <Toast
        variant="success"
        message="Message"
        onDismiss={handleDismiss}
        autoDismiss={false}
      />,
    );

    vi.advanceTimersByTime(10000);

    expect(handleDismiss).not.toHaveBeenCalled();
  });

  it('uses custom duration when provided', () => {
    const handleDismiss = vi.fn();
    render(
      <Toast
        variant="success"
        message="Message"
        onDismiss={handleDismiss}
        duration={1000}
      />,
    );

    vi.advanceTimersByTime(999);
    expect(handleDismiss).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it('clears timeout when unmounted', () => {
    const handleDismiss = vi.fn();
    const { unmount } = render(
      <Toast variant="success" message="Message" onDismiss={handleDismiss} />,
    );

    unmount();
    vi.advanceTimersByTime(5000);

    expect(handleDismiss).not.toHaveBeenCalled();
  });
});
