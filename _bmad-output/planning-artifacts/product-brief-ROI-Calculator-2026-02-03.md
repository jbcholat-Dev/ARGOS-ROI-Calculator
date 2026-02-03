---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments:
  - calculateur-argos/README.md
  - calculateur-argos/USER_GUIDE.md
  - calculateur-argos/OFFLINE_SETUP.md
  - https://www.notion.so/Product-Brief-ROI-Calculator-V10-36d468806e78410eaac40f0a947d122c
date: 2026-02-03
author: JB
---

# Product Brief: ROI Calculator

## Executive Summary

The ARGOS ROI Calculator V10 transforms how Pfeiffer Vacuum's ARGOS predictive maintenance service demonstrates value to semiconductor clients. Moving from a generic trade-show pitch tool to a live sales engineering platform, V10 enables real-time ROI calculation using customers' actual operational data during meetings.

**The Critical Window**: Semiconductor clients share sensitive failure rates and downtime costs only verbally during meetings—never in writing, as it reveals operational weaknesses and weakens negotiation positions. Without a tool capable of processing this information live, the data is lost, ROI remains theoretical, and deals stall.

**Business Urgency**: Three concrete opportunities (GF Dresden, ST Rousset, NXP) are advancing to deep analysis phase. Procurement and management stakeholders are entering the loop. ARGOS pricing has surprised clients—without demonstrating value on *their* numbers, the offer appears prohibitive.

**Target Outcome**: Accelerate sales cycles by co-constructing credible ROI analyses during client meetings, converting verbal insights into actionable business cases before the window of opportunity closes.

---

## Core Vision

### Problem Statement

**Current State (V9)**: The existing calculator operates at a macro level with three fixed equipment categories (Regular Tools 60%, Bottleneck Tools 20%, Batch Tools 20%). While effective for trade-show concept pitches, it cannot handle the granular, process-specific data that real clients provide during business discussions.

**The Critical Gap**: When clients verbally share sensitive operational data—"We have X failures on our poly etch process with Y pumps running Model Z"—there's no mechanism to capture and analyze this information in real-time. Sales conversations stall at "Let me get back to you with a feasibility study," losing momentum and credibility.

**Who Feels the Pain**:
- **Product Marketing/Service Leadership (JB)**: Currently handles business development manually, unable to process live client data
- **Potential Clients (Fab Managers, Procurement)**: Cannot justify ARGOS investment internally without ROI based on their actual operational reality
- **Decision Stakeholders**: Perceive ARGOS pricing as high without concrete, facility-specific value demonstration

### Problem Impact

**Lost Information = Lost Deals**
- Clients won't share sensitive data in writing (email, files)—only verbally during meetings
- If data can't be processed live, it's lost forever
- Without credible ROI on real numbers, pilots don't launch → status quo persists

**Extended Sales Cycles**
- Manual post-meeting analysis delays conversion
- Clients "cool off" between meetings
- Competitive disadvantage if competitors respond faster

**Pricing Perception Barrier**
- ARGOS pricing surprised potential clients
- Without demonstrating savings on *their* specific processes, value proposition remains abstract
- Procurement and management need concrete justification to approve budget

### Why Existing Solutions Fall Short

**V9 Calculator Limitations**:
- **Fixed Categories**: Three generic segments don't map to real fab process nomenclature ("Poly etch," "Metal deposition," "CMP")
- **No Granularity**: Can't analyze individual processes with specific pump models and actual failure history
- **Single Scenario**: Can't compare multiple processes or create aggregated facility views
- **No Data Persistence**: Can't save analyses or export professional reports for internal client approvals

**Competitive Landscape**:
- Limited visibility into competitor tools
- One competitor has an online calculator, but also generic (no process-level granularity)
- Opportunity for differentiation: If nobody offers live, granular calculation, it's a competitive advantage

**Manual Excel Workflows**:
- Post-meeting calculations are time-consuming
- Risk of errors in manual transcription
- Unprofessional appearance vs. live co-construction

### Proposed Solution

**ROI Calculator V10**: A multi-analysis platform enabling live, process-specific ROI calculations with real client data during meetings.

