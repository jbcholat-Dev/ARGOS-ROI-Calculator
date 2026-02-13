# Spike: Architecture Diagram UX Design

Status: done

## Objective

Design the interactive ARGOS architecture diagram for the Solutions module, covering two distinct deployment topologies (Pilot and Production) and defining all visual components, interactions, and data contracts before implementation in Story 6.4.

## Context

During a party mode discussion (2026-02-13), PO (JB) described two fundamentally different deployment architectures that ARGOS offers clients:

**Pilot Architecture** — Fast deployment, operational day 1:
- ARGOS boxes installed on pumps
- Micro-PCs positioned near pump groups (one per tool/cluster)
- Each micro-PC runs a local MQTT broker
- Wired connections (short cables) from ARGOS boxes to micro-PC
- Daily manual data retrieval by on-site team → sync to cloud
- Prediction models run in the cloud

**Production Architecture** — Full integration, automated:
- ARGOS boxes installed on pumps
- Integration with client network (VMs, VLANs, firewall)
- Centralized on-premise server with MQTT broker
- Automated data pipeline at regular intervals → cloud
- Prediction models run in the cloud

The diagram is a **sales tool**: during client meetings, JB shows the client their future infrastructure in real-time. The visual transition between Pilot and Production demonstrates why starting with a pilot is fast and low-friction.

## Spike Deliverables

### 1. Topology Wireframes
- [x] Wireframe for **Pilot topology** layout
  - Pump clusters (from 6.2 pump model data) → cables → micro-PCs → manual sync icon → Cloud
  - Spatial grouping: pumps near each other in subfab
  - **1:1 mapping**: Each pump cluster has its own dedicated Micro-PC (not shared)
- [x] Wireframe for **Production topology** layout
  - Pump clusters → network cables → centralized server (VMs + MQTT) → auto pipeline → Cloud
  - Client network integration visualization (Firewall Rules, PORT 8883, CLIENT IT VALIDATION)

### 2. Component Inventory
- [x] Define all visual components with SVG specifications:
  - **ARGOS Box** — Small red sensor unit attached to pump (fixed in both modes)
  - **Vacuum Pump** — Pump icon with "+" symbol, model label, quantity, and process name (from 6.2 data)
  - **Micro-PC** — Computer icon with MQTT badge, cluster label, pump count, ETH/RS485 ports (Pilot only)
  - **Centralized Server** — Server card with MQTT Broker, VMs (VM-ARGOS-01 VLAN, VM-ARGOS-02 BACKUP), Network Integration section, Firewall Rules, pump/process count, deployment timeline (Production only)
  - **MQTT Broker** — Green badge on micro-PC or server ("MQTT LOCAL BROKER" or "MQTT BROKER")
  - **Cloud Platform** — Cloud icon with "ARGOS Cloud" label (fixed in both modes)
  - **Prediction Models** — AI/ML card: "Vibration · Temperature · Power consumption"
  - **Alert Engine** — Warning icon card: "PREDICTIVE MAINTENANCE NOTIFICATIONS"
  - **Predictive Maintenance Output** — Checkmark card: "ANOMALY SCORE · RECOMMENDED ACTIONS"
  - **Manual Sync** — Person + USB icons for daily data retrieval (Pilot only), deployment badge "2-3 DAYS"
  - **Auto Pipeline** — Circular sync arrows icon with center data dot, "EVERY 15 MINUTES", "TLS ENCRYPTED TRANSFER", badge "AUTOMATED · NO HUMAN NEEDED" (Production only)
  - **Connection Lines** — Solid (wired) or dotted (wireless) with connection type label (RS-485, Ethernet, WiFi)
  - **Deployment Badge** — Bottom summary: "TOTAL DEPLOYMENT: 2-3 days / NO IT NEEDED" (Pilot) or "3-6 months" (Production)

### 3. Interaction Specification
- [x] **Pilot/Production Toggle**: Segmented control with dynamic slider
  - Switching triggers opacity transitions between topologies
  - Fixed components (ARGOS boxes, pump clusters, Cloud Platform) stay in place
  - Variable components (micro-PCs vs server, manual sync vs auto pipeline) swap with fade
  - Slider dynamically positions via JS `positionSlider()` measuring actual button dimensions
  - Stats bar updates: Micro-PCs/Servers count, Sync frequency (Daily/15 min)
  - Mode badge updates: "Pilot Mode — Operational Day 1" / "Production Mode — Full Integration"
- [x] **Connection Type Dropdown**: RS-485 (Wired) / Ethernet (Wired) / WiFi (Wireless)
  - Changes line style globally: solid stroke for wired, `stroke-dasharray: 8,4` for wireless
  - Updates all 6 connection labels simultaneously (3 pilot + 3 production)
  - Arrow markers update color to match deployment mode accent
- [x] **Pump cluster display**: Reads from 6.2 PreFilledContext data
  - Groups of pumps labeled by model (e.g., "8 pumps — A3004XN — ETCH PROCESS")
  - Visual cluster boundaries with rounded-corner cards
  - Vertically stacked layout for 1-3 clusters

### 4. Data Contract with Story 6.2
- [x] Define the interface between PreFilledContext data and the diagram:
  ```typescript
  // Data consumed by the architecture diagram from 6.2
  interface DiagramPumpData {
    totalPumps: number;
    pumpModelClusters: Array<{ model: string; quantity: number }>;
    processNames: string[];
    processCount: number;
  }
  ```
- [x] Define the diagram-specific state (new store slice for 6.4):
  ```typescript
  interface DiagramState {
    deploymentMode: 'pilot' | 'production';
    connectionType: 'wifi' | 'rs485' | 'ethernet';
  }
  ```

