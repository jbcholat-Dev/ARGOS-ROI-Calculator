# Story 4.2: Comparison Table Side-by-Side

Status: done

## Story

**As a** user (JB presenting to Marc during a client meeting),
**I want** to see all analyses compared side-by-side in a table on the Global Analysis page,
**So that** I can discuss which processes deliver the highest value and structure the pitch around the most impactful opportunities.

## Acceptance Criteria

### AC1: Table Renders with Correct Columns and Data
**Given** I am on Global Analysis (/global) with 3 analyses that have complete data
**When** I see the ComparisonTable section below the hero metrics
**Then** I see a table with the following columns:
  - "Process Name" — the analysis name (text, left-aligned)
  - "Pumps" — pumpQuantity (number, right-aligned)
  - "Failure Rate" — failureRatePercentage with "%" suffix (number, right-aligned)
  - "Failure Cost" — totalFailureCost formatted with EUR symbol and French locale separators (right-aligned)
  - "ARGOS Cost" — argosServiceCost formatted with EUR symbol and French locale separators (right-aligned)
  - "Savings" — deltaSavings formatted with EUR symbol and French locale separators (right-aligned)
  - "ROI (%)" — roiPercentage formatted with 1 decimal place and "%" suffix (right-aligned)
**And** each analysis appears as one row in the table
**And** the table has a section heading `<h2>` "Process Comparison"

### AC2: Traffic-Light Color Coding on ROI Column
**Given** the ComparisonTable is rendered with data
**When** a row has ROI < 0% → the ROI cell text is red (`text-red-600`)
**When** a row has ROI between 0-15% → the ROI cell text is orange (`text-orange-500`)
**When** a row has ROI > 15% → the ROI cell text is green (`text-green-600`)
**And** the color classes use the same `getROIColorClass()` function as ResultsPanel and AnalysisCard
**And** color is NOT the only indicator — numerical value is always displayed alongside

### AC3: Sortable Column Headers (Default: Savings Descending)
**Given** the ComparisonTable is rendered
**When** the table first loads
**Then** rows are sorted by "Savings" column in descending order (highest savings first)
**When** I click on a column header (e.g., "ROI (%)")
**Then** the table re-sorts by that column in descending order
**When** I click the same column header again
**Then** the sort order toggles to ascending
**And** the currently sorted column has a visual sort indicator (arrow icon: ↑ or ↓)
**And** all sortable headers are keyboard accessible (focusable, activated by Enter/Space)

### AC4: Click Process Name to Navigate to Focus Mode
**Given** the ComparisonTable is rendered with rows
**When** I click on a process name in the table
**Then** I navigate to Focus Mode (/analysis/:id) for that analysis
**And** the clicked analysis becomes the active analysis in the store
**And** navigation completes within 200ms (NFR-P4)
**When** I use keyboard navigation (Tab to process name, press Enter)
**Then** the same navigation occurs

### AC5: Horizontal Scroll on Narrow Viewports
**Given** the ComparisonTable is rendered
**When** the viewport is narrower than the table's natural width
**Then** the table is horizontally scrollable within its container
**And** the container has `overflow-x-auto` behavior
**And** no horizontal overflow leaks outside the table container

### AC6: Empty and Partial Data Handling
**Given** I have 0 calculable analyses (all incomplete or none exist)
**When** the ComparisonTable would render
**Then** the table is NOT rendered (hero section empty state handles this in Story 4.1)
**Given** I have 3 analyses but only 2 are calculable
**When** the ComparisonTable renders
**Then** only the 2 calculable analyses appear as rows
**And** incomplete analyses are excluded from the table

### AC7: Row Hover and Visual Styling
**Given** the ComparisonTable is rendered
**When** I hover over a row
**Then** the row background changes to a light highlight (`hover:bg-gray-50`)
**And** the cursor changes to pointer on the process name cell
**And** alternating row colors are used for readability (white / light gray)

### AC8: Real-Time Updates
**Given** I am on the Global Analysis page viewing the ComparisonTable
**When** a global parameter changes (e.g., service cost updated in GlobalSidebar)
**Then** all row values recalculate and update immediately (<100ms)
**And** the sort order is preserved
**When** I navigate back from Focus Mode after editing an analysis
**Then** the ComparisonTable reflects the updated values

