# Self-Improvement Hooks (v0.2)

This package introduces the first pieces of the evolutionary brain.

### What is included
- Usage logger (`backend/utils/logger.ts`)
  - Every capability run is recorded in `logs/usage.jsonl`
  - Later agents will read this file to learn what works and what fails

- First real capability (`text-summarizer`)
  - Has logging built in
  - Currently a smart stub (takes the first few sentences)
  - Ready to be upgraded to real AI later

### Why this matters
The system can now observe itself.
This is the foundation for Stage 2–4 of the vision:
- Agents reading usage data
- Agents proposing new capabilities
- Agents improving existing ones
- The platform eventually maintaining and expanding itself

We are building the brain that will one day improve itself.