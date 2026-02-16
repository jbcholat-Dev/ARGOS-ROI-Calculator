# Story 5.4: PDF Generation Error Handling

Status: done

## Story

As a user (JB in a client meeting),
I want graceful error handling if PDF generation fails,
so that I can recover without embarrassment.

## Acceptance Criteria

1. **Given** PDF generation is triggered, **When** an error occurs (e.g., browser limitation, memory issue, jsPDF internal error), **Then** the Export PDF button returns to its normal idle state, **And** an error toast appears: "PDF generation failed. Please try again."

2. **Given** PDF generation fails, **When** I see the error toast, **Then** it includes a "Retry" action button.

3. **Given** I click the "Retry" button in the error toast, **When** generation is attempted again, **Then** the button shows loading state and attempts generation.

4. **Given** the error persists after 2 retries, **When** the third attempt also fails, **Then** the toast message changes to: "PDF generation failed after multiple attempts. Try refreshing the page or reducing the number of analyses."

5. **Given** PDF generation fails at any point, **When** I check my analysis data, **Then** all session data remains intact in the store (nothing lost due to PDF error).

6. **Given** PDF generation is in progress, **When** I navigate away from the current page, **Then** generation continues in background and download triggers when complete (or error is silently logged if component unmounted).

7. **Given** PDF generation fails, **When** the error is caught, **Then** the error is logged with `[PDF]` prefix for debugging (but removed before production commit — use structured error info, not console.log).

## Tasks / Subtasks

- [x] Task 1: Implement error handling in PDFExportButton (AC: 1, 2, 3, 4, 5)
  - [x] 1.1: Add retry counter state to PDFExportButton component
  - [x] 1.2: Wrap `generatePDF()` call in try/catch
  - [x] 1.3: On error: reset button to idle state, show error toast
  - [x] 1.4: Implement retry logic: increment counter, re-attempt on retry click
  - [x] 1.5: After 2 retries (3 total attempts), show escalated error message
  - [x] 1.6: Reset retry counter on successful generation
  - [x] 1.7: Reset retry counter when user manually clicks Export PDF again (fresh attempt)

- [x] Task 2: Implement toast with retry action (AC: 2, 3)
  - [x] 2.1: Check existing Toast component API for action button support
  - [x] 2.2: If Toast supports actions: pass retry callback as action
  - [x] 2.3: If Toast does NOT support actions: enhance Toast component to accept an optional action button (label + onClick)
  - [x] 2.4: Style retry button within toast (secondary/ghost variant, small size)

- [x] Task 3: Implement error boundary for PDF generation (AC: 1, 5, 7)
  - [x] 3.1: Add `try/catch` around the entire `generatePDF()` call chain
  - [x] 3.2: Ensure jsPDF internal errors are caught (canvas rendering, memory limits)
  - [x] 3.3: Ensure Blob creation errors are caught
  - [x] 3.4: Ensure download trigger errors are caught (URL.createObjectURL, anchor click)
  - [x] 3.5: Log error details with structured info (NOT console.log — use error reporting pattern)

- [x] Task 4: Handle edge cases (AC: 5, 6)
  - [x] 4.1: Verify store data is NOT modified during PDF generation (pure function guarantee)
  - [x] 4.2: Handle component unmount during async generation (use AbortController or isMounted ref)
  - [x] 4.3: Handle very large PDFs (>10 analyses — though 5 is max expected)
  - [x] 4.4: Handle empty or invalid analysis data gracefully (skip invalid, generate with valid only)

- [x] Task 5: Write tests (~15-20 tests) (AC: all)
  - [x] 5.1: Test error toast appears when generatePDF throws
  - [x] 5.2: Test button returns to idle on error
  - [x] 5.3: Test retry button in toast triggers re-generation
  - [x] 5.4: Test retry counter increments
  - [x] 5.5: Test escalated message after 2 retries
  - [x] 5.6: Test retry counter resets on success
  - [x] 5.7: Test retry counter resets on fresh manual click
  - [x] 5.8: Test store data intact after error (analyses unchanged)
  - [x] 5.9: Test component unmount during generation doesn't cause React warning
  - [x] 5.10: Test with various error types (TypeError, DOMException, generic Error)
  - [x] 5.11: Test blob URL cleanup on error path (no memory leak)

## Dev Notes

### Architecture & Error Flow

