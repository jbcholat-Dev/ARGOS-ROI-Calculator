# Story 2.4: Wafer Type and Cost Inputs

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

**As a** user (JB conducting client meetings),
**I want** to enter wafer type, quantity per batch, and cost per wafer,
**So that** I can capture the client's production economics for accurate ROI calculation.

## Acceptance Criteria

**Given** I am in Focus Mode for an analysis (/analysis/:id)
**When** I see the InputPanel component
**Then** I see a "Wafer" section below the Equipment and Failure Rate sections
**And** I see radio buttons: "Mono-wafer" and "Batch"
**And** "Mono-wafer" is selected by default

**When** I select "Mono-wafer" radio button
**Then** the waferType is set to 'mono' in the store
**And** the "Wafers per batch" field is hidden
**And** waferQuantity is automatically set to 1 in the store

**When** I select "Batch" radio button
**Then** the waferType is set to 'batch' in the store
**And** a "Wafers per batch" numeric input field appears
**And** the field displays default value 125 (pre-filled)
**And** the field is editable

**When** I edit the "Wafers per batch" field to "100"
**Then** the value is saved to the store as a number
**And** the store update completes within 100ms (NFR-P1)

**When** I enter "-10" or "0" in "Wafers per batch"
**Then** I see validation error: "Doit être un nombre positif"
**And** the invalid value is NOT saved to the store
**And** the input field has red border (error state)

**When** I see the "Coût par wafer (€)" field
**Then** it displays a numeric input with placeholder "ex: 8000"
**And** the field shows default value 8000 (from V9 reference)
**And** the value is formatted with thousands separator when displayed (e.g., "8 000")

**When** I enter "12500" in the wafer cost field
**Then** the value is saved to the store as 12500 (number)
**And** the displayed value shows "12 500" (formatted with space)
**And** the euro symbol (€) is visible in the label or as suffix

**When** I enter "-5000" or "0" in wafer cost
**Then** I see validation error: "Doit être un nombre positif"
**And** the invalid value is NOT saved to the store

**When** I enter "abc" or non-numeric text in any numeric field
**Then** I see validation error: "Doit être un nombre positif"
**And** the input field has red border

**When** I correct any invalid input to a valid value
**Then** the error message disappears immediately
**And** the red border is removed
**And** the value is saved to store

**When** I leave the page and return to the same analysis
**Then** the previously selected wafer type and entered values are still displayed
**And** the values persist in the Zustand store during the session

**FRs Covered:** FR14 (Select wafer type), FR15 (Enter wafer quantity for batch), FR16 (Enter wafer cost), FR17 (Default batch quantity 125), FR25 (Validate positive numbers), FR26 (Real-time validation feedback)

**NFRs Addressed:** NFR-P1 (<100ms store updates), NFR-S1 (client-side only), NFR-R4 (input validation prevents runtime errors)

## Tasks / Subtasks

### Task 1: Create WaferInputs Component (AC: 1, 2, 3, 4)
- [ ] Create `src/components/analysis/WaferInputs.tsx`
  - Export named component `WaferInputs`
  - TypeScript interface `WaferInputsProps`:
    - `analysisId: string` - ID of the analysis being edited
  - Fetch analysis from store using `useAppStore` with selector pattern
  - Render section with heading "Wafer"
  - Render radio button group for wafer type:
    - Label: "Type de wafer"
    - Options: "Mono-wafer" (value: 'mono'), "Batch" (value: 'batch')
    - Default selection: 'mono'
    - Use semantic HTML: `<fieldset>` + `<legend>` for accessibility
    - Style radio buttons with Pfeiffer branding (checked state uses red accent)
  - Conditionally render "Wafers per batch" field (only when waferType='batch'):
    - Label: "Wafers par lot"
    - Type: "number"
    - Default value: 125
    - Placeholder: "ex: 125"
  - Render "Wafer cost" field (always visible):
    - Label: "Coût par wafer (€)"
    - Type: "number"
    - Default value: 8000
    - Placeholder: "ex: 8000"
    - Format displayed value with thousands separator (space): "8 000"
  - Handle wafer type change:
    - Update store with new waferType
    - If changed to 'mono': set waferQuantity=1 automatically
    - If changed to 'batch': set waferQuantity=125 automatically (if not already set)
  - Handle wafer quantity change (batch mode):
    - Validate before updating store (positive integer)
    - Save as number (not string)
  - Handle wafer cost change:
    - Validate before updating store (positive number)
    - Save raw number (8000) but display formatted (8 000)
  - Use `clsx` for conditional styling
  - Follow Tailwind class organization
  - Add aria-labels and fieldset/legend for accessibility
