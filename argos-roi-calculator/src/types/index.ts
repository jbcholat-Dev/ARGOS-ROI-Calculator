/**
 * Core TypeScript interfaces for ARGOS ROI Calculator V10
 * All interfaces follow strict typing requirements (no 'any' types)
 */

/**
 * Failure rate input mode
 * - 'percentage': User enters failure rate as percentage (0-100)
 * - 'absolute': User enters absolute number of failures per year
 */
export type FailureRateMode = 'percentage' | 'absolute';

/**
 * Wafer processing type
 * - 'mono': Single wafer processing (default wafer quantity: 1)
 * - 'batch': Batch wafer processing (default wafer quantity: 125)
 */
export type WaferType = 'mono' | 'batch';

/**
 * Single ROI analysis representing one process/pump configuration
 * Captures all input parameters for calculating pump failure ROI
 */
export interface Analysis {
  // Identification
  id: string; // UUID generated with crypto.randomUUID()
  name: string; // Process name (e.g., "Poly Etch - Chamber 04")

  // Equipment Configuration
  pumpType: string; // Pump model (free text, e.g., "A3004XN")
  pumpQuantity: number; // Number of pumps for this process (positive integer)

  // Failure Rate Configuration
  failureRateMode: FailureRateMode; // Input mode selection
  failureRatePercentage: number; // Failure rate as percentage (0-100)
  absoluteFailureCount?: number; // Absolute failures per year (only used when mode='absolute')

  // Wafer Economics
  waferType: WaferType; // Processing mode
  waferQuantity: number; // Wafers per batch (default: 125 for batch, 1 for mono)
  waferCost: number; // Cost per wafer in EUR

  // Downtime Configuration
  downtimeDuration: number; // Hours of downtime per failure event
  downtimeCostPerHour: number; // EUR/hour downtime cost

  // ARGOS detection rate percentage for this specific failure type (0-100). If undefined, uses globalParams.detectionRate (default: 70)
  detectionRate?: number;

  // Metadata
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

/**
 * Global parameters shared across all analyses
 * These can be adjusted in the Global Analysis view
 */
export interface GlobalParams {
  detectionRate: number; // ARGOS detection rate percentage (default: 70)
  serviceCostPerPump: number; // Annual ARGOS service cost per pump in EUR (default: 2500)
}

/**
 * ROI calculation results for a single analysis
 * Computed from Analysis data + GlobalParams
 */
export interface CalculationResult {
  totalFailureCost: number; // Total cost of pump failures without ARGOS (EUR)
  argosServiceCost: number; // Annual cost of ARGOS service (EUR)
  deltaSavings: number; // Net savings with ARGOS (failureCost - serviceCost) (EUR)
  roiPercentage: number; // Return on investment percentage ((deltaSavings / serviceCost) * 100)
}
