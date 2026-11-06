import { logUsage } from '../../backend/utils/logger';

/**
 * Leisure Extractor Capability
 * Surfaces sources of leisure, unstructured time, hobbies, and non-work activities
 * so reclaimed capacity is invested in actual living more rather than optimized work.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - play-extractor        → joy and non-productive pleasure
 * - rest-extractor        → recovery and non-work time
 * - presence-extractor    → moments of aliveness
 * - wonder-extractor      → quality of attention
 * - leisure-extractor     → the unstructured space where living happens without agenda
 */

export interface LeisureItem {
  item: string;
  type?: 'hobby' | 'unstructured' | 'social' | 'solitary' | 'creative' | 'unknown';
  potency?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface LeisureResult {
  leisures: LeisureItem[];
  gaps: string[];
}

export async function runLeisureExtractor(input: string): Promise<LeisureResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract leisure signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const leisurePatterns = [
      /\b(leisure|hobby|hobbies|unstructured|free time|downtime|pastime)\b/i,
      /\b(read|reading|garden|gardening|cook|cooking|walk|walking|music|paint|painting)\b/i,
      /\b(game|gaming|sport|sports|craft|crafting|travel|explore)\b/i,
      /\b(do nothing|nothing planned|no agenda|just be)\b/i,
    ];

    const hobbyHints = /\b(hobby|hobbies|pastime|craft|sport)\b/i;
    const unstructuredHints = /\b(unstructured|free time|downtime|nothing planned|no agenda)\b/i;
    const socialHints = /\b(friends|family|social|together|gather)\b/i;
    const solitaryHints = /\b(alone|solitary|solo|quiet)\b/i;
    const creativeHints = /\b(create|creative|paint|write|music|art)\b/i;
    const highHints = /\b(must|essential|core|always|every|sacred|non-negotiable)\b/i;
    const lowHints = /\b(sometimes|maybe|if time|wish|leftover|once)\b/i;
    const gapHints = /\b(no time|too busy|never stop|constant|filled|packed|no space|optimized|no leisure)\b/i;

    const leisures: LeisureItem[] = [];
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

      if (leisurePatterns.some(p => p.test(cleaned))) {
        let type: LeisureItem['type'] = 'unknown';
        if (hobbyHints.test(cleaned)) type = 'hobby';
        else if (unstructuredHints.test(cleaned)) type = 'unstructured';
        else if (socialHints.test(cleaned)) type = 'social';
        else if (solitaryHints.test(cleaned)) type = 'solitary';
        else if (creativeHints.test(cleaned)) type = 'creative';

        let potency: LeisureItem['potency'] = 'medium';
        if (highHints.test(cleaned)) potency = 'high';
        else if (lowHints.test(cleaned)) potency = 'low';

        if (!leisures.some(l => l.item === cleaned)) {
          leisures.push({
            item: cleaned,
            type,
            potency,
            note:
              type === 'hobby'
                ? 'Hobby — protect the recurring non-work practice so capacity lands in living'
                : type === 'unstructured'
                  ? 'Unstructured time — the empty space that lets living occur without agenda'
                  : type === 'social'
                    ? 'Social leisure — belonging that compounds into living more'
                    : type === 'solitary'
                      ? 'Solitary leisure — quiet non-doing that restores presence'
                      : type === 'creative'
                        ? 'Creative leisure — non-productive making that returns aliveness'
                        : 'Leisure signal — name the source so reclaimed hours are invested in actual living',
          });
        }
      }
    }

    if (leisures.length === 0) {
      gaps.push('No explicit leisure, hobbies, or unstructured time found — reclaimed capacity risks remaining abstract');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          leisures.push({
            item: line,
            type: 'unknown',
            potency: 'low',
            note: 'Candidate for leisure — name a hobby or unstructured practice or the capacity stays abstract',
          });
        }
      }
    }

    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'leisure-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { leisures, gaps };
  } catch (error: any) {
    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'leisure-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });
    throw error;
  }
}
