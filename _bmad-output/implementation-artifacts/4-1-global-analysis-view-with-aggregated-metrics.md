# Story 4.1: Global Analysis View with Aggregated Metrics

Status: done

## Story

**As a** user (Marc viewing the aggregated impact),
**I want** to see total savings and overall ROI across all my analyses on the Global Analysis page,
**So that** I can understand the full business impact of ARGOS across all analyzed processes — the "power moment" that creates the memorable anchor for internal championing.

## Acceptance Criteria

### AC1: Hero Metrics Display with Aggregated Calculations
**Given** I have 3 analyses with complete data (all required fields filled)
**When** I navigate to Global Analysis (/global)
**Then** I see a hero metrics section with:
- "Total Savings" — sum of savings across all analyses — displayed in large typography (36-40px Bold)
- "Overall ROI" — calculated as (Total Savings / Total Service Cost) x 100 — displayed in large typography (36-40px Bold) with traffic-light color coding
- "Total Pumps Monitored" — sum of all pumpQuantity values
- "Processes Analyzed" — count of analyses (analyses.length)
**And** the Total Savings value is formatted with EUR symbol and thousand separators (French locale)
**And** the Overall ROI displays with 1 decimal place and "%" suffix
**And** the hero metrics section has a light gray background card with generous padding (space-2xl = 48px)

### AC2: Supporting Metrics Display
**Given** the hero metrics section is rendered
**When** I see the supporting metrics below the hero numbers
**Then** I see:
- "Total Failure Cost" — sum of totalFailureCost across all analyses — displayed in 20px Medium
- "Total Service Cost" — sum of argosServiceCost across all analyses — displayed in 20px Medium
**And** both values are formatted with EUR symbol and French locale thousand separators

### AC3: Traffic-Light Color Coding for Overall ROI
**Given** the Overall ROI is calculated
**When** the value is < 0% → display in red (text-red-600)
**When** the value is 0-15% → display in orange (text-orange-500)
**When** the value is > 15% → display in green (text-green-600)
**And** this matches the same threshold constants used in ResultsPanel (ROI_NEGATIVE_THRESHOLD, ROI_WARNING_THRESHOLD)

### AC4: Empty State Placeholder
**Given** I have 0 analyses
**When** I navigate to Global Analysis (/global)
**Then** I see a placeholder message: "No analyses yet — create one first"
**And** I see a CTA button: "Create Analysis"
**And** clicking the button navigates to Dashboard (/)
**And** the hero metrics section is NOT rendered

### AC5: Partial Data Handling
**Given** I have 3 analyses but only 2 have complete data (one has missing required fields)
**When** I navigate to Global Analysis
**Then** only the 2 calculable analyses are included in the aggregation
**And** the "Processes Analyzed" count shows "2" (not 3)
**And** a note below the hero section indicates: "1 analysis excluded (incomplete data)"

### AC6: Real-Time Updates
**Given** I am on the Global Analysis page
**When** a global parameter changes (service cost in GlobalSidebar)
**Then** all aggregated metrics update immediately (<100ms, NFR-P1)
**And** no loading spinner or delay is visible
**When** I navigate back from Focus Mode after editing an analysis
**Then** the Global Analysis reflects the updated values

### AC7: Performance with 5 Concurrent Analyses
**Given** I have 5 analyses with complete data (NFR-P6 maximum)
**When** I navigate to Global Analysis
**Then** all aggregated calculations complete and display within 100ms
**And** no UI freezing or layout shift occurs during calculation

### AC8: Page Title and Navigation Context
**Given** I navigate to /global
**When** the page loads
**Then** the document title is set to "Global Analysis — ARGOS ROI Calculator"
**And** the "Global Analysis" nav item in NavigationBar is highlighted
**And** the GlobalSidebar is visible on the left (via AppLayout)

