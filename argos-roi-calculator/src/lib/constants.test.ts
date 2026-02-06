import { describe, it, expect } from 'vitest';
import { PUMP_TYPE_SUGGESTIONS } from './constants';

describe('PUMP_TYPE_SUGGESTIONS', () => {
  it('exports an array of pump type suggestions', () => {
    expect(Array.isArray(PUMP_TYPE_SUGGESTIONS)).toBe(true);
    expect(PUMP_TYPE_SUGGESTIONS.length).toBeGreaterThan(0);
  });

  it('contains expected V9 pump types', () => {
    const suggestions = [...PUMP_TYPE_SUGGESTIONS];
    expect(suggestions).toContain('HiPace (turbo)');
    expect(suggestions).toContain('HiScrew (dry screw)');
    expect(suggestions).toContain('OnTool Roots (roots)');
  });
});
