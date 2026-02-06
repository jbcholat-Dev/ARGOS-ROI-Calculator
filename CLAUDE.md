# ARGOS ROI Calculator V10

## Project Identity

**Product**: ARGOS ROI Calculator V10 — Live sales engineering platform for Pfeiffer Vacuum
**Owner**: JB Cholat (Product Marketing / Service Leadership, ARGOS Platform)
**Domain**: Semiconductor predictive maintenance (vacuum pumps)
**Purpose**: Enable real-time, process-specific ROI calculations during client meetings using their actual operational data

V10 replaces V9 (single-page HTML calculator with 3 fixed categories) with a multi-analysis platform supporting per-process granularity, aggregated views, and PDF export.

## Directory Structure

```
C:\Users\JBCHOLAT\ROI Calculator\
├── CLAUDE.md                    # This file — project context for Claude Code
├── .gitignore                   # Git exclusions
├── README.md                    # GitHub repo README
├── _bmad/                       # BMAD Framework v6.0.0-Beta.5 (NOT committed)
├── _bmad-output/                # BMAD planning & implementation artifacts (COMMITTED)
│   ├── planning-artifacts/      # Product brief, PRD, architecture, epics
│   └── implementation-artifacts/# Sprint plans, story files (future)
├── calculateur-argos/           # V9 reference code (NOT committed, separate git repo)
└── src/ or app/                 # V10 application code (future)
```

### What is NOT committed (excluded via .gitignore)
- `_bmad/` — Reproducible framework dependency (install via `npx bmad-cli install`)
- `.claude/` — Local Claude Code session config
- `calculateur-argos/` — V9 reference codebase (its own git repo with 11 commits)

## BMAD Workflow (Planning Methodology)

This project uses the BMAD (Business Model Agile Development) framework for structured planning.

### BMAD UX Design Tools
- `frontend-design` skill - Create interactive HTML design mockups and direction showcases
- UX workflows use A/P/C menus (Advanced Elicitation / Party Mode / Continue) at each step
- Frontmatter `stepsCompleted` array tracks progress, enables workflow resumption

### Continuity Protocol — Start of Every Session

1. Run `/bmad-help` to see which artifacts are completed and which workflow to run next
2. Launch the recommended workflow (e.g., `/bmad-bmm-create-prd`)
3. At end of session, commit new artifacts: `git add _bmad-output/ && git commit && git push`

### BMAD Workflow Sequence

| Phase | Workflow | Command | Status |
|-------|----------|---------|--------|
| 2-planning | Create Product Brief | `/bmad-bmm-create-product-brief` | DONE |
| 2-planning | Create PRD | `/bmad-bmm-create-prd` | DONE |
| 2-planning | Create UX Design | `/bmad-bmm-create-ux-design` | DONE |
| 3-solutioning | Create Architecture | `/bmad-bmm-create-architecture` | DONE |
| 3-solutioning | Create Epics & Stories | `/bmad-bmm-create-epics-and-stories` | DONE |
| 3-solutioning | Implementation Readiness | `/bmad-bmm-check-implementation-readiness` | DONE |
| 4-implementation | Sprint Planning | `/bmad-bmm-sprint-planning` | Pending |
| 4-implementation | Create/Dev Stories | `/bmad-bmm-create-story` / `/bmad-bmm-dev-story` | Pending |

Each workflow auto-discovers artifacts from previous phases as input context.

### Key BMAD Behaviors
- Workflows save state in frontmatter (`stepsCompleted` array) — they auto-resume if interrupted
- The product brief is the foundation document; all subsequent artifacts reference it
- BMAD artifacts are the source of truth for project requirements, not this file

## BMAD Implementation Learnings

### Post-Retrospective Stories
- Stories can be created post-retro if identified as blockers before next Epic
- Pattern: Retro → Identify blocker → `/bmad-bmm-create-story` → `/bmad-bmm-dev-story` → Update retro doc
- Story 1.6 (Modal) created after Epic 1 retro as blocker for Epic 2 Story 2.1

### Code Review Issue Standards (Epic 1 Established)
- **100% HIGH issues** MUST be fixed before marking story "done"
- **100% MEDIUM issues** MUST be fixed before marking story "done"
- **LOW issues** are optional, can be deferred to future stories
- BMAD code-review workflow is ADVERSARIAL - must find minimum 3-10 issues (never "looks good")

