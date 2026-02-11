# Story 3-13: Fix French Badge and Remaining French Labels + 54 Failing Tests

## Status: done

## Story

- **Title:** Fix/Remove "Analyse active" French Badge + Fix 54 Failing Tests
- **Priority:** HIGH
- **Estimate:** 2 points
- **Source:** Epic 3 Phase 2 Retro (2026-02-11), Action Items #2, #3

## Description

Two related cleanup issues before internal demo:
1. "Analyse active" badge in Focus Mode is still in French and is redundant (user already knows which analysis is active)
2. 54 tests failing because test files still expect French labels while source components were translated to English in Story 3-5

Per JB's retro decision: Remove badge from Focus Mode entirely. Translate ActiveIndicator for other usages (dashboard). Also translate remaining French strings in EditableAnalysisName.tsx and Solutions.tsx that were missed by Story 3-5.

## Acceptance Criteria

- [ ] AC-1: No "Analyse active" badge visible in Focus Mode
- [ ] AC-2: ActiveIndicator.tsx translated to English ("Active Analysis")
- [ ] AC-3: EditableAnalysisName.tsx fully translated (validation messages, aria-labels)
- [ ] AC-4: Solutions.tsx placeholder message translated to English
- [ ] AC-5: All 54 previously failing tests now pass
- [ ] AC-6: No new test failures introduced (total tests pass 100%)

## Root Cause Analysis

### French Badge
- ActiveIndicator.tsx renders "Analyse active" (French) — missed by Story 3-5
- FocusMode.tsx passes `showActiveBadge={activeAnalysisId === analysis.id}` — redundant in Focus Mode

### 54 Failing Tests
- Story 3-5 translated source components to English (DowntimeInputs, FailureRateInput)
- But corresponding test files still assert French label text
- Carried as debt through 6 subsequent stories without fix

## Tasks

- [x] Task 1: Remove badge from Focus Mode
  - [x] 1.1: FocusMode.tsx — remove showActiveBadge prop from EditableAnalysisName
- [x] Task 2: Translate remaining French source strings
  - [x] 2.1: ActiveIndicator.tsx — "Analyse active" → "Active Analysis"
  - [x] 2.2: EditableAnalysisName.tsx — validation messages and aria-labels to English
  - [x] 2.3: Solutions.tsx — placeholder message to English
- [x] Task 3: Fix failing test files (French → English expectations)
  - [x] 3.1: DowntimeInputs.test.tsx — update French regex patterns to English
  - [x] 3.2: FailureRateInput.test.tsx — update French label assertions
  - [x] 3.3: FailureRateInput.integration.test.tsx — update French label assertions
  - [x] 3.4: AnalysisRename.integration.test.tsx — update French assertions
  - [x] 3.5: FocusMode.test.tsx — update/remove badge tests + French assertions
  - [x] 3.6: App.test.tsx — update French Solutions placeholder
- [x] Task 4: Fix test files with newly-broken assertions (from Task 2 translations)
  - [x] 4.1: EditableAnalysisName.test.tsx — update French validation messages
  - [x] 4.2: ActiveIndicator.test.tsx — update French aria-label/text
- [x] Task 5: Run full test suite — 0 failures

## French → English Translation Map

| File | French | English |
|------|--------|---------|
| ActiveIndicator.tsx | `Analyse active` | `Active Analysis` |
| EditableAnalysisName.tsx | `Le nom ne peut pas être vide` | `Name cannot be empty` |
| EditableAnalysisName.tsx | `Le nom ne peut pas dépasser 100 caractères` | `Name cannot exceed 100 characters` |
| EditableAnalysisName.tsx | `Ce nom existe déjà` | `This name already exists` |
| EditableAnalysisName.tsx | `Nom de l'analyse` | `Analysis name` |
| EditableAnalysisName.tsx | `Renommer l'analyse "${name}"` | `Rename analysis "${name}"` |
| Solutions.tsx | `Complétez vos analyses ROI d'abord` | `Complete your ROI analyses first` |

## Test Files Updated (French → English expectations)

| Test File | # Fixes |
|-----------|---------|
| DowntimeInputs.test.tsx | ~25 assertions |
| FailureRateInput.test.tsx | ~12 assertions |
| FailureRateInput.integration.test.tsx | ~6 assertions |
| AnalysisRename.integration.test.tsx | ~6 assertions |
| FocusMode.test.tsx | ~4 assertions |
| App.test.tsx | 1 assertion |
| EditableAnalysisName.test.tsx | ~8 assertions |
| ActiveIndicator.test.tsx | ~4 assertions |

## Files Changed

| File | Change |
|------|--------|
| src/pages/FocusMode.tsx | Remove showActiveBadge prop |
| src/components/analysis/ActiveIndicator.tsx | Translate French → English |
| src/components/analysis/EditableAnalysisName.tsx | Translate French → English |
| src/pages/Solutions.tsx | Translate placeholder message |
| src/components/analysis/DowntimeInputs.test.tsx | Fix French assertions |
| src/components/analysis/FailureRateInput.test.tsx | Fix French assertions |
| src/components/analysis/FailureRateInput.integration.test.tsx | Fix French assertions |
| src/components/analysis/AnalysisRename.integration.test.tsx | Fix French assertions |
| src/pages/FocusMode.test.tsx | Fix badge + French assertions |
| src/App.test.tsx | Fix French assertion |
| src/components/analysis/EditableAnalysisName.test.tsx | Fix French assertions |
| src/components/analysis/ActiveIndicator.test.tsx | Fix French assertions |

## Definition of Done

- [x] All acceptance criteria met
- [x] All tests pass (0 failures)
- [x] No console.log statements
- [x] Code reviewed
- [x] Manual testing: no French text visible in Focus Mode

## Dev Agent Record

- Removed showActiveBadge from FocusMode (badge was redundant — user already knows which analysis is active)
- Translated 3 source files: ActiveIndicator.tsx, EditableAnalysisName.tsx, Solutions.tsx
- Fixed all 54+ previously failing tests across 8 test files
- Total test suite passes with 0 failures
