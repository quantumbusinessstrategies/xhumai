import { logUsage } from '../../backend/utils/logger';

/**
 * Delight Extractor Capability
 * Surfaces sources of delight, small pleasures, unearned joy, and moments of light
 * so reclaimed capacity is invested in actual living more rather than further optimization.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - play-extractor     → structured play and joy
 * - leisure-extractor  → unstructured free time
 * - wonder-extractor   → awe and curiosity
 * - enough-extractor   → sufficiency so striving quiets
 * - delight-extractor  → the small, specific delights that make the living vivid
 */

export interface DelightItem {
  item: string;
  type?: 'pleasure' | 'joy' | 'light' | 'unearned' | 'unknown';
  potency?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface DelightResult {
  delights: DelightItem[];
  gaps: string[];
}

export async function runDelightExtractor(input: string): Promise<DelightResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract delight signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const delightPatterns = [
      /\b(delight|pleasure|joy|happy|smile|laugh|light|bright|fun|enjoy|savor)\b/i,
      /\b(small pleasure|little joy|unearned|unexpected joy|moment of)\b/i,
      /\b(coffee|walk|sun|music|book|friend|laugh|play|rest|nature)\b/i,
    ];

    const pleasureHints = /\b(pleasure|savor|enjoy|taste|feel good)\b/i;
    const joyHints = /\b(joy|happy|smile|laugh|delight)\b/i;
    const lightHints = /\b(light|bright|warm|glow|spark)\b/i;
    const unearnedHints = /\b(unearned|unexpected|gift|surprise|free)\b/i;
    const highHints = /\b(every|always|core|must|sacred|essential|daily)\b/i;
    const lowHints = /\b(sometimes|maybe|if time|wish|once)\b/i;
    const gapHints = /\b(no time|too busy|optimize|productivity|hustle|no fun|serious|grind)\b/i;

    const delights: DelightItem[] = [];
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

      if (delightPatterns.some(p => p.test(cleaned))) {
        let type: DelightItem['type'] = 'unknown';
        if (pleasureHints.test(cleaned)) type = 'pleasure';
        else if (joyHints.test(cleaned)) type = 'joy';
        else if (lightHints.test(cleaned)) type = 'light';
        else if (unearnedHints.test(cleaned)) type = 'unearned';

        let potency: DelightItem['potency'] = 'medium';
        if (highHints.test(cleaned)) potency = 'high';
        else if (lowHints.test(cleaned)) potency = 'low';

        if (!delights.some(d => d.item === cleaned)) {
          delights.push({
            item: cleaned,
            type,
            potency,
            note:
              type === 'pleasure'
                ? 'Pleasure — name it so it is protected as living, not residual'
                : type === 'joy'
                  ? 'Joy — the capacity-returning signal; schedule or guard it'
                  : type === 'light'
                    ? 'Light — small bright moments that make the hours feel lived'
                    : type === 'unearned'
                      ? 'Unearned delight — the best kind; it does not require more work'
                      : 'Delight signal — invest reclaimed capacity here so living more is concrete',
          });
        }
      }
    }

    if (delights.length === 0) {
      gaps.push('No explicit delight / joy / pleasure signals found — living more may stay abstract');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          delights.push({
            item: line,
            type: 'unknown',
            potency: 'low',
            note: 'Candidate for delight — name the small joy or the living stays residual',
          });
        }
      }
    }

    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'delight-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { delights, gaps };
  } catch (error: any) {
    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'delight-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });
    throw error;
  }
}
