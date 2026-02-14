# Story 6.4: Interactive ARGOS Architecture Diagram

Status: done

## Story

As a **user (JB presenting the ARGOS deployment to Marc during a client meeting)**,
I want **an interactive architecture diagram that visualizes the two deployment options (Pilot and Production) with real-time topology changes**,
So that **the client can see exactly how ARGOS integrates into their fab, understand why starting with a pilot is fast and low-friction, and visualize the full production architecture for scale-up planning**.

## Context — Why This Story Changed

The original Story 6.4 described a static SVG diagram with tooltips. During a product discussion (2026-02-13), PO clarified that the architecture diagram is a **core sales tool** that must visually communicate two fundamentally different deployment approaches:

**Pilot** — "Operational day 1": Micro-PCs near pump clusters, wired connections, manual daily data sync to cloud. No client network integration needed.

**Production** — "Full integration": Centralized on-premise server with VMs, MQTT broker, automated data pipeline to cloud. Requires client network integration (firewall, VLANs, cabling).

The interactive toggle between these two topologies is the key "wow moment" during client meetings — the client instantly understands WHY starting with a pilot removes deployment friction.

## Acceptance Criteria

### AC1: Deployment Mode Toggle (Pilot / Production)
**Given** I am on the Solutions page with the architecture diagram visible
**When** I see the diagram section
**Then** I see a toggle/segmented control with two options: "Pilot" and "Production"
**And** "Pilot" is selected by default
**When** I switch from "Pilot" to "Production"
**Then** the diagram topology transitions with smooth animation:
  - Micro-PCs fade out, centralized server fades in
  - Manual sync icon replaced by automated pipeline
  - Connection paths redraw to reflect new topology
  - Fixed components (ARGOS boxes, pumps, Cloud) remain in place
**And** the transition completes within 500ms

### AC2: Pilot Topology Visualization
**Given** the deployment mode is set to "Pilot"
**When** I view the diagram
**Then** I see the following components arranged spatially:
  - **Pump clusters** (grouped by pump model from Story 6.2 data)
    - Each cluster shows: model name + quantity (e.g., "8x A3004XN")
    - ARGOS boxes attached to each pump group
  - **Micro-PCs** positioned near each pump cluster
    - Label: "Micro-PC" with MQTT indicator
    - Connected to pump cluster via connection lines
  - **Manual sync** icon (person/USB symbol)
    - Positioned between micro-PCs and Cloud
    - Label: "Daily manual sync"
  - **Cloud platform** with "ARGOS Cloud" label
    - Contains prediction models indicator
**And** connection lines from pumps to micro-PCs reflect the selected connection type
**And** connection from micro-PC to cloud shows manual/intermittent style (dotted or distinct)

### AC3: Production Topology Visualization
**Given** the deployment mode is set to "Production"
**When** I view the diagram
**Then** I see the following components arranged spatially:
  - **Pump clusters** (same as Pilot — from 6.2 data)
    - ARGOS boxes attached to each pump group
  - **Centralized server** replacing micro-PCs
    - Label: "On-premise Server"
    - Sub-labels: "VMs", "MQTT Broker"
    - Connected to pump clusters via client network
  - **Automated pipeline** replacing manual sync
    - Continuous arrow from server to Cloud
    - Label: "Automated data pipeline"
  - **Cloud platform** (same as Pilot)
    - Contains prediction models indicator
**And** connection lines from pumps to server reflect the selected connection type
**And** connection from server to cloud shows automated/continuous style (solid arrow)

### AC4: Connection Type Dropdown
**Given** I am viewing the architecture diagram (either topology)
**When** I see the connection type control
**Then** I see a dropdown with options: "Ethernet", "RS485", "WiFi"
**When** I select "WiFi"
**Then** connection lines between pumps and micro-PC/server change to **dotted** style
**And** a "WiFi" label appears near the connections
**When** I select "Ethernet" or "RS485"
**Then** connection lines change to **solid** style
**And** the selected type label appears near the connections
**And** the default selection is "Ethernet"

