import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  analysisName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation modal for deleting an analysis
 * Uses Modal primitive for WCAG AA accessibility (aria-labelledby, aria-describedby, focus trap)
 */
export function DeleteConfirmationModal({
  isOpen,
  analysisName,
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Supprimer l'analyse ?"
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onCancel}>
            Annuler
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Supprimer
          </Button>
        </div>
      }
    >
      <p className="text-gray-700">
        Cette action est irréversible. L'analyse «&nbsp;{analysisName}&nbsp;»
        sera définitivement supprimée.
      </p>
    </Modal>
  );
}
