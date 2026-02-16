# Story 6.5: Unified PDF Export (V10 + V11)

Status: done

## Story

As a user (JB delivering complete package),
I want to export a single PDF containing both ROI analysis and technical architecture,
so that Marc has everything needed for internal discussions.

## Acceptance Criteria

1. **Given** I have completed ROI analyses and am on Solutions page, **When** I see the "Export Complete Report" button, **Then** it is visible and enabled when at least one calculable analysis exists.

2. **Given** I click "Export Complete Report", **When** PDF generation starts, **Then** the button shows loading state with "Generating..." text, **And** the button is disabled during generation.

3. **Given** PDF generation completes, **When** the PDF is ready, **Then** it downloads automatically with filename `ARGOS-Complete-Proposal-YYYY-MM-DD.pdf`, **And** a success toast appears, **And** the button returns to idle state.

4. **Given** the PDF is generated, **When** I open Part 1 (ROI Analysis), **Then** it contains the same content as the existing Export PDF: cover page, executive summary, per-process breakdown, global analysis summary, assumptions & methodology.

5. **Given** the PDF is generated, **When** I view Part 2 (Technical Architecture), **Then** I see:
   - A section divider page: "Part 2: Technical Architecture"
   - Deployment overview: mode (Pilot/Production), connection type, total pumps, process count
   - The ARGOS architecture diagram rendered as an image (captured from SVG)
   - Infrastructure requirements summary

6. **Given** the architecture diagram is an SVG in the DOM, **When** it is captured for PDF, **Then** it renders as a high-quality image (2x scale) that fits within A4 page margins while preserving aspect ratio.

7. **Given** PDF generation fails, **When** an error occurs, **Then** the same retry logic applies (max 2 retries, escalated message after 3 attempts).

8. **Given** generation is triggered, **When** I measure performance, **Then** it completes within 5 seconds (NFR-P3) for up to 5 analyses.

## Tasks / Subtasks

- [x] Task 1: Create ExportCompleteReportButton component (AC: 1, 2, 3, 7)
  - [x] 1.1: Create `src/components/pdf/ExportCompleteReportButton.tsx` based on PDFExportButton pattern
  - [x] 1.2: Reuse same state machine (idle/generating/success), error handling, retry logic, toast, mount counter
  - [x] 1.3: Read fresh state via `useAppStore.getState()` including `deploymentMode` and `connectionType`
  - [x] 1.4: Capture SVG diagram from DOM before calling PDF generation
  - [x] 1.5: Use filename pattern `ARGOS-Complete-Proposal-YYYY-MM-DD.pdf`

- [x] Task 2: Implement SVG capture utility (AC: 6)
  - [x] 2.1: Create `captureDiagramAsImage()` function in `src/lib/pdf-generator.ts`
  - [x] 2.2: Use html2canvas with scale: 2 for high-quality capture
  - [x] 2.3: Target the ArchitectureDiagram SVG container via data-testid DOM query
  - [x] 2.4: Return image as data URL (PNG format)
  - [x] 2.5: Handle case where diagram is not in DOM (returns null, graceful degradation)

- [x] Task 3: Implement Part 2 sections in pdf-generator (AC: 5, 6)
  - [x] 3.1: Add `renderPartDivider()` function — full-page divider "Part 2: Technical Architecture"
  - [x] 3.2: Add `renderDeploymentOverview()` function — mode, connection type, pump count, process count
  - [x] 3.3: Add `renderArchitectureDiagramImage()` function — add captured image to PDF preserving aspect ratio
  - [x] 3.4: Add `renderInfrastructureRequirements()` function — network, connectivity, IT requirements based on deployment mode
  - [x] 3.5: Ensure proper page management between Part 2 sections

- [x] Task 4: Create generateCompletePDF orchestrator (AC: 4, 5, 8)
  - [x] 4.1: Add `generateCompletePDF()` function that extends `generatePDF()` with Part 2 sections
  - [x] 4.2: Parameters: analyses, globalParams, excludedFromGlobal, deploymentMode, connectionType, diagramImage, options
  - [x] 4.3: Section order: Cover → Exec Summary → Per-Process → Global Summary → Assumptions → Part 2 Divider → Deployment Overview → Architecture Diagram → Infrastructure
  - [x] 4.4: Update page numbering to include Part 2 pages
  - [x] 4.5: Performance: target <5s for 5 analyses + diagram

- [x] Task 5: Integrate into Solutions page (AC: 1)
  - [x] 5.1: Add ExportCompleteReportButton to `src/pages/Solutions.tsx`
  - [x] 5.2: Position in header area alongside existing elements

