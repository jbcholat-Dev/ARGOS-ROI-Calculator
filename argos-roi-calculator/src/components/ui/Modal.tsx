import { clsx } from 'clsx';
import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // Handle focus management
  useEffect(() => {
    if (!isOpen) return;

    // Store previously focused element
    previousActiveElementRef.current = document.activeElement as HTMLElement;

    // Focus the dialog
    if (dialogRef.current) {
      dialogRef.current.focus();
    }

    // Restore focus on cleanup
    return () => {
      if (previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
      }
    };
  }, [isOpen]);

  // Handle keyboard interactions (Escape + Tab/Shift+Tab)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle Escape key
      if (event.key === 'Escape' && closeOnEscape) {
        event.preventDefault();
        event.stopPropagation();
        onClose();
        return;
      }

      // Handle Tab key for focus trap
      if (event.key === 'Tab' && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );

        const focusableArray = Array.from(focusableElements);
        const firstElement = focusableArray[0];
        const lastElement = focusableArray[focusableArray.length - 1];

        if (!firstElement) return;

        if (event.shiftKey) {
          // Shift+Tab: moving backwards
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab: moving forwards
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeOnEscape, onClose]);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle overlay click
  const handleOverlayClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (closeOnOverlayClick && event.target === event.currentTarget) {
        onClose();
      }
    },
    [closeOnOverlayClick, onClose],
  );

  if (!isOpen) return null;

  const titleId = title ? 'modal-title' : undefined;
  const bodyId = 'modal-body';

  const modalContent = (
    <div
      className={clsx(
        // Layout
        'fixed inset-0 z-50',
        'flex items-center justify-center',
        // Spacing
        'p-4',
      )}
      data-testid="modal-overlay"
      onClick={handleOverlayClick}
    >
      {/* Overlay */}
      <div
        className={clsx(
          // Layout
          'fixed inset-0',
          // Colors
          'bg-black/50',
        )}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        tabIndex={-1}
        className={clsx(
          // Layout
          'relative z-10',
          'flex flex-col',
          'max-h-[90vh]',
          'w-full max-w-[500px]',
          'rounded-lg',
          // Colors
          'bg-white',
          // Effects
          'shadow-xl',
          'transition-all duration-200 opacity-100 scale-100',
          className,
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div
            className={clsx(
              // Layout
              'flex items-center justify-between',
              // Spacing
              'px-6 py-4',
              // Colors
              'border-b border-gray-200',
            )}
          >
            {title && (
              <h2
                id={titleId}
                className={clsx(
                  // Typography
                  'text-xl font-bold',
                  // Colors
                  'text-gray-900',
                )}
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className={clsx(
                  // Layout
                  'inline-flex items-center justify-center',
                  'rounded',
                  // Spacing
                  'p-2',
                  // Typography
                  'text-2xl leading-none',
                  // Colors
                  'text-gray-500',
                  // Effects
                  'transition-colors',
                  'hover:bg-gray-100 hover:text-pfeiffer-red',
                  'focus:outline-none focus:ring-2 focus:ring-pfeiffer-red focus:ring-offset-2',
                )}
              >
                &times;
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div
          id={bodyId}
          className={clsx(
            // Layout
            'flex-1 overflow-y-auto',
            // Spacing
            'px-6 py-4',
          )}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className={clsx(
              // Layout
              'flex items-center justify-end gap-3',
              // Spacing
              'px-6 py-4',
              // Colors
              'border-t border-gray-200',
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
