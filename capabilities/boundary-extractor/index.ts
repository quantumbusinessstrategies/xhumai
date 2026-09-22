import { logUsage } from '../../backend/utils/logger';

/**
 * Boundary Extractor Capability
 * Surfaces personal, professional, and temporal boundaries from free-form notes
 * so capacity is protected and living more remains possible.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - energy-extractor      → what drains vs restores
 * - constraint-extractor  → hard limits on the work itself
 * - delegation-extractor  → what can leave your hands
 * - reclaim-extractor     → time sinks to recover
 * - boundary-extractor    → the lines that keep work from consuming life
 */

export interface BoundaryItem {
  text: string;
  type?: 'time' | 'energy' | 'scope' | 'relationship' | 'digital' | 'unknown';
  strength?: 'hard' | 'soft' | 'aspirational';
  note?: string;
}

export interface BoundaryResult {
  boundaries: BoundaryItem[];
}

export async function runBoundaryExtractor(input: string): Promise<BoundaryResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract boundaries');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const boundaryPatterns = [
      /\b(no meetings after|no work after|shutdown|hard stop|cutoff|off by|ends at)\b/i,
      /\b(protect|protected time|deep work block|no-meeting|focus block|sacred)\b/i,
      /\b(boundary|boundaries|limit myself|I will not|I don't|won't take|refuse)\b/i,
      /\b(family time|evening free|weekend free|phone off|notifications off|do not disturb)\b/i,
      /\b(scope creep|out of scope|not my job|outside my role|above my pay)\b/i,
      /\b(max hours|cap at|no more than \d+|limit to)\b/i,
    ];

    const timeHints = /\b(after|before|by|hours|evening|weekend|shutdown|cutoff|block)\b/i;
    const energyHints = /\b(energy|drain|protect|sacred|focus|deep work)\b/i;
    const scopeHints = /\b(scope|role|job|out of|creep|not my)\b/i;
    const relationshipHints = /\b(family|partner|kids|team|client|say no)\b/i;
    const digitalHints = /\b(phone|notification|slack|email|do not disturb|offline)\b/i;
    const hardHints = /\b(hard|never|will not|won't|must not|absolute)\b/i;
    const softHints = /\b(try to|prefer|ideally|aim to|should)\b/i;

    const boundaries: BoundaryItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (boundaryPatterns.some(p => p.test(cleaned))) {
        let type: BoundaryItem['type'] = 'unknown';
        if (timeHints.test(cleaned)) type = 'time';
        else if (energyHints.test(cleaned)) type = 'energy';
        else if (scopeHints.test(cleaned)) type = 'scope';
        else if (relationshipHints.test(cleaned)) type = 'relationship';
        else if (digitalHints.test(cleaned)) type = 'digital';

        let strength: BoundaryItem['strength'] = 'soft';
        if (hardHints.test(cleaned)) strength = 'hard';
        else if (softHints.test(cleaned)) strength = 'aspirational';

        if (!boundaries.some(b => b.text === cleaned)) {
          boundaries.push({
            text: cleaned,
            type,
            strength,
            note:
              strength === 'hard'
                ? 'Protect this line — it directly enables living more'
                : strength === 'aspirational'
                  ? 'Candidate to harden into a real boundary'
                  : 'Boundary signal worth making explicit',
          });
        }
      }
    }

    if (boundaries.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          boundaries.push({
            text: line,
            type: 'unknown',
            strength: 'aspirational',
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