- [x] Task 6: Update barrel exports (AC: all)
  - [x] 6.1: Update `src/components/pdf/index.ts` to export ExportCompleteReportButton

- [x] Task 7: Write tests (~25-35 tests) (AC: all)
  - [x] 7.1: Create `src/components/pdf/ExportCompleteReportButton.test.tsx`
  - [x] 7.2: Test idle/generating/success states
  - [x] 7.3: Test disabled when no calculable analyses
  - [x] 7.4: Test filename pattern (ARGOS-Complete-Proposal-*)
  - [x] 7.5: Test error handling and retry logic
  - [x] 7.6: Test SVG capture error handling (diagram not in DOM)
  - [x] 7.7: Test Part 2 sections render in PDF (spy on jsPDF methods)
  - [x] 7.8: Test deployment mode content differences (Pilot vs Production)
  - [x] 7.9: Test connection type content differences
  - [x] 7.10: Test generateCompletePDF returns valid Blob
  - [x] 7.11: Test Part 2 divider page present
  - [x] 7.12: Integration test with Solutions page placement

## Dev Notes

### Architecture & Design

**Component Pattern:** Follow PDFExportButton exactly — same state machine, error handling, retry, toast, mount counter. The only differences:
- Calls `generateCompletePDF()` instead of `generatePDF()`
- Captures SVG diagram before calling PDF generation
- Different filename pattern
- Reads `deploymentMode` and `connectionType` from store

**SVG Capture Strategy:**
```typescript
import html2canvas from 'html2canvas';

export async function captureDiagramAsImage(
  svgContainer: HTMLElement
): Promise<string> {
  const canvas = await html2canvas(svgContainer, {
    scale: 2,
    backgroundColor: '#FFFFFF',
    logging: false,
  });
  return canvas.toDataURL('image/png');
}
```

The SVG container can be found via:
- Option A: `document.getElementById('architecture-diagram')` (add id to ArchitectureDiagram container)
- Option B: `document.querySelector('[data-testid="architecture-diagram"]')` (add data-testid)
- Option C: Pass a ref from Solutions page to the button

**Preferred approach:** Add a `data-testid="architecture-diagram"` to the ArchitectureDiagram wrapper div, then use DOM query in the button handler. This avoids prop drilling and ref forwarding.

**generateCompletePDF Function:**
```typescript
export interface CompletePDFOptions extends PDFOptions {
  deploymentMode: DeploymentMode;
  connectionType: ConnectionType;
  diagramImage?: string;  // data URL from html2canvas, optional if not captured
  totalPumps: number;
  processCount: number;
}

export async function generateCompletePDF(
  analyses: Analysis[],
  globalParams: GlobalParams,
  excludedFromGlobal: Set<string>,
  options: CompletePDFOptions,
): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Part 1: ROI Analysis (reuse existing section renderers)
  // ... same as generatePDF

  // Part 2: Technical Architecture
  renderPartDivider(doc, ctx, 'Part 2: Technical Architecture');
  renderDeploymentOverview(doc, ctx, options);
  if (options.diagramImage) {
    renderArchitectureDiagramImage(doc, ctx, options.diagramImage);
  }
  renderInfrastructureRequirements(doc, ctx, options);

  // Finalize page numbers
  // ...

  return doc.output('blob') as Blob;
}
```

**Part 2 Content — Deployment Overview:**
- Deployment Mode: Pilot / Production
- Connection Type: Ethernet / RS-485 / WiFi
- Total Pumps Monitored: {totalPumps}
- Processes Covered: {processCount}
- Deployment timeline info (Pilot: 2-4 weeks, Production: 6-8 weeks)

**Part 2 Content — Infrastructure Requirements:**
Pilot mode:
- 1 MicroPC per pump cluster
- Direct local connection
- Minimal IT involvement

Production mode:
- Central server in Sub Fab
- Network infrastructure (based on connection type)
- IT integration requirements
- ARGOS Cloud connectivity

**Image Sizing in PDF:**
```typescript
function renderArchitectureDiagramImage(doc, ctx, imageDataUrl) {
  const maxWidth = PDF_LAYOUT.contentWidth;  // 170mm
  const maxHeight = 180;  // mm, leave room for margins
  // Calculate aspect ratio from original SVG viewBox (1400 x dynamic height)
  // Fit within max bounds preserving ratio
  const imgProps = doc.getImageProperties(imageDataUrl);
  const ratio = imgProps.width / imgProps.height;
  let width = maxWidth;
  let height = width / ratio;
  if (height > maxHeight) {
    height = maxHeight;
    width = height * ratio;
  }
  const x = PDF_LAYOUT.marginLeft + (PDF_LAYOUT.contentWidth - width) / 2;
  doc.addImage(imageDataUrl, 'PNG', x, ctx.currentY, width, height);
}
```

