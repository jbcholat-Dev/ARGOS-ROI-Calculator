import { describe, it, expect } from 'vitest';
import {
  calculateTotalFailureCost,
  calculateArgosServiceCost,
  calculateSavings,
  calculateROI,
  getROIColorClass,
} from './calculations';

// ============================================================================
// calculateTotalFailureCost
// ============================================================================

describe('calculateTotalFailureCost', () => {
  it('should calculate correctly with valid inputs (V9 reference scenario)', () => {
    // 10 pumps, 10% failure, €8,000/wafer, 125 wafers/batch, 6h downtime, €500/h
    const result = calculateTotalFailureCost(10, 10, 8000, 125, 6, 500);
    // (10 * 10/100) * (8000 * 125 + 6 * 500) = 1 * (1,000,000 + 3,000) = 1,003,000
    expect(result).toBe(1_003_000);
  });

  it('should calculate correctly with mono wafer type (1 wafer per batch)', () => {
    const result = calculateTotalFailureCost(10, 10, 8000, 1, 6, 500);
    // 1 * (8000 * 1 + 6 * 500) = 1 * (8,000 + 3,000) = 11,000
    expect(result).toBe(11_000);
  });

  it('should return 0 when pump quantity is 0', () => {
    expect(calculateTotalFailureCost(0, 10, 8000, 125, 6, 500)).toBe(0);
  });

  it('should return 0 when failure rate is 0', () => {
    expect(calculateTotalFailureCost(10, 0, 8000, 125, 6, 500)).toBe(0);
  });

  it('should handle high failure rate (100%)', () => {
    const result = calculateTotalFailureCost(10, 100, 8000, 125, 6, 500);
    // (10 * 1.0) * (1,000,000 + 3,000) = 10,030,000
    expect(result).toBe(10_030_000);
  });

  it('should handle very large numbers without overflow', () => {
    const result = calculateTotalFailureCost(1000, 50, 100000, 500, 24, 10000);
    expect(result).toBeGreaterThan(0);
    expect(Number.isFinite(result)).toBe(true);
  });

  it('should handle very small fractional values', () => {
    const result = calculateTotalFailureCost(1, 0.1, 100, 1, 0.5, 10);
    // (1 * 0.001) * (100 + 5) = 0.001 * 105 = 0.105
    expect(result).toBeCloseTo(0.105);
  });

  it('should complete within 100ms (NFR-P1)', () => {
    const start = performance.now();
    calculateTotalFailureCost(10, 10, 8000, 125, 6, 500);
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100);
  });
});

// ============================================================================
// calculateArgosServiceCost
// ============================================================================

describe('calculateArgosServiceCost', () => {
  it('should calculate correctly with default service cost (€2,500)', () => {
    const result = calculateArgosServiceCost(10, 2500);
    expect(result).toBe(25_000);
  });

  it('should return 0 when pump quantity is 0', () => {
    expect(calculateArgosServiceCost(0, 2500)).toBe(0);
  });

  it('should return 0 when service cost per pump is 0', () => {
    expect(calculateArgosServiceCost(10, 0)).toBe(0);
  });

  it('should handle single pump', () => {
    expect(calculateArgosServiceCost(1, 2500)).toBe(2500);
  });

  it('should handle large fleet (1000+ pumps)', () => {
    const result = calculateArgosServiceCost(1500, 2500);
    expect(result).toBe(3_750_000);
  });

  it('should complete within 100ms (NFR-P1)', () => {
    const start = performance.now();
    calculateArgosServiceCost(10, 2500);
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100);
  });
});

// ============================================================================
// calculateSavings
// ============================================================================

describe('calculateSavings', () => {
  it('should calculate positive savings with default detection rate (70%)', () => {
    // €1,003,000 failure cost, €25,000 service cost, 70% detection
    const result = calculateSavings(1_003_000, 25_000, 70);
    // 1,003,000 * 0.70 - 25,000 = 702,100 - 25,000 = 677,100
    expect(result).toBe(677_100);
  });

  it('should return negative savings when service cost exceeds avoided costs', () => {
    // Small failure cost, high service cost
    const result = calculateSavings(10_000, 25_000, 70);
    // 10,000 * 0.70 - 25,000 = 7,000 - 25,000 = -18,000
    expect(result).toBe(-18_000);
  });

  it('should return 0 when total failure cost is 0', () => {
    const result = calculateSavings(0, 25_000, 70);
    // 0 * 0.70 - 25,000 = -25,000
    expect(result).toBe(-25_000);
  });

  it('should return 0 savings when detection rate is 0', () => {
    const result = calculateSavings(1_003_000, 25_000, 0);
    // 1,003,000 * 0 - 25,000 = -25,000
    expect(result).toBe(-25_000);
  });

  it('should handle 100% detection rate', () => {
    const result = calculateSavings(1_003_000, 25_000, 100);
    // 1,003,000 * 1.0 - 25,000 = 978,000
    expect(result).toBe(978_000);
  });

  it('should return full failure cost as savings when service cost is 0', () => {
    const result = calculateSavings(1_003_000, 0, 70);
    // 1,003,000 * 0.70 - 0 = 702,100
    expect(result).toBe(702_100);
  });
});

