# Story 2.2: Equipment Input Fields (Pump Type & Quantity)

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

**As a** user (JB conducting client meetings),
**I want** to enter pump model and quantity for the analysis,
**So that** I can capture the client's equipment details for ROI calculation.

## Acceptance Criteria

**Given** I am in Focus Mode for an analysis (/analysis/:id)
**When** I see the InputPanel component
**Then** I see an "Equipment" section with two input fields
**And** I see "Type de pompe" text input field
**And** I see "Nombre de pompes" numeric input field

**When** I enter "HiPace 700" in the pump type field
**Then** the value is saved to the analysis in the Zustand store
**And** the field updates immediately (real-time sync with store)

**When** I enter "8" in pump quantity field
**Then** the value is saved to the store as a number (not string)
**And** the store update completes within 100ms (NFR-P1)

**When** I enter "-5" or "0" in pump quantity
**Then** I see validation error: "Doit être un nombre positif"
**And** the invalid value is NOT saved to the store
**And** the input field has red border (error state)

**When** I enter "abc" or non-numeric text in pump quantity
**Then** I see validation error: "Doit être un nombre positif"
**And** the input field has red border

**When** I enter "1001" (exceeds maximum of 1000)
**Then** I see validation error: "Maximum 1000 pompes"
**And** the value is NOT saved to store

**When** I correct the invalid input to a valid value (e.g., "8")
**Then** the error message disappears immediately
**And** the red border is removed
**And** the value is saved to store

**When** I leave the page and return to the same analysis
**Then** the previously entered pump type and quantity values are still displayed
**And** the values persist in the Zustand store during the session

**FRs Covered:** FR9 (Enter pump type), FR10 (Specify pump quantity), FR25 (Validate positive numbers), FR26 (Real-time validation feedback), FR28 (Display error messages)

**NFRs Addressed:** NFR-P1 (<100ms store updates), NFR-S1 (client-side only), NFR-R4 (input validation prevents runtime errors)

## Tasks / Subtasks

### Task 1: Create EquipmentInputs Component (AC: 1, 2, 3)
- [ ] Create `src/components/analysis/EquipmentInputs.tsx`
  - Export named component `EquipmentInputs`
  - TypeScript interface `EquipmentInputsProps`:
    - `analysisId: string` - ID of the analysis being edited
  - Fetch analysis from store using `useAppStore` with selector pattern
  - Render section with heading "Équipement"
  - Render two Input fields (from `@/components/ui/Input`):
    - Pump Type: label "Type de pompe", placeholder "ex: HiPace 700, HiScrew, OnTool Roots"
    - Pump Quantity: label "Nombre de pompes", type "number", placeholder "ex: 8"
  - Use controlled inputs: value from store, onChange updates store
  - Handle pump type changes: update store immediately on every keystroke
  - Handle pump quantity changes: validate before updating store
  - Use `clsx` for conditional styling
  - Follow Tailwind class organization: Layout → Spacing → Typography → Colors → Effects
  - Add aria-labels for accessibility
- [ ] Create `src/components/analysis/EquipmentInputs.test.tsx`
  - Test component renders with correct labels and placeholders
  - Test initial values load from store
  - Test pump type updates store on change
  - Test pump quantity updates store on valid input
  - Test validation prevents negative numbers
  - Test validation prevents zero
  - Test validation prevents non-numeric input
  - Test validation prevents values > 1000
  - Test error messages display correctly
  - Test error styling (red border) applies
  - Test errors clear on valid input
  - Test component handles missing analysis gracefully
  - Test accessibility (aria-labels, keyboard navigation)
  - Minimum 13 tests

### Task 2: Implement Input Validation Logic (AC: 4, 5, 6, 7)
- [ ] Create `src/lib/validation/equipment-validation.ts`
  - Export function `validatePumpQuantity(value: string): { isValid: boolean; error?: string }`
  - Validation rules:
    - Must be numeric (parseInt, isNaN check)
    - Must be > 0 (positive integer)
    - Must be <= 1000 (maximum limit)
  - Return error messages in French:
    - Non-numeric or ≤ 0: "Doit être un nombre positif"
    - > 1000: "Maximum 1000 pompes"
  - Function is pure (no side effects)
  - Function is synchronous (validation <1ms)
