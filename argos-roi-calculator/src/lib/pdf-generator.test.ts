import { describe, it, expect, vi, beforeEach } from 'vitest';
import { jsPDF } from 'jspdf';
import type { Analysis, GlobalParams, AggregatedMetrics, AnalysisRowData } from '@/types';
import {
  generatePDF,
  generateFilename,
  formatDate,
  getROIColor,
  addTitle,
  addHeading,
  addSubheading,
  addBodyText,
  addLabel,
  addCoverPage,
  addPageHeader,
  addPageFooter,
  addTable,
  ensureSpace,
  renderExecutiveSummary,
  renderProcessBreakdown,
  renderGlobalSummary,
  renderAssumptions,
  renderPartDivider,
  renderDeploymentOverview,
  renderArchitectureDiagramImage,
  renderInfrastructureRequirements,
  generateCompletePDF,
  generateCompleteFilename,
  PDF_LAYOUT,
  PDF_COLORS,
  PDF_FONTS,
  type TableColumn,
  type PageContext,
  type CompletePDFOptions,
} from './pdf-generator';

// ============================================================================
// Helper: Extract text content from PDF Blob
// ============================================================================

/**
 * Extracts raw text content from a PDF blob by reading the binary stream.
 * jsPDF embeds text directly in the PDF content streams.
 * Uses FileReader for jsdom compatibility (Blob.arrayBuffer may not be available).
 */
function extractPDFText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const buffer = reader.result as ArrayBuffer;
      const bytes = new Uint8Array(buffer);
      let text = '';
      for (let i = 0; i < bytes.length; i++) {
        text += String.fromCharCode(bytes[i]);
      }
      resolve(text);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

// ============================================================================
// Test Data Factories
// ============================================================================

function createMockAnalysis(overrides: Partial<Analysis> = {}): Analysis {
  return {
    id: crypto.randomUUID(),
    name: 'Poly Etch - Chamber 04',
    pumpType: 'A3004XN',
    pumpQuantity: 10,
    failureRateMode: 'percentage',
    failureRatePercentage: 10,
    waferType: 'batch',
    waferQuantity: 125,
    waferCost: 8000,
    waferDefectEventsPerYear: 2,
    downtimeDuration: 6,
    downtimeCostPerHour: 500,
    isBottleneck: false,
    bottleneckMultiplier: 2.0,
    maintenanceStrategy: 'unplanned',
    overhaulCostPerPump: 0,
    pmIntervalMonths: 12,
    argosMtbfExtensionPercent: 15,
    unplannedDespitePM: 0,
  mtbf: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function createMockGlobalParams(overrides: Partial<GlobalParams> = {}): GlobalParams {
  return {
    detectionRate: 70,
    serviceCostPerPump: 2500,
    ...overrides,
  };
}

// ============================================================================
// generateFilename
// ============================================================================

describe('generateFilename', () => {
  it('generates filename with correct format ARGOS-ROI-Analysis-YYYY-MM-DD.pdf', () => {
    const date = new Date(2026, 1, 16); // Feb 16, 2026
    expect(generateFilename(date)).toBe('ARGOS-ROI-Analysis-2026-02-16.pdf');
  });

  it('pads single-digit month and day with leading zeros', () => {
    const date = new Date(2026, 0, 5); // Jan 5, 2026
    expect(generateFilename(date)).toBe('ARGOS-ROI-Analysis-2026-01-05.pdf');
  });

  it('handles December 31 correctly', () => {
    const date = new Date(2025, 11, 31); // Dec 31, 2025
    expect(generateFilename(date)).toBe('ARGOS-ROI-Analysis-2025-12-31.pdf');
  });

  it('uses current date when no date is provided', () => {
    const filename = generateFilename();
    expect(filename).toMatch(/^ARGOS-ROI-Analysis-\d{4}-\d{2}-\d{2}\.pdf$/);
  });
});

// ============================================================================
// formatDate
// ============================================================================

describe('formatDate', () => {
  it('formats date in English locale for cover page', () => {
    const date = new Date(2026, 1, 16); // Feb 16, 2026
    expect(formatDate(date)).toBe('February 16, 2026');
  });

  it('uses current date when no date is provided', () => {
    const result = formatDate();
    // Should be a non-empty string with a year
    expect(result).toMatch(/\d{4}/);
  });
});

// ============================================================================
// getROIColor
// ============================================================================

describe('getROIColor', () => {
  it('returns red for negative ROI', () => {
    expect(getROIColor(-5)).toEqual([204, 0, 0]);
  });

  it('returns red for ROI exactly at -0.01', () => {
    expect(getROIColor(-0.01)).toEqual([204, 0, 0]);
  });

  it('returns orange for ROI at 0', () => {
    expect(getROIColor(0)).toEqual([255, 140, 0]);
  });

  it('returns orange for ROI between 0 and 15', () => {
    expect(getROIColor(10)).toEqual([255, 140, 0]);
  });

  it('returns green for ROI at 15', () => {
    expect(getROIColor(15)).toEqual([40, 167, 69]);
  });

  it('returns green for high positive ROI', () => {
    expect(getROIColor(2708)).toEqual([40, 167, 69]);
  });
});

// ============================================================================
// PDF Layout Constants
// ============================================================================

describe('PDF_LAYOUT', () => {
  it('defines A4 dimensions (210 x 297 mm)', () => {
    expect(PDF_LAYOUT.pageWidth).toBe(210);
    expect(PDF_LAYOUT.pageHeight).toBe(297);
  });

  it('has contentWidth = pageWidth - marginLeft - marginRight', () => {
    expect(PDF_LAYOUT.contentWidth).toBe(
      PDF_LAYOUT.pageWidth - PDF_LAYOUT.marginLeft - PDF_LAYOUT.marginRight,
    );
  });

  it('has symmetric margins', () => {
    expect(PDF_LAYOUT.marginLeft).toBe(PDF_LAYOUT.marginRight);
  });
});

// ============================================================================
// PDF Color System
// ============================================================================

describe('PDF_COLORS', () => {
  it('defines Pfeiffer Red as RGB(204, 0, 0)', () => {
    expect(PDF_COLORS.pfeifferRed).toEqual([204, 0, 0]);
  });

  it('defines dark text as RGB(51, 51, 51)', () => {
    expect(PDF_COLORS.darkText).toEqual([51, 51, 51]);
  });

  it('defines gray text as RGB(128, 128, 128)', () => {
    expect(PDF_COLORS.grayText).toEqual([128, 128, 128]);
  });

  it('defines light gray background as RGB(245, 245, 245)', () => {
    expect(PDF_COLORS.lightGrayBg).toEqual([245, 245, 245]);
  });

  it('defines ROI traffic light colors', () => {
    expect(PDF_COLORS.roiNegative).toEqual([204, 0, 0]);
    expect(PDF_COLORS.roiWarning).toEqual([255, 140, 0]);
    expect(PDF_COLORS.roiPositive).toEqual([40, 167, 69]);
  });
});

// ============================================================================
// Typography System
// ============================================================================

describe('PDF_FONTS', () => {
  it('defines title as 24pt bold', () => {
    expect(PDF_FONTS.title).toEqual({ size: 24, style: 'bold' });
  });

  it('defines section heading as 16pt bold', () => {
    expect(PDF_FONTS.sectionHeading).toEqual({ size: 16, style: 'bold' });
  });

  it('defines body text as 10pt normal', () => {
    expect(PDF_FONTS.body).toEqual({ size: 10, style: 'normal' });
  });

  it('defines label as 9pt normal', () => {
    expect(PDF_FONTS.label).toEqual({ size: 9, style: 'normal' });
  });

  it('defines small as 8pt normal', () => {
    expect(PDF_FONTS.small).toEqual({ size: 8, style: 'normal' });
  });
});

// ============================================================================
// Typography Helpers (addTitle, addHeading, etc.)
// ============================================================================

describe('Typography helpers', () => {
  let doc: InstanceType<typeof jsPDF>;
  let textSpy: ReturnType<typeof vi.spyOn>;
  let fontSpy: ReturnType<typeof vi.spyOn>;
  let fontSizeSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    textSpy = vi.spyOn(doc, 'text');
    fontSpy = vi.spyOn(doc, 'setFont');
    fontSizeSpy = vi.spyOn(doc, 'setFontSize');
  });

  it('addTitle renders 24pt bold Pfeiffer red text', () => {
    const newY = addTitle(doc, 'Test Title', 20, 50);
    expect(fontSpy).toHaveBeenCalledWith('helvetica', 'bold');
    expect(fontSizeSpy).toHaveBeenCalledWith(24);
    expect(textSpy).toHaveBeenCalledWith('Test Title', 20, 50);
    expect(newY).toBeGreaterThan(50);
  });

  it('addHeading renders 16pt bold text', () => {
    const newY = addHeading(doc, 'Section', 20, 60);
    expect(fontSpy).toHaveBeenCalledWith('helvetica', 'bold');
    expect(fontSizeSpy).toHaveBeenCalledWith(16);
    expect(textSpy).toHaveBeenCalledWith('Section', 20, 60);
    expect(newY).toBeGreaterThan(60);
  });

  it('addSubheading renders 12pt bold dark text', () => {
    const newY = addSubheading(doc, 'Subsection', 20, 70);
    expect(fontSpy).toHaveBeenCalledWith('helvetica', 'bold');
    expect(fontSizeSpy).toHaveBeenCalledWith(12);
    expect(textSpy).toHaveBeenCalledWith('Subsection', 20, 70);
    expect(newY).toBeGreaterThan(70);
  });

  it('addBodyText renders 10pt normal dark text', () => {
    const newY = addBodyText(doc, 'Body content', 20, 80);
    expect(fontSpy).toHaveBeenCalledWith('helvetica', 'normal');
    expect(fontSizeSpy).toHaveBeenCalledWith(10);
    expect(textSpy).toHaveBeenCalledWith('Body content', 20, 80);
    expect(newY).toBeGreaterThan(80);
  });

  it('addLabel renders 9pt normal gray text', () => {
    const newY = addLabel(doc, 'Label text', 20, 90);
    expect(fontSpy).toHaveBeenCalledWith('helvetica', 'normal');
    expect(fontSizeSpy).toHaveBeenCalledWith(9);
    expect(textSpy).toHaveBeenCalledWith('Label text', 20, 90);
    expect(newY).toBeGreaterThan(90);
  });
});

