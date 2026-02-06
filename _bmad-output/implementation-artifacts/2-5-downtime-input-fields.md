# Story 2.5: Downtime Input Fields

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

**As a** user (JB capturing operational data),
**I want** to enter downtime duration per failure and cost per hour of downtime,
**So that** I can capture the client's operational impact of pump failures beyond wafer loss (production stoppage, labor costs, idle equipment).

## Acceptance Criteria

**Given** I am in Focus Mode for an analysis (/analysis/:id)
**When** I see the InputPanel
**Then** I see the "Downtime" section after the Wafer section
**And** the section displays two numeric input fields with French labels

**When** I see the "Downtime per failure (hours)" field
**Then** it has label "Heures d'arrêt par panne"
**And** it has placeholder "ex: 6"
**And** it has unit display "heures" (right-aligned)
**And** it accepts numeric input (integers and decimals)
**And** the default value is empty (not pre-filled)

**When** I see the "Cost per hour of downtime (EUR)" field
**Then** it has label "Coût horaire d'arrêt"
**And** it has placeholder "ex: 15000"
**And** it has unit display "€/h" (right-aligned)
**And** it accepts numeric input (integers only)
**And** the default value is empty (not pre-filled)
**And** it displays with thousand separators when not focused (e.g., "15,000")

**When** I enter "6" in downtime hours
**Then** the value is saved to the analysis in store as `downtimePerFailure: 6`
**And** the value updates instantly (<100ms per NFR-P1)

**When** I enter "15000" in downtime cost
**Then** the value is saved to the analysis in store as `downtimeCostPerHour: 15000`
**And** the value displays as "15,000 €/h" when not focused
**And** the value updates instantly (<100ms per NFR-P1)

**When** I enter negative value (e.g., "-5")
**Then** I see inline validation error "Doit être un nombre positif"
**And** the input field has red border (error state)
**And** the invalid value is NOT saved to store

**When** I enter non-numeric value (e.g., "abc")
**Then** I see inline validation error "Doit être un nombre valide"
**And** the input field has red border (error state)
**And** the invalid value is NOT saved to store

**When** I leave either field empty
**Then** I see validation warning "Requis pour le calcul ROI"
**And** the warning text is orange/amber (not red - soft warning, not hard error)
**And** the ResultsPanel shows incomplete state ("--" or "Données manquantes")

**When** I fill both downtime fields with valid values
**Then** the validation warnings disappear
**And** the ResultsPanel calculates Total Failure Cost including downtime component
**And** the calculation uses formula: `totalFailureCost = (pumpQuantity * failureRate/100) * (waferCost * wafersPerBatch + downtimePerFailure * downtimeCostPerHour)`

**When** I change a downtime value
**Then** the ROI results update in real-time (<100ms)
**And** all four result metrics recalculate (Total Failure Cost, ARGOS Service Cost, Savings, ROI)

**FRs Covered:** FR18 (Enter downtime duration), FR19 (Enter downtime cost), FR25 (Validate positive numbers), FR27 (Prevent calc with missing inputs), FR28 (Display error messages)
**NFRs Addressed:** NFR-P1 (<100ms calculations), NFR-S1 (client-side only)

## Tasks / Subtasks

