export interface ValidationResult {
  isValid: boolean;
  value?: number;
  error?: string;
}

/**
 * Validates service cost per pump for ARGOS global parameters
 * @param value - String input from user
 * @returns ValidationResult with isValid flag and optional error message
 */
export function validateServiceCost(value: string): ValidationResult {
  // Empty check
  if (!value || value.trim() === '') {
    return {
      isValid: false,
      error: 'Please enter a service cost'
    };
  }

  // Parse to number
  const numValue = parseFloat(value);

  // NaN and Infinity check
  if (isNaN(numValue) || !isFinite(numValue)) {
    return {
      isValid: false,
      error: 'Please enter a valid number'
    };
  }

  // Positive check: must be > 0
  if (numValue <= 0) {
    return {
      isValid: false,
      error: 'Cost must be greater than 0'
    };
  }

  return { isValid: true, value: numValue };
}

/**
 * Formats service cost for display in EUR with French locale
 * @param value - Numeric service cost
 * @returns Formatted string with EUR symbol and thousand separators
 */
export function formatServiceCost(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}