- [ ] Create `src/components/analysis/WaferInputs.test.tsx`
  - Test component renders with correct labels
  - Test default state: mono-wafer selected, wafer quantity hidden
  - Test batch selection shows wafer quantity field with default 125
  - Test mono-wafer selection hides wafer quantity field
  - Test wafer type updates store correctly
  - Test wafer quantity auto-sets to 1 when mono selected
  - Test wafer quantity auto-sets to 125 when batch selected
  - Test wafer quantity validation (positive numbers)
  - Test wafer cost validation (positive numbers)
  - Test wafer cost formatting (8000 → "8 000")
  - Test error messages display correctly
  - Test error styling (red border) applies
  - Test errors clear on valid input
  - Test component handles missing analysis gracefully
  - Test accessibility (fieldset, legend, aria-labels, keyboard navigation)
  - Test radio button keyboard navigation (arrow keys)
  - Minimum 16 tests

### Task 2: Implement Input Validation Logic (AC: 5, 8, 9, 10)
- [ ] Create `src/lib/validation/wafer-validation.ts`
  - Export function `validateWaferQuantity(value: string): { isValid: boolean; error?: string }`
    - Validation rules:
      - Must be numeric (parseInt, isNaN check)
      - Must be > 0 (positive integer)
      - Must be <= 1000 (maximum limit - same as pump quantity)
    - Return error messages in French:
      - Non-numeric or ≤ 0: "Doit être un nombre positif"
      - > 1000: "Maximum 1000 wafers"
    - Function is pure (no side effects)
  - Export function `validateWaferCost(value: string): { isValid: boolean; error?: string }`
    - Validation rules:
      - Must be numeric (parseFloat, isNaN check)
      - Must be > 0 (positive number)
      - Must be <= 1000000 (maximum 1M EUR - reasonable cap)
    - Return error messages in French:
      - Non-numeric or ≤ 0: "Doit être un nombre positif"
      - > 1000000: "Maximum 1 000 000 €"
    - Function is pure (no side effects)
  - Export function `formatEuroCurrency(value: number): string`
    - Format number with thousands separator (space)
    - Example: 8000 → "8 000"
    - Example: 12500 → "12 500"
    - Example: 125000 → "125 000"
    - Use French number formatting (Intl.NumberFormat with locale 'fr-FR')
- [ ] Create `src/lib/validation/wafer-validation.test.ts`
  - Test validateWaferQuantity with valid inputs (1, 125, 500)
  - Test validateWaferQuantity rejects negative numbers
  - Test validateWaferQuantity rejects zero
  - Test validateWaferQuantity rejects non-numeric strings
  - Test validateWaferQuantity rejects values > 1000
  - Test validateWaferCost with valid inputs (100, 8000, 50000)
  - Test validateWaferCost rejects negative numbers
  - Test validateWaferCost rejects zero
  - Test validateWaferCost rejects non-numeric strings
  - Test validateWaferCost rejects values > 1000000
  - Test formatEuroCurrency with various numbers (8000, 12500, 125000)
  - Test formatEuroCurrency edge cases (0, 1, 1000, 999999)
  - Minimum 12 tests

### Task 3: Integrate with Zustand Store (AC: 2, 3, 4, 7, 11)
- [ ] Verify `src/stores/app-store.ts` has `updateAnalysis` action
  - Ensure immutable updates (spread operator)
  - Ensure selector pattern is used in components
  - Update `updatedAt` timestamp on every change
  - Verify Analysis interface has waferType, waferQuantity, waferCost fields
- [ ] Add store integration tests in WaferInputs.test.tsx
  - Test store selector retrieves correct analysis
  - Test updateAnalysis is called with waferType change
  - Test waferQuantity auto-updates when switching types
  - Test waferQuantity updates as number (not string)
  - Test waferCost updates as number (not string)
  - Test invalid values do NOT trigger store update
  - Test updatedAt timestamp changes on update
  - Test default values are set correctly (mono + 1, batch + 125, cost 8000)
  - Minimum 8 integration tests