### Task 1: Create DowntimeInputs Component (AC: 1, 2, 3)
- [ ] Create `src/components/analysis/DowntimeInputs.tsx`
  - Export named component `DowntimeInputs`
  - TypeScript interface `DowntimeInputsProps`:
    - `analysisId: string` - ID of current analysis
    - `downtimePerFailure: number` - Current downtime hours value
    - `downtimeCostPerHour: number` - Current downtime cost value
    - `onUpdate: (updates: { downtimePerFailure?: number; downtimeCostPerHour?: number }) => void` - Callback for updates
    - `disabled?: boolean` - Optional disabled state (for future use)
  - Render section with heading "Temps d'arrêt" (optional divider from previous section)
  - Two input fields using Input component from `@/components/ui`:
    - Field 1: Downtime hours
      - Label: "Heures d'arrêt par panne"
      - Placeholder: "ex: 6"
      - Unit: "heures" (right-aligned span)
      - Type: "number" with step="0.1" (allow decimals)
      - Value controlled by `downtimePerFailure` prop
      - onChange handler: validate and call onUpdate
    - Field 2: Downtime cost per hour
      - Label: "Coût horaire d'arrêt"
      - Placeholder: "ex: 15000"
      - Unit: "€/h" (right-aligned span)
      - Type: "number" (integers only)
      - Value controlled by `downtimeCostPerHour` prop
      - onChange handler: validate, format with thousands separator when blurred, call onUpdate
  - Local state for validation errors (per field)
  - Validation logic:
    - Must be numeric (use `isNaN(parseFloat(value))`)
    - Must be >= 0 (no negative values)
    - Empty is allowed but triggers soft warning
  - Error messages:
    - Negative: "Doit être un nombre positif"
    - Non-numeric: "Doit être un nombre valide"
    - Empty (soft warning, amber color): "Requis pour le calcul ROI"
  - Thousand separator formatting on blur for cost field
  - Use `clsx` for conditional error styling
- [ ] Create `src/components/analysis/DowntimeInputs.test.tsx`
  - Test component renders with correct labels and placeholders
  - Test downtime hours input accepts numeric values
  - Test downtime cost input accepts numeric values
  - Test downtime hours onChange calls onUpdate with correct value
  - Test downtime cost onChange calls onUpdate with correct value
  - Test negative value shows error "Doit être un nombre positif"
  - Test non-numeric value shows error "Doit être un nombre valide"
  - Test empty value shows soft warning "Requis pour le calcul ROI"
  - Test valid input clears error state
  - Test error state adds red border to input
  - Test warning state adds amber text (not red)
  - Test thousand separator formatting on blur (e.g., 15000 → "15,000")
  - Test unit displays ("heures", "€/h")
  - Test disabled prop disables both inputs (future-proofing)
  - Test keyboard interaction (Tab, Enter, number keys)
  - Minimum 15 tests

### Task 2: Integrate DowntimeInputs with InputPanel (AC: 1, 4, 5)
- [ ] Update `src/components/analysis/InputPanel.tsx`
  - Import DowntimeInputs component
  - Add DowntimeInputs after WaferTypeSelector section
  - Pass props:
    - `analysisId={analysis.id}`
    - `downtimePerFailure={analysis.downtimePerFailure || 0}`
    - `downtimeCostPerHour={analysis.downtimeCostPerHour || 0}`
    - `onUpdate={handleDowntimeUpdate}`
  - Implement `handleDowntimeUpdate` function:
    - Accept updates object: `{ downtimePerFailure?: number; downtimeCostPerHour?: number }`
    - Call `updateAnalysis(analysisId, updates)` from Zustand store
    - Measure performance: store update <100ms (NFR-P1)
  - Add visual spacing/divider between Wafer section and Downtime section
- [ ] Update `src/components/analysis/InputPanel.test.tsx`
  - Test DowntimeInputs renders in InputPanel
  - Test DowntimeInputs receives correct props
  - Test handleDowntimeUpdate calls store.updateAnalysis
  - Test downtime updates trigger re-render with new values
  - Add 4 integration tests

### Task 3: Update Zustand Store Analysis Type (AC: 2, 3)
- [ ] Verify `src/types/index.ts` includes downtime fields in Analysis interface
  - `downtimePerFailure: number` - Hours of downtime per failure
  - `downtimeCostPerHour: number` - Cost in euros per hour of downtime
  - (These should already exist from Story 1.2, verify only)
- [ ] Verify default values in `addAnalysis` action (src/stores/app-store.ts)
  - `downtimePerFailure: 0` (default: empty/zero, not 6)
  - `downtimeCostPerHour: 0` (default: empty/zero, not 500)
  - (Note: V9 had defaults of 6h and €500/h, but V10 UX requires explicit user input)
- [ ] Add tests to verify downtime fields in store
  - Test updateAnalysis updates downtimePerFailure
  - Test updateAnalysis updates downtimeCostPerHour
  - Test store validates positive numbers (reject negative)
  - Add 3 tests

