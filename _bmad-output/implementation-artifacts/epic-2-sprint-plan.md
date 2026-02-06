# Epic 2 Sprint Plan: Single Analysis Creation & ROI Calculation

**Generated:** 2026-02-06
**Epic Status:** in-progress
**Epic Goal:** Enable users to create a complete ROI analysis for a single process, from data entry to instant results display. This is the "Minimum Viable Analysis" that delivers the first critical success moment.

---

## Sprint Overview

### Epic Scope
- **Total Stories:** 8
- **FRs Covered:** FR1-FR3, FR5, FR8-FR29, FR31, FR33
- **NFRs Addressed:** NFR-P1 (<100ms calculations), NFR-R4 (input validation), NFR-S1 (client-side only)

### Velocity Analysis (Based on Epic 1 Performance)
- **Epic 1 Stats:** 6 stories completed, ~12h total effort
- **Average Story Duration:** ~2h per story
- **Epic 2 Projection:** 8 stories × 2h = ~16h estimated effort

### Success Criteria
When Epic 2 is complete, JB can:
1. Create a named analysis via modal
2. Enter all client data (equipment, failure rates, wafer costs, downtime)
3. See ROI results calculated instantly (<100ms)
4. Rename an analysis
5. View which analysis is active

Marc can:
- Witness his operational data transformed into quantified business value in real-time

---

## Story Dependencies & Execution Order

### Critical Path Analysis

```
Foundation Layer:
├── Story 2.1: Analysis Creation Modal ──┬── BLOCKS ALL INPUT STORIES
│                                        │
Parallel Development Tracks:             │
├── Track A: Input Components ←──────────┘
│   ├── Story 2.2: Equipment Fields
│   ├── Story 2.3: Failure Rate Input
│   ├── Story 2.4: Wafer Inputs
│   └── Story 2.5: Downtime Fields
│
├── Track B: Calculation Engine (Independent)
│   └── Story 2.6: ROI Calculation Engine
│
Integration Layer:
├── Story 2.7: Results Panel ←──────────── BLOCKS ON: 2.6 + (2.2, 2.3, 2.4, 2.5)
│
Polish Layer:
└── Story 2.8: Rename & Active State ←──── BLOCKS ON: 2.1
```

### Dependency Matrix

| Story | Depends On | Blocks | Can Start After |
|-------|------------|--------|-----------------|
| 2.1 | None | 2.2, 2.3, 2.4, 2.5, 2.8 | Immediate |
| 2.2 | 2.1 | 2.7 | Story 2.1 done |
| 2.3 | 2.1 | 2.7 | Story 2.1 done |
| 2.4 | 2.1 | 2.7 | Story 2.1 done |
| 2.5 | 2.1 | 2.7 | Story 2.1 done |
| 2.6 | None | 2.7 | Immediate (parallel) |
| 2.7 | 2.6, 2.2-2.5 | None | All inputs + calc done |
| 2.8 | 2.1 | None | Story 2.1 done |

---

## Recommended Execution Sequence

### Phase 1: Foundation (Stories 2.1, 2.6)
**Goal:** Establish modal system and calculation engine in parallel

#### Story 2.1: Analysis Creation Modal and Store Integration
- **Priority:** P0 (blocks everything)
- **Estimated Duration:** 2h
- **Key Deliverables:**
  - Modal component with name input
  - Zustand store integration (add/update analysis)
  - Navigation to Focus Mode after creation
  - Validation: name required
- **Testing Focus:**
  - Modal open/close behavior
  - Store state updates
  - Navigation routing
  - Empty name validation
- **Success Metric:** Can create analysis and navigate to Focus Mode

#### Story 2.6: ROI Calculation Engine (Parallel Track)
- **Priority:** P0 (blocks 2.7)
- **Estimated Duration:** 2h
- **Key Deliverables:**
  - Pure calculation functions in `lib/calculations.ts`
  - `calculateTotalFailureCost()`
  - `calculateArgosServiceCost()`
  - `calculateSavings()`
  - `calculateROI()`
  - Complete test coverage (NFR-P1: <100ms)
- **Testing Focus:**
  - Formula accuracy
  - Performance benchmarks (<100ms)
  - Edge cases (zero values, negatives)
  - Pure function behavior (no side effects)
- **Success Metric:** All calculations pass tests and perform <100ms

**Phase 1 Total:** ~4h

---

### Phase 2: Input Components (Stories 2.2-2.5)
**Goal:** Build all input fields with validation

All stories in this phase can be developed in parallel if team capacity allows.

#### Story 2.2: Equipment Input Fields (Pump Type & Quantity)
- **Priority:** P1
- **Estimated Duration:** 2h
- **Key Deliverables:**
  - InputPanel component structure
  - Pump model text field
  - Pump quantity numeric field
  - Zod validation (positive numbers)
  - Real-time error feedback
- **Testing Focus:**
  - Positive number validation
  - String/number type handling
  - Error message display
- **Success Metric:** Equipment fields validate and save to store

#### Story 2.3: Failure Rate Dual-Mode Input
- **Priority:** P1
- **Estimated Duration:** 2h
- **Key Deliverables:**
  - Toggle: Percentage / Absolute Count
  - Percentage mode field
  - Absolute count mode (failures + pumps)
  - Auto-calculation: failureRate = (failures / pumps) × 100
  - Mode switch preserves calculated value
