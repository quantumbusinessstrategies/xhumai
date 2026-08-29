# Changelog

## v1.7 — 2026-08-28
- Added **Energy Extractor** capability (productivity category)
  - Surfaces what drains energy and what restores it from free-form notes
  - Full usage logging for self-improvement loop
  - Wired into capability registry + API route + intent classifier signals
  - Complements delegation (what leaves the founder) and leverage (what keeps working) with energy (what costs life-force vs what returns it)
- Direct progress toward "Work Less. Live More." — work is redesigned around energy, not just tasks

## v1.6 — 2026-08-28
- Added **Delegation Extractor** capability (productivity category)
  - Surfaces work that can be delegated, outsourced, automated, or dropped from free-form notes
  - Full usage logging for self-improvement loop
  - Wired into capability registry + API route + intent classifier signals
  - Complements owner (who has it) and leverage (what keeps working) with delegation (what should leave the founder's hands)
- Registered **Constraint Extractor** in the formal capability registry (route already existed)
- Direct progress toward "Work Less. Live More." — less founder time on work that does not require the founder

## v1.5 — 2026-08-27
- Wired **Leverage Extractor** into the formal capability registry + API + intent classifier
  - Surfaces systems, automations, templates, and compounding moves from free-form notes
  - Full usage logging for self-improvement loop
  - Complements opportunity (what could go right) with leverage (what keeps working after you stop)
- Direct progress toward "Work Less. Live More." — every capability is an asset; this one names the assets that compound

## v1.4 — 2026-08-25
- Added **Commitment Extractor** capability (productivity category)
  - Surfaces promises, commitments, obligations, and "I will / we will" statements from free-form notes
  - Full usage logging for self-improvement loop
  - Wired into capability registry + API route + intent classifier signals
  - Complements the extractor suite: owners = who; actions = next steps; commitments = what was promised so nothing is left hanging
- Direct progress toward "Work Less. Live More." — accountability compounds so less chasing and fewer dropped promises

## v1.3 — 2026-08-25
- Added **Assumption Extractor** capability (productivity category)
  - Surfaces implicit assumptions, premises, and taken-for-granted beliefs from free-form notes
  - Full usage logging for self-improvement loop
  - Wired into capability registry + API route + intent classifier signals
  - Complements the extractor suite: risk = what could go wrong; opportunity = what could go right; insight = what we learned; assumption = what we are taking for granted so foundations stay solid
- Direct progress toward "Work Less. Live More." — hidden premises become visible so fewer surprises and less rework

## v1.2 — 2026-08-25
- Added **Insight Extractor** capability (productivity category)
  - Surfaces key insights, patterns, and non-obvious takeaways from free-form notes
  - Full usage logging for self-improvement loop
  - Wired into capability registry + API route + intent classifier signals
  - Complements the extractor suite: risk = what could go wrong; opportunity = what could go right; insight = what we learned / what stands out so understanding compounds
- Fully wired **Opportunity Extractor** into server routes (was registered but missing import/route)
- Direct progress toward "Work Less. Live More." — understanding compounds so less re-discovery

## v1.1 — 2026-08-17
- Added **Opportunity Extractor** capability (productivity category)
  - Surfaces opportunities, upsides, leverage points, and positive openings from free-form notes
  - Full usage logging for self-improvement loop
  - Wired into capability registry + API route + intent classifier
  - Complements the extractor suite: risk = what could go wrong; opportunity = what could go right so we capture it early
- Direct progress toward "Work Less. Live More." — attention and energy go where they compound

## v1.0 — 2026-08-10
- Added **Risk Extractor** capability (productivity category)
  - Surfaces risks, threats, exposure points, and potential downsides from free-form notes
  - Full usage logging for self-improvement loop
  - Wired into capability registry + API route + intent classifier
  - Complements the extractor suite: actions = next steps; decisions = settled/open; follow-ups = open loops; deadlines = when; blockers = what is in the way; owners = who owns it; priority = where attention goes; risks = what could go wrong
- Registered **Priority Sorter** in the formal capability registry (was already live in routes)
- Direct progress toward "Work Less. Live More." — downside becomes visible so nothing blindsides

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
