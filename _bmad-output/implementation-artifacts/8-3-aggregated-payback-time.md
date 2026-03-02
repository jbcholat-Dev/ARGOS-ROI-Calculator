# Story 8.3: Aggregated Payback Time

Status: pending

## Story

**As a** sales engineer presenting the global ROI summary,
**I want** to see an overall Payback Time aggregated across all processes,
**So that** I can give the client a single payback figure for the entire ARGOS deployment.

## Priority & Context

- **Priority:** Medium — after Story 8.2
- **Epic:** 8 — Payback Time
- **Effort:** 2h
- **Dependencies:** Story 8.1 (calculatePaybackTime function)

## Acceptance Criteria

### AC1: AggregatedMetrics Extension
**Given** the `AggregatedMetrics` interface
**When** updated for payback support
**Then** it includes `overallPaybackMonths: number | null`

### AC2: Global Analysis Display
**Given** I am viewing the Global Analysis aggregate cards
**When** all metrics are calculated
**Then** I see an "Overall Payback Time" card with formatted value and color coding

### AC3: PDF Export
**Given** I export the ROI report as PDF
**When** the executive summary section renders
**Then** it includes the overall Payback Time alongside overall ROI

## Tasks/Subtasks

- [ ] Task 1: Add `overallPaybackMonths` to `AggregatedMetrics`
- [ ] Task 2: Update `calculateAggregatedMetrics()` to compute overall payback
- [ ] Task 3: Add payback card to Global Analysis view
- [ ] Task 4: Add payback to PDF executive summary
- [ ] Task 5: Unit and component tests
