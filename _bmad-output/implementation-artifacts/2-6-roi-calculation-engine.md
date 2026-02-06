# Story 2.6: ROI Calculation Engine

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

**As a** developer,
**I want** pure calculation functions that compute ROI metrics,
**So that** results are accurate, testable, and perform under 100ms.

## Acceptance Criteria

**Given** valid analysis inputs in the store
**When** calculateTotalFailureCost is called
**Then** it returns: (pumpQuantity * failureRate/100) * (waferCost * wafersPerBatch + downtimeHours * downtimeCostPerHour)
**When** calculateArgosServiceCost is called
**Then** it returns: pumpQuantity * globalParams.serviceCostPerPump
**When** calculateSavings is called
**Then** it returns: totalFailureCost * globalParams.detectionRate/100 - argosServiceCost
**When** calculateROI is called
**Then** it returns: (savings / argosServiceCost) * 100
**And** all calculations complete within 100ms (NFR-P1)
**And** functions are pure (no side effects)
**And** functions are exported from @/lib/calculations.ts

**FRs Covered:** FR20, FR21, FR22, FR23
**NFRs Addressed:** NFR-P1 (<100ms calculations)

## Tasks / Subtasks

### Task 1: Create Pure Calculation Functions (AC: 1, 2, 3, 4)
- [ ] Create `src/lib/calculations.ts`
  - Export named function `calculateTotalFailureCost`
    - Parameters: `pumpQuantity: number, failureRate: number, waferCost: number, wafersPerBatch: number, downtimeHours: number, downtimeCostPerHour: number`
    - Return type: `number`
    - Formula: `(pumpQuantity * failureRate/100) * (waferCost * wafersPerBatch + downtimeHours * downtimeCostPerHour)`
    - Represents: Total cost of pump failures without ARGOS
  - Export named function `calculateArgosServiceCost`
    - Parameters: `pumpQuantity: number, serviceCostPerPump: number`
    - Return type: `number`
    - Formula: `pumpQuantity * serviceCostPerPump`
    - Represents: Annual ARGOS service cost
  - Export named function `calculateSavings`
    - Parameters: `totalFailureCost: number, argosServiceCost: number, detectionRate: number`
    - Return type: `number`
    - Formula: `totalFailureCost * detectionRate/100 - argosServiceCost`
    - Represents: Net savings (avoided costs minus service cost)
  - Export named function `calculateROI`
    - Parameters: `savings: number, argosServiceCost: number`
    - Return type: `number`
    - Formula: `(savings / argosServiceCost) * 100`
    - Represents: ROI percentage
    - Handle edge case: if argosServiceCost is 0, return 0
  - All functions must be pure (no external dependencies, no side effects)
  - Add JSDoc comments for each function with parameter descriptions
- [ ] Create `src/lib/calculations.test.ts`
  - Test calculateTotalFailureCost with valid inputs
  - Test calculateTotalFailureCost with zero values
  - Test calculateTotalFailureCost with edge cases (large numbers)
  - Test calculateArgosServiceCost with valid inputs
  - Test calculateArgosServiceCost with zero pumps
  - Test calculateSavings with positive result
  - Test calculateSavings with negative result (service cost > avoided costs)
  - Test calculateROI with positive savings
  - Test calculateROI with negative savings
  - Test calculateROI with zero service cost (edge case)
  - Test all functions are pure (same inputs = same outputs)
  - Minimum 15 tests

### Task 2: Port V9 Calculation Logic (AC: 1, 2, 3, 4)
- [ ] Review V9 calculation formulas in `calculateur-argos/src/components/PredictiveMaintenanceROICalculator.jsx` (lines 405-424)
  - V9 formula for avoided failures: `failedPumps * (detectionPercentage / 100)`
  - V9 formula for savings: `avoidedFailures * costPerFailure`
  - V9 formula for ROI: `((savings - totalCostForArgos) / totalCostForArgos) * 100`
- [ ] Verify V10 formulas match V9 business logic
  - Total failure cost = V9 `totalCostPerFailure`
  - ARGOS service cost = V9 `totalCostForArgos`
  - Savings calculation matches V9 logic (detection rate applied to avoided costs)
  - ROI calculation matches V9 formula structure
- [ ] Document any deviations from V9 in code comments
  - V10 simplification: Single analysis instead of 3 segments (Regular/Bottleneck/Batch)
  - V10 enhancement: Per-process granularity instead of distribution percentages

