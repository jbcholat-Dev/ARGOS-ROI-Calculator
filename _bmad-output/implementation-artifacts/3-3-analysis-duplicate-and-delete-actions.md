# Story 3.3: Analysis Duplicate and Delete Actions

Status: ready-for-dev

## Story

**As a** user (JB),
**I want** to duplicate an analysis for what-if scenarios and delete unwanted ones,
**So that** I can explore alternatives and clean up the session.

## Acceptance Criteria

### AC1: Context Menu Display on Analysis Cards
**Given** I see an AnalysisCard on the Dashboard (/)
**When** I click the three-dot icon (context menu trigger)
**Then** a dropdown menu appears with two options:
  - "Dupliquer" (Duplicate)
  - "Supprimer" (Delete)
**And** the menu is positioned relative to the three-dot icon
**And** the menu has proper WCAG AA accessibility (aria-describedby MANDATORY for menu)
**And** clicking outside the menu closes it
**And** pressing Escape key closes the menu
**And** keyboard navigation works: Tab/Shift+Tab through menu items, Enter/Space to select

### AC2: Duplicate Analysis Functionality
**Given** I click "Dupliquer" in the context menu
**When** the action completes
**Then** a new analysis is created with:
  - Name: "[Original Name] (copie)" (French naming)
  - All input values copied from original:
    * pumpType
    * pumpQuantity
    * failureRateMode
    * failureRateValue
    * waferType
    * wafersAtRisk
    * waferValue
    * repairDowntime
    * qualificationDowntime
    * detectionRate (if set, otherwise uses global)
  - New unique ID generated (crypto.randomUUID() or nanoid)
**And** the duplicate appears in the Dashboard grid immediately
**And** the duplicate becomes the active analysis (activeAnalysisId updated)
**And** I am navigated to Focus Mode (/analysis/:id) showing the duplicate
**And** the operation completes within 100ms (NFR-P1)
**And** I can edit the duplicate independently without affecting the original

### AC3: Delete Confirmation Dialog
**Given** I click "Supprimer" in the context menu
**When** the action is triggered
**Then** a confirmation modal appears with:
  - Title: "Supprimer l'analyse ?"
  - Message: "Cette action est irréversible. L'analyse « [Analysis Name] » sera définitivement supprimée."
  - Two buttons:
    * "Annuler" (Cancel) — secondary style
    * "Supprimer" (Delete) — danger/destructive style (red)
**And** the modal has proper WCAG AA accessibility:
  - aria-labelledby pointing to title
  - aria-describedby pointing to message (MANDATORY)
  - Focus trap enabled with Shift+Tab support
  - Escape key cancels
**And** clicking "Annuler" or outside modal closes it without deleting

### AC4: Delete Analysis Execution
**Given** I confirm deletion in the modal
**When** I click "Supprimer"
**Then** the analysis is removed from the Zustand store (analyses array)
**And** the card disappears from the Dashboard grid immediately
**And** if the deleted analysis was active:
  - If other analyses exist: set the first analysis as active and navigate to its Focus Mode
  - If no analyses remain: navigate to Dashboard (/) and show empty state
**And** the operation completes within 100ms
**And** the confirmation modal closes automatically

### AC5: Edge Cases and Validation
**Given** I have only 1 analysis remaining
**When** I attempt to delete it
**Then** the delete action proceeds normally (no "last analysis" restriction)
**And** after deletion, Dashboard shows empty state with "Créez votre première analyse" message
**Given** I have 5 analyses (maximum per NFR-P6)
**When** I duplicate an analysis
**Then** the duplicate is created normally (5 → 6 analyses temporarily allowed)
**And** the system handles 6 analyses without performance degradation
**Given** I duplicate an analysis with name "Process A (copie)"
**When** I duplicate it again
**Then** the new name is "Process A (copie) (copie)" (no smart numbering, simple append)