### AC9: Accessibility (WCAG AA)
**Given** the Global Analysis page is rendered
**Then** the hero metrics section has `role="region"` and `aria-label="Aggregated ROI metrics"`
**And** each metric card has a visible label and value properly associated
**And** color is NOT the only indicator — all ROI values show numerical values alongside color coding
**And** the page has a proper heading hierarchy: h1 "Global Analysis", h2 for sections
**And** keyboard users can tab through interactive elements in logical order

**FRs Covered:** FR35 (view Global Analysis), FR36 (total savings), FR37 (weighted ROI)
**NFRs Addressed:** NFR-P1 (<100ms calculations), NFR-P6 (5 concurrent analyses)

## Tasks / Subtasks

### Task 1: Create Aggregation Calculation Functions (AC: 1, 2, 5, 7)
- [x] Add to `argos-roi-calculator/src/lib/calculations.ts`:
  - `calculateAggregatedMetrics(analyses: Analysis[], globalParams: GlobalParams): AggregatedMetrics`
    - Filter analyses to only calculable ones using existing `isAnalysisCalculable()`
    - Calculate per-analysis results using existing pure functions
    - Sum: totalSavings, totalServiceCost, totalFailureCost, totalPumps
    - Count: calculableCount, excludedCount
    - Calculate: overallROI = (totalSavings / totalServiceCost) x 100 (handle division by zero → 0)
    - Return all aggregated values
  - Pure function, no side effects, testable

- [x] Add `AggregatedMetrics` interface to `argos-roi-calculator/src/types/index.ts`:
  ```typescript
  interface AggregatedMetrics {
    totalSavings: number
    totalServiceCost: number
    totalFailureCost: number
    totalPumps: number
    overallROI: number
    processCount: number
    excludedCount: number
  }
  ```

- [x] Create tests in `argos-roi-calculator/src/lib/calculations.test.ts`:
  - Test with 0 analyses → all zeros
  - Test with 1 analysis → values match single analysis
  - Test with 3 analyses → correct sums
  - Test with mixed (2 calculable + 1 incomplete) → excludes incomplete
  - Test with 5 analyses → correct totals (NFR-P6)
  - Test division by zero (totalServiceCost = 0) → overallROI = 0
  - Test with negative savings → correct negative totals
  - Test performance: 5 analyses <100ms (use performance.now())

### Task 2: Create GlobalAnalysisView Component (AC: 1, 2, 3, 8, 9)
- [x] Create `argos-roi-calculator/src/components/global/GlobalAnalysisView.tsx`:
  - Subscribe to store via selectors: `useAppStore(state => state.analyses)`, `useAppStore(state => state.globalParams)`
  - Compute aggregated metrics using `useMemo` (memoize with [analyses, globalParams] deps)
  - Call `calculateAggregatedMetrics(analyses, globalParams)` inside useMemo
  - Render hero section with:
    - Container: `bg-gray-50 rounded-xl p-8 md:p-12` (generous padding)
    - Total Savings: `text-4xl font-bold` with `formatCurrency()` and green color if positive
    - Overall ROI: `text-4xl font-bold` with `getROIColorClass()` and `formatPercentage()`
    - Total Pumps: `text-2xl font-semibold text-gray-700`
    - Processes Analyzed: `text-2xl font-semibold text-gray-700`
  - Render supporting metrics:
    - Total Failure Cost and Total Service Cost in `text-xl font-medium text-gray-600`
    - Formatted with `formatCurrency()`
  - Excluded analyses note if excludedCount > 0
  - `role="region"` and `aria-label="Aggregated ROI metrics"` on hero section
  - Heading hierarchy: section uses `<h2>` tags

- [x] Create `argos-roi-calculator/src/components/global/GlobalAnalysisView.test.tsx`:
  - Test renders hero metrics with correct values for 3 analyses
  - Test Total Savings formatting (EUR with separators)
  - Test Overall ROI color coding: negative (red), warning (orange), positive (green)
  - Test Total Pumps displays sum
  - Test Processes Analyzed displays count
  - Test supporting metrics (Total Failure Cost, Total Service Cost)
  - Test excluded analysis note when incomplete data
  - Test accessibility: role="region", aria-label, heading hierarchy
  - Test empty state (0 calculable analyses shows no hero section)