### Task 4: Update ROI Calculation Engine (AC: 6)
- [ ] Verify `src/lib/calculations.ts` includes downtime in calculateTotalFailureCost
  - Formula should be: `(pumpQuantity * failureRate/100) * (waferCost * wafersPerBatch + downtimePerFailure * downtimeCostPerHour)`
  - Wafer component: `waferCost * wafersPerBatch`
  - Downtime component: `downtimePerFailure * downtimeCostPerHour`
  - Total cost per failure = wafer loss + downtime loss
  - (This should already be implemented in Story 2.6, verify only)
- [ ] Add comprehensive tests for downtime in calculations
  - Test calculateTotalFailureCost with downtime = 0 (only wafer cost)
  - Test calculateTotalFailureCost with downtime > 0 (wafer + downtime)
  - Test calculateTotalFailureCost with waferCost = 0, only downtime
  - Test calculateTotalFailureCost with realistic values (6h, €15,000/h)
  - Test edge case: downtime only, no wafer cost
  - Add 5 tests

### Task 5: Update ResultsPanel to Handle Incomplete Downtime (AC: 5, 6)
- [ ] Update `src/components/analysis/ResultsPanel.tsx`
  - Check if downtime fields are empty (0 or undefined)
  - If downtimePerFailure === 0 OR downtimeCostPerHour === 0:
    - Show soft warning in ResultsPanel: "Données manquantes (temps d'arrêt)"
    - Display Total Failure Cost with asterisk: "€1,250,000*"
    - Footnote: "*Calcul basé uniquement sur le coût des wafers (temps d'arrêt non renseigné)"
  - If both downtime fields are filled:
    - Display Total Failure Cost normally without asterisk
    - No warning message
  - Ensure real-time update (<100ms) when downtime fields change
- [ ] Update `src/components/analysis/ResultsPanel.test.tsx`
  - Test warning displays when downtimePerFailure = 0
  - Test warning displays when downtimeCostPerHour = 0
  - Test no warning when both downtime fields are filled
  - Test asterisk appears on Total Failure Cost when incomplete
  - Test footnote text is correct
  - Test warning disappears when downtime is filled
  - Add 6 tests

### Task 6: Export Components and Update Barrel (AC: All)
- [ ] Update `src/components/analysis/index.ts`
  - Export DowntimeInputs component
  - Ensure named export pattern
- [ ] Update integration tests
  - Verify exports are accessible via barrel
  - Test import paths work correctly
  - Add 2 tests

### Task 7: End-to-End Downtime Input Flow Test (AC: All)
- [ ] Create integration test file: `src/components/analysis/DowntimeInput.integration.test.tsx`
  - Test complete flow: Focus Mode → Enter downtime hours → Enter cost → Results update
  - Mock or use real Zustand store (with cleanup)
  - Test flow:
    1. Render InputPanel with empty downtime fields
    2. ResultsPanel shows warning "Données manquantes"
    3. Enter "6" in downtime hours
    4. Warning persists (cost still empty)
    5. Enter "15000" in downtime cost
    6. Warning disappears
    7. Total Failure Cost updates with downtime component
    8. ROI recalculates
  - Test validation flow:
    1. Enter "-5" in downtime hours
    2. Error displays "Doit être un nombre positif"
    3. Value NOT saved to store
    4. Enter "6" (valid)
    5. Error clears, value saved
  - Test real-time calculation:
    1. Fill all inputs including downtime
    2. Change downtime hours from 6 to 12
    3. Total Failure Cost doubles downtime component
    4. ROI updates instantly (<100ms)
  - Minimum 3 integration tests (happy path, validation, real-time update)

## Dev Notes

### Architecture Patterns from Epic 1 and Epic 2

**Component Structure:**
- Named exports only (no default exports)
- TypeScript interfaces for all props
- Co-located tests (component.tsx + component.test.tsx)
- Use `clsx` for conditional class composition
- Follow Tailwind class organization: Layout → Spacing → Typography → Colors → Effects