### Task 3: Performance Benchmarking (AC: 5)
- [ ] Create `src/lib/calculations.bench.test.ts` (optional benchmark suite)
  - Measure execution time for each calculation function
  - Test with 1,000 iterations to average timing
  - Verify all calculations complete <100ms (NFR-P1)
  - Target: <1ms per calculation (100x faster than requirement)
- [ ] Add performance assertions to unit tests
  - Use `performance.now()` before/after calculation
  - Assert duration < 100ms
  - Add to at least 3 unit tests

### Task 4: TypeScript Type Definitions (AC: All)
- [ ] Update `src/types/index.ts` (if calculation types needed)
  - Add `CalculationInputs` interface (optional, for documentation)
  - Add `CalculationResults` interface (optional, for Story 2.7 integration)
- [ ] Ensure all calculation functions have strict TypeScript types
  - No `any` types
  - Explicit parameter types
  - Explicit return types
  - Enable strict null checks

### Task 5: Edge Case Handling and Validation (AC: 5)
- [ ] Add input validation guards to calculation functions
  - Check for negative numbers (return 0 or throw error)
  - Check for NaN values (return 0 or throw error)
  - Check for Infinity values (return 0 or throw error)
  - Handle division by zero gracefully in calculateROI
- [ ] Create comprehensive edge case tests
  - Test with negative inputs
  - Test with zero inputs
  - Test with very large numbers (overflow scenarios)
  - Test with very small numbers (precision scenarios)
  - Test with NaN inputs
  - Test with Infinity inputs
  - Minimum 10 edge case tests

### Task 6: ROI Color Coding Utility (Bonus - for Story 2.7)
- [ ] Create `getROIColorClass` utility function in `src/lib/calculations.ts`
  - Parameters: `roi: number`
  - Return type: `string` (Tailwind class name)
  - Logic:
    - `roi < 0` → return `'text-red-600'` (red for negative ROI)
    - `roi >= 0 && roi < 15` → return `'text-orange-500'` (orange for low ROI)
    - `roi >= 15` → return `'text-green-600'` (green for good ROI)
  - Add JSDoc comment explaining thresholds
- [ ] Test ROI color coding function
  - Test negative ROI returns red class
  - Test zero ROI returns orange class
  - Test 10% ROI returns orange class
  - Test 15% ROI returns green class
  - Test 50% ROI returns green class
  - Minimum 5 tests

### Task 7: Formula Documentation (AC: All)
- [ ] Add comprehensive JSDoc comments to all calculation functions
  - Include formula in LaTeX-style notation (as comment)
  - Include example input/output
  - Include business context (what this represents)
- [ ] Create calculation reference document (optional)
  - Document in `src/lib/calculations.md` or inline comments
  - Explain V9 → V10 formula migration
  - Include worked example with sample data

## Dev Notes

### V9 to V10 Formula Migration

**V9 Architecture (3 Segments):**
V9 calculated ROI for 3 equipment segments (Regular, Bottleneck, Batch) with distribution percentages:
```javascript
const calculateSegmentROI = (distributionPercent, failureRate, costPerFailure) => {
  const distribution = distributionPercent / 100;
  const pumpsInSegment = totalPumps * distribution;
  const failedPumps = pumpsInSegment * (failureRate / 100);
  const totalCostPerFailure = failedPumps * costPerFailure;
  const totalCostForArgos = pumpsInSegment * argosPricePerPump;
  const avoidedFailures = failedPumps * (detectionPercentage / 100);
  const savings = avoidedFailures * costPerFailure;
  const roi = ((savings - totalCostForArgos) / totalCostForArgos) * 100;
  return { totalCostPerFailure, totalCostForArgos, savings, roi };
};
```

**V10 Architecture (Per-Process Granularity):**
V10 calculates ROI for individual processes (user-defined), not predefined segments:
- User creates multiple analyses (e.g., "Poly Etch - Chamber 04")
- Each analysis has its own pump quantity, failure rate, wafer cost, downtime cost
- No distribution percentages needed (each analysis is 100% of its scope)

**Formula Mapping:**
| V9 Variable | V10 Equivalent | Notes |
|-------------|----------------|-------|
| `totalCostPerFailure` | `calculateTotalFailureCost()` | V10 adds wafer + downtime costs |
| `totalCostForArgos` | `calculateArgosServiceCost()` | Same formula |
| `savings` | `calculateSavings()` | V10 subtracts service cost in savings calc |
| `roi` | `calculateROI()` | V10 simplifies to `(savings / serviceCost) * 100` |

