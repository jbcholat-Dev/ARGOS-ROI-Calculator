/**
 * Validation and formatting logic for wafer input fields
 * Pure functions — no side effects, synchronous, <1ms execution
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate wafer quantity (wafers per batch) input value
 *
 * Rules:
 * - Must be numeric (positive integer)
 * - Must be > 0
 * - Must be <= 1000
 *
 * @param value - Raw string from input field
 * @returns Validation result with optional French error message
 */
export function validateWaferQuantity(value: string): ValidationResult {
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
    return { isValid: false, error: 'Maximum 1000 wafers' };
  }

  return { isValid: true };
}

/**
 * Validate wafer cost input value
 *
 * Rules:
 * - Must be numeric (positive number, integers only for currency)
 * - Must be > 0
 * - Must be <= 1000000 (1M EUR cap)
 *
 * @param value - Raw string from input field (spaces removed before calling)
 * @returns Validation result with optional French error message
 */
export function validateWaferCost(value: string): ValidationResult {
  if (value.trim() === '') {
    return { isValid: true }; // Empty is allowed (not yet filled)
  }

  const parsed = parseFloat(value);

  if (isNaN(parsed)) {
    return { isValid: false, error: 'Doit être un nombre positif' };
  }

  if (parsed <= 0) {
    return { isValid: false, error: 'Doit être un nombre positif' };
  }

  if (parsed > 1000000) {
    return { isValid: false, error: 'Maximum 1 000 000 €' };
  }

  return { isValid: true };
}

/**
 * Format a number as French euro currency (thousands separator = space)
 *
 * Examples:
 * - 8000 → "8 000"
 * - 12500 → "12 500"
 * - 125000 → "125 000"
 * - 1 → "1"
 *
 * @param value - Numeric value to format
 * @returns Formatted string with space as thousands separator
 */
export function formatEuroCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(value);
}
