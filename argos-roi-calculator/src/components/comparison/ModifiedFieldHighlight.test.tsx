import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ModifiedFieldHighlight } from './ModifiedFieldHighlight';

describe('ModifiedFieldHighlight', () => {
  it('renders children without highlight when string values are equal', () => {
    render(
      <ModifiedFieldHighlight originalValue="A3004XN" currentValue="A3004XN">
        <span>Content</span>
      </ModifiedFieldHighlight>,
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.queryByText('MODIFIED')).not.toBeInTheDocument();
  });

  it('renders children without highlight when number values are equal', () => {
    render(
      <ModifiedFieldHighlight originalValue={10} currentValue={10}>
        <span>Content</span>
      </ModifiedFieldHighlight>,
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.queryByText('MODIFIED')).not.toBeInTheDocument();
  });

  it('shows orange border when values differ', () => {
    render(
      <ModifiedFieldHighlight originalValue={10} currentValue={15}>
        <span>Content</span>
      </ModifiedFieldHighlight>,
    );

    const wrapper = screen.getByTestId('modified-highlight');
    expect(wrapper.style.border).toBe('2px solid rgb(255, 88, 0)');
  });

  it('shows background tint when values differ', () => {
    render(
      <ModifiedFieldHighlight originalValue={10} currentValue={15}>
        <span>Content</span>
      </ModifiedFieldHighlight>,
    );

    const wrapper = screen.getByTestId('modified-highlight');
    expect(wrapper).toHaveStyle({ background: 'rgba(255, 88, 0, 0.05)' });
  });

  it('shows MODIFIED badge text when values differ', () => {
    render(
      <ModifiedFieldHighlight originalValue="A3004XN" currentValue="A4001XN">
        <span>Content</span>
      </ModifiedFieldHighlight>,
    );

    expect(screen.getByText('MODIFIED')).toBeInTheDocument();
  });

  it('badge has correct aria-label', () => {
    render(
      <ModifiedFieldHighlight originalValue={10} currentValue={15}>
        <span>Content</span>
      </ModifiedFieldHighlight>,
    );

    expect(
      screen.getByLabelText('Field modified from original value'),
    ).toBeInTheDocument();
  });

  it('removes highlight when value is reverted to original', () => {
    const { rerender } = render(
      <ModifiedFieldHighlight originalValue={10} currentValue={15}>
        <span>Content</span>
      </ModifiedFieldHighlight>,
    );

    expect(screen.getByText('MODIFIED')).toBeInTheDocument();

    rerender(
      <ModifiedFieldHighlight originalValue={10} currentValue={10}>
        <span>Content</span>
      </ModifiedFieldHighlight>,
    );

    expect(screen.queryByText('MODIFIED')).not.toBeInTheDocument();
  });

  it('handles undefined values without error', () => {
    render(
      <ModifiedFieldHighlight originalValue={undefined} currentValue={undefined}>
        <span>Content</span>
      </ModifiedFieldHighlight>,
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.queryByText('MODIFIED')).not.toBeInTheDocument();
  });

  it('shows highlight when original is undefined and current has value', () => {
    render(
      <ModifiedFieldHighlight originalValue={undefined} currentValue={5}>
        <span>Content</span>
      </ModifiedFieldHighlight>,
    );

    expect(screen.getByText('MODIFIED')).toBeInTheDocument();
  });

  it('shows highlight when isModified prop is true (direct boolean)', () => {
    render(
      <ModifiedFieldHighlight isModified={true}>
        <span>Content</span>
      </ModifiedFieldHighlight>,
    );

    expect(screen.getByText('MODIFIED')).toBeInTheDocument();
    expect(screen.getByTestId('modified-highlight')).toBeInTheDocument();
  });

  it('hides highlight when isModified prop is false (direct boolean)', () => {
    render(
      <ModifiedFieldHighlight isModified={false}>
        <span>Content</span>
      </ModifiedFieldHighlight>,
    );

    expect(screen.queryByText('MODIFIED')).not.toBeInTheDocument();
  });

  it('isModified prop overrides value comparison', () => {
    render(
      <ModifiedFieldHighlight isModified={false} originalValue={10} currentValue={15}>
        <span>Content</span>
      </ModifiedFieldHighlight>,
    );

    expect(screen.queryByText('MODIFIED')).not.toBeInTheDocument();
  });
});