### 5. Visual Design Guidelines
- [x] **Color palette** — Two theme variants validated:

  **Dark theme** (primary):
  - Background: #0B0E14 (deep dark), Panels: #111520, Cards: #161B28
  - Pfeiffer red: #CC0000 (ARGOS boxes, logo)
  - Pilot amber: #FFB020, Production cyan: #00D4FF, Cloud blue: #2E8BFF, MQTT green: #00C896
  - SVG glow filters for visual depth

  **Light theme** (alternative):
  - Background: #F5F6F8, Panels: #FFFFFF, Cards: #F0F1F4
  - Darkened accents for contrast: Pilot amber #C88400, Production cyan #0097B8, Cloud blue #1A6FD4, MQTT green #00946A
  - Subtle box-shadows instead of glows

- [x] Component sizing and spacing for typical viewport (1280px+)
  - SVG viewBox: `0 0 1400 590`
  - 4-column layout: Sub-Fab Environment | Infrastructure | Data Transfer | Cloud Platform
  - Controls bar at top with toggle, dropdown, and stats
- [x] Responsive considerations (minimum viable at 1024px)
- [x] Animation timing and easing for topology transitions
  - CSS transitions: `opacity 0.4s ease, transform 0.5s ease`
  - Toggle slider: `all 0.3s ease`
- [x] Accessibility: All interactive elements keyboard-navigable, diagram has aria-label
  - Toggle uses `role="radiogroup"` with `role="radio"` buttons
  - Connection dropdown has proper label
  - SVG has `role="img"` with descriptive `aria-label`

## Technical Feasibility Notes

**Validated approach (from prototype iteration):**
- Custom SVG with CSS class-driven visibility (`pilot-only` / `production-only`)
- Topology switch = CSS opacity transitions on class toggle (no React Flow / D3 needed)
- Connection lines = SVG `<line>` with dynamic `stroke-dasharray` for wireless style
- Connection labels = SVG `<text>` updated via JS on dropdown change
- Toggle slider = JS `positionSlider()` measuring `offsetLeft`/`offsetWidth` for dynamic sizing
- Stats bar = conditionally rendered values based on deployment mode

**Why NOT React Flow:**
- We're doing storytelling, not node editing
- Fixed layouts (not user-arrangeable)
- Simpler codebase, fewer dependencies
- Full control over Pfeiffer branding

## Scope Boundaries

**In scope:**
- Wireframes and component design
- Interaction specification
- Data contract definition
- Technical approach recommendation

**Out of scope:**
- Code implementation (→ Story 6.4)
- Store slice creation (→ Story 6.4)
- PDF rendering of diagram (→ Story 6.5)
- Story 6.3 form fields (may overlap — connection type exists in both; spike should recommend how to reconcile)

## Resolved Questions

1. **Connection type scope**: Global — one dropdown controls ALL visible connections simultaneously.
2. **Story 6.3 overlap**: The diagram handles deployment mode toggle and connection type dropdown. Story 6.3 should focus on remaining technical specs NOT covered by the diagram (e.g., additional form fields for proposal details). Recommend revising 6.3 scope after 6.4 implementation.
3. **Pump cluster layout**: 1:1 mapping between pump clusters and Micro-PCs in Pilot mode. Vertically stacked, designed for 1-3 clusters. Each cluster gets its own dedicated Micro-PC because physical proximity in the fab dictates network topology.
4. **Cloud Platform content**: Simplified to essential pipeline only — Prediction Models → Alert Engine → Predictive Maintenance Output (Anomaly Score + Recommended Actions). Removed Time Series DB, Dashboard, Monitored Parameters for cleaner visual.
5. **Auto Pipeline icon**: Circular sync arrows with center data dot — represents automated continuous data transfer more intuitively than arrows + padlock.

## Prototype Deliverables

Two fully interactive HTML prototypes validated with PO:

| File | Theme | Location |
|------|-------|----------|
| `6-4-architecture-diagram-prototype.html` | Dark | `_bmad-output/design-references/` |
| `6-4-architecture-diagram-prototype-light.html` | Light | `_bmad-output/design-references/` |

Both prototypes include:
- Pilot/Production toggle with animated slider
- Connection type dropdown (RS-485, Ethernet, WiFi)
- 3 pump clusters with 3 Micro-PCs (Pilot) / 1 Central Server (Production)
- Manual Retrieval (Pilot) / Auto Pipeline (Production)
- Cloud Platform with Prediction Models, Alert Engine, Predictive Maintenance Output
- Stats bar with dynamic values
- Deployment badges with timelines
- Legend bar

## Dependencies

- **Depends on**: Story 6.2 data model (pump model clusters) — completed
- **Blocks**: Story 6.4 (implementation of the diagram) — ready to start
- **May affect**: Story 6.3 (form fields may be simplified based on spike findings)

## References

- Party mode discussion (2026-02-13): Two deployment architectures — Pilot (micro-PCs) vs Production (centralized server)
- [Source: _bmad-output/planning-artifacts/epics.md#Story 6.4: ARGOS Architecture Diagram]
- [Source: _bmad-output/implementation-artifacts/6-2-pre-filled-context-from-roi-analyses.md] (pump model clusters data)
- [Source: _bmad-output/planning-artifacts/architecture.md] (component architecture)
- [Prototype: _bmad-output/design-references/6-4-architecture-diagram-prototype.html] (dark theme)
- [Prototype: _bmad-output/design-references/6-4-architecture-diagram-prototype-light.html] (light theme)
