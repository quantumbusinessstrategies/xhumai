import { logUsage } from '../../backend/utils/logger';

/**
 * Constraint Extractor Capability
 * Surfaces constraints, limits, hard boundaries, and non-negotiables from free-form notes
 * so work stays inside reality and less effort is wasted fighting the impossible.
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
 * - opportunity-extractor  → what could compound / win
 * - assumption-extractor   → unexamined premises
 * - constraint-extractor   → hard limits and non-negotiables
 */

export interface ConstraintItem {
  constraint: string;
  type?: 'hard' | 'soft' | 'resource' | 'policy' | 'time' | 'other';
  context?: string;
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
      /\b(constraint|constraints|limit|limits|limited by|cannot|can't|must not|must not exceed|non-negotiable|hard limit|boundary|boundaries|ceiling|floor|cap|budget|only|maximum|minimum|within|restricted|restriction)\b/i,
      /\b(we (can|cannot|can't|must|have to) .{0,40}(only|within|under|before|after|no more than|at most|at least))\b/i,
      /\b(resource|time|budget|headcount|capacity|scope).{0,30}(limit|constraint|fixed|capped)\b/i,
    ];

    const hardSignals = /\b(hard|absolute|non-negotiable|must|cannot|can't|forbidden|never)\b/i;
    const softSignals = /\b(soft|prefer|ideally|should|guideline|nice to)\b/i;
    const resourceSignals = /\b(budget|cost|money|headcount|people|capacity|resource)\b/i;
    const timeSignals = /\b(deadline|time|by |before |after |eod|eow|week|month)\b/i;
    const policySignals = /\b(policy|compliance|legal|regulation|rule|standard)\b/i;

    const constraints: ConstraintItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (constraintPatterns.some(p => p.test(cleaned))) {
        let type: ConstraintItem['type'] = 'other';
        if (resourceSignals.test(cleaned)) type = 'resource';
        else if (timeSignals.test(cleaned)) type = 'time';
        else if (policySignals.test(cleaned)) type = 'policy';
        else if (hardSignals.test(cleaned)) type = 'hard';
        else if (softSignals.test(cleaned)) type = 'soft';

        if (!constraints.some(c => c.constraint === cleaned)) {
          constraints.push({
            constraint: cleaned,
            type,
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
            type: 'other',
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
