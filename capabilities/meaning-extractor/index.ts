import { logUsage } from '../../backend/utils/logger';

/**
 * Meaning Extractor Capability
 * Surfaces what gives life meaning, purpose, fulfillment, and non-work significance
 * so reclaimed capacity is directed toward actual living more, not residual productivity.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - play-extractor       → joy and non-productive pleasure
 * - vitality-extractor   → health and life-force
 * - connection-extractor → relationships and belonging
 * - presence-extractor   → moments of aliveness
 * - meaning-extractor    → the deeper why that makes the capacity worth reclaiming
 */

export interface MeaningItem {
  item: string;
  type?: 'purpose' | 'fulfillment' | 'legacy' | 'value' | 'identity' | 'unknown';
  intensity?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface MeaningResult {
  meanings: MeaningItem[];
  gaps: string[];
}

export async function runMeaningExtractor(input: string): Promise<MeaningResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract meaning signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const meaningPatterns = [
      /\b(meaning|purpose|fulfill|why|matters|legacy|identity|values|significant|deeply)\b/i,
      /\b(live for|worth it|makes life|reason for|what I care)\b/i,
      /\b(beyond work|not just|more than productivity)\b/i,
    ];

    const purposeHints = /\b(purpose|why|reason|calling|mission)\b/i;
    const fulfillmentHints = /\b(fulfill|satisfaction|complete|whole|alive)\b/i;
    const legacyHints = /\b(legacy|leave behind|impact|contribution|remembered)\b/i;
    const valueHints = /\b(value|principle|believe|stand for|important to me)\b/i;
    const identityHints = /\b(who I am|identity|self|becoming|true self)\b/i;
    const highHints = /\b(deeply|most|core|everything|central)\b/i;
    const lowHints = /\b(sometimes|minor|occasional)\b/i;
    const gapHints = /\b(no purpose|meaningless|just work|empty|why bother)\b/i;

    const meanings: MeaningItem[] = [];
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

      if (meaningPatterns.some(p => p.test(cleaned))) {
        let type: MeaningItem['type'] = 'unknown';
        if (purposeHints.test(cleaned)) type = 'purpose';
        else if (fulfillmentHints.test(cleaned)) type = 'fulfillment';
        else if (legacyHints.test(cleaned)) type = 'legacy';
        else if (valueHints.test(cleaned)) type = 'value';
        else if (identityHints.test(cleaned)) type = 'identity';

        let intensity: MeaningItem['intensity'] = 'medium';
        if (highHints.test(cleaned)) intensity = 'high';
        else if (lowHints.test(cleaned)) intensity = 'low';

        if (!meanings.some(m => m.item === cleaned)) {
          meanings.push({
            item: cleaned,
            type,
            intensity,
            note:
              type === 'purpose'
                ? 'Core purpose signal — this is why the capacity is worth reclaiming'
                : type === 'fulfillment'
                  ? 'Fulfillment source — invest reclaimed time here for living more'
                  : type === 'legacy'
                    ? 'Legacy or impact — longer arc that compounds beyond the workday'
                    : type === 'value'
                      ? 'Personal value — align capacity with what actually matters'
                      : 'Meaning signal — surface the deeper why so living more is intentional',
          });
        }
      }
    }

    if (meanings.length === 0) {
      gaps.push('No explicit meaning signals found — purpose remains implicit');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          meanings.push({
            item: line,
            type: 'unknown',
            intensity: 'medium',
            note: 'Candidate for meaning review — does this point to what makes life worth living?',
          });
        }
      }
    }

    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'meaning-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { meanings, gaps };
  } catch (error: any) {
    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'meaning-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });
    throw error;
  }
}
