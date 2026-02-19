# Story 7.1: What-If Bug Fixes — Bottleneck Calculation + Replace Original

Status: ready-for-dev

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

- [ ] Task 1: Fix computeMetrics — add bottleneckMultiplier parameter
  - [ ] 1.1: In `computeMetrics()` (ComparisonView.tsx:29-51), compute `effectiveMultiplier = analysis.isBottleneck ? analysis.bottleneckMultiplier : 1`
  - [ ] 1.2: Pass `effectiveMultiplier` as 8th param to `calculateTotalFailureCost()`
  - [ ] 1.3: Add tests: What-If with bottleneck ON shows correct delta on failure cost

- [ ] Task 2: Fix handleReplaceOriginal — add missing fields
  - [ ] 2.1: Add bottleneck fields: `isBottleneck: whatIf.isBottleneck`, `bottleneckMultiplier: whatIf.bottleneckMultiplier`
  - [ ] 2.2: Add maintenance strategy fields: `maintenanceStrategy`, `overhaulCostPerPump`, `pmIntervalMonths`, `argosMtbfExtensionPercent`, `unplannedDespitePM`
  - [ ] 2.3: Add tests: Replace Original preserves all fields

- [ ] Task 3: Fix isDowntimeModified — add bottleneck checks
  - [ ] 3.1: Add `snap.isBottleneck !== whatIf.isBottleneck` to `isDowntimeModified`
  - [ ] 3.2: Add `snap.bottleneckMultiplier !== whatIf.bottleneckMultiplier` to `isDowntimeModified`
  - [ ] 3.3: Add tests: Bottleneck change highlights downtime section

- [ ] Task 4: Run full test suite — verify zero regressions

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

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All tests pass (no regressions)
- [ ] Code reviewed (adversarial)
- [ ] No console.log statements
- [ ] TypeScript strict mode passes
- [ ] ESLint passes