### Task 4: Update FocusMode Page (AC: 1)
- [ ] Update `src/pages/FocusMode.tsx`
  - Import WaferInputs component
  - Add WaferInputs below EquipmentInputs and FailureRateInputs (if they exist)
  - Pass analysisId from URL params to WaferInputs
  - Maintain consistent InputPanel layout spacing (24px vertical gap between sections)
  - Ensure scrolling works if content exceeds viewport
- [ ] Update `src/pages/FocusMode.test.tsx`
  - Test WaferInputs renders in FocusMode
  - Test component order (Equipment → Failure Rate → Wafer)
  - Test analysisId is passed correctly
  - Minimum 3 tests

### Task 5: French Number Formatting Integration (AC: 6, 7)
- [ ] Implement controlled input with formatting
  - Store raw numeric value (8000) in Zustand store
  - Display formatted value (8 000) in input field
  - Handle onChange: parse user input → validate → save raw number
  - Handle onFocus: optionally remove formatting for easier editing
  - Handle onBlur: re-apply formatting after user finishes editing
  - Ensure cursor position is preserved during formatting (if possible)
- [ ] Add formatting tests
  - Test raw value 8000 displays as "8 000"
  - Test user can type "12500" and it saves as 12500
  - Test formatting applies on blur
  - Test formatting is removed on focus (optional)
  - Minimum 4 tests

### Task 6: Port V9 Wafer Defaults (AC: 6, 7)
- [ ] Review V9 wafer defaults in `calculateur-argos/src/components/PredictiveMaintenanceROICalculator.jsx`
  - V9 default wafer cost: €8,000 (from Regular Pumps segment)
  - V9 default batch quantity: 125 wafers
  - V9 wafer types: Mono-wafer vs. Batch (same as V10)
- [ ] Verify V10 defaults match V9
  - Default waferCost: 8000 (EUR)
  - Default waferQuantity for batch: 125
  - Default waferQuantity for mono: 1
- [ ] Document any deviations in code comments
  - V10 simplification: Single analysis instead of 3 segments
  - V10 enhancement: Per-process granularity

### Task 7: Export Component and Update Barrel (AC: All)
- [ ] Update `src/components/analysis/index.ts`
  - Add export for WaferInputs
  - Ensure named export pattern
- [ ] Verify barrel export tests
  - Test WaferInputs is accessible via barrel
  - Test import path works correctly
  - Minimum 2 tests

### Task 8: End-to-End Input Flow Test (AC: All)
- [ ] Create integration test file: `src/components/analysis/WaferInputs.integration.test.tsx`
  - Test complete flow: Load analysis → Select wafer type → Enter values → Verify store
  - Test mode switching flow: Mono → Batch → Verify auto-fill → Edit quantity → Verify store
  - Test validation flow: Enter invalid cost → Error displays → Correct → Error clears
  - Test persistence flow: Enter values → Navigate away → Return → Values persist
  - Mock React Router (useParams)
  - Use real Zustand store with cleanup
  - Test flow:
    1. Create analysis in store (default: mono, waferQuantity=1, waferCost=8000)
    2. Render WaferInputs with analysis ID
    3. Verify "Mono-wafer" is selected
    4. Verify wafer quantity field is hidden
    5. Click "Batch" radio button
    6. Verify "Wafers par lot" field appears
    7. Verify field shows default value 125
    8. Verify store updated with waferType='batch', waferQuantity=125
    9. Enter "200" in wafers per batch
    10. Verify store updated with waferQuantity=200
    11. Enter "15000" in wafer cost
    12. Verify store updated with waferCost=15000
    13. Verify displayed value is "15 000" (formatted)
    14. Enter "-100" in wafer cost
    15. Verify error displays
    16. Verify store NOT updated
    17. Enter "10000" in wafer cost
    18. Verify error clears
    19. Verify store updated with waferCost=10000
  - Minimum 3 integration tests (happy path, mode switching, validation)

## Dev Notes

### Architecture Patterns from Epic 1 and Epic 2

