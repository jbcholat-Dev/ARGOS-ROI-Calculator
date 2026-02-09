/**
 * Formats a number as currency in French locale (EUR).
 * Uses space as thousand separator per French convention.
 *
 * Provides consistent French locale formatting for currency amounts across the app.
 *
 * @param amount - Amount to format (will be rounded to nearest integer)
 * @returns Formatted currency string (e.g., "€125 000", "-€1 500")
 *
 * @example
 * formatCurrency(125000)    // → "€125 000"
 * formatCurrency(-1500)     // → "-€1 500"
 * formatCurrency(1234.56)   // → "€1 235" (rounded)
 */
export function formatCurrency(amount: number): string {
  const rounded = Math.round(amount);

  if (rounded < 0) {
    return `-€${Math.abs(rounded).toLocaleString('fr-FR')}`;
  }

  return `€${rounded.toLocaleString('fr-FR')}`;
}

/**
 * Formats a number as percentage in French locale.
 * Uses space as thousand separator per French convention (matches formatCurrency pattern).
 *
 * @param value - Percentage value to format
 * @param fractionDigits - Number of decimal places (default: 1)
 * @returns Formatted percentage string (e.g., "2 708,4 %", "-99,4 %")
 *
 * @example
 * formatPercentage(2708.4)    // → "2 708,4 %"
 * formatPercentage(-99.38)    // → "-99,4 %"
 * formatPercentage(15.0, 0)   // → "15 %"
 */
export function formatPercentage(value: number, fractionDigits: number = 1): string {
  return `${value.toLocaleString('fr-FR', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })} %`;
}