### AC9: Accessibility (WCAG AA)
**Given** the ComparisonTable is rendered
**Then** the table uses semantic `<table>`, `<thead>`, `<tbody>`, `<th>`, `<td>` elements
**And** column headers use `scope="col"` for screen reader association
**And** sortable headers have `aria-sort` attribute ("ascending", "descending", or "none")
**And** process name links have meaningful accessible text
**And** the table has `role="table"` (implicit via `<table>` element)
**And** keyboard users can tab through sortable headers and process name links

**FRs Covered:** FR38 (System displays comparison table of all analyses side-by-side)
**NFRs Addressed:** NFR-P1 (<100ms recalculation), NFR-P4 (<200ms navigation), NFR-P6 (5 concurrent analyses)

## Tasks / Subtasks

### Task 1: Create Per-Analysis Calculation Helper (AC: 1, 6, 8)
- [x] Add to `argos-roi-calculator/src/lib/calculations.ts`:
  - `calculateAnalysisRow(analysis: Analysis, globalParams: GlobalParams): AnalysisRowData | null`
    - Returns null if `!isAnalysisCalculable(analysis)`
    - Computes: totalFailureCost, argosServiceCost, savings, roiPercentage using existing pure functions
    - Uses per-analysis detection rate: `analysis.detectionRate ?? globalParams.detectionRate`
    - Returns: `{ id, name, pumpQuantity, failureRate, totalFailureCost, argosServiceCost, savings, roiPercentage }`
  - `calculateAllAnalysisRows(analyses: Analysis[], globalParams: GlobalParams): AnalysisRowData[]`
    - Maps analyses through `calculateAnalysisRow()`, filters out nulls
    - Pure function, no side effects

- [x] Add `AnalysisRowData` interface to `argos-roi-calculator/src/types/index.ts`:
  ```typescript
  export interface AnalysisRowData {
    id: string;
    name: string;
    pumpQuantity: number;
    failureRate: number;
    totalFailureCost: number;
    argosServiceCost: number;
    savings: number;
    roiPercentage: number;
  }
  ```

- [x] Add tests to `argos-roi-calculator/src/lib/calculations.test.ts`:
  - Test calculateAnalysisRow with valid analysis → returns correct AnalysisRowData
  - Test calculateAnalysisRow with incomplete analysis → returns null
  - Test calculateAnalysisRow uses per-analysis detectionRate when set
  - Test calculateAnalysisRow uses globalParams.detectionRate when analysis.detectionRate is undefined
  - Test calculateAllAnalysisRows with mixed (calculable + incomplete) → filters correctly
  - Test calculateAllAnalysisRows with 0 analyses → returns empty array
  - Test calculateAllAnalysisRows with 5 analyses → returns 5 rows (NFR-P6)

### Task 2: Create ComparisonTable Component (AC: 1, 2, 3, 5, 7, 9)
- [x] Create `argos-roi-calculator/src/components/global/ComparisonTable.tsx`:
  - **Props:**
    ```typescript
    interface ComparisonTableProps {
      rows: AnalysisRowData[];
      onNavigateToAnalysis: (id: string) => void;
    }
    ```
  - **Sorting state** via `useState`:
    - `sortColumn: keyof AnalysisRowData` (default: `'savings'`)
    - `sortDirection: 'asc' | 'desc'` (default: `'desc'`)
  - **Sorted rows** via `useMemo`:
    - Sort `rows` by `sortColumn` and `sortDirection`
    - String columns (name): locale-aware sort
    - Number columns: numeric sort
  - **Column definitions** array with: key, label, align, format function
  - **Render:**
    - Section heading: `<h2 className="text-xl font-semibold mb-4">Process Comparison</h2>`
    - Scroll container: `<div className="overflow-x-auto">`
    - Semantic table: `<table className="w-full min-w-[700px]">`
    - `<thead>` with sortable `<th>` elements:
      - `scope="col"` on all `<th>`
      - `aria-sort="ascending|descending|none"` on each header
      - Click handler toggles sort (same column toggles direction, different column → desc)
      - Sort indicator arrow (↑/↓) visible on active sort column
      - `cursor-pointer` and `hover:bg-gray-100` on sortable headers
      - `tabIndex={0}`, `role="columnheader"`, keyboard handler (Enter/Space to sort)
    - `<tbody>` with rows:
      - Alternating row colors: even rows `bg-white`, odd rows `bg-gray-50`
      - Hover highlight: `hover:bg-gray-100`
      - Process Name cell: `<button>` or `<a>` styled as link (underline on hover, cursor-pointer)
        - Calls `onNavigateToAnalysis(row.id)` on click
      - Numeric cells right-aligned: `text-right`
      - Currency cells formatted with `formatCurrency()`
      - Failure Rate formatted with `formatPercentage(value, 1)`
      - ROI cell: `className={getROIColorClass(row.roiPercentage)}` + `font-semibold`

