# Checklist: Adding a New Field to the Analysis Type

**Created:** 2026-02-18 (Epic 4.5 Retrospective)
**Reason:** 3/4 stories in Epic 4.5 had bugs from incomplete field propagation to consumers. This checklist is MANDATORY for any change to the `Analysis` interface in `src/types/index.ts`.

---

## When to Use This Checklist

Use this checklist whenever you:
- Add a new field to the `Analysis` interface
- Rename an existing field
- Change a field's type or semantics
- Remove a field from the `Analysis` interface

---

## Checklist

### 1. Type Definition
- [ ] Field added/modified in `src/types/index.ts` → `Analysis` interface
- [ ] Default value documented

### 2. Store (app-store.ts)
- [ ] Default value in `addAnalysis()`
- [ ] Field included in `duplicateAnalysis()` (verify spread copies it)
- [ ] localStorage migration — existing data without field gets default value
- [ ] `clearAllData()` — verify reset includes new default
- [ ] Store tests updated

### 3. Input Components
- [ ] Relevant input component created/updated (FocusMode.tsx)
- [ ] Conditional visibility correct (Planned vs. Unplanned if applicable)
- [ ] Validation rules applied
- [ ] Accessible labels (aria-label, aria-describedby)
- [ ] Component tests

### 4. Calculation Engine (calculations.ts)
- [ ] `calculateTotalFailureCost()` — if field affects failure cost
- [ ] `calculateStrategySavings()` — if field affects savings
- [ ] `calculatePlannedOverhaulSavings()` — if field affects planned mode
- [ ] `isAnalysisCalculable()` — if field affects calculability gate
- [ ] Calculation tests for new field scenarios

### 5. Results Display
- [ ] `ResultsPanel` — formula tooltip, breakdown labels
- [ ] `AnalysisCard` (Dashboard) — uses `calculateStrategySavings` (not direct calc)
- [ ] `MiniCard` (Sidebar) — uses `calculateStrategySavings` (not direct calc)

### 6. What-If / ComparisonView (CRITICAL — #1 blind spot)
- [ ] `computeMetrics()` — passes new field to calculation functions
- [ ] `handleReplaceOriginal()` — includes new field in update call
- [ ] `isXxxModified` — new field included in modification detection
- [ ] `ModifiedFieldHighlight` — wraps new field section
- [ ] Conditional field visibility (if Planned/Unplanned specific)
- [ ] ComparisonView tests

### 7. AnalysisSummary (What-If left panel)
- [ ] New field displayed in read-only summary (if user-facing)

### 8. Global Analysis
- [ ] `GlobalAnalysisView` — aggregation includes new field if applicable
- [ ] `ComparisonTable` — column added if relevant
- [ ] Global Analysis tests

### 9. PDF Export
- [ ] `generateCompletePDF()` — new field included in report if relevant
- [ ] PDF template sections updated
- [ ] PDF tests

### 10. Final Verification
- [ ] Full test suite passes (zero regressions)
- [ ] Grep for old field name (if rename) — zero remaining references
- [ ] Story file updated (Files Changed table complete)

---

## Historical Bugs Prevented by This Checklist

| Epic | Bug | Root Cause | Checklist Item |
|------|-----|-----------|----------------|
| 4.5 (Story 4.5.2) | AnalysisCard showed wrong ROI | Used `calculateTotalFailureCost` instead of `calculateStrategySavings` | #5 |
| 4.5 (Story 4.5.2) | MiniCard showed wrong savings | Same as above | #5 |
| 4.5 (Story 4.5.2) | What-If Replace lost `waferDefectEventsPerYear` | Field missing in `handleReplaceOriginal` | #6 |
| 4.5 (Story 4.5.2) | What-If didn't highlight wafer changes | `isWaferModified` missing new field | #6 |
| 7 (Story 7.1) | What-If bottleneck toggle no effect | `computeMetrics` missing `bottleneckMultiplier` | #6 |
| 7 (Story 7.1) | What-If Replace lost all strategy fields | `handleReplaceOriginal` missing 7 fields | #6 |
