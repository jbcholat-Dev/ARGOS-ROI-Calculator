# Story 8.1: Single Payback Time Display

Status: done

## Story

**As a** sales engineer presenting ARGOS to a client,
**I want** to see the Payback Time displayed alongside the ROI in the results panel,
**So that** I can instantly tell the client how many months until their ARGOS investment pays for itself.

## Priority & Context

- **Priority:** URGENT — needed for client meeting today
- **Epic:** 8 — Payback Time
- **Effort:** 1-2h (calculation + display + tests)
- **Dependencies:** None (builds on existing ROI calculation infrastructure)

## Formula

```
grossAnnualSavings = totalFailureCost × (detectionRate / 100)           [unplanned mode]
                   = overhaulSavings + residualSavings                   [planned mode]

paybackTimeMonths = (argosServiceCost / grossAnnualSavings) × 12
```

Edge cases:
- `grossAnnualSavings <= 0` → return `null` (display "N/A")
- `argosServiceCost === 0` → return `0` (free service = instant payback)

## Acceptance Criteria

### AC1: Payback Calculation Function
**Given** valid `argosServiceCost` and `grossAnnualSavings` values
**When** `calculatePaybackTime()` is called
**Then** it returns the payback time in months as a number
**And** returns `null` when gross savings are zero or negative

### AC2: Payback Display in ResultsPanel
**Given** I am viewing an analysis with complete data in Focus Mode
**When** the results panel renders
**Then** I see a "Payback Time" card displayed after the ROI card
**And** it shows the value formatted as "X.X months" (or "X.X years" if >= 24 months)
**And** it has a formula tooltip explaining the calculation

### AC3: Color Coding
**Given** the payback time is calculated
**When** displayed in the results panel
**Then** payback <= 6 months shows green (fast payback)
**And** payback 6-12 months shows orange (moderate)
**And** payback > 12 months shows red (slow payback)
**And** N/A shows gray (no payback possible)

### AC4: Both Maintenance Strategies
**Given** an analysis using either 'unplanned' or 'planned' maintenance strategy
**When** the payback time is calculated
**Then** it correctly uses the gross savings appropriate to the strategy

### AC5: No Regressions
**Given** the new payback feature is added
**When** the full test suite runs
**Then** all existing tests pass with zero regressions

## Tasks/Subtasks

- [x] Task 1: Add `calculatePaybackTime()` function to `calculations.ts`
- [x] Task 2: Add `formatPaybackValue()` display formatter to `ResultsPanel.tsx`
- [x] Task 3: Add Payback Time card to `ResultsPanel.tsx` after ROI card
- [x] Task 4: Add payback formula to FORMULAS constants
- [x] Task 5: Add `getPaybackColorClass()` color coding function
- [x] Task 6: Unit tests for `calculatePaybackTime()` (11 tests)
- [x] Task 7: Unit tests for `getPaybackColorClass()` (5 tests)
- [x] Task 8: Update existing ResultsPanel tests (heading count 4→5, placeholder count 4→5)

## Dev Notes

### Files to Modify
- `src/lib/calculations.ts` — Add `calculatePaybackTime()`, export it
- `src/components/analysis/ResultsPanel.tsx` — Add payback card + formatter + color
- `src/lib/calculations.test.ts` — Add payback calculation tests

### Display Format
- < 1 month: "< 1 month"
- 1-23.9 months: "X.X months"
- >= 24 months: "X.X years"
- N/A (negative/zero savings): "N/A"

### Color Thresholds
- Green (`text-green-600`): <= 6 months
- Orange (`text-orange-500`): 6-12 months
- Red (`text-red-600`): > 12 months

### Integration Point
`calculateStrategySavings()` returns `{ totalFailureCost, savings, argosServiceCost }`.
- `savings` = net savings (gross - service cost)
- `grossSavings` = `savings + argosServiceCost`
- Pass `argosServiceCost` and `grossSavings` to `calculatePaybackTime()`