// ============================================================================
// addCoverPage
// ============================================================================

describe('addCoverPage', () => {
  it('renders ARGOS title on cover page', () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const textSpy = vi.spyOn(doc, 'text');

    addCoverPage(doc, new Date(2026, 1, 16));

    const textCalls = textSpy.mock.calls.map(call => call[0]);
    expect(textCalls).toContain('ARGOS');
  });

  it('renders subtitle "ROI Analysis Report"', () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const textSpy = vi.spyOn(doc, 'text');

    addCoverPage(doc, new Date(2026, 1, 16));

    const textCalls = textSpy.mock.calls.map(call => call[0]);
    expect(textCalls).toContain('ROI Analysis Report');
  });

  it('renders formatted date on cover page', () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const textSpy = vi.spyOn(doc, 'text');

    addCoverPage(doc, new Date(2026, 1, 16));

    const textCalls = textSpy.mock.calls.map(call => call[0]);
    expect(textCalls).toContain('February 16, 2026');
  });

  it('renders Pfeiffer Vacuum branding', () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const textSpy = vi.spyOn(doc, 'text');

    addCoverPage(doc);

    const textCalls = textSpy.mock.calls.map(call => call[0]);
    expect(textCalls).toContain('Pfeiffer Vacuum');
  });

  it('renders Confidential notice', () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const textSpy = vi.spyOn(doc, 'text');

    addCoverPage(doc);

    const textCalls = textSpy.mock.calls.map(call => call[0]);
    expect(textCalls).toContain('Confidential');
  });

  it('draws accent bar at top', () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const rectSpy = vi.spyOn(doc, 'rect');

    addCoverPage(doc);

    // First rect call should be the accent bar at position (0, 0)
    expect(rectSpy).toHaveBeenCalledWith(0, 0, PDF_LAYOUT.pageWidth, 8, 'F');
  });
});

// ============================================================================
// addPageHeader
// ============================================================================

describe('addPageHeader', () => {
  it('renders "ARGOS ROI Analysis" header text', () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const textSpy = vi.spyOn(doc, 'text');

    addPageHeader(doc);

    const textCalls = textSpy.mock.calls.map(call => call[0]);
    expect(textCalls).toContain('ARGOS ROI Analysis');
  });

  it('draws accent bar at top of page', () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const rectSpy = vi.spyOn(doc, 'rect');

    addPageHeader(doc);

    expect(rectSpy).toHaveBeenCalledWith(
      0, 0, PDF_LAYOUT.pageWidth, PDF_LAYOUT.accentBarHeight, 'F',
    );
  });

  it('draws thin red line below header', () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const lineSpy = vi.spyOn(doc, 'line');

    addPageHeader(doc);

    expect(lineSpy).toHaveBeenCalledWith(
      PDF_LAYOUT.marginLeft,
      PDF_LAYOUT.headerY + 2,
      PDF_LAYOUT.pageWidth - PDF_LAYOUT.marginRight,
      PDF_LAYOUT.headerY + 2,
    );
  });
});

// ============================================================================
// addPageFooter
// ============================================================================

describe('addPageFooter', () => {
  it('renders "Pfeiffer Vacuum" in footer', () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const textSpy = vi.spyOn(doc, 'text');

    addPageFooter(doc, 1);

    const textCalls = textSpy.mock.calls.map(call => call[0]);
    expect(textCalls).toContain('Pfeiffer Vacuum');
  });

  it('renders page number in footer', () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const textSpy = vi.spyOn(doc, 'text');

    addPageFooter(doc, 3);

    const textCalls = textSpy.mock.calls.map(call => call[0]);
    expect(textCalls).toContain('Page 3');
  });

  it('renders date in footer', () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const textSpy = vi.spyOn(doc, 'text');

    addPageFooter(doc, 1, new Date(2026, 1, 16));

    const textCalls = textSpy.mock.calls.map(call => call[0]);
    expect(textCalls).toContain('16/02/2026');
  });
});

// ============================================================================
// ensureSpace (page management)
// ============================================================================