**Styling Standards:**
- Pfeiffer brand colors: `#CC0000` (primary red), `#A50000` (dark red hover)
- Typography: 16px (labels), 14px (placeholder, units), 12px (error messages)
- Spacing: 16px gap between input fields, 24px margin between sections
- Focus rings: `focus:ring-2 focus:ring-pfeiffer-red focus:ring-offset-2`
- Error state: red border (`border-red-600`), red text (`text-red-600`)
- Warning state: amber border (`border-amber-500`), amber text (`text-amber-600`)
- Unit displays: right-aligned, gray text (`text-gray-600`), 14px font

**State Management (Zustand):**
- ALWAYS use selector pattern: `const updateAnalysis = useAppStore((state) => state.updateAnalysis)`
- NEVER destructure: `const { updateAnalysis } = useAppStore()` (causes unnecessary re-renders)
- Immutable updates: use spread operator for all state changes
- Action naming: verb + noun (addAnalysis, updateAnalysis)
- Real-time updates: onChange handlers call store immediately (no debounce for <5 analyses)

**Validation Patterns:**
- Real-time validation on onChange (immediate feedback)
- Soft warnings (amber) for empty but required fields
- Hard errors (red) for invalid values (negative, non-numeric)
- Error messages in French, displayed below input field
- Use `isNaN(parseFloat(value))` for numeric validation
- Use `parseFloat(value) < 0` for negative check
- Empty string check: `value.trim() === ''`

**Number Formatting:**
- Thousand separators: Use `Intl.NumberFormat('fr-FR')` for French formatting
- Display format: "15,000 €/h" when not focused
- Input format: raw number "15000" when focused (no separators during editing)
- Use `onBlur` to format, `onFocus` to remove formatting
- Example: `value.toLocaleString('fr-FR')`

### Previous Story Intelligence

**From Story 2.1 (Analysis Creation Modal):**
- Analysis creation modal working, stores new analyses with default values
- Default values for downtimePerFailure and downtimeCostPerHour are 0 (not pre-filled)
- Store update performance: <1ms for single field update (well under 100ms NFR-P1)
- Navigation to Focus Mode working (<200ms per NFR-P4)

**From Story 2.6 (ROI Calculation Engine - DONE):**
- `calculateTotalFailureCost` function implemented in `src/lib/calculations.ts`
- Formula: `(pumpQuantity * failureRate/100) * (waferCost * wafersPerBatch + downtimePerFailure * downtimeCostPerHour)`
- Downtime component already integrated into calculation
- Tests: 47 tests passing, including downtime scenarios
- Performance: All calculations <1ms (well under 100ms NFR-P1)
- Pure functions, no side effects, easily testable

**From Story 1.4 (UI Primitives):**
- Input component available: `@/components/ui/Input`
  - States: normal, error, disabled
  - Props: `value`, `onChange`, `placeholder`, `error`, `label`, `disabled`, `className`, `type`
  - Error display: red border + error message below input
  - Focus ring: Pfeiffer red
  - Unit display: right-aligned span (add custom)
- Input component tests: 100% passing
- No modifications needed to Input component (use as-is)

**From Story 1.2 (Zustand Store Setup):**
- Store is fully configured and tested (38 tests, 100% passing)
- `updateAnalysis` action available (accepts id and partial updates)
- Analysis interface includes:
  - `downtimePerFailure: number`
  - `downtimeCostPerHour: number`
- Store validation: checks numeric bounds, rejects negative values
- Store automatically triggers re-renders via Zustand reactivity

**Code Review Learnings from Epic 1 and Story 2.1:**
- Validation errors must use aria-describedby for accessibility
- Error messages must be associated with input elements
- Test focus management (auto-focus, Tab order)
- Test keyboard interaction (Enter, Escape, number keys)
- Comprehensive test coverage: minimum 15 tests per component
- Test both positive and negative validation scenarios
- Test real-time updates with performance measurements

### Technical Requirements

**Dependencies (Already Installed):**
- `react` (18+) - Component framework
- `zustand` - State management (useAppStore)
- `clsx` - Conditional class composition
- `@testing-library/react` - Testing utilities
- `@testing-library/user-event` - User interaction testing
- `vitest` - Test runner

**No New Dependencies Required**

