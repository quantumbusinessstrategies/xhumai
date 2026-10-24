# Capabilities

Every capability is an asset. Every asset compounds.

## Live

| ID | Name | Category | Status |
|----|------|----------|--------|
| text-summarizer | Text Summarizer | writing | stub (logging live) |
| action-extractor | Action Extractor | productivity | stub (logging live) |
| decision-extractor | Decision Extractor | productivity | stub (logging live) |
| follow-up-extractor | Follow-up Extractor | productivity | stub (logging live) |
| deadline-extractor | Deadline Extractor | productivity | stub (logging live) |
| blocker-extractor | Blocker Extractor | productivity | stub (logging live) |
| owner-extractor | Owner Extractor | productivity | stub (logging live) |
| priority-sorter | Priority Sorter | productivity | stub (logging live) |
| risk-extractor | Risk Extractor | productivity | stub (logging live) |
| opportunity-extractor | Opportunity Extractor | productivity | stub (logging live) |
| insight-extractor | Insight Extractor | productivity | stub (logging live) |
| assumption-extractor | Assumption Extractor | productivity | stub (logging live) |
| constraint-extractor | Constraint Extractor | productivity | stub (logging live) |
| commitment-extractor | Commitment Extractor | productivity | stub (logging live) |
| leverage-extractor | Leverage Extractor | productivity | stub (logging live) |
| delegation-extractor | Delegation Extractor | productivity | stub (logging live) |
| energy-extractor | Energy Extractor | productivity | stub (logging live) |
| dependency-extractor | Dependency Extractor | productivity | stub (logging live) |
| metric-extractor | Metric Extractor | productivity | stub (logging live) |
| question-extractor | Question Extractor | productivity | stub (logging live) |
| tradeoff-extractor | Tradeoff Extractor | productivity | stub (logging live) |
| stakeholder-extractor | Stakeholder Extractor | productivity | stub (logging live) |
| progress-extractor | Progress Extractor | productivity | stub (logging live) |
| clarity-extractor | Clarity Extractor | productivity | stub (logging live) |
| freedom-extractor | Freedom Extractor | productivity | stub (logging live) |
| boundary-extractor | Boundary Extractor | productivity | stub (logging live) |
| rest-extractor | Rest Extractor | productivity | stub (logging live) |
| presence-extractor | Presence Extractor | productivity | stub (logging live) |
| attention-extractor | Attention Extractor | productivity | stub (logging live) |
| simplicity-extractor | Simplicity Extractor | productivity | stub (logging live) |
| elimination-extractor | Elimination Extractor | productivity | stub (logging live) |
| automation-extractor | Automation Extractor | productivity | stub (logging live) |
| reclaim-extractor | Reclaim Extractor | productivity | stub (logging live) |
| compound-extractor | Compound Extractor | productivity | stub (logging live) |
| rhythm-extractor | Rhythm Extractor | productivity | stub (logging live) |

## Seeded / Coming

| ID | Name | Category |
|----|------|----------|
| pdf-to-excel | PDF to Excel | documents |

## Design Rules

1. Every capability logs usage (success/fail, duration, input size).
2. Stubs are intentional — they prove the pipeline before real models.
3. New capabilities are registered in `capabilities/registry/index.ts`.
4. Intent classifier routes natural language toward the right capability.
5. The system observes itself so agents can later improve and expand it.

## How they compound

- **Text Summarizer** → less reading
- **Action Extractor** → less re-reading, more executing
- **Decision Extractor** → less re-litigating, more clarity
- **Follow-up Extractor** → fewer dropped loops, more closed loops
- **Deadline Extractor** → time pressure visible, fewer slips
- **Blocker Extractor** → friction visible, work unblocks, nothing stalls
- **Owner Extractor** → accountability visible, nothing floats without a name
- **Priority Sorter** → attention goes where it compounds
- **Risk Extractor** → downside visible early, fewer blindsides
- **Opportunity Extractor** → upside and leverage visible early, high-value openings captured
- **Insight Extractor** → patterns and takeaways visible, understanding compounds
- **Assumption Extractor** → hidden premises visible, decisions rest on clearer ground
- **Constraint Extractor** → real bounds visible, effort is not wasted on impossible paths
- **Commitment Extractor** → promises and obligations visible, accountability compounds, nothing left hanging
- **Leverage Extractor** → systems and compounding moves visible, work keeps happening after you stop
- **Delegation Extractor** → work leaves the founder, capacity returns to high-leverage work
- **Energy Extractor** → drains and restoratives visible, work is redesigned toward living more
- **Dependency Extractor** → prerequisites and sequence visible, hidden waits stop stalling the system
- **Metric Extractor** → success criteria visible, work has a finish line, less motion without progress
- **Question Extractor** → unanswered questions visible, thinking can close instead of looping
- **Tradeoff Extractor** → costs vs gains visible, decisions get made once instead of circling
- **Stakeholder Extractor** → who is affected / who needs buy-in visible, work is not built in a vacuum
- **Progress Extractor** → completed work, wins, and momentum visible, effort feels cumulative instead of endless
- **Clarity Extractor** → vague language and fuzzy commitments visible, ambiguity shrinks so execution can start
- **Freedom Extractor** → autonomy, optionality, and life-expanding moves visible so capacity compounds into living more
- **Boundary Extractor** → time, scope, energy, and refusal lines visible so work stops expanding into life
- **Rest Extractor** → rest, recovery, and non-work time visible so protected hours are lived, not leftover
- **Presence Extractor** → moments of aliveness and actual living visible so reclaimed capacity compounds into living more
- **Attention Extractor** → attention allocation, distractions, and leverage points visible so focus compounds toward Work Less. Live More.
- **Simplicity Extractor** → complexity and unnecessary process visible so the surface area of work shrinks permanently and capacity returns to living more
- **Elimination Extractor** → low-value work, busywork, and optional commitments visible so work that should not exist is removed and capacity permanently returns to living more
- **Automation Extractor** → recurring manual work, templates, and systemizable sequences visible so the same outcome happens without ongoing human time and capacity permanently returns to living more
- **Reclaim Extractor** → time sinks and recoverable hours visible so the specific hours that can come back are named and returned to life
- **Compound Extractor** → decisions, systems, assets, and moves that compound over time visible so small inputs keep producing value after you stop and capacity permanently returns to living more
- **Rhythm Extractor** → natural energy cycles and optimal windows visible so work rides the body's wave instead of fighting it and capacity compounds into living more

Together they turn notes into leverage.
