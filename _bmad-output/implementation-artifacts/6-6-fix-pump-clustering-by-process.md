# Story 6.6: Fix Pump Clustering by Process

Status: done

## Story

As a **user (JB presenting the ARGOS deployment to Marc during a client meeting)**,
I want **the architecture diagram to show one pump cluster per process (analysis), not per pump model**,
So that **each cluster reflects a distinct physical location in the fab where pumps are co-located, with its own Micro-PC in Pilot mode, matching the real deployment topology**.

## Context — Why This Story Exists

During the Epic 6 retrospective (2026-02-15), the PO identified that the current clustering logic in `usePumpStats` groups analyses by `pumpType` (pump model), merging quantities when multiple analyses use the same pump model. This is **physically incorrect**.

**The problem:** "Poly Etch" (8x A3004XN) and "CVD" (6x A3004XN) are merged into a single cluster "A3004XN: 14 pumps". But in the real fab, Poly Etch and CVD are in **different physical locations**. They need separate Micro-PCs because cabling must stay short.

**The rule (confirmed by PO):** 1 cluster = 1 analysis = 1 process = 1 physical location in the fab.

**Current behavior:**
```
3 analyses: Poly Etch (8x A3004XN), Metal Dep (12x HiPace 300), CVD (6x A3004XN)
→ 2 clusters: A3004XN (14), HiPace 300 (12)
→ 2 Micro-PCs in Pilot mode
```

**Correct behavior:**
```
3 analyses: Poly Etch (8x A3004XN), Metal Dep (12x HiPace 300), CVD (6x A3004XN)
→ 3 clusters: Poly Etch (8x A3004XN), Metal Dep (12x HiPace 300), CVD (6x A3004XN)
→ 3 Micro-PCs in Pilot mode
```

## Acceptance Criteria

### AC1: One Cluster Per Analysis (Process)
**Given** I have 3 analyses: "Poly Etch" (8x A3004XN), "Metal Dep" (12x HiPace 300), "CVD" (6x A3004XN)
**When** I view the architecture diagram
**Then** I see 3 pump clusters (not 2):
  - Cluster 1: "Poly Etch" — 8x A3004XN
  - Cluster 2: "Metal Dep" — 12x HiPace 300
  - Cluster 3: "CVD" — 6x A3004XN
**And** the A3004XN pumps are NOT merged across processes
**And** in Pilot mode, I see 3 Micro-PCs (one per cluster)

### AC2: Pump Cluster Displays Process Name + Model + Quantity
**Given** I view a pump cluster in the diagram
**When** the cluster renders
**Then** I see the process name (analysis name) prominently displayed
**And** I see the pump model below the process name
**And** I see the pump quantity
**And** the layout is: quantity + "pumps" on one line, model on the next, process name below (or above)

### AC3: DiagramControls Stats Updated
**Given** I have 3 analyses with 2 distinct pump models
**When** I view DiagramControls
**Then** "Pumps" shows total pump count (unchanged: 26)
**And** "Models" shows number of distinct pump models (unchanged: 2)
**And** "Processes" shows number of analyses (unchanged: 3)

### AC4: Diagram aria-label Updated
**Given** I have 3 analyses
**When** the diagram renders
**Then** the SVG aria-label says "3 processes" (not "2 models")
**And** each pump cluster has an aria-label like "Poly Etch — 8 A3004XN pumps"

### AC5: Empty State Unchanged
**Given** I have 0 analyses
**When** I view the diagram
**Then** the empty state message is unchanged: "Add ROI analyses to see your deployment architecture"

### AC6: Dynamic Updates
**Given** I have analyses and the diagram is rendered
**When** I add, remove, or modify an analysis
**Then** the clusters update accordingly (one per analysis)
**And** Micro-PCs in Pilot mode match the new cluster count

### AC7: Micro-PC Labels Updated
**Given** I am in Pilot mode with 3 clusters
**When** I view the Micro-PCs
**Then** each Micro-PC shows the process name of its associated cluster
**And** the pump count shows the pumps from that specific process (not merged)

## Tasks / Subtasks

