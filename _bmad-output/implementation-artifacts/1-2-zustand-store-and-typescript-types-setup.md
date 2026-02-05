# Story 1.2: Zustand Store and TypeScript Types Setup

Status: done

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
- [x] Create `src/types/index.ts` with all core interfaces
- [x] Define `Analysis` interface with all required fields (id, name, pumpType, pumpQuantity, failureRateMode, failureRatePercentage, waferType, waferQuantity, waferCost, downtimeDuration, downtimeCostPerHour)
- [x] Define `GlobalParams` interface (detectionRate, serviceCostPerPump)
- [x] Define `CalculationResult` interface (totalFailureCost, argosServiceCost, deltaSavings, roiPercentage)
- [x] Define `FailureRateMode` union type ('percentage' | 'absolute')
- [x] Define `WaferType` union type ('mono' | 'batch')
- [x] Export all types from barrel export

### Task 2: Install Zustand Dependency (AC: 1)
- [x] Verify zustand is installed (done in Story 1.1: `npm install zustand`)
- [x] Confirm version is zustand@5.x in package.json

### Task 3: Create Zustand Store with Base Structure (AC: 1, 2, 4)
- [x] Create `src/stores/app-store.ts`
- [x] Define `AppState` interface extending types from `@/types`
- [x] Initialize store with empty analyses array
- [x] Set default globalParams: { detectionRate: 70, serviceCostPerPump: 2500 }
- [x] Implement `addAnalysis` action
- [x] Implement `updateAnalysis` action (partial updates)
- [x] Implement `deleteAnalysis` action
- [x] Implement `duplicateAnalysis` action
- [x] Implement `setActiveAnalysis` action
- [x] Implement `updateGlobalParams` action (partial updates)

### Task 4: Implement Selector Pattern Best Practices (AC: 4)
- [x] Add JSDoc comments explaining selector usage pattern
- [x] Create example usage comment showing: `const analyses = useAppStore((state) => state.analyses)`
- [x] Document anti-pattern: avoid destructuring entire state
- [x] Add comment about preventing unnecessary re-renders

### Task 5: Create Barrel Exports (AC: 1, 3)
- [x] Update `src/types/index.ts` to export all types
- [x] Create `src/stores/index.ts` barrel export
- [x] Export `useAppStore` hook and `AppState` type

### Task 6: Verify Path Aliases Work (AC: 1, 3)
- [x] Test import from `@/types` in app-store.ts
- [x] Test import from `@/stores/app-store` in a test component
- [x] Confirm TypeScript IntelliSense works correctly

### Task 7: Add Basic Tests (Optional - recommended)
- [x] Create `src/stores/app-store.test.ts`
- [x] Test addAnalysis creates new analysis with unique ID
- [x] Test updateAnalysis updates correct analysis
- [x] Test deleteAnalysis removes analysis
- [x] Test setActiveAnalysis changes activeAnalysisId
- [x] Test updateGlobalParams merges partial updates

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

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

No issues encountered during implementation. All tasks completed without errors.

### Completion Notes List

✅ **All Tasks Completed Successfully**

**Task 1: TypeScript Type Definitions**
- Created `src/types/index.ts` with all core interfaces
- Implemented `Analysis`, `GlobalParams`, `CalculationResult` interfaces
- Defined `FailureRateMode` and `WaferType` union types
- All types follow strict TypeScript mode (no `any` types)

**Task 2: Zustand Dependency**
- Verified zustand@5.0.11 already installed from Story 1.1
- No additional installation needed

**Task 3: Zustand Store Structure**
- Created `src/stores/app-store.ts` with complete AppState interface
- Implemented all 6 store actions: addAnalysis, updateAnalysis, deleteAnalysis, duplicateAnalysis, setActiveAnalysis, updateGlobalParams
- All actions use immutable update patterns (spread operators)
- Default globalParams set correctly: detectionRate: 70, serviceCostPerPump: 2500

**Task 4: Selector Pattern Documentation**
- Added comprehensive JSDoc comments explaining selector pattern usage
- Documented correct vs incorrect usage patterns
- Linked to NFR-P1 performance requirement (<100ms calculations)

**Task 5: Barrel Exports**
- Created `src/stores/index.ts` barrel export
- All types already exported from `src/types/index.ts`

**Task 6: Path Aliases Verification**
- TypeScript compilation successful with no errors
- Vite build completed successfully (194.22 kB bundle)
- All `@/` imports working correctly

**Task 7: Comprehensive Testing**
- Created `src/stores/app-store.test.ts` with 18 test cases
- All tests passing (18/18) ✅
- Test coverage includes:
  - Initial state verification
  - All store actions (add, update, delete, duplicate, setActive)
  - Global parameters updates
  - Edge cases (non-existent IDs, partial updates, etc.)

