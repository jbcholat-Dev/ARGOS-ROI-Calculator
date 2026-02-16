# Story 5.3: PDF Content Structure (Executive Summary, Breakdown, Assumptions)

Status: done

## Story

As a user (Fab Director reading the PDF),
I want clear sections with executive summary, per-process details, and assumptions,
so that I can quickly understand the business case and verify the methodology.

## Acceptance Criteria

1. **Given** a PDF is generated with 3 analyses, **When** I open the PDF, **Then** I see an Executive Summary section on the first content page (after cover) with:
   - Total Savings across all processes (hero number, large font)
   - Overall ROI percentage with color indicator
   - Total pumps monitored
   - Number of processes analyzed
   - Key recommendation text

2. **Given** the PDF has 3 analyses, **When** I view the Per-Process Breakdown section, **Then** each analysis has its own section (potentially spanning pages) containing:
   - Process name as section header
   - Input summary: pump model, quantity, failure rate, wafer details, downtime config
   - Maintenance strategy label ("Run to Fail" or "Preventive Maintenance")
   - Results: Total Failure Cost, ARGOS Service Cost, Savings, ROI (%)
   - Strategy-specific metrics (overhaul savings for planned, cost avoided for unplanned)
   - ROI value with traffic-light color

3. **Given** the PDF has multiple analyses, **When** I view the Global Analysis Summary section, **Then** I see a comparison table with all analyses side by side showing:
   - Process Name, Pumps, Failure Rate, Failure Cost, ARGOS Cost, Savings, ROI (%)
   - Aggregated totals row at the bottom
   - ROI column with traffic-light colors

4. **Given** the PDF is generated, **When** I view the Assumptions & Methodology section, **Then** I see:
   - ARGOS Detection rate used (e.g., "70%")
   - Service cost per pump (e.g., "€2,500/year")
   - Calculation formulas explained in readable format
   - Data source note: "Based on client-provided operational data"
   - Date of analysis

5. **Given** some analyses are excluded from Global (via `excludedFromGlobal`), **When** the PDF is generated, **Then** the Executive Summary and Global Analysis use only included analyses, **And** excluded analyses are still shown in Per-Process Breakdown with a note "(Excluded from global totals)".

6. **Given** analyses use different maintenance strategies, **When** the Per-Process Breakdown renders, **Then** each analysis shows strategy-appropriate metrics and labels.

7. **Given** an analysis has bottleneck tool enabled, **When** the Per-Process Breakdown renders, **Then** it shows the bottleneck multiplier value.

## Tasks / Subtasks

- [x] Task 1: Implement Executive Summary section (AC: 1, 5)
  - [x]1.1: Add `renderExecutiveSummary()` function in `pdf-generator.ts`
  - [x]1.2: Calculate aggregated metrics using `calculateAggregatedMetrics()` (respecting excludedFromGlobal)
  - [x]1.3: Render hero Total Savings number (large, bold, colored)
  - [x]1.4: Render Overall ROI with traffic-light color
  - [x]1.5: Render Total Pumps Monitored and Process Count
  - [x]1.6: Add recommendation text based on ROI: positive → "ARGOS demonstrates strong ROI...", negative → "Further analysis recommended..."
  - [x]1.7: Add visual divider before next section

- [x] Task 2: Implement Per-Process Breakdown section (AC: 2, 5, 6, 7)
  - [x]2.1: Add `renderProcessBreakdown()` function
  - [x]2.2: Loop through ALL analyses (included AND excluded)
  - [x]2.3: For each analysis, render section header with process name
  - [x]2.4: Add "(Excluded from global totals)" badge for excluded analyses
  - [x]2.5: Render input summary as a 2-column key-value layout:
    - Pump Model: {pumpType}
    - Number of Pumps: {pumpQuantity}
    - Failure Rate: {failureRatePercentage}% ({failureRateMode})
    - Wafer Type: {waferType} ({waferQuantity} wafers)
    - Wafer Cost: €{waferCost}
    - Wafer Defect Events/Year: {waferDefectEventsPerYear}
    - Downtime per Failure: {downtimeDuration}h
    - Downtime Cost/Hour: €{downtimeCostPerHour}
    - Bottleneck Tool: Yes/No (if yes, show multiplier)
    - Maintenance Strategy: "Run to Fail" / "Preventive Maintenance"
  - [x]2.6: For planned strategy, add extra fields:
    - Overhaul Cost/Pump: €{overhaulCostPerPump}
    - PM Interval: {pmIntervalMonths} months
    - ARGOS MTBF Extension: {argosMtbfExtensionPercent}%
  - [x]2.7: Render results summary with colored ROI
  - [x]2.8: Strategy-specific results display:
    - Unplanned: "Cost Avoided", "Detection Savings"
    - Planned: "Overhaul Savings", "Residual Failure Savings"
  - [x]2.9: Handle page breaks between analyses (each analysis starts fresh section, break if insufficient space)