### Task 1: Refactor `usePumpStats` Hook (AC: 1, 3, 6)
- [x] Modify `src/components/solutions/diagram/usePumpStats.ts`:
  - Change `PumpModelCluster` interface to `PumpCluster`:
    ```typescript
    export interface PumpCluster {
      processName: string;    // analysis name
      model: string;          // pumpType
      quantity: number;        // pumpQuantity
    }
    ```
  - Replace Map-based grouping with direct analysis mapping:
    ```typescript
    const pumpClusters = useMemo(() => {
      return analyses
        .filter((a) => a.name && a.pumpType)
        .map((a) => ({
          processName: a.name,
          model: a.pumpType,
          quantity: a.pumpQuantity || 0,
        }));
    }, [analyses]);
    ```
  - Keep `totalPumps` calculation unchanged (sum of all pumpQuantity)
  - Keep `modelCount` calculation unchanged (distinct pumpTypes)
  - Keep `processCount` unchanged (analyses.length)
  - Rename return property: `pumpModelClusters` → `pumpClusters`
  - Add `processNames` to return value: `analyses.map(a => a.name).filter(Boolean)`

### Task 2: Update `PumpCluster` Component (AC: 2, 4)
- [x] Modify `src/components/solutions/diagram/PumpCluster.tsx`:
  - Add `processName` prop to `PumpClusterProps`:
    ```typescript
    interface PumpClusterProps {
      processName: string;  // NEW
      model: string;
      quantity: number;
      x: number;
      y: number;
      height?: number;
    }
    ```
  - Add process name display below the model name:
    - Process name: `fontSize: 11, fontWeight: 600, fill: #1A1D26` (prominent)
    - Move model to smaller text below process name
  - Update aria-label: `${processName} — ${quantity} ${model} pumps`
  - Adjust vertical spacing in the component to accommodate the new text line

### Task 3: Update `ArchitectureDiagram` Container (AC: 1, 4, 6)
- [x] Modify `src/components/solutions/diagram/ArchitectureDiagram.tsx`:
  - Update destructuring: `pumpModelClusters` → `pumpClusters`
  - Update PumpCluster rendering to pass `processName`:
    ```typescript
    <PumpCluster
      key={cluster.processName}  // key by process, not model
      processName={cluster.processName}
      model={cluster.model}
      quantity={cluster.quantity}
      x={36}
      y={clusterPositions[i].y}
      height={clusterPositions[i].height}
    />
    ```
  - Update aria-label: change "X models" to "X processes":
    ```typescript
    `ARGOS ${isPilot ? 'Pilot' : 'Production'} architecture with ${totalPumps} pumps across ${pumpClusters.length} process${pumpClusters.length > 1 ? 'es' : ''}`
    ```
  - Update `isEmpty` check: `pumpClusters.length === 0`
  - Verify SVG viewBox height calculation still works with potentially more clusters (up to 5)

### Task 4: Update `MicroPC` Component (AC: 7)
- [x] Modify `src/components/solutions/diagram/MicroPC.tsx`:
  - Add `processName` prop:
    ```typescript
    interface MicroPCProps {
      x: number;
      y: number;
      clusterIndex: number;
      pumpCount: number;
      processName: string;  // NEW
    }
    ```
  - Replace "NEAR TOOL CLUSTER {n}" with process name:
    ```typescript
    <text ...>{processName.toUpperCase()}</text>
    ```
  - Update aria-label: `Micro-PC for ${processName}, ${pumpCount} pumps connected`

### Task 5: Update `ArchitectureDiagram` Micro-PC Rendering (AC: 7)
- [x] In `ArchitectureDiagram.tsx`, update Micro-PC rendering:
  ```typescript
  <MicroPC
    key={`micropc-${cluster.processName}`}
    x={microPcX}
    y={clusterPositions[i].y}
    clusterIndex={i}
    pumpCount={cluster.quantity}
    processName={cluster.processName}
  />
  ```

