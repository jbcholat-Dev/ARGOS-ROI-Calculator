import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface SessionRecoveryModalProps {
  isOpen: boolean;
  onResume: () => void;
  onStartNew: () => void;
}

/**
 * Modal shown on app mount when previous session data exists in localStorage.
 * Offers two choices: resume previous session or start fresh.
 * Uses Modal primitive for WCAG AA accessibility (aria-labelledby, aria-describedby, focus trap).
 */
export function SessionRecoveryModal({
  isOpen,
  onResume,
  onStartNew,
}: SessionRecoveryModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onResume}
      title="Previous session detected"
      closeOnOverlayClick={false}
      showCloseButton={false}
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onStartNew}>
            Start new session
          </Button>
          <Button variant="primary" onClick={onResume}>
            Resume previous session
          </Button>
        </div>
      }
    >
      <p className="text-gray-700">
        Data from a previous session was found. Would you like to resume where you left off or start fresh?
      </p>
    </Modal>
  );
}
