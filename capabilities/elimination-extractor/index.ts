import { logUsage } from '../../backend/utils/logger';

/**
 * Elimination Extractor Capability
 * Surfaces work, habits, meetings, processes, and obligations that can be
 * permanently stopped, cancelled, or removed so capacity is returned to life.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - delegation-extractor  → work that leaves the founder (still exists)
 * - energy-extractor      → what drains life-force
 * - freedom-extractor     → moves that expand autonomy and optionality
 * - leverage-extractor    → systems that keep working after you stop
 * - elimination-extractor → what should cease to exist so it never returns
 */

export interface EliminationItem {
  item: string;
  reason?: string;
  impact?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface EliminationResult {
  eliminations: EliminationItem[];
}

export async function runEliminationExtractor(input: string): Promise<EliminationResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract elimination signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const eliminationPatterns = [
      /\b(stop doing|never again|eliminate|drop|kill|cancel|remove|scrap|cut|end|discontinue)\b/i,
      /\b(not worth|waste of time|low value|no longer needed|redundant|obsolete)\b/i,
      /\b(too many meetings|meeting bloat|status update|status meeting|sync that could be async)\b/i,
      /\b(busywork|admin grind|report no one reads|process for process|ceremony)\b/i,
      /\b(should not exist|does not need to exist|can live without|nobody uses)\b/i,
    ];

    const highImpactHints = /\b(hours? (a|per) week|every day|constant|always|massive|huge|permanent)\b/i;
    const lowImpactHints = /\b(occasional|rare|minor|small|once in a while)\b/i;

    const eliminations: EliminationItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (eliminationPatterns.some(p => p.test(cleaned))) {
        let impact: EliminationItem['impact'] = 'medium';
        if (highImpactHints.test(cleaned)) impact = 'high';
        else if (lowImpactHints.test(cleaned)) impact = 'low';

        if (!eliminations.some(e => e.item === cleaned)) {
          eliminations.push({
            item: cleaned,
            reason: 'Candidate for permanent removal',
            impact,
            note:
              impact === 'high'
                ? 'High-leverage elimination — stopping this returns meaningful capacity'
                : impact === 'low'
                  ? 'Small cut — still compounds if many exist'
                  : 'Candidate to stop so it never returns to the workload',
          });
        }
      }
    }

    if (eliminations.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          eliminations.push({
            item: line,
            reason: 'Candidate for elimination review',
            impact: 'medium',
            note: 'Review whether this still needs to exist',
          });
        }
      }
    }

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'elimination-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { eliminations };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'elimination-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
