---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - product-brief-ROI-Calculator-2026-02-03.md
  - prd.md
  - ux-design-specification.md
workflowType: 'architecture'
project_name: 'ROI Calculator'
user_name: 'JB'
date: '2026-02-05'
status: 'complete'
completedAt: '2026-02-05'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements (58 FRs):**

The PRD defines 58 functional requirements organized into 8 categories:

| Category | FRs | Architectural Implication |
|----------|-----|---------------------------|
| **Analysis Management** | FR1-FR8 | CRUD operations, multi-analysis state, navigation |
| **Data Input & Calculation** | FR9-FR24 | ROI formulas, real-time calculation (<100ms) |
| **Input Validation** | FR25-FR29 | Client-side validation, immediate feedback |
| **Global Parameters** | FR30-FR34 | Shared state across analyses, propagation |
| **Aggregation & Comparison** | FR35-FR38 | Multi-analysis aggregation, side-by-side comparison |
| **Export & Reporting** | FR39-FR44 | Client-side PDF generation, Pfeiffer branding |
| **Solutions Module (V11)** | FR45-FR54 | Separate module, pre-fill from ROI, architecture diagram |
| **Session State** | FR55-FR58 | Ephemeral storage, no backend persistence |

**Non-Functional Requirements:**

| NFR | Target | Architectural Impact |
|-----|--------|---------------------|
| **NFR-P1** | Calculation <100ms | Optimized state management, avoid cascading re-renders |
| **NFR-P2/P3** | PDF generation <3-5s | Performant PDF library, pre-compiled templates |
| **NFR-P4** | Navigation <200ms | Efficient routing, minimal DOM updates |
| **NFR-P5** | Page load <2s | Bundle optimization, lazy loading |
| **NFR-P6** | 5 concurrent analyses | Memory-efficient state, no performance degradation |
| **NFR-S1** | No server transmission | **100% client-side architecture** |
| **NFR-S2** | Ephemeral storage | In-memory + session storage, no database |
| **NFR-S3** | Client-side PDF | jsPDF or similar, no cloud processing |
| **NFR-S4** | HTTPS | Deployment configuration |
| **NFR-R1** | 0 critical bugs | E2E testing, robust validation |
| **NFR-R5** | 2+ hour sessions | Memory management, no leaks |

**Scale & Complexity:**

- Primary domain: **Frontend SPA (Single Page Application)**
- Complexity level: **Medium**
- Backend required: **No** (100% client-side per NFR-S1)
- Estimated architectural components: **24 custom UI components + core modules**

### Technical Constraints & Dependencies

**Hard Constraints (from NFRs):**

1. **Zero server transmission (NFR-S1)** — All client data (failure rates, wafer costs, downtime) must remain client-side. This eliminates backend options and mandates a pure frontend architecture.

2. **Real-time performance (<100ms calculations)** — State management must be optimized to avoid cascading re-renders. Calculation engine must be synchronous and efficient.

3. **Client-side PDF generation (NFR-S3)** — PDF library must work entirely in browser. Options: jsPDF, pdfmake, html2pdf.js, @react-pdf/renderer.

4. **2+ hour session stability (NFR-R5)** — Memory management critical. No memory leaks in state, event listeners, or DOM references.

**Soft Constraints (from UX Spec):**

1. **24 custom components** — No off-the-shelf component library fits the specific workflow (Dashboard Grid, Focus Mode, What-If comparison). Requires custom component architecture.

2. **Tailwind CSS** — Design system foundation already decided in UX spec. Architecture must accommodate utility-first CSS approach.

3. **Responsive breakpoints** — 1200px (minimum), 1440px, 1920px. Sidebar collapse behavior at narrow viewport.

**Dependencies:**

- Modern browser (Chrome 120+, Edge 120+) with ES6+ support
- PDF generation library (TBD)
- Optional: React/Vue/Svelte framework (TBD)

### Cross-Cutting Concerns Identified

1. **State Management**
   - Multiple analyses (2-5 per session)
   - Global parameters affecting all analyses
   - Real-time calculation propagation
   - Unsaved changes tracking

2. **Routing & Navigation**
   - Dashboard Grid ↔ Focus Mode ↔ Global Analysis ↔ Solutions
   - URL hash sync for deep linking
   - Breadcrumb state

3. **PDF Generation**
   - Pfeiffer branding (logo, colors)
   - V10 ROI report + V11 Technical Architecture (unified)
   - Template management

4. **Validation & Error Handling**
   - Real-time input validation
   - Consistent error message patterns
   - Graceful PDF failure recovery

5. **Responsive Design**
   - 3 breakpoints with layout adaptation
   - Sidebar collapse/overlay behavior
   - Touch-target sizing for projector use

## Starter Template Evaluation

### Primary Technology Domain

Frontend SPA (Single Page Application) - 100% client-side architecture per NFR-S1

