# Story 5.1: PDF Export Button with Progress State

Status: done

## Story

As a user (JB),
I want to trigger PDF export with clear visual feedback,
so that I know when the report is being generated and when it's ready.

## Acceptance Criteria

1. **Given** I have at least one analysis with complete data, **When** I see the "Export PDF" button on Global Analysis page, **Then** it is enabled and shows "Export PDF" label with a document icon.

2. **Given** I click the "Export PDF" button, **When** generation starts, **Then** the button shows a loading spinner and "Generating..." text, **And** the button is disabled during generation.

3. **Given** PDF generation completes successfully, **When** the PDF is ready, **Then** the PDF downloads automatically via browser download, **And** the button returns to normal state, **And** a success toast appears: "PDF exported successfully".

4. **Given** I have 0 analyses (or no complete analyses), **When** I see the Export PDF button, **Then** the button is disabled, **And** it has a tooltip: "Create analyses first".

5. **Given** the Export PDF button is in the NavigationBar, **When** I am on any page, **Then** I can see and access the Export PDF button from the navigation area.

6. **Given** I trigger PDF export, **When** generation is in progress, **Then** I cannot trigger another export (button disabled).

## Tasks / Subtasks

- [x] Task 1: Create PDFExportButton component (AC: 1, 2, 3, 4, 6)
  - [x] 1.1: Create `src/components/pdf/PDFExportButton.tsx` with state management (idle/generating/success/error)
  - [x] 1.2: Implement loading state with spinner using existing Button component's `loading` prop
  - [x] 1.3: Implement disabled state when no calculable analyses exist
  - [x] 1.4: Add tooltip for disabled state ("Create analyses first")
  - [x] 1.5: Add document icon (inline SVG, no external library)
  - [x] 1.6: Wire up async export handler with state transitions
  - [x] 1.7: Auto-download PDF via blob URL + anchor click pattern

- [x] Task 2: Integrate into GlobalAnalysis page (AC: 1, 5)
  - [x] 2.1: Add PDFExportButton to `src/pages/GlobalAnalysis.tsx` in the header/action area
  - [x] 2.2: Position: right-aligned in the page header, near existing action buttons

- [x] Task 3: Integrate into NavigationBar (AC: 5)
  - [x] 3.1: Add PDFExportButton to `src/components/layout/NavigationBar.tsx`
  - [x] 3.2: Use compact variant for navbar (icon-only or smaller button)
  - [x] 3.3: Ensure it doesn't break existing layout (Reset button, nav links)

- [x] Task 4: Update barrel exports (AC: all)
  - [x] 4.1: Update `src/components/pdf/index.ts` to export PDFExportButton

- [x] Task 5: Write tests (~30-35 tests) (AC: all)
  - [x] 5.1: Create `src/components/pdf/PDFExportButton.test.tsx`
  - [x] 5.2: Test idle state renders correctly
  - [x] 5.3: Test disabled state when no analyses
  - [x] 5.4: Test disabled state when analyses exist but none calculable
  - [x] 5.5: Test enabled state when calculable analyses exist
  - [x] 5.6: Test click triggers generating state (spinner + "Generating...")
  - [x] 5.7: Test button disabled during generation
  - [x] 5.8: Test success state after generation completes
  - [x] 5.9: Test success toast appears
  - [x] 5.10: Test button returns to idle after success
  - [x] 5.11: Test tooltip content for disabled state
  - [x] 5.12: Test accessibility: button role, aria-label, aria-disabled
  - [x] 5.13: Integration test with GlobalAnalysis page placement
  - [x] 5.14: Integration test with NavigationBar placement

## Dev Notes

### Architecture & Component Design

**Component API:**
```typescript
interface PDFExportButtonProps {
  variant?: 'default' | 'compact';  // 'default' for page, 'compact' for navbar
  className?: string;
}
```

**State Machine:**
```
idle → generating → success → idle (after 2s timeout)
                  → error → idle (handled in Story 5.4)
```

**Data Access Pattern (Zustand selectors — MANDATORY):**
```typescript
const analyses = useAppStore((state) => state.analyses);
const globalParams = useAppStore((state) => state.globalParams);
const excludedFromGlobal = useAppStore((state) => state.excludedFromGlobal);
```

**Calculable Check:**
Use `calculateAnalysisRow(analysis, globalParams)` from `src/lib/calculations.ts` — returns `null` for incomplete analyses. Button is enabled when at least one analysis returns non-null.

**PDF Download Pattern (client-side):**
```typescript
const blob = doc.output('blob');
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = `ARGOS-ROI-Analysis-${new Date().toISOString().split('T')[0]}.pdf`;
link.click();
URL.revokeObjectURL(url);
```

**Toast Integration:**
Check existing toast pattern in `src/components/ui/Toast.tsx` and store. If store has `showToast` action, use it. If toast is component-level, use local state. Follow the pattern already established in the codebase.