- [x] Create `argos-roi-calculator/src/components/global/ComparisonTable.test.tsx`:
  - Test renders table with correct column headers
  - Test renders correct number of rows for given data
  - Test Process Name displays and is clickable
  - Test Pumps displays correct number
  - Test Failure Rate displays with % format
  - Test Failure Cost displays with EUR format (formatCurrency)
  - Test ARGOS Cost displays with EUR format
  - Test Savings displays with EUR format
  - Test ROI displays with traffic-light colors (red, orange, green)
  - Test default sort: Savings descending
  - Test click column header → sorts by that column descending
  - Test click same header again → toggles to ascending
  - Test sort indicator arrow visible on active column
  - Test click Process Name → calls onNavigateToAnalysis with correct ID
  - Test keyboard: Enter/Space on header triggers sort
  - Test keyboard: Enter on process name triggers navigation
  - Test horizontal scroll container present (`overflow-x-auto`)
  - Test alternating row colors
  - Test hover styling class present
  - Test accessibility: scope="col", aria-sort attributes
  - Test empty rows array → table not rendered (or empty tbody)

### Task 3: Integrate ComparisonTable into GlobalAnalysisView (AC: 1, 4, 6, 8)
- [x] Modify `argos-roi-calculator/src/components/global/GlobalAnalysisView.tsx`:
  - Import ComparisonTable component
  - Import `calculateAllAnalysisRows` from calculations
  - Import `useNavigate` from react-router-dom
  - Import `useAppStore` for `setActiveAnalysis`
  - Compute rows via `useMemo`:
    ```typescript
    const rows = useMemo(
      () => calculateAllAnalysisRows(analyses, globalParams),
      [analyses, globalParams]
    );
    ```
  - Create navigation handler:
    ```typescript
    const handleNavigateToAnalysis = useCallback((id: string) => {
      setActiveAnalysis(id);
      navigate(`/analysis/${id}`);
    }, [setActiveAnalysis, navigate]);
    ```
  - Render ComparisonTable below hero section (only if rows.length > 0):
    ```tsx
    {rows.length > 0 && (
      <ComparisonTable
        rows={rows}
        onNavigateToAnalysis={handleNavigateToAnalysis}
      />
    )}
    ```

- [x] Update `argos-roi-calculator/src/components/global/GlobalAnalysisView.test.tsx`:
  - Test ComparisonTable renders when analyses have data
  - Test ComparisonTable NOT rendered when 0 calculable analyses
  - Test clicking process name in table triggers navigation
  - Test table data updates when global params change (mocked store update)

### Task 4: Update Global Component Barrel Export (AC: all)
- [x] Update `argos-roi-calculator/src/components/global/index.ts`:
  - Add export for ComparisonTable

### Task 5: Integration Testing (AC: 4, 8)
- [x] Create or update `argos-roi-calculator/src/pages/GlobalAnalysis.integration.test.tsx`:
  - Test full flow: 3 analyses in store → navigate to /global → hero metrics + comparison table visible
  - Test click process name in table → navigates to /analysis/:id
  - Test global param change → table values update
  - Test sort interaction → rows reorder correctly
  - Test mixed data (2 calculable + 1 incomplete) → only 2 rows in table

### Task 6: Accessibility and Code Quality Audit (AC: 9)
- [x] Accessibility verification:
  - Semantic table elements: `<table>`, `<thead>`, `<tbody>`, `<th>`, `<td>`
  - `scope="col"` on all column headers
  - `aria-sort` attribute on sortable headers
  - Process name links are focusable and keyboard-activatable
  - Sort headers focusable (tabIndex=0) and keyboard-activatable (Enter/Space)
  - Color not sole indicator (ROI numbers + colors)
