import { logUsage } from '../../backend/utils/logger';

/**
 * Outcome Extractor Capability
 * Surfaces intended results, definitions of done, and destination states
 * so work has somewhere to arrive — not only motion.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - action-extractor  → what to do next
 * - metric-extractor  → how we will know numerically
 * - decision-extractor → what was settled
 * - outcome-extractor → what success looks like so effort is not spent without a destination
 */

export interface OutcomeItem {
  outcome: string;
  horizon?: 'now' | 'near' | 'later' | 'unknown';
  status?: 'desired' | 'in-progress' | 'achieved' | 'abandoned' | 'unknown';
  context?: string;
}

export interface OutcomeResult {
  outcomes: OutcomeItem[];
}

export async function runOutcomeExtractor(input: string): Promise<OutcomeResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract outcomes');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const outcomePatterns = [
      /\b(outcome|outcomes|result|results|goal|goals|destination|definition of done|done when|success looks like|we want|we will have|end state|north star)\b/i,
      /\b(so that|in order to|the point is|win condition|ship when)\b/i,
      /\b(achieve|achieved|deliver|delivered|launch|shipped|complete|completed)\b/i,
    ];

    const horizonFrom = (line: string): OutcomeItem['horizon'] => {
      if (/\b(today|now|this week|immediately)\b/i.test(line)) return 'now';
      if (/\b(this month|next week|soon|near[- ]?term)\b/i.test(line)) return 'near';
      if (/\b(later|eventually|long[- ]?term|this year|next year)\b/i.test(line)) return 'later';
      return 'unknown';
    };

    const statusFrom = (line: string): OutcomeItem['status'] => {
      if (/\b(done|achieved|shipped|launched|completed)\b/i.test(line)) return 'achieved';
      if (/\b(abandoned|killed|dropped|no longer)\b/i.test(line)) return 'abandoned';
      if (/\b(working toward|in progress|building|shipping)\b/i.test(line)) return 'in-progress';
      if (/\b(want|goal|intend|aim|so that)\b/i.test(line)) return 'desired';
      return 'unknown';
    };

    const outcomes: OutcomeItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (outcomePatterns.some(p => p.test(cleaned))) {
        if (!outcomes.some(o => o.outcome === cleaned)) {
          outcomes.push({
            outcome: cleaned,
            horizon: horizonFrom(cleaned),
            status: statusFrom(cleaned),
            context: cleaned.length > 90 ? cleaned.slice(0, 90) + '…' : cleaned,
          });
        }
      }
    }

    if (outcomes.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          outcomes.push({
            outcome: line,
            horizon: 'unknown',
            status: 'unknown',
            context: line,
          });
        }
      }
    }

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'outcome-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { outcomes };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'outcome-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
