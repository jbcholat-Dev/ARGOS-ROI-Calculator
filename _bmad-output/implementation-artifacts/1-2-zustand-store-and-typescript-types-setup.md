# Story 1.2: Zustand Store and TypeScript Types Setup

Status: ready-for-dev

## Story

**As a** developer,
**I want** the core Zustand store and TypeScript interfaces defined,
**So that** I have a type-safe foundation for state management.

## Acceptance Criteria

**Given** the project is initialized
**When** I import from @/stores/app-store
**Then** I can access the AppState interface with analyses[], activeAnalysisId, globalParams
**And** default globalParams are set (detectionRate: 70, serviceCostPerPump: 2500)
**And** all TypeScript interfaces (Analysis, GlobalParams, CalculationResult) are exported from @/types
**And** store uses selector pattern per Architecture patterns

**FRs Covered:** FR55

## Tasks / Subtasks

### Task 1: Create TypeScript Type Definitions (AC: 1, 2, 3)
- [ ] Create `src/types/index.ts` with all core interfaces
- [ ] Define `Analysis` interface with all required fields (id, name, pumpType, pumpQuantity, failureRateMode, failureRatePercentage, waferType, waferQuantity, waferCost, downtimeDuration, downtimeCostPerHour)
- [ ] Define `GlobalParams` interface (detectionRate, serviceCostPerPump)
- [ ] Define `CalculationResult` interface (totalFailureCost, argosServiceCost, deltaSavings, roiPercentage)
- [ ] Define `FailureRateMode` union type ('percentage' | 'absolute')
- [ ] Define `WaferType` union type ('mono' | 'batch')
- [ ] Export all types from barrel export

### Task 2: Install Zustand Dependency (AC: 1)
- [ ] Verify zustand is installed (done in Story 1.1: `npm install zustand`)
- [ ] Confirm version is zustand@5.x in package.json

### Task 3: Create Zustand Store with Base Structure (AC: 1, 2, 4)
- [ ] Create `src/stores/app-store.ts`
- [ ] Define `AppState` interface extending types from `@/types`
- [ ] Initialize store with empty analyses array
- [ ] Set default globalParams: { detectionRate: 70, serviceCostPerPump: 2500 }
- [ ] Implement `addAnalysis` action
- [ ] Implement `updateAnalysis` action (partial updates)
- [ ] Implement `deleteAnalysis` action
- [ ] Implement `duplicateAnalysis` action
- [ ] Implement `setActiveAnalysis` action
- [ ] Implement `updateGlobalParams` action (partial updates)

### Task 4: Implement Selector Pattern Best Practices (AC: 4)
- [ ] Add JSDoc comments explaining selector usage pattern
- [ ] Create example usage comment showing: `const analyses = useAppStore((state) => state.analyses)`
- [ ] Document anti-pattern: avoid destructuring entire state
- [ ] Add comment about preventing unnecessary re-renders

### Task 5: Create Barrel Exports (AC: 1, 3)
- [ ] Update `src/types/index.ts` to export all types
- [ ] Create `src/stores/index.ts` barrel export
- [ ] Export `useAppStore` hook and `AppState` type

### Task 6: Verify Path Aliases Work (AC: 1, 3)
- [ ] Test import from `@/types` in app-store.ts
- [ ] Test import from `@/stores/app-store` in a test component
- [ ] Confirm TypeScript IntelliSense works correctly

### Task 7: Add Basic Tests (Optional - recommended)
- [ ] Create `src/stores/app-store.test.ts`
- [ ] Test addAnalysis creates new analysis with unique ID
- [ ] Test updateAnalysis updates correct analysis
- [ ] Test deleteAnalysis removes analysis
- [ ] Test setActiveAnalysis changes activeAnalysisId
- [ ] Test updateGlobalParams merges partial updates

## Dev Notes

### Architecture Compliance

**Critical Implementation Requirements from Architecture Document:**

1. **State Management (Zustand):**
   - Ultra-lightweight (~1.5kb gzipped)
   - Built-in selector optimization (prevents unnecessary re-renders)
   - First-class TypeScript support
   - Source: [Architecture Document](C:\Users\JBCHOLAT\ROI Calculator\_bmad-output\planning-artifacts\architecture.md) - Section "State Management: Zustand"

2. **Store Structure (AppState Interface):**
   ```typescript
   interface AppState {
     // Analyses
     analyses: Analysis[];
     activeAnalysisId: string | null;

     // Global Parameters
     globalParams: GlobalParams;

     // UI State (optional for Story 1.2, can defer)
     unsavedChanges: boolean;

     // Actions
     addAnalysis: (analysis: Analysis) => void;
     updateAnalysis: (id: string, updates: Partial<Analysis>) => void;
     deleteAnalysis: (id: string) => void;
     duplicateAnalysis: (id: string) => void;
     setActiveAnalysis: (id: string) => void;
     updateGlobalParams: (params: Partial<GlobalParams>) => void;
   }
   ```