- [x] Code quality:
  - Remove ALL console.log statements
  - TypeScript strict mode passes
  - ESLint passes with no warnings
  - Named exports only (no default exports)
  - Zustand selectors (never destructure store)
  - Tailwind class order: Layout → Spacing → Typography → Colors → Effects

## Dev Notes

### Critical Context — The Comparison Table

This story implements **FR38: System displays comparison table of all analyses side-by-side**. It is the natural complement to Story 4.1's hero metrics, providing the detailed process-by-process breakdown that enables JB to structure his pitch: "Here's where we get the most value."

The comparison table appears in the UX spec (lines 1008-1013) as **Section 2** of the Global Analysis main panel:
- Summary table of all analyses (typically 3-5 rows)
- Columns: Process Name | Savings | ROI % | Status Badge
- Sortable (click header to sort by savings, ROI, etc.)
- Row hover highlight
- Click row → Focus Mode of that analysis

**Note:** The epics.md specification expands the column set beyond the UX wireframe to include: Pumps, Failure Rate, Failure Cost, ARGOS Cost. This provides the full data picture Marc needs to understand the breakdown.

### Architecture Patterns to Follow

**Component Location:**
- ComparisonTable: `src/components/global/ComparisonTable.tsx` (NEW)
- Helper functions: `src/lib/calculations.ts` (ADD calculateAnalysisRow, calculateAllAnalysisRows)
- Type: `src/types/index.ts` (ADD AnalysisRowData interface)
- Integration: `src/components/global/GlobalAnalysisView.tsx` (MODIFY — add table below hero)

**State Management Pattern (Zustand):**
```typescript
// CORRECT - always use selectors
const analyses = useAppStore(state => state.analyses);
const globalParams = useAppStore(state => state.globalParams);
const setActiveAnalysis = useAppStore(state => state.setActiveAnalysis);

// WRONG - never destructure store
const { analyses, globalParams } = useAppStore();
```

**Navigation Pattern (from AnalysisCard, MiniCard):**
```typescript
const navigate = useNavigate();
const setActiveAnalysis = useAppStore(state => state.setActiveAnalysis);

const handleNavigateToAnalysis = (id: string) => {
  setActiveAnalysis(id);  // Set active BEFORE navigate (immediate UI update)
  navigate(`/analysis/${id}`);
};
```

**Memoization Pattern:**
```typescript
const rows = useMemo(
  () => calculateAllAnalysisRows(analyses, globalParams),
  [analyses, globalParams]
);

const sortedRows = useMemo(
  () => [...rows].sort((a, b) => {
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];
    if (typeof aVal === 'string') return sortDirection === 'asc'
      ? aVal.localeCompare(bVal as string)
      : (bVal as string).localeCompare(aVal);
    return sortDirection === 'asc'
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number);
  }),
  [rows, sortColumn, sortDirection]
);
```

**Format Functions (already exist — REUSE, do NOT recreate):**
- `formatCurrency(amount)` from `src/lib/utils.ts` — formats as "€125 000" (French locale)
- `formatPercentage(value, fractionDigits)` from `src/lib/utils.ts` — formats as "10,0 %"
- `getROIColorClass(roi)` from `src/lib/calculations.ts` — returns Tailwind class

**ROI Color Thresholds (already defined — REUSE):**
```typescript
// From src/lib/constants.ts
ROI_NEGATIVE_THRESHOLD = 0    // < 0% = text-red-600
ROI_WARNING_THRESHOLD = 15    // 0-15% = text-orange-500
                              // > 15% = text-green-600
```

### Existing Component Patterns to Follow

**AnalysisCard Navigation Pattern:**
- Uses `setActiveAnalysis(id)` BEFORE `navigate(route)` — ensures immediate UI update
- Navigation via `useNavigate()` from react-router-dom

**ResultsPanel Color Pattern:**
- ROI values use `getROIColorClass()` for traffic-light coloring
- Color is NEVER the sole indicator — numeric value always displayed alongside

