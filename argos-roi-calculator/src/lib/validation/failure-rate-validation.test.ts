import { describe, it, expect } from 'vitest';
import {
  validateFailureRatePercentage,
  validateFailureCount,
  calculatePercentageFromCount,
} from './failure-rate-validation';

describe('validateFailureRatePercentage', () => {
  it('accepts valid value 0', () => {
    expect(validateFailureRatePercentage('0')).toEqual({ isValid: true });
  });

  it('accepts valid value 10', () => {
    expect(validateFailureRatePercentage('10')).toEqual({ isValid: true });
  });

  it('accepts valid decimal value 50.5', () => {
    expect(validateFailureRatePercentage('50.5')).toEqual({ isValid: true });
  });

  it('accepts valid value 100', () => {
    expect(validateFailureRatePercentage('100')).toEqual({ isValid: true });
  });

  it('accepts empty string', () => {
    expect(validateFailureRatePercentage('')).toEqual({ isValid: true });
  });

  it('rejects negative values', () => {
    const result = validateFailureRatePercentage('-5');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Doit être un nombre positif');
  });

  it('rejects values greater than 100', () => {
    const result = validateFailureRatePercentage('101');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Le taux doit être entre 0 et 100%');
  });

  it('rejects non-numeric strings', () => {
    const result = validateFailureRatePercentage('abc');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Doit être un nombre positif');
  });

  it('returns French error messages', () => {
    const negResult = validateFailureRatePercentage('-1');
    expect(negResult.error).toMatch(/nombre positif/);

    const overResult = validateFailureRatePercentage('150');
    expect(overResult.error).toMatch(/entre 0 et 100/);
  });
});

describe('validateFailureCount', () => {
  it('accepts valid integer 0', () => {
    expect(validateFailureCount('0')).toEqual({ isValid: true });
  });

  it('accepts valid integer 3', () => {
    expect(validateFailureCount('3')).toEqual({ isValid: true });
  });

  it('accepts valid integer 10', () => {
    expect(validateFailureCount('10')).toEqual({ isValid: true });
  });

  it('accepts empty string', () => {
    expect(validateFailureCount('')).toEqual({ isValid: true });
  });

  it('rejects negative values', () => {
    const result = validateFailureCount('-2');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Doit être un nombre entier positif');
  });

  it('rejects decimal values (3.5)', () => {
    const result = validateFailureCount('3.5');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Doit être un nombre entier positif');
  });

  it('rejects non-numeric strings', () => {
    const result = validateFailureCount('abc');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Doit être un nombre entier positif');
  });

  it('returns French error message', () => {
    const result = validateFailureCount('-1');
    expect(result.error).toMatch(/nombre entier positif/);
  });
});

describe('calculatePercentageFromCount', () => {
  it('calculates 37.5% for 3 failures out of 8 pumps', () => {
    expect(calculatePercentageFromCount(3, 8)).toBe(37.5);
  });

  it('returns 0 when pump quantity is 0 (edge case)', () => {
    expect(calculatePercentageFromCount(3, 0)).toBe(0);
  });

  it('rounds to 1 decimal place (2/7 = 28.6%)', () => {
    expect(calculatePercentageFromCount(2, 7)).toBe(28.6);
  });

  it('calculates 100% when count equals pump quantity', () => {
    expect(calculatePercentageFromCount(10, 10)).toBe(100);
  });

  it('calculates 0% for 0 failures', () => {
    expect(calculatePercentageFromCount(0, 8)).toBe(0);
  });

  it('handles count greater than pump quantity (>100%)', () => {
    expect(calculatePercentageFromCount(15, 10)).toBe(150);
  });

  it('calculates with single pump (1 failure / 1 pump = 100%)', () => {
    expect(calculatePercentageFromCount(1, 1)).toBe(100);
  });
});
