/**
 * ARGOS ROI Calculator V10 - Main Application Store
 *
 * State Management: Zustand (ultra-lightweight ~1.5kb gzipped)
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
import type { Analysis, GlobalParams } from '@/types';

/**
 * Application state interface
 * Contains all analyses, active analysis tracking, and global parameters
 */
export interface AppState {
  // Core Data
  analyses: Analysis[]; // All ROI analyses in current session
  activeAnalysisId: string | null; // Currently focused/active analysis ID
  globalParams: GlobalParams; // Shared parameters across all analyses

  // UI State
  unsavedChanges: boolean; // Tracks if there are unsaved changes (future: session persistence)

  // Actions - Analysis Management
  addAnalysis: (analysis: Analysis) => void;
  updateAnalysis: (id: string, updates: Partial<Analysis>) => void;
  deleteAnalysis: (id: string) => void;
  duplicateAnalysis: (id: string) => void;
  setActiveAnalysis: (id: string | null) => void;

  // Actions - Global Parameters
  updateGlobalParams: (params: Partial<GlobalParams>) => void;
}

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
export const useAppStore = create<AppState>((set) => ({
  // ========== Initial State ==========
  analyses: [],
  activeAnalysisId: null,
  globalParams: {
    detectionRate: 70, // Default: 70% detection rate (FR31)
    serviceCostPerPump: 2500, // Default: EUR 2,500/year per pump (FR33)
  },
  unsavedChanges: false, // NOTE: Not actively used in Story 1.2, reserved for future session persistence

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
      if (analysis.downtimeDuration < 0) {
        console.error('Cannot add analysis: downtimeDuration must be non-negative');
        return state;
      }
      if (analysis.downtimeCostPerHour < 0) {
        console.error('Cannot add analysis: downtimeCostPerHour must be non-negative');
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
      const newAnalyses = state.analyses.filter((a) => a.id !== id);
      let newActiveId = state.activeAnalysisId;

      // If deleted analysis was active, set to first remaining (or null)
      if (state.activeAnalysisId === id) {
        newActiveId = newAnalyses.length > 0 ? newAnalyses[0].id : null;
      }

      return {
        analyses: newAnalyses,
        activeAnalysisId: newActiveId,
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
}));