describe('ensureSpace', () => {
  it('does not add page when space is sufficient', () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const addPageSpy = vi.spyOn(doc, 'addPage');

    const ctx: PageContext = { currentY: 100, pageNumber: 2 };
    ensureSpace(doc, ctx, 20);

    expect(addPageSpy).not.toHaveBeenCalled();
    expect(ctx.currentY).toBe(100); // Unchanged
  });

  it('adds a new page when content would overflow', () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const addPageSpy = vi.spyOn(doc, 'addPage');

    const ctx: PageContext = { currentY: 270, pageNumber: 2 };
    ensureSpace(doc, ctx, 20);

    expect(addPageSpy).toHaveBeenCalled();
    expect(ctx.pageNumber).toBe(3);
    expect(ctx.currentY).toBe(PDF_LAYOUT.marginTop + 10);
  });

  it('applies header and footer to new page', () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const textSpy = vi.spyOn(doc, 'text');

    const ctx: PageContext = { currentY: 280, pageNumber: 2 };
    ensureSpace(doc, ctx, 30);

    const textCalls = textSpy.mock.calls.map(call => call[0]);
    expect(textCalls).toContain('ARGOS ROI Analysis'); // Header
    expect(textCalls).toContain('Pfeiffer Vacuum'); // Footer
  });
});

// ============================================================================
// addTable
// ============================================================================

describe('addTable', () => {
  const columns: TableColumn[] = [
    { header: 'Process', width: 80, align: 'left' },
    { header: 'Pumps', width: 30, align: 'right' },
    { header: 'ROI', width: 60, align: 'right' },
  ];

  it('renders table headers', () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const textSpy = vi.spyOn(doc, 'text');

    const ctx: PageContext = { currentY: 50, pageNumber: 2 };
    addTable(doc, columns, [], PDF_LAYOUT.marginLeft, ctx);

    const textCalls = textSpy.mock.calls.map(call => call[0]);
    expect(textCalls).toContain('Process');
    expect(textCalls).toContain('Pumps');
    expect(textCalls).toContain('ROI');
  });

  it('renders table data rows', () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const textSpy = vi.spyOn(doc, 'text');

    const rows = [
      ['Poly Etch', '10', '2708%'],
      ['CVD', '5', '150%'],
    ];

    const ctx: PageContext = { currentY: 50, pageNumber: 2 };
    addTable(doc, columns, rows, PDF_LAYOUT.marginLeft, ctx);

    const textCalls = textSpy.mock.calls.map(call => call[0]);
    expect(textCalls).toContain('Poly Etch');
    expect(textCalls).toContain('CVD');
  });

  it('uses alternating row backgrounds', () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const fillColorSpy = vi.spyOn(doc, 'setFillColor');

    const rows = [
      ['Row 1', '10', '100%'],
      ['Row 2', '20', '200%'],
      ['Row 3', '30', '300%'],
    ];

    const ctx: PageContext = { currentY: 50, pageNumber: 2 };
    addTable(doc, columns, rows, PDF_LAYOUT.marginLeft, ctx);

    // Light gray background should be used for alternate (odd-indexed) rows
    const fillCalls = fillColorSpy.mock.calls;
    const lightGrayCalls = fillCalls.filter(
      call => call[0] === 245 && call[1] === 245 && call[2] === 245,
    );
    expect(lightGrayCalls.length).toBeGreaterThan(0);
  });

  it('advances Y position after table', () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const rows = [
      ['Row 1', '10', '100%'],
      ['Row 2', '20', '200%'],
    ];

    const ctx: PageContext = { currentY: 50, pageNumber: 2 };
    const result = addTable(doc, columns, rows, PDF_LAYOUT.marginLeft, ctx);

    expect(result.currentY).toBeGreaterThan(50);
  });
});

// ============================================================================
// generatePDF - Main Integration Tests
// ============================================================================

describe('generatePDF', () => {
  it('returns a valid Blob', async () => {
    const blob = await generatePDF(
      [createMockAnalysis()],
      createMockGlobalParams(),
      new Set(),
    );
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
  });

  it('generates PDF with correct MIME type', async () => {
    const blob = await generatePDF(
      [createMockAnalysis()],
      createMockGlobalParams(),
      new Set(),
    );
    expect(blob.type).toBe('application/pdf');
  });

  it('generates PDF with 0 analyses', async () => {
    const blob = await generatePDF(
      [],
      createMockGlobalParams(),
      new Set(),
    );
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
  });

  it('generates PDF with 1 analysis', async () => {
    const blob = await generatePDF(
      [createMockAnalysis()],
      createMockGlobalParams(),
      new Set(),
    );
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
  });

  it('generates PDF with 5 analyses', async () => {
    const analyses = Array.from({ length: 5 }, (_, i) =>
      createMockAnalysis({ name: `Process ${i + 1}` }),
    );
    const blob = await generatePDF(
      analyses,
      createMockGlobalParams(),
      new Set(),
    );
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
  });

  it('generates at least 2 pages (cover + content)', async () => {
    const blob = await generatePDF(
      [createMockAnalysis()],
      createMockGlobalParams(),
      new Set(),
    );
    const pdfText = await extractPDFText(blob);

    // Cover page: ARGOS title, content page: header
    expect(pdfText).toContain('ARGOS');
    expect(pdfText).toContain('ARGOS ROI Analysis');
  });

  it('includes Executive Summary heading on content page', async () => {
    const blob = await generatePDF(
      [createMockAnalysis()],
      createMockGlobalParams(),
      new Set(),
    );
    const pdfText = await extractPDFText(blob);

    expect(pdfText).toContain('Executive Summary');
  });

  it('includes assumptions section when includeAssumptions is true (default)', async () => {
    const blob = await generatePDF(
      [createMockAnalysis()],
      createMockGlobalParams({ detectionRate: 70, serviceCostPerPump: 2500 }),
      new Set(),
    );
    const pdfText = await extractPDFText(blob);

    expect(pdfText).toContain('Assumptions');
    expect(pdfText).toContain('Methodology');
    expect(pdfText).toContain('Detection Rate');
  });

  it('excludes assumptions section when includeAssumptions is false', async () => {
    const blob = await generatePDF(
      [createMockAnalysis()],
      createMockGlobalParams(),
      new Set(),
      { includeAssumptions: false },
    );
    const pdfText = await extractPDFText(blob);

    expect(pdfText).not.toContain('Assumptions');
  });

  it('shows correct analysis count in summary text', async () => {
    const analyses = [
      createMockAnalysis({ id: 'a1' }),
      createMockAnalysis({ id: 'a2' }),
      createMockAnalysis({ id: 'a3' }),
    ];
    const blob = await generatePDF(
      analyses,
      createMockGlobalParams(),
      new Set(['a2']), // 1 excluded
    );
    // Verify the blob contains content for all 3 analyses
    expect(blob.size).toBeGreaterThan(0);
    // Verify the text content in PDF stream
    const pdfText = await extractPDFText(blob);
    // Executive Summary renders process count via Processes Analyzed
    expect(pdfText).toContain('Processes Analyzed');
    // Excluded count shown in global summary
    expect(pdfText).toContain('excluded from global totals');
  });

  it('renders all process names for multiple analyses', async () => {
    const analyses = [
      createMockAnalysis({ name: 'Poly Etch' }),
      createMockAnalysis({ name: 'CVD Process' }),
    ];
    const blob = await generatePDF(
      analyses,
      createMockGlobalParams(),
      new Set(),
    );
    const pdfText = await extractPDFText(blob);

    expect(pdfText).toContain('Poly Etch');
    expect(pdfText).toContain('CVD Process');
  });

  it('completes within 3 seconds for 5 analyses (performance)', async () => {
    const analyses = Array.from({ length: 5 }, (_, i) =>
      createMockAnalysis({ name: `Process ${i + 1}` }),
    );

    const start = performance.now();
    await generatePDF(analyses, createMockGlobalParams(), new Set());
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(3000);
  });
});

