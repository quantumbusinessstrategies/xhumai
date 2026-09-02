import { logUsage } from '../../backend/utils/logger';

/**
 * Tradeoff Extractor Capability
 * Surfaces tradeoffs, costs-vs-gains, and competing choices from free-form notes
 * so decisions get made once and do not get re-litigated.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - decision-extractor    → what was settled (or still open)
 * - constraint-extractor  → hard bounds
 * - assumption-extractor  → what we take as given
 * - question-extractor    → what is still unresolved
 * - tradeoff-extractor    → what we give up to get what we want
 */

export interface TradeoffItem {
  tradeoff: string;
  gain?: string;
  cost?: string;
  weight?: 'high' | 'medium' | 'low';
  context?: string;
}

export interface TradeoffResult {
  tradeoffs: TradeoffItem[];
}

export async function runTradeoffExtractor(input: string): Promise<TradeoffResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract tradeoffs');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const patterns = [
      /\b(trade[- ]?off|tradeoff|compromise|give up|sacrifice|at the cost of|instead of)\b/i,
      /\b(vs\.?|versus|rather than|on the other hand|either .+ or)\b/i,
      /\b(speed vs|quality vs|cost vs|time vs|scope vs)\b/i,
      /\b(if we .+ we (lose|gain|miss|delay|save))\b/i,
      /\b(pros? and cons?|upside .+ downside|benefit .+ cost)\b/i,
    ];

    const highWeight = /\b(major|critical|core|fundamental|strategic|must)\b/i;
    const lowWeight = /\b(minor|small|slight|nice to have|optional)\b/i;

    const tradeoffs: TradeoffItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/u, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (!patterns.some(p => p.test(cleaned))) continue;

      let weight: TradeoffItem['weight'] = 'medium';
      if (highWeight.test(cleaned)) weight = 'high';
      else if (lowWeight.test(cleaned)) weight = 'low';

      if (!tradeoffs.some(t => t.tradeoff === cleaned)) {
        tradeoffs.push({
          tradeoff: cleaned,
          weight,
          context: cleaned.length > 90 ? cleaned.slice(0, 90) + '…' : cleaned,
        });
      }
    }

    if (tradeoffs.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          tradeoffs.push({
            tradeoff: line,
            weight: 'medium',
            context: line,
          });
        }
      }
    }

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'tradeoff-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { tradeoffs };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'tradeoff-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
