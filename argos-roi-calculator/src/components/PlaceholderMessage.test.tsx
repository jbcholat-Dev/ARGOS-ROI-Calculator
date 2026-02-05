import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlaceholderMessage } from './PlaceholderMessage';

describe('PlaceholderMessage', () => {
  describe('rendering', () => {
    it('should render message text', () => {
      render(<PlaceholderMessage message="Test message" />);

      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('should render message with large text style', () => {
      render(<PlaceholderMessage message="Test message" />);

      const message = screen.getByText('Test message');
      expect(message).toHaveClass('text-2xl');
    });

    it('should render message with gray color', () => {
      render(<PlaceholderMessage message="Test message" />);

      const message = screen.getByText('Test message');
      expect(message).toHaveClass('text-gray-600');
    });
  });

  describe('with action button', () => {
    it('should render action button when actionText provided', () => {
      render(
        <PlaceholderMessage
          message="Test message"
          actionText="Click Me"
          onAction={() => {}}
        />
      );

      expect(screen.getByRole('button', { name: 'Click Me' })).toBeInTheDocument();
    });

    it('should not render button when actionText not provided', () => {
      render(<PlaceholderMessage message="Test message" />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should call onAction when button clicked', async () => {
      const user = userEvent.setup();
      const onAction = vi.fn();

      render(
        <PlaceholderMessage
          message="Test message"
          actionText="Click Me"
          onAction={onAction}
        />
      );

      const button = screen.getByRole('button', { name: 'Click Me' });
      await user.click(button);

      expect(onAction).toHaveBeenCalledTimes(1);
    });

    it('should use primary variant for action button', () => {
      render(
        <PlaceholderMessage
          message="Test message"
          actionText="Click Me"
          onAction={() => {}}
        />
      );

      const button = screen.getByRole('button', { name: 'Click Me' });
      expect(button).toHaveClass('bg-pfeiffer-red');
    });

    it('should use large size for action button', () => {
      render(
        <PlaceholderMessage
          message="Test message"
          actionText="Click Me"
          onAction={() => {}}
        />
      );

      const button = screen.getByRole('button', { name: 'Click Me' });
      // Large button size from Button component (Story 1.4)
      expect(button).toHaveClass('px-8');
      expect(button).toHaveClass('py-4');
    });
  });

  describe('layout', () => {
    it('should center content vertically and horizontally', () => {
      const { container } = render(<PlaceholderMessage message="Test message" />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('flex');
      expect(wrapper).toHaveClass('items-center');
      expect(wrapper).toHaveClass('justify-center');
    });

    it('should render button below message when provided', () => {
      render(
        <PlaceholderMessage
          message="Test message"
          actionText="Click Me"
          onAction={() => {}}
        />
      );

      const message = screen.getByText('Test message');
      const button = screen.getByRole('button', { name: 'Click Me' });

      // Button should be in the DOM after the message
      expect(message.compareDocumentPosition(button)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      );
    });

    it('should use flex column layout for message and button', () => {
      const { container } = render(
        <PlaceholderMessage
          message="Test message"
          actionText="Click Me"
          onAction={() => {}}
        />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('flex-col');
    });
  });
});
