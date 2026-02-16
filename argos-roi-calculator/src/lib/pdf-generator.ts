/**
 * ARGOS ROI Calculator V10 - PDF Generator
 *
 * Pure jsPDF-based PDF generation engine with Pfeiffer Vacuum branding.
 * Produces A4 portrait documents with cover page, headers/footers,
 * and structured content sections.
 *
 * Design decisions:
 * - Pure jsPDF (NOT html2canvas) for precise layout control
 * - Dynamic import of jsPDF for code splitting (~250KB)
 * - Pure function — no store access, data passed as parameters
 * - French locale formatting (matches on-screen display)
 */

import type { Analysis, GlobalParams, AggregatedMetrics, AnalysisRowData } from '@/types';
import {
  calculateAggregatedMetrics,
  calculateAllAnalysisRows,
  calculateStrategySavings,
  calculatePlannedOverhaulSavings,
  calculateROI,
  isAnalysisCalculable,
} from './calculations';
import { ROI_NEGATIVE_THRESHOLD, ROI_WARNING_THRESHOLD } from './constants';
import { formatCurrency, formatPercentage } from './utils';

// ============================================================================
// PDF Text Sanitizer
// ============================================================================

/**
 * Sanitizes text for jsPDF rendering. jsPDF with default Helvetica font uses
 * WinAnsiEncoding which cannot render Unicode characters like:
 * - \u202F (narrow no-break space, used by fr-FR locale)
 * - \u00A0 (no-break space)
 * - \u20AC (euro sign — encode as \x80 in WinAnsi)
 *
 * This replaces problematic characters with PDF-safe equivalents.
 */
export function sanitizeForPDF(text: string): string {
  return text
    .replace(/[\u202F\u00A0]/g, ' ')  // Replace non-breaking spaces with regular space
    .replace(/\u20AC/g, '\x80');       // Euro sign → WinAnsi encoding byte 0x80
}

/**
 * Format currency for PDF output (sanitized for jsPDF WinAnsi encoding).
 */
function pdfCurrency(amount: number): string {
  return sanitizeForPDF(formatCurrency(amount));
}

/**
 * Format percentage for PDF output (sanitized for jsPDF WinAnsi encoding).
 */
function pdfPercentage(value: number, fractionDigits?: number): string {
  return sanitizeForPDF(formatPercentage(value, fractionDigits));
}

// ============================================================================
// Types
// ============================================================================

export interface PDFOptions {
  filename?: string;
  includeAssumptions?: boolean;
}

export interface TableColumn {
  header: string;
  width: number;
  align: 'left' | 'right';
}

export type TableRow = string[];

// ============================================================================
// PDF Layout Constants
// ============================================================================

export const PDF_LAYOUT = {
  pageWidth: 210,
  pageHeight: 297,
  marginLeft: 20,
  marginRight: 20,
  marginTop: 25,
  marginBottom: 25,
  contentWidth: 170,
  headerY: 12,
  footerY: 285,
  accentBarHeight: 3,
} as const;

// ============================================================================
// Color System
// ============================================================================

export const PDF_COLORS = {
  pfeifferRed: [204, 0, 0] as [number, number, number],
  darkText: [51, 51, 51] as [number, number, number],
  grayText: [128, 128, 128] as [number, number, number],
  lightGrayBg: [245, 245, 245] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  roiNegative: [204, 0, 0] as [number, number, number],
  roiWarning: [255, 140, 0] as [number, number, number],
  roiPositive: [40, 167, 69] as [number, number, number],
} as const;

// ============================================================================
// Typography System
// ============================================================================

export const PDF_FONTS = {
  title: { size: 24, style: 'bold' as const },
  sectionHeading: { size: 16, style: 'bold' as const },
  subsectionHeading: { size: 12, style: 'bold' as const },
  body: { size: 10, style: 'normal' as const },
  label: { size: 9, style: 'normal' as const },
  small: { size: 8, style: 'normal' as const },
} as const;

// ============================================================================
// ROI Color Helper
// ============================================================================

/**
 * Returns RGB tuple for ROI traffic-light coloring in PDF.
 * Adapts getROIColorClass() thresholds to RGB values.
 */
export function getROIColor(roi: number): [number, number, number] {
  if (!Number.isFinite(roi) || roi < ROI_NEGATIVE_THRESHOLD) return [...PDF_COLORS.roiNegative];
  if (roi < ROI_WARNING_THRESHOLD) return [...PDF_COLORS.roiWarning];
  return [...PDF_COLORS.roiPositive];
}

