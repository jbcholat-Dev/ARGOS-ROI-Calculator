# Design Feedback & Improvement Backlog

## Status: Epics 4.5 + 5 + 6 DONE — Ready for Wednesday Demo (2026-02-18)

**Strategy (updated 2026-02-17):** All HIGH-priority pre-demo items shipped (Epic 4.5). PDF Export pipeline complete (Epic 5). Solutions module with unified PDF complete (Epic 6). App is demo-ready. Remaining MEDIUM/LOW items deferred to post-demo design branch.

**Workflow:** HIGH items → DONE. MEDIUM/LOW items → batch in `feature/design-polish` branch after demo feedback.

---

## Epic 2 Feedback (2026-02-09)

### Layout & Structure
- [ ] **Grid 2x3 for InputPanel** - Reduce scrolling by organizing input sections in 2 columns x 3 rows
  - Current: Vertical stack, requires scrolling to complete all fields
  - Proposed: Grid layout, all inputs visible without scroll
  - Impact: Better UX for live client meetings (fill everything at glance)

- [ ] **Sections too wide** - 50% of section width is unused
  - Current: Full-width sections with centered content
  - Proposed: Narrower sections with efficient space usage
  - Impact: More professional appearance, less white space waste

- [ ] **ResultsPanel positioning** - Define placement in new grid layout
  - Current: Below all inputs (requires scroll to see)
  - Proposed: TBD (right column? separate area?)
  - Impact: Real-time results visibility during data entry

### Buttons & Interactions
- [ ] **Bouton FAB (Floating Action Button)** - "New Analysis" button as round FAB with + icon
  - Current: Standard button in page layout
  - Proposed: Round floating button, bottom-left corner
  - Reference: Material Design FAB pattern
  - Impact: Modern UI pattern, accessible from anywhere
  - Estimated Effort: 2-3 hours (new component, positioning, z-index, tests)

### Modernization
- [ ] **Overall aesthetic** - "Sortir de l'industrie" look
  - Current: Functional but basic, industrial feel
  - Goal: Modern, polished, professional SaaS aesthetic
  - Reference: Sally's (UX Designer) initial mockups
  - Areas: Typography hierarchy, card shadows, spacing rhythm, micro-interactions
  - Impact: Client-facing tool perception, competitive differentiation

### GlobalSidebar
- [x] ~~**Sidebar inefficace**~~ - RÉSOLU (clarification de son rôle dans Epic 3)
  - Concern: Takes up space for only 2 values at top
  - Resolution: Epic 3 Dashboard will use sidebar for analysis navigation
  - Sidebar role justified once analyses populate it
  - No change needed

---

## Epic 3 Feedback (2026-02-11)

### What-If Split-Screen
- [ ] **Grid layout sans scroll** - Tout doit être visible à l'écran sans scroll dans le split-screen What-If
  - Current: Panneaux avec scroll synchronisé, hauteurs différentes entre read-only et editable
  - Proposed: Grid layout compact, tous les paramètres visibles d'un coup
  - Impact: Fluidité en réunion client, comparaison instantanée sans manipulation

- [ ] **Badge MODIFIED des deux côtés** - Quand un paramètre est modifié à droite, badge visible à gauche ET à droite
  - Current: Badge MODIFIED uniquement sur le panneau What-If (droite)
  - Proposed: Badge sur les deux côtés pour lien visuel immédiat entre scénarios
  - Impact: Le client voit exactement quel paramètre change sans chercher

### Sidebar
- [ ] **Service Cost toujours en bas** - Position cohérente entre Dashboard et Focus Mode
  - Current: En haut dans GlobalSidebar (Dashboard), en bas dans FocusSidebar (Focus Mode)
  - Problem: Le champ saute de haut en bas lors de la navigation, effet déstabilisant
  - Proposed: Toujours en bas, comme en Focus Mode
  - Impact: Cohérence visuelle, pas de saut lors des transitions

### Dashboard Cards
- [ ] **Badges ROI colorés par carte** - Classification visuelle des analyses par ROI sur le Dashboard
  - Current: Pas de badge de classification sur les cartes Dashboard
  - Proposed: Badges colorés (traffic-light) indiquant la pertinence du segment par ROI
  - Categories: À définir (ex: "Strong ROI", "Marginal", "Negative")
  - Impact: Marc voit immédiatement quels segments sont rentables

- [ ] **Supprimer badge "Analyse active" en Focus Mode** - Redondant
  - Current: Badge vert "Analyse active" affiché en Focus Mode (en français)
  - Problem: En Focus Mode on sait déjà quelle analyse est active, info redondante
  - Proposed: Supprimer ce badge du Focus Mode
  - Note: Le badge est aussi en français (manqué par Story 3-5)

### Epic 2 Feedback Still Applicable
- Grid 2x3 InputPanel (reduce scrolling) — aligns with What-If grid vision
- FAB button for "New Analysis" — still relevant
- Overall modern aesthetic — still the long-term goal

---

## Epic 4 Feedback (2026-02-16)

_No specific Epic 4 retrospective items — feedback captured in Pre-Demo Sprint below._

---

