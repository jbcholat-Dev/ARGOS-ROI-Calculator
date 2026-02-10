import { describe, it, expect } from 'vitest';
import {
  validateDetectionRate,
  validateServiceCost,
  formatDetectionRate,
  formatServiceCost
} from './global-params-validation';

describe('validateDetectionRate', () => {
  it('should accept valid detection rates within range', () => {
    const result0 = validateDetectionRate('0');
    expect(result0.isValid).toBe(true);
    expect(result0.value).toBe(0);

    const result50 = validateDetectionRate('50');
    expect(result50.isValid).toBe(true);
    expect(result50.value).toBe(50);

    const result70 = validateDetectionRate('70');
    expect(result70.isValid).toBe(true);
    expect(result70.value).toBe(70);

    const result100 = validateDetectionRate('100');
    expect(result100.isValid).toBe(true);
    expect(result100.value).toBe(100);
  });

  it('should reject detection rates below 0', () => {
    const result = validateDetectionRate('-1');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Le taux doit être entre 0 et 100');
  });

  it('should reject detection rates above 100', () => {
    const result = validateDetectionRate('101');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Le taux doit être entre 0 et 100');
  });

  it('should reject empty strings', () => {
    const result = validateDetectionRate('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Veuillez entrer un taux de détection');
  });

  it('should reject whitespace-only strings', () => {
    const result = validateDetectionRate('   ');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Veuillez entrer un taux de détection');
  });

  it('should reject non-numeric values', () => {
    const result = validateDetectionRate('abc');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Veuillez entrer un nombre valide');
  });

  it('should accept decimal values within range', () => {
    const result1 = validateDetectionRate('85.5');
    expect(result1.isValid).toBe(true);
    expect(result1.value).toBe(85.5);

    const result2 = validateDetectionRate('0.5');
    expect(result2.isValid).toBe(true);
    expect(result2.value).toBe(0.5);
  });

  it('should reject Infinity', () => {
    const result = validateDetectionRate('Infinity');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Veuillez entrer un nombre valide');
  });

  it('should reject -Infinity', () => {
    const result = validateDetectionRate('-Infinity');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Veuillez entrer un nombre valide');
  });

  it('should reject very large numbers that become Infinity', () => {
    const result = validateDetectionRate('1e309');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Veuillez entrer un nombre valide');
  });
});

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
    expect(result.error).toBe('Le coût doit être supérieur à 0');
  });

  it('should reject negative service costs', () => {
    const result = validateServiceCost('-100');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Le coût doit être supérieur à 0');
  });

  it('should reject empty strings', () => {
    const result = validateServiceCost('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Veuillez entrer un coût de service');
  });

  it('should reject whitespace-only strings', () => {
    const result = validateServiceCost('   ');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Veuillez entrer un coût de service');
  });

  it('should reject non-numeric values', () => {
    const result = validateServiceCost('abc');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Veuillez entrer un nombre valide');
  });

  it('should accept decimal service costs', () => {
    const result = validateServiceCost('2500.50');
    expect(result.isValid).toBe(true);
    expect(result.value).toBe(2500.50);
  });

  it('should reject Infinity', () => {
    const result = validateServiceCost('Infinity');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Veuillez entrer un nombre valide');
  });

  it('should reject -Infinity', () => {
    const result = validateServiceCost('-Infinity');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Veuillez entrer un nombre valide');
  });

  it('should reject very large numbers', () => {
    const result = validateServiceCost('1e309');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Veuillez entrer un nombre valide');
  });
});

describe('formatDetectionRate', () => {
  it('should format detection rate with percentage symbol', () => {
    expect(formatDetectionRate(70)).toBe('70%');
    expect(formatDetectionRate(85)).toBe('85%');
    expect(formatDetectionRate(0)).toBe('0%');
    expect(formatDetectionRate(100)).toBe('100%');
  });

  it('should format decimal detection rates', () => {
    expect(formatDetectionRate(85.5)).toBe('85.5%');
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
