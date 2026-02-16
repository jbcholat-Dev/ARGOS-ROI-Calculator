# Story 5.2: PDF Template with Pfeiffer Branding

Status: done

## Story

As a user (Marc receiving the PDF),
I want a professionally branded document,
so that I can share it with management without embarrassment.

## Acceptance Criteria

1. **Given** PDF generation is triggered, **When** the PDF is created, **Then** it includes a cover page with Pfeiffer logo, ARGOS branding, and generation date.

2. **Given** the PDF has multiple pages, **When** I view any page after the cover, **Then** it has a consistent header with "ARGOS ROI Analysis" and a footer with page number and date.

3. **Given** the PDF is generated, **When** I view the typography, **Then** it uses clean, readable fonts with professional sizing (headings, body, labels clearly differentiated).

4. **Given** the PDF is generated, **When** I view the color scheme, **Then** Pfeiffer brand colors (#CC0000) are used as accents on key elements (headings, dividers, highlights).

5. **Given** the PDF is generated, **When** the file downloads, **Then** the filename follows the pattern: `ARGOS-ROI-Analysis-YYYY-MM-DD.pdf`.

6. **Given** the PDF has content, **When** I print it, **Then** it renders correctly on standard A4 paper.

7. **Given** the PDF generation, **When** I measure the generation time, **Then** it completes within 3 seconds (NFR-P2) for up to 5 analyses.

## Tasks / Subtasks

- [x] Task 1: Create PDF generator core module (AC: 1-7)
  - [x] 1.1: Create `src/lib/pdf-generator.ts` (replace placeholder from Story 5.1)
  - [x] 1.2: Set up jsPDF document (A4, portrait, mm units)
  - [x] 1.3: Define PDF design constants (margins, colors, font sizes, spacing)
  - [x] 1.4: Implement `generatePDF()` main orchestrator function

- [x] Task 2: Implement cover page (AC: 1)
  - [x] 2.1: Add Pfeiffer red accent bar at top (full width, #CC0000)
  - [x] 2.2: Add "ARGOS" title in large bold text
  - [x] 2.3: Add "ROI Analysis Report" subtitle
  - [x] 2.4: Add generation date (formatted: "February 16, 2026")
  - [x] 2.5: Add "Pfeiffer Vacuum" and "Confidential" footer text
  - [x] 2.6: Add decorative accent line/divider

- [x] Task 3: Implement page header/footer template (AC: 2)
  - [x] 3.1: Create `addPageHeader()` helper — "ARGOS ROI Analysis" left-aligned, thin red line below
  - [x] 3.2: Create `addPageFooter()` helper — "Pfeiffer Vacuum" left, page "X/Y" right, date center
  - [x] 3.3: Apply header/footer to every page after cover (use jsPDF `didDrawPage` callback or manual application)

- [x] Task 4: Define typography system (AC: 3)
  - [x] 4.1: Set up font hierarchy using jsPDF built-in Helvetica:
    - Title: 24pt bold
    - Section heading: 16pt bold
    - Subsection heading: 12pt bold
    - Body text: 10pt normal
    - Label: 9pt normal gray
    - Small: 8pt light
  - [x] 4.2: Create helper functions: `addTitle()`, `addHeading()`, `addSubheading()`, `addBodyText()`, `addLabel()`

- [x] Task 5: Define color system (AC: 4)
  - [x] 5.1: Pfeiffer Red: RGB(204, 0, 0) — for accents, dividers, headings
  - [x] 5.2: Dark text: RGB(51, 51, 51) — for body text
  - [x] 5.3: Gray text: RGB(128, 128, 128) — for labels, secondary text
  - [x] 5.4: Light gray background: RGB(245, 245, 245) — for table rows, highlight areas
  - [x] 5.5: ROI traffic light colors:
    - Negative: RGB(204, 0, 0) — red
    - Warning: RGB(255, 140, 0) — orange
    - Positive: RGB(40, 167, 69) — green

- [x] Task 6: Implement table rendering utility (AC: 3, 6)
  - [x] 6.1: Create `addTable()` helper for structured data display
  - [x] 6.2: Support columns with headers, alignment (left/right), widths
  - [x] 6.3: Alternate row backgrounds (white / light gray)
  - [x] 6.4: Pfeiffer red header row with white text
  - [x] 6.5: Handle page overflow (continue table on next page with repeated headers)

- [x] Task 7: Implement page management (AC: 2, 6)
  - [x] 7.1: Track current Y position on page
  - [x] 7.2: Auto-add new page when content exceeds safe area (margin bottom)
  - [x] 7.3: Apply header/footer to each new page
  - [x] 7.4: Maintain page counter for footer

- [x] Task 8: Implement filename generation (AC: 5)
  - [x] 8.1: Format: `ARGOS-ROI-Analysis-YYYY-MM-DD.pdf`
  - [x] 8.2: Use ISO date format for filename

- [x] Task 9: Write tests (~25-30 tests) (AC: all)
  - [x] 9.1: Create `src/lib/pdf-generator.test.ts`
  - [x] 9.2: Test `generatePDF()` returns a valid Blob
  - [x] 9.3: Test cover page content (title, date, branding text)
  - [x] 9.4: Test page count is correct for given number of analyses
  - [x] 9.5: Test filename generation format
  - [x] 9.6: Test with 0 analyses (should still generate with executive summary showing zeros or empty state)
  - [x] 9.7: Test with 1 analysis
  - [x] 9.8: Test with 5 analyses (max expected)
  - [x] 9.9: Test header/footer presence on non-cover pages
  - [x] 9.10: Test performance: generation < 3s for 5 analyses
  - [x] 9.11: Test helper functions (addTitle, addHeading, addTable, etc.)

## Dev Notes

### Architecture & Design Decisions

**Approach: Pure jsPDF (NOT html2canvas)**
For the main report, use programmatic jsPDF construction — NOT html2canvas DOM capture. Reasons:
- Professional, precise control over layout and typography
- Clean page breaks without rendering artifacts
- Fast generation (<3s vs 5-10s with html2canvas)
- Consistent output across browsers
- No dependency on DOM state

html2canvas will ONLY be used in Story 6.5 (Unified PDF) to capture the Architecture Diagram SVG. It is NOT needed for Epic 5.

**jsPDF 4.1 API Key Points:**
```typescript
import { jsPDF } from 'jspdf';

const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4',  // 210 x 297 mm
});

// Text
doc.setFont('helvetica', 'bold');
doc.setFontSize(24);
doc.setTextColor(204, 0, 0);  // Pfeiffer Red
doc.text('ARGOS', 20, 40);

// Shapes
doc.setFillColor(204, 0, 0);
doc.rect(0, 0, 210, 8, 'F');  // Red accent bar

// Lines
doc.setDrawColor(204, 0, 0);
doc.setLineWidth(0.5);
doc.line(20, 50, 190, 50);

// Pages
doc.addPage();
doc.internal.getNumberOfPages();

// Output
const blob = doc.output('blob');
```

**Page Layout Constants:**
```typescript
const PDF_LAYOUT = {
  pageWidth: 210,       // A4 width in mm
  pageHeight: 297,      // A4 height in mm
  marginLeft: 20,
  marginRight: 20,
  marginTop: 25,        // Below header
  marginBottom: 25,     // Above footer
  contentWidth: 170,    // pageWidth - marginLeft - marginRight
  headerY: 12,          // Header position
  footerY: 285,         // Footer position
  accentBarHeight: 3,   // Top accent bar
};
```

**Function Signature:**
```typescript
export interface PDFOptions {
  filename?: string;       // Override default filename
  includeAssumptions?: boolean;  // Default: true
}

export async function generatePDF(
  analyses: Analysis[],
  globalParams: GlobalParams,
  excludedFromGlobal: Set<string>,
  options?: PDFOptions,
): Promise<Blob> {
  // ... orchestration
}
```

Note: Function is async to allow for dynamic import of jsPDF (code splitting):
```typescript
const { jsPDF } = await import('jspdf');
```

### File Structure

```
src/lib/
├── pdf-generator.ts        # NEW: Core PDF generation engine
└── pdf-generator.test.ts   # NEW: Tests
```

### Existing Utilities to Reuse

- **`formatCurrency()`** from `src/lib/utils.ts` — French locale, EUR symbol, rounded integers
- **`formatPercentage()`** from `src/lib/utils.ts` — French locale, 1 decimal
- **`calculateAggregatedMetrics()`** from `src/lib/calculations.ts` — Global totals
- **`calculateAllAnalysisRows()`** from `src/lib/calculations.ts` — Per-analysis data
- **`getROIColorClass()`** from `src/lib/calculations.ts` — ROI thresholds (adapt to RGB for PDF)

**IMPORTANT:** Create a `getROIColor()` helper that returns RGB tuple (not Tailwind class) for PDF usage:
```typescript
function getROIColor(roi: number): [number, number, number] {
  if (roi < 0) return [204, 0, 0];      // Red
  if (roi < 15) return [255, 140, 0];   // Orange
  return [40, 167, 69];                  // Green
}
```

### Pfeiffer Branding Notes

- **Primary red:** #CC0000 = RGB(204, 0, 0)
- **Dark red (hover):** #A50000 = RGB(165, 0, 0)
- **No logo file needed for MVP:** Use text-based "ARGOS" with Pfeiffer red styling. A logo SVG can be added post-demo if needed (jsPDF supports `addImage()` for PNG/JPEG).
- **Typography:** jsPDF built-in Helvetica family (no custom font embedding needed for MVP):
  - `helvetica` (normal) — body text
  - `helvetica` bold — headings
  - This provides a clean, professional look

### Testing Patterns

**jsPDF in Vitest:**
jsPDF works in Node.js/Vitest environment. No special mocking needed — just import and use.

```typescript
import { jsPDF } from 'jspdf';

it('generates a PDF blob', async () => {
  const blob = await generatePDF(mockAnalyses, mockGlobalParams, new Set());
  expect(blob).toBeInstanceOf(Blob);
  expect(blob.type).toBe('application/pdf');
  expect(blob.size).toBeGreaterThan(0);
});
```

**Testing page content:**
Use `doc.internal.pages` or inspect the PDF text content by converting to string. Alternative: spy on `doc.text()`, `doc.setFont()` calls.

```typescript
// Spy approach
const textSpy = vi.spyOn(jsPDF.prototype, 'text');
await generatePDF(...);
expect(textSpy).toHaveBeenCalledWith(expect.stringContaining('ARGOS'), expect.any(Number), expect.any(Number));
```

### Critical Guardrails

- **NO console.log in production code**
- **Named exports ONLY** — `export async function generatePDF`
- **Pure function** — No store access inside pdf-generator.ts. Data passed as parameters.
- **Dynamic import** — Use `await import('jspdf')` for code splitting (jsPDF is ~250KB)
- **Performance target** — <3s for 5 analyses. Profile if needed.
- **A4 layout precision** — All measurements in mm. Test with real PDF viewer.
- **Font fallback** — Stick to Helvetica (built-in). No custom font files.

### Previous Story Intelligence

- **Story 5.1 creates the placeholder** `pdf-generator.ts` — this story replaces it with full implementation.
- **Calculation functions tested and stable** — `calculateAggregatedMetrics()` and `calculateAllAnalysisRows()` proven across Epic 4 + 4.5.
- **Format functions use French locale** — `€125 000` format. PDF should match on-screen display.
- **Maintenance strategy model (Story 4.5.4)** — PDF template MUST support both `unplanned` and `planned` analysis strategies. Content sections will differ. This is handled in Story 5.3, but the template engine must be flexible enough.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 5.2]
- [Source: _bmad-output/planning-artifacts/architecture.md#PDF Generation — jsPDF + html2canvas]
- [Source: argos-roi-calculator/src/lib/calculations.ts] — Reusable calculation functions
- [Source: argos-roi-calculator/src/lib/utils.ts] — formatCurrency, formatPercentage
- [Source: argos-roi-calculator/src/lib/constants.ts] — PFEIFFER_RED, ROI thresholds
- [Source: argos-roi-calculator/src/types/index.ts] — Analysis, GlobalParams, AggregatedMetrics types

### Estimated Effort

- Development: ~2h
- Testing: ~1h
- Code review: ~30min
- **Total: ~3.5h**
- **Test estimate: 25-30 tests**

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- jsPDF v4 does not expose `text` on prototype (only on instances) — prototype spying does not work for `generatePDF` integration tests. Used raw PDF text extraction via FileReader instead.
- jsdom Blob does not support `arrayBuffer()` method — used FileReader.readAsArrayBuffer for jsdom compatibility.

### Completion Notes List

- Replaced Story 5.1 placeholder with full PDF generator implementation (415 lines)
- All 9 tasks complete: core module, cover page, header/footer, typography, colors, tables, page management, filename, tests
- 61 tests added and passing (exceeds 25-30 estimate)
- No regressions: all 33 PDFExportButton tests from Story 5.1 still pass
- Pre-existing failures in AnalysisRename.integration.test.tsx (4 tests) are unrelated
- Performance: generation completes in ~1ms for 5 analyses (well under 3s target)
- `generateFilename()` exported for use by Story 5.1 download logic
- `addTable()` supports page overflow with automatic header repetition on new pages

### File List

- `argos-roi-calculator/src/lib/pdf-generator.ts` — MODIFIED (replaced placeholder with full implementation)
- `argos-roi-calculator/src/lib/pdf-generator.test.ts` — CREATED (61 tests)
- `_bmad-output/implementation-artifacts/5-2-pdf-template-with-pfeiffer-branding.md` — MODIFIED (task checkboxes, status)