**Core Workflow** (validated with stakeholders):
1. **Click "New Analysis"** → Name it with actual process name (e.g., "Poly Etch — Chamber 04")
2. **Select Pump Model** (e.g., A3004XN — 3000 m³/h)
3. **Single-Screen Input Panel** (no popups):
   - Quantity of pumps (Client data)
   - Historical failure rate % OR manual entry of failures in 2023/2024/2025 (Client data)
   - Wafer type: Mono-wafer vs. Batch (default: 125 wafers for batch)
   - Average wafer cost (Client estimate)
   - Average downtime duration per failure (Client data)
   - Maintenance/recalibration duration (Client data)
   - Downtime cost per hour (Client data)
4. **Instant Calculation** → Display savings and ROI automatically
5. **Repeat** for Process Y, Process Z…
6. **Click "Global Analysis"** → Aggregated view across all processes with charts
7. **Export PDF** → Professional report for client to share internally

**Global Parameters** (sidebar, apply to all analyses):
- ARGOS detection rate (%)
- Service cost per pump (€/year)

**Key Outputs**:
- **Per Analysis**: Total failure cost (without ARGOS), ARGOS service cost, Δ Savings, ROI ratio
- **Global View**: Sum of savings across all processes, overall ROI, synthesis charts

### Key Differentiators

**1. Live Co-Construction, Not Post-Meeting Calculation**
- Captures sensitive data in the moment it's shared
- Transforms sales conversation into collaborative analysis session
- Builds trust and credibility in real-time

**2. Process-Level Granularity**
- Maps to how clients actually think about their operations
- Handles real pump models, actual failure histories, specific wafer costs
- Multi-scenario capability (compare 2-3 processes, then aggregate)

**3. Export-Ready Professionalism**
- PDF reports clients can share with procurement/management
- Strengthens internal champion position
- Reduces post-meeting administrative burden

**4. Execution Over Technology**
- Differentiation comes from user experience, not technical moat
- Tool reflects Pfeiffer identity: helping clients make informed decisions, not impressing with complexity
- Designed around client thinking patterns, not engineering constraints

**Why Now?**
- **3 Concrete Opportunities**: GF Dresden, ST Rousset, NXP transitioning from concept pitch to deep analysis
- **Stakeholder Escalation**: Procurement and management entering decision loop—need analytical tools
- **Pricing Perception Gap**: Early feedback shows ARGOS pricing surprises clients; V10 bridges perception/value gap
- **Market Maturity**: 2025 trade-show pitches generated qualified leads; now clients want to "get into the details"

---

## Target Users

### Primary Users

#### **Marc Dubois — Sub Fab Manager (Client-side) ⭐ Key Stakeholder**

**Role & Context:**
- Sub Fab Manager at semiconductor fab (e.g., ST Rousset)
- Manages 1,000+ vacuum pumps, several hundred abatement systems, multi-vendor equipment park
- Team: 5–20 technicians, some specialized by product line
- Daily routine: Morning ops meetings with team + vendor meetings (Pfeiffer, others)

**Goals & Constraints:**
- **Primary KPI**: Equipment uptime — one pump failure = clean room production stop
- **Pressure**: Plant director demands zero failures on critical tools
- **Core dilemma**: Maximize uptime within fixed maintenance budget

**Problem Experience:**
- **Real incident (NXP case)**: 5 pump crashes → 5 batches of wafers scrapped → several hundred k€ lost
- **Immediate consequences**: Management pressure, tense internal meetings, blame game (quality team vs. vendor responsibility)
- **Current workaround**: Aggressive preventive maintenance—reducing cycles (24 months → 18 months → 12 months)
- **Cost trap**: Over-maintenance is expensive but perceived as only reliable option

**Emotional & Practical Impact:**
- Permanent stress on critical tools
- Tense climate between teams after incidents
- Difficulty justifying preventive investments (fuzzy ROI)
- *"I need certainty, not promises"*

**Success Vision with ARGOS:**
1. **Visibility**: Know real health status of critical pumps
2. **Decision support**: Arbitrate maintenance vs. risk based on budget AND stakes (wafer batches at risk, tool criticality)
3. **Pilot focus**: Target most impactful pumps (tools with expensive wafer batches or production-stoppers)

**"Aha!" Moment:**
> "If I can show management exactly what it costs when *this specific pump* on *this critical etch tool* fails, I can justify ARGOS on the tools that matter most—and keep my budget for the rest."

**Quote:**
> "I don't need fancy analytics. I need to know: if this pump crashes tomorrow, how much does it cost me? That's the only number that matters when I talk to procurement."

---

#### **JB Cholat — Product Marketing / Service Leadership (Pfeiffer-side)**