### AC5: Pump Data Integration from Story 6.2
**Given** I have 3 analyses: "Poly Etch" (8x A3004XN), "Metal Dep" (12x HiPace 300), "CVD" (6x A3004XN)
**When** I view the architecture diagram
**Then** the diagram shows 2 pump clusters (matching 6.2 model clustering):
  - Cluster 1: "A3004XN — 14 pumps" (merged from Poly Etch + CVD)
  - Cluster 2: "HiPace 300 — 12 pumps"
**And** each cluster has ARGOS boxes visualized
**And** the total "26 pumps" is consistent with the PreFilledContext display above

### AC6: Empty State (No Analyses)
**Given** I have 0 analyses in the store
**When** I view the architecture diagram section
**Then** the diagram shows a generic placeholder layout (no pump-specific clusters)
**Or** the diagram section shows a message: "Add ROI analyses to see your deployment architecture"

### AC7: Fixed Components Across Topologies
**Given** I toggle between Pilot and Production modes
**When** the topology transitions
**Then** the following components remain in their positions (no movement):
  - ARGOS boxes (attached to pumps)
  - Pump clusters
  - Cloud platform with prediction models
**And** only the middleware layer changes (micro-PC ↔ server, manual ↔ automated)

### AC8: Responsive Layout
**Given** I am viewing the diagram on a viewport ≥1024px
**When** the diagram renders
**Then** all components are visible without horizontal scrolling
**And** labels are readable at default zoom
**And** the diagram scales proportionally on larger viewports

### AC9: Keyboard Accessibility
**Given** I am on the Solutions page with the architecture diagram
**When** I Tab through the diagram section
**Then** the deployment mode toggle receives focus with visible ring
**And** I can switch modes with Enter/Space
**And** the connection type dropdown is keyboard-navigable
**And** the diagram itself has `role="img"` with descriptive `aria-label`
**And** screen readers announce topology changes when toggle is switched

**FRs Covered:** FR52 (Architecture diagram), FR53 (Component descriptions)
**NFRs Addressed:** NFR-P4 (<200ms interaction response)

## Tasks / Subtasks

### Task 1: Create Diagram Store Slice (AC: 1, 4)
- [x] Add diagram state to Zustand store (or new slice):
  ```typescript
  interface DiagramState {
    deploymentMode: 'pilot' | 'production';
    connectionType: 'ethernet' | 'rs485' | 'wifi';
    setDeploymentMode: (mode: 'pilot' | 'production') => void;
    setConnectionType: (type: 'ethernet' | 'rs485' | 'wifi') => void;
  }
  ```
- [x] Tests for store actions (set mode, set connection type)

### Task 2: Create SVG Component Library (AC: 2, 3, 7)
- [x] Create `src/components/solutions/diagram/` directory
- [x] Create individual SVG components:
  - `PumpCluster.tsx` — Group of pumps with model label and quantity
  - `MicroPC.tsx` — Small computer with MQTT label (Pilot only)
  - `CentralServer.tsx` — Server rack with VM/MQTT labels (Production only)
  - `CloudPlatform.tsx` — Cloud shape with ARGOS Cloud + prediction models
  - `ManualSync.tsx` — Person/USB icon (Pilot only)
  - `AutoPipeline.tsx` — Continuous arrow (Production only)
  - `ConnectionLine.tsx` — SVG line/path with solid/dotted variants
- [x] Each component uses Pfeiffer brand colors
- [x] Each component has appropriate `aria-label`

### Task 3: Create ArchitectureDiagram Container (AC: 1, 2, 3, 5, 6, 7, 8)
- [x] Create `src/components/solutions/diagram/ArchitectureDiagram.tsx`:
  - Read pump model clusters from store (via 6.2 data)
  - Read deployment mode and connection type from diagram store
  - Render SVG canvas with positioned components
  - Conditional rendering: Pilot components vs Production components
  - Layout algorithm: position pump clusters, middleware, cloud
  - Handle empty state (no analyses)
  - CSS transitions for topology switch animation
- [x] Create `src/components/solutions/diagram/ArchitectureDiagram.test.tsx`

### Task 4: Create Diagram Controls (AC: 1, 4)
- [x] Create `src/components/solutions/diagram/DiagramControls.tsx`:
  - Deployment mode toggle (segmented control: Pilot | Production)
  - Connection type dropdown (Ethernet | RS485 | WiFi)
  - Controls positioned above or beside the diagram
  - Styled consistently with PreFilledContext section