**Key Differences:**
1. **V10 adds wafer + downtime granularity**: V9 used generic "cost per failure". V10 calculates from wafer cost, batch size, and downtime.
2. **V10 savings formula includes service cost**: V9 calculated `savings = avoidedFailures * costPerFailure`, then ROI separately. V10 integrates service cost into savings: `savings = avoidedCost - serviceCost`.
3. **V10 ROI formula simplifies**: V9: `((savings - serviceCost) / serviceCost) * 100`. V10: `(savings / serviceCost) * 100` (savings already net of service cost).

### Architecture Patterns from Epic 1

**Pure Function Standards:**
- No imports from Zustand store or React hooks
- No side effects (console.log, API calls, state mutations)
- Deterministic (same inputs always produce same outputs)
- Testable in isolation (no mocking required)
- Located in `src/lib/` directory (not `src/components/`)

**File Organization:**
```
src/lib/
├── calculations.ts       # Pure calculation functions
├── calculations.test.ts  # Unit tests
└── calculations.bench.test.ts  # Performance benchmarks (optional)
```

**TypeScript Patterns:**
- Explicit parameter types (no implicit `any`)
- Explicit return types (for documentation and type safety)
- Strict null checks enabled
- JSDoc comments for all exported functions

**Testing Patterns:**
- Test normal cases (typical client data)
- Test edge cases (zero, negative, very large numbers)
- Test pure function behavior (same inputs = same outputs)
- Test performance (<100ms requirement)
- Use descriptive test names: `it('should calculate total failure cost with valid inputs')`

### Performance Requirements (NFR-P1)

**Target: <100ms per calculation**

**Expected Performance:**
- Individual calculation functions: <1ms each (pure math operations)
- All 4 calculations in sequence: <5ms total
- Real-time recalculation on input change: <10ms (including React re-render)

**Performance Testing Strategy:**
```typescript
it('should complete calculation within 100ms (NFR-P1)', () => {
  const start = performance.now();
  const result = calculateTotalFailureCost(100, 10, 8000, 125, 6, 500);
  const duration = performance.now() - start;
  expect(duration).toBeLessThan(100);
  expect(result).toBeGreaterThan(0);
});
```

**Optimization Notes:**
- No async operations (all synchronous math)
- No external dependencies (no library imports)
- No memoization needed (calculations are already instant)
- Zustand will handle memoization at store level (Story 2.7)

### Calculation Formulas (Detailed)

**1. Total Failure Cost (Without ARGOS)**
```typescript
calculateTotalFailureCost(
  pumpQuantity: number,      // e.g., 10 pumps
  failureRate: number,       // e.g., 10% per year
  waferCost: number,         // e.g., €8,000 per wafer
  wafersPerBatch: number,    // e.g., 125 wafers (for batch tools)
  downtimeHours: number,     // e.g., 6 hours per failure
  downtimeCostPerHour: number // e.g., €500/hour
): number

Formula:
totalFailureCost = (pumpQuantity × failureRate/100) × (waferCost × wafersPerBatch + downtimeHours × downtimeCostPerHour)

Example:
- 10 pumps × 10% failure rate = 1 failure/year
- 1 failure × (€8,000 × 125 wafers + 6 hours × €500/hour)
- 1 failure × (€1,000,000 + €3,000)
- Total: €1,003,000/year
```

**2. ARGOS Service Cost**
```typescript
calculateArgosServiceCost(
  pumpQuantity: number,      // e.g., 10 pumps
  serviceCostPerPump: number // e.g., €2,500/pump/year (global param)
): number

Formula:
argosServiceCost = pumpQuantity × serviceCostPerPump

Example:
- 10 pumps × €2,500/pump/year
- Total: €25,000/year
```

**3. Savings (Avoided Costs - Service Cost)**
```typescript
calculateSavings(
  totalFailureCost: number,  // from calculateTotalFailureCost
  argosServiceCost: number,  // from calculateArgosServiceCost
  detectionRate: number      // e.g., 70% (global param)
): number

Formula:
savings = totalFailureCost × detectionRate/100 - argosServiceCost

Example:
- €1,003,000 × 70% detection = €702,100 avoided costs
- €702,100 - €25,000 service cost
- Total: €677,100/year net savings
```

**4. ROI Percentage**
```typescript
calculateROI(
  savings: number,           // from calculateSavings
  argosServiceCost: number   // from calculateArgosServiceCost
): number

Formula:
roi = (savings / argosServiceCost) × 100

Example:
- €677,100 savings / €25,000 service cost × 100
- Total: 2,708% ROI

Edge Case:
- If argosServiceCost === 0, return 0 (avoid division by zero)
```