**Error Flow State Machine:**
```
idle → generating → success → idle
                  → error → idle (toast with retry)
                            → retry click → generating → success → idle
                                                       → error → idle (counter++)
                                                                 → if counter >= 2: escalated message
```

**Implementation in PDFExportButton:**
```typescript
const MAX_RETRIES = 2;

const [exportState, setExportState] = useState<'idle' | 'generating'>('idle');
const [retryCount, setRetryCount] = useState(0);
const isMountedRef = useRef(true);

useEffect(() => {
  return () => { isMountedRef.current = false; };
}, []);

const handleExport = async () => {
  setExportState('generating');
  try {
    const blob = await generatePDF(analyses, globalParams, excludedFromGlobal);
    if (!isMountedRef.current) return;

    // Download
    triggerDownload(blob, filename);
    setExportState('idle');
    setRetryCount(0);
    showToast('PDF exported successfully', 'success');
  } catch (error) {
    if (!isMountedRef.current) return;

    setExportState('idle');
    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);

    if (newRetryCount > MAX_RETRIES) {
      showToast(
        'PDF generation failed after multiple attempts. Try refreshing the page or reducing the number of analyses.',
        'error'
      );
    } else {
      showToast(
        'PDF generation failed. Please try again.',
        'error',
        { action: { label: 'Retry', onClick: handleExport } }
      );
    }
  }
};
```

**IMPORTANT — Store Safety:**
`generatePDF()` is a PURE function — it receives data as parameters and returns a Blob. It does NOT access or modify the Zustand store. This guarantees AC5 (session data preserved on error) by design.

### Toast Enhancement Decision

Check the existing `Toast.tsx` component:
- **If it already supports action buttons:** Use existing API, no modification needed.
- **If it does NOT support actions:** Add minimal enhancement:

```typescript
// Minimal Toast action support
interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning';
  action?: ToastAction;  // NEW: optional action button
}
```

Keep the enhancement minimal — just enough for the retry button. Do NOT over-engineer the Toast component.

**Alternative (if Toast enhancement is too complex):** Use a simple inline retry button below the error message in the PDFExportButton itself, not in the toast. This avoids modifying shared UI primitives.

### Error Categories

| Error Source | Example | Recovery |
|-------------|---------|----------|
| jsPDF initialization | Out of memory, unsupported browser | Retry (may work after GC) |
| Content rendering | Invalid data, NaN in calculations | Skip invalid analysis, generate with valid only |
| Blob creation | Memory limit exceeded | Retry with reduced content |
| Download trigger | Popup blocker, security policy | Show download link instead of auto-download |
| Network (N/A) | N/A — 100% client-side | N/A |

**CRITICAL:** All errors are client-side. No network errors possible. The most likely failure is memory pressure with large PDFs or browser-specific jsPDF issues.

### File Structure

```
Modified files:
├── src/components/pdf/PDFExportButton.tsx       # Add error handling, retry logic
├── src/components/pdf/PDFExportButton.test.tsx   # Add error scenario tests
├── src/components/ui/Toast.tsx                   # MAYBE: Add action button support (if needed)
└── src/components/ui/Toast.test.tsx              # MAYBE: Add action button tests (if modified)
```

### Testing Patterns

**Mock generatePDF to simulate errors:**
```typescript
vi.mock('@/lib/pdf-generator', () => ({
  generatePDF: vi.fn(),
}));

import { generatePDF } from '@/lib/pdf-generator';

it('shows error toast when generation fails', async () => {
  (generatePDF as Mock).mockRejectedValueOnce(new Error('Canvas rendering failed'));

  render(<PDFExportButton />);
  await userEvent.click(screen.getByRole('button', { name: /export pdf/i }));

  await waitFor(() => {
    expect(screen.getByText(/pdf generation failed/i)).toBeInTheDocument();
  });
});

it('shows escalated message after 2 retries', async () => {
  (generatePDF as Mock)
    .mockRejectedValueOnce(new Error('Fail 1'))
    .mockRejectedValueOnce(new Error('Fail 2'))
    .mockRejectedValueOnce(new Error('Fail 3'));

  render(<PDFExportButton />);

  // First attempt
  await userEvent.click(screen.getByRole('button', { name: /export pdf/i }));
  await waitFor(() => expect(screen.getByText(/please try again/i)).toBeInTheDocument());

  // Retry 1
  await userEvent.click(screen.getByRole('button', { name: /retry/i }));
  // Retry 2
  await userEvent.click(screen.getByRole('button', { name: /retry/i }));

  await waitFor(() => {
    expect(screen.getByText(/multiple attempts/i)).toBeInTheDocument();
  });
});

it('preserves store data after error', async () => {
  const initialAnalyses = useAppStore.getState().analyses;
  (generatePDF as Mock).mockRejectedValueOnce(new Error('Fail'));

  render(<PDFExportButton />);
  await userEvent.click(screen.getByRole('button', { name: /export pdf/i }));

  await waitFor(() => {
    expect(useAppStore.getState().analyses).toEqual(initialAnalyses);
  });
});
```