**Role & Context:**
- Product Marketing & Service Leadership, ARGOS Platform
- Business development for predictive maintenance service across semiconductor market
- **Context 2026**: Handling 3 concrete opportunities (GF Dresden, ST Rousset, NXP) transitioning from trade-show pitches to deep analysis phase
- **Challenge**: Convert pricing-surprised prospects into pilots by demonstrating value on *their* operational data

**Goals:**
- Accelerate sales cycle by co-constructing ROI live with clients
- Capture sensitive verbal data (failure rates, downtime costs) during meetings before window closes
- Create credible business cases that Sub Fab Managers can use internally

**Problem Experience:**
- **V9 limitation**: Generic 3-category calculator works for trade-show pitches but can't handle granular, process-specific client data
- **Lost momentum**: When clients share real data verbally in meetings, can't process it live → "Let me get back to you" → lost opportunity
- **Pricing perception**: Early feedback shows ARGOS pricing surprises clients; need concrete ROI on *their* numbers to justify value

**Success Vision:**
- Run live ROI sessions where clients see savings calculated in real-time on their processes
- Walk out of meetings with co-created PDF reports clients can share internally
- Convert 3 current opportunities into pilots in Q1 2026

**"Aha!" Moment:**
> "When the Sub Fab Manager sees the calculator update live as he shares his etch tool data, and realizes 'this is my actual ROI, not a generic pitch'—that's when he becomes an internal champion."

**Quote:**
> "I need to meet clients where they think—process by process, tool by tool. Not force them into my three generic buckets."

---

#### **Regional Sales Colleagues (Pfeiffer-side)**

**Role & Context:**
- Locations: Germany, Asia, other regions
- **Reason for use**: Linguistic/cultural fit, local presence for client meetings
- **Relationship to V10**: Receive training from JB, execute same live ROI workflow with regional clients

**Goals:**
- Replicate JB's success in their territories
- Adapt pitch to local client communication styles
- Close regional opportunities

**Needs:**
- Intuitive tool (no complex training required)
- Multi-language support (at minimum: English, French, German; potentially Mandarin/Japanese)
- Same co-construction workflow JB uses

---

### Secondary Users

#### **Directeur d'Usine / Global Management (Client-side)**

**Role & Context:**
- Plant Director or Global Operations Manager
- **Relationship to ARGOS**: Approves budget after Sub Fab Manager pitches internally
- **Decision criteria**: Business case clarity, ROI credibility, strategic fit

**Interaction with V10:**
- **Doesn't use the calculator directly** — receives PDF export from Sub Fab Manager
- **Needs from the PDF**: Clear executive summary, process-specific ROI breakdown, comparison across tools if multiple analyses

**Success Criteria:**
> "If my Sub Fab Manager shows me a report that says 'piloting ARGOS on these 3 critical etch tools saves us €450k/year with 85% confidence,' I can approve that. Generic promises don't cut it."

---

#### **Procurement Manager (Client-side)**

**Role & Context:**
- Procurement / Purchasing Manager
- **Relationship to ARGOS**: Evaluates pricing, negotiates contract terms
- **Mindset**: "My job is to get the best deal possible"

**Interaction with V10:**
- **Doesn't use the calculator directly** — receives PDF export showing ROI calculations
- **Questions they ask**: Is the ROI realistic? What are the assumptions? Can we pilot on fewer pumps first to reduce risk?

**Success Criteria:**
> "If the numbers show clear payback on critical tools, I can work with that. But I need to see the assumptions—wafer costs, downtime hours, detection rates—so I can pressure-test it."

---

### User Journey

#### **Journey for Marc Dubois (Sub Fab Manager) — The Critical Co-Construction Moment**

**1. Discovery:**
- JB (or regional colleague) requests meeting to discuss "predictive maintenance ROI analysis"
- Marc is skeptical ("another vendor pitch") but curious (recent NXP incident still fresh)

**2. Live Co-Construction (The Critical Moment):**
- Meeting starts: JB opens V10 calculator
- **JB**: "Let's analyze one of your critical processes. Which tool has the highest stakes?"
- **Marc**: "Our poly etch Chamber 04—runs 125-wafer batches, €8k per wafer. We had 3 pump failures last year."
- **JB clicks "New Analysis"** → Marc sees his process name appear: "Poly Etch — Chamber 04"
- JB fills inputs as Marc verbally shares: pump model (A3004XN), failure rate (3%), wafer cost (€8k), downtime cost (€15k/hour)
- **Results appear instantly**: "€2.1M annual risk, ARGOS saves €1.4M, ROI 180%"
- **Marc**: *"Wait, that's based on MY numbers?"* ← **Aha! Moment**