### File Structure

```
NEW files:
├── src/components/pdf/ExportCompleteReportButton.tsx
├── src/components/pdf/ExportCompleteReportButton.test.tsx

MODIFIED files:
├── src/lib/pdf-generator.ts              # Add Part 2 sections + generateCompletePDF
├── src/lib/pdf-generator.test.ts         # Add Part 2 tests
├── src/components/pdf/index.ts           # Update barrel export
├── src/pages/Solutions.tsx               # Add ExportCompleteReportButton
├── src/components/solutions/diagram/ArchitectureDiagram.tsx  # Add data-testid
```

### Existing Patterns to Follow

- **PDFExportButton:** Same state machine, error handling, retry, toast pattern
- **generatePDF:** Same section-renderer pattern (pure functions, Y position tracking)
- **addTable/addHeading/etc:** Reuse all typography and layout helpers
- **Page management:** Use ensureSpace() for page breaks

### Testing Patterns

- **Mock html2canvas:** `vi.mock('html2canvas')` — return a mock canvas with toDataURL
- **Mock jsPDF:** Spy on prototype methods or use the actual library
- **Mock DOM:** For SVG capture tests, mock `document.querySelector`
- **Store setup:** `useAppStore.setState({ deploymentMode: 'pilot', connectionType: 'ethernet', ... })`

### Critical Guardrails

- **NO console.log in production code**
- **Named exports ONLY**
- **Pure functions** for PDF section renderers
- **Dynamic import** for jsPDF AND html2canvas (code splitting)
- **Memory management** — revoke blob URLs, clean up canvas
- **Graceful degradation** — if SVG capture fails, generate PDF without diagram image (show placeholder text)
- **Performance** — <5s target. html2canvas is the bottleneck (~1-2s for SVG capture)

### Previous Story Intelligence

- **Story 5.1-5.4:** Complete PDF pipeline exists. Reuse everything.
- **Story 6.4:** Architecture diagram is SVG-based with dynamic height. viewBox is `0 0 1400 {dynamic}`.
- **html2canvas 1.4:** Already installed in dependencies.
- **jsPDF addImage:** Supports PNG data URLs. Use `doc.getImageProperties()` for dimensions.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 6.5]
- [Source: argos-roi-calculator/src/lib/pdf-generator.ts] — Existing PDF engine
- [Source: argos-roi-calculator/src/components/pdf/PDFExportButton.tsx] — Button pattern
- [Source: argos-roi-calculator/src/components/solutions/diagram/ArchitectureDiagram.tsx] — SVG diagram
- [Source: argos-roi-calculator/src/pages/Solutions.tsx] — Solutions page

### Estimated Effort

- Development: ~2.5h
- Testing: ~1.5h
- Code review: ~30min
- **Total: ~4.5h**
- **Test estimate: 25-35 tests**

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None

### Completion Notes List

- All 7 tasks completed successfully
- 78 new tests added (37 in ExportCompleteReportButton.test.tsx + 41 in pdf-generator.test.ts)
- Total test count: 1510 (1506 passing, 4 pre-existing failures in AnalysisRename.integration.test.tsx)
- No console.log in production code
- Named exports only
- Dynamic imports for jsPDF and html2canvas
- Graceful degradation: if SVG capture fails, PDF shows "Diagram not available" placeholder
- Performance test confirms <5s for 5 analyses

### File List

NEW files:
- `src/components/pdf/ExportCompleteReportButton.tsx` — Button component with state machine, retry logic, toast
- `src/components/pdf/ExportCompleteReportButton.test.tsx` — 37 tests for button behavior

MODIFIED files:
- `src/lib/pdf-generator.ts` — Added Part 2 section renderers, generateCompletePDF, captureDiagramAsImage, generateCompleteFilename, CompletePDFOptions type
- `src/lib/pdf-generator.test.ts` — Added 41 tests for Part 2 sections and generateCompletePDF
- `src/components/pdf/index.ts` — Updated barrel export to include ExportCompleteReportButton
- `src/pages/Solutions.tsx` — Added ExportCompleteReportButton in header area
- `src/components/solutions/diagram/ArchitectureDiagram.tsx` — Added data-testid="architecture-diagram"
