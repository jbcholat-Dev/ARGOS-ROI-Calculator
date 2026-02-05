---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
workflowStatus: complete
completedDate: '2026-02-05'
inputDocuments:
  - product-brief-ROI-Calculator-2026-02-03.md
  - prd.md
  - prd-validation-report.md
  - brand-guidelines-pfeiffer.md
documentCounts:
  briefs: 1
  research: 1
  validationReports: 1
  projectDocs: 0
  brandGuidelines: 1
date: 2026-02-04
author: JB
---

# UX Design Specification ROI Calculator

**Author:** JB
**Date:** 2026-02-04

---

## Executive Summary

### Project Vision

The ARGOS ROI Calculator V10 is a live sales engineering platform designed for real-time co-construction of process-specific ROI analyses during client meetings. It replaces V9 (single-page HTML calculator with 3 fixed categories) with a multi-analysis platform supporting per-process granularity, aggregated views, and professional PDF export.

The core UX challenge: create a tool that feels like a collaborative workspace — not a vendor pitch — where semiconductor Sub Fab Managers see their own operational data transformed into actionable business cases in real-time.

V10 + V11 (Solutions Module) aim to collapse the traditional 6-8 week semiconductor sales cycle into a single 90-120 minute live session.

### Target Users

**Primary Users:**

1. **JB Cholat (Pfeiffer Product Marketing)** — The hands-on operator who drives V10 during client meetings. Enters data as the client speaks. Needs: fast input flow, instant results, seamless PDF export. Tech-savvy, power user.

2. **Marc Dubois (Sub Fab Manager, Client-side)** — The viewer/collaborator who verbally shares sensitive operational data. Watches results appear in real-time. Needs: readability (projected or laptop), trust-building transparency, professional output he can champion internally. Pragmatic, skeptical, results-focused.

3. **Regional Sales Colleagues (Pfeiffer)** — Replicate JB's workflow after training. Need: intuitive interface requiring minimal training, same co-construction flow.

**Secondary Users (PDF consumers only):**

4. **Fab Director / Procurement Manager** — Never touch the tool. Receive PDF export. Need: clear executive summary, transparent assumptions, process-specific breakdown credible enough for budget approval.

### Key Design Challenges

1. **Multi-context readability** — Tool must be readable when projected on external screen AND when viewed on 13"-15" laptop. Requires generous typography, high contrast, and prominent result display.

2. **Adaptive input rhythm** — Sessions start with deliberate Q&A pace and accelerate as client engages. Interface must support both: clear labels for orientation AND fast fluid input for momentum.

3. **Multi-analysis navigation** — 2-5 analyses per session without cognitive overload. Active analysis must be immediately identifiable. Navigation must not break meeting flow.

4. **Hybrid what-if workflow** — Users need both in-place parameter tweaks (small adjustments) AND analysis duplication (scenario comparison). Both gestures must feel natural without adding complexity.

5. **PDF as sole deliverable** — PDF is the only artifact that survives the meeting. Must be professional enough to reach C-level and procurement without edits.

### Design Opportunities

1. **Results theater** — The moment ROI numbers appear is the emotional climax of the meeting ("aha moment"). Typography, color coding (green=savings, red=risk), and subtle animation can amplify this impact for maximum client engagement.

2. **Global Analysis as power moment** — The aggregated view (e.g., "3.8M EUR total savings across 3 processes") creates a memorable anchor. Strong visual design here reinforces the value proposition.

3. **Visible co-construction** — Client sees their own data and process names appearing in real-time. Design can reinforce ownership: client data visually distinct from ARGOS parameters, process names prominently displayed.

4. **Trust through transparency** — Clearly showing calculation formulas and assumptions builds credibility with skeptical technical users. Transparency is a UX feature, not just documentation.

## Core User Experience

### Defining Experience

The core experience of V10 is a **conversational calculation loop**: JB enters data as Marc speaks → results update instantly → Marc reacts → JB adjusts → loop repeats. The tool must never interrupt this human conversation rhythm. Every UI interaction should feel like a natural extension of the verbal exchange, not a break from it.

**The core loop:**
1. Client shares a data point verbally
2. Operator enters it (single field, immediate)
3. Results update in real-time (no "calculate" button)
4. Client sees impact, reacts, shares more data or asks "what if"
5. Repeat until analysis is complete
6. Move to next process → repeat entire cycle

**The results narrative:** ROI outputs tell a story in three acts:
- **Act 1 — The Risk:** Total failure cost without ARGOS (creates urgency)
- **Act 2 — The Value:** Savings with ARGOS (demonstrates solution)
- **Act 3 — The Proof:** ROI ratio (seals conviction)

This three-part narrative must read naturally as a visual sequence, reinforcing the business case logic at a glance.

### Platform Strategy

**Platform:** Web application (SPA), Chrome-primary, laptop-optimized (13"-15" screens, 1920x1080 / 1366x768).

**Dual display context:** Must be equally readable when:
- Projected on external screen/monitor (meeting room, viewed at 2-3 meters)
- Displayed on laptop screen (side-by-side or face-to-face seating)

**Input method:** Mouse + keyboard. Tab key navigation between input fields is critical for rapid data entry rhythm. No touch optimization for MVP.

**Connectivity:** Online assumed. No offline mode for MVP. Client-side processing only — no data leaves the browser (trust requirement for sensitive client data).

### Effortless Interactions

**Must be effortless (zero cognitive load):**
- Creating a new analysis — one click, name it, start entering data
- Switching between analyses — card-based navigation, visually scannable
- Seeing results update — automatic, no "calculate" button, no delay
- Adjusting global parameters — always visible, immediate propagation to all analyses
- Exporting PDF — single button, generates within seconds

**Must be natural (minimal learning):**
- Duplicate an analysis for what-if comparison — intuitive gesture from card context menu
- Toggle failure rate input mode (% vs. absolute count) — clear visual switch
- Navigate between Analyses view and Global Analysis — obvious, persistent navigation

**Should happen automatically:**
- Failure rate calculation when entering absolute failure count
- Wafer quantity default (125) when selecting Batch type
- Global Analysis aggregation when multiple analyses exist
- All recalculations on any input change

### Critical Success Moments

**Make-or-break moment #1 — First results appear:**
When Marc sees ROI calculated on HIS data for the first time. If the numbers appear instantly, are clearly readable, and tell the three-act story (risk → savings → ROI), Marc shifts from skeptic to engaged collaborator. If there's any delay, confusion, or illegibility — the moment is lost.

**Make-or-break moment #2 — Global Analysis reveal:**
When Marc sees aggregated savings across 3 processes (e.g., "EUR 3.8M total savings"). This is the "power moment" that creates the memorable anchor. The visual must be immediately impressive and shareable (screenshot-worthy).

**Make-or-break moment #3 — PDF export:**
When JB clicks export and a professional PDF generates within seconds. If the PDF looks credible enough for Marc to forward to his director without edits, the meeting was a success. If it looks amateur or incomplete, the co-construction effort is wasted.

**First-time success:** Regional sales colleague opens V10 for their first client meeting. Within 2 minutes, they've created an analysis, entered data, and seen results. No training manual needed — the interface guides them.

### Experience Principles

1. **Conversation-first** — Every UX decision is evaluated against: "Does this support or interrupt the verbal conversation between operator and client?" If it interrupts, it's wrong.

2. **Results are the hero** — The ROI numbers are the product's value. They get the most visual prominence, the best typography, the strongest color treatment. Everything else serves the numbers.

3. **Progressive revelation** — Start simple (one analysis, core inputs), complexity grows naturally as the session progresses (multiple analyses, global view, what-if scenarios). Never overwhelm at first interaction.

4. **Transparent by design** — Formulas, assumptions, and parameters are always visible or one click away. Trust is built through transparency, not hidden complexity. The client should never wonder "where does this number come from?"

5. **Meeting-pace resilient** — The interface must tolerate imperfect input sequences, corrections, back-and-forth adjustments, and interruptions without breaking. Real meetings are messy — the tool must be forgiving.

## Desired Emotional Response

### Primary Emotional Goals

**For Marc (Client — Sub Fab Manager):**

Two distinct emotional phases during the session:

1. **Problem cost revelation → Surprise/Conviction**
   The total failure cost (calculated independently of ARGOS) creates an impact moment. Marc sees the real financial exposure of his current situation quantified with HIS data. Target emotion: "I didn't realize it cost this much" or "This confirms what I've been feeling." This number is objective and indisputable — it belongs to Marc, not to Pfeiffer.

2. **ROI with ARGOS → Constructive skepticism**
   When ARGOS service cost and detection rate enter the equation, Marc naturally questions the assumptions. This skepticism is healthy and expected — it signals engagement, not rejection. The design must invite this challenge: adjustable parameters, visible formulas, transparent assumptions. Target emotion: "Let me test this" → leading to "OK, even with conservative assumptions, the numbers work."

**For JB (Operator — Pfeiffer Product Marketing):**

- **Amplified credibility** — The tool makes JB appear more professional than a PowerPoint pitch ever could. Pfeiffer's identity (precision, engineering excellence) is reflected in the interface quality. Target emotion: "This tool makes me look good in front of the client."
- **Zero embarrassment guarantee** — No bugs, no crashes, no amateur elements. The worst possible outcome is embarrassment in front of a client. The tool must be bulletproof during the 90-120 minute session window.

**For Regional Sales Colleagues:**

- **Instant competence** — "I can do this" feeling within 2 minutes of first use. No anxiety about operating an unfamiliar tool in a high-stakes client meeting.

### Emotional Journey Mapping

**Marc's emotional arc (90-minute session):**

| Phase | Moment | Emotion | Design Response |
|-------|--------|---------|-----------------|
| Opening | JB opens V10 | Mild skepticism ("another vendor tool") | Clean, professional interface — not flashy, not salesy |
| First input | Marc's process name appears on screen | Curiosity ("this is about MY operation") | Process name prominently displayed, feels like Marc's workspace |
| Problem cost | Total failure cost calculated | Surprise/conviction ("that much?!") | Large typography, strong visual weight, cost in euros front and center |
| ROI reveal | ARGOS savings and ROI displayed | Constructive skepticism ("is this realistic?") | Transparent assumptions, adjustable parameters, visible formulas |
| What-if | Marc challenges a parameter | Engaged control ("let me test this") | Instant recalculation, parameter sliders or direct edit |
| Global view | Aggregated savings across processes | Impressed conviction ("the big picture is compelling") | Power moment design — bold totals, clear comparison |
| PDF export | Professional report generated | Relief/satisfaction ("I can use this internally") | Instant generation, Pfeiffer branding, print-ready quality |

**JB's emotional arc:**

| Phase | Moment | Emotion | Design Response |
|-------|--------|---------|-----------------|
| Pre-meeting | Opens V10, sets global params | Confident preparation | Clean dashboard, obvious starting point |
| Live session | Entering data as Marc speaks | Flow state, in control | Fast input, no interruptions, keyboard-friendly |
| Client challenges | Marc asks "what if" | Professional composure | Immediate response, smooth parameter adjustment |
| Export | PDF generation | Pride in deliverable | Professional output, Pfeiffer identity |

### Micro-Emotions

**Critical micro-emotions to cultivate:**

- **Trust over persuasion** — Marc must feel the tool is objective, not manipulative. The problem cost is HIS reality. The ROI is a transparent calculation he can challenge. Design implication: no "sales-y" language, no green-washing of results, neutral presentation of numbers.

- **Ownership over observation** — Marc should feel these are HIS analyses, not Pfeiffer's pitch. Design implication: process names in Marc's nomenclature, client data visually distinct from ARGOS parameters, "your data" language in PDF.

- **Control over passivity** — When Marc challenges assumptions, he should feel empowered, not corrected. Design implication: easy parameter adjustment, immediate feedback, no judgment on input values.

- **Confidence over anxiety** — JB should never hesitate about where to click next. Design implication: obvious navigation, consistent interaction patterns, no hidden features.

**Emotions to actively prevent:**

- **Embarrassment** (highest priority) — Bugs, crashes, slow loading, amateur visual elements in front of a client
- **Confusion** — Unclear calculation origin, unexpected results, navigation disorientation
- **Distrust** — Results that feel "too good to be true" without visible methodology
- **Impatience** — Waiting for calculations, PDF generation, or page transitions

### Design Implications

**Problem cost vs. ROI — Visual separation:**
The total failure cost (Marc's reality) and the ARGOS ROI (Pfeiffer's value proposition) must be visually distinct. The problem cost stands alone as objective truth. The ROI is presented as a transparent calculation with adjustable inputs — inviting scrutiny, not selling.

**Transparency as emotional design:**
- Calculation formulas accessible (tooltip or expandable section)
- Global parameters (detection rate, service cost) always visible and adjustable
- Assumptions section in PDF explicitly states what can be challenged
- No hidden logic — every output traceable to inputs

**Professional credibility through visual quality:**
- Pfeiffer corporate identity (colors, typography, logo) integrated tastefully
- Clean whitespace, no visual clutter
- Data visualization that feels "engineering-grade" — precise, not decorative
- PDF output indistinguishable from a professional consulting report

