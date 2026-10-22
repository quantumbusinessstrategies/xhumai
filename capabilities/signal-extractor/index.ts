import { logUsage } from '../../backend/utils/logger';

/**
 * Signal Extractor Capability
 * Surfaces high-signal information, decisions, and actions versus noise,
 * low-value updates, and distractions so attention compounds and capacity
 * returns to living more.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - attention-extractor → where attention is allocated
 * - elimination-extractor → work that should not exist
 * - priority-sorter → rank what remains
 * - compound-extractor → moves that keep producing
 */

export interface SignalItem {
  item: string;
  type?: 'signal' | 'noise' | 'unknown';
  leverage?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface SignalResult {
  signals: SignalItem[];
  gaps: string[];
}

export async function runSignalExtractor(input: string): Promise<SignalResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract signal');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const signalPatterns = [
      /\b(signal|high.?signal|important|critical|decision|must|only|key|core|leverage|compound)\b/i,
      /\b(ignore|noise|low.?value|fyi|update|status|busywork|distraction|notification)\b/i,
    ];

    const signalHints = /\b(decision|must do|only|core|key|leverage|compound|high signal)\b/i;
    const noiseHints = /\b(noise|ignore|fyi|status update|busywork|low value|distraction)\b/i;
    const highHints = /\b(critical|must|only|compound|forever|always)\b/i;
    const lowHints = /\b(minor|sometimes|fyi|quick)\b/i;
    const gapHints = /\b(too much noise|can't tell|overwhelmed by updates)\b/i;

    const signals: SignalItem[] = [];
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

      if (signalPatterns.some(p => p.test(cleaned))) {
        let type: SignalItem['type'] = 'unknown';
        if (signalHints.test(cleaned)) type = 'signal';
        else if (noiseHints.test(cleaned)) type = 'noise';

        let leverage: SignalItem['leverage'] = 'medium';
        if (highHints.test(cleaned)) leverage = 'high';
        else if (lowHints.test(cleaned)) leverage = 'low';

        if (!signals.some(s => s.item === cleaned)) {
          signals.push({
            item: cleaned,
            type,
            leverage,
            note:
              type === 'signal'
                ? 'High-signal item — protect attention here so it compounds'
                : type === 'noise'
                  ? 'Noise candidate — ignore, batch, or eliminate so capacity returns'
                  : 'Signal/noise candidate — does this deserve attention?',
          });
        }
      }
    }

    if (signals.length === 0) {
      gaps.push('No explicit signal/noise distinction found — attention may be spread thin');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          signals.push({
            item: line,
            type: 'unknown',
            leverage: 'medium',
            note: 'Candidate for signal review — is this high-signal or noise?',
          });
        }
      }
    }

    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'signal-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { signals, gaps };
  } catch (error: any) {
    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'signal-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });
    throw error;
  }
}
