# Epic 8: Payback Time

## Overview

Add Payback Time as a companion metric to ROI across the ARGOS ROI Calculator. Payback Time answers "how long until the ARGOS investment pays for itself" — a critical metric for CFO-level sign-off that complements the existing ROI percentage.

## Business Context

- **ROI** tells clients *how much* they gain — **Payback Time** tells them *when*
- Sub Fab Managers and procurement need both metrics to justify ARGOS contracts
- Active sales pipeline (GF Dresden, ST Rousset, NXP) benefits immediately

## Formula

```
grossAnnualSavings = totalFailureCost × (detectionRate / 100)  [unplanned]
                   = overhaulSavings + residualSavings          [planned]

paybackTimeMonths = (argosServiceCost / grossAnnualSavings) × 12
```

- If `grossAnnualSavings <= 0`: payback is `Infinity` (N/A — service never pays for itself)
- If `grossAnnualSavings > 0`: result is in months (decimal)

## Phased Delivery

| Story | Scope | Priority |
|-------|-------|----------|
| **8.1** | Single global payback number in ResultsPanel | **URGENT** — needed for client meeting |
| **8.2** | Payback per process in ComparisonTable + MiniCard | Next iteration |
| **8.3** | Aggregated payback in Global Analysis view | Next iteration |
| **8.4** | Dynamic break-even curve (chart) | Future |

## Stories

### Story 8.1: Single Payback Time Display
- Add `calculatePaybackTime()` to `calculations.ts`
- Display payback time card in `ResultsPanel.tsx` next to ROI
- Format: "X.X months" or "X.X years" with color coding
- Unit tests for calculation + component

### Story 8.2: Per-Process Payback Time
- Add `paybackTimeMonths` to `AnalysisRowData` interface
- Display in `ComparisonTable` (Global Analysis view)
- Show compact payback in `MiniCard` sidebar navigation
- Update `calculateAnalysisRow()` and `calculateAllAnalysisRows()`

### Story 8.3: Aggregated Payback Time
- Add `overallPaybackMonths` to `AggregatedMetrics` interface
- Display in Global Analysis aggregate cards
- Update `calculateAggregatedMetrics()`
- Include in PDF export (executive summary)

### Story 8.4: Dynamic Break-Even Curve
- Add chart component showing cumulative savings vs. cumulative ARGOS cost over time
- X-axis: months (0-24), Y-axis: EUR
- Visual break-even intersection point
- Include in PDF export as optional section

## Technical Notes

- ARGOS service cost is already parameterizable (`globalParams.serviceCostPerPump`)
- `calculateStrategySavings()` already returns all needed values
- No new data inputs required — purely computed from existing fields
- Payback Time is derived, never stored
