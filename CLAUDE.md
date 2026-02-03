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

### Continuity Protocol — Start of Every Session

1. Run `/bmad-help` to see which artifacts are completed and which workflow to run next
2. Launch the recommended workflow (e.g., `/bmad-bmm-create-prd`)
3. At end of session, commit new artifacts: `git add _bmad-output/ && git commit && git push`

### BMAD Workflow Sequence

| Phase | Workflow | Command | Status |
|-------|----------|---------|--------|
| 2-planning | Create Product Brief | `/bmad-bmm-create-product-brief` | DONE |
| 2-planning | Create PRD | `/bmad-bmm-create-prd` | Next |
| 2-planning | Create UX Design | `/bmad-bmm-create-ux-design` | Pending |
| 3-solutioning | Create Architecture | `/bmad-bmm-create-architecture` | Pending |
| 3-solutioning | Create Epics & Stories | `/bmad-bmm-create-epics-and-stories` | Pending |
| 3-solutioning | Implementation Readiness | `/bmad-bmm-check-implementation-readiness` | Pending |
| 4-implementation | Sprint Planning | `/bmad-bmm-sprint-planning` | Pending |
| 4-implementation | Create/Dev Stories | `/bmad-bmm-create-story` / `/bmad-bmm-dev-story` | Pending |

Each workflow auto-discovers artifacts from previous phases as input context.

### Key BMAD Behaviors
- Workflows save state in frontmatter (`stepsCompleted` array) — they auto-resume if interrupted
- The product brief is the foundation document; all subsequent artifacts reference it
- BMAD artifacts are the source of truth for project requirements, not this file

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

## Key Business Context

- **Target clients**: GF Dresden, ST Rousset, NXP — all in active sales pipeline
- **Critical insight**: Semiconductor clients share sensitive failure rates only verbally during meetings (never in writing). V10 must capture and process this data live.
- **Primary user**: Sub Fab Managers managing 1,000+ vacuum pumps
- **Key metric**: ROI ratio — total failure cost avoided vs. ARGOS service cost
