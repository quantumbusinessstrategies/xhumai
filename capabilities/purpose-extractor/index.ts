import { logUsage } from '../../backend/utils/logger';

/**
 * Purpose Extractor Capability
 * Surfaces sources of meaning, purpose, core why's, and life-aligned goals
 * so effort is directed toward living more rather than empty productivity.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - connection-extractor → the people that make living more worth it
 * - play-extractor        → joy and non-productive pleasure
 * - vitality-extractor    → life-force sources
 * - presence-extractor    → moments of aliveness
 * - purpose-extractor     → the deeper why that makes the capacity worth reclaiming
 */

export interface PurposeItem {
  item: string;
  type?: 'core-why' | 'value' | 'goal' | 'mission' | 'legacy' | 'unknown';
  potency?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface PurposeResult {
  purposes: PurposeItem[];
  gaps: string[];
}

export async function runPurposeExtractor(input: string): Promise<PurposeResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract purpose signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const purposePatterns = [
      /\b(purpose|why|meaning|mission|vision|legacy|impact|matter|matters)\b/i,
      /\b(value|values|principle|principles|belief|beliefs|important)\b/i,
      /\b(goal|aim|objective|dream|aspiration|want to|live for)\b/i,
      /\b(fulfill|fulfillment|aligned|alignment|calling|contribution)\b/i,
      /\b(family|kids|children|future|generations|world)\b/i,
    ];

    const coreWhyHints = /\b(why|purpose|meaning|calling|live for)\b/i;
    const valueHints = /\b(value|values|principle|important|matters)\b/i;
    const goalHints = /\b(goal|aim|dream|aspiration|want to)\b/i;
    const missionHints = /\b(mission|vision|impact|contribution)\b/i;
    const highHints = /\b(core|deep|essential|must|primary|true|real)\b/i;
    const lowHints = /\b(sometimes|maybe|should|wish|vague)\b/i;
    const gapHints = /\b(empty|meaningless|no purpose|just working|busy|pointless|lost)\b/i;

    const purposes: PurposeItem[] = [];
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

      if (purposePatterns.some(p => p.test(cleaned))) {
        let type: PurposeItem['type'] = 'unknown';
        if (coreWhyHints.test(cleaned)) type = 'core-why';
        else if (valueHints.test(cleaned)) type = 'value';
        else if (goalHints.test(cleaned)) type = 'goal';
        else if (missionHints.test(cleaned)) type = 'mission';

        let potency: PurposeItem['potency'] = 'medium';
        if (highHints.test(cleaned)) potency = 'high';
        else if (lowHints.test(cleaned)) potency = 'low';

        if (!purposes.some(p => p.item === cleaned)) {
          purposes.push({
            item: cleaned,
            type,
            potency,
            note:
              type === 'core-why'
                ? 'Core purpose — protect time and energy for this'
                : type === 'value'
                  ? 'Guiding value — align decisions to it'
                  : type === 'goal'
                    ? 'Aspirational goal — make it concrete and schedule it'
                    : type === 'mission'
                      ? 'Larger contribution — compound capacity toward it'
                      : 'Purpose signal — clarify and invest reclaimed capacity here',
          });
        }
      }
    }

    if (purposes.length === 0) {
      gaps.push('No explicit purpose or meaning signal found — reclaimed capacity has no clear why to land in');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          purposes.push({
            item: line,
            type: 'unknown',
            potency: 'low',
            note: 'Candidate for purpose clarification — name the deeper why or drop the empty motion',
          });
        }
      }
    }

    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'purpose-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { purposes, gaps };
  } catch (error: any) {
    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'purpose-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });
    throw error;
  }
}
