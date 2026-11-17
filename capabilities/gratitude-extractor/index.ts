import { logUsage } from '../../backend/utils/logger';

/**
 * Gratitude Extractor Capability
 * Surfaces sources of gratitude, appreciation, and what is already good
 * so reclaimed capacity is invested in recognition rather than more striving.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - enough-extractor     → what is already sufficient
 * - delight-extractor    → small pleasures
 * - aliveness-extractor  → felt sense of being alive
 * - gratitude-extractor  → the recognition that makes living more vivid without requiring more input
 */

export interface GratitudeItem {
  item: string;
  type?: 'appreciation' | 'already-good' | 'relationship' | 'moment' | 'unknown';
  depth?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface GratitudeResult {
  gratitudes: GratitudeItem[];
  gaps: string[];
}

export async function runGratitudeExtractor(input: string): Promise<GratitudeResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract gratitude signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const gratitudePatterns = [
      /\b(grateful|gratitude|appreciate|thankful|blessed|lucky|fortunate)\b/i,
      /\b(already|have|enough|good|love|friend|family|health|home)\b/i,
      /\b(thank|thanks|appreciation|recognition|value)\b/i,
    ];

    const appreciationHints = /\b(appreciate|grateful|thankful|thank)\b/i;
    const alreadyGoodHints = /\b(already|have|enough|sufficient|good as is)\b/i;
    const relationshipHints = /\b(friend|family|partner|people|community|love)\b/i;
    const momentHints = /\b(moment|when|felt|realized|this morning|yesterday)\b/i;
    const highHints = /\b(deeply|always|every|core|essential|profound)\b/i;
    const lowHints = /\b(sometimes|maybe|if|wish|once)\b/i;
    const gapHints = /\b(not enough|need more|strive|hustle|never satisfied|lack|missing|want more)\b/i;

    const gratitudes: GratitudeItem[] = [];
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

      if (gratitudePatterns.some(p => p.test(cleaned))) {
        let type: GratitudeItem['type'] = 'unknown';
        if (appreciationHints.test(cleaned)) type = 'appreciation';
        else if (alreadyGoodHints.test(cleaned)) type = 'already-good';
        else if (relationshipHints.test(cleaned)) type = 'relationship';
        else if (momentHints.test(cleaned)) type = 'moment';

        let depth: GratitudeItem['depth'] = 'medium';
        if (highHints.test(cleaned)) depth = 'high';
        else if (lowHints.test(cleaned)) depth = 'low';

        if (!gratitudes.some(g => g.item === cleaned)) {
          gratitudes.push({
            item: cleaned,
            type,
            depth,
            note:
              type === 'appreciation'
                ? 'Appreciation — name it so reclaimed capacity lands in recognition rather than more acquisition'
                : type === 'already-good'
                  ? 'Already good — the signal that enough exists; protect it from being overwritten by striving'
                  : type === 'relationship'
                    ? 'Relational gratitude — capacity invested here multiplies living more without more work'
                    : type === 'moment'
                      ? 'Moment of gratitude — recreate the conditions so living more is habitual'
                      : 'Gratitude signal — invest reclaimed capacity here so Work Less. Live More. is not abstract',
          });
        }
      }
    }

    if (gratitudes.length === 0) {
      gaps.push('No explicit gratitude / appreciation signals found — living more may stay a future state instead of a present one');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          gratitudes.push({
            item: line,
            type: 'unknown',
            depth: 'low',
            note: 'Candidate for gratitude — name what is already good or the living stays residual',
          });
        }
      }
    }

    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'gratitude-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { gratitudes, gaps };
  } catch (error: any) {
    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'gratitude-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });
    throw error;
  }
}
