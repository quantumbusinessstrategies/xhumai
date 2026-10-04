import { logUsage } from '../../backend/utils/logger';

/**
 * Boundary Extractor Capability
 * Surfaces the lines that protect capacity: time fences, scope limits,
 * energy rules, availability windows, and explicit refusals.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - freedom-extractor   → moves that compound into more life
 * - energy-extractor    → what drains vs restores
 * - delegation-extractor → work that should leave the founder
 * - constraint-extractor → hard limits on what is possible
 * - boundary-extractor  → chosen lines that keep work from eating life
 */

export interface BoundaryItem {
  item: string;
  type?: 'time' | 'scope' | 'energy' | 'availability' | 'refusal' | 'unknown';
  strength?: 'hard' | 'soft' | 'missing';
  note?: string;
}

export interface BoundaryResult {
  boundaries: BoundaryItem[];
  gaps: string[];
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
      /\b(boundary|boundaries|off limits|out of scope|not my job|do not)\b/i,
      /\b(after hours|evenings|weekends|no meetings|meeting-free|focus block|do not disturb)\b/i,
      /\b(decline|refuse|say no|won't|will not|not available|unavailable)\b/i,
      /\b(cap|limit|maximum|only|stop at|done by|office hours|working hours)\b/i,
      /\b(protect|guard|preserve|family time|personal time|rest|shutdown)\b/i,
    ];

    const timeHints = /\b(after hours|evening|weekend|hours|by \d|shutdown|meeting-free|focus block)\b/i;
    const scopeHints = /\b(scope|out of scope|not my job|only|won't take|not responsible)\b/i;
    const energyHints = /\b(energy|drain|rest|recover|burnout|protect)\b/i;
    const availabilityHints = /\b(available|unavailable|office hours|working hours|do not disturb)\b/i;
    const refusalHints = /\b(decline|refuse|say no|will not|won't|off limits)\b/i;
    const hardHints = /\b(never|always|non-negotiable|hard stop|must)\b/i;
    const softHints = /\b(try to|ideally|when possible|prefer)\b/i;
    const gapHints = /\b(always on|no boundary|can't say no|inbox zero|late night|weekend work|open calendar)\b/i;

    const boundaries: BoundaryItem[] = [];
    const gaps: string[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (gapHints.test(cleaned) && !gaps.includes(cleaned)) {
        gaps.push(cleaned);
      }

      if (boundaryPatterns.some(p => p.test(cleaned))) {
        let type: BoundaryItem['type'] = 'unknown';
        if (refusalHints.test(cleaned)) type = 'refusal';
        else if (timeHints.test(cleaned)) type = 'time';
        else if (scopeHints.test(cleaned)) type = 'scope';
        else if (availabilityHints.test(cleaned)) type = 'availability';
        else if (energyHints.test(cleaned)) type = 'energy';

        let strength: BoundaryItem['strength'] = 'soft';
        if (hardHints.test(cleaned)) strength = 'hard';
        else if (softHints.test(cleaned)) strength = 'soft';

        if (!boundaries.some(b => b.item === cleaned)) {
          boundaries.push({
            item: cleaned,
            type,
            strength,
            note:
              type === 'time'
                ? 'Time fence — keep it visible so work has an edge'
                : type === 'refusal'
                  ? 'Explicit no — the capacity-protecting move'
                  : type === 'scope'
                    ? 'Scope line — stops work from expanding by default'
                    : type === 'availability'
                      ? 'Availability window — makes presence finite'
                      : 'Boundary signal — protect it or it will erode',
          });
        }
      }
    }

    if (boundaries.length === 0) {
      gaps.push('No explicit boundary found — capacity is unprotected by default');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          boundaries.push({
            item: line,
            type: 'unknown',
            strength: 'missing',
            note: 'Candidate for a boundary — name the line or drop the obligation',
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

    return { boundaries, gaps };
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
