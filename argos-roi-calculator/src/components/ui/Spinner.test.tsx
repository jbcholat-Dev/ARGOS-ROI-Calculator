import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders with default props', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('status');

    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });

  it('renders small size correctly', () => {
    render(<Spinner size="sm" />);
    const spinner = screen.getByRole('status');

    expect(spinner).toHaveClass('h-4', 'w-4', 'border-2');
  });

  it('renders medium size correctly', () => {
    render(<Spinner size="md" />);
    const spinner = screen.getByRole('status');

    expect(spinner).toHaveClass('h-6', 'w-6', 'border-2');
  });

  it('renders large size correctly', () => {
    render(<Spinner size="lg" />);
    const spinner = screen.getByRole('status');

    expect(spinner).toHaveClass('h-12', 'w-12', 'border-4');
  });

  it('renders red color correctly', () => {
    render(<Spinner color="red" />);
    const spinner = screen.getByRole('status');

    expect(spinner).toHaveClass('border-pfeiffer-red', 'border-r-transparent');
  });

  it('renders gray color correctly', () => {
    render(<Spinner color="gray" />);
    const spinner = screen.getByRole('status');

    expect(spinner).toHaveClass('border-gray-400', 'border-r-transparent');
  });

  it('has animate-spin class', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('status');

    expect(spinner).toHaveClass('animate-spin');
  });

  it('has rounded-full class', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('status');

    expect(spinner).toHaveClass('rounded-full');
  });

  it('supports custom className', () => {
    render(<Spinner className="custom-class" />);
    const spinner = screen.getByRole('status');

    expect(spinner).toHaveClass('custom-class');
  });

  it('has correct ARIA attributes for accessibility', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('status');

    expect(spinner).toHaveAttribute('role', 'status');
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });
});
