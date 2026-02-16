/**
 * ARGOS ROI Calculator V10 - Main Application Store
 *
 * State Management: Zustand (ultra-lightweight ~1.5kb gzipped)
 * Persistence: Zustand persist middleware → localStorage (Story 4.5.1)
 * Pattern: Selector-based subscriptions for optimal re-render prevention
 *
 * CRITICAL: Always use selector pattern to prevent unnecessary re-renders
 * ✅ CORRECT:   const analyses = useAppStore((state) => state.analyses);
 * ❌ INCORRECT: const { analyses } = useAppStore();
 *
 * The selector pattern is ESSENTIAL for NFR-P1 (calculations <100ms)
 * Without selectors, every state change would trigger ALL subscribed components to re-render.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PersistStorage, StorageValue } from 'zustand/middleware';
import type { Analysis, GlobalParams } from '@/types';

/**
 * Application state interface
 * Contains all analyses, active analysis tracking, and global parameters
 */
export type DeploymentMode = 'pilot' | 'production';
export type ConnectionType = 'ethernet' | 'rs485' | 'wifi';

export interface AppState {
  // Core Data
  analyses: Analysis[]; // All ROI analyses in current session
  activeAnalysisId: string | null; // Currently focused/active analysis ID
  globalParams: GlobalParams; // Shared parameters across all analyses
  excludedFromGlobal: Set<string>; // Analysis IDs excluded from Global Analysis calculations

  // Diagram State (Story 6.4)
  deploymentMode: DeploymentMode; // Pilot or Production topology
  connectionType: ConnectionType; // Pump-to-infrastructure connection type

  // UI State
  unsavedChanges: boolean; // Tracks if there are unsaved changes

  // Actions - Analysis Management
  addAnalysis: (analysis: Analysis) => void;
  updateAnalysis: (id: string, updates: Partial<Analysis>) => void;
  deleteAnalysis: (id: string) => void;
  duplicateAnalysis: (id: string) => void;
  setActiveAnalysis: (id: string | null) => void;
  toggleExcludeFromGlobal: (analysisId: string) => void;

  // Actions - Global Parameters
  updateGlobalParams: (params: Partial<GlobalParams>) => void;

  // Actions - Diagram (Story 6.4)
  setDeploymentMode: (mode: DeploymentMode) => void;
  setConnectionType: (type: ConnectionType) => void;

  // Actions - Session Persistence (Story 4.5.1)
  clearAllData: () => void;
}

/** Initial state values — used by clearAllData to reset */
const initialState = {
  analyses: [] as Analysis[],
  activeAnalysisId: null as string | null,
  globalParams: {
    detectionRate: 70,
    serviceCostPerPump: 2500,
  },
  excludedFromGlobal: new Set<string>(),
  deploymentMode: 'pilot' as DeploymentMode,
  connectionType: 'ethernet' as ConnectionType,
  unsavedChanges: false,
};

/**
 * Check if localStorage is available (private browsing, disabled, etc.)
 */
function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__argos_storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

const storageAvailable = isLocalStorageAvailable();
if (!storageAvailable) {
  console.warn('localStorage unavailable — session persistence disabled');
}

/**
 * Serialized state type — same as AppState but with excludedFromGlobal as string[]
 * Used for JSON-compatible localStorage persistence.
 */
interface SerializedState {
  state: Record<string, unknown> & { excludedFromGlobal?: string[] };
  version?: number;
}

/**
 * Custom PersistStorage adapter for Zustand persist middleware.
 * Handles Set<string> ↔ Array serialization for excludedFromGlobal
 * and graceful degradation when localStorage is unavailable.
 *
 * Uses PersistStorage<AppState> (object-level) instead of StateStorage (string-level)
 * so we can intercept BEFORE JSON.stringify loses the Set data.
 */
