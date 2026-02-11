import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComparisonActionBar } from './ComparisonActionBar';

const defaultProps = {
  onSaveBoth: vi.fn(),
  onDiscard: vi.fn(),
  onReplaceOriginal: vi.fn(),
};

describe('ComparisonActionBar', () => {
  it('renders all action buttons with correct labels', () => {
    render(<ComparisonActionBar {...defaultProps} />);

    expect(screen.getByRole('button', { name: /Save Both/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Discard What If/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Replace Original/i })).toBeInTheDocument();
  });

  it('renders panel labels', () => {
    render(<ComparisonActionBar {...defaultProps} />);

    expect(screen.getByText('Original Scenario')).toBeInTheDocument();
    expect(screen.getByText('What If Scenario')).toBeInTheDocument();
  });

  it('fires onSaveBoth when Save Both button is clicked', async () => {
    const onSaveBoth = vi.fn();
    const user = userEvent.setup();

    render(<ComparisonActionBar {...defaultProps} onSaveBoth={onSaveBoth} />);

    await user.click(screen.getByRole('button', { name: /Save Both/i }));
    expect(onSaveBoth).toHaveBeenCalledTimes(1);
  });

  it('fires onDiscard when Discard button is clicked', async () => {
    const onDiscard = vi.fn();
    const user = userEvent.setup();

    render(<ComparisonActionBar {...defaultProps} onDiscard={onDiscard} />);

    await user.click(screen.getByRole('button', { name: /Discard What If/i }));
    expect(onDiscard).toHaveBeenCalledTimes(1);
  });

  it('fires onReplaceOriginal when Replace Original button is clicked', async () => {
    const onReplaceOriginal = vi.fn();
    const user = userEvent.setup();

    render(<ComparisonActionBar {...defaultProps} onReplaceOriginal={onReplaceOriginal} />);

    await user.click(screen.getByRole('button', { name: /Replace Original/i }));
    expect(onReplaceOriginal).toHaveBeenCalledTimes(1);
  });

  it('fires onDiscard when Escape key is pressed', async () => {
    const onDiscard = vi.fn();
    const user = userEvent.setup();

    render(<ComparisonActionBar {...defaultProps} onDiscard={onDiscard} />);

    await user.keyboard('{Escape}');
    expect(onDiscard).toHaveBeenCalledTimes(1);
  });

  it('buttons are keyboard accessible (Enter key)', async () => {
    const onSaveBoth = vi.fn();
    const user = userEvent.setup();

    render(<ComparisonActionBar {...defaultProps} onSaveBoth={onSaveBoth} />);

    const saveBtn = screen.getByRole('button', { name: /Save Both/i });
    saveBtn.focus();
    await user.keyboard('{Enter}');
    expect(onSaveBoth).toHaveBeenCalledTimes(1);
  });
});
