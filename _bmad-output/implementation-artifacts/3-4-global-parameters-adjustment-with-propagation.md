# Story 3.4: Global Parameters Adjustment with Propagation

Status: ready-for-dev

## Story

**As a** user (JB),
**I want** to adjust ARGOS detection rate and service cost globally,
**So that** I can negotiate pricing and see impact across all analyses instantly.

## Acceptance Criteria

### AC1: Global Detection Rate Field Display
**Given** I see the GlobalSidebar component
**When** I look for global parameters
**Then** I see a "Detection Rate" field labeled "Taux de détection ARGOS"
**And** it displays the current global value (default 70%)
**And** the field shows a percentage symbol (%)
**And** the field has proper WCAG AA accessibility (label, aria-describedby if needed)

### AC2: Detection Rate Editing and Validation
**Given** I see the Detection Rate field
**When** I click to edit it
**Then** I can input a numeric value
**And** the input accepts values from 0 to 100 (inclusive)
**And** values outside this range are rejected with validation error
**And** the input shows clear validation feedback (border color, error message)
**And** pressing Enter or blurring the field commits the change
**And** pressing Escape cancels the edit and restores previous value

### AC3: Detection Rate Propagation to All Analyses
**Given** I have 3 analyses with different configurations
**When** I change the global detection rate from 70% to 80%
**Then** all analyses that use the global detection rate recalculate immediately
**And** analyses with custom detection rates (per-analysis override) are NOT affected
**And** all visible ROI values, savings, and metrics update within 100ms (NFR-P1)
**And** the Dashboard cards reflect the new values instantly
**And** the Focus Mode results panel updates if currently viewing an analysis
**And** the Global Analysis view (Epic 4) updates if active

### AC4: Global Service Cost Field Display
**Given** I see the GlobalSidebar component
**When** I look for pricing parameters
**Then** I see a "Service Cost" field labeled "Coût service ARGOS (par pompe/an)"
**And** it displays the current global value (default EUR 2,500)
**And** the field shows EUR currency symbol
**And** the field formats numbers with thousand separators (e.g., "2 500 €")
**And** the field has proper WCAG AA accessibility

### AC5: Service Cost Editing and Validation
**Given** I see the Service Cost field
**When** I click to edit it
**Then** I can input a numeric value
**And** the input accepts positive numbers only (no upper limit)
**And** negative values or zero are rejected with validation error
**And** the input shows clear validation feedback
**And** pressing Enter or blurring commits the change
**And** pressing Escape cancels and restores previous value
**And** the value is formatted with thousand separators after commit

### AC6: Service Cost Propagation to All Analyses
**Given** I have 3 analyses with different pump quantities
**When** I change the global service cost from EUR 2,500 to EUR 3,000
**Then** all analyses recalculate ARGOS cost (serviceCost × pumpQuantity)
**And** all ROI calculations update immediately (within 100ms)
**And** all visible displays update: Dashboard cards, Focus Mode, Global Analysis
**And** the propagation handles edge cases: 0 pumps, 100+ pumps, etc.

### AC7: Session Persistence
**Given** I adjust detection rate to 85% and service cost to EUR 3,200
**When** I navigate between pages (Dashboard, Focus Mode, Global Analysis)
**Then** the global parameters remain at 85% and EUR 3,200
**When** I create a new analysis
**Then** it inherits the current global detection rate (85%)
**And** it uses the current service cost (EUR 3,200) for calculations
**When** I refresh the browser (F5)
**Then** the global parameters reset to defaults (70%, EUR 2,500) — session-only persistence

### AC8: PDF Export Integration (Deferred to Epic 5)
**Given** I have adjusted global parameters
**When** I export a PDF (Epic 5 Story 5.1-5.4)
**Then** the PDF reflects the current global detection rate and service cost
**And** the assumptions section lists the global parameters used
**Note:** Full implementation in Epic 5; prepare data structure now

### AC9: Edge Cases and Performance
**Given** I have 5 analyses (NFR-P6 max concurrent)
**When** I adjust a global parameter
**Then** all 5 analyses recalculate within 100ms total (not per-analysis)
**And** no UI freezing or lag occurs
**Given** an analysis has a custom detection rate (per-analysis override from Story 2.9)
**When** I adjust the global detection rate
**Then** that analysis keeps its custom value (no propagation to overridden analyses)
**Given** I set detection rate to 0% or 100%
**Then** the calculations handle extreme values correctly (no division by zero, no NaN)

**FRs Covered:** FR30 (global detection rate), FR32 (global service cost), FR34 (instant propagation)
**NFRs Addressed:** NFR-P1 (<100ms updates), NFR-P6 (5 concurrent analyses), NFR-A1 (WCAG AA)

