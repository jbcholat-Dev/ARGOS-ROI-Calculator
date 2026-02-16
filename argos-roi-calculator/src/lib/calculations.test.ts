import { describe, it, expect } from 'vitest';
import type { Analysis, GlobalParams } from '@/types';
import {
  calculateTotalFailureCost,
  calculateArgosServiceCost,
  calculateSavings,
  calculateROI,
  getROIColorClass,
  calculateAggregatedMetrics,
  calculateAnalysisRow,
  calculateAllAnalysisRows,
  calculatePlannedOverhaulSavings,
  calculateStrategySavings,
  isAnalysisCalculable,
} from './calculations';

// ============================================================================
// calculateTotalFailureCost
// ============================================================================

describe('calculateTotalFailureCost', () => {
  it('should calculate decoupled formula correctly (Story 4.5.2)', () => {
    // 10 pumps, 10% failure, €8,000/wafer, 125 wafers/batch, 6h downtime, €500/h, 2 defect events
    // waferDefectCost = 2 * 8000 * 125 = 2,000,000
    // downtimeCost = (10 * 0.10) * 6 * 500 = 1 * 3,000 = 3,000
    // total = 2,003,000
    const result = calculateTotalFailureCost(10, 10, 8000, 125, 6, 500, 2);
    expect(result).toBe(2_003_000);
  });

  it('should return downtime-only cost when waferDefectEventsPerYear is 0', () => {
    // 10 pumps, 10% failure, 6h downtime, €500/h, 0 defect events
    // waferDefectCost = 0
    // downtimeCost = 1 * 6 * 500 = 3,000
    const result = calculateTotalFailureCost(10, 10, 8000, 125, 6, 500, 0);
    expect(result).toBe(3_000);
  });

  it('should default waferDefectEventsPerYear to 0 when omitted', () => {
    // Same as above — omitting 7th param defaults to 0
    const result = calculateTotalFailureCost(10, 10, 8000, 125, 6, 500);
    expect(result).toBe(3_000);
  });

  it('should return wafer-only cost when downtime is 0', () => {
    // 10 pumps, 10% failure, 0h downtime, 3 defect events
    // waferDefectCost = 3 * 8000 * 125 = 3,000,000
    // downtimeCost = 1 * 0 * 500 = 0
    const result = calculateTotalFailureCost(10, 10, 8000, 125, 0, 500, 3);
    expect(result).toBe(3_000_000);
  });

  it('should handle defect events greater than failed pumps', () => {
    // 10 pumps, 10% failure (1 failed pump), but 5 defect events (a single failure can cause multiple)
    // waferDefectCost = 5 * 8000 * 125 = 5,000,000
    // downtimeCost = 1 * 6 * 500 = 3,000
    const result = calculateTotalFailureCost(10, 10, 8000, 125, 6, 500, 5);
    expect(result).toBe(5_003_000);
  });

  it('should calculate correctly with mono wafer type (1 wafer per batch)', () => {
    // 10 pumps, 10% failure, 1 wafer/batch, 2 defect events
    // waferDefectCost = 2 * 8000 * 1 = 16,000
    // downtimeCost = 1 * 6 * 500 = 3,000
    const result = calculateTotalFailureCost(10, 10, 8000, 1, 6, 500, 2);
    expect(result).toBe(19_000);
  });

  it('should return 0 when pump quantity is 0 (even with defect events)', () => {
    expect(calculateTotalFailureCost(0, 10, 8000, 125, 6, 500, 2)).toBe(0);
  });

  it('should return 0 when failure rate is 0 (even with defect events)', () => {
    expect(calculateTotalFailureCost(10, 0, 8000, 125, 6, 500, 2)).toBe(0);
  });

  it('should handle high failure rate (100%) with defect events', () => {
    // 10 pumps, 100% failure (10 failed), 2 defect events
    // waferDefectCost = 2 * 8000 * 125 = 2,000,000
    // downtimeCost = 10 * 6 * 500 = 30,000
    const result = calculateTotalFailureCost(10, 100, 8000, 125, 6, 500, 2);
    expect(result).toBe(2_030_000);
  });

  it('should handle very large numbers without overflow', () => {
    const result = calculateTotalFailureCost(1000, 50, 100000, 500, 24, 10000, 10);
    expect(result).toBeGreaterThan(0);
    expect(Number.isFinite(result)).toBe(true);
  });

  it('should handle very small fractional values', () => {
    // 1 pump, 0.1% failure, 0.5h downtime, €10/h, 0 defect events
    // downtimeCost = 0.001 * 0.5 * 10 = 0.005
    const result = calculateTotalFailureCost(1, 0.1, 100, 1, 0.5, 10, 0);
    expect(result).toBeCloseTo(0.005);
  });

  it('should return 0 for negative waferDefectEventsPerYear', () => {
    expect(calculateTotalFailureCost(10, 10, 8000, 125, 6, 500, -1)).toBe(0);
  });

  it('should return 0 for NaN waferDefectEventsPerYear', () => {
    expect(calculateTotalFailureCost(10, 10, 8000, 125, 6, 500, NaN)).toBe(0);
  });

  it('should complete within 100ms (NFR-P1)', () => {
    const start = performance.now();
    calculateTotalFailureCost(10, 10, 8000, 125, 6, 500, 2);
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100);
  });

  // Story 4.5.3: Bottleneck Multiplier
  it('should apply bottleneck multiplier only to downtime cost', () => {
    // 10 pumps, 10% failure, 2 defect events, x2 multiplier
    // waferDefectCost = 2 * 8000 * 125 = 2,000,000 (NOT multiplied)
    // downtimeCost = 1 * 6 * 500 * 2 = 6,000 (multiplied by 2)
    // total = 2,006,000
    const result = calculateTotalFailureCost(10, 10, 8000, 125, 6, 500, 2, 2);
    expect(result).toBe(2_006_000);
  });

  it('should default bottleneck multiplier to 1 (no effect)', () => {
    const withoutMultiplier = calculateTotalFailureCost(10, 10, 8000, 125, 6, 500, 2);
    const withMultiplier1 = calculateTotalFailureCost(10, 10, 8000, 125, 6, 500, 2, 1);
    expect(withoutMultiplier).toBe(withMultiplier1);
  });

  it('should apply x3 bottleneck multiplier correctly', () => {
    // 10 pumps, 10% failure, 0 defect events, x3 multiplier
    // downtimeCost = 1 * 6 * 500 * 3 = 9,000
    const result = calculateTotalFailureCost(10, 10, 8000, 125, 6, 500, 0, 3);
    expect(result).toBe(9_000);
  });

  it('should return 0 for bottleneck multiplier < 1', () => {
    expect(calculateTotalFailureCost(10, 10, 8000, 125, 6, 500, 0, 0.5)).toBe(0);
    expect(calculateTotalFailureCost(10, 10, 8000, 125, 6, 500, 0, 0)).toBe(0);
  });

  it('should return 0 for negative bottleneck multiplier', () => {
    expect(calculateTotalFailureCost(10, 10, 8000, 125, 6, 500, 0, -2)).toBe(0);
  });

  it('should return 0 for NaN bottleneck multiplier', () => {
    expect(calculateTotalFailureCost(10, 10, 8000, 125, 6, 500, 0, NaN)).toBe(0);
  });

  it('should return 0 for Infinity bottleneck multiplier', () => {
    expect(calculateTotalFailureCost(10, 10, 8000, 125, 6, 500, 0, Infinity)).toBe(0);
  });

  it('should accept x5 bottleneck multiplier (max)', () => {
    // 10 pumps, 10% failure, 0 defect events, x5 multiplier
    // downtimeCost = 1 * 6 * 500 * 5 = 15,000
    const result = calculateTotalFailureCost(10, 10, 8000, 125, 6, 500, 0, 5);
    expect(result).toBe(15_000);
  });

  it('should handle fractional multiplier (x1.5)', () => {
    // 10 pumps, 10% failure, 0 defect events, x1.5 multiplier
    // downtimeCost = 1 * 6 * 500 * 1.5 = 4,500
    const result = calculateTotalFailureCost(10, 10, 8000, 125, 6, 500, 0, 1.5);
    expect(result).toBe(4_500);
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
  it('should produce consistent results through the entire pipeline (decoupled)', () => {
    // 10 pumps, 10% failure, 2 defect events, €8,000/wafer, 125 wafers/batch, 6h downtime, €500/h
    // waferDefectCost = 2 * 8000 * 125 = 2,000,000
    // downtimeCost = 1 * 6 * 500 = 3,000
    // total = 2,003,000
    const totalFailureCost = calculateTotalFailureCost(10, 10, 8000, 125, 6, 500, 2);
    const argosServiceCost = calculateArgosServiceCost(10, 2500);
    const savings = calculateSavings(totalFailureCost, argosServiceCost, 70);
    const roi = calculateROI(savings, argosServiceCost);
    const colorClass = getROIColorClass(roi);

    expect(totalFailureCost).toBe(2_003_000);
    expect(argosServiceCost).toBe(25_000);
    // savings = 2,003,000 * 0.70 - 25,000 = 1,402,100 - 25,000 = 1,377,100
    expect(savings).toBe(1_377_100);
    // roi = (1,377,100 / 25,000) * 100 = 5,508.4
    expect(roi).toBeCloseTo(5508.4);
    expect(colorClass).toBe('text-green-600');
  });

  it('should handle downtime-only scenario (0 defect events)', () => {
    // downtimeCost only = 0.05 * 1 * 100 = 5
    const totalFailureCost = calculateTotalFailureCost(1, 5, 100, 1, 1, 100, 0);
    const argosServiceCost = calculateArgosServiceCost(1, 2500);
    const savings = calculateSavings(totalFailureCost, argosServiceCost, 70);
    // 5 * 0.70 - 2500 = 3.5 - 2500 = -2496.5
    const roi = calculateROI(savings, argosServiceCost);
    const colorClass = getROIColorClass(roi);

    expect(totalFailureCost).toBe(5);
    expect(argosServiceCost).toBe(2500);
    expect(savings).toBe(-2496.5);
    expect(roi).toBeCloseTo(-99.86);
    expect(colorClass).toBe('text-red-600');
  });

  it('should complete full pipeline within 100ms (NFR-P1)', () => {
    const start = performance.now();
    const totalFailureCost = calculateTotalFailureCost(10, 10, 8000, 125, 6, 500, 2);
    const argosServiceCost = calculateArgosServiceCost(10, 2500);
    const savings = calculateSavings(totalFailureCost, argosServiceCost, 70);
    calculateROI(savings, argosServiceCost);
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100);
  });
});

