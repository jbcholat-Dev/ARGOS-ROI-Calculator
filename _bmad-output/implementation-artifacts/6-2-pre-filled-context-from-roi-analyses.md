# Story 6.2: Pre-filled Context from ROI Analyses

Status: done

## Story

As a **user (JB presenting to Marc during a client meeting)**,
I want **Solutions to auto-populate data from my ROI analyses (total pumps to monitor and process types)**,
So that **I don't re-enter information already captured and the technical scoping builds seamlessly on the ROI justification**.

## Acceptance Criteria

### AC1: Total Pumps Pre-filled from Analyses
**Given** I have 3 analyses: "Poly Etch" (8 pumps, A3004XN), "Metal Dep" (12 pumps, HiPace 300), "CVD" (6 pumps, A3004XN)
**When** I navigate to Solutions (/solutions)
**Then** I see "Total Pumps to Monitor: 26" displayed as pre-filled, read-only text
**And** the value is the sum of `pumpQuantity` across all analyses in the store

### AC2: Pump Model Clustering
**Given** I have analyses with pump types: "Poly Etch" (8x A3004XN), "Metal Dep" (12x HiPace 300), "CVD" (6x A3004XN)
**When** I navigate to Solutions (/solutions)
**Then** I see a clustered breakdown by pump model:
  - "A3004XN: 14 pumps" (8 from Poly Etch + 6 from CVD)
  - "HiPace 300: 12 pumps"
**And** pump models are grouped by `pumpType` with summed `pumpQuantity`
**And** each cluster is visually distinct (e.g., chip/badge or compact list)
**And** the clustering feeds the architecture diagram (Story 6.4) with per-model groupings

### AC3: Process Count and Names
**Given** I have 3 analyses named "Poly Etch", "Metal Dep", "CVD"
**When** I navigate to Solutions (/solutions)
**Then** I see "Processes: 3" as a count
**And** I see the process names listed: "Poly Etch, Metal Dep, CVD"
**And** the list contains all analysis names from the store

### AC4: Visual Distinction of Pre-filled Section
**Given** I am on the Solutions page with pre-filled context
**When** I see the pre-filled section
**Then** it has a visually distinct appearance (gray background `bg-gray-50`, border `border-gray-200`)
**And** it displays a "From ROI Analysis" label/badge to indicate the data source
**And** the values are clearly read-only (not editable inputs)
**And** pump model clusters are displayed as compact chips/badges or a grouped list

### AC5: Dynamic Updates When Analyses Change
**Given** I have navigated to Solutions and see pre-filled context
**When** I navigate back to Dashboard/Focus Mode and modify an analysis (add, delete, rename, change pump count)
**And** I navigate back to Solutions
**Then** the pre-filled values reflect the updated analyses
**And** total pumps recalculates correctly
**And** process list updates to include/exclude modified analyses

### AC6: Empty State Handling
**Given** I have 0 analyses in the store
**When** I navigate to Solutions (/solutions)
**Then** the pre-filled section shows "No analyses yet" or equivalent placeholder
**And** total pumps shows "0" or a dash
**And** pump model clusters section is empty/hidden
**And** processes shows "None" or equivalent