**Component Structure:**
- Named exports only (no default exports)
- TypeScript interfaces for all props
- Co-located tests (component.tsx + component.test.tsx)
- Use `clsx` for conditional class composition
- Follow Tailwind class organization: Layout → Spacing → Typography → Colors → Effects
- Feature-based folder organization: `components/analysis/`

**Styling Standards (Pfeiffer Branding):**
- Primary red: `#CC0000` (radio buttons checked state, focus rings)
- Dark red hover: `#A50000`
- Surface colors: `#FFFFFF` (cards), `#F1F2F2` (canvas)
- Typography: 18px (section headings), 16px (labels), 14px (error messages)
- Spacing: 24px vertical gap between InputPanel sections
- Focus rings: `focus:ring-2 focus:ring-pfeiffer-red focus:ring-offset-2`
- Error state: red border (`border-red-600`), red text (`text-red-600`)

**State Management (Zustand):**
- ALWAYS use selector pattern: `const analysis = useAppStore((state) => state.analyses.find(a => a.id === analysisId))`
- NEVER destructure: `const { analyses } = useAppStore()` (causes unnecessary re-renders)
- Immutable updates: use spread operator for all state changes
- Action naming: verb + noun (updateAnalysis, setWaferType)
- Auto-update related fields: when waferType changes, update waferQuantity automatically

**Validation Strategy:**
- Real-time validation on every input change
- Pure validation functions in `lib/validation/`
- Validation functions return `{ isValid: boolean; error?: string }`
- Show error immediately when invalid input is entered
- Clear error as soon as user types valid input
- Do NOT save invalid values to store
- All validation completes synchronously (<1ms)

**Accessibility Requirements:**
- Radio buttons: Use semantic HTML (`<fieldset>`, `<legend>`, `<input type="radio">`)
- Radio button groups: fieldset with legend for group label
- Radio button keyboard navigation: arrow keys to navigate, Enter/Space to select
- Labels: All inputs have associated `<label>` elements with `htmlFor` attribute
- ARIA attributes: `aria-describedby` for error messages, `aria-invalid` for error state
- Focus management: visible focus rings on all interactive elements
- Error messages: associated with input using `aria-describedby`

**Number Formatting (French Locale):**
- Use `Intl.NumberFormat('fr-FR')` for consistent French formatting
- Thousands separator: space (not comma) - "8 000" not "8,000"
- Store raw numbers in Zustand (8000)
- Display formatted strings in UI (8 000)
- Parse user input back to numbers before validation
- Handle edge cases: empty string, partial input ("8 0")

### Previous Story Intelligence

**From Story 2.1 (Analysis Creation Modal):**
- Analysis creation modal is DONE and tested (48 tests total)
- Analysis interface in types/index.ts includes:
  - `waferType: WaferType` ('mono' | 'batch')
  - `waferQuantity: number` (default: 1 for mono, 125 for batch)
  - `waferCost: number` (default: 8000 EUR)
- Store automatically sets default values when analysis is created
- Store uses selector pattern for optimal performance
- Navigation works: Dashboard → FocusMode (/analysis/:id)

**From Story 2.2 (Equipment Input Fields):**
- EquipmentInputs component is ready-for-dev (Story 2.2)
- Validation pattern established in `lib/validation/equipment-validation.ts`
- Error message pattern: "Doit être un nombre positif"
- Input component from `@/components/ui/Input` supports error state
- Store update pattern: validate → parse to number → updateAnalysis
- InputPanel section structure: heading + input fields with vertical spacing
- French labels and placeholders established

**From Story 2.3 (Failure Rate Dual-Mode Input):**
- FailureRateInputs component is ready-for-dev (Story 2.3)
- Toggle pattern established for mode switching (percentage/absolute)
- Auto-calculation pattern: when mode changes, recalculate dependent values
- Conditional rendering pattern: show/hide fields based on mode selection
- Consistent section spacing in InputPanel (24px vertical gap)

**From Story 2.6 (ROI Calculation Engine):**
- Calculation functions use waferCost and waferQuantity in formula
- Formula: `totalFailureCost = (pumpQuantity * failureRate/100) * (waferCost * wafersPerBatch + downtimeHours * downtimeCostPerHour)`
- Wafer economics are CRITICAL to ROI calculation accuracy
- Default values must match V9 for consistency: waferCost=8000, batch=125