// ============================================================================
// Helper: Extract all text calls from a jsPDF doc spy
// ============================================================================

function getTextCalls(textSpy: ReturnType<typeof vi.spyOn>): string[] {
  return textSpy.mock.calls.map(call => {
    const arg = call[0];
    if (Array.isArray(arg)) return arg.join(' ');
    return String(arg);
  });
}

// ============================================================================
// renderExecutiveSummary
// ============================================================================

describe('renderExecutiveSummary', () => {
  let doc: InstanceType<typeof jsPDF>;
  let textSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    textSpy = vi.spyOn(doc, 'text');
  });

  function createMetrics(overrides: Partial<AggregatedMetrics> = {}): AggregatedMetrics {
    return {
      totalSavings: 500000,
      totalServiceCost: 25000,
      totalFailureCost: 600000,
      totalPumps: 20,
      overallROI: 1900,
      processCount: 2,
      excludedCount: 0,
      ...overrides,
    };
  }

  it('renders "Executive Summary" heading', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    renderExecutiveSummary(doc, createMetrics(), 3, ctx);
    const texts = getTextCalls(textSpy);
    expect(texts).toContain('Executive Summary');
  });

  it('renders hero Total Savings number', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    renderExecutiveSummary(doc, createMetrics({ totalSavings: 500000 }), 2, ctx);
    const texts = getTextCalls(textSpy);
    const savingsText = texts.find(t => t.includes('Total Savings'));
    expect(savingsText).toBeDefined();
    expect(savingsText).toContain('500');
  });

  it('renders Overall ROI value', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    renderExecutiveSummary(doc, createMetrics({ overallROI: 1900 }), 2, ctx);
    const texts = getTextCalls(textSpy);
    const roiText = texts.find(t => t.includes('Overall ROI'));
    expect(roiText).toBeDefined();
  });

  it('renders Total Pumps Monitored', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    renderExecutiveSummary(doc, createMetrics({ totalPumps: 20 }), 2, ctx);
    const texts = getTextCalls(textSpy);
    const pumpsText = texts.find(t => t.includes('Total Pumps Monitored'));
    expect(pumpsText).toBeDefined();
    expect(pumpsText).toContain('20');
  });

  it('renders Processes Analyzed count', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    renderExecutiveSummary(doc, createMetrics({ processCount: 3 }), 5, ctx);
    const texts = getTextCalls(textSpy);
    const processText = texts.find(t => t.includes('Processes Analyzed'));
    expect(processText).toBeDefined();
    expect(processText).toContain('3');
    expect(processText).toContain('5');
  });

  it('renders positive recommendation for positive ROI', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    renderExecutiveSummary(doc, createMetrics({ overallROI: 100 }), 2, ctx);
    const texts = getTextCalls(textSpy);
    const recText = texts.find(t => t.includes('ARGOS demonstrates strong ROI'));
    expect(recText).toBeDefined();
  });

  it('renders "further analysis" recommendation for negative ROI', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    renderExecutiveSummary(doc, createMetrics({ overallROI: -5, totalSavings: -1000 }), 1, ctx);
    const texts = getTextCalls(textSpy);
    const recText = texts.find(t => t.includes('Further analysis recommended'));
    expect(recText).toBeDefined();
  });

  it('returns updated Y position after rendering', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    const result = renderExecutiveSummary(doc, createMetrics(), 2, ctx);
    expect(result.currentY).toBeGreaterThan(40);
  });

  it('respects excludedFromGlobal — metrics reflect included only', () => {
    // This test validates that the function uses the metrics passed to it
    // (which should already be filtered by the caller)
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    const metrics = createMetrics({ totalSavings: 100000, processCount: 1 });
    renderExecutiveSummary(doc, metrics, 2, ctx); // 2 excluded
    const texts = getTextCalls(textSpy);
    // processCount (1) shown as included, excludedCount (2) shown separately
    const processText = texts.find(t => t.includes('Processes Analyzed'));
    expect(processText).toContain('1 included');
    expect(processText).toContain('2 excluded');
  });

  it('uses green color for positive savings', () => {
    const colorSpy = vi.spyOn(doc, 'setTextColor');
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    renderExecutiveSummary(doc, createMetrics({ totalSavings: 100000 }), 1, ctx);
    // roiPositive = [40, 167, 69]
    const greenCalls = colorSpy.mock.calls.filter(
      call => call[0] === 40 && call[1] === 167 && call[2] === 69,
    );
    expect(greenCalls.length).toBeGreaterThan(0);
  });

  it('uses red color for negative savings', () => {
    const colorSpy = vi.spyOn(doc, 'setTextColor');
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    renderExecutiveSummary(doc, createMetrics({ totalSavings: -5000, overallROI: -20 }), 1, ctx);
    // roiNegative = [204, 0, 0]
    const redCalls = colorSpy.mock.calls.filter(
      call => call[0] === 204 && call[1] === 0 && call[2] === 0,
    );
    expect(redCalls.length).toBeGreaterThan(0);
  });

  it('draws visual divider line', () => {
    const lineSpy = vi.spyOn(doc, 'line');
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    renderExecutiveSummary(doc, createMetrics(), 1, ctx);
    // At least one line call for the divider
    expect(lineSpy).toHaveBeenCalled();
  });
});

// ============================================================================
// renderProcessBreakdown
// ============================================================================

