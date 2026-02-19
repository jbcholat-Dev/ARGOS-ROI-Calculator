# Story 7.2: Unplanned Mode Terminology Revision & MTBF Field

Status: ready-for-dev

## Story

**As a** sales engineer presenting to a client like GlobalFoundries,
**I want** the Unplanned mode to use correct operational terminology and include MTBF,
**So that** the tool matches real client vocabulary and captures the full maintenance picture.

## Priority & Context

- **Priority:** HIGH — Terminology affects ROI credibility during demos
- **Epic:** 7 — MVP Stable
- **Effort:** 3-4h (including tests)
- **Dependencies:** None (can be developed in parallel with 7.1)
- **Source:** Epic 4.5 retrospective — JB feedback from GlobalFoundries workflow

## Background

During the Epic 4.5 retrospective, JB identified that the Unplanned mode terminology doesn't match real client vocabulary:

- **"Failure rate"** implies only catastrophic failures. Reality: pumps are removed for multiple reasons — Run-to-Fail (actual failure) AND Opportunistic PM (technician hears noise, vibration, etc.). Correct term: **"Pump removal rate"** (taux de retrait des pompes).
- **"Duration per failure"** → **"Duration per event"** — an event is any removal (failure or preventive), and downtime applies to both.
- **"Overhaul cost"** is not used in Unplanned ROI calculation — the pump gets overhauled regardless of ARGOS. Remove from Unplanned mode to avoid confusion.
- **MTBF** (Mean Time Between Failures/removals) needs to be added — in Unplanned mode there's no fixed PM interval, so MTBF characterizes pump lifetime.

### Value Proposition (unchanged)
- **Unplanned situation:** Run-to-fail + Opportunistic PM
- **ARGOS value:** Anticipate Failure

## Acceptance Criteria

### AC1: Rename "Failure Rate" Labels
**Given** I am in Unplanned mode (any view: FocusMode, What-If, Global Analysis)
**When** I see the failure rate input section
**Then** all labels read "Pump removal rate" (not "Failure rate")
**And** the percentage mode label reads "Pump removal rate (%)"
**And** the absolute mode label reads "Pumps removed (last year)"
**And** tooltip/help text reflects the new terminology

### AC2: Rename "Duration per Failure" Label
**Given** I am in any view showing downtime fields
**When** I see the downtime duration input
**Then** the label reads "Duration per event (hours)" (not "Duration per failure")

### AC3: Hide Overhaul Cost in Unplanned Mode
**Given** I am in Unplanned maintenance mode
**When** I view the input panel in FocusMode
**Then** the "Overhaul cost per pump" field is NOT visible
**And** switching to Planned mode shows the overhaul cost field

### AC4: Add MTBF Field to Unplanned Mode
**Given** I am in Unplanned maintenance mode
**When** I view the input panel
**Then** I see a new field "MTBF (months)" in the equipment or failure rate section
**And** the field accepts positive numbers (min 1)
**And** it defaults to 0 for new analyses (user must enter their value)
**And** it is informational for now (stored but not used in calculation)

### AC5: Backward Compatibility
**Given** existing analyses without the MTBF field
**When** they load
**Then** MTBF defaults to 0
**And** no crash or error occurs

### AC6: ComparisonView / What-If Updated
**Given** the terminology changes
**When** I view the What-If comparison
**Then** the original panel (left) uses new labels
**And** the editable panel (right) uses new labels
**And** the AnalysisSummary component reflects new terminology

### AC7: Global Analysis / ComparisonTable Updated
**Given** the terminology changes
**When** I view the Global Analysis or Comparison Table
**Then** all column headers and labels use new terminology

### AC8: Accessibility
**Given** all renamed fields
**When** I interact via keyboard or screen reader
**Then** aria-labels match new terminology
**And** no accessibility regression

## Tasks/Subtasks

- [ ] Task 1: Update types
  - [ ] 1.1: Add `mtbf: number` to `Analysis` interface (default: 0)
  - [ ] 1.2: No rename of internal variable names needed — `failureRatePercentage` stays (internal, not user-facing)

- [ ] Task 2: Update store
  - [ ] 2.1: Add `mtbf: 0` default in `addAnalysis`
  - [ ] 2.2: Add `mtbf` to `duplicateAnalysis` (automatic via spread, but verify)
  - [ ] 2.3: Add `mtbf` to localStorage migration (default 0 for existing data)

- [ ] Task 3: Rename FailureRateInput labels
  - [ ] 3.1: Change "Failure rate (%)" → "Pump removal rate (%)"
  - [ ] 3.2: Change "Number of failures (last year)" → "Pumps removed (last year)"
  - [ ] 3.3: Update any tooltip or help text
  - [ ] 3.4: Update tests (label selectors)