// ============================================================================
// calculateAggregatedMetrics
// ============================================================================

function createAnalysis(overrides: Partial<Analysis> = {}): Analysis {
  return {
    id: crypto.randomUUID(),
    name: 'Test Analysis',
    pumpType: 'HiPace (turbo)',
    pumpQuantity: 10,
    failureRateMode: 'percentage',
    failureRatePercentage: 10,
    waferType: 'batch',
    waferQuantity: 125,
    waferCost: 8000,
    waferDefectEventsPerYear: 1,
    downtimeDuration: 6,
    downtimeCostPerHour: 500,
    isBottleneck: false,
    bottleneckMultiplier: 2.0,
    maintenanceStrategy: 'unplanned' as const,
    overhaulCostPerPump: 0,
    pmIntervalMonths: 12,
    argosMtbfExtensionPercent: 15,
    unplannedDespitePM: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

const defaultGlobalParams: GlobalParams = {
  detectionRate: 70,
  serviceCostPerPump: 2500,
};

describe('calculateAggregatedMetrics', () => {
  it('should return all zeros for 0 analyses', () => {
    const result = calculateAggregatedMetrics([], defaultGlobalParams);

    expect(result.totalSavings).toBe(0);
    expect(result.totalServiceCost).toBe(0);
    expect(result.totalFailureCost).toBe(0);
    expect(result.totalPumps).toBe(0);
    expect(result.overallROI).toBe(0);
    expect(result.processCount).toBe(0);
    expect(result.excludedCount).toBe(0);
  });

  it('should match single analysis values for 1 analysis', () => {
    const analysis = createAnalysis();
    const result = calculateAggregatedMetrics([analysis], defaultGlobalParams);

    // Single analysis: 10 pumps, 10% failure, 1 defect event, €8000/wafer, 125 batch, 6h, €500/h
    // waferDefectCost = 1 * 8000 * 125 = 1,000,000
    // downtimeCost = (10 * 0.10) * 6 * 500 = 1 * 3,000 = 3,000
    // totalFailureCost = 1,003,000
    // serviceCost = 10 * 2500 = 25,000
    // savings = 1,003,000 * 0.70 - 25,000 = 702,100 - 25,000 = 677,100
    // ROI = (677,100 / 25,000) * 100 = 2,708.4
    expect(result.totalFailureCost).toBe(1_003_000);
    expect(result.totalServiceCost).toBe(25_000);
    expect(result.totalSavings).toBe(677_100);
    expect(result.overallROI).toBeCloseTo(2708.4);
    expect(result.totalPumps).toBe(10);
    expect(result.processCount).toBe(1);
    expect(result.excludedCount).toBe(0);
  });

  it('should correctly sum 3 analyses', () => {
    const analyses = [
      createAnalysis({ pumpQuantity: 10 }),
      createAnalysis({ pumpQuantity: 8 }),
      createAnalysis({ pumpQuantity: 8 }),
    ];
    const result = calculateAggregatedMetrics(analyses, defaultGlobalParams);

    // Decoupled formula: waferDefectCost = events * waferCost * wafersPerBatch (independent of pumpQuantity)
    // Analysis 1: 10 pumps → waferDefect=1,000,000, downtime=1*6*500=3,000, total=1,003,000, service=25,000
    // Analysis 2: 8 pumps → waferDefect=1,000,000, downtime=0.8*6*500=2,400, total=1,002,400, service=20,000
    // Analysis 3: 8 pumps → waferDefect=1,000,000, downtime=0.8*6*500=2,400, total=1,002,400, service=20,000
    const fc1 = 1_003_000, sc1 = 25_000;
    const fc2 = 1_002_400, sc2 = 20_000;
    const fc3 = 1_002_400, sc3 = 20_000;
    const sav1 = fc1 * 0.70 - sc1; // 677,100
    const sav2 = fc2 * 0.70 - sc2; // 681,680
    const sav3 = fc3 * 0.70 - sc3; // 681,680

    expect(result.totalPumps).toBe(26);
    expect(result.totalFailureCost).toBe(fc1 + fc2 + fc3);
    expect(result.totalServiceCost).toBe(sc1 + sc2 + sc3);
    expect(result.totalSavings).toBe(sav1 + sav2 + sav3);
    expect(result.processCount).toBe(3);
    expect(result.excludedCount).toBe(0);
    const expectedROI = (result.totalSavings / result.totalServiceCost) * 100;
    expect(result.overallROI).toBeCloseTo(expectedROI);
  });

  it('should exclude incomplete analyses (2 calculable + 1 incomplete)', () => {
    const analyses = [
      createAnalysis({ pumpQuantity: 10 }),
      createAnalysis({ pumpQuantity: 8 }),
      createAnalysis({ pumpQuantity: 0 }), // incomplete: pumpQuantity = 0
    ];
    const result = calculateAggregatedMetrics(analyses, defaultGlobalParams);

    expect(result.processCount).toBe(2);
    expect(result.excludedCount).toBe(1);
    expect(result.totalPumps).toBe(18); // 10 + 8 (not 0)
  });

  it('should correctly aggregate 5 analyses (NFR-P6)', () => {
    const analyses = [
      createAnalysis({ pumpQuantity: 10 }),
      createAnalysis({ pumpQuantity: 8 }),
      createAnalysis({ pumpQuantity: 5 }),
      createAnalysis({ pumpQuantity: 12 }),
      createAnalysis({ pumpQuantity: 6 }),
    ];
    const result = calculateAggregatedMetrics(analyses, defaultGlobalParams);

    expect(result.totalPumps).toBe(41);
    expect(result.processCount).toBe(5);
    expect(result.excludedCount).toBe(0);
    expect(result.totalSavings).toBeGreaterThan(0);
    expect(result.totalServiceCost).toBeGreaterThan(0);
    expect(result.totalFailureCost).toBeGreaterThan(0);
    expect(result.overallROI).toBeGreaterThan(0);
  });

  it('should return overallROI = 0 when totalServiceCost is 0 (division by zero)', () => {
    // All analyses with 0 pumps → service cost = 0, but also won't be calculable
    // Use an empty array instead since 0-pump analyses won't pass isAnalysisCalculable
    const result = calculateAggregatedMetrics([], defaultGlobalParams);
    expect(result.overallROI).toBe(0);
  });

  it('should handle negative savings correctly', () => {
    // Create analysis with very low failure costs → savings will be negative
    const analysis = createAnalysis({
      pumpQuantity: 1,
      failureRatePercentage: 1,
      waferCost: 10,
      waferQuantity: 1,
      waferType: 'mono',
      waferDefectEventsPerYear: 1,
      downtimeDuration: 1,
      downtimeCostPerHour: 10,
      isBottleneck: false,
      bottleneckMultiplier: 2.0,
      maintenanceStrategy: 'unplanned' as const,
      overhaulCostPerPump: 0,
      pmIntervalMonths: 12,
      argosMtbfExtensionPercent: 15,
      unplannedDespitePM: 0,
    });
    const result = calculateAggregatedMetrics([analysis], defaultGlobalParams);

    // waferDefectCost = 1 * 10 * 1 = 10
    // downtimeCost = (1 * 0.01) * 1 * 10 = 0.1
    // failureCost = 10.1
    // serviceCost = 1 * 2500 = 2500
    // savings = 10.1 * 0.70 - 2500 = 7.07 - 2500 = -2492.93
    expect(result.totalSavings).toBeLessThan(0);
    expect(result.overallROI).toBeLessThan(0);
  });

  it('should use per-analysis detection rate when set', () => {
    const analysis = createAnalysis({ detectionRate: 90 });
    const result = calculateAggregatedMetrics([analysis], defaultGlobalParams);

    // With 90% detection: savings = 1,003,000 * 0.90 - 25,000 = 902,700 - 25,000 = 877,700
    expect(result.totalSavings).toBe(877_700);
  });

  it('should fall back to global detection rate when per-analysis is undefined', () => {
    const analysis = createAnalysis({ detectionRate: undefined });
    const result = calculateAggregatedMetrics([analysis], defaultGlobalParams);

    // With 70% detection (global): savings = 1,003,000 * 0.70 - 25,000 = 677,100
    expect(result.totalSavings).toBe(677_100);
  });

  it('should handle mono wafer type correctly', () => {
    const analysis = createAnalysis({ waferType: 'mono', waferQuantity: 125 });
    const result = calculateAggregatedMetrics([analysis], defaultGlobalParams);

    // mono forces waferQuantity to 1 regardless of waferQuantity field
    // failureCost = (10 * 0.10) * (8000*1 + 6*500) = 1 * (8000 + 3000) = 11,000
    // serviceCost = 10 * 2500 = 25,000
    // savings = 11,000 * 0.70 - 25,000 = 7,700 - 25,000 = -17,300
    expect(result.totalFailureCost).toBe(11_000);
    expect(result.totalSavings).toBe(-17_300);
  });

  it('should complete aggregation of 5 analyses within 100ms (NFR-P1)', () => {
    const analyses = Array.from({ length: 5 }, (_, i) =>
      createAnalysis({ pumpQuantity: 10 + i })
    );

    const start = performance.now();
    calculateAggregatedMetrics(analyses, defaultGlobalParams);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(100);
  });

  // Story 4.5.3: Bottleneck multiplier in aggregation
  it('should increase failure cost when bottleneck is enabled', () => {
    const withoutBottleneck = createAnalysis({ isBottleneck: false });
    const withBottleneck = createAnalysis({ isBottleneck: true, bottleneckMultiplier: 2.0 });

    const resultWithout = calculateAggregatedMetrics([withoutBottleneck], defaultGlobalParams);
    const resultWith = calculateAggregatedMetrics([withBottleneck], defaultGlobalParams);

    // Bottleneck doubles downtime cost only, so total failure cost increases
    expect(resultWith.totalFailureCost).toBeGreaterThan(resultWithout.totalFailureCost);
    // Savings should also increase since more cost is avoided
    expect(resultWith.totalSavings).toBeGreaterThan(resultWithout.totalSavings);
  });
});

// ============================================================================
// calculateAnalysisRow
// ============================================================================

describe('calculateAnalysisRow', () => {
  it('should return correct AnalysisRowData for valid analysis', () => {
    const analysis = createAnalysis({ name: 'Poly Etch' });
    const result = calculateAnalysisRow(analysis, defaultGlobalParams);

    expect(result).not.toBeNull();
    expect(result!.id).toBe(analysis.id);
    expect(result!.name).toBe('Poly Etch');
    expect(result!.pumpQuantity).toBe(10);
    expect(result!.failureRate).toBe(10);
    expect(result!.totalFailureCost).toBe(1_003_000);
    expect(result!.argosServiceCost).toBe(25_000);
    expect(result!.savings).toBe(677_100);
    expect(result!.roiPercentage).toBeCloseTo(2708.4);
  });

  it('should return null for incomplete analysis', () => {
    const analysis = createAnalysis({ pumpQuantity: 0 });
    const result = calculateAnalysisRow(analysis, defaultGlobalParams);

    expect(result).toBeNull();
  });

  it('should use per-analysis detectionRate when set', () => {
    const analysis = createAnalysis({ detectionRate: 90 });
    const result = calculateAnalysisRow(analysis, defaultGlobalParams);

    // savings = 1,003,000 * 0.90 - 25,000 = 902,700 - 25,000 = 877,700
    expect(result!.savings).toBe(877_700);
  });

  it('should use globalParams.detectionRate when analysis.detectionRate is undefined', () => {
    const analysis = createAnalysis({ detectionRate: undefined });
    const result = calculateAnalysisRow(analysis, defaultGlobalParams);

    // savings = 1,003,000 * 0.70 - 25,000 = 677,100
    expect(result!.savings).toBe(677_100);
  });

  it('should handle mono wafer type correctly (forces waferQuantity to 1)', () => {
    const analysis = createAnalysis({ waferType: 'mono', waferQuantity: 125 });
    const result = calculateAnalysisRow(analysis, defaultGlobalParams);

    // mono forces waferQuantity to 1 regardless of waferQuantity field
    // failureCost = (10 * 0.10) * (8000*1 + 6*500) = 1 * (8000 + 3000) = 11,000
    // serviceCost = 10 * 2500 = 25,000
    // savings = 11,000 * 0.70 - 25,000 = 7,700 - 25,000 = -17,300
    expect(result).not.toBeNull();
    expect(result!.totalFailureCost).toBe(11_000);
    expect(result!.savings).toBe(-17_300);
  });

  // Story 4.5.3: Bottleneck multiplier in analysis row
  it('should apply bottleneck multiplier when isBottleneck is true', () => {
    const analysis = createAnalysis({ isBottleneck: true, bottleneckMultiplier: 3.0 });
    const result = calculateAnalysisRow(analysis, defaultGlobalParams);

    // waferDefectCost = 1 * 8000 * 125 = 1,000,000 (NOT multiplied)
    // downtimeCost = 1 * 6 * 500 * 3 = 9,000 (multiplied by 3)
    // totalFailureCost = 1,009,000
    expect(result).not.toBeNull();
    expect(result!.totalFailureCost).toBe(1_009_000);
  });

  it('should NOT apply multiplier when isBottleneck is false', () => {
    const analysis = createAnalysis({ isBottleneck: false, bottleneckMultiplier: 3.0 });
    const result = calculateAnalysisRow(analysis, defaultGlobalParams);

    // bottleneckMultiplier is 3 but isBottleneck is false → effectiveMultiplier = 1
    // waferDefectCost = 1 * 8000 * 125 = 1,000,000
    // downtimeCost = 1 * 6 * 500 * 1 = 3,000
    // totalFailureCost = 1,003,000
    expect(result).not.toBeNull();
    expect(result!.totalFailureCost).toBe(1_003_000);
  });
});

// ============================================================================
// calculateAllAnalysisRows
// ============================================================================

describe('calculateAllAnalysisRows', () => {
  it('should filter out incomplete analyses (mixed calculable + incomplete)', () => {
    const analyses = [
      createAnalysis({ name: 'Valid 1', pumpQuantity: 10 }),
      createAnalysis({ name: 'Incomplete', pumpQuantity: 0 }),
      createAnalysis({ name: 'Valid 2', pumpQuantity: 8 }),
    ];
    const result = calculateAllAnalysisRows(analyses, defaultGlobalParams);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Valid 1');
    expect(result[1].name).toBe('Valid 2');
  });

  it('should return empty array for 0 analyses', () => {
    const result = calculateAllAnalysisRows([], defaultGlobalParams);

    expect(result).toEqual([]);
  });

  it('should return 5 rows for 5 valid analyses (NFR-P6)', () => {
    const analyses = Array.from({ length: 5 }, (_, i) =>
      createAnalysis({ name: `Process ${i + 1}`, pumpQuantity: 10 + i })
    );
    const result = calculateAllAnalysisRows(analyses, defaultGlobalParams);

    expect(result).toHaveLength(5);
    result.forEach((row, i) => {
      expect(row.name).toBe(`Process ${i + 1}`);
      expect(row.pumpQuantity).toBe(10 + i);
    });
  });
});

// ============================================================================
// Story 4.5.4: Maintenance Strategy — Planned Overhaul Savings
// ============================================================================

describe('calculatePlannedOverhaulSavings', () => {
  it('should calculate overhaul savings correctly (AC5 example)', () => {
    // 20 pumps, 24-month interval, €25K overhaul cost, 20% MTBF extension
    const result = calculatePlannedOverhaulSavings(20, 24, 25_000, 20);

    // currentOverhauls = 20 / (24/12) = 10
    expect(result.currentOverhauls).toBe(10);
    // argosInterval = 24 * 1.20 = 28.8, argosOverhauls = 20 / (28.8/12) = 8.333...
    expect(result.argosOverhauls).toBeCloseTo(8.333, 2);
    // overhaulSavings = (10 - 8.333) * 25,000 = 41,666.67
    expect(result.overhaulSavings).toBeCloseTo(41_666.67, 0);
  });

  it('should calculate with 15% default MTBF extension', () => {
    const result = calculatePlannedOverhaulSavings(20, 12, 25_000, 15);
    // currentOverhauls = 20 / (12/12) = 20
    // argosInterval = 12 * 1.15 = 13.8, argosOverhauls = 20 / (13.8/12) = 17.39...
    expect(result.currentOverhauls).toBe(20);
    expect(result.argosOverhauls).toBeCloseTo(17.391, 2);
    // savings = (20 - 17.391) * 25,000 = 65,217.39
    expect(result.overhaulSavings).toBeCloseTo(65_217.39, 0);
  });

  it('should return 0 for 0 pumps', () => {
    const result = calculatePlannedOverhaulSavings(0, 24, 25_000, 20);
    expect(result.overhaulSavings).toBe(0);
    expect(result.currentOverhauls).toBe(0);
  });

  it('should return 0 for 0 interval months', () => {
    const result = calculatePlannedOverhaulSavings(20, 0, 25_000, 20);
    expect(result.overhaulSavings).toBe(0);
  });

  it('should return 0 for 0 overhaul cost', () => {
    const result = calculatePlannedOverhaulSavings(20, 24, 0, 20);
    expect(result.overhaulSavings).toBe(0);
    expect(result.currentOverhauls).toBe(10); // still calculates count
  });

  it('should return 0 for 0% MTBF extension', () => {
    const result = calculatePlannedOverhaulSavings(20, 24, 25_000, 0);
    // 0% extension -> argos interval = current interval -> 0 savings
    expect(result.currentOverhauls).toBe(10);
    expect(result.argosOverhauls).toBe(10);
    expect(result.overhaulSavings).toBe(0);
  });

  it('should handle 1-month interval (extreme)', () => {
    const result = calculatePlannedOverhaulSavings(20, 1, 25_000, 15);
    // currentOverhauls = 20 / (1/12) = 240
    expect(result.currentOverhauls).toBe(240);
  });

  it('should handle negative inputs safely', () => {
    const result = calculatePlannedOverhaulSavings(-5, 24, 25_000, 20);
    expect(result.overhaulSavings).toBe(0);
  });

  it('should handle NaN inputs safely', () => {
    const result = calculatePlannedOverhaulSavings(NaN, 24, 25_000, 20);
    expect(result.overhaulSavings).toBe(0);
  });
});

// ============================================================================
// Story 4.5.4: isAnalysisCalculable — Strategy-aware
// ============================================================================

describe('isAnalysisCalculable — Maintenance Strategy', () => {
  it('should consider unplanned analysis calculable with failure rate and downtime', () => {
    const analysis = createAnalysis({ maintenanceStrategy: 'unplanned' });
    expect(isAnalysisCalculable(analysis)).toBe(true);
  });

  it('should consider planned analysis calculable with overhaul cost', () => {
    const analysis = createAnalysis({
      maintenanceStrategy: 'planned',
      pmIntervalMonths: 24,
      overhaulCostPerPump: 25_000,
    });
    expect(isAnalysisCalculable(analysis)).toBe(true);
  });

  it('should consider planned analysis calculable with residual events and downtime', () => {
    const analysis = createAnalysis({
      maintenanceStrategy: 'planned',
      pmIntervalMonths: 24,
      overhaulCostPerPump: 0,
      unplannedDespitePM: 2,
      downtimeDuration: 6,
      downtimeCostPerHour: 500,
    });
    expect(isAnalysisCalculable(analysis)).toBe(true);
  });

  it('should NOT consider planned analysis calculable without overhaul cost or residual', () => {
    const analysis = createAnalysis({
      maintenanceStrategy: 'planned',
      pmIntervalMonths: 24,
      overhaulCostPerPump: 0,
      unplannedDespitePM: 0,
    });
    expect(isAnalysisCalculable(analysis)).toBe(false);
  });

  it('should NOT consider planned analysis calculable with 0 pumps', () => {
    const analysis = createAnalysis({
      maintenanceStrategy: 'planned',
      pumpQuantity: 0,
      overhaulCostPerPump: 25_000,
    });
    expect(isAnalysisCalculable(analysis)).toBe(false);
  });

  it('should NOT consider planned analysis calculable with 0 interval', () => {
    const analysis = createAnalysis({
      maintenanceStrategy: 'planned',
      pmIntervalMonths: 0,
      overhaulCostPerPump: 25_000,
    });
    expect(isAnalysisCalculable(analysis)).toBe(false);
  });

  it('should handle missing strategy field (defaults to unplanned behavior)', () => {
    const analysis = {
      pumpQuantity: 10,
      failureRatePercentage: 10,
      waferCost: 8000,
      waferDefectEventsPerYear: 1,
      downtimeDuration: 6,
      downtimeCostPerHour: 500,
    };
    expect(isAnalysisCalculable(analysis)).toBe(true);
  });
});

// ============================================================================
// Story 4.5.4: calculateStrategySavings
// ============================================================================

describe('calculateStrategySavings', () => {
  it('should calculate unplanned strategy same as legacy formula', () => {
    const analysis = createAnalysis({ maintenanceStrategy: 'unplanned' });
    const result = calculateStrategySavings(analysis, defaultGlobalParams);

    // Legacy: failureCost = 1,003,000, savings = 1,003,000 * 0.70 - 25,000 = 677,100
    expect(result.totalFailureCost).toBe(1_003_000);
    expect(result.argosServiceCost).toBe(25_000);
    expect(result.savings).toBe(677_100);
  });

  it('should calculate planned strategy with overhaul savings (AC5 example)', () => {
    const analysis = createAnalysis({
      maintenanceStrategy: 'planned',
      pumpQuantity: 20,
      pmIntervalMonths: 24,
      overhaulCostPerPump: 25_000,
      argosMtbfExtensionPercent: 20,
      unplannedDespitePM: 0,
      waferDefectEventsPerYear: 0,
    });
    const result = calculateStrategySavings(analysis, defaultGlobalParams);

    // overhaulSavings = 41,666.67
    // serviceCost = 20 * 2500 = 50,000
    // savings = 41,666.67 + 0 - 50,000 = -8,333.33
    expect(result.argosServiceCost).toBe(50_000);
    expect(result.savings).toBeCloseTo(-8_333.33, 0);
  });

  it('should calculate planned with residual unplanned events', () => {
    const analysis = createAnalysis({
      maintenanceStrategy: 'planned',
      pumpQuantity: 20,
      pmIntervalMonths: 24,
      overhaulCostPerPump: 25_000,
      argosMtbfExtensionPercent: 20,
      unplannedDespitePM: 1,
      downtimeDuration: 6,
      downtimeCostPerHour: 15_000,
      waferDefectEventsPerYear: 0,
      detectionRate: 80,
    });
    const result = calculateStrategySavings(analysis, defaultGlobalParams);

    // overhaulSavings = ~41,666.67
    // residualDowntimeCost = 1 * 6 * 15,000 = 90,000
    // residualSavings = 90,000 * 0.80 = 72,000
    // serviceCost = 50,000
    // savings = 41,666.67 + 72,000 - 50,000 = 63,666.67
    expect(result.savings).toBeCloseTo(63_666.67, 0);
  });

  it('should calculate planned with 0 residual as pure overhaul savings', () => {
    const analysis = createAnalysis({
      maintenanceStrategy: 'planned',
      pumpQuantity: 20,
      pmIntervalMonths: 12,
      overhaulCostPerPump: 25_000,
      argosMtbfExtensionPercent: 15,
      unplannedDespitePM: 0,
      waferDefectEventsPerYear: 0,
    });
    const result = calculateStrategySavings(analysis, defaultGlobalParams);

    // currentOverhauls = 20 / (12/12) = 20
    // argosOverhauls = 20 / (13.8/12) = 17.391
    // overhaulSavings = (20 - 17.391) * 25,000 = 65,217.39
    // serviceCost = 50,000
    // savings = 65,217.39 - 50,000 = 15,217.39
    expect(result.savings).toBeCloseTo(15_217.39, 0);
  });

  it('should use per-analysis detection rate in unplanned mode', () => {
    const analysis = createAnalysis({
      maintenanceStrategy: 'unplanned',
      detectionRate: 90,
    });
    const result = calculateStrategySavings(analysis, defaultGlobalParams);

    // savings = 1,003,000 * 0.90 - 25,000 = 877,700
    expect(result.savings).toBe(877_700);
  });

  it('should use global detection rate when per-analysis is undefined', () => {
    const analysis = createAnalysis({
      maintenanceStrategy: 'unplanned',
      detectionRate: undefined,
    });
    const result = calculateStrategySavings(analysis, defaultGlobalParams);

    // savings = 1,003,000 * 0.70 - 25,000 = 677,100
    expect(result.savings).toBe(677_100);
  });
});

// ============================================================================
// Story 4.5.4: calculateAnalysisRow — Strategy dispatch
// ============================================================================

describe('calculateAnalysisRow — Maintenance Strategy', () => {
  it('should return correct data for planned strategy analysis', () => {
    const analysis = createAnalysis({
      maintenanceStrategy: 'planned',
      pumpQuantity: 20,
      pmIntervalMonths: 24,
      overhaulCostPerPump: 25_000,
      argosMtbfExtensionPercent: 20,
    });
    const result = calculateAnalysisRow(analysis, defaultGlobalParams);

    expect(result).not.toBeNull();
    expect(result!.pumpQuantity).toBe(20);
    expect(result!.argosServiceCost).toBe(50_000);
  });

  it('should return null for incomplete planned analysis', () => {
    const analysis = createAnalysis({
      maintenanceStrategy: 'planned',
      overhaulCostPerPump: 0,
      unplannedDespitePM: 0,
    });
    const result = calculateAnalysisRow(analysis, defaultGlobalParams);

    expect(result).toBeNull();
  });
});

// ============================================================================
// Story 4.5.4: calculateAggregatedMetrics — Mixed strategies
// ============================================================================

describe('calculateAggregatedMetrics — Mixed Strategies', () => {
  it('should aggregate mixed unplanned and planned analyses', () => {
    const analyses = [
      createAnalysis({
        maintenanceStrategy: 'unplanned',
        pumpQuantity: 10,
      }),
      createAnalysis({
        maintenanceStrategy: 'planned',
        pumpQuantity: 20,
        pmIntervalMonths: 24,
        overhaulCostPerPump: 25_000,
        argosMtbfExtensionPercent: 20,
      }),
    ];
    const result = calculateAggregatedMetrics(analyses, defaultGlobalParams);

    expect(result.processCount).toBe(2);
    expect(result.totalPumps).toBe(30);
    expect(result.totalServiceCost).toBe(75_000); // (10 + 20) * 2500
    expect(result.totalSavings).not.toBe(0);
    expect(Number.isFinite(result.overallROI)).toBe(true);
  });

  it('should handle all planned analyses', () => {
    const analyses = [
      createAnalysis({
        maintenanceStrategy: 'planned',
        pumpQuantity: 10,
        pmIntervalMonths: 12,
        overhaulCostPerPump: 20_000,
        argosMtbfExtensionPercent: 15,
      }),
      createAnalysis({
        maintenanceStrategy: 'planned',
        pumpQuantity: 8,
        pmIntervalMonths: 24,
        overhaulCostPerPump: 30_000,
        argosMtbfExtensionPercent: 25,
      }),
    ];
    const result = calculateAggregatedMetrics(analyses, defaultGlobalParams);

    expect(result.processCount).toBe(2);
    expect(result.totalPumps).toBe(18);
  });

  it('should exclude incomplete planned analyses', () => {
    const analyses = [
      createAnalysis({
        maintenanceStrategy: 'planned',
        pumpQuantity: 10,
        pmIntervalMonths: 12,
        overhaulCostPerPump: 20_000,
      }),
      createAnalysis({
        maintenanceStrategy: 'planned',
        pumpQuantity: 10,
        pmIntervalMonths: 12,
        overhaulCostPerPump: 0, // incomplete
        unplannedDespitePM: 0,
      }),
    ];
    const result = calculateAggregatedMetrics(analyses, defaultGlobalParams);

    expect(result.processCount).toBe(1);
    expect(result.excludedCount).toBe(1);
  });
});