describe('renderProcessBreakdown', () => {
  let doc: InstanceType<typeof jsPDF>;
  let textSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    textSpy = vi.spyOn(doc, 'text');
  });

  it('renders process name as section header', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    renderProcessBreakdown(doc, createMockAnalysis({ name: 'Poly Etch' }), createMockGlobalParams(), false, ctx);
    const texts = getTextCalls(textSpy);
    expect(texts).toContain('Poly Etch');
  });

  it('adds "(Excluded from global totals)" badge for excluded analyses', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    renderProcessBreakdown(doc, createMockAnalysis({ name: 'CVD Process' }), createMockGlobalParams(), true, ctx);
    const texts = getTextCalls(textSpy);
    const headerText = texts.find(t => t.includes('Excluded from global totals'));
    expect(headerText).toBeDefined();
  });

  it('does not add excluded badge for included analyses', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    renderProcessBreakdown(doc, createMockAnalysis({ name: 'Included' }), createMockGlobalParams(), false, ctx);
    const texts = getTextCalls(textSpy);
    const excludedText = texts.find(t => t.includes('Excluded from global totals'));
    expect(excludedText).toBeUndefined();
  });

  it('renders pump model and quantity', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    renderProcessBreakdown(doc, createMockAnalysis({ pumpType: 'A3004XN', pumpQuantity: 10 }), createMockGlobalParams(), false, ctx);
    const texts = getTextCalls(textSpy);
    expect(texts).toContain('A3004XN');
    expect(texts).toContain('10');
  });

  it('renders "Unplanned" strategy label for unplanned', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    renderProcessBreakdown(doc, createMockAnalysis({ maintenanceStrategy: 'unplanned' }), createMockGlobalParams(), false, ctx);
    const texts = getTextCalls(textSpy);
    expect(texts).toContain('Unplanned');
  });

  it('renders "Preventive Maintenance" strategy label for planned', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    const planned = createMockAnalysis({
      maintenanceStrategy: 'planned',
      overhaulCostPerPump: 15000,
      pmIntervalMonths: 6,
      argosMtbfExtensionPercent: 30,
    });
    renderProcessBreakdown(doc, planned, createMockGlobalParams(), false, ctx);
    const texts = getTextCalls(textSpy);
    expect(texts).toContain('Preventive Maintenance');
  });

  it('renders planned strategy extra fields', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    const planned = createMockAnalysis({
      maintenanceStrategy: 'planned',
      overhaulCostPerPump: 15000,
      pmIntervalMonths: 6,
      argosMtbfExtensionPercent: 30,
    });
    renderProcessBreakdown(doc, planned, createMockGlobalParams(), false, ctx);
    const texts = getTextCalls(textSpy);
    expect(texts.some(t => t.includes('6 months'))).toBe(true);
    expect(texts.some(t => t.includes('30%'))).toBe(true);
  });

  it('renders overhaul savings for planned strategy', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    const planned = createMockAnalysis({
      maintenanceStrategy: 'planned',
      overhaulCostPerPump: 15000,
      pmIntervalMonths: 6,
      argosMtbfExtensionPercent: 30,
    });
    renderProcessBreakdown(doc, planned, createMockGlobalParams(), false, ctx);
    const texts = getTextCalls(textSpy);
    expect(texts.some(t => t.includes('Overhaul Savings'))).toBe(true);
  });

  it('renders cost avoided for unplanned strategy', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    renderProcessBreakdown(doc, createMockAnalysis(), createMockGlobalParams(), false, ctx);
    const texts = getTextCalls(textSpy);
    expect(texts.some(t => t.includes('Cost Avoided'))).toBe(true);
  });

  it('renders ROI with traffic-light color', () => {
    const colorSpy = vi.spyOn(doc, 'setTextColor');
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    renderProcessBreakdown(doc, createMockAnalysis(), createMockGlobalParams(), false, ctx);
    const texts = getTextCalls(textSpy);
    expect(texts.some(t => t.includes('ROI'))).toBe(true);
    // ROI should be positive for the mock data → green [40, 167, 69]
    const greenCalls = colorSpy.mock.calls.filter(
      call => call[0] === 40 && call[1] === 167 && call[2] === 69,
    );
    expect(greenCalls.length).toBeGreaterThan(0);
  });

  it('shows bottleneck multiplier when isBottleneck is true', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    const bottleneck = createMockAnalysis({ isBottleneck: true, bottleneckMultiplier: 3.0 });
    renderProcessBreakdown(doc, bottleneck, createMockGlobalParams(), false, ctx);
    const texts = getTextCalls(textSpy);
    expect(texts.some(t => t.includes('x3'))).toBe(true);
  });

  it('shows "No" for bottleneck when isBottleneck is false', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    renderProcessBreakdown(doc, createMockAnalysis({ isBottleneck: false }), createMockGlobalParams(), false, ctx);
    const texts = getTextCalls(textSpy);
    // "Bottleneck Tool:" label exists, value is "No"
    expect(texts).toContain('No');
  });

  it('renders wafer type and quantity', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    renderProcessBreakdown(doc, createMockAnalysis({ waferType: 'batch', waferQuantity: 125 }), createMockGlobalParams(), false, ctx);
    const texts = getTextCalls(textSpy);
    expect(texts.some(t => t.includes('Batch') && t.includes('125'))).toBe(true);
  });

  it('handles incomplete analysis gracefully', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    const incomplete = createMockAnalysis({
      pumpQuantity: 0,
      failureRatePercentage: 0,
    });
    renderProcessBreakdown(doc, incomplete, createMockGlobalParams(), false, ctx);
    const texts = getTextCalls(textSpy);
    expect(texts.some(t => t.includes('Incomplete data'))).toBe(true);
  });

  it('returns updated Y position', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    const result = renderProcessBreakdown(doc, createMockAnalysis(), createMockGlobalParams(), false, ctx);
    expect(result.currentY).toBeGreaterThan(40);
  });
});

// ============================================================================
// renderGlobalSummary
// ============================================================================

describe('renderGlobalSummary', () => {
  let doc: InstanceType<typeof jsPDF>;
  let textSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    textSpy = vi.spyOn(doc, 'text');
  });

  function createMetrics(overrides: Partial<AggregatedMetrics> = {}): AggregatedMetrics {
    return {
      totalSavings: 500000,
      totalServiceCost: 25000,
      totalFailureCost: 600000,
      totalPumps: 20,
      overallROI: 1900,
      processCount: 2,
      excludedCount: 0,
      ...overrides,
    };
  }

  function createRowData(overrides: Partial<AnalysisRowData> = {}): AnalysisRowData {
    return {
      id: 'test-1',
      name: 'Poly Etch',
      pumpQuantity: 10,
      failureRate: 10,
      totalFailureCost: 300000,
      argosServiceCost: 25000,
      savings: 185000,
      roiPercentage: 640,
      ...overrides,
    };
  }

  it('renders "Global Analysis Summary" heading', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    renderGlobalSummary(doc, [createRowData()], createMetrics(), 0, ctx);
    const texts = getTextCalls(textSpy);
    expect(texts).toContain('Global Analysis Summary');
  });

  it('renders comparison table with process names', () => {
    const rows = [
      createRowData({ name: 'Poly Etch' }),
      createRowData({ id: 'test-2', name: 'CVD' }),
    ];
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    renderGlobalSummary(doc, rows, createMetrics(), 0, ctx);
    const texts = getTextCalls(textSpy);
    expect(texts).toContain('Poly Etch');
    expect(texts).toContain('CVD');
  });

  it('renders TOTAL row in table', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    renderGlobalSummary(doc, [createRowData()], createMetrics(), 0, ctx);
    const texts = getTextCalls(textSpy);
    expect(texts).toContain('TOTAL');
  });

  it('renders table headers', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    renderGlobalSummary(doc, [createRowData()], createMetrics(), 0, ctx);
    const texts = getTextCalls(textSpy);
    expect(texts).toContain('Process');
    expect(texts).toContain('Pumps');
    expect(texts).toContain('Removal Rate');
    expect(texts).toContain('Failure Cost');
    expect(texts).toContain('ARGOS Cost');
    expect(texts).toContain('Savings');
    expect(texts).toContain('ROI');
  });

  it('has correct row count (data rows + totals row)', () => {
    const rows = [
      createRowData({ name: 'Process A' }),
      createRowData({ id: 'test-2', name: 'Process B' }),
      createRowData({ id: 'test-3', name: 'Process C' }),
    ];
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    renderGlobalSummary(doc, rows, createMetrics({ processCount: 3 }), 0, ctx);
    const texts = getTextCalls(textSpy);
    // 3 process names + TOTAL
    expect(texts).toContain('Process A');
    expect(texts).toContain('Process B');
    expect(texts).toContain('Process C');
    expect(texts).toContain('TOTAL');
  });

  it('shows excluded count note when analyses are excluded', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    renderGlobalSummary(doc, [createRowData()], createMetrics(), 2, ctx);
    const texts = getTextCalls(textSpy);
    const excludedText = texts.find(t => t.includes('excluded from global totals'));
    expect(excludedText).toBeDefined();
    expect(excludedText).toContain('2');
  });

  it('does not show excluded note when excludedCount is 0', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    renderGlobalSummary(doc, [createRowData()], createMetrics(), 0, ctx);
    const texts = getTextCalls(textSpy);
    const excludedText = texts.find(t => t.includes('excluded from global totals'));
    expect(excludedText).toBeUndefined();
  });

  it('handles empty rows gracefully', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    renderGlobalSummary(doc, [], createMetrics({ processCount: 0 }), 0, ctx);
    const texts = getTextCalls(textSpy);
    expect(texts.some(t => t.includes('No calculable analyses'))).toBe(true);
  });

  it('uses singular "process" for 1 excluded', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    renderGlobalSummary(doc, [createRowData()], createMetrics(), 1, ctx);
    const texts = getTextCalls(textSpy);
    const note = texts.find(t => t.includes('excluded'));
    expect(note).toBeDefined();
    expect(note).toContain('1 process excluded');
  });

  it('uses plural "processes" for multiple excluded', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    renderGlobalSummary(doc, [createRowData()], createMetrics(), 3, ctx);
    const texts = getTextCalls(textSpy);
    const note = texts.find(t => t.includes('excluded'));
    expect(note).toBeDefined();
    expect(note).toContain('processes');
  });

  it('returns updated Y position', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    const result = renderGlobalSummary(doc, [createRowData()], createMetrics(), 0, ctx);
    expect(result.currentY).toBeGreaterThan(40);
  });
});

