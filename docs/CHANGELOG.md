# Changelog

## v0.5 — 2026-08-02
- Added **Decision Extractor** capability (productivity category)
  - Surfaces explicit decisions and open questions from free-form notes
  - Full usage logging for self-improvement loop
  - Wired into capability registry + API route + intent classifier
  - Complements Action Extractor: actions = next steps; decisions = settled (or still open)
- Direct progress toward "Work Less. Live More." — meetings stop looping

## v0.4 — 2026-08-01
- Added **Action Extractor** capability (productivity category)
  - Pulls concrete next steps from free-form text
  - Full usage logging for self-improvement loop
  - Wired into capability registry + API route
  - Intent classifier now recognizes action/todo/extract signals
- Direct progress toward "Work Less. Live More." — every capability is an asset that compounds

## v0.3 — 2026-07-28
- Added Admin routes (`/api/admin/logs`, `/api/admin/stats`)
- Added Agent stubs (Usage Analyzer, Capability Suggester, Prompt Improver, SEO Agent, Health Agent)
- Updated frontend with live Admin section (stats, usage logs, agent cards)
- Confirmed Text Summarizer + usage logger working end-to-end

## v0.2
- First real capability: Text Summarizer (stub)
- Usage logger foundation for self-improvement

## v0.1
- Quantum Core backend
- Capability Registry
- Frontend skeleton