### Accessibility - WCAG AA Compliance
- `aria-describedby` is MANDATORY for modals/dialogs, not optional
- Modal pattern: `aria-labelledby` (title) + `aria-describedby` (body content)
- Focus trap testing MUST include Shift+Tab (backward navigation), not just Tab forward
- Missing aria-describedby = HIGH severity accessibility violation

### Tailwind CSS v4 Patterns
- `animate-in fade-in-0 zoom-in-95` require `tailwindcss-animate` plugin (NOT in dependencies)
- Prefer standard Tailwind: `transition-all duration-200 opacity-100 scale-100`
- Check `tailwind.config.ts` plugins array before using non-standard animation classes

### React Patterns
- Modal Portal: Use `createPortal(content, document.body)` for overlay layering
- Test pattern: Portal target in tests MUST match production code (no unused `modal-root` divs)
- If Modal uses `document.body`, tests should NOT create separate portal container

### Performance Patterns
- Avoid multiple `useEffect` hooks with separate event listeners for same event type
- Consolidate keyboard handlers: Single `handleKeyDown` function > multiple keydown listeners
- Story 1.6: Consolidated Escape + Tab listeners from 3 to 1 (better performance)

## Context Window Optimization Patterns

### Parallel Subagents
- For code review fixes: Spawn separate agents for HIGH vs MEDIUM issues (30-40% time reduction)
- For epic planning: Divide story analysis across parallel agents (40% faster sprint planning)
- For independent stories: Run create-story + dev-story for 2+ stories in parallel if team capacity allows
- Pattern: Spawn multiple agents → Work in parallel → Merge results
- Example: Epic 2 has 8 stories → Batch 1 (Stories 2.1 + 2.2 parallel), Batch 2 (2.3 + 2.4 parallel)

### File Reading Efficiency
- Read complete files when <2000 lines (avoid multiple offset reads)
- Parallelize large file reads: Split offset ranges across agents if file >2000 lines
- Group related reads in single message when possible
- Story 1.6 lesson: 5 sequential Read calls with offset → Could be 1-2 Read calls (60% reduction)

### Context Compression
- After story completion: Replace full implementation details with 200-token summary
- Summary format: Story ID, files changed, test count, issues fixed, status
- Archive full details in story file markdown, not in conversation context
- Target: Free 5-10k tokens per epic by compressing completed story details
- Apply compression after code review completes and story marked "done"

### Agent Resume Pattern
- Save agentId from Task tool results for potential reuse with `resume` parameter
- Resume agent maintains full context continuity across workflow steps
- Reduces repeated information transfer between workflow stages
- Example: create-story agent (ID: xyz) → dev-story resume(xyz) → code-review resume(xyz)
- Note: Currently not heavily used in BMAD workflows, but available for complex multi-step tasks

### Context Window Monitoring
- Session at 40% usage (79k/200k tokens) is HEALTHY - continue same context
- Session at 60%+ usage - consider compression or fresh context for next major workflow
- Session at 80%+ usage - MUST start fresh context or apply aggressive compression
- Messages category is largest consumer (~30% typical) - prime target for compression

## V9 Reference (calculateur-argos/)

The V9 codebase in `calculateur-argos/` is a **read-only reference** for:
- ROI calculation formulas to port to V10
- Business logic validation
- Pump model data and parameters

Do NOT modify V9 code. It has its own git history (11 commits, V7 through V9).

## Conventions

- **Language**: Project documentation is in French or English depending on context. Code and comments should be in English.
- **Git**: Commit messages in English. Always commit `_bmad-output/` changes at end of session.
- **GitHub**: Repository at https://github.com/jbcholat-Dev/ARGOS-ROI-Calculator.git
- **File Editing**: For appending large content to BMAD artifacts, use `cat temp.md >> file.md && rm temp.md` instead of Edit tool (avoids character encoding issues with `—` and `€`)

## Key Business Context

- **Target clients**: GF Dresden, ST Rousset, NXP — all in active sales pipeline
- **Critical insight**: Semiconductor clients share sensitive failure rates only verbally during meetings (never in writing). V10 must capture and process this data live.
- **Primary user**: Sub Fab Managers managing 1,000+ vacuum pumps
- **Key metric**: ROI ratio — total failure cost avoided vs. ARGOS service cost
