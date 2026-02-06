import { describe, it, expect } from 'vitest';
import {
  validateWaferQuantity,
  validateWaferCost,
  formatEuroCurrency,
} from './wafer-validation';

describe('validateWaferQuantity', () => {
  describe('valid inputs', () => {
    it('accepts positive integer 1', () => {
      const result = validateWaferQuantity('1');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('accepts default batch quantity 125', () => {
      const result = validateWaferQuantity('125');
      expect(result.isValid).toBe(true);
    });

    it('accepts 500', () => {
      const result = validateWaferQuantity('500');
      expect(result.isValid).toBe(true);
    });

    it('accepts maximum value 1000', () => {
      const result = validateWaferQuantity('1000');
      expect(result.isValid).toBe(true);
    });

    it('accepts empty string (field not yet filled)', () => {
      const result = validateWaferQuantity('');
      expect(result.isValid).toBe(true);
    });
  });

  describe('rejects invalid inputs', () => {
    it('rejects negative number -10', () => {
      const result = validateWaferQuantity('-10');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Doit être un nombre positif');
    });

    it('rejects zero', () => {
      const result = validateWaferQuantity('0');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Doit être un nombre positif');
    });

    it('rejects non-numeric string "abc"', () => {
      const result = validateWaferQuantity('abc');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Doit être un nombre positif');
    });

    it('rejects decimal "1.5"', () => {
      const result = validateWaferQuantity('1.5');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Doit être un nombre positif');
    });

    it('rejects values exceeding maximum (1001)', () => {
      const result = validateWaferQuantity('1001');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Maximum 1000 wafers');
    });

    it('rejects very large values (5000)', () => {
      const result = validateWaferQuantity('5000');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Maximum 1000 wafers');
    });
  });
});

describe('validateWaferCost', () => {
  describe('valid inputs', () => {
    it('accepts 100', () => {
      const result = validateWaferCost('100');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('accepts default cost 8000', () => {
      const result = validateWaferCost('8000');
      expect(result.isValid).toBe(true);
    });

    it('accepts 50000', () => {
      const result = validateWaferCost('50000');
      expect(result.isValid).toBe(true);
    });

    it('accepts maximum value 1000000', () => {
      const result = validateWaferCost('1000000');
      expect(result.isValid).toBe(true);
    });

    it('accepts empty string (field not yet filled)', () => {
      const result = validateWaferCost('');
      expect(result.isValid).toBe(true);
    });
  });

  describe('rejects invalid inputs', () => {
    it('rejects negative number -5000', () => {
      const result = validateWaferCost('-5000');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Doit être un nombre positif');
    });

    it('rejects zero', () => {
      const result = validateWaferCost('0');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Doit être un nombre positif');
    });

    it('rejects non-numeric string "abc"', () => {
      const result = validateWaferCost('abc');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Doit être un nombre positif');
    });

    it('rejects values exceeding maximum (1000001)', () => {
      const result = validateWaferCost('1000001');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Maximum 1 000 000 €');
    });

    it('rejects very large values (5000000)', () => {
      const result = validateWaferCost('5000000');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Maximum 1 000 000 €');
    });
  });
});

describe('formatEuroCurrency', () => {
  it('formats 8000 as "8 000"', () => {
    // Intl.NumberFormat fr-FR uses narrow no-break space (U+202F) as thousands separator
    const result = formatEuroCurrency(8000);
    expect(result).toMatch(/8\s000/);
  });

  it('formats 12500 as "12 500"', () => {
    const result = formatEuroCurrency(12500);
    expect(result).toMatch(/12\s500/);
  });

  it('formats 125000 as "125 000"', () => {
    const result = formatEuroCurrency(125000);
    expect(result).toMatch(/125\s000/);
  });

  it('formats small number 1 as "1"', () => {
    expect(formatEuroCurrency(1)).toBe('1');
  });

  it('formats 0 as "0"', () => {
    expect(formatEuroCurrency(0)).toBe('0');
  });

  it('formats 999999 with separator', () => {
    const result = formatEuroCurrency(999999);
    expect(result).toMatch(/999\s999/);
  });

  it('formats 1000 with separator', () => {
    const result = formatEuroCurrency(1000);
    expect(result).toMatch(/1\s000/);
  });
});
