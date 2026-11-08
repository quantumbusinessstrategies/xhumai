import { logUsage } from '../../backend/utils/logger';

/**
 * Savor Extractor Capability
 * Surfaces moments, activities, and conditions of savoring and lingering appreciation
 * so reclaimed capacity is inhabited with quality presence rather than rushed through or immediately refilled.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - enough-extractor     → recognize sufficiency so striving quiets
 * - stillness-extractor  → protect non-doing
 * - delight-extractor    → unforced joy as destination
 * - wonder-extractor     → awe and curiosity
 * - savor-extractor      → linger in what is already good so living more is tasted, not just scheduled
 */

export interface SavorItem {
  item: string;
  type?: 'moment' | 'activity' | 'condition' | 'relationship' | 'unknown';
  potency?: 'high' | 'medium' | 'low';
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
      /\b(savor|savour|linger|appreciate|appreciation|taste|enjoy|relish|cherish)\b/i,
      /\b(slow down|take time|present|mindful|grateful|gratitude|notice|be with)\b/i,
      /\b(beautiful|delicious|warm|peaceful|simple pleasure|for its own sake)\b/i,
    ];

    const momentHints = /\b(moment|time|hour|afternoon|morning|evening|when)\b/i;
    const activityHints = /\b(walk|meal|coffee|read|listen|sit|watch|garden|cook)\b/i;
    const conditionHints = /\b(quiet|unhurried|no phone|outdoors|with someone|alone)\b/i;
    const highHints = /\b(always|every|must|essential|core|sacred|favorite|best)\b/i;
    const lowHints = /\b(sometimes|maybe|if time|wish|once|almost|rarely)\b/i;
    const gapHints = /\b(rush|hurry|busy|optimize|more|next|later|no time|skip)\b/i;

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
        if (momentHints.test(cleaned)) type = 'moment';
        else if (activityHints.test(cleaned)) type = 'activity';
        else if (conditionHints.test(cleaned)) type = 'condition';

        let potency: SavorItem['potency'] = 'medium';
        if (highHints.test(cleaned)) potency = 'high';
        else if (lowHints.test(cleaned)) potency = 'low';

        if (!savors.some(s => s.item === cleaned)) {
          savors.push({
            item: cleaned,
            type,
            potency,
            note:
              type === 'moment'
                ? 'Moment — name it so the urge to move on does not erase the living'
                : type === 'activity'
                  ? 'Activity — protect the unoptimized version so it remains a destination, not a task'
                  : type === 'condition'
                    ? 'Condition — keep the setting that makes savoring possible'
                    : 'Savor signal — linger here so reclaimed capacity is tasted rather than immediately refilled',
          });
        }
      }
    }

    if (savors.length === 0) {
      gaps.push('No explicit savor / linger / appreciate signals found — living may stay abstract');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          savors.push({
            item: line,
            type: 'unknown',
            potency: 'low',
            note: 'Candidate for savor — name what is already good enough to inhabit so capacity is not rushed past',
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