**MiniCard Compact Display Pattern:**
- Uses `useMemo` for calculation performance
- Traffic-light color dot: green/orange/red circle
- Clickable → navigates to Focus Mode

### Sorting Implementation Reference

**Column Definitions Pattern:**
```typescript
const COLUMNS = [
  { key: 'name', label: 'Process Name', align: 'left', sortable: true },
  { key: 'pumpQuantity', label: 'Pumps', align: 'right', sortable: true },
  { key: 'failureRate', label: 'Failure Rate', align: 'right', sortable: true },
  { key: 'totalFailureCost', label: 'Failure Cost', align: 'right', sortable: true },
  { key: 'argosServiceCost', label: 'ARGOS Cost', align: 'right', sortable: true },
  { key: 'savings', label: 'Savings', align: 'right', sortable: true },
  { key: 'roiPercentage', label: 'ROI (%)', align: 'right', sortable: true },
] as const;
```

**Sort Toggle Logic:**
```typescript
const handleSort = (column: keyof AnalysisRowData) => {
  if (sortColumn === column) {
    setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
  } else {
    setSortColumn(column);
    setSortDirection('desc');
  }
};
```

### UX Spec Visual Layout Reference

```
Process Comparison Table (from UX Spec line 1008-1013)
┌────────────────────────────────────────────────────────────────────────┐
│ Process Comparison                                                      │
├──────────────┬───────┬──────────┬───────────┬──────────┬────────┬──────┤
│ Process Name │ Pumps │ Fail.Rate│ Fail.Cost │ ARGOS Cost│ Savings│ ROI  │
├──────────────┼───────┼──────────┼───────────┼──────────┼────────┼──────┤
│ Poly Etch ►  │   10  │   10,0 % │  €1 003 000│   €25 000│€677 100│2708%│
│ Metal Dep ►  │   15  │    8,0 % │    €750 000│   €37 500│€487 500│1300%│
│ CMP Batch ►  │    6  │    5,0 % │    €300 000│   €15 000│€195 000│1300%│
├──────────────┼───────┼──────────┼───────────┼──────────┼────────┼──────┤
│                                   Sorted by: Savings ↓               │
└──────────────────────────────────────────────────────────────────────────┘

Visual Notes:
- Alternating row colors: white / bg-gray-50
- Row hover: bg-gray-100
- Process Name: text link style (hover:underline, cursor-pointer)
- ROI column: traffic-light color (green/orange/red) + font-semibold
- Sort indicator: ↑ (ascending) or ↓ (descending) next to active column header
- Horizontal scroll on narrow viewports via overflow-x-auto container
```

### Previous Story Intelligence (Story 4.1)

**From Story 4.1 (Global Analysis View with Aggregated Metrics):**

1. **GlobalAnalysisView component** created at `src/components/global/GlobalAnalysisView.tsx`
   - Subscribes to `analyses` and `globalParams` via Zustand selectors
   - Computes aggregated metrics with `useMemo`
   - Renders hero section with Total Savings, Overall ROI, Total Pumps, Process Count
   - Handles empty state (no calculable analyses)
   - Has `role="region"` and `aria-label="Aggregated ROI metrics"`

2. **AggregatedMetrics calculation** added to `src/lib/calculations.ts`
   - `calculateAggregatedMetrics()` filters to calculable analyses, sums all metrics
   - Already handles edge cases (0 analyses, division by zero, negative savings)

3. **Existing patterns from 4.1:**
   - French locale formatting via `formatCurrency()` and `formatPercentage()`
   - Zustand selectors mandatory (never destructure)
   - useMemo for all derived calculations
   - Per-analysis detection rate override: `analysis.detectionRate ?? globalParams.detectionRate`
   - Named exports only
   - Heading hierarchy: h1 (page) → h2 (sections)

4. **Story 4.2 integration point:** ComparisonTable renders BELOW the hero metrics section, within the same `GlobalAnalysisView` component

### Git Intelligence (Recent Commits)

Recent commit patterns:
- Story-scoped commits: "Complete Story X.Y: [description]"
- Code review fixes in separate commits
- Last commit: `1c41d93` — "Fix Detection Rate input: allow clearing field to type new value"
- Epic 3 fully complete (stories 3.1 through 3.13)
- Epic 4 in-progress (4.1 ready-for-dev)