**Number Input Strategy:**
- Use `type="number"` for native browser validation
- Add `step="0.1"` for downtime hours (allow decimals: 6.5 hours)
- Add `step="1"` for downtime cost (integers only)
- Add `min="0"` to prevent negative input (browser-level)
- Add custom validation in onChange handler (JavaScript-level)
- Convert string to number: `parseFloat(value)` for hours, `parseInt(value)` for cost
- Validate with `isNaN()` before saving to store

**Formatting Strategy:**
- Cost field: Format with thousand separators when not focused
- Use `Intl.NumberFormat('fr-FR').format(value)` for French formatting
- Example: 15000 → "15 000" (French uses spaces, not commas)
- Strip formatting on focus: `value.replace(/\s/g, '')` to remove spaces
- Apply formatting on blur: `value.toLocaleString('fr-FR')`
- Controlled input: manage formatted/unformatted state in component

**Validation Strategy:**
- Real-time validation on onChange (immediate feedback)
- Validation checks:
  1. Is numeric: `!isNaN(parseFloat(value))`
  2. Is positive: `parseFloat(value) >= 0`
  3. Is not empty: `value.trim() !== ''` (soft warning if empty)
- Error priority: Non-numeric > Negative > Empty
- Display errors inline below input field
- Use amber/orange for soft warnings (empty but required)
- Use red for hard errors (invalid values)

**Store Integration Strategy:**
- Import `useAppStore` from `@/stores/app-store`
- Use selector pattern: `const updateAnalysis = useAppStore((state) => state.updateAnalysis)`
- Call `updateAnalysis(analysisId, { downtimePerFailure: value })` on valid input
- Call `updateAnalysis(analysisId, { downtimeCostPerHour: value })` on valid input
- Store update triggers re-render of ResultsPanel automatically
- Store update timing: <100ms per NFR-P1 (measured in tests)

### Testing Requirements

**Test Coverage:**
- DowntimeInputs: 15 tests
- InputPanel integration: 4 tests
- Store verification: 3 tests
- Calculation engine: 5 tests
- ResultsPanel updates: 6 tests
- Integration tests: 3 tests
- **Total: 36 tests minimum**

**Testing Strategy:**
- Unit tests for DowntimeInputs component in isolation
- Integration tests for InputPanel + DowntimeInputs
- Store integration tests (verify updateAnalysis called correctly)
- Calculation tests (verify downtime component in formula)
- ResultsPanel tests (verify warning/asterisk display)
- End-to-end flow tests (input → store → calculation → results)
- Validation tests (error states, soft warnings, real-time feedback)
- Formatting tests (thousand separators, French locale)
- Performance tests (store update <100ms, calculation update <100ms)

**Testing Tools:**
- Vitest + React Testing Library (already configured)
- `@testing-library/user-event` for realistic user interactions
- `screen.getByLabelText` for accessibility queries (French labels)
- `screen.getByText` for error message validation
- Mock Zustand store or use real store with cleanup
- `performance.now()` for timing measurements

**Testing Patterns from Previous Stories:**
- Test keyboard interactions with `userEvent.keyboard('{Enter}')`
- Test focus management with `expect(document.activeElement).toBe(element)`
- Test error states with `screen.getByText(/Doit être/i)`
- Test async operations with `await waitFor(() => expect(...))`
- Test store updates with spy or mock: `vi.spyOn(useAppStore.getState(), 'updateAnalysis')`
- Test formatting with: `expect(screen.getByDisplayValue('15 000')).toBeInTheDocument()`

### File Structure Requirements

**New Files to Create:**
```
src/components/analysis/
├── DowntimeInputs.tsx              # Downtime hours + cost inputs
├── DowntimeInputs.test.tsx         # DowntimeInputs tests
└── DowntimeInput.integration.test.tsx  # E2E flow tests
```

**Files to Modify:**
```
src/components/analysis/InputPanel.tsx       # Add DowntimeInputs section
src/components/analysis/InputPanel.test.tsx  # Add integration tests
src/components/analysis/ResultsPanel.tsx     # Add downtime warning logic
src/components/analysis/ResultsPanel.test.tsx # Add warning tests
src/components/analysis/index.ts             # Export DowntimeInputs
src/types/index.ts                           # Verify Analysis interface (no changes needed)
src/stores/app-store.ts                      # Verify default values (no changes needed)
src/lib/calculations.ts                      # Verify formula (no changes needed)
```

