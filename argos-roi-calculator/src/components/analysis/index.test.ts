import { describe, it, expect } from 'vitest';
import { EquipmentInputs, WaferInputs } from './index';

describe('Analysis Barrel Export', () => {
  it('exports EquipmentInputs component', () => {
    expect(EquipmentInputs).toBeDefined();
    expect(typeof EquipmentInputs).toBe('function');
  });

  it('EquipmentInputs is accessible via barrel import', () => {
    // Verify the named export works correctly
    expect(EquipmentInputs.name).toBe('EquipmentInputs');
  });

  it('exports WaferInputs component', () => {
    expect(WaferInputs).toBeDefined();
    expect(typeof WaferInputs).toBe('function');
  });

  it('WaferInputs is accessible via barrel import', () => {
    expect(WaferInputs.name).toBe('WaferInputs');
  });
});
