/**
 * ARGOS ROI Calculator V10 - App Store Tests
 * Tests for Zustand store actions and state management
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from './app-store';
import type { Analysis } from '@/types';

describe('AppStore', () => {
  // Reset store state before each test
  beforeEach(() => {
    useAppStore.setState({
      analyses: [],
      activeAnalysisId: null,
      globalParams: {
        detectionRate: 70,
        serviceCostPerPump: 2500,
      },
      excludedFromGlobal: new Set<string>(),
      deploymentMode: 'pilot',
      connectionType: 'ethernet',
      unsavedChanges: false,
    });
  });

  describe('Initial State', () => {
    it('should have empty analyses array', () => {
      const state = useAppStore.getState();
      expect(state.analyses).toEqual([]);
    });

    it('should have null activeAnalysisId', () => {
      const state = useAppStore.getState();
      expect(state.activeAnalysisId).toBeNull();
    });

    it('should have default globalParams', () => {
      const state = useAppStore.getState();
      expect(state.globalParams).toEqual({
        detectionRate: 70,
        serviceCostPerPump: 2500,
      });
    });

    it('should have unsavedChanges set to false', () => {
      const state = useAppStore.getState();
      expect(state.unsavedChanges).toBe(false);
    });
  });

  describe('addAnalysis', () => {
    it('should add new analysis with unique ID', () => {
      const state = useAppStore.getState();
      const newAnalysis: Analysis = {
        id: 'test-uuid-001',
        name: 'Test Analysis',
        pumpType: 'A3004XN',
        pumpQuantity: 2,
        failureRateMode: 'percentage',
        failureRatePercentage: 10,
        waferType: 'batch',
        waferQuantity: 125,
        waferCost: 5000,
        downtimeDuration: 4,
        downtimeCostPerHour: 1000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      state.addAnalysis(newAnalysis);

      const updatedState = useAppStore.getState();
      expect(updatedState.analyses).toHaveLength(1);
      expect(updatedState.analyses[0]).toEqual(newAnalysis);
    });

    it('should set new analysis as active', () => {
      const state = useAppStore.getState();
      const newAnalysis: Analysis = {
        id: 'test-id-123',
        name: 'Test Analysis',
        pumpType: 'A3004XN',
        pumpQuantity: 2,
        failureRateMode: 'percentage',
        failureRatePercentage: 10,
        waferType: 'batch',
        waferQuantity: 125,
        waferCost: 5000,
        downtimeDuration: 4,
        downtimeCostPerHour: 1000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      state.addAnalysis(newAnalysis);

      const updatedState = useAppStore.getState();
      expect(updatedState.activeAnalysisId).toBe('test-id-123');
    });
  });

  describe('updateAnalysis', () => {
    it('should update correct analysis with partial data', () => {
      const state = useAppStore.getState();
      const analysis: Analysis = {
        id: 'test-id-1',
        name: 'Original Name',
        pumpType: 'A3004XN',
        pumpQuantity: 2,
        failureRateMode: 'percentage',
        failureRatePercentage: 10,
        waferType: 'batch',
        waferQuantity: 125,
        waferCost: 5000,
        downtimeDuration: 4,
        downtimeCostPerHour: 1000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      state.addAnalysis(analysis);
      state.updateAnalysis('test-id-1', { name: 'Updated Name', pumpQuantity: 5 });

      const updatedState = useAppStore.getState();
      expect(updatedState.analyses[0].name).toBe('Updated Name');
      expect(updatedState.analyses[0].pumpQuantity).toBe(5);
      expect(updatedState.analyses[0].pumpType).toBe('A3004XN'); // Unchanged fields preserved
    });

    it('should update updatedAt timestamp', () => {
      const state = useAppStore.getState();
      const originalTimestamp = '2024-01-01T00:00:00.000Z';
      const analysis: Analysis = {
        id: 'test-id-1',
        name: 'Test',
        pumpType: 'A3004XN',
        pumpQuantity: 2,
        failureRateMode: 'percentage',
        failureRatePercentage: 10,
        waferType: 'batch',
        waferQuantity: 125,
        waferCost: 5000,
        downtimeDuration: 4,
        downtimeCostPerHour: 1000,
        createdAt: originalTimestamp,
        updatedAt: originalTimestamp,
      };

      state.addAnalysis(analysis);
      state.updateAnalysis('test-id-1', { name: 'Updated' });

      const updatedState = useAppStore.getState();
      expect(updatedState.analyses[0].updatedAt).not.toBe(originalTimestamp);
      expect(new Date(updatedState.analyses[0].updatedAt).getTime()).toBeGreaterThan(
        new Date(originalTimestamp).getTime()
      );
    });

    it('should not affect other analyses', () => {
      const state = useAppStore.getState();
      const analysis1: Analysis = {
        id: 'test-id-1',
        name: 'Analysis 1',
        pumpType: 'A3004XN',
        pumpQuantity: 2,
        failureRateMode: 'percentage',
        failureRatePercentage: 10,
        waferType: 'batch',
        waferQuantity: 125,
        waferCost: 5000,
        downtimeDuration: 4,
        downtimeCostPerHour: 1000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const analysis2: Analysis = {
        id: 'test-id-2',
        name: 'Analysis 2',
        pumpType: 'B5000',
        pumpQuantity: 3,
        failureRateMode: 'percentage',
        failureRatePercentage: 15,
        waferType: 'mono',
        waferQuantity: 1,
        waferCost: 8000,
        downtimeDuration: 6,
        downtimeCostPerHour: 1500,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      state.addAnalysis(analysis1);
      state.addAnalysis(analysis2);
      state.updateAnalysis('test-id-1', { name: 'Updated Analysis 1' });

      const updatedState = useAppStore.getState();
      expect(updatedState.analyses[0].name).toBe('Updated Analysis 1');
      expect(updatedState.analyses[1].name).toBe('Analysis 2'); // Unchanged
    });

    // Story 2.9: Per-analysis detection rate tests
    it('should allow updating detectionRate field', () => {
      const state = useAppStore.getState();
      const analysis: Analysis = {
        id: 'test-id-1',
        name: 'Test',
        pumpType: 'A3004XN',
        pumpQuantity: 2,
        failureRateMode: 'percentage',
        failureRatePercentage: 10,
        waferType: 'batch',
        waferQuantity: 125,
        waferCost: 5000,
        downtimeDuration: 4,
        downtimeCostPerHour: 1000,
        detectionRate: 70,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      state.addAnalysis(analysis);
      state.updateAnalysis('test-id-1', { detectionRate: 85 });

      const updatedState = useAppStore.getState();
      expect(updatedState.analyses[0].detectionRate).toBe(85);
    });

    it('should persist detectionRate after update', () => {
      const state = useAppStore.getState();
      const analysis: Analysis = {
        id: 'test-id-1',
        name: 'Test',
        pumpType: 'A3004XN',
        pumpQuantity: 2,
        failureRateMode: 'percentage',
        failureRatePercentage: 10,
        waferType: 'batch',
        waferQuantity: 125,
        waferCost: 5000,
        downtimeDuration: 4,
        downtimeCostPerHour: 1000,
        detectionRate: 70,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      state.addAnalysis(analysis);
      state.updateAnalysis('test-id-1', { detectionRate: 50 });

      const updatedState = useAppStore.getState();
      expect(updatedState.analyses[0].detectionRate).toBe(50);

      // Verify persistence - value should remain after another unrelated update
      state.updateAnalysis('test-id-1', { name: 'Updated Name' });
      const finalState = useAppStore.getState();
      expect(finalState.analyses[0].detectionRate).toBe(50);
    });

    it('should allow detectionRate to be undefined (uses global fallback)', () => {
      const state = useAppStore.getState();
      const analysis: Analysis = {
        id: 'test-id-1',
        name: 'Test',
        pumpType: 'A3004XN',
        pumpQuantity: 2,
        failureRateMode: 'percentage',
        failureRatePercentage: 10,
        waferType: 'batch',
        waferQuantity: 125,
        waferCost: 5000,
        downtimeDuration: 4,
        downtimeCostPerHour: 1000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      state.addAnalysis(analysis);

      const updatedState = useAppStore.getState();
      expect(updatedState.analyses[0].detectionRate).toBeUndefined();
    });
  });

  describe('deleteAnalysis', () => {
    it('should remove analysis from store', () => {
      const state = useAppStore.getState();
      const analysis1: Analysis = {
        id: 'test-id-1',
        name: 'Test 1',
        pumpType: 'A3004XN',
        pumpQuantity: 2,
        failureRateMode: 'percentage',
        failureRatePercentage: 10,
        waferType: 'batch',
        waferQuantity: 125,
        waferCost: 5000,
        downtimeDuration: 4,
        downtimeCostPerHour: 1000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const analysis2: Analysis = {
        id: 'test-id-2',
        name: 'Test 2',
        pumpType: 'A3004XN',
        pumpQuantity: 3,
        failureRateMode: 'percentage',
        failureRatePercentage: 10,
        waferType: 'batch',
        waferQuantity: 125,
        waferCost: 5000,
        downtimeDuration: 4,
        downtimeCostPerHour: 1000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      state.addAnalysis(analysis1);
      state.addAnalysis(analysis2);
      state.deleteAnalysis('test-id-1');

      const updatedState = useAppStore.getState();
      expect(updatedState.analyses).toHaveLength(1);
      expect(updatedState.analyses[0].id).toBe('test-id-2');
    });

    it('should not delete the last remaining analysis (AC9)', () => {
      const state = useAppStore.getState();
      const analysis: Analysis = {
        id: 'test-id-1',
        name: 'Test',
        pumpType: 'A3004XN',
        pumpQuantity: 2,
        failureRateMode: 'percentage',
        failureRatePercentage: 10,
        waferType: 'batch',
        waferQuantity: 125,
        waferCost: 5000,
        downtimeDuration: 4,
        downtimeCostPerHour: 1000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      state.addAnalysis(analysis);
      expect(useAppStore.getState().activeAnalysisId).toBe('test-id-1');

      // AC9: At least one analysis must always exist
      state.deleteAnalysis('test-id-1');
      expect(useAppStore.getState().analyses).toHaveLength(1);
      expect(useAppStore.getState().activeAnalysisId).toBe('test-id-1');
    });

    it('should set first remaining analysis as active when deleting active analysis (Story 3.3)', () => {
      const state = useAppStore.getState();
      const analysis1: Analysis = {
        id: 'test-id-1',
        name: 'Analysis 1',
        pumpType: 'A3004XN',
        pumpQuantity: 2,
        failureRateMode: 'percentage',
        failureRatePercentage: 10,
        waferType: 'batch',
        waferQuantity: 125,
        waferCost: 5000,
        downtimeDuration: 4,
        downtimeCostPerHour: 1000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const analysis2: Analysis = {
        id: 'test-id-2',
        name: 'Analysis 2',
        pumpType: 'B5000',
        pumpQuantity: 3,
        failureRateMode: 'percentage',
        failureRatePercentage: 15,
        waferType: 'mono',
        waferQuantity: 1,
        waferCost: 8000,
        downtimeDuration: 6,
        downtimeCostPerHour: 1500,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      state.addAnalysis(analysis1);
      state.addAnalysis(analysis2);
      state.setActiveAnalysis('test-id-2'); // Set second as active

      // Delete active analysis (second)
      state.deleteAnalysis('test-id-2');

      // Should set first remaining analysis as active
      expect(useAppStore.getState().activeAnalysisId).toBe('test-id-1');
      expect(useAppStore.getState().analyses).toHaveLength(1);
    });

    it('should preserve activeAnalysisId when deleting non-active analysis', () => {
      const state = useAppStore.getState();
      const analysis1: Analysis = {
        id: 'test-id-1',
        name: 'Analysis 1',
        pumpType: 'A3004XN',
        pumpQuantity: 2,
        failureRateMode: 'percentage',
        failureRatePercentage: 10,
        waferType: 'batch',
        waferQuantity: 125,
        waferCost: 5000,
        downtimeDuration: 4,
        downtimeCostPerHour: 1000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const analysis2: Analysis = {
        id: 'test-id-2',
        name: 'Analysis 2',
        pumpType: 'B5000',
        pumpQuantity: 3,
        failureRateMode: 'percentage',
        failureRatePercentage: 15,
        waferType: 'mono',
        waferQuantity: 1,
        waferCost: 8000,
        downtimeDuration: 6,
        downtimeCostPerHour: 1500,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      state.addAnalysis(analysis1);
      state.addAnalysis(analysis2);
      state.setActiveAnalysis('test-id-1');
      state.deleteAnalysis('test-id-2');

      expect(useAppStore.getState().activeAnalysisId).toBe('test-id-1');
    });
  });

  describe('duplicateAnalysis', () => {
    it('should create copy with new ID and modified name', () => {
      const state = useAppStore.getState();
      const analysis: Analysis = {
        id: 'original-id',
        name: 'Original Analysis',
        pumpType: 'A3004XN',
        pumpQuantity: 2,
        failureRateMode: 'percentage',
        failureRatePercentage: 10,
        waferType: 'batch',
        waferQuantity: 125,
        waferCost: 5000,
        downtimeDuration: 4,
        downtimeCostPerHour: 1000,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      state.addAnalysis(analysis);
      state.duplicateAnalysis('original-id');

      const updatedState = useAppStore.getState();
      expect(updatedState.analyses).toHaveLength(2);
      expect(updatedState.analyses[1].id).not.toBe('original-id');
      // Story 3.3: French naming "(copie)" instead of "(Copy)"
      expect(updatedState.analyses[1].name).toBe('Original Analysis (copie)');
      expect(updatedState.analyses[1].pumpType).toBe('A3004XN'); // Other fields preserved
    });

    it('should set duplicate as active analysis', () => {
      const state = useAppStore.getState();
      const analysis: Analysis = {
        id: 'original-id',
        name: 'Original',
        pumpType: 'A3004XN',
        pumpQuantity: 2,
        failureRateMode: 'percentage',
        failureRatePercentage: 10,
        waferType: 'batch',
        waferQuantity: 125,
        waferCost: 5000,
        downtimeDuration: 4,
        downtimeCostPerHour: 1000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      state.addAnalysis(analysis);
      state.duplicateAnalysis('original-id');

      const updatedState = useAppStore.getState();
      expect(updatedState.activeAnalysisId).toBe(updatedState.analyses[1].id);
      expect(updatedState.activeAnalysisId).not.toBe('original-id');
    });

    it('should handle non-existent analysis ID gracefully', () => {
      const state = useAppStore.getState();
      const analysis: Analysis = {
        id: 'test-id',
        name: 'Test',
        pumpType: 'A3004XN',
        pumpQuantity: 2,
        failureRateMode: 'percentage',
        failureRatePercentage: 10,
        waferType: 'batch',
        waferQuantity: 125,
        waferCost: 5000,
        downtimeDuration: 4,
        downtimeCostPerHour: 1000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      state.addAnalysis(analysis);
      state.duplicateAnalysis('non-existent-id');

      const updatedState = useAppStore.getState();
      expect(updatedState.analyses).toHaveLength(1); // No duplicate created
    });
  });

  describe('setActiveAnalysis', () => {
    it('should change activeAnalysisId', () => {
      const state = useAppStore.getState();
      const analysis: Analysis = {
        id: 'test-id-123',
        name: 'Test',
        pumpType: 'A3004XN',
        pumpQuantity: 2,
        failureRateMode: 'percentage',
        failureRatePercentage: 10,
        waferType: 'batch',
        waferQuantity: 125,
        waferCost: 5000,
        downtimeDuration: 4,
        downtimeCostPerHour: 1000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      state.addAnalysis(analysis);
      state.setActiveAnalysis(null); // Clear active first
      state.setActiveAnalysis('test-id-123');

      expect(useAppStore.getState().activeAnalysisId).toBe('test-id-123');
    });

    it('should overwrite previous activeAnalysisId', () => {
      const state = useAppStore.getState();
      const analysis1: Analysis = {
        id: 'id-1',
        name: 'Analysis 1',
        pumpType: 'A3004XN',
        pumpQuantity: 2,
        failureRateMode: 'percentage',
        failureRatePercentage: 10,
        waferType: 'batch',
        waferQuantity: 125,
        waferCost: 5000,
        downtimeDuration: 4,
        downtimeCostPerHour: 1000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const analysis2: Analysis = {
        id: 'id-2',
        name: 'Analysis 2',
        pumpType: 'B5000',
        pumpQuantity: 3,
        failureRateMode: 'percentage',
        failureRatePercentage: 15,
        waferType: 'mono',
        waferQuantity: 1,
        waferCost: 8000,
        downtimeDuration: 6,
        downtimeCostPerHour: 1500,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      state.addAnalysis(analysis1);
      state.addAnalysis(analysis2);
      state.setActiveAnalysis('id-1');
      state.setActiveAnalysis('id-2');

      expect(useAppStore.getState().activeAnalysisId).toBe('id-2');
    });
  });

  describe('updateGlobalParams', () => {
    it('should merge partial updates', () => {
      const state = useAppStore.getState();
      state.updateGlobalParams({ detectionRate: 80 });

      const updatedState = useAppStore.getState();
      expect(updatedState.globalParams.detectionRate).toBe(80);
      expect(updatedState.globalParams.serviceCostPerPump).toBe(2500); // Unchanged
    });

    it('should update multiple params at once', () => {
      const state = useAppStore.getState();
      state.updateGlobalParams({
        detectionRate: 85,
        serviceCostPerPump: 3000,
      });

      const updatedState = useAppStore.getState();
      expect(updatedState.globalParams.detectionRate).toBe(85);
      expect(updatedState.globalParams.serviceCostPerPump).toBe(3000);
    });

    it('should reject detectionRate > 100', () => {
      const state = useAppStore.getState();
      const originalParams = { ...state.globalParams };

      state.updateGlobalParams({ detectionRate: 150 });

      const updatedState = useAppStore.getState();
      expect(updatedState.globalParams).toEqual(originalParams); // Unchanged
    });

    it('should reject negative serviceCostPerPump', () => {
      const state = useAppStore.getState();
      const originalParams = { ...state.globalParams };

      state.updateGlobalParams({ serviceCostPerPump: -100 });

      const updatedState = useAppStore.getState();
      expect(updatedState.globalParams).toEqual(originalParams); // Unchanged
    });

    it('should reject zero serviceCostPerPump', () => {
      const state = useAppStore.getState();
      const originalParams = { ...state.globalParams };

      state.updateGlobalParams({ serviceCostPerPump: 0 });

      const updatedState = useAppStore.getState();
      expect(updatedState.globalParams).toEqual(originalParams); // Unchanged
    });
  });

  describe('Validation and Error Cases', () => {
    it('should reject addAnalysis with duplicate ID', () => {
      const state = useAppStore.getState();
      const analysis: Analysis = {
        id: 'duplicate-id',
        name: 'First',
        pumpType: 'A3004XN',
        pumpQuantity: 2,
        failureRateMode: 'percentage',
        failureRatePercentage: 10,
        waferType: 'batch',
        waferQuantity: 125,
        waferCost: 5000,
        downtimeDuration: 4,
        downtimeCostPerHour: 1000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      state.addAnalysis(analysis);
      const duplicate = { ...analysis, name: 'Second' };
      state.addAnalysis(duplicate);

      const updatedState = useAppStore.getState();
      expect(updatedState.analyses).toHaveLength(1); // Only first one added
      expect(updatedState.analyses[0].name).toBe('First');
    });

    it('should reject addAnalysis with negative pumpQuantity', () => {
      const state = useAppStore.getState();
      const invalidAnalysis: Analysis = {
        id: 'test-id',
        name: 'Test',
        pumpType: 'A3004XN',
        pumpQuantity: -5,
        failureRateMode: 'percentage',
        failureRatePercentage: 10,
        waferType: 'batch',
        waferQuantity: 125,
        waferCost: 5000,
        downtimeDuration: 4,
        downtimeCostPerHour: 1000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      state.addAnalysis(invalidAnalysis);

      expect(useAppStore.getState().analyses).toHaveLength(0);
    });

    it('should reject addAnalysis with failureRatePercentage > 100', () => {
      const state = useAppStore.getState();
      const invalidAnalysis: Analysis = {
        id: 'test-id',
        name: 'Test',
        pumpType: 'A3004XN',
        pumpQuantity: 2,
        failureRateMode: 'percentage',
        failureRatePercentage: 150,
        waferType: 'batch',
        waferQuantity: 125,
        waferCost: 5000,
        downtimeDuration: 4,
        downtimeCostPerHour: 1000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      state.addAnalysis(invalidAnalysis);

      expect(useAppStore.getState().analyses).toHaveLength(0);
    });

    it('should reject updateAnalysis with non-existent ID', () => {
      const state = useAppStore.getState();
      const analysis: Analysis = {
        id: 'existing-id',
        name: 'Test',
        pumpType: 'A3004XN',
        pumpQuantity: 2,
        failureRateMode: 'percentage',
        failureRatePercentage: 10,
        waferType: 'batch',
        waferQuantity: 125,
        waferCost: 5000,
        downtimeDuration: 4,
        downtimeCostPerHour: 1000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      state.addAnalysis(analysis);
      state.updateAnalysis('non-existent-id', { name: 'Updated' });

      const updatedState = useAppStore.getState();
      expect(updatedState.analyses[0].name).toBe('Test'); // Unchanged
    });

    it('should be no-op when updateAnalysis called with empty updates', () => {
      const state = useAppStore.getState();
      const originalTimestamp = '2024-01-01T00:00:00.000Z';
      const analysis: Analysis = {
        id: 'test-id',
        name: 'Test',
        pumpType: 'A3004XN',
        pumpQuantity: 2,
        failureRateMode: 'percentage',
        failureRatePercentage: 10,
        waferType: 'batch',
        waferQuantity: 125,
        waferCost: 5000,
        downtimeDuration: 4,
        downtimeCostPerHour: 1000,
        createdAt: originalTimestamp,
        updatedAt: originalTimestamp,
      };

      state.addAnalysis(analysis);
      state.updateAnalysis('test-id', {});

      const updatedState = useAppStore.getState();
      expect(updatedState.analyses[0].updatedAt).toBe(originalTimestamp); // Unchanged
    });

    it('should reject setActiveAnalysis with non-existent ID', () => {
      const state = useAppStore.getState();
      const analysis: Analysis = {
        id: 'valid-id',
        name: 'Test',
        pumpType: 'A3004XN',
        pumpQuantity: 2,
        failureRateMode: 'percentage',
        failureRatePercentage: 10,
        waferType: 'batch',
        waferQuantity: 125,
        waferCost: 5000,
        downtimeDuration: 4,
        downtimeCostPerHour: 1000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      state.addAnalysis(analysis);
      state.setActiveAnalysis('non-existent-id');

      const updatedState = useAppStore.getState();
      expect(updatedState.activeAnalysisId).toBe('valid-id'); // Should remain unchanged
    });

    it('should allow setActiveAnalysis with null to clear active analysis', () => {
      const state = useAppStore.getState();
      const analysis: Analysis = {
        id: 'test-id',
        name: 'Test',
        pumpType: 'A3004XN',
        pumpQuantity: 2,
        failureRateMode: 'percentage',
        failureRatePercentage: 10,
        waferType: 'batch',
        waferQuantity: 125,
        waferCost: 5000,
        downtimeDuration: 4,
        downtimeCostPerHour: 1000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      state.addAnalysis(analysis);
      expect(useAppStore.getState().activeAnalysisId).toBe('test-id');

      state.setActiveAnalysis(null);
      expect(useAppStore.getState().activeAnalysisId).toBeNull();
    });
  });

  // Story 4.4: excludedFromGlobal and toggleExcludeFromGlobal
  describe('excludedFromGlobal (Story 4.4)', () => {
    const createAnalysis = (id: string, name: string): Analysis => ({
      id,
      name,
      pumpType: 'A3004XN',
      pumpQuantity: 10,
      failureRateMode: 'percentage',
      failureRatePercentage: 10,
      waferType: 'batch',
      waferQuantity: 125,
      waferCost: 5000,
      downtimeDuration: 4,
      downtimeCostPerHour: 1000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    it('should have empty excludedFromGlobal set initially', () => {
      const state = useAppStore.getState();
      expect(state.excludedFromGlobal.size).toBe(0);
    });

    it('should exclude an analysis from global calculations', () => {
      const state = useAppStore.getState();
      state.addAnalysis(createAnalysis('a1', 'Process A'));
      state.addAnalysis(createAnalysis('a2', 'Process B'));

      state.toggleExcludeFromGlobal('a1');

      expect(useAppStore.getState().excludedFromGlobal.has('a1')).toBe(true);
      expect(useAppStore.getState().excludedFromGlobal.size).toBe(1);
    });

    it('should re-include an excluded analysis', () => {
      const state = useAppStore.getState();
      state.addAnalysis(createAnalysis('a1', 'Process A'));
      state.addAnalysis(createAnalysis('a2', 'Process B'));

      state.toggleExcludeFromGlobal('a1');
      expect(useAppStore.getState().excludedFromGlobal.has('a1')).toBe(true);

      state.toggleExcludeFromGlobal('a1');
      expect(useAppStore.getState().excludedFromGlobal.has('a1')).toBe(false);
      expect(useAppStore.getState().excludedFromGlobal.size).toBe(0);
    });

    it('should prevent excluding the last active process', () => {
      const state = useAppStore.getState();
      state.addAnalysis(createAnalysis('a1', 'Process A'));

      state.toggleExcludeFromGlobal('a1');

      // Should be no-op: a1 is the only analysis
      expect(useAppStore.getState().excludedFromGlobal.has('a1')).toBe(false);
    });

    it('should prevent excluding when only one active process remains', () => {
      const state = useAppStore.getState();
      state.addAnalysis(createAnalysis('a1', 'Process A'));
      state.addAnalysis(createAnalysis('a2', 'Process B'));
      state.addAnalysis(createAnalysis('a3', 'Process C'));

      state.toggleExcludeFromGlobal('a1');
      state.toggleExcludeFromGlobal('a2');

      expect(useAppStore.getState().excludedFromGlobal.size).toBe(2);

      // Try to exclude the last active one
      state.toggleExcludeFromGlobal('a3');

      // Should be no-op
      expect(useAppStore.getState().excludedFromGlobal.has('a3')).toBe(false);
      expect(useAppStore.getState().excludedFromGlobal.size).toBe(2);
    });

    it('should allow re-including even when only one active remains', () => {
      const state = useAppStore.getState();
      state.addAnalysis(createAnalysis('a1', 'Process A'));
      state.addAnalysis(createAnalysis('a2', 'Process B'));

      state.toggleExcludeFromGlobal('a1');
      expect(useAppStore.getState().excludedFromGlobal.size).toBe(1);

      // Re-include should always work
      state.toggleExcludeFromGlobal('a1');
      expect(useAppStore.getState().excludedFromGlobal.size).toBe(0);
    });

    it('should clean up excludedFromGlobal when deleting an excluded analysis', () => {
      const state = useAppStore.getState();
      state.addAnalysis(createAnalysis('a1', 'Process A'));
      state.addAnalysis(createAnalysis('a2', 'Process B'));

      state.toggleExcludeFromGlobal('a1');
      expect(useAppStore.getState().excludedFromGlobal.has('a1')).toBe(true);

      state.deleteAnalysis('a1');

      expect(useAppStore.getState().excludedFromGlobal.has('a1')).toBe(false);
      expect(useAppStore.getState().excludedFromGlobal.size).toBe(0);
    });

    it('should not affect excludedFromGlobal when deleting a non-excluded analysis', () => {
      const state = useAppStore.getState();
      state.addAnalysis(createAnalysis('a1', 'Process A'));
      state.addAnalysis(createAnalysis('a2', 'Process B'));
      state.addAnalysis(createAnalysis('a3', 'Process C'));

      state.toggleExcludeFromGlobal('a1');

      state.deleteAnalysis('a2');

      expect(useAppStore.getState().excludedFromGlobal.has('a1')).toBe(true);
      expect(useAppStore.getState().excludedFromGlobal.size).toBe(1);
    });

    it('should create new Set reference on each toggle (Zustand reactivity)', () => {
      const state = useAppStore.getState();
      state.addAnalysis(createAnalysis('a1', 'Process A'));
      state.addAnalysis(createAnalysis('a2', 'Process B'));

      const setBefore = useAppStore.getState().excludedFromGlobal;
      state.toggleExcludeFromGlobal('a1');
      const setAfter = useAppStore.getState().excludedFromGlobal;

      expect(setBefore).not.toBe(setAfter);
    });
  });

  // Story 6.4: Diagram Store Slice
  describe('Diagram State (Story 6.4)', () => {
    it('should have default deploymentMode set to pilot', () => {
      const state = useAppStore.getState();
      expect(state.deploymentMode).toBe('pilot');
    });

    it('should have default connectionType set to ethernet', () => {
      const state = useAppStore.getState();
      expect(state.connectionType).toBe('ethernet');
    });

    it('should update deploymentMode to production', () => {
      const state = useAppStore.getState();
      state.setDeploymentMode('production');
      expect(useAppStore.getState().deploymentMode).toBe('production');
    });

    it('should update deploymentMode back to pilot', () => {
      const state = useAppStore.getState();
      state.setDeploymentMode('production');
      state.setDeploymentMode('pilot');
      expect(useAppStore.getState().deploymentMode).toBe('pilot');
    });

    it('should update connectionType to rs485', () => {
      const state = useAppStore.getState();
      state.setConnectionType('rs485');
      expect(useAppStore.getState().connectionType).toBe('rs485');
    });

    it('should update connectionType to wifi', () => {
      const state = useAppStore.getState();
      state.setConnectionType('wifi');
      expect(useAppStore.getState().connectionType).toBe('wifi');
    });

    it('should not affect other state when changing deploymentMode', () => {
      const analysis: Analysis = {
        id: 'test-id',
        name: 'Test',
        pumpType: 'A3004XN',
        pumpQuantity: 2,
        failureRateMode: 'percentage',
        failureRatePercentage: 10,
        waferType: 'batch',
        waferQuantity: 125,
        waferCost: 5000,
        downtimeDuration: 4,
        downtimeCostPerHour: 1000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const state = useAppStore.getState();
      state.addAnalysis(analysis);
      state.setDeploymentMode('production');

      const updated = useAppStore.getState();
      expect(updated.analyses).toHaveLength(1);
      expect(updated.activeAnalysisId).toBe('test-id');
      expect(updated.connectionType).toBe('ethernet');
    });
  });
});
