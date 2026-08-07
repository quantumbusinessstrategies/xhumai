# Capabilities

Every capability is an asset. Every asset compounds.

## Live

| ID | Name | Category | Status |
|----|------|----------|--------|
| text-summarizer | Text Summarizer | writing | stub (logging live) |
| action-extractor | Action Extractor | productivity | stub (logging live) |
| priority-extractor | Priority Extractor | productivity | stub (logging live) |

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
- **Priority Extractor** → energy goes to the right work first; noise falls away

Together they turn notes into leverage.