**FRs Covered:** FR6 (duplicate for what-if), FR7 (delete unwanted), FR4 (navigation updates)
**NFRs Addressed:** NFR-P1 (<100ms operations), NFR-P6 (5 concurrent analyses), NFR-A1 (WCAG AA)

## Tasks / Subtasks

### Task 1: Add Three-Dot Menu Icon to AnalysisCard (AC: 1)
- [ ] Modify `argos-roi-calculator/src/components/analysis/AnalysisCard.tsx`
  - Add three-dot icon (⋮) in top-right corner of card
  - Use Button primitive with icon-only variant
  - Position: absolute top-right or flex layout with justify-between
  - Icon: Lucide `MoreVertical` or similar
  - aria-label: "Actions pour l'analyse [name]"
  - onClick handler toggles menu visibility (local state)

- [ ] Add state management in AnalysisCard:
  - `const [isMenuOpen, setIsMenuOpen] = useState(false)`
  - Click handler: `setIsMenuOpen(!isMenuOpen)`
  - Click outside handler: useEffect with document.addEventListener('click')
  - Escape key handler: useEffect with keydown listener

### Task 2: Create ContextMenu Dropdown Component (AC: 1)
- [ ] Create `argos-roi-calculator/src/components/ui/ContextMenu.tsx`
  - Props: `isOpen: boolean`, `onClose: () => void`, `onDuplicate: () => void`, `onDelete: () => void`, `triggerRef: RefObject<HTMLElement>`
  - Render conditional based on isOpen
  - Positioned absolute relative to triggerRef (use getBoundingClientRect())
  - Two menu items:
    * Button "Dupliquer" with icon (Copy or Duplicate icon)
    * Button "Supprimer" with icon (Trash icon) and text-red-600
  - Menu styling: white bg, border, shadow-lg, rounded
  - WCAG AA: role="menu", aria-label="Actions", each item role="menuitem"
  - Keyboard nav: Tab/Shift+Tab, Enter/Space to select, Escape to close
  - Portal to document.body for z-index layering

- [ ] Create `argos-roi-calculator/src/components/ui/ContextMenu.test.tsx`
  - Test renders when isOpen=true
  - Test does not render when isOpen=false
  - Test displays "Dupliquer" and "Supprimer" options
  - Test clicking "Dupliquer" calls onDuplicate
  - Test clicking "Supprimer" calls onDelete
  - Test Escape key calls onClose
  - Test accessibility: role="menu", menuitem roles
  - Test keyboard navigation with Tab/Shift+Tab/Enter

### Task 3: Add Store Actions for Duplicate and Delete (AC: 2, 4)
- [ ] Modify `argos-roi-calculator/src/stores/roiStore.ts`
  - Add action `duplicateAnalysis(id: string): void`
    * Find analysis by id
    * Create new analysis object with:
      - New UUID
      - Name: `${original.name} (copie)`
      - All other fields deep-copied from original
    * Push to analyses array
    * Set as activeAnalysisId
    * Return new analysis object for navigation
  - Add action `deleteAnalysis(id: string): void`
    * Filter analyses array to remove id
    * If deleted analysis was active:
      - If analyses.length > 0: set activeAnalysisId = analyses[0].id
      - Else: set activeAnalysisId = null
    * Update state

- [ ] Create tests in `argos-roi-calculator/src/stores/roiStore.test.ts`
  - Test duplicateAnalysis creates copy with correct name
  - Test duplicateAnalysis copies all fields
  - Test duplicateAnalysis generates new unique ID
  - Test duplicateAnalysis sets duplicate as active
  - Test deleteAnalysis removes analysis from array
  - Test deleteAnalysis updates activeAnalysisId when deleting active analysis
  - Test deleteAnalysis sets activeAnalysisId to first remaining when active deleted
  - Test deleteAnalysis sets activeAnalysisId to null when last analysis deleted
  - Test edge case: duplicate analysis with name ending in "(copie)"

