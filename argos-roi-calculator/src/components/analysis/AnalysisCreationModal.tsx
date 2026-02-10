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
const VALIDATION_ERROR_REQUIRED = 'Analysis name is required';
const VALIDATION_ERROR_MAX_LENGTH = 'Name cannot exceed 100 characters';
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
      title="New Analysis"
      showCloseButton={false}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Create
          </Button>
        </>
      }
    >
      <Input
        id={ANALYSIS_NAME_INPUT_ID}
        label="Analysis Name"
        placeholder="e.g.: Poly Etch - Chamber 04"
        value={name}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        error={displayError || undefined}
        maxLength={MAX_NAME_LENGTH}
      />
    </Modal>
  );
}