- [ ] Create `src/lib/validation/equipment-validation.test.ts`
  - Test validates positive integers (1, 8, 100, 1000)
  - Test rejects negative numbers (-1, -5)
  - Test rejects zero
  - Test rejects non-numeric strings ("abc", "1.5", "")
  - Test rejects values > 1000 (1001, 5000)
  - Test returns correct error messages
  - Test edge cases (null, undefined, very large numbers)
  - Minimum 10 tests

### Task 3: Integrate with Zustand Store (AC: 2, 3, 8)
- [ ] Update `src/stores/app-store.ts` (if not already done)
  - Verify `updateAnalysis` action exists and accepts `Partial<Analysis>`
  - Ensure immutable updates (spread operator)
  - Ensure selector pattern is used in components
  - Update `updatedAt` timestamp on every change
- [ ] Add store integration tests in EquipmentInputs.test.tsx
  - Test store selector retrieves correct analysis
  - Test updateAnalysis is called with correct data
  - Test pumpType updates immediately (string)
  - Test pumpQuantity updates as number (not string)
  - Test invalid values do NOT trigger store update
  - Test updatedAt timestamp changes on update
  - Minimum 6 integration tests

### Task 4: Update FocusMode Page (AC: 1)
- [ ] Update `src/pages/FocusMode.tsx`
  - Import EquipmentInputs component
  - Replace placeholder message with EquipmentInputs
  - Pass analysisId from URL params to EquipmentInputs
  - Handle case when analysis doesn't exist (redirect to Dashboard)
  - Update layout to accommodate InputPanel structure
  - Maintain AppLayout wrapper
- [ ] Update `src/pages/FocusMode.test.tsx` (or create if missing)
  - Test EquipmentInputs renders in FocusMode
  - Test analysisId is passed correctly
  - Test redirect to Dashboard if analysis not found
  - Test page title updates with analysis name
  - Minimum 4 tests

### Task 5: French Pump Type Suggestions (Enhancement) (AC: 2)
- [ ] Add pump type suggestions based on V9 reference
  - Create constant `PUMP_TYPE_SUGGESTIONS` in `src/lib/constants.ts`
  - Suggestions: ["HiPace (turbo)", "HiScrew (dry screw)", "OnTool Roots (roots)"]
  - Display as placeholder text: "ex: HiPace 700, HiScrew, OnTool Roots"
  - Optional future enhancement: autocomplete dropdown (defer to later story)
  - Note: V9 has 3 fixed categories, V10 allows free text (more flexible)
- [ ] Add constant tests
  - Test PUMP_TYPE_SUGGESTIONS exports correctly
  - Test array contains expected values
  - Minimum 2 tests

### Task 6: Export Component and Update Barrel (AC: All)
- [ ] Update `src/components/analysis/index.ts`
  - Add export for EquipmentInputs
  - Ensure named export pattern
- [ ] Verify barrel export tests
  - Test EquipmentInputs is accessible via barrel
  - Test import path works correctly
  - Minimum 2 tests

### Task 7: End-to-End Input Flow Test (AC: All)
- [ ] Create integration test file: `src/components/analysis/EquipmentInputs.integration.test.tsx`
  - Test complete flow: Load analysis → Enter pump type → Enter quantity → Verify store
  - Test validation flow: Enter invalid quantity → Error displays → Correct → Error clears
  - Test persistence flow: Enter values → Navigate away → Return → Values persist
  - Mock React Router (useParams)
  - Use real Zustand store with cleanup
  - Test flow:
    1. Create analysis in store
    2. Render EquipmentInputs with analysis ID
    3. Enter "HiPace 700" in pump type
    4. Verify store updated with pumpType="HiPace 700"
    5. Enter "8" in pump quantity
    6. Verify store updated with pumpQuantity=8 (number)
    7. Enter "-5" in pump quantity
    8. Verify error displays
    9. Verify store NOT updated
    10. Enter "10" in pump quantity
    11. Verify error clears
    12. Verify store updated with pumpQuantity=10
  - Minimum 3 integration tests (happy path, validation, persistence)