**3. Multi-Process Analysis:**
- **Marc**: "Can we check our metal deposition tools too?"
- **JB**: "Absolutely. New analysis…" → Repeat workflow for 2 more processes
- Marc sees **Global Analysis**: €3.8M total savings across 3 critical tool groups

**4. Export & Internal Pitch:**
- JB exports PDF report with process-specific breakdown
- Marc brings report to weekly management meeting
- Directeur d'Usine sees numbers based on real operational data, approves pilot
- Procurement receives same PDF, negotiates scope

**5. Success Moment (Post-Meeting):**
- Marc emails JB: *"Your calculator made my life easier. For once, I had hard numbers to defend a maintenance investment. Let's talk pilot scope."*

---

#### **Journey for JB (Pfeiffer-side) — Accelerating Sales Cycles**

**1. Pre-Meeting Prep:**
- Reviews client context (3 opportunities: GF Dresden, ST Rousset, NXP)
- Opens V10 calculator, confirms global parameters (ARGOS detection rate 70%, service cost per pump €2,500/year)

**2. During Client Meeting:**
- Starts live co-construction with Sub Fab Manager (see Marc's journey above)
- Captures verbal data in real-time—no note-taking, no "let me get back to you"
- Responds to client questions instantly by tweaking inputs: "What if wafer cost is €10k instead of €8k?" → Recalculates live

**3. Post-Meeting:**
- Emails PDF export to client within hours (not days)
- Internal debrief: logs opportunity progress in CRM
- Follows up 1 week later to discuss pilot scope

**4. Success Moment:**
- Converts ST Rousset opportunity to signed pilot in Q1 2026
- Uses same workflow to close GF Dresden and NXP by Q2
- Regional colleagues replicate success in Germany and Asia

---

## Success Metrics

### User Success Metrics

#### **For Marc Dubois (Sub Fab Manager — Client-side)**

**Outcome-Based Success:**
1. **Can defend pilot with conditional PO internally**
   - Has concrete numbers to present to management AND procurement
   - PDF report withstands scrutiny from finance/purchasing teams
   - Can justify ARGOS investment on most impactful tools (not all pumps)

2. **Engages in price negotiation with confidence**
   - Understands ROI tradeoffs ("If we reduce scope to 2 processes instead of 3, how does ROI change?")
   - Can challenge assumptions and improve reasoning during live session

3. **Becomes internal champion**
   - Shares PDF report within 48 hours to multiple stakeholders (management, procurement, quality teams)
   - Requests follow-up meeting to analyze additional processes
   - Advocates for pilot approval in internal decision meetings

**Behavioral Indicators:**
- **Early engagement**: Shares real failure data verbally during first meeting (vs. holding back)
- **Active collaboration**: Asks "what if" questions to test scenarios
- **Post-meeting action**: Forwards PDF internally within 2 business days

---

#### **For JB Cholat (Product Marketing — Pfeiffer-side)**

**Outcome-Based Success:**
1. **Captures all sensitive data live during meeting**
   - Zero "let me get back to you with analysis" moments
   - Processes verbal client data in real-time without post-meeting calculations

2. **Co-creates credible business case**
   - Exports PDF report before leaving meeting
   - Report quality sufficient for client to share with procurement/management without edits

3. **Negotiates pricing with data-driven flexibility**
   - Can adjust ARGOS detection rate, service cost, or scope (number of pumps) live to find acceptable ROI threshold
   - Client sees tradeoffs transparently during negotiation

4. **Converts opportunities to pilots with conditional POs**
   - Moves from "interesting conversation" to "let's discuss pilot terms" within 2 meetings
   - Achieves signed conditional PO (not just technical proof of concept)

**Behavioral Indicators:**
- **High engagement**: Creates 3+ process analyses per client meeting (vs. 1 generic pitch)
- **Export rate**: 90%+ of meetings result in PDF export
- **Follow-up success**: Client responds to post-meeting email within 7 days with next steps

---

### Business Objectives

#### **Q1 2026 (Immediate Focus)**
1. **Convert 3 current opportunities to pilots with conditional POs**
   - GF Dresden: Pilot on critical etch tools with conditional PO for 50+ pumps
   - ST Rousset: Pilot on bottleneck processes with conditional PO for 30+ pumps
   - NXP: Pilot on batch tools with conditional PO for 40+ pumps

2. **Validate V10 workflow in live client settings**
   - Confirm that live co-construction creates stronger client commitment than post-meeting analysis
   - Gather client feedback to refine calculator assumptions (wafer costs, downtime calculations, failure rate modeling)

3. **Establish replicable sales playbook**
   - Document workflow for regional colleagues (Germany, Asia) to replicate success
   - Create training materials for V10 usage in client meetings

#### **2026 Full Year (Strategic Goals)**
1. **Achieve conditional PO → confirmed order conversion rate >70%**
   - After pilot completion, convert conditional POs to full ARGOS service contracts
   - Demonstrates that ROI calculations were credible and pilot performance met expectations

2. **Reduce time-to-pilot from 6+ months to <90 days**
   - Current state: Trade-show pitch → multiple meetings → manual analysis → pilot discussion → 6+ months
   - Target state: Trade-show pitch → 1-2 V10 co-construction sessions → conditional PO → <90 days

3. **Scale beyond JB's direct involvement**
   - Regional sales colleagues (Germany, Asia) successfully use V10 to close 2+ additional pilots
   - Demonstrates tool is intuitive enough for broader sales team adoption

4. **Differentiate ARGOS in competitive landscape**
   - Sub Fab Managers reference "Pfeiffer's ROI calculator" as unique value in vendor comparisons
   - Competitors perceived as "generic promises" vs. Pfeiffer's "data-driven approach"

---

### Key Performance Indicators (KPIs)

#### **Leading Indicators (Predict Success)**

| KPI | Target | Measurement Method | Why It Matters |
|-----|--------|-------------------|----------------|
| **Process analyses per meeting** | 3+ | Calculator session logs | High engagement = client sharing real data |
| **PDF export rate** | >90% | % of meetings resulting in PDF | Co-construction success indicator |
| **Client feedback quality** | High (challenges assumptions) | Qualitative: Do clients ask "what if" questions? | Engaged clients validate reasoning |
| **Follow-up response time** | <7 days | Days between meeting → client email reply | Momentum indicator |
| **Pricing negotiation iterations** | 2-3 per deal | Number of price/scope adjustments per opportunity | Healthy friction = serious interest |

#### **Lagging Indicators (Confirm Success)**

| KPI | Target | Measurement Method | Why It Matters |
|-----|--------|-------------------|----------------|
| **Pilots with conditional POs** | 3 in Q1 2026 | # of signed conditional POs (not simple pilots) | Ultimate 2026 success metric |
| **Time-to-pilot** | <90 days | Days from first meeting → conditional PO signed | Sales cycle acceleration |
| **Conditional PO → Order conversion** | >70% by end of 2026 | % of pilots that convert to full contracts | ROI credibility validation |
| **Average conditional PO value** | €50k-€150k | Monetary value of conditional orders | Revenue pipeline indicator |
| **Regional replication success** | 2+ pilots from colleagues | # of pilots closed by non-JB users | Scalability validation |

#### **Strategic Indicators (Long-term Impact)**

| KPI | Target | Measurement Method | Why It Matters |
|-----|--------|-------------------|----------------|
| **Client internal champion rate** | >80% | % of Sub Fab Managers who advocate internally | Sticky relationships |
| **Competitive mentions** | 5+ references | Client mentions "Pfeiffer's approach" vs. competitors | Market differentiation |
| **Calculator accuracy** | <15% variance | Pilot results vs. V10 predictions | Trust & credibility |

---

### Connecting Metrics to Strategy

**User Success → Business Success Flow:**
1. **Marc (Sub Fab Manager) gets concrete ROI** → Can defend pilot with conditional PO internally → Pfeiffer secures committed opportunity (not just "interest")
2. **JB captures live data** → No post-meeting delays → Faster sales cycle → More pilots per quarter
3. **Client negotiates price** → Sees tradeoffs transparently → Feels in control → Stronger commitment to pilot success
4. **PDF report shared internally** → Multiple stakeholders aligned → Procurement + management + technical all on same page → Higher conversion rate

**Key Strategic Alignment:**
- **V10 creates "friction by design"** (conditional POs, procurement involvement) — this friction = stronger commitment
- **Success ≠ "easy yes"** — Success = engaged client who challenges assumptions, negotiates scope, but ultimately commits with conditional PO
- **Regional scalability critical** — JB can't close all deals personally; V10 must enable colleagues to replicate workflow

---

## MVP Scope

### Core Features (V10 — Q1 2026)

#### **1. Multi-Analysis Workflow**
- **"New Analysis" button** to create process-specific analyses
- Name each analysis with real process nomenclature (e.g., "Poly Etch — Chamber 04")
- Create 2-5 analyses per client session (typically 3)
- Easy navigation between analyses

#### **2. Single-Screen Input Panel** (per analysis)

**Equipment & Operations:**
- **Pump type**: Free text input (no dropdown database)
- **Quantity of pumps**: Numeric input

**Failure Rate — Dual Mode** (user selects one):
- **Mode 1**: Direct percentage input (e.g., 10%)
- **Mode 2**: Automatic calculation from failures count
  - Input: Number of failures (last year)
  - Calculation: `failure_rate = (failures / pumps) × 100`
- **UX**: Toggle or switch between modes

**Process Economics:**
- **Wafer type**: Radio button (Mono-wafer / Batch)
  - If Batch: Default 125 wafers (editable)
- **Average wafer cost** (€)
- **Downtime duration per failure** (hours) — includes maintenance, recalibration, and restart time
- **Downtime cost per hour** (€)

#### **3. Global Parameters Sidebar** (applies to all analyses)
- **ARGOS detection rate** (%) — Default: 70%, adjustable during live negotiation
- **Service cost per pump** (€/year) — Default: €2,500, adjustable during live negotiation

#### **4. Instant ROI Calculations** (per analysis)
- **Total failure cost** (without ARGOS)
- **ARGOS service cost**
- **Δ Savings** (failure cost − service cost)
- **ROI ratio** (%)
- **Auto-recalculation** on every input change

#### **5. Global Analysis View**
- **Aggregation** of all analyses created in session
- **Total savings** across all processes
- **Overall ROI** (weighted by number of pumps)
- **Comparison table** of N analyses (side-by-side)

#### **6. PDF Export**
- **Professional quality** with Pfeiffer branding (logo, corporate colors)
- **Content structure**:
  - Executive summary (total savings, overall ROI)
  - Per-process breakdown (inputs + calculated outputs)
  - Global analysis summary
  - Assumptions clearly stated (wafer costs, downtime rates, ARGOS detection rate)
- **Export button** accessible at any time
- **PDF serves as session archive** (no separate database history)

---

### Out of Scope for MVP V10

The following features are **explicitly excluded** from V10 to maintain focus on core workflow validation and Q1 2026 conditional PO targets:

#### **Deferred to V11 (H2 2026):**
- **Interactive charts** (bar charts, pie charts, line graphs) — Tables sufficient for MVP
- **Multi-language** (French, German, Mandarin, Japanese) — English only for V10
- **Database-backed session history** — PDF exports serve as archive
- **Custom PDF templates** by region — Standard Pfeiffer template for V10

#### **Deferred to V12+ (2027+):**
- **CRM/ERP API integration** (Salesforce, SAP auto-sync)
- **Native mobile app** (iOS/Android) — Web-responsive sufficient for V10
- **Pump model database** with dropdown — Free text maintains flexibility
- **AI-powered recommendations** based on historical data

#### **Rationale:**
MVP V10 prioritizes **validating live co-construction workflow** and **securing 3 conditional POs in Q1 2026**. Advanced features above are valuable but not blockers for this core success criteria.

---

### MVP Success Criteria

**V10 is successful if (Q1 2026):**

1. **100% adoption in target opportunities**
   - GF Dresden, ST Rousset, NXP all use V10 in live client meetings
   - JB uses V10 in 100% of his client sessions

2. **Workflow validation**
   - **≥90% of meetings generate PDF export** (co-construction success indicator)
   - **Average 3+ analyses per session** (high engagement = clients sharing real data)
   - Clients share sensitive data verbally during session (not "I'll email that later")

3. **Conditional PO conversion**
   - **≥1 conditional PO signed** among the 3 opportunities in Q1 2026
   - Clients use exported PDF to defend pilot internally with procurement/management

4. **Positive workflow feedback**
   - Clients request follow-up meetings to analyze additional processes
   - Sub Fab Managers challenge assumptions during live session (engagement indicator)

5. **No critical technical blockers**
   - Zero crashes/bugs preventing PDF export
   - ROI calculations verified as mathematically correct

**🚫 Failure signals (pivot required):**
- <50% of meetings generate PDF (workflow doesn't fit real usage)
- Clients still won't share sensitive data verbally (trust issue)
- Zero conditional POs in Q1 2026 (value proposition not proven)

---

### Future Vision

#### **V11 (H2 2026) — Post-MVP Enhancements**
- **Multi-language support**: French, German (European priority)
- **Visual charts**: Bar charts (savings per process), pie chart (analysis distribution)
- **Custom PDF branding**: Regional templates (Germany, Asia)
- **Session history database**: Lightweight DB with past analyses list per client

#### **V12 (2027) — Scaling & Platform**
- **Native mobile app**: iPad/Android optimized for field sales
- **CRM integration**: Auto-sync PDF exports to Salesforce
- **Pump model database**: Dropdown with Pfeiffer models (if ROI justified)
- **Custom templates**: Sub Fab Managers can save their own templates

#### **V13+ (2027-2028) — Advanced Features**
- **AI-powered recommendations**: Automatic suggestions based on historical data
- **Real-time collaboration**: Multiple users editing same analysis simultaneously
- **Public API**: Client ERP integration for auto-import failure data
- **Multi-fab analysis**: Cross-site ROI comparison for clients with multiple facilities

#### **Long-Term Vision (2028+)**
- **ARGOS Sales Engineering Platform**: ROI calculator becomes module in comprehensive sales toolset
- **Expansion beyond pumps**: Adapt workflow for abatements, compressors, other equipment
- **Self-service client portal**: Sub Fab Managers create analyses without Pfeiffer presence (freemium model)

---

### Vision V11+ — Module "Solutions"

> **🔮 Out of Scope V10** — This section documents the vision for future versions beyond MVP.

#### **Concept: From ROI Justification to Technical Scoping**

After pitching ROI with V10 calculator, users click a **"Solutions"** button to transition from analytical phase (ROI justification) to pilot construction phase (technical architecture).

#### **Strategic Flow**

| Phase | Focus | Output |
|-------|-------|--------|
| **V10 (ROI Calculator)** | Justify the value | ROI numbers + PDF report |
| **V11+ (Solutions Module)** | Define deployment | Technical architecture + pilot info |

#### **Proposed Features**

**1. System Architecture Visualization**
- Visual representation of ARGOS predictive maintenance system to be deployed
- Interactive diagram showing components: pumps, sensors, gateway, connectivity
- Helps client visualize what "ARGOS deployment" actually looks like

**2. Technical Information Capture**
- Number of pumps to monitor (pre-filled from ROI analyses)
- Existing supervision network? (yes/no + type)
- Connectivity type (Ethernet, WiFi, 4G, OPC UA, Modbus...)
- Existing IT infrastructure (VM, on-prem, cloud)

**3. Seamless ROI → Pilot Transition**
- **"Solutions" button** accessible from Global Analysis view
- **Pre-filled with ROI data**: pump count, process types already captured
- **Output**: Technical specification sheet ready for pilot proposal construction

#### **Future Workflow**

```
ROI Calculator (V10)
      ↓
[Client convinced by ROI]
      ↓
   Click "Solutions" Button
      ↓
Architecture Module (V11+)
      ↓
[Capture technical specs]
      ↓
   Generate Pilot Proposal
```

#### **Value Proposition**

**For Pfeiffer:**
- **Capture technical info while client is engaged**, without waiting for 2nd meeting
- Accelerate time-to-proposal (days instead of weeks)
- Reduce risk of losing momentum between ROI pitch and technical discussion

**For Client:**
- **See concretely what system looks like** to be deployed
- Understand infrastructure requirements immediately
- Single conversation covers both "Why ARGOS?" (ROI) and "How to deploy ARGOS?" (architecture)

**For Pilot Success:**
- All necessary data captured for proposal construction in one session
- Technical feasibility validated early (connectivity constraints, IT infrastructure)
- Reduces back-and-forth iterations before pilot kickoff

#### **Strategic Alignment**

This module extends the **"friction by design"** philosophy of V10:
- V10 creates friction with **conditional POs** → Ensures serious commitment
- V11+ creates friction with **technical scoping** → Ensures deployment feasibility

Both frictions = stronger client commitment and higher pilot success rate.