### Task 6: Update Tests (AC: all)
- [x] Modify `src/components/solutions/diagram/ArchitectureDiagram.test.tsx`:
  - **Fix "shows pump clusters from store analyses"**: 3 analyses → 3 clusters (not 2). Remove "merge A3004XN" comment. Update aria-label assertion: `3 processes` instead of `2 models`.
  - **Fix "renders correct number of pump cluster groups"**: Update aria-label assertions to include process name: `getByLabelText('A — 8 A3004XN pumps')` → `getByLabelText('Poly Etch — 8 A3004XN pumps')` format.
  - **Fix "shows pump clusters in both modes"**: Update assertion to match new aria-label format.
  - **Fix "shows correct pump count on micro-PC"**: Update to check process name in Micro-PC label.
  - **Fix SVG aria-label tests**: Change `models` to `processes` in assertions.
  - **Add new tests**:
    - Test: Same pump model on 2 different processes → 2 separate clusters
    - Test: PumpCluster shows process name prominently
    - Test: Micro-PC shows process name instead of "NEAR TOOL CLUSTER"
    - Test: 5 analyses → 5 clusters (max scenario)

### Task 7: Accessibility and Code Quality Audit (AC: all)
- [x] Verify:
  - All updated aria-labels are descriptive and include process name
  - No console.log in production code
  - TypeScript strict mode passes
  - ESLint passes with no warnings
  - Tailwind classes follow Layout → Spacing → Typography → Colors → Effects order
  - Named exports only

## Dev Notes

### Critical Context — This is a Business Logic Fix, Not a UI Tweak

The current clustering merges pumps by model across processes. This creates a **misleading architecture diagram** where:
- The client sees fewer clusters than they should (2 instead of 3)
- The Micro-PC count is wrong in Pilot mode (2 instead of 3)
- The physical deployment topology doesn't match reality

**Real-world consequence:** If JB shows a client 2 Micro-PCs when they actually need 3, the technical proposal will be inaccurate. This directly impacts sales credibility.

### What Changes (Summary)

```
usePumpStats.ts    — Simplify: map by analysis instead of grouping by pumpType
PumpCluster.tsx    — Add processName prop + display
MicroPC.tsx        — Add processName prop, replace "NEAR TOOL CLUSTER" label
ArchitectureDiagram.tsx — Update cluster key, pass processName, update aria-labels
ArchitectureDiagram.test.tsx — Fix merge assertions, add same-model-different-process test
```

### What Does NOT Change

- `DiagramControls.tsx` — Stats remain the same (totalPumps, modelCount, processCount all unchanged)
- `CentralServer.tsx` — Uses totalPumps and processCount, both unchanged
- `CloudPlatform.tsx` — No data dependency
- `ManualSync.tsx`, `AutoPipeline.tsx` — No data dependency
- `ConnectionLine.tsx` — Renders based on cluster positions, adapts automatically
- Store (`app-store.ts`) — No changes needed
- `Solutions.tsx` — No changes needed
- Connection lines — Layout logic iterates over clusters, works automatically with more clusters

### Simplification — Less Code, Not More

The current `usePumpStats` uses a `Map` to group by `pumpType`, then converts to array. The new logic is simpler:

```typescript
// BEFORE (complex, incorrect):
const pumpModelClusters = useMemo(() => {
  const clusters = new Map<string, number>();
  analyses.forEach((a) => {
    if (a.pumpType) {
      clusters.set(a.pumpType, (clusters.get(a.pumpType) || 0) + (a.pumpQuantity || 0));
    }
  });
  return Array.from(clusters.entries()).map(([model, quantity]) => ({ model, quantity }));
}, [analyses]);

// AFTER (simple, correct):
const pumpClusters = useMemo(() => {
  return analyses
    .filter((a) => a.name && a.pumpType)
    .map((a) => ({
      processName: a.name,
      model: a.pumpType,
      quantity: a.pumpQuantity || 0,
    }));
}, [analyses]);
```

### Layout Consideration — Up to 5 Clusters

With clustering by process, the maximum cluster count increases from ~2-3 (by model) to 5 (max analyses). The SVG viewBox height calculation already handles this:

