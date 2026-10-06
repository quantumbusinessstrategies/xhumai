import { logUsage } from '../../backend/utils/logger';

/**
 * Rest Extractor Capability
 * Surfaces rest, recovery, and non-work time from free-form notes
 * so the hours a boundary protects are actually lived.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - boundary-extractor → lines that protect capacity
 * - freedom-extractor  → moves that compound into more life
 * - energy-extractor   → what drains vs restores
 * - rest-extractor     → the life those lines exist to hold
 */

export interface RestItem {
  item: string;
  type?: 'sleep' | 'recovery' | 'presence' | 'sabbath' | 'unknown';
  protected?: boolean;
  note?: string;
}

export interface RestResult {
  rests: RestItem[];
  gaps: string[];
}

export async function runRestExtractor(input: string): Promise<RestResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract rest signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const restPatterns = [
      /\b(rest|recover|recovery|sleep|nap|wind down|wind-down)\b/i,
      /\b(day off|weekend|sabbath|unplug|offline|no laptop|phone away)\b/i,
      /\b(walk|family|dinner|presence|nothing scheduled|empty calendar)\b/i,
      /\b(vacation|leave|pto|break|pause|stop work)\b/i,
      /\b(evening free|morning free|protected time|life block)\b/i,
    ];

    const gapPatterns = [
      /\b(no rest|never off|always on|no weekend|no day off|skip sleep|slept \d)\b/i,
      /\b(worked late|worked through|inbox at night|weekend work|no break)\b/i,
    ];

    const sleepHints = /\b(sleep|nap|bed|wind down|wind-down)\b/i;
    const recoveryHints = /\b(recover|recovery|break|pause|pto|leave|vacation)\b/i;
    const presenceHints = /\b(presence|family|dinner|walk|unplug|offline|phone away)\b/i;
    const sabbathHints = /\b(sabbath|day off|weekend|nothing scheduled|empty calendar)\b/i;

    const rests: RestItem[] = [];
    const gaps: string[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (gapPatterns.some(p => p.test(cleaned)) && !gaps.includes(cleaned)) {
        gaps.push(cleaned);
      }

      if (restPatterns.some(p => p.test(cleaned))) {
        let type: RestItem['type'] = 'unknown';
        if (sleepHints.test(cleaned)) type = 'sleep';
        else if (sabbathHints.test(cleaned)) type = 'sabbath';
        else if (presenceHints.test(cleaned)) type = 'presence';
        else if (recoveryHints.test(cleaned)) type = 'recovery';

        if (!rests.some(r => r.item === cleaned)) {
          rests.push({
            item: cleaned,
            type,
            protected: !/\b(skipped|missed|no|never|couldn't|could not)\b/i.test(cleaned),
            note:
              type === 'sleep'
                ? 'Recovery floor — protect before the day is scheduled'
                : type === 'sabbath'
                  ? 'Non-work span — the creed is false if this is negotiable'
                  : type === 'presence'
                    ? 'Lived time — this is what the hours are for'
                    : 'Rest signal — keep it on the calendar as life, not leftover',
          });
        }
      }
    }

    if (rests.length === 0 && gaps.length === 0) {
      gaps.push('No rest, recovery, or non-work time named — life is still the remainder after work');
    }

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'rest-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { rests, gaps };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'rest-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
