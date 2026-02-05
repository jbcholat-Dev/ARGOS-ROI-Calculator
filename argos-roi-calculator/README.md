# ARGOS ROI Calculator V10

Live sales engineering platform for Pfeiffer Vacuum predictive maintenance (semiconductor vacuum pumps).

## Project Overview

**Product**: ARGOS ROI Calculator V10
**Owner**: JB Cholat (Product Marketing / Service Leadership, ARGOS Platform)
**Domain**: Semiconductor predictive maintenance (vacuum pumps)
**Purpose**: Enable real-time, process-specific ROI calculations during client meetings using their actual operational data

V10 replaces V9 (single-page HTML calculator with 3 fixed categories) with a multi-analysis platform supporting per-process granularity, aggregated views, and PDF export.

## Tech Stack

- **Framework**: React 19 with TypeScript 5.x
- **Build Tool**: Vite 7.x
- **Styling**: Tailwind CSS 4.x with Pfeiffer brand colors
- **State Management**: Zustand (ultra-lightweight)
- **Routing**: React Router 6
- **Validation**: Zod
- **PDF Export**: jsPDF + html2canvas
- **Deployment**: Vercel (auto-HTTPS)

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Available Scripts

```bash
npm run dev      # Start Vite dev server with HMR
npm run build    # Build for production
npm run preview  # Preview production build locally
npm run lint     # Run ESLint checks
npm run test     # Run Vitest tests
```

## Project Structure

```
src/
├── components/       # React components
│   ├── navigation/   # NavigationBar, Breadcrumb, FocusSidebar
│   ├── analysis/     # AnalysisCard, InputPanel, ResultsPanel
│   ├── global/       # GlobalSidebar, GlobalAnalysisView, ComparisonTable
│   ├── solutions/    # SolutionsForm, ArchitectureDiagram (V11)
│   ├── pdf/          # PDFExportButton, PDFTemplate
│   └── ui/           # Primitive components (Button, Input, Card, etc.)
├── hooks/            # Custom React hooks
├── lib/              # Pure utility functions (calculations, PDF generation)
├── stores/           # Zustand state management
├── types/            # TypeScript type definitions
├── pages/            # Route-level components
├── main.tsx          # Application entry point
├── App.tsx           # Root component
└── index.css         # Tailwind CSS imports + global styles
```

## Development Guidelines

### Naming Conventions

- **Components**: PascalCase (`AnalysisCard`, `InputPanel`)
- **Hooks**: camelCase with `use` prefix (`useAnalysis`, `useCalculation`)
- **Functions**: camelCase (`calculateROI`, `formatCurrency`)
- **Constants**: SCREAMING_SNAKE_CASE (`DEFAULT_DETECTION_RATE`)

### Import/Export Patterns

- **Named exports only** (no default exports)
- Barrel exports via `index.ts` files
- Path aliases: `@/components`, `@/lib`, `@/stores`, `@/hooks`, `@/types`

### Tailwind Class Organization

Layout → Spacing → Typography → Colors → Effects

```tsx
// ✅ CORRECT
<div className="flex flex-col gap-4 p-6 text-sm text-gray-700 bg-white rounded-lg shadow-md">

// ❌ WRONG
<div className="shadow-md p-6 flex text-gray-700 bg-white gap-4 rounded-lg flex-col text-sm">
```

### State Management

- Use Zustand with selectors to prevent unnecessary re-renders
- Immutable updates only (spread operator)

```tsx
// ✅ CORRECT - selector prevents re-render when unrelated state changes
const analyses = useStore((state) => state.analyses);

// ❌ WRONG - re-renders on ANY state change
const { analyses } = useStore();
```

## Pfeiffer Brand Colors

```typescript
pfeiffer-red: #CC0000       // Primary brand color
pfeiffer-red-dark: #A50000  // Hover states
roi-negative: #CC0000       // ROI < 0%
roi-warning: #FF8C00        // ROI 0-15%
roi-positive: #28A745       // ROI > 15%
surface-canvas: #F1F2F2     // Background
surface-card: #FFFFFF       // Card backgrounds
surface-alternate: #E7E6E6  // Alternate rows
```

## Architecture Documents

Full architecture documentation is available in:
- `_bmad-output/planning-artifacts/architecture.md`
- `_bmad-output/planning-artifacts/prd.md`
- `_bmad-output/planning-artifacts/epics.md`

## Target Clients

- GF Dresden
- ST Rousset
- NXP

**Critical Insight**: Semiconductor clients share sensitive failure rates only verbally during meetings (never in writing). V10 captures and processes this data live, all client-side (no server transmission per NFR-S1).

## License

Internal Pfeiffer Vacuum tool - Not for public distribution

## Contact

**Product Owner**: JB Cholat
**Platform**: ARGOS (Pfeiffer Vacuum Predictive Maintenance)
