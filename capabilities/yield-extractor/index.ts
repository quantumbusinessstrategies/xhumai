import { logUsage } from '../../backend/utils/logger';

/**
 * Yield Extractor Capability
 * Surfaces yields, returns on effort, diminishing returns, and low-yield activities
 * so further investment stops and capacity permanently returns to living more.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - enough-extractor     → finish lines and stop conditions
 * - completion-extractor → closed loops that stop taxing attention
 * - reclaim-extractor    → specific hours that can come back
 * - yield-extractor      → the return rate that tells you when to stop investing
 */

export interface YieldItem {
  item: string;
  type?: 'high-yield' | 'diminishing' | 'low-yield' | 'unknown';
  note?: string;
}

export interface YieldResult {
  yields: YieldItem[];
  gaps: string[];
}

export async function runYieldExtractor(input: string): Promise<YieldResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract yield signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const yieldPatterns = [
      /\b(yield|return|roi|payoff|diminishing|enough|stop|quit|drop|low value|not worth)\b/i,
      /\b(further|more time|additional|keep going|continue)\b/i,
    ];

    const highHints = /\b(high|compound|leverage|multiplier|pays|worth)\b/i;
    const dimHints = /\b(diminishing|less return|plateau|not as much)\b/i;
    const lowHints = /\b(low|not worth|waste|busywork|minimal)\b/i;
    const gapHints = /\b(no idea|unclear yield|don't know if)\b/i;

    const yields: YieldItem[] = [];
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

      if (yieldPatterns.some(p => p.test(cleaned))) {
        let type: YieldItem['type'] = 'unknown';
        if (highHints.test(cleaned)) type = 'high-yield';
        else if (dimHints.test(cleaned)) type = 'diminishing';
        else if (lowHints.test(cleaned)) type = 'low-yield';

        if (!yields.some(y => y.item === cleaned)) {
          yields.push({
            item: cleaned,
            type,
            note:
              type === 'high-yield'
                ? 'High yield — protect and compound this'
                : type === 'diminishing'
                  ? 'Diminishing returns — consider stopping further investment'
                  : type === 'low-yield'
                    ? 'Low yield — drop or radically reduce so capacity returns to life'
                    : 'Yield candidate — what is the actual return on this effort?',
          });
        }
      }
    }

    if (yields.length === 0) {
      gaps.push('No explicit yield signals found — returns on effort remain invisible');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          yields.push({
            item: line,
            type: 'unknown',
            note: 'Candidate for yield review — is further effort compounding or depleting?',
          });
        }
      }
    }

    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'yield-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { yields, gaps };
  } catch (error: any) {
    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'yield-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });
    throw error;
  }
}
