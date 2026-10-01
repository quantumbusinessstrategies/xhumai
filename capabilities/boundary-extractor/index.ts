import { logUsage } from '../../backend/utils/logger';

/**
 * Boundary Extractor Capability
 * Surfaces lines that protect capacity: no-meeting zones, refusal points,
 * after-hours rules, and commitments that should not leak into life.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 */

export interface BoundaryItem {
  item: string;
  kind?: 'time' | 'access' | 'scope' | 'relationship' | 'unknown';
  strength?: 'hard' | 'soft' | 'missing';
  note?: string;
}

export interface BoundaryResult {
  boundaries: BoundaryItem[];
}

export async function runBoundaryExtractor(input: string): Promise<BoundaryResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract boundary signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const boundaryPatterns = [
      /\b(boundary|boundaries|say no|protect time|guardrail|no-meeting|no meeting|after hours|after-hours|do not disturb|off limits|off-limits)\b/i,
      /\b(weekends are|not available|won't take|will not take|hard stop|cutoff|office hours|working hours)\b/i,
      /\b(scope creep|out of scope|not my job|not our job|escalate instead)\b/i,
    ];

    const timeHints = /\b(hours|weekend|evening|night|calendar|meeting|time|cutoff|hard stop)\b/i;
    const accessHints = /\b(slack|ping|phone|always on|always-on|do not disturb|available)\b/i;
    const scopeHints = /\b(scope|not my job|out of scope|creep|extra work)\b/i;
    const relHints = /\b(client|boss|team|family|partner|stakeholder)\b/i;
    const hardHints = /\b(never|hard stop|non-negotiable|must not|will not)\b/i;
    const missingHints = /\b(always available|can't say no|no boundary|leaks into|evenings too)\b/i;

    const boundaries: BoundaryItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (boundaryPatterns.some(p => p.test(cleaned))) {
        let kind: BoundaryItem['kind'] = 'unknown';
        if (timeHints.test(cleaned)) kind = 'time';
        else if (accessHints.test(cleaned)) kind = 'access';
        else if (scopeHints.test(cleaned)) kind = 'scope';
        else if (relHints.test(cleaned)) kind = 'relationship';

        let strength: BoundaryItem['strength'] = 'soft';
        if (hardHints.test(cleaned)) strength = 'hard';
        if (missingHints.test(cleaned)) strength = 'missing';

        if (!boundaries.some(b => b.item === cleaned)) {
          boundaries.push({
            item: cleaned,
            kind,
            strength,
            note:
              strength === 'missing'
                ? 'Capacity is leaking here — draw a line so living more stays possible'
                : strength === 'hard'
                  ? 'Protect this line; it is already buying life back'
                  : 'Candidate to make explicit and defend',
          });
        }
      }
    }

    if (boundaries.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          boundaries.push({
            item: line,
            kind: 'unknown',
            strength: 'soft',
            note: 'Candidate for boundary review',
          });
        }
      }
    }

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'boundary-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { boundaries };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'boundary-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
