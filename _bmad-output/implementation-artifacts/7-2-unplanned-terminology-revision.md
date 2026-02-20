# Story 7.2: Unplanned Mode Terminology Revision & MTBF Field

Status: review

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

- [x] Task 1: Update types
  - [x] 1.1: Add `mtbf: number` to `Analysis` interface (default: 0)
  - [x] 1.2: No rename of internal variable names needed — `failureRatePercentage` stays (internal, not user-facing)

- [x] Task 2: Update store
  - [x] 2.1: Add `mtbf: 0` default in `addAnalysis` (via Dashboard.tsx handleCreateAnalysis)
  - [x] 2.2: Add `mtbf` to `duplicateAnalysis` (automatic via spread, verified)
  - [x] 2.3: Add `mtbf` to localStorage migration (default 0 for existing data)

- [x] Task 3: Rename FailureRateInput labels
  - [x] 3.1: Change "Failure Rate (%)" → "Pump Removal Rate (%)"
  - [x] 3.2: Change "Failures Count (last year)" → "Pumps Removed (last year)"
  - [x] 3.3: Updated FailureRateModeToggle labels ("Removals Count/year", "Pump Removal Rate Input Mode")
  - [x] 3.4: Update tests (label selectors in FailureRateInput.test.tsx, FailureRateModeToggle.test.tsx, FailureRateInput.integration.test.tsx)

- [x] Task 4: Rename DowntimeInputs label
  - [x] 4.1: Change "Duration per Failure (hours)" → "Duration per Event (hours)"
  - [x] 4.2: Update tests (DowntimeInputs.test.tsx, DowntimeInputs.integration.test.tsx)

- [x] Task 5: Conditional Overhaul Cost visibility
  - [x] 5.1: In FocusMode.tsx, wrap `<OverhaulCostInput>` with `{isPlanned && ...}`
  - [x] 5.2: Update FocusMode tests for conditional visibility (2 tests added)
  - [x] 5.3: Verified Global Analysis and ComparisonView don't reference overhaul cost for unplanned analyses

- [x] Task 6: Add MTBF field
  - [x] 6.1: Add MTBF numeric input in FocusMode.tsx (Unplanned only, own section)
  - [x] 6.2: Validation: positive number, min 1, placeholder "ex: 18", unit label "months"
  - [x] 6.3: Store in Analysis, persist to localStorage (migration handles existing data)
  - [x] 6.4: Informational only — helper text "Informational — not used in ROI calculation"
  - [x] 6.5: Component tests (8 tests added in FocusMode.test.tsx)

- [x] Task 7: Update ComparisonView / AnalysisSummary
  - [x] 7.1: AnalysisSummary uses new labels ("Pump Removal Rate", "Pumps Removed")
  - [x] 7.2: Add `mtbf` to `handleReplaceOriginal` field list in ComparisonView.tsx
  - [x] 7.3: mtbf added to modification detection (via spread in handleReplaceOriginal)
  - [x] 7.4: Update tests (mtbf: 0 in all test Analysis objects)

- [x] Task 8: Update Global Analysis labels
  - [x] 8.1: ComparisonTable column header "Failure Rate" → "Removal Rate"
  - [x] 8.2: GlobalAnalysisView labels verified (uses ComparisonTable)
  - [x] 8.3: Update tests (ComparisonTable.test.tsx)

- [x] Task 9: Grep verification
  - [x] 9.1: Grep for "Failure Rate" in UI-facing strings — 0 remaining
  - [x] 9.2: Grep for "Duration per Failure" — 0 remaining
  - [x] 9.3: Grep for "per failure" in labels — 0 remaining
  - [x] 9.4: PDF export labels updated ("Pump Removal Rate:", "Downtime/Event:", "Removal Rate" column)

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
- [x] FocusMode (field visibility — conditional OverhaulCost, MTBF section)
- [x] ComparisonView (labels, replace, modification detection — mtbf added to handleReplaceOriginal)
- [x] AnalysisSummary (read-only labels — "Pump Removal Rate", "Pumps Removed")
- [x] FailureRateInput (label text — all renamed)
- [x] DowntimeInputs (label text — "Duration per Event")
- [x] ResultsPanel (no label changes needed — uses computed values)
- [x] GlobalAnalysisView (uses ComparisonTable — covered)
- [x] ComparisonTable (column headers — "Removal Rate")
- [x] PDF Export (hardcoded labels updated — "Pump Removal Rate:", "Downtime/Event:", "Removal Rate")

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
- [x] All acceptance criteria met (AC1-AC8)
- [x] All tests pass — 73 files, 1536 tests, 0 failures
- [x] Code reviewed (adversarial) — 3 parallel reviewers (simplicity/bugs/conventions), 15 issues found, all HIGH+MEDIUM fixed
- [x] No console.log statements
- [x] Grep confirms 0 remaining "Failure Rate" / "Duration per Failure" / "Run to Fail" in UI strings
- [x] TypeScript strict mode passes
- [x] ESLint passes (0 new errors)

