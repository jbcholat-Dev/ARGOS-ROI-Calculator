# Story 2.3: Failure Rate Dual-Mode Input

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

**As a** user (JB conducting client meetings),
**I want** to enter failure rate either as percentage or as absolute count with automatic conversion,
**So that** I can adapt to how the client shares their operational data (percentage or explicit failure count).

## Acceptance Criteria

**Given** I am in Focus Mode for an analysis (/analysis/:id)
**When** I see the InputPanel component
**Then** I see a "Failure Rate" section with a mode toggle
**And** the toggle displays two options: "Taux (%)" and "Nombre de pannes/an"
**And** "Taux (%)" mode is selected by default

**When** I am in "Taux (%)" mode
**Then** I see a single numeric input field labeled "Taux de panne annuel (%)"
**And** the field has placeholder "ex: 10"
**And** I can enter values from 0 to 100

**When** I enter "10" in percentage mode
**Then** the value is saved to the store as `failureRatePercentage: 10`
**And** the store update completes within 100ms (NFR-P1)
**And** the field displays "10%" formatting on blur

**When** I switch to "Nombre de pannes/an" mode
**Then** I see a single numeric input field labeled "Nombre de pannes (année dernière)"
**And** the field displays the pump quantity context: "Pour [X] pompes"
**And** the pump quantity value comes from Story 2.2 (EquipmentInputs)

**When** I enter "3" failures with 8 pumps in count mode
**Then** the system calculates failure rate as 37.5% (3/8 * 100)
**And** the calculated percentage is displayed below the input: "Taux calculé: 37.5%"
**And** the store is updated with `failureRatePercentage: 37.5` and `absoluteFailureCount: 3`

**When** I switch from "Nombre de pannes/an" mode back to "Taux (%)" mode
**Then** the calculated percentage value (37.5%) is preserved and displayed in the percentage field
**And** I can edit the percentage directly if needed
**And** the `absoluteFailureCount` field remains in store (not deleted) for mode switching

**When** I enter "101" in percentage mode
**Then** I see validation error: "Le taux doit être entre 0 et 100%"
**And** the invalid value is NOT saved to store
**And** the input field has red border

**When** I enter negative values in either mode
**Then** I see validation error: "Doit être un nombre positif"
**And** the invalid value is NOT saved

**When** pump quantity is 0 or empty (from Story 2.2)
**Then** count mode is disabled
**And** the toggle shows "Taux (%)" as the only available option
**And** a helper message displays: "Entrez d'abord le nombre de pompes"

**When** I switch between modes multiple times
**Then** the conversion calculations remain accurate
**And** no data loss occurs
**And** the last entered value is always preserved

**FRs Covered:** FR11 (Select failure rate mode), FR12 (Enter percentage), FR13 (Enter count with auto-calc), FR25 (Validate positive numbers), FR26 (Real-time validation feedback), FR28 (Display error messages)

**NFRs Addressed:** NFR-P1 (<100ms store updates), NFR-S1 (client-side only), NFR-R4 (input validation prevents runtime errors)

## Tasks / Subtasks

