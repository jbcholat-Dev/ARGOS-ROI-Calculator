import { describe, it, expect } from 'vitest';
import { formatCurrency, formatPercentage } from './utils';

describe('formatCurrency', () => {
  it('formats positive amounts with French locale', () => {
    // French locale uses narrow no-break space (\u202f) as thousand separator
    const result = formatCurrency(125000);
    expect(result).toMatch(/^€125[\s\u00a0\u202f]000$/);
  });

  it('formats negative amounts with French locale', () => {
    const result = formatCurrency(-1500);
    expect(result).toMatch(/^-€1[\s\u00a0\u202f]500$/);
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('€0');
  });

  it('rounds decimal amounts to nearest integer', () => {
    const result1 = formatCurrency(1234.56);
    const result2 = formatCurrency(1234.49);
    expect(result1).toMatch(/^€1[\s\u00a0\u202f]235$/);
    expect(result2).toMatch(/^€1[\s\u00a0\u202f]234$/);
  });

  it('handles large amounts', () => {
    const result = formatCurrency(1000000);
    expect(result).toMatch(/^€1[\s\u00a0\u202f]000[\s\u00a0\u202f]000$/);
  });

  it('handles small positive amounts', () => {
    expect(formatCurrency(1)).toBe('€1');
    expect(formatCurrency(99)).toBe('€99');
  });
});

describe('formatPercentage', () => {
  it('formats positive percentages with French locale (1 decimal by default)', () => {
    const result = formatPercentage(2708.4);
    expect(result).toMatch(/^2[\s\u00a0\u202f]708,4\s%$/);
  });

  it('formats negative percentages with French locale', () => {
    const result = formatPercentage(-99.38);
    expect(result).toMatch(/^-99,4\s%$/);
  });

  it('formats zero percentage', () => {
    expect(formatPercentage(0)).toMatch(/^0,0\s%$/);
  });

  it('formats with custom fraction digits (0 decimals)', () => {
    const result = formatPercentage(15.7, 0);
    expect(result).toMatch(/^16\s%$/);
  });

  it('formats with custom fraction digits (2 decimals)', () => {
    const result = formatPercentage(15.456, 2);
    expect(result).toMatch(/^15,46\s%$/);
  });

  it('handles large percentages with thousand separators', () => {
    const result = formatPercentage(12345.6);
    expect(result).toMatch(/^12[\s\u00a0\u202f]345,6\s%$/);
  });
});