- [x] Task 3: Implement Global Analysis Summary section (AC: 3, 5)
  - [x]3.1: Add `renderGlobalSummary()` function
  - [x]3.2: Add section title "Global Analysis Summary"
  - [x]3.3: Render comparison table using `addTable()` from Story 5.2
  - [x]3.4: Table columns: Process Name | Pumps | Failure Rate | Failure Cost | ARGOS Cost | Savings | ROI
  - [x]3.5: Use `calculateAllAnalysisRows()` for row data (included analyses only)
  - [x]3.6: Add totals row (bold, with background) using `calculateAggregatedMetrics()`
  - [x]3.7: Apply ROI traffic-light colors to ROI column cells
  - [x]3.8: Note excluded count if any: "({n} process(es) excluded from global totals)"

- [x] Task 4: Implement Assumptions & Methodology section (AC: 4)
  - [x]4.1: Add `renderAssumptions()` function
  - [x]4.2: Section title: "Assumptions & Methodology"
  - [x]4.3: Key parameters table:
    - ARGOS Detection Rate: {detectionRate}%
    - Service Cost per Pump: €{serviceCostPerPump}/year
  - [x]4.4: Calculation methodology explanation (simplified formulas in readable text):
    - "Total Failure Cost = (Defect Events × Wafer Cost × Wafers) + (Failed Pumps × Downtime × Cost/Hour)"
    - "ARGOS Savings = Total Failure Cost × Detection Rate - Service Cost"
    - "ROI = (Savings / Service Cost) × 100%"
  - [x]4.5: For planned strategy analyses, add:
    - "Planned Maintenance: Overhaul savings based on MTBF extension from ARGOS predictive monitoring"
  - [x]4.6: Add data source note: "Based on client-provided operational data collected during ROI assessment session."
  - [x]4.7: Add generation date and tool version

- [x] Task 5: Wire sections into main generatePDF orchestrator (AC: all)
  - [x]5.1: Update `generatePDF()` to call sections in order:
    1. Cover page (from Story 5.2)
    2. Executive Summary
    3. Per-Process Breakdown (all analyses)
    4. Global Analysis Summary
    5. Assumptions & Methodology
  - [x]5.2: Ensure proper page management between sections

- [x] Task 6: Write tests (~40-50 tests) (AC: all)
  - [x]6.1: Test Executive Summary renders with correct aggregated values
  - [x]6.2: Test Executive Summary respects excludedFromGlobal
  - [x]6.3: Test Per-Process Breakdown renders all analyses
  - [x]6.4: Test excluded analyses show badge text
  - [x]6.5: Test unplanned strategy displays correct metrics
  - [x]6.6: Test planned strategy displays overhaul savings
  - [x]6.7: Test bottleneck multiplier displayed when enabled
  - [x]6.8: Test Global Summary table has correct row count
  - [x]6.9: Test Global Summary totals row values
  - [x]6.10: Test Assumptions section shows global params
  - [x]6.11: Test formula text is present
  - [x]6.12: Test with 1 analysis (no comparison table needed? or table with 1 row)
  - [x]6.13: Test with 5 analyses (max expected, multi-page)
  - [x]6.14: Test with mixed strategies (some unplanned, some planned)
  - [x]6.15: Test with all analyses excluded (edge case)
  - [x]6.16: Test recommendation text varies based on ROI sign
  - [x]6.17: Test ROI colors in PDF match thresholds (<0 red, 0-15 orange, >15 green)

## Dev Notes

### Architecture & Content Design

**Section Order in PDF:**
```
Page 1:     Cover Page (Story 5.2)
Page 2:     Executive Summary
Pages 3-N:  Per-Process Breakdown (1-2 pages per analysis)
Page N+1:   Global Analysis Summary (comparison table)
Page N+2:   Assumptions & Methodology
```

**Content Rendering Strategy:**
Each section is a pure function that takes `(doc: jsPDF, data, yPosition)` and returns the new Y position after rendering. This enables:
- Easy testing (no DOM, no store dependency)
- Clean page management
- Section reordering without refactoring