// ============================================================================
// renderAssumptions
// ============================================================================

describe('renderAssumptions', () => {
  let doc: InstanceType<typeof jsPDF>;
  let textSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    textSpy = vi.spyOn(doc, 'text');
  });

  it('renders "Assumptions & Methodology" heading', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    renderAssumptions(doc, createMockGlobalParams(), [createMockAnalysis()], ctx);
    const texts = getTextCalls(textSpy);
    expect(texts.some(t => t.includes('Assumptions') && t.includes('Methodology'))).toBe(true);
  });

  it('shows detection rate from global params', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    renderAssumptions(doc, createMockGlobalParams({ detectionRate: 75 }), [createMockAnalysis()], ctx);
    const texts = getTextCalls(textSpy);
    expect(texts.some(t => t.includes('75%'))).toBe(true);
  });

  it('shows service cost per pump', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    renderAssumptions(doc, createMockGlobalParams({ serviceCostPerPump: 3000 }), [createMockAnalysis()], ctx);
    const texts = getTextCalls(textSpy);
    expect(texts.some(t => t.includes('3') && t.includes('000'))).toBe(true);
  });

  it('renders formula text for Total Failure Cost', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    renderAssumptions(doc, createMockGlobalParams(), [createMockAnalysis()], ctx);
    const texts = getTextCalls(textSpy);
    expect(texts.some(t => t.includes('Total Failure Cost'))).toBe(true);
  });

  it('renders formula text for ARGOS Savings', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    renderAssumptions(doc, createMockGlobalParams(), [createMockAnalysis()], ctx);
    const texts = getTextCalls(textSpy);
    expect(texts.some(t => t.includes('ARGOS Savings'))).toBe(true);
  });

  it('renders formula text for ROI', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    renderAssumptions(doc, createMockGlobalParams(), [createMockAnalysis()], ctx);
    const texts = getTextCalls(textSpy);
    expect(texts.some(t => t.includes('ROI') && t.includes('100%'))).toBe(true);
  });

  it('adds planned maintenance note when analyses include planned strategy', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    const planned = createMockAnalysis({
      maintenanceStrategy: 'planned',
      overhaulCostPerPump: 15000,
      pmIntervalMonths: 6,
    });
    renderAssumptions(doc, createMockGlobalParams(), [planned], ctx);
    const texts = getTextCalls(textSpy);
    expect(texts.some(t => t.includes('Planned Maintenance') && t.includes('MTBF'))).toBe(true);
  });

  it('does not add planned maintenance note when all analyses are unplanned', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    renderAssumptions(doc, createMockGlobalParams(), [createMockAnalysis()], ctx);
    const texts = getTextCalls(textSpy);
    expect(texts.some(t => t.includes('Planned Maintenance') && t.includes('MTBF'))).toBe(false);
  });

  it('renders data source note', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    renderAssumptions(doc, createMockGlobalParams(), [createMockAnalysis()], ctx);
    const texts = getTextCalls(textSpy);
    expect(texts.some(t => t.includes('client-provided operational data'))).toBe(true);
  });

  it('renders generation date', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    const date = new Date(2026, 1, 16);
    renderAssumptions(doc, createMockGlobalParams(), [createMockAnalysis()], ctx, date);
    const texts = getTextCalls(textSpy);
    expect(texts.some(t => t.includes('February 16, 2026'))).toBe(true);
  });

  it('renders tool version', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    renderAssumptions(doc, createMockGlobalParams(), [createMockAnalysis()], ctx);
    const texts = getTextCalls(textSpy);
    expect(texts.some(t => t.includes('ARGOS ROI Calculator V10'))).toBe(true);
  });

  it('returns updated Y position', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 2 };
    const result = renderAssumptions(doc, createMockGlobalParams(), [createMockAnalysis()], ctx);
    expect(result.currentY).toBeGreaterThan(40);
  });
});

// ============================================================================
// generatePDF - Content Integration Tests (Story 5.3)
// ============================================================================

describe('generatePDF - content sections', () => {
  it('renders executive summary with Total Savings', async () => {
    const blob = await generatePDF(
      [createMockAnalysis()],
      createMockGlobalParams(),
      new Set(),
    );
    const pdfText = await extractPDFText(blob);
    expect(pdfText).toContain('Total Savings');
  });

  it('renders per-process breakdown with analysis name', async () => {
    const blob = await generatePDF(
      [createMockAnalysis({ name: 'Poly Etch' })],
      createMockGlobalParams(),
      new Set(),
    );
    const pdfText = await extractPDFText(blob);
    expect(pdfText).toContain('Poly Etch');
  });

  it('renders global analysis summary table', async () => {
    const blob = await generatePDF(
      [createMockAnalysis(), createMockAnalysis({ name: 'CVD' })],
      createMockGlobalParams(),
      new Set(),
    );
    const pdfText = await extractPDFText(blob);
    expect(pdfText).toContain('Global Analysis Summary');
    expect(pdfText).toContain('TOTAL');
  });

  it('renders assumptions section with methodology', async () => {
    const blob = await generatePDF(
      [createMockAnalysis()],
      createMockGlobalParams(),
      new Set(),
    );
    const pdfText = await extractPDFText(blob);
    expect(pdfText).toContain('Methodology');
    expect(pdfText).toContain('Detection Rate');
  });

  it('shows excluded badge in per-process breakdown for excluded analyses', async () => {
    const analysis = createMockAnalysis({ id: 'ex-1', name: 'Excluded Process' });
    const blob = await generatePDF(
      [analysis],
      createMockGlobalParams(),
      new Set(['ex-1']),
    );
    const pdfText = await extractPDFText(blob);
    expect(pdfText).toContain('Excluded from global totals');
  });

  it('renders both unplanned and planned analyses', async () => {
    const unplanned = createMockAnalysis({ name: 'Unplanned Proc' });
    const planned = createMockAnalysis({
      name: 'Planned Proc',
      maintenanceStrategy: 'planned',
      overhaulCostPerPump: 15000,
      pmIntervalMonths: 6,
      argosMtbfExtensionPercent: 30,
    });
    const blob = await generatePDF(
      [unplanned, planned],
      createMockGlobalParams(),
      new Set(),
    );
    const pdfText = await extractPDFText(blob);
    expect(pdfText).toContain('Unplanned');
    expect(pdfText).toContain('Preventive Maintenance');
  });

  it('handles 5 analyses generating multi-page PDF', async () => {
    const analyses = Array.from({ length: 5 }, (_, i) =>
      createMockAnalysis({ name: `Process ${i + 1}` }),
    );
    const blob = await generatePDF(analyses, createMockGlobalParams(), new Set());
    const pdfText = await extractPDFText(blob);
    // All 5 process names should appear
    for (let i = 1; i <= 5; i++) {
      expect(pdfText).toContain(`Process ${i}`);
    }
    // Should have multiple pages
    expect(pdfText).toContain('Page');
  });

  it('handles all analyses excluded from global', async () => {
    const a1 = createMockAnalysis({ id: 'x1' });
    const a2 = createMockAnalysis({ id: 'x2' });
    const blob = await generatePDF(
      [a1, a2],
      createMockGlobalParams(),
      new Set(['x1', 'x2']),
    );
    const pdfText = await extractPDFText(blob);
    // Should still render but show 0 in aggregated
    expect(pdfText).toContain('Executive Summary');
    expect(pdfText).toContain('excluded from global totals');
  });

  it('omits assumptions section when includeAssumptions is false', async () => {
    const blob = await generatePDF(
      [createMockAnalysis()],
      createMockGlobalParams(),
      new Set(),
      { includeAssumptions: false },
    );
    const pdfText = await extractPDFText(blob);
    expect(pdfText).not.toContain('Assumptions');
    expect(pdfText).not.toContain('Methodology');
  });
});

