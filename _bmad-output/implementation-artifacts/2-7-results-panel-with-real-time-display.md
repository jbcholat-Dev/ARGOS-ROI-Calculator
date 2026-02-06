# Story 2.7: Results Panel with Real-Time Display

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

**As a** user (Marc watching, JB entering data during a live client meeting),
**I want** to see ROI results update instantly as data is entered,
**So that** I can witness the business case being built in real-time — the "first results" critical success moment.

## Acceptance Criteria

### AC1: Results Panel Structure (4 Metric Cards)
**Given** I am in Focus Mode for an analysis
**When** I see the ResultsPanel section below the input fields
**Then** I see four metric cards arranged vertically:
  1. "Coût Total des Pannes" (Total Failure Cost)
  2. "Coût du Service ARGOS" (ARGOS Service Cost)
  3. "Économies Réalisées" (Savings / Delta)
  4. "ROI" (Return on Investment percentage)
**And** each card has a label, a hero number (large typography 36-40px), and a supporting unit/context line
**And** the section has heading "Résultats" with semantic HTML (`<section aria-label="Résultats">`)

### AC2: Incomplete Data Handling
**Given** I am in Focus Mode with partial or empty inputs
**When** I see the ResultsPanel
**Then** metric cards that cannot be calculated show "--" as placeholder value
**And** a subtle informational message appears: "Complétez les données pour voir les résultats"
**And** the ARGOS Service Cost card shows a value as soon as pump quantity > 0 (only depends on pumpQuantity + global serviceCostPerPump)
**And** the panel never shows NaN, Infinity, or broken formatting

### AC3: Real-Time Calculation Display
**Given** all required inputs are filled (pumpQuantity > 0, failureRate > 0, waferCost > 0, downtimeDuration > 0, downtimeCostPerHour > 0)
**When** any input field value changes
**Then** all four metrics recalculate and display updated values instantly (<100ms, NFR-P1)
**And** no "Calculate" button is needed — updates are automatic on state change
**And** values use French number formatting with EUR symbol (e.g., "€1 003 000")
**And** ROI displays as percentage with one decimal place (e.g., "2 708,4 %")

### AC4: Hero Number Typography
**Given** calculated results are displayed
**Then** "Coût Total des Pannes" displays in large typography (36-40px bold) as the "Risk" anchor
**And** "Économies Réalisées" displays in large typography (36-40px bold) as the "Value" revelation
**And** "ROI" displays in large bold typography (36-40px) as the "Proof"
**And** "Coût du Service ARGOS" displays in smaller typography (24px) as supporting context
**And** all hero numbers are readable from 2-3 meters distance during a meeting

### AC5: ROI Traffic-Light Color Coding
**Given** ROI is calculated and displayed
**When** ROI < 0%
**Then** the ROI value displays in red (`text-red-600`) — negative ROI, ARGOS costs more than it saves
**When** ROI >= 0% and ROI < 15%
**Then** the ROI value displays in orange (`text-orange-500`) — marginal business case
**When** ROI >= 15%
**Then** the ROI value displays in green (`text-green-600`) — strong business case
**And** the color uses `getROIColorClass()` from `@/lib/calculations`

### AC6: Savings Color Coding
**Given** Savings are calculated and displayed
**When** savings are positive (> 0)
**Then** the savings value displays in green (`text-green-600`)
**When** savings are negative (< 0)
**Then** the savings value displays in red (`text-red-600`)
**When** savings are exactly 0
**Then** the savings value displays in neutral gray

### AC7: Formula Tooltip on Hover (FR29)
**Given** I see a calculated metric
**When** I hover over a metric card (or click an info icon)
**Then** I see a tooltip showing the calculation formula used:
  - Total Failure Cost: "(pumps × failure rate) × (wafer cost × wafers/batch + downtime hours × cost/hour)"
  - ARGOS Service Cost: "pumps × service cost per pump"
  - Savings: "failure cost × detection rate - service cost"
  - ROI: "(savings / service cost) × 100"