**Code Review Learnings from Epic 1:**
- Radio button accessibility: always use fieldset + legend
- Radio button keyboard navigation: test arrow keys, Enter, Space
- Conditional rendering: test show/hide behavior thoroughly
- Number formatting: test edge cases (0, 1, 1000, 999999)
- Test coverage: minimum 15-20 tests per component for comprehensive coverage

### Technical Requirements

**Dependencies (Already Installed):**
- `react` (18+) - Component framework
- `react-dom` - DOM rendering
- `react-router-dom` (6+) - Navigation (useParams hook)
- `zustand` - State management (useAppStore)
- `clsx` - Conditional class composition
- `@testing-library/react` - Testing utilities
- `@testing-library/user-event` - User interaction testing
- `vitest` - Test runner

**No New Dependencies Required**

**Radio Button Implementation:**
- Use native HTML `<input type="radio">` elements
- Use `<fieldset>` + `<legend>` for semantic grouping
- Use `name` attribute for radio group (same name for all options)
- Use `checked` attribute controlled by React state
- Use `onChange` handler to update state
- Style with Tailwind: custom radio button with checked state styling
- Checked state: red dot/fill (`bg-pfeiffer-red`)
- Focus state: red focus ring (`focus:ring-pfeiffer-red`)

**Conditional Rendering Strategy:**
- Use React conditional rendering: `{waferType === 'batch' && <Input ... />}`
- Update store immediately when wafer type changes
- Auto-set waferQuantity based on wafer type selection
- Show/hide "Wafers per batch" field based on waferType
- Maintain smooth transitions (no jarring layout shifts)

**Number Formatting Strategy:**
- Store raw number in Zustand: `waferCost: 8000`
- Display formatted string in UI: "8 000"
- Use `Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })` for formatting
- Parse user input: `const num = parseFloat(value.replace(/\s/g, ''))`
- Validate parsed number before saving to store
- Apply formatting on blur (after user finishes editing)
- Optional: remove formatting on focus (easier editing)

**Store Update Pattern:**
```typescript
// Wafer type change (auto-update quantity)
const handleWaferTypeChange = (newType: WaferType) => {
  updateAnalysis(analysisId, {
    waferType: newType,
    waferQuantity: newType === 'mono' ? 1 : 125,
  });
};

// Wafer quantity change (validate first)
const handleWaferQuantityChange = (value: string) => {
  const validation = validateWaferQuantity(value);
  if (validation.isValid) {
    updateAnalysis(analysisId, {
      waferQuantity: parseInt(value, 10),
    });
  }
  // Show error if validation fails
};

// Wafer cost change (validate first)
const handleWaferCostChange = (value: string) => {
  const parsed = parseFloat(value.replace(/\s/g, '')); // Remove spaces
  const validation = validateWaferCost(parsed.toString());
  if (validation.isValid) {
    updateAnalysis(analysisId, {
      waferCost: parsed,
    });
  }
  // Show error if validation fails
};
```

### Testing Requirements

**Test Coverage:**
- WaferInputs: 16 tests
- Wafer validation functions: 12 tests
- Wafer formatting function: 4 tests
- FocusMode integration: 3 tests
- Store integration: 8 tests
- Barrel exports: 2 tests
- Integration tests: 3 tests
- **Total: 48 tests minimum**

**Testing Strategy:**
- Unit tests for each component in isolation
- Unit tests for validation functions (pure functions)
- Unit tests for formatting functions (pure functions)
- Integration tests for component + store interactions
- Integration tests for mode switching (mono ↔ batch)
- Integration tests for validation flow (invalid → valid → store update)
- Accessibility tests (radio button keyboard navigation, fieldset/legend)
- Number formatting tests (display vs. stored value)

**Testing Tools:**
- Vitest + React Testing Library (already configured)
- `@testing-library/user-event` for realistic user interactions
- `screen.getByRole('radio')` for radio button queries
- `screen.getByLabelText` for input field queries
- `screen.getByText` for error message queries
- Mock `useParams` from React Router for analysisId
- Use real Zustand store with cleanup after each test

