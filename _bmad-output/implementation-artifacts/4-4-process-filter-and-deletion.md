# Story 4.4: Process Selection Filter & Deletion in Global Analysis

Status: done

## Story

**As a** sales engineer conducting a multi-process ROI analysis,
**I want** to include/exclude individual processes from the Global Analysis calculations and permanently delete unwanted analyses,
**So that** I can model deployment scenarios (partial vs. full rollout) during client meetings and keep my analysis set clean.

## Acceptance Criteria

### AC1: Checkbox Per Process Row
**Given** I am on Global Analysis (/global) with the Comparison Table visible
**When** the table renders
**Then** each process row has a checkbox on the left side, before the Process Name column
**And** all checkboxes are checked by default
**And** checkboxes are keyboard accessible (focusable, toggled by Space)

### AC2: Exclude Process from Global Analysis Calculations
**Given** the Comparison Table has multiple processes with checkboxes
**When** I uncheck a process checkbox
**Then** the row becomes visually grayed out (reduced opacity, e.g., `opacity-50`)
**And** all Global Analysis hero KPIs (total failure cost, total savings, total ARGOS cost, aggregate ROI) recalculate in real time excluding the unchecked process
**And** the unchecked process data remains visible but dimmed in the table

### AC3: Re-include Process
**Given** a process row is unchecked and grayed out
**When** I re-check the checkbox
**Then** the row restores to full opacity
**And** Global Analysis KPIs recalculate to include the re-checked process
**And** the Delete button disappears from that row

### AC4: Active Process Counter
**Given** the Comparison Table has processes with some unchecked
**When** I view the Global Analysis page
**Then** I see a counter indicating how many processes are active (e.g., "3/5 processes selected")
**And** this counter updates in real time when checkboxes are toggled

### AC5: Last Active Process Protection
**Given** only one process checkbox remains checked
**When** I look at that last checked checkbox
**Then** the checkbox is visually disabled (`cursor-not-allowed`, slightly different styling)
**And** hovering or focusing on it shows a tooltip: "At least one process must remain active"
**And** clicking it does nothing -- it cannot be unchecked

### AC6: Delete Button on Excluded Rows
**Given** a process row is unchecked (excluded)
**When** the row is grayed out
**Then** a Delete button (trash icon or "Supprimer" text) appears on the right side of the row
**And** the Delete button is NOT visible on checked (active) rows

### AC7: Delete Confirmation Modal
**Given** I click the Delete button on an excluded process row
**When** the modal opens
**Then** I see:
  - Title: "Supprimer l'analyse [Process Name] ?"
  - Body: "Cette action supprimera definitivement l'analyse et ses donnees du calculateur. Cette action est irreversible."
  - Two buttons: "Annuler" (secondary) and "Supprimer" (destructive/red)
**And** the modal uses portal rendering (`createPortal` to `document.body`)
**And** the modal has `aria-labelledby` (title) and `aria-describedby` (body)
**And** focus is trapped within the modal (Tab and Shift+Tab cycle)
**And** pressing Escape closes the modal without deleting

### AC8: Delete Execution and Cascade
**Given** I confirm deletion in the modal
**When** the deletion executes
**Then** the analysis is removed from the `analyses` array in the Zustand store
**And** the analysis is removed from the Comparison Table
**And** the analysis is removed from the Solutions module data
**And** the analysis ID is cleaned up from the `excludedFromGlobal` set
**And** Global Analysis KPIs do NOT change (the process was already excluded from calculations)
**And** if the deleted process was the active analysis, the first remaining analysis becomes active

### AC9: Delete Last Analysis Prevention
**Given** only one analysis remains in the store (regardless of checked/unchecked state)
**When** I try to delete it
**Then** the Delete button is not shown (or disabled)
**And** the system ensures at least one analysis always exists in the calculator

## Tasks/Subtasks

- [x] Task 1: Add `excludedFromGlobal: Set<string>` and `toggleExcludeFromGlobal` action to Zustand store
  - [x] Add state field with empty Set default
  - [x] Add toggle action with last-active protection
  - [x] Extend `deleteAnalysis` to clean up `excludedFromGlobal` set
- [x] Task 2: Add checkbox column to ComparisonTable
  - [x] Extend props with `excludedIds`, `onToggleExclude`, `onDeleteAnalysis`, `totalAnalysesCount`
  - [x] Render checkbox column with aria-label per row
  - [x] Apply `opacity-50` to excluded rows
  - [x] Disable checkbox when last active (with tooltip)
- [x] Task 3: Add Delete button on excluded rows
  - [x] Render trash icon button only on excluded rows
  - [x] Hide delete button when only 1 analysis remains (AC9)
  - [x] Delete button disappears on re-check (AC3)