```typescript
const svgHeight = isEmpty ? 200 : Math.max(590, 50 + pumpModelClusters.length * 170 + 80);
```

With 5 clusters: `50 + 5 * 170 + 80 = 980px` — taller but still functional. The diagram uses `viewBox` scaling so it will fit the container. May want to verify visual quality at 5 clusters.

### Previous Story Intelligence

**From Story 6.4 (Interactive Architecture Diagram):**
- 1137 tests passing (baseline for Story 6.6)
- `usePumpStats` hook extracted during code review (M2: code duplication)
- Roving tabindex implemented on radiogroup (M3)
- `@keyframes dash-flow` added for animated connections (H1)
- Test regression with `getByText('20')` duplicates — fixed with `getAllByText`

**From Epic 6 Retrospective:**
- Prefer `within()` queries over global `getByText` selectors
- Adversarial code review mandatory (3 parallel agents)
- 1 cluster = 1 analysis = 1 process (PO-confirmed rule)

### Technology Versions (Current)

- React 19.2, TypeScript 5.9, Vite 7.2
- Tailwind CSS v4.1
- Zustand 5.0, React Router 7.13
- Vitest 4.0 + Testing Library
- **1137 tests passing** (baseline)

### What to Build

1. **Refactor `usePumpStats`** — simplify clustering to 1:1 with analyses
2. **Update `PumpCluster`** — add processName display
3. **Update `MicroPC`** — show process name instead of generic cluster label
4. **Update `ArchitectureDiagram`** — pass processName, update aria-labels
5. **Fix + add tests** — ~8 test modifications, ~4 new tests

### What NOT to Build

- **Store changes** — not needed, data is already correct in analyses[]
- **New components** — no new files, only modifications
- **DiagramControls changes** — stats are unchanged
- **Connection line changes** — they iterate over clusters automatically
- **PDF-related changes** — Story 6.5 scope

### Edge Cases to Handle

1. **Analysis with empty name** — filter out (already handled by `.filter(a => a.name && a.pumpType)`)
2. **Analysis with empty pumpType** — filter out
3. **Single analysis** — 1 cluster, 1 Micro-PC
4. **5 analyses (max)** — 5 clusters, taller SVG, verify visual quality
5. **All analyses same pump model** — 5 separate clusters (NOT merged), each showing its own process name
6. **Analysis name very long** — CSS truncation or wrapping in SVG text

### File Structure

**Files to MODIFY (4):**
- `argos-roi-calculator/src/components/solutions/diagram/usePumpStats.ts` — Refactor clustering logic
- `argos-roi-calculator/src/components/solutions/diagram/PumpCluster.tsx` — Add processName prop + display
- `argos-roi-calculator/src/components/solutions/diagram/MicroPC.tsx` — Add processName prop + display
- `argos-roi-calculator/src/components/solutions/diagram/ArchitectureDiagram.tsx` — Update cluster references + aria-labels
- `argos-roi-calculator/src/components/solutions/diagram/ArchitectureDiagram.test.tsx` — Fix assertions + add tests

**Files UNCHANGED:**
- `argos-roi-calculator/src/components/solutions/diagram/DiagramControls.tsx`
- `argos-roi-calculator/src/components/solutions/diagram/CentralServer.tsx`
- `argos-roi-calculator/src/components/solutions/diagram/CloudPlatform.tsx`
- `argos-roi-calculator/src/components/solutions/diagram/ManualSync.tsx`
- `argos-roi-calculator/src/components/solutions/diagram/AutoPipeline.tsx`
- `argos-roi-calculator/src/components/solutions/diagram/ConnectionLine.tsx`
- `argos-roi-calculator/src/stores/app-store.ts`
- `argos-roi-calculator/src/pages/Solutions.tsx`

### References