## Tasks / Subtasks

### Task 1: Add Global Parameters to Zustand Store (AC: 1, 4, 7)
- [ ] Modify `argos-roi-calculator/src/stores/roiStore.ts`
  - Add state fields:
    * `globalDetectionRate: number` (default 70)
    * `globalServiceCost: number` (default 2500)
  - Add actions:
    * `setGlobalDetectionRate(rate: number): void`
      - Validate: 0 <= rate <= 100
      - Update state
      - Trigger recalculation for all analyses using global rate
    * `setGlobalServiceCost(cost: number): void`
      - Validate: cost > 0
      - Update state
      - Trigger recalculation for all analyses
  - Add helper action:
    * `recalculateAllAnalyses(): void`
      - Iterate through analyses array
      - Call calculateROI for each analysis
      - Update results in store

- [ ] Create tests in `argos-roi-calculator/src/stores/roiStore.test.ts`
  - Test default globalDetectionRate is 70
  - Test default globalServiceCost is 2500
  - Test setGlobalDetectionRate updates state
  - Test setGlobalDetectionRate validates range (0-100)
  - Test setGlobalDetectionRate triggers recalculation
  - Test setGlobalServiceCost updates state
  - Test setGlobalServiceCost validates positive values
  - Test setGlobalServiceCost triggers recalculation
  - Test recalculateAllAnalyses updates all analyses
  - Test custom detection rate (per-analysis) NOT overridden by global change

### Task 2: Modify ROI Calculation to Use Global Parameters (AC: 3, 6)
- [ ] Modify `argos-roi-calculator/src/stores/roiStore.ts` (calculateROI function)
  - Update to use `globalServiceCost` from store state
  - Update to use `globalDetectionRate` if analysis.detectionRate is null/undefined
  - Calculation: `argosCost = globalServiceCost * pumpQuantity`
  - Calculation: use `analysis.detectionRate ?? globalDetectionRate` for detection rate
  - Ensure immutability: return new analysis object with updated results

- [ ] Update existing tests in `argos-roi-calculator/src/stores/roiStore.test.ts`
  - Test calculateROI uses globalServiceCost
  - Test calculateROI uses globalDetectionRate when analysis has no custom rate
  - Test calculateROI uses analysis.detectionRate when set (override)
  - Test edge cases: 0% detection rate, 100% detection rate, very high service cost

### Task 3: Create GlobalParametersPanel Component (AC: 1, 2, 4, 5)
- [ ] Create `argos-roi-calculator/src/components/global/GlobalParametersPanel.tsx`
  - Props: none (uses Zustand store directly)
  - Display two fields:
    1. Detection Rate input (numeric, 0-100%, suffix "%")
    2. Service Cost input (numeric, >0, suffix "€", thousand separators)
  - Use Input primitive from Epic 1 or create NumberInput variant
  - Field labels (French):
    * "Taux de détection ARGOS"
    * "Coût service ARGOS (par pompe/an)"
  - Validation:
    * Detection Rate: min=0, max=100, step=1
    * Service Cost: min=1, no max, step=100
  - onChange handlers:
    * Call setGlobalDetectionRate(value) on blur or Enter
    * Call setGlobalServiceCost(value) on blur or Enter
    * Escape key restores previous value
  - Display current values from store
  - Format service cost with thousand separators: `value.toLocaleString('fr-FR')`
  - WCAG AA: proper labels, aria-invalid for errors, aria-describedby for validation messages

- [ ] Create `argos-roi-calculator/src/components/global/GlobalParametersPanel.test.tsx`
  - Test renders two fields with correct labels
  - Test displays default values (70%, EUR 2,500)
  - Test detection rate input accepts valid values (0-100)
  - Test detection rate input rejects invalid values (<0, >100)
  - Test detection rate calls setGlobalDetectionRate on blur
  - Test detection rate calls setGlobalDetectionRate on Enter
  - Test detection rate cancels on Escape
  - Test service cost input accepts positive values
  - Test service cost input rejects zero and negative values
  - Test service cost calls setGlobalServiceCost on blur/Enter
  - Test service cost formats with thousand separators
  - Test accessibility: labels, aria-invalid, error messages

### Task 4: Integrate GlobalParametersPanel in Application Layout (AC: 7)
- [ ] Decide placement: Options:
  1. In existing GlobalSidebar (if it exists)
  2. New section on Dashboard above analysis grid
  3. Collapsible panel accessible from all pages
  4. Settings icon → modal with global parameters
  - **Recommendation:** Add to Dashboard as a prominent panel (user negotiates pricing during meetings)

