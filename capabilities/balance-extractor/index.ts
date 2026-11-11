import { logUsage } from '../../backend/utils/logger';

/**
 * Balance Extractor Capability
 * Surfaces work-life imbalances, overcommitments, under-living signals,
 * and points where work is expanding into life or life is being crowded out
 * so capacity permanently returns to living more.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - boundary-extractor   → lines that protect capacity
 * - reclaim-extractor    → specific hours that can come back
 * - energy-extractor     → drains and restoratives
 * - rest-extractor       → protected non-work time
 * - balance-extractor    → the overall ratio of work to life and where it is skewed
 */

export interface BalanceItem {
  item: string;
  type?: 'overwork' | 'underliving' | 'overcommitment' | 'crowded' | 'skewed' | 'unknown';
  severity?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface BalanceResult {
  balances: BalanceItem[];
  gaps: string[];
}

export async function runBalanceExtractor(input: string): Promise<BalanceResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract balance signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const balancePatterns = [
      /\b(balance|work-life|overwork|overcommitted|too much work|no time for|crowded|skewed|imbalance|always working|never stop)\b/i,
      /\b(weekends|evenings|family time|personal|life|living|rest|hobby|relationship|health)\b/i,
      /\b(too busy|can't switch off|no margin|full calendar|no white space|always on)\b/i,
    ];

    const overworkHints = /\b(overwork|always working|never stop|too much|hours|late|weekend work|after hours)\b/i;
    const underlivingHints = /\b(no time for|haven't|forgot|can't remember|only work|no life|joyless|empty)\b/i;
    const overcommitmentHints = /\b(overcommitted|too many|yes to everything|can't say no|full|packed)\b/i;
    const crowdedHints = /\b(crowded|no space|no room|squeezed|pushed out|taken over)\b/i;
    const skewedHints = /\b(skewed|imbalance|all work|mostly work|work dominates)\b/i;
    const highHints = /\b(always|constantly|every|most|all day|never|extreme|severe)\b/i;
    const lowHints = /\b(sometimes|occasionally|a bit|slight|mild)\b/i;
    const gapHints = /\b(balanced|good balance|enough life|work is fine|no issue)\b/i;

    const balances: BalanceItem[] = [];
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

      if (balancePatterns.some(p => p.test(cleaned))) {
        let type: BalanceItem['type'] = 'unknown';
        if (overworkHints.test(cleaned)) type = 'overwork';
        else if (underlivingHints.test(cleaned)) type = 'underliving';
        else if (overcommitmentHints.test(cleaned)) type = 'overcommitment';
        else if (crowdedHints.test(cleaned)) type = 'crowded';
        else if (skewedHints.test(cleaned)) type = 'skewed';

        let severity: BalanceItem['severity'] = 'medium';
        if (highHints.test(cleaned)) severity = 'high';
        else if (lowHints.test(cleaned)) severity = 'low';

        if (!balances.some(b => b.item === cleaned)) {
          balances.push({
            item: cleaned,
            type,
            severity,
            note:
              type === 'overwork'
                ? 'Overwork signal — the work is expanding past the boundary into life'
                : type === 'underliving'
                  ? 'Under-living signal — capacity is not yet returning to actual living'
                  : type === 'overcommitment'
                    ? 'Overcommitment — too many yeses; reclaim by defaulting to no'
                    : type === 'crowded'
                      ? 'Life is being crowded out — protect the space the creed requires'
                      : 'Balance skew — name it so the ratio can shift toward living more',
          });
        }
      }
    }

    if (balances.length === 0) {
      gaps.push('No explicit balance signals found — work-life ratio remains invisible');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          balances.push({
            item: line,
            type: 'unknown',
            severity: 'medium',
            note: 'Candidate for balance review — is this expanding work or protecting life?',
          });
        }
      }
    }

    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'balance-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { balances, gaps };
  } catch (error: any) {
    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'balance-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });
    throw error;
  }
}
