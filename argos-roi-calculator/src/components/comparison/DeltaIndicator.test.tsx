import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DeltaIndicator } from './DeltaIndicator';
import { DELTA_POSITIVE_COLOR, DELTA_NEGATIVE_COLOR, DELTA_NEUTRAL_COLOR } from '@/lib/constants';

describe('DeltaIndicator', () => {
  it('shows green with up arrow for positive delta (default)', () => {
    render(<DeltaIndicator originalValue={100} whatIfValue={200} format="currency" />);

    const indicator = screen.getByText(/\u0394/);
    expect(indicator).toHaveStyle({ color: DELTA_POSITIVE_COLOR });
    expect(indicator.textContent).toContain('\u2191'); // up arrow
  });

  it('shows red with down arrow for negative delta (default)', () => {
    render(<DeltaIndicator originalValue={200} whatIfValue={100} format="currency" />);

    const indicator = screen.getByText(/\u0394/);
    expect(indicator).toHaveStyle({ color: DELTA_NEGATIVE_COLOR });
    expect(indicator.textContent).toContain('\u2193'); // down arrow
  });

  it('shows gray with no arrow for zero delta', () => {
    render(<DeltaIndicator originalValue={100} whatIfValue={100} format="currency" />);

    const indicator = screen.getByText(/\u0394/);
    expect(indicator).toHaveStyle({ color: DELTA_NEUTRAL_COLOR });
    expect(indicator.textContent).not.toContain('\u2191');
    expect(indicator.textContent).not.toContain('\u2193');
  });

  it('formats currency delta with EUR and thousands separator', () => {
    render(<DeltaIndicator originalValue={0} whatIfValue={1070000} format="currency" />);

    const indicator = screen.getByText(/\u0394/);
    // Should show €1 070 000
    expect(indicator.textContent).toMatch(/€.*1[\s\u00a0\u202f]070[\s\u00a0\u202f]000/);
  });

  it('formats percentage delta', () => {
    render(<DeltaIndicator originalValue={50} whatIfValue={65} format="percentage" />);

    const indicator = screen.getByText(/\u0394/);
    expect(indicator.textContent).toContain('15.0%');
  });

  it('inverts color for costs: positive delta is red (higher cost = bad)', () => {
    render(
      <DeltaIndicator originalValue={100} whatIfValue={200} format="currency" invertColor />
    );

    const indicator = screen.getByText(/\u0394/);
    expect(indicator).toHaveStyle({ color: DELTA_NEGATIVE_COLOR });
  });

  it('inverts color for costs: negative delta is green (lower cost = good)', () => {
    render(
      <DeltaIndicator originalValue={200} whatIfValue={100} format="currency" invertColor />
    );

    const indicator = screen.getByText(/\u0394/);
    expect(indicator).toHaveStyle({ color: DELTA_POSITIVE_COLOR });
  });

  it('has accessibility label describing the change', () => {
    render(<DeltaIndicator originalValue={100} whatIfValue={200} format="percentage" />);

    const indicator = screen.getByLabelText(/Value increased by 100\.0 percent/);
    expect(indicator).toBeInTheDocument();
  });

  it('handles zero original value without division by zero', () => {
    render(<DeltaIndicator originalValue={0} whatIfValue={500} format="currency" />);

    const indicator = screen.getByText(/\u0394/);
    expect(indicator).toBeInTheDocument();
    expect(indicator.textContent).toContain('\u2191');
  });
});
