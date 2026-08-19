import { logUsage } from '../../backend/utils/logger';

/**
 * Constraint Extractor Capability
 * Surfaces constraints, limits, non-negotiables, and hard boundaries from free-form notes
 * so plans stay inside real bounds and effort is not wasted on impossible paths.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - action-extractor       → what to do next
 * - decision-extractor     → what was settled (or still open)
 * - follow-up-extractor    → who/what still needs a touch
 * - deadline-extractor     → when it must happen
 * - blocker-extractor      → what is in the way right now
 * - owner-extractor        → who owns it
 * - priority-sorter        → where attention should go
 * - risk-extractor         → what could go wrong
 * - opportunity-extractor  → what could go right
 * - assumption-extractor   → what we are taking as true
 * - constraint-extractor   → what must not be violated (so plans stay feasible)
 */

export interface ConstraintItem {
  constraint: string;
  hardness?: 'hard' | 'soft' | 'unknown';
  context?: string;
  source?: string;
}

export interface ConstraintResult {
  constraints: ConstraintItem[];
}

export async function runConstraintExtractor(input: string): Promise<ConstraintResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract constraints');
    }

    // --- STUB LOGIC (replace with real model later) ---
    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const constraintPatterns = [
      /\b(constraint|constraints|limit|limits|limited|limitation|limitations|non-negotiable|nonnegotiable|must not|cannot|can't|must not exceed|cap|ceiling|floor|bound|bounds|boundary|boundaries)\b/i,
      /\b(within|no more than|at most|at least|maximum|minimum|only if|as long as|provided that|subject to)\b/i,
      /\b(budget|timeline|scope|resource|headcount|capacity).{0,30}(limit|constraint|cap|fixed)\b/i,
      /\b(hard (stop|limit|requirement)|immutable|fixed|locked)\b/i,
    ];

    const hardSignal = /\b(hard|strict|absolute|non-negotiable|must not|cannot|immutable|locked)\b/i;
    const softSignal = /\b(soft|prefer|preference|ideally|nice to have|flexible)\b/i;

    const constraints: ConstraintItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (constraintPatterns.some(p => p.test(cleaned))) {
        let hardness: ConstraintItem['hardness'] = 'unknown';
        if (hardSignal.test(cleaned)) hardness = 'hard';
        else if (softSignal.test(cleaned)) hardness = 'soft';

        if (!constraints.some(c => c.constraint === cleaned)) {
          constraints.push({
            constraint: cleaned,
            hardness,
            context: cleaned.length > 90 ? cleaned.slice(0, 90) + '…' : cleaned,
          });
        }
      }
    }

    // Light fallback so sparse input still returns value
    if (constraints.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          constraints.push({
            constraint: line,
            hardness: 'unknown',
            context: line,
          });
        }
      }
    }
    // ------------------------------------------------

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'constraint-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { constraints };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'constraint-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