- [ ] Modify `argos-roi-calculator/src/pages/Dashboard.tsx`
  - Import GlobalParametersPanel
  - Add section above AnalysisCard grid:
    ```tsx
    <section className="mb-6">
      <h2 className="text-lg font-semibold mb-4">Paramètres globaux</h2>
      <GlobalParametersPanel />
    </section>
    ```
  - Ensure responsive layout (stack on mobile, row on desktop)

- [ ] Update Dashboard tests
  - Test GlobalParametersPanel renders on Dashboard
  - Test changing global parameter updates analysis cards
  - Test navigation preserves global parameters

### Task 5: Add Propagation Logic with Performance Optimization (AC: 3, 6, 9)
- [ ] Modify `argos-roi-calculator/src/stores/roiStore.ts`
  - In setGlobalDetectionRate and setGlobalServiceCost:
    * Use Zustand's `set` with function form for batch updates
    * Recalculate all analyses in single state update (avoid multiple re-renders)
    * Pattern: `set(state => ({ ...state, globalDetectionRate: rate, analyses: recalculatedAnalyses }))`
  - Optimize recalculateAllAnalyses:
    * Use map() to create new analyses array
    * Only recalculate if analysis uses global parameter (check for override)
    * Avoid deep cloning (use spread for shallow updates)

- [ ] Add performance tests
  - Test propagation with 5 analyses completes <100ms
  - Test propagation with 1 analysis completes <20ms
  - Test no re-render if value unchanged (same detection rate set twice)
  - Test custom detection rate NOT recalculated when global changes

### Task 6: Visual Feedback for Parameter Changes (AC: 3, 6)
- [ ] Add visual feedback when parameters change (optional enhancement):
  - Option 1: Toast notification "Paramètres mis à jour — X analyses recalculées"
  - Option 2: Brief highlight animation on affected cards (pulse effect)
  - Option 3: Loading spinner during recalculation (if >50ms)
  - **Recommendation:** Skip for MVP (100ms is fast enough, user sees values change)

- [ ] Verify visual updates in manual testing:
  - Dashboard cards update immediately
  - Focus Mode results panel updates if viewing an analysis
  - No flicker or layout shift during update

### Task 7: Documentation and Edge Case Handling (AC: 9)
- [ ] Add JSDoc comments to new store actions
  - Document validation rules
  - Document propagation behavior
  - Document performance characteristics

- [ ] Handle edge cases in code:
  - Detection rate = 0%: failuresCaught = 0, ROI may be negative
  - Detection rate = 100%: all failures caught
  - Service cost = 1 EUR: very low cost, high ROI
  - Service cost = 1,000,000 EUR: very high cost, likely negative ROI
  - 0 analyses: no propagation needed
  - 5+ analyses: batch update for performance

- [ ] Add console.warn for unusual values (dev mode only, remove before commit):
  - Warn if detection rate < 10% or > 95% (unusual ranges)
  - Warn if service cost < 100 EUR or > 100,000 EUR (unusual pricing)

### Task 8: Accessibility and Code Quality Audit (AC: all)
- [ ] Accessibility verification (WCAG AA):
  - Detection rate input: label, aria-describedby for errors, keyboard accessible
  - Service cost input: label, aria-describedby for errors, keyboard accessible
  - Tab order: logical flow through global parameters panel
  - Enter key commits changes
  - Escape key cancels changes
  - Screen reader announces validation errors

- [ ] Code quality:
  - Remove ALL console.log and console.warn statements
  - No unused imports or variables
  - TypeScript strict mode passes
  - ESLint passes with no warnings
  - Tailwind CSS v4: standard transitions (avoid animate-in without plugin)

- [ ] Performance verification:
  - Measure propagation time with 5 analyses (use performance.now())
  - Ensure < 100ms target (NFR-P1)
  - Verify no unnecessary re-renders (use React DevTools Profiler)

## Implementation Notes

### V9 Reference (calculateur-argos/)
- V9 has fixed parameters in JavaScript constants (no dynamic adjustment)
- Detection rate hardcoded: 70%
- Service cost hardcoded: 2500 EUR
- V10 allows live negotiation during client meetings (key differentiator)

### Zustand Store Pattern for Propagation
```typescript
setGlobalDetectionRate: (rate: number) => {
  if (rate < 0 || rate > 100) {
    throw new Error('Detection rate must be between 0 and 100');
  }

  set(state => {
    const updatedAnalyses = state.analyses.map(analysis => {
      // Only recalculate if using global rate (not overridden)
      if (analysis.detectionRate === null || analysis.detectionRate === undefined) {
        return calculateROI(analysis, rate, state.globalServiceCost);
      }
      return analysis; // Keep custom detection rate
    });

    return {
      globalDetectionRate: rate,
      analyses: updatedAnalyses
    };
  });
}
```