**Naming Conventions:**
- PascalCase for components: `DowntimeInputs`
- camelCase for functions/handlers: `handleDowntimeUpdate`
- Named exports only (no default exports)

### UX Design Notes

**From Epic 2 Story 2.5 Requirements:**
- Two numeric input fields in "Downtime" section
- Section appears after Wafer section in InputPanel
- Field 1: "Heures d'arrêt par panne" (Downtime per failure hours)
  - Placeholder: "ex: 6"
  - Unit display: "heures" (right-aligned)
  - Accepts decimals (step 0.1)
- Field 2: "Coût horaire d'arrêt" (Hourly cost of downtime)
  - Placeholder: "ex: 15000"
  - Unit display: "€/h" (right-aligned)
  - Accepts integers only
  - Thousand separator formatting when not focused
- Labels in French, inputs accept numeric values only
- Real-time validation with inline error messages
- Soft warnings (amber) for empty fields vs hard errors (red) for invalid values

**Input Behavior:**
- Auto-tab between fields: No (user controls navigation)
- Enter key behavior: Move to next field (standard form behavior)
- Tab key behavior: Move to next field
- Validation timing: onChange (immediate), onBlur (formatting)
- Error clearing: Immediate when user enters valid value
- Default values: Empty (0), not pre-filled with V9 defaults (6h, €500/h)

**Downtime Section Layout:**
```
┌─────────────────────────────────────────────────┐
│  Temps d'arrêt                                  │
├─────────────────────────────────────────────────┤
│  Heures d'arrêt par panne                       │
│  [____________6_____________] heures            │
│                                                  │
│  Coût horaire d'arrêt                           │
│  [___________15,000__________] €/h              │
└─────────────────────────────────────────────────┘
```

**Error State Examples:**
- Empty (soft warning, amber): "Requis pour le calcul ROI"
- Negative (hard error, red): "Doit être un nombre positif"
- Non-numeric (hard error, red): "Doit être un nombre valide"

**ResultsPanel Warning Example:**
```
┌─────────────────────────────────────────────────┐
│  Coût Total des Pannes         €1,250,000*     │
│  Coût du Service ARGOS         €20,000         │
│  Économies Réalisées           €855,000        │
│  ROI                           4275%           │
├─────────────────────────────────────────────────┤
│  * Calcul basé uniquement sur le coût des      │
│    wafers (temps d'arrêt non renseigné)        │
└─────────────────────────────────────────────────┘
```

### Performance Considerations

**NFR-P1 (Calculations <100ms):**
- Store update (updateAnalysis) must complete <100ms
- Measured in tests using `performance.now()` before/after
- Zustand updates are synchronous and fast (<1ms for single field)
- Calculation engine updates triggered automatically by store change
- Total time from input change to ResultsPanel update: <100ms

**NFR-S1 (No Server Transmission):**
- All data remains client-side (Zustand in-memory store)
- No API calls, no fetch requests
- Downtime values stored in memory only

**Memory Efficiency:**
- No memory leaks from number formatting
- Format/unformat operations are pure functions (no state accumulation)
- Component cleanup on unmount (useEffect cleanup functions)

### French Localization (UI Text)

**Labels and Placeholders:**
- Section heading: "Temps d'arrêt"
- Downtime hours label: "Heures d'arrêt par panne"
- Downtime hours placeholder: "ex: 6"
- Downtime hours unit: "heures"
- Downtime cost label: "Coût horaire d'arrêt"
- Downtime cost placeholder: "ex: 15000"
- Downtime cost unit: "€/h"

**Validation Messages:**
- Positive number error: "Doit être un nombre positif"
- Valid number error: "Doit être un nombre valide"
- Required soft warning: "Requis pour le calcul ROI"

**ResultsPanel Warning:**
- Warning text: "Données manquantes (temps d'arrêt)"
- Footnote: "*Calcul basé uniquement sur le coût des wafers (temps d'arrêt non renseigné)"

