import { useState, useRef, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';
import { ActiveIndicator } from './ActiveIndicator';

export interface EditableAnalysisNameProps {
  analysisId: string;
  currentName: string;
  onUpdate: (name: string) => void;
  showActiveBadge?: boolean;
  existingNames?: string[];
}

const VALIDATION_ERROR_EMPTY = 'Name cannot be empty';
const VALIDATION_ERROR_MAX_LENGTH = 'Name cannot exceed 100 characters';
const VALIDATION_ERROR_DUPLICATE = 'This name already exists';
const MAX_NAME_LENGTH = 100;

export function EditableAnalysisName({
  analysisId,
  currentName,
  onUpdate,
  showActiveBadge = false,
  existingNames = [],
}: EditableAnalysisNameProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(currentName);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isCancellingRef = useRef(false);

  // Auto-focus and select text when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const validate = useCallback(
    (value: string): string | null => {
      const trimmed = value.trim();
      if (trimmed.length === 0) return VALIDATION_ERROR_EMPTY;
      if (trimmed.length > MAX_NAME_LENGTH) return VALIDATION_ERROR_MAX_LENGTH;
      // Check uniqueness (case-insensitive), allow current name
      const isDuplicate = existingNames.some(
        (name) =>
          name.toLowerCase() === trimmed.toLowerCase() &&
          name.toLowerCase() !== currentName.toLowerCase()
      );
      if (isDuplicate) return VALIDATION_ERROR_DUPLICATE;
      return null;
    },
    [existingNames, currentName]
  );

  const enterEditMode = () => {
    isCancellingRef.current = false;
    setEditValue(currentName);
    setError(null);
    setIsEditing(true);
  };

  const saveEdit = () => {
    const validationError = validate(editValue);
    if (validationError) {
      setError(validationError);
      return;
    }
    const trimmed = editValue.trim();
    setIsEditing(false);
    setError(null);
    if (trimmed !== currentName) {
      onUpdate(trimmed);
    }
  };

  const cancelEdit = () => {
    isCancellingRef.current = true;
    setIsEditing(false);
    setEditValue(currentName);
    setError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
    if (error) {
      setError(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  };

  const handleBlur = () => {
    if (isCancellingRef.current) {
      isCancellingRef.current = false;
      return;
    }
    saveEdit();
  };

  const errorId = `editable-name-error-${analysisId}`;

  if (isEditing) {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className={clsx(
              'px-2 py-1',
              'text-xl font-semibold',
              'border rounded',
              'bg-white text-gray-900',
              'transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-pfeiffer-red focus:ring-offset-2',
              error ? 'border-red-600' : 'border-gray-300'
            )}
            aria-label="Analysis name"
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? errorId : undefined}
            maxLength={MAX_NAME_LENGTH}
          />
          {showActiveBadge && <ActiveIndicator variant="badge" />}
        </div>
        {error && (
          <p
            id={errorId}
            className="text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={enterEditMode}
        className={clsx(
          'text-xl font-semibold text-gray-900',
          'cursor-pointer',
          'hover:underline',
          'focus:outline-none focus:ring-2 focus:ring-pfeiffer-red focus:ring-offset-2',
          'rounded px-1'
        )}
        aria-label={`Rename analysis "${currentName}"`}
      >
        {currentName}
      </button>
      {showActiveBadge && <ActiveIndicator variant="badge" />}
    </div>
  );
}
