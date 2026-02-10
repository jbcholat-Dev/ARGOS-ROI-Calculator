import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FailureRateModeToggle } from './FailureRateModeToggle';

describe('FailureRateModeToggle', () => {
  const defaultProps = {
    mode: 'percentage' as const,
    onChange: vi.fn(),
  };

  describe('Rendering', () => {
    it('renders both mode options', () => {
      render(<FailureRateModeToggle {...defaultProps} />);
      expect(screen.getByText('Rate (%)')).toBeInTheDocument();
      expect(screen.getByText('Failures Count/year')).toBeInTheDocument();
    });

    it('renders with radiogroup role', () => {
      render(<FailureRateModeToggle {...defaultProps} />);
      expect(
        screen.getByRole('radiogroup', { name: 'Failure Rate Input Mode' }),
      ).toBeInTheDocument();
    });

    it('shows percentage mode as active by default', () => {
      render(<FailureRateModeToggle {...defaultProps} />);
      const percentageRadio = screen.getByRole('radio', { name: 'Rate (%)' });
      expect(percentageRadio).toHaveAttribute('aria-checked', 'true');
    });

    it('shows count mode as active when mode is absolute', () => {
      render(
        <FailureRateModeToggle {...defaultProps} mode="absolute" />,
      );
      const countRadio = screen.getByRole('radio', {
        name: 'Failures Count/year',
      });
      expect(countRadio).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('Interactions', () => {
    it('calls onChange with "absolute" when count mode is clicked', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <FailureRateModeToggle {...defaultProps} onChange={onChange} />,
      );

      await user.click(screen.getByText('Failures Count/year'));
      expect(onChange).toHaveBeenCalledWith('absolute');
    });

    it('calls onChange with "percentage" when percentage mode is clicked', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <FailureRateModeToggle
          {...defaultProps}
          mode="absolute"
          onChange={onChange}
        />,
      );

      await user.click(screen.getByText('Rate (%)'));
      expect(onChange).toHaveBeenCalledWith('percentage');
    });
  });

  describe('Disabled state', () => {
    it('disables toggle when disabled prop is true', () => {
      render(
        <FailureRateModeToggle {...defaultProps} disabled />,
      );
      const percentageRadio = screen.getByRole('radio', { name: 'Rate (%)' });
      expect(percentageRadio).toBeDisabled();
    });

    it('shows disabled message when provided', () => {
      render(
        <FailureRateModeToggle
          {...defaultProps}
          disabled
          disabledMessage="Entrez d'abord le Pump Quantity"
        />,
      );
      expect(
        screen.getByText("Entrez d'abord le Pump Quantity"),
      ).toBeInTheDocument();
    });

    it('does not show disabled message when not disabled', () => {
      render(
        <FailureRateModeToggle
          {...defaultProps}
          disabledMessage="Entrez d'abord le Pump Quantity"
        />,
      );
      expect(
        screen.queryByText("Entrez d'abord le Pump Quantity"),
      ).not.toBeInTheDocument();
    });
  });

  describe('Keyboard navigation', () => {
    it('switches mode with ArrowRight key', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <FailureRateModeToggle {...defaultProps} onChange={onChange} />,
      );

      const percentageRadio = screen.getByRole('radio', { name: 'Rate (%)' });
      percentageRadio.focus();
      await user.keyboard('{ArrowRight}');
      expect(onChange).toHaveBeenCalledWith('absolute');
    });

    it('switches mode with ArrowLeft key', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <FailureRateModeToggle
          {...defaultProps}
          mode="absolute"
          onChange={onChange}
        />,
      );

      const countRadio = screen.getByRole('radio', {
        name: 'Failures Count/year',
      });
      countRadio.focus();
      await user.keyboard('{ArrowLeft}');
      expect(onChange).toHaveBeenCalledWith('percentage');
    });
  });
});
