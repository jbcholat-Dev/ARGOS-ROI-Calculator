# Story 8.2: Per-Process Payback Time

Status: pending

## Story

**As a** sales engineer comparing multiple processes,
**I want** to see the Payback Time for each individual process in the comparison table and sidebar,
**So that** I can identify which processes have the fastest ROI payback.

## Priority & Context

- **Priority:** Medium — next iteration after Story 8.1
- **Epic:** 8 — Payback Time
- **Effort:** 2-3h
- **Dependencies:** Story 8.1 (calculatePaybackTime function)

## Acceptance Criteria

### AC1: AnalysisRowData Extension
**Given** the `AnalysisRowData` interface
**When** updated for payback support
**Then** it includes `paybackTimeMonths: number | null`

### AC2: ComparisonTable Display
**Given** I am viewing the Global Analysis comparison table
**When** it renders per-process rows
**Then** each row shows a Payback Time column with formatted value and color coding

### AC3: MiniCard Payback Badge
**Given** I am viewing the sidebar navigation with MiniCards
**When** an analysis has complete data
**Then** the MiniCard shows a compact payback indicator alongside ROI

## Tasks/Subtasks

- [ ] Task 1: Add `paybackTimeMonths` to `AnalysisRowData` interface
- [ ] Task 2: Update `calculateAnalysisRow()` to compute payback
- [ ] Task 3: Add Payback column to ComparisonTable
- [ ] Task 4: Add compact payback display to MiniCard
- [ ] Task 5: Unit and component tests
