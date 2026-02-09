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

### Code Review Patterns (Story 3.2)
- Launch 3 code-reviewer agents in parallel: simplicity, bugs, conventions
- Each agent focuses on different aspect = comprehensive coverage in 2-3min
- Common issues: console.log in production, role conflicts, test fragility
- CRITICAL: Remove ALL console.log debug statements before commit (pollution in prod)
- Pattern: Code review BEFORE final test run (catch issues early)

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

### Component Role Management (Story 3.2)
- UI primitives should auto-manage ARIA attributes (role, tabIndex) based on state
- Pattern: Card component `role={isClickable ? 'button' : undefined}` (conditional)
- AVOID: Parent components overriding role (causes accessibility conflicts)
- Example: AnalysisCard should NOT pass `role="article"` - let Card decide based on onClick

### Navigation Patterns (Story 3.2 Clean Architecture)
- Dashboard handler pattern: `setActiveAnalysis(id)` BEFORE `navigate(route)`
- WHY: Active state updates immediately (UI more reactive), FocusMode confirms on mount
- AVOID: Relying only on FocusMode useEffect (delayed visual feedback)
- Pattern: Immediate store update + navigation = double-safety, not duplication

### Performance Patterns
- Avoid multiple `useEffect` hooks with separate event listeners for same event type
- Consolidate keyboard handlers: Single `handleKeyDown` function > multiple keydown listeners
- Story 1.6: Consolidated Escape + Tab listeners from 3 to 1 (better performance)

## Design Feedback Workflow

### Strategy: MVP-First, Design Polish Later
- **Priority**: Functional MVP delivery (Epics 2-6) before comprehensive design refactor
- **Rationale**: Need full product context and real user feedback before making design decisions
- **Timing**: Batch design refactor in separate branch after Epic 6 completion

### Workflow (After Each Retrospective)
1. **Capture feedback** during retrospective in designated Epic section of `DESIGN_FEEDBACK.md`
2. **Categorize** by type: Layout & Structure, Buttons & Interactions, Modernization, etc.
3. **Document** as unchecked tasks with clear description, current state, proposed change, and impact
4. **Defer** to post-Epic 6 processing (do NOT implement during functional epic development)
5. **Mark resolved** items that get addressed by subsequent epic work (e.g., sidebar justified by Epic 3)

### DESIGN_FEEDBACK.md Structure
```markdown
## Epic N Feedback (YYYY-MM-DD)

### Category Name
- [ ] **Issue Title** - Brief description
  - Current: What exists now
  - Proposed: What could be better
  - Impact: Why it matters
  - Estimated Effort: Time estimate (if known)
```

### Epic 2 Example Feedback Items
- Grid 2x3 for InputPanel (reduce scrolling)
- Sections too wide (50% unused width)
- FAB (Floating Action Button) for "New Analysis"
- Overall aesthetic: "Sortir de l'industrie" modern look
- ResultsPanel positioning in new layout

### Post-Epic 6 Design Refactor Plan
1. Gather real user feedback from client demos (Epics 4-6)
2. Review all accumulated feedback in DESIGN_FEEDBACK.md
3. Audit Sally's initial mockups for design direction
4. Prioritize changes by impact and effort
5. Create branch: `feature/design-polish`
6. Work through feedback systematically with comprehensive testing
7. Review with JB before merge

### Key Principles
- **Don't prematurely optimize**: Wait for full product context before design decisions
- **User feedback > assumptions**: Real client reactions should inform design
- **Batch refactor > incremental**: Avoid refactoring same components 6 times across epics
- **Design branch isolation**: Allows aggressive refactoring without disrupting feature velocity

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

### Context Window Status Pattern (Communication)
- ALWAYS provide context status after major operations (story completion, batch dev, etc.)
- Format: "Actuel: Xk/200k tokens (Y%)" + "Après [action]: ~Zk/200k (~W%)" + "Verdict: [emoji] [status]"
- Verdict thresholds:
  * ✅ HEALTHY (<70%): Continue same context, no action needed
  * ⚠️ CAUTION (70-85%): Consider compression or fresh context for next major workflow
  * ❌ CRITICAL (>85%): MUST start fresh context or apply aggressive compression
- Include recommendation: "Peut continuer", "Considérer fresh context", "DOIT commencer nouveau contexte"
- Example: "Actuel: 126k/200k (63%) | Après Story 2.7: ~140k/200k (70%) | Verdict: ✅ HEALTHY - Peut créer et développer Story 2.7"
- This pattern helps user make informed decisions about session continuation vs. starting fresh

## Parallel Development Workflow (Epic 2 Proven Pattern)

### Orchestration Context Pattern
- Use ONE context for orchestration: create stories, coordinate, merge commits
- Keep orchestration context lean: delegate dev work to separate windows
- Orchestration context stays <70% tokens even after 7 stories (proven Epic 2)
- Do NOT pollute orchestration with implementation details

### Autonomous Dev Prompts Structure
- Format: "ÉTAPE 1: DÉVELOPPEMENT" + "ÉTAPE 2: CODE REVIEW (AUTOMATIQUE)"
- Include: "NE PAS PUSHER - Attendre coordination" at end
- Agents execute: dev → review → fix HIGH/MEDIUM → commit → wait
- No supervision needed during execution (2h avg per story)

