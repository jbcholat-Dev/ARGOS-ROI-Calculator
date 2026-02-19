# Story 7.3: What-If Adaptive — Support Both Maintenance Strategies

Status: ready-for-dev

## Story

**As a** sales engineer using What-If to compare scenarios,
**I want** the What-If view to display the correct input fields based on the analysis's maintenance strategy,
**So that** I can compare Planned maintenance parameters (MTBF extension, PM interval) just like I compare Unplanned parameters.

## Priority & Context

- **Priority:** HIGH — What-If is the primary demo feature for hypothesis confrontation
- **Epic:** 7 — MVP Stable
- **Effort:** 4-5h (including tests)
- **Dependencies:** Story 7.1 (bug fixes), Story 7.2 (terminology + MTBF field)
- **Source:** Epic 4.5 retrospective — What-If doesn't show Planned mode fields

## Background

The What-If / ComparisonView was built in Epic 3 (Stories 3-10, 3-11) when only one calculation mode existed. Epic 4.5 introduced dual maintenance strategies (Unplanned / Planned) with different fields and calculations. The ComparisonView was never updated — it hardcodes Unplanned-mode fields only.

### Current State (broken for Planned)
The right panel (editable) shows:
- EquipmentInputs (always)
- FailureRateInput (always — wrong for Planned)
- DetectionRateInput (always — wrong for Planned)
- WaferInputs (always)
- DowntimeInputs (always)
- NO MaintenanceStrategySelector
- NO PlannedMaintenanceInputs
- NO OverhaulCostInput
- NO conditional visibility

### Target State
The right panel should mirror FocusMode conditional logic:
- MaintenanceStrategySelector (always — allows strategy comparison)
- EquipmentInputs (always)
- FailureRateInput (Unplanned only)
- PlannedMaintenanceInputs (Planned only)
- DetectionRateInput (Unplanned only)
- WaferInputs (always)
- DowntimeInputs (always)
- OverhaulCostInput (Planned only)

### computeMetrics Must Support Both Strategies
Currently `computeMetrics()` calls `calculateTotalFailureCost()` directly (Unplanned only). It must switch to `calculateStrategySavings()` which dispatches based on `maintenanceStrategy`.

## Acceptance Criteria

### AC1: MaintenanceStrategySelector in What-If
**Given** I am in What-If comparison mode
**When** I view the right (editable) panel
**Then** I see the MaintenanceStrategySelector at the top of the input fields
**And** I can switch between Unplanned and Planned strategies
**And** the fields below update accordingly

### AC2: Conditional Fields — Unplanned
**Given** the What-If analysis is in Unplanned mode
**When** I view the editable panel
**Then** I see: Equipment, Pump Removal Rate (renamed), Detection Rate, Wafer, Downtime (with Bottleneck)
**And** I do NOT see: PlannedMaintenanceInputs, OverhaulCostInput

### AC3: Conditional Fields — Planned
**Given** the What-If analysis is in Planned mode
**When** I view the editable panel
**Then** I see: Equipment, PlannedMaintenanceInputs (PM interval, MTBF extension, residual failures), Wafer, Downtime, OverhaulCostInput
**And** I do NOT see: FailureRateInput, DetectionRateInput

### AC4: Correct Calculation for Both Strategies
**Given** the What-If analysis uses either strategy
**When** results are computed
**Then** `computeMetrics()` uses `calculateStrategySavings()` (not `calculateTotalFailureCost()` directly)
**And** Planned mode shows: Total Maintenance Cost, Overhauls Saved, Interval Extension
**And** Unplanned mode shows: Total Failure Cost, Cost Avoided, Detection Rate Applied

### AC5: Delta Indicators for Planned Fields
**Given** I modify Planned-specific fields (PM interval, MTBF extension, overhaul cost)
**When** the deltas are calculated
**Then** DeltaIndicators correctly show the difference in savings and ROI
**And** the results section labels match the strategy (e.g., "Total Maintenance Cost" not "Total Failure Cost")

