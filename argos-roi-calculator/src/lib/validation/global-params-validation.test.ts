import { describe, it, expect } from 'vitest';
import {
  validateServiceCost,
  formatServiceCost
} from './global-params-validation';

describe('validateServiceCost', () => {
  it('should accept valid positive service costs', () => {
    const result1 = validateServiceCost('1');
    expect(result1.isValid).toBe(true);
    expect(result1.value).toBe(1);

    const result2500 = validateServiceCost('2500');
    expect(result2500.isValid).toBe(true);
    expect(result2500.value).toBe(2500);

    const result10000 = validateServiceCost('10000');
    expect(result10000.isValid).toBe(true);
    expect(result10000.value).toBe(10000);
  });

  it('should reject zero service cost', () => {
    const result = validateServiceCost('0');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Cost must be greater than 0');
  });

  it('should reject negative service costs', () => {
    const result = validateServiceCost('-100');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Cost must be greater than 0');
  });

  it('should reject empty strings', () => {
    const result = validateServiceCost('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Please enter a service cost');
  });

  it('should reject whitespace-only strings', () => {
    const result = validateServiceCost('   ');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Please enter a service cost');
  });

  it('should reject non-numeric values', () => {
    const result = validateServiceCost('abc');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Please enter a valid number');
  });

  it('should accept decimal service costs', () => {
    const result = validateServiceCost('2500.50');
    expect(result.isValid).toBe(true);
    expect(result.value).toBe(2500.50);
  });

  it('should reject Infinity', () => {
    const result = validateServiceCost('Infinity');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Please enter a valid number');
  });

  it('should reject -Infinity', () => {
    const result = validateServiceCost('-Infinity');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Please enter a valid number');
  });

  it('should reject very large numbers', () => {
    const result = validateServiceCost('1e309');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Please enter a valid number');
  });
});

describe('formatServiceCost', () => {
  it('should format service cost with EUR symbol and French locale', () => {
    // French locale uses narrow no-break space (U+202F) between thousands and before €
    expect(formatServiceCost(2500)).toBe('2\u202f500\u00a0€');
    expect(formatServiceCost(10000)).toBe('10\u202f000\u00a0€');
  });

  it('should handle small values', () => {
    // No-break space (U+00A0) before €
    expect(formatServiceCost(1)).toBe('1\u00a0€');
    expect(formatServiceCost(100)).toBe('100\u00a0€');
  });

  it('should handle large values', () => {
    expect(formatServiceCost(1000000)).toBe('1\u202f000\u202f000\u00a0€');
  });

  it('should format without decimals', () => {
    // Intl.NumberFormat with minimumFractionDigits: 0 should not show decimals
    const formatted = formatServiceCost(2500.99);
    expect(formatted).toBe('2\u202f501\u00a0€'); // Rounds to nearest integer
  });
});