- [x] Tests in `ArchitectureDiagram.test.tsx` (combined test file)

### Task 5: Integrate into Solutions Page (AC: all)
- [x] Update `src/pages/Solutions.tsx`:
  - Add ArchitectureDiagram + DiagramControls below PreFilledContext
  - Maintain page layout and document title
- [x] Update Solutions page tests

### Task 6: Connection Line Styling (AC: 4)
- [x] Implement connection line variants:
  - Solid line: `stroke-dasharray: none` (Ethernet, RS485)
  - Dotted line: `stroke-dasharray: 6,4` (WiFi)
  - Connection label positioning near line midpoint
  - Smooth transition when connection type changes

### Task 7: Topology Transition Animation (AC: 1, 7)
- [x] Implement CSS/SVG transitions between topologies:
  - Fade out departing components (opacity 1→0 via CSS)
  - Fade in arriving components (opacity 0→1 via CSS)
  - Connection paths redraw with transition
  - Fixed components: no animation (stay in place)
  - Total transition: 600ms ease-out (cubic-bezier(0.22,1,0.36,1))

### Task 8: Accessibility and Code Quality Audit (AC: 9, all)
- [x] Verify:
  - SVG has `role="img"` and descriptive `aria-label`
  - Toggle and dropdown are keyboard-navigable
  - Focus ring on interactive elements
  - `aria-live="polite"` region announces topology changes
  - No console.log in production code
  - TypeScript strict mode passes
  - ESLint passes

## Dev Notes

### Critical Context — This is the Sales "Wow Moment"

This diagram is not a technical appendix — it's the centerpiece of the Solutions module. During client meetings, JB uses it to:
1. Show the client their specific pump configuration (from ROI analyses)
2. Demonstrate that a **Pilot is operational day 1** (micro-PCs, no IT integration)
3. Show the **Production architecture** for long-term scale-up
4. The visual transition between the two instantly justifies the pilot approach

The client sees their infrastructure drawn in real-time with their actual pump data. This is what closes deals.

### Two Deployment Architectures (from PO, 2026-02-13)

**Pilot Architecture:**
- ARGOS boxes on pumps → short cables → micro-PC (one per pump group/tool)
- Each micro-PC has a local MQTT broker
- Pumps are physically close in the subfab (same tool, different chambers)
- On-site team comes daily to retrieve data from micro-PCs → sync to cloud
- **Key advantage**: No client IT integration needed. Install boxes, plug micro-PCs, operational immediately.

**Production Architecture:**
- ARGOS boxes on pumps → client network (cables, VLANs) → centralized on-premise server
- Server runs VMs provided by client, hosts centralized MQTT broker
- Automated data pipeline extracts data at regular intervals → ARGOS Cloud
- **Key challenge**: Requires IT integration (network access, VMs, firewall rules). Often takes months — which is why pilot exists.

### Technical Approach (from Architect, party mode)

**Custom SVG with React** — recommended over React Flow or D3:
- We're doing visual storytelling, not node editing
- Fixed layouts (not user-draggable)
- Full control over Pfeiffer branding
- Simpler codebase, no heavy dependencies
- Each component = React SVG component with props

**Layout Strategy:**
- Left side: Pump clusters (subfab)
- Center: Middleware layer (micro-PCs or server)
- Right side: Cloud platform
- Connections flow left → center → right
- Toggle switches the center layer

### Data Flow

```
Story 6.2 (PreFilledContext)
  └─ pumpModelClusters: [{ model: 'A3004XN', quantity: 14 }, ...]
       └─ Consumed by ArchitectureDiagram
            └─ Renders pump clusters with correct models and quantities
            └─ Reads deploymentMode + connectionType from diagram store
            └─ Conditionally renders Pilot or Production components
```

### Spike Dependency

This story DEPENDS on the completion of `6-spike-architecture-diagram-design`. The spike provides:
- Wireframes defining exact component positions
- SVG specifications for each component
- Interaction details (animation timing, transition behavior)
- Data contract validation

**Do NOT start implementation before spike is complete.**

### What to Build

1. **Diagram store slice** — deploymentMode + connectionType state
2. **SVG component library** — 8+ individual components
3. **ArchitectureDiagram container** — Layout + conditional rendering
4. **DiagramControls** — Toggle + dropdown
5. **Connection line system** — Solid/dotted with labels
6. **Topology transition** — CSS/SVG animations
7. **~30-40 new tests**

