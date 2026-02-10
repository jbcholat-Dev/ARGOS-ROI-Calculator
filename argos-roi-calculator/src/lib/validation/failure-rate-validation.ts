/**
 * Validation and calculation logic for failure rate input fields
 * Pure functions — no side effects, synchronous, <1ms execution
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate failure rate percentage input value
 *
 * Rules:
 * - Must be numeric (parseFloat)
 * - Must be >= 0
 * - Must be <= 100
 *
 * @param value - Raw string from input field
 * @returns Validation result with error message
 */
export function validateFailureRatePercentage(value: string): ValidationResult {
  if (value.trim() === '') {
    return { isValid: true };
  }

  const parsed = parseFloat(value);

  if (isNaN(parsed)) {
    return { isValid: false, error: 'Must be a positive number' };
  }

  if (parsed < 0) {
    return { isValid: false, error: 'Must be a positive number' };
  }

  if (parsed > 100) {
    return { isValid: false, error: 'Rate must be between 0 and 100%' };
  }

  return { isValid: true };
}

/**
 * Validate absolute failure count input value
 *
 * Rules:
 * - Must be numeric (parseInt)
 * - Must be >= 0 (zero failures is valid)
 * - Must be integer (no decimals)
 *
 * @param value - Raw string from input field
 * @returns Validation result with error message
 */
export function validateFailureCount(value: string): ValidationResult {
  if (value.trim() === '') {
    return { isValid: true };
  }

  // Reject decimals explicitly (e.g., "3.0" is parsed as 3 by parseFloat but user typed a dot)
  if (value.includes('.')) {
    return { isValid: false, error: 'Must be a positive integer' };
  }

  const parsed = parseInt(value, 10);

  if (isNaN(parsed) || String(parsed) !== value.trim()) {
    return { isValid: false, error: 'Must be a positive integer' };
  }

  if (parsed < 0) {
    return { isValid: false, error: 'Must be a positive integer' };
  }

  return { isValid: true };
}

/**
 * Calculate failure rate percentage from absolute count and pump quantity
 *
 * Formula: (count / pumpQuantity) * 100
 * Result rounded to 1 decimal place
 *
 * @param count - Absolute number of failures per year
 * @param pumpQuantity - Total number of pumps
 * @returns Percentage (0-100+), rounded to 1 decimal
 */
export function calculatePercentageFromCount(
  count: number,
  pumpQuantity: number,
): number {
  if (pumpQuantity === 0) {
    return 0;
  }

  const result = (count / pumpQuantity) * 100;
  return Math.round(result * 10) / 10;
}