### Task 3: Update GlobalAnalysis Page (AC: 4, 6, 8)
- [x] Modify `argos-roi-calculator/src/pages/GlobalAnalysis.tsx`:
  - Import GlobalAnalysisView component
  - Subscribe to analyses count via selector: `useAppStore(state => state.analyses.length)`
  - Conditional render:
    - If analyses.length === 0 → render PlaceholderMessage with:
      - message: "No analyses yet — create one first"
      - actionText: "Create Analysis"
      - onAction: navigate to "/" (Dashboard)
    - If analyses.length > 0 → render GlobalAnalysisView
  - Keep document title useEffect: "Global Analysis — ARGOS ROI Calculator"
  - Page heading: `<h1 className="text-2xl font-semibold mb-6">Global Analysis</h1>`

- [x] Update `argos-roi-calculator/src/pages/GlobalAnalysis.test.tsx`:
  - Test empty state: placeholder message renders when 0 analyses
  - Test CTA button navigates to Dashboard
  - Test GlobalAnalysisView renders when analyses exist
  - Test page title is set correctly
  - Test h1 heading present

### Task 4: Update Global Component Barrel Export (AC: all)
- [x] Update `argos-roi-calculator/src/components/global/index.ts`:
  - Export GlobalAnalysisView

### Task 5: Integration Testing (AC: 6, 7)
- [x] Create `argos-roi-calculator/src/pages/GlobalAnalysis.integration.test.tsx`:
  - Test full flow: add 3 analyses to store → navigate to /global → verify aggregated values
  - Test global param change → metrics update
  - Test add analysis → navigate to /global → count increases
  - Test incomplete analysis excluded from aggregation

### Task 6: Accessibility and Code Quality Audit (AC: 9)
- [x] Accessibility verification:
  - Hero section: role="region", aria-label
  - Heading hierarchy: h1 (page), h2 (sections)
  - Color not sole indicator (numbers + colors)
  - Keyboard navigation: tab to CTA button in empty state
- [x] Code quality:
  - Remove ALL console.log statements
  - TypeScript strict mode passes
  - ESLint passes with no warnings
  - Named exports only
  - Zustand selectors (never destructure store)

## Dev Notes

### Critical Context — "The Power Moment"

This story implements the **make-or-break moment #2** from the UX spec: when Marc sees aggregated savings across all processes (e.g., "EUR 3.8M total savings"). This is designed to be the most visually impactful section of the entire application — "screenshot-worthy" and memorable.

**Design priority:** Results are the hero. The numbers get the most visual prominence, strongest typography (36-40px Bold), and traffic-light color treatment. Everything else serves the numbers.

### Architecture Patterns to Follow

