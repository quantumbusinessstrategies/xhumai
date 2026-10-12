import { logUsage } from '../../backend/utils/logger';

/**
 * Wonder Extractor Capability
 * Surfaces moments of wonder, awe, curiosity, discovery, and expansive experiences
 * so reclaimed capacity is directed toward a larger, more alive life.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - aliveness-extractor  → what makes life feel fully present
 * - presence-extractor   → people, play, body, place, unstructured time
 * - freedom-extractor    → moves that expand optionality
 * - wonder-extractor     → the awe and curiosity that make living more expansive
 */

export interface WonderItem {
  item: string;
  type?: 'awe' | 'curiosity' | 'discovery' | 'expanse' | 'unknown';
  intensity?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface WonderResult {
  wonder: WonderItem[];
  creed: 'Work Less. Live More.';
}

export async function runWonderExtractor(input: string): Promise<WonderResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract wonder signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const wonderPatterns = [
      /\b(wonder|awe|curious|curiosity|amazed|amazement|discover|discovery|explore|exploration)\b/i,
      /\b(vast|infinite|expansive|horizon|universe|cosmos|mystery|unknown|new)\b/i,
      /\b(beautiful|beauty|sublime|transcendent|magical|enchant|awe-inspiring)\b/i,
      /\b(learn something|question everything|what if|imagine|possibility|potential)\b/i,
      /\b(stargaze|sunrise|ocean|mountain|forest|art museum|concert|travel)\b/i,
    ];

    const aweHints = /\b(awe|amazed|sublime|transcendent|overwhelmed by beauty)\b/i;
    const curiosityHints = /\b(curious|curiosity|wonder|question|what if|explore)\b/i;
    const discoveryHints = /\b(discover|discovery|found|realized|learned|insight)\b/i;
    const expanseHints = /\b(vast|infinite|expansive|horizon|universe|bigger than|larger life)\b/i;
    const highHints = /\b(deeply|profoundly|completely|fully|pure|intense|overwhelming)\b/i;
    const lowHints = /\b(a bit|slightly|sometimes|occasional|mild)\b/i;

    const wonder: WonderItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (wonderPatterns.some(p => p.test(cleaned))) {
        let type: WonderItem['type'] = 'unknown';
        if (aweHints.test(cleaned)) type = 'awe';
        else if (curiosityHints.test(cleaned)) type = 'curiosity';
        else if (discoveryHints.test(cleaned)) type = 'discovery';
        else if (expanseHints.test(cleaned)) type = 'expanse';

        let intensity: WonderItem['intensity'] = 'medium';
        if (highHints.test(cleaned)) intensity = 'high';
        else if (lowHints.test(cleaned)) intensity = 'low';

        if (!wonder.some(w => w.item === cleaned)) {
          wonder.push({
            item: cleaned,
            type,
            intensity,
            note:
              type === 'awe'
                ? 'Candidate moment of awe to protect and return to'
                : type === 'curiosity'
                  ? 'Candidate curiosity to follow so living expands'
                  : type === 'discovery'
                    ? 'Candidate discovery that enlarges the world'
                    : type === 'expanse'
                      ? 'Candidate for expansive living — schedule the bigger life'
                      : 'Wonder-relevant signal — protect or amplify for living more',
          });
        }
      }
    }

    if (wonder.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          wonder.push({
            item: line,
            type: 'unknown',
            intensity: 'medium',
            note: 'Candidate for wonder review — where is the awe?',
          });
        }
      }
    }

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'wonder-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { wonder, creed: 'Work Less. Live More.' };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'wonder-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
