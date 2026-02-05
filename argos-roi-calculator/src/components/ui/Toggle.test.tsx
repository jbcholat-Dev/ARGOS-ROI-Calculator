import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toggle, type ToggleOption } from './Toggle';

describe('Toggle', () => {
  const options: [ToggleOption, ToggleOption] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
  ];

  it('renders both options', () => {
    render(<Toggle options={options} value="option1" onChange={() => {}} />);

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(
      <Toggle
        options={options}
        value="option1"
        onChange={() => {}}
        label="Select mode"
      />,
    );

    expect(screen.getByText('Select mode')).toBeInTheDocument();
  });

  it('calls onChange when option is clicked', () => {
    const handleChange = vi.fn();
    render(<Toggle options={options} value="option1" onChange={handleChange} />);

    fireEvent.click(screen.getByText('Option 2'));
    expect(handleChange).toHaveBeenCalledWith('option2');
  });

  it('marks active option with correct styles', () => {
    render(<Toggle options={options} value="option1" onChange={() => {}} />);

    const option1 = screen.getByText('Option 1');
    const option2 = screen.getByText('Option 2');

    expect(option1).toHaveClass('bg-pfeiffer-red', 'text-white');
    expect(option2).toHaveClass('bg-transparent', 'text-gray-700');
  });

  it('marks active option with aria-checked="true"', () => {
    render(<Toggle options={options} value="option1" onChange={() => {}} />);

    const option1 = screen.getByText('Option 1');
    const option2 = screen.getByText('Option 2');

    expect(option1).toHaveAttribute('aria-checked', 'true');
    expect(option2).toHaveAttribute('aria-checked', 'false');
  });

  it('has radiogroup role', () => {
    render(<Toggle options={options} value="option1" onChange={() => {}} />);

    const radiogroup = screen.getByRole('radiogroup');
    expect(radiogroup).toBeInTheDocument();
  });

  it('each option has radio role', () => {
    render(<Toggle options={options} value="option1" onChange={() => {}} />);

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);
  });

  it('disables all options when disabled prop is true', () => {
    render(
      <Toggle
        options={options}
        value="option1"
        onChange={() => {}}
        disabled
      />,
    );

    const option1 = screen.getByText('Option 1');
    const option2 = screen.getByText('Option 2');

    expect(option1).toBeDisabled();
    expect(option2).toBeDisabled();
    expect(option1).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('does not call onChange when disabled', () => {
    const handleChange = vi.fn();
    render(
      <Toggle
        options={options}
        value="option1"
        onChange={handleChange}
        disabled
      />,
    );

    fireEvent.click(screen.getByText('Option 2'));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('handles Enter key to select option', () => {
    const handleChange = vi.fn();
    render(<Toggle options={options} value="option1" onChange={handleChange} />);

    const option2 = screen.getByText('Option 2');
    fireEvent.keyDown(option2, { key: 'Enter' });

    expect(handleChange).toHaveBeenCalledWith('option2');
  });

  it('handles Space key to select option', () => {
    const handleChange = vi.fn();
    render(<Toggle options={options} value="option1" onChange={handleChange} />);

    const option2 = screen.getByText('Option 2');
    fireEvent.keyDown(option2, { key: ' ' });

    expect(handleChange).toHaveBeenCalledWith('option2');
  });

  it('handles ArrowRight key to move to next option', () => {
    const handleChange = vi.fn();
    render(<Toggle options={options} value="option1" onChange={handleChange} />);

    const option1 = screen.getByText('Option 1');
    fireEvent.keyDown(option1, { key: 'ArrowRight' });

    expect(handleChange).toHaveBeenCalledWith('option2');
  });

  it('handles ArrowLeft key to move to previous option', () => {
    const handleChange = vi.fn();
    render(<Toggle options={options} value="option2" onChange={handleChange} />);

    const option2 = screen.getByText('Option 2');
    fireEvent.keyDown(option2, { key: 'ArrowLeft' });

    expect(handleChange).toHaveBeenCalledWith('option1');
  });

  it('does not handle keyboard events when disabled', () => {
    const handleChange = vi.fn();
    render(
      <Toggle
        options={options}
        value="option1"
        onChange={handleChange}
        disabled
      />,
    );

    const option2 = screen.getByText('Option 2');
    fireEvent.keyDown(option2, { key: 'Enter' });

    expect(handleChange).not.toHaveBeenCalled();
  });

  it('has focus ring classes for accessibility', () => {
    render(<Toggle options={options} value="option1" onChange={() => {}} />);

    const option1 = screen.getByText('Option 1');
    expect(option1).toHaveClass(
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-pfeiffer-red',
      'focus:ring-offset-2',
    );
  });
});
