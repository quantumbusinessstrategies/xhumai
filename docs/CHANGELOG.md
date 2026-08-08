# Changelog

## v1.0 — 2026-08-08
- Added **Priority Extractor** capability (productivity category)
  - Surfaces priority signals (critical / high / medium / low, P0–P3, urgent / must / later) from free-form notes
  - Full usage logging for self-improvement loop
  - Wired into capability registry + API route + intent classifier
  - Complements the extractor suite: actions = next steps; decisions = settled/open; follow-ups = open loops; deadlines = when; blockers = what is in the way; owners = who; priorities = what matters most
- Direct progress toward "Work Less. Live More." — focus compounds; busywork shrinks

## v0.9 — 2026-08-06
- Added **Owner Extractor** capability (productivity category)
  - Surfaces owners, assignees, and responsible parties from free-form notes
  - Full usage logging for self-improvement loop
  - Wired into capability registry + API route + intent classifier
  - Complements the extractor suite: actions = next steps; decisions = settled/open; follow-ups = open loops; deadlines = when; blockers = what is in the way; owners = who owns it
- Direct progress toward "Work Less. Live More." — accountability becomes visible so nothing floats

## v0.8 — 2026-08-05
- Added **Blocker Extractor** capability (productivity category)
  - Surfaces blockers, dependencies, risks, and friction points from free-form notes
  - Full usage logging for self-improvement loop
  - Wired into capability registry + API route + intent classifier
  - Complements the extractor suite: actions = next steps; decisions = settled/open; follow-ups = open loops; deadlines = when; blockers = what is in the way
- Direct progress toward "Work Less. Live More." — friction becomes visible so work flows

## v0.7 — 2026-08-04
- Added **Deadline Extractor** capability (productivity category)
  - Surfaces dates, deadlines, and time-bound items from free-form notes
  - Full usage logging for self-improvement loop
  - Wired into capability registry + API route + intent classifier
  - Complements Action + Decision + Follow-up extractors: actions = next steps; decisions = settled/open; follow-ups = open loops; deadlines = when it must happen
- Direct progress toward "Work Less. Live More." — nothing slips

## v0.6 — 2026-08-02
- Added **Follow-up Extractor** capability (productivity category)
  - Surfaces who/what still needs a follow-up from free-form notes
  - Full usage logging for self-improvement loop
  - Wired into capability registry + API route + intent classifier
  - Complements Action + Decision extractors: actions = next steps; decisions = settled/open; follow-ups = open loops to close
- Direct progress toward "Work Less. Live More." — nothing drifts

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