## Dev Notes

### Architecture Patterns from Epic 1 and Story 2.1

**Component Structure:**
- Named exports only (no default exports)
- TypeScript interfaces for all props
- Co-located tests (component.tsx + component.test.tsx)
- Use `clsx` for conditional class composition
- Follow Tailwind class organization: Layout → Spacing → Typography → Colors → Effects
- Feature-based folder organization: `components/analysis/`

**Styling Standards (Pfeiffer Branding):**
- Primary red: `#CC0000` (buttons, focus rings)
- Dark red hover: `#A50000`
- Surface colors: `#FFFFFF` (cards), `#F1F2F2` (canvas)
- Typography: 18px (section headings), 16px (labels), 14px (error messages)
- Spacing: 16px (gap-4) between input fields, 24px (gap-6) between sections
- Focus rings: `focus:ring-2 focus:ring-pfeiffer-red focus:ring-offset-2`
- Error state: red border (`border-red-600`), red text (`text-red-600`)

**State Management (Zustand):**
- ALWAYS use selector pattern: `const analysis = useAppStore((state) => state.analyses.find(a => a.id === analysisId))`
- NEVER destructure: `const { analyses } = useAppStore()` (causes unnecessary re-renders)
- Use updateAnalysis action: `const updateAnalysis = useAppStore((state) => state.updateAnalysis)`
- Immutable updates: spread operator for all state changes
- Store updates must be <100ms (NFR-P1) - measured in tests

**Validation Strategy:**
- Real-time validation: check on every onChange event
- Local component state for error messages: `const [quantityError, setQuantityError] = useState<string | undefined>()`
- Validation function in `lib/validation/` (pure, testable)
- Display error below input field (red text, 14px)
- Clear error immediately when user enters valid input
- Do NOT save invalid values to store (validate before calling updateAnalysis)
- Use Zod for complex validation in future stories, simple function for this story

**Accessibility Requirements (From Epic 1 Retrospective - 60% of stories had issues):**
- Keyboard navigation tested (Tab, Shift+Tab, Enter)
- Focus indicators visible on all inputs
- ARIA labels for screen readers: `aria-label`, `aria-describedby` for errors
- Error messages associated with inputs via `aria-describedby`
- Input type="number" for numeric fields (browser validation support)
- Visible error messages (not just color - text content)

### Previous Story Intelligence

**From Story 2.1 (Analysis Creation Modal and Store Integration) - DONE:**
- Modal flow fully implemented and tested (48 tests, all passing)
- Analysis creation working: `addAnalysis` action creates new analysis with default values
- Navigation to Focus Mode functional: `useNavigate()` from React Router
- Dashboard empty state and modal integration complete
- French validation messages: "Le nom de l'analyse est requis"
- Max length validation: analysis name max 100 characters
- Store verification: analysis exists before navigation
- Lessons learned:
  - Use isMounted guard for async cleanup
  - Validate max length in addition to required validation
  - Test both Tab and Shift+Tab for focus trap
  - Simplify validation logic (avoid over-engineering)

**From Story 2.6 (ROI Calculation Engine) - DONE:**
- Calculation functions available in `src/lib/calculations.ts`
- Pure functions: `calculateTotalFailureCost`, `calculateArgosServiceCost`, `calculateDeltaSavings`, `calculateROI`
- All calculations tested (18 tests, all passing)
- Performance: calculations complete <1ms (well under 100ms requirement)
- Calculation formulas validated against V9 reference
- Note: Story 2.2 BLOCKS Story 2.7 (Results Panel) which will USE these calculations