### Performance Optimization
- **Single state update:** Batch global parameter change + all recalculations in one `set()` call
- **Conditional recalculation:** Skip analyses with custom detection rates
- **Immutable updates:** Use spread operator, avoid deep cloning
- **No intermediate state:** Don't update parameter first, then analyses separately (causes double render)

### UI Placement Decision
**Option A (Recommended): Dashboard Panel**
- Pros: Always visible, prominent placement, matches sales engineering workflow
- Cons: Takes vertical space on Dashboard

**Option B: GlobalSidebar Component**
- Pros: Accessible from all pages, doesn't clutter Dashboard
- Cons: Need to create new GlobalSidebar component, less prominent

**Option C: Settings Modal**
- Pros: Doesn't clutter main UI
- Cons: Hidden, requires extra click, not suitable for live negotiation

**Decision:** Option A (Dashboard Panel) — parameters need to be front-and-center during client meetings.

### Number Formatting
- Detection rate: `${value}%` (no decimals)
- Service cost: Use `Intl.NumberFormat` for French locale:
  ```typescript
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(cost)
  // Result: "2 500 €"
  ```

### Testing Strategy
- **Unit tests (store):** Validation, propagation logic, edge cases
- **Component tests:** UI rendering, user interactions, accessibility
- **Integration tests:** Parameter change → analysis updates → Dashboard cards update
- **Performance tests:** Measure propagation time with performance.now()

## Definition of Done

- [ ] All tasks completed and committed
- [ ] All tests pass: `npm test -- --run` (653+ tests from 603 baseline)
- [ ] Code review completed (3 parallel agents: simplicity/bugs/conventions)
- [ ] 100% of HIGH + MEDIUM issues fixed
- [ ] No console.log statements in code
- [ ] Accessibility verified: WCAG AA compliant
- [ ] Performance verified: propagation <100ms with 5 analyses
- [ ] Story marked as "done" in sprint-status.yaml
- [ ] Epic 3 marked as "done" in sprint-status.yaml (last story of epic)
- [ ] Git commit prepared (NOT pushed, awaiting user validation)

## Test Estimates

- GlobalParametersPanel tests: +12 tests (render, validation, interactions, a11y)
- Store tests (global parameters): +15 tests (setters, validation, propagation, edge cases)
- Store tests (ROI calculation updates): +8 tests (uses global params, overrides respected)
- Dashboard integration tests: +5 tests (panel renders, updates propagate)
- Performance tests: +3 tests (timing, batch updates, no unnecessary renders)
- **Total new tests: ~43**
- **Expected total: 646-696 tests** (603 baseline + 43 story 3.4 + unknowns from 3.2)

## Time Estimates

- Task 1 (Store - global parameters): 15 min
- Task 2 (Store - ROI calculation update): 15 min
- Task 3 (GlobalParametersPanel component): 30 min
- Task 4 (Dashboard integration): 10 min
- Task 5 (Propagation optimization): 20 min
- Task 6 (Visual feedback): 10 min (skipped for MVP)
- Task 7 (Edge cases): 10 min
- Task 8 (Audit): 10 min
- **Dev total: 120 min (~2h)**
- Exploration (3 agents //): 5 min
- Architecture (3 agents //): 5 min
- Code review (3 agents //): 5 min
- Fixes (HIGH+MEDIUM): 20-30 min
- **Grand total: 2h35-2h45** (155-165 min)

## Related Stories

- **Story 2.9** (Detection Rate per Analysis): GlobalDetectionRate is default, can be overridden per-analysis
- **Story 2.6** (ROI Calculation Engine): calculateROI function modified to use global parameters
- **Story 3.1** (Dashboard Grid): GlobalParametersPanel integrated above analysis grid
- **Epic 5** (PDF Export): Global parameters included in PDF assumptions section

## Success Metrics

- User can adjust detection rate and see impact across all analyses instantly (<100ms)
- User can negotiate service cost live during client meeting and show updated ROI
- Zero confusion about which analyses use global vs custom detection rates
- All keyboard users can adjust parameters without mouse
- Screen readers announce current values and validation errors clearly
- Performance remains smooth with 5 concurrent analyses

## Key Business Context

**Critical Sales Workflow:**
During client meetings, JB negotiates:
1. ARGOS detection rate (typically 70-85% based on pump types)
2. Service cost per pump per year (typically EUR 2,000-3,500 based on contract size)

**Real-world scenario:**
- Client: "What if detection rate is only 60%?"
  → JB adjusts global parameter, all ROI values update instantly
- Client: "What if we negotiate cost down to EUR 2,200?"
  → JB adjusts service cost, shows new savings across all processes

**This story is the "negotiation engine" — critical for closing deals.**
