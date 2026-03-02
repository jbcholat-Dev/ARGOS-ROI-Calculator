# Story 8.4: Dynamic Break-Even Curve

Status: pending

## Story

**As a** sales engineer presenting long-term ARGOS value,
**I want** to see a visual break-even chart showing cumulative savings vs. cumulative ARGOS cost over time,
**So that** the client can visually understand when and how much value ARGOS delivers.

## Priority & Context

- **Priority:** Low — future enhancement
- **Epic:** 8 — Payback Time
- **Effort:** 4-6h (chart library + design + tests)
- **Dependencies:** Story 8.1 (calculatePaybackTime function)

## Acceptance Criteria

### AC1: Break-Even Chart
**Given** I am viewing an analysis or global view with complete data
**When** the break-even chart renders
**Then** it shows two lines: cumulative ARGOS cost (linear) and cumulative savings
**And** the intersection point is visually highlighted as the break-even point

### AC2: Time Range
**Given** the chart is displayed
**When** I view the x-axis
**Then** it shows months from 0 to at least 24 (or until break-even + 6 months)

### AC3: PDF Export
**Given** I export the ROI report as PDF
**When** the report generates
**Then** it includes the break-even chart as an optional section

## Tasks/Subtasks

- [ ] Task 1: Research/select lightweight chart library (or SVG-based)
- [ ] Task 2: Create BreakEvenChart component
- [ ] Task 3: Compute monthly cumulative data series
- [ ] Task 4: Add break-even point annotation
- [ ] Task 5: Integrate into ResultsPanel and/or Global Analysis
- [ ] Task 6: Add to PDF export
- [ ] Task 7: Tests
