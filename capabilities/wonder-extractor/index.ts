import { logUsage } from '../../backend/utils/logger';

/**
 * Wonder Extractor Capability
 * Surfaces sources of wonder, awe, curiosity, and moments of aliveness-through-attention
 * so reclaimed capacity is directed toward actual living more rather than optimized work.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - play-extractor        → joy and non-productive pleasure
 * - presence-extractor    → moments of aliveness
 * - purpose-extractor     → meaning and core why's
 * - stillness-extractor   → empty space that lets living occur
 * - wonder-extractor      → the quality of attention that makes living more vivid
 */

export interface WonderItem {
  item: string;
  type?: 'awe' | 'curiosity' | 'beauty' | 'mystery' | 'delight' | 'unknown';
  potency?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface WonderResult {
  wonders: WonderItem[];
  gaps: string[];
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
      /\b(wonder|awe|amazing|curious|curiosity|beauty|beautiful|mystery|mysterious)\b/i,
      /\b(delight|marvel|astonished|stunned|wow|breathtaking|sublime)\b/i,
      /\b(nature|stars|ocean|forest|sunset|sky|art|music|child)\b/i,
      /\b(question|why|how does|what if|explore|discover)\b/i,
    ];

    const aweHints = /\b(awe|amazing|breathtaking|sublime|stunned|marvel)\b/i;
    const curiosityHints = /\b(curious|curiosity|question|why|how does|explore|discover)\b/i;
    const beautyHints = /\b(beauty|beautiful|nature|stars|ocean|forest|sunset|art)\b/i;
    const mysteryHints = /\b(mystery|mysterious|unknown|wonder)\b/i;
    const delightHints = /\b(delight|joy|wow)\b/i;
    const highHints = /\b(must|essential|core|always|every|sacred|non-negotiable)\b/i;
    const lowHints = /\b(sometimes|maybe|if time|wish|leftover|once)\b/i;
    const gapHints = /\b(no time|too busy|never stop|constant|filled|packed|no space|optimized)\b/i;

    const wonders: WonderItem[] = [];
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

      if (wonderPatterns.some(p => p.test(cleaned))) {
        let type: WonderItem['type'] = 'unknown';
        if (aweHints.test(cleaned)) type = 'awe';
        else if (curiosityHints.test(cleaned)) type = 'curiosity';
        else if (beautyHints.test(cleaned)) type = 'beauty';
        else if (mysteryHints.test(cleaned)) type = 'mystery';
        else if (delightHints.test(cleaned)) type = 'delight';

        let potency: WonderItem['potency'] = 'medium';
        if (highHints.test(cleaned)) potency = 'high';
        else if (lowHints.test(cleaned)) potency = 'low';

        if (!wonders.some(w => w.item === cleaned)) {
          wonders.push({
            item: cleaned,
            type,
            potency,
            note:
              type === 'awe'
                ? 'Awe signal — protect the conditions that produce it so capacity lands in living'
                : type === 'curiosity'
                  ? 'Curiosity — the attention that makes life vivid rather than managed'
                  : type === 'beauty'
                    ? 'Beauty — name it so reclaimed hours are invested in what is already alive'
                    : type === 'mystery'
                      ? 'Mystery — the open space that prevents living from becoming another optimization'
                      : type === 'delight'
                        ? 'Delight — non-productive pleasure that compounds into living more'
                        : 'Wonder signal — name the source so capacity returns to actual living',
          });
        }
      }
    }

    if (wonders.length === 0) {
      gaps.push('No explicit wonder, awe, or curiosity found — reclaimed capacity risks remaining abstract');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          wonders.push({
            item: line,
            type: 'unknown',
            potency: 'low',
            note: 'Candidate for wonder — name a source of awe or curiosity or the capacity stays abstract',
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

    return { wonders, gaps };
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