### Task 4: Create DeleteConfirmationModal Component (AC: 3, 4)
- [ ] Create `argos-roi-calculator/src/components/analysis/DeleteConfirmationModal.tsx`
  - Props: `isOpen: boolean`, `analysisName: string`, `onConfirm: () => void`, `onCancel: () => void`
  - Use Modal primitive from Epic 1
  - Title: "Supprimer l'analyse ?"
  - Content: "Cette action est irréversible. L'analyse « {analysisName} » sera définitivement supprimée."
  - Two buttons:
    * "Annuler" (secondary, onClick=onCancel)
    * "Supprimer" (danger/red, onClick=onConfirm)
  - WCAG AA: aria-labelledby (title), aria-describedby (message) — MANDATORY
  - Focus trap with Shift+Tab support
  - Escape key calls onCancel
  - Portal to document.body

- [ ] Create `argos-roi-calculator/src/components/analysis/DeleteConfirmationModal.test.tsx`
  - Test renders when isOpen=true with correct title and message
  - Test displays analysis name in message
  - Test "Annuler" button calls onCancel
  - Test "Supprimer" button calls onConfirm
  - Test Escape key calls onCancel
  - Test accessibility: aria-labelledby, aria-describedby present
  - Test focus trap: Tab cycles through buttons
  - Test focus trap: Shift+Tab works (backward navigation)

### Task 5: Integrate Duplicate/Delete in AnalysisCard (AC: 2, 3, 4)
- [ ] Modify `argos-roi-calculator/src/components/analysis/AnalysisCard.tsx`
  - Import useNavigate from react-router-dom
  - Import useRoiStore for duplicateAnalysis, deleteAnalysis
  - Add state: `const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)`
  - Handle "Dupliquer" click:
    * Call `const newAnalysis = duplicateAnalysis(analysis.id)`
    * Navigate to `/analysis/${newAnalysis.id}`
    * Close context menu
  - Handle "Supprimer" click:
    * Open delete confirmation modal
    * Close context menu
  - Handle delete confirmation:
    * Call `deleteAnalysis(analysis.id)`
    * Close modal
    * If activeAnalysisId changed: navigate to new active analysis or Dashboard
  - Render DeleteConfirmationModal with isOpen={isDeleteModalOpen}

- [ ] Update `argos-roi-calculator/src/components/analysis/AnalysisCard.test.tsx`
  - Test clicking three-dot icon opens context menu
  - Test clicking "Dupliquer" creates duplicate and navigates
  - Test clicking "Supprimer" opens confirmation modal
  - Test confirming deletion removes analysis
  - Test canceling deletion keeps analysis
  - Test duplicate has correct name "(copie)"
  - Test deleting active analysis navigates correctly
  - Test deleting last analysis shows empty state

### Task 6: Dashboard Integration and Navigation (AC: 4, 5)
- [ ] Verify `argos-roi-calculator/src/pages/Dashboard.tsx` handles dynamic analyses updates
  - Ensure grid re-renders when analyses array changes
  - Ensure empty state appears when analyses.length === 0
  - No changes needed if already reactive to Zustand store

- [ ] Update Dashboard tests if needed
  - Test grid updates when analysis duplicated
  - Test grid updates when analysis deleted
  - Test empty state appears after deleting last analysis

### Task 7: Performance and Accessibility Audit (AC: all NFRs)
- [ ] Performance verification:
  - Duplicate operation <100ms (NFR-P1)
  - Delete operation <100ms (NFR-P1)
  - No performance degradation with 6 analyses (NFR-P6)

- [ ] Accessibility verification (WCAG AA):
  - Context menu: proper ARIA roles and labels
  - Delete modal: aria-describedby present (MANDATORY)
  - Focus trap works with Shift+Tab (backward navigation)
  - Keyboard navigation: Tab, Enter, Space, Escape all work
  - Screen reader testing: VoiceOver or NVDA announces all actions correctly