**And** tooltips are accessible via keyboard focus (Tab navigation)
**And** tooltips use `aria-describedby` for screen reader support

### AC8: Integration with FocusMode Page
**Given** I navigate to Focus Mode (/analysis/:id)
**When** the page loads
**Then** ResultsPanel appears below all input sections (Equipment, Failure Rate, Wafer, Downtime)
**And** ResultsPanel is visually separated from inputs with spacing and distinct card styling
**And** ResultsPanel renders within the same page scroll context (no separate page or modal)

**FRs Covered:** FR24 (Instant recalculation), FR29 (View calculation formulas)
**NFRs Addressed:** NFR-P1 (<100ms calculations), NFR-S1 (client-side only)

## Tasks / Subtasks

### Task 1: Create ResultsPanel Component (AC: 1, 2, 3, 4, 5, 6)
- [x] Create `src/components/analysis/ResultsPanel.tsx`
  - Export named component `ResultsPanel`
  - TypeScript interface `ResultsPanelProps`:
    - `analysisId: string` — ID of the analysis to display results for
  - Subscribe to Zustand store using selector pattern:
    - `const analysis = useAppStore((state) => state.analyses.find((a) => a.id === analysisId))`
    - `const globalParams = useAppStore((state) => state.globalParams)`
  - Import and call calculation functions from `@/lib/calculations`:
    - `calculateTotalFailureCost(analysis.pumpQuantity, analysis.failureRatePercentage, analysis.waferCost, analysis.waferQuantity, analysis.downtimeDuration, analysis.downtimeCostPerHour)`
    - `calculateArgosServiceCost(analysis.pumpQuantity, globalParams.serviceCostPerPump)`
    - `calculateSavings(totalFailureCost, argosServiceCost, globalParams.detectionRate)`
    - `calculateROI(savings, argosServiceCost)`
    - `getROIColorClass(roiPercentage)`
  - Determine data completeness:
    - `isFullyCalculable`: ALL inputs > 0 (pumpQuantity, failureRatePercentage, waferCost, downtimeDuration, downtimeCostPerHour)
    - `canCalculateServiceCost`: pumpQuantity > 0 (partial calculation possible)
  - Handle `waferQuantity` logic:
    - If `waferType === 'mono'`, `waferQuantity` is 1 (always)
    - If `waferType === 'batch'`, `waferQuantity` comes from analysis field (default 125)
  - Render 4 metric cards with appropriate visual hierarchy:
    - Card 1: "Coût Total des Pannes" — hero number, neutral color, `/an` suffix
    - Card 2: "Coût du Service ARGOS" — smaller font, neutral color, `/an` suffix
    - Card 3: "Économies Réalisées" — hero number, green/red based on positive/negative
    - Card 4: "ROI" — hero number, traffic-light color, "%" suffix
  - Format numbers using French locale:
    - Use `toLocaleString('fr-FR')` for thousand separators (spaces in French)
    - Prefix with "€" for monetary values
    - Suffix with "/an" for annual values
    - ROI: one decimal place with "%" suffix
  - Show "--" placeholder for uncalculable metrics
  - Show informational text when data incomplete: "Complétez les données pour voir les résultats"
  - Guard against null analysis: `if (!analysis) return null`
  - Use semantic HTML: `<section>`, `<h2>`, `<h3>`, `<p>`
  - Use `clsx` for conditional class composition
  - Follow Tailwind class organization: Layout → Spacing → Typography → Colors → Effects

