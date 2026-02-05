---
stepsCompleted: [1, 2, 3, 4]
workflowStatus: complete
completedDate: '2026-02-05'
inputDocuments:
  - prd.md
  - architecture.md
  - ux-design-specification.md
epicCount: 6
storyCount: 29
frCount: 58
frCoverage: "58/58 (100%)"
validationStatus: "All checks passed"
partyModeDecisions:
  - "Epic structure: 6 epics with complete value delivery per epic"
  - "Epic 2 kept intact as Minimum Viable Analysis"
  - "Epic 1 includes navigation with placeholders for user guidance"
---

# ROI Calculator - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for ROI Calculator, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

**Analysis Management (FR1-FR8)**
- FR1: Users can create a new process-specific analysis
- FR2: Users can name each analysis with custom process nomenclature
- FR3: Users can rename an existing analysis
- FR4: Users can navigate between multiple analyses (2-5 per session)
- FR5: Users can view which analysis is currently active
- FR6: Users can delete an existing analysis
- FR7: Users can duplicate an existing analysis
- FR8: System maintains all created analyses in memory during session

**Data Input & Calculation (FR9-FR24)**
- FR9: Users can enter pump type as free text
- FR10: Users can specify quantity of pumps (numeric input)
- FR11: Users can select failure rate input mode (percentage OR absolute failures)
- FR12: Users can enter failure rate as percentage directly
- FR13: Users can enter number of failures (last year), and system auto-calculates failure rate percentage
- FR14: Users can select wafer type (Mono-wafer or Batch)
- FR15: System defaults to 125 wafers when Batch type is selected
- FR16: Users can edit the default wafer quantity for Batch type
- FR17: Users can enter average wafer cost in euros
- FR18: Users can enter downtime duration per failure in hours
- FR19: Users can enter downtime cost per hour in euros
- FR20: System calculates total failure cost automatically based on inputs
- FR21: System calculates ARGOS service cost automatically based on pump quantity and global service cost parameter
- FR22: System calculates Delta Savings (failure cost - service cost) automatically
- FR23: System calculates ROI ratio (%) automatically
- FR24: System recalculates all outputs instantly when any input changes

**Input Validation & Error Handling (FR25-FR29)**
- FR25: System validates numeric inputs are positive numbers
- FR26: System provides real-time validation feedback when invalid input detected
- FR27: System prevents calculation when required inputs are missing
- FR28: System displays clear error messages when validation fails
- FR29: Users can view calculation formulas used for each output metric

**Global Parameters (FR30-FR34)**
- FR30: Users can adjust ARGOS detection rate (%) for all analyses
- FR31: System defaults ARGOS detection rate to 70%
- FR32: Users can adjust service cost per pump (EUR/year) for all analyses
- FR33: System defaults service cost per pump to EUR 2,500/year
- FR34: System recalculates all analyses when global parameters change

**Aggregation & Comparison (FR35-FR38)**
- FR35: Users can view Global Analysis aggregating all created analyses
- FR36: System calculates total savings across all processes
- FR37: System calculates overall ROI weighted by number of pumps
- FR38: System displays comparison table of all analyses side-by-side

**Export & Reporting (FR39-FR44)**
- FR39: Users can export professional PDF report at any time
- FR40: System generates PDF with Pfeiffer branding (logo, corporate colors)
- FR41: System includes executive summary in PDF (total savings, overall ROI)
- FR42: System includes per-process breakdown in PDF (inputs + calculated outputs)
- FR43: System includes global analysis summary in PDF
- FR44: System includes assumptions section in PDF (wafer costs, downtime rates, ARGOS detection rate)

**Solutions Module V11 (FR45-FR54)**
- FR45: Users can access Solutions module from Global Analysis view
- FR46: System pre-fills number of pumps to monitor from ROI analyses
- FR47: System pre-fills process types from analysis names
- FR48: Users can indicate if existing supervision network exists (Yes/No + type)
- FR49: Users can select connectivity type from predefined options (Ethernet, WiFi, 4G, OPC UA, Modbus, Other)
- FR50: Users can select existing IT infrastructure type (VM, On-premise, Cloud, Hybrid)
- FR51: Users can add additional notes in free text field
- FR52: System displays ARGOS system architecture visualization (interactive diagram)
- FR53: System provides component descriptions for each architecture element
- FR54: System generates unified PDF combining ROI analysis (V10) + Technical Architecture (V11)

**Session State Management (FR55-FR58)**
- FR55: System maintains all session data (analyses, inputs, calculations) in temporary storage during meeting session
- FR56: System functions in modern web browsers supporting required capabilities (JavaScript ES6+, PDF generation APIs, local storage)
- FR57: System maintains data integrity when switching between Analyses and Solutions views
- FR58: System handles PDF generation failures gracefully

### NonFunctional Requirements

**Performance (NFR-P1 to NFR-P6)**
- NFR-P1: ROI calculation updates complete within 100ms of input change
- NFR-P2: PDF generation (V10 only) completes within 3 seconds
- NFR-P3: PDF generation (V10+V11 unified) completes within 5 seconds
- NFR-P4: Navigation between Analyses and Solutions views completes within 200ms
- NFR-P5: Initial page load completes within 2 seconds on standard broadband (10 Mbps+)
- NFR-P6: System maintains performance with 5 concurrent analyses

**Security (NFR-S1 to NFR-S5)**
- NFR-S1: Client operational data (failure rates, wafer costs, downtime) is NOT transmitted to external servers
- NFR-S2: Session data uses ephemeral storage and is automatically cleared when session ends
- NFR-S3: PDF exports are generated client-side without cloud processing
- NFR-S4: Application is served over HTTPS to prevent man-in-the-middle attacks
- NFR-S5: No authentication required for MVP (internal tool, deployed on internal Pfeiffer network or accessible URL)