## Pre-Demo Improvement Sprint (2026-02-16) — Epic 4.5

Feedback collected during internal review session (party mode). Prioritized for Wednesday 2026-02-18 client demo.

### HIGH Priority — Must ship before Wednesday

#### FB-1: Wafer Defect Decoupling + Terminology Rename ✅ → Story 4.5.2 DONE
- **Priority:** HIGH | **Effort:** 3-4h | **Completed:** 2026-02-16
- [x] **Separate wafer defect events field** — Decouple wafer defect count from pump failure count
  - Problem: Model applies wafer cost to EVERY failure. Reality: only a fraction of failures cause wafer defects (e.g., 5 failures but only 1-2 wafer defect events)
  - Proposed: New field "Wafer defect events per year" in wafer section, independent of failure count
  - Calculation: Total wafer cost = wafer defect events × cost per wafer defect event (NOT failures × cost)
- [x] **Rename "wafer scrap" → "wafer defect" everywhere** (UI labels, types, store, tests)
  - Reason: Not all wafer events are scraps — some wafers can be reworked. "Defect" is the correct neutral term

#### FB-2: Maintenance Strategy Model & ARGOS Value Calculation ✅ → Story 4.5.4 DONE
- **Priority:** HIGH | **Effort:** 1-1.5 days | **Completed:** 2026-02-16
- [x] **Maintenance strategy selector** at process level: `Unplanned` | `Planned`
  - **Unplanned** (Run to Fail + Opportunistic PM):
    - Input: Unplanned events/year
    - ARGOS value: Anticipate failures BEFORE they happen (detect early)
    - Slider: ARGOS detection rate (70-90%) — % of events anticipated
    - Number of overhauls stays THE SAME (pump still gets overhauled, just before it breaks)
    - Gain = anticipated events × (downtime cost + wafer defect cost avoided)
    - Covers both true RTF and "opportunistic PM" (technician heard noise → pull pump)
  - **Planned** (Fixed-interval Preventive Maintenance):
    - Input: PM interval in months (e.g., 12, 18, 24)
    - Auto-calculated: overhauls/year = number of pumps ÷ (interval ÷ 12)
    - Optional: unplanned failures despite PM schedule (default: 0)
    - ARGOS value: Extend interval via data-driven condition monitoring
    - Slider: MTBF extension (10-30%)
    - Gain = (current overhauls/year − ARGOS overhauls/year) × overhaul cost + residual unplanned events avoided
    - Wafer defect: typically 0 in PM mode (pumps removed before failure), but user decides
  - **Key insight:** No "hybrid" mode needed — Planned mode with optional unplanned residual covers the real-world hybrid scenario
- [x] **Single overhaul cost** — No distinction between RTF and PM repair cost (marginal difference in practice, client refurbishes most parts regardless)
- [x] **Annualization for PM** — Steady-state formula: pumps ÷ interval-in-years gives annual overhaul rate (pumps staggered over time)

#### FB-3: Bottleneck Tool Toggle ✅ → Story 4.5.3 DONE
- **Priority:** HIGH | **Effort:** 2-3h | **Completed:** 2026-02-16
- [x] **Toggle "Bottleneck tool?"** in downtime section
  - When ON: reveal multiplier field
  - Default multiplier: x2
  - Step: 0.5 increments (x1.5, x2, x2.5, x3, x3.5...)
  - Applied ONLY to downtime cost per hour (not wafer defect)
  - Rationale: Bottleneck tools block downstream production when down — cost extends beyond the tool itself
  - UX: conversational — consultant adjusts live with client ("When this tool goes down, how much of the line stops?")

#### FB-4: Data Persistence (localStorage) ✅ → Story 4.5.1 DONE
- **Priority:** HIGH | **Effort:** 3-4h | **Completed:** 2026-02-16
- [x] **Zustand persist middleware** — Auto-save entire store to localStorage
  - Survives: page refresh, tab close, browser restart
  - Storage: ~5 Mo available, sufficient for dozens of analyses
  - Implementation: `zustand/middleware` persist with `name: 'argos-roi-data'`
- [x] **Session recovery modal** on app launch when previous data exists
  - Options: "Resume previous session" | "Start new session"
  - Protects client data confidentiality between different client meetings
- [x] **Reset button** accessible in UI to clear all stored data
- [x] Handle store migration if structure changes between versions (future-proofing)

### MEDIUM Priority — If time permits before Wednesday

#### FB-5: What-If Card Positioning
- **Priority:** MEDIUM | **Effort:** 2-3h
- [ ] When "Save Both" creates a new What-If card, insert it immediately AFTER the source card (not at end of list)
  - Problem: Client loses visual link between original and What-If scenario
  - Requires: `sortOrder` field on analyses in store

#### FB-6: ROI Badges on Dashboard Cards
- **Priority:** MEDIUM | **Effort:** 3-4h
- [ ] Colored ROI classification badges on each dashboard card (traffic-light system)
  - Categories TBD: e.g., "Strong ROI" (green), "Marginal" (yellow), "Negative" (red)
  - Already identified in Epic 3 feedback — promoting to MEDIUM for pre-demo

### LOW Priority — Post-Demo (Design Branch)

