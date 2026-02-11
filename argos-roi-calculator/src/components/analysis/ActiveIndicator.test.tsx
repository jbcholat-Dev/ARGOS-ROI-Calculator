import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActiveIndicator } from './ActiveIndicator';

describe('ActiveIndicator', () => {
  it('renders badge variant with text and checkmark icon', () => {
    render(<ActiveIndicator variant="badge" />);

    expect(screen.getByText('Active Analysis')).toBeInTheDocument();
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    // SVG checkmark icon should be present
    expect(status.querySelector('svg')).toBeInTheDocument();
  });

  it('renders dot variant without text', () => {
    render(<ActiveIndicator variant="dot" />);

    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(screen.queryByText('Active Analysis')).not.toBeInTheDocument();
    expect(status.querySelector('svg')).not.toBeInTheDocument();
  });

  it('applies correct size classes for sm dot', () => {
    render(<ActiveIndicator variant="dot" size="sm" />);
    const status = screen.getByRole('status');
    expect(status).toHaveClass('w-3', 'h-3');
  });

  it('applies correct size classes for lg badge', () => {
    render(<ActiveIndicator variant="badge" size="lg" />);
    const status = screen.getByRole('status');
    expect(status).toHaveClass('text-base');
  });

  it('applies custom className', () => {
    render(<ActiveIndicator variant="badge" className="ml-4" />);
    const status = screen.getByRole('status');
    expect(status).toHaveClass('ml-4');
  });

  it('has correct ARIA attributes for badge', () => {
    render(<ActiveIndicator variant="badge" />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-label', 'Active Analysis');
  });

  it('has correct ARIA attributes for dot', () => {
    render(<ActiveIndicator variant="dot" />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-label', 'Active Analysis');
  });

  it('renders with green background', () => {
    render(<ActiveIndicator variant="badge" />);
    const status = screen.getByRole('status');
    expect(status).toHaveClass('bg-green-600');
  });

  it('badge has white text', () => {
    render(<ActiveIndicator variant="badge" />);
    const status = screen.getByRole('status');
    expect(status).toHaveClass('text-white');
  });
});
