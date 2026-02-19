# Epic 4.5 Retrospective — Pre-Demo Improvements

**Date:** 2026-02-18
**Epic:** Epic 4.5 - Pre-Demo Improvements
**Status:** ALL 4 STORIES DONE — Epic complete
**Previous Retro:** epic-4-retro-2026-02-12.md
**Participants:** JB (Project Lead), Bob (Scrum Master), Alice (Product Owner), Charlie (Senior Dev), Dana (QA Engineer), Elena (Junior Dev)

---

## Executive Summary

Epic 4.5 delivered 4 high-priority feedback items in a single day via parallel development (2 waves), addressing ROI credibility issues identified during internal review before a client demo. All 4 stories completed with +138 tests and 23 code review issues found (including 2 CRITICAL). However, the retrospective revealed significant gaps: the What-If scenario mode doesn't support the new maintenance strategies, a Bottleneck toggle bug exists in What-If, and the maintenance model terminology needs revision based on real client vocabulary (GlobalFoundries).

**Key Outcome:** 4/4 stories done, 138 new tests (1119 → 1257), 23 code review issues found and fixed (2 CRITICAL, 8 HIGH, 10 MEDIUM, 3 LOW). Demo postponed to next week to address discovered issues properly.

**JB Assessment:** Stories 4.5.1-3 worked well. Story 4.5.4 partially — bugs discovered in What-If integration and conceptual revision needed for maintenance strategy terminology based on real client workflows.

---

## Epic 4.5 Metrics

| Metric | Value |
|--------|-------|
| **Total Stories** | 4 |
| **Stories Done** | 4/4 (100%) |
| **Test Count** | 1119 → 1257 (+138 tests, +12%) |
| **Execution** | 1 day — 2 parallel waves |
| **Code Review Issues** | 2 CRITICAL + 8 HIGH + 10 MEDIUM + 3 LOW → 100% H+M fixed |
| **Technical Debt Added** | 1 item (ComparisonTable strategy columns deferred) |
| **Blockers** | 0 |
| **Production Incidents** | 0 |
| **Feedback Items Delivered** | FB-1, FB-2, FB-3, FB-4 (100%) |

### Per-Story Breakdown

| Story | Tests Added | Files | Code Review | Agent |
|-------|------------|-------|-------------|-------|
| 4.5.1 — LocalStorage Persistence | +28 | 9 (2 NEW, 7 MOD) | 2H, 4M, 2L | dev-persistence |
| 4.5.2 — Wafer Defect Decoupling | +10 new, ~30 mod | 14+ | 2C, 2H, 3M | dev-wafer |
| 4.5.3 — Bottleneck Tool Toggle | +33 | 9 (0 NEW, 9 MOD) | 1H, 4M, 1L | dev-persistence |
| 4.5.4 — Maintenance Strategy | +54 | 16 (6 NEW, 10 MOD) | 3H, 3M, 2L | dev-strategy |

### Execution Pattern

- **Wave 1** (parallel): 4.5.1 + 4.5.2
- **Wave 2** (parallel, after 4.5.2): 4.5.3 + 4.5.4

---

## Epic 4 Retro Action Items — Follow-Through

| # | Action Item | Status | Evidence in Epic 4.5 |
|---|------------|--------|----------------------|
| 1 | Continue adversarial code reviews (3 parallel reviewers) | ✅ Applied | 23 issues found across 4 stories, 2 CRITICAL caught |
| 2 | Document MemoryRouter requirement in story templates | ⏳ Partial | Not explicitly mentioned in 4.5 Dev Notes |
| 3 | Prefer `within()` queries over global `getByText` | ⏳ Not verifiable | No explicit data in 4.5 reviews |
| 4 | Update epic-4 status to done | ✅ Done | `epic-4: done` in sprint-status |
| 5 | Update CLAUDE.md with test count | ⏳ Partial | CLAUDE.md shows 603 tests (Epic 3), not updated to 1257+ |

**Result: 2/5 completed, 3/5 partial (40% full compliance)**

---

## Successes — What Went Well

### 1. Parallel Execution — 4 Stories in 1 Day
Two-wave parallel development delivered all 4 feedback items in a single day. Wave 1 (4.5.1 + 4.5.2) ran independently, Wave 2 (4.5.3 + 4.5.4) started after 4.5.2 completed (dependency on decoupled formula).