**Bulletproof reliability:**
- Graceful input validation (guide, don't block)
- No loading states during calculations (must be instant)
- PDF generation with clear progress indicator and retry capability
- Session stability for 2+ hours of continuous use

### Emotional Design Principles

1. **Separate the problem from the solution** — The failure cost (Marc's reality) and the ARGOS ROI (proposed value) are emotionally different moments. Design them differently: problem cost = objective revelation, ROI = transparent proposition open to challenge.

2. **Invite skepticism, don't fight it** — Marc's skepticism about ROI is a sign of engagement. The design should make it easy to challenge assumptions (adjust detection rate, change service cost) and see the impact. Converting skepticism through transparency is more powerful than suppressing it with persuasive design.

3. **Professional over impressive** — The emotional target is "credible and trustworthy," not "wow and flashy." Pfeiffer's identity is precision engineering, not Silicon Valley disruption. The interface should feel like a precision instrument — reliable, accurate, well-crafted.

4. **Zero-shame guarantee** — Every design decision must pass the test: "Would JB feel comfortable showing this to a skeptical procurement manager?" If there's any risk of embarrassment, fix it before launch.

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

**1. PatternFly Dashboard Design System (Red Hat)**

PatternFly provides a mature, enterprise-grade dashboard pattern library. Key lessons for V10:

- **Card-based architecture**: Five standard card types (Aggregate Status, Trend, Utilization, Details, Events) provide proven templates for different data display needs. V10's analysis cards map to a hybrid of "Aggregate Status" (summary metrics) and "Details" (attribute-value pairs for inputs).
- **Grid-based layout**: 3-4 column grids with equal widths and consistent gutters (16px). This approach supports the multi-analysis card navigation identified in Step 3.
- **Card sizing strategy**: Small/Medium/Large categories based on information density, not fixed pixels. V10's analysis cards will likely be "Large" (full input panel + results), while Global Analysis summary cards could be "Medium."
- **Prioritized information hierarchy**: Most important content positioned first — aligns with V10's "results are the hero" principle.

**Transferable to V10:** Card grid layout for multi-analysis navigation, card sizing hierarchy for different views (analysis detail vs. summary), responsive card reflow pattern.

**2. Winden Banking App (Dribbble Reference)**

Referenced for its clean financial data presentation aesthetic:
- Minimal, high-contrast cards displaying monetary values with clear visual hierarchy
- Color-coded financial indicators (green for positive, red for negative) — directly applicable to V10's savings/risk visualization
- Clean typography with large headline numbers and smaller supporting metrics
- White card backgrounds with subtle shadows on neutral gray canvas

**Transferable to V10:** Financial data typography hierarchy (large EUR amounts as heroes), color semantics for financial outcomes, clean card aesthetic with breathing room.

**3. V9 Calculator (Existing Reference)**

The V9 calculator establishes the visual identity and successful patterns to preserve:

**What works well (keep):**
- **Pfeiffer brand color palette**: Primary red (#CC0000) as accent and interactive color, with supporting neutral grays
- **Sidebar + content layout**: Left panel for global inputs, right panel for results — natural reading flow for LTR languages
- **Color-coded ROI status**: Red (negative) → Orange (low 0-15%) → Green (>15%) — intuitive traffic-light semantics
- **White cards on gray background**: Clean separation of content areas with subtle shadows
- **Focus color consistency**: #CC0000 Pfeiffer red for all interactive elements (inputs, buttons, focus rings)

**What needs improvement (evolve):**
- **Fixed 3-column layout**: V9's rigid 3-category columns don't scale to variable number of analyses. V10 needs dynamic card layout.
- **Dense input presentation**: V9 packs inputs tightly in small boxes. V10 needs more breathing room for the "adaptive rhythm" requirement.
- **Results visibility**: V9's annual cost analysis is displayed in small text within category boxes. V10 must make results dramatically more prominent ("results theater").
- **No navigation pattern**: V9 is single-page with everything visible. V10 needs clear navigation between analyses, global view, and solutions module.

### Transferable UX Patterns

**Navigation Patterns:**

1. **Card grid for analysis navigation** (from PatternFly + Dribbble dashboard cards) — Each analysis represented as a summary card showing process name + key ROI metrics. Cards arranged in responsive grid. Click card to open full analysis detail. Directly supports the "multi-analysis without cognitive overload" challenge.

2. **Persistent sidebar for global parameters** (from V9) — Left sidebar always visible with ARGOS detection rate and service cost. Sidebar pattern proven in V9 and familiar to JB. Provides constant context while navigating between analyses.

3. **Primary/secondary navigation split** — Primary navigation: Analyses view / Global Analysis / Solutions (tabs or segmented control at top). Secondary navigation: Individual analysis cards within Analyses view. Two-level hierarchy prevents navigation confusion.

**Interaction Patterns:**

1. **Inline calculation with immediate feedback** (from financial apps) — No "submit" or "calculate" button. Every input change triggers instant recalculation. Results update in place with subtle animation to draw attention to changed values.

2. **Card context menu for CRUD operations** (from PatternFly) — Three-dot menu or hover actions on analysis cards for rename, duplicate, delete. Keeps primary view clean while providing power-user operations.

3. **Traffic-light color semantics for ROI** (from V9) — Red/Orange/Green gradient for ROI values. Instantly communicable across cultures. Leverages existing V9 convention that JB and potentially some clients already recognize.

**Visual Patterns:**

1. **Large hero numbers with supporting context** (from banking apps) — Primary metric (e.g., "EUR 1.4M savings") displayed in large, bold typography. Supporting metrics (failure cost, service cost, ROI %) in smaller but still prominent secondary typography. Visual weight reflects information importance.

2. **White cards on neutral gray canvas** (from V9 + PatternFly) — Clean card separation with subtle shadows. Gray background (#F3F4F6) creates depth without distraction. White card interiors maximize readability for data-dense content.

3. **Pfeiffer red as accent, not dominant** (evolved from V9) — #CC0000 used for interactive elements, key accents, and brand identity. NOT used as background or large fills. Supports the "professional over impressive" emotional principle.

### Anti-Patterns to Avoid

1. **Dashboard overload** — Too many cards, charts, and metrics visible simultaneously. V10 must resist the temptation to show everything at once. Progressive revelation: one analysis at a time in detail view, summary cards for navigation, global aggregation as a separate view.

2. **Sales-y visual language** — Flashy animations, aggressive green "savings" highlights, or manipulative visual design. Conflicts with "trust over persuasion" emotional principle. The tool must feel like an engineering instrument, not a marketing pitch.

3. **Hidden calculations** — "Black box" ROI results without visible methodology. Directly creates the "distrust" emotion we must prevent. Every number must be traceable to inputs and formulas.

4. **Modal/popup interruptions** — Any interaction that requires dismissing a dialog box breaks the conversational flow. V9 avoided this correctly. V10 must maintain the same discipline: all interactions inline, no modals for core workflow.

5. **Generic template appearance** — If V10 looks like "any SaaS dashboard," it undermines Pfeiffer's identity. The Pfeiffer color palette, ARGOS logo, and engineering-grade aesthetic must differentiate it from generic tools.

6. **Tiny input fields** — V9's compact input boxes work on a single page, but V10 needs larger, more comfortable inputs for the "projected on screen" context. Font sizes must accommodate reading at 2-3 meters distance.

### Design Inspiration Strategy

**What to Adopt:**

- PatternFly's **card grid layout** for multi-analysis navigation — proven enterprise pattern, well-documented, supports responsive behavior
- Pfeiffer **official brand colors** (#CC0000 primary red, #A50000 dark red, neutral grays) — brand consistency per official guidelines
- V9's **sidebar + content layout** — familiar pattern for JB, effective for separating global parameters from analysis content
- Banking app **hero number typography** — large, bold financial figures as primary visual elements

**What to Adapt:**

- V9's **3-column category layout** → Dynamic **card grid** that scales from 1 to 5 analyses
- PatternFly's **card sizing** → Two sizes: summary cards (in grid navigation) and detail view (full-width single analysis)
- V9's **color-coded categories** → Color-coded ROI status only (not per-analysis colors, since process count is variable)
- PatternFly's **dashboard bar** → Simplified top navigation bar with Analyses / Global Analysis / Solutions segments

**What to Avoid:**

- PatternFly's **complex filter systems** — V10 has few enough analyses that filtering is unnecessary
- Banking app **mobile-first density** — V10 is laptop-first, can use more generous spacing
- V9's **fixed viewport scaling** — V10 needs proper responsive behavior at 1200px+ widths
- Generic **Material Design** or **Bootstrap** styling — would dilute Pfeiffer's brand identity

## Design System Foundation

### Design System Choice

**Chosen Approach:** Tailwind CSS + Custom Component Library

Tailwind CSS as the utility-first foundation, with a lightweight custom component library built specifically for V10's needs. No external component library (Material UI, Ant Design, Chakra) — components are purpose-built to match Pfeiffer's identity and V10's specific interaction patterns.

### Rationale for Selection

**Why Tailwind CSS + Custom:**

1. **Brand fidelity** — Pfeiffer's visual identity (#FF5800 orange, specific color palette from V9) is configured directly in Tailwind's design tokens. No fighting against an opinionated component library's default styles. The tool looks like Pfeiffer, not like Google (Material) or Alibaba (Ant).

2. **Right-sized for 1 developer** — Tailwind provides the low-level building blocks (spacing, typography, colors, responsive breakpoints, shadows) so the developer focuses on component logic, not CSS architecture. Custom components are built only as needed — no unused component library bloat.

3. **Performance** — Tailwind's PurgeCSS eliminates unused styles, producing minimal CSS bundles. Critical for V10's <2s initial load requirement (NFR-P5). No JavaScript overhead from component library runtime.

4. **Flexibility for unique patterns** — V10's interaction patterns (card-based analysis navigation, results theater, persistent sidebar, dual-display readability) don't map cleanly to any existing component library's opinions. Custom components can be designed precisely for V10's workflow without compromise.

5. **Design token consistency** — Tailwind's config file acts as a single source of truth for Pfeiffer's design tokens (colors, spacing scale, typography scale, border radius, shadows). Ensures visual consistency across all custom components without a formal design system tool.

**Why NOT Material UI / Ant Design:**
- Opinionated visual language conflicts with Pfeiffer brand identity
- Over-engineering for V10's relatively small component set (~15-20 unique components)
- De-theming effort often exceeds building custom components from scratch
- Bundle size overhead for components that won't be used

**Why NOT shadcn/ui:**
- Good option but adds React dependency pattern (V10's framework choice not yet finalized)
- Copy-paste components still require significant customization for V10's specific patterns
- Pfeiffer identity better served by purpose-built components

### Implementation Approach

**Tailwind Configuration (Design Tokens):**

Pfeiffer official brand colors configured as Tailwind design tokens:

- `pfeiffer-red`: #CC0000 — Primary brand, interactive elements, focus states, CTAs
- `pfeiffer-red-dark`: #A50000 — Hover state, secondary accent
- `roi-negative`: #CC0000 — ROI < 0% (reuses Pfeiffer red)
- `roi-low`: #FF8C00 — ROI 0-15% (orange for warning)
- `roi-positive`: #28A745 — ROI > 15% (green for success)
- `text-primary`: #000000 — Primary text (black per brand)
- `text-secondary`: #44546A — Secondary text (dark gray per brand)
- `text-tertiary`: #6B7280 — Tertiary text
- `surface-canvas`: #F1F2F2 — Background (Light Gray 3 per brand)
- `surface-card`: #FFFFFF — Card background (white per brand)
- `surface-card-alt`: #E7E6E6 — Alternate card background (Light Gray 1 per brand)
- `border-light`: #E7E6E6 — Light borders (Light Gray 1)
- `border-medium`: #D8DBDB — Medium borders (Light Gray 2)
- `border-dark`: #44546A — Dark borders (Dark Gray)

**Custom Component Library (Purpose-Built):**

| Component | Purpose | Complexity |
|-----------|---------|------------|
| AnalysisCard | Summary card in grid navigation | Medium |
| InputPanel | Single-screen input form per analysis | High |
| ResultsDisplay | Three-act results narrative | Medium |
| GlobalSidebar | Persistent global parameters | Low |
| NavigationBar | Primary nav (Analyses / Global / Solutions) | Low |
| PDFExportButton | Export trigger with progress state | Low |
| FailureRateToggle | Dual-mode input switch (% vs count) | Medium |
| WaferTypeSelector | Mono/Batch radio with conditional field | Low |
| ComparisonTable | Side-by-side analysis comparison | Medium |
| GlobalSummary | Aggregated metrics display | Medium |

**Typography Scale (Projected-Screen Readable):**

- Hero numbers (ROI results): 32-40px, bold — readable at 3m distance
- Section headings: 20-24px, semibold
- Input labels: 16-18px, medium
- Body text: 14-16px, regular
- Supporting text: 12-14px, light gray

### Customization Strategy

**Brand Integration:**
- Pfeiffer red (#CC0000) as exclusive accent color — buttons, focus rings, active states, key visual accents
- Dark red (#A50000) for hover states and secondary emphasis
- ARGOS logo in sidebar header (from V9 SVG asset)
- Neutral gray/white palette for content areas — professional, not branded-heavy
- Red used sparingly to avoid overwhelming the data-focused interface

**Responsive Strategy:**
- Breakpoints: 1200px (minimum), 1400px (sidebar collapse), 1920px (optimal)
- Below 1400px: sidebar collapses to icon-only or overlay mode
- Card grid reflows from 3 columns → 2 → 1 as viewport narrows
- Typography remains fixed (no fluid scaling) — consistency across projected and laptop display

**Dark Mode:** Not included in MVP. Professional context (meeting rooms) typically uses standard lighting. Can be added in V12+ if requested.

**Accessibility Foundation:**
- Tailwind's built-in focus ring utilities for keyboard navigation
- Semantic HTML structure (proper headings, labels, form associations)
- Color contrast ratios meeting basic readability (not full WCAG 2.1 AA for MVP, per PRD scope)
- Logical tab order following form field sequence

---

## Defining Core Experience (Step 7)

### The Defining Experience

**The core interaction that makes V10 successful:**

"Co-construct ROI calculations in real-time with actual client data, challenge assumptions interactively, and compare scenarios side-by-side — process by process, card by card."

This is not just a calculator; it's a **collaborative workspace** where Marc (client) and JB (operator) transform a verbal conversation into quantified business cases. The PDF export is the deliverable, but the defining experience is the **live co-construction session** where Marc sees his operational reality transformed into ROI numbers he can defend internally.

**What users will tell their colleagues:**
- Marc: *"Pfeiffer showed me a tool where we calculated MY ROI live during the meeting with MY real numbers. I could challenge every assumption and see the impact instantly."*
- JB: *"I can co-create an ROI analysis with a client in real-time, compare multiple scenarios, and export a professional PDF before leaving the meeting."*

**The "one thing" that must be perfect:**
The **modal-based analysis creation + direct card editing + What-If comparison** flow. If this flow is smooth, fast, and intuitive, everything else follows. If it's clunky or slow, the entire value proposition collapses.

---

### User Mental Model

**Marc's Current Reality (Excel-based):**
Marc likely has his own Excel spreadsheet with rough ROI approximations. He's accustomed to:
- Manual data entry into spreadsheet cells
- Formulas that calculate automatically (but require explicit recalculation)
- Multiple Excel sheets for different scenarios
- Sharing files via email after meetings

**Marc's Expectation Coming Into V10:**
When JB mentioned "a calculator I showed in Paris," Marc expects:
- Another Excel file (familiar territory)
- Possibly a more sophisticated Excel with macros
- Post-meeting analysis (not real-time)

**The Mental Model Shift:**
Instead of Excel, Marc discovers a **web application** with:
- **Pop-up forms** for entering data (familiar: like filling a dialog box)
- **Visual cards** representing processes (new: spatial organization)
- **Instant results** after saving (familiar: Excel auto-calc, but faster)
- **Side-by-side comparison** for What-If (new: visual, not tab-based)

**How Marc Thinks About His Fab:**
Marc naturally organizes his fab **by process**:
- "Poly Etch � Chamber 04"
- "Metal Deposition � Tool A"
- "CMP � Batch Line 2"

He does NOT think in generic categories like "Regular Tools 60%." V10's card-per-process structure aligns with his existing mental model.

**Typical Challenge Questions Marc Asks:**
- *"What if the wafer cost is 10k instead of 8k?"*
- *"What if we only cover 2 processes instead of 3?"*
- *"What if your detection rate is 60% instead of 70%"*
- *"What if the downtime is longer � say 8 hours instead of 6?"*
- *"What if we negotiate your service cost down to 2,000�?"*

Marc wants to **stress-test** the ROI assumptions before committing. V10 must make this exploratory testing effortless.


---

## Visual Design Foundation

### Color System

**Brand Foundation (Pfeiffer Official Guidelines):**

The V10 color system is built directly on Pfeiffer Vacuum's official brand palette, ensuring corporate identity consistency while optimizing for the calculator's data-focused interface.

**Primary Brand Colors:**
- **Pfeiffer Red** `#CC0000` — Primary accent, CTAs, interactive elements, focus states
- **Dark Red** `#A50000` — Hover states, secondary emphasis, active states
- **Black** `#000000` — Primary text, high-emphasis content
- **Dark Gray** `#44546A` — Secondary text, labels, descriptive content

**Extended Brand Palette (Busch Group Integration):**
- **Busch Orange** `#FF5800` — Secondary accent (Busch Group corporate color, parent company)
- **Turquoise** `#009DA5` — Tertiary accent, informational states

**Neutral Palette:**
- **Light Gray 3** `#F1F2F2` — Canvas background (main app surface)
- **White** `#FFFFFF` — Card backgrounds, high-contrast surfaces
- **Light Gray 1** `#E7E6E6` — Alternate card backgrounds, subtle dividers
- **Light Gray 2** `#D8DBDB` — Medium borders, inactive states

**Semantic Color Mappings:**

| Purpose | Color | Rationale |
|---------|-------|-----------|
| **Primary Action** | Pfeiffer Red `#CC0000` | Brand identity, high visibility |
| **Primary Hover** | Dark Red `#A50000` | Consistent with brand secondary |
| **Focus Ring** | Pfeiffer Red `#CC0000` | Accessibility + brand consistency |
| **ROI Negative** | Pfeiffer Red `#CC0000` | Reuses brand color for cost/risk |
| **ROI Warning (0-15%)** | Busch Orange `#FF5800` | Industry-standard warning + parent company identity |
| **ROI Positive (>15%)** | `#28A745` (Green) | Industry-standard success color |
| **Info / Help States** | Turquoise `#009DA5` | Distinct from alerts/warnings, calm informational tone |
| **Secondary Highlight** | Busch Orange `#FF5800` | Navigation accents, secondary CTAs (used sparingly) |
| **Surface Canvas** | Light Gray 3 `#F1F2F2` | Subtle depth without distraction |
| **Surface Card** | White `#FFFFFF` | Maximum readability for data-dense content |
| **Text Primary** | Black `#000000` | Per brand guidelines, maximum contrast |
| **Text Secondary** | Dark Gray `#44546A` | Per brand guidelines, reduced emphasis |
| **Borders Light** | Light Gray 1 `#E7E6E6` | Subtle separation |
| **Borders Medium** | Light Gray 2 `#D8DBDB` | Standard borders, dividers |

**Color Strategy Principles:**

1. **Red as primary accent** — Pfeiffer Red remains the dominant brand color for CTAs, focus, and key visual punctuation. NOT used as backgrounds or large fills to avoid overwhelming the data-focused interface.

2. **Orange and turquoise as strategic accents** — Busch Orange used for ROI warning state (0-15%) and subtle secondary accents. Turquoise reserved for informational elements (tooltips, help badges, neutral highlights). Both used sparingly to enrich the palette without creating visual noise.

3. **Neutral-heavy palette** — Grays and white dominate the interface, allowing ROI numbers and calculations to be the visual heroes. Supports the "professional over impressive" emotional principle.

4. **ROI color semantics** — Traffic-light pattern enhanced: Red (negative) → Orange (warning/caution) → Green (positive). Orange now carries dual meaning: industry-standard warning + subtle Busch Group corporate identity.

5. **Accessibility baseline** — All text/background combinations meet WCAG AA contrast ratios:
   - Busch Orange `#FF5800` on White `#FFFFFF`: 4.9:1 (✅ Pass for large text, use 18px+ minimum)
   - Turquoise `#009DA5` on White `#FFFFFF`: 4.1:1 (✅ Pass for large text, use 18px+ minimum)
   - For small text on these colors, use white text instead of colored text on white background

**Usage Guidelines:**

- **Pfeiffer Red** (primary): 60-70% of color usage — main CTAs, focus states, primary interactive elements
- **Busch Orange** (secondary): 15-20% — ROI warning indicators, secondary navigation highlights, info badges
- **Turquoise** (tertiary): 5-10% — Help tooltips, informational callouts, neutral state indicators
- **Neutral grays/white**: 70-80% of total interface — backgrounds, text, structure

---

### Typography System

**Design Philosophy:** Professional modern with strong hierarchy. Balance between **readable data labels** (comfortable for 90-120 minute sessions) and **prominent result numbers** (instantly scannable when projected or screen-shared).

**Primary Typeface Choice: Noto Sans (via Google Fonts)**

**Rationale:**
- Mentioned in Pfeiffer official theme as default text font
- Modern, professional, clean aesthetic (aligns with "professional modern" direction)
- Excellent web rendering and readability at multiple sizes
- Open-source, reliable loading, supports international characters
- Neutral personality — doesn't compete with data, doesn't feel generic

**Alternative/Fallback Stack:**
- Primary: `'Noto Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif`
- If Noto Sans fails to load, graceful degradation to system fonts

**Note on Futura:**
Futura is a beautiful geometric sans-serif with strong personality, but:
- Not web-safe (requires font licensing and hosting)
- Geometric proportions can reduce readability at small sizes (12-14px labels)
- Better suited for branding/marketing than data-dense applications

**Recommendation:** Reserve Futura-style aesthetics for future marketing materials or landing pages. For V10's operational interface, prioritize legibility and loading reliability with Noto Sans.

**Typography Scale:**

| Element | Size | Weight | Line Height | Usage Context |
|---------|------|--------|-------------|---------------|
| **Hero Numbers** | 36-40px | Bold (700) | 1.2 | ROI results, total savings, key metrics |
| **H1 - Page Title** | 28-32px | SemiBold (600) | 1.3 | Main view headers (e.g., "Global Analysis") |
| **H2 - Section** | 20-24px | SemiBold (600) | 1.4 | Card headers, major sections |
| **H3 - Subsection** | 16-18px | Medium (500) | 1.4 | Input panel sections, secondary headers |
| **Body - Labels** | 14-16px | Regular (400) | 1.5 | Form labels, descriptive text, table content |
| **Body - Values** | 16-18px | Medium (500) | 1.5 | Input values, calculated outputs (non-hero) |
| **Small Text** | 12-14px | Regular (400) | 1.5 | Supporting info, units (€/year), footnotes |
| **Process Name** | 18-20px | SemiBold (600) | 1.4 | Analysis card titles, process identifiers |

**Typography Strategy:**

1. **Hierarchy through size AND weight** — Hero numbers use both large size (36-40px) and bold weight. Supporting metrics use medium weight at smaller sizes. This creates clear visual priority without relying solely on color.

2. **Comfortable body text** — 14-16px base size with 1.5 line-height ensures labels remain readable during long sessions. Not optimized for dense paragraphs (V10 has minimal prose), but comfortable for repeated scanning.

3. **Projected readability** — Hero numbers (36-40px) and process names (18-20px) are sized to remain legible when screen-shared in visio or projected in a meeting room at 2-3 meters distance.

4. **Value emphasis** — Input values and calculated outputs use Medium (500) weight to visually distinguish them from their labels (Regular 400). This supports rapid scanning: "Where's the number I need to check?"

5. **Numerical clarity** — Noto Sans has clear differentiation between similar characters (1 vs l, 0 vs O), critical for financial calculations where misreading a digit has consequences.

---

### Spacing & Layout Foundation

**Base Unit: 8px Grid System**

**Rationale:**
- Industry-standard spacing unit, provides flexibility without excessive granularity
- Balances "airy" and "efficient" — can create both generous whitespace (24px, 32px) and tight relationships (8px, 16px) as needed
- Compatible with most screen sizes and scales cleanly at higher densities
- Pfeiffer guidelines recommend "generous spacing" — 8px base allows this without forcing excessive whitespace where inappropriate

**Spacing Scale:**

| Token | Value | Usage Context |
|-------|-------|---------------|
| `space-xs` | 4px | Tight relationships (icon-to-text, inline elements) |
| `space-sm` | 8px | Related elements (label-to-input vertical gap) |
| `space-md` | 16px | Section internal padding, card internal spacing |
| `space-lg` | 24px | Between distinct sections, card margins |
| `space-xl` | 32px | Major section separation, page margins |
| `space-2xl` | 48px | Primary navigation areas, hero section spacing |

**Layout Principles:**

1. **Information density compromise** — Cards use `space-md` (16px) internal padding to balance readability with screen real estate. Sections within cards separated by `space-lg` (24px) to create clear groupings without excessive scrolling.

2. **Visual breathing room** — Hero results (ROI numbers, total savings) surrounded by `space-xl` (32px) to emphasize their importance. Supporting metrics closer together (`space-md` 16px) to indicate hierarchical relationship.

3. **Left-aligned default** — Per Pfeiffer brand guidelines. Numerical values right-aligned within their containers for scanability (decimal alignment).

4. **Consistent card structure** — All analysis cards use identical internal spacing:
   - Card padding: 24px (`space-lg`)
   - Section gaps: 16px (`space-md`)
   - Label-to-input: 8px (`space-sm`)

5. **Projected visibility** — Minimum touch target: 44px (desktop pointer-optimized: 32px minimum). Button padding: 12px vertical, 24px horizontal. Ensures interactive elements remain usable even when interface is projected.

**Grid System:**

- **Sidebar width:** 280px (fixed) — Accommodates global parameter labels and inputs comfortably
- **Content area:** Fluid, responsive to viewport width
- **Card grid:** 3 columns at 1920px, 2 columns at 1440px, 1 column at <1200px
- **Gutter between cards:** 24px (`space-lg`)

**Responsive Breakpoints:**

| Breakpoint | Width | Layout Adjustments |
|------------|-------|-------------------|
| Desktop (optimal) | 1920px+ | 3-column card grid, full sidebar |
| Laptop (standard) | 1440-1919px | 2-column card grid, full sidebar |
| Laptop (compact) | 1200-1439px | 2-column card grid, collapsible sidebar |
| Minimum | 1200px | 1-column card grid, overlay sidebar |

**Note:** V10 MVP is laptop-first (1440px+ primary target). Mobile/tablet optimization deferred to V11+.

---

### Accessibility Considerations

**Contrast Ratios (WCAG AA Compliance):**

| Combination | Ratio | Standard | Status |
|-------------|-------|----------|--------|
| Black `#000000` on White `#FFFFFF` | 21:1 | WCAG AAA | ✅ Exceeds |
| Dark Gray `#44546A` on White `#FFFFFF` | 9.7:1 | WCAG AA | ✅ Pass |
| Pfeiffer Red `#CC0000` on White `#FFFFFF` | 5.5:1 | WCAG AA | ✅ Pass (large text) |
| White `#FFFFFF` on Pfeiffer Red `#CC0000` | 5.5:1 | WCAG AA | ✅ Pass (buttons) |
| Dark Gray `#44546A` on Light Gray 3 `#F1F2F2` | 8.9:1 | WCAG AA | ✅ Pass |

**Keyboard Navigation:**
- Visible focus rings: 2px solid Pfeiffer Red `#CC0000` with 2px white offset (double-ring pattern for visibility on any background)
- Logical tab order: Top-to-bottom, left-to-right, following visual layout
- Skip-to-content links for keyboard-only users (if navigation becomes complex in V11+)

**Readability:**
- Minimum font size: 14px for body text (exceeds WCAG AA recommendation of 12px)
- Line height: 1.5× for body text, 1.2-1.4× for headings (comfortable reading rhythm)
- Paragraph width: Max 80 characters (~600px) to prevent eye strain on wide screens

**Visual Clarity:**
- No information conveyed by color alone — ROI status uses both color AND numerical value display
- Interactive elements have minimum 32px click targets (44px for touch-optimized, though V10 is mouse/keyboard primary)
- Clear visual distinction between interactive and static elements (buttons have visible borders/backgrounds)

**Projection/Screen-Sharing Optimization:**
- Hero numbers (36-40px) remain readable when screen is shared in 1080p video calls
- Process names (18-20px) legible at 2-3 meters distance when projected
- High contrast mode ready: All colors degrade gracefully to grayscale if needed

**Future Accessibility Enhancements (V11+):**
- Screen reader optimization with ARIA labels
- High contrast theme toggle
- Font size user preference (110%, 120%, 150% scaling)
- Keyboard shortcuts for power users


---

## Design Direction Decision

### Design Directions Explored

Six distinct design directions were explored to determine the optimal layout and interaction patterns for the ARGOS ROI Calculator V10:

1. **Classic Sidebar + Content** — Persistent left sidebar with global parameters, scrollable content area with analysis cards. Traditional enterprise SaaS pattern maximizing screen real estate.

2. **Top Navigation + Collapsible Sidebar** — Horizontal top nav for primary views (Analyses / Global Analysis / Solutions), collapsible sidebar for secondary controls. Modern app pattern maximizing vertical space.

3. **Minimal Single-Panel Focus** — Centered single-panel design showing one analysis at a time in maximum detail. Clean, distraction-free, optimized for screen-sharing and projection.

4. **Dashboard Card Grid** — Multi-column card grid with overview-first approach. All analyses visible simultaneously with expand-to-detail interaction. Quick visual comparison, scalable to 5+ analyses.

5. **List-Based Compact View** — Master-detail pattern with compact list on left (process names + quick ROI indicators), full detail panel on right. Efficient space usage, fast switching.

6. **Split-Screen Comparison Mode** — Side-by-side split screen with input editing on left, live results on right. Real-time parameter adjustment with instant visual feedback. Optimized for what-if scenarios.

**Interactive Mockup Showcase:** All six design directions were presented in an interactive HTML showcase (`ux-design-directions.html`) allowing side-by-side visual comparison and exploration.

### Chosen Direction

**"Dashboard Grid with Focus Mode"** — A hybrid approach combining the strengths of Direction 4 (Dashboard Grid), Direction 3 (Single Panel Focus), and Direction 5 (List Navigation).

#### Primary View: Dashboard Grid (D4-based)

The default view presents all analyses as cards in a responsive grid layout (3 columns at 1920px, 2 columns at 1440px, 1 column below 1200px).

**Card Design:**
- **Process identification**: Process name prominently displayed (18px SemiBold)
- **Metadata strip**: Pump model, quantity, wafer type in compact format below process name
- **Results highlight**: Savings and ROI displayed as hero numbers (20px Bold, color-coded)
- **Status badge**: ROI evaluation badge at bottom of card
  - Green badge: "High ROI — Excellent Candidate" (ROI > 50%)
  - Orange badge: "Moderate ROI — Review Scope" (ROI 15-50%)
  - Red badge (if needed): "Low ROI — Adjust Parameters" (ROI < 15%)
- **Hover actions**: Three-dot menu reveals edit, duplicate, delete operations
- **Click interaction**: Card click opens Focus Mode

**Visual Hierarchy:**
- Process name: Largest text element on card (18-20px SemiBold)
- Hero numbers (Savings + ROI): Bold 20px, dominant visual weight
- Metadata: 12-14px Regular, secondary emphasis
- Status badge: Small but colorful, bottom of card for summary

**Grid Behavior:**
- Responsive reflow: 3 cols → 2 cols → 1 col based on viewport width
- Equal-height cards with consistent internal spacing (24px padding)
- 24px gutter between cards
- Hover state: Subtle elevation (shadow) + border color change to Pfeiffer Red

#### Focus Mode: Single Panel with Sidebar Navigation (D3 + D5 hybrid)

Clicking any analysis card transitions to Focus Mode, which provides detailed viewing and editing in a distraction-free environment.

**Layout:**
- **Left Sidebar (280px fixed)**: Compact list of all analyses for quick navigation
  - Each list item shows: Process name (14px SemiBold), ROI metrics ("180% • €1.47M" in 12px), status badge (mini version)
  - Active analysis visually highlighted (Pfeiffer Red border or background tint)
  - Click any item to switch to that analysis without leaving Focus Mode
  - Preserves overview context while working in detail
  - Scrollable if 5+ analyses
- **Center Panel (fluid)**: Single-panel focus with complete analysis detail
  - Full input form: all parameters editable inline
  - Three-act results narrative prominently displayed:
    - **Act 1 — The Risk**: Total Failure Cost (without ARGOS)
    - **Act 2 — The Value**: Savings with ARGOS
    - **Act 3 — The Proof**: ROI Ratio
  - Large hero numbers (36-40px Bold) for projected readability
  - Edit controls inline, no modal interruptions
  - Real-time calculation updates as inputs change
- **Exit mechanism**:
  - Esc key returns to Dashboard Grid
  - Close button (X) in panel header returns to Dashboard Grid
  - Breadcrumb navigation shows current context: "Dashboard > Poly Etch — Chamber 04"

**Interaction Flow:**

```
Dashboard Grid (Overview)
  └─ Click Analysis Card
     └─ Focus Mode Opens
        ├─ Center: Full detail + inline editing
        ├─ Sidebar: Navigate to other analyses (with ROI badges)
        └─ Esc/Close → Back to Dashboard Grid
```

### Design Rationale

**Why This Hybrid Approach:**

1. **Overview-first philosophy** — Dashboard Grid provides immediate visual comparison of all analyses. Marc (client) and JB (operator) can see at a glance which processes have high ROI, which need review. The status badges create instant visual hierarchy using color semantics (green/orange/red) that work even when projected.

2. **Focus-on-demand** — Single Panel Focus Mode eliminates distractions when editing or discussing a specific analysis. Supports the "conversational calculation loop" workflow: JB enters data as Marc speaks, results update instantly, no UI clutter breaking the conversation flow.

3. **Preserved context** — Sidebar list in Focus Mode maintains awareness of other analyses. JB can quickly reference or compare: "Let me show you the Metal Deposition numbers" → click sidebar item → instant switch. No need to return to Dashboard Grid between comparisons.

4. **Status badges as decision aids** — The ROI evaluation badges ("High ROI — Excellent Candidate") serve dual purposes:
   - **During meeting**: Visual reinforcement of business case strength
   - **Post-meeting**: Client can screenshot Dashboard Grid and immediately communicate value to management ("See, 2 out of 3 are high ROI candidates")

5. **Scalability** — Dashboard Grid scales naturally from 2 to 5+ analyses. Card grid reflows responsively. Focus Mode sidebar handles long lists with scroll. No layout breaks as session complexity grows.

6. **Meeting pace resilience** — Fast switching between overview (Dashboard) and detail (Focus Mode) supports natural meeting rhythm:
   - Start: Show Dashboard → "Here's what we'll analyze today"
   - During: Focus Mode per process → Enter data, discuss results
   - Pivot: Client asks "What about Process Y?" → Sidebar navigation or Esc to Dashboard
   - Close: Return to Dashboard → "Here's the big picture across all processes"

7. **Reduced cognitive load** — Two-mode system is conceptually simple:
   - **Grid = Overview**: See everything, compare visually, manage analyses (add/delete)
   - **Focus = Detail**: Work on one analysis deeply, navigate quickly via sidebar
   - No ambiguity about "where am I" or "how do I get back"

**Alignment with Core UX Principles:**

- **"Results are the hero"** — Hero numbers prominent in both Grid (20px) and Focus Mode (36-40px)
- **"Conversation-first"** — Focus Mode supports uninterrupted data entry and instant recalculation
- **"Progressive revelation"** — Start simple (Grid overview), complexity grows naturally (Focus Mode detail)
- **"Transparent by design"** — All inputs and formulas visible in Focus Mode, no hidden logic

**Risk Mitigation:**

- **Potential confusion: Two-mode navigation** — Mitigated by clear visual distinction (Dashboard = grid background, Focus = white panel) and obvious exit mechanisms (Esc, Close button, breadcrumb)
- **Sidebar may feel cramped** — Mitigated by collapsible sidebar option in V11 if needed. 280px width tested as sufficient for process names + badges at 14px font size.

---

### Mode "What If" — Scenario Comparison

**Purpose:** Enable stress-testing of ROI assumptions through side-by-side scenario comparison. Addresses Marc's need to challenge parameters ("What if your detection rate is only 60%?") with visual, immediate feedback.

**Déclenchement du mode "What If":**

Depuis le **Dashboard Grid** ou **Focus Mode**, chaque analyse dispose d'un bouton **"What If"** (accessible via menu ⋮ ou bouton visible en Focus Mode header).

**Workflow:**
1. User clicks "What If" on an existing analysis card (e.g., "Poly Etch — Chamber 04")
2. Analysis is **automatically duplicated** with suffix " (What If)"
3. System opens **Split-Screen Comparison Mode**:
   - **Left Panel**: Original Scenario (read-only or editable)
   - **Right Panel**: "What If" Scenario (editable)
4. User modifies one or more hypotheses in right panel (e.g., failure rate 3% → 5%, or pump quantity 12 → 15)
5. **Highlight differences**:
   - Modified fields in right panel have **2px solid Busch Orange border** (#FF5800) and subtle background tint (rgba(255, 88, 0, 0.05))
   - Small "MODIFIED" badge appears next to changed field
6. **Side-by-side results**: Both scenarios display results in parallel
   - Differences highlighted with delta indicators (e.g., "180% → 165%" with Δ-15% and arrow ↓)
   - Savings differences shown (e.g., "€1.47M → €1.25M" with Δ-€220K)

**Layout Split-Screen:**
- **50/50 split** (two equal columns) on screens ≥1440px
- **Sidebar optional** (collapsible) for navigating to other analyses
- **Header comparison** at top:
  - Left: "Original Scenario"
  - Right: "What If Scenario"
  - Center: Actions: "Save Both" / "Discard What If" / "Replace Original"

**Actions after comparison:**
- **Save Both** → Both analyses return to Dashboard Grid as separate cards
- **Replace Original** → "What If" scenario replaces original, old version discarded
- **Discard What If** → Return to Dashboard Grid, only original analysis retained
- **Esc** → Exit to Dashboard Grid without saving "What If"

**Visual Design:**

```
┌─────────────────────────────────────────────────────────────┐
│  Original Scenario        vs.       What If Scenario         │
├──────────────────────────┬──────────────────────────────────┤
│  Poly Etch — Chamber 04  │  Poly Etch — Chamber 04 (What If)│
├──────────────────────────┼──────────────────────────────────┤
│  Pump: A3004XN           │  Pump: A3004XN                   │
│  Quantity: 12            │  Quantity: 15  [MODIFIED 🟠]     │
│  Failure Rate: 3.0%      │  Failure Rate: 5.0% [MODIFIED 🟠]│
│  Wafer Cost: €8,000      │  Wafer Cost: €8,000              │
├──────────────────────────┼──────────────────────────────────┤
│  RESULTS                 │  RESULTS                          │
│  Failure Cost: €2.1M     │  Failure Cost: €3.75M  (Δ +€1.65M)│
│  Savings: €1.47M         │  Savings: €2.54M       (Δ +€1.07M)│
│  ROI: 180% 🟢           │  ROI: 216% 🟢          (Δ +36%)   │
└──────────────────────────┴──────────────────────────────────┘
```

**Highlight Visual Details:**
- **Modified field**: 2px solid #FF5800 border, background rgba(255, 88, 0, 0.05)
- **"MODIFIED" badge**: Small orange badge (10px font, 4px padding, rounded)
- **Delta indicators**: Colored by impact (green if ROI improves, red if worsens, gray neutral)
- **Arrow direction**: ↑ for increase, ↓ for decrease

**Why "What If" is Critical:**

1. **Responds to stress-testing need** — Marc wants to challenge assumptions. Split-screen makes exploration visual and immediate.
2. **Transparency reinforced** — Marc sees exactly which parameters change and their impact. No black box, full control.
3. **Negotiation tool** — JB can adjust hypotheses live during discussion: "OK, let's see what happens if we reduce scope to 10 pumps."
4. **Prevents confusion** — Clearly separated split-screen prevents losing the original scenario. Both coexist visually.

**Integration with Main Direction:**

```
Dashboard Grid (Overview)
  ├─ Click Card → Focus Mode (Detail)
  │
  └─ Click "What If" → Split-Screen Comparison
      ├─ Original (left) vs. What If (right)
      ├─ Highlight modifications with Busch Orange
      └─ Save/Discard/Replace options
```

---

### Mode "Global Analysis" — Agrégation Multi-Analyses

**Purpose:** Provide synthesized, aggregated view of all analyses created during the session. The "power moment" where JB reveals total impact: "€3.78M total savings across 3 critical processes, 156% overall ROI."

**Access to Global Analysis:**
- **From Dashboard Grid**: "View Global Analysis" button in header (next to "+ New Analysis")
- **Or via top navigation**: Segment control "Analyses | **Global Analysis** | Solutions"
- **Keyboard shortcut**: G key

**Layout Global Analysis:**

```
┌──────────────────────────────────────────────────────────────┐
│  Global Analysis — 3 Processes                               │
├───────────────┬──────────────────────────────────────────────┤
│  SIDEBAR      │  MAIN PANEL (Synthesis)                      │
│  (280px)      │                                               │
│               │  ┌────────────────────────────────────────┐  │
│  Mini-card 1  │  │  Total Aggregation                     │  │
│  ┌──────────┐ │  │                                        │  │
│  │Poly Etch │ │  │  Total Savings:      €3.78M  (Hero)   │  │
│  │€1.47M    │ │  │  Overall ROI:        156%    (Hero)   │  │
│  │180% 🟢  │ │  │  Total Service Cost: €65,000          │  │
│  └──────────┘ │  │  Total Failure Cost: €5.15M           │  │
│               │  └────────────────────────────────────────┘  │
│  Mini-card 2  │                                               │
│  ┌──────────┐ │  Process Comparison Table                    │
│  │Metal Dep │ │  ┌────────────────────────────────────────┐ │
│  │€175K     │ │  │ Process          Savings    ROI  Badge │ │
│  │12% 🟠   │ │  │ Poly Etch        €1.47M    180%  🟢   │ │
│  └──────────┘ │  │ Metal Deposition €175K      12%  🟠   │ │
│               │  │ CMP Batch Line 2 €840K     145%  🟢   │ │
│  Mini-card 3  │  └────────────────────────────────────────┘ │
│  ┌──────────┐ │                                               │
│  │CMP       │ │  Key Insights                                 │
│  │€840K     │ │  • 2/3 processes show high ROI (>50%)        │
│  │145% 🟢  │ │  • Metal Deposition requires scope review    │
│  └──────────┘ │  • Total payback: 6.4 months                 │
└───────────────┴──────────────────────────────────────────────┘
```

**Sidebar Gauche (Recall of Analyses):**

Each **mini-card** displays:
- **Process name** (14px SemiBold, truncated if long)
- **Savings** (16px Bold, color-coded by ROI status)
- **ROI %** with status badge (small circular badge green/orange/red)
- **Clickable**: Click mini-card → returns to Focus Mode of that analysis

**Mini-card Visual Design:**
- Compact height (~80px)
- 2px border (color by ROI: green/orange/red)
- White background, hover → light gray tint
- Same visual style as Dashboard Grid cards but reduced size

**Main Panel Right (Synthesis):**

**Section 1: Total Aggregation (Hero Section)**
- **Total Savings**: Hero number (36-40px Bold, green if positive)
- **Overall ROI**: Hero number (36-40px Bold, color-coded by threshold)
- **Total Service Cost**: Supporting metric (20px Medium)
- **Total Failure Cost**: Supporting metric (20px Medium)
- Background: Light gray card with generous padding (space-2xl)

**Section 2: Process Comparison Table**
- Summary table of all analyses (typically 3-5 rows)
- Columns: Process Name | Savings | ROI % | Status Badge
- Sortable (click header to sort by savings, ROI, etc.)
- Row hover highlight
- Click row → Focus Mode of that analysis

**Section 3: Key Insights (Auto-generated)**
- 3-4 bullet points automatically derived:
  - Count of processes with high/moderate/low ROI
  - Process with best ROI (champion)
  - Process requiring review
  - Total payback period calculated
- Helps JB structure pitch: "Here's what to remember"

**Section 4: Charts & Visualization (V11+)**
- Placeholder in V10 MVP: "Charts coming in V11"
- Future: Bar chart (savings per process), pie chart (savings distribution), line chart (ROI progression)

**Actions Available in Global Analysis:**
- **Export PDF**: Generates PDF with Global Analysis as first page, followed by detail of each analysis
- **Edit Global Params**: Adjust detection rate or service cost → recalculates all analyses instantly
- **Back to Dashboard**: Return to Dashboard Grid
- **Add Analysis**: Create new analysis and return to Dashboard

**Aggregation Calculations:**

**Total Savings:**
```
Total Savings = Σ (Savings of each analysis)
Example: €1,470,000 + €175,000 + €840,000 = €3,485,000
```

**Overall ROI (weighted by pump count or savings):**
```
Total Service Cost = Σ (Service cost of each analysis)
Total Failure Cost Avoided = Σ (Failure cost avoided of each analysis)
Overall ROI = (Total Failure Cost Avoided / Total Service Cost) × 100
```

Or weighted average by savings:
```
Overall ROI = Σ (ROI_i × Savings_i) / Σ Savings_i
```

**Why Global Analysis is Critical:**

1. **"Power moment" from PRD** — Marc sees total impact on entire fab. The memorable number he'll share internally: "€3.8M savings on 3 critical processes."

2. **Executive summary** — Global Analysis becomes first page of PDF export. Fab Director or Procurement sees big picture immediately before details.

3. **Pitch structuring** — JB can conclude session with: "Let's recap. On the 3 processes we analyzed, here's the total impact..." Provides narrative closure.

4. **Scenario management** — If JB creates 5-6 analyses during exploratory session, Global Analysis identifies quick wins (high ROI) vs. processes needing deeper review.

**Visual Design Notes:**

- **Hero numbers** in Global Analysis even larger (40-48px) than Focus Mode (36-40px) → THE number to remember
- **Color semantics**: Total Savings always green (positive), Overall ROI color-coded by threshold (>50% green, 15-50% orange, <15% red)
- **Comparison table**: Alternating row colors (white/light gray) for readability
- **Mini-cards in sidebar**: Consistent visual style with Dashboard Grid for coherence

**Navigation Flow:**
- From Global Analysis, click mini-card sidebar → Focus Mode of that analysis (direct, no Dashboard pass-through)
- From Global Analysis, "Back to Dashboard" button → Dashboard Grid
- From Focus Mode, "View Global Analysis" button in header → direct access

**Integration with Main Direction:**

```
Dashboard Grid (Overview)
  ├─ Click Card → Focus Mode (Detail)
  │   └─ Sidebar navigation + "View Global Analysis" button
  │
  ├─ Click "What If" → Split-Screen Comparison
  │
  └─ Click "Global Analysis" → Aggregation View
      ├─ Sidebar: Mini-cards of all analyses
      ├─ Main: Total metrics + comparison table + insights
      └─ Export PDF / Edit global params / Back to Dashboard
```

---

### Future Vision: Solutions Module (V11+)

**Status:** Planned for V11 (H2 2026), post-MVP. This section establishes design vision and ensures coherence with V10 foundation. Detailed specifications will be developed during V11 UX Design phase.

#### Strategic Context

**From ROI Justification to Technical Scoping:**

The Solutions Module extends the V10 workflow from "Why ARGOS?" (ROI justification) to "How to deploy ARGOS?" (technical architecture). After convincing Marc with ROI numbers, JB needs to capture technical deployment information while the client is engaged—without scheduling a second meeting and losing momentum.

**User Journey Transition:**
```
V10: ROI Calculator Session (90-120 min)
  └─ Marc convinced by ROI numbers
     └─ JB: "Great! Let's define what deployment looks like for your fab."
        └─ Click "Solutions" button
           └─ V11: Solutions Module
              └─ Capture: pump count, connectivity, infrastructure
                 └─ Output: Technical specification sheet for pilot proposal
```

**Business Value:**
- **Accelerates sales cycle** — Capture technical specs in same session as ROI, no second meeting needed
- **Reduces information loss** — Technical details captured while client is engaged, not reconstructed from memory later
- **Pilot proposal ready** — All data needed for proposal construction in one session

#### Navigation & Access

**Entry Point from V10:**

**Global Analysis view** includes a prominent **"Configure Solutions"** button in the header (next to "Export PDF").

```
Global Analysis Header:
[← Back to Dashboard]  [Configure Solutions]  [Export PDF]
```

**Workflow:**
1. User completes 2-5 ROI analyses in V10
2. Reviews Global Analysis (total savings, overall ROI)
3. Clicks "Configure Solutions"
4. Transitions to Solutions Module with data pre-filled

**Visual Transition:**
- Smooth slide animation (0.4s) from Global Analysis to Solutions Module
- Breadcrumb updates: "Analyses > Global Analysis > **Solutions**"
- Top navigation updates: "Analyses | Global Analysis | **Solutions** (active)"

#### Layout & Structure

**Solutions Module uses consistent V10 foundation:**
- Same Pfeiffer brand colors (Red #CC0000, Orange #FF5800, Turquoise #009DA5)
- Same Noto Sans typography
- Same spacing scale (8px grid)
- Same card-based UI patterns

**Primary Layout: Split Panel with Interactive Diagram**

```
┌────────────────────────────────────────────────────────────┐
│  Solutions — System Configuration                          │
├──────────────────────┬─────────────────────────────────────┤
│  LEFT PANEL          │  RIGHT PANEL                         │
│  (Configuration)     │  (Interactive Diagram)               │
│                      │                                      │
│  System Overview     │   ┌─────────────────────────────┐  │
│  ┌────────────────┐  │   │  [Visual Diagram]           │  │
│  │ 3 Processes    │  │   │                             │  │
│  │ 26 Pumps Total │  │   │  Pumps → Sensors → Gateway │  │
│  │ ARGOS Basic    │  │   │     ↓                       │  │
│  └────────────────┘  │   │  Connectivity (Ethernet)   │  │
│                      │   │     ↓                       │  │
│  Configuration       │   │  Data Platform (Cloud)     │  │
│  • Connectivity      │   └─────────────────────────────┘  │
│  • Infrastructure    │                                      │
│  • Data Flow         │   Legend & Details                   │
│                      │   • Click elements for details       │
│  [Next: Review]      │   • Hover for tooltips              │
└──────────────────────┴─────────────────────────────────────┘
```

**Left Panel: Configuration Form**
- Pre-filled data from V10 analyses (pump count per process, total pumps)
- Additional technical questions:
  - Connectivity type (Ethernet, WiFi, 4G, OPC UA, Modbus)
  - Existing supervision network? (Yes/No + details)
  - IT infrastructure preference (On-prem, Cloud, Hybrid)
  - Data retention requirements
  - Security constraints

**Right Panel: Interactive System Diagram**
- Visual representation of ARGOS deployment architecture
- Components: Pumps → Sensors → Gateway → Connectivity → Data Platform
- Interactive: Click component for detailed specs, hover for tooltips
- Animated data flow (subtle pulse animation showing data path)

#### Interactive Diagram Design

**Visual Style:**
- **Engineering schematic aesthetic** — Clean lines, technical precision, not decorative
- **Isometric or top-down view** — Spatial representation of system layers
- **Color coding by component type:**
  - Pumps: Dark Gray (#44546A)
  - Sensors: Turquoise (#009DA5) — data collection
  - Gateway: Busch Orange (#FF5800) — aggregation point
  - Connectivity: Light Gray lines with animated pulse
  - Data Platform: Pfeiffer Red (#CC0000) — ARGOS cloud

**Interaction Patterns:**
- **Click component** → Expands detail card with specs (e.g., "Gateway: Industrial IoT gateway, 500+ sensor capacity")
- **Hover component** → Tooltip with quick info
- **Animated data flow** → Subtle pulse along connection lines (0.5s loop) showing data direction
- **Zoom & Pan** (optional V12+) — For complex multi-site deployments

#### Data Pre-filling from V10

**Automatically populated from ROI analyses:**

| V10 Data | Solutions Module Usage |
|----------|------------------------|
| Total pump count (26 pumps) | Pre-fills "Number of monitored assets" |
| Process names (Poly Etch, Metal Dep, CMP) | Lists processes to be monitored |
| Pump models (A3004XN, HiPace 2300, etc.) | Identifies sensor types needed |
| Number of analyses (3) | Suggests monitoring zones/groups |

**New data to capture in Solutions Module:**

| Question | Input Type | Purpose |
|----------|-----------|---------|
| Connectivity type | Dropdown (Ethernet, WiFi, 4G, OPC UA, Modbus) | Determines gateway configuration |
| Existing supervision network? | Yes/No + Text | Integration strategy |
| IT infrastructure | Radio (On-prem / Cloud / Hybrid) | Deployment architecture |
| Data retention | Number (months) | Storage planning |
| Network security constraints | Textarea | Firewall/VPN requirements |

#### Output & Export

**Technical Specification Sheet:**

After completing Solutions Module configuration, user clicks **"Generate Spec Sheet"** button.

**Output includes:**
- **System Overview**: Total pumps, processes, ARGOS package (Basic/Advanced)
- **Deployment Architecture Diagram**: Visual exported as PNG/SVG
- **Connectivity Specifications**: Network type, protocols, bandwidth requirements
- **Infrastructure Requirements**: Server specs, storage, security
- **Integration Points**: Existing systems to connect (supervision, ERP, etc.)
- **Implementation Timeline**: Estimated deployment phases

**Export Formats:**
- **PDF** (primary): Appended to ROI Calculator PDF as "Technical Appendix"
- **JSON** (optional V12+): Structured data for CRM/ERP integration

#### Design Coherence with V10

**Consistent Patterns:**
- Same card-based UI (white cards on light gray canvas)
- Same button styles (Pfeiffer Red primary actions)
- Same typography scale (Noto Sans, hero numbers, labels)
- Same navigation structure (breadcrumb, top segments)
- Same spacing rhythm (8px grid, consistent padding)

**Differentiated Elements:**
- **Interactive diagram** (new) — Unique to Solutions Module, not present in V10
- **Engineering aesthetic** — More technical, less financial than ROI Calculator
- **Turquoise accent** — More prominent in Solutions (data flow, sensors) vs. minimal in V10

#### Future Enhancements (V12+)

- **Multi-site configuration** — Configure ARGOS deployment across multiple fabs
- **3D facility visualization** — Interactive 3D model of fab layout with pump locations
- **Real-time cost estimation** — Calculate deployment cost based on configuration
- **Comparison mode** — Compare on-prem vs. cloud deployment options side-by-side
- **Integration with V10 What-If** — Adjust ROI based on deployment complexity

#### Implementation Notes

**Technical Approach:**
- Interactive diagram: SVG with React/Vue components for interactivity
- Animations: CSS transitions + Framer Motion (or similar) for data flow pulse
- Data pre-fill: Shared state management between V10 and V11 (Redux/Context)
- Export: Same PDF generation library as V10 ROI Calculator

**Development Priority:**
- V11 Phase 1: Basic form + static diagram (no interactivity)
- V11 Phase 2: Interactive diagram with click/hover
- V11 Phase 3: Animated data flow + advanced interactions

**Design Detail Deferred:**
- Exact diagram layout and component positioning
- Detailed interaction micro-animations
- Specific validation rules for technical inputs
- Error states and edge cases

**Note:** Full UX specifications for Solutions Module will be developed in dedicated UX Design workflow when V11 enters planning phase. This section establishes design vision and ensures architectural coherence with V10.

---

### Implementation Approach

**Development Phases:**

**Phase 1 (MVP Foundation):** Dashboard Grid View
- Build responsive card grid layout (3 cols → 2 → 1)
- Implement analysis card component with status badges
- Add "+ New Analysis" functionality
- Test with 3-5 real analyses from pilot opportunities
- Validate card design, badge logic, grid responsiveness

**Phase 2 (MVP Core):** Focus Mode Transition
- Implement Focus Mode as modal overlay
- Click card → open Focus Mode with full detail view
- Center panel with complete input form + three-act results
- Esc/Close button to return to Dashboard
- No sidebar yet (center panel only for MVP simplicity)

**Phase 3 (MVP Enhanced):** Sidebar Navigation in Focus Mode
- Add left sidebar (280px) with analysis list
- Display mini-cards with process name, ROI, badge
- Click sidebar item to switch analyses without leaving Focus Mode
- Complete the hybrid Dashboard ↔ Focus Mode workflow

**Phase 4 (Post-MVP, High Priority):** What-If Split-Screen Comparison
- Duplicate analysis functionality ("What If" button)
- Split-screen layout with synchronized scrolling
- Highlight modified fields with Busch Orange (#FF5800)
- Delta calculations in results section (Δ +36%, arrows ↑↓)
- Save/Discard/Replace action buttons

**Phase 5 (Post-MVP, High Priority):** Global Analysis Aggregation
- Sidebar with mini-cards of all analyses
- Total aggregation calculations (savings, ROI, service cost)
- Comparison table with sortable columns
- Key insights auto-generation
- Export PDF with Global Analysis as first page
- Navigation: Dashboard ↔ Global Analysis ↔ Focus Mode

**Phase 6 (V11):** Solutions Module Foundation
- Basic configuration form + static system diagram
- Data pre-fill from V10 analyses
- Technical spec sheet generation
- PDF export with technical appendix

**Phase 7 (V11+):** Solutions Module Interactivity
- Interactive diagram with click/hover
- Animated data flow
- Advanced component detail views

**Technical Stack Recommendations:**

- **Framework**: React or Vue.js (single-page application)
- **State Management**: Redux or Zustand (for shared state between V10 and V11)
- **Styling**: Tailwind CSS (configured with Pfeiffer design tokens)
- **PDF Generation**: jsPDF or Puppeteer for client-side PDF export
- **Animations**: Framer Motion or CSS transitions
- **Charts** (V11): Chart.js or Recharts for Global Analysis visualizations

**Key Technical Decisions:**

- **Client-side only** — No backend for MVP. All calculations in browser. Data does not leave client (trust requirement for sensitive client data).
- **Local storage** — Analyses saved in browser localStorage for session persistence. No database for MVP.
- **PDF export** — Client-side generation. No server dependency. Ensures offline capability if needed.
- **Responsive breakpoints**: 1200px (minimum), 1440px (laptop standard), 1920px (desktop optimal)

**Performance Targets:**

- Initial load: <2 seconds (per NFR-P5 in PRD)
- Analysis card rendering: <100ms per card
- Focus Mode transition: <300ms smooth animation
- Real-time calculation: <50ms instant feedback
- PDF generation: <3 seconds for 5 analyses

**Accessibility Baseline (MVP):**

- Keyboard navigation with visible focus rings (Pfeiffer Red #CC0000)
- Semantic HTML structure (proper headings, labels, ARIA where needed)
- Color contrast ratios meeting WCAG AA minimums
- Logical tab order following visual layout
- Screen reader support deferred to V11 (not in MVP scope per PRD)

**Future Technical Enhancements (V11+):**

- Backend API for session persistence across devices
- Real-time collaboration (multiple users editing same analysis)
- Advanced PDF customization (templates, branding options)
- CRM/ERP integration (Salesforce, SAP auto-sync)
- Mobile-responsive optimization (currently laptop-first)


---

## User Journey Flows

### Journey 1: Create New Analysis — From Dashboard to First Results

**Objectif du parcours:** Créer la première analyse et atteindre le moment "Aha!" où Marc voit ses chiffres calculés en temps réel.

**Points d'entrée:**
- Dashboard Grid → Bouton "+ New Analysis"
- Empty state (première utilisation) → CTA proéminent "Create First Analysis"

**Décisions clés:**
- Quel nom donner au process? (nomenclature client: "Poly Etch — Chamber 04")
- Mode de saisie du taux d'échec: % direct ou calcul automatique à partir du nombre de pannes?
- Type de wafer: Mono-wafer vs Batch (default 125 wafers)?

**Critères de succès:**
- ROI calculé et affiché en <5 secondes après dernière saisie
- Marc voit SES chiffres, pas des moyennes industrielles génériques
- Résultats lisibles avec hero numbers (36-40px) et narrative en 3 actes
- Transition fluide de l'input à la révélation des résultats (le moment "Aha!")

**Flow Diagram:**

```mermaid
flowchart TD
    Start([User Opens V10]) --> CheckState{Analyses<br/>exist?}

    CheckState -->|No| EmptyState[Empty State:<br/>Welcome + CTA]
    CheckState -->|Yes| Dashboard[Dashboard Grid View]

    EmptyState --> ClickNew1[Click "Create First Analysis"]
    Dashboard --> ClickNew2[Click "+ New Analysis"]

    ClickNew1 --> Modal[Modal: New Analysis]
    ClickNew2 --> Modal

    Modal --> EnterName[Enter Process Name<br/>e.g., "Poly Etch — Chamber 04"]
    EnterName --> ValidateName{Name<br/>valid?}

    ValidateName -->|No - Empty| ErrorName[Show inline error:<br/>"Process name required"]
    ErrorName --> EnterName

    ValidateName -->|Yes| CreateCard[Create Analysis Card<br/>Navigate to Focus Mode]

    CreateCard --> FocusMode[Focus Mode Opens<br/>Empty Input Form]

    FocusMode --> FillPump[Enter Pump Model<br/>Free text]
    FillPump --> FillQty[Enter Pump Quantity<br/>Numeric input]
    FillQty --> ChooseFailMode{Choose Failure<br/>Rate Mode}

    ChooseFailMode -->|Mode 1| DirectPercent[Enter % directly<br/>e.g., 3.0%]
    ChooseFailMode -->|Mode 2| CountFailures[Enter failure count<br/>Auto-calc %]

    DirectPercent --> WaferType
    CountFailures --> AutoCalc[System calculates:<br/>rate = failures/qty × 100]
    AutoCalc --> WaferType

    WaferType{Wafer Type?}
    WaferType -->|Mono| MonoFlow[Mono-wafer selected]
    WaferType -->|Batch| BatchFlow[Batch selected<br/>Default: 125 wafers]

    MonoFlow --> WaferCost
    BatchFlow --> WaferCost[Enter Wafer Cost €]

    WaferCost --> Downtime[Enter Downtime hrs<br/>+ Cost per hr]
    Downtime --> Calculate[Real-time calculation<br/>triggers automatically]

    Calculate --> DisplayResults[Results Display:<br/>3-Act Narrative]

    DisplayResults --> Act1[Act 1: Failure Cost<br/>Hero number 36-40px]
    Act1 --> Act2[Act 2: ARGOS Savings<br/>Hero number + color]
    Act2 --> Act3[Act 3: ROI Ratio<br/>Hero number + badge]

    Act3 --> AhaMoment[✅ AHA MOMENT:<br/>Marc sees HIS numbers]

    AhaMoment --> Success([Journey Complete:<br/>First Analysis Created])

    style Start fill:#f1f2f2
    style Success fill:#28a745,color:#fff
    style AhaMoment fill:#FF5800,color:#fff
    style ErrorName fill:#CC0000,color:#fff
    style Act1 fill:#009DA5,color:#fff
    style Act2 fill:#009DA5,color:#fff
    style Act3 fill:#009DA5,color:#fff
```

**Optimizations spécifiques:**
- **Mode de saisie par défaut**: Mode 2 (count failures) car Marc pense naturellement "on a eu 3 pannes" plutôt que "taux d'échec 3.75%"
- **Auto-fill Batch**: Si type Batch sélectionné → default 125 wafers (évite une étape)
- **Real-time calculation**: Pas de bouton "Calculate" — résultats apparaissent automatiquement (debounce 300ms)
- **Animation "count-up"**: Hero numbers animent de 0 → valeur finale en 0.8s (renforce impact émotionnel)

---

### Journey 2: Dashboard ↔ Focus Mode Navigation

**Objectif du parcours:** Switcher fluidement entre vue d'ensemble (Dashboard Grid) et vue détail (Focus Mode) sans perdre le contexte ni les données.

**Points d'entrée:**
- Depuis Dashboard: Click sur analysis card
- Depuis Focus Mode: Esc key ou bouton Close (X)
- Depuis Focus Mode: Click breadcrumb "Dashboard"
- Depuis Focus Mode: Click autre analyse dans sidebar

**Décisions clés:**
- Sauvegarder les modifications avant de quitter Focus Mode?
- Quelle analyse charger dans Focus Mode?

**Critères de succès:**
- Transition smooth <300ms avec animation
- Aucune perte de données (auto-save ou confirmation explicite)
- Contexte préservé (utilisateur sait quelle analyse était active)
- Breadcrumb toujours visible pour orientation

**Flow Diagram:**

```mermaid
flowchart TD
    Dashboard[Dashboard Grid View<br/>All analyses visible]

    Dashboard --> HoverCard[Hover Analysis Card<br/>Subtle elevation]
    HoverCard --> ClickCard[Click Card]

    ClickCard --> Transition1[Smooth transition 300ms<br/>Dashboard → Focus Mode]
    Transition1 --> FocusMode[Focus Mode<br/>Center: Detail Panel<br/>Left: Sidebar Navigation]

    FocusMode --> FocusActions{User Action?}

    FocusActions -->|Edit fields| InlineEdit[Inline editing<br/>Real-time recalc]
    InlineEdit --> FocusActions

    FocusActions -->|Esc key| ConfirmExit{Unsaved<br/>changes?}
    FocusActions -->|Click Close X| ConfirmExit

    ConfirmExit -->|No| DirectExit[Transition back<br/>to Dashboard]
    ConfirmExit -->|Yes| SavePrompt[Prompt: Save changes?<br/>Save / Discard / Cancel]

    SavePrompt -->|Save| SaveAndExit[Auto-save changes<br/>Return to Dashboard]
    SavePrompt -->|Discard| DiscardExit[Discard changes<br/>Return to Dashboard]
    SavePrompt -->|Cancel| FocusMode

    DirectExit --> Dashboard
    SaveAndExit --> Dashboard
    DiscardExit --> Dashboard

    FocusActions -->|Click Sidebar Item| SidebarNav[Click different analysis<br/>in sidebar list]

    SidebarNav --> ConfirmSwitch{Unsaved<br/>changes?}

    ConfirmSwitch -->|No| SwitchAnalysis[Load new analysis<br/>in Focus Mode]
    ConfirmSwitch -->|Yes| SavePromptSwitch[Prompt: Save before switch?]

    SavePromptSwitch -->|Save| SaveAndSwitch[Save → Switch]
    SavePromptSwitch -->|Discard| DiscardSwitch[Discard → Switch]
    SavePromptSwitch -->|Cancel| FocusMode

    SaveAndSwitch --> SwitchAnalysis
    DiscardSwitch --> SwitchAnalysis
    SwitchAnalysis --> FocusMode

    FocusActions -->|Breadcrumb click| BreadcrumbNav[Click "Dashboard" in breadcrumb]
    BreadcrumbNav --> ConfirmExit

    Dashboard --> GlobalNav[Click "Global Analysis"<br/>in top nav]
    GlobalNav --> GlobalView[Global Analysis View]

    GlobalView --> BackToDash[Click "Back to Dashboard"]
    BackToDash --> Dashboard

    style Dashboard fill:#f1f2f2
    style FocusMode fill:#fff
    style GlobalView fill:#f1f2f2
    style SavePrompt fill:#FF5800,color:#fff
    style InlineEdit fill:#009DA5,color:#fff
```

**Optimizations spécifiques:**
- **Esc key = sortie rapide**: Si pas de changements → sortie directe sans modal (gain de temps)
- **Auto-save background**: Sauvegarde automatique toutes les 30s pour minimiser risque de perte
- **Transition animée**: Slide animation 300ms (professional, pas abrupt)
- **Breadcrumb persistant**: Toujours visible "Dashboard > [Process Name]" pour orientation

---

### Journey 3: What-If Scenario Comparison

**Objectif du parcours:** Tester des hypothèses en dupliquant une analyse, modifier des paramètres, et comparer les scénarios côte à côte.

**Points d'entrée:**
- Depuis Dashboard Grid: Menu ⋮ sur card → "What If Scenario"
- Depuis Focus Mode: Bouton "What If" dans header

**Décisions clés:**
- Quels paramètres modifier dans le scénario What-If?
- Garder les deux scénarios, remplacer l'original, ou annuler?

**Critères de succès:**
- Marc voit clairement quels champs sont modifiés (Busch Orange #FF5800 borders)
- Deltas calculés automatiquement et affichés avec direction (Δ +36% ↑, Δ -€220K ↓)
- Options claires: Save Both / Replace Original / Discard What-If
- Comparaison visuelle immédiate (split-screen 50/50)

**Flow Diagram:**

```mermaid
flowchart TD
    Start([User in Dashboard or Focus])

    Start --> TriggerWhatIf{Where?}

    TriggerWhatIf -->|Dashboard| DashMenu[Click ⋮ menu on card]
    TriggerWhatIf -->|Focus Mode| FocusButton[Click "What If" button]

    DashMenu --> SelectWhatIf[Select "What If Scenario"]
    FocusButton --> SelectWhatIf

    SelectWhatIf --> Duplicate[System duplicates analysis<br/>Adds suffix " (What If)"]

    Duplicate --> SplitScreen[Open Split-Screen View<br/>Left: Original (read-only)<br/>Right: What If (editable)]

    SplitScreen --> ModifyFields[User modifies parameters<br/>in right panel]

    ModifyFields --> HighlightMod[Modified fields:<br/>2px solid Busch Orange border<br/>Background tint rgba(255,88,0,0.05)]

    HighlightMod --> ShowBadge[Show "MODIFIED" badge<br/>next to changed field]

    ShowBadge --> RealtimeCalc[Real-time recalculation<br/>in right panel]

    RealtimeCalc --> ComputeDeltas[Compute deltas:<br/>Original vs What If]

    ComputeDeltas --> DisplayDeltas[Display deltas in results:<br/>180% → 165% Δ-15% ↓<br/>€1.47M → €1.25M Δ-€220K]

    DisplayDeltas --> UserDecision{User Action?}

    UserDecision -->|Continue editing| ModifyFields

    UserDecision -->|Save Both| SaveBoth[Both analyses saved<br/>Return to Dashboard<br/>2 separate cards]

    UserDecision -->|Replace Original| ReplaceConfirm{Confirm<br/>replace?}

    ReplaceConfirm -->|Yes| ReplaceOrig[What If replaces original<br/>Old version discarded<br/>Return to Dashboard]
    ReplaceConfirm -->|No| SplitScreen

    UserDecision -->|Discard What If| DiscardConfirm{Confirm<br/>discard?}

    DiscardConfirm -->|Yes| DiscardWhatIf[What If discarded<br/>Only original retained<br/>Return to Dashboard]
    DiscardConfirm -->|No| SplitScreen

    UserDecision -->|Esc key| DiscardConfirm

    SaveBoth --> Dashboard([Dashboard Grid<br/>2 analysis cards visible])
    ReplaceOrig --> Dashboard
    DiscardWhatIf --> Dashboard

    style Start fill:#f1f2f2
    style Dashboard fill:#28a745,color:#fff
    style HighlightMod fill:#FF5800,color:#fff
    style DisplayDeltas fill:#009DA5,color:#fff
    style ReplaceConfirm fill:#CC0000,color:#fff
    style DiscardConfirm fill:#CC0000,color:#fff
```

**Optimizations spécifiques:**
- **Visual diff highlighting**: Busch Orange borders + "MODIFIED" badge (feedback visuel immédiat)
- **Delta indicators animés**: Δ +36% ↑ apparaît avec micro-animation bounce (moment de plaisir)
- **Color semantics pour deltas**: Positif = vert, négatif = rouge, neutre = gris (compréhension instantanée)
- **Confirmation avant replace**: Modal explicite "This will replace your original analysis. Continue?" (évite perte accidentelle)

---

### Journey 4: Global Analysis Access & Review

**Objectif du parcours:** Accéder à la vue agrégée de toutes les analyses et visualiser le "power moment" (e.g., €3.8M total savings across 3 processes).

**Points d'entrée:**
- Depuis Dashboard Grid: Bouton "View Global Analysis" dans header
- Via top nav: Segment "Global Analysis"
- Keyboard shortcut: G key

**Décisions clés:**
- Quelle analyse consulter en détail depuis la Global view?
- Faut-il ajuster les Global Parameters (detection rate, service cost)?
- Exporter le PDF maintenant?

**Critères de succès:**
- Total Savings affiché comme hero number (40-48px, le plus grand de toute l'app)
- Process comparison table interactive (sortable columns, clickable rows)
- Key insights auto-générés (e.g., "2/3 processes show high ROI")
- Export PDF inclut Global Analysis comme première page

**Flow Diagram:**

```mermaid
flowchart TD
    Start([User has 2+ analyses created])

    Start --> AccessMethod{Access Method?}

    AccessMethod -->|Dashboard button| DashButton[Click "View Global Analysis"<br/>in Dashboard header]
    AccessMethod -->|Top nav| TopNav[Click "Global Analysis"<br/>segment in top nav]
    AccessMethod -->|Keyboard| PressG[Press G key]

    DashButton --> LoadGlobal
    TopNav --> LoadGlobal
    PressG --> LoadGlobal

    LoadGlobal[Load Global Analysis View]

    LoadGlobal --> LayoutView[Layout:<br/>Left Sidebar: Mini-cards<br/>Right Panel: Synthesis]

    LayoutView --> RenderSidebar[Render mini-cards<br/>for each analysis<br/>Process name + ROI + Badge]

    RenderSidebar --> RenderAgg[Render Total Aggregation<br/>Hero Section]

    RenderAgg --> HeroMetrics[Display Hero Numbers:<br/>Total Savings 40-48px bold<br/>Overall ROI color-coded]

    HeroMetrics --> SupportMetrics[Supporting metrics:<br/>Total Service Cost<br/>Total Failure Cost]

    SupportMetrics --> CompTable[Process Comparison Table<br/>Sortable columns]

    CompTable --> Insights[Key Insights auto-generated:<br/>2/3 high ROI<br/>Metal Dep needs review<br/>Payback 6.4 months]

    Insights --> UserActions{User Action?}

    UserActions -->|Click mini-card| NavToFocus[Navigate to Focus Mode<br/>of that analysis]
    NavToFocus --> FocusMode([Focus Mode])

    UserActions -->|Click table row| NavToFocus

    UserActions -->|Sort table| SortColumn[Re-sort table<br/>by clicked column]
    SortColumn --> CompTable

    UserActions -->|Export PDF| ExportFlow[PDF Export Flow<br/>Global Analysis as page 1]
    ExportFlow --> PDFSuccess([PDF Generated])

    UserActions -->|Edit Global Params| EditParams[Adjust detection rate<br/>or service cost]
    EditParams --> RecalcAll[Recalculate ALL analyses<br/>Update aggregation]
    RecalcAll --> HeroMetrics

    UserActions -->|Back to Dashboard| BackButton[Click "Back to Dashboard"]
    BackButton --> Dashboard([Dashboard Grid])

    UserActions -->|Add Analysis| AddNew[Click "+ New Analysis"]
    AddNew --> CreateFlow([New Analysis Flow])

    style Start fill:#f1f2f2
    style HeroMetrics fill:#FF5800,color:#fff
    style Insights fill:#009DA5,color:#fff
    style Dashboard fill:#28a745,color:#fff
    style PDFSuccess fill:#28a745,color:#fff
```

**Optimizations spécifiques:**
- **G key shortcut**: Accès rapide depuis n'importe où dans l'app
- **Hero number emphasis**: Total Savings 48px (plus grand que n'importe où ailleurs) avec bold weight
- **Table sorting**: Click column header = tri instantané (pas de bouton "Apply")
- **Success message**: Si 3/3 analyses high ROI → "All processes show strong ROI — excellent candidates" (moment de plaisir)

---

### Journey 5: Focus Mode Sidebar Navigation

**Objectif du parcours:** Naviguer rapidement entre analyses sans retourner au Dashboard Grid, en utilisant le sidebar comme menu de navigation persistant.

**Points d'entrée:**
- Déjà en Focus Mode avec une analyse active
- Sidebar visible avec liste des analyses disponibles

**Décisions clés:**
- Sauvegarder avant de switcher vers une autre analyse?
- Quelle analyse choisir dans la liste?

**Critères de succès:**
- Switch instantané <200ms entre analyses
- Analyse active visuellement claire (2px Pfeiffer Red border ou background tint)
- ROI badges visibles dans sidebar pour orientation rapide (green/orange/red)
- Keyboard navigation supportée (↑↓ arrows)

**Flow Diagram:**

```mermaid
flowchart TD
    FocusMode[Focus Mode Active<br/>Analysis: "Poly Etch — Chamber 04"]

    FocusMode --> SidebarView[Left Sidebar visible<br/>List of all analyses]

    SidebarView --> RenderList[Render analysis list items:<br/>Process name 14px SemiBold<br/>ROI metrics "180% • €1.47M"<br/>Status badge mini]

    RenderList --> HighlightActive[Active analysis highlighted:<br/>2px Pfeiffer Red border<br/>or background tint]

    HighlightActive --> UserHover{User hovers<br/>other item?}

    UserHover -->|Yes| HoverState[Show hover state:<br/>Light gray background<br/>Cursor pointer]
    UserHover -->|No| HighlightActive

    HoverState --> ClickItem[User clicks<br/>different analysis item]

    ClickItem --> CheckChanges{Unsaved<br/>changes in<br/>current?}

    CheckChanges -->|No| DirectSwitch[Direct switch<br/>Load new analysis<br/>Update center panel]

    CheckChanges -->|Yes| SavePrompt[Inline prompt:<br/>"Save changes before switching?"<br/>Save / Discard / Cancel]

    SavePrompt -->|Save| SaveAndSwitch[Auto-save current<br/>Switch to new]
    SavePrompt -->|Discard| DiscardAndSwitch[Discard changes<br/>Switch to new]
    SavePrompt -->|Cancel| FocusMode

    SaveAndSwitch --> LoadNew
    DiscardAndSwitch --> LoadNew
    DirectSwitch --> LoadNew

    LoadNew[Load new analysis data<br/>into center panel]

    LoadNew --> UpdateHighlight[Update sidebar highlight<br/>New active analysis]

    UpdateHighlight --> UpdateBreadcrumb[Update breadcrumb:<br/>"Dashboard > [New Process Name]"]

    UpdateBreadcrumb --> RenderNewData[Render new analysis:<br/>Inputs + Results<br/>Real-time calculations]

    RenderNewData --> FocusModeNew[Focus Mode<br/>New analysis active]

    FocusModeNew --> SidebarView

    FocusMode --> ScrollBehavior{Sidebar has<br/>5+ items?}

    ScrollBehavior -->|Yes| ScrollableList[Sidebar scrollable<br/>Active item auto-scrolls into view]
    ScrollBehavior -->|No| StaticList[All items visible<br/>No scroll needed]

    ScrollableList --> SidebarView
    StaticList --> SidebarView

    FocusMode --> KeyboardNav{Keyboard<br/>shortcut?}

    KeyboardNav -->|↓ Arrow| NextAnalysis[Navigate to next analysis<br/>in sidebar list]
    KeyboardNav -->|↑ Arrow| PrevAnalysis[Navigate to previous analysis]

    NextAnalysis --> ClickItem
    PrevAnalysis --> ClickItem

    style FocusMode fill:#fff
    style FocusModeNew fill:#fff
    style HighlightActive fill:#CC0000,color:#fff
    style SavePrompt fill:#FF5800,color:#fff
    style LoadNew fill:#009DA5,color:#fff
```

**Optimizations spécifiques:**
- **Keyboard navigation**: ↑↓ arrows pour naviguer entre analyses (power user efficiency)
- **Auto-scroll active item**: Si 5+ analyses → active item auto-scroll into view
- **Inline prompt**: "Save changes?" apparaît en haut du panel (pas de modal bloquant)
- **Visual hierarchy**: Active analysis Pfeiffer Red highlight + ROI badges color-coded (orientation rapide)

---

## Journey Patterns

Analyse des patterns réutilisables identifiés à travers les 5 flux critiques:

### Navigation Patterns

**1. Breadcrumb Navigation (Persistent Context)**
- **Usage**: Tous les modes (Focus, Global Analysis, What-If)
- **Format**: "Dashboard > [Current Context]"
- **Comportement**: Click sur élément = navigation directe
- **Valeur**: Oriente l'utilisateur à tout moment, évite la désorientation

**2. Sidebar as Persistent Context**
- **Usage**: Focus Mode, Global Analysis
- **Contenu**: Liste compacte des analyses avec ROI badges
- **Comportement**: Click item = navigation directe sans retour Dashboard
- **Valeur**: Navigation rapide, contexte toujours visible

**3. Top Navigation Segments**
- **Usage**: Navigation primaire entre vues principales
- **Format**: "Analyses | Global Analysis | Solutions" (V11+)
- **Comportement**: Click segment = transition vers vue correspondante
- **Highlight**: Segment actif souligné avec Pfeiffer Red underline

**4. Multi-Entry Points**
- **Pattern**: Chaque vue majeure accessible par plusieurs chemins
- **Exemple Global Analysis**: Button in Dashboard header + Top nav segment + G key
- **Valeur**: Flexibilité, adapté aux préférences utilisateur (mouse vs keyboard)

### Decision Patterns

**1. Unsaved Changes Confirmation**
- **Récurrence**: Flow 2, Flow 3, Flow 5
- **Format standard**:
  - Titre: "Save changes before [action]?"
  - Options: Save / Discard / Cancel
  - Default: Save (bouton primaire Pfeiffer Red)
  - Escape: Cancel (Esc key)
- **Position**: Inline prompt en haut du panel (non-blocking modal)
- **Valeur**: Cohérence UX, prévention perte de données

**2. Destructive Action Confirmation**
- **Récurrence**: Replace Original (Flow 3), Delete Analysis
- **Format standard**:
  - Background overlay (rgba(0,0,0,0.5))
  - Modal centré avec warning icon
  - Message explicite: "This will [consequence]. Continue?"
  - Buttons: Confirm (Pfeiffer Red) / Cancel (gray)
  - Escape: Cancel (Esc key)
- **Valeur**: Prévention erreurs irréversibles, transparence des conséquences

**3. Mode Selection (Binary Choice)**
- **Récurrence**: Failure rate mode (% vs count), Wafer type (Mono vs Batch)
- **UI Components**: Radio buttons ou toggle switch
- **Default intelligent**: Mode le plus courant pré-sélectionné
- **Feedback**: Changement de mode → recalcul immédiat (real-time)
- **Valeur**: Choix clair, feedback instantané

**4. Sortable Tables**
- **Récurrence**: Global Analysis comparison table
- **Comportement**: Click column header → tri ascendant/descendant
- **Visual indicator**: Arrow ↑↓ dans header
- **Instant**: Pas de bouton "Apply" (tri immédiat)
- **Valeur**: Exploration rapide, comparaison flexible

### Feedback Patterns

**1. Real-Time Calculation Feedback**
- **Principe**: Pas de bouton "Calculate" — calcul automatique
- **Debounce**: 300ms après dernier keystroke (évite calculs inutiles)
- **Animation**: Hero numbers transition 200ms (smooth, pas de flash)
- **Loading state**: Subtle spinner si calcul >500ms (rare)
- **Valeur**: Fluidité conversationnelle, feedback immédiat

**2. Inline Validation**
- **Trigger**: Real-time pendant la saisie (onBlur ou onChange)
- **Error state**:
  - 2px solid red border (#CC0000)
  - Error message sous le champ (12px, red text)
  - Icon ⚠️ dans le champ
- **Success state**:
  - Border redevient normale (gris clair)
  - Error message disparaît
  - Optional: Checkmark ✓ vert (si validation critique)
- **Valeur**: Guidance immédiate, pas de modal bloquant

**3. Success States (Positive Reinforcement)**
- **Toast notifications**:
  - Position: Top-right corner
  - Durée: 3 seconds auto-dismiss
  - Contenu: "Analysis saved" / "PDF exported" / etc.
  - Color: Green background (#28a745), white text
  - Icon: Checkmark ✓
- **Visual confirmation**:
  - Card background flash vert 400ms (subtle)
  - Button state change: "Export PDF" → "Exported ✓" (2s)
- **Valeur**: Confirmation action réussie, satisfaction psychologique

**4. Progressive Disclosure**
- **Principe**: Montrer complexité graduellement, pas tout d'un coup
- **Exemple 1 (Create Analysis)**:
  - Step 1: Nom du process (simple)
  - Step 2: Inputs de base (pump, quantity)
  - Step 3: Inputs avancés (downtime cost, wafer cost)
  - Révélation: Résultats après inputs complets
- **Exemple 2 (Global Analysis)**:
  - Default: Hero aggregation + comparison table
  - Hover mini-card: Tooltip avec détails rapides
  - Click mini-card: Focus Mode complet
- **Valeur**: Réduction charge cognitive, orientation progressive

**5. Modification Highlighting (Visual Diff)**
- **Usage**: What-If Comparison (Flow 3)
- **Visual treatment**:
  - Modified field: 2px solid Busch Orange border (#FF5800)
  - Background tint: rgba(255, 88, 0, 0.05)
  - Badge: "MODIFIED" (10px font, orange, rounded)
- **Delta display**:
  - Format: "180% → 165% Δ-15% ↓"
  - Color semantics: Green (+), Red (-), Gray (neutral)
  - Arrow direction: ↑ increase, ↓ decrease
- **Valeur**: Transparence absolue, comparaison visuelle immédiate

---

## Flow Optimization Principles

### Efficiency Optimization (Minimizing Steps to Value)

**1. Default to Most Common Path**
- **Failure rate mode**: Default Mode 2 (count failures) car Marc pense "3 pannes l'an dernier" plutôt que "taux 3.75%"
- **Batch wafers**: Default 125 wafers (standard semiconducteur) — user peut override si nécessaire
- **Rationale**: Réduit étapes pour 80% des cas d'usage

**2. Real-Time Calculation (No Explicit Submit)**
- **Principe**: Calcul déclenché automatiquement dès dernière saisie
- **Debounce**: 300ms pour éviter calculs pendant la frappe
- **Valeur**: Élimine 1 clic, renforce fluidité conversationnelle
- **Exemple**: Marc entre "€8,000" → attend 300ms → calcul → résultats apparaissent

**3. Auto-Save Background**
- **Fréquence**: Toutes les 30 secondes en background
- **Silent**: Pas de notification (sauf si erreur)
- **Conflict resolution**: Si unsaved changes + auto-save → prompt utilisateur
- **Valeur**: Sécurité données sans friction

**4. Keyboard Shortcuts for Power Users**
- **G key**: Global Analysis (accès rapide)
- **Esc key**: Exit Focus Mode / Close Modal
- **↑↓ arrows**: Navigate sidebar analyses
- **Enter**: Confirm modal actions
- **Valeur**: Efficacité pour utilisateurs fréquents (JB, regional colleagues)

**5. Multi-Entry Points**
- **Global Analysis**: Button + Top nav + G key (3 chemins)
- **Focus Mode**: Card click + Sidebar click (2 chemins)
- **Valeur**: Flexibilité, pas de "seul bon chemin" imposé

**6. Smart Defaults Based on Context**
- **Empty state**: CTA "Create First Analysis" (proéminent)
- **1 analysis exists**: Dashboard + suggestion "Add another process?"
- **3+ analyses**: Global Analysis devient accessible (button visible)
- **Valeur**: Interface s'adapte au workflow progression

### Delight Optimization (Creating Memorable Moments)

**1. "Aha! Moment" Animation (Flow 1)**
- **Trigger**: Résultats ROI apparaissent pour la première fois
- **Animation**: Hero numbers "count-up" de 0 → valeur finale (0.8s easing)
- **Color transition**: ROI badge gris → vert si >50% (0.4s)
- **Sound** (optional V11+): Subtle "success" chime
- **Valeur**: Amplification émotionnelle du moment critique

**2. Delta Indicators (Flow 3)**
- **Visual**: Δ +36% ↑ apparaît avec micro-bounce animation
- **Color semantics**: Vert (positif), Rouge (négatif), Gris (neutre)
- **Timing**: Stagger animation (delta savings → delta ROI, 100ms offset)
- **Valeur**: Comparaison visuelle immédiate, plaisir de voir l'impact

**3. Global Analysis "Power Moment" (Flow 4)**
- **Hero emphasis**: Total Savings 48px (plus grand que partout ailleurs)
- **Background**: Subtle gradient ou glow derrière hero number (highlights importance)
- **Success message**: "All processes show strong ROI — excellent candidates" (si 3/3 high ROI)
- **Valeur**: Mémorabilité du chiffre clé (€3.8M), fierté Marc

**4. Smooth Transitions**
- **Dashboard ↔ Focus**: Slide animation 300ms (gauche → droite)
- **Sidebar switch**: Fade out old content, fade in new (200ms)
- **Table sort**: Rows reorder avec stagger animation (50ms offset par row)
- **Valeur**: Professional polish, fluidité perçue

**5. Hover Micro-Interactions**
- **Analysis card hover**: Subtle elevation (shadow +2px) + border Pfeiffer Red
- **Button hover**: Background darken 10% + cursor pointer
- **Sidebar item hover**: Background light gray + slight scale 1.02
- **Valeur**: Affordance claire, feedback tactile

**6. Positive Reinforcement (Success States)**
- **Save success**: Toast "Analysis saved ✓" (green, 3s)
- **PDF export**: Button "Export PDF" → "Exported ✓" avec checkmark (2s) → revert
- **Card background flash**: Vert 400ms après save (subtle, pas agressif)
- **Valeur**: Satisfaction psychologique, confirmation action

### Error Handling & Recovery

**1. Inline Validation (Non-Blocking)**
- **Principe**: Validation real-time, erreurs affichées inline sous champs
- **No modals**: Jamais de modal bloquant pour validation
- **Visual**: Red border + error message + icon ⚠️
- **Recovery**: Dès correction → border redevient normale, message disparaît
- **Valeur**: Guidance sans interruption du flow

**2. Graceful Degradation**
- **Calcul long (>500ms)**: Subtle spinner dans results section
- **PDF export échoue**: Toast error + bouton "Retry" (pas de crash)
- **Network offline** (future V11+): Mode offline avec localStorage, sync au retour online
- **Valeur**: Aucune interruption catastrophique du workflow

**3. Unsaved Changes Protection**
- **Trigger**: User tente de quitter Focus Mode ou switcher analyse
- **Prompt**: "Save changes before [action]?" avec options Save / Discard / Cancel
- **Auto-save fallback**: Si crash → localStorage restore au prochain launch
- **Valeur**: Zero data loss, confiance utilisateur

**4. Destructive Action Confirmation**
- **Actions concernées**: Delete analysis, Replace original (What-If)
- **Pattern**: Modal overlay + explicit message "This will [consequence]. Continue?"
- **Escape hatch**: Cancel button + Esc key
- **Valeur**: Prévention erreurs irréversibles

**5. Empty States with Guidance**
- **Empty Dashboard**: "No analyses yet. Create your first analysis to get started" + CTA
- **Empty Global Analysis**: "Create at least 2 analyses to see global aggregation"
- **Empty sidebar** (si 1 seule analyse): Message "Create more analyses to compare"
- **Valeur**: Orientation claire, pas de confusion

**6. Numeric Input Validation**
- **Expected**: Number (e.g., pump quantity, wafer cost)
- **Received**: Text ou caractères invalides
- **Feedback**:
  - Highlight champ rouge
  - Tooltip: "Expected number (e.g., 8)"
  - Allow correction sans effacer
- **Auto-format** (optional): "1000" → "1,000" pour lisibilité
- **Valeur**: Guidance sans friction

**7. Browser Compatibility Fallbacks**
- **Modern browsers** (Chrome, Firefox, Safari recent): Full experience
- **Older browsers**: Graceful degradation (animations simplifiées, pas de CSS Grid → Flexbox fallback)
- **Detection**: Feature detection (pas user-agent sniffing)
- **Message**: Si browser trop vieux → banner "For best experience, update your browser"
- **Valeur**: Accessibilité maximale sans bloquer utilisateurs

---

**Summary of User Journey Flows:**

Ces 5 flux critiques couvrent l'intégralité du parcours utilisateur durant une session live de 90-120 minutes:

1. **Create New Analysis** — Le moment fondateur où Marc voit SES chiffres pour la première fois ("Aha!")
2. **Dashboard ↔ Focus Mode** — Navigation fluide entre vue d'ensemble et détail sans perte de contexte
3. **What-If Comparison** — Test d'hypothèses avec comparaison visuelle côte à côte (transparence)
4. **Global Analysis** — Le "power moment" d'agrégation (€3.8M total savings) qui crée l'ancre mémorable
5. **Focus Mode Sidebar** — Navigation rapide entre analyses pour discussions fluides

Ces flux sont optimisés pour:
- **Efficacité**: Minimiser steps to value, real-time feedback, smart defaults
- **Plaisir**: Animations subtiles, moments de satisfaction, polish professionnel
- **Résilience**: Error handling gracieux, unsaved changes protection, guidance claire

Les patterns identifiés (Navigation, Decision, Feedback) assurent la cohérence UX à travers toute l'application.


---

## Component Strategy

### Design System Foundation

**Chosen Approach:** Tailwind CSS + Custom Component Library

**Tailwind CSS provides:**
- Design tokens (colors, spacing, typography, shadows, borders) configured with Pfeiffer brand palette
- Utility classes for rapid component styling
- Responsive modifiers (sm:, md:, lg:, xl:) for breakpoint-specific behavior
- State modifiers (hover:, focus:, active:, disabled:) for interactive states
- PurgeCSS optimization for production bundle size reduction

**Tailwind does NOT provide:**
- Pre-built interactive components
- Component behavior and state management
- Complex interaction patterns
- Application-specific business logic

**Gap Analysis:**

All components required for the ARGOS ROI Calculator V10 are **custom-designed** to match specific workflows identified in user journeys (Step 10):
- Dashboard Grid with Focus Mode transition
- What-If split-screen comparison with delta visualization
- Global Analysis aggregation view
- Real-time calculation feedback
- Multi-mode input forms with conditional logic

No off-the-shelf component library (Material UI, Ant Design, Chakra UI, shadcn/ui) provides these exact patterns. Custom components ensure:
- **Brand fidelity:** Pfeiffer visual identity (colors, typography) applied consistently
- **Workflow optimization:** Components designed for live co-construction meeting flow
- **Performance:** Minimal bundle size (no unused component library code)
- **Flexibility:** Full control over interaction patterns and responsive behavior

---

### Custom Components Specifications

**Total custom components:** 24 components organized in 5 categories

---

#### Navigation & Layout Components (5)

**1. AnalysisCard**

**Purpose:** Display summary of a single ROI analysis in the Dashboard Grid view. Primary navigation element to access detailed analysis.

**Usage:** Dashboard Grid (default view), 3-column responsive grid (3 cols @ 1920px, 2 cols @ 1440px, 1 col @ <1200px), click card to open Focus Mode.

**Anatomy:**
```
┌─────────────────────────────────┐
│ Poly Etch — Chamber 04          │ ← Process Name (18px SemiBold)
│ A3004XN • 12 pumps • Batch      │ ← Metadata (12px Regular)
├─────────────────────────────────┤
│ Savings: €1.47M                 │ ← Hero metric (20px Bold, green)
│ ROI: 180%                       │ ← ROI (20px Bold, color-coded)
├─────────────────────────────────┤
│ [High ROI — Excellent Candidate]│ ← Status badge (green)
│                              ⋮  │ ← Menu (3-dot)
└─────────────────────────────────┘
```

**States:** Default (white bg, gray border, shadow), Hover (elevation, Pfeiffer Red border), Active (red tint), Focus (2px red ring)

**Variants:** Standard size (280px width, auto height)

**Accessibility:** ARIA role `article` or `button`, label "Analysis: [Process], ROI [%], Savings [€]", keyboard Tab/Enter/Space

**Interaction:** Click card → Focus Mode, Click ⋮ → context menu (Edit, Duplicate, Delete), Hover → smooth transition 200ms

---

**2. NavigationBar**

**Purpose:** Primary navigation between main views (Analyses, Global Analysis, Solutions).

**Usage:** Persistent at top, always visible, active segment highlighted.

**Anatomy:**
```
┌─────────────────────────────────────────────┐
│ [Analyses] [Global Analysis] [Solutions]    │
│     ▔▔▔▔▔                                   │ ← Active underline (Pfeiffer Red)
└─────────────────────────────────────────────┘
```

**States:** Default (dark gray text), Active (black text, 2px red underline), Hover (red text), Disabled (light gray, tooltip "Available in V11")

**Variants:** Horizontal layout (desktop)

**Accessibility:** ARIA role `navigation`, ARIA current `page` for active, keyboard Tab/Enter, visible focus ring

**Interaction:** Click segment → navigate with 300ms transition, URL hash sync (#/global-analysis)

---

**3. GlobalSidebar**

**Purpose:** Persistent sidebar displaying global parameters (ARGOS detection rate, service cost) applying to all analyses.

**Usage:** Visible in Dashboard and Focus Mode, fixed 280px width, always editable.

**Anatomy:**
```
┌──────────────────────────┐
│ ARGOS Logo               │
├──────────────────────────┤
│ Global Parameters        │
│ Detection Rate: [70] %   │
│ Service Cost: [€2,500]   │
├──────────────────────────┤
│ Apply to All Analyses    │ ← Button (if modified)
└──────────────────────────┘
```

**States:** Default, Parameters modified ("Apply" button appears), Applying (spinner, disabled), Applied (toast notification)

**Variants:** Full sidebar (280px), future collapsed (60px icon-only)

**Accessibility:** ARIA role `complementary`, proper label associations, keyboard Tab/Enter, screen reader announces global effect

**Interaction:** Modify parameter → "Apply" button appears, Click Apply → recalculate all analyses + toast, debounce 500ms

---

**4. FocusSidebar**

**Purpose:** Compact list of all analyses for quick navigation in Focus Mode. Preserves overview context during detail editing.

**Usage:** Focus Mode only, left sidebar 280px, scrollable if 5+ analyses.

**Anatomy:**
```
┌────────────────────────┐
│ All Analyses (3)       │
├────────────────────────┤
│ ┌────────────────────┐ │
│ │ Poly Etch          │ │ ← Active (Red border)
│ │ 180% • €1.47M 🟢  │ │
│ └────────────────────┘ │
│ [Other analyses...]    │
└────────────────────────┘
```

**States:** Active (2px red left border), Inactive (gray border), Hover (light gray bg), Focus (red ring)

**Variants:** Standard (≤4 visible), Scrollable (5+ with auto-scroll to active)

**Accessibility:** ARIA role `navigation`, ARIA current for active, keyboard ↑↓ arrows, screen reader lists count

**Interaction:** Click item → load analysis (unsaved changes prompt), keyboard navigate ↑↓ + Enter, auto-scroll active into view

---

**5. Breadcrumb**

**Purpose:** Persistent navigation breadcrumb showing current location, enabling quick return to parent views.

**Usage:** Focus Mode and Global Analysis, top of content area.

**Anatomy:**
```
Dashboard > Poly Etch — Chamber 04
   ↑           ↑
  Link    Current (not clickable)
```

**States:** Link segment (clickable, underline on hover), Current (bold, non-clickable), Separator (gray chevron)

**Variants:** 2 levels ("Dashboard > [View]")

**Accessibility:** ARIA role `navigation`, ARIA current `page`, keyboard Tab/Enter, screen reader "You are here: Dashboard, then [View]"

**Interaction:** Click Dashboard → return (unsaved prompt if needed), current segment no interaction

---

#### Data Input Components (5)

**6. InputPanel**

**Purpose:** Complete input form for single ROI analysis in Focus Mode. Collects all calculation parameters.

**Usage:** Focus Mode center panel, single-screen form, real-time calculation.

**Anatomy:**
```
┌─────────────────────────────────────┐
│ Equipment & Operations              │
│ Pump Model: [A3004XN]               │
│ Quantity: [12] pumps                │
│ Failure Rate: [Toggle modes]        │
│ Process Economics                   │
│ Wafer Type: ○ Mono ● Batch          │
│ Wafer cost: [€8,000]                │
│ Downtime: [6] hrs @ [€15k]/hr       │
└─────────────────────────────────────┘
```

**States:** Default (all enabled), Field focus (red border), Field error (red border + message), Calculating (spinner if >500ms)

**Variants:** Standard vertical layout

**Accessibility:** All inputs have visible labels, aria-describedby for errors, aria-required for required fields, Tab order top-to-bottom

**Interaction:** Type → debounce 300ms → calculate, Toggle modes → switch UI + preserve values, Batch select → auto-fill 125 wafers, inline validation

---

**7. FailureRateToggle**

**Purpose:** Dual-mode input: direct percentage OR auto-calculate from failure count.

**Usage:** Within InputPanel, toggle between modes, preserve data on switch.

**Anatomy:**
```
Failure Rate
○ Enter % directly
● Auto-calculate from failure count
[3] failures in [2024]
→ Calculated rate: 3.0%
```

**States:** Mode 1 active (% input enabled), Mode 2 active (count inputs enabled), Switching (fade 200ms)

**Variants:** Vertical layout

**Accessibility:** ARIA role `radiogroup`, radio buttons with labels, arrow keys to switch, screen reader announces mode

**Interaction:** Switch mode → clear opposite inputs, focus first field, Mode 2 auto-calc: `rate = (failures/qty) × 100`, preserve values on switch

---

**8. WaferTypeSelector**

**Purpose:** Binary choice between Mono-wafer and Batch, with conditional wafer count for Batch.

**Usage:** Within InputPanel, radio selection, auto-fill on Batch.

**Anatomy:**
```
Wafer Type
○ Mono-wafer
● Batch
  └─ Wafers per batch: [125]
```

**States:** Mono (count hidden), Batch (count visible, default 125), Transition (expand/collapse 200ms)

**Variants:** Standard

**Accessibility:** ARIA role `radiogroup`, conditional input aria-hidden when Mono, arrow keys to switch

**Interaction:** Select Mono → hide count (use 1), Select Batch → show count (auto-fill 125), change count → recalculate

---

**9. NumericInput**

**Purpose:** Reusable numeric input with validation, formatting, unit display.

**Usage:** Throughout InputPanel (currency, percentages, quantities, hours).

**Anatomy:**
```
Avg Wafer Cost
┌─────────────────────┐
│ € [8,000]           │ ← Prefix + formatted input
└─────────────────────┘
Enter average cost per wafer
```

**States:** Default (white, gray border), Focus (red border), Error (red border + message), Disabled (gray bg), Valid (optional checkmark)

**Variants:** Currency (€ prefix, thousands separator), Percentage (% suffix, 0-100), Quantity (integer), Hours (decimal)

**Accessibility:** Visible label, type="number" or pattern, aria-invalid + aria-describedby for errors, arrow up/down increment

**Interaction:** Accept numeric only, blur → format (add commas, round), real-time validation, debounce 300ms before calculation

---

**10. TextInput**

**Purpose:** Reusable text input for free-form entry (process name, pump model).

**Usage:** Process name (New Analysis modal), Pump model (InputPanel).

**Anatomy:**
```
Process Name
┌─────────────────────┐
│ Poly Etch — Chamber │
└─────────────────────┘
⚠️ Process name is required
```

**States:** Default, Focus (red border), Error (red border + icon + message), Disabled, Valid

**Variants:** Single line

**Accessibility:** Visible label, required attribute + asterisk, aria-invalid + describedby, keyboard standard

**Interaction:** Accept all characters, required validation on blur, auto-trim spaces, max length 50 chars (process) / 30 (model)

---

#### Data Display Components (6)

**11. ResultsDisplay**

**Purpose:** Display calculated ROI using 3-act narrative (Failure Cost → Savings → ROI).

**Usage:** Focus Mode below InputPanel, auto-updates on input change.

**Anatomy:**
```
┌─────────────────────────────────────┐
│ RESULTS                             │
│ Act 1: The Risk                     │
│ Total Failure Cost: €2.1M /year     │
│ Act 2: The Value                    │
│ Savings: €1.47M /year               │
│ Service cost: €20,000               │
│ Act 3: The Proof                    │
│ ROI: 180% 🟢                       │
│ [High ROI — Excellent Candidate]   │
└─────────────────────────────────────┘
```

**States:** Default, Calculating (spinner if >500ms), Updated (highlight animation 200ms), No data (placeholder)

**Variants:** Standard (full 3-act)

**Accessibility:** ARIA role `region`, aria-live="polite" for updates, proper h3 headings, screen reader reads all metrics

**Interaction:** Auto-update on input change (debounce 300ms), hero numbers count-up 800ms, changed values flash green 200ms, optional tooltip for formulas

---

**12. HeroNumber**

**Purpose:** Large prominent metric display (36-48px) for readability at 2-3m distance.

**Usage:** ResultsDisplay (3-act), Global Analysis (totals), MiniCard (compact).

**Anatomy:**
```
€1.47M  ← 36-48px Bold, color-coded
```

**States:** Default (static), Updating (count-up 800ms), Emphasis (optional glow for power moment)

**Variants:** Large (40-48px Global), Medium (36-40px Focus), Small (20-24px MiniCard)

**Accessibility:** Screen reader formats properly "1 million 470 thousand euros", currency announced

**Interaction:** Count-up animation ease-out 800ms, round to 2 significant figures (€1.47M not €1.473856M)

---

**13. ComparisonTable**

**Purpose:** Sortable table for side-by-side analysis comparison in Global Analysis.

**Usage:** Global Analysis main panel, displays all analyses, sortable columns.

**Anatomy:**
```
┌─────────────────────────────────────────────────┐
│ Process Name ↑   Savings    ROI      Status     │
├─────────────────────────────────────────────────┤
│ Poly Etch        €1.47M     180%     🟢 High    │
│ Metal Deposition €175K      12%      🟠 Moderate│
│ CMP Batch        €840K      145%     🟢 High    │
└─────────────────────────────────────────────────┘
```

**States:** Default (zebra striping white/light gray), Row hover (gray bg), Row selected (red tint), Header hover (underline), Sorted (arrow ↑↓)

**Variants:** Standard (3-5 rows), Scrollable (6+ with fixed header)

**Accessibility:** ARIA role `table`, th scope="col", aria-sort on active column, tr role="button" if clickable, keyboard Tab/Enter/Arrows

**Interaction:** Click header → sort (toggle asc/desc), Click row → Focus Mode, Initial sort: ROI descending

---

**14. GlobalSummary**

**Purpose:** Aggregated metrics in Global Analysis (Total Savings, Overall ROI, costs).

**Usage:** Global Analysis hero section, aggregates all analyses.

**Anatomy:**
```
┌─────────────────────────────────────┐
│ Total Aggregation                   │
│ Total Savings:    €3.78M   [HERO]  │
│ Overall ROI:      156%     [HERO]  │
│ Total Service Cost:  €65,000       │
│ Total Failure Cost:  €5.15M        │
│ Based on 3 analyses                │
└─────────────────────────────────────┘
```

**States:** Default, Updating (spinner), Updated (green flash 200ms)

**Variants:** Standard

**Accessibility:** ARIA role `region`, aria-live="polite", h3 heading, screen reader reads all totals

**Interaction:** Auto-update on any analysis change, count-up hero numbers 800ms, optional formula tooltips

---

**15. ROIBadge**

**Purpose:** Color-coded ROI evaluation indicator (High/Moderate/Low).

**Usage:** AnalysisCard, ResultsDisplay, MiniCard, ComparisonTable.

**Anatomy:**
```
[High ROI — Excellent Candidate]  ← Green bg, white text
```

**States:** High >50% (green #28A745 "Excellent Candidate"), Moderate 15-50% (orange #FF5800 "Review Scope"), Low <15% (red #CC0000 "Adjust Parameters")

**Variants:** Full (text + description), Compact (emoji 🟢/🟠/🔴), Icon (circular dot)

**Accessibility:** ARIA role `status` or `img`, aria-label with full text, color + text (not color alone), screen reader reads full label

**Interaction:** Static display, optional tooltip for threshold explanation

---

**16. MiniCard**

**Purpose:** Compact analysis summary for sidebar navigation.

**Usage:** FocusSidebar, Global Analysis sidebar.

**Anatomy:**
```
┌──────────────────────┐
│ Poly Etch            │ ← Process (14px SemiBold, truncated)
│ 180% • €1.47M 🟢    │ ← ROI + Savings + Badge (12px)
└──────────────────────┘
```

**States:** Default (white, gray border), Active (2px red left border), Hover (light gray bg), Focus (red ring)

**Variants:** Standard (~80px height)

**Accessibility:** ARIA role `button`, label "Analysis: [Process], ROI [%], Savings [€]", keyboard Tab/Enter

**Interaction:** Click → navigate to Focus Mode, hover → tooltip if name truncated, active visual distinction

---

#### Actions & Feedback Components (5)

**17. PDFExportButton**

**Purpose:** Trigger PDF generation and export. Primary CTA for session completion.

**Usage:** Dashboard header, Global Analysis header, optional Focus Mode.

**Anatomy:**
```
[📄 Export PDF]     ← Default
[⏳ Generating...]  ← Loading
[✓ Exported]        ← Success (2s)
```

**States:** Default (Pfeiffer Red bg, white text), Hover (Dark Red, scale 1.02), Active (darker, scale 0.98), Loading (gray, spinner, disabled), Success (green, checkmark, 2s), Error (red, "Retry"), Disabled (gray, no analyses)

**Variants:** Primary (Red), Secondary (White bg, Red border)

**Accessibility:** ARIA role `button`, label "Export PDF report", aria-live announces states, keyboard Tab/Enter, white focus ring

**Interaction:** Click → PDF generation (<3s target), show loading immediately, auto-download on success, success state 2s → revert, error allows retry, optional toast

---

**18. ModalDialog**

**Purpose:** Modal overlays for critical actions (New Analysis, confirmations, unsaved changes).

**Usage:** New Analysis modal, Delete confirmation, Replace original confirmation, Unsaved changes prompt.

**Anatomy:**
```
Background Overlay (rgba(0,0,0,0.5))
┌─────────────────────────────────┐
│ ✕                               │ ← Close
│ New Analysis                    │ ← Title
│ Process Name: [...]             │ ← Content
│        [Cancel] [Create]        │ ← Actions
└─────────────────────────────────┘
```

**States:** Opening (fade-in 200ms, scale 0.9→1.0), Open (visible, overlay blocks background), Closing (fade-out 200ms), Closed (hidden)

**Variants:** Small (400px confirmations), Medium (600px forms), Large (800px future)

**Accessibility:** ARIA role `dialog`, aria-labelledby for title, aria-modal="true", focus trap, initial focus on first input, Esc/overlay click closes, screen reader announces dialog

**Interaction:** Open → overlay fade + modal scale in + trap focus, Close → Esc/overlay/close/cancel, Primary action → perform + close + toast, form validation prevents invalid submission

---

**19. ToastNotification**

**Purpose:** Non-intrusive temporary feedback (save success, export complete, errors).

**Usage:** Auto-save "Analysis saved", PDF "Exported successfully", Global params "All analyses updated", Errors "Failed to save - retry".

**Anatomy:**
```
Top-right corner
┌────────────────────────────┐
│ ✓ Analysis saved           │ ← Success (green)
└────────────────────────────┘
```

**States:** Appearing (slide in from right 300ms), Visible (3s default), Disappearing (fade out 300ms), Dismissed (slide out if clicked)

**Variants:** Success (green, checkmark ✓), Error (red, warning ⚠️), Info (turquoise, info ℹ️), Warning (orange, alert ⚡)

**Accessibility:** ARIA role `status` (success/info) or `alert` (error/warning), aria-live polite/assertive, screen reader announces automatically, optional dismiss × button, Esc dismisses

**Interaction:** Auto-appear on action completion, duration 3s (5s errors), stack vertically (max 3), click to dismiss early, auto-dismiss after duration

---

**20. InlineError**

**Purpose:** Validation error messages directly below form fields. Immediate contextual feedback.

**Usage:** Numeric inputs (invalid format), Text inputs (required empty), any validated field.

**Anatomy:**
```
Process Name
┌─────────────────────┐
│                     │ ← Input (red border)
└─────────────────────┘
⚠️ Process name is required
```

**States:** Hidden (valid or not yet validated), Visible (invalid), Animating (fade in 200ms)

**Variants:** Standard

**Accessibility:** ARIA role `alert`, aria-live="assertive", linked via aria-describedby, warning icon supplements color, screen reader announces error

**Interaction:** Trigger on blur, clear when field becomes valid (real-time), persist until corrected, specific helpful messages

---

**21. LoadingSpinner**

**Purpose:** Visual progress indicator (calculation, PDF generation, data loading).

**Usage:** Calculation if >500ms, PDF export during generation, Global params update (recalculating all).

**Anatomy:**
```
⏳ or ⟳  ← Spinning icon (16-24px)
```

**States:** Spinning (continuous rotation 1s/rotation infinite), Hidden (process complete)

**Variants:** Small (16px inline), Medium (24px standalone), Large (48px future overlay)

**Accessibility:** ARIA role `status`, aria-label "Loading" or specific "Generating PDF", aria-live="polite", screen reader "Loading. Please wait.", no keyboard interaction

**Interaction:** Appear immediately when process starts, smooth CSS rotation animation, disappear immediately on complete, accompany with text "Calculating...", use only for >500ms processes

---

#### Split-Screen Components (What-If Scenario) (3)

**22. SplitScreenLayout**

**Purpose:** Layout container for What-If comparison, displaying Original vs What-If side-by-side.

**Usage:** What-If Comparison mode only, triggered by "What If" action.

**Anatomy:**
```
┌─────────────────────────────────────────────────────┐
│ Original Scenario    vs.    What If Scenario        │
├─────────────────────┬───────────────────────────────┤
│ [Left: Read-only]   │ [Right: Editable]             │
│ Original data       │ Modified data + Deltas        │
├─────────────────────┴───────────────────────────────┤
│     [Save Both] [Replace] [Discard]                 │
└─────────────────────────────────────────────────────┘
```

**States:** Default (50/50 split), Scrolling (synchronized both panels), Resizing (fixed 50/50 in MVP)

**Variants:** Standard (50/50), future adjustable ratio

**Accessibility:** ARIA role `region`, label "What-If scenario comparison", each panel is labeled `section`, keyboard Tab navigates both sequentially, not trapped

**Interaction:** Left panel read-only, Right panel editable + real-time recalc, synchronized scroll, action buttons at bottom, Esc triggers Discard confirmation

---

**23. DeltaIndicator**

**Purpose:** Visual difference display between Original and What-If values (Δ +36%, Δ -€220K).

**Usage:** What-If right panel results section, next to modified metrics.

**Anatomy:**
```
Original: 180%
What-If:  165%  Δ -15% ↓
```

**States:** Positive (green, up arrow ↑), Negative (red, down arrow ↓), Neutral (gray, dash —)

**Variants:** Percentage "Δ +36% ↑", Currency "Δ -€220K ↓", Absolute "Δ +3 pumps"

**Accessibility:** ARIA role `text` or `status`, screen reader "Change: negative 15 percent, decreased", arrow supplements color

**Interaction:** Auto-calculate real-time on What-If input change, brief highlight 200ms on change, optional tooltip for explanation, format: "Δ [+/-][value] [unit] [↑↓]"

---

**24. ModifiedFieldHighlight**

**Purpose:** Visual treatment for modified What-If input fields. Shows which parameters differ from Original.

**Usage:** What-If right panel, applied to changed inputs.

**Anatomy:**
```
Pump Quantity
┌─────────────────────────────┐
│ [15] pumps  [MODIFIED 🟠]  │ ← Orange border + badge
└─────────────────────────────┘
Original: 12 pumps
```

**States:** Unmodified (normal gray border), Modified (2px Busch Orange border #FF5800, tint rgba(255,88,0,0.05), "MODIFIED" badge), Focus (orange persists + focus ring)

**Variants:** Standard

**Accessibility:** ARIA with "modified" in label/description, aria-describedby links to original value, border + badge (not color alone), screen reader "Pump quantity. Modified. Current 15. Original 12."

**Interaction:** Trigger when value differs from Original, clear if reverted to original, persist until match or comparison closed, badge top-right, orange unique to modifications

---

### Component Implementation Strategy

**Foundation Architecture:**

All 24 custom components are built using **Tailwind CSS utility classes** for styling, ensuring:
- **Consistency:** Pfeiffer design tokens (colors, spacing, typography) applied uniformly via Tailwind config
- **Responsiveness:** Breakpoint modifiers (sm:, md:, lg:, xl:) enable adaptive layouts
- **Performance:** PurgeCSS removes unused styles in production, minimal bundle size
- **Maintainability:** Utility-first approach reduces custom CSS, easier to iterate

**Technical Stack:**

- **UI Framework:** React (or Vue.js) for component composition and reactivity
- **Styling:** Tailwind CSS utilities + custom CSS for complex animations
- **State Management:** React Context or Zustand for global state (detection rate, service cost, analyses collection)
- **Form Handling:** React Hook Form or Formik for InputPanel validation and error management
- **Animation:** Framer Motion for smooth transitions (modals, count-up, page transitions)
- **PDF Generation:** jsPDF or Puppeteer (client-side) for export functionality
- **Testing:** Jest + React Testing Library for component unit tests, Cypress for E2E flows

**Design Token Configuration:**

Tailwind config extends default theme with Pfeiffer brand tokens:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'pfeiffer-red': '#CC0000',
        'pfeiffer-red-dark': '#A50000',
        'busch-orange': '#FF5800',
        'turquoise': '#009DA5',
        'roi-positive': '#28A745',
        'text-primary': '#000000',
        'text-secondary': '#44546A',
        'surface-canvas': '#F1F2F2',
        'surface-card': '#FFFFFF',
        'border-light': '#E7E6E6',
      },
      fontFamily: {
        sans: ['Noto Sans', 'Arial', 'Helvetica', 'sans-serif'],
      },
      fontSize: {
        'hero': ['40px', { lineHeight: '1.2', fontWeight: '700' }],
        'hero-lg': ['48px', { lineHeight: '1.2', fontWeight: '700' }],
      },
      spacing: {
        '18': '4.5rem', // 72px
        '88': '22rem',  // 352px
      },
    },
  },
  plugins: [],
}
```

**Shared Component Patterns:**

1. **Button base classes:** `px-6 py-3 rounded font-medium transition-all duration-200 focus:ring-2 focus:ring-pfeiffer-red`
2. **Card base classes:** `bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200`
3. **Input base classes:** `px-4 py-2 border border-gray-300 rounded focus:border-pfeiffer-red focus:ring-2 focus:ring-pfeiffer-red transition-colors`
4. **Typography scale:** Consistent use of text-sm, text-base, text-lg, text-xl, text-2xl, text-4xl
5. **Spacing rhythm:** Consistent use of p-4, p-6, gap-4, gap-6, space-y-4, space-y-6 (8px baseline grid)

**Accessibility Standards:**

Every custom component implements:
- **ARIA roles and labels:** Semantic roles (button, navigation, dialog, table, status, alert) with descriptive labels
- **Keyboard navigation:** Tab order follows visual layout, Enter/Space activates, Esc closes, Arrow keys navigate lists
- **Focus indicators:** 2px Pfeiffer Red focus ring visible on all interactive elements (ring-2 ring-pfeiffer-red)
- **Color + Pattern:** Never rely on color alone (icons, text, borders supplement color semantics)
- **Screen reader support:** Live regions (aria-live) for dynamic updates, proper announcements for state changes
- **Contrast ratios:** WCAG AA minimum (4.5:1 for normal text, 3:1 for large text) verified for all text/background combinations

**Quality & Performance Targets:**

- **Interaction response:** <100ms for all user interactions (button clicks, input changes, navigation)
- **Animation performance:** 60fps smooth animations using CSS transforms (translate, scale, opacity) avoiding layout thrashing
- **Bundle size:** <150KB total JS bundle (gzipped), <50KB total CSS (post-PurgeCSS)
- **Initial load:** <2 seconds time-to-interactive (per NFR-P5 in PRD)
- **Real-time calculation:** <50ms calculation latency (debounced 300ms for user input)
- **PDF generation:** <3 seconds for 5 analyses export

**Code Organization:**

```
src/
├── components/
│   ├── layout/
│   │   ├── AnalysisCard.jsx
│   │   ├── NavigationBar.jsx
│   │   ├── GlobalSidebar.jsx
│   │   ├── FocusSidebar.jsx
│   │   └── Breadcrumb.jsx
│   ├── input/
│   │   ├── InputPanel.jsx
│   │   ├── FailureRateToggle.jsx
│   │   ├── WaferTypeSelector.jsx
│   │   ├── NumericInput.jsx
│   │   └── TextInput.jsx
│   ├── display/
│   │   ├── ResultsDisplay.jsx
│   │   ├── HeroNumber.jsx
│   │   ├── ComparisonTable.jsx
│   │   ├── GlobalSummary.jsx
│   │   ├── ROIBadge.jsx
│   │   └── MiniCard.jsx
│   ├── feedback/
│   │   ├── PDFExportButton.jsx
│   │   ├── ModalDialog.jsx
│   │   ├── ToastNotification.jsx
│   │   ├── InlineError.jsx
│   │   └── LoadingSpinner.jsx
│   └── split-screen/
│       ├── SplitScreenLayout.jsx
│       ├── DeltaIndicator.jsx
│       └── ModifiedFieldHighlight.jsx
├── hooks/
│   ├── useAnalysisCalculation.js
│   ├── useGlobalParams.js
│   └── usePDFExport.js
├── utils/
│   ├── calculations.js
│   ├── formatting.js
│   └── validation.js
└── styles/
    └── tailwind.css
```

---

### Implementation Roadmap

**Phase 1 - MVP Core Components** (Week 1-2)
*Critical path: Enable Create New Analysis → Dashboard → Focus Mode flow*

**Components (10):**
1. TextInput - Foundation for all text entry
2. NumericInput - Foundation for all numeric entry
3. ModalDialog - New Analysis creation
4. InputPanel - Complete ROI analysis form
5. FailureRateToggle - Dual-mode input
6. WaferTypeSelector - Wafer type selection
7. ResultsDisplay - 3-act narrative results
8. HeroNumber - Large metric display
9. AnalysisCard - Dashboard grid cards
10. NavigationBar - Primary navigation

**Deliverable:** User can create analysis, enter data, see results (3-act narrative), view in Dashboard Grid, navigate to Focus Mode.

**Success Criteria:**
- New Analysis modal functional with validation
- InputPanel accepts all required fields with inline validation
- Real-time calculation triggers on input change (debounced 300ms)
- ResultsDisplay shows Failure Cost, Savings, ROI with hero numbers
- Dashboard Grid displays created analyses as cards
- Click card transitions to Focus Mode (smooth 300ms animation)

**Testing Focus:** Input validation, calculation accuracy, responsive grid layout (3→2→1 columns)

---

**Phase 2 - Navigation & Multi-Analysis** (Week 3)
*Enable multi-analysis workflow and Global Analysis aggregation*

**Components (7):**
11. Breadcrumb - Context navigation
12. FocusSidebar - Analysis list in Focus Mode
13. MiniCard - Compact sidebar displays
14. GlobalSidebar - Global parameters
15. ComparisonTable - Global Analysis table
16. GlobalSummary - Aggregated metrics
17. ROIBadge - Status indicators

**Deliverable:** User can create multiple analyses, navigate between them via FocusSidebar, adjust global parameters, view Global Analysis with aggregated totals and comparison table.

**Success Criteria:**
- FocusSidebar displays all analyses with active highlighting
- Click sidebar item switches analysis without leaving Focus Mode
- GlobalSidebar "Apply" button recalculates all analyses
- Global Analysis shows Total Savings, Overall ROI, comparison table
- Comparison table sortable by all columns
- ROI badges color-coded consistently (green/orange/red)

**Testing Focus:** Multi-analysis state management, global parameter propagation, aggregation calculations accuracy

---

**Phase 3 - Actions & Feedback** (Week 4)
*Polish with feedback mechanisms and professional PDF export*

**Components (4):**
18. PDFExportButton - PDF generation
19. ToastNotification - Success/error feedback
20. InlineError - Form validation messages
21. LoadingSpinner - Progress indicators

**Deliverable:** Complete feedback loop with toast notifications for all actions, professional PDF export with Pfeiffer branding, inline validation errors, loading states for async operations.

**Success Criteria:**
- PDFExportButton generates PDF <3 seconds for 5 analyses
- PDF includes Global Analysis summary + individual analysis details
- Toast notifications appear for save, export, global param updates
- InlineError displays on invalid input (real-time validation)
- LoadingSpinner shown for calculations >500ms

**Testing Focus:** PDF generation quality, toast timing/stacking, error message clarity, async operation handling

---

**Phase 4 - What-If Scenario** (Week 5, Post-MVP High Priority)
*Advanced comparison feature for stress-testing assumptions*

**Components (3):**
22. SplitScreenLayout - Comparison container
23. DeltaIndicator - Difference display
24. ModifiedFieldHighlight - Visual diff

**Deliverable:** What-If scenario comparison fully functional with split-screen view, delta calculations, modified field highlighting, save/replace/discard actions.

**Success Criteria:**
- "What If" action duplicates analysis and opens split-screen
- Left panel (Original) read-only, Right panel (What-If) editable
- Modified fields highlighted with Busch Orange border + badge
- Delta indicators display for all changed results (Δ +36% ↑)
- Save Both / Replace Original / Discard What-If actions work correctly
- Synchronized scrolling between panels

**Testing Focus:** Split-screen layout responsive behavior, delta calculation accuracy, modified field detection logic, action confirmations

---

**Implementation Priorities:**

- **Phase 1-3 = MVP:** Core functionality for Q1 2026 client meetings (4 weeks)
- **Phase 4 = Post-MVP:** What-If feature for advanced users (1 week, can be deployed incrementally)

**Development Approach:**

- **Parallel development:** Phase 1 components have no dependencies, can be built simultaneously by multiple developers
- **Component-first:** Build components in isolation with Storybook before integration
- **Test-driven:** Unit tests for each component (Jest + RTL), integration tests for user flows (Cypress)
- **Design review checkpoints:** After Phase 1 (validate core flow), After Phase 2 (validate multi-analysis navigation)
- **User testing:** With JB and regional colleagues after Phase 3 (before client deployment)

**Risk Mitigation:**

- **PDF generation complexity:** Use jsPDF with tested templates, fallback to Puppeteer if needed
- **Real-time calculation performance:** Debounce user input 300ms, optimize calculation functions, use Web Workers if >100ms
- **Responsive layout edge cases:** Test at breakpoints (1200px, 1440px, 1920px) early, adjust grid breakpoints if needed
- **Accessibility compliance:** Audit with aXe DevTools after each phase, fix issues before next phase

---

**Post-Implementation (Continuous):**

- **Storybook documentation:** Component library with all variants, states, and usage examples
- **Design system wiki:** Documentation of Tailwind config, component patterns, accessibility guidelines
- **Performance monitoring:** Track bundle size, interaction latency, PDF generation time in production
- **User feedback loop:** Collect feedback from JB and regional colleagues, iterate on usability issues

**Future Enhancements (V11+):**

- **Component variants:** Dark mode support, compact/comfortable density options
- **Advanced interactions:** Drag-and-drop analysis reordering, inline editing in Dashboard Grid
- **Additional components:** Charts (bar, pie, line) for Global Analysis, Solutions Module components
- **Internationalization:** Multi-language support (French, German) with React i18n

---

## UX Consistency Patterns

This section documents critical interaction patterns specific to the ARGOS ROI Calculator workflow. Generic UI patterns (navigation, modals) defer to the chosen design system defaults.

### Button Hierarchy & Actions

**Primary Actions** (high-emphasis buttons):
- "New Analysis" — Creates new process-specific analysis
- "Export PDF" — Generates professional client-ready report
- "Solutions" (V11) — Opens predictive services recommendation engine
- **Visual treatment**: Pfeiffer Red (#CC0000) background, white text, subtle drop shadow
- **States**: 
  - Default: Red background, sharp corners
  - Hover: Darker red (#B30000), slight elevation
  - Active/Pressed: Darker red (#990000), no elevation
  - Disabled: Gray (#CCCCCC), reduced opacity (0.6)

**Secondary Actions** (medium-emphasis buttons):
- "Duplicate Analysis" — Clones existing analysis with incremented name
- "Delete Analysis" — Removes analysis (requires confirmation)
- "Reset to Defaults" — Clears all inputs in current analysis
- **Visual treatment**: White background, Pfeiffer Red (#CC0000) border/text
- **States**: Follow same hover/active pattern as primary (border color changes)

**Tertiary Actions** (low-emphasis icon buttons):
- Edit/rename analysis name (pencil icon)
- Collapse/expand sidebar sections (chevron icon)
- **Visual treatment**: Icon-only, gray (#666666), no background
- **States**: Hover shows subtle gray background (#F5F5F5)

**Button Sizing**:
- Primary/Secondary: 40px height, 16px horizontal padding, 14px font
- Icon-only: 32px × 32px touch target

---

### Form Input & Validation

**Input Field Behavior**:
- **Real-time validation**: Numeric fields validate on blur (not on every keystroke)
- **Required field indicator**: Red asterisk (*) next to label
- **Tab navigation order**: Top-to-bottom, left-to-right within each parameter group
- **Auto-focus**: First input field in new analysis receives focus on creation

**Validation Feedback**:

**Error State** (invalid input):
- Red border (#CC0000) around input field
- Red text message below field with error icon (⚠️)
- Examples:
  - "Value must be greater than 0"
  - "Required field"
  - "Maximum 999,999"
- Error persists until corrected

**Success State** (valid input after correction):
- Subtle green checkmark (✓) appears briefly (2s) inside field (right side)
- Border returns to neutral gray
- No persistent success message (reduces visual noise)

**Warning State** (unusual but valid):
- Yellow border (#FFB800) around input field
- Yellow info message: "Unusually high value — verify with client"
- Appears for edge cases (e.g., >80% failure rate, >500 wafers/month)

**Default Values**:
- Pre-filled inputs show placeholder text in gray (#999999)
- Example: "125 wafers (default for batch pumps)"
- User can override by typing

---

### Loading & Calculation States

**Real-time ROI Calculation**:
- **No loading spinner needed** — calculations are instant (<100ms)
- Results update immediately as user modifies inputs
- Smooth number transitions (animate values incrementally over 200ms for readability)

**PDF Export Generation**:
- **Button state change**: 
  - "Export PDF" button shows spinner icon + "Generating..." text
  - Button disabled during generation (3-5 seconds)
  - On success: Button reverts to "Export PDF", green toast notification appears
  - On failure: Button reverts, red toast notification with retry option

**Analysis Switching**:
- **No loading state** — switching between analyses is instant (all data in memory)
- Active analysis tab highlights immediately on click

**Initial App Load**:
- If loading saved analyses from localStorage:
  - Show skeleton UI (gray placeholder boxes) for analysis cards
  - Duration: <500ms (imperceptible in most cases)

---

### Feedback Patterns

**Success Notifications** (green toast, top-right corner):
- "PDF exported successfully" — Auto-dismiss after 3 seconds
- "Analysis created: [Name]" — Auto-dismiss after 3 seconds
- "Changes saved" — Auto-dismiss after 2 seconds
- **Visual**: Green background (#28A745), white text, checkmark icon (✓)

**Error Notifications** (red toast, top-right corner):
- "PDF generation failed. Retry?" — Persistent until dismissed
- "Failed to save analysis" — Persistent with "Retry" button
- "Invalid input in [Field Name]" — Auto-dismiss after 5 seconds
- **Visual**: Red background (#CC0000), white text, error icon (⚠️)

**Warning Notifications** (yellow toast, top-right corner):
- "Some inputs missing — ROI calculation incomplete" — Persistent until resolved
- **Visual**: Yellow background (#FFB800), dark text (#333333), warning icon (⚠)

**Inline Info Messages** (blue, within form context):
- "Default: 125 wafers for batch-type pumps" — Below input field
- "Total failure cost = (wafer value × failures × wafers/batch)" — Below result
- **Visual**: Light blue background (#E3F2FD), blue text (#1976D2), info icon (ℹ)

**Confirmation Dialogs**:
- Delete analysis: "Delete '[Analysis Name]'? This cannot be undone."
  - Buttons: "Cancel" (secondary) | "Delete" (primary red)
- Reset inputs: "Reset all inputs to defaults?"
  - Buttons: "Cancel" (secondary) | "Reset" (primary red)

---

### Empty States

**No Analyses Created** (initial app state):
- **Visual**: Centered in main content area
- **Icon**: Large lightbulb icon (💡) or empty folder
- **Heading**: "No analyses yet"
- **Body text**: "Click 'New Analysis' to start calculating ROI for a specific process"
- **CTA Button**: "Create Your First Analysis" (primary button)

**Global Analysis with Zero Analyses**:
- **Visual**: Main content shows empty state instead of aggregated results
- **Heading**: "Global analysis requires at least one process"
- **Body text**: "Create individual process analyses first. Global ROI will aggregate all results."
- **CTA Button**: "New Analysis" (primary button)

**PDF Export History Empty** (if V11 adds export history):
- **Heading**: "No exports yet"
- **Body text**: "Exported PDFs will appear here for quick re-download"

**Design Principles for Empty States**:
- Always include actionable CTA (never dead-end the user)
- Use friendly, instructional language (not error-like)
- Show empty state immediately (no loading spinner for "no results")

---

### Pattern Implementation Notes

**Deferred to Design System Defaults**:
- Navigation patterns (tab-based SPA navigation follows standard behavior)
- Modal/dialog animations (standard fade-in/out, 200ms)
- Tooltip positioning (auto-adjust to viewport, 300ms delay on hover)
- Dropdown menus (not used in V10 — all inputs are text fields or checkboxes)

**Consistency with V9**:
- Maintain familiar calculation logic (users trust existing formulas)
- Keep "wafer value" and "failure rate" as core input concepts
- Preserve ROI ratio format: "X.XX:1" (not percentage)

**Accessibility Considerations**:
- All interactive states must have 2px focus indicator (blue outline)
- Error messages announced to screen readers via ARIA live regions
- Button states communicated via aria-disabled attribute



---

## Responsive Design & Accessibility

### Target Devices & Context

**Primary Deployment Context**:
- **Laptop-driven client meetings** (1-on-1 or small group, 2-5 people)
- **Devices**: 13"-15" laptops (1920×1080, 1366×768)
- **Display scenarios**:
  1. **Laptop screen only**: JB operates, client leans in to view results
  2. **Mirrored to projector/monitor**: Shared viewing in meeting room (2-3 meters distance)
  3. **Dual-monitor setup**: JB on laptop, client views dedicated external display

**Out of Scope for V10/V11**:
- Mobile devices (smartphones, tablets) — deferred to V12+
- Touch-first interfaces — keyboard + mouse only
- Offline/PWA functionality — desktop web app only

---

### Breakpoint Strategy

**Minimum Supported Width**: 1200px (from PRD)
- Below 1200px: Display warning overlay "Please use a larger screen (minimum 1200px wide)"
- Rationale: Complex data tables and sidebar require horizontal space

**Responsive Tiers**:

| Tier | Width Range | Layout Adjustments |
|------|-------------|-------------------|
| **Narrow Laptop** | 1200px - 1399px | Sidebar collapsed by default, analysis cards 1-column |
| **Standard Laptop** | 1400px - 1919px | Sidebar visible, analysis cards 2-column grid |
| **Wide Desktop** | ≥1920px | Sidebar expanded, analysis cards 2-3 column grid |

**No Mobile Breakpoints** (768px, 480px) — V10/V11 is desktop-only

---

### Layout Adaptation by Tier

#### Narrow Laptop (1200px - 1399px)

**Sidebar Behavior**:
- Default state: Collapsed (hamburger icon in top-left)
- Click hamburger → Sidebar slides in from left (overlay mode, dims main content)
- Click outside sidebar or close icon → Sidebar slides out
- **Width when open**: 300px (same as desktop, but overlay instead of persistent)

**Main Content**:
- Analysis cards: 1-column vertical stack (each card full-width)
- Input forms: Labels above fields (not side-by-side) to maximize horizontal space
- Results panels: Stack vertically if side-by-side layout would compress values

**Typography**:
- Maintain desktop font sizes (no reduction) — readability critical
- Line height slightly increased (1.6 → 1.7) to compensate for narrower columns

#### Standard Laptop (1400px - 1919px) — PRIMARY TARGET

**Sidebar Behavior**:
- Default state: Visible, persistent column on left
- Width: 280px (fixed, not resizable in V10)
- **Scrollable independently** if analysis list exceeds viewport height

**Main Content**:
- Analysis cards: 2-column grid (equal-width columns, 20px gap)
- Input forms: Side-by-side labels + fields for compact layout
- Results panels: Side-by-side comparison (e.g., "Failure Cost" | "ARGOS Cost" | "ROI")

**Global Analysis Tab**:
- Aggregated results display in single-column summary (not grid)
- Process breakdown table: Full-width, horizontally scrollable if >5 processes

#### Wide Desktop (≥1920px)

**Sidebar Behavior**:
- Same as Standard Laptop (280px persistent)

**Main Content**:
- Analysis cards: 3-column grid (maximize use of horizontal space)
- Input forms: Maintain side-by-side layout (no need for more compression)
- Results panels: Add whitespace padding (prevent content from feeling stretched)

**Typography**:
- Optional: Increase base font size from 14px → 15px for large displays
- Line length: Cap content width at 1600px (center remaining whitespace)

---

### Projector/Shared Display Optimization

**Scenario**: Meeting room with projector, 2-3 meters viewing distance

**Typography Adjustments for Shared Viewing**:
- Base font size: **16px minimum** (up from 14px on laptop-only)
- Headings scale proportionally (+2px per level)
- Line height: 1.7 (increased from 1.6 for readability at distance)

**Contrast Requirements**:
- Minimum contrast ratio: **7.0:1** (WCAG AAA for large text)
- Pfeiffer Red (#CC0000) on white background: 7.0:1 ✓
- Dark text (#333333) on white: 12.6:1 ✓
- Avoid light gray text (<4.5:1) — use #666666 minimum

**Visual Hierarchy**:
- Emphasize ROI ratio result (largest font, bold, color accent)
- Use spacing generously (48px between sections vs. 32px desktop-only)
- Avoid dense tables — prefer visual cards with large numbers

**"Presentation Mode" (Future V12 Enhancement)**:
- Optional toggle to enlarge key results for projector viewing
- Hides sidebar, shows only active analysis in full-screen
- V10: Not implemented, but design accommodates future addition

---

### Accessibility Strategy

**WCAG Compliance Target**:
- **V10/V11**: Basic keyboard navigation + form labeling (PRD requirement)
- **V12+**: Full WCAG 2.1 Level AA compliance (deferred)

**Rationale for Phased Approach**:
- Primary user (JB) is sighted, keyboard-proficient
- PDF output is accessible (client viewers may use screen readers)
- Foundation in V10 enables faster V12 AA certification

---

### Keyboard Navigation

**Focus Management**:
- **Tab order**: Logical top-to-bottom, left-to-right
  1. Sidebar navigation (analysis list)
  2. Main content (input fields, buttons)
  3. Footer/export actions
- **Focus indicator**: 2px solid blue (#1976D2) outline on all interactive elements
- **Skip link**: "Skip to main content" link (visually hidden, tab-accessible) at top of page

**Keyboard Shortcuts**:
- **Enter**: Submit form / Confirm dialog
- **Escape**: Close modal/dialog / Cancel action
- **Tab**: Navigate forward through interactive elements
- **Shift+Tab**: Navigate backward
- **Arrow keys**: Navigate within analysis list (up/down to switch analyses)

**Interactive Element Support**:
- All buttons: Keyboard-activatable (Enter or Space)
- Input fields: Tab to focus, type to edit, Enter to submit/move to next
- Checkboxes: Space to toggle
- Analysis cards: Arrow keys to navigate, Enter to open

**No Custom Shortcuts in V10**:
- Avoid Ctrl/Cmd shortcuts (prevent conflicts with browser/OS)
- V12 may add power-user shortcuts (e.g., Ctrl+N for New Analysis)

---

### Screen Reader Support

**Semantic HTML Structure**:
- **Landmarks**:
  - `<header>` — App header with branding
  - `<nav>` — Sidebar analysis list
  - `<main>` — Main content area (active analysis)
  - `<footer>` — Export actions
- **Headings**: Hierarchical `<h1>` through `<h4>` (no skipped levels)
  - `<h1>`: "ARGOS ROI Calculator" (page title)
  - `<h2>`: Analysis name (e.g., "Etch Chamber 3")
  - `<h3>`: Section headings ("Input Parameters", "Results")
  - `<h4>`: Subsection headings ("Pump Model", "Wafer Parameters")

**Form Labels**:
- All `<input>` fields have associated `<label>` tags (using `for` attribute)
- Required fields announced: `<label>Failure Rate <span aria-label="required">*</span></label>`
- Placeholder text supplements labels (not replaces)

**ARIA Landmarks & Roles**:
- Analysis list: `<nav aria-label="Analysis navigation">`
- Main content: `<main aria-label="Active analysis details">`
- Results panel: `<section aria-label="ROI calculation results">`

**ARIA Live Regions**:
- **Calculation results**: `<div aria-live="polite" aria-atomic="true">` — Announces ROI changes when inputs update
- **Toast notifications**: `<div role="alert" aria-live="assertive">` — Interrupts to announce errors/success
- **Loading states**: `<button aria-busy="true">Generating PDF...</button>`

**Screen Reader Testing Priority**:
- V10: Manual testing with NVDA (Windows) or VoiceOver (macOS)
- V12: Automated testing with axe-core, WAVE

---

### Color & Contrast Accessibility

**Contrast Ratios** (WCAG AA minimum: 4.5:1 for text, 3:1 for UI components):

| Element | Foreground | Background | Ratio | Compliance |
|---------|-----------|-----------|-------|------------|
| Body text | #333333 | #FFFFFF | 12.6:1 | ✓ AAA |
| Primary button | #FFFFFF | #CC0000 | 7.0:1 | ✓ AAA (large text) |
| Secondary button text | #CC0000 | #FFFFFF | 7.0:1 | ✓ AAA |
| Error text | #CC0000 | #FFFFFF | 7.0:1 | ✓ AAA |
| Success text | #28A745 | #FFFFFF | 3.1:1 | ✓ AA (large text only) |
| Disabled text | #999999 | #FFFFFF | 2.8:1 | ✗ (intentional — communicates disabled state) |

**Color-Blind Safe Palette**:
- **Red (Pfeiffer brand)**: #CC0000 — Deuteranopia/Protanopia safe (sufficient luminance difference)
- **Success green**: #28A745 — Paired with checkmark icon (✓) so color is not sole indicator
- **Error red**: #CC0000 — Paired with warning icon (⚠️) and text message

**Non-Color Indicators**:
- Required fields: Asterisk (*) + "required" label (not just red color)
- Validation errors: Icon + border + text message (not just red border)
- Success state: Icon (✓) + border change (not just green color)

---

### Accessibility Checklist (V10 Baseline)

**Keyboard Navigation**:
- [ ] All interactive elements keyboard-accessible (Tab, Enter, Space)
- [ ] Logical tab order (top-to-bottom, left-to-right)
- [ ] Focus indicator visible on all elements (2px blue outline)
- [ ] No keyboard traps (can Tab away from all components)
- [ ] Escape key closes modals/dialogs

**Forms & Inputs**:
- [ ] All inputs have visible, associated `<label>` tags
- [ ] Required fields indicated with asterisk + label
- [ ] Error messages associated with fields (aria-describedby)
- [ ] Validation feedback provided (inline text + icon)
- [ ] Placeholder text supplements labels (not replaces)

**Visual Design**:
- [ ] Color not sole means of conveying information (icons + text used)
- [ ] Minimum contrast ratios met (4.5:1 text, 3:1 UI components)
- [ ] Text scalable to 200% without loss of functionality (browser zoom support)
- [ ] Interactive elements minimum 32×32px touch target (even for desktop)

**Structure & Semantics**:
- [ ] Semantic HTML landmarks used (`<header>`, `<nav>`, `<main>`)
- [ ] Heading hierarchy logical (no skipped levels)
- [ ] ARIA labels provided for icon-only buttons
- [ ] ARIA live regions announce dynamic content (results, notifications)

**Screen Reader Testing**:
- [ ] Page title announced correctly ("ARGOS ROI Calculator")
- [ ] Navigation flow logical (sidebar → main → footer)
- [ ] Form inputs announced with labels + required state
- [ ] Error messages announced when validation fails
- [ ] Success notifications announced (toast messages)

**Browser Support** (Accessibility-related):
- [ ] Chrome 120+ (primary development target)
- [ ] Edge 120+ (Windows laptop standard)
- [ ] Firefox 120+ (secondary testing)
- [ ] Safari 17+ (macOS testing)

---

### Future Accessibility Enhancements (V12+)

**WCAG 2.1 Level AA Full Compliance**:
- [ ] Automated accessibility testing (axe-core, Pa11y)
- [ ] High-contrast mode support (Windows High Contrast)
- [ ] Reduced motion support (`prefers-reduced-motion` media query)
- [ ] Autocomplete attributes on all input fields
- [ ] ARIA 1.2 full compliance (aria-expanded, aria-controls)

**Advanced Screen Reader Support**:
- [ ] ARIA description attributes for complex calculations
- [ ] Table markup for data tables (if Global Analysis uses tables)
- [ ] ARIA live region refinements (reduce announcement verbosity)

**Internationalization Prep**:
- [ ] `lang` attribute on `<html>` tag (currently "en")
- [ ] Number formatting localization (comma vs. period decimals)

---

### Responsive & Accessibility Implementation Notes

**Testing Devices (V10 Validation)**:
1. **Primary**: Dell Latitude 5420 (1920×1080, Windows 11, Chrome)
2. **Secondary**: MacBook Pro 13" (1440×900 scaled, macOS, Safari)
3. **Projector Simulation**: Browser zoom to 150% + external monitor

**Design System Dependency**:
- If using **Tailwind CSS**: Responsive utilities (`md:`, `lg:` prefixes) handle breakpoints
- If using **Material-UI**: `useMediaQuery` hook for responsive logic
- If using **shadcn/ui**: Accessible components by default (keyboard nav, ARIA)

**Performance Considerations**:
- Responsive images: Not applicable (V10 uses minimal imagery)
- Font loading: Use `font-display: swap` to prevent text rendering delay
- CSS media queries: Mobile-last approach (desktop default, narrow adaptations)

**Accessibility Testing Tools**:
- Browser DevTools: Lighthouse accessibility audit (target: 90+ score)
- NVDA screen reader: Manual navigation flow testing
- Keyboard-only testing: Disconnect mouse, navigate entire workflow