**From Story 1.4 (UI Primitive Components) - DONE:**
- Input component fully functional: `@/components/ui/Input`
- Props: `value`, `onChange`, `label`, `placeholder`, `error`, `type`, `disabled`, `className`
- Error display: red border + error message below input (built-in)
- Focus ring: Pfeiffer red (configured)
- Accessibility: aria-labels, aria-describedby for errors
- Type="number" supported for numeric inputs

**From Story 1.2 (Zustand Store Setup) - DONE:**
- Store fully configured: `@/stores/app-store.ts`
- Analysis interface: `@/types/index.ts` (includes pumpType, pumpQuantity fields)
- Actions available: `addAnalysis`, `updateAnalysis`, `deleteAnalysis`, `duplicateAnalysis`
- Store validation: checks numeric bounds, prevents invalid data
- 38 tests, all passing
- Default values: pumpType="", pumpQuantity=0

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

**Input Component Integration:**
- Import Input from `@/components/ui/Input`
- Use controlled input pattern: `value={analysis?.pumpType || ''}` `onChange={handlePumpTypeChange}`
- Pass error prop for validation: `error={quantityError}`
- Use type="number" for pump quantity input
- Use label prop for French labels
- Use placeholder prop for examples

**Validation Function Strategy:**
- Create pure validation function in `lib/validation/equipment-validation.ts`
- Export named function: `validatePumpQuantity(value: string)`
- Return object: `{ isValid: boolean; error?: string }`
- Validate: numeric, > 0, <= 1000
- Error messages in French (per client requirements)
- Function is synchronous (no async/await needed)
- Function is testable in isolation (no React dependencies)

**Store Update Strategy:**
- Get analysis from store: `const analysis = useAppStore((state) => state.analyses.find(a => a.id === analysisId))`
- Get update action: `const updateAnalysis = useAppStore((state) => state.updateAnalysis)`
- Update pump type: `updateAnalysis(analysisId, { pumpType: value })`
- Update pump quantity: validate first, then `updateAnalysis(analysisId, { pumpQuantity: parseInt(value, 10) })`
- Use parseInt to convert string to number (type="number" still returns string in onChange)
- Update timing: <100ms per NFR-P1 (measured in tests)

**Focus Mode Page Strategy:**
- Replace PlaceholderMessage with EquipmentInputs component
- Pass analysisId from URL params: `const { id } = useParams()`
- Handle missing analysis: redirect to Dashboard if not found
- Use AppLayout wrapper (already in place)
- Future stories will add more sections to Focus Mode (InputPanel structure)

### Testing Requirements

**Test Coverage:**
- EquipmentInputs component: 13 tests
- equipment-validation function: 10 tests
- Store integration: 6 tests
- FocusMode page: 4 tests
- Constants: 2 tests
- Barrel exports: 2 tests
- Integration tests: 3 tests
- **Total: 40 tests minimum**

**Testing Strategy:**
- Unit tests for component rendering and behavior
- Unit tests for validation function (pure function testing)
- Integration tests for store updates
- Integration tests for component interaction
- Accessibility tests (keyboard navigation, ARIA attributes)
- Validation flow tests (invalid → valid → store update)
- Performance tests (store update <100ms)

**Testing Tools:**
- Vitest + React Testing Library (already configured)
- `@testing-library/user-event` for typing in inputs
- `screen.getByLabelText` for accessibility queries
- Mock `useParams` from React Router for FocusMode tests
- Use real Zustand store with cleanup (or mock if needed)

**Testing Patterns from Epic 1 and Story 2.1:**
- Test user typing with `await userEvent.type(input, 'text')`
- Test validation with `expect(screen.getByText(/error message/i)).toBeInTheDocument()`
- Test error styling with `expect(input).toHaveClass('border-red-600')`
- Test store updates with `expect(store.getState().analyses[0].pumpQuantity).toBe(8)`
- Test accessibility with `screen.getByRole('textbox', { name: /label/i })`
- Use `beforeEach` to reset store state

### File Structure Requirements