```typescript
function renderExecutiveSummary(
  doc: jsPDF,
  metrics: AggregatedMetrics,
  startY: number,
  layout: PDFLayout,
): number {
  let y = startY;
  // ... render content
  return y;  // Return new Y position
}
```

**Data Flow:**
```
PDFExportButton (5.1)
  → generatePDF(analyses, globalParams, excludedFromGlobal) (5.2 + 5.3)
    → calculateAggregatedMetrics(includedAnalyses, globalParams)
    → calculateAllAnalysisRows(includedAnalyses, globalParams)
    → renderCoverPage(doc)                    // Story 5.2
    → renderExecutiveSummary(doc, metrics)     // Story 5.3
    → for each analysis:
        → calculateStrategySavings(analysis, globalParams)
        → renderProcessBreakdown(doc, analysis, result, isExcluded)
    → renderGlobalSummary(doc, rows, metrics)  // Story 5.3
    → renderAssumptions(doc, globalParams)     // Story 5.3
  → return doc.output('blob')
```

### Maintenance Strategy Content Differences

**Unplanned ("Run to Fail") Analysis:**
```
Results:
  Total Failure Cost:     €1,200,000
  ARGOS Service Cost:     €20,000
  Cost Avoided:           €820,000
  ROI:                    4,000%
```

**Planned ("Preventive Maintenance") Analysis:**
```
PM Configuration:
  Overhaul Cost/Pump:     €15,000
  PM Interval:            6 months
  ARGOS MTBF Extension:   30%

Results:
  Total Failure Cost:     €400,000
  Current Overhauls/Year: 16
  ARGOS Overhauls/Year:   12.3
  Overhaul Savings:       €55,500
  Residual Failure Savings: €260,000
  Total ARGOS Value:      €315,500
  ARGOS Service Cost:     €20,000
  ROI:                    1,477%
```

**CRITICAL:** Check Story 4.5.4 implementation for exact field names and calculation functions. The `calculateStrategySavings()` and `calculatePlannedOverhaulSavings()` functions return all needed values.

### Formatting Consistency

**MUST match on-screen display format:**
- Currency: `€125 000` (French locale, space thousands separator, rounded integer)
- Percentage: `70,0 %` (French locale, comma decimal, 1 decimal place)
- Use `formatCurrency()` and `formatPercentage()` from `src/lib/utils.ts`

**Table Column Alignment:**
- Text columns (Process Name, Strategy): left-aligned
- Number columns (Pumps, Rates, Costs, ROI): right-aligned
- This provides professional financial-report appearance

### File Structure

```
Modified files:
└── src/lib/pdf-generator.ts         # Add content section renderers
└── src/lib/pdf-generator.test.ts    # Add content tests
```

No new files needed — all content logic goes in `pdf-generator.ts` (created in Story 5.2).

If `pdf-generator.ts` exceeds ~400 lines, consider splitting into:
- `pdf-generator.ts` — main orchestrator + types
- `pdf-sections.ts` — section renderers (executive, breakdown, global, assumptions)
- `pdf-utils.ts` — shared helpers (colors, fonts, table renderer)

But prefer single file unless it becomes unwieldy.

### Existing Functions to Reuse (DO NOT REIMPLEMENT)

| Function | Source | Purpose |
|----------|--------|---------|
| `calculateAggregatedMetrics()` | `src/lib/calculations.ts` | Global totals (totalSavings, overallROI, totalPumps, processCount) |
| `calculateAllAnalysisRows()` | `src/lib/calculations.ts` | Per-analysis row data for comparison table |
| `calculateStrategySavings()` | `src/lib/calculations.ts` | Strategy-aware calculation (unplanned vs planned) |
| `calculatePlannedOverhaulSavings()` | `src/lib/calculations.ts` | Planned-specific overhaul savings |
| `formatCurrency()` | `src/lib/utils.ts` | `€125 000` format |
| `formatPercentage()` | `src/lib/utils.ts` | `70,0 %` format |
| `getROIColorClass()` | `src/lib/calculations.ts` | ROI threshold logic (adapt RGB for PDF) |

### Testing Patterns

**Spy on jsPDF methods to verify content:**
```typescript
const textCalls: Array<{ text: string; x: number; y: number }> = [];
vi.spyOn(jsPDF.prototype, 'text').mockImplementation((text, x, y) => {
  textCalls.push({ text: String(text), x, y });
  return doc;
});

await generatePDF(mockAnalyses, mockGlobalParams, new Set());

// Verify executive summary content
expect(textCalls).toContainEqual(
  expect.objectContaining({ text: expect.stringContaining('Total Savings') })
);
```

