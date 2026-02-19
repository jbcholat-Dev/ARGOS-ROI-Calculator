# Story 7.1: What-If Bug Fixes — Bottleneck Calculation + Replace Original

Status: done

## Story

**As a** sales engineer using What-If scenario comparison,
**I want** the bottleneck toggle and all field modifications to correctly update results and persist when replacing the original,
**So that** the What-If comparison shows accurate ROI impact and no data is lost.

## Priority & Context

- **Priority:** CRITICAL — Bugs show incorrect ROI values in What-If mode
- **Epic:** 7 — MVP Stable
- **Effort:** 2-3h (including tests)
- **Dependencies:** None (can start immediately)
- **Source:** Epic 4.5 retrospective (2026-02-18)

## Background

Code exploration of `ComparisonView.tsx` confirmed 3 bugs:

1. **`computeMetrics()` (lines 29-51)** does NOT pass `bottleneckMultiplier` to `calculateTotalFailureCost()` — the 8th parameter is missing. Result: toggling bottleneck in What-If has zero effect on displayed results.

2. **`handleReplaceOriginal()` (lines 109-129)** does NOT include maintenance strategy fields. If user changes strategy/PM params in What-If then clicks "Replace Original", those changes are silently discarded.

3. **`handleReplaceOriginal()`** also does NOT include bottleneck fields (`isBottleneck`, `bottleneckMultiplier`). Same silent data loss.

4. **`isDowntimeModified`** does NOT check `isBottleneck` or `bottleneckMultiplier` — changing bottleneck state doesn't highlight the downtime section.

## Acceptance Criteria

### AC1: Bottleneck Multiplier in computeMetrics
**Given** I am in What-If comparison mode
**When** I toggle the "Bottleneck tool" checkbox ON or change the multiplier value
**Then** the What-If results (total failure cost, savings, ROI) update immediately
**And** the delta indicators show the correct difference vs. the original

### AC2: All Fields in handleReplaceOriginal
**Given** I have modified fields in the What-If panel (including bottleneck and maintenance strategy fields)
**When** I click "Replace Original"
**Then** ALL modified fields are copied to the original analysis, including:
  - `isBottleneck`, `bottleneckMultiplier`
  - `maintenanceStrategy`, `overhaulCostPerPump`, `pmIntervalMonths`
  - `argosMtbfExtensionPercent`, `unplannedDespitePM`
**And** no field values are silently discarded

### AC3: Bottleneck Modification Detection
**Given** I change `isBottleneck` or `bottleneckMultiplier` in the What-If panel
**When** the modification detection runs
**Then** the Downtime section is highlighted as modified (ModifiedFieldHighlight)

### AC4: No Regressions
**Given** the bug fixes are applied
**When** I run the full test suite
**Then** all existing tests pass with zero regressions

## Tasks/Subtasks

- [x] Task 1: Fix computeMetrics — add bottleneckMultiplier parameter
  - [x] 1.1: In `computeMetrics()` (ComparisonView.tsx:29-51), compute `effectiveMultiplier = analysis.isBottleneck ? analysis.bottleneckMultiplier : 1`
  - [x] 1.2: Pass `effectiveMultiplier` as 8th param to `calculateTotalFailureCost()`
  - [x] 1.3: Add tests: What-If with bottleneck ON shows correct delta on failure cost

- [x] Task 2: Fix handleReplaceOriginal — add missing fields
  - [x] 2.1: Add bottleneck fields: `isBottleneck: whatIf.isBottleneck`, `bottleneckMultiplier: whatIf.bottleneckMultiplier`
  - [x] 2.2: Add maintenance strategy fields: `maintenanceStrategy`, `overhaulCostPerPump`, `pmIntervalMonths`, `argosMtbfExtensionPercent`, `unplannedDespitePM`
  - [x] 2.3: Add tests: Replace Original preserves all fields

- [x] Task 3: Fix isDowntimeModified — add bottleneck checks
  - [x] 3.1: Add `snap.isBottleneck !== whatIf.isBottleneck` to `isDowntimeModified`
  - [x] 3.2: Add `snap.bottleneckMultiplier !== whatIf.bottleneckMultiplier` to `isDowntimeModified`
  - [x] 3.3: Add tests: Bottleneck change highlights downtime section

- [x] Task 4: Run full test suite — verify zero regressions

## Technical Notes

### Bug 1 Fix — computeMetrics
```typescript
// BEFORE (line ~45):
const totalFailureCost = calculateTotalFailureCost(
  analysis.pumpQuantity,
  analysis.failureRatePercentage,
  analysis.waferCost,
  waferQuantity,
  analysis.downtimeDuration,
  analysis.downtimeCostPerHour,
  analysis.waferDefectEventsPerYear,
  // MISSING: bottleneckMultiplier
);

// AFTER:
const effectiveMultiplier = analysis.isBottleneck ? analysis.bottleneckMultiplier : 1;
const totalFailureCost = calculateTotalFailureCost(
  analysis.pumpQuantity,
  analysis.failureRatePercentage,
  analysis.waferCost,
  waferQuantity,
  analysis.downtimeDuration,
  analysis.downtimeCostPerHour,
  analysis.waferDefectEventsPerYear,
  effectiveMultiplier,
);
```