### What NOT to Build

- **Drag-and-drop** — Components are fixed position, not user-movable
- **Zoom/pan** — Diagram fits viewport at 1024px+
- **Component click-to-expand** — Original 6.4 had this; deferred (not needed for MVP)
- **Hover tooltips** — Original 6.4 had this; can be added later if needed
- **PDF rendering** — Story 6.5 will handle diagram-to-image conversion
- **Story 6.3 form fields** — Connection type is in the diagram controls, not a separate form
- **Scale-up mode** — Only 2 modes (Pilot/Production), not 3

### Architecture Patterns to Follow

**Zustand Selector Pattern (MANDATORY):**
```typescript
const deploymentMode = useAppStore((state) => state.deploymentMode);
const connectionType = useAppStore((state) => state.connectionType);
const analyses = useAppStore((state) => state.analyses);
```

**Named Exports (MANDATORY):**
```typescript
export function ArchitectureDiagram() { ... }
export function DiagramControls() { ... }
```

**SVG Component Pattern:**
```typescript
interface PumpClusterProps {
  model: string;
  quantity: number;
  x: number;
  y: number;
}

export function PumpCluster({ model, quantity, x, y }: PumpClusterProps) {
  return (
    <g transform={`translate(${x}, ${y})`} aria-label={`${quantity} ${model} pumps`}>
      {/* SVG elements */}
    </g>
  );
}
```

### References