### AC6: Strategy Switch Comparison
**Given** the original analysis is Unplanned
**When** I switch the What-If to Planned mode
**Then** the comparison shows the ROI difference between strategies
**And** the left panel shows Unplanned results, right panel shows Planned results
**And** this is a valid and powerful comparison scenario

### AC7: Modification Detection for Planned Fields
**Given** I modify any Planned-specific field in the What-If
**When** the modification detection runs
**Then** the appropriate section is highlighted (ModifiedFieldHighlight)
**And** a new `isStrategyModified` flag detects strategy changes
**And** a new `isPlannedModified` flag detects PM interval, MTBF extension, overhaul cost changes

### AC8: Left Panel (AnalysisSummary) Strategy-Aware
**Given** the original analysis has a specific maintenance strategy
**When** I view the left (read-only) panel
**Then** AnalysisSummary shows strategy-appropriate information:
  - Unplanned: pump removal rate, detection rate, failure cost
  - Planned: PM interval, MTBF extension, overhaul count, maintenance cost

### AC9: No Regressions
**Given** the What-If enhancements
**When** I run the full test suite
**Then** all existing tests pass with zero regressions

## Tasks/Subtasks

- [ ] Task 1: Refactor computeMetrics to use calculateStrategySavings
  - [ ] 1.1: Replace direct `calculateTotalFailureCost()` call with `calculateStrategySavings()`
  - [ ] 1.2: Return strategy-aware metrics (different labels for Planned vs. Unplanned)
  - [ ] 1.3: Update DeltaIndicator usage for strategy-specific comparisons
  - [ ] 1.4: Tests for both strategies in computeMetrics

- [ ] Task 2: Add conditional fields to ComparisonView right panel
  - [ ] 2.1: Add `MaintenanceStrategySelector` at top of editable panel
  - [ ] 2.2: Add `const isPlanned = whatIf.maintenanceStrategy === 'planned'`
  - [ ] 2.3: Conditionally render `FailureRateInput` (Unplanned only)
  - [ ] 2.4: Conditionally render `PlannedMaintenanceInputs` (Planned only)
  - [ ] 2.5: Conditionally render `DetectionRateInput` (Unplanned only)
  - [ ] 2.6: Conditionally render `OverhaulCostInput` (Planned only)
  - [ ] 2.7: Tests for field visibility based on strategy

- [ ] Task 3: Add modification detection for new fields
  - [ ] 3.1: Add `isStrategyModified = snap.maintenanceStrategy !== whatIf.maintenanceStrategy`
  - [ ] 3.2: Add `isPlannedModified = snap.pmIntervalMonths !== whatIf.pmIntervalMonths || snap.argosMtbfExtensionPercent !== whatIf.argosMtbfExtensionPercent || snap.overhaulCostPerPump !== whatIf.overhaulCostPerPump || snap.unplannedDespitePM !== whatIf.unplannedDespitePM`
  - [ ] 3.3: Wrap PlannedMaintenanceInputs and OverhaulCostInput with ModifiedFieldHighlight
  - [ ] 3.4: Wrap MaintenanceStrategySelector with ModifiedFieldHighlight (if strategy changed)
  - [ ] 3.5: Tests for modification detection

- [ ] Task 4: Update AnalysisSummary for strategy awareness
  - [ ] 4.1: Show strategy-specific summary in left panel
  - [ ] 4.2: Planned: show PM interval, MTBF extension, overhaul count, maintenance cost
  - [ ] 4.3: Unplanned: show pump removal rate, detection rate, failure cost
  - [ ] 4.4: Tests

- [ ] Task 5: Update results section for strategy-specific labels
  - [ ] 5.1: Planned: "Total Maintenance Cost" instead of "Total Failure Cost"
  - [ ] 5.2: Planned: "Overhauls Saved" and "Interval Extension" metrics
  - [ ] 5.3: Ensure DeltaIndicators work correctly for both strategies
  - [ ] 5.4: Handle cross-strategy comparison (original Unplanned, What-If Planned)
  - [ ] 5.5: Tests