3. **Selector Pattern (CRITICAL for NFR-P1: <100ms calculations):**
   - ALWAYS use selectors: `useAppStore((state) => state.analyses)`
   - NEVER destructure entire state: `const { analyses } = useAppStore()` ❌
   - Selector pattern prevents unnecessary re-renders when unrelated state changes
   - Source: Architecture Document - "Prevents cascading re-renders"

4. **Immutable State Updates:**
   - Use spread operator for updates
   - Example: `set((state) => ({ analyses: [...state.analyses, newAnalysis] }))`
   - NO direct mutations: `state.analyses.push(newAnalysis)` ❌
   - Source: [Architecture Document] - "Implementation Patterns: Immutable state updates"

5. **TypeScript Strict Mode:**
   - All types must be explicitly defined
   - No `any` types allowed
   - Enable `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`
   - Source: Story 1.1 - tsconfig.app.json has `"strict": true`

### Type Definitions Required

**Analysis Interface:**
```typescript
export interface Analysis {
  id: string; // UUID
  name: string; // Process name (e.g., "Poly Etch - Chamber 04")

  // Equipment
  pumpType: string; // Free text (e.g., "A3004XN")
  pumpQuantity: number; // Positive integer

  // Failure Rate
  failureRateMode: FailureRateMode; // 'percentage' | 'absolute'
  failureRatePercentage: number; // 0-100 (percentage)
  absoluteFailureCount?: number; // Only if mode is 'absolute'

  // Wafer Economics
  waferType: WaferType; // 'mono' | 'batch'
  waferQuantity: number; // Default 125 for batch, 1 for mono
  waferCost: number; // EUR per wafer

  // Downtime
  downtimeDuration: number; // Hours per failure
  downtimeCostPerHour: number; // EUR/hour

  // Metadata
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}

export type FailureRateMode = 'percentage' | 'absolute';
export type WaferType = 'mono' | 'batch';

export interface GlobalParams {
  detectionRate: number; // Default: 70 (percentage)
  serviceCostPerPump: number; // Default: 2500 (EUR/year)
}

export interface CalculationResult {
  totalFailureCost: number; // EUR
  argosServiceCost: number; // EUR
  deltaSavings: number; // EUR (failureCost - serviceCost)
  roiPercentage: number; // % (deltaSavings / serviceCost * 100)
}
```

### Default Values

**Global Parameters (from PRD):**
- Detection Rate: **70%** (FR31)
- Service Cost Per Pump: **EUR 2,500/year** (FR33)

**Analysis Defaults:**
- Wafer Quantity: **125** when waferType is 'batch' (FR15)
- Wafer Quantity: **1** when waferType is 'mono'
- Failure Rate Mode: **'percentage'** (default)

### File Structure

```
src/
├── stores/
│   ├── app-store.ts       # Main Zustand store
│   └── index.ts           # Barrel export
├── types/
│   └── index.ts           # All TypeScript interfaces
```

### Implementation Pattern Example

**Zustand Store Setup:**
```typescript
import { create } from 'zustand';
import type { Analysis, GlobalParams } from '@/types';

interface AppState {
  analyses: Analysis[];
  activeAnalysisId: string | null;
  globalParams: GlobalParams;

  // Actions
  addAnalysis: (analysis: Analysis) => void;
  updateAnalysis: (id: string, updates: Partial<Analysis>) => void;
  deleteAnalysis: (id: string) => void;
  duplicateAnalysis: (id: string) => void;
  setActiveAnalysis: (id: string) => void;
  updateGlobalParams: (params: Partial<GlobalParams>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  analyses: [],
  activeAnalysisId: null,
  globalParams: {
    detectionRate: 70,
    serviceCostPerPump: 2500,
  },

  // Actions
  addAnalysis: (analysis) =>
    set((state) => ({
      analyses: [...state.analyses, analysis],
      activeAnalysisId: analysis.id,
    })),

  updateAnalysis: (id, updates) =>
    set((state) => ({
      analyses: state.analyses.map((a) =>
        a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
      ),
    })),

  deleteAnalysis: (id) =>
    set((state) => ({
      analyses: state.analyses.filter((a) => a.id !== id),
      activeAnalysisId: state.activeAnalysisId === id ? null : state.activeAnalysisId,
    })),

  duplicateAnalysis: (id) =>
    set((state) => {
      const original = state.analyses.find((a) => a.id === id);
      if (!original) return state;

      const duplicate: Analysis = {
        ...original,
        id: crypto.randomUUID(),
        name: `${original.name} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return {
        analyses: [...state.analyses, duplicate],
        activeAnalysisId: duplicate.id,
      };
    }),

  setActiveAnalysis: (id) => set({ activeAnalysisId: id }),

  updateGlobalParams: (params) =>
    set((state) => ({
      globalParams: { ...state.globalParams, ...params },
    })),
}));
```

**Using the Store (Selector Pattern):**
```typescript
// ✅ CORRECT - Selector prevents unnecessary re-renders
const analyses = useAppStore((state) => state.analyses);
const addAnalysis = useAppStore((state) => state.addAnalysis);