### Technology Versions (Current)

- React 19.2, TypeScript 5.9, Vite 7.2
- Tailwind CSS v4.1 (use standard classes, avoid `animate-in` without plugin)
- Zustand 5.0, React Router 7.13
- Vitest 4.0 + Testing Library
- ~860 tests passing (Epic 3 complete)

### What NOT to Build in This Story

- **Hero metrics section** — Already in Story 4.1
- **Key Insights section** — Deferred to post-MVP (UX spec Section 3)
- **Charts & Visualization** — V11+ per UX spec (Section 4)
- **Navigation links from comparison rows to Focus Mode sidebar** — Story 4.3 handles session stability
- **PDF Export button on Global Analysis** — Epic 5
- **Pagination** — Max 5 analyses (NFR-P6), no pagination needed

### What to Build Carefully

- **Sort state is local** — Sorting is UI-only state, lives in `useState` within ComparisonTable. NOT in Zustand store.
- **Sorting preserves on re-render** — When globalParams change and rows recalculate, the current sort column/direction must be preserved.
- **Process Name is a link, not the whole row** — Only the process name cell triggers navigation. The rest of the row is informational.
- **Per-analysis detection rate** — Use `analysis.detectionRate ?? globalParams.detectionRate` when computing row data. This was introduced in Story 2.9.

### Edge Cases to Handle

1. **0 calculable analyses** — Table not rendered (handled by conditional in GlobalAnalysisView)
2. **1 analysis** — Table renders with 1 row (still useful for presentation)
3. **All analyses incomplete** — Table not rendered
4. **Negative savings** — Display as negative number with red color
5. **Very long process names** — Truncate with ellipsis or allow wrapping
6. **Sort by Process Name** — Use localeCompare for string sorting
7. **Sort by ROI when ROI = 0** — Zero is valid, sorts correctly as number

### Project Structure Notes