- [x] Task 4: Update GlobalAnalysisView for exclusion filtering
  - [x] Filter analyses for KPI calculations using `excludedFromGlobal`
  - [x] Add process counter ("X/Y processes selected") with aria-live
  - [x] Wire up delete confirmation modal with French text
- [x] Task 5: Write comprehensive tests
  - [x] Store tests: toggleExcludeFromGlobal (8 tests)
  - [x] ComparisonTable tests: checkbox, styling, delete button (16 tests)
  - [x] GlobalAnalysisView tests: KPI filtering, counter, modal (14 tests)

## Technical Notes

### Store Changes (`useAppStore`)
- Add `excludedFromGlobal: Set<string>` to store state
- Add `toggleExcludeFromGlobal(analysisId: string)` action -- toggles ID in/out of set
- Add or extend `deleteAnalysis(analysisId: string)` action -- removes from `analyses[]`, cleans up `excludedFromGlobal`, cascades to solutions data
- Global Analysis selectors filter with `.filter(a => !excludedFromGlobal.has(a.id))`

### Component Changes
- `ComparisonTable` -- add checkbox column, conditional row styling, Delete button
- `GlobalAnalysisView` -- update selectors to respect `excludedFromGlobal`, add process counter
- Reuse `ConfirmationModal` pattern from Story 4-3 (portal, aria, focus trap)

### Edge Cases
- Deleting a process that was excluded: clean up `excludedFromGlobal` set (no orphan IDs)
- Single process remaining: checkbox locked + no Delete button
- All processes checked: no Delete buttons visible anywhere

## FRs Covered
- FR35 (Global aggregation -- extended with filtering)
- FR37 (Comparison Table -- extended with selection and deletion)

## NFRs Addressed
- NFR-A1: WCAG AA compliance (keyboard accessible checkboxes, aria attributes on modal)
- NFR-P4: Real-time recalculation within 200ms

## Dev Agent Record

### Implementation Plan
- Store-first approach: added `excludedFromGlobal` Set and `toggleExcludeFromGlobal` action
- Extended `deleteAnalysis` to cascade cleanup of `excludedFromGlobal`
- ComparisonTable extended with optional checkbox/delete columns (backward-compatible)
- GlobalAnalysisView filters analyses for KPI calculations, adds counter and delete modal
- Reused existing Modal primitive (portal, focus trap, ARIA) for delete confirmation

### Completion Notes
- All 9 ACs fully implemented and tested
- 45 new tests added (10 store + 16 ComparisonTable + 17 GlobalAnalysisView + 2 review fixes)
- 0 lint errors in modified files
- Backward-compatible: ComparisonTable works without exclusion props (existing tests pass unchanged)
- Solutions module cascade via Zustand reactivity: PreFilledContext reads `analyses` directly from store, auto-updates on deletion (tested)

## File List

### Modified
- `argos-roi-calculator/src/stores/app-store.ts` -- Added `excludedFromGlobal`, `toggleExcludeFromGlobal`, extended `deleteAnalysis`
- `argos-roi-calculator/src/components/global/ComparisonTable.tsx` -- Added checkbox column, delete button, row styling
- `argos-roi-calculator/src/components/global/GlobalAnalysisView.tsx` -- Added exclusion filtering, process counter, delete modal
- `argos-roi-calculator/src/stores/app-store.test.ts` -- Added 8 tests for excludedFromGlobal
- `argos-roi-calculator/src/components/global/ComparisonTable.test.tsx` -- Added 16 tests for checkbox/delete
- `argos-roi-calculator/src/components/global/GlobalAnalysisView.test.tsx` -- Added 14 tests for KPI filtering/counter/modal
- `_bmad-output/implementation-artifacts/sprint-status.yaml` -- Status updated

## Change Log

- 2026-02-13: Story 4.4 implementation complete -- Process Selection Filter & Deletion in Global Analysis
  - Added checkbox per process row with keyboard accessibility
  - KPIs recalculate in real-time when processes are excluded/included
  - Delete button appears only on excluded rows with French confirmation modal
  - Last active process protection (disabled checkbox + tooltip)
  - 39 new tests covering all 9 acceptance criteria
- 2026-02-13: Code review fixes (6 issues: 3 HIGH, 2 MEDIUM, 1 LOW)
  - H1: Added focus trap test (Tab + Shift+Tab cycling) for delete modal (AC7 + CLAUDE.md)
  - H2: Added store-level guard in deleteAnalysis preventing deletion of last analysis (AC9)
  - H3: Added Solutions cascade test verifying no orphaned references after deletion (AC8)
  - M1: Fixed test count documentation (39 actual, not 46)
  - M2: Fixed mixed English/French aria-labels -- delete button now uses "Supprimer" consistently
  - L1: Added aria-describedby + aria-labelledby verification test for delete modal (AC7)

## Estimate
- Medium (~3-4h development + tests)
- ~25-35 new tests expected
- **Actual: 45 new tests** (39 implementation + 6 review fixes)