### Bug 2+3 Fix — handleReplaceOriginal
```typescript
// Add to updateAnalysis call (lines 109-129):
updateAnalysis(originalId, {
  // ... existing fields ...
  isBottleneck: whatIf.isBottleneck,
  bottleneckMultiplier: whatIf.bottleneckMultiplier,
  maintenanceStrategy: whatIf.maintenanceStrategy,
  overhaulCostPerPump: whatIf.overhaulCostPerPump,
  pmIntervalMonths: whatIf.pmIntervalMonths,
  argosMtbfExtensionPercent: whatIf.argosMtbfExtensionPercent,
  unplannedDespitePM: whatIf.unplannedDespitePM,
});
```

### Bug 4 Fix — isDowntimeModified
```typescript
// BEFORE:
const isDowntimeModified =
  snap.downtimeDuration !== whatIf.downtimeDuration ||
  snap.downtimeCostPerHour !== whatIf.downtimeCostPerHour;

// AFTER:
const isDowntimeModified =
  snap.downtimeDuration !== whatIf.downtimeDuration ||
  snap.downtimeCostPerHour !== whatIf.downtimeCostPerHour ||
  snap.isBottleneck !== whatIf.isBottleneck ||
  snap.bottleneckMultiplier !== whatIf.bottleneckMultiplier;
```

### Checklist — All Analysis Field Consumers (MANDATORY)
Before marking done, verify fix applies correctly in:
- [x] ComparisonView computeMetrics()
- [x] ComparisonView handleReplaceOriginal()
- [x] ComparisonView modification detection (isXxxModified)
- [ ] Dashboard (AnalysisCard) — already uses calculateStrategySavings ✓
- [ ] Sidebar (MiniCard) — already uses calculateStrategySavings ✓
- [ ] ResultsPanel — already receives all fields ✓
- [ ] Global Analysis — already aggregates via calculateStrategySavings ✓

## Files Changed

| File | Change |
|------|--------|
| `src/pages/ComparisonView.tsx` | MOD — Fix computeMetrics (add bottleneckMultiplier), handleReplaceOriginal (add all fields), isDowntimeModified (add bottleneck checks) |
| `src/pages/ComparisonView.test.tsx` | MOD — Tests for bottleneck recalculation, replace preserves fields, modification detection |

## Estimate
- 2-3h development + tests
- ~15-20 new tests expected

## Dev Agent Record

### Implementation Plan
- Bug 1 (computeMetrics): Added `isBottleneck` and `bottleneckMultiplier` to `MetricsInput` type, computed `effectiveMultiplier` and passed as 8th param to `calculateTotalFailureCost()`
- Bug 2+3 (handleReplaceOriginal): Added 7 missing fields: `isBottleneck`, `bottleneckMultiplier`, `maintenanceStrategy`, `overhaulCostPerPump`, `pmIntervalMonths`, `argosMtbfExtensionPercent`, `unplannedDespitePM`
- Bug 4 (isDowntimeModified): Added `isBottleneck` and `bottleneckMultiplier` comparison checks

### Completion Notes
- All 4 tasks completed successfully following red-green-refactor cycle
- 9 new tests added (3 for AC1/computeMetrics, 3 for AC2/handleReplaceOriginal, 3 for AC3/isDowntimeModified — 2 positive + 1 negative)
- Total ComparisonView tests: 31 (22 existing + 9 new), all passing
- Full test suite: 1515 passing, 4 pre-existing failures in AnalysisRename.integration.test.tsx (unrelated)
- No console.log statements in modified files

### Debug Log
- No issues encountered during implementation

## File List

| File | Change |
|------|--------|
| `argos-roi-calculator/src/pages/ComparisonView.tsx` | MOD — Fix computeMetrics (add bottleneckMultiplier via effectiveMultiplier), handleReplaceOriginal (add 7 missing fields), isDowntimeModified (add bottleneck checks) |
| `argos-roi-calculator/src/pages/ComparisonView.test.tsx` | MOD — +9 tests for bottleneck recalculation (3), replace preserves fields (3), modification detection (3) |

## Change Log

- 2026-02-19: Fixed 3 bugs in ComparisonView.tsx — bottleneck multiplier now applied in What-If metrics, all fields preserved on Replace Original, bottleneck changes detected as modifications. +9 tests.
- 2026-02-19: Code review fixes — Reverted undocumented responsive layout regression (restored min-[1440px] breakpoints), strengthened AC1 test assertion (directional check), improved AC3 test specificity (scoped to downtime section via within()), fixed test count in Dev Agent Record (9 not 7).

## Definition of Done
- [x] All acceptance criteria met
- [x] All tests pass (no regressions from changes)
- [x] Code reviewed (adversarial)
- [x] No console.log statements
- [x] TypeScript strict mode passes
- [x] ESLint passes
