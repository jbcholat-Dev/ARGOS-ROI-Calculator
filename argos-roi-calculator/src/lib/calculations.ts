/**
 * ARGOS ROI Calculator V10 - Pure Calculation Functions
 *
 * Ported from V9 (calculateur-argos/src/components/PredictiveMaintenanceROICalculator.jsx, lines 405-424)
 *
 * V9 → V10 Migration Notes:
 * - V9 used 3 fixed segments (Regular/Bottleneck/Batch) with distribution percentages
 * - V10 uses per-process granularity: each analysis is independent (no distribution %)
 * - V10 adds wafer + downtime cost granularity (V9 used a single "cost per failure")
 * - V10 savings formula integrates service cost: savings = avoidedCost - serviceCost
 *   (V9 calculated savings separately, then subtracted service cost in ROI formula)
 * - V10 ROI formula: (savings / serviceCost) × 100 (savings already net of service cost)
 *   V9 ROI formula: ((savings - serviceCost) / serviceCost) × 100 — mathematically equivalent
 *
 * CalculationResult Interface Mapping (types/index.ts):
 *   calculateTotalFailureCost() → CalculationResult.totalFailureCost
 *   calculateArgosServiceCost() → CalculationResult.argosServiceCost
 *   calculateSavings()          → CalculationResult.deltaSavings
 *   calculateROI()              → CalculationResult.roiPercentage
 */

import type { Analysis, AnalysisRowData, AggregatedMetrics, GlobalParams, MaintenanceStrategy, PumpStats } from '@/types';
import {
  ROI_NEGATIVE_THRESHOLD,
  ROI_WARNING_THRESHOLD,
} from './constants';

/**
 * Validates a numeric input. Returns true if the value is a finite, non-negative number.
 */