**Mock data for tests:**
```typescript
const mockAnalysis: Analysis = {
  id: 'test-1',
  name: 'Poly Etch',
  pumpType: 'A3004XN',
  pumpQuantity: 8,
  failureRateMode: 'percentage',
  failureRatePercentage: 10,
  waferType: 'batch',
  waferQuantity: 125,
  waferCost: 8000,
  waferDefectEventsPerYear: 5,
  downtimeDuration: 6,
  downtimeCostPerHour: 15000,
  isBottleneck: false,
  bottleneckMultiplier: 2,
  maintenanceStrategy: 'unplanned',
  overhaulCostPerPump: 15000,
  pmIntervalMonths: 6,
  argosMtbfExtensionPercent: 30,
  unplannedDespitePM: 2,
  createdAt: '2026-02-16T10:00:00Z',
  updatedAt: '2026-02-16T10:00:00Z',
};
```

### Critical Guardrails

- **DO NOT reimplement calculation functions** — import from `src/lib/calculations.ts`
- **DO NOT reimplement formatting** — import from `src/lib/utils.ts`
- **Respect excludedFromGlobal** — Executive Summary and Global Summary use INCLUDED only; Per-Process shows ALL with badge
- **Handle null/undefined gracefully** — If a calculation returns null (incomplete analysis), skip it or show "N/A"
- **Page overflow** — Every section renderer must check Y position and add new page if needed
- **No console.log** in production code
- **Named exports ONLY**
- **Pure functions** — Section renderers take data as params, no store access

### Previous Story Intelligence

- **Story 4.5.4 (Maintenance Strategy):** Adds `maintenanceStrategy`, `overhaulCostPerPump`, `pmIntervalMonths`, `argosMtbfExtensionPercent`, `unplannedDespitePM` to Analysis. The PDF MUST display strategy-specific content.
- **Story 4.5.2 (Wafer Defect Decoupling):** `waferDefectEventsPerYear` is now independent from pump failure count. The PDF should show this as a separate line item.
- **Story 4.5.3 (Bottleneck Toggle):** `isBottleneck` and `bottleneckMultiplier` affect downtime calculations. Show in PDF when enabled.
- **Story 4.4 (Process Filter):** `excludedFromGlobal` Set allows users to exclude analyses from global totals. PDF must respect this.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 5.3]
- [Source: argos-roi-calculator/src/lib/calculations.ts] — All calculation functions
- [Source: argos-roi-calculator/src/lib/utils.ts] — formatCurrency, formatPercentage
- [Source: argos-roi-calculator/src/types/index.ts] — Analysis, AggregatedMetrics, AnalysisRowData
- [Source: argos-roi-calculator/src/components/analysis/ResultsPanel.tsx] — On-screen metrics display pattern
- [Source: argos-roi-calculator/src/components/global/GlobalAnalysisView.tsx] — Aggregated metrics display pattern
- [Source: _bmad-output/implementation-artifacts/4.5-4-maintenance-strategy-and-argos-value.md] — Strategy model details

### Estimated Effort

- Development: ~2.5h
- Testing: ~1.5h
- Code review: ~30min
- **Total: ~4.5h**
- **Test estimate: 40-50 tests**

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Implemented all 4 section renderers: `renderExecutiveSummary`, `renderProcessBreakdown`, `renderGlobalSummary`, `renderAssumptions`
- Wired all sections into `generatePDF` orchestrator (cover -> exec summary -> process breakdown -> global summary -> assumptions)
- Added `sanitizeForPDF()` to handle jsPDF WinAnsiEncoding limitations (fr-FR locale produces narrow no-break spaces `\u202F` and euro sign `\u20AC` which jsPDF cannot render with default Helvetica font)
- Added `pdfCurrency()` and `pdfPercentage()` wrappers that sanitize formatted text before PDF rendering
- All existing 61 tests continue to pass (3 updated to match new content structure)
- Added 59 new tests covering all section renderers and integration scenarios
- Total: 120 tests in pdf-generator.test.ts
- No console.log in production code
- Named exports only, pure functions, no store access
- Handles excludedFromGlobal correctly: exec summary + global summary use included only; per-process shows all with badge
- Handles both maintenance strategies with different metric displays
- Shows bottleneck multiplier when enabled
- Page overflow handled via ensureSpace() calls

### File List

- `argos-roi-calculator/src/lib/pdf-generator.ts` (modified) - Added section renderers and PDF text sanitization
- `argos-roi-calculator/src/lib/pdf-generator.test.ts` (modified) - Added 59 new tests, updated 3 existing tests
