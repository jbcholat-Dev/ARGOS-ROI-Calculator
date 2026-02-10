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
    return { isValid: false, error: 'Must be a positive number' };
  }

  if (parsed <= 0) {
    return { isValid: false, error: 'Must be a positive number' };
  }

  if (parsed > 1000) {
    return { isValid: false, error: 'Maximum 1000 pumps' };
  }

  return { isValid: true };
}

/**
 * Validate detection rate percentage value
 * Story 2.9: Per-analysis detection rate validation
 *
 * Rules:
 * - Must be numeric (0-100)
 * - Must be >= 0
 * - Must be <= 100
 *
 * @param value - Detection rate as number (0-100)
 * @returns Error message if invalid, null if valid
 */
export function validateDetectionRate(value: number): string | null {
  if (value < 0 || value > 100) {
    return 'Must be between 0 and 100';
  }

  return null;
}
