import { logUsage } from '../../backend/utils/logger';

/**
 * Enough Extractor Capability
 * Surfaces what is already enough, completed, sufficient, or "good enough"
 * so unnecessary striving decreases and capacity permanently returns to living more.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - elimination-extractor → remove what should not exist
 * - simplicity-extractor  → reduce complexity
 * - rest-extractor        → protect non-work
 * - leisure-extractor     → invest in living
 * - enough-extractor      → recognize sufficiency so the drive to do more quiets
 */

export interface EnoughItem {
  item: string;
  type?: 'completed' | 'sufficient' | 'good-enough' | 'already-have' | 'unknown';
  potency?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface EnoughResult {
  enoughs: EnoughItem[];
  gaps: string[];
}

export async function runEnoughExtractor(input: string): Promise<EnoughResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract enough signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const enoughPatterns = [
      /\b(enough|sufficient|good enough|already|completed|done|finished|adequate)\b/i,
      /\b(don't need|no need|don't have to|stop|quit|pause|rest on)\b/i,
      /\b(satisfaction|content|grateful|have what|already have)\b/i,
    ];

    const completedHints = /\b(completed|done|finished|achieved|won)\b/i;
    const sufficientHints = /\b(sufficient|enough|adequate|plenty)\b/i;
    const goodEnoughHints = /\b(good enough|fine as is|doesn't need|no more)\b/i;
    const alreadyHints = /\b(already|have|own|possess)\b/i;
    const highHints = /\b(must|essential|core|always|every|sacred|non-negotiable|enough)\b/i;
    const lowHints = /\b(sometimes|maybe|if time|wish|leftover|once|almost)\b/i;
    const gapHints = /\b(more|better|optimize|improve|never enough|not enough|need more|striving|hustle|always)\b/i;

    const enoughs: EnoughItem[] = [];
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

      if (enoughPatterns.some(p => p.test(cleaned))) {
        let type: EnoughItem['type'] = 'unknown';
        if (completedHints.test(cleaned)) type = 'completed';
        else if (sufficientHints.test(cleaned)) type = 'sufficient';
        else if (goodEnoughHints.test(cleaned)) type = 'good-enough';
        else if (alreadyHints.test(cleaned)) type = 'already-have';

        let potency: EnoughItem['potency'] = 'medium';
        if (highHints.test(cleaned)) potency = 'high';
        else if (lowHints.test(cleaned)) potency = 'low';

        if (!enoughs.some(e => e.item === cleaned)) {
          enoughs.push({
            item: cleaned,
            type,
            potency,
            note:
              type === 'completed'
                ? 'Completed — name it as done so the mind stops treating it as open work'
                : type === 'sufficient'
                  ? 'Sufficient — this is enough; additional effort returns diminishing living'
                  : type === 'good-enough'
                    ? 'Good enough — protect the decision to stop optimizing'
                    : type === 'already-have'
                      ? 'Already have — capacity is not required to acquire more of this'
                      : 'Enough signal — recognize sufficiency so striving quiets and capacity returns to living more',
          });
        }
      }
    }

    if (enoughs.length === 0) {
      gaps.push('No explicit enough / sufficient / completed signals found — striving may continue by default');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          enoughs.push({
            item: line,
            type: 'unknown',
            potency: 'low',
            note: 'Candidate for enough — name what is already sufficient or the drive to do more stays default',
          });
        }
      }
    }

    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'enough-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { enoughs, gaps };
  } catch (error: any) {
    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'enough-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });
    throw error;
  }
}