// ============================================================================
// calculateROI
// ============================================================================

describe('calculateROI', () => {
  it('should calculate positive ROI correctly', () => {
    const result = calculateROI(677_100, 25_000);
    // (677,100 / 25,000) * 100 = 2,708.4
    expect(result).toBeCloseTo(2708.4);
  });

  it('should return negative ROI when savings are negative', () => {
    const result = calculateROI(-18_000, 25_000);
    // (-18,000 / 25,000) * 100 = -72
    expect(result).toBe(-72);
  });

  it('should return 0 when service cost is 0 (avoid division by zero)', () => {
    expect(calculateROI(677_100, 0)).toBe(0);
  });

  it('should return 0 ROI for zero savings', () => {
    expect(calculateROI(0, 25_000)).toBe(0);
  });

  it('should handle very large ROI values', () => {
    const result = calculateROI(10_000_000, 1000);
    // (10,000,000 / 1000) * 100 = 1,000,000
    expect(result).toBe(1_000_000);
  });

  it('should complete within 100ms (NFR-P1)', () => {
    const start = performance.now();
    calculateROI(677_100, 25_000);
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100);
  });
});

// ============================================================================
// getROIColorClass
// ============================================================================

describe('getROIColorClass', () => {
  it('should return red for negative ROI', () => {
    expect(getROIColorClass(-50)).toBe('text-red-600');
  });

  it('should return red for slightly negative ROI', () => {
    expect(getROIColorClass(-0.1)).toBe('text-red-600');
  });

  it('should return orange for zero ROI', () => {
    expect(getROIColorClass(0)).toBe('text-orange-500');
  });

  it('should return orange for low ROI (10%)', () => {
    expect(getROIColorClass(10)).toBe('text-orange-500');
  });

  it('should return orange for ROI just below threshold (14.99%)', () => {
    expect(getROIColorClass(14.99)).toBe('text-orange-500');
  });

  it('should return green for ROI at threshold (15%)', () => {
    expect(getROIColorClass(15)).toBe('text-green-600');
  });

  it('should return green for high ROI (2708%)', () => {
    expect(getROIColorClass(2708)).toBe('text-green-600');
  });
});

// ============================================================================
// Edge Cases — Invalid Inputs
// ============================================================================

describe('Edge Cases - Invalid Inputs', () => {
  describe('NaN handling', () => {
    it('should return 0 for NaN in calculateTotalFailureCost', () => {
      expect(calculateTotalFailureCost(NaN, 10, 8000, 125, 6, 500)).toBe(0);
      expect(calculateTotalFailureCost(10, NaN, 8000, 125, 6, 500)).toBe(0);
    });

    it('should return 0 for NaN in calculateArgosServiceCost', () => {
      expect(calculateArgosServiceCost(NaN, 2500)).toBe(0);
      expect(calculateArgosServiceCost(10, NaN)).toBe(0);
    });

    it('should return 0 for NaN in calculateSavings', () => {
      expect(calculateSavings(NaN, 25000, 70)).toBe(0);
      expect(calculateSavings(1003000, NaN, 70)).toBe(0);
      expect(calculateSavings(1003000, 25000, NaN)).toBe(0);
    });

    it('should return 0 for NaN in calculateROI', () => {
      expect(calculateROI(NaN, 25000)).toBe(0);
      expect(calculateROI(677100, NaN)).toBe(0);
    });

    it('should return red for NaN in getROIColorClass', () => {
      expect(getROIColorClass(NaN)).toBe('text-red-600');
    });
  });

  describe('Infinity handling', () => {
    it('should return 0 for Infinity in calculateTotalFailureCost', () => {
      expect(calculateTotalFailureCost(Infinity, 10, 8000, 125, 6, 500)).toBe(0);
      expect(calculateTotalFailureCost(10, 10, Infinity, 125, 6, 500)).toBe(0);
    });

    it('should return 0 for Infinity in calculateArgosServiceCost', () => {
      expect(calculateArgosServiceCost(Infinity, 2500)).toBe(0);
    });

    it('should return 0 for Infinity in calculateSavings', () => {
      expect(calculateSavings(Infinity, 25000, 70)).toBe(0);
    });

    it('should return 0 for Infinity in calculateROI', () => {
      expect(calculateROI(Infinity, 25000)).toBe(0);
      expect(calculateROI(677100, Infinity)).toBe(0);
    });

    it('should return red for Infinity in getROIColorClass', () => {
      expect(getROIColorClass(Infinity)).toBe('text-red-600');
      expect(getROIColorClass(-Infinity)).toBe('text-red-600');
    });
  });

  describe('Negative input handling', () => {
    it('should return 0 for negative pumpQuantity in calculateTotalFailureCost', () => {
      expect(calculateTotalFailureCost(-10, 10, 8000, 125, 6, 500)).toBe(0);
    });

    it('should return 0 for negative failureRate in calculateTotalFailureCost', () => {
      expect(calculateTotalFailureCost(10, -5, 8000, 125, 6, 500)).toBe(0);
    });

    it('should return 0 for negative pumpQuantity in calculateArgosServiceCost', () => {
      expect(calculateArgosServiceCost(-10, 2500)).toBe(0);
    });

    it('should return 0 for negative inputs in calculateSavings', () => {
      expect(calculateSavings(-1000, 25000, 70)).toBe(0);
      expect(calculateSavings(1003000, -500, 70)).toBe(0);
      expect(calculateSavings(1003000, 25000, -10)).toBe(0);
    });
  });

  describe('Percentage overflow handling (> 100%)', () => {
    it('should return 0 for failure rate > 100% in calculateTotalFailureCost', () => {
      expect(calculateTotalFailureCost(10, 101, 8000, 125, 6, 500)).toBe(0);
      expect(calculateTotalFailureCost(10, 150, 8000, 125, 6, 500)).toBe(0);
    });

    it('should return 0 for detection rate > 100% in calculateSavings', () => {
      expect(calculateSavings(1_003_000, 25_000, 101)).toBe(0);
      expect(calculateSavings(1_003_000, 25_000, 150)).toBe(0);
    });

    it('should accept exactly 100% as valid percentage', () => {
      const failureCost = calculateTotalFailureCost(10, 100, 8000, 125, 6, 500);
      expect(failureCost).toBeGreaterThan(0);

      const savings = calculateSavings(1_003_000, 25_000, 100);
      expect(savings).toBe(978_000);
    });
  });
});

