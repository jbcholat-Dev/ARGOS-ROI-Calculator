/**
 * Validation logic for equipment input fields
 * Pure functions — no side effects, synchronous, <1ms execution
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate pump quantity input value
 *
 * Rules:
 * - Must be numeric (integer)
 * - Must be > 0 (positive)
 * - Must be <= 1000 (maximum limit)
 *
 * @param value - Raw string from input field
 * @returns Validation result with optional French error message
 */
export function validatePumpQuantity(value: string): ValidationResult {
  if (value.trim() === '') {
    return { isValid: true }; // Empty is allowed (not yet filled)
  }

  const parsed = parseInt(value, 10);

  if (isNaN(parsed) || String(parsed) !== value.trim()) {
    return { isValid: false, error: 'Doit être un nombre positif' };
  }

  if (parsed <= 0) {
    return { isValid: false, error: 'Doit être un nombre positif' };
  }

  if (parsed > 1000) {
    return { isValid: false, error: 'Maximum 1000 pompes' };
  }

  return { isValid: true };
}