**New Files to Create:**
```
src/components/analysis/
├── EquipmentInputs.tsx                      # Main component (NEW)
├── EquipmentInputs.test.tsx                 # Component tests (NEW)
├── EquipmentInputs.integration.test.tsx     # E2E flow tests (NEW)
└── index.ts                                 # Update: add EquipmentInputs export

src/lib/validation/
├── equipment-validation.ts                  # Validation logic (NEW)
└── equipment-validation.test.ts             # Validation tests (NEW)

src/lib/
└── constants.ts                             # Update: add PUMP_TYPE_SUGGESTIONS
```

**Files to Modify:**
```
src/pages/FocusMode.tsx                      # Replace placeholder with EquipmentInputs
src/pages/FocusMode.test.tsx                 # Add integration tests (or create)
src/components/analysis/index.ts             # Add EquipmentInputs export
src/lib/constants.ts                         # Add PUMP_TYPE_SUGGESTIONS
```

**Naming Conventions:**
- PascalCase for components: `EquipmentInputs`
- camelCase for functions/handlers: `validatePumpQuantity`, `handlePumpTypeChange`
- kebab-case for utility files: `equipment-validation.ts`
- Named exports only (no default exports)

### UX Design Notes

**From Epic 2 Requirements:**
- Input section labeled "Équipement" (French)
- Two fields: pump type (text) and pump quantity (number)
- Pump type is free text (not dropdown) - more flexible than V9
- Placeholder examples from V9 pump types: HiPace (turbo), HiScrew (dry screw), OnTool Roots (roots)
- Real-time validation: error displays immediately on invalid input
- Error clears immediately when user corrects input
- No "Save" button: auto-save on every change (instant feedback)

**Input Field Layout:**
- Vertical layout (stacked fields)
- 16px gap between fields (gap-4)
- Full width inputs within card/section
- Labels above inputs (16px font size, medium weight)
- Placeholders in lighter color (gray-500)
- Error messages below inputs (14px, red-600)

**Validation UX:**
- Validate pump quantity on onChange (real-time)
- Display error immediately if invalid
- Clear error immediately when valid input entered
- Do NOT validate pump type (free text, any value allowed)
- Error message position: directly below input (not toast)
- Error styling: red border + red text (dual indicator)

**Accessibility UX:**
- Labels always visible (not floating/placeholder-only)
- Focus ring visible on Tab navigation
- Error messages announced to screen readers (aria-describedby)
- Input type="number" triggers numeric keyboard on mobile (future consideration)
- All interactive elements keyboard accessible

### Performance Considerations

**NFR-P1 (Store Updates <100ms):**
- Zustand updates are synchronous and fast (<1ms typically)
- Validation function must be <1ms (simple numeric checks)
- Total onChange handler time: validate + store update <5ms
- Measured in tests using `performance.now()` before/after
- No debouncing needed for performance (store is efficient)

**NFR-P4 (Navigation <200ms):**
- Focus Mode page already loads <200ms (from Story 1.5)
- Adding EquipmentInputs should not degrade performance
- Component is lightweight (2 inputs, no heavy computation)
- Initial render tested in performance tests

**NFR-S1 (No Server Transmission):**
- All data remains client-side (Zustand in-memory store)
- No API calls, no fetch requests
- Validation happens client-side (no server validation)

**NFR-R4 (Input Validation Prevents Runtime Errors):**
- Validation prevents invalid numeric values from reaching calculations
- Store only receives valid data (parseInt succeeds, positive integer)
- Calculation engine (Story 2.6) can safely use pumpQuantity without additional checks

### Blocking Dependencies

**Story 2.2 DEPENDS ON:**
- Story 2.1: Analysis Creation Modal and Store Integration (DONE - analysis must exist)
- Story 1.2: Zustand Store Setup (DONE - updateAnalysis action available)
- Story 1.4: UI Primitive Components (DONE - Input component available)
- Story 1.5: Application Shell (DONE - FocusMode page exists)

**All dependencies are DONE and tested - Story 2.2 is READY FOR DEV**

**Story 2.2 BLOCKS:**
- Story 2.7: Results Panel with Real-Time Display (needs pump quantity for ROI calculation)
- Story 3.1: Dashboard Grid with Analysis Cards (needs equipment data for card display)
- Story 5.3: PDF Content Structure (needs equipment data for report)

