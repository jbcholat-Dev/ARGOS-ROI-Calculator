import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface ReplaceConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ReplaceConfirmationModal({
  isOpen,
  onConfirm,
  onCancel,
}: ReplaceConfirmationModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Replace Original Analysis?"
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Replace
          </Button>
        </div>
      }
    >
      <p className="text-gray-700">
        The What-If scenario will replace the original analysis. This action cannot be undone.
      </p>
    </Modal>
  );
}