### AC7: Keyboard Accessibility
**Given** I am on the Solutions page with pre-filled context
**When** I Tab through the page
**Then** interactive elements receive proper focus indication
**And** the pre-filled read-only section is NOT focusable (it's display-only)
**And** screen readers announce the pre-filled values with their labels

**FRs Covered:** FR46 (Pre-fill pump count), FR47 (Pre-fill process types)
**NFRs Addressed:** NFR-P4 (<200ms navigation), FR57 (Data integrity between views)

## Tasks / Subtasks

### Task 1: Create PreFilledContext Component (AC: 1, 2, 3, 4, 6)
- [x] Create `src/components/solutions/PreFilledContext.tsx`:
  - Read analyses from Zustand store using selector pattern
  - Compute total pumps: `analyses.reduce((sum, a) => sum + (a.pumpQuantity || 0), 0)`
  - Compute pump model clusters: group analyses by `pumpType`, sum `pumpQuantity` per model
    ```typescript
    const pumpModelClusters = useMemo(() => {
      const clusters = new Map<string, number>();
      analyses.forEach((a) => {
        if (a.pumpType) {
          clusters.set(a.pumpType, (clusters.get(a.pumpType) || 0) + (a.pumpQuantity || 0));
        }
      });
      return Array.from(clusters.entries()); // [['A3004XN', 14], ['HiPace 300', 12]]
    }, [analyses]);
    ```
  - Compute process count and list: `analyses.map(a => a.name).filter(Boolean)`
  - Render read-only display with gray background section
  - Display "From ROI Analysis" badge/label
  - Render pump model clusters as compact chips/badges (e.g., "A3004XN: 14" in pill-shaped elements)
  - Handle empty state (0 analyses)
  - Use `aria-label` for accessibility on the section
- [x] Create `src/components/solutions/PreFilledContext.test.tsx`:
  - Test: Shows total pumps summed from multiple analyses
  - Test: Shows pump model clusters grouped correctly (same model from 2 analyses = summed)
  - Test: Shows each pump model with correct quantity
  - Test: Analyses with empty pumpType are excluded from clusters
  - Test: Shows process count ("Processes: 3")
  - Test: Shows process names listed
  - Test: Shows "From ROI Analysis" label
  - Test: Gray background styling present
  - Test: Empty state when no analyses (no clusters shown)
  - Test: Empty state when analyses have no names
  - Test: Values are not editable (no input elements in section)
  - Test: Correct aria attributes for screen readers

### Task 2: Update Solutions Page to Include PreFilledContext (AC: 1, 2, 3, 4)
- [x] Modify `src/pages/Solutions.tsx`:
  - Replace placeholder content with structured layout
  - Add PreFilledContext component at the top
  - Keep remaining area as placeholder for future stories (6.3 form, 6.4 diagram)
  - Maintain document title "Solutions — ARGOS ROI Calculator"
- [x] Update `src/pages/Solutions.test.tsx`:
  - Test: PreFilledContext renders within Solutions page
  - Test: Document title unchanged
  - Test: Page structure includes pre-filled section

### Task 3: Update Solutions Components Barrel Export (AC: all)
- [x] Update `src/components/solutions/index.ts`:
  - Export PreFilledContext component

### Task 4: Write Dynamic Update Tests (AC: 5)
- [x] Add tests to `src/components/solutions/PreFilledContext.test.tsx`:
  - Test: Values update when store analyses change (add analysis)
  - Test: Values update when analysis is deleted
  - Test: Values update when analysis is renamed
  - Test: Values update when pump quantity changes
  - Test: Total pumps recalculates correctly after store change
  - Test: Pump model clusters update when analysis added with new pumpType
  - Test: Pump model clusters merge correctly when analysis added with existing pumpType

### Task 5: Accessibility and Code Quality Audit (AC: 7, all)
- [x] Verify:
  - Pre-filled section uses semantic HTML (`<section>` or `<div>` with `role="region"`)
  - `aria-label="Pre-filled context from ROI analyses"` on the section
  - Read-only values use `<span>` or `<p>`, NOT `<input readonly>`
  - No console.log in production code
  - TypeScript strict mode passes
  - ESLint passes with no warnings
  - Tailwind classes follow Layout → Spacing → Typography → Colors → Effects order
  - Named exports only (no default exports)

## Dev Notes

### Critical Context — Story 6.2 in Epic 6 (Solutions Module V11)

This story creates the **data bridge** between ROI analyses (Epics 1-4) and the Solutions module (V11). The pre-filled context demonstrates continuity — the client sees their data flowing seamlessly from ROI justification to technical deployment scoping. This is critical for the meeting flow: JB doesn't need to re-enter data, maintaining the conversation's momentum.

**Pump Model Clustering (Added from PO feedback 2026-02-13):** The pump model clustering is critical because it feeds directly into the architecture diagram (Story 6.4). Each pump model cluster corresponds to a physical group of pumps in the subfab that will connect to either a micro-PC (Pilot mode) or the centralized server (Production mode). The clustering logic in this story provides the data foundation for the interactive diagram's pump groupings.

**Key Design Decision:** The pre-filled values are **computed directly from the Zustand store** — NOT stored separately in a SolutionsData interface. This ensures they are always in sync with the current analyses. The SolutionsData interface from architecture.md defines `pumpCount` and `processTypes` as derived fields, but for Story 6.2, we read directly from `analyses[]` to avoid duplication and staleness.

**Story 6.3 will add** the SolutionsData store state for user-editable fields (supervision network, connectivity, infrastructure, notes). Story 6.2 only needs read-only computed values.

### Architecture Patterns to Follow

**Zustand Selector Pattern (MANDATORY):**
```typescript
// CORRECT — use selectors for each piece of state
const analyses = useAppStore((state) => state.analyses);

// NEVER do this:
const { analyses } = useAppStore(); // re-renders on ANY state change
```

**Named Exports (MANDATORY):**
```typescript
// CORRECT
export function PreFilledContext() { ... }

// WRONG
export default function PreFilledContext() { ... }
```

**Tailwind Class Order (MANDATORY):**
```
Layout → Spacing → Typography → Colors → Effects
```

**Component Pattern:**
```typescript
// PreFilledContext.tsx — Pure presentational, reads from store
import { useAppStore } from '@/stores/app-store';

export function PreFilledContext() {
  const analyses = useAppStore((state) => state.analyses);

  const totalPumps = analyses.reduce((sum, a) => sum + (a.pumpQuantity || 0), 0);
  const processNames = analyses.map((a) => a.name).filter(Boolean);

  // ... render read-only display
}
```

### Current Solutions Page Structure

**File:** `src/pages/Solutions.tsx` (Story 6.1 — placeholder)
```typescript
export function Solutions() {
  useEffect(() => {
    document.title = 'Solutions — ARGOS ROI Calculator';
  }, []);

  return (
    <AppLayout>
      <PlaceholderMessage message="Solutions module — ready for configuration" />
    </AppLayout>
  );
}
```

**Modification Plan:** Replace `<PlaceholderMessage>` with:
1. `<PreFilledContext />` — pre-filled data from analyses (THIS STORY)
2. Placeholder for technical form (Story 6.3)
3. Placeholder for architecture diagram (Story 6.4)

### Existing Components Folder

**`src/components/solutions/`** — Currently empty (only `index.ts` with no exports). This is where `PreFilledContext.tsx` will be created.

### Previous Story Intelligence (from Story 6.1)

**Key Learnings:**
- Navigation to /solutions is working and tested (CTA button in GlobalAnalysisView)
- Data integrity between views verified (analyses + globalParams unchanged after navigation)
- 1026 tests passing (baseline for Story 6.2)
- `createTestAnalysis()` helper available in test files for creating mock analyses
- `useAppStore.setState()` used in beforeEach for test setup
- Test file pattern: co-located `*.test.tsx` next to source

**Solutions.test.tsx (from 6.1):**
- Tests: placeholder message text, document title with em dash
- These tests will need updating when placeholder is replaced

**GlobalAnalysisView.test.tsx:**
- 44+ tests, includes CTA button navigation tests
- Mock navigate pattern: `vi.hoisted(() => vi.fn())`
- Store reset in beforeEach

**Files Modified in Story 6.1:**
- `src/components/global/GlobalAnalysisView.tsx` — Added CTA button
- `src/components/global/GlobalAnalysisView.test.tsx` — Added 9 tests
- `src/pages/Solutions.tsx` — Updated placeholder text
- `src/pages/Solutions.test.tsx` — Created with 2 tests
- `src/App.test.tsx` — Updated Solutions route test

### Git Intelligence (Last 5 Commits)

1. `f6df03b` — Complete Story 6.1: Solutions Navigation from Global Analysis (11 new tests)
2. `25059eb` — Reprioritize Epic 6 before Epic 5
3. `717a4ba` — Complete Epic 4 retrospective
4. `e367ef7` — Complete Story 4.3: Navigation Links and Session Stability (40 new tests)
5. `325f364` — Complete Story 4.2: Comparison Table side-by-side

**Patterns from recent commits:**
- Story commits include test count in message
- Code review is adversarial (3 agents in parallel)
- Each story touches 2-5 files typically
- Test count always reported in completion notes

### Technology Versions (Current)

- React 19.2, TypeScript 5.9, Vite 7.2
- Tailwind CSS v4.1
- Zustand 5.0, React Router 7.13
- Vitest 4.0 + Testing Library
- **1026 tests passing** (baseline)

### What to Build

1. **PreFilledContext component** — New component in `src/components/solutions/`
2. **Update Solutions page** — Replace placeholder with PreFilledContext + placeholder for future sections
3. **~15-20 new tests** across PreFilledContext.test.tsx and Solutions.test.tsx updates

### What NOT to Build

- **SolutionsData store state** — Story 6.3 will add editable form fields to store
- **Technical specifications form** — Story 6.3
- **Architecture diagram** — Story 6.4
- **Unified PDF export** — Story 6.5
- **Editable inputs** — Pre-filled values are READ-ONLY in this story
- **Store actions for solutions** — No `updateSolutions()` needed yet
- **Any validation** — Pre-filled values are computed, not user-entered

### Edge Cases to Handle

1. **0 analyses** — Show empty state ("No analyses yet", pumps: 0 or "--", no clusters)
2. **Analyses with missing names** — Filter out empty/undefined names from process list
3. **Analyses with 0 pump quantity** — Include in sum (0 + others = correct total)
4. **Single analysis** — Process list shows single name without comma, single cluster
5. **5 analyses (max)** — All names displayed, comma-separated, may wrap on narrow viewport
6. **Very long analysis names** — Truncate or wrap gracefully (CSS `break-words`)
7. **Analysis with undefined pumpQuantity** — Default to 0 in sum calculation
8. **Navigation back and forth** — Values always reflect current store state (no caching)
9. **Analyses with empty pumpType** — Exclude from pump model clusters (don't show empty key)
10. **Multiple analyses with same pumpType** — Merge into single cluster with summed quantity
11. **All analyses with same pumpType** — Show single cluster matching total pumps

### Project Structure Notes

**Files to CREATE (2):**
- `argos-roi-calculator/src/components/solutions/PreFilledContext.tsx` — New component (~40-60 lines)
- `argos-roi-calculator/src/components/solutions/PreFilledContext.test.tsx` — New tests (~120-180 lines)

**Files to MODIFY (3):**
- `argos-roi-calculator/src/pages/Solutions.tsx` — Replace placeholder with PreFilledContext + future placeholders
- `argos-roi-calculator/src/pages/Solutions.test.tsx` — Update tests for new content
- `argos-roi-calculator/src/components/solutions/index.ts` — Add PreFilledContext export

**Files to REFERENCE (read-only):**
- `argos-roi-calculator/src/stores/app-store.ts` — Store shape, selector pattern
- `argos-roi-calculator/src/types/index.ts` — Analysis interface
- `argos-roi-calculator/src/components/ui/Card.tsx` — Card component API (for section styling)
- `argos-roi-calculator/src/components/global/GlobalAnalysisView.tsx` — Pattern reference for reading analyses
- `argos-roi-calculator/src/lib/utils.ts` — Formatting utilities (formatNumber if available)
- `argos-roi-calculator/src/lib/constants.ts` — Any relevant constants

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 6.2: Pre-filled Context from ROI Analyses]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Models — SolutionsData interface]
- [Source: _bmad-output/planning-artifacts/architecture.md#Component Architecture — solutions/]
- [Source: _bmad-output/planning-artifacts/architecture.md#State Management Patterns — Zustand selectors]
- [Source: _bmad-output/implementation-artifacts/6-1-solutions-navigation-from-global-analysis.md]
- [Source: argos-roi-calculator/src/pages/Solutions.tsx] (current placeholder)
- [Source: argos-roi-calculator/src/pages/Solutions.test.tsx] (existing tests)
- [Source: argos-roi-calculator/src/components/solutions/index.ts] (empty barrel export)
- [Source: argos-roi-calculator/src/stores/app-store.ts] (store shape, Analysis[])
- [Source: argos-roi-calculator/src/types/index.ts] (Analysis interface)
- [Source: argos-roi-calculator/src/components/global/GlobalAnalysisView.tsx] (pattern: reading analyses from store)

## Test Estimates

- PreFilledContext basic rendering: 3 tests (total pumps, process count+names, "From ROI Analysis" label)
- Pump model clustering: 4 tests (grouped correctly, summed quantities, empty pumpType excluded, single model)
- Visual distinction: 2 tests (gray background section, read-only nature)
- Empty state: 2 tests (no analyses, analyses with missing names)
- Dynamic updates: 7 tests (add, delete, rename, pump change, recalculation, cluster add new model, cluster merge existing model)
- Accessibility: 2 tests (aria attributes, no focusable read-only elements)
- Solutions page integration: 3 tests (PreFilledContext renders, title preserved, page structure)
- **Total new tests: ~23**
- **Expected total: ~1049 tests** (1026 baseline + 23 story 6.2)

## Time Estimates

- Task 1 (PreFilledContext component + pump model clustering + tests): 40 min
- Task 2 (Solutions page update + tests): 15 min
- Task 3 (Barrel export): 2 min
- Task 4 (Dynamic update tests incl. cluster updates): 20 min
- Task 5 (Accessibility audit): 5 min
- **Dev total: ~82 min (~1.4h)**
- Exploration: 5 min (already done)
- Code review (3 agents //): 5 min
- Fixes (HIGH+MEDIUM): 10 min
- **Grand total: ~1.7h (~102 min)**

## Change Log

- 2026-02-13: Story 6.2 implementation complete — PreFilledContext component with pump model clustering, dynamic updates, accessibility, and 23 new tests (1026 → 1049)
- 2026-02-13: Code review fixes (4 MEDIUM) — Tailwind class order, AC6 empty state with dash/None values, scoped test assertions, Solutions page heading. Total tests: 1051

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- No issues encountered during implementation

### Completion Notes List

- Created PreFilledContext component reading analyses from Zustand store via selector pattern
- Implemented pump model clustering with Map-based grouping by pumpType, rendered as pill-shaped badges
- Total pumps computed as sum of all analyses' pumpQuantity
- Process count and names derived from analysis names with empty-name filtering
- Empty state handled: dash "—" for total pumps, "None" for processes, pump models section hidden when 0 analyses
- Visual distinction: bg-gray-50 background, border-gray-200, "From ROI Analysis" blue badge
- Semantic HTML: `<section>` with aria-label, read-only `<p>` and `<span>` elements (no inputs)
- Solutions page updated: replaced PlaceholderMessage with PreFilledContext inside structured layout
- Barrel export updated in solutions/index.ts
- App.test.tsx updated to reflect new Solutions page content (replaced placeholder text assertion with region role assertion)
- All values are computed directly from store (no separate state), ensuring AC5 dynamic updates work automatically
- ESLint passes with no errors on all modified files
- **25 new tests** (23 PreFilledContext + 4 Solutions page, net +25 from baseline)
- **1051 total tests passing**, 0 regressions
- Code review: Fixed 4 MEDIUM issues (Tailwind class order, AC6 empty state, scoped assertions, page heading)

### File List

**Files Created (2):**
- argos-roi-calculator/src/components/solutions/PreFilledContext.tsx
- argos-roi-calculator/src/components/solutions/PreFilledContext.test.tsx

**Files Modified (4):**
- argos-roi-calculator/src/pages/Solutions.tsx
- argos-roi-calculator/src/pages/Solutions.test.tsx
- argos-roi-calculator/src/components/solutions/index.ts
- argos-roi-calculator/src/App.test.tsx