- Alignment with unified project structure: all files in correct directories per architecture.md
- ComparisonTable goes in `src/components/global/` (matches architecture specification)
- Per-analysis calculation helper added to existing `src/lib/calculations.ts` (not new file)
- Type added to existing `src/types/index.ts` (not new file)
- Integration into existing GlobalAnalysisView (MODIFY, don't recreate)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.2: Comparison Table Side-by-Side]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Mode "Global Analysis" — Section 2: Process Comparison Table (lines 1008-1013)]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#ComparisonTable component (line 420)]
- [Source: _bmad-output/planning-artifacts/architecture.md#Component Architecture — ComparisonTable.tsx]
- [Source: _bmad-output/planning-artifacts/architecture.md#FR Category to File Mapping — Aggregation (FR35-FR38)]
- [Source: _bmad-output/implementation-artifacts/4-1-global-analysis-view-with-aggregated-metrics.md] (previous story context)
- [Source: argos-roi-calculator/src/lib/calculations.ts] (existing pure functions, getROIColorClass)
- [Source: argos-roi-calculator/src/lib/utils.ts] (formatCurrency, formatPercentage)
- [Source: argos-roi-calculator/src/lib/constants.ts] (ROI_NEGATIVE_THRESHOLD, ROI_WARNING_THRESHOLD)
- [Source: argos-roi-calculator/src/types/index.ts] (Analysis, GlobalParams, CalculationResult)
- [Source: argos-roi-calculator/src/stores/app-store.ts] (store shape, selectors, setActiveAnalysis)
- [Source: argos-roi-calculator/src/components/analysis/ResultsPanel.tsx] (ROI color coding pattern)
- [Source: argos-roi-calculator/src/components/analysis/AnalysisCard.tsx] (navigation pattern: setActiveAnalysis before navigate)
- [Source: argos-roi-calculator/src/components/navigation/MiniCard.tsx] (compact display, navigation)
- [Source: argos-roi-calculator/src/components/global/GlobalAnalysisView.tsx] (integration point — add table below hero)

## Test Estimates

- Per-analysis row calculation tests: +7 tests (valid, incomplete, detection rate override, all rows, empty, 5 analyses)
- ComparisonTable component tests: +20 tests (render columns, row data, colors, sorting default/toggle, keyboard sort, click navigation, keyboard navigation, scroll container, alternating rows, hover, accessibility, empty state)
- GlobalAnalysisView integration tests: +4 tests (table renders, table hidden when no data, navigation from table, update on param change)
- Page-level integration tests: +5 tests (full flow, param change, sort interaction, mixed data, navigation)
- **Total new tests: ~36**
- **Expected total: ~928 tests** (892 baseline from 4.1 + 36 story 4.2)

## Time Estimates

- Task 1 (Per-analysis calculation helpers + types): 15 min
- Task 2 (ComparisonTable component + tests): 40 min
- Task 3 (GlobalAnalysisView integration): 15 min
- Task 4 (Barrel export): 2 min
- Task 5 (Integration tests): 15 min
- Task 6 (Accessibility audit): 10 min
- **Dev total: ~97 min (~1.6h)**
- Exploration (3 agents //): 5 min
- Architecture (3 agents //): 5 min
- Code review (3 agents //): 5 min
- Fixes (HIGH+MEDIUM): 15-20 min
- **Grand total: ~2.1h (~127 min)**

## Definition of Done

- [ ] All tasks completed and code committed
- [ ] All tests pass: `npm test -- --run` (~928+ tests)
- [ ] Code review completed (3 parallel agents: simplicity/bugs/conventions)
- [ ] 100% of HIGH + MEDIUM issues fixed
- [ ] No console.log statements in production code
- [ ] Accessibility verified: WCAG AA compliant (semantic table, scope, aria-sort, keyboard, color+number)
- [ ] Performance verified: table rendering <100ms with 5 analyses
- [ ] Story marked as "ready-for-dev" → "done" in sprint-status.yaml
- [ ] Git commit prepared (NOT pushed, awaiting user validation)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- GlobalAnalysisView tests required MemoryRouter wrapping after adding useNavigate
- Integration test for global param change needed getAllByText due to duplicate €50,000 in hero + table

### Completion Notes List

- Task 1: Added `AnalysisRowData` interface to types/index.ts, `calculateAnalysisRow()` and `calculateAllAnalysisRows()` to calculations.ts with 7 tests
- Task 2: Created ComparisonTable component with sorting, navigation, accessibility, ROI traffic-light colors, 27 tests
- Task 3: Integrated ComparisonTable into GlobalAnalysisView with useMemo rows, useCallback navigation handler, 4 new integration tests
- Task 4: Updated barrel export in components/global/index.ts
- Task 5: Updated page-level integration tests with 7 tests (full flow, navigation, sort, mixed data, param change)
- Task 6: Accessibility audit passed (semantic table, scope, aria-sort, keyboard nav, color+number), ESLint clean, TypeScript strict, no console.log

### Change Log

- 2026-02-11: Implemented Story 4.2 — ComparisonTable side-by-side with sorting, navigation, accessibility, traffic-light ROI colors
- 2026-02-11: Code review (Opus 4.6) — 4 MEDIUM fixed: extracted getEffectiveWaferQuantity helper (DRY), added mono wafer test for calculateAnalysisRow, added string sort test for Process Name column, removed redundant handleNameKeyDown on button element

### File List

- argos-roi-calculator/src/types/index.ts (MODIFIED — added AnalysisRowData interface)
- argos-roi-calculator/src/lib/calculations.ts (MODIFIED — added calculateAnalysisRow, calculateAllAnalysisRows)
- argos-roi-calculator/src/lib/calculations.test.ts (MODIFIED — added 7 tests for new functions)
- argos-roi-calculator/src/components/global/ComparisonTable.tsx (NEW — comparison table component)
- argos-roi-calculator/src/components/global/ComparisonTable.test.tsx (NEW — 27 component tests)
- argos-roi-calculator/src/components/global/GlobalAnalysisView.tsx (MODIFIED — integrated ComparisonTable)
- argos-roi-calculator/src/components/global/GlobalAnalysisView.test.tsx (MODIFIED — added router wrapper + 4 integration tests)
- argos-roi-calculator/src/components/global/index.ts (MODIFIED — added ComparisonTable export)
- argos-roi-calculator/src/pages/GlobalAnalysis.integration.test.tsx (MODIFIED — expanded to 7 tests with table coverage)