### Stack Selection

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Framework** | React 18+ | Mature ecosystem, extensive PDF documentation, hiring pool |
| **Language** | TypeScript | Type safety for ROI calculations, long-term maintainability |
| **Build Tool** | Vite 5.x | Sub-50ms HMR, optimized builds, modern standard |
| **Styling** | Tailwind CSS 3.4+ | Per UX Design Specification decision |
| **PDF Generation** | jsPDF + html2canvas | 100% client-side, TypeScript support, 2.6M weekly downloads |
| **Deployment** | Vercel (primary) / GitHub Pages (fallback) | Free tier, preview deployments, SPA-optimized |

### Alternatives Considered

| Template | Verdict | Reason |
|----------|---------|--------|
| shadcn/ui + Vite | Rejected | Pre-built components incompatible with 24 custom components |
| Create React App | Rejected | Deprecated, no longer officially maintained |
| Next.js | Rejected | SSR/SSG overkill for 100% client-side SPA |
| Vue 3 + Vite | Viable | Smaller ecosystem than React, fewer PDF resources |
| Svelte | Viable | Excellent performance but younger ecosystem |

### Initialization Command

```bash
npm create vite@latest argos-roi-calculator -- --template react-ts
cd argos-roi-calculator
npm install
npm install -D tailwindcss @tailwindcss/vite
npm install jspdf html2canvas
npm install -D @types/html2canvas
```

### Architectural Decisions Provided by Starter

**Language & Runtime:**
- TypeScript 5.x with strict mode enabled
- ES2022 target for modern browser support
- Node 20+ for development tooling

**Styling Solution:**
- Tailwind CSS 3.4+ via `@tailwindcss/vite` plugin
- Pfeiffer brand tokens configured (colors, typography, spacing)
- No CSS-in-JS (performance, simplicity)

**Build Tooling:**
- Vite 5.x with Rollup bundler
- Automatic tree-shaking for minimal bundle size
- Code splitting by route
- Asset optimization (images, fonts)

**Testing Framework:**
- Vitest (Vite-native, Jest-compatible API)
- React Testing Library for component tests
- Playwright for E2E testing (optional for V10)

**Code Organization:**
```
src/
├── components/       # 24 custom components (AnalysisCard, InputPanel, etc.)
├── hooks/            # Custom hooks (useAnalysis, useCalculation, etc.)
├── lib/              # Utilities (ROI calculations, PDF generation)
├── types/            # TypeScript interfaces
├── stores/           # State management (TBD)
└── App.tsx           # Root component
```

**Development Experience:**
- Hot Module Replacement < 50ms
- Full TypeScript IntelliSense
- ESLint + Prettier pre-configured
- Path aliases (`@/components`, `@/lib`)

**Note:** Project initialization using this command should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- State Management: Zustand
- Routing: React Router 6
- Data Validation: Zod

**Important Decisions (Shape Architecture):**
- Component Architecture: Feature-based folder structure
- Data Models: TypeScript interfaces with strict typing
- Deployment: Vercel with GitHub integration

**Deferred Decisions (Post-MVP):**
- CI/CD pipeline complexity (simple auto-deploy for MVP)
- Monitoring/Analytics integration
- Offline capability (PWA)
- Multi-language support

### Frontend Architecture

#### State Management: Zustand

**Decision:** Use Zustand for global state management

**Rationale:**
- Ultra-lightweight (1.5kb gzipped) — minimal bundle impact
- Simple API with no boilerplate — faster development
- Built-in selector optimization — prevents unnecessary re-renders (critical for <100ms calculations)
- First-class TypeScript support
- Perfect fit for 2-5 analyses + global parameters

**Store Structure:**
```typescript
interface AppState {
  // Analyses
  analyses: Analysis[];
  activeAnalysisId: string | null;

  // Global Parameters
  globalParams: GlobalParams;

  // UI State
  unsavedChanges: boolean;

  // Actions
  addAnalysis: (analysis: Analysis) => void;
  updateAnalysis: (id: string, updates: Partial<Analysis>) => void;
  deleteAnalysis: (id: string) => void;
  duplicateAnalysis: (id: string) => void;
  setActiveAnalysis: (id: string) => void;
  updateGlobalParams: (params: Partial<GlobalParams>) => void;
}
```

**Affects:** All components that read/write application state

#### Routing: React Router 6

**Decision:** Use React Router 6 for client-side routing