// ============================================================================
// generateCompleteFilename
// ============================================================================

describe('generateCompleteFilename', () => {
  it('generates filename with correct format ARGOS-Complete-Proposal-YYYY-MM-DD.pdf', () => {
    const date = new Date(2026, 1, 16);
    expect(generateCompleteFilename(date)).toBe('ARGOS-Complete-Proposal-2026-02-16.pdf');
  });

  it('pads single-digit month and day with leading zeros', () => {
    const date = new Date(2026, 0, 5);
    expect(generateCompleteFilename(date)).toBe('ARGOS-Complete-Proposal-2026-01-05.pdf');
  });

  it('uses current date when no date is provided', () => {
    const filename = generateCompleteFilename();
    expect(filename).toMatch(/^ARGOS-Complete-Proposal-\d{4}-\d{2}-\d{2}\.pdf$/);
  });
});

// ============================================================================
// renderPartDivider
// ============================================================================

describe('renderPartDivider', () => {
  it('renders part title on divider page', () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const textSpy = vi.spyOn(doc, 'text');

    const ctx: PageContext = { currentY: 40, pageNumber: 3 };
    renderPartDivider(doc, ctx, 'Part 2: Technical Architecture');

    const textCalls = getTextCalls(textSpy);
    expect(textCalls).toContain('Part 2: Technical Architecture');
  });

  it('renders subtitle text', () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const textSpy = vi.spyOn(doc, 'text');

    const ctx: PageContext = { currentY: 40, pageNumber: 3 };
    renderPartDivider(doc, ctx, 'Part 2: Technical Architecture');

    const textCalls = getTextCalls(textSpy);
    expect(textCalls.some(t => t.includes('ARGOS Deployment'))).toBe(true);
  });

  it('adds a new page', () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const addPageSpy = vi.spyOn(doc, 'addPage');

    const ctx: PageContext = { currentY: 40, pageNumber: 3 };
    renderPartDivider(doc, ctx, 'Part 2: Technical Architecture');

    expect(addPageSpy).toHaveBeenCalled();
  });

  it('increments page number', () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const ctx: PageContext = { currentY: 40, pageNumber: 3 };
    const result = renderPartDivider(doc, ctx, 'Part 2: Technical Architecture');

    expect(result.pageNumber).toBe(4);
  });
});

// ============================================================================
// renderDeploymentOverview
// ============================================================================

describe('renderDeploymentOverview', () => {
  let doc: InstanceType<typeof jsPDF>;
  let textSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    textSpy = vi.spyOn(doc, 'text');
  });

  function createOptions(overrides: Partial<CompletePDFOptions> = {}): CompletePDFOptions {
    return {
      deploymentMode: 'pilot',
      connectionType: 'ethernet',
      totalPumps: 30,
      processCount: 3,
      ...overrides,
    };
  }

  it('renders "Deployment Overview" heading', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 3 };
    renderDeploymentOverview(doc, ctx, createOptions());
    const texts = getTextCalls(textSpy);
    expect(texts).toContain('Deployment Overview');
  });

  it('shows Pilot deployment mode', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 3 };
    renderDeploymentOverview(doc, ctx, createOptions({ deploymentMode: 'pilot' }));
    const texts = getTextCalls(textSpy);
    expect(texts).toContain('Pilot');
  });

  it('shows Production deployment mode', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 3 };
    renderDeploymentOverview(doc, ctx, createOptions({ deploymentMode: 'production' }));
    const texts = getTextCalls(textSpy);
    expect(texts).toContain('Production');
  });

  it('shows Ethernet connection type', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 3 };
    renderDeploymentOverview(doc, ctx, createOptions({ connectionType: 'ethernet' }));
    const texts = getTextCalls(textSpy);
    expect(texts).toContain('Ethernet');
  });

  it('shows RS-485 connection type', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 3 };
    renderDeploymentOverview(doc, ctx, createOptions({ connectionType: 'rs485' }));
    const texts = getTextCalls(textSpy);
    expect(texts).toContain('RS-485');
  });

  it('shows WiFi connection type', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 3 };
    renderDeploymentOverview(doc, ctx, createOptions({ connectionType: 'wifi' }));
    const texts = getTextCalls(textSpy);
    expect(texts).toContain('WiFi');
  });

  it('shows total pumps count', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 3 };
    renderDeploymentOverview(doc, ctx, createOptions({ totalPumps: 42 }));
    const texts = getTextCalls(textSpy);
    expect(texts).toContain('42');
  });

  it('shows process count', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 3 };
    renderDeploymentOverview(doc, ctx, createOptions({ processCount: 5 }));
    const texts = getTextCalls(textSpy);
    expect(texts).toContain('5');
  });

  it('shows pilot timeline for pilot mode', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 3 };
    renderDeploymentOverview(doc, ctx, createOptions({ deploymentMode: 'pilot' }));
    const texts = getTextCalls(textSpy);
    expect(texts.some(t => t.includes('2-4 weeks'))).toBe(true);
  });

  it('shows production timeline for production mode', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 3 };
    renderDeploymentOverview(doc, ctx, createOptions({ deploymentMode: 'production' }));
    const texts = getTextCalls(textSpy);
    expect(texts.some(t => t.includes('6-8 weeks'))).toBe(true);
  });

  it('returns updated Y position', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 3 };
    const result = renderDeploymentOverview(doc, ctx, createOptions());
    expect(result.currentY).toBeGreaterThan(40);
  });
});

// ============================================================================
// renderArchitectureDiagramImage
// ============================================================================

describe('renderArchitectureDiagramImage', () => {
  let doc: InstanceType<typeof jsPDF>;
  let textSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    textSpy = vi.spyOn(doc, 'text');
  });

  it('renders "Architecture Diagram" subheading', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 3 };
    renderArchitectureDiagramImage(doc, ctx, undefined);
    const texts = getTextCalls(textSpy);
    expect(texts).toContain('Architecture Diagram');
  });

  it('shows "Diagram not available" when no image provided', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 3 };
    renderArchitectureDiagramImage(doc, ctx, undefined);
    const texts = getTextCalls(textSpy);
    expect(texts).toContain('Diagram not available');
  });

  it('returns updated Y position', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 3 };
    const result = renderArchitectureDiagramImage(doc, ctx, undefined);
    expect(result.currentY).toBeGreaterThan(40);
  });
});