- Party mode discussion (2026-02-13): Deployment architectures, Pilot vs Production
- Spike: `_bmad-output/implementation-artifacts/6-spike-architecture-diagram-design.md`
- [Source: _bmad-output/planning-artifacts/epics.md#Story 6.4: ARGOS Architecture Diagram]
- [Source: _bmad-output/implementation-artifacts/6-2-pre-filled-context-from-roi-analyses.md] (pump model clusters)
- [Source: argos-roi-calculator/src/stores/app-store.ts] (store patterns)
- [Source: argos-roi-calculator/src/types/index.ts] (Analysis interface — pumpType, pumpQuantity)

## Test Estimates

- Diagram store slice: 4 tests (default state, set mode, set connection type, persistence)
- PumpCluster component: 3 tests (renders model+quantity, aria-label, multiple clusters)
- Pilot topology: 4 tests (micro-PC visible, manual sync visible, server NOT visible, correct connections)
- Production topology: 4 tests (server visible, auto pipeline visible, micro-PC NOT visible, correct connections)
- Toggle interaction: 3 tests (switches mode, animation triggers, fixed components unchanged)
- Connection type dropdown: 3 tests (default ethernet, changes line style, label updates)
- Connection line styling: 3 tests (solid for ethernet, solid for RS485, dotted for WiFi)
- Data integration: 3 tests (pump clusters from store, empty state, dynamic updates)
- Accessibility: 4 tests (role="img", keyboard toggle, keyboard dropdown, aria-live announcement)
- Solutions page integration: 2 tests (diagram renders, controls render)
- **Total new tests: ~33**
- **Expected total: ~1082 tests** (1049 after 6.2 + 33 story 6.4)

## Time Estimates

- Task 1 (Store slice): 15 min
- Task 2 (SVG components): 60 min
- Task 3 (Diagram container): 45 min
- Task 4 (Controls): 20 min
- Task 5 (Page integration): 10 min
- Task 6 (Connection line styling): 20 min
- Task 7 (Transition animation): 20 min
- Task 8 (Accessibility audit): 10 min
- **Dev total: ~200 min (~3.3h)**
- Exploration: 10 min
- Code review (3 agents //): 5 min
- Fixes (HIGH+MEDIUM): 20 min
- **Grand total: ~4h (~235 min)**

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Solutions.test.tsx regression: `getByText('20')` found duplicates after adding DiagramControls (which also shows total pumps). Fixed by using `getAllByText('20')`.
- ESLint: removed unused `within` import and `renderDiagram` function from test file.

### Completion Notes List

- Task 1: Added `deploymentMode` (pilot/production) and `connectionType` (ethernet/rs485/wifi) to AppState with exported types `DeploymentMode` and `ConnectionType`. 7 new store tests.
- Task 2: Created 7 SVG components in `src/components/solutions/diagram/`: PumpCluster, MicroPC, CentralServer, CloudPlatform, ManualSync, AutoPipeline, ConnectionLine. ArgosBox merged into PumpCluster (ARGOS box drawn inline per pump). All use Pfeiffer brand colors from prototype.
- Task 3: ArchitectureDiagram container renders dynamic SVG with pump clusters from store, conditional pilot/production topology, empty state message, and responsive viewBox.
- Task 4: DiagramControls with segmented toggle (radio group), connection dropdown, inline stats (pumps/models/processes), and mode badge with pulse animation.
- Task 5: Solutions.tsx updated to render DiagramControls + ArchitectureDiagram below PreFilledContext. Solutions.test.tsx updated with 2 new integration tests.
- Task 6: ConnectionLine component handles solid (ethernet/rs485) and dotted (wifi) styles via `strokeDasharray`. Color-coded by variant (amber=pilot, cyan=production, blue=cloud).
- Task 7: CSS transitions using `transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]` per AC1 (500ms). Toggle slider animated with `transition-all duration-[400ms]`.
- Task 8: SVG `role="img"` + dynamic `aria-label`, `aria-live="polite"` on diagram container, `role="radiogroup"` on toggle, keyboard navigation (ArrowLeft/ArrowRight), `aria-checked` on radio buttons. TypeScript and ESLint clean.

### Change Log

- 2026-02-13: Story 6.4 implemented — Interactive ARGOS Architecture Diagram with Pilot/Production toggle, connection type selector, pump data integration, topology transitions, and accessibility. 39 new tests (7 store + 32 diagram/controls). Total suite: 1131 tests.
- 2026-02-14: Code review (adversarial) — 7 issues fixed (3H, 4M):
  - H1: Added missing `@keyframes dash-flow` in index.css (animated connections were broken)
  - H2: Fixed vacuous hidden-element tests (replaced `if(el)` guard with unconditional `getByLabelText`)
  - H3: Updated test count and story status
  - M1: Aligned transition timing from 600ms to 500ms per AC1
  - M2: Extracted shared `usePumpStats` hook (totalPumps/modelCount/processCount) from duplicated code
  - M3: Implemented WAI-ARIA roving tabindex on radiogroup (tabIndex={0} on selected, -1 on others)
  - M4: Added 3 ConnectionLine styling tests (solid ethernet, solid RS485, dotted WiFi)
  - Total suite: 1137 tests (42 story 6.4 tests: 7 store + 35 diagram/controls)

### File List

New files:
- argos-roi-calculator/src/components/solutions/diagram/index.ts
- argos-roi-calculator/src/components/solutions/diagram/ArchitectureDiagram.tsx
- argos-roi-calculator/src/components/solutions/diagram/ArchitectureDiagram.test.tsx
- argos-roi-calculator/src/components/solutions/diagram/DiagramControls.tsx
- argos-roi-calculator/src/components/solutions/diagram/PumpCluster.tsx
- argos-roi-calculator/src/components/solutions/diagram/MicroPC.tsx
- argos-roi-calculator/src/components/solutions/diagram/CentralServer.tsx
- argos-roi-calculator/src/components/solutions/diagram/CloudPlatform.tsx
- argos-roi-calculator/src/components/solutions/diagram/ManualSync.tsx
- argos-roi-calculator/src/components/solutions/diagram/AutoPipeline.tsx
- argos-roi-calculator/src/components/solutions/diagram/ConnectionLine.tsx
- argos-roi-calculator/src/components/solutions/diagram/usePumpStats.ts (code review: extracted shared hook)

Modified files:
- argos-roi-calculator/src/stores/app-store.ts (added diagram state + actions)
- argos-roi-calculator/src/stores/app-store.test.ts (added 7 diagram state tests)
- argos-roi-calculator/src/components/solutions/index.ts (added diagram exports)
- argos-roi-calculator/src/pages/Solutions.tsx (integrated DiagramControls + ArchitectureDiagram)
- argos-roi-calculator/src/pages/Solutions.test.tsx (fixed regression, added 2 integration tests)
- argos-roi-calculator/src/index.css (code review: added @keyframes dash-flow)