**Story 2.2 is P1 (high priority) - required for ROI calculation to function**

### Git Intelligence

**Recent Commit Patterns:**
- Story completion commits: "Complete Story X.Y: [Title]"
- Include comprehensive summary in commit body
- List files changed with brief descriptions
- Include test count and status
- Code review notes if applicable
- Co-authored-by attribution

**Expected Commit for Story 2.2:**
```
Complete Story 2.2: Equipment Input Fields (Pump Type & Quantity)

- Add EquipmentInputs component with pump type and quantity fields
- Implement real-time validation for pump quantity (positive, max 1000)
- Create equipment-validation utility with French error messages
- Integrate with Zustand store updateAnalysis action
- Update FocusMode page to display EquipmentInputs
- Add PUMP_TYPE_SUGGESTIONS constant (HiPace, HiScrew, OnTool Roots)
- Create comprehensive tests (40 tests, 100% passing)
- Export EquipmentInputs from analysis barrel

Story status: done

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

**Files Expected in Commit:**
- New: `src/components/analysis/EquipmentInputs.tsx`
- New: `src/components/analysis/EquipmentInputs.test.tsx`
- New: `src/components/analysis/EquipmentInputs.integration.test.tsx`
- New: `src/lib/validation/equipment-validation.ts`
- New: `src/lib/validation/equipment-validation.test.ts`
- Modified: `src/components/analysis/index.ts`
- Modified: `src/pages/FocusMode.tsx`
- Modified: `src/pages/FocusMode.test.tsx` (or new)
- Modified: `src/lib/constants.ts`
- Modified: `_bmad-output/implementation-artifacts/sprint-status.yaml`
- Modified: `_bmad-output/implementation-artifacts/2-2-equipment-input-fields-pump-type-quantity.md`

### French Localization (UI Text)

**Component Text:**
- Section heading: "Équipement"
- Pump type label: "Type de pompe"
- Pump type placeholder: "ex: HiPace 700, HiScrew, OnTool Roots"
- Pump quantity label: "Nombre de pompes"
- Pump quantity placeholder: "ex: 8"
- Error message (non-positive): "Doit être un nombre positif"
- Error message (exceeds max): "Maximum 1000 pompes"

**Notes:**
- All user-facing text is in French (per client requirements)
- Code, comments, and tests remain in English
- Error messages are stored in validation function (not hardcoded in component)

### V9 Reference (Pump Types)

**From V9 Calculator (calculateur-argos/):**
- V9 had 3 fixed pump categories: Turbo, Dry Screw, Roots
- V9 used dropdown selection (limited flexibility)
- V10 uses free text input (more flexible for any pump model)
- V10 provides suggestions via placeholder (HiPace, HiScrew, OnTool Roots)
- Future enhancement: autocomplete dropdown (defer to post-MVP)

**Pump Type Examples from V9:**
- HiPace family: turbo pumps (most common in semiconductor)
- HiScrew family: dry screw pumps (backing pumps)
- OnTool Roots: roots blowers (roughing pumps)
- V10 allows any model name: "A3004XN", "HiPace 700", "Custom Model"

### References

**Source Documents:**
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 2 - Story 2.2]
- [Source: _bmad-output/planning-artifacts/prd.md#FR9, FR10, FR25, FR26, FR28]
- [Source: _bmad-output/planning-artifacts/architecture.md#Component Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Validation: Zod]
- [Source: _bmad-output/implementation-artifacts/2-1-analysis-creation-modal-and-store-integration.md#Store Integration]
- [Source: _bmad-output/implementation-artifacts/1-4-ui-primitive-components.md#Input Component]

**External Resources:**
- React Forms: https://react.dev/reference/react-dom/components/input
- Input Validation Patterns: https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation
- Zustand Store Updates: https://github.com/pmndrs/zustand

**V9 Reference:**
- [Source: calculateur-argos/index.html#pump-categories] (read-only reference)

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
