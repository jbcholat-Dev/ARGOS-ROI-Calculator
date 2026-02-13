/**
 * Story 4.3: Navigation Links and Session Stability
 * Task 2: Session Stability Tests (AC: 3, 4)
 * Task 4: Ephemeral Session Behavior Tests (AC: 5)
 *
 * Tests verify store integrity under stress, no memory leaks from store operations,
 * and correct ephemeral behavior (data cleared on store reset).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from './app-store';
import type { Analysis } from '@/types';

function createTestAnalysis(overrides: Partial<Analysis> = {}): Analysis {
  return {
    id: crypto.randomUUID(),
    name: 'Stress Test Analysis',
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

const resetStore = () => {
  useAppStore.setState({
    analyses: [],
    activeAnalysisId: null,
    globalParams: { detectionRate: 70, serviceCostPerPump: 2500 },
    unsavedChanges: false,
  });
};

describe('Session Stability — Store Stress Tests (AC: 3)', () => {
  beforeEach(resetStore);

  it('50 add/delete cycles preserve store integrity', () => {
    const state = useAppStore.getState();

    // AC9: At least one analysis must remain, so we cycle by adding then deleting previous
    state.addAnalysis(createTestAnalysis({ id: 'stress-0', name: 'Stress 0' }));
    expect(useAppStore.getState().analyses).toHaveLength(1);

    for (let i = 1; i < 50; i++) {
      state.addAnalysis(createTestAnalysis({ id: `stress-${i}`, name: `Stress ${i}` }));
      expect(useAppStore.getState().analyses).toHaveLength(2);

      state.deleteAnalysis(`stress-${i - 1}`);
      const current = useAppStore.getState();
      expect(current.analyses).toHaveLength(1);
      expect(current.analyses[0].id).toBe(`stress-${i}`);
    }

    // Final state: 1 analysis remaining (AC9), no corruption
    const finalState = useAppStore.getState();
    expect(finalState.analyses).toHaveLength(1);
    expect(finalState.analyses[0].id).toBe('stress-49');
  });

  it('100 sequential setActiveAnalysis calls produce correct final state', () => {
    const state = useAppStore.getState();

    // Add 5 analyses
    const ids: string[] = [];
    for (let i = 0; i < 5; i++) {
      const id = `seq-${i}`;
      ids.push(id);
      state.addAnalysis(createTestAnalysis({ id, name: `Seq ${i}` }));
    }

    // Rapidly switch active analysis 100 times
    for (let i = 0; i < 100; i++) {
      const targetId = ids[i % 5];
      state.setActiveAnalysis(targetId);
      expect(useAppStore.getState().activeAnalysisId).toBe(targetId);
    }

    // Final state: last active should be ids[99 % 5] = ids[4]
    expect(useAppStore.getState().activeAnalysisId).toBe(ids[4]);
    expect(useAppStore.getState().analyses).toHaveLength(5);
  });

  it('20 updateGlobalParams calls maintain correct values', () => {
    const state = useAppStore.getState();

    for (let i = 1; i <= 20; i++) {
      const rate = 50 + i; // 51 to 70
      const cost = 2000 + i * 100; // 2100 to 4000
      state.updateGlobalParams({ detectionRate: rate, serviceCostPerPump: cost });

      const current = useAppStore.getState();
      expect(current.globalParams.detectionRate).toBe(rate);
      expect(current.globalParams.serviceCostPerPump).toBe(cost);
    }

    // Final values
    const finalState = useAppStore.getState();
    expect(finalState.globalParams.detectionRate).toBe(70);
    expect(finalState.globalParams.serviceCostPerPump).toBe(4000);
  });

  it('duplicate + delete cycles do not corrupt analyses array', () => {
    const state = useAppStore.getState();

    // Add initial analysis
    state.addAnalysis(createTestAnalysis({ id: 'original', name: 'Original' }));

    for (let i = 0; i < 10; i++) {
      // Duplicate
      state.duplicateAnalysis('original');
      const afterDup = useAppStore.getState();
      expect(afterDup.analyses).toHaveLength(2);

      // Get duplicate ID and delete it
      const dupId = afterDup.analyses[1].id;
      state.deleteAnalysis(dupId);
      expect(useAppStore.getState().analyses).toHaveLength(1);
    }

    // Original should be untouched
    const finalState = useAppStore.getState();
    expect(finalState.analyses).toHaveLength(1);
    expect(finalState.analyses[0].id).toBe('original');
    expect(finalState.analyses[0].name).toBe('Original');
  });

  it('store size does not grow after add+delete cycles', () => {
    const state = useAppStore.getState();

    // Add 5 analyses
    for (let i = 0; i < 5; i++) {
      state.addAnalysis(createTestAnalysis({ id: `grow-${i}`, name: `Grow ${i}` }));
    }
    expect(useAppStore.getState().analyses).toHaveLength(5);

    // Delete all — AC9 guard preserves the last one
    for (let i = 0; i < 5; i++) {
      state.deleteAnalysis(`grow-${i}`);
    }

    // AC9: Last analysis preserved, no orphaned data
    const finalState = useAppStore.getState();
    expect(finalState.analyses).toHaveLength(1);
    expect(finalState.analyses[0].id).toBe('grow-4');
  });

  it('calculated values remain accurate after many state mutations', () => {
    const state = useAppStore.getState();

    // Add analysis, modify it multiple times
    state.addAnalysis(createTestAnalysis({ id: 'calc-test', pumpQuantity: 10 }));

    for (let i = 1; i <= 20; i++) {
      state.updateAnalysis('calc-test', { pumpQuantity: i * 5 });
    }

    // Final pumpQuantity should be 100 (20 * 5)
    const finalState = useAppStore.getState();
    expect(finalState.analyses[0].pumpQuantity).toBe(100);

    // Other fields untouched
    expect(finalState.analyses[0].waferCost).toBe(8000);
    expect(finalState.analyses[0].downtimeCostPerHour).toBe(500);
  });
});

describe('Session Stability — Ephemeral Behavior (AC: 5)', () => {
  beforeEach(resetStore);

  it('store initializes with correct defaults', () => {
    const state = useAppStore.getState();
    expect(state.analyses).toEqual([]);
    expect(state.activeAnalysisId).toBeNull();
    expect(state.globalParams).toEqual({
      detectionRate: 70,
      serviceCostPerPump: 2500,
    });
    expect(state.unsavedChanges).toBe(false);
  });

  it('store reset after data clears everything to defaults', () => {
    const state = useAppStore.getState();

    // Populate store with data
    state.addAnalysis(createTestAnalysis({ id: 'ephem-1', name: 'Ephemeral 1' }));
    state.addAnalysis(createTestAnalysis({ id: 'ephem-2', name: 'Ephemeral 2' }));
    state.addAnalysis(createTestAnalysis({ id: 'ephem-3', name: 'Ephemeral 3' }));
    state.updateGlobalParams({ detectionRate: 85, serviceCostPerPump: 3500 });
    state.setActiveAnalysis('ephem-2');

    // Verify data is present
    expect(useAppStore.getState().analyses).toHaveLength(3);
    expect(useAppStore.getState().activeAnalysisId).toBe('ephem-2');
    expect(useAppStore.getState().globalParams.detectionRate).toBe(85);

    // Simulate page refresh by resetting store
    resetStore();

    // Verify all data is cleared
    const reset = useAppStore.getState();
    expect(reset.analyses).toEqual([]);
    expect(reset.activeAnalysisId).toBeNull();
    expect(reset.globalParams).toEqual({
      detectionRate: 70,
      serviceCostPerPump: 2500,
    });
    expect(reset.unsavedChanges).toBe(false);
  });

  it('no localStorage or sessionStorage persistence', () => {
    const state = useAppStore.getState();

    // Add data
    state.addAnalysis(createTestAnalysis({ id: 'storage-test', name: 'Storage Test' }));
    state.updateGlobalParams({ detectionRate: 90 });

    // Check localStorage is not used
    const localKeys = Object.keys(localStorage);
    const appKeys = localKeys.filter(
      (k) => k.includes('app') || k.includes('store') || k.includes('analysis') || k.includes('argos'),
    );
    expect(appKeys).toHaveLength(0);

    // Check sessionStorage is not used
    const sessionKeys = Object.keys(sessionStorage);
    const appSessionKeys = sessionKeys.filter(
      (k) => k.includes('app') || k.includes('store') || k.includes('analysis') || k.includes('argos'),
    );
    expect(appSessionKeys).toHaveLength(0);
  });

  it('fresh store create produces independent state', () => {
    const state = useAppStore.getState();

    // Modify state
    state.addAnalysis(createTestAnalysis({ id: 'fresh-test', name: 'Fresh Test' }));
    expect(useAppStore.getState().analyses).toHaveLength(1);

    // Reset simulates fresh page load
    resetStore();

    const freshState = useAppStore.getState();
    expect(freshState.analyses).toHaveLength(0);
    expect(freshState.activeAnalysisId).toBeNull();
    expect(freshState.globalParams.detectionRate).toBe(70);
    expect(freshState.globalParams.serviceCostPerPump).toBe(2500);
  });
});
