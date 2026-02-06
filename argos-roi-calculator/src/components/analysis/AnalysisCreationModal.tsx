import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export interface AnalysisCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

const ANALYSIS_NAME_INPUT_ID = 'analysis-name-input';
const VALIDATION_ERROR_REQUIRED = "Le nom de l'analyse est requis";
const VALIDATION_ERROR_MAX_LENGTH = 'Le nom ne peut pas dépasser 100 caractères';
const MAX_NAME_LENGTH = 100;

export function AnalysisCreationModal({
  isOpen,
  onClose,
  onSubmit,
}: AnalysisCreationModalProps) {
  const [name, setName] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);

  const getValidationError = (value: string): string => {
    if (value.trim().length === 0) return VALIDATION_ERROR_REQUIRED;
    if (value.length > MAX_NAME_LENGTH) return VALIDATION_ERROR_MAX_LENGTH;
    return '';
  };

  const validationError = getValidationError(name);
  const displayError = hasInteracted ? validationError : '';

  // Reset state and auto-focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setHasInteracted(false);
      let isMounted = true;
      // Focus input after Modal's own focus management completes
      const timer = setTimeout(() => {
        if (isMounted) {
          document.getElementById(ANALYSIS_NAME_INPUT_ID)?.focus();
        }
      }, 0);
      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setHasInteracted(true);
  };

  const handleSubmit = () => {
    setHasInteracted(true);
    if (getValidationError(name)) return;
    onSubmit(name.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nouvelle Analyse"
      showCloseButton={false}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Créer
          </Button>
        </>
      }
    >
      <Input
        id={ANALYSIS_NAME_INPUT_ID}
        label="Nom du process"
        placeholder="ex: Poly Etch - Chamber 04"
        value={name}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        error={displayError || undefined}
        maxLength={MAX_NAME_LENGTH}
      />
    </Modal>
  );
}
