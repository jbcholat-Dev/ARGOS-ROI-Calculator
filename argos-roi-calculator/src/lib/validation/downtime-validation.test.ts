import { describe, it, expect } from 'vitest';
import {
  validateDowntimeDuration,
  validateDowntimeCostPerHour,
  formatFrenchNumber,
} from './downtime-validation';

describe('validateDowntimeDuration', () => {
  describe('valid inputs', () => {
    it('accepts positive integer 6', () => {
      const result = validateDowntimeDuration('6');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.warning).toBeUndefined();
    });

    it('accepts decimal value 6.5', () => {
      const result = validateDowntimeDuration('6.5');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('accepts zero', () => {
      const result = validateDowntimeDuration('0');
      expect(result.isValid).toBe(true);
    });

    it('accepts large value 100', () => {
      const result = validateDowntimeDuration('100');
      expect(result.isValid).toBe(true);
    });
  });

  describe('soft warnings', () => {
    it('returns warning for empty string', () => {
      const result = validateDowntimeDuration('');
      expect(result.isValid).toBe(true);
      expect(result.warning).toBe('Requis pour le calcul ROI');
    });

    it('returns warning for whitespace-only', () => {
      const result = validateDowntimeDuration('   ');
      expect(result.isValid).toBe(true);
      expect(result.warning).toBe('Requis pour le calcul ROI');
    });
  });

  describe('hard errors', () => {
    it('rejects negative value -5', () => {
      const result = validateDowntimeDuration('-5');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Doit être un nombre positif');
    });

    it('rejects non-numeric text "abc"', () => {
      const result = validateDowntimeDuration('abc');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Doit être un nombre valide');
    });

    it('rejects mixed text "12abc"', () => {
      const result = validateDowntimeDuration('12abc');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Doit être un nombre valide');
    });
  });
});

describe('validateDowntimeCostPerHour', () => {
  describe('valid inputs', () => {
    it('accepts positive integer 15000', () => {
      const result = validateDowntimeCostPerHour('15000');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('accepts zero', () => {
      const result = validateDowntimeCostPerHour('0');
      expect(result.isValid).toBe(true);
    });

    it('accepts small value 500', () => {
      const result = validateDowntimeCostPerHour('500');
      expect(result.isValid).toBe(true);
    });
  });

  describe('soft warnings', () => {
    it('returns warning for empty string', () => {
      const result = validateDowntimeCostPerHour('');
      expect(result.isValid).toBe(true);
      expect(result.warning).toBe('Requis pour le calcul ROI');
    });
  });

  describe('hard errors', () => {
    it('rejects negative value -100', () => {
      const result = validateDowntimeCostPerHour('-100');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Doit être un nombre positif');
    });

    it('rejects non-numeric text "xyz"', () => {
      const result = validateDowntimeCostPerHour('xyz');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Doit être un nombre valide');
    });
  });
});

describe('formatFrenchNumber', () => {
  it('formats 15000 with French thousand separator', () => {
    const result = formatFrenchNumber(15000);
    // French locale uses narrow no-break space (U+202F) or non-breaking space (U+00A0)
    expect(result).toMatch(/15\s000/);
  });

  it('formats 1000000 correctly', () => {
    const result = formatFrenchNumber(1000000);
    expect(result).toMatch(/1\s000\s000/);
  });

  it('formats small number 500 without separator', () => {
    const result = formatFrenchNumber(500);
    expect(result).toBe('500');
  });

  it('formats 0 as "0"', () => {
    const result = formatFrenchNumber(0);
    expect(result).toBe('0');
  });
});
