# ARGOS ROI Calculator V10

## Project Identity

**Product**: ARGOS ROI Calculator V10 — Live sales engineering platform for Pfeiffer Vacuum
**Owner**: JB Cholat (Product Marketing / Service Leadership, ARGOS Platform)
**Domain**: Semiconductor predictive maintenance (vacuum pumps)
**Purpose**: Enable real-time, process-specific ROI calculations during client meetings using their actual operational data

V10 replaces V9 (single-page HTML calculator with 3 fixed categories) with a multi-analysis platform supporting per-process granularity, aggregated views, and PDF export.

## Quick Start

### Development Commands
```bash
cd argos-roi-calculator
npm install              # Install dependencies
npm run dev              # Start dev server (http://localhost:5173)
npm test                 # Run tests in watch mode
npm test -- --run        # Run tests once (use for verification)
npm run build            # Build for production
npm run lint             # Run ESLint
```

### Tech Stack
- **Framework**: React 19.2 + TypeScript 5.9
- **Build**: Vite 7.2
- **Styling**: Tailwind CSS v4.1
- **State**: Zustand 5.0
- **Routing**: React Router 7.13
- **Testing**: Vitest 4.0 + Testing Library
- **PDF Export**: jsPDF 4.1 + html2canvas 1.4

### Key Files
- `argos-roi-calculator/src/main.tsx` - React entry point
- `argos-roi-calculator/src/App.tsx` - Main app component
- `argos-roi-calculator/src/stores/` - Zustand state management

## Directory Structure

```
C:\Users\JBCHOLAT\ROI Calculator\
├── CLAUDE.md                    # This file — project context
├── _bmad-output/                # BMAD planning & implementation artifacts (COMMITTED)
│   ├── planning-artifacts/      # Product brief, PRD, architecture, epics
│   └── implementation-artifacts/# Sprint plans, story files
├── argos-roi-calculator/        # V10 React application (Vite + TypeScript + Tailwind)
│   ├── src/                     # Application source code
│   │   ├── components/          # React components
│   │   ├── stores/              # Zustand state management
│   │   └── types/               # TypeScript types
│   └── package.json             # Dependencies & scripts
├── calculateur-argos/           # V9 reference (NOT committed, separate git repo)
└── _bmad/                       # BMAD Framework (NOT committed, install: npx bmad-cli install)
```

## BMAD Workflow (Planning Methodology)

### Continuity Protocol — Start of Every Session
1. Run `/bmad-help` to see completed artifacts and next workflow
2. Launch recommended workflow (e.g., `/bmad-bmm-create-prd`)
3. At session end: `git add _bmad-output/ && git commit && git push`

### Workflow Sequence
| Phase | Workflow | Command | Status |
|-------|----------|---------|--------|
| 2-planning | Product Brief / PRD / UX Design | `/bmad-bmm-create-*` | DONE |
| 3-solutioning | Architecture / Epics | `/bmad-bmm-create-*` | DONE |
| 4-implementation | Sprint Planning / Stories | `/bmad-bmm-sprint-planning` / `/bmad-bmm-create-story` | Active |

BMAD artifacts are the source of truth for requirements. Workflows auto-discover previous artifacts and save state in frontmatter (`stepsCompleted` array) for resumption.

## Critical Development Patterns

### Code Review Standards
- **100% HIGH + MEDIUM issues** MUST be fixed before marking story "done"
- BMAD code-review is ADVERSARIAL - must find 3-10 issues (never "looks good")
- **Remove ALL console.log** before commit (production pollution)
- Launch 3 code-reviewer agents in parallel: simplicity, bugs, conventions (2-3min coverage)

### Accessibility - WCAG AA
- `aria-describedby` is MANDATORY for modals/dialogs (not optional)
- Modal pattern: `aria-labelledby` (title) + `aria-describedby` (body)
- Focus trap testing MUST include Shift+Tab (backward navigation)

### React Patterns
- Modal Portal: `createPortal(content, document.body)` for overlay layering
- Portal target in tests MUST match production code
- UI primitives auto-manage ARIA (role, tabIndex) based on state - avoid parent overrides
- Navigation: `setActiveAnalysis(id)` BEFORE `navigate(route)` (immediate UI update)

