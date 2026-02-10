import { describe, it, expect } from 'vitest';
import { validatePumpQuantity, validateDetectionRate } from './equipment-validation';

describe('validatePumpQuantity', () => {
  describe('valid inputs', () => {
    it('accepts positive integer 1', () => {
      const result = validatePumpQuantity('1');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('accepts positive integer 8', () => {
      const result = validatePumpQuantity('8');
      expect(result.isValid).toBe(true);
    });

    it('accepts 100', () => {
      const result = validatePumpQuantity('100');
      expect(result.isValid).toBe(true);
    });

    it('accepts maximum value 1000', () => {
      const result = validatePumpQuantity('1000');
      expect(result.isValid).toBe(true);
    });

    it('accepts empty string (field not yet filled)', () => {
      const result = validatePumpQuantity('');
      expect(result.isValid).toBe(true);
    });

    it('accepts whitespace-only string as empty', () => {
      const result = validatePumpQuantity('   ');
      expect(result.isValid).toBe(true);
    });
  });

  describe('rejects negative numbers', () => {
    it('rejects -1', () => {
      const result = validatePumpQuantity('-1');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Must be a positive number');
    });

    it('rejects -5', () => {
      const result = validatePumpQuantity('-5');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Must be a positive number');
    });
  });

  describe('rejects zero', () => {
    it('rejects 0', () => {
      const result = validatePumpQuantity('0');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Must be a positive number');
    });
  });

  describe('rejects non-numeric strings', () => {
    it('rejects alphabetic text "abc"', () => {
      const result = validatePumpQuantity('abc');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Must be a positive number');
    });

    it('rejects decimal "1.5"', () => {
      const result = validatePumpQuantity('1.5');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Must be a positive number');
    });

    it('rejects mixed text "12abc"', () => {
      const result = validatePumpQuantity('12abc');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Must be a positive number');
    });
  });

  describe('rejects values exceeding maximum', () => {
    it('rejects 1001', () => {
      const result = validatePumpQuantity('1001');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Maximum 1000 pumps');
    });

    it('rejects 5000', () => {
      const result = validatePumpQuantity('5000');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Maximum 1000 pumps');
    });

    it('rejects very large number 999999', () => {
      const result = validatePumpQuantity('999999');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Maximum 1000 pumps');
    });
  });

  describe('error messages are in English', () => {
    it('returns English error for non-positive value', () => {
      const result = validatePumpQuantity('-3');
      expect(result.error).toBe('Must be a positive number');
    });

    it('returns English error for exceeding max', () => {
      const result = validatePumpQuantity('2000');
      expect(result.error).toBe('Maximum 1000 pumps');
    });
  });
});

// Story 2.9: Per-analysis detection rate validation
describe('validateDetectionRate', () => {
  describe('valid inputs', () => {
    it('accepts 0 (minimum boundary)', () => {
      const error = validateDetectionRate(0);
      expect(error).toBeNull();
    });

    it('accepts 50 (typical value)', () => {
      const error = validateDetectionRate(50);
      expect(error).toBeNull();
    });

    it('accepts 70 (default value)', () => {
      const error = validateDetectionRate(70);
      expect(error).toBeNull();
    });

    it('accepts 100 (maximum boundary)', () => {
      const error = validateDetectionRate(100);
      expect(error).toBeNull();
    });
  });

  describe('invalid inputs', () => {
    it('rejects negative value', () => {
      const error = validateDetectionRate(-1);
      expect(error).toBe('Must be between 0 and 100');
    });

    it('rejects value > 100', () => {
      const error = validateDetectionRate(101);
      expect(error).toBe('Must be between 0 and 100');
    });

    it('rejects large negative value', () => {
      const error = validateDetectionRate(-50);
      expect(error).toBe('Must be between 0 and 100');
    });
  });
});