function isValidInput(value: number): boolean {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

/**
 * Validates a percentage input. Returns true if the value is a finite number between 0 and 100.
 */
function isValidPercentage(value: number): boolean {
  return isValidInput(value) && value <= 100;
}

/**
 * Validates a numeric input that may be negative (e.g., savings can be negative).
 * Returns true if the value is a finite number (allows negative).
 */
function isFiniteNumber(value: number): boolean {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Calculates the total annual cost of pump failures without ARGOS predictive maintenance.
 *
 * Decoupled formula (Story 4.5.2):
 *   waferDefectCost = waferDefectEventsPerYear × waferCost × wafersPerBatch
 *   downtimeCost    = failedPumps × downtimeHours × downtimeCostPerHour
 *   totalFailureCost = waferDefectCost + downtimeCost
 *
 * Wafer defect events are independent from pump failures — not every failure causes a wafer defect.
 *
 * @param pumpQuantity - Number of pumps for this process (e.g., 10)
 * @param failureRate - Annual failure rate as percentage, 0-100 (e.g., 10 = 10%)
 * @param waferCost - Cost per wafer in EUR (e.g., 8000)
 * @param wafersPerBatch - Number of wafers per batch (e.g., 125 for batch tools, 1 for mono)
 * @param downtimeHours - Hours of downtime per failure event (e.g., 6)
 * @param downtimeCostPerHour - Cost per hour of downtime in EUR (e.g., 500)
 * @param waferDefectEventsPerYear - Independent wafer defect events per year (default: 0)
 * @param bottleneckMultiplier - Downtime cost multiplier for bottleneck tools (default: 1, i.e. no multiplier)
 * @returns Total annual failure cost in EUR, or 0 for invalid inputs
 *
 * @example
 * // 10 pumps, 10% failure rate, €8,000/wafer, 125 wafers/batch, 6h downtime, €500/h, 2 defect events
 * calculateTotalFailureCost(10, 10, 8000, 125, 6, 500, 2) // → 2,003,000
 */
export function calculateTotalFailureCost(
  pumpQuantity: number,
  failureRate: number,
  waferCost: number,
  wafersPerBatch: number,
  downtimeHours: number,
  downtimeCostPerHour: number,
  waferDefectEventsPerYear: number = 0,
  bottleneckMultiplier: number = 1,
): number {
  if (
    !isValidInput(pumpQuantity) ||
    !isValidPercentage(failureRate) ||
    !isValidInput(waferCost) ||
    !isValidInput(wafersPerBatch) ||
    !isValidInput(downtimeHours) ||
    !isValidInput(downtimeCostPerHour) ||
    !isValidInput(waferDefectEventsPerYear) ||
    !isValidInput(bottleneckMultiplier) ||
    bottleneckMultiplier < 1
  ) {
    return 0;
  }

  // No pumps or no failures = no cost (wafer defect events require an active process)
  if (pumpQuantity === 0 || failureRate === 0) {
    return 0;
  }

  const failedPumps = pumpQuantity * (failureRate / 100);
  const waferDefectCost = waferDefectEventsPerYear * waferCost * wafersPerBatch;
  const downtimeCost = failedPumps * downtimeHours * downtimeCostPerHour * bottleneckMultiplier;
  return waferDefectCost + downtimeCost;
}

/**
 * Calculates the annual ARGOS service cost for a given number of pumps.
 *
 * Formula: pumpQuantity × serviceCostPerPump
 *
 * @param pumpQuantity - Number of pumps for this process (e.g., 10)
 * @param serviceCostPerPump - Annual ARGOS service cost per pump in EUR (default: 2500)
 * @returns Annual ARGOS service cost in EUR, or 0 for invalid inputs
 *
 * @example
 * calculateArgosServiceCost(10, 2500) // → 25,000
 */
export function calculateArgosServiceCost(
  pumpQuantity: number,
  serviceCostPerPump: number,
): number {
  if (!isValidInput(pumpQuantity) || !isValidInput(serviceCostPerPump)) {
    return 0;
  }

  return pumpQuantity * serviceCostPerPump;
}

/**
 * Calculates net annual savings with ARGOS (avoided failure costs minus service cost).
 *
 * Formula: totalFailureCost × detectionRate/100 - argosServiceCost
 *
 * Note: This can return negative values when service cost exceeds avoided costs.
 *
 * @param totalFailureCost - Total annual failure cost from calculateTotalFailureCost (EUR)
 * @param argosServiceCost - Annual ARGOS service cost from calculateArgosServiceCost (EUR)
 * @param detectionRate - ARGOS detection rate as percentage, 0-100 (default: 70)
 * @returns Net annual savings in EUR (can be negative), or 0 for invalid inputs
 *
 * @example
 * // €1,003,000 failure cost, €25,000 service cost, 70% detection
 * calculateSavings(1003000, 25000, 70) // → 677,100
 */
export function calculateSavings(
  totalFailureCost: number,
  argosServiceCost: number,
  detectionRate: number,
): number {
  if (
    !isValidInput(totalFailureCost) ||
    !isValidInput(argosServiceCost) ||
    !isValidPercentage(detectionRate)
  ) {
    return 0;
  }

  return totalFailureCost * (detectionRate / 100) - argosServiceCost;
}

/**
 * Calculates the ROI percentage of ARGOS predictive maintenance.
 *
 * Formula: (savings / argosServiceCost) × 100
 *
 * V9 Deviation: V9 calculated ROI as ((savings - serviceCost) / serviceCost) × 100.
 * V10 pre-subtracts service cost in calculateSavings(), so this simplified formula
 * is mathematically equivalent but structurally different.
 *
 * @param savings - Net annual savings from calculateSavings (EUR, can be negative)
 * @param argosServiceCost - Annual ARGOS service cost from calculateArgosServiceCost (EUR)
 * @returns ROI percentage (can be negative). Returns 0 if service cost is 0
 *          (avoids division by zero; infinite ROI treated as 0% for display purposes)
 *          or if inputs are invalid (NaN, Infinity).
 *
 * @example
 * calculateROI(677100, 25000) // → 2708.4
 */
export function calculateROI(
  savings: number,
  argosServiceCost: number,
): number {
  if (
    !isFiniteNumber(savings) ||
    !isValidInput(argosServiceCost)
  ) {
    return 0;
  }

  if (argosServiceCost === 0) {
    return 0;
  }

  return (savings / argosServiceCost) * 100;
}

/**
 * Returns a Tailwind CSS color class based on the ROI percentage.
 *
 * Traffic light system for instant visual feedback during client meetings:
 * - Red (< 0%): Negative ROI — ARGOS costs more than it saves
 * - Orange (0–15%): Low ROI — Marginal business case
 * - Green (>= 15%): Good ROI — Strong business case
 *
 * The 15% threshold reflects typical semiconductor fab ROI expectations.
 *
 * @param roi - ROI percentage from calculateROI
 * @returns Tailwind CSS class name: 'text-red-600', 'text-orange-500', or 'text-green-600'
 *
 * @example
 * getROIColorClass(-5)  // → 'text-red-600'
 * getROIColorClass(10)  // → 'text-orange-500'
 * getROIColorClass(50)  // → 'text-green-600'
 */
export function getROIColorClass(roi: number): string {
  if (!Number.isFinite(roi) || roi < ROI_NEGATIVE_THRESHOLD) {
    return 'text-red-600';
  }
  if (roi < ROI_WARNING_THRESHOLD) {
    return 'text-orange-500';
  }
  return 'text-green-600';
}

/**
 * Calculates planned maintenance overhaul savings with ARGOS MTBF extension.
 *
 * Formula:
 *   currentOverhaulsPerYear = pumps / (intervalMonths / 12)
 *   argosIntervalMonths = intervalMonths × (1 + mtbfExtension / 100)
 *   argosOverhaulsPerYear = pumps / (argosIntervalMonths / 12)
 *   overhaulSavings = (currentOverhauls - argosOverhauls) × overhaulCostPerPump
 *
 * @param pumps - Number of pumps
 * @param intervalMonths - Current PM interval in months
 * @param overhaulCostPerPump - Cost per overhaul in EUR
 * @param mtbfExtensionPercent - ARGOS MTBF extension as percentage (e.g., 15 = 15%)
 * @returns Object with currentOverhauls, argosOverhauls, and overhaulSavings
 */
export function calculatePlannedOverhaulSavings(
  pumps: number,
  intervalMonths: number,
  overhaulCostPerPump: number,
  mtbfExtensionPercent: number,
): { currentOverhauls: number; argosOverhauls: number; overhaulSavings: number } {
  if (
    !isValidInput(pumps) ||
    !isValidInput(intervalMonths) ||
    !isValidInput(overhaulCostPerPump) ||
    !isValidInput(mtbfExtensionPercent) ||
    pumps === 0 || intervalMonths === 0
  ) {
    return { currentOverhauls: 0, argosOverhauls: 0, overhaulSavings: 0 };
  }

  const currentOverhauls = pumps / (intervalMonths / 12);
  const argosIntervalMonths = intervalMonths * (1 + mtbfExtensionPercent / 100);
  const argosOverhauls = pumps / (argosIntervalMonths / 12);
  const overhaulSavings = (currentOverhauls - argosOverhauls) * overhaulCostPerPump;

  return { currentOverhauls, argosOverhauls, overhaulSavings };
}

/**
 * Calculates savings for an analysis based on its maintenance strategy.
 *
 * Unplanned: savingsFromArgos = detectionRate × totalCostWithoutArgos - serviceCost
 * Planned: overhaulSavings + optional residualSavings - serviceCost
 *
 * @param analysis - Full analysis object
 * @param globalParams - Global parameters
 * @returns Object with totalFailureCost, savings, and argosServiceCost
 */
export function calculateStrategySavings(
  analysis: Analysis,
  globalParams: GlobalParams,
): { totalFailureCost: number; savings: number; argosServiceCost: number } {
  const argosServiceCost = calculateArgosServiceCost(
    analysis.pumpQuantity,
    globalParams.serviceCostPerPump,
  );
  const effectiveMultiplier = analysis.isBottleneck ? analysis.bottleneckMultiplier : 1;
  const effectiveWaferQty = analysis.waferType === 'mono' ? 1 : analysis.waferQuantity;

  if (analysis.maintenanceStrategy === 'planned') {
    // Planned mode: overhaul savings + optional residual
    const { overhaulSavings } = calculatePlannedOverhaulSavings(
      analysis.pumpQuantity,
      analysis.pmIntervalMonths,
      analysis.overhaulCostPerPump,
      analysis.argosMtbfExtensionPercent,
    );

    // Residual unplanned failures: use unplannedDespitePM as failure count
    let residualSavings = 0;
    let residualFailureCost = 0;
    if (analysis.unplannedDespitePM > 0) {
      const residualDowntimeCost = analysis.unplannedDespitePM * analysis.downtimeDuration * analysis.downtimeCostPerHour * effectiveMultiplier;
      const residualWaferCost = analysis.waferDefectEventsPerYear * analysis.waferCost * effectiveWaferQty;
      residualFailureCost = residualDowntimeCost + residualWaferCost;
      const detectionRate = analysis.detectionRate ?? globalParams.detectionRate;
      residualSavings = residualFailureCost * (detectionRate / 100);
    }

    // Total failure cost for planned = overhaul cost baseline + residual failure cost
    const currentOverhauls = analysis.pumpQuantity > 0 && analysis.pmIntervalMonths > 0
      ? analysis.pumpQuantity / (analysis.pmIntervalMonths / 12)
      : 0;
    const totalFailureCost = currentOverhauls * analysis.overhaulCostPerPump + residualFailureCost;

    const savings = overhaulSavings + residualSavings - argosServiceCost;
    return { totalFailureCost, savings, argosServiceCost };
  }

  // Unplanned mode: existing formula
  const totalFailureCost = calculateTotalFailureCost(
    analysis.pumpQuantity,
    analysis.failureRatePercentage,
    analysis.waferCost,
    effectiveWaferQty,
    analysis.downtimeDuration,
    analysis.downtimeCostPerHour,
    analysis.waferDefectEventsPerYear,
    effectiveMultiplier,
  );
  const detectionRate = analysis.detectionRate ?? globalParams.detectionRate;
  const savings = calculateSavings(totalFailureCost, argosServiceCost, detectionRate);
  return { totalFailureCost, savings, argosServiceCost };
}

/**
 * Checks if an analysis has sufficient fields populated for ROI calculation.
 *
 * For unplanned strategy:
 *   - Pump quantity > 0 and failure rate > 0
 *   - At least ONE cost component: wafer defect or downtime
 *
 * For planned strategy:
 *   - Pump quantity > 0 and PM interval > 0
 *   - At least ONE savings source: overhaul cost > 0 OR residual events with costs
 *
 * @param analysis - Object with the required numeric fields
 * @returns true if calculation can proceed
 */
export function isAnalysisCalculable(analysis: {
  pumpQuantity: number;
  failureRatePercentage: number;
  waferCost: number;
  waferDefectEventsPerYear: number;
  downtimeDuration: number;
  downtimeCostPerHour: number;
  maintenanceStrategy?: MaintenanceStrategy;
  pmIntervalMonths?: number;
  overhaulCostPerPump?: number;
  unplannedDespitePM?: number;
}): boolean {
  if (analysis.maintenanceStrategy === 'planned') {
    const hasBasicInputs = analysis.pumpQuantity > 0 && (analysis.pmIntervalMonths ?? 0) > 0;
    const hasOverhaulCost = (analysis.overhaulCostPerPump ?? 0) > 0;
    const hasResidualCosts = (analysis.unplannedDespitePM ?? 0) > 0 && (
      (analysis.downtimeDuration > 0 && analysis.downtimeCostPerHour > 0) ||
      (analysis.waferDefectEventsPerYear > 0 && analysis.waferCost > 0)
    );
    return hasBasicInputs && (hasOverhaulCost || hasResidualCosts);
  }

  // Unplanned mode (default)
  const hasBasicInputs = analysis.pumpQuantity > 0 && analysis.failureRatePercentage > 0;
  const hasWaferDefectCost = analysis.waferDefectEventsPerYear > 0 && analysis.waferCost > 0;
  const hasDowntimeCost = analysis.downtimeDuration > 0 && analysis.downtimeCostPerHour > 0;

  return hasBasicInputs && (hasWaferDefectCost || hasDowntimeCost);
}

/**
 * Calculates per-analysis row data for the ComparisonTable.
 * Returns null if the analysis is not calculable (incomplete data).
 *
 * @param analysis - Single analysis to compute row data for
 * @param globalParams - Global parameters (detection rate, service cost per pump)
 * @returns AnalysisRowData for the comparison table, or null if not calculable
 */
export function calculateAnalysisRow(
  analysis: Analysis,
  globalParams: GlobalParams,
): AnalysisRowData | null {
  if (!isAnalysisCalculable(analysis)) {
    return null;
  }

  const { totalFailureCost, savings, argosServiceCost } = calculateStrategySavings(analysis, globalParams);
  const roiPercentage = calculateROI(savings, argosServiceCost);

  return {
    id: analysis.id,
    name: analysis.name,
    pumpQuantity: analysis.pumpQuantity,
    failureRate: analysis.failureRatePercentage,
    totalFailureCost,
    argosServiceCost,
    savings,
    roiPercentage,
  };
}

/**
 * Calculates row data for all calculable analyses.
 * Filters out incomplete analyses (returns empty array if none are calculable).
 *
 * @param analyses - All analyses in the current session
 * @param globalParams - Global parameters (detection rate, service cost per pump)
 * @returns Array of AnalysisRowData for calculable analyses only
 */
export function calculateAllAnalysisRows(
  analyses: Analysis[],
  globalParams: GlobalParams,
): AnalysisRowData[] {
  return analyses
    .map((analysis) => calculateAnalysisRow(analysis, globalParams))
    .filter((row): row is AnalysisRowData => row !== null);
}

/**
 * Calculates pump statistics from analyses.
 * Pure utility function shared by architecture diagram (usePumpStats) and PDF export.
 *
 * @param analyses - All analyses in the current session
 * @returns totalPumps (sum of all pumpQuantity) and processCount (analyses with name + pumpType)
 */
export function calculatePumpStats(analyses: Analysis[]): PumpStats {
  const totalPumps = analyses.reduce((sum, a) => sum + (a.pumpQuantity || 0), 0);
  const processCount = analyses.filter(
    (a) => a.name?.trim() && a.pumpType?.trim(),
  ).length;

  return { totalPumps, processCount };
}

/**
 * Calculates aggregated metrics across all calculable analyses.
 * Filters out incomplete analyses and sums results for the Global Analysis view.
 *
 * @param analyses - All analyses in the current session
 * @param globalParams - Global parameters (detection rate, service cost per pump)
 * @returns Aggregated metrics including totals, counts, and overall ROI
 */
export function calculateAggregatedMetrics(
  analyses: Analysis[],
  globalParams: GlobalParams,
): AggregatedMetrics {
  const calculable = analyses.filter(isAnalysisCalculable);
  const excludedCount = analyses.length - calculable.length;

  let totalSavings = 0;
  let totalServiceCost = 0;
  let totalFailureCost = 0;
  let totalPumps = 0;

  for (const analysis of calculable) {
    const result = calculateStrategySavings(analysis, globalParams);

    totalFailureCost += result.totalFailureCost;
    totalServiceCost += result.argosServiceCost;
    totalSavings += result.savings;
    totalPumps += analysis.pumpQuantity;
  }

  const overallROI = totalServiceCost > 0
    ? (totalSavings / totalServiceCost) * 100
    : 0;

  return {
    totalSavings,
    totalServiceCost,
    totalFailureCost,
    totalPumps,
    overallROI,
    processCount: calculable.length,
    excludedCount,
  };
}