### 2. LocalStorage Persistence — Demo Safety Net
Story 4.5.1 delivered auto-persist with Zustand `partialize` (only data state, not transient UI), session recovery modal with forced choice (no close button), and graceful degradation. Protects all future demo sessions.

### 3. Wafer Defect Formula Decoupled — ROI Credibility Restored
Story 4.5.2 separated wafer defect events from pump failures. Previously, every failure multiplied wafer cost — incorrect for clients where 9 pumps with 3 failures/year may have only 1 wafer defect event. Fundamental credibility fix.

### 4. Adversarial Code Reviews — 2 CRITICAL Bugs Caught
Story 4.5.2 review found `AnalysisCard` and `MiniCard` using `calculateTotalFailureCost` directly instead of `calculateStrategySavings` — displaying incorrect ROI values on Dashboard and sidebar. Without review, these would have shown wrong numbers to clients.

### 5. Architectural Patterns
- `calculateStrategySavings()` centralized dispatch (4.5.4) — clean multi-strategy pattern
- Zustand `persist` with `partialize` (4.5.1) — selective state persistence
- Select dropdown for bottleneck multiplier (4.5.3) — fewer validation edge cases

---

## Challenges — What Didn't Go Well

### 1. Systematic Field Propagation Failures (3/4 stories)
Every story that added fields to the `Analysis` type had at least one instance where consumers weren't updated:
- **4.5.2 (CRITICAL):** AnalysisCard + MiniCard used wrong calculation function
- **4.5.2 (HIGH):** `handleReplaceOriginal` + `isWaferModified` missing `waferDefectEventsPerYear`
- **4.5.4:** What-If doesn't support Planned mode fields at all

**Root cause:** No systematic checklist for "new Analysis field" — each developer checks what they remember, not what exists.

### 2. What-If Is the Systematic Blind Spot
The ComparisonView / What-If mode was built in Epic 3 with a single calculation model. Every subsequent change to the Analysis model creates gaps in What-If. This is the #1 recurring integration issue.

### 3. Documentation Hygiene Under Rush Pressure
- Task checkboxes unmarked in 4.5.1, 4.5.2
- Files Changed tables incomplete in 4.5.1, 4.5.2
- Story 4.5.4 Definition of Done checkboxes not marked
- CLAUDE.md still shows 603 tests (actual: 1257+)

### 4. Maintenance Model Terminology Gap
The theoretical model ("failure rate", "overhaul cost" in Unplanned) doesn't match real client vocabulary. GlobalFoundries operates in "Run-to-fail + Opportunistic PM" — pumps are removed for various reasons (failure, noise, vibration), not just catastrophic failures.

---

## Key Insights

1. **The What-If scenario is the most critical demo feature AND the most fragile** — it's where clients confront hypotheses live, yet it breaks with every model change
2. **Real client vocabulary invalidates theoretical assumptions** — "failure rate" → "pump removal rate", "duration per failure" → "duration per event" — only field contact reveals these gaps
3. **Adversarial code reviews are the proven safety net** — 5 consecutive epics, consistently finding CRITICAL/HIGH issues that tests alone miss
4. **Parallel execution works but trades documentation quality** — 4 stories in 1 day is impressive velocity, but doc hygiene suffers under pressure

---

## Bugs Discovered During Retrospective

| # | Bug | Severity | Context |
|---|-----|----------|---------|
| B1 | What-If + Bottleneck toggle doesn't update results | CRITICAL | Toggling isBottleneck in What-If mode doesn't trigger recalculation |
| B2 | What-If doesn't show Planned mode fields | HIGH | MTBF extension, PM interval, overhaul cost not available in What-If when analysis is Planned |

---

## Conceptual Revision — Maintenance Strategy Model

### Unplanned Mode — Changes Required

| # | Change | Detail |
|---|--------|--------|
| D1 | Rename "Failure rate" → **"Pump removal rate"** | Covers both Run-to-fail and Opportunistic PM removals |
| D2 | Add **MTBF** field | No fixed PM interval in Unplanned — MTBF characterizes pump lifetime |
| D3 | **Remove "Overhaul cost"** from Unplanned | Not used in Unplanned ROI calculation |
| D4 | Rename "Duration per failure" → **"Duration per event"** | An event = removal (failure or preventive), downtime applies to both |