- [x] Create `src/components/analysis/ResultsPanel.test.tsx`
  - Test component renders with correct heading "Résultats"
  - Test all 4 metric labels are displayed
  - Test "--" placeholder when no data entered (all zeros)
  - Test "--" placeholder for partial data (only pump quantity entered)
  - Test ARGOS Service Cost shows value when only pumpQuantity > 0
  - Test all metrics show calculated values with complete data
  - Test Total Failure Cost calculation correctness with known inputs
  - Test ARGOS Service Cost calculation correctness
  - Test Savings calculation correctness
  - Test ROI calculation correctness
  - Test ROI color: red class for negative ROI
  - Test ROI color: orange class for ROI between 0-15%
  - Test ROI color: green class for ROI >= 15%
  - Test Savings color: green for positive savings
  - Test Savings color: red for negative savings
  - Test French number formatting (thousand separators with spaces)
  - Test EUR symbol presence on monetary values
  - Test "/an" suffix on annual values
  - Test ROI percentage formatting (one decimal, % symbol)
  - Test component renders null when analysis not found
  - Test real-time update: change pumpQuantity → results update
  - Test real-time update: change globalParams.detectionRate → results update
  - Test performance: render + calculation completes <100ms
  - Test semantic HTML: section element with aria-label
  - Test incomplete data message appears when inputs missing
  - Minimum 25 tests

### Task 2: Create Formula Tooltip Component (AC: 7)
- [x] Create tooltip implementation for formula display
  - Option A: Create lightweight `FormulaTooltip` sub-component within ResultsPanel file
  - Option B: Use CSS-only tooltip with `title` attribute + custom styled `::after` pseudo-element
  - **Recommended: Option A** — small component with controlled visibility
  - Implementation:
    - Props: `formula: string`, `children: React.ReactNode`
    - Render info icon (ⓘ) next to metric label
    - On hover/focus: show tooltip with formula text
    - Use `aria-describedby` linking info icon to tooltip content
    - Tooltip positioning: above or beside the metric card
    - Tooltip styling: dark background (`bg-gray-800`), white text, rounded, small shadow
    - Keyboard accessible: tooltip visible on focus (via `focus-within` or onFocus handler)
  - Formula text constants (in English for clarity):
    - Total Failure Cost: `"(pumps × failure rate %) × (wafer cost × wafers/batch + downtime hours × cost/hour)"`
    - ARGOS Service Cost: `"pumps × service cost per pump/year"`
    - Savings: `"failure cost × detection rate % − service cost"`
    - ROI: `"(savings ÷ service cost) × 100"`

- [x] Add tooltip tests to `ResultsPanel.test.tsx`
  - Test info icon renders next to each metric label
  - Test tooltip appears on hover
  - Test tooltip appears on keyboard focus
  - Test tooltip contains correct formula text for each metric
  - Test aria-describedby links correctly
  - Test tooltip disappears on mouse leave / blur
  - Minimum 6 tests

### Task 3: Integrate ResultsPanel in FocusMode Page (AC: 8)
- [x] Update `src/pages/FocusMode.tsx`
  - Import `ResultsPanel` from `@/components/analysis`
  - Add ResultsPanel after the last input section (DowntimeInputs)
  - Wrap in a visually distinct card container:
    ```jsx
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <ResultsPanel analysisId={id} />
    </div>
    ```
  - Add spacing between inputs and results: `mt-8` or `gap-8` on parent flex container
  - Ensure ResultsPanel receives the same `id` from route params as input components
- [x] Update `src/pages/FocusMode.test.tsx` (if exists)
  - Test ResultsPanel renders within FocusMode page
  - Test ResultsPanel receives correct analysisId prop
  - Test complete flow: inputs → calculation → results display
  - Add 3-5 integration tests

### Task 4: Update Barrel Export (AC: All)
- [x] Update `src/components/analysis/index.ts`
  - Add export: `export { ResultsPanel } from './ResultsPanel';`
  - Ensure named export pattern is followed

### Task 5: Create Integration Tests (AC: All)
- [x] Create `src/components/analysis/ResultsPanel.integration.test.tsx`
  - Test complete flow: render FocusMode → enter all inputs → verify results display
  - Test real-time update flow:
    1. Render ResultsPanel with analysis that has partial data
    2. Update pumpQuantity in store → verify ARGOS Service Cost updates
    3. Update all remaining fields → verify all 4 metrics update
    4. Change globalParams.detectionRate → verify Savings and ROI update
  - Test edge case: very large numbers (no overflow, proper formatting)
  - Test edge case: negative savings scenario (service cost > avoided costs)
  - Test edge case: zero ROI scenario (savings exactly equal to zero)
  - Minimum 5 integration tests

