import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders with children', () => {
    render(<Card data-testid="card">Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('has base Card styles', () => {
    render(<Card data-testid="card">Content</Card>);
    const card = screen.getByTestId('card');

    expect(card).toHaveClass(
      'p-6',
      'rounded-lg',
      'bg-white',
      'border',
      'border-gray-200',
      'shadow-md',
    );
  });

  it('applies clickable styles when clickable prop is true', () => {
    render(<Card clickable data-testid="card">Clickable card</Card>);
    const card = screen.getByTestId('card');

    expect(card).toHaveClass('cursor-pointer', 'hover:shadow-lg', 'hover:border-pfeiffer-red');
    expect(card).toHaveAttribute('role', 'button');
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('applies clickable styles when onClick is provided', () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick} data-testid="card">Clickable card</Card>);
    const card = screen.getByTestId('card');

    expect(card).toHaveClass('cursor-pointer');
    expect(card).toHaveAttribute('role', 'button');
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick} data-testid="card">Click me</Card>);

    const card = screen.getByTestId('card');
    fireEvent.click(card);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not have clickable styles when not clickable', () => {
    render(<Card data-testid="card">Non-clickable card</Card>);
    const card = screen.getByTestId('card');

    expect(card).not.toHaveClass('cursor-pointer');
    expect(card).not.toHaveAttribute('role', 'button');
    expect(card).not.toHaveAttribute('tabIndex');
  });

  it('supports custom className', () => {
    render(<Card className="custom-class" data-testid="card">Content</Card>);
    const card = screen.getByTestId('card');

    expect(card).toHaveClass('custom-class');
  });

  it('merges custom className with base classes', () => {
    render(<Card className="mt-4" data-testid="card">Content</Card>);
    const card = screen.getByTestId('card');

    expect(card).toHaveClass('mt-4', 'p-6', 'rounded-lg', 'bg-white');
  });

  it('forwards other HTML div attributes', () => {
    render(
      <Card data-testid="custom-card" aria-label="Custom card">
        Content
      </Card>,
    );
    const card = screen.getByTestId('custom-card');

    expect(card).toHaveAttribute('aria-label', 'Custom card');
  });
});