**IMPORTANT — Placeholder for PDF generation:**
Story 5.1 focuses on the BUTTON component. The actual `generatePDF()` function will be created in Story 5.2. For Story 5.1, create a placeholder:
```typescript
// src/lib/pdf-generator.ts (placeholder — filled in Story 5.2)
export async function generatePDF(
  analyses: Analysis[],
  globalParams: GlobalParams,
  excludedFromGlobal: Set<string>
): Promise<Blob> {
  // Placeholder: creates a minimal PDF for button testing
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  doc.text('ARGOS ROI Analysis Report', 20, 20);
  return doc.output('blob');
}
```

### File Structure

```
src/components/pdf/
├── index.ts                    # Update barrel export
├── PDFExportButton.tsx         # NEW: Export button with progress states
└── PDFExportButton.test.tsx    # NEW: Tests

src/lib/
└── pdf-generator.ts            # NEW: Placeholder (filled in 5.2)

Modified files:
├── src/pages/GlobalAnalysis.tsx          # Add PDFExportButton
└── src/components/layout/NavigationBar.tsx  # Add PDFExportButton (compact)
```

### Existing Patterns to Follow

- **Button component:** `src/components/ui/Button.tsx` — has `variant`, `size`, `loading`, `disabled` props. Use `variant="primary"` for the export button.
- **NavigationBar layout:** `src/components/layout/NavigationBar.tsx` — check existing button placements (Reset button). Add export button with similar spacing.
- **GlobalAnalysis page:** `src/pages/GlobalAnalysis.tsx` — check header area. Add button near "Solutions" CTA button if present.
- **Icon pattern:** No icon library installed. Use inline SVG for document/download icon. Keep it simple (16x16 or 20x20).

### Testing Patterns

- **Mock PDF generation:** Mock `generatePDF` from `src/lib/pdf-generator.ts` in tests to avoid actual jsPDF execution.
- **Zustand store:** Use `useAppStore.setState()` in tests to set up analysis data.
- **Accessibility assertions:** `getByRole('button', { name: /export pdf/i })`, check `aria-disabled`, check `aria-busy` during generation.
- **Async state transitions:** Use `waitFor()` to verify state changes after async operations.
- **Toast assertions:** Verify toast message appears after success/error.

### Critical Guardrails

- **NO console.log in production code** — remove all before commit
- **Named exports ONLY** — `export function PDFExportButton`
- **Zustand selectors** — NEVER destructure store directly
- **Tailwind class order** — Layout → Spacing → Typography → Colors → Effects
- **WCAG AA** — Button must have accessible name, disabled state communicated via aria-disabled
- **Memory management** — Revoke blob URLs after download (`URL.revokeObjectURL`)

### Previous Story Intelligence

- **Button loading pattern:** The `Button` component in `src/components/ui/Button.tsx` already supports a `loading` prop with spinner. Reuse this — do NOT create a custom spinner.
- **Modal confirmation pattern from NavigationBar:** The Reset button shows a confirmation modal before action. PDF export does NOT need confirmation (direct action).
- **Toast pattern:** Check how toast notifications work in the codebase. Used in session recovery (Story 4.5.1).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 5.1]
- [Source: _bmad-output/planning-artifacts/architecture.md#PDF Generation]
- [Source: argos-roi-calculator/src/components/ui/Button.tsx] — Button primitive with loading state
- [Source: argos-roi-calculator/src/components/layout/NavigationBar.tsx] — Navbar for button placement
- [Source: argos-roi-calculator/src/pages/GlobalAnalysis.tsx] — Page for button placement
- [Source: argos-roi-calculator/src/lib/calculations.ts] — `calculateAnalysisRow()` for calculable check

### Estimated Effort

- Development: ~1.5h
- Testing: ~1h
- Code review: ~30min
- **Total: ~3h**
- **Test estimate: 30-35 tests**

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

### Completion Notes List

- All 5 tasks completed: PDFExportButton component, GlobalAnalysis integration, NavigationBar integration, barrel exports, tests
- 33 tests written and passing (covers idle, disabled, enabled, generating, success, error, toast, accessibility, integration, data reactivity)
- Placeholder `pdf-generator.ts` created with minimal jsPDF implementation for button testing
- Pre-existing test failures confirmed: AnalysisRename.integration.test.tsx (4 failures) and pdf-generator.test.ts (created by parallel Story 5.2 agent, imports not yet available)
- No console.log in production code
- Named exports only, Zustand selectors pattern followed
- WCAG AA: aria-label, aria-disabled, aria-busy, title tooltip for disabled state
- Memory management: URL.revokeObjectURL called after download

### File List

- `src/components/pdf/PDFExportButton.tsx` (NEW) — Main component with state machine (idle/generating/success/error)
- `src/components/pdf/PDFExportButton.test.tsx` (NEW) — 33 tests
- `src/components/pdf/index.ts` (MODIFIED) — Barrel export for PDFExportButton
- `src/lib/pdf-generator.ts` (NEW) — Placeholder PDF generation function
- `src/pages/GlobalAnalysis.tsx` (MODIFIED) — Added PDFExportButton in page header
- `src/components/layout/NavigationBar.tsx` (MODIFIED) — Added compact PDFExportButton next to Reset button