## Dev Notes

### Critical Integration Point — This is the "First Results" Success Moment

Story 2.7 is the **culmination of Epic 2**. It connects:
- Story 2.1: Analysis creation (provides analysisId)
- Story 2.2: Equipment inputs (pumpType, pumpQuantity)
- Story 2.3: Failure rate inputs (failureRatePercentage, failureRateMode)
- Story 2.4: Wafer inputs (waferType, waferQuantity, waferCost)
- Story 2.5: Downtime inputs (downtimeDuration, downtimeCostPerHour)
- Story 2.6: Calculation engine (all 5 pure functions)

This is the **"first results appear"** critical success moment from the UX spec — where Marc (the client) sees his operational data transformed into quantified business value for the first time.

### UX Design: 3-Act Narrative Structure

The ResultsPanel follows a deliberate narrative structure from the UX design specification:

**Act 1 — The Risk (Coût Total des Pannes)**
- Presents the total cost of pump failures WITHOUT ARGOS
- Creates emotional anchor: "This is what you're currently losing"
- Neutral color (dark gray) — factual presentation of risk
- Largest hero number to grab attention

**Act 2 — The Value (Économies Réalisées)**
- Shows net savings WITH ARGOS service
- Positive = green (savings achieved), Negative = red (costs exceed savings)
- Includes supporting line showing ARGOS Service Cost
- Creates the "aha" moment: "This is what you'd save"

**Act 3 — The Proof (ROI)**
- Final ROI percentage with traffic-light color coding
- Green (>= 15%): "Strong candidate for ARGOS"
- Orange (0-15%): "Marginal — may need discussion"
- Red (< 0%): "Not cost-effective at current parameters"
- This is what Marc will remember and report to management

### Calculation Functions (From Story 2.6 — Already Implemented)

All functions are in `src/lib/calculations.ts` and are fully tested (57 tests):

```typescript
import {
  calculateTotalFailureCost,
  calculateArgosServiceCost,
  calculateSavings,
  calculateROI,
  getROIColorClass,
} from '@/lib/calculations';
```

**Function Signatures:**
```typescript
calculateTotalFailureCost(
  pumpQuantity: number,
  failureRate: number,       // percentage (0-100)
  waferCost: number,         // EUR per wafer
  wafersPerBatch: number,    // 1 for mono, 125 default for batch
  downtimeHours: number,     // hours per failure
  downtimeCostPerHour: number // EUR/hour
): number

calculateArgosServiceCost(
  pumpQuantity: number,
  serviceCostPerPump: number // EUR/year from globalParams
): number

calculateSavings(
  totalFailureCost: number,
  argosServiceCost: number,
  detectionRate: number      // percentage (0-100) from globalParams
): number  // CAN BE NEGATIVE

calculateROI(
  savings: number,
  argosServiceCost: number
): number  // CAN BE NEGATIVE, returns 0 if serviceCost is 0

getROIColorClass(roi: number): string
// Returns: 'text-red-600' | 'text-orange-500' | 'text-green-600'
```

**Edge Cases Already Handled by Calculation Functions:**
- Returns 0 for invalid inputs (negative, NaN, Infinity)
- Division by zero protected in calculateROI
- Percentage validation (0-100 range) via `isValidPercentage()`
- All functions are pure (no side effects)

### Zustand Store Access Pattern (CRITICAL)

**ALWAYS use selectors:**
```typescript
// ✅ CORRECT — only re-renders when this specific data changes
const analysis = useAppStore((state) =>
  state.analyses.find((a) => a.id === analysisId)
);
const globalParams = useAppStore((state) => state.globalParams);

// ❌ WRONG — re-renders on ANY state change
const { analyses, globalParams } = useAppStore();
```