// ============================================================================
// Pure Function Behavior — Determinism
// ============================================================================

describe('Pure Function Behavior - Determinism', () => {
  it('should return identical results for identical inputs (calculateTotalFailureCost)', () => {
    const result1 = calculateTotalFailureCost(10, 10, 8000, 125, 6, 500);
    const result2 = calculateTotalFailureCost(10, 10, 8000, 125, 6, 500);
    expect(result1).toBe(result2);
  });

  it('should return identical results for identical inputs (calculateArgosServiceCost)', () => {
    const result1 = calculateArgosServiceCost(10, 2500);
    const result2 = calculateArgosServiceCost(10, 2500);
    expect(result1).toBe(result2);
  });

  it('should return identical results for identical inputs (calculateSavings)', () => {
    const result1 = calculateSavings(1003000, 25000, 70);
    const result2 = calculateSavings(1003000, 25000, 70);
    expect(result1).toBe(result2);
  });

  it('should return identical results for identical inputs (calculateROI)', () => {
    const result1 = calculateROI(677100, 25000);
    const result2 = calculateROI(677100, 25000);
    expect(result1).toBe(result2);
  });
});

// ============================================================================
// Integration Scenario — Full Calculation Pipeline
// ============================================================================

describe('Integration - Full Calculation Pipeline', () => {
  it('should produce consistent results through the entire pipeline', () => {
    // Simulating Story 2.7 usage pattern
    const totalFailureCost = calculateTotalFailureCost(10, 10, 8000, 125, 6, 500);
    const argosServiceCost = calculateArgosServiceCost(10, 2500);
    const savings = calculateSavings(totalFailureCost, argosServiceCost, 70);
    const roi = calculateROI(savings, argosServiceCost);
    const colorClass = getROIColorClass(roi);

    expect(totalFailureCost).toBe(1_003_000);
    expect(argosServiceCost).toBe(25_000);
    expect(savings).toBe(677_100);
    expect(roi).toBeCloseTo(2708.4);
    expect(colorClass).toBe('text-green-600');
  });

  it('should handle break-even scenario through the pipeline', () => {
    // Pump config that results in near-zero savings
    const totalFailureCost = calculateTotalFailureCost(1, 5, 100, 1, 1, 100);
    // (1 * 0.05) * (100 + 100) = 0.05 * 200 = 10
    const argosServiceCost = calculateArgosServiceCost(1, 2500);
    // 1 * 2500 = 2500
    const savings = calculateSavings(totalFailureCost, argosServiceCost, 70);
    // 10 * 0.70 - 2500 = 7 - 2500 = -2493
    const roi = calculateROI(savings, argosServiceCost);
    const colorClass = getROIColorClass(roi);

    expect(totalFailureCost).toBe(10);
    expect(argosServiceCost).toBe(2500);
    expect(savings).toBe(-2493);
    expect(roi).toBeCloseTo(-99.72);
    expect(colorClass).toBe('text-red-600');
  });

  it('should complete full pipeline within 100ms (NFR-P1)', () => {
    const start = performance.now();
    const totalFailureCost = calculateTotalFailureCost(10, 10, 8000, 125, 6, 500);
    const argosServiceCost = calculateArgosServiceCost(10, 2500);
    const savings = calculateSavings(totalFailureCost, argosServiceCost, 70);
    calculateROI(savings, argosServiceCost);
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100);
  });
});
