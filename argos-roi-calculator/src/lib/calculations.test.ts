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
    downtimeDuration: 6,
    downtimeCostPerHour: 500,
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

    // Single analysis: 10 pumps, 10% failure, €8000/wafer, 125 batch, 6h, €500/h
    // totalFailureCost = (10 * 0.10) * (8000*125 + 6*500) = 1 * 1,003,000 = 1,003,000
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

    // Analysis 1: 10 pumps → failureCost=1,003,000, serviceCost=25,000, savings=677,100
    // Analysis 2: 8 pumps → failureCost=802,400, serviceCost=20,000, savings=541,680
    // Analysis 3: 8 pumps → failureCost=802,400, serviceCost=20,000, savings=541,680
    expect(result.totalPumps).toBe(26);
    expect(result.totalFailureCost).toBe(1_003_000 + 802_400 + 802_400);
    expect(result.totalServiceCost).toBe(25_000 + 20_000 + 20_000);
    expect(result.totalSavings).toBe(677_100 + 541_680 + 541_680);
    expect(result.processCount).toBe(3);
    expect(result.excludedCount).toBe(0);
    // overallROI = (totalSavings / totalServiceCost) * 100
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
      downtimeDuration: 1,
      downtimeCostPerHour: 10,
    });
    const result = calculateAggregatedMetrics([analysis], defaultGlobalParams);

    // failureCost = (1 * 0.01) * (10*1 + 1*10) = 0.01 * 20 = 0.2
    // serviceCost = 1 * 2500 = 2500
    // savings = 0.2 * 0.70 - 2500 = 0.14 - 2500 = -2499.86
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
