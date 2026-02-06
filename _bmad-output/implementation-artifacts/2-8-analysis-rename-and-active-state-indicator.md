# Story 2.8: Analysis Rename and Active State Indicator

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

**As a** user (JB conducting client meetings),
**I want** to rename an analysis inline and see which analysis is currently active,
**So that** I can correct naming mistakes and always know my current context during multi-analysis sessions.

## Acceptance Criteria

**Given** I am in Focus Mode viewing an analysis
**When** I click on the analysis name in the page header
**Then** the name becomes editable inline (input field replaces static text)
**And** the input field is auto-focused with the current name pre-filled
**And** all text is selected for easy replacement

**When** I type a new name and press Enter (or blur the input by clicking outside)
**Then** the analysis name is updated in the Zustand store via `updateAnalysis`
**And** the new name appears immediately in the header
**And** the input field reverts to static text display
**And** the `updatedAt` timestamp is updated

**When** I type a new name and press Escape
**Then** the edit is cancelled (name reverts to original)
**And** the input field reverts to static text display
**And** no store update occurs

**When** I clear the name (empty string) and try to save (Enter or blur)
**Then** I see inline validation error: "Le nom ne peut pas être vide"
**And** the input field has red border (error state)
**And** the input remains in edit mode (does not revert to static)
**And** no store update occurs

**When** I enter a name exceeding 100 characters and try to save
**Then** I see validation error: "Le nom ne peut pas dépasser 100 caractères"
**And** the input remains in edit mode with error styling
**And** no store update occurs

**When** I enter a name that exactly matches an existing analysis name
**Then** I see validation error: "Ce nom existe déjà"
**And** the input remains in edit mode with error styling
**And** no store update occurs
**Note:** Comparison is case-insensitive and trimmed (allow same name for current analysis)

**Given** I have one or more analyses created
**When** I view any page in the application
**Then** I see a visual indicator showing which analysis is "active" (green checkmark or green dot)
**And** the active analysis ID matches `activeAnalysisId` in the Zustand store

**Given** I am in Focus Mode for a specific analysis
**When** I see the page header
**Then** the analysis name displays an "Analyse active" badge (green background, white text)
**And** the badge includes a green checkmark icon

**Given** I am on the Dashboard with multiple analyses
**When** I see the AnalysisCard for the active analysis
**Then** the card has a visual highlight (green accent border or green dot indicator)
**Note:** AnalysisCard doesn't exist yet (Story 3.1), but this story prepares the active state infrastructure

**FRs Covered:** FR3 (Rename analysis), FR5 (View active analysis)
**NFRs Addressed:** NFR-P1 (<100ms store update), NFR-R4 (input validation)

## Tasks / Subtasks