**Testing Patterns from Epic 1 and Story 2.1:**
- Test radio button selection with `userEvent.click(radioButton)`
- Test keyboard navigation with `userEvent.keyboard('{ArrowDown}')`
- Test focus management with `expect(document.activeElement).toBe(element)`
- Test conditional rendering with `expect(screen.queryByLabelText(...)).not.toBeInTheDocument()`
- Test error states with `screen.getByText(/error message/i)`
- Test number formatting with snapshot testing or exact string match

### File Structure Requirements

**New Files to Create:**
```
src/components/analysis/
├── WaferInputs.tsx                   # Main component with radio + inputs
├── WaferInputs.test.tsx              # Component tests (16 tests)
├── WaferInputs.integration.test.tsx  # E2E flow tests (3 tests)

src/lib/validation/
├── wafer-validation.ts               # Pure validation + formatting functions
├── wafer-validation.test.ts          # Validation tests (12 tests)
```

**Files to Modify:**
```
src/pages/FocusMode.tsx               # Add WaferInputs below FailureRateInputs
src/pages/FocusMode.test.tsx          # Add integration tests (3 tests)
src/components/analysis/index.ts      # Add WaferInputs export
```

**Naming Conventions:**
- PascalCase for components: `WaferInputs`
- camelCase for functions/handlers: `handleWaferTypeChange`, `validateWaferQuantity`
- Named exports only (no default exports)

### UX Design Notes

**From Epic 2 Requirements:**
- Section heading: "Wafer" (18px, bold)
- Radio button group first (wafer type selection)
- Conditional field second (wafers per batch, if batch selected)
- Wafer cost field last (always visible)
- Vertical spacing: 16px between fields within section, 24px between sections
- Field width: full width of InputPanel (responsive)

**Radio Button Layout:**
- Horizontal layout: "Mono-wafer" and "Batch" side-by-side
- Each radio button: circle + label
- Selected state: red filled circle
- Unselected state: empty circle with gray border
- Hover state: subtle background color change
- Focus state: red focus ring

**Wafers per Batch Field (Conditional):**
- Only visible when "Batch" is selected
- Smooth appearance (CSS transition optional)
- Pre-filled with default value 125
- User can edit the default value
- Placeholder: "ex: 125"

**Wafer Cost Field:**
- Always visible (both mono and batch modes)
- Label includes euro symbol: "Coût par wafer (€)"
- Placeholder: "ex: 8000"
- Displayed value formatted: "8 000" (space separator)
- Input accepts raw numbers: user types "8000", sees "8 000" on blur

**French Localization (UI Text):**
- Section heading: "Wafer"
- Radio button labels: "Mono-wafer", "Batch"
- Wafer quantity label: "Wafers par lot"
- Wafer cost label: "Coût par wafer (€)"
- Error message: "Doit être un nombre positif"
- Placeholder examples: "ex: 125", "ex: 8000"

**Notes:**
- All user-facing text is in French (per client requirements)
- Code, comments, and tests remain in English
- Euro symbol (€) is part of the label, not the input value
- Number formatting uses French conventions (space separator)

### Performance Considerations

**NFR-P1 (Calculations <100ms):**
- Store update (updateAnalysis) must complete <100ms
- Validation functions execute synchronously (<1ms)
- Number formatting executes synchronously (<1ms)
- No async operations in validation or formatting
- Zustand updates are synchronous and fast

**NFR-S1 (No Server Transmission):**
- All data remains client-side (Zustand in-memory store)
- No API calls, no fetch requests
- Number formatting done client-side (Intl.NumberFormat)
- Validation done client-side (pure functions)

**NFR-R5 (2+ hour session stability):**
- No memory leaks from conditional rendering
- Component cleanup on unmount (useEffect cleanup if needed)
- Store does not accumulate unnecessary data
- Number formatting does not create memory leaks (pure function)

### Blocking Dependencies

**Story 2.4 BLOCKS:**
- Story 2.7: Results Panel with Real-Time Display (needs waferCost and waferQuantity for ROI calculation)

**Story 2.4 DEPENDS ON:**
- Story 2.1: Analysis Creation Modal (DONE - analysis exists in store with default values)
- Story 1.2: Zustand Store Setup (DONE - store has waferType, waferQuantity, waferCost fields)
- Story 1.4: UI Primitive Components (DONE - Input component available)
- Story 1.5: Application Shell (DONE - FocusMode page exists)