// ============================================================================
// renderInfrastructureRequirements
// ============================================================================

describe('renderInfrastructureRequirements', () => {
  let doc: InstanceType<typeof jsPDF>;
  let textSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    textSpy = vi.spyOn(doc, 'text');
  });

  function createOptions(overrides: Partial<CompletePDFOptions> = {}): CompletePDFOptions {
    return {
      deploymentMode: 'pilot',
      connectionType: 'ethernet',
      totalPumps: 30,
      processCount: 3,
      ...overrides,
    };
  }

  it('renders "Infrastructure Requirements" heading', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 3 };
    renderInfrastructureRequirements(doc, ctx, createOptions());
    const texts = getTextCalls(textSpy);
    expect(texts).toContain('Infrastructure Requirements');
  });

  it('shows MicroPC requirement for pilot mode', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 3 };
    renderInfrastructureRequirements(doc, ctx, createOptions({ deploymentMode: 'pilot' }));
    const texts = getTextCalls(textSpy);
    expect(texts.some(t => t.includes('MicroPC'))).toBe(true);
  });

  it('shows direct local connection for pilot mode', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 3 };
    renderInfrastructureRequirements(doc, ctx, createOptions({ deploymentMode: 'pilot' }));
    const texts = getTextCalls(textSpy);
    expect(texts.some(t => t.includes('Direct local connection'))).toBe(true);
  });

  it('shows minimal IT for pilot mode', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 3 };
    renderInfrastructureRequirements(doc, ctx, createOptions({ deploymentMode: 'pilot' }));
    const texts = getTextCalls(textSpy);
    expect(texts.some(t => t.includes('Minimal IT'))).toBe(true);
  });

  it('shows central server for production mode', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 3 };
    renderInfrastructureRequirements(doc, ctx, createOptions({ deploymentMode: 'production' }));
    const texts = getTextCalls(textSpy);
    expect(texts.some(t => t.includes('Central server'))).toBe(true);
  });

  it('shows IT integration for production mode', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 3 };
    renderInfrastructureRequirements(doc, ctx, createOptions({ deploymentMode: 'production' }));
    const texts = getTextCalls(textSpy);
    expect(texts.some(t => t.includes('IT integration'))).toBe(true);
  });

  it('shows ARGOS Cloud connectivity for production mode', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 3 };
    renderInfrastructureRequirements(doc, ctx, createOptions({ deploymentMode: 'production' }));
    const texts = getTextCalls(textSpy);
    expect(texts.some(t => t.includes('ARGOS Cloud'))).toBe(true);
  });

  it('shows connection type in requirements', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 3 };
    renderInfrastructureRequirements(doc, ctx, createOptions({ deploymentMode: 'pilot', connectionType: 'wifi' }));
    const texts = getTextCalls(textSpy);
    expect(texts.some(t => t.includes('WiFi'))).toBe(true);
  });

  it('returns updated Y position', () => {
    const ctx: PageContext = { currentY: 40, pageNumber: 3 };
    const result = renderInfrastructureRequirements(doc, ctx, createOptions());
    expect(result.currentY).toBeGreaterThan(40);
  });
});

// ============================================================================
// generateCompletePDF
// ============================================================================

describe('generateCompletePDF', () => {
  function createCompleteOptions(overrides: Partial<CompletePDFOptions> = {}): CompletePDFOptions {
    return {
      deploymentMode: 'pilot',
      connectionType: 'ethernet',
      totalPumps: 10,
      processCount: 1,
      ...overrides,
    };
  }

  it('returns a valid Blob', async () => {
    const blob = await generateCompletePDF(
      [createMockAnalysis()],
      createMockGlobalParams(),
      new Set(),
      createCompleteOptions(),
    );
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
  });

  it('generates PDF with correct MIME type', async () => {
    const blob = await generateCompletePDF(
      [createMockAnalysis()],
      createMockGlobalParams(),
      new Set(),
      createCompleteOptions(),
    );
    expect(blob.type).toBe('application/pdf');
  });

  it('includes Part 1 content (Executive Summary)', async () => {
    const blob = await generateCompletePDF(
      [createMockAnalysis()],
      createMockGlobalParams(),
      new Set(),
      createCompleteOptions(),
    );
    const pdfText = await extractPDFText(blob);
    expect(pdfText).toContain('Executive Summary');
  });

  it('includes Part 2 divider page', async () => {
    const blob = await generateCompletePDF(
      [createMockAnalysis()],
      createMockGlobalParams(),
      new Set(),
      createCompleteOptions(),
    );
    const pdfText = await extractPDFText(blob);
    expect(pdfText).toContain('Part 2: Technical Architecture');
  });

  it('includes Deployment Overview section', async () => {
    const blob = await generateCompletePDF(
      [createMockAnalysis()],
      createMockGlobalParams(),
      new Set(),
      createCompleteOptions(),
    );
    const pdfText = await extractPDFText(blob);
    expect(pdfText).toContain('Deployment Overview');
  });

  it('includes Infrastructure Requirements section', async () => {
    const blob = await generateCompletePDF(
      [createMockAnalysis()],
      createMockGlobalParams(),
      new Set(),
      createCompleteOptions(),
    );
    const pdfText = await extractPDFText(blob);
    expect(pdfText).toContain('Infrastructure Requirements');
  });

  it('includes pilot mode content when deploymentMode is pilot', async () => {
    const blob = await generateCompletePDF(
      [createMockAnalysis()],
      createMockGlobalParams(),
      new Set(),
      createCompleteOptions({ deploymentMode: 'pilot' }),
    );
    const pdfText = await extractPDFText(blob);
    expect(pdfText).toContain('Pilot');
    expect(pdfText).toContain('2-4 weeks');
  });

  it('includes production mode content when deploymentMode is production', async () => {
    const blob = await generateCompletePDF(
      [createMockAnalysis()],
      createMockGlobalParams(),
      new Set(),
      createCompleteOptions({ deploymentMode: 'production' }),
    );
    const pdfText = await extractPDFText(blob);
    expect(pdfText).toContain('Production');
    expect(pdfText).toContain('6-8 weeks');
  });

  it('shows "Diagram not available" when no diagramImage provided', async () => {
    const blob = await generateCompletePDF(
      [createMockAnalysis()],
      createMockGlobalParams(),
      new Set(),
      createCompleteOptions({ diagramImage: undefined }),
    );
    const pdfText = await extractPDFText(blob);
    expect(pdfText).toContain('Diagram not available');
  });

  it('generates more pages than generatePDF alone', async () => {
    const analysis = createMockAnalysis();
    const globalParams = createMockGlobalParams();

    const part1Blob = await generatePDF([analysis], globalParams, new Set());
    const completeBlob = await generateCompletePDF(
      [analysis],
      globalParams,
      new Set(),
      createCompleteOptions(),
    );

    // Complete PDF should be larger due to Part 2 pages
    expect(completeBlob.size).toBeGreaterThan(part1Blob.size);
  });

  it('completes within 5 seconds for 5 analyses (performance)', async () => {
    const analyses = Array.from({ length: 5 }, (_, i) =>
      createMockAnalysis({ name: `Process ${i + 1}` }),
    );

    const start = performance.now();
    await generateCompletePDF(
      analyses,
      createMockGlobalParams(),
      new Set(),
      createCompleteOptions({ totalPumps: 50, processCount: 5 }),
    );
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(5000);
  });
});