- [ ] Code quality:
  - Remove ALL console.log statements
  - No unused imports or variables
  - TypeScript strict mode passes
  - ESLint passes with no warnings
  - Tailwind CSS v4: avoid animate-in fade-in-0 (no tailwindcss-animate plugin)

## Implementation Notes

### V9 Reference (calculateur-argos/)
- V9 has no duplicate/delete functionality (single-page app)
- Context menu pattern is new for V10
- Confirmation dialog pattern can reference industry standards (destructive actions)

### Zustand Store Pattern
- Use immer pattern for immutable updates if needed
- Duplicate: `set(state => ({ analyses: [...state.analyses, newAnalysis] }))`
- Delete: `set(state => ({ analyses: state.analyses.filter(a => a.id !== id) }))`

### React Router Navigation
- Use `navigate()` from useNavigate hook
- Navigate to `/analysis/${id}` for duplicate
- Navigate to `/` or `/analysis/${newActiveId}` for delete
- Navigation should be synchronous after state update (immediate UI feedback)

### Component Hierarchy
```
AnalysisCard
  ├─ Button (three-dot icon)
  ├─ ContextMenu (conditional)
  │   ├─ MenuItem "Dupliquer"
  │   └─ MenuItem "Supprimer"
  └─ DeleteConfirmationModal (conditional)
      ├─ Title
      ├─ Message
      └─ Actions (Annuler, Supprimer)
```

### Styling Guidelines
- Three-dot icon: subtle gray, hover → Pfeiffer red
- Context menu: white bg, shadow-lg, border gray-200
- Delete button in modal: bg-red-600, hover:bg-red-700
- Animations: transition-all duration-200 (avoid animate-in without plugin)

## Definition of Done

- [ ] All tasks completed and committed
- [ ] All tests pass: `npm test -- --run` (603+ tests)
- [ ] Code review completed (3 parallel agents: simplicity/bugs/conventions)
- [ ] 100% of HIGH + MEDIUM issues fixed
- [ ] No console.log statements in code
- [ ] Accessibility verified: WCAG AA compliant (aria-describedby for modals)
- [ ] Performance verified: operations <100ms
- [ ] Story marked as "done" in sprint-status.yaml
- [ ] Git commit prepared (NOT pushed, awaiting user validation)

## Test Estimates

- AnalysisCard tests: +15 tests (menu, duplicate, delete flows)
- ContextMenu tests: +8 tests (render, interactions, keyboard, a11y)
- DeleteConfirmationModal tests: +10 tests (render, buttons, a11y, focus trap)
- Store tests (roiStore): +12 tests (duplicate, delete, edge cases)
- Dashboard integration tests: +5 tests (updates, empty state)
- **Total new tests: ~50**
- **Expected total: 653 tests** (603 current + 50 new)

## Time Estimates

- Task 1 (Three-dot icon): 10 min
- Task 2 (ContextMenu component): 20 min
- Task 3 (Store actions): 15 min
- Task 4 (DeleteConfirmationModal): 25 min
- Task 5 (Integration): 20 min
- Task 6 (Dashboard updates): 10 min
- Task 7 (Audit): 10 min
- **Dev total: 110 min (~2h)**
- Code review (3 agents //): 5 min
- Fixes (HIGH+MEDIUM): 20-30 min
- **Grand total: 2h30-2h45**

## Related Stories

- **Story 2.8** (Analysis Rename): Similar pattern for analysis mutations
- **Story 3.1** (Dashboard Grid): AnalysisCard component integration
- **Story 3.2** (Card Navigation): Navigation patterns from cards
- **Story 1.6** (Modal Primitive): DeleteConfirmationModal uses Modal primitive

## Success Metrics

- User can duplicate analysis in <2 clicks (three-dot → Dupliquer)
- User can delete analysis in <3 clicks (three-dot → Supprimer → confirm)
- Zero accidental deletions (confirmation required)
- All keyboard users can duplicate/delete without mouse
- Screen reader users understand all actions and consequences