- [ ] Task 4: Rename DowntimeInputs label
  - [ ] 4.1: Change "Duration per failure (hours)" → "Duration per event (hours)"
  - [ ] 4.2: Update tests

- [ ] Task 5: Conditional Overhaul Cost visibility
  - [ ] 5.1: In FocusMode.tsx, wrap `<OverhaulCostInput>` with `{isPlanned && ...}`
  - [ ] 5.2: Update FocusMode tests for conditional visibility
  - [ ] 5.3: Verify Global Analysis and ComparisonView don't reference overhaul cost for unplanned analyses

- [ ] Task 6: Add MTBF field
  - [ ] 6.1: Add MTBF numeric input to equipment or failure rate section (Unplanned only)
  - [ ] 6.2: Validation: positive number, min 1, placeholder "ex: 18"
  - [ ] 6.3: Store in Analysis, persist to localStorage
  - [ ] 6.4: Informational only — not used in calculation yet (add comment)
  - [ ] 6.5: Component tests

- [ ] Task 7: Update ComparisonView / AnalysisSummary
  - [ ] 7.1: Verify AnalysisSummary uses new labels
  - [ ] 7.2: Add `mtbf` to `handleReplaceOriginal` field list (if not done in 7.1)
  - [ ] 7.3: Add `mtbf` to modification detection
  - [ ] 7.4: Update tests

- [ ] Task 8: Update Global Analysis labels
  - [ ] 8.1: Check ComparisonTable column headers
  - [ ] 8.2: Check GlobalAnalysisView labels
  - [ ] 8.3: Update tests

- [ ] Task 9: Grep verification
  - [ ] 9.1: Grep for "Failure rate" in UI-facing strings — should be 0 remaining
  - [ ] 9.2: Grep for "Duration per failure" — should be 0 remaining
  - [ ] 9.3: Grep for "per failure" in labels — should be 0 remaining

## Technical Notes

### Label Changes Only (Internal Names Preserved)
- `failureRatePercentage` stays as variable name (internal, not user-facing)
- `failureRateMode` stays (internal)
- `absoluteFailureCount` stays (internal) — but UI label changes
- Only UI labels, aria-labels, and test selectors change

### OverhaulCostInput Conditional Visibility
```typescript
// FocusMode.tsx — current:
<OverhaulCostInput analysisId={id} />  {/* Always shown */}

// FocusMode.tsx — revised:
{isPlanned && <OverhaulCostInput analysisId={id} />}  {/* Planned only */}
```

### MTBF Field — Informational
The MTBF field is stored but not yet used in calculations. Future use:
- In Unplanned mode: could be used to validate/cross-check the pump removal rate
- In Planned mode: already represented by `pmIntervalMonths`
- Comment in code: `// MTBF: informational field, not used in calculation (future: validation)`

### Mandatory Checklist — All Consumers
- [ ] FocusMode (field visibility)
- [ ] ComparisonView (labels, replace, modification detection)
- [ ] AnalysisSummary (read-only labels)
- [ ] FailureRateInput (label text)
- [ ] DowntimeInputs (label text)
- [ ] ResultsPanel (formula display, if any references)
- [ ] GlobalAnalysisView (aggregation labels)
- [ ] ComparisonTable (column headers)
- [ ] PDF Export (if labels are hardcoded)

## Files Changed

| File | Change |
|------|--------|
| `src/types/index.ts` | MOD — Add `mtbf: number` to Analysis |
| `src/stores/app-store.ts` | MOD — Default mtbf, localStorage migration |
| `src/components/analysis/FailureRateInput.tsx` | MOD — Rename labels |
| `src/components/analysis/FailureRateInput.test.tsx` | MOD — Update label selectors |
| `src/components/analysis/DowntimeInputs.tsx` | MOD — Rename duration label |
| `src/components/analysis/DowntimeInputs.test.tsx` | MOD — Update selectors |
| `src/pages/FocusMode.tsx` | MOD — Conditional OverhaulCostInput, add MTBF field |
| `src/pages/FocusMode.test.tsx` | MOD — Tests for visibility |
| `src/pages/ComparisonView.tsx` | MOD — Add mtbf to replace + modification detection |
| `src/components/comparison/AnalysisSummary.tsx` | MOD — Updated labels |
| `src/pages/GlobalAnalysisView.tsx` | MOD — Column headers |
| `src/pages/ComparisonView.test.tsx` | MOD — Updated tests |

## Estimate
- 3-4h development + tests
- ~20-25 new/modified tests expected

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All tests pass (no regressions)
- [ ] Code reviewed (adversarial)
- [ ] No console.log statements
- [ ] Grep confirms 0 remaining "Failure rate" / "Duration per failure" in UI strings
- [ ] TypeScript strict mode passes
- [ ] ESLint passes