### ROI Color Coding (For Story 2.7 Integration)

**Traffic Light System:**
- **Red (< 0%)**: Negative ROI — ARGOS costs more than it saves
- **Orange (0-15%)**: Low ROI — Marginal business case
- **Green (>= 15%)**: Good ROI — Strong business case

**Implementation:**
```typescript
export const getROIColorClass = (roi: number): string => {
  if (roi < 0) return 'text-red-600';
  if (roi < 15) return 'text-orange-500';
  return 'text-green-600';
};
```

**Business Context:**
- 15% threshold based on typical semiconductor fab ROI expectations
- Color coding provides instant visual feedback during live client meetings
- Matches V9 behavior (maintains continuity for JB)

### Testing Requirements

**Unit Test Coverage:**
- 15 tests for core calculation functions
- 10 tests for edge cases (negative, zero, NaN, Infinity)
- 5 tests for ROI color coding utility
- 3 tests for performance benchmarks
- **Total: 33 tests minimum**

**Testing Strategy:**
- Test each function independently (unit tests)
- Test integration scenarios (all 4 calculations in sequence)
- Test edge cases (zero, negative, very large numbers)
- Test performance (NFR-P1 <100ms requirement)
- Test pure function behavior (determinism)

**Sample Test Cases:**
```typescript
describe('calculateTotalFailureCost', () => {
  it('should calculate correctly with valid inputs', () => {
    const result = calculateTotalFailureCost(10, 10, 8000, 125, 6, 500);
    expect(result).toBe(1_003_000);
  });

  it('should return 0 when pump quantity is 0', () => {
    const result = calculateTotalFailureCost(0, 10, 8000, 125, 6, 500);
    expect(result).toBe(0);
  });

  it('should return 0 when failure rate is 0', () => {
    const result = calculateTotalFailureCost(10, 0, 8000, 125, 6, 500);
    expect(result).toBe(0);
  });

  it('should handle very large numbers without overflow', () => {
    const result = calculateTotalFailureCost(1000, 50, 100000, 500, 24, 10000);
    expect(result).toBeGreaterThan(0);
    expect(Number.isFinite(result)).toBe(true);
  });

  it('should complete within 100ms (NFR-P1)', () => {
    const start = performance.now();
    calculateTotalFailureCost(10, 10, 8000, 125, 6, 500);
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100);
  });
});
```

### Dependencies

**No New Dependencies Required**

This story uses only built-in JavaScript/TypeScript features:
- Pure math operations (`*`, `/`, `+`, `-`)
- TypeScript type system (already configured)
- Vitest + React Testing Library (already configured)

**Story is INDEPENDENT - Can Run in PARALLEL with Story 2.1**

### File Structure Requirements

**New Files to Create:**
```
src/lib/
├── calculations.ts                 # Pure calculation functions
├── calculations.test.ts            # Unit tests
└── calculations.bench.test.ts      # Performance benchmarks (optional)
```

**No Files to Modify**

**Naming Conventions:**
- camelCase for functions: `calculateTotalFailureCost`, `calculateROI`
- Named exports only (no default exports)
- TypeScript `.ts` extension (not `.tsx` - no React components)

### Integration with Story 2.7 (Results Panel)

**Story 2.7 will consume these functions:**
```typescript
import {
  calculateTotalFailureCost,
  calculateArgosServiceCost,
  calculateSavings,
  calculateROI,
  getROIColorClass
} from '@/lib/calculations';

// In ResultsPanel component
const analysis = useAppStore(state => state.analyses.find(a => a.id === activeAnalysisId));
const globalParams = useAppStore(state => state.globalParams);

const totalFailureCost = calculateTotalFailureCost(
  analysis.pumpQuantity,
  analysis.failureRatePercentage,
  analysis.waferCost,
  analysis.waferQuantity, // wafersPerBatch
  analysis.downtimeDuration,
  analysis.downtimeCostPerHour
);

const argosServiceCost = calculateArgosServiceCost(
  analysis.pumpQuantity,
  globalParams.serviceCostPerPump
);

const savings = calculateSavings(
  totalFailureCost,
  argosServiceCost,
  globalParams.detectionRate
);

const roi = calculateROI(savings, argosServiceCost);
const roiColorClass = getROIColorClass(roi);
```

