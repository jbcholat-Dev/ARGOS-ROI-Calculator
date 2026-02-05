import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  it('renders with value', () => {
    render(<Input value="Test value" onChange={() => {}} />);
    const input = screen.getByDisplayValue('Test value');
    expect(input).toBeInTheDocument();
  });

  it('calls onChange when value changes', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'new value' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('renders label when provided', () => {
    render(<Input label="Username" />);
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('associates label with input', () => {
    render(<Input label="Email" />);
    const label = screen.getByText('Email');
    const input = screen.getByRole('textbox');

    expect(label).toHaveAttribute('for', input.id);
  });

  it('displays error message when error prop is provided', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText(/This field is required/)).toBeInTheDocument();
  });

  it('has error styling when error is provided', () => {
    render(<Input error="Error message" />);
    const input = screen.getByRole('textbox');

    expect(input).toHaveClass('border-pfeiffer-red');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('displays helper text when provided', () => {
    render(<Input helperText="Enter your email address" />);
    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
  });

  it('hides helper text when error is shown', () => {
    render(<Input error="Error" helperText="Helper text" />);
    expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
    expect(screen.getByText(/Error/)).toBeInTheDocument();
  });

  it('disables input when disabled prop is true', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');

    expect(input).toBeDisabled();
    expect(input).toHaveClass('bg-gray-100', 'opacity-60', 'cursor-not-allowed');
  });

  it('has focus ring classes for accessibility', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');

    expect(input).toHaveClass(
      'focus:border-pfeiffer-red',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-pfeiffer-red',
    );
  });

  it('links error message with aria-describedby', () => {
    render(<Input error="Error message" />);
    const input = screen.getByRole('textbox');
    const errorMessage = screen.getByText(/Error message/);

    expect(input).toHaveAttribute('aria-describedby');
    expect(input.getAttribute('aria-describedby')).toBe(errorMessage.id);
  });

  it('links helper text with aria-describedby', () => {
    render(<Input helperText="Helper text" />);
    const input = screen.getByRole('textbox');
    const helperText = screen.getByText('Helper text');

    expect(input).toHaveAttribute('aria-describedby');
    expect(input.getAttribute('aria-describedby')).toBe(helperText.id);
  });

  it('supports custom className', () => {
    render(<Input className="custom-class" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-class');
  });

  it('forwards other HTML input attributes', () => {
    render(<Input type="email" placeholder="Enter email" />);
    const input = screen.getByRole('textbox');

    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('placeholder', 'Enter email');
  });

  it('uses provided id over generated id', () => {
    render(<Input id="custom-id" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('id', 'custom-id');
  });
});