**Component Location:**
- Page: `src/pages/GlobalAnalysis.tsx` (already exists as placeholder — MODIFY, don't recreate)
- View component: `src/components/global/GlobalAnalysisView.tsx` (NEW)
- Calculation logic: `src/lib/calculations.ts` (ADD aggregation function)
- Types: `src/types/index.ts` (ADD AggregatedMetrics interface)

**State Management Pattern (Zustand):**
```typescript
// CORRECT - use selectors
const analyses = useAppStore(state => state.analyses)
const globalParams = useAppStore(state => state.globalParams)

// WRONG - never destructure
const { analyses, globalParams } = useAppStore()
```

**Calculation Memoization Pattern:**
```typescript
const aggregated = useMemo(
  () => calculateAggregatedMetrics(analyses, globalParams),
  [analyses, globalParams]
)
```

**Format Functions (already exist — REUSE, do NOT recreate):**
- `formatCurrency(amount)` from `src/lib/utils.ts` — formats as "€125 000"
- `formatPercentage(value, fractionDigits)` from `src/lib/utils.ts`
- `getROIColorClass(roi)` from `src/lib/calculations.ts` — returns Tailwind class

**ROI Color Thresholds (already defined — REUSE):**
```typescript
// From src/lib/constants.ts
ROI_NEGATIVE_THRESHOLD = 0    // < 0% = text-red-600
ROI_WARNING_THRESHOLD = 15    // 0-15% = text-orange-500
                              // > 15% = text-green-600
```

**PlaceholderMessage Component (already exists — REUSE):**
```typescript
import { PlaceholderMessage } from '@/components/PlaceholderMessage'
// Props: message, actionText?, onAction?
```

### Existing Component Patterns to Follow

**ResultsPanel Pattern** (for metric display consistency):
- Uses `useId()` for tooltip IDs
- Displays "--" when values can't be calculated
- Applies color classes dynamically
- Uses `formatCurrency()` and `formatPercentage()` for display

**MiniCard Pattern** (for condensed metric display):
- Shows savings + ROI badge with color dot
- Uses `useMemo` for calculation performance
- Traffic-light color dot: green/orange/red circle

**Dashboard Empty State Pattern:**
- Centered flex container
- SVG icon, heading, subheading, CTA button
- Follow same visual style

### Aggregation Calculation Logic

**Per the UX spec and epic requirements:**

```typescript
// Filter to only calculable analyses
const calculable = analyses.filter(isAnalysisCalculable)

// Per-analysis calculations using existing functions
for each analysis:
  totalFailureCost = calculateTotalFailureCost(...)
  argosServiceCost = calculateArgosServiceCost(pumps, globalParams.serviceCostPerPump)
  detectionRate = analysis.detectionRate ?? globalParams.detectionRate
  savings = calculateSavings(totalFailureCost, argosServiceCost, detectionRate)

// Aggregation
totalSavings = sum of all savings
totalServiceCost = sum of all argosServiceCost
totalFailureCost = sum of all totalFailureCost
totalPumps = sum of all pumpQuantity
overallROI = totalServiceCost > 0 ? (totalSavings / totalServiceCost) * 100 : 0
processCount = calculable.length
excludedCount = analyses.length - calculable.length
```

**Key edge cases:**
- Division by zero when totalServiceCost = 0 → return overallROI = 0
- Per-analysis detection rate override (Story 2.9): use `analysis.detectionRate ?? globalParams.detectionRate`
- Negative savings: valid case, display in red
- 0 calculable analyses with >0 total analyses: show empty state message

### UX Spec Visual Layout Reference

```
┌──────────────────────────────────────────────────────┐
│  Global Analysis — 3 Processes                        │
├─────────────────────────────────────────────────────── │
│                                                        │
│  ┌──────────────────────────────────────────────┐     │
│  │  HERO SECTION (bg-gray-50, rounded-xl, p-12)  │     │
│  │                                                │     │
│  │  Total Savings        Overall ROI              │     │
│  │  €3,780,000           156.2%                   │     │
│  │  (36-40px, Bold)      (36-40px, Bold, green)   │     │
│  │                                                │     │
│  │  Total Pumps: 26    Processes: 3               │     │
│  │  (20px, semibold)   (20px, semibold)           │     │
│  │                                                │     │
│  │  ──────────────────────────────────────────    │     │
│  │  Total Failure Cost: €5,150,000                │     │
│  │  Total Service Cost: €65,000                   │     │
│  │  (20px, medium, gray-600)                      │     │
│  └──────────────────────────────────────────────┘     │
│                                                        │
│  (Comparison Table will be added in Story 4.2)        │
│                                                        │
└──────────────────────────────────────────────────────┘
```

### Previous Epic Learnings (Epic 3 Retrospective)

**Key patterns established in Epic 3 to follow:**
1. **Zustand selectors mandatory** — Never destructure store. Always `useAppStore(state => state.field)`
2. **useMemo for calculations** — All derived calculations must be memoized
3. **French locale formatting** — `formatCurrency()` uses `Intl.NumberFormat('fr-FR')` — already handles EUR symbol and thousand separators correctly
4. **Per-analysis detection rate override** — Use `analysis.detectionRate ?? globalParams.detectionRate` (Story 2.9 pattern)
5. **Named exports only** — No default exports
6. **Co-located tests** — Test file next to source file
7. **Remove ALL console.log** before commit
8. **WCAG AA accessibility** — aria-label, role, heading hierarchy
9. **Tailwind class order** — Layout -> Spacing -> Typography -> Colors -> Effects

**From Epic 3 retro (2026-02-11):**
- Test count at ~860 tests after all Epic 3 stories
- English UI labels (Story 3.5 completed full translation)
- ModifiedFieldHighlight CSS refactoring pattern (Story 3.12)
- ServiceCostInput extracted as shared component (Story 3.9)

### Git Intelligence (Recent Commits)

Recent commit patterns show:
- Story-scoped commits with clear naming: "Complete Story X.Y: [description]"
- Code review fixes in separate commits
- Sprint status updates tracked in commits
- Last commit: `1c41d93` — "Fix Detection Rate input: allow clearing field to type new value"

### Technology Versions (Current)

- React 19.2, TypeScript 5.9, Vite 7.2
- Tailwind CSS v4.1 (use standard classes, avoid `animate-in` without plugin)
- Zustand 5.0, React Router 7.13
- Vitest 4.0 + Testing Library
- ~860 tests passing (Epic 3 complete)

### What NOT to Build in This Story

- **Comparison Table** — Story 4.2 (side-by-side process comparison)
- **Navigation links to individual analyses** — Story 4.3
- **Key Insights section** — Deferred to post-MVP
- **Charts & Visualization** — V11+ per UX spec
- **PDF Export button** — Epic 5

### Project Structure Notes

- Alignment with unified project structure: all files in correct directories per architecture.md
- GlobalAnalysisView goes in `src/components/global/` (matches architecture specification)
- Page-level component remains in `src/pages/GlobalAnalysis.tsx` (modify existing)
- Aggregation function added to existing `src/lib/calculations.ts` (not new file)
- Type added to existing `src/types/index.ts` (not new file)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.1: Global Analysis View with Aggregated Metrics]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Mode "Global Analysis" — Agrégation Multi-Analyses]
- [Source: _bmad-output/planning-artifacts/architecture.md#Component Architecture]
- [Source: _bmad-output/planning-artifacts/prd.md#Aggregation & Comparison (FR35-FR38)]
- [Source: argos-roi-calculator/src/lib/calculations.ts] (existing pure functions)
- [Source: argos-roi-calculator/src/lib/utils.ts] (formatCurrency, formatPercentage)
- [Source: argos-roi-calculator/src/components/analysis/ResultsPanel.tsx] (display pattern)
- [Source: argos-roi-calculator/src/pages/GlobalAnalysis.tsx] (current placeholder to modify)
- [Source: argos-roi-calculator/src/stores/app-store.ts] (store structure, selectors)
- [Source: argos-roi-calculator/src/types/index.ts] (Analysis, GlobalParams interfaces)

## Test Estimates

- Aggregation calculation tests: +10 tests (0 analyses, 1, 3, 5, mixed, edge cases, performance)
- GlobalAnalysisView component tests: +12 tests (render, formatting, colors, accessibility, excluded note)
- GlobalAnalysis page tests: +6 tests (empty state, CTA, render view, title, heading)
- Integration tests: +4 tests (full flow, param change, add analysis, exclusion)
- **Total new tests: ~32**
- **Expected total: ~892 tests** (860 baseline + 32 story 4.1)

## Time Estimates

- Task 1 (Aggregation functions + types): 20 min
- Task 2 (GlobalAnalysisView component): 30 min
- Task 3 (GlobalAnalysis page update): 15 min
- Task 4 (Barrel export): 2 min
- Task 5 (Integration tests): 15 min
- Task 6 (Accessibility audit): 10 min
- **Dev total: ~92 min (~1.5h)**
- Exploration (3 agents //): 5 min
- Architecture (3 agents //): 5 min
- Code review (3 agents //): 5 min
- Fixes (HIGH+MEDIUM): 15-20 min
- **Grand total: ~2h (~120 min)**

## Definition of Done

- [ ] All tasks completed and code committed
- [ ] All tests pass: `npm test -- --run` (~892+ tests)
- [ ] Code review completed (3 parallel agents: simplicity/bugs/conventions)
- [ ] 100% of HIGH + MEDIUM issues fixed
- [ ] No console.log statements in production code
- [ ] Accessibility verified: WCAG AA compliant (role, aria-label, headings, color+number)
- [ ] Performance verified: aggregation <100ms with 5 analyses
- [ ] Story marked as "ready-for-dev" → "done" in sprint-status.yaml
- [ ] Git commit prepared (NOT pushed, awaiting user validation)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- No blocking issues encountered during implementation

### Completion Notes List

- Task 1: Added `AggregatedMetrics` interface to `types/index.ts` and `calculateAggregatedMetrics()` pure function to `calculations.ts`. 12 new unit tests covering 0/1/3/5 analyses, mixed calculable/incomplete, division by zero, negative savings, per-analysis detection rate, mono wafer type, and performance (<100ms).
- Task 2: Created `GlobalAnalysisView.tsx` component with hero metrics (Total Savings, Overall ROI, Total Pumps, Processes Analyzed), supporting metrics (Total Failure Cost, Total Service Cost), traffic-light ROI color coding, excluded analyses note, and full WCAG AA accessibility. 19 component tests.
- Task 3: Updated `GlobalAnalysis.tsx` page to conditionally render empty state (PlaceholderMessage with CTA) or GlobalAnalysisView based on analyses count. Updated document title to use em dash per AC8. 8 page tests.
- Task 4: Created barrel export `components/global/index.ts`.
- Task 5: Created 4 integration tests covering full flow, global param changes, dynamic analysis count, and incomplete analysis exclusion.
- Task 6: Verified accessibility (role="region", aria-label, heading hierarchy, color+number), code quality (ESLint passes, no console.log, named exports, Zustand selectors).
- Updated App.test.tsx to match new GlobalAnalysis title (em dash) and placeholder text.

### Change Log

- 2026-02-11: Story 4.1 implementation complete — Global Analysis View with aggregated metrics, 43 new tests (932 total)
- 2026-02-11: Code review (adversarial) — 0 HIGH, 3 MEDIUM, 3 LOW found. All 3 MEDIUM fixed:
  - M1: Added incomplete data message when all analyses have missing fields (was showing empty page)
  - M2: Replaced fragile `getByText(/%/)` selectors with scoped `within()` queries in GlobalAnalysisView.test.tsx
  - M3: Replaced fragile single-digit selectors with scoped `within()` queries in GlobalAnalysis.integration.test.tsx
  - 932 tests passing post-fix. Story marked done.

### File List

- argos-roi-calculator/src/types/index.ts (MODIFIED — added AggregatedMetrics interface)
- argos-roi-calculator/src/lib/calculations.ts (MODIFIED — added calculateAggregatedMetrics function and imports)
- argos-roi-calculator/src/lib/calculations.test.ts (MODIFIED — added 12 aggregation tests)
- argos-roi-calculator/src/components/global/GlobalAnalysisView.tsx (NEW — hero metrics component)
- argos-roi-calculator/src/components/global/GlobalAnalysisView.test.tsx (NEW — 19 component tests)
- argos-roi-calculator/src/components/global/index.ts (NEW — barrel export)
- argos-roi-calculator/src/pages/GlobalAnalysis.tsx (MODIFIED — conditional render, em dash title, h1 heading)
- argos-roi-calculator/src/pages/GlobalAnalysis.test.tsx (NEW — 8 page tests)
- argos-roi-calculator/src/pages/GlobalAnalysis.integration.test.tsx (NEW — 4 integration tests)
- argos-roi-calculator/src/App.test.tsx (MODIFIED — updated title and placeholder text assertions)
- _bmad-output/implementation-artifacts/sprint-status.yaml (MODIFIED — story status)
- _bmad-output/implementation-artifacts/4-1-global-analysis-view-with-aggregated-metrics.md (MODIFIED — story file)