### Task 1: Create EditableAnalysisName Component (AC: 1, 2, 3, 4)
- [ ] Create `argos-roi-calculator/src/components/analysis/EditableAnalysisName.tsx`
  - Export named component `EditableAnalysisName`
  - TypeScript interface `EditableAnalysisNameProps`:
    - `analysisId: string` - ID of the analysis to edit
    - `currentName: string` - Current analysis name (read from store)
    - `onUpdate: (name: string) => void` - Callback when name changes
    - `showActiveBadge?: boolean` - Whether to show "Analyse active" badge
  - Local state:
    - `isEditing: boolean` - Toggle between static text and input
    - `editValue: string` - Current value in input field
    - `error: string | null` - Validation error message
  - Click handler on static text: enter edit mode, set focus
  - Input handlers:
    - onChange: update editValue, clear error
    - onBlur: save if valid, show error if invalid
    - onKeyDown: Enter to save, Escape to cancel
  - Validation logic (validate before save):
    - Non-empty after trim: `editValue.trim().length > 0`
    - Max 100 characters: `editValue.trim().length <= 100`
    - Unique name: check against all analyses in store (case-insensitive)
    - Allow current name (don't flag as duplicate)
  - Auto-focus and text selection on edit mode entry (useEffect + ref)
  - Render "Analyse active" badge when `showActiveBadge=true`
- [ ] Create `argos-roi-calculator/src/components/analysis/EditableAnalysisName.test.tsx`
  - Test click on name enters edit mode
  - Test input is auto-focused and text selected
  - Test Enter key saves valid name
  - Test blur saves valid name
  - Test Escape key cancels edit
  - Test validation: empty name shows error
  - Test validation: name > 100 chars shows error
  - Test validation: duplicate name shows error
  - Test validation: same name (current analysis) is allowed
  - Test onUpdate callback called with trimmed name
  - Test error message displays correctly
  - Test error styling (red border) when validation fails
  - Test edit mode persists when validation fails
  - Test badge renders when showActiveBadge=true
  - Test badge does not render when showActiveBadge=false
  - Minimum 15 tests

### Task 2: Create ActiveIndicator Component (AC: 5, 6, 7)
- [ ] Create `argos-roi-calculator/src/components/analysis/ActiveIndicator.tsx`
  - Export named component `ActiveIndicator`
  - TypeScript interface `ActiveIndicatorProps`:
    - `variant: 'badge' | 'dot'` - Display style
    - `size?: 'sm' | 'md' | 'lg'` - Size (default: 'md')
    - `className?: string` - Additional classes
  - Render variants:
    - `badge`: Green pill with "Analyse active" text + checkmark icon
    - `dot`: Small green dot (for compact displays)
  - Styling:
    - Green background: `bg-green-600`
    - White text: `text-white`
    - Checkmark icon: SVG or Unicode "✓"
    - Sizes: sm (12px dot, 14px text), md (16px dot, 16px text), lg (20px dot, 18px text)
  - Accessibility: `role="status"` and `aria-label="Analyse active"`
- [ ] Create `argos-roi-calculator/src/components/analysis/ActiveIndicator.test.tsx`
  - Test badge variant renders with text and icon
  - Test dot variant renders without text
  - Test size variants (sm, md, lg)
  - Test custom className is applied
  - Test ARIA attributes
  - Minimum 5 tests

### Task 3: Integrate EditableAnalysisName into FocusMode Page (AC: 1, 2, 3, 4, 5)
- [ ] Update `argos-roi-calculator/src/pages/FocusMode.tsx` (or create if not exists)
  - Import EditableAnalysisName and useAppStore
  - Get analysis from store: `const analysis = useAppStore((state) => state.analyses.find(a => a.id === id))`
  - Get activeAnalysisId: `const activeAnalysisId = useAppStore((state) => state.activeAnalysisId)`
  - Get updateAnalysis action: `const updateAnalysis = useAppStore((state) => state.updateAnalysis)`
  - Create handleNameUpdate function:
    - Accepts new name (string)
    - Calls `updateAnalysis(analysis.id, { name: newName.trim() })`
  - Replace static analysis name header with EditableAnalysisName component:
    - Pass `analysisId={analysis.id}`
    - Pass `currentName={analysis.name}`
    - Pass `onUpdate={handleNameUpdate}`
    - Pass `showActiveBadge={activeAnalysisId === analysis.id}`
  - Set activeAnalysisId on mount (if not already set):
    - `useEffect(() => { setActiveAnalysis(id); }, [id]);`
- [ ] Update FocusMode tests (or create test file)
  - Test EditableAnalysisName renders with correct props
  - Test name update triggers store update
  - Test active badge shows when analysis is active
  - Test active badge hidden when analysis is not active
  - Test activeAnalysisId is set on mount
  - Add 5 tests

### Task 4: Prepare ActiveIndicator Infrastructure for Dashboard (AC: 6, 7)
- [ ] Document usage pattern for Story 3.1 (Dashboard Cards)
  - Add dev note in this story file explaining integration
  - ActiveIndicator 'dot' variant should be used in AnalysisCard
  - Position: top-right corner of card or next to process name
  - Logic: `<ActiveIndicator variant="dot" />` when `card.id === activeAnalysisId`
- [ ] Create integration example test showing usage
  - Mock AnalysisCard component
  - Test active indicator shows for active card
  - Test active indicator hidden for inactive cards
  - Test indicator position and styling
  - Add 3 tests (future reference for Story 3.1)

### Task 5: Export Components and Update Barrel (AC: All)
- [ ] Update `argos-roi-calculator/src/components/analysis/index.ts`
  - Export EditableAnalysisName
  - Export ActiveIndicator
  - Ensure named export pattern
- [ ] Verify exports work correctly
  - Test import paths
  - Add 2 tests

### Task 6: End-to-End Rename Flow Test (AC: All)
- [ ] Create integration test: `argos-roi-calculator/src/components/analysis/AnalysisRename.integration.test.tsx`
  - Test complete rename flow:
    1. Render FocusMode with analysis
    2. Click on analysis name
    3. Input enters edit mode with focus
    4. Type new name
    5. Press Enter
    6. Store updated with new name
    7. UI displays new name
    8. Edit mode exits
  - Test validation flow:
    1. Enter edit mode
    2. Clear name (empty)
    3. Press Enter
    4. Error displays, edit mode persists
    5. Type valid name
    6. Error clears
    7. Save succeeds
  - Test cancel flow:
    1. Enter edit mode
    2. Type new name
    3. Press Escape
    4. Name reverts to original
    5. No store update
  - Test unique name validation:
    1. Create two analyses ("Process A", "Process B")
    2. Edit "Process A"
    3. Try to rename to "Process B"
    4. Validation error shows
    5. Rename to "Process C" succeeds
  - Minimum 4 integration tests

## Dev Notes

### Architecture Patterns from Epic 1 and Epic 2

**Component Structure:**
- Named exports only (no default exports)
- TypeScript interfaces for all props
- Co-located tests (component.tsx + component.test.tsx)
- Use `clsx` for conditional class composition
- Tailwind class organization: Layout → Spacing → Typography → Colors → Effects

**Styling Standards:**
- Pfeiffer brand colors: `#CC0000` (primary red), `#A50000` (dark red hover)
- Active state green: `#28A745` (from UX spec for positive ROI indicator)
- Typography: 20-24px (heading), 16px (editable name), 14px (error messages), 16px (badge text)
- Focus rings: `focus:ring-2 focus:ring-pfeiffer-red focus:ring-offset-2`
- Error state: `border-red-600`, `text-red-600`
- Active badge: `bg-green-600`, `text-white`, rounded-full pill shape

**State Management (Zustand):**
- ALWAYS use selector pattern: `const analyses = useAppStore((state) => state.analyses)`
- NEVER destructure: `const { analyses } = useAppStore()` (causes unnecessary re-renders)
- Immutable updates: use spread operator
- Action naming: verb + noun (updateAnalysis, setActiveAnalysis)

**Accessibility Requirements:**
- Keyboard navigation tested (Enter, Escape, Tab)
- Focus management: auto-focus input on edit mode, text selection
- ARIA attributes: role="status" for active indicators
- Error messages associated with inputs (aria-describedby)
- Visible focus rings on all interactive elements

### Previous Story Intelligence

**From Story 2.1 (Analysis Creation Modal):**
- Analysis name validation pattern established: non-empty, trimmed
- Input component available: `@/components/ui/Input`
  - Props: value, onChange, placeholder, error, label, disabled
  - Error display: red border + error message
- Store actions tested: `addAnalysis` works, `updateAnalysis` available
- Focus management pattern: useEffect + ref + `inputRef.current?.focus()`
- Text selection: `inputRef.current?.select()`

**From Story 1.2 (Zustand Store Setup):**
- `updateAnalysis(id, updates)` action available
  - Accepts partial updates: `{ name: newName }`
  - Automatically updates `updatedAt` timestamp
  - Validates analysis exists before update
  - Returns no-op if analysis not found
- `activeAnalysisId` state available (string | null)
- `setActiveAnalysis(id)` action available
- Store automatically manages active state on addAnalysis

**From Story 1.4 (UI Primitives):**
- Input component features:
  - Error state with red border
  - Label support
  - Placeholder text
  - Auto-focus capability
  - onChange handler
  - onBlur handler
- Button component not needed for this story (inline edit pattern)

**From Story 1.5 (Application Shell):**
- FocusMode page exists at `argos-roi-calculator/src/pages/FocusMode.tsx`
- React Router param: `const { id } = useParams()`
- Navigation structure established

**Code Review Learnings from Epic 1:**
- Input focus management: always test auto-focus in edit mode
- Keyboard navigation: test Enter, Escape, Tab, Shift+Tab
- Accessibility: verify ARIA attributes (role, aria-label, aria-describedby)
- Text selection: verify all text is selected on edit mode entry
- Validation: test edge cases (empty, whitespace only, max length)

### Technical Requirements

**Dependencies (Already Installed):**
- `react` (18+) - Component framework
- `zustand` - State management (useAppStore)
- `clsx` - Conditional class composition
- `@testing-library/react` - Testing utilities
- `@testing-library/user-event` - User interaction testing
- `vitest` - Test runner

**No New Dependencies Required**

**Inline Edit Pattern:**
- Toggle between static text (clickable) and input field
- Local state manages edit mode and validation
- useRef for input element (focus, text selection)
- useEffect to focus and select on edit mode entry
- Validation before save (Enter or blur)
- Cancel on Escape (revert to original, no save)
- Error display inline (below input, red text)

**Validation Strategy:**
- Real-time error clearing (clear error on valid input change)
- Validation on save attempt (Enter or blur)
- Three validation rules:
  1. Non-empty after trim: `name.trim().length > 0`
  2. Max 100 characters: `name.trim().length <= 100`
  3. Unique name: case-insensitive comparison against all analyses (exclude current)
- Validation order: non-empty → max length → uniqueness
- Show first validation failure only

**Active State Management:**
- `activeAnalysisId` in store tracks currently focused analysis
- Set on analysis creation (automatic in `addAnalysis`)
- Set on navigation to FocusMode (useEffect on mount)
- Used to display active indicators across UI
- Active badge in FocusMode header (always visible when in FocusMode)
- Active dot in AnalysisCard (Story 3.1 will implement)

**Store Integration Pattern:**
- FocusMode sets active analysis on mount:
  ```typescript
  const setActiveAnalysis = useAppStore((state) => state.setActiveAnalysis);
  useEffect(() => {
    setActiveAnalysis(analysisId);
  }, [analysisId, setActiveAnalysis]);
  ```
- Rename updates store:
  ```typescript
  const updateAnalysis = useAppStore((state) => state.updateAnalysis);
  const handleNameUpdate = (newName: string) => {
    updateAnalysis(analysisId, { name: newName.trim() });
  };
  ```

### Testing Requirements

**Test Coverage:**
- EditableAnalysisName component: 15 tests
- ActiveIndicator component: 5 tests
- FocusMode integration: 5 tests
- ActiveIndicator usage examples: 3 tests
- Integration tests (rename flow): 4 tests
- **Total: 32 tests minimum**

**Testing Strategy:**
- Unit tests for EditableAnalysisName (edit mode, validation, save, cancel)
- Unit tests for ActiveIndicator (variants, sizes, accessibility)
- Integration tests for FocusMode (component interaction, store updates)
- Integration tests for complete rename flow (happy path, validation, cancel)
- Mock Zustand store or use real store with cleanup

**Testing Patterns:**
- Keyboard interaction: `await userEvent.keyboard('{Enter}')`, `await userEvent.keyboard('{Escape}')`
- Focus testing: `expect(document.activeElement).toBe(inputElement)`
- Text selection: `expect(inputElement.selectionStart).toBe(0)`, `expect(inputElement.selectionEnd).toBe(name.length)`
- ARIA testing: `screen.getByRole('status')`, `screen.getByLabelText('Analyse active')`
- Validation testing: `screen.getByText(/ne peut pas être vide/i)`
- Store testing: verify `updateAnalysis` called with correct args

### File Structure Requirements

**New Files to Create:**
```
argos-roi-calculator/src/components/analysis/
├── EditableAnalysisName.tsx               # Inline edit component
├── EditableAnalysisName.test.tsx          # Component tests
├── ActiveIndicator.tsx                    # Active state badge/dot
├── ActiveIndicator.test.tsx               # Indicator tests
└── AnalysisRename.integration.test.tsx    # E2E rename flow tests
```

**Files to Modify:**
```
argos-roi-calculator/src/pages/FocusMode.tsx       # Integrate editable name
argos-roi-calculator/src/pages/FocusMode.test.tsx  # Integration tests (if exists)
argos-roi-calculator/src/components/analysis/index.ts  # Export new components
```

**Naming Conventions:**
- PascalCase for components: `EditableAnalysisName`, `ActiveIndicator`
- camelCase for handlers: `handleNameUpdate`, `handleKeyDown`, `handleBlur`
- Named exports only

### UX Design Notes

**From Epic 2 Requirements:**
- Inline edit pattern (click to edit, not separate modal)
- Real-time validation feedback
- French error messages:
  - "Le nom ne peut pas être vide" (empty name)
  - "Le nom ne peut pas dépasser 100 caractères" (max length)
  - "Ce nom existe déjà" (duplicate name)
- Active state visual: green checkmark or green dot
- Active badge text: "Analyse active"

**Editable Name Behavior:**
- Click on name → enters edit mode
- Input auto-focused with text selected (easy replacement)
- Enter key → saves (if valid), exits edit mode
- Blur (click outside) → saves (if valid), exits edit mode
- Escape key → cancels, reverts to original, exits edit mode
- Validation error → shows inline, edit mode persists, red border on input
- Valid input after error → error clears immediately

**Active Indicator Variants:**
- **Badge variant** (FocusMode header):
  - Green pill shape (`bg-green-600`, `text-white`)
  - Text: "Analyse active"
  - Checkmark icon (✓)
  - Size: 16px text, 24px height, 8px padding
- **Dot variant** (AnalysisCard in Story 3.1):
  - Small green circle (`bg-green-600`)
  - No text
  - Size: 12px diameter (sm), 16px (md), 20px (lg)
  - Position: top-right corner or inline with name

**Layout in FocusMode:**
- Analysis name in page header (top-center or top-left)
- Active badge immediately after name (inline, small gap)
- Name is clickable (cursor: pointer, underline on hover)
- Edit mode: input replaces name, same position, same size
- Error message: below input, red text, 14px, fade-in animation

### Performance Considerations

**NFR-P1 (Calculations <100ms):**
- Store update (`updateAnalysis`) completes <100ms
- Name update is synchronous (no async operations)
- Validation is synchronous (array check for uniqueness)

**NFR-R4 (Input Validation):**
- Validate before store update (prevent invalid data)
- Three validation rules enforced
- User-friendly error messages in French

**Memory Efficiency:**
- Edit mode state is local (not in Zustand)
- No memory leaks from input refs
- Cleanup functions in useEffect

### Blocking Dependencies

**Story 2.8 BLOCKS:**
- None (Story 2.8 is a polish story, non-blocking)

**Story 2.8 DEPENDS ON:**
- Story 2.1: Analysis Creation Modal (DONE - provides analysis structure, store integration)
- Story 1.2: Zustand Store Setup (DONE - provides updateAnalysis, activeAnalysisId)
- Story 1.4: UI Primitive Components (DONE - provides Input component)
- Story 1.5: Application Shell (DONE - provides FocusMode page)

**All dependencies are DONE - Story 2.8 is READY FOR DEV**

**Note:** Story 2.8 is Priority P2 (Polish). It can be implemented in parallel with Stories 2.2-2.5 or after Epic 2 core functionality is complete.

### French Localization (UI Text)

**Editable Name:**
- Error: empty → "Le nom ne peut pas être vide"
- Error: max length → "Le nom ne peut pas dépasser 100 caractères"
- Error: duplicate → "Ce nom existe déjà"

**Active Indicator:**
- Badge text: "Analyse active"
- ARIA label: "Analyse active"

**Notes:**
- All user-facing text is in French
- Code, comments, and tests remain in English

### Git Intelligence

**Recent Commit Patterns:**
- Story completion: "Complete Story X.Y: [Title]"
- Code review: "Apply Story X.Y code review fixes"
- Epic completion: "Complete Epic X and update retrospective"
- Co-authored attribution included

**Expected Commit for Story 2.8:**
```
Complete Story 2.8: Analysis Rename and Active State Indicator

- Add EditableAnalysisName component with inline edit and validation
- Add ActiveIndicator component (badge and dot variants)
- Integrate editable name into FocusMode page header
- Connect to Zustand store for rename and active state
- Implement validation: non-empty, max 100 chars, unique name
- Add active badge display in FocusMode
- Prepare ActiveIndicator for AnalysisCard (Story 3.1)
- Create comprehensive tests (32 tests, 100% passing)
- Export components from analysis barrel

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

**Files Expected in Commit:**
- New: `argos-roi-calculator/src/components/analysis/EditableAnalysisName.tsx`
- New: `argos-roi-calculator/src/components/analysis/EditableAnalysisName.test.tsx`
- New: `argos-roi-calculator/src/components/analysis/ActiveIndicator.tsx`
- New: `argos-roi-calculator/src/components/analysis/ActiveIndicator.test.tsx`
- New: `argos-roi-calculator/src/components/analysis/AnalysisRename.integration.test.tsx`
- Modified: `argos-roi-calculator/src/pages/FocusMode.tsx`
- Modified: `argos-roi-calculator/src/pages/FocusMode.test.tsx` (or new)
- Modified: `argos-roi-calculator/src/components/analysis/index.ts`

### References

**Source Documents:**
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 2 - Story 2.8]
- [Source: _bmad-output/planning-artifacts/prd.md#FR3, FR5]
- [Source: _bmad-output/planning-artifacts/architecture.md#State Management - Zustand]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Focus Mode - Analysis Header]
- [Source: _bmad-output/implementation-artifacts/2-1-analysis-creation-modal-and-store-integration.md#Store Integration]
- [Source: _bmad-output/implementation-artifacts/1-2-zustand-store-and-typescript-types-setup.md#updateAnalysis Action]

**External Resources:**
- React useRef hook: https://react.dev/reference/react/useRef
- Input focus and selection: https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/select
- ARIA status role: https://www.w3.org/TR/wai-aria-1.2/#status

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Initial test run: 15 failures (5 App.test.tsx from prior FocusMode changes, 8 WaferInputs pre-existing, 2 FailureRateInput isolation issue)
- Fixed infinite loop: `allAnalysisNames` selector created new array every render → solved with `useMemo`
- Fixed `setActiveAnalysis` called on non-existent analysis → guard with `analysisExists` boolean
- Post code-review: 3 remaining failures all pre-existing (DowntimeInputs, FailureRateInput, App.test.tsx Dashboard)

### Completion Notes List

- All 6 tasks implemented
- 41 Story 2.8 tests passing (17 EditableAnalysisName + 9 ActiveIndicator + 8 FocusMode + 7 Integration)
- Code review: 6 issues found (2 HIGH, 3 MEDIUM, 1 LOW), all HIGH and MEDIUM fixed
  - HIGH: Escape/blur race condition → `isCancellingRef` pattern
  - HIGH: `maxLength={110}` → corrected to `maxLength={100}`
  - MEDIUM: `setActiveAnalysis` re-triggers on name update → `analysisExists` boolean dependency
  - MEDIUM: `handleNameUpdate` recreation → `useCallback`
  - MEDIUM: Brittle max-length test → `fireEvent.change`
  - LOW: `analysisId` prop coupling (deferred)

### File List

**New Files:**
- `argos-roi-calculator/src/components/analysis/EditableAnalysisName.tsx`
- `argos-roi-calculator/src/components/analysis/EditableAnalysisName.test.tsx`
- `argos-roi-calculator/src/components/analysis/ActiveIndicator.tsx`
- `argos-roi-calculator/src/components/analysis/ActiveIndicator.test.tsx`
- `argos-roi-calculator/src/components/analysis/AnalysisRename.integration.test.tsx`
- `argos-roi-calculator/src/pages/FocusMode.test.tsx`

**Modified Files:**
- `argos-roi-calculator/src/pages/FocusMode.tsx` (added EditableAnalysisName, setActiveAnalysis, useCallback)
- `argos-roi-calculator/src/components/analysis/index.ts` (added exports)