**All dependencies are DONE - Story 2.4 is READY FOR DEV**

### Git Intelligence

**Recent Commit Patterns (from git log):**
- Story completion commits: "Complete Story X.Y: [Title]"
- Code review commits: "Apply Story X.Y code review fixes"
- All commits include co-authored-by attribution

**Expected Commit for Story 2.4:**
```
Complete Story 2.4: Wafer Type and Cost Inputs

- Add WaferInputs component with radio button group (mono/batch)
- Add conditional wafers per batch field (batch mode only)
- Add wafer cost input with French number formatting
- Implement wafer validation functions (quantity, cost)
- Implement French euro formatting with space separator
- Auto-update wafer quantity when type changes (mono=1, batch=125)
- Integrate with Zustand store for real-time updates
- Add comprehensive tests (48 tests, 100% passing)
- Export components from analysis barrel
- Update FocusMode page with WaferInputs section

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

**Files Expected in Commit:**
- New: `src/components/analysis/WaferInputs.tsx`
- New: `src/components/analysis/WaferInputs.test.tsx`
- New: `src/components/analysis/WaferInputs.integration.test.tsx`
- New: `src/lib/validation/wafer-validation.ts`
- New: `src/lib/validation/wafer-validation.test.ts`
- Modified: `src/components/analysis/index.ts`
- Modified: `src/pages/FocusMode.tsx`
- Modified: `src/pages/FocusMode.test.tsx`

### French Number Formatting Implementation

**Key Patterns:**
```typescript
// Formatting function
export function formatEuroCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(value);
}

// Usage in component
const displayValue = formatEuroCurrency(analysis.waferCost); // "8 000"

// Parsing user input
const parseUserInput = (input: string): number => {
  const cleaned = input.replace(/\s/g, ''); // Remove spaces
  return parseFloat(cleaned);
};

// In onChange handler
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const rawValue = e.target.value;
  const parsed = parseUserInput(rawValue);

  if (!isNaN(parsed)) {
    const validation = validateWaferCost(parsed.toString());
    if (validation.isValid) {
      updateAnalysis(analysisId, { waferCost: parsed });
    }
  }
};
```

**Edge Cases to Handle:**
- Empty string: don't save to store, don't show error
- Partial input: "8 0" (user still typing) - don't validate until blur
- Very large numbers: 999999 → "999 999"
- Very small numbers: 1 → "1" (no separator needed)
- Invalid input: "abc" → show error immediately

### V9 Reference Data

**From calculateur-argos V9:**
- Default wafer cost: €8,000 (Regular Pumps segment)
- Default batch quantity: 125 wafers
- Wafer types: Mono-wafer vs. Batch (same as V10)
- Calculation formula uses: `waferCost * wafersPerBatch` in failure cost calculation

**V10 Enhancements over V9:**
- Per-process wafer cost (V9 uses global default for all segments)
- Editable defaults (V9 has fixed defaults)
- Real-time validation (V9 has less robust validation)
- French number formatting (V9 uses standard US formatting)

### References

**Source Documents:**
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 2 - Story 2.4]
- [Source: _bmad-output/planning-artifacts/prd.md#FR14, FR15, FR16, FR17]
- [Source: _bmad-output/planning-artifacts/architecture.md#State Management - Zustand]
- [Source: _bmad-output/implementation-artifacts/2-1-analysis-creation-modal-and-store-integration.md#Store Integration]
- [Source: _bmad-output/implementation-artifacts/2-6-roi-calculation-engine.md#Calculation Formulas]
- [Source: argos-roi-calculator/src/types/index.ts#Analysis Interface]

**V9 Reference:**
- [Source: calculateur-argos/src/components/PredictiveMaintenanceROICalculator.jsx#Wafer defaults]

**External Resources:**
- MDN Intl.NumberFormat: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
- React Radio Buttons: https://react.dev/reference/react-dom/components/input#controlling-a-radio-button-with-a-state-variable
- WCAG Radio Button Accessibility: https://www.w3.org/WAI/ARIA/apg/patterns/radio/

## Dev Agent Record

### Agent Model Used

[To be filled by dev agent]

### Debug Log References

[To be filled by dev agent]

### Completion Notes List

[To be filled by dev agent]

### File List

[To be filled by dev agent]