**Acceptance Criteria Verification:**
- ✅ AC1: Import from @/stores/app-store works
- ✅ AC2: AppState interface includes analyses[], activeAnalysisId, globalParams
- ✅ AC3: Default globalParams set (detectionRate: 70, serviceCostPerPump: 2500)
- ✅ AC4: All TypeScript interfaces exported from @/types
- ✅ AC5: Store uses selector pattern (documented with examples)

**Build & Test Results:**
- TypeScript compilation: ✅ Success
- Vite build: ✅ Success (1.46s)
- Test suite: ✅ All 18 tests passed (7ms)

### File List

**New Files Created:**
- `src/types/index.ts` - Core TypeScript type definitions
- `src/stores/app-store.ts` - Zustand store implementation
- `src/stores/index.ts` - Store barrel exports
- `src/stores/app-store.test.ts` - Comprehensive store tests

**Total: 4 new files**

**Files Modified During Code Review:**
- `.gitignore` - Added nul and resources/ to exclusions
- `src/stores/app-store.ts` - Added input validation and error handling
- `src/stores/app-store.test.ts` - Added 10 new error case tests

**Total files affected: 7 (4 new + 3 modified)**

## Senior Developer Review (AI)

### Review Date
2026-02-05

### Review Outcome
✅ **Approve with Corrections Applied**

All HIGH and MEDIUM severity issues were automatically fixed during code review.

### Issues Found and Fixed

**🔴 HIGH Severity Issues (5 found, 5 fixed):**

1. **Missing Input Validation in Store Actions** - FIXED ✅
   - Added validation in `addAnalysis` for: duplicate IDs, negative values, out-of-range percentages
   - Added validation in `updateAnalysis` for: non-existent IDs, empty updates, invalid values
   - Added validation in `updateGlobalParams` for: out-of-range detection rates, negative costs

2. **setActiveAnalysis Accepts Non-Existent IDs** - FIXED ✅
   - Now validates ID exists in analyses array before setting
   - Supports `null` to explicitly clear active analysis

3. **Tests Missing Critical Error Cases** - FIXED ✅
   - Added 10 new tests for validation error paths
   - Total test count: 18 → 28 tests
   - All tests passing (28/28) ✅

4. **Architecture Violation: unsavedChanges Missing** - FIXED ✅
   - Added `unsavedChanges: boolean` to AppState interface
   - Initialized to `false` in store
   - Documented as reserved for future session persistence

5. **updateAnalysis Forces updatedAt Even if No Changes** - FIXED ✅
   - Now checks for empty updates object and returns no-op
   - Only updates timestamp when actual changes are made

**🟡 MEDIUM Severity Issues (4 found, 4 fixed):**

6. **No Protection Against Duplicate IDs** - FIXED ✅
   - `addAnalysis` now rejects analyses with duplicate IDs

7. **Git Junk Files Not Documented** - FIXED ✅
   - Added `nul` and `resources/` to `.gitignore`

8. **Tests Use crypto.randomUUID() Without Mock** - FIXED ✅
   - Replaced with fixed test IDs (`test-uuid-001`, `test-id-123`, etc.)
   - Tests are now deterministic and reproducible

9. **Performance: duplicateAnalysis Clones Entire Analysis** - DOCUMENTED ✅
   - Acceptable for Story 1.2 (NFR-P1 still met)
   - Flagged for monitoring in future stories if analyses grow large

**🟢 LOW Severity Issues (3 found, deferred):**

10. **Documentation: Missing TypeScript JSDoc for Interfaces** - Deferred to future stories
11. **Test beforeEach Uses setState Directly** - Acceptable pattern for test isolation
12. **Barrel Export Lacks Usage Documentation** - Minimal impact, deferred

### Test Results After Fixes

- **Before Review:** 18 tests passing
- **After Review:** 28 tests passing (+10 new tests)
- **Code Coverage:** All store actions now have error path tests
- **Build Status:** TypeScript compilation ✅ | Vite build ✅

### Code Quality Improvements

**Validation Added:**
- All numeric inputs validated (non-negative checks)
- Percentage bounds enforced (0-100)
- ID existence checks before operations
- Duplicate ID prevention

**Error Handling:**
- Graceful no-ops for invalid operations
- Console errors for debugging (non-throwing)
- State immutability preserved even on errors

**Architecture Compliance:**
- `unsavedChanges` field now present as specified
- Immutable update patterns maintained
- Selector pattern documentation preserved
