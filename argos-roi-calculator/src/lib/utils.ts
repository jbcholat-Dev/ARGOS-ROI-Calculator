/**
 * Formats a number as currency in French locale (EUR).
 * Uses space as thousand separator per French convention.
 *
 * Pattern matches ResultsPanel.tsx for visual consistency.
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
