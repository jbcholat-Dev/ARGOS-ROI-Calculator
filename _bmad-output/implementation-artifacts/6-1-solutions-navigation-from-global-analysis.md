# Story 6.1: Solutions Navigation from Global Analysis

Status: done

## Story

As a **user (JB presenting to Marc during a client meeting)**,
I want to **transition to Solutions directly from Global Analysis with a prominent CTA button**,
So that **I can capture technical deployment specifications while the client is engaged and the ROI justification is fresh in their mind**.

## Acceptance Criteria

### AC1: Solutions CTA Button Visibility
**Given** I am on Global Analysis (/global) with at least one calculable analysis
**When** I see the page content below the ComparisonTable
**Then** I see a prominent "Configure ARGOS Solution" button (primary CTA style)
**And** the button uses Pfeiffer red (#CC0000) with large size styling
**And** the button is visually distinct as a call-to-action (not inline with table)

### AC2: Solutions Button Navigation
**Given** I see the "Configure ARGOS Solution" button on Global Analysis
**When** I click the button
**Then** I navigate to /solutions
**And** navigation completes within 200ms (NFR-P4)
**And** my ROI analyses remain intact in the Zustand store
**And** the NavigationBar highlights "Solutions" as the active tab

### AC3: Solutions Button Disabled State (No Analyses)
**Given** I am on Global Analysis with 0 calculable analyses
**When** the GlobalAnalysisView renders
**Then** the "Configure ARGOS Solution" button is NOT visible
**And** the empty state placeholder is shown instead ("No analyses yet")

### AC4: Data Integrity After Navigation
**Given** I have 3 analyses with complete data and modified global parameters
**When** I click "Configure ARGOS Solution" and navigate to /solutions
**Then** all analysis data remains intact in the store
**And** global parameters (detection rate, service cost) maintain their current values
**When** I navigate back to Global Analysis via NavigationBar
**Then** all hero metrics and ComparisonTable data are unchanged

### AC5: Keyboard Accessibility
**Given** I am on Global Analysis with the "Configure ARGOS Solution" button visible
**When** I Tab to the button
**Then** a visible focus ring appears (Pfeiffer red, 2px ring, offset-2)
**When** I press Enter or Space
**Then** the same navigation occurs as mouse click

### AC6: Solutions Page Placeholder Update
**Given** I have navigated to /solutions from Global Analysis
**When** the Solutions page renders
**Then** I see a placeholder message indicating the solutions module is ready for configuration
**And** the document title shows "Solutions — ARGOS ROI Calculator"

**FRs Covered:** FR45 (Access Solutions from Global Analysis)
**NFRs Addressed:** NFR-P4 (<200ms navigation)

## Tasks / Subtasks

### Task 1: Add Solutions CTA Button to GlobalAnalysisView (AC: 1, 2, 3)
- [x] Modify `src/components/global/GlobalAnalysisView.tsx`:
  - Import `Button` from `@/components/ui`
  - Import `ROUTES` from `@/lib/constants`
  - Add CTA button section after ComparisonTable
  - Button text: "Configure ARGOS Solution"
  - Use `variant="primary"` and `size="lg"`
  - onClick: `navigate(ROUTES.SOLUTIONS)`
  - Button only renders when `aggregated.processCount > 0` (already implied by component returning null for no data)
  - Wrap in a centered container with top margin for visual separation

### Task 2: Write Tests for Solutions CTA Button (AC: 1, 2, 3, 5)
- [x] Add tests to `src/components/global/GlobalAnalysisView.test.tsx`:
  - Test: CTA button visible when analyses have complete data
  - Test: CTA button text is "Configure ARGOS Solution"
  - Test: Click triggers navigation to /solutions (mockNavigate called with ROUTES.SOLUTIONS)
  - Test: CTA button NOT visible when 0 analyses
  - Test: Button uses primary variant styling (bg-pfeiffer-red)
  - Test: Keyboard Enter triggers navigation
  - Test: Keyboard Space triggers navigation
  - Test: Button has accessible focus ring
  - Test: Button has correct accessible label (aria-label or visible text)

### Task 3: Verify Data Integrity After Navigation (AC: 4)
- [x] Add integration test to `src/components/global/GlobalAnalysisView.test.tsx` or existing NavigationIntegration test:
  - Test: Zustand store state unchanged after Solutions navigation
  - Test: Analyses array identical before and after navigation
  - Test: GlobalParams identical before and after navigation

### Task 4: Verify Solutions Page Placeholder (AC: 6)
- [x] Add/verify test in `src/pages/Solutions.test.tsx`:
  - Test: Solutions page renders placeholder message
  - Test: Document title set correctly

### Task 5: Accessibility and Code Quality Audit (AC: all)
- [x] Verify:
  - Button follows existing focus ring pattern: `focus:ring-2 focus:ring-pfeiffer-red focus:ring-offset-2`
  - No console.log in production code
  - TypeScript strict mode passes
  - ESLint passes with no warnings
  - Tailwind classes follow Layout → Spacing → Typography → Colors → Effects order

## Dev Notes

### Critical Context — This is the FIRST Story in Epic 6 (Solutions Module V11)

This story is the **entry point** for the Solutions Module. It creates the bridge between ROI justification (Epics 1-4) and technical deployment scoping (V11). The key insight:

**Why navigate from Global Analysis?** After seeing aggregated ROI (the "power moment"), the client is maximally engaged. This is the optimal moment to transition to technical scoping. The CTA must feel like a natural "next step" rather than a separate module.

### Architecture Patterns to Follow

**Navigation Pattern (ESTABLISHED in Stories 4.1-4.3):**
```typescript
// For Solutions navigation, simpler pattern — no activeAnalysis to set
const navigate = useNavigate();
const handleNavigateToSolutions = useCallback(() => {
  navigate(ROUTES.SOLUTIONS);
}, [navigate]);
```

**Note:** Unlike Focus Mode navigation (which requires `setActiveAnalysis` BEFORE `navigate`), Solutions navigation is a simple route change. No store mutation needed before navigation.

**Route Constants (ALREADY DEFINED):**
```typescript
import { ROUTES } from '@/lib/constants';
// ROUTES.SOLUTIONS = '/solutions'
```

**Button Component (ALREADY EXISTS):**
```typescript
import { Button } from '@/components/ui';
// Use: <Button variant="primary" size="lg" onClick={handler}>Text</Button>
// Primary variant: bg-pfeiffer-red text-white hover:bg-pfeiffer-red-dark
// Large size: px-8 py-4 text-lg
// Focus ring: focus:ring-2 focus:ring-pfeiffer-red focus:ring-offset-2
```

**Zustand Store Selector Pattern:**
```typescript
// CORRECT — use throughout
const analyses = useAppStore(state => state.analyses);

// NEVER do this:
const { analyses } = useAppStore(); // re-renders on ANY state change
```

### Current GlobalAnalysisView Structure

The component (129 lines) renders in this order:
1. **Hero metrics section** — 4 primary metrics (Total Savings, Overall ROI, Total Pumps, Processes Analyzed) + 2 supporting metrics
2. **Excluded analyses note** — conditional message for incomplete data
3. **ComparisonTable** — side-by-side analysis comparison
4. **[NEW] Solutions CTA button** ← Add HERE, after ComparisonTable

**Insertion point:** After the ComparisonTable `{rows.length > 0 && ...}` block (around line 126), before the closing fragment.

**Component receives no props** — uses Zustand store directly with selectors.

### Existing Test Patterns in GlobalAnalysisView.test.tsx

**Test file:** 394 lines, 44 tests currently

**Helper functions already available:**
```typescript
// createTestAnalysis() — creates mock analysis with all required fields
// mockNavigate = vi.fn() — for navigation assertions
// MemoryRouter wrapping for useNavigate
```

**Test patterns to follow:**
- Use `getByRole('button', { name: 'Configure ARGOS Solution' })` for button queries
- Use `screen.queryByRole` for "not visible" assertions
- Mock navigate with `vi.hoisted(() => vi.fn())` pattern
- Reset store in `beforeEach` with `useAppStore.setState({ analyses: [], ... })`
- Use `within()` for scoped queries when values appear multiple times

### Previous Story Intelligence

**From Story 4.3 (Navigation Links and Session Stability):**
- 1015 tests passing (baseline for Story 6.1)
- Navigation integration patterns verified and tested
- Session stability confirmed over 2+ hours
- Event listener cleanup patterns documented
- Performance: navigation <200ms, calculations <100ms with 5 analyses
- FocusSidebar, NavigationBar, ComparisonTable all have keyboard navigation
- All Zustand subscriptions use selector pattern (no leaks)

**From Story 4.2 (ComparisonTable):**
- Process name buttons use `onNavigateToAnalysis` callback
- ComparisonTable receives `rows` and `onNavigateToAnalysis` as props
- Tests verify navigation handler called with correct ID

**From Story 4.1 (GlobalAnalysisView):**
- `calculateAggregatedMetrics()` returns `processCount`, `totalSavings`, `overallROI`, etc.
- Empty state returns `null` (component doesn't render)
- Hero metrics use `formatCurrency()` and `formatPercentage()` from `@/lib/utils`

### Technology Versions (Current)

- React 19.2, TypeScript 5.9, Vite 7.2
- Tailwind CSS v4.1
- Zustand 5.0, React Router 7.13
- Vitest 4.0 + Testing Library
- **1015 tests passing** (baseline)

### What to Build

1. **One CTA button** in GlobalAnalysisView — primary variant, large size, centered below ComparisonTable
2. **~10-12 new tests** in GlobalAnalysisView.test.tsx
3. **~2-3 tests** verifying Solutions page placeholder (may already exist)

### What NOT to Build

- **SolutionsData interface** — Story 6.2 (pre-filled context)
- **Solutions form fields** — Story 6.3 (technical specifications)
- **Architecture diagram** — Story 6.4
- **Unified PDF export** — Story 6.5
- **Solutions store state** — Not needed yet; Stories 6.2+ will add when form data exists
- **Tooltip component** — Use `title` attribute for disabled tooltip if needed
- **Custom animations** — Use existing Tailwind transitions (`transition-all duration-200`)
- **PDF export button** — Epic 5 scope

### Edge Cases to Handle

1. **Solutions button + empty ComparisonTable** — Button should not appear if no calculable analyses (already handled: GlobalAnalysisView returns null when no data)
2. **Rapid double-click** — React Router handles this gracefully (no duplicate navigation)
3. **Navigation during loading** — Lazy-loaded Solutions page has Suspense fallback
4. **Back button after Solutions** — Standard browser history, no special handling needed
5. **NavigationBar already highlights Solutions** — Verify NavLink active class works on /solutions

### File Structure Notes

**Files to MODIFY (2):**
- `argos-roi-calculator/src/components/global/GlobalAnalysisView.tsx` — Add CTA button (~15 lines)
- `argos-roi-calculator/src/components/global/GlobalAnalysisView.test.tsx` — Add ~10-12 tests

**Files to VERIFY (no changes expected):**
- `argos-roi-calculator/src/pages/Solutions.tsx` — Placeholder already exists
- `argos-roi-calculator/src/components/layout/NavigationBar.tsx` — Solutions tab already exists
- `argos-roi-calculator/src/AppRoutes.tsx` — `/solutions` route already defined
- `argos-roi-calculator/src/lib/constants.ts` — `ROUTES.SOLUTIONS` already defined

**Files to REFERENCE (read-only):**
- `argos-roi-calculator/src/components/ui/Button.tsx` — Button API
- `argos-roi-calculator/src/stores/app-store.ts` — Store shape
- `argos-roi-calculator/src/types/index.ts` — TypeScript interfaces

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 6.1: Solutions Navigation from Global Analysis]
- [Source: _bmad-output/planning-artifacts/architecture.md#Component Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Routing: React Router 6]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Critical Success Moments]
- [Source: _bmad-output/implementation-artifacts/4-3-navigation-links-and-session-stability.md]
- [Source: argos-roi-calculator/src/components/global/GlobalAnalysisView.tsx] (insertion point)
- [Source: argos-roi-calculator/src/components/global/GlobalAnalysisView.test.tsx] (test patterns)
- [Source: argos-roi-calculator/src/components/ui/Button.tsx] (Button API, variants)
- [Source: argos-roi-calculator/src/lib/constants.ts] (ROUTES.SOLUTIONS)
- [Source: argos-roi-calculator/src/pages/Solutions.tsx] (placeholder page)
- [Source: argos-roi-calculator/src/AppRoutes.tsx] (route definitions)
- [Source: argos-roi-calculator/src/stores/app-store.ts] (store shape, selector pattern)

## Test Estimates

- CTA button visibility tests: 3 tests (visible with data, hidden with no data, correct text)
- Navigation tests: 3 tests (click navigates, Enter navigates, Space navigates)
- Styling/accessibility tests: 3 tests (primary variant, focus ring, accessible label)
- Data integrity tests: 2 tests (store unchanged after navigation, global params preserved)
- Solutions page verification: 2 tests (placeholder renders, document title)
- **Total new tests: ~13**
- **Expected total: ~1028 tests** (1015 baseline + 13 story 6.1)

## Time Estimates

- Task 1 (Add CTA button): 10 min
- Task 2 (Button tests): 20 min
- Task 3 (Data integrity tests): 10 min
- Task 4 (Solutions page tests): 5 min
- Task 5 (Accessibility audit): 5 min
- **Dev total: ~50 min**
- Exploration: 5 min (already done in story creation)
- Code review (3 agents //): 5 min
- Fixes (HIGH+MEDIUM): 10 min
- **Grand total: ~1.2h (~70 min)**

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Fixed App.test.tsx: Updated Solutions route test to match new placeholder message text

### Completion Notes List

- Task 1: Added "Configure ARGOS Solution" CTA button to GlobalAnalysisView, positioned below ComparisonTable with centered layout and top margin. Button uses `variant="primary"` (Pfeiffer red) and `size="lg"`. Navigation via `useCallback` + `navigate(ROUTES.SOLUTIONS)`.
- Task 2: Added 6 CTA button tests: visibility with data, click navigation, hidden when empty, hidden when all incomplete data, Enter key nav, Space key nav.
- Task 3: Added 3 data integrity tests: store state reference identity after navigation, analyses array preservation with 3 processes, global params preservation with custom values.
- Task 4: Created `Solutions.test.tsx` with 2 tests: placeholder message text and document title with em dash. Updated `Solutions.tsx` to match AC6 (message: "Solutions module — ready for configuration", title: "Solutions — ARGOS ROI Calculator" with em dash).
- Task 5: Verified ESLint (0 errors), TypeScript strict (0 errors), no console.log, Tailwind class order (Layout → Spacing).
- Updated App.test.tsx to reflect new Solutions placeholder text.
- **11 new tests added** (6 CTA + 3 data integrity + 2 Solutions page)
- **1026 total tests passing** (1015 baseline + 11 new, 0 regressions)

### File List

- `argos-roi-calculator/src/components/global/GlobalAnalysisView.tsx` — Modified: Added Button/ROUTES imports, handleNavigateToSolutions callback, CTA button JSX
- `argos-roi-calculator/src/components/global/GlobalAnalysisView.test.tsx` — Modified: Added 9 tests (6 CTA button + 3 data integrity)
- `argos-roi-calculator/src/pages/Solutions.tsx` — Modified: Updated placeholder message and document title to match AC6
- `argos-roi-calculator/src/pages/Solutions.test.tsx` — Created: 2 tests for placeholder message and document title
- `argos-roi-calculator/src/App.test.tsx` — Modified: Updated Solutions route test to match new placeholder text

## Change Log

- 2026-02-12: Story 6.1 implementation complete — Added "Configure ARGOS Solution" CTA button to GlobalAnalysisView with full test coverage (14 new tests, 1029 total passing)
- 2026-02-12: Code review fixes — Removed 4 redundant/implementation-coupled tests (M2: duplicate text test, M3: 2 className tests on Button internals, M4: trivial toBeEnabled test). Added 1 new test for AC3 edge case (CTA hidden when all analyses incomplete). Net: -3 tests, 1026 total passing.
