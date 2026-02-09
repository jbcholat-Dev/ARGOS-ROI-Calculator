# Design Feedback & Polish Backlog

## Status: Deferred to post-Epic 6 design branch

**Strategy:** Focus on functional MVP delivery (Epics 2-6) first, then comprehensive design refactor in separate branch with full product context and real user feedback.

**Workflow:** After each epic retrospective, capture new design feedback in this file. Process all items in batch after Epic 6 completion.

---

## Epic 2 Feedback (2026-02-09)

### Layout & Structure
- [ ] **Grid 2x3 for InputPanel** - Reduce scrolling by organizing input sections in 2 columns x 3 rows
  - Current: Vertical stack, requires scrolling to complete all fields
  - Proposed: Grid layout, all inputs visible without scroll
  - Impact: Better UX for live client meetings (fill everything at glance)

- [ ] **Sections too wide** - 50% of section width is unused
  - Current: Full-width sections with centered content
  - Proposed: Narrower sections with efficient space usage
  - Impact: More professional appearance, less white space waste

- [ ] **ResultsPanel positioning** - Define placement in new grid layout
  - Current: Below all inputs (requires scroll to see)
  - Proposed: TBD (right column? separate area?)
  - Impact: Real-time results visibility during data entry

### Buttons & Interactions
- [ ] **Bouton FAB (Floating Action Button)** - "New Analysis" button as round FAB with + icon
  - Current: Standard button in page layout
  - Proposed: Round floating button, bottom-left corner
  - Reference: Material Design FAB pattern
  - Impact: Modern UI pattern, accessible from anywhere
  - Estimated Effort: 2-3 hours (new component, positioning, z-index, tests)

### Modernization
- [ ] **Overall aesthetic** - "Sortir de l'industrie" look
  - Current: Functional but basic, industrial feel
  - Goal: Modern, polished, professional SaaS aesthetic
  - Reference: Sally's (UX Designer) initial mockups
  - Areas: Typography hierarchy, card shadows, spacing rhythm, micro-interactions
  - Impact: Client-facing tool perception, competitive differentiation

### GlobalSidebar
- [x] ~~**Sidebar inefficace**~~ - RÉSOLU (clarification de son rôle dans Epic 3)
  - Concern: Takes up space for only 2 values at top
  - Resolution: Epic 3 Dashboard will use sidebar for analysis navigation
  - Sidebar role justified once analyses populate it
  - No change needed

---

## Epic 3 Feedback

_To be captured after Epic 3 retrospective_

### Areas to Watch:
- Dashboard Grid card design
- Analysis card interaction patterns
- Navigation flow between Dashboard and Focus Mode
- GlobalSidebar with multiple analyses displayed

---

## Epic 4 Feedback

_To be captured after Epic 4 retrospective_

### Areas to Watch:
- Global Analysis view hero metrics design
- Comparison table layout and readability
- Aggregated data visualization

---

## Epic 5 Feedback

_To be captured after Epic 5 retrospective_

### Areas to Watch:
- PDF export UI/UX
- Progress indicators
- Pfeiffer branding alignment

---

## Epic 6 Feedback

_To be captured after Epic 6 retrospective_

### Areas to Watch:
- Solutions module layout
- Technical specs form design
- ARGOS architecture diagram styling
- Unified PDF appearance

---

## Design Refactor Branch Plan (Post-Epic 6)

### Pre-Work
1. Gather real user feedback from client demos (Epics 4-6)
2. Review all accumulated feedback in this file
3. Audit Sally's initial mockups for design direction
4. Prioritize changes by impact and effort

### Approach
1. Create branch: `feature/design-polish`
2. Work through feedback items systematically
3. Test comprehensively (visual regression, interaction)
4. Review with JB before merge
5. Merge to main after approval

### Success Criteria
- All items in this file addressed or explicitly deferred
- Modern, professional aesthetic achieved
- No functional regressions
- JB approval on final design

---

## Notes

- **Don't prematurely optimize:** Wait for full product context before making design decisions
- **User feedback > assumptions:** Real client reactions (post-Epic 4) should inform design
- **Batch refactor > incremental:** Avoid refactoring same components 6 times across epics
- **Design branch isolation:** Allows aggressive refactoring without disrupting feature velocity

---

**Last Updated:** 2026-02-09 (Epic 2 Retrospective)
**Next Update:** After Epic 3 Retrospective