**Test unmount safety:**
```typescript
it('handles unmount during generation without React warning', async () => {
  const consoleSpy = vi.spyOn(console, 'error');
  (generatePDF as Mock).mockImplementation(
    () => new Promise((resolve) => setTimeout(resolve, 1000))
  );

  const { unmount } = render(<PDFExportButton />);
  await userEvent.click(screen.getByRole('button', { name: /export pdf/i }));

  // Unmount while generating
  unmount();

  // Wait for async to complete
  await new Promise((r) => setTimeout(r, 1500));

  // No "can't perform state update on unmounted component" warning
  expect(consoleSpy).not.toHaveBeenCalledWith(
    expect.stringContaining('unmounted')
  );
});
```

### Critical Guardrails

- **NO console.log in production** — Log errors to structured error info only during dev, remove before commit
- **Store immutability** — generatePDF receives DATA, not store reference. Cannot corrupt state.
- **Memory cleanup** — Always `URL.revokeObjectURL()` even on error paths
- **isMounted guard** — Prevent state updates after component unmount (common React async pattern)
- **Retry counter reset** — Reset on success AND on fresh manual click (not just success)
- **Named exports ONLY**
- **Zustand selectors** — NEVER destructure store

### Previous Story Intelligence

- **Story 5.1:** Creates the PDFExportButton with basic state management. This story ADDS error handling on top of the existing component.
- **Story 5.2 + 5.3:** Creates the generatePDF function. This story wraps the CALLING code with try/catch, not the internal PDF logic.
- **Session Recovery Modal (Story 4.5.1):** Established the pattern for error/recovery UX. The PDF error toast should follow similar tone — professional, non-alarming, actionable.
- **Toast component:** Check if `src/components/ui/Toast.tsx` supports `action` prop. If not, minimal enhancement or alternative approach.

### Dependencies

- **Depends on Story 5.1** — PDFExportButton must exist before adding error handling
- **Depends on Story 5.2** — generatePDF function must exist (to mock in tests)
- **Can be developed in Wave 2** (after 5.1 + 5.2 are merged)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 5.4]
- [Source: argos-roi-calculator/src/components/pdf/PDFExportButton.tsx] — Created in Story 5.1
- [Source: argos-roi-calculator/src/lib/pdf-generator.ts] — Created in Story 5.2
- [Source: argos-roi-calculator/src/components/ui/Toast.tsx] — Toast component for error display
- [Source: argos-roi-calculator/src/components/session/SessionRecoveryModal.tsx] — Recovery UX pattern

### Estimated Effort

- Development: ~1h
- Testing: ~1h
- Code review: ~20min
- **Total: ~2.5h**
- **Test estimate: 15-20 tests**

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

None — clean implementation.

### Completion Notes List

- Enhanced Toast component with optional `action` prop (ToastAction: label + onClick)
- Replaced ExportState 'error' with immediate reset to 'idle' on error (toast handles UX)
- Used `useRef` for retryCount (avoids stale closure in retry callback) and isMounted guard
- Simplified state machine: removed 'error' from ExportState type (idle/generating/success)
- blob URL cleanup on error path via try/catch around download trigger
- 15 new error-handling tests + 3 new Toast action tests = 18 new tests total
- Pre-existing 4 failures in AnalysisRename.integration.test.tsx (unrelated, multiple textbox collision)
- No console.log in production code

### File List

- `argos-roi-calculator/src/components/pdf/PDFExportButton.tsx` — Added retry logic, isMounted ref, toast with action
- `argos-roi-calculator/src/components/pdf/PDFExportButton.test.tsx` — Added 15 error-handling tests (48 total)
- `argos-roi-calculator/src/components/ui/Toast.tsx` — Added optional `action` prop (ToastAction interface)
- `argos-roi-calculator/src/components/ui/Toast.test.tsx` — Added 3 action button tests (16 total)