const safeStorage: PersistStorage<AppState> = {
  getItem: (name: string): StorageValue<AppState> | null => {
    if (!storageAvailable) return null;
    try {
      const str = localStorage.getItem(name);
      if (!str) return null;
      const parsed: SerializedState = JSON.parse(str);
      // Convert excludedFromGlobal array back to Set
      if (Array.isArray(parsed?.state?.excludedFromGlobal)) {
        (parsed.state as Record<string, unknown>).excludedFromGlobal = new Set(parsed.state.excludedFromGlobal);
      }
      // Ensure backward-compatible defaults for new fields (Story 4.5.2, 4.5.4)
      if (Array.isArray(parsed?.state?.analyses)) {
        (parsed.state as Record<string, unknown>).analyses = (parsed.state.analyses as Record<string, unknown>[]).map(a => ({
          ...a,
          waferDefectEventsPerYear: typeof a.waferDefectEventsPerYear === 'number' ? a.waferDefectEventsPerYear : 0,
          maintenanceStrategy: typeof a.maintenanceStrategy === 'string' ? a.maintenanceStrategy : 'unplanned',
          overhaulCostPerPump: typeof a.overhaulCostPerPump === 'number' ? a.overhaulCostPerPump : 0,
          pmIntervalMonths: typeof a.pmIntervalMonths === 'number' ? a.pmIntervalMonths : 12,
          argosMtbfExtensionPercent: typeof a.argosMtbfExtensionPercent === 'number' ? a.argosMtbfExtensionPercent : 15,
          unplannedDespitePM: typeof a.unplannedDespitePM === 'number' ? a.unplannedDespitePM : 0,
        }));
      }
      return parsed as unknown as StorageValue<AppState>;
    } catch {
      console.warn('Failed to read persisted state from localStorage');
      return null;
    }
  },
  setItem: (name: string, value: StorageValue<AppState>): void => {
    if (!storageAvailable) return;
    try {
      // Deep copy to avoid mutating the live state
      const serializable: SerializedState = {
        ...value,
        state: {
          ...value.state,
          // Convert Set to Array for JSON serialization
          excludedFromGlobal: value.state.excludedFromGlobal instanceof Set
            ? [...value.state.excludedFromGlobal]
            : [],
        },
      };
      localStorage.setItem(name, JSON.stringify(serializable));
    } catch {
      console.warn('Failed to persist state to localStorage');
    }
  },
  removeItem: (name: string): void => {
    if (!storageAvailable) return;
    try {
      localStorage.removeItem(name);
    } catch {
      console.warn('Failed to remove persisted state from localStorage');
    }
  },
};