**Story 2.6 BLOCKS Story 2.7** — Results Panel cannot display calculations until this story is complete.

### Blocking Dependencies

**Story 2.6 BLOCKS:**
- Story 2.7: Results Panel with Real-Time Display (needs calculation functions)

**Story 2.6 DEPENDS ON:**
- None (completely independent - can start immediately)

**Story 2.6 is P0 priority and can be developed in PARALLEL with Story 2.1**

### Git Intelligence

**Recent Commit Patterns:**
- Story completion commits: "Complete Story X.Y: [Title]"
- Epic 1 established pattern of co-located tests (component.tsx + component.test.tsx)
- All commits include co-authored-by attribution

**Expected Commit for Story 2.6:**
```
Complete Story 2.6: ROI Calculation Engine

- Add pure calculation functions (calculateTotalFailureCost, calculateArgosServiceCost, calculateSavings, calculateROI)
- Port V9 calculation formulas to V10 with per-process granularity
- Add ROI color coding utility (getROIColorClass)
- Create comprehensive unit tests (33 tests, 100% passing)
- Add performance benchmarks (all calculations <1ms, well under 100ms NFR-P1)
- Add edge case handling (zero, negative, NaN, Infinity)
- Export all functions from @/lib/calculations

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

**Files Expected in Commit:**
- New: `src/lib/calculations.ts`
- New: `src/lib/calculations.test.ts`
- Optional: `src/lib/calculations.bench.test.ts`

### V9 Reference Code Locations

**V9 Calculation Logic:**
- File: `calculateur-argos/src/components/PredictiveMaintenanceROICalculator.jsx`
- Lines: 405-424 (calculateSegmentROI function)
- Lines: 426-435 (useMemo for 3 segments)

**V9 ROI Color Coding:**
- File: `calculateur-argos/README.md`
- Section: "ROI Color Coding"
- Rules: Red (negative), Orange (0-15%), Green (>15%)

**V9 Default Values:**
- Detection rate: 70% (line 90 in README.md)
- Service cost per pump: €2,500 (line 90 in README.md)

### References

**Source Documents:**
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 2 - Story 2.6]
- [Source: _bmad-output/planning-artifacts/prd.md#FR20, FR21, FR22, FR23]
- [Source: _bmad-output/planning-artifacts/architecture.md#Performance Requirements - NFR-P1]
- [Source: calculateur-argos/src/components/PredictiveMaintenanceROICalculator.jsx#lines 405-424]
- [Source: calculateur-argos/README.md#ROI Color Coding]

**External Resources:**
- TypeScript Pure Functions: https://www.typescriptlang.org/docs/handbook/2/functions.html
- Performance.now() API: https://developer.mozilla.org/en-US/docs/Web/API/Performance/now
- Vitest Testing: https://vitest.dev/guide/

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

No debug issues encountered. All 7 tasks completed in single pass.

### Completion Notes List

- Implemented 4 core calculation functions + 1 color utility in `src/lib/calculations.ts`
- Ported V9 formulas from `calculateur-argos/src/components/PredictiveMaintenanceROICalculator.jsx` (lines 405-424)
- V10 simplification: per-process granularity instead of 3 fixed segments
- 57 tests written (exceeds 33 minimum): 27 core, 20 edge cases (incl. percentage overflow), 4 determinism, 3 integration, 3 performance
- All calculations complete in <1ms (well under 100ms NFR-P1 requirement)
- Code review: 10 issues found (3 HIGH, 5 MEDIUM, 2 LOW), all HIGH + MEDIUM fixed:
  - HIGH #1: Added CalculationResult interface mapping documentation
  - HIGH #2: Added `isValidPercentage()` validator for failureRate and detectionRate (0-100 range)
  - HIGH #3: Added 3 tests for percentage > 100% edge cases
  - MEDIUM #4: Added `isFiniteNumber()` helper for clarity in calculateROI (negative savings allowed)
  - MEDIUM #5: Added V9 deviation documentation in calculateROI JSDoc
  - MEDIUM #6: Covered by HIGH #3 fix
  - MEDIUM #7: Downgraded to LOW (constants usage correct as-is)
  - MEDIUM #8: Benchmark file optional per story, performance tests in main suite
- Final test count: 248 total (191 existing + 57 new), 15 test files, zero regressions

### File List

- NEW: `argos-roi-calculator/src/lib/calculations.ts` — Pure calculation functions (5 exports)
- NEW: `argos-roi-calculator/src/lib/calculations.test.ts` — 57 unit tests
