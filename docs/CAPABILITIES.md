# Capabilities

Every capability is an asset.
Every asset compounds.

## Live

| ID | Name | Category | Status |
|----|------|----------|--------|
| completion-extractor | Completion Extractor | productivity | stub (logging live) |
| yield-extractor | Yield Extractor | productivity | stub (logging live) |
| flow-extractor | Flow Extractor | productivity | stub (logging live) |
| recovery-extractor | Recovery Extractor | productivity | stub (logging live) |

## Design Rules

1. Every capability logs usage (success/fail, duration, input size).
2. Stubs are intentional — they prove the pipeline before real models.
3. New capabilities are registered in `capabilities/registry/index.ts`.
4. Intent classifier routes natural language toward the right capability.
5. The system observes itself so agents can later improve and expand it.

## How they compound

- **Completion Extractor** → open loops stop taxing attention
- **Yield Extractor** → further investment stops where returns diminish
- **Flow Extractor** → reclaimed capacity invested in effortless engagement
- **Recovery Extractor** → reclaimed capacity invested in restoration so living more is sustainable