// ============================================================================
// Filename Generation
// ============================================================================

/**
 * Generates PDF filename with ISO date format.
 * Format: ARGOS-ROI-Analysis-YYYY-MM-DD.pdf
 */
export function generateFilename(date?: Date): string {
  const d = date ?? new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `ARGOS-ROI-Analysis-${year}-${month}-${day}.pdf`;
}

// ============================================================================
// Date Formatting
// ============================================================================

/**
 * Formats date for display on cover page.
 * Uses English locale: "February 16, 2026"
 */
export function formatDate(date?: Date): string {
  const d = date ?? new Date();
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formats date for footer display.
 * Short format: "16/02/2026"
 */
function formatDateShort(date?: Date): string {
  const d = date ?? new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// ============================================================================
// Page Context (Y-position tracking + page management)
// ============================================================================

export interface PageContext {
  currentY: number;
  pageNumber: number;
}

// jsPDF type import (type-only imports are erased at compile time, won't affect code splitting)
import type { jsPDF as JsPDFDoc } from 'jspdf';

/**
 * Checks if adding content of given height would overflow the page.
 * If so, adds a new page with header/footer and resets Y position.
 */
export function ensureSpace(
  doc: JsPDFDoc,
  ctx: PageContext,
  requiredHeight: number,
  date?: Date,
): PageContext {
  const safeBottom = PDF_LAYOUT.pageHeight - PDF_LAYOUT.marginBottom;
  if (ctx.currentY + requiredHeight > safeBottom) {
    doc.addPage();
    ctx.pageNumber += 1;
    addPageHeader(doc);
    addPageFooter(doc, ctx.pageNumber, date);
    ctx.currentY = PDF_LAYOUT.marginTop + 10;
  }
  return ctx;
}

// ============================================================================
// Page Header
// ============================================================================

/**
 * Adds page header: "ARGOS ROI Analysis" left-aligned with thin red line below.
 * Applied to every page after the cover page.
 */
export function addPageHeader(doc: JsPDFDoc): void {
  // Red accent bar at top
  doc.setFillColor(...PDF_COLORS.pfeifferRed);
  doc.rect(0, 0, PDF_LAYOUT.pageWidth, PDF_LAYOUT.accentBarHeight, 'F');

  // Header text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(PDF_FONTS.small.size);
  doc.setTextColor(...PDF_COLORS.pfeifferRed);
  doc.text('ARGOS ROI Analysis', PDF_LAYOUT.marginLeft, PDF_LAYOUT.headerY);

  // Thin red line below header
  doc.setDrawColor(...PDF_COLORS.pfeifferRed);
  doc.setLineWidth(0.3);
  doc.line(
    PDF_LAYOUT.marginLeft,
    PDF_LAYOUT.headerY + 2,
    PDF_LAYOUT.pageWidth - PDF_LAYOUT.marginRight,
    PDF_LAYOUT.headerY + 2,
  );
}

// ============================================================================
// Page Footer
// ============================================================================

/**
 * Adds page footer: "Pfeiffer Vacuum" left, date center, "Page X" right.
 * Page numbers are finalized after all pages are generated.
 */
export function addPageFooter(
  doc: JsPDFDoc,
  pageNumber: number,
  date?: Date,
): void {
  const footerY = PDF_LAYOUT.footerY;

  // Thin line above footer
  doc.setDrawColor(...PDF_COLORS.grayText);
  doc.setLineWidth(0.2);
  doc.line(
    PDF_LAYOUT.marginLeft,
    footerY - 4,
    PDF_LAYOUT.pageWidth - PDF_LAYOUT.marginRight,
    footerY - 4,
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(PDF_FONTS.small.size);
  doc.setTextColor(...PDF_COLORS.grayText);

  // Left: Pfeiffer Vacuum
  doc.text('Pfeiffer Vacuum', PDF_LAYOUT.marginLeft, footerY);

  // Center: Date
  const dateStr = formatDateShort(date);
  const dateWidth = doc.getTextWidth(dateStr);
  doc.text(dateStr, (PDF_LAYOUT.pageWidth - dateWidth) / 2, footerY);

  // Right: Page number (placeholder, updated in finalization)
  const pageText = `Page ${pageNumber}`;
  const pageWidth = doc.getTextWidth(pageText);
  doc.text(
    pageText,
    PDF_LAYOUT.pageWidth - PDF_LAYOUT.marginRight - pageWidth,
    footerY,
  );
}

// ============================================================================
// Typography Helpers
// ============================================================================

/**
 * Adds a title text (24pt bold, Pfeiffer red).
 * Returns the new Y position after the title.
 */
export function addTitle(
  doc: JsPDFDoc,
  text: string,
  x: number,
  y: number,
): number {
  doc.setFont('helvetica', PDF_FONTS.title.style);
  doc.setFontSize(PDF_FONTS.title.size);
  doc.setTextColor(...PDF_COLORS.pfeifferRed);
  doc.text(text, x, y);
  return y + PDF_FONTS.title.size * 0.5;
}

/**
 * Adds a section heading (16pt bold, Pfeiffer red).
 * Returns the new Y position after the heading.
 */
export function addHeading(
  doc: JsPDFDoc,
  text: string,
  x: number,
  y: number,
): number {
  doc.setFont('helvetica', PDF_FONTS.sectionHeading.style);
  doc.setFontSize(PDF_FONTS.sectionHeading.size);
  doc.setTextColor(...PDF_COLORS.pfeifferRed);
  doc.text(text, x, y);
  return y + PDF_FONTS.sectionHeading.size * 0.6;
}

/**
 * Adds a subsection heading (12pt bold, dark text).
 * Returns the new Y position after the heading.
 */
export function addSubheading(
  doc: JsPDFDoc,
  text: string,
  x: number,
  y: number,
): number {
  doc.setFont('helvetica', PDF_FONTS.subsectionHeading.style);
  doc.setFontSize(PDF_FONTS.subsectionHeading.size);
  doc.setTextColor(...PDF_COLORS.darkText);
  doc.text(text, x, y);
  return y + PDF_FONTS.subsectionHeading.size * 0.5;
}

/**
 * Adds body text (10pt normal, dark text).
 * Returns the new Y position after the text.
 */
export function addBodyText(
  doc: JsPDFDoc,
  text: string,
  x: number,
  y: number,
): number {
  doc.setFont('helvetica', PDF_FONTS.body.style);
  doc.setFontSize(PDF_FONTS.body.size);
  doc.setTextColor(...PDF_COLORS.darkText);
  doc.text(text, x, y);
  return y + PDF_FONTS.body.size * 0.5;
}

/**
 * Adds label text (9pt normal, gray).
 * Returns the new Y position after the label.
 */
export function addLabel(
  doc: JsPDFDoc,
  text: string,
  x: number,
  y: number,
): number {
  doc.setFont('helvetica', PDF_FONTS.label.style);
  doc.setFontSize(PDF_FONTS.label.size);
  doc.setTextColor(...PDF_COLORS.grayText);
  doc.text(text, x, y);
  return y + PDF_FONTS.label.size * 0.5;
}

// ============================================================================
// Cover Page
// ============================================================================

/**
 * Renders the cover page with Pfeiffer branding.
 * Includes accent bar, ARGOS title, subtitle, date, and footer.
 */
export function addCoverPage(doc: JsPDFDoc, date?: Date): void {
  // Top accent bar (full width, Pfeiffer red)
  doc.setFillColor(...PDF_COLORS.pfeifferRed);
  doc.rect(0, 0, PDF_LAYOUT.pageWidth, 8, 'F');

  // ARGOS title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(36);
  doc.setTextColor(...PDF_COLORS.pfeifferRed);
  doc.text('ARGOS', PDF_LAYOUT.pageWidth / 2, 80, { align: 'center' });

  // ROI Analysis Report subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(20);
  doc.setTextColor(...PDF_COLORS.darkText);
  doc.text('ROI Analysis Report', PDF_LAYOUT.pageWidth / 2, 95, {
    align: 'center',
  });

  // Decorative accent line
  doc.setDrawColor(...PDF_COLORS.pfeifferRed);
  doc.setLineWidth(1);
  doc.line(70, 105, 140, 105);

  // Generation date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(...PDF_COLORS.grayText);
  doc.text(formatDate(date), PDF_LAYOUT.pageWidth / 2, 120, {
    align: 'center',
  });

  // Bottom section: Pfeiffer Vacuum branding
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...PDF_COLORS.darkText);
  doc.text('Pfeiffer Vacuum', PDF_LAYOUT.pageWidth / 2, 240, {
    align: 'center',
  });

  // Confidential notice
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...PDF_COLORS.grayText);
  doc.text('Confidential', PDF_LAYOUT.pageWidth / 2, 250, {
    align: 'center',
  });
}

// ============================================================================
// Table Rendering
// ============================================================================

const TABLE_ROW_HEIGHT = 7;
const TABLE_HEADER_HEIGHT = 8;
const TABLE_CELL_PADDING = 2;

/**
 * Renders a data table with Pfeiffer-branded header, alternating row
 * backgrounds, and automatic page-break handling.
 *
 * @returns Updated PageContext with new Y position
 */
export function addTable(
  doc: JsPDFDoc,
  columns: TableColumn[],
  rows: TableRow[],
  startX: number,
  ctx: PageContext,
  date?: Date,
): PageContext {
  // Draw header row
  ctx = ensureSpace(doc, ctx, TABLE_HEADER_HEIGHT + TABLE_ROW_HEIGHT, date);
  ctx = drawTableHeader(doc, columns, startX, ctx);

  // Draw data rows
  for (let i = 0; i < rows.length; i++) {
    ctx = ensureSpace(doc, ctx, TABLE_ROW_HEIGHT, date);
    ctx = drawTableRow(doc, columns, rows[i], startX, ctx, i % 2 === 1);
  }

  return ctx;
}

function drawTableHeader(
  doc: JsPDFDoc,
  columns: TableColumn[],
  startX: number,
  ctx: PageContext,
): PageContext {
  // Header background (Pfeiffer red)
  doc.setFillColor(...PDF_COLORS.pfeifferRed);
  doc.rect(startX, ctx.currentY - 5, PDF_LAYOUT.contentWidth, TABLE_HEADER_HEIGHT, 'F');

  // Header text (white, bold)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(PDF_FONTS.small.size);
  doc.setTextColor(...PDF_COLORS.white);

  let colX = startX;
  for (const col of columns) {
    const textX = col.align === 'right' ? colX + col.width - TABLE_CELL_PADDING : colX + TABLE_CELL_PADDING;
    doc.text(col.header, textX, ctx.currentY, { align: col.align === 'right' ? 'right' : 'left' });
    colX += col.width;
  }

  ctx.currentY += TABLE_HEADER_HEIGHT;
  return ctx;
}

function drawTableRow(
  doc: JsPDFDoc,
  columns: TableColumn[],
  row: TableRow,
  startX: number,
  ctx: PageContext,
  isAlternate: boolean,
): PageContext {
  // Alternate row background
  if (isAlternate) {
    doc.setFillColor(...PDF_COLORS.lightGrayBg);
    doc.rect(startX, ctx.currentY - 5, PDF_LAYOUT.contentWidth, TABLE_ROW_HEIGHT, 'F');
  }

  // Row text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(PDF_FONTS.small.size);
  doc.setTextColor(...PDF_COLORS.darkText);

  let colX = startX;
  for (let i = 0; i < columns.length; i++) {
    const col = columns[i];
    const cellText = row[i] ?? '';
    const textX = col.align === 'right' ? colX + col.width - TABLE_CELL_PADDING : colX + TABLE_CELL_PADDING;
    doc.text(cellText, textX, ctx.currentY, { align: col.align === 'right' ? 'right' : 'left' });
    colX += col.width;
  }

  ctx.currentY += TABLE_ROW_HEIGHT;
  return ctx;
}

// ============================================================================
// Key-Value Pair Helper
// ============================================================================

/**
 * Renders a key-value pair on a single line (label left, value right).
 * Used for input summaries in the process breakdown.
 */
function addKeyValue(
  doc: JsPDFDoc,
  label: string,
  value: string,
  x: number,
  y: number,
): number {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(PDF_FONTS.label.size);
  doc.setTextColor(...PDF_COLORS.grayText);
  doc.text(label, x, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(PDF_FONTS.label.size);
  doc.setTextColor(...PDF_COLORS.darkText);
  doc.text(value, x + 60, y);

  return y + 5;
}

// ============================================================================
// Section 1: Executive Summary
// ============================================================================

/**
 * Renders Executive Summary section with aggregated metrics.
 * Uses only INCLUDED analyses (respects excludedFromGlobal).
 */
export function renderExecutiveSummary(
  doc: JsPDFDoc,
  metrics: AggregatedMetrics,
  excludedCount: number,
  ctx: PageContext,
  date?: Date,
): PageContext {
  const x = PDF_LAYOUT.marginLeft;

  // Section heading
  ctx = ensureSpace(doc, ctx, 60, date);
  addHeading(doc, 'Executive Summary', x, ctx.currentY);
  ctx.currentY += 12;

  // Hero savings number (large, bold)
  ctx = ensureSpace(doc, ctx, 20, date);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  const savingsColor = metrics.totalSavings >= 0 ? PDF_COLORS.roiPositive : PDF_COLORS.roiNegative;
  doc.setTextColor(...savingsColor);
  doc.text(`Total Savings: ${pdfCurrency(metrics.totalSavings)}`, x, ctx.currentY);
  ctx.currentY += 14;

  // Overall ROI with traffic-light color
  ctx = ensureSpace(doc, ctx, 12, date);
  const roiColor = getROIColor(metrics.overallROI);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...roiColor);
  doc.text(`Overall ROI: ${pdfPercentage(metrics.overallROI)}`, x, ctx.currentY);
  ctx.currentY += 10;

  // Key stats
  ctx = ensureSpace(doc, ctx, 12, date);
  addBodyText(doc, `Total Pumps Monitored: ${metrics.totalPumps}`, x, ctx.currentY);
  ctx.currentY += 6;
  const processLabel = excludedCount > 0
    ? `Processes Analyzed: ${metrics.processCount} included (${excludedCount} excluded)`
    : `Processes Analyzed: ${metrics.processCount}`;
  addBodyText(doc, processLabel, x, ctx.currentY);
  ctx.currentY += 8;

  // Recommendation text
  ctx = ensureSpace(doc, ctx, 12, date);
  const recommendation = metrics.overallROI > 0
    ? 'ARGOS demonstrates strong ROI across the analyzed processes. Predictive maintenance monitoring is recommended to capture the identified savings.'
    : 'Further analysis recommended. The current configuration shows limited ROI potential. Consider adjusting process parameters or expanding the scope of monitored equipment.';
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(PDF_FONTS.body.size);
  doc.setTextColor(...PDF_COLORS.darkText);
  const splitRec = doc.splitTextToSize(recommendation, PDF_LAYOUT.contentWidth);
  doc.text(splitRec, x, ctx.currentY);
  ctx.currentY += splitRec.length * 5 + 4;

  // Visual divider
  ctx = ensureSpace(doc, ctx, 4, date);
  doc.setDrawColor(...PDF_COLORS.pfeifferRed);
  doc.setLineWidth(0.5);
  doc.line(x, ctx.currentY, x + PDF_LAYOUT.contentWidth, ctx.currentY);
  ctx.currentY += 8;

  return ctx;
}

// ============================================================================
// Section 2: Per-Process Breakdown
// ============================================================================

/**
 * Renders the breakdown for a single analysis process.
 * Shows ALL analyses, with an "(Excluded from global totals)" badge for excluded ones.
 */
export function renderProcessBreakdown(
  doc: JsPDFDoc,
  analysis: Analysis,
  globalParams: GlobalParams,
  isExcluded: boolean,
  ctx: PageContext,
  date?: Date,
): PageContext {
  const x = PDF_LAYOUT.marginLeft;

  // Ensure minimum space for section start; if not enough, start a new page
  ctx = ensureSpace(doc, ctx, 50, date);

  // Process name heading
  let headerText = analysis.name;
  if (isExcluded) {
    headerText += '  (Excluded from global totals)';
  }
  addSubheading(doc, headerText, x, ctx.currentY);
  ctx.currentY += 8;

  // Input summary
  ctx = ensureSpace(doc, ctx, 55, date);
  addLabel(doc, 'Input Parameters', x, ctx.currentY);
  ctx.currentY += 5;

  ctx.currentY = addKeyValue(doc, 'Pump Model:', analysis.pumpType || 'N/A', x, ctx.currentY);
  ctx.currentY = addKeyValue(doc, 'Number of Pumps:', String(analysis.pumpQuantity), x, ctx.currentY);
  ctx.currentY = addKeyValue(doc, 'Failure Rate:', `${pdfPercentage(analysis.failureRatePercentage, 1)} (${analysis.failureRateMode})`, x, ctx.currentY);

  const waferTypeLabel = analysis.waferType === 'mono' ? 'Mono' : 'Batch';
  ctx.currentY = addKeyValue(doc, 'Wafer Type:', `${waferTypeLabel} (${analysis.waferQuantity} wafers)`, x, ctx.currentY);
  ctx.currentY = addKeyValue(doc, 'Wafer Cost:', pdfCurrency(analysis.waferCost), x, ctx.currentY);
  ctx.currentY = addKeyValue(doc, 'Wafer Defects/Year:', String(analysis.waferDefectEventsPerYear), x, ctx.currentY);

  ctx = ensureSpace(doc, ctx, 20, date);
  ctx.currentY = addKeyValue(doc, 'Downtime/Failure:', `${analysis.downtimeDuration}h`, x, ctx.currentY);
  ctx.currentY = addKeyValue(doc, 'Downtime Cost/Hour:', pdfCurrency(analysis.downtimeCostPerHour), x, ctx.currentY);

  // Bottleneck
  if (analysis.isBottleneck) {
    ctx.currentY = addKeyValue(doc, 'Bottleneck Tool:', `Yes (x${analysis.bottleneckMultiplier})`, x, ctx.currentY);
  } else {
    ctx.currentY = addKeyValue(doc, 'Bottleneck Tool:', 'No', x, ctx.currentY);
  }

  // Maintenance strategy
  const strategyLabel = analysis.maintenanceStrategy === 'planned' ? 'Preventive Maintenance' : 'Run to Fail';
  ctx.currentY = addKeyValue(doc, 'Strategy:', strategyLabel, x, ctx.currentY);

  // Planned strategy extra fields
  if (analysis.maintenanceStrategy === 'planned') {
    ctx = ensureSpace(doc, ctx, 20, date);
    ctx.currentY = addKeyValue(doc, 'Overhaul Cost/Pump:', pdfCurrency(analysis.overhaulCostPerPump), x, ctx.currentY);
    ctx.currentY = addKeyValue(doc, 'PM Interval:', `${analysis.pmIntervalMonths} months`, x, ctx.currentY);
    ctx.currentY = addKeyValue(doc, 'ARGOS MTBF Extension:', `${analysis.argosMtbfExtensionPercent}%`, x, ctx.currentY);
  }

  ctx.currentY += 2;

  // Results
  if (!isAnalysisCalculable(analysis)) {
    ctx = ensureSpace(doc, ctx, 10, date);
    addLabel(doc, 'Incomplete data - results not available', x, ctx.currentY);
    ctx.currentY += 8;
    return ctx;
  }

  const result = calculateStrategySavings(analysis, globalParams);
  const roi = calculateROI(result.savings, result.argosServiceCost);

  ctx = ensureSpace(doc, ctx, 35, date);
  addLabel(doc, 'Results', x, ctx.currentY);
  ctx.currentY += 5;

  ctx.currentY = addKeyValue(doc, 'Total Failure Cost:', pdfCurrency(result.totalFailureCost), x, ctx.currentY);
  ctx.currentY = addKeyValue(doc, 'ARGOS Service Cost:', pdfCurrency(result.argosServiceCost), x, ctx.currentY);

  // Strategy-specific results
  if (analysis.maintenanceStrategy === 'planned') {
    const overhaul = calculatePlannedOverhaulSavings(
      analysis.pumpQuantity,
      analysis.pmIntervalMonths,
      analysis.overhaulCostPerPump,
      analysis.argosMtbfExtensionPercent,
    );
    ctx.currentY = addKeyValue(doc, 'Overhaul Savings:', pdfCurrency(overhaul.overhaulSavings), x, ctx.currentY);
    ctx.currentY = addKeyValue(doc, 'Total Savings:', pdfCurrency(result.savings), x, ctx.currentY);
  } else {
    const detectionRate = analysis.detectionRate ?? globalParams.detectionRate;
    const costAvoided = result.totalFailureCost * (detectionRate / 100);
    ctx.currentY = addKeyValue(doc, 'Cost Avoided:', pdfCurrency(costAvoided), x, ctx.currentY);
    ctx.currentY = addKeyValue(doc, 'Savings:', pdfCurrency(result.savings), x, ctx.currentY);
  }

  // ROI with color
  ctx = ensureSpace(doc, ctx, 10, date);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(PDF_FONTS.label.size);
  doc.setTextColor(...PDF_COLORS.grayText);
  doc.text('ROI:', x, ctx.currentY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(PDF_FONTS.label.size);
  doc.setTextColor(...getROIColor(roi));
  doc.text(pdfPercentage(roi), x + 60, ctx.currentY);
  ctx.currentY += 8;

  // Divider between processes
  doc.setDrawColor(...PDF_COLORS.lightGrayBg);
  doc.setLineWidth(0.3);
  doc.line(x, ctx.currentY, x + PDF_LAYOUT.contentWidth, ctx.currentY);
  ctx.currentY += 6;

  return ctx;
}

// ============================================================================
// Section 3: Global Analysis Summary
// ============================================================================

/**
 * Renders Global Analysis Summary with comparison table.
 * Uses only INCLUDED analyses.
 */
export function renderGlobalSummary(
  doc: JsPDFDoc,
  rows: AnalysisRowData[],
  metrics: AggregatedMetrics,
  excludedCount: number,
  ctx: PageContext,
  date?: Date,
): PageContext {
  const x = PDF_LAYOUT.marginLeft;

  // Section heading
  ctx = ensureSpace(doc, ctx, 40, date);
  addHeading(doc, 'Global Analysis Summary', x, ctx.currentY);
  ctx.currentY += 10;

  if (rows.length === 0) {
    addBodyText(doc, 'No calculable analyses to display.', x, ctx.currentY);
    ctx.currentY += 8;
    // Still show excluded note if applicable
    if (excludedCount > 0) {
      addLabel(
        doc,
        `(${excludedCount} process${excludedCount !== 1 ? 'es' : ''} excluded from global totals)`,
        x,
        ctx.currentY,
      );
      ctx.currentY += 8;
    }
    ctx.currentY += 4;
    return ctx;
  }

  // Comparison table columns
  const columns: TableColumn[] = [
    { header: 'Process', width: 38, align: 'left' },
    { header: 'Pumps', width: 16, align: 'right' },
    { header: 'Failure Rate', width: 22, align: 'right' },
    { header: 'Failure Cost', width: 26, align: 'right' },
    { header: 'ARGOS Cost', width: 24, align: 'right' },
    { header: 'Savings', width: 24, align: 'right' },
    { header: 'ROI', width: 20, align: 'right' },
  ];

  // Build data rows
  const tableRows: TableRow[] = rows.map(row => [
    row.name,
    String(row.pumpQuantity),
    pdfPercentage(row.failureRate),
    pdfCurrency(row.totalFailureCost),
    pdfCurrency(row.argosServiceCost),
    pdfCurrency(row.savings),
    pdfPercentage(row.roiPercentage),
  ]);

  // Totals row
  const totalsRow: TableRow = [
    'TOTAL',
    String(metrics.totalPumps),
    '',
    pdfCurrency(metrics.totalFailureCost),
    pdfCurrency(metrics.totalServiceCost),
    pdfCurrency(metrics.totalSavings),
    pdfPercentage(metrics.overallROI),
  ];
  tableRows.push(totalsRow);

  ctx = addTable(doc, columns, tableRows, x, ctx, date);

  // Note about excluded count
  if (excludedCount > 0) {
    ctx = ensureSpace(doc, ctx, 8, date);
    ctx.currentY += 2;
    addLabel(
      doc,
      `(${excludedCount} process${excludedCount !== 1 ? 'es' : ''} excluded from global totals)`,
      x,
      ctx.currentY,
    );
    ctx.currentY += 8;
  }

  ctx.currentY += 4;
  return ctx;
}

// ============================================================================
// Section 4: Assumptions & Methodology
// ============================================================================

/**
 * Renders Assumptions & Methodology section with key parameters,
 * calculation formulas, data source note, and generation date.
 */
export function renderAssumptions(
  doc: JsPDFDoc,
  globalParams: GlobalParams,
  analyses: Analysis[],
  ctx: PageContext,
  date?: Date,
): PageContext {
  const x = PDF_LAYOUT.marginLeft;
  const d = date ?? new Date();

  // Section heading
  ctx = ensureSpace(doc, ctx, 60, date);
  addHeading(doc, 'Assumptions & Methodology', x, ctx.currentY);
  ctx.currentY += 10;

  // Key parameters
  addSubheading(doc, 'Key Parameters', x, ctx.currentY);
  ctx.currentY += 7;
  ctx.currentY = addKeyValue(doc, 'ARGOS Detection Rate:', `${globalParams.detectionRate}%`, x, ctx.currentY);
  ctx.currentY = addKeyValue(doc, 'Service Cost/Pump:', pdfCurrency(globalParams.serviceCostPerPump) + '/year', x, ctx.currentY);
  ctx.currentY += 4;

  // Calculation methodology
  ctx = ensureSpace(doc, ctx, 35, date);
  addSubheading(doc, 'Calculation Methodology', x, ctx.currentY);
  ctx.currentY += 7;

  const formulas = [
    'Total Failure Cost = (Defect Events x Wafer Cost x Wafers) + (Failed Pumps x Downtime x Cost/Hour)',
    'ARGOS Savings = Total Failure Cost x Detection Rate - Service Cost',
    'ROI = (Savings / Service Cost) x 100%',
  ];

  for (const formula of formulas) {
    ctx = ensureSpace(doc, ctx, 6, date);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(PDF_FONTS.label.size);
    doc.setTextColor(...PDF_COLORS.darkText);
    doc.text(formula, x + 4, ctx.currentY);
    ctx.currentY += 5;
  }

  // Check if any analyses use planned strategy
  const hasPlanned = analyses.some(a => a.maintenanceStrategy === 'planned');
  if (hasPlanned) {
    ctx.currentY += 2;
    ctx = ensureSpace(doc, ctx, 8, date);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(PDF_FONTS.label.size);
    doc.setTextColor(...PDF_COLORS.darkText);
    doc.text(
      'Planned Maintenance: Overhaul savings based on MTBF extension from ARGOS predictive monitoring',
      x + 4,
      ctx.currentY,
    );
    ctx.currentY += 6;
  }

  ctx.currentY += 4;

  // Data source note
  ctx = ensureSpace(doc, ctx, 12, date);
  addLabel(
    doc,
    'Based on client-provided operational data collected during ROI assessment session.',
    x,
    ctx.currentY,
  );
  ctx.currentY += 6;

  // Generation date
  addLabel(doc, `Report generated: ${formatDate(d)}`, x, ctx.currentY);
  ctx.currentY += 5;
  addLabel(doc, 'ARGOS ROI Calculator V10', x, ctx.currentY);
  ctx.currentY += 8;

  return ctx;
}

// ============================================================================
// Main PDF Generation
// ============================================================================

/**
 * Generates a professionally branded PDF report.
 *
 * @param analyses - All analyses to include in the report
 * @param globalParams - Global parameters (detection rate, service cost)
 * @param excludedFromGlobal - Set of analysis IDs excluded from global aggregation
 * @param options - Optional configuration (filename override, include assumptions)
 * @returns Promise<Blob> - The generated PDF as a Blob
 */
export async function generatePDF(
  analyses: Analysis[],
  globalParams: GlobalParams,
  excludedFromGlobal: Set<string>,
  options?: PDFOptions,
): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const _options = {
    includeAssumptions: true,
    ...options,
  };

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const now = new Date();

  // Page 1: Cover page
  addCoverPage(doc, now);

  let ctx: PageContext = {
    currentY: PDF_LAYOUT.marginTop + 10,
    pageNumber: 2,
  };

  // Page 2+: First content page
  doc.addPage();
  addPageHeader(doc);
  addPageFooter(doc, ctx.pageNumber, now);
  ctx.currentY = PDF_LAYOUT.marginTop + 10;

  // Filter included analyses for aggregation
  const includedAnalyses = analyses.filter(a => !excludedFromGlobal.has(a.id));
  const excludedCount = analyses.length - includedAnalyses.length;

  // Calculate aggregated metrics from included analyses only
  const metrics = calculateAggregatedMetrics(includedAnalyses, globalParams);

  // Section 1: Executive Summary
  ctx = renderExecutiveSummary(doc, metrics, excludedCount, ctx, now);

  // Section 2: Per-Process Breakdown (ALL analyses, included and excluded)
  for (const analysis of analyses) {
    const isExcluded = excludedFromGlobal.has(analysis.id);
    ctx = renderProcessBreakdown(doc, analysis, globalParams, isExcluded, ctx, now);
  }

  // Section 3: Global Analysis Summary (included analyses only)
  const rows = calculateAllAnalysisRows(includedAnalyses, globalParams);
  ctx = renderGlobalSummary(doc, rows, metrics, excludedCount, ctx, now);

  // Section 4: Assumptions & Methodology (if enabled)
  if (_options.includeAssumptions) {
    ctx = renderAssumptions(doc, globalParams, analyses, ctx, now);
  }

  // Finalize: update total page count in footers
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    // Overwrite page number text with "Page X / Y"
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(PDF_FONTS.small.size);
    doc.setTextColor(...PDF_COLORS.grayText);
    const pageText = `Page ${i - 1} / ${totalPages - 1}`;
    const pageWidth = doc.getTextWidth(pageText);
    // Clear the old page number area with white rect (dynamic width for double-digit pages)
    const oldPageText = `Page ${i - 1}`;
    const clearWidth = Math.max(40, doc.getTextWidth(oldPageText) + 10);
    doc.setFillColor(...PDF_COLORS.white);
    doc.rect(
      PDF_LAYOUT.pageWidth - PDF_LAYOUT.marginRight - clearWidth,
      PDF_LAYOUT.footerY - 4,
      clearWidth,
      6,
      'F',
    );
    doc.text(
      pageText,
      PDF_LAYOUT.pageWidth - PDF_LAYOUT.marginRight - pageWidth,
      PDF_LAYOUT.footerY,
    );
  }

  return doc.output('blob') as Blob;
}