- [ ] Task 6: Full integration testing
  - [ ] 6.1: Test Unplanned → Unplanned What-If (existing flow, regression check)
  - [ ] 6.2: Test Planned → Planned What-If (new flow)
  - [ ] 6.3: Test Unplanned → Planned What-If (strategy switch)
  - [ ] 6.4: Test Planned → Unplanned What-If (reverse strategy switch)
  - [ ] 6.5: Test Replace Original preserves strategy changes
  - [ ] 6.6: Test Save Both with different strategies
  - [ ] 6.7: Test Discard cleans up correctly

## Technical Notes

### computeMetrics Refactor
```typescript
// BEFORE — Unplanned only:
function computeMetrics(analysis: MetricsInput, serviceCostPerPump: number, globalDetectionRate: number) {
  const totalFailureCost = calculateTotalFailureCost(...);
  const serviceCost = calculateArgosServiceCost(...);
  const savings = calculateSavings(totalFailureCost, serviceCost, detectionRate);
  const roi = calculateROI(savings, serviceCost);
  return { totalFailureCost, serviceCost, savings, roi };
}

// AFTER — Strategy-aware:
function computeMetrics(analysis: Analysis, globalParams: GlobalParams) {
  const { totalFailureCost, savings, argosServiceCost } = calculateStrategySavings(analysis, globalParams);
  const roi = argosServiceCost > 0 ? (savings / argosServiceCost) * 100 : 0;
  return { totalFailureCost, serviceCost: argosServiceCost, savings, roi };
}
```

### Conditional Field Pattern (mirrors FocusMode.tsx)
```typescript
const isPlanned = whatIf.maintenanceStrategy === 'planned';

// Right panel:
<MaintenanceStrategySelector analysisId={whatIfId} />
<EquipmentInputs analysisId={whatIfId} />
{!isPlanned && <FailureRateInput analysisId={whatIfId} />}
{isPlanned && <PlannedMaintenanceInputs analysisId={whatIfId} />}
{!isPlanned && <DetectionRateInput analysisId={whatIfId} />}
<WaferInputs analysisId={whatIfId} />
<DowntimeInputs analysisId={whatIfId} />
{isPlanned && <OverhaulCostInput analysisId={whatIfId} />}
```

### Cross-Strategy Comparison
When original is Unplanned and What-If is Planned (or vice versa):
- Metrics are calculated independently per strategy
- DeltaIndicators show the difference in final savings/ROI
- Labels may differ between panels — this is expected and valuable
- ResultsPanel left shows Unplanned labels, right shows Planned labels

### Mandatory Checklist — All Consumers
- [ ] ComparisonView (conditional fields, computeMetrics, modification detection)
- [ ] AnalysisSummary (strategy-aware display)
- [ ] ResultsPanel (strategy-specific labels — already handled by ResultsPanel internally)
- [ ] ModifiedFieldHighlight (new sections for strategy + planned fields)
- [ ] handleReplaceOriginal (all fields — done in Story 7.1)

## Files Changed

| File | Change |
|------|--------|
| `src/pages/ComparisonView.tsx` | MOD — Refactor computeMetrics, add conditional fields, new modification detection |
| `src/pages/ComparisonView.test.tsx` | MOD — Comprehensive tests for both strategies |
| `src/components/comparison/AnalysisSummary.tsx` | MOD — Strategy-aware summary |
| `src/components/comparison/AnalysisSummary.test.tsx` | MOD — Tests |

## Estimate
- 4-5h development + tests
- ~30-40 new tests expected
- Largest story in Epic 7

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All tests pass (no regressions)
- [ ] Code reviewed (adversarial)
- [ ] No console.log statements
- [ ] Both strategies fully functional in What-If
- [ ] Cross-strategy comparison works correctly
- [ ] TypeScript strict mode passes
- [ ] ESLint passes