**Notes:**
- All user-facing text is in French (per client requirements)
- Code, comments, and tests remain in English
- Number formatting uses French locale (fr-FR): spaces as thousand separators

### Blocking Dependencies

**Story 2.5 BLOCKS:**
- Story 2.7: Results Panel with Real-Time Display (needs downtime inputs to be complete for full ROI calculation)

**Story 2.5 DEPENDS ON:**
- Story 2.1: Analysis Creation Modal (DONE - analysis structure in place)
- Story 2.6: ROI Calculation Engine (DONE - formula includes downtime component)
- Story 1.4: UI Primitive Components (DONE - Input component available)
- Story 1.2: Zustand Store Setup (DONE - Analysis interface includes downtime fields)

**Story 2.5 is UNBLOCKED - Story 2.1 is DONE, ready for dev**

### V9 Reference Context

**V9 Downtime Model (calculateur-argos/index.html):**
- V9 used "costPerFailure" as single aggregate value per category
  - Regular tools: €10,000 per failure
  - Bottleneck tools: €50,000 per failure
  - Batch tools: €150,000 per failure
- V9 did NOT break down into wafer cost + downtime components separately
- V9 pre-filled defaults: implicit in aggregate costs (not explicit downtime fields)

**V10 Enhancement:**
- V10 separates wafer cost (Story 2.4) from downtime cost (Story 2.5)
- V10 allows granular capture of:
  - Wafer loss: `waferCost * wafersPerBatch`
  - Downtime loss: `downtimePerFailure * downtimeCostPerHour`
- V10 provides transparency: client sees breakdown in PDF report
- V10 flexibility: client can adjust wafer vs downtime impact independently

**Implied V9 Defaults (for reference, NOT pre-filled in V10):**
- Downtime hours: ~6 hours per failure (industry average for semiconductor tools)
- Downtime cost: ~€500-€15,000/hour depending on tool criticality
- V10 requires explicit user input (no defaults) to force data capture during meeting

### Git Intelligence

**Recent Commit Patterns (from git log):**
- Story completion commits: "Complete Story X.Y: [Title]"
- Example: "Complete Story 2.1: Analysis Creation Modal and Store Integration"
- Code review commits: "Apply Story X.Y code review fixes"
- All commits include co-authored-by attribution

**Expected Commit for Story 2.5:**
```
Complete Story 2.5: Downtime Input Fields

- Add DowntimeInputs component with French labels and validation
- Integrate downtime inputs with InputPanel
- Add real-time validation (positive numbers, numeric only)
- Add soft warnings for empty fields (required for ROI)
- Add thousand separator formatting for cost field (French locale)
- Update ResultsPanel to show warning when downtime incomplete
- Verify ROI calculation includes downtime component (from Story 2.6)
- Create comprehensive tests (36 tests, 100% passing)
- Export DowntimeInputs from analysis barrel

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

**Files Expected in Commit:**
- New: `src/components/analysis/DowntimeInputs.tsx`
- New: `src/components/analysis/DowntimeInputs.test.tsx`
- New: `src/components/analysis/DowntimeInput.integration.test.tsx`
- Modified: `src/components/analysis/InputPanel.tsx`
- Modified: `src/components/analysis/InputPanel.test.tsx`
- Modified: `src/components/analysis/ResultsPanel.tsx`
- Modified: `src/components/analysis/ResultsPanel.test.tsx`
- Modified: `src/components/analysis/index.ts`

### References

**Source Documents:**
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 2 - Story 2.5]
- [Source: _bmad-output/planning-artifacts/prd.md#FR18, FR19, FR25, FR27, FR28]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Models - Analysis Interface]
- [Source: _bmad-output/planning-artifacts/architecture.md#Validation - Zod]
- [Source: _bmad-output/implementation-artifacts/2-1-analysis-creation-modal-and-store-integration.md]
- [Source: _bmad-output/implementation-artifacts/2-6-roi-calculation-engine.md] (assumed completed, verify)
- [Source: calculateur-argos/index.html#V9 Default Values Reference]

**External Resources:**
- Intl.NumberFormat: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
- React Input Type Number: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/number
- Zustand Store Updates: https://github.com/pmndrs/zustand

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