**Analysis Interface Fields Used by ResultsPanel:**
```typescript
interface Analysis {
  id: string;
  pumpQuantity: number;           // From EquipmentInputs (Story 2.2)
  failureRatePercentage: number;  // From FailureRateInput (Story 2.3)
  waferType: 'mono' | 'batch';   // From WaferInputs (Story 2.4)
  waferQuantity: number;          // From WaferInputs (Story 2.4) - 1 for mono, default 125 for batch
  waferCost: number;              // From WaferInputs (Story 2.4)
  downtimeDuration: number;       // From DowntimeInputs (Story 2.5)
  downtimeCostPerHour: number;    // From DowntimeInputs (Story 2.5)
}
```

**GlobalParams Fields Used:**
```typescript
interface GlobalParams {
  detectionRate: number;         // default: 70 (%)
  serviceCostPerPump: number;    // default: 2500 (EUR/year)
}
```

### Data Completeness Logic

**Full calculation requires ALL of these to be > 0:**
- `analysis.pumpQuantity`
- `analysis.failureRatePercentage`
- `analysis.waferCost`
- `analysis.downtimeDuration`
- `analysis.downtimeCostPerHour`

**Partial calculation possible:**
- ARGOS Service Cost only needs `pumpQuantity > 0` (always shows if pumps entered)
- Global params always have defaults (detectionRate=70, serviceCostPerPump=2500)

**Implementation:**
```typescript
const isFullyCalculable =
  analysis.pumpQuantity > 0 &&
  analysis.failureRatePercentage > 0 &&
  analysis.waferCost > 0 &&
  analysis.downtimeDuration > 0 &&
  analysis.downtimeCostPerHour > 0;

const canShowServiceCost = analysis.pumpQuantity > 0;
```

### Number Formatting (French Locale)

**Pattern from existing components (WaferInputs, DowntimeInputs):**
```typescript
// French formatting: spaces as thousand separators, comma as decimal
const formatCurrency = (value: number): string => {
  return `€${value.toLocaleString('fr-FR')}`;
};

// Examples:
// 1003000 → "€1 003 000"
// 25000 → "€25 000"
// 2708.4 → "2 708,4"
```