// ❌ WRONG - Causes re-render on ANY state change
const { analyses, addAnalysis } = useAppStore();
```

### Previous Story Intelligence (Story 1.1)

**Learnings from Story 1.1:**
1. ✅ **Path aliases configured**: `@/` resolves to `src/` - verified working in App.tsx
2. ✅ **TypeScript strict mode enabled**: All types must be explicit
3. ✅ **ESLint flat config (ESLint 9)**: Use `eslint.config.js`, NOT `.eslintrc.cjs`
4. ✅ **Tailwind CSS v4**: Uses `@import 'tailwindcss'` syntax, NOT `@tailwind` directives
5. ✅ **Dependencies installed**: Zustand already installed (`zustand@^5.0.11`)

**File Locations Established:**
- `src/stores/` directory exists (verified in Story 1.1 code review)
- `src/types/` directory exists
- `src/lib/` directory exists (contains `constants.ts` and `utils.ts`)

**Code Patterns to Follow:**
- Named exports only (no default exports)
- PascalCase for types/interfaces
- camelCase for functions/variables
- Import from `@/` path aliases

### NFR Compliance

**NFR-P1 (Calculation <100ms):**
- Selector pattern is CRITICAL for this NFR
- Without selectors, every input change could trigger re-render of ALL components
- With selectors, only components using specific state slice re-render

**NFR-R5 (2+ hour session stability):**
- Immutable updates prevent memory leaks
- No direct mutations ensure stable references
- Zustand's shallow comparison prevents unnecessary work

**NFR-S1 (No server transmission):**
- All data stays in-memory (Zustand store)
- No API calls in store actions
- Future: can add sessionStorage persistence for browser refresh

### Testing Verification

**Manual Testing Checklist:**
1. ✅ Import `useAppStore` from `@/stores/app-store` - no errors
2. ✅ Import types from `@/types` - TypeScript IntelliSense works
3. ✅ Create test analysis - appears in store
4. ✅ Update analysis - changes persist
5. ✅ Delete analysis - removed from store
6. ✅ Update global params - defaults are 70 and 2500
7. ✅ TypeScript compilation passes: `npm run build`

**Automated Tests (Optional for Story 1.2):**
- Story 1.2 focuses on setup, tests can be added in later stories
- If implementing tests, use Vitest (already installed in Story 1.1)

### References

- [Architecture Document](C:\Users\JBCHOLAT\ROI Calculator\_bmad-output\planning-artifacts\architecture.md) - Sections: "State Management: Zustand", "Component Architecture", "Data Models"
- [Epic 1](C:\Users\JBCHOLAT\ROI Calculator\_bmad-output\planning-artifacts\epics.md#story-12-zustand-store-and-typescript-types-setup) - Story 1.2 requirements
- [PRD](C:\Users\JBCHOLAT\ROI Calculator\_bmad-output\planning-artifacts\prd.md) - FR55 (session data persistence), FR31 (default detection rate), FR33 (default service cost)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/) - Selector pattern, TypeScript usage
- [Story 1.1](C:\Users\JBCHOLAT\ROI Calculator\_bmad-output\implementation-artifacts\1-1-project-initialization-with-vite-react-typescript.md) - Project setup, dependencies installed

---

**Story Dependencies:**
- Depends on: Story 1.1 (Project Initialization) ✅ DONE

**Blocks:**
- Story 1.3: React Router Configuration (needs types for routing)
- Story 1.4: UI Primitive Components (needs types for props)
- Story 1.5: Application Shell (needs store for GlobalSidebar)
- All Epic 2 stories (need store and types for analysis management)

**Estimated Effort:** 1-2 hours (type definitions + store setup + verification)

## Dev Agent Record

### Agent Model Used

_To be filled by Dev Agent_

### Debug Log References

_To be filled by Dev Agent_

### Completion Notes List

_To be filled by Dev Agent_

### File List

_To be filled by Dev Agent_
