import { logUsage } from '../../backend/utils/logger';

/**
 * Yield Extractor Capability
 * Surfaces yields, returns on effort, diminishing returns, and low-yield activities
 * so further investment stops and capacity permanently returns to living more.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - leverage-extractor   → high-leverage systems
 * - elimination-extractor → low-value work to remove
 * - enough-extractor     → what is already sufficient
 * - reclaim-extractor    → recoverable hours
 */

export interface YieldItem {
  item: string;
  type?: 'high-yield' | 'diminishing' | 'low-yield' | 'zero-yield' | 'unknown';
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
      /\b(yield|return|roi|payoff|output|result|impact|leverage|compound)\b/i,
      /\b(diminishing|low yield|low return|not worth|waste|busywork|no impact)\b/i,
      /\b(high impact|high yield|worth it|pays off|multiplies)\b/i,
    ];

    const highHints = /\b(high|strong|compound|multiplies|big impact|worth the time)\b/i;
    const diminishingHints = /\b(diminishing|less and less|plateau|not as much|marginal)\b/i;
    const lowHints = /\b(low|little|minimal|barely|not worth|waste of)\b/i;
    const zeroHints = /\b(zero|none|no return|nothing comes|dead end)\b/i;
    const gapHints = /\b(keep doing|still|always|endless|no finish|more and more)\b/i;

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
        else if (diminishingHints.test(cleaned)) type = 'diminishing';
        else if (zeroHints.test(cleaned)) type = 'zero-yield';
        else if (lowHints.test(cleaned)) type = 'low-yield';

        if (!yields.some(y => y.item === cleaned)) {
          yields.push({
            item: cleaned,
            type,
            note:
              type === 'high-yield'
                ? 'High-yield activity — protect and prefer it so effort multiplies into living more'
                : type === 'diminishing'
                  ? 'Diminishing returns — stop further investment so capacity is not drained by marginal gains'
                  : type === 'low-yield'
                    ? 'Low-yield activity — eliminate or automate so the hours return permanently to life'
                    : type === 'zero-yield'
                      ? 'Zero-yield activity — remove it; it consumes capacity with no return toward living more'
                      : 'Yield signal — name the return so investment can stop when the living more is already available',
          });
        }
      }
    }

    if (yields.length === 0) {
      gaps.push('No explicit yield / return signals found — effort may still be optimized for motion instead of living more');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          yields.push({
            item: line,
            type: 'unknown',
            note: 'Candidate for yield review — measure the return or capacity stays trapped in low-yield work',
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
