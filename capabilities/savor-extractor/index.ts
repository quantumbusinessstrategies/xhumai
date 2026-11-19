import { logUsage } from '../../backend/utils/logger';

/**
 * Savor Extractor Capability
 * Surfaces opportunities to savor, linger, taste fully, and inhabit reclaimed time
 * so living more is not rushed through but actually experienced.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - gratitude-extractor  → what is already good
 * - delight-extractor    → small pleasures
 * - stillness-extractor  → quiet non-doing
 * - savor-extractor      → the deliberate lingering that turns capacity into lived experience
 */

export interface SavorItem {
  item: string;
  type?: 'lingering' | 'taste' | 'ritual' | 'moment' | 'unknown';
  depth?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface SavorResult {
  savors: SavorItem[];
  gaps: string[];
}

export async function runSavorExtractor(input: string): Promise<SavorResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract savor signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const savorPatterns = [
      /\b(savor|savour|linger|taste|enjoy|relish|dwell|pause|slow down|take time)\b/i,
      /\b(moment|present|here|now|fully|completely|inhabit|experience)\b/i,
      /\b(coffee|meal|walk|sunset|conversation|music|breath|view)\b/i,
    ];

    const lingeringHints = /\b(linger|dwell|stay|pause|slow|unhurried)\b/i;
    const tasteHints = /\b(taste|savor|relish|enjoy|appreciate fully)\b/i;
    const ritualHints = /\b(ritual|practice|habit|every|daily|morning|evening)\b/i;
    const momentHints = /\b(moment|when|felt|suddenly|this|yesterday|today)\b/i;
    const highHints = /\b(always|every|must|essential|core|deep|full|completely)\b/i;
    const lowHints = /\b(sometimes|maybe|if time|wish|once|almost|rarely)\b/i;
    const gapHints = /\b(rush|hurry|no time|next thing|optimize|productive|busy|skip|missed)\b/i;

    const savors: SavorItem[] = [];
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

      if (savorPatterns.some(p => p.test(cleaned))) {
        let type: SavorItem['type'] = 'unknown';
        if (lingeringHints.test(cleaned)) type = 'lingering';
        else if (tasteHints.test(cleaned)) type = 'taste';
        else if (ritualHints.test(cleaned)) type = 'ritual';
        else if (momentHints.test(cleaned)) type = 'moment';

        let depth: SavorItem['depth'] = 'medium';
        if (highHints.test(cleaned)) depth = 'high';
        else if (lowHints.test(cleaned)) depth = 'low';

        if (!savors.some(s => s.item === cleaned)) {
          savors.push({
            item: cleaned,
            type,
            depth,
            note:
              type === 'lingering'
                ? 'Lingering opportunity — protect the unhurried space so reclaimed capacity is inhabited'
                : type === 'taste'
                  ? 'Full tasting — the signal that living more requires slowing enough to experience it'
                  : type === 'ritual'
                    ? 'Savor ritual — make the lingering non-negotiable so living more compounds'
                    : type === 'moment'
                      ? 'Savorable moment — recreate the conditions so presence is the default'
                      : 'Savor signal — name it so reclaimed hours become lived experience rather than residual time',
          });
        }
      }
    }

    if (savors.length === 0) {
      gaps.push('No explicit savor / lingering / full-experience signals found — reclaimed capacity may stay uninhabited');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          savors.push({
            item: line,
            type: 'unknown',
            depth: 'low',
            note: 'Candidate for savoring — name what deserves lingering or living more stays a slogan',
          });
        }
      }
    }

    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'savor-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { savors, gaps };
  } catch (error: any) {
    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'savor-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });
    throw error;
  }
}
