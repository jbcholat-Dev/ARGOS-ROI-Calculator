export interface ValidationResult {
  isValid: boolean;
  value?: number;
  error?: string;
}

/**
 * Validates detection rate for ARGOS global parameters
 * @param value - String input from user
 * @returns ValidationResult with isValid flag and optional error message
 */
export function validateDetectionRate(value: string): ValidationResult {
  // Empty check
  if (!value || value.trim() === '') {
    return {
      isValid: false,
      error: 'Veuillez entrer un taux de détection'
    };
  }

  // Parse to number
  const numValue = parseFloat(value);

  // NaN and Infinity check
  if (isNaN(numValue) || !isFinite(numValue)) {
    return {
      isValid: false,
      error: 'Veuillez entrer un nombre valide'
    };
  }

  // Range check: 0-100 inclusive
  if (numValue < 0 || numValue > 100) {
    return {
      isValid: false,
      error: 'Le taux doit être entre 0 et 100'
    };
  }

  return { isValid: true, value: numValue };
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
      error: 'Veuillez entrer un coût de service'
    };
  }

  // Parse to number
  const numValue = parseFloat(value);

  // NaN and Infinity check
  if (isNaN(numValue) || !isFinite(numValue)) {
    return {
      isValid: false,
      error: 'Veuillez entrer un nombre valide'
    };
  }

  // Positive check: must be > 0
  if (numValue <= 0) {
    return {
      isValid: false,
      error: 'Le coût doit être supérieur à 0'
    };
  }

  return { isValid: true, value: numValue };
}

/**
 * Formats detection rate for display
 * @param value - Numeric detection rate (0-100)
 * @returns Formatted string with percentage symbol
 */
export function formatDetectionRate(value: number): string {
  return `${value}%`;
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