- **Testing Focus:**
  - Mode toggle behavior
  - Auto-calculation accuracy
  - Value preservation on mode switch
- **Success Metric:** Can enter failure rate both ways with correct calculation

#### Story 2.4: Wafer Type and Cost Inputs
- **Priority:** P1
- **Estimated Duration:** 2h
- **Key Deliverables:**
  - Radio buttons: Mono-wafer / Batch
  - Conditional "Wafers per batch" field (default 125)
  - Wafer cost field with EUR formatting
  - Thousand separator display
- **Testing Focus:**
  - Conditional field visibility
  - Default value (125 for Batch)
  - Currency formatting
  - Negative value validation
- **Success Metric:** Wafer inputs work with proper defaults and formatting

#### Story 2.5: Downtime Input Fields
- **Priority:** P1
- **Estimated Duration:** 2h
- **Key Deliverables:**
  - Downtime duration field (hours)
  - Downtime cost field (EUR/hour)
  - EUR formatting with thousand separators
  - Required field validation
- **Testing Focus:**
  - Required field handling
  - Currency formatting
  - Validation messages
- **Success Metric:** Downtime fields validate and format correctly

**Phase 2 Total:** ~8h (sequential) or ~2h (parallel with 4 developers)

---

### Phase 3: Integration (Story 2.7)
**Goal:** Connect inputs to calculation engine with real-time display

#### Story 2.7: Results Panel with Real-Time Display
- **Priority:** P0 (critical success moment)
- **Estimated Duration:** 2h
- **Key Deliverables:**
  - ResultsPanel component with 4 metric cards
  - Real-time calculation on input change (<100ms)
  - Traffic-light ROI color coding
  - Formula tooltip (FR29)
  - Incomplete state handling ("--" or "Enter data...")
  - Hero number typography
- **Testing Focus:**
  - Real-time recalculation performance
  - Color coding thresholds (red <0%, orange 0-15%, green >15%)
  - Tooltip display
  - Incomplete data handling
  - Integration with all input fields
- **Success Metric:** Results update instantly with correct calculations and visual feedback

**Phase 3 Total:** ~2h

---

### Phase 4: Polish (Story 2.8)
**Goal:** Add rename functionality and active state indicator

#### Story 2.8: Analysis Rename and Active State Indicator
- **Priority:** P2
- **Estimated Duration:** 1.5h
- **Key Deliverables:**
  - Inline editable analysis name in Focus Mode header
  - Save on Enter or blur
  - Empty name validation
  - Active analysis visual indicator
  - Route parameter sync with activeAnalysisId
- **Testing Focus:**
  - Inline edit behavior
  - Empty name validation
  - Active state visual feedback
  - Route/store synchronization
- **Success Metric:** Can rename analysis and see active indicator

**Phase 4 Total:** ~1.5h

---

## Sprint Summary

### Time Estimates
- **Sequential Execution:** ~15.5h
- **Optimal Parallel Execution:** ~9.5h (with Phase 2 parallelization)

### Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Story 2.1 delays block 5 stories | HIGH | Prioritize 2.1, start 2.6 in parallel |
| Story 2.7 integration complexity | MEDIUM | Comprehensive integration tests, use Epic 1 patterns |
| Calculation performance (<100ms NFR) | MEDIUM | Benchmark early in 2.6, optimize if needed |
| Real-time recalculation bugs | MEDIUM | Use Zustand selectors to prevent unnecessary re-renders |

### Quality Gates
- [ ] All 8 stories pass acceptance criteria
- [ ] 100% test coverage for calculation engine (Story 2.6)
- [ ] Real-time calculation performance <100ms (NFR-P1)
- [ ] Input validation prevents invalid data (NFR-R4)
- [ ] Integration test: create analysis → enter all fields → see results

---

## Next Steps

### Immediate Action
**Start Story 2.1: Analysis Creation Modal and Store Integration**

This is the foundation story that unblocks the majority of Epic 2 work.

### Command to Execute
```bash
/bmad-bmm-create-story 2.1
```

### Parallel Development Opportunity
Once Story 2.1 is in review/done, consider:
- Starting Story 2.6 (calculation engine) - completely independent
- Starting Stories 2.2-2.5 in parallel if multiple developers available

### After Epic 2 Completion
1. Run Epic 2 retrospective: `/bmad-bmm-retrospective epic-2`
2. Mark epic-2 status: `done` in sprint-status.yaml
3. Commit all artifacts to GitHub
4. Proceed to Epic 3: Multi-Analysis Management

---

## Epic 2 Definition of Done

- [ ] All 8 stories marked "done" in sprint-status.yaml
- [ ] 191+ tests passing (Epic 1 baseline + new Epic 2 tests)
- [ ] User can create named analysis via modal
- [ ] User can enter all input fields (equipment, failure rate, wafer, downtime)
- [ ] Results display in real-time with <100ms recalculation
- [ ] ROI color coding works (red/orange/green)
- [ ] User can rename analysis inline
- [ ] Active analysis indicator visible
- [ ] All Epic 2 FRs validated (FR1-FR3, FR5, FR8-FR29)
- [ ] NFR-P1 validated (<100ms calculations)
- [ ] Integration test passes end-to-end

---

**Sprint Plan Owner:** JB Cholat
**Framework:** BMAD v6.0.0-Beta.5
**Project:** ARGOS ROI Calculator V10
