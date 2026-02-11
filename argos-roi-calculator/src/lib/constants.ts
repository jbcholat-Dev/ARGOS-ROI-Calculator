// Default values for ARGOS ROI Calculator
export const DEFAULT_DETECTION_RATE = 70; // %
export const DEFAULT_SERVICE_COST_PER_PUMP = 2500; // EUR/year
export const DEFAULT_WAFERS_PER_BATCH = 125;

// Pfeiffer Brand Colors
export const PFEIFFER_RED = '#CC0000';
export const PFEIFFER_RED_DARK = '#A50000';

// ROI Color Thresholds
export const ROI_NEGATIVE_THRESHOLD = 0;
export const ROI_WARNING_THRESHOLD = 15;

// Application Routes
export const ROUTES = {
  DASHBOARD: '/',
  FOCUS_MODE: '/analysis/:id',
  FOCUS_MODE_BASE: '/analysis',
  GLOBAL_ANALYSIS: '/global',
  SOLUTIONS: '/solutions',
  COMPARISON: '/compare/:originalId/:whatIfId',
} as const;

// Helper to build focus mode route with ID
export const buildFocusModeRoute = (id: string): string =>
  `/analysis/${id}`;

// Helper to build comparison route with both IDs
export const buildComparisonRoute = (originalId: string, whatIfId: string): string =>
  `/compare/${originalId}/${whatIfId}`;

// What-If Color Constants
export const WHATIF_MODIFIED_BORDER = '#FF5800';
export const WHATIF_MODIFIED_BG = 'rgba(255, 88, 0, 0.05)';
export const DELTA_POSITIVE_COLOR = '#28A745';
export const DELTA_NEGATIVE_COLOR = '#CC0000';
export const DELTA_NEUTRAL_COLOR = '#6B7280';

// Pump Type Suggestions (from V9 reference categories)
export const PUMP_TYPE_SUGGESTIONS = [
  'HiPace (turbo)',
  'HiScrew (dry screw)',
  'OnTool Roots (roots)',
] as const;
