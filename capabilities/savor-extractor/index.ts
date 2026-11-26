import { logUsage } from '../../backend/utils/logger';

/**
 * Savor Extractor Capability
 * Surfaces moments, activities, and experiences that can be savored
 * so reclaimed capacity is invested in actual presence and living more rather than rushing through.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - presence-extractor   → moments of aliveness
 * - delight-extractor    → sources of delight
 * - leisure-extractor    → unstructured time
 * - enough-extractor     → what is already sufficient
 */

export interface SavorItem {
  item: string;
  type?: 'moment' | 'activity' | 'experience' | 'slow-down' | 'unknown';
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
      /\b(savor|savour|enjoy|appreciate|linger|slow down|take time|present|mindful|notice)\b/i,
      /\b(moment|pause|breathe|taste|feel|experience|delight in|relish)\b/i,
      /\b(rush|hurry|skip|miss|too fast|no time to enjoy|on to the next)\b/i,
    ];

    const momentHints = /\b(moment|pause|now|present|here)\b/i;
    const activityHints = /\b(activity|do|practice|walk|meal|conversation)\b/i;
    const experienceHints = /\b(experience|feel|notice|appreciate|relish)\b/i;
    const slowHints = /\b(slow|linger|take time|not rush|savor)\b/i;
    const gapHints = /\b(rush|hurry|too fast|no time|skip|miss|on to the next|don't enjoy)\b/i;

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
        if (slowHints.test(cleaned)) type = 'slow-down';
        else if (experienceHints.test(cleaned)) type = 'experience';
        else if (activityHints.test(cleaned)) type = 'activity';
        else if (momentHints.test(cleaned)) type = 'moment';

        if (!savors.some(s => s.item === cleaned)) {
          savors.push({
            item: cleaned,
            type,
            note:
              type === 'slow-down'
                ? 'Slow-down opportunity — protect it so reclaimed capacity is actually inhabited rather than rushed through'
                : type === 'experience'
                  ? 'Experience to savor — name it so presence compounds into living more'
                  : type === 'activity'
                    ? 'Activity that can be savored — leave room for it so life is not only productive'
                    : type === 'moment'
                      ? 'Moment to notice — surface it so living more is present rather than deferred'
                      : 'Savor signal — surface the chance to be present so reclaimed hours become lived hours',
          });
        }
      }
    }

    if (savors.length === 0) {
      gaps.push('No explicit savor signals found — capacity may still be rushed and living more remains deferred');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          savors.push({
            item: line,
            type: 'unknown',
            note: 'Candidate for savor review — check whether this can be slowed and inhabited rather than rushed',
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