**Rationale:**
- Industry standard for React SPAs
- Native URL hash sync support (#/global-analysis)
- Mature ecosystem with extensive documentation
- Easy to find developers with experience

**Route Structure:**
```typescript
const routes = [
  { path: '/', element: <Dashboard /> },           // Dashboard Grid
  { path: '/analysis/:id', element: <FocusMode /> }, // Focus Mode
  { path: '/global', element: <GlobalAnalysis /> },  // Global Analysis
  { path: '/solutions', element: <Solutions /> },    // V11 Solutions
];
```

**Affects:** Navigation between views, URL state, breadcrumbs

#### Component Architecture

**Decision:** Feature-based folder organization with clear separation of concerns

**Structure:**
```
src/
├── components/
│   ├── navigation/           # NavigationBar, Breadcrumb, FocusSidebar
│   │   ├── NavigationBar.tsx
│   │   ├── Breadcrumb.tsx
│   │   └── FocusSidebar.tsx
│   ├── analysis/             # AnalysisCard, InputPanel, ResultsPanel
│   │   ├── AnalysisCard.tsx
│   │   ├── InputPanel.tsx
│   │   ├── ResultsPanel.tsx
│   │   └── FailureRateToggle.tsx
│   ├── global/               # GlobalSidebar, GlobalAnalysisView
│   │   ├── GlobalSidebar.tsx
│   │   ├── GlobalAnalysisView.tsx
│   │   └── ComparisonTable.tsx
│   ├── solutions/            # V11 components
│   │   ├── SolutionsForm.tsx
│   │   └── ArchitectureDiagram.tsx
│   ├── pdf/                  # PDF generation
│   │   ├── PDFExportButton.tsx
│   │   └── PDFTemplate.tsx
│   └── ui/                   # Primitive components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Toggle.tsx
│       ├── Toast.tsx
│       └── Card.tsx
├── hooks/
│   ├── useAnalysis.ts        # CRUD operations
│   ├── useCalculation.ts     # ROI calculation logic
│   ├── usePDF.ts             # PDF generation
│   └── useValidation.ts      # Form validation
├── lib/
│   ├── calculations.ts       # Pure ROI formulas
│   ├── validation.ts         # Zod schemas
│   ├── pdf-generator.ts      # jsPDF template
│   └── constants.ts          # Default values
├── stores/
│   └── app-store.ts          # Zustand store
├── types/
│   └── index.ts              # TypeScript interfaces
└── App.tsx
```

**Component Patterns:**
- **Presentational components:** Pure UI, receive props, no direct store access
- **Connected components:** Access store via useStore hooks
- **Custom hooks:** Encapsulate business logic (calculations, validation)
- **Lib functions:** Pure functions, no side effects, easily testable

**Affects:** All development, code organization, maintainability

### Data Architecture

#### Data Models

**Decision:** Strict TypeScript interfaces for all domain entities

**Core Types:**
```typescript
// Analysis entity
interface Analysis {
  id: string;
  name: string;
  pumpModel: string;
  pumpQuantity: number;
  failureRateMode: 'percentage' | 'absolute';
  failureRate: number;
  failuresCount?: number;
  waferType: 'mono' | 'batch';
  wafersPerBatch: number;
  waferCost: number;
  downtimePerFailure: number;
  downtimeCostPerHour: number;
  createdAt: Date;
  updatedAt: Date;
}

// Global parameters
interface GlobalParams {
  detectionRate: number;      // % (default: 70)
  serviceCostPerPump: number; // €/year (default: 2500)
}

// Calculation results (computed, not stored)
interface CalculationResult {
  totalFailureCost: number;
  argosServiceCost: number;
  savings: number;
  roiRatio: number;
  roiPercentage: number;
}

// Solutions module (V11)
interface SolutionsData {
  pumpCount: number;          // Pre-filled from analyses
  processTypes: string[];     // Pre-filled from analysis names
  hasSupervisionNetwork: boolean;
  supervisionNetworkType?: string;
  connectivityType: 'ethernet' | 'wifi' | '4g' | 'opcua' | 'modbus' | 'other';
  infrastructureType: 'vm' | 'onprem' | 'cloud' | 'hybrid';
  additionalNotes?: string;
}
```

**Affects:** All data handling, validation, type safety

#### Validation: Zod

**Decision:** Use Zod for runtime validation with TypeScript inference

**Rationale:**
- Schema-based validation — single source of truth
- Automatic TypeScript type inference
- Custom error messages for user-friendly feedback
- Lightweight (12kb gzipped)

**Example Schema:**
```typescript
const AnalysisSchema = z.object({
  name: z.string().min(1, "Analysis name is required"),
  pumpModel: z.string().min(1, "Pump model is required"),
  pumpQuantity: z.number().min(1, "At least 1 pump required").max(9999),
  failureRate: z.number().min(0).max(100),
  waferCost: z.number().min(0, "Wafer cost must be positive"),
  downtimePerFailure: z.number().min(0),
  downtimeCostPerHour: z.number().min(0),
});
```

**Affects:** Input validation, error messages, form handling

### Infrastructure & Deployment

#### Deployment: Vercel

**Decision:** Use Vercel as primary deployment platform

**Configuration:**
- **Platform:** Vercel (free tier)
- **Fallback:** GitHub Pages (if Vercel unavailable)
- **Branch strategy:** `main` → production auto-deploy
- **Preview deployments:** Automatic on PR creation
- **HTTPS:** Automatic via Vercel
- **Custom domain:** Optional (e.g., roi-calculator.pfeiffer.com)

**Rationale:**
- Zero-config deployment for Vite + React
- Free tier sufficient for MVP usage
- Preview deployments for testing before merge
- Built-in HTTPS (NFR-S4 compliance)
- Excellent performance (global CDN)

**Affects:** Deployment workflow, CI/CD, domain configuration

### Decision Impact Analysis

**Implementation Sequence:**
1. Project initialization (Vite + React + TypeScript + Tailwind)
2. Zustand store setup with TypeScript interfaces
3. React Router configuration with route structure
4. UI primitive components (Button, Input, Card, Toast)
5. Analysis components (AnalysisCard, InputPanel, ResultsPanel)
6. Calculation logic (pure functions in lib/)
7. Global Analysis view
8. PDF generation
9. Solutions module (V11)
10. Vercel deployment configuration

**Cross-Component Dependencies:**
- All components depend on Zustand store for state
- Calculation results depend on both Analysis data and GlobalParams
- PDF generation depends on all analysis data + calculation results
- Solutions module depends on aggregated analysis data
- Routing affects all view components

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 6 categories where developers/AI agents could make different choices

These patterns ensure consistent, compatible code across all development efforts.

### Naming Patterns

#### Code Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| **Components** | PascalCase | `AnalysisCard`, `InputPanel` |
| **Component Files** | PascalCase.tsx | `AnalysisCard.tsx` |
| **Hooks** | camelCase with `use` prefix | `useAnalysis`, `useCalculation` |
| **Functions** | camelCase | `calculateROI`, `formatCurrency` |
| **Variables** | camelCase | `analysisId`, `waferCost` |
| **Constants** | SCREAMING_SNAKE_CASE | `DEFAULT_DETECTION_RATE` |
| **Types/Interfaces** | PascalCase | `Analysis`, `GlobalParams` |
| **Enums** | PascalCase + PascalCase values | `WaferType.Mono`, `WaferType.Batch` |

#### File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| **Components** | PascalCase.tsx | `AnalysisCard.tsx` |
| **Hooks** | camelCase.ts | `useAnalysis.ts` |
| **Utilities** | kebab-case.ts | `pdf-generator.ts` |
| **Types** | index.ts in types folder | `types/index.ts` |
| **Tests** | *.test.ts(x) co-located | `AnalysisCard.test.tsx` |
| **Styles** | globals.css or co-located | `globals.css` |

### Structure Patterns

#### Test Location

**Pattern:** Co-located tests (test file next to source file)

```
src/components/analysis/
├── AnalysisCard.tsx
├── AnalysisCard.test.tsx    # Co-located
├── InputPanel.tsx
└── InputPanel.test.tsx      # Co-located
```

**Rationale:** Easier maintenance — test is always next to the code it tests.

#### Export Style

**Pattern:** Named exports only (no default exports)

```typescript
// ✅ CORRECT
export function AnalysisCard() { ... }
export const useAnalysis = () => { ... }

// ❌ AVOID
export default function AnalysisCard() { ... }
```

**Rationale:** Better refactoring support, more reliable auto-imports.

#### Barrel Exports

**Pattern:** Index files for folder-level exports

```typescript
// src/components/analysis/index.ts
export { AnalysisCard } from './AnalysisCard';
export { InputPanel } from './InputPanel';
export { ResultsPanel } from './ResultsPanel';
```

### TypeScript Patterns

#### Interface vs Type

**Pattern:** Interface for objects, Type for unions/primitives

```typescript
// Interface for object shapes
interface Analysis {
  id: string;
  name: string;
  pumpQuantity: number;
}

// Type for unions and primitives
type WaferType = 'mono' | 'batch';
type FailureRateMode = 'percentage' | 'absolute';
```

#### Props Definition

**Pattern:** Inline for simple, separate interface for complex

```typescript
// Simple component - inline props
function Button({ label, onClick }: { label: string; onClick: () => void }) { ... }

// Complex component - separate interface
interface InputPanelProps {
  analysis: Analysis;
  onUpdate: (updates: Partial<Analysis>) => void;
  disabled?: boolean;
}
function InputPanel({ analysis, onUpdate, disabled = false }: InputPanelProps) { ... }
```

### State Management Patterns (Zustand)

#### Selector Usage

**Pattern:** ALWAYS use selectors to prevent unnecessary re-renders

```typescript
// ✅ CORRECT - selector prevents re-render when unrelated state changes
const analyses = useStore((state) => state.analyses);
const globalParams = useStore((state) => state.globalParams);

// ❌ WRONG - re-renders on ANY state change
const { analyses, globalParams } = useStore();
```

#### Action Naming

**Pattern:** Verb + Noun format

```typescript
// ✅ CORRECT
addAnalysis, updateAnalysis, deleteAnalysis, duplicateAnalysis
setActiveAnalysis, updateGlobalParams, resetToDefaults

// ❌ WRONG
analysis, setAnalysis, analysisUpdate
```

#### Immutable Updates

**Pattern:** Spread operator for all state updates

```typescript
// ✅ CORRECT - immutable update
set((state) => ({
  analyses: state.analyses.map(a =>
    a.id === id ? { ...a, ...updates } : a
  )
}));

// ❌ WRONG - direct mutation
set((state) => {
  const analysis = state.analyses.find(a => a.id === id);
  analysis.name = newName; // MUTATION - NEVER DO THIS
  return state;
});
```

### Error Handling Patterns

#### User-Facing Errors

**Pattern:** Toast notifications via store

```typescript
// Store includes toast state
interface AppState {
  toast: { message: string; type: 'success' | 'error' | 'warning' } | null;
  showToast: (message: string, type: 'success' | 'error' | 'warning') => void;
  hideToast: () => void;
}

// Usage examples
showToast('PDF exported successfully', 'success');
showToast('Failed to generate PDF. Please try again.', 'error');
showToast('Some inputs are missing', 'warning');
```

#### Validation Errors

**Pattern:** Inline error messages below input fields

```typescript
{errors.waferCost && (
  <span className="text-red-500 text-sm mt-1">{errors.waferCost.message}</span>
)}
```

#### Console Logging

**Pattern:** Prefixed logs for easy filtering

```typescript
// ✅ CORRECT - prefixed for filtering in DevTools
console.log('[ROI] Calculation result:', result);
console.error('[PDF] Generation failed:', error);
console.warn('[Validation] Unusual value detected:', value);

// ❌ WRONG - unprefixed
console.log(result);
```

### Styling Patterns (Tailwind)

#### Class Organization

**Pattern:** Layout → Spacing → Typography → Colors → Effects

```typescript
// ✅ CORRECT - organized by category
<div className="flex flex-col gap-4 p-6 text-sm text-gray-700 bg-white rounded-lg shadow-md">

// ❌ WRONG - random order
<div className="shadow-md p-6 flex text-gray-700 bg-white gap-4 rounded-lg flex-col text-sm">
```

#### Conditional Classes

**Pattern:** Use clsx for conditional class composition

```typescript
import { clsx } from 'clsx';

<button className={clsx(
  'px-4 py-2 rounded font-medium transition-colors',
  isActive
    ? 'bg-red-600 text-white hover:bg-red-700'
    : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
  disabled && 'opacity-50 cursor-not-allowed'
)}>
```

### Enforcement Guidelines

**All developers/AI agents MUST:**

1. Follow PascalCase/camelCase naming conventions as specified
2. Use Zustand selectors (never direct store destructuring)
3. Write immutable state updates (spread operator)
4. Co-locate tests with source files
5. Use named exports (no default exports)
6. Prefix console logs with component/module name
7. Organize Tailwind classes by category

**Pattern Verification:**
- ESLint rules enforce naming conventions
- TypeScript strict mode catches type violations
- Code review checklist includes pattern compliance

### Pattern Examples

**Good Example - Complete Component:**

```typescript
// src/components/analysis/AnalysisCard.tsx
import { clsx } from 'clsx';
import { useStore } from '@/stores/app-store';
import type { Analysis } from '@/types';

interface AnalysisCardProps {
  analysis: Analysis;
  isActive?: boolean;
}

export function AnalysisCard({ analysis, isActive = false }: AnalysisCardProps) {
  const setActiveAnalysis = useStore((state) => state.setActiveAnalysis);

  const handleClick = () => {
    console.log('[AnalysisCard] Selected:', analysis.id);
    setActiveAnalysis(analysis.id);
  };

  return (
    <article
      className={clsx(
        'flex flex-col gap-2 p-4',
        'text-sm text-gray-700 bg-white',
        'rounded-lg border shadow-sm cursor-pointer',
        'transition-all duration-200',
        isActive ? 'border-red-600 shadow-md' : 'border-gray-200 hover:border-red-400'
      )}
      onClick={handleClick}
    >
      <h3 className="font-semibold text-gray-900">{analysis.name}</h3>
      <p className="text-xs text-gray-500">{analysis.pumpModel} • {analysis.pumpQuantity} pumps</p>
    </article>
  );
}
```

**Anti-Patterns to Avoid:**

```typescript
// ❌ WRONG - default export
export default function analysisCard() { ... }

// ❌ WRONG - direct store destructuring
const { analyses, setActiveAnalysis } = useStore();

// ❌ WRONG - mutation
state.analyses.push(newAnalysis);

// ❌ WRONG - unprefixed log
console.log(analysis);

// ❌ WRONG - unorganized Tailwind
className="shadow-sm p-4 flex border gap-2"
```

## Project Structure & Boundaries

### Complete Project Directory Structure

```
argos-roi-calculator/
├── README.md
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── .env.example
├── .gitignore
├── .eslintrc.cjs
├── .prettierrc
│
├── public/
│   ├── favicon.ico
│   ├── pfeiffer-logo.svg
│   └── argos-logo.svg
│
├── src/
│   ├── main.tsx                          # App entry point
│   ├── App.tsx                           # Root component + Router setup
│   ├── index.css                         # Tailwind imports + global styles
│   ├── vite-env.d.ts                     # Vite type declarations
│   │
│   ├── components/
│   │   ├── navigation/
│   │   │   ├── index.ts                  # Barrel export
│   │   │   ├── NavigationBar.tsx         # Main nav (Analyses/Global/Solutions)
│   │   │   ├── NavigationBar.test.tsx
│   │   │   ├── Breadcrumb.tsx            # Location breadcrumb
│   │   │   ├── Breadcrumb.test.tsx
│   │   │   ├── FocusSidebar.tsx          # Analysis list in Focus Mode
│   │   │   └── FocusSidebar.test.tsx
│   │   │
│   │   ├── analysis/
│   │   │   ├── index.ts
│   │   │   ├── AnalysisCard.tsx          # Dashboard card for one analysis
│   │   │   ├── AnalysisCard.test.tsx
│   │   │   ├── InputPanel.tsx            # All inputs for one analysis
│   │   │   ├── InputPanel.test.tsx
│   │   │   ├── ResultsPanel.tsx          # ROI results display
│   │   │   ├── ResultsPanel.test.tsx
│   │   │   ├── FailureRateToggle.tsx     # % vs absolute toggle
│   │   │   ├── FailureRateToggle.test.tsx
│   │   │   ├── WaferTypeSelector.tsx     # Mono/Batch radio
│   │   │   └── WaferTypeSelector.test.tsx
│   │   │
│   │   ├── global/
│   │   │   ├── index.ts
│   │   │   ├── GlobalSidebar.tsx         # Detection rate + service cost
│   │   │   ├── GlobalSidebar.test.tsx
│   │   │   ├── GlobalAnalysisView.tsx    # Aggregated results
│   │   │   ├── GlobalAnalysisView.test.tsx
│   │   │   ├── ComparisonTable.tsx       # Side-by-side analysis comparison
│   │   │   └── ComparisonTable.test.tsx
│   │   │
│   │   ├── solutions/                    # V11 Module
│   │   │   ├── index.ts
│   │   │   ├── SolutionsForm.tsx         # Technical specs form
│   │   │   ├── SolutionsForm.test.tsx
│   │   │   ├── ArchitectureDiagram.tsx   # ARGOS system visualization
│   │   │   └── ArchitectureDiagram.test.tsx
│   │   │
│   │   ├── pdf/
│   │   │   ├── index.ts
│   │   │   ├── PDFExportButton.tsx       # Export trigger button
│   │   │   ├── PDFExportButton.test.tsx
│   │   │   └── PDFPreview.tsx            # Optional preview (future)
│   │   │
│   │   └── ui/                           # Primitive components
│   │       ├── index.ts
│   │       ├── Button.tsx
│   │       ├── Button.test.tsx
│   │       ├── Input.tsx
│   │       ├── Input.test.tsx
│   │       ├── Toggle.tsx
│   │       ├── Toggle.test.tsx
│   │       ├── Card.tsx
│   │       ├── Card.test.tsx
│   │       ├── Toast.tsx
│   │       ├── Toast.test.tsx
│   │       └── Spinner.tsx
│   │
│   ├── hooks/
│   │   ├── index.ts
│   │   ├── useAnalysis.ts                # CRUD operations on analyses
│   │   ├── useAnalysis.test.ts
│   │   ├── useCalculation.ts             # ROI calculation hook
│   │   ├── useCalculation.test.ts
│   │   ├── usePDF.ts                     # PDF generation hook
│   │   ├── usePDF.test.ts
│   │   └── useValidation.ts              # Form validation hook
│   │
│   ├── lib/
│   │   ├── calculations.ts               # Pure ROI formulas
│   │   ├── calculations.test.ts
│   │   ├── validation.ts                 # Zod schemas
│   │   ├── validation.test.ts
│   │   ├── pdf-generator.ts              # jsPDF template logic
│   │   ├── pdf-generator.test.ts
│   │   ├── constants.ts                  # Default values, config
│   │   └── utils.ts                      # Formatting, helpers
│   │
│   ├── stores/
│   │   ├── app-store.ts                  # Zustand store
│   │   └── app-store.test.ts
│   │
│   ├── types/
│   │   └── index.ts                      # All TypeScript interfaces
│   │
│   └── pages/                            # Route components
│       ├── Dashboard.tsx                 # Grid of analysis cards
│       ├── FocusMode.tsx                 # Single analysis detail
│       ├── GlobalAnalysis.tsx            # Aggregated view
│       └── Solutions.tsx                 # V11 technical scoping
│
├── tests/
│   └── e2e/                              # Playwright E2E tests (future)
│       ├── smoke.spec.ts
│       └── pdf-export.spec.ts
│
└── docs/
    └── architecture.md                   # Link to _bmad-output version
```

### Architectural Boundaries

#### Component Boundaries

```
┌─────────────────────────────────────────────────────────────────┐
│                        App.tsx (Router)                         │
├─────────────────────────────────────────────────────────────────┤
│  NavigationBar                                                  │
├───────────────────────┬─────────────────────────────────────────┤
│   GlobalSidebar       │           Main Content Area             │
│   (always visible)    │  ┌─────────────────────────────────┐   │
│                       │  │  Dashboard (Grid of Cards)       │   │
│   • Detection Rate    │  │  or                              │   │
│   • Service Cost      │  │  FocusMode (InputPanel+Results)  │   │
│                       │  │  or                              │   │
│                       │  │  GlobalAnalysis (Aggregation)    │   │
│                       │  │  or                              │   │
│                       │  │  Solutions (V11 Form)            │   │
│                       │  └─────────────────────────────────┘   │
└───────────────────────┴─────────────────────────────────────────┘
```

#### State Boundaries (Zustand)

```
┌─────────────────────────────────────────────────────────────┐
│                     AppStore (Zustand)                       │
├─────────────────────────────────────────────────────────────┤
│  State                     │  Actions                        │
│  ─────────────────────────│──────────────────────────────── │
│  • analyses[]              │  • addAnalysis()                 │
│  • activeAnalysisId        │  • updateAnalysis()              │
│  • globalParams            │  • deleteAnalysis()              │
│  • toast                   │  • duplicateAnalysis()           │
│  • unsavedChanges          │  • setActiveAnalysis()           │
│                            │  • updateGlobalParams()          │
│                            │  • showToast() / hideToast()     │
└────────────────────────────┴────────────────────────────────┘
```

#### Data Flow

```
User Input → InputPanel → useValidation → Zod Schema
                                ↓ (valid)
                          useStore.updateAnalysis()
                                ↓
                          AppStore (state update)
                                ↓
                          useCalculation hook
                                ↓
                          calculations.ts (pure functions)
                                ↓
                          ResultsPanel (display)
```

### Requirements to Structure Mapping

#### FR Category to File Mapping

| FR Category | Primary Files |
|-------------|---------------|
| **Analysis Management** (FR1-FR8) | `stores/app-store.ts`, `hooks/useAnalysis.ts`, `pages/Dashboard.tsx` |
| **Data Input & Calculation** (FR9-FR24) | `components/analysis/InputPanel.tsx`, `lib/calculations.ts` |
| **Input Validation** (FR25-FR29) | `lib/validation.ts`, `hooks/useValidation.ts` |
| **Global Parameters** (FR30-FR34) | `components/global/GlobalSidebar.tsx`, `stores/app-store.ts` |
| **Aggregation** (FR35-FR38) | `pages/GlobalAnalysis.tsx`, `components/global/GlobalAnalysisView.tsx` |
| **Export PDF** (FR39-FR44) | `lib/pdf-generator.ts`, `components/pdf/PDFExportButton.tsx` |
| **Solutions Module** (FR45-FR54) | `pages/Solutions.tsx`, `components/solutions/*` |
| **Session State** (FR55-FR58) | `stores/app-store.ts` |

#### Cross-Cutting Concerns Mapping

| Concern | Files |
|---------|-------|
| **State Management** | `stores/app-store.ts` |
| **Routing** | `App.tsx`, `pages/*.tsx` |
| **Validation** | `lib/validation.ts`, `hooks/useValidation.ts` |
| **Calculations** | `lib/calculations.ts`, `hooks/useCalculation.ts` |
| **PDF Generation** | `lib/pdf-generator.ts`, `hooks/usePDF.ts` |
| **Toast Notifications** | `stores/app-store.ts`, `components/ui/Toast.tsx` |
| **Styling** | `index.css`, `tailwind.config.ts` |

### Integration Points

#### Internal Communication

- **Components → Store:** Via `useStore` hook with selectors
- **Components → Calculations:** Via `useCalculation` hook
- **Components → Validation:** Via `useValidation` hook
- **Pages → Components:** Props passing for specific data

#### Data Flow Patterns

1. **Input → Calculation → Display:**
   - InputPanel captures user input
   - Zod validates input
   - Store updates analysis data
   - useCalculation computes results
   - ResultsPanel displays computed values

2. **Global Params → All Analyses:**
   - GlobalSidebar modifies params
   - Store updates globalParams
   - All analyses recompute via useCalculation
   - All ResultsPanels update

3. **Analyses → PDF:**
   - PDFExportButton triggers export
   - usePDF hook gathers all data
   - pdf-generator.ts creates PDF
   - Browser downloads file

### File Organization Patterns

#### Configuration Files (Root Level)

| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts, metadata |
| `vite.config.ts` | Build config, path aliases (@/) |
| `tailwind.config.ts` | Pfeiffer brand colors, typography tokens |
| `tsconfig.json` | TypeScript strict configuration |
| `.env.example` | Environment variable template |
| `.eslintrc.cjs` | ESLint rules for code quality |
| `.prettierrc` | Code formatting rules |

#### Source Organization Principles

| Directory | Principle |
|-----------|-----------|
| `components/` | Feature-based organization (navigation, analysis, global, etc.) |
| `hooks/` | Reusable business logic, one hook per concern |
| `lib/` | Pure functions, no React dependencies |
| `stores/` | Single Zustand store for simplicity |
| `types/` | Centralized TypeScript definitions |
| `pages/` | Route-level container components |

#### Test Organization

| Pattern | Location |
|---------|----------|
| Unit tests | Co-located `*.test.tsx` files |
| Hook tests | Co-located `*.test.ts` files |
| Lib tests | Co-located `*.test.ts` files |
| E2E tests | `tests/e2e/` directory |

### Development Workflow Integration

#### Development Server

```bash
npm run dev          # Start Vite dev server (port 5173)
npm run test         # Run Vitest in watch mode
npm run lint         # ESLint check
npm run build        # Production build
npm run preview      # Preview production build
```

#### Build Process

1. TypeScript compilation (strict mode)
2. Vite bundling with Rollup
3. Tailwind CSS purging
4. Asset optimization
5. Output to `dist/` directory

#### Deployment Flow

1. Push to `main` branch
2. Vercel auto-detects Vite project
3. Runs `npm run build`
4. Deploys `dist/` to CDN
5. HTTPS automatically enabled

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices are fully compatible:
- React 18 + TypeScript 5.x: Native support
- React 18 + Vite 5.x: Official plugin @vitejs/plugin-react
- Zustand + React Router 6: Both designed for React 18
- Tailwind CSS + Vite: Official @tailwindcss/vite plugin
- jsPDF + html2canvas: Standard client-side PDF combination
- Zod + TypeScript: Automatic type inference

**Pattern Consistency:**
All implementation patterns align with technology choices:
- Named exports supported by TypeScript/ESLint
- Zustand selectors optimize React rendering
- Co-located tests supported by Vitest
- Feature-based folders follow React conventions

**Structure Alignment:**
Project structure fully supports all architectural decisions:
- Clear component boundaries per feature
- State management centralized in stores/
- Pure utilities isolated in lib/
- Types centralized in types/

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**
- FR1-FR8 (Analysis Management): ✅ Zustand store, useAnalysis hook
- FR9-FR24 (Data Input & Calculation): ✅ InputPanel, calculations.ts
- FR25-FR29 (Input Validation): ✅ Zod schemas, useValidation hook
- FR30-FR34 (Global Parameters): ✅ GlobalSidebar, store propagation
- FR35-FR38 (Aggregation): ✅ GlobalAnalysisView, ComparisonTable
- FR39-FR44 (PDF Export): ✅ jsPDF, pdf-generator.ts
- FR45-FR54 (Solutions V11): ✅ Solutions page, dedicated components
- FR55-FR58 (Session State): ✅ Zustand in-memory state

**Total: 58/58 FRs architecturally supported**

**Non-Functional Requirements Coverage:**
- NFR-P1 (<100ms calculations): ✅ Zustand selectors, pure functions
- NFR-P2/P3 (<3-5s PDF): ✅ jsPDF client-side generation
- NFR-P4 (<200ms navigation): ✅ React Router, no SSR
- NFR-P5 (<2s page load): ✅ Vite bundle optimization
- NFR-P6 (5 concurrent analyses): ✅ Zustand efficient state
- NFR-S1 (No server transmission): ✅ 100% client-side architecture
- NFR-S2 (Ephemeral storage): ✅ Zustand in-memory
- NFR-S3 (Client-side PDF): ✅ jsPDF, no cloud
- NFR-S4 (HTTPS): ✅ Vercel auto-HTTPS
- NFR-R1 (0 critical bugs): ✅ TypeScript strict, Vitest
- NFR-R5 (2h session stability): ✅ Zustand memory management

**Total: 12/12 NFRs architecturally addressed**

### Implementation Readiness Validation ✅

**Decision Completeness:**
- All critical decisions documented with versions ✅
- Implementation patterns comprehensive with examples ✅
- Consistency rules clear and enforceable ✅
- 28 patterns defined across 7 categories ✅

**Structure Completeness:**
- ~80 files explicitly defined ✅
- All directories specified ✅
- Integration points clearly mapped ✅
- Component boundaries well-defined ✅

**Pattern Completeness:**
- Naming conventions: 14 rules defined ✅
- Structure patterns: 4 patterns defined ✅
- State management: 3 patterns defined ✅
- Error handling: 3 patterns defined ✅
- Styling: 2 patterns defined ✅

### Gap Analysis Results

**Critical Gaps:** None identified ✅

**Important Gaps (Addressed in Architecture):**
- Tailwind brand colors → Configure in tailwind.config.ts
- Path aliases → Configure in vite.config.ts + tsconfig.json

**Nice-to-Have (Post-MVP):**
- E2E tests with Playwright
- Storybook component library
- CI/CD GitHub Actions pipeline
- Performance monitoring

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (Medium)
- [x] Technical constraints identified (100% client-side)
- [x] Cross-cutting concerns mapped (5 concerns)

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified (8 technologies)
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**
- [x] Naming conventions established (14 rules)
- [x] Structure patterns defined (4 patterns)
- [x] Communication patterns specified
- [x] Process patterns documented (error handling, loading)

**✅ Project Structure**
- [x] Complete directory structure defined (~80 files)
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** ✅ READY FOR IMPLEMENTATION

**Confidence Level:** HIGH

**Key Strengths:**
- 100% client-side architecture ensures data security (NFR-S1)
- Mature, well-documented technology stack
- Explicit patterns prevent implementation conflicts
- Complete FR→file mapping for traceability
- No complex backend dependencies

**Areas for Future Enhancement:**
- E2E testing infrastructure (post-MVP)
- Component documentation (Storybook)
- Performance monitoring (production)

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Refer to this document for all architectural questions

**First Implementation Priority:**
```bash
npm create vite@latest argos-roi-calculator -- --template react-ts
cd argos-roi-calculator
npm install
npm install -D tailwindcss @tailwindcss/vite
npm install jspdf html2canvas zustand react-router-dom zod clsx
npm install -D @types/html2canvas
```