### Task 1: Create FailureRateModeToggle Component (AC: 1, 2, 3)
- [ ] Create `src/components/analysis/FailureRateModeToggle.tsx`
  - Export named component `FailureRateModeToggle`
  - TypeScript interface `FailureRateModeToggleProps`:
    - `mode: 'percentage' | 'count'` - Current mode
    - `onChange: (mode: 'percentage' | 'count') => void` - Mode change handler
    - `disabled?: boolean` - Disable count mode when pump quantity is missing
  - Render toggle with two options: "Taux (%)" and "Nombre de pannes/an"
  - Use Button component styled as toggle (from @/components/ui/Button)
  - Active mode: Pfeiffer red background (#CC0000), white text
  - Inactive mode: white background, gray text, gray border
  - Hover state: light gray background for inactive option
  - Follow Tailwind class organization: Layout → Spacing → Typography → Colors → Effects
  - Add aria-label for accessibility: "Mode de saisie du taux de panne"
  - Keyboard navigation: Tab to toggle, Arrow keys to switch between options
- [ ] Create `src/components/analysis/FailureRateModeToggle.test.tsx`
  - Test toggle renders with both mode options
  - Test active mode has correct styling (red background)
  - Test inactive mode has correct styling (white background)
  - Test clicking mode changes selection
  - Test onChange callback is called with correct mode
  - Test disabled state when count mode unavailable
  - Test keyboard navigation (Tab, Arrow Left/Right, Enter)
  - Test accessibility attributes (aria-label, role)
  - Minimum 8 tests

### Task 2: Create FailureRateInput Component (AC: 4, 5, 6, 7, 8, 9)
- [ ] Create `src/components/analysis/FailureRateInput.tsx`
  - Export named component `FailureRateInput`
  - TypeScript interface `FailureRateInputProps`:
    - `analysisId: string` - ID of the analysis being edited
  - Fetch analysis from store using `useAppStore` with selector pattern
  - Manage local state for mode: `const [mode, setMode] = useState<'percentage' | 'count'>('percentage')`
  - Render section with heading "Taux de panne"
  - Render FailureRateModeToggle component
  - Conditionally render input based on mode:
    - **Percentage mode:**
      - Input label: "Taux de panne annuel (%)"
      - Placeholder: "ex: 10"
      - Type: "number"
      - Min: 0, Max: 100, Step: 0.1 (allow decimals)
      - Display formatted value on blur: "10%" (append % symbol)
    - **Count mode:**
      - Input label: "Nombre de pannes (année dernière)"
      - Placeholder: "ex: 3"
      - Type: "number"
      - Min: 0, Step: 1 (integers only)
      - Context display below: "Pour [X] pompes" (X from pumpQuantity)
      - Calculated percentage display: "Taux calculé: [Y]%" (Y = count/pumps * 100)
  - Handle mode switching: preserve calculated percentage when switching from count → percentage
  - Use Input component from `@/components/ui/Input`
  - Use `clsx` for conditional styling
  - Add aria-describedby for calculated percentage display
- [ ] Create `src/components/analysis/FailureRateInput.test.tsx`
  - Test component renders in percentage mode by default
  - Test percentage mode shows correct label and placeholder
  - Test count mode shows correct label and context
  - Test mode toggle switches between modes
  - Test percentage input updates store
  - Test count input calculates percentage correctly
  - Test calculated percentage displays in count mode
  - Test mode switching preserves calculated value
  - Test pump quantity context displays correctly
  - Test count mode disabled when pump quantity is 0
  - Test validation errors display correctly
  - Test accessibility (aria-describedby, labels)
  - Minimum 12 tests

### Task 3: Implement Failure Rate Validation Logic (AC: 10, 11)
- [ ] Create `src/lib/validation/failure-rate-validation.ts`
  - Export function `validateFailureRatePercentage(value: string): { isValid: boolean; error?: string }`
    - Validation rules:
      - Must be numeric (parseFloat, isNaN check)
      - Must be >= 0
      - Must be <= 100
    - Return error messages in French:
      - Non-numeric or negative: "Doit être un nombre positif"
      - > 100: "Le taux doit être entre 0 et 100%"
  - Export function `validateFailureCount(value: string): { isValid: boolean; error?: string }`
    - Validation rules:
      - Must be numeric (parseInt, isNaN check)
      - Must be >= 0 (allow zero failures)
      - Must be integer (no decimals)
    - Return error message: "Doit être un nombre entier positif"
  - Export function `calculatePercentageFromCount(count: number, pumpQuantity: number): number`
    - Formula: (count / pumpQuantity) * 100
    - Round to 1 decimal place for display
    - Handle edge case: pumpQuantity = 0 → return 0
  - All functions are pure (no side effects)
  - All functions are synchronous (validation <1ms)
- [ ] Create `src/lib/validation/failure-rate-validation.test.ts`
  - Test validateFailureRatePercentage with valid values (0, 10, 50.5, 100)
  - Test validateFailureRatePercentage rejects negative values
  - Test validateFailureRatePercentage rejects values > 100
  - Test validateFailureRatePercentage rejects non-numeric strings
  - Test validateFailureCount with valid integers (0, 3, 10)
  - Test validateFailureCount rejects negative values
  - Test validateFailureCount rejects decimals (3.5)
  - Test validateFailureCount rejects non-numeric strings
  - Test calculatePercentageFromCount with valid inputs (3, 8 → 37.5%)
  - Test calculatePercentageFromCount with zero pump quantity (edge case)
  - Test calculatePercentageFromCount rounds to 1 decimal (2, 7 → 28.6%)
  - Test returns correct error messages in French
  - Minimum 12 tests

### Task 4: Integrate with Zustand Store (AC: 5, 8, 13)
- [ ] Update Analysis interface in `src/types/index.ts`
  - Add field: `failureRateMode: 'percentage' | 'count'` (default: 'percentage')
  - Verify field: `failureRatePercentage: number` (already exists from Story 1.2)
  - Add field: `absoluteFailureCount?: number` (optional, only set when in count mode)
- [ ] Update `src/stores/app-store.ts` if needed
  - Verify `updateAnalysis` action handles new fields
  - Ensure immutable updates (spread operator)
  - Update `updatedAt` timestamp on every change
- [ ] Add store integration tests in FailureRateInput.test.tsx
  - Test store selector retrieves correct analysis
  - Test updateAnalysis is called with correct data
  - Test failureRatePercentage updates in percentage mode
  - Test both failureRatePercentage and absoluteFailureCount update in count mode
  - Test failureRateMode persists in store
  - Test mode switching preserves data correctly
  - Minimum 6 integration tests

### Task 5: Default Value from V9 (AC: 4)
- [ ] Set default failure rate in store initialization
  - Update `src/stores/app-store.ts` default Analysis values
  - Set `failureRatePercentage: 10` (per V9 reference: regularFailureRate=8%, bottleneckFailureRate=12%, batchFailureRate=10%)
  - Use 10% as conservative default (middle value from V9)
  - Set `failureRateMode: 'percentage'` (default mode)
  - Set `absoluteFailureCount: undefined` (not set initially)
- [ ] Add test for default value
  - Test new analysis has failureRatePercentage=10
  - Test new analysis has failureRateMode='percentage'
  - Minimum 2 tests

### Task 6: Update FocusMode Page (AC: 1)
- [ ] Update `src/pages/FocusMode.tsx`
  - Import FailureRateInput component
  - Add FailureRateInput below EquipmentInputs (from Story 2.2)
  - Pass analysisId from URL params to FailureRateInput
  - Maintain vertical layout for input sections
  - Ensure spacing between sections (24px / gap-6)
- [ ] Update `src/pages/FocusMode.test.tsx`
  - Test FailureRateInput renders in FocusMode
  - Test component appears below EquipmentInputs
  - Test analysisId is passed correctly
  - Minimum 3 tests

### Task 7: Export Components and Update Barrel (AC: All)
- [ ] Update `src/components/analysis/index.ts`
  - Add export for FailureRateModeToggle
  - Add export for FailureRateInput
  - Ensure named export pattern
- [ ] Verify barrel export tests
  - Test FailureRateModeToggle is accessible via barrel
  - Test FailureRateInput is accessible via barrel
  - Test import paths work correctly
  - Minimum 3 tests

### Task 8: End-to-End Dual-Mode Flow Test (AC: All)
- [ ] Create integration test file: `src/components/analysis/FailureRateInput.integration.test.tsx`
  - Test complete percentage mode flow:
    1. Create analysis in store
    2. Render FailureRateInput with analysis ID
    3. Verify default mode is "Taux (%)"
    4. Enter "15" in percentage input
    5. Verify store updated with failureRatePercentage=15
  - Test complete count mode flow:
    1. Create analysis with pumpQuantity=8
    2. Render FailureRateInput
    3. Switch to "Nombre de pannes/an" mode
    4. Enter "3" in count input
    5. Verify calculated percentage displays "37.5%"
    6. Verify store updated with failureRatePercentage=37.5 and absoluteFailureCount=3
  - Test mode switching flow:
    1. Enter "3" failures for 8 pumps in count mode
    2. Switch to percentage mode
    3. Verify percentage field shows "37.5"
    4. Edit to "40" in percentage mode
    5. Switch back to count mode
    6. Verify count field shows last entered count (3)
    7. Edit count to "4"
    8. Verify new percentage calculated (50%)
  - Test validation flow:
    1. Enter "-5" in percentage mode
    2. Verify error displays
    3. Verify store NOT updated
    4. Enter "110" in percentage mode
    5. Verify error displays
    6. Enter "10" in percentage mode
    7. Verify error clears
    8. Verify store updated
  - Test disabled count mode flow:
    1. Create analysis with pumpQuantity=0
    2. Render FailureRateInput
    3. Verify count mode option is disabled
    4. Verify helper message displays
    5. Enter pump quantity in EquipmentInputs (integration)
    6. Verify count mode becomes enabled
  - Mock React Router (useParams)
  - Use real Zustand store with cleanup
  - Minimum 5 integration tests (percentage mode, count mode, mode switching, validation, disabled state)

## Dev Notes

### Architecture Patterns from Epic 1, Story 2.1, and Story 2.2

**Component Structure:**
- Named exports only (no default exports)
- TypeScript interfaces for all props
- Co-located tests (component.tsx + component.test.tsx)
- Use `clsx` for conditional class composition
- Follow Tailwind class organization: Layout → Spacing → Typography → Colors → Effects
- Feature-based folder organization: `components/analysis/`

**Styling Standards (Pfeiffer Branding):**
- Primary red: `#CC0000` (active toggle, focus rings)
- Dark red hover: `#A50000`
- Surface colors: `#FFFFFF` (cards), `#F1F2F2` (canvas)
- Typography: 18px (section headings), 16px (labels), 14px (calculated value, error messages)
- Spacing: 16px (gap-4) between inputs, 24px (gap-6) between sections
- Focus rings: `focus:ring-2 focus:ring-pfeiffer-red focus:ring-offset-2`
- Error state: red border (`border-red-600`), red text (`text-red-600`)
- Toggle styling: Active (red bg, white text), Inactive (white bg, gray text)

**State Management (Zustand):**
- ALWAYS use selector pattern: `const analysis = useAppStore((state) => state.analyses.find(a => a.id === analysisId))`
- NEVER destructure: `const { analyses } = useAppStore()` (causes unnecessary re-renders)
- Use updateAnalysis action: `const updateAnalysis = useAppStore((state) => state.updateAnalysis)`
- Immutable updates: spread operator for all state changes
- Store updates must be <100ms (NFR-P1) - measured in tests
- Update multiple fields in single call: `updateAnalysis(id, { failureRatePercentage, absoluteFailureCount, failureRateMode })`

**Validation Strategy:**
- Real-time validation: check on every onChange event
- Local component state for error messages: `const [percentageError, setPercentageError] = useState<string | undefined>()`
- Validation functions in `lib/validation/` (pure, testable)
- Display error below input field (red text, 14px)
- Clear error immediately when user enters valid input
- Do NOT save invalid values to store (validate before calling updateAnalysis)

**Dual-Mode Toggle Pattern:**
- Use controlled component pattern for mode state
- Store mode in Zustand (persists during session)
- Local state for UI responsiveness (mode switch instant)
- Disable count mode when prerequisite data missing (pump quantity)
- Show contextual help when mode unavailable

**Accessibility Requirements (From Epic 1 Retrospective - 60% of stories had issues):**
- Keyboard navigation tested (Tab, Shift+Tab, Arrow keys for toggle, Enter)
- Focus indicators visible on all interactive elements
- ARIA labels for screen readers: `aria-label`, `aria-describedby`
- Toggle has role="radiogroup" or role="group"
- Calculated percentage associated with input via `aria-describedby`
- Disabled state clearly communicated (visual + ARIA)

### Previous Story Intelligence

**From Story 2.2 (Equipment Input Fields) - DONE:**
- EquipmentInputs component fully functional (40 tests, all passing)
- Pump quantity (pumpQuantity) available in store for Story 2.3 calculations
- Validation pattern established: validatePumpQuantity in lib/validation/
- Store integration working: updateAnalysis with numeric fields
- FocusMode page layout established: vertical sections with 24px gap
- Input component from UI library working correctly
- Lessons learned:
  - Validation functions are pure and in lib/validation/
  - French error messages in validation functions (not hardcoded in components)
  - Type="number" inputs still return string in onChange (use parseInt/parseFloat)
  - Test edge cases: zero values, very large numbers, decimals vs integers

**From Story 2.1 (Analysis Creation Modal) - DONE:**
- Modal flow fully implemented and tested (48 tests, all passing)
- Analysis creation working: `addAnalysis` action creates new analysis
- Store structure established: analyses array, activeAnalysisId
- French UI text pattern established
- Max length validation pattern: check in validation function
- Real-time validation pattern: validate on onChange, display error immediately

**From Story 2.6 (ROI Calculation Engine) - DONE:**
- Calculation functions available in `src/lib/calculations.ts`
- Pure functions tested and working (18 tests)
- Performance: calculations complete <1ms
- Note: Story 2.3 BLOCKS Story 2.7 (Results Panel) which uses failureRatePercentage in ROI calculations

**From Story 1.4 (UI Primitive Components) - DONE:**
- Button component: `@/components/ui/Button`
  - Can be styled as toggle: primary variant for active state
  - Props: `variant`, `size`, `onClick`, `disabled`, `className`
- Input component: `@/components/ui/Input`
  - Props: `value`, `onChange`, `label`, `placeholder`, `error`, `type`, `disabled`, `className`
  - Error display: red border + error message below input

**From Story 1.2 (Zustand Store Setup) - DONE:**
- Store fully configured: `@/stores/app-store.ts`
- Analysis interface: `@/types/index.ts`
- Default values set: failureRatePercentage=0 (will update to 10 in this story)
- Actions available: `updateAnalysis` (handles Partial<Analysis>)

### Technical Requirements

**Dependencies (Already Installed):**
- `react` (18+) - Component framework
- `react-router-dom` (6+) - URL params (useParams)
- `zustand` - State management (useAppStore)
- `clsx` - Conditional class composition
- `@testing-library/react` - Testing utilities
- `@testing-library/user-event` - User interaction testing
- `vitest` - Test runner

**No New Dependencies Required**

**Toggle Component Strategy:**
- Use Button components styled as segmented control
- Two buttons side-by-side with conditional styling
- Active button: red background (#CC0000), white text
- Inactive button: white background, gray-700 text, gray-300 border
- Hover on inactive: gray-50 background
- Use flexbox for layout: `flex gap-0 rounded-lg overflow-hidden`
- Border only on outer edges (not between buttons)
- Group with aria-label for accessibility

**Mode Switching Logic:**
- When switching from percentage → count:
  - Keep failureRatePercentage in store (don't delete)
  - Display empty count field (user enters new count)
  - If user enters count, recalculate percentage from count
- When switching from count → percentage:
  - Keep calculated failureRatePercentage visible in percentage field
  - Keep absoluteFailureCount in store (for switching back)
  - User can edit percentage directly
- Store both values to enable smooth mode switching without data loss

**Percentage Calculation Strategy:**
- Formula: `(absoluteFailureCount / pumpQuantity) * 100`
- Use parseFloat for count (allow decimals if user enters)
- Round result to 1 decimal place: `Math.round(result * 10) / 10`
- Display with % symbol: `${percentage}%`
- Handle edge case: if pumpQuantity === 0, disable count mode and show helper message

**Default Value from V9 Reference:**
- V9 had three categories with different default failure rates:
  - Regular tools: 8%
  - Bottleneck tools: 12%
  - Batch tools: 10%
- V10 uses single analysis per process (more flexible)
- Choose 10% as default (conservative middle value)
- User can adjust based on specific process type

**Store Update Strategy:**
- In percentage mode: `updateAnalysis(id, { failureRateMode: 'percentage', failureRatePercentage: parseFloat(value) })`
- In count mode:
  ```typescript
  const percentage = calculatePercentageFromCount(parseInt(value), analysis.pumpQuantity);
  updateAnalysis(id, {
    failureRateMode: 'count',
    failureRatePercentage: percentage,
    absoluteFailureCount: parseInt(value)
  });
  ```
- Always update mode field to track current input method
- Update timing: <100ms per NFR-P1 (measured in tests)

**Calculated Percentage Display Strategy:**
- Show below count input in count mode only
- Format: "Taux calculé: [X]%"
- Style: gray-600 text, 14px, medium weight
- Update in real-time as user types
- Use aria-describedby to associate with input for screen readers

### Testing Requirements

**Test Coverage:**
- FailureRateModeToggle: 8 tests
- FailureRateInput: 12 tests
- failure-rate-validation: 12 tests
- Store integration: 6 tests
- Default values: 2 tests
- FocusMode integration: 3 tests
- Barrel exports: 3 tests
- Integration tests: 5 tests (percentage, count, switching, validation, disabled)
- **Total: 51 tests minimum**

**Testing Strategy:**
- Unit tests for toggle component (mode selection, styling, keyboard)
- Unit tests for input component (rendering, mode switching, display)
- Unit tests for validation functions (pure function testing)
- Integration tests for store updates (mode switching with data preservation)
- Integration tests for calculation accuracy (count → percentage conversion)
- Accessibility tests (keyboard navigation, ARIA attributes, screen reader)
- Validation flow tests (invalid → valid → store update)
- Performance tests (store update <100ms, calculation <1ms)
- Edge case tests (pump quantity = 0, mode switching multiple times)

**Testing Tools:**
- Vitest + React Testing Library (already configured)
- `@testing-library/user-event` for clicking toggle, typing in inputs
- `screen.getByRole` for accessibility queries (radiogroup, textbox)
- `screen.getByLabelText` for label associations
- Mock `useParams` from React Router for FocusMode tests
- Use real Zustand store with cleanup (or mock if needed)

**Testing Patterns from Previous Stories:**
- Test user typing with `await userEvent.type(input, '10')`
- Test button clicks with `await userEvent.click(button)`
- Test mode switching with toggle clicks
- Test calculated values with `expect(screen.getByText(/taux calculé: 37.5%/i)).toBeInTheDocument()`
- Test validation with `expect(screen.getByText(/error message/i)).toBeInTheDocument()`
- Test store updates with `expect(store.getState().analyses[0].failureRatePercentage).toBe(10)`
- Test accessibility with `screen.getByRole('group', { name: /mode de saisie/i })`
- Use `beforeEach` to reset store state and create test analysis

### File Structure Requirements

**New Files to Create:**
```
src/components/analysis/
├── FailureRateModeToggle.tsx                # Toggle component (NEW)
├── FailureRateModeToggle.test.tsx           # Toggle tests (NEW)
├── FailureRateInput.tsx                     # Main input component (NEW)
├── FailureRateInput.test.tsx                # Component tests (NEW)
├── FailureRateInput.integration.test.tsx    # E2E dual-mode tests (NEW)
└── index.ts                                 # Update: add new exports

src/lib/validation/
├── failure-rate-validation.ts               # Validation + calculation logic (NEW)
└── failure-rate-validation.test.ts          # Validation tests (NEW)

src/types/
└── index.ts                                 # Update: add failureRateMode, absoluteFailureCount fields
```

**Files to Modify:**
```
src/pages/FocusMode.tsx                      # Add FailureRateInput below EquipmentInputs
src/pages/FocusMode.test.tsx                 # Add integration tests
src/stores/app-store.ts                      # Update default failureRatePercentage to 10
src/types/index.ts                           # Add failureRateMode, absoluteFailureCount to Analysis
src/components/analysis/index.ts             # Add FailureRateInput, FailureRateModeToggle exports
```

**Naming Conventions:**
- PascalCase for components: `FailureRateInput`, `FailureRateModeToggle`
- camelCase for functions/handlers: `calculatePercentageFromCount`, `handleModeChange`
- kebab-case for utility files: `failure-rate-validation.ts`
- Named exports only (no default exports)

### UX Design Notes

**From Epic 2 Requirements:**
- Dual-mode input: percentage OR absolute count (not both visible)
- Toggle switches input display (not just unit conversion)
- Count mode context: show pump quantity to help user understand calculation
- Real-time calculation display: user sees percentage as they type count
- Default mode: percentage (more common in client discussions)
- Default value: 10% (from V9 analysis, conservative estimate)

**Toggle Design:**
- Segmented control pattern (iOS/macOS style)
- Two options side-by-side, equal width
- Active option: Pfeiffer red background, white text
- Inactive option: white background, dark gray text
- Clear visual distinction between active/inactive
- No animation on switch (instant feedback)
- Positioned above input field

**Input Field Layout:**
- Single input field visible at a time (mode-dependent)
- Label changes based on mode:
  - Percentage: "Taux de panne annuel (%)"
  - Count: "Nombre de pannes (année dernière)"
- Placeholder examples:
  - Percentage: "ex: 10"
  - Count: "ex: 3"
- Context display in count mode: "Pour 8 pompes" (below toggle, above input)
- Calculated percentage in count mode: "Taux calculé: 37.5%" (below input, gray text)
- Error messages below input (same position regardless of mode)

**Mode Switching UX:**
- Toggle click switches mode instantly (no confirmation)
- Input value preserved when switching back to previous mode
- Calculated percentage visible immediately when switching to percentage mode
- No data loss on mode switching
- User can freely experiment with both input methods

**Disabled Count Mode UX:**
- When pump quantity is 0 or empty:
  - Count mode button is grayed out and not clickable
  - Helper message displays: "Entrez d'abord le nombre de pompes"
  - Percentage mode remains active and functional
- When user enters pump quantity in EquipmentInputs:
  - Count mode becomes enabled automatically
  - User can switch to count mode
  - Helper message disappears

**Accessibility UX:**
- Toggle has clear labels and visible active state
- Keyboard navigation: Tab to toggle group, Arrow keys to switch, Enter to confirm
- Screen reader announces mode change: "Taux (%) selected" or "Nombre de pannes/an selected"
- Calculated percentage associated with input for screen readers
- Disabled count mode announced: "Count mode unavailable. Enter pump quantity first."
- All error messages announced to screen readers

### Performance Considerations

**NFR-P1 (Store Updates <100ms):**
- Zustand updates are synchronous and fast (<1ms typically)
- Validation functions must be <1ms (simple numeric checks)
- Calculation function (count → percentage) <1ms (single division + rounding)
- Total onChange handler time: validate + calculate + store update <5ms
- Mode switching instant (local state update + Zustand update)
- Measured in tests using `performance.now()` before/after

**NFR-P4 (Navigation <200ms):**
- Focus Mode page already loads <200ms (from Stories 1.5, 2.2)
- Adding FailureRateInput should not degrade performance
- Component is lightweight (1 toggle + 1 input + 2 text displays)
- No heavy computation (calculation is simple formula)

**NFR-S1 (No Server Transmission):**
- All data remains client-side (Zustand in-memory store)
- No API calls, no fetch requests
- Validation and calculation happen client-side
- Mode preference stored in session (Zustand, not localStorage)

**NFR-R4 (Input Validation Prevents Runtime Errors):**
- Validation prevents invalid percentage values (>100, negative) from reaching calculations
- Validation prevents invalid count values (negative, non-integer) from causing calculation errors
- Store only receives valid data (parseFloat succeeds, within bounds)
- Calculation engine (Story 2.6) can safely use failureRatePercentage without additional checks
- Edge case handled: pump quantity = 0 disables count mode (prevents division by zero)

### Blocking Dependencies

**Story 2.3 DEPENDS ON:**
- Story 2.1: Analysis Creation Modal and Store Integration (DONE - analysis must exist)
- Story 2.2: Equipment Input Fields (DONE - pump quantity required for count mode)
- Story 1.2: Zustand Store Setup (DONE - updateAnalysis action available)
- Story 1.4: UI Primitive Components (DONE - Input, Button components available)
- Story 1.5: Application Shell (DONE - FocusMode page exists)

**All dependencies are DONE and tested - Story 2.3 is READY FOR DEV**

**Story 2.3 BLOCKS:**
- Story 2.7: Results Panel with Real-Time Display (needs failureRatePercentage for ROI calculation)
- Story 5.3: PDF Content Structure (needs failure rate data for report)

**Story 2.3 is P1 (high priority) - required for ROI calculation to function**

### Git Intelligence

**Recent Commit Patterns:**
- Story completion commits: "Complete Story X.Y: [Title]"
- Include comprehensive summary in commit body
- List files changed with brief descriptions
- Include test count and status
- Code review notes if applicable
- Co-authored-by attribution

**Expected Commit for Story 2.3:**
```
Complete Story 2.3: Failure Rate Dual-Mode Input

- Add FailureRateModeToggle component with percentage/count mode switching
- Add FailureRateInput component with dual-mode display and real-time calculation
- Implement failure-rate-validation utility with percentage/count validation
- Implement calculatePercentageFromCount function (count → percentage conversion)
- Integrate with Zustand store (failureRateMode, absoluteFailureCount fields)
- Add pump quantity dependency (count mode disabled when pump quantity = 0)
- Update Analysis interface with failureRateMode and absoluteFailureCount fields
- Update FocusMode page to display FailureRateInput below EquipmentInputs
- Set default failure rate to 10% (from V9 reference)
- Create comprehensive tests (51 tests, 100% passing)
- Export FailureRateInput and FailureRateModeToggle from analysis barrel

Story status: done

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

**Files Expected in Commit:**
- New: `src/components/analysis/FailureRateModeToggle.tsx`
- New: `src/components/analysis/FailureRateModeToggle.test.tsx`
- New: `src/components/analysis/FailureRateInput.tsx`
- New: `src/components/analysis/FailureRateInput.test.tsx`
- New: `src/components/analysis/FailureRateInput.integration.test.tsx`
- New: `src/lib/validation/failure-rate-validation.ts`
- New: `src/lib/validation/failure-rate-validation.test.ts`
- Modified: `src/components/analysis/index.ts`
- Modified: `src/pages/FocusMode.tsx`
- Modified: `src/pages/FocusMode.test.tsx`
- Modified: `src/stores/app-store.ts` (default failureRatePercentage=10)
- Modified: `src/types/index.ts` (add failureRateMode, absoluteFailureCount)
- Modified: `_bmad-output/implementation-artifacts/sprint-status.yaml`
- Modified: `_bmad-output/implementation-artifacts/2-3-failure-rate-dual-mode-input.md`

### French Localization (UI Text)

**Component Text:**
- Section heading: "Taux de panne"
- Toggle option 1: "Taux (%)"
- Toggle option 2: "Nombre de pannes/an"
- Percentage mode label: "Taux de panne annuel (%)"
- Percentage mode placeholder: "ex: 10"
- Count mode label: "Nombre de pannes (année dernière)"
- Count mode placeholder: "ex: 3"
- Count mode context: "Pour [X] pompes"
- Calculated percentage display: "Taux calculé: [X]%"
- Error message (negative): "Doit être un nombre positif"
- Error message (> 100% in percentage mode): "Le taux doit être entre 0 et 100%"
- Error message (non-integer in count mode): "Doit être un nombre entier positif"
- Helper message (count mode disabled): "Entrez d'abord le nombre de pompes"

**Notes:**
- All user-facing text is in French (per client requirements)
- Code, comments, and tests remain in English
- Error messages are stored in validation functions (not hardcoded in components)
- Helper messages in component (context-specific)

### V9 Reference (Failure Rate Defaults)

**From V9 Calculator (calculateur-argos/):**
- V9 had three fixed pump categories with different failure rates:
  - Regular tools: 8% (regularFailureRate)
  - Bottleneck tools: 12% (bottleneckFailureRate)
  - Batch tools: 10% (batchFailureRate)
- V9 used fixed percentage input only (no count mode)
- V9 calculation: `const failedPumps = pumpsInSegment * (failureRate / 100)`
- V10 adds flexibility:
  - Single analysis per process (user creates multiple analyses for different tool types)
  - Dual-mode input (percentage OR count)
  - Default 10% (conservative middle value from V9)
- V10 calculation engine (Story 2.6) already implemented, uses failureRatePercentage

**Failure Rate Context from Product Brief:**
- Semiconductor clients share failure rates verbally during meetings (sensitive data)
- Clients may say "We had 3 pump failures last year on 8 pumps" (count mode)
- OR clients may say "About 10% of our pumps fail annually" (percentage mode)
- V10 dual-mode adapts to client's data format (critical for live meeting use case)

### References

**Source Documents:**
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 2 - Story 2.3]
- [Source: _bmad-output/planning-artifacts/prd.md#FR11, FR12, FR13]
- [Source: _bmad-output/planning-artifacts/architecture.md#Component Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Validation: Zod]
- [Source: _bmad-output/implementation-artifacts/2-2-equipment-input-fields-pump-type-quantity.md#Pump Quantity]
- [Source: _bmad-output/implementation-artifacts/2-1-analysis-creation-modal-and-store-integration.md#Store Integration]
- [Source: _bmad-output/implementation-artifacts/1-4-ui-primitive-components.md#Button, Input Components]

**External Resources:**
- React Controlled Inputs: https://react.dev/reference/react-dom/components/input
- Toggle Component Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/radio/
- Number Formatting: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed

**V9 Reference:**
- [Source: calculateur-argos/index-offline.html#failureRate calculations] (read-only reference)
- Default values: regularFailureRate=8%, bottleneckFailureRate=12%, batchFailureRate=10%

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