#### FB-7: Compact Dashboard Cards
- **Priority:** LOW | **Effort:** 4-6h
- [ ] Reduce card height, densify information display, less white space

#### FB-8: Drag & Drop Card Reordering
- **Priority:** LOW | **Effort:** 1-2 days
- [ ] Free card reordering via drag and drop (consider `dnd-kit` or `@hello-pangea/dnd`)

#### FB-9: Process Clustering
- **Priority:** LOW | **Effort:** 1-2 days
- [ ] Visual grouping of related analyses (by process, by scenario family)

---

## Epic 5 Feedback — COMPLETED 2026-02-17

Epic 5 (PDF Export & Reporting) delivered 4 stories with 171 tests. Code review: 14 issues found and fixed.

### What Shipped:
- [x] **PDF Export Button** — "Export PDF" on Global Analysis page + compact in NavigationBar, with loading/success/error states
- [x] **PDF Template** — A4 Pfeiffer-branded report: cover page, headers/footers, Helvetica typography, red accent (#CC0000), table rendering with page overflow
- [x] **PDF Content Sections** — Executive Summary (hero savings), Per-Process Breakdown (strategy-aware), Global Comparison Table, Assumptions & Methodology
- [x] **Error Handling** — Retry logic (max 2 retries), escalated error message, toast with Retry action, unmount-safe async

### Areas for Future Polish:
- [ ] PDF visual design could benefit from client logo integration (`jsPDF.addImage()` for PNG/JPEG)
- [ ] Consider adding charts/graphs to Executive Summary (currently text-only)
- [ ] Performance optimization if reports exceed 10 analyses (current target: <3s for 5)

---

## Epic 6 Feedback — COMPLETED 2026-02-17

Epic 6 (Solutions Module) delivered 4 stories + 1 spike + 1 fix. Story 6.5 (Unified PDF) completed last, leveraging Epic 5 pipeline.

### What Shipped:
- [x] **Solutions Navigation** — CTA button from Global Analysis to Solutions page
- [x] **Interactive Architecture Diagram** — SVG-based with Pilot/Production topologies, deployment toggle, connection type selector, inline pump stats
- [x] **Pump Clustering Fix** — Corrected clustering from pumpType to process (1 cluster = 1 analysis)
- [x] **Unified PDF Export** — "Export Complete Report" on Solutions page: Part 1 (ROI) + Part 2 (Architecture with SVG capture via html2canvas)
- [x] **Shared Code** — usePDFExport hook, calculatePumpStats utility, shared constants (DEPLOYMENT_MODE_LABELS, CONNECTION_TYPE_LABELS)

### Cancelled Stories (superseded):
- ~~6.2 Pre-Filled Context~~ — superseded by DiagramControls inline stats (6.4)
- ~~6.3 Technical Specifications Form~~ — superseded by DiagramControls (6.4)

### Areas for Future Polish:
- [ ] Architecture diagram: add animated data flow particles for visual impact
- [ ] Solutions page: consider adding a "Technical Notes" free-text field for custom annotations
- [ ] Unified PDF: client logo placeholder on cover page

---

## Design Refactor Branch Plan (Post-Demo — Ready to Start)

### Pre-Work
1. ~~Gather real user feedback from client demos (Epics 4-6)~~ → **Wednesday 2026-02-18 demo**
2. Review all accumulated feedback in this file (including Epic 2/3 items still open)
3. Audit Sally's initial mockups for design direction
4. Prioritize remaining changes by impact and effort

### Approach
1. Create branch: `feature/design-polish`
2. Work through remaining feedback items systematically (FB-7, FB-8, FB-9 + Epic 2/3 open items)
3. Test comprehensively (visual regression, interaction)
4. Review with JB before merge
5. Merge to main after approval

### Success Criteria
- All items in this file addressed or explicitly deferred
- Modern, professional aesthetic achieved
- No functional regressions
- JB approval on final design

---

## Notes

- **Pre-demo sprint (Epic 4.5):** HIGH items are no longer deferred — addressed before Wednesday demo
- **User feedback > assumptions:** Real client reactions should continue to inform design
- **Batch refactor for remaining items:** LOW priority items batched in post-Epic 6 design branch
- **Design branch isolation:** Allows aggressive refactoring without disrupting feature velocity

---

## Implementation Order (Epic 4.5)

| Order | Story | Feedback | Rationale |
|-------|-------|----------|-----------|
| 1 | 4.5.1 | FB-4 Persistence | Safety net — protects all subsequent dev work during demo |
| 2 | 4.5.2 | FB-1 Wafer defect | Quick win — field + rename, independent |
| 3 | 4.5.3 | FB-3 Bottleneck | Quick win — toggle + multiplier, independent |
| 4 | 4.5.4 | FB-2 Maintenance strategy | Biggest item — depends on FB-1 (wafer defect field) |

Stories 4.5.1 + 4.5.2 can be developed in parallel (no dependencies).

---

**Last Updated:** 2026-02-17 (Epic 5 + Epic 6 completed, all HIGH items shipped)
**Next Update:** After Wednesday demo (2026-02-18) — capture client feedback for design branch
