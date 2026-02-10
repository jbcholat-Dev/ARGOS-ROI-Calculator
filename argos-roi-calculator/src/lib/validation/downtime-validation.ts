/**
 * Validation logic for downtime input fields
 * Pure functions — no side effects, synchronous, <1ms execution
 */

import type { ValidationResult } from './equipment-validation';

/**
 * Validate downtime duration (hours per failure event)
 *
 * Rules:
 * - Empty → soft warning (amber): "Required for ROI calculation"
 * - Non-numeric → hard error (red): "Must be a valid number"
 * - Negative → hard error (red): "Must be a positive number"
 * - Zero or positive → valid (decimals allowed, e.g., 6.5 hours)
 *
 * @param value - Raw string from input field
 * @returns Validation result with optional error/warning message and severity
 */
export function validateDowntimeDuration(value: string): ValidationResult & { warning?: string } {
  if (value.trim() === '') {
    return { isValid: true, warning: 'Required for ROI calculation' };
  }

  // Use Number() instead of parseFloat() to reject trailing non-numeric chars (e.g., "12abc")
  const parsed = Number(value.trim());

  if (isNaN(parsed)) {
    return { isValid: false, error: 'Must be a valid number' };
  }

  if (parsed < 0) {
    return { isValid: false, error: 'Must be a positive number' };
  }

  return { isValid: true };
}

/**
 * Validate downtime cost per hour (EUR/h)
 *
 * Rules:
 * - Empty → soft warning (amber): "Required for ROI calculation"
 * - Non-numeric → hard error (red): "Must be a valid number"
 * - Negative → hard error (red): "Must be a positive number"
 * - Zero or positive → valid (integers only)
 *
 * @param value - Raw string from input field
 * @returns Validation result with optional error/warning message and severity
 */
export function validateDowntimeCostPerHour(value: string): ValidationResult & { warning?: string } {
  if (value.trim() === '') {
    return { isValid: true, warning: 'Required for ROI calculation' };
  }

  // Use Number() instead of parseFloat() to reject trailing non-numeric chars (e.g., "12abc")
  const parsed = Number(value.trim());

  if (isNaN(parsed)) {
    return { isValid: false, error: 'Must be a valid number' };
  }

  if (parsed < 0) {
    return { isValid: false, error: 'Must be a positive number' };
  }

  return { isValid: true };
}

/**
 * Format a number with French thousand separators (spaces)
 * Used for displaying cost values when input is not focused.
 *
 * @param value - Numeric value to format
 * @returns Formatted string with French locale (e.g., 15000 → "15 000")
 */
export function formatFrenchNumber(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(value);
}