**ROI Formatting:**
```typescript
const formatROI = (roi: number): string => {
  return `${roi.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;
};
// Example: 2708.4 → "2 708,4 %"
```

### FocusMode Integration Point

**Current FocusMode layout (`src/pages/FocusMode.tsx`, 92 lines):**
```jsx
<AppLayout>
  <div className="mx-auto max-w-3xl p-6">
    <EditableAnalysisName analysisId={id} />
    <div className="flex flex-col gap-6">
      {/* Input cards - each wrapped in white card container */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <EquipmentInputs analysisId={id} />
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <FailureRateInput analysisId={id} />
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <WaferInputs analysisId={id} />
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <DowntimeInputs analysisId={id} />
      </div>
      {/* ADD RESULTS PANEL HERE — after all inputs */}
    </div>
  </div>
</AppLayout>
```

**Integration approach:**
- Add ResultsPanel as the LAST card in the flex column
- Use same card container pattern for visual consistency
- Add slightly more spacing (`mt-2` or larger gap) to create visual separation between inputs and results
- ResultsPanel receives same `analysisId` from route params

### Styling Patterns (From Existing Components)

**Card container pattern:**
```jsx
<div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
  {/* Content */}
</div>
```

**Section heading pattern:**
```jsx
<h2 className="mb-4 text-lg font-semibold text-gray-900">
  Section Title
</h2>
```

**Conditional classes with clsx:**
```typescript
import { clsx } from 'clsx';

className={clsx(
  'text-4xl font-bold',
  savings > 0 && 'text-green-600',
  savings < 0 && 'text-red-600',
  savings === 0 && 'text-gray-500',
)}
```

**Tailwind class organization (ENFORCED):**
Layout → Spacing → Typography → Colors → Effects
```
"flex flex-col gap-4 p-6 text-4xl font-bold text-green-600 transition-colors"
```

### Accessibility Requirements (WCAG AA)

From Epic 1 retrospective: **60% of stories had accessibility issues**. MUST address proactively:

1. **Semantic HTML:**
   - `<section aria-label="Résultats">` for the results panel wrapper
   - `<h2>` for "Résultats" heading
   - `<h3>` for individual metric labels
   - `<p>` for values

2. **ARIA for tooltips:**
   - Each metric card: `aria-describedby="formula-{metric-name}"`
   - Tooltip content: `id="formula-{metric-name}" role="tooltip"`
   - Info icon: `aria-label="Voir la formule de calcul"`

3. **Color not sole indicator:**
   - ROI traffic-light colors are supplemented by the numeric value itself
   - Screen readers announce the value + percentage, not just the color

4. **Focus management:**
   - Info icons are focusable (tabIndex or button element)
   - Tooltip appears on both hover AND focus
   - No keyboard traps

### Testing Requirements

**Unit Test Coverage (ResultsPanel.test.tsx):**
- Rendering: 5 tests (structure, labels, heading, null analysis guard, incomplete message)
- Calculation display: 4 tests (each metric with known values)
- Color coding: 5 tests (ROI red/orange/green, savings green/red)
- Number formatting: 4 tests (EUR, French locale, ROI %, annual suffix)
- Incomplete data: 3 tests (all zeros, partial data, service cost only)
- Real-time updates: 3 tests (input change, global param change, performance)
- Accessibility: 2 tests (semantic HTML, aria attributes)
- **Subtotal: ~26 tests**

**Tooltip Tests:**
- Tooltip rendering: 3 tests (hover, focus, formula text)
- Tooltip accessibility: 3 tests (aria-describedby, keyboard navigation, disappears)
- **Subtotal: ~6 tests**

**Integration Tests (ResultsPanel.integration.test.tsx):**
- Complete flow: 2 tests (enter all data → see results, change global params → results update)
- Edge cases: 3 tests (negative savings, very large numbers, zero inputs)
- **Subtotal: ~5 tests**

**Total: ~37 tests minimum**

**Test Setup Pattern (from existing stories):**
```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '@/stores/app-store';
import { ResultsPanel } from './ResultsPanel';

describe('ResultsPanel', () => {
  beforeEach(() => {
    // Reset store to default state
    useAppStore.getState().resetStore?.() || useAppStore.setState({
      analyses: [],
      activeAnalysisId: null,
      globalParams: { detectionRate: 70, serviceCostPerPump: 2500 },
    });
  });

  // Tests here...
});
```

**Known Testing Patterns from Previous Stories:**
- Use `useAppStore.setState()` for direct store manipulation in tests
- Use `screen.getByText()` for finding rendered values
- Use `screen.getByRole('heading')` for semantic queries
- Test performance with `performance.now()` before/after render
- Wrap store updates in `act()` when testing real-time updates
- Use `waitFor()` for async re-render assertions

### Performance Requirements (NFR-P1)

**Target: All calculations + render update < 100ms on any input change**

**Expected Performance:**
- Pure calculation functions: <1ms each (from Story 2.6 benchmarks)
- All 4 calculations in sequence: <5ms total
- React re-render with updated values: <10ms
- Total end-to-end (input change → display update): <50ms

**No Optimization Needed:**
- Calculations are pure math (instant)
- Zustand selectors prevent unnecessary re-renders
- No async operations, no network calls
- No memoization needed (calculations are trivially fast)

### Dependencies

**No New Dependencies Required**

All needed packages are already installed:
- `react` (18+) — Component framework
- `zustand` — State management
- `clsx` — Conditional class composition
- `vitest` + `@testing-library/react` — Testing
- `@testing-library/user-event` — User interaction testing

### File Structure Requirements

**New Files to Create:**
```
src/components/analysis/
├── ResultsPanel.tsx                    # Main component (~150-200 lines)
├── ResultsPanel.test.tsx               # Unit tests (~30+ tests)
└── ResultsPanel.integration.test.tsx   # Integration tests (~5 tests)
```

**Files to Modify:**
```
src/pages/FocusMode.tsx                 # Add ResultsPanel import + render
src/components/analysis/index.ts        # Add ResultsPanel export
```

**No Changes Needed:**
- `src/lib/calculations.ts` — Already complete (Story 2.6)
- `src/types/index.ts` — Already has CalculationResult interface
- `src/stores/app-store.ts` — Already has all needed state + actions

### Project Structure Notes

- ResultsPanel follows the same pattern as all input components (EquipmentInputs, WaferInputs, etc.)
- Component receives `analysisId: string` prop (same as all Epic 2 components)
- Component subscribes to store using selector pattern (consistent with all components)
- Component lives in `src/components/analysis/` (per architecture.md component boundaries)
- Exported via barrel file `src/components/analysis/index.ts`

### Blocking Dependencies

**Story 2.7 DEPENDS ON (ALL DONE):**
- Story 2.1: Analysis creation and store integration (provides analysisId)
- Story 2.2: Equipment input fields (provides pumpQuantity)
- Story 2.3: Failure rate input (provides failureRatePercentage)
- Story 2.4: Wafer type and cost inputs (provides waferType, waferQuantity, waferCost)
- Story 2.5: Downtime input fields (provides downtimeDuration, downtimeCostPerHour)
- Story 2.6: ROI Calculation Engine (provides all 5 calculation functions)

**Story 2.7 is the LAST functional story in Epic 2** (Story 2.8 rename/indicator is already done).

**Story 2.7 Completion = Epic 2 DONE** (all 8 stories complete → ready for retrospective)

### Git Intelligence

**Recent Commit Patterns (from git log):**
```
93d903c Add Context Window Status communication pattern to CLAUDE.md
9d99cc8 Add Parallel Development learnings to CLAUDE.md (Epic 2 session)
a7640af Complete Story 2.5: Downtime Input Fields
2634069 Complete Story 2.2: Equipment Input Fields (Pump Type, Quantity)
96622b4 Complete Story 2.4: Wafer Type and Cost Inputs
9ff51f3 Complete Story 2.8: Analysis Rename and Active State Indicator
```

**Expected Commit for Story 2.7:**
```
Complete Story 2.7: Results Panel with Real-Time Display

- Add ResultsPanel component with 4 metric cards (3-Act Narrative: Risk, Value, Proof)
- Implement real-time ROI calculation display using pure functions from calculations.ts
- Add traffic-light color coding for ROI (red/orange/green) and savings (green/red)
- Add formula tooltips with keyboard accessibility (FR29)
- Integrate ResultsPanel into FocusMode page below input sections
- French number formatting with EUR symbol and thousand separators
- Handle incomplete data gracefully with "--" placeholders
- Create comprehensive tests (37+ tests, 100% passing)
- Export ResultsPanel from analysis barrel

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

**Files Expected in Commit:**
- New: `src/components/analysis/ResultsPanel.tsx`
- New: `src/components/analysis/ResultsPanel.test.tsx`
- New: `src/components/analysis/ResultsPanel.integration.test.tsx`
- Modified: `src/pages/FocusMode.tsx`
- Modified: `src/components/analysis/index.ts`

### V9 Reference (Read-Only)

**V9 Results Display:**
- File: `calculateur-argos/src/components/PredictiveMaintenanceROICalculator.jsx`
- V9 displayed results inline within each of the 3 segments (Regular, Bottleneck, Batch)
- V9 used tables for results, not hero numbers
- V9 had no tooltip for formulas

**V10 Improvements over V9:**
- Hero number typography (readable from distance during meeting)
- 3-Act Narrative structure (emotional progression)
- Traffic-light color coding (instant visual feedback)
- Formula tooltips (transparency for technical audience)
- Per-process granularity instead of fixed 3 segments
- French number formatting for European clients

### French Localization (UI Text)

**Section Title:**
- "Résultats"

**Metric Labels:**
- "Coût Total des Pannes" (Total Failure Cost)
- "Coût du Service ARGOS" (ARGOS Service Cost)
- "Économies Réalisées" (Savings)
- "ROI" (same in French)

**Supporting Text:**
- "/an" suffix for annual values
- "Complétez les données pour voir les résultats" (incomplete data message)

**Tooltip Info Icon:**
- `aria-label="Voir la formule de calcul"` (View calculation formula)

**Notes:**
- All user-facing text is in French (per client requirements)
- Code, comments, and tests remain in English

### References

**Source Documents:**
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 2 - Story 2.7]
- [Source: _bmad-output/planning-artifacts/prd.md#FR24, FR29]
- [Source: _bmad-output/planning-artifacts/architecture.md#Component Architecture - ResultsPanel]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Flow Patterns]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#3-Act Narrative]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Results Display Strategy]
- [Source: _bmad-output/implementation-artifacts/2-6-roi-calculation-engine.md#Integration with Story 2.7]
- [Source: _bmad-output/implementation-artifacts/2-1-analysis-creation-modal-and-store-integration.md#Store Integration]

**External Resources:**
- Number.toLocaleString('fr-FR'): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString
- ARIA Tooltip Pattern: https://www.w3.org/WAI/ARIA/apd/patterns/tooltip/
- Zustand Selectors: https://github.com/pmndrs/zustand#selecting-multiple-state-slices

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

No debug issues encountered.

### Completion Notes List

- Created ResultsPanel component (~200 lines) with 4 metric cards following 3-Act Narrative (Risk, Value, Proof)
- Implemented FormulaTooltip sub-component with hover/focus visibility and WCAG-compliant aria-describedby (conditional)
- All 5 calculation functions from Story 2.6 integrated: calculateTotalFailureCost, calculateArgosServiceCost, calculateSavings, calculateROI, getROIColorClass
- French number formatting with EUR symbol, /an suffix, ROI one decimal place with %
- Traffic-light color coding: ROI (red/orange/green), Savings (green/red/gray)
- Incomplete data handling: "--" placeholders, partial service cost display, informational message
- Integrated ResultsPanel into FocusMode page after all input sections
- Barrel export updated with ResultsPanel + type export
- Code review: 6 issues found (2 HIGH, 3 MEDIUM, 1 LOW), all HIGH and MEDIUM fixed
  - HIGH #1: Fixed aria-describedby referencing non-existent tooltip element when hidden
  - HIGH #2: Fixed negative currency formatting from "€-X" to "-€X"
  - MEDIUM #3: Added mono wafer type test verifying waferQuantity=1 override
  - MEDIUM #4: Added ResultsPanel barrel export test
  - MEDIUM #5: Fixed tooltip overflow by replacing whitespace-nowrap with max-w-xs
- 36 unit tests + 6 tooltip tests + 5 integration tests + 3 FocusMode tests + 2 barrel tests = 52 new tests
- Total test count: 649 (from 603), all passing, 0 regressions

### Change Log

- 2026-02-06: Story 2.7 implementation complete. Created ResultsPanel with real-time calculation display, formula tooltips, and FocusMode integration. Code review fixes applied (5 issues resolved).

### File List

- New: `src/components/analysis/ResultsPanel.tsx` — Main ResultsPanel component + FormulaTooltip sub-component
- New: `src/components/analysis/ResultsPanel.test.tsx` — 36 unit tests + tooltip tests
- New: `src/components/analysis/ResultsPanel.integration.test.tsx` — 5 integration tests
- Modified: `src/pages/FocusMode.tsx` — Added ResultsPanel import and render after DowntimeInputs
- Modified: `src/pages/FocusMode.test.tsx` — Added ResultsPanel mock + 3 integration tests
- Modified: `src/components/analysis/index.ts` — Added ResultsPanel and ResultsPanelProps exports
- Modified: `src/components/analysis/index.test.ts` — Added 2 barrel export tests for ResultsPanel