### Planned Mode — No Field Changes

- Value proposition updated: **Extend MTBF** (primary) + **Anticipate Failure** (secondary, for residual events despite PM)

### Both Modes Summary

| | **Unplanned** | **Planned** |
|---|---|---|
| **Client situation** | Run-to-fail + Opportunistic PM | Fixed-interval PM |
| **ARGOS value prop** | Anticipate Failure | Extend MTBF + Anticipate Failure (residual) |
| **Field changes** | Rename fields, add MTBF, remove overhaul cost | None |

---

## What-If UX Issues (from DESIGN_FEEDBACK.md + retrospective)

| # | Problem | Impact |
|---|---------|--------|
| UX1 | Left/right panels have different sizes | Visual misalignment of compared fields |
| UX2 | Scroll desynchronized between panels | Cannot compare same sections side-by-side |
| UX3 | Results at bottom — not visible when editing fields at top | Cannot see impact of changes in real-time |

---

## Significant Discovery Alert

**Discoveries from Epic 4.5 require creating two new epics:**

The What-If scenario mode (Epic 3) was designed for a single calculation model. Epic 4.5 introduced dual maintenance strategies, new fields, and revised terminology — none of which the What-If supports. Combined with UX friction issues, this creates a two-phase corrective plan.

**Epic Update Required: YES — Two new epics created**

---

## Next Steps — Epic Organization

### Epic 7: MVP Stable — Bug Fixes + Working Strategies (branch: main)
*Goal: Zero bugs, correct terminology, What-If works with both strategies*

| Story | Content |
|-------|---------|
| 7.1 | Bug fix: What-If + Bottleneck toggle doesn't update results |
| 7.2 | Unplanned terminology revision: rename pump removal rate, duration per event, remove overhaul cost, add MTBF |
| 7.3 | What-If adaptive: supports both Planned and Unplanned strategies |

### Epic 8: UX Redesign (separate feature branch)
*Goal: Premium user experience for demos and beyond*

| Area | Content |
|------|---------|
| Dashboard | Layout rework |
| Focus Mode | Eliminate scrolling, everything visible |
| What-If Split Screen | Synchronized scroll, results always visible |

---

## Action Items

### Bug Fixes (Epic 7 — before demo next week)

| # | Action | Owner | Priority |
|---|--------|-------|----------|
| B1 | Fix What-If + Bottleneck toggle recalculation | Dev | CRITICAL |
| B2 | What-If support for Planned mode fields | Dev | HIGH |

### Conceptual Revision (Epic 7)

| # | Action | Owner |
|---|--------|-------|
| D1 | Rename "Failure rate" → "Pump removal rate" | Dev |
| D2 | Add MTBF field to Unplanned mode | Dev |
| D3 | Remove "Overhaul cost" from Unplanned mode | Dev |
| D4 | Rename "Duration per failure" → "Duration per event" | Dev |
| D5 | What-If adaptive to maintenance strategy | Dev |

### Documentation & Hygiene

| # | Action | Owner |
|---|--------|-------|
| H1 | Update CLAUDE.md — test count (1257+), epic statuses | Bob (SM) |
| H2 | Mark Definition of Done checkboxes in Story 4.5.4 | Bob (SM) |
| H3 | Create "New Analysis Field" checklist (all consumers to verify) | Charlie |

---

## Team Agreements

- Continue adversarial code reviews (proven across 5 consecutive epics)
- **NEW:** Mandatory checklist when adding any field to `Analysis` type — verify: Dashboard, Sidebar, ResultsPanel, ComparisonView, What-If, Global Analysis, PDF Export
- Epic 8 UX redesign on separate feature branch (protect MVP stability)
- Demo postponed to next week — deliver Epic 7 fixes first

---

## Retrospective Status

**Document Status:** COMPLETE
**Facilitator:** Bob (Scrum Master)
**Document Author:** Claude Opus 4.6
**Epic 4.5 Status:** 4/4 stories done, epic complete
**Next Epics:** Epic 7 (MVP Stable) + Epic 8 (UX Redesign)
**Demo:** Postponed to week of 2026-02-23