/**
 * Main application store
 *
 * Usage Examples:
 * ```typescript
 * // Subscribe to specific state slices (prevents unnecessary re-renders)
 * const analyses = useAppStore((state) => state.analyses);
 * const addAnalysis = useAppStore((state) => state.addAnalysis);
 * const globalParams = useAppStore((state) => state.globalParams);
 *
 * // Add new analysis
 * addAnalysis({
 *   id: crypto.randomUUID(),
 *   name: "Poly Etch - Chamber 04",
 *   pumpType: "A3004XN",
 *   pumpQuantity: 2,
 *   // ... other fields
 * });
 * ```
 */
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // ========== Initial State ==========
      ...initialState,

      // ========== Analysis Actions ==========

      /**
       * Add a new analysis to the store
       * Automatically sets the new analysis as active
       *
       * @param analysis - Complete analysis object with all required fields
       * @throws Error if validation fails (invalid data or duplicate ID)
       */
      addAnalysis: (analysis) =>
        set((state) => {
          // Validation: Check for duplicate IDs
          if (state.analyses.some((a) => a.id === analysis.id)) {
            console.error(`Cannot add analysis: ID "${analysis.id}" already exists`);
            return state; // No-op if duplicate ID
          }

          // Validation: Basic data integrity checks
          if (!analysis.id || analysis.id.trim() === '') {
            console.error('Cannot add analysis: ID is required');
            return state;
          }
          if (analysis.pumpQuantity < 0) {
            console.error('Cannot add analysis: pumpQuantity must be non-negative');
            return state;
          }
          if (analysis.failureRatePercentage < 0 || analysis.failureRatePercentage > 100) {
            console.error('Cannot add analysis: failureRatePercentage must be between 0-100');
            return state;
          }
          if (analysis.waferCost < 0) {
            console.error('Cannot add analysis: waferCost must be non-negative');
            return state;
          }
          if (analysis.waferDefectEventsPerYear < 0) {
            console.error('Cannot add analysis: waferDefectEventsPerYear must be non-negative');
            return state;
          }
          if (analysis.downtimeDuration < 0) {
            console.error('Cannot add analysis: downtimeDuration must be non-negative');
            return state;
          }
          if (analysis.downtimeCostPerHour < 0) {
            console.error('Cannot add analysis: downtimeCostPerHour must be non-negative');
            return state;
          }
          if (analysis.bottleneckMultiplier !== undefined &&
              (analysis.bottleneckMultiplier < 1.5 || analysis.bottleneckMultiplier > 5)) {
            console.error('Cannot add analysis: bottleneckMultiplier must be between 1.5 and 5');
            return state;
          }
          if (analysis.overhaulCostPerPump < 0) {
            console.error('Cannot add analysis: overhaulCostPerPump must be non-negative');
            return state;
          }
          if (analysis.pmIntervalMonths < 0) {
            console.error('Cannot add analysis: pmIntervalMonths must be non-negative');
            return state;
          }
          if (analysis.argosMtbfExtensionPercent < 0 || analysis.argosMtbfExtensionPercent > 100) {
            console.error('Cannot add analysis: argosMtbfExtensionPercent must be between 0 and 100');
            return state;
          }
          if (analysis.unplannedDespitePM < 0) {
            console.error('Cannot add analysis: unplannedDespitePM must be non-negative');
            return state;
          }

          return {
            analyses: [...state.analyses, analysis],
            activeAnalysisId: analysis.id, // Auto-focus new analysis
          };
        }),

      /**
       * Update an existing analysis with partial data
       * Automatically updates the 'updatedAt' timestamp only if changes are made
       *
       * @param id - Analysis ID to update
       * @param updates - Partial analysis data to merge
       */
      updateAnalysis: (id, updates) =>
        set((state) => {
          // Check if analysis exists
          const analysisExists = state.analyses.some((a) => a.id === id);
          if (!analysisExists) {
            console.error(`Cannot update analysis: ID "${id}" not found`);
            return state; // No-op if ID doesn't exist
          }

          // Check if updates object is empty
          if (Object.keys(updates).length === 0) {
            return state; // No-op if no updates
          }

          // Validation: Check updated values
          if (updates.pumpQuantity !== undefined && updates.pumpQuantity < 0) {
            console.error('Cannot update analysis: pumpQuantity must be non-negative');
            return state;
          }
          if (updates.failureRatePercentage !== undefined &&
              (updates.failureRatePercentage < 0 || updates.failureRatePercentage > 100)) {
            console.error('Cannot update analysis: failureRatePercentage must be between 0-100');
            return state;
          }
          if (updates.waferCost !== undefined && updates.waferCost < 0) {
            console.error('Cannot update analysis: waferCost must be non-negative');
            return state;
          }
          if (updates.downtimeDuration !== undefined && updates.downtimeDuration < 0) {
            console.error('Cannot update analysis: downtimeDuration must be non-negative');
            return state;
          }
          if (updates.downtimeCostPerHour !== undefined && updates.downtimeCostPerHour < 0) {
            console.error('Cannot update analysis: downtimeCostPerHour must be non-negative');
            return state;
          }
          if (updates.absoluteFailureCount !== undefined && updates.absoluteFailureCount < 0) {
            console.error('Cannot update analysis: absoluteFailureCount must be non-negative');
            return state;
          }
          if (updates.waferDefectEventsPerYear !== undefined && updates.waferDefectEventsPerYear < 0) {
            console.error('Cannot update analysis: waferDefectEventsPerYear must be non-negative');
            return state;
          }
          if (updates.bottleneckMultiplier !== undefined &&
              (updates.bottleneckMultiplier < 1.5 || updates.bottleneckMultiplier > 5)) {
            console.error('Cannot update analysis: bottleneckMultiplier must be between 1.5 and 5');
            return state;
          }
          if (updates.overhaulCostPerPump !== undefined && updates.overhaulCostPerPump < 0) {
            console.error('Cannot update analysis: overhaulCostPerPump must be non-negative');
            return state;
          }
          if (updates.pmIntervalMonths !== undefined && updates.pmIntervalMonths < 0) {
            console.error('Cannot update analysis: pmIntervalMonths must be non-negative');
            return state;
          }
          if (updates.argosMtbfExtensionPercent !== undefined &&
              (updates.argosMtbfExtensionPercent < 0 || updates.argosMtbfExtensionPercent > 100)) {
            console.error('Cannot update analysis: argosMtbfExtensionPercent must be between 0 and 100');
            return state;
          }
          if (updates.unplannedDespitePM !== undefined && updates.unplannedDespitePM < 0) {
            console.error('Cannot update analysis: unplannedDespitePM must be non-negative');
            return state;
          }

          return {
            analyses: state.analyses.map((a) =>
              a.id === id
                ? { ...a, ...updates, updatedAt: new Date().toISOString() }
                : a
            ),
          };
        }),

      /**
       * Delete an analysis by ID
       * If the deleted analysis was active, sets the first remaining analysis as active
       * If no analyses remain, sets activeAnalysisId to null
       *
       * @param id - Analysis ID to delete
       */
      deleteAnalysis: (id) =>
        set((state) => {
          // AC9: At least one analysis must always exist in the calculator
          if (state.analyses.length <= 1) {
            return state;
          }

          const newAnalyses = state.analyses.filter((a) => a.id !== id);
          let newActiveId = state.activeAnalysisId;

          // If deleted analysis was active, set to first remaining (or null)
          if (state.activeAnalysisId === id) {
            newActiveId = newAnalyses.length > 0 ? newAnalyses[0].id : null;
          }

          // Clean up excludedFromGlobal set (remove orphan ID)
          const newExcluded = new Set(state.excludedFromGlobal);
          newExcluded.delete(id);

          return {
            analyses: newAnalyses,
            activeAnalysisId: newActiveId,
            excludedFromGlobal: newExcluded,
          };
        }),

      /**
       * Duplicate an existing analysis
       * Creates a new analysis with all the same parameters but new ID and name
       * The duplicate becomes the active analysis
       *
       * @param id - Analysis ID to duplicate
       */
      duplicateAnalysis: (id) =>
        set((state) => {
          const original = state.analyses.find((a) => a.id === id);
          if (!original) return state; // No-op if analysis not found

          const duplicate: Analysis = {
            ...original,
            id: crypto.randomUUID(), // Generate new unique ID
            name: `${original.name} (copie)`, // Append "(copie)" to name (French)
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          return {
            analyses: [...state.analyses, duplicate],
            activeAnalysisId: duplicate.id, // Auto-focus duplicated analysis
          };
        }),

      /**
       * Toggle an analysis ID in/out of the excludedFromGlobal set.
       * Excluded analyses are not counted in Global Analysis KPI calculations.
       * Cannot exclude the last active (non-excluded) analysis.
       *
       * @param analysisId - Analysis ID to toggle exclusion for
       */
      toggleExcludeFromGlobal: (analysisId) =>
        set((state) => {
          const newExcluded = new Set(state.excludedFromGlobal);
          if (newExcluded.has(analysisId)) {
            // Re-include: always allowed
            newExcluded.delete(analysisId);
          } else {
            // Exclude: protect last active process
            const activeCount = state.analyses.filter(
              (a) => !state.excludedFromGlobal.has(a.id),
            ).length;
            if (activeCount <= 1) {
              return state; // Cannot exclude the last active process
            }
            newExcluded.add(analysisId);
          }
          return { excludedFromGlobal: newExcluded };
        }),

      /**
       * Set the active/focused analysis
       * Used when user navigates to a specific analysis
       *
       * @param id - Analysis ID to set as active (must exist in analyses array)
       */
      setActiveAnalysis: (id) =>
        set((state) => {
          // Allow setting to null (clears active analysis)
          if (id === null) {
            return { activeAnalysisId: null };
          }

          // Validate that the ID exists in analyses
          const analysisExists = state.analyses.some((a) => a.id === id);
          if (!analysisExists) {
            console.error(`Cannot set active analysis: ID "${id}" not found`);
            return state; // No-op if ID doesn't exist
          }

          return { activeAnalysisId: id };
        }),

      // ========== Global Parameters Actions ==========

      /**
       * Update global parameters (detection rate, service cost)
       * Supports partial updates - only provided fields are updated
       *
       * @param params - Partial global parameters to merge
       */
      updateGlobalParams: (params) =>
        set((state) => {
          // Validation: Check global parameter bounds
          if (params.detectionRate !== undefined) {
            if (!Number.isFinite(params.detectionRate) ||
                params.detectionRate < 0 || params.detectionRate > 100) {
              console.error('Cannot update global params: detectionRate must be finite and between 0-100');
              return state;
            }
          }
          if (params.serviceCostPerPump !== undefined) {
            if (!Number.isFinite(params.serviceCostPerPump) || params.serviceCostPerPump <= 0) {
              console.error('Cannot update global params: serviceCostPerPump must be finite and greater than 0');
              return state;
            }
          }

          return {
            globalParams: { ...state.globalParams, ...params },
          };
        }),

      // ========== Diagram Actions (Story 6.4) ==========

      setDeploymentMode: (mode) => set({ deploymentMode: mode }),

      setConnectionType: (type) => set({ connectionType: type }),

      // ========== Session Persistence Actions (Story 4.5.1) ==========

      clearAllData: () => set({ ...initialState, excludedFromGlobal: new Set<string>() }),
    }),
    {
      name: 'argos-roi-data',
      version: 1,
      storage: safeStorage,
      partialize: (state) =>
        ({
          analyses: state.analyses,
          activeAnalysisId: state.activeAnalysisId,
          globalParams: state.globalParams,
          excludedFromGlobal: state.excludedFromGlobal,
          deploymentMode: state.deploymentMode,
          connectionType: state.connectionType,
        }) as Partial<AppState>,
    },
  ),
);
