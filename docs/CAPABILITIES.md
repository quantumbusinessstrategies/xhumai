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

Together they turn notes into leverage.
