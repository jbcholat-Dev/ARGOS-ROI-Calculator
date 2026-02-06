import { describe, it, expect } from 'vitest';
import { validatePumpQuantity } from './equipment-validation';

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
      expect(result.error).toBe('Doit être un nombre positif');
    });

    it('rejects -5', () => {
      const result = validatePumpQuantity('-5');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Doit être un nombre positif');
    });
  });

  describe('rejects zero', () => {
    it('rejects 0', () => {
      const result = validatePumpQuantity('0');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Doit être un nombre positif');
    });
  });

  describe('rejects non-numeric strings', () => {
    it('rejects alphabetic text "abc"', () => {
      const result = validatePumpQuantity('abc');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Doit être un nombre positif');
    });

    it('rejects decimal "1.5"', () => {
      const result = validatePumpQuantity('1.5');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Doit être un nombre positif');
    });

    it('rejects mixed text "12abc"', () => {
      const result = validatePumpQuantity('12abc');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Doit être un nombre positif');
    });
  });

  describe('rejects values exceeding maximum', () => {
    it('rejects 1001', () => {
      const result = validatePumpQuantity('1001');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Maximum 1000 pompes');
    });

    it('rejects 5000', () => {
      const result = validatePumpQuantity('5000');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Maximum 1000 pompes');
    });

    it('rejects very large number 999999', () => {
      const result = validatePumpQuantity('999999');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Maximum 1000 pompes');
    });
  });

  describe('error messages are in French', () => {
    it('returns French error for non-positive value', () => {
      const result = validatePumpQuantity('-3');
      expect(result.error).toBe('Doit être un nombre positif');
    });

    it('returns French error for exceeding max', () => {
      const result = validatePumpQuantity('2000');
      expect(result.error).toBe('Maximum 1000 pompes');
    });
  });
});
