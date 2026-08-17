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

Together they turn notes into leverage.