- [Source: _bmad-output/implementation-artifacts/epic-6-retro-2026-02-15.md] (discovery: clustering by process)
- [Source: _bmad-output/implementation-artifacts/6-4-interactive-architecture-diagram.md] (original 6.4 story)
- [Source: _bmad-output/implementation-artifacts/6-spike-architecture-diagram-design.md] (spike: 1:1 mapping clusters to Micro-PCs)
- [Source: argos-roi-calculator/src/components/solutions/diagram/usePumpStats.ts] (current clustering logic)
- [Source: argos-roi-calculator/src/components/solutions/diagram/PumpCluster.tsx] (current component)
- [Source: argos-roi-calculator/src/components/solutions/diagram/MicroPC.tsx] (current component)
- [Source: argos-roi-calculator/src/components/solutions/diagram/ArchitectureDiagram.tsx] (container)
- [Source: argos-roi-calculator/src/components/solutions/diagram/ArchitectureDiagram.test.tsx] (current tests)

## Test Estimates

- usePumpStats refactor: ~3 test modifications (existing store tests may reference pumpModelClusters)
- ArchitectureDiagram cluster tests: ~4 test modifications (merge assertions → separate assertions)
- PumpCluster process name: ~2 new tests (process name displayed, aria-label updated)
- MicroPC process name: ~1 new test (process name replaces generic label)
- Same-model-different-process: ~1 new test (key scenario)
- 5-cluster layout: ~1 new test (max scenario visual integrity)
- Aria-label updates: ~2 test modifications
- **Total: ~8 modifications + ~5 new tests**
- **Expected total: ~1142 tests** (1137 baseline + 5 new)

## Dev Agent Record

### Implementation Plan

Implemented all 7 tasks as a cohesive unit since Tasks 1-5 are interdependent (changing the interface in usePumpStats breaks downstream components). The core change replaces Map-based grouping by pumpType with direct 1:1 mapping from analyses, resulting in simpler and more correct code. Removed unused `clusterIndex` prop from MicroPC during quality audit.

### Completion Notes

- Refactored `usePumpStats`: `PumpModelCluster` → `PumpCluster` with `processName` field. Simplified Map-based grouping to direct `.filter().map()` — less code, correct behavior.
- Updated `PumpCluster`: Added `processName` prop and display (fontSize 11, fontWeight 600). Updated aria-label to include process name.
- Updated `MicroPC`: Added `processName` prop, replaced "NEAR TOOL CLUSTER {n}" with `processName.toUpperCase()`. Removed unused `clusterIndex` prop (ESLint catch).
- Updated `ArchitectureDiagram`: `pumpModelClusters` → `pumpClusters`, key by processName, aria-label "models" → "processes", pass processName to PumpCluster and MicroPC.
- Updated 7 existing test assertions (aria-labels, merge behavior, micro-PC labels).
- Added 5 new tests: same-model-different-process (2 clusters), process name on PumpCluster, process name on MicroPC replacing generic label, 5-cluster max scenario with 5 Micro-PCs, singular "process" in aria-label.
- ESLint: 0 errors on modified files. All 1117 tests pass, 0 regressions.

## File List

**Modified:**
- `argos-roi-calculator/src/components/solutions/diagram/usePumpStats.ts`
- `argos-roi-calculator/src/components/solutions/diagram/PumpCluster.tsx`
- `argos-roi-calculator/src/components/solutions/diagram/MicroPC.tsx`
- `argos-roi-calculator/src/components/solutions/diagram/ArchitectureDiagram.tsx`
- `argos-roi-calculator/src/components/solutions/diagram/ArchitectureDiagram.test.tsx`
- `_bmad-output/implementation-artifacts/6-6-fix-pump-clustering-by-process.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- 2026-02-15: Story 6-6 created from Epic 6 retrospective discovery
- 2026-02-16: Implementation complete — 5 files modified, 7 test modifications + 5 new tests, 1117 tests passing
- 2026-02-16: Code review passed — 12 issues found (3H, 6M, 3L), all H+M fixed automatically. Fixes: React keys use analysis.id (H1), processCount uses filtered count (H2), dead code processNames removed (H3), whitespace trim on filter (M1), consolidated useMemo (M2), removed dead height prop (M3), tightened CONNECTION_TYPE_LABELS type (M4), aria-hidden on decorative SVG (M5), 2 edge case tests added (M6). 1119 tests passing.