**Reliability (NFR-R1 to NFR-R5)**
- NFR-R1: Core workflow completes without blocking failures (0 bugs preventing New Analysis -> Input -> Calculate -> Global Analysis -> PDF Export)
- NFR-R2: PDF export success rate >99% (failure rate <1%)
- NFR-R3: PDF generation failures display clear recovery path (error message, retry button, session data persistence)
- NFR-R4: System validates all inputs before calculation to prevent runtime errors
- NFR-R5: Application remains functional after 2+ hours of continuous use

### Additional Requirements

**From Architecture - Starter Template:**
- Project initialization with Vite + React 18 + TypeScript 5.x
- Tailwind CSS 3.4+ via @tailwindcss/vite plugin
- jsPDF + html2canvas for client-side PDF generation
- Zustand for state management (ultra-lightweight, selector-based)
- React Router 6 for client-side routing
- Zod for runtime validation with TypeScript inference
- Vercel deployment with auto-HTTPS
- Feature-based folder organization (components/, hooks/, lib/, stores/, types/, pages/)

**From Architecture - Implementation Patterns:**
- Named exports only (no default exports)
- PascalCase for components, camelCase for hooks/functions
- Co-located tests (*.test.tsx next to source files)
- Zustand selectors to prevent unnecessary re-renders
- Immutable state updates (spread operator)
- Prefixed console logs ([ROI], [PDF], [Validation])
- Tailwind class organization: Layout -> Spacing -> Typography -> Colors -> Effects

**From UX Design - Visual Foundation:**
- Pfeiffer brand colors: #CC0000 (primary red), #A50000 (dark red for hover)
- ROI color semantics: #CC0000 (negative), #FF8C00 (0-15%), #28A745 (>15%)
- Surface colors: #F1F2F2 (canvas), #FFFFFF (cards), #E7E6E6 (alternate)
- Typography scale: 32-40px hero numbers, 20-24px headings, 16-18px labels, 14-16px body

**From UX Design - Layout Patterns:**
- Card-based multi-analysis navigation (Dashboard Grid)
- Persistent GlobalSidebar for detection rate + service cost
- Focus Mode for single-analysis editing (InputPanel + ResultsPanel)
- 3 breakpoints: 1200px (minimum), 1400px (sidebar collapse), 1920px (optimal)
- Sidebar collapse to icon-only or overlay below 1400px

**From UX Design - Interaction Patterns:**
- Instant calculation on input change (no "calculate" button)
- Modal-based analysis creation with immediate editing
- Card context menu for duplicate/delete operations
- Traffic-light ROI color coding
- Progressive revelation (start simple, grow complexity)

**From UX Design - Critical Success Moments:**
- First results appear: instant, readable, three-act story (risk -> savings -> ROI)
- Global Analysis reveal: "power moment" with aggregated savings
- PDF export: <3 seconds, professional enough for C-level sharing

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 2 | Create new analysis |
| FR2 | Epic 2 | Name analysis |
| FR3 | Epic 2 | Rename analysis |
| FR4 | Epic 3 | Navigate between analyses |
| FR5 | Epic 2 | View active analysis |
| FR6 | Epic 3 | Delete analysis |
| FR7 | Epic 3 | Duplicate analysis |
| FR8 | Epic 2 | Maintain analyses in memory |
| FR9 | Epic 2 | Enter pump type |
| FR10 | Epic 2 | Specify pump quantity |
| FR11 | Epic 2 | Select failure rate mode |
| FR12 | Epic 2 | Enter failure rate percentage |
| FR13 | Epic 2 | Enter failures count with auto-calc |
| FR14 | Epic 2 | Select wafer type |
| FR15 | Epic 2 | Default 125 wafers for Batch |
| FR16 | Epic 2 | Edit wafer quantity |
| FR17 | Epic 2 | Enter wafer cost |
| FR18 | Epic 2 | Enter downtime duration |
| FR19 | Epic 2 | Enter downtime cost |
| FR20 | Epic 2 | Calculate total failure cost |
| FR21 | Epic 2 | Calculate ARGOS service cost |
| FR22 | Epic 2 | Calculate Delta Savings |
| FR23 | Epic 2 | Calculate ROI ratio |
| FR24 | Epic 2 | Instant recalculation |
| FR25 | Epic 2 | Validate positive numbers |
| FR26 | Epic 2 | Real-time validation feedback |
| FR27 | Epic 2 | Prevent calc with missing inputs |
| FR28 | Epic 2 | Display error messages |
| FR29 | Epic 2 | View calculation formulas |
| FR30 | Epic 3 | Adjust detection rate |
| FR31 | Epic 2 | Default detection rate 70% |
| FR32 | Epic 3 | Adjust service cost |
| FR33 | Epic 2 | Default service cost EUR 2,500 |
| FR34 | Epic 3 | Recalculate on global param change |
| FR35 | Epic 4 | View Global Analysis |
| FR36 | Epic 4 | Calculate total savings |
| FR37 | Epic 4 | Calculate weighted ROI |
| FR38 | Epic 4 | Display comparison table |
| FR39 | Epic 5 | Export PDF |
| FR40 | Epic 5 | Pfeiffer branding in PDF |
| FR41 | Epic 5 | Executive summary in PDF |
| FR42 | Epic 5 | Per-process breakdown in PDF |
| FR43 | Epic 5 | Global summary in PDF |
| FR44 | Epic 5 | Assumptions section in PDF |
| FR45 | Epic 6 | Access Solutions from Global Analysis |
| FR46 | Epic 6 | Pre-fill pump count |
| FR47 | Epic 6 | Pre-fill process types |
| FR48 | Epic 6 | Supervision network input |
| FR49 | Epic 6 | Connectivity type selection |
| FR50 | Epic 6 | Infrastructure type selection |
| FR51 | Epic 6 | Additional notes field |
| FR52 | Epic 6 | Architecture diagram |
| FR53 | Epic 6 | Component descriptions |
| FR54 | Epic 6 | Unified PDF V10+V11 |
| FR55 | Epic 1 | Session data persistence |
| FR56 | Epic 1 | Browser compatibility |
| FR57 | Epic 6 | Data integrity between views |
| FR58 | Epic 5 | PDF failure handling |