## Code Review Summary

3 parallel reviewers (simplicity, bugs, conventions) found 15 issues total. All HIGH + MEDIUM fixed:

| # | Severity | Issue | Fix |
|---|----------|-------|-----|
| 1 | HIGH | MTBF inlined in FocusMode — breaks component-per-card pattern | Extracted `MtbfInput` component |
| 2 | HIGH | MTBF missing `aria-invalid` + `aria-describedby` (WCAG AA) | Added to MtbfInput |
| 3 | HIGH | `useId`/`useCallback` over-engineering for single input | Removed from FocusMode, simplified in MtbfInput |
| 4 | HIGH | `min="1"` contradicts `num >= 0` guard | Changed to `min="0"` |
| 5 | HIGH | No `mtbf` validation in `updateAnalysis` store | Added guard |
| 6 | HIGH | Stale component order test | Updated test description |
| 7 | MEDIUM | PDF uses "Run to Fail" — contradicts terminology revision | Changed to "Unplanned" |
| 8 | MEDIUM | French aria-label "Supprimer" in ComparisonTable (pre-existing) | Fixed to "Delete" |

## Dev Agent Record

| Metric | Value |
|--------|-------|
| Tests before | 1506 (Story 6.5 baseline) |
| Tests after | 1536 (+30 new/modified) |
| Files modified | ~45 (15 source + ~30 test files) |
| Code review issues | 15 found (6H, 2M from story code; rest LOW/deferred). All H+M fixed. |
| Key discoveries | FailureRateModeToggle + PDF export had unlisted "Failure Rate" labels; PDF had "Run to Fail"; ComparisonTable had French aria-label |

## Change Log

| File | Change |
|------|--------|
| `src/types/index.ts` | Added `mtbf: number` to Analysis interface |
| `src/stores/app-store.ts` | Added mtbf to localStorage migration + updateAnalysis validation |
| `src/pages/Dashboard.tsx` | Added `mtbf: 0` to handleCreateAnalysis |
| `src/pages/FocusMode.tsx` | Conditional OverhaulCost, MtbfInput component usage |
| `src/pages/FocusMode.test.tsx` | +5 tests (MTBF visibility + OverhaulCost visibility), mock for MtbfInput |
| `src/components/analysis/MtbfInput.tsx` | NEW — Extracted MTBF input component with WCAG AA |
| `src/components/analysis/MtbfInput.test.tsx` | NEW — 12 tests for MtbfInput |
| `src/components/analysis/index.ts` | Added MtbfInput barrel export |
| `src/pages/ComparisonView.tsx` | Added mtbf to handleReplaceOriginal |
| `src/components/analysis/FailureRateInput.tsx` | Renamed all UI labels |
| `src/components/analysis/FailureRateInput.test.tsx` | Updated label selectors |
| `src/components/analysis/FailureRateInput.integration.test.tsx` | Updated label selectors |
| `src/components/analysis/FailureRateModeToggle.tsx` | Renamed toggle labels |
| `src/components/analysis/FailureRateModeToggle.test.tsx` | Updated toggle selectors |
| `src/components/analysis/DowntimeInputs.tsx` | "Duration per Event" |
| `src/components/analysis/DowntimeInputs.test.tsx` | Updated selectors |
| `src/components/analysis/DowntimeInputs.integration.test.tsx` | Updated selectors |
| `src/components/comparison/AnalysisSummary.tsx` | "Pump Removal Rate" labels |
| `src/components/global/ComparisonTable.tsx` | "Removal Rate" column + "Delete" aria-label |
| `src/components/global/ComparisonTable.test.tsx` | Updated column header + "Delete" selectors |
| `src/components/global/GlobalAnalysisView.test.tsx` | Updated "Delete" aria-label selectors |
| `src/lib/pdf-generator.ts` | Updated PDF labels + "Unplanned" strategy |
| `src/lib/pdf-generator.test.ts` | Updated PDF test labels + "Unplanned" |
| ~28 test files | Added `mtbf: 0` to Analysis object literals |
