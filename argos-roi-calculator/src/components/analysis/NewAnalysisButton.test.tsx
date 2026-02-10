import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NewAnalysisButton } from './NewAnalysisButton';

describe('NewAnalysisButton', () => {
  it('renders with correct label "New Analysis"', () => {
    render(<NewAnalysisButton />);
    expect(screen.getByRole('button', { name: 'New Analysis' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<NewAnalysisButton onClick={handleClick} />);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('has primary variant styling (Pfeiffer red)', () => {
    render(<NewAnalysisButton />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-pfeiffer-red');
  });

  it('is keyboard accessible with Enter key', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<NewAnalysisButton onClick={handleClick} />);

    const button = screen.getByRole('button');
    button.focus();
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is keyboard accessible with Space key', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<NewAnalysisButton onClick={handleClick} />);

    const button = screen.getByRole('button');
    button.focus();
    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    render(<NewAnalysisButton className="custom-class" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('has visible focus ring', () => {
    render(<NewAnalysisButton />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('focus:ring-2');
    expect(button).toHaveClass('focus:ring-pfeiffer-red');
  });
});