### Tailwind CSS v4
- `animate-in fade-in-0 zoom-in-95` require `tailwindcss-animate` plugin (NOT in dependencies)
- Prefer standard: `transition-all duration-200 opacity-100 scale-100`

### Performance
- Consolidate keyboard handlers: Single `handleKeyDown` > multiple keydown listeners
- Avoid multiple `useEffect` hooks with separate listeners for same event type

## Testing

### Commands
- `npm test` - Watch mode
- `npm test -- --run` - Run once (for verification)
- Current: **603 tests** (Epic 3 Story 3.2 complete)

### Patterns
- **Accessibility tests**: `getByLabelText('Analyse ${name}')` > `getByRole('button')` (robust to role changes)
- **Keyboard nav**: Use `.focus()` directly, NOT `user.tab()` (tabs to first focusable)
- **Intermittent failures**: Re-run suite to confirm real failure (race conditions)
- Verify test count matches estimates after parallel dev

## Parallel Development Workflow

### Context Optimization
- **Orchestration context**: Create stories, coordinate, merge commits (stays <70% tokens)
- **Dev contexts**: Delegate actual development to separate windows/agents
- **Pattern**: Spawn multiple agents → Work in parallel → Merge results

### Batch Development
- Create 5 stories at once (30min) → Dev in parallel windows (2h) vs sequential (9.5h) = **79% time savings**
- Each story file: 30KB comprehensive context (architecture, learnings, V9 refs)
- Agents execute: dev → review → fix HIGH/MEDIUM → commit → wait (no supervision needed)
- **Prompt format**: "ÉTAPE 1: DÉVELOPPEMENT" + "ÉTAPE 2: CODE REVIEW (AUTOMATIQUE)" + "NE PAS PUSHER"

### Batch Sizing
- **2 windows**: SAFE
- **3-5 windows**: EFFICIENT (79% gain, careful merge needed)
- **6+ windows**: RISKY (coordination overhead)
- Parallelize when: Independent files, unblocked, same epic, similar estimates

### Merge Protocol
- Verify: `git log`, `sprint-status.yaml`, `npm test`, file presence
- Commit ONLY story files (avoid merging multiple stories in one commit)
- Push all commits together (atomic epic progress)

### Single Story Pattern
- For 1-2 stories (<2h each): Use Task tool with parallel agents, NOT TeamCreate
- Phase 2 (Explore): 3 code-explorer agents in parallel
- Phase 4 (Architecture): 3 code-architect agents (minimal/clean/pragmatic)
- Phase 6 (Review): 3 code-reviewer agents (simplicity/bugs/conventions)
- Time savings: **30-40%** vs sequential

### Context Window Status
- <70%: ✅ HEALTHY - Continue same context
- 70-85%: ⚠️ CAUTION - Consider fresh context for next major workflow
- >85%: ❌ CRITICAL - MUST start fresh context or compress
- After major operations: Report "Actuel: Xk/200k (Y%) | Verdict: [status]"

## Design Feedback Workflow

**Strategy**: MVP-First (Epics 2-6), then batch design refactor after Epic 6 with real user feedback.

**Process**: Capture feedback in `DESIGN_FEEDBACK.md` during retrospectives → Defer to post-Epic 6 → Process with full product context and real client reactions.

## V9 Reference (calculateur-argos/)

**Read-only reference** for ROI formulas, business logic, pump model data. Do NOT modify (separate git repo, 11 commits).

## Conventions

- **Language**: Docs in French/English, code/comments in English
- **Git**: Commit messages in English, always commit `_bmad-output/` at session end
- **GitHub**: https://github.com/jbcholat-Dev/ARGOS-ROI-Calculator.git
- **File Editing**: For large BMAD appends, use `cat temp.md >> file.md && rm temp.md` (avoids encoding issues with `—` and `€`)

## Key Business Context

- **Clients**: GF Dresden, ST Rousset, NXP (active sales pipeline)
- **Critical insight**: Clients share sensitive failure rates ONLY verbally during meetings (never in writing). V10 must capture and process live.
- **Primary user**: Sub Fab Managers managing 1,000+ vacuum pumps
- **Key metric**: ROI ratio — total failure cost avoided vs. ARGOS service cost