**Coverage Summary:** 58/58 FRs mapped to epics

## Epic List

### Epic 1: Foundation & UI Shell

**Goal:** Establish the technical foundation and navigable application shell with Pfeiffer branding, enabling the development team to build features on a solid architecture and providing users with a clear view of the application structure.

**User Outcome:** Application is accessible with functional navigation between all main views (Dashboard, Focus Mode, Global Analysis, Solutions). Each view displays appropriate placeholder content guiding users toward the intended workflow.

**Scope:**
- Project initialization: Vite + React 18 + TypeScript 5.x + Tailwind CSS
- Zustand store setup (base structure for analyses and global params)
- React Router 6 with route definitions
- UI primitive components: Button, Input, Card, Toast, Toggle, Spinner
- NavigationBar with Analyses / Global Analysis / Solutions segments
- Responsive layout: GlobalSidebar + Content area
- Pfeiffer branding: colors (#CC0000), logo placement
- Placeholder pages with guidance text ("Create your first analysis", etc.)
- Vercel deployment configuration

**FRs Covered:** FR55, FR56
**NFRs Addressed:** NFR-P5 (page load <2s), NFR-S4 (HTTPS)

---

### Epic 2: Single Analysis Creation & ROI Calculation

**Goal:** Enable users to create a complete ROI analysis for a single process, from data entry to instant results display. This is the "Minimum Viable Analysis" that delivers the first critical success moment.

**User Outcome:** JB can create a named analysis, enter all client data (pump details, failure rates, wafer costs, downtime), and see ROI results calculated instantly. Marc witnesses his operational data transformed into quantified business value in real-time.

**Scope:**
- Analysis creation modal with naming
- InputPanel with all data fields:
  - Equipment: pump type (text), pump quantity (number)
  - Failure rate: dual-mode toggle (percentage OR absolute count with auto-calc)
  - Wafer: type selector (Mono/Batch), quantity (default 125 for Batch), cost
  - Downtime: duration per failure, cost per hour
- ResultsPanel with four metrics:
  - Total Failure Cost (without ARGOS)
  - ARGOS Service Cost
  - Delta Savings
  - ROI Ratio (%) with traffic-light color coding
- ROI calculation engine in lib/calculations.ts (pure functions)
- Zod validation schemas with inline error feedback
- GlobalSidebar with default values (detection rate 70%, service cost EUR 2,500)
- Formula tooltip/expandable showing calculation methodology
- Real-time recalculation on any input change (<100ms)

**FRs Covered:** FR1, FR2, FR3, FR5, FR8, FR9-FR29, FR31, FR33
**NFRs Addressed:** NFR-P1 (<100ms calculations), NFR-R4 (input validation), NFR-S1 (client-side only)

---

### Epic 3: Multi-Analysis Management

**Goal:** Enable users to manage multiple analyses (2-5) during a client session with fluid navigation, duplication for what-if scenarios, and global parameter adjustments that propagate to all analyses.

**User Outcome:** JB can create multiple process-specific analyses, navigate between them via card-based dashboard, duplicate analyses to test scenarios, and adjust global ARGOS parameters that instantly update all ROI calculations.

**Scope:**
- Dashboard Grid view with AnalysisCard components
- Card displays: process name, pump count, key ROI metrics
- Active analysis indicator (visual highlight)
- Card context menu: Rename, Duplicate, Delete
- Click-to-open navigation (card -> Focus Mode)
- GlobalSidebar: editable detection rate and service cost
- Global parameter propagation to all analyses
- Confirmation dialog for delete action

**FRs Covered:** FR4, FR6, FR7, FR30, FR32, FR34
**NFRs Addressed:** NFR-P4 (<200ms navigation), NFR-P6 (5 concurrent analyses)

---

### Epic 4: Global Analysis & Comparison

**Goal:** Deliver the "power moment" where Marc sees the aggregated impact across all analyzed processes, creating the memorable anchor that drives internal championship.

**User Outcome:** Marc sees total savings and overall ROI aggregated across all processes (e.g., "EUR 3.8M total savings across 3 critical tool groups"). Side-by-side comparison table enables quick analysis of which processes deliver the highest value.

**Scope:**
- GlobalAnalysisView page with hero metrics display
- Aggregated calculations:
  - Total savings across all processes
  - Overall ROI weighted by pump count
  - Total pumps monitored
- ComparisonTable: side-by-side view of all analyses
- Visual design: large typography for hero numbers, Pfeiffer accent colors
- "Power moment" styling (bold totals, clear visual hierarchy)
- Navigation to individual analyses from comparison table

**FRs Covered:** FR35, FR36, FR37, FR38
**NFRs Addressed:** NFR-R5 (2h+ session stability)

---

### Epic 5: PDF Export & Reporting

**Goal:** Generate a professional PDF report that Marc can share with management and procurement without edits, serving as the permanent artifact of the co-construction session.

**User Outcome:** JB clicks "Export PDF" and receives a Pfeiffer-branded report within 3 seconds containing executive summary, per-process breakdown, global analysis, and transparent assumptions section.

**Scope:**
- PDFExportButton with progress indicator
- jsPDF + html2canvas template implementation
- PDF content structure:
  - Cover page with Pfeiffer branding and date
  - Executive summary (total savings, overall ROI, pump count)
  - Per-process breakdown (inputs + calculated outputs for each analysis)
  - Global analysis summary with comparison
  - Assumptions section (detection rate, service cost, methodology)
- Pfeiffer visual identity: logo, corporate colors, professional typography
- Error handling: retry button, error message, session data persistence
- PDF filename: "ARGOS-ROI-Analysis-{client}-{date}.pdf"

**FRs Covered:** FR39, FR40, FR41, FR42, FR43, FR44, FR58
**NFRs Addressed:** NFR-P2 (<3s PDF), NFR-R2 (>99% success), NFR-R3 (recovery path), NFR-S3 (client-side)

---

### Epic 6: Solutions Module (V11)

**Goal:** Seamlessly transition from ROI justification to technical deployment scoping, capturing infrastructure requirements while the client is engaged and generating a unified deliverable.

**User Outcome:** JB navigates to Solutions from Global Analysis, captures technical specifications (network, connectivity, infrastructure), views the ARGOS architecture diagram, and exports a unified PDF combining ROI analysis with technical architecture.

**Scope:**
- "Solutions" button in Global Analysis view
- Solutions page with pre-filled context:
  - Total pumps to monitor (from analyses)
  - Process types (from analysis names)
- Technical form fields:
  - Existing supervision network (Yes/No + type if yes)
  - Connectivity type dropdown (Ethernet, WiFi, 4G, OPC UA, Modbus, Other)
  - IT infrastructure radio (VM, On-premise, Cloud, Hybrid)
  - Additional notes textarea
- ARGOS architecture diagram (SVG-based visualization)
- Component descriptions for diagram elements
- Unified PDF export (V10 ROI + V11 Technical Architecture)
- Data integrity between Analyses and Solutions views

**FRs Covered:** FR45, FR46, FR47, FR48, FR49, FR50, FR51, FR52, FR53, FR54, FR57
**NFRs Addressed:** NFR-P3 (<5s unified PDF), NFR-P4 (<200ms navigation)


---

## Epic 1 Stories: Foundation & UI Shell

### Story 1.1: Project Initialization with Vite + React + TypeScript

**As a** developer,
**I want** a properly configured React + TypeScript project with Vite and Tailwind CSS,
**So that** I can start building components with a modern, fast development environment.

**Acceptance Criteria:**

**Given** a fresh development environment
**When** I run `npm install && npm run dev`
**Then** the application starts on localhost with hot module replacement
**And** TypeScript strict mode is enabled
**And** Tailwind CSS is configured with Pfeiffer brand colors (#CC0000, #A50000, #F1F2F2)
**And** path aliases (@/components, @/lib, @/stores) are configured
**And** ESLint and Prettier are set up per Architecture patterns

**FRs:** FR56

---

### Story 1.2: Zustand Store and TypeScript Types Setup

**As a** developer,
**I want** the core Zustand store and TypeScript interfaces defined,
**So that** I have a type-safe foundation for state management.

**Acceptance Criteria:**

**Given** the project is initialized
**When** I import from @/stores/app-store
**Then** I can access the AppState interface with analyses[], activeAnalysisId, globalParams
**And** default globalParams are set (detectionRate: 70, serviceCostPerPump: 2500)
**And** all TypeScript interfaces (Analysis, GlobalParams, CalculationResult) are exported from @/types
**And** store uses selector pattern per Architecture patterns

**FRs:** FR55

---

### Story 1.3: React Router Configuration with Route Structure

**As a** user,
**I want** to navigate between application sections via URL,
**So that** I can access Dashboard, Focus Mode, Global Analysis, and Solutions directly.

**Acceptance Criteria:**

**Given** the application is loaded
**When** I navigate to "/"
**Then** I see the Dashboard page
**When** I navigate to "/analysis/:id"
**Then** I see the Focus Mode page
**When** I navigate to "/global"
**Then** I see the Global Analysis page
**When** I navigate to "/solutions"
**Then** I see the Solutions page
**And** navigation completes within 200ms (NFR-P4)

**FRs:** FR55

---

### Story 1.4: UI Primitive Components

**As a** developer,
**I want** reusable UI primitive components (Button, Input, Card, Toast, Toggle),
**So that** I can build feature components with consistent styling.

**Acceptance Criteria:**

**Given** I import from @/components/ui
**When** I use the Button component
**Then** it renders with Pfeiffer red (#CC0000) for primary variant
**And** it has hover state (#A50000)
**And** it supports disabled state with opacity
**When** I use the Input component
**Then** it has focus ring with Pfeiffer red
**And** it supports error state with red border and error message
**When** I use the Card component
**Then** it renders with white background and subtle shadow
**When** I use the Toast component
**Then** it supports success (green), error (red), and warning (orange) variants
**And** all components follow Tailwind class organization pattern

**FRs:** None (infrastructure)

---

### Story 1.5: Application Shell with Navigation and Placeholder Pages

**As a** user,
**I want** to see the complete application structure with navigation and helpful placeholders,
**So that** I understand the application flow before all features are built.

**Acceptance Criteria:**

**Given** I load the application
**When** I see the NavigationBar
**Then** it displays "Analyses", "Global Analysis", "Solutions" navigation items
**And** it shows the ARGOS/Pfeiffer logo
**And** the current section is visually highlighted
**When** I visit Dashboard (/)
**Then** I see placeholder: "Creez votre premiere analyse" with a call-to-action
**When** I visit Global Analysis (/global)
**Then** I see placeholder: "Aucune analyse - creez-en d'abord"
**When** I visit Solutions (/solutions)
**Then** I see placeholder: "Completez vos analyses ROI d'abord"
**And** GlobalSidebar is visible on the left showing detection rate (70%) and service cost (EUR 2,500)
**And** page load completes within 2 seconds (NFR-P5)

**FRs:** FR55, FR56

---

**Epic 1 Summary:** 5 stories | FRs covered: FR55, FR56


---

## Epic 2 Stories: Single Analysis Creation & ROI Calculation

### Story 2.1: Analysis Creation Modal and Store Integration

**As a** user (JB),
**I want** to create a new analysis with a custom name,
**So that** I can start capturing client data for a specific process.

**Acceptance Criteria:**

**Given** I am on the Dashboard
**When** I click "New Analysis" button
**Then** a modal appears with a name input field
**And** the field is pre-focused for immediate typing
**When** I enter "Poly Etch - Chamber 04" and click Create
**Then** the analysis is added to the Zustand store with a unique ID
**And** I am navigated to Focus Mode for this analysis
**And** the analysis name appears in the page header
**When** I click Create without entering a name
**Then** I see an error "Analysis name is required"

**FRs:** FR1, FR2, FR8

---

### Story 2.2: Equipment Input Fields (Pump Type & Quantity)

**As a** user (JB),
**I want** to enter pump model and quantity for the analysis,
**So that** I can capture the client's equipment details.

**Acceptance Criteria:**

**Given** I am in Focus Mode for an analysis
**When** I see the InputPanel
**Then** I see "Pump Model" text input field
**And** I see "Number of Pumps" numeric input field
**When** I enter "A3004XN" in pump model
**Then** the value is saved to the analysis in store
**When** I enter "8" in pump quantity
**Then** the value is saved as a number (not string)
**When** I enter "-5" or "abc" in pump quantity
**Then** I see validation error "Must be a positive number"
**And** the invalid value is not saved

**FRs:** FR9, FR10, FR25, FR26, FR28

---

### Story 2.3: Failure Rate Dual-Mode Input

**As a** user (JB),
**I want** to enter failure rate either as percentage or as absolute count,
**So that** I can adapt to how the client shares their data.

**Acceptance Criteria:**

**Given** I am in the InputPanel
**When** I see the Failure Rate section
**Then** I see a toggle: "Percentage" / "Absolute Count"
**And** "Percentage" mode is selected by default
**When** in Percentage mode, I enter "10"
**Then** failure rate is stored as 10%
**When** I switch to "Absolute Count" mode
**Then** I see two fields: "Number of failures (last year)" and "Number of pumps" (pre-filled)
**When** I enter 3 failures with 8 pumps
**Then** the system calculates failure rate as 37.5% (3/8 * 100)
**And** the calculated percentage is displayed
**When** I switch back to Percentage mode
**Then** the calculated value (37.5%) is preserved in the percentage field

**FRs:** FR11, FR12, FR13

---

### Story 2.4: Wafer Type and Cost Inputs

**As a** user (JB),
**I want** to enter wafer type, quantity, and cost,
**So that** I can capture the client's production economics.

**Acceptance Criteria:**

**Given** I am in the InputPanel
**When** I see the Wafer section
**Then** I see radio buttons: "Mono-wafer" / "Batch"
**And** "Mono-wafer" is selected by default
**When** I select "Batch"
**Then** a "Wafers per batch" field appears with default value 125
**And** I can edit this value
**When** I see the "Average wafer cost" field
**Then** it accepts numeric input with EUR symbol displayed
**When** I enter "8000"
**Then** the value is stored as 8000
**And** it displays as "EUR 8,000" (formatted)
**When** I enter negative value
**Then** I see validation error

**FRs:** FR14, FR15, FR16, FR17, FR25, FR26

---

### Story 2.5: Downtime Input Fields

**As a** user (JB),
**I want** to enter downtime duration and cost per hour,
**So that** I can capture the client's operational impact of failures.

**Acceptance Criteria:**

**Given** I am in the InputPanel
**When** I see the Downtime section
**Then** I see "Downtime per failure (hours)" numeric input
**And** I see "Cost per hour of downtime (EUR)" numeric input
**When** I enter "6" for duration
**Then** the value is stored as 6 hours
**When** I enter "15000" for cost
**Then** the value is stored as 15000
**And** it displays as "EUR 15,000"
**When** I leave either field empty
**Then** I see validation warning "Required for calculation"

**FRs:** FR18, FR19, FR25, FR27, FR28

---

### Story 2.6: ROI Calculation Engine

**As a** developer,
**I want** pure calculation functions that compute ROI metrics,
**So that** results are accurate, testable, and perform under 100ms.

**Acceptance Criteria:**

**Given** valid analysis inputs in the store
**When** calculateTotalFailureCost is called
**Then** it returns: (pumpQuantity * failureRate/100) * (waferCost * wafersPerBatch + downtimeHours * downtimeCostPerHour)
**When** calculateArgosServiceCost is called
**Then** it returns: pumpQuantity * globalParams.serviceCostPerPump
**When** calculateSavings is called
**Then** it returns: totalFailureCost * globalParams.detectionRate/100 - argosServiceCost
**When** calculateROI is called
**Then** it returns: (savings / argosServiceCost) * 100
**And** all calculations complete within 100ms (NFR-P1)
**And** functions are pure (no side effects)
**And** functions are exported from @/lib/calculations.ts

**FRs:** FR20, FR21, FR22, FR23

---

### Story 2.7: Results Panel with Real-Time Display

**As a** user (Marc watching, JB entering),
**I want** to see ROI results update instantly as data is entered,
**So that** I can witness the business case being built in real-time.

**Acceptance Criteria:**

**Given** I am in Focus Mode with partial inputs
**When** I see the ResultsPanel
**Then** I see four metric cards: "Total Failure Cost", "ARGOS Service Cost", "Savings", "ROI"
**And** incomplete metrics show "--" or "Enter data..."
**When** all required inputs are filled
**Then** all four metrics display calculated values
**And** values update instantly (<100ms) on any input change (no button needed)
**And** "Total Failure Cost" displays in large typography (hero number)
**And** "ROI" displays with traffic-light color: red (<0%), orange (0-15%), green (>15%)
**When** I hover over a metric
**Then** I see a tooltip showing the calculation formula (FR29)

**FRs:** FR24, FR29

---

### Story 2.8: Analysis Rename and Active State Indicator

**As a** user (JB),
**I want** to rename an analysis and see which one is active,
**So that** I can correct typos and always know my context.

**Acceptance Criteria:**

**Given** I am in Focus Mode
**When** I click the analysis name in the header
**Then** it becomes editable inline
**When** I type a new name and press Enter (or blur)
**Then** the analysis is renamed in the store
**And** the new name appears immediately
**When** I clear the name and try to save
**Then** I see error "Name cannot be empty"
**Given** I have one analysis created
**When** I view the application
**Then** I see visual indicator that this analysis is "active"
**And** the active analysis ID matches the current route parameter

**FRs:** FR3, FR5

---

**Epic 2 Summary:** 8 stories | FRs covered: FR1-FR3, FR5, FR8-FR29 (FR31, FR33 in Epic 1)


---

## Epic 3 Stories: Multi-Analysis Management

### Story 3.1: Dashboard Grid with Analysis Cards

**As a** user (JB),
**I want** to see all my analyses as cards in a grid layout,
**So that** I can quickly scan and navigate between processes.

**Acceptance Criteria:**

**Given** I have 3 analyses created
**When** I navigate to Dashboard (/)
**Then** I see 3 AnalysisCard components in a responsive grid
**And** each card displays: process name, pump count, ROI percentage with traffic-light color
**And** the active analysis card has a highlighted border (Pfeiffer red)
**When** I have 0 analyses
**Then** I see the placeholder "Creez votre premiere analyse"
**And** the grid reflows from 3 columns (1920px) to 2 columns (1400px) to 1 column (1200px)
**And** the system supports up to 5 analyses without performance degradation (NFR-P6)

**FRs:** FR4, FR5

---

### Story 3.2: Card Navigation to Focus Mode

**As a** user (JB),
**I want** to click an analysis card to open its details,
**So that** I can quickly switch between processes during the meeting.

**Acceptance Criteria:**

**Given** I am on Dashboard with multiple analyses
**When** I click on an AnalysisCard
**Then** I navigate to Focus Mode (/analysis/:id) for that analysis
**And** the navigation completes within 200ms (NFR-P4)
**And** the analysis data loads instantly from Zustand store (no loading state)
**And** the clicked analysis becomes the "active" analysis
**When** I use keyboard navigation (Tab + Enter)
**Then** the same behavior occurs

**FRs:** FR4

---

### Story 3.3: Analysis Duplicate and Delete Actions

**As a** user (JB),
**I want** to duplicate an analysis for what-if scenarios and delete unwanted ones,
**So that** I can explore alternatives and clean up the session.

**Acceptance Criteria:**

**Given** I see an AnalysisCard on Dashboard
**When** I click the context menu (three-dot icon)
**Then** I see options: "Duplicate", "Delete"
**When** I click "Duplicate"
**Then** a new analysis is created with name "[Original Name] (copy)"
**And** all input values are copied from the original
**And** the duplicate appears in the grid immediately
**And** I can edit the duplicate independently without affecting the original
**When** I click "Delete"
**Then** a confirmation dialog appears: "Delete this analysis?"
**When** I confirm deletion
**Then** the analysis is removed from the store
**And** the card disappears from the grid
**And** if it was the active analysis, another one becomes active (or none if last)

**FRs:** FR6, FR7

---

### Story 3.4: Global Parameters Adjustment with Propagation

**As a** user (JB),
**I want** to adjust ARGOS detection rate and service cost globally,
**So that** I can negotiate pricing and see impact across all analyses instantly.

**Acceptance Criteria:**

**Given** I see the GlobalSidebar
**When** I see the "Detection Rate" field
**Then** it shows current value (default 70%)
**And** I can edit it (range: 0-100%)
**When** I change detection rate to 80%
**Then** all analyses in the store are recalculated immediately
**And** all visible ROI values update (<100ms)
**When** I see the "Service Cost" field
**Then** it shows current value (default EUR 2,500)
**And** I can edit it (positive number, no upper limit)
**When** I change service cost to EUR 3,000
**Then** all analyses recalculate with new service cost
**And** both fields persist during the session
**And** changes are reflected in the PDF export

**FRs:** FR30, FR32, FR34

---

**Epic 3 Summary:** 4 stories | FRs covered: FR4, FR6, FR7, FR30, FR32, FR34


---

## Epic 4 Stories: Global Analysis & Comparison

### Story 4.1: Global Analysis View with Aggregated Metrics

**As a** user (Marc viewing),
**I want** to see total savings and overall ROI across all my analyses,
**So that** I can understand the full business impact of ARGOS.

**Acceptance Criteria:**

**Given** I have 3 analyses with complete data
**When** I navigate to Global Analysis (/global)
**Then** I see hero metrics section with:
  - "Total Savings" (sum of savings across all analyses) in large typography (32-40px)
  - "Overall ROI" (weighted by pump count) with traffic-light color
  - "Total Pumps Monitored" (sum of all pump quantities)
  - "Processes Analyzed" (count of analyses)
**And** the values are formatted with EUR symbol and thousand separators
**When** I have 0 analyses
**Then** I see placeholder: "Aucune analyse - creez-en d'abord"
**And** the hero metrics use Pfeiffer branding (accent color on key numbers)

**FRs:** FR35, FR36, FR37

---

### Story 4.2: Comparison Table Side-by-Side

**As a** user (JB presenting),
**I want** to see all analyses compared side-by-side in a table,
**So that** I can discuss which processes deliver the highest value.

**Acceptance Criteria:**

**Given** I am on Global Analysis with 3 analyses
**When** I see the ComparisonTable section
**Then** I see a table with columns:
  - Process Name
  - Pumps
  - Failure Rate
  - Failure Cost
  - ARGOS Cost
  - Savings
  - ROI (%)
**And** each analysis is a row
**And** the ROI column uses traffic-light colors
**And** rows are sortable by clicking column headers (default: by Savings descending)
**When** I click on a process name
**Then** I navigate to that analysis in Focus Mode
**And** the table is scrollable horizontally on narrow viewports

**FRs:** FR38

---

### Story 4.3: Navigation Links and Session Stability

**As a** user (JB),
**I want** quick access to individual analyses and stable performance during long sessions,
**So that** I can navigate fluidly and never lose data.

**Acceptance Criteria:**

**Given** I am on Global Analysis
**When** I see an analysis in the comparison table
**Then** I can click to navigate to its Focus Mode
**When** I have used the application for 2+ hours
**Then** all data remains intact in Zustand store
**And** navigation remains responsive (<200ms)
**And** no memory leaks occur (NFR-R5)
**When** I refresh the page
**Then** session data is cleared (ephemeral by design)
**And** I see the empty state placeholder

**FRs:** FR35
**NFRs:** NFR-R5

---

**Epic 4 Summary:** 3 stories | FRs covered: FR35, FR36, FR37, FR38


---

## Epic 5 Stories: PDF Export & Reporting

### Story 5.1: PDF Export Button with Progress State

**As a** user (JB),
**I want** to trigger PDF export with clear visual feedback,
**So that** I know when the report is being generated and when it's ready.

**Acceptance Criteria:**

**Given** I have at least one analysis with complete data
**When** I see the "Export PDF" button (visible on Global Analysis and NavigationBar)
**Then** it is enabled and shows "Export PDF" label
**When** I click the button
**Then** the button shows a loading spinner and "Generating..."
**And** the button is disabled during generation
**When** generation completes successfully
**Then** the PDF downloads automatically
**And** the button returns to normal state
**And** a success toast appears: "PDF exported successfully"
**When** I have 0 analyses
**Then** the button is disabled with tooltip: "Create analyses first"

**FRs:** FR39

---

### Story 5.2: PDF Template with Pfeiffer Branding

**As a** user (Marc receiving the PDF),
**I want** a professionally branded document,
**So that** I can share it with management without embarrassment.

**Acceptance Criteria:**

**Given** PDF generation is triggered
**When** the PDF is created
**Then** it includes:
  - Cover page with Pfeiffer logo, ARGOS branding, date, and client context
  - Header/footer on each page with Pfeiffer identity
  - Professional typography (clean, readable fonts)
  - Pfeiffer color accents (#CC0000) on key elements
**And** the filename follows pattern: "ARGOS-ROI-Analysis-{date}.pdf"
**And** the PDF renders correctly when printed
**And** generation completes within 3 seconds (NFR-P2)

**FRs:** FR40

---

### Story 5.3: PDF Content Structure (Executive Summary, Breakdown, Assumptions)

**As a** user (Fab Director reading the PDF),
**I want** clear sections with executive summary, per-process details, and assumptions,
**So that** I can quickly understand the business case and verify the methodology.

**Acceptance Criteria:**

**Given** a PDF is generated with 3 analyses
**When** I open the PDF
**Then** I see the following sections in order:

**1. Executive Summary (page 1-2)**
- Total Savings across all processes (hero number)
- Overall ROI percentage
- Total pumps monitored
- Number of processes analyzed
- Key recommendation statement

**2. Per-Process Breakdown (1 page per analysis)**
- Process name as section header
- Input summary table (pump model, quantity, failure rate, wafer details, downtime)
- Results summary (Failure Cost, ARGOS Cost, Savings, ROI)
- Visual indicator for ROI status

**3. Global Analysis Summary**
- Comparison table of all processes
- Aggregated totals

**4. Assumptions & Methodology**
- Detection rate used
- Service cost per pump
- Calculation formulas explained
- Data source note: "Based on client-provided operational data"

**FRs:** FR41, FR42, FR43, FR44

---

### Story 5.4: PDF Generation Error Handling

**As a** user (JB in a client meeting),
**I want** graceful error handling if PDF generation fails,
**So that** I can recover without embarrassment.

**Acceptance Criteria:**

**Given** PDF generation is triggered
**When** an error occurs (e.g., browser limitation, memory issue)
**Then** the button returns to normal state
**And** an error toast appears: "PDF generation failed. Please try again."
**And** a "Retry" button is available in the toast
**When** I click "Retry"
**Then** generation attempts again
**And** session data is preserved (not lost due to error)
**When** the error persists after 2 retries
**Then** the toast suggests: "Try refreshing the page or reducing the number of analyses"
**And** all analysis data remains intact in the store

**FRs:** FR58
**NFRs:** NFR-R2, NFR-R3

---

**Epic 5 Summary:** 4 stories | FRs covered: FR39, FR40, FR41, FR42, FR43, FR44, FR58


---

## Epic 6 Stories: Solutions Module (V11)

### Story 6.1: Solutions Navigation from Global Analysis

**As a** user (JB),
**I want** to transition to Solutions directly from Global Analysis,
**So that** I can capture technical specs while the client is engaged.

**Acceptance Criteria:**

**Given** I am on Global Analysis with at least one analysis
**When** I see the "Solutions" button
**Then** it is prominently displayed (CTA style)
**When** I click "Solutions"
**Then** I navigate to /solutions
**And** navigation completes within 200ms (NFR-P4)
**And** my ROI analyses remain intact
**When** I have 0 analyses
**Then** the Solutions button is disabled with tooltip: "Complete ROI analyses first"

**FRs:** FR45

---

### Story 6.2: Pre-filled Context from ROI Analyses

**As a** user (JB),
**I want** Solutions to auto-populate data from my ROI analyses,
**So that** I don't re-enter information already captured.

**Acceptance Criteria:**

**Given** I have 3 analyses: "Poly Etch" (8 pumps), "Metal Dep" (12 pumps), "CVD" (6 pumps)
**When** I navigate to Solutions
**Then** I see "Total Pumps to Monitor: 26" (pre-filled, read-only)
**And** I see "Processes: Poly Etch, Metal Dep, CVD" (pre-filled, read-only)
**And** these values update if I go back and modify analyses
**And** the pre-filled section is visually distinct (gray background, "From ROI Analysis" label)

**FRs:** FR46, FR47

---

### Story 6.3: Technical Specifications Form

**As a** user (JB capturing technical context),
**I want** to enter infrastructure details for the ARGOS deployment,
**So that** Pfeiffer can prepare an accurate technical proposal.

**Acceptance Criteria:**

**Given** I am on Solutions page
**When** I see the Technical Form
**Then** I see the following fields:

**Existing Supervision Network:**
- Toggle: Yes / No
- If Yes: Text field "Network Type" appears (e.g., "SECS/GEM", "OPC UA")

**Connectivity Type:**
- Dropdown with options: Ethernet, WiFi, 4G, OPC UA, Modbus, Other
- If "Other": Text field for specification

**IT Infrastructure:**
- Radio buttons: VM, On-premise, Cloud, Hybrid

**Additional Notes:**
- Textarea for free-form comments

**And** all fields save to store on change
**And** validation allows empty fields (optional data)

**FRs:** FR48, FR49, FR50, FR51

---

### Story 6.4: ARGOS Architecture Diagram

**As a** user (Marc understanding the solution),
**I want** to see a visual diagram of the ARGOS system architecture,
**So that** I can understand how it integrates with my fab.

**Acceptance Criteria:**

**Given** I am on Solutions page
**When** I see the Architecture Diagram section
**Then** I see an SVG-based visualization showing:
  - Vacuum pumps (with count from analyses)
  - Sensors / data collection
  - Gateway / edge device
  - Connectivity layer (reflecting selected type)
  - ARGOS Cloud / On-prem platform
  - User interface / alerts
**And** each component has a hover tooltip with description
**When** I click on a component
**Then** I see an expanded description panel
**And** the diagram uses Pfeiffer brand colors
**And** the diagram is static (not interactive beyond tooltips)

**FRs:** FR52, FR53

---

### Story 6.5: Unified PDF Export (V10 + V11)

**As a** user (JB delivering complete package),
**I want** to export a single PDF containing both ROI analysis and technical architecture,
**So that** Marc has everything needed for internal discussions.

**Acceptance Criteria:**

**Given** I have completed ROI analyses and Solutions form
**When** I click "Export Complete Report" on Solutions page
**Then** a unified PDF is generated containing:

**Part 1: ROI Analysis (from Epic 5)**
- Executive Summary
- Per-process breakdown
- Global analysis
- Assumptions

**Part 2: Technical Architecture (new)**
- Deployment overview (pump count, processes)
- Infrastructure requirements (network, connectivity, IT)
- ARGOS architecture diagram (rendered as image)
- Additional notes

**And** the PDF has consistent Pfeiffer branding throughout
**And** generation completes within 5 seconds (NFR-P3)
**And** filename: "ARGOS-Complete-Proposal-{date}.pdf"
**When** I navigate between Analyses and Solutions
**Then** data integrity is maintained (FR57)

**FRs:** FR54, FR57
**NFRs:** NFR-P3

---

**Epic 6 Summary:** 5 stories | FRs covered: FR45-FR54, FR57

---

## Document Summary

| Epic | Stories | FRs Covered |
|------|---------|-------------|
| Epic 1: Foundation & UI Shell | 5 | FR55, FR56 |
| Epic 2: Single Analysis & ROI | 8 | FR1-FR3, FR5, FR8-FR29, FR31, FR33 |
| Epic 3: Multi-Analysis Management | 4 | FR4, FR6, FR7, FR30, FR32, FR34 |
| Epic 4: Global Analysis & Comparison | 3 | FR35-FR38 |
| Epic 5: PDF Export & Reporting | 4 | FR39-FR44, FR58 |
| Epic 6: Solutions Module (V11) | 5 | FR45-FR54, FR57 |

**Total: 6 Epics, 29 Stories, 58/58 FRs Covered**