### Batch Creation Strategy
- Create 5 stories at once in orchestration context (Story 2.2-2.5 + 2.8 pattern)
- Each story file: 30KB comprehensive context (architecture, previous learnings, V9 refs)
- Dev agents find everything in story file (zero ambiguity, zero questions)
- Story creation: 30min for 5 stories, Dev execution: 2h parallel (vs 9.5h sequential = 79% gain)

### Merge Coordination Protocol
- After all windows complete: verify in orchestration context
- Check: git log, sprint-status.yaml, npm test, file presence
- Push all commits together (atomic epic progress)
- Celebrate before next batch

### Single Story Development Pattern (Story 3.2 Proven)
- For 1-2 stories (<2h each): Use Task tool with parallel agents, NOT TeamCreate
- Phase 2 (Exploration): Launch 3 code-explorer agents in parallel (card, navigation, store)
- Phase 4 (Architecture): Launch 3 code-architect agents (minimal, clean, pragmatic approaches)
- Phase 6 (Review): Launch 3 code-reviewer agents (simplicity, bugs, conventions)
- Pattern: Parallel research → Sequential implementation → Parallel review
- Time savings: 30-40% vs sequential agent launches
- When to use team: 3+ stories in parallel OR work >4h OR complex coordination needed

## Parallel Development Anti-Patterns (Epic 2 Lessons)

### Commit Merging Risk
- ISSUE: Story 2.3 committed inside Story 2.8 commit (agent confusion)
- CAUSE: Prompt not explicit about "ONLY this story, NOT others"
- FIX: Add to prompts: "Commit ONLY Story X.Y files, verify git diff before commit"
- CHECK: After parallel batch, verify each story has separate commit (git log --oneline)

### No Intermediate Checkpoints
- ISSUE: Wait for all 5 windows to complete before any verification
- RISK: If 1 window fails, only discover at end (wasted time on other 4)
- FIX: For >3 parallel windows, check first completion before launching others
- PATTERN: Launch 2-3 windows → verify first done → launch remaining

### Non-Sequential Commit Order
- ISSUE: Commits created in arbitrary order (2.8, 2.4, 2.2, 2.5 instead of 2.2-2.5, 2.8)
- IMPACT: Git log difficult to read, story flow unclear
- FIX: Specify commit order in prompts OR reorder with git rebase interactive after
- BETTER: Launch windows in story ID order (2.2 → 2.3 → 2.4 → 2.5 → 2.8)

### Incomplete Verification Commands
- ISSUE: "git status" shows clean even if stories missing
- NEED: Multi-step verification: git log + sprint-status.yaml + npm test + glob src/
- PATTERN: Check sprint-status.yaml "done" count matches expected
- PATTERN: Verify test count increase matches estimate (Story 2.2: +40 tests, etc.)

## Test Execution Patterns

### Intermittent Test Failures
- Some tests fail in full suite but pass in isolation (e.g., App.test.tsx)
- Likely cause: race conditions, test order dependencies, or shared state
- WORKAROUND: Re-run full suite (`npm test -- --run`) to confirm real failure
- PATTERN: If test passes on re-run, likely timing issue (not code bug)
- FIX: Add explicit waitFor() or cleanup between tests if pattern recurs

### Accessibility Test Patterns (Story 3.2)
- PREFER: `screen.getByLabelText('Analyse ${name}')` over `screen.getByRole('button')`
- WHY: aria-label queries are robust to role changes (e.g., Card auto-managing role)
- AVOID: Assuming fixed role in tests when component manages role conditionally
- PATTERN: Query by semantic meaning (label) > implementation detail (role)
- Keyboard navigation tests: Use `.focus()` directly, NOT `user.tab()` (tabs to first focusable)

### Test Count Verification
- After parallel dev batch, verify test count matches estimate
- Epic 1: 191 tests → Epic 2 Stories 2.1-2.8: +412 tests = 603 total
- Pattern: Each story estimates test count in story file (use as checkpoint)
- Red flag: Test count significantly lower than estimate = tests missing

## Sprint Status Verification Protocol

### Post-Parallel Verification Steps
- Step 1: Check sprint-status.yaml for all stories marked "done"
- Step 2: Git log --oneline to verify commit per story (or merged commits)
- Step 3: Glob pattern check for expected files (e.g., **/FailureRate*.tsx)
- Step 4: npm test to verify test count matches estimates
- If sprint-status "done" but no commit: code developed but not committed (Story 2.3 case)

### Git Status Limitations
- "working tree clean" does NOT mean all stories committed
- Need cross-reference: sprint-status.yaml + git log + file presence
- Pattern: sprint-status.yaml is source of truth for story completion

## Optimal Parallel Batch Sizing

### Batch Size Guidelines
- 2 windows: SAFE (proven Stories 2.1 + 2.6, easy coordination)
- 3-5 windows: EFFICIENT (proven Stories 2.2-2.5 + 2.8, 79% gain but needs careful merge)
- 6+ windows: RISKY (not tested, likely coordination overhead > gains)
- Rule: If >3 windows, launch first 2-3, verify, then launch remaining

### When to Parallelize
- Stories are INDEPENDENT (no shared files except store types)
- Stories are UNBLOCKED (all dependencies done)
- Stories are SAME EPIC (architectural patterns consistent)
- Dev estimates are SIMILAR (avoid 1 long story blocking others)
- DO NOT parallelize if stories touch same components

### When NOT to Parallelize
- Story has complex architecture decisions (needs discussion)
- Story blocks many others (do first, then parallelize dependents)
- Story requires V9 formula research (uncertainty in scope)
- Team unfamiliar with parallel pattern (start with 2 windows max)

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
