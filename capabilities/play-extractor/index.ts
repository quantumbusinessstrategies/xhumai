import { logUsage } from '../../backend/utils/logger';

/**
 * Play Extractor Capability
 * Surfaces sources of play, joy, delight, and non-productive pleasure
 * so reclaimed capacity is invested in actual living more, not optimized work.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - vitality-extractor   → life-force sources
 * - presence-extractor   → moments of aliveness
 * - rest-extractor       → protected non-work time
 * - margin-extractor     → unscheduled space
 * - play-extractor       → the living that makes the capacity worth reclaiming
 */

export interface PlayItem {
  item: string;
  type?: 'play' | 'joy' | 'delight' | 'hobby' | 'social' | 'unknown';
  potency?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface PlayResult {
  plays: PlayItem[];
  gaps: string[];
}

export async function runPlayExtractor(input: string): Promise<PlayResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract play signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const playPatterns = [
      /\b(play|playing|fun|enjoy|enjoying|joy|delight|pleasure|hobby|game|games)\b/i,
      /\b(laugh|laughter|smile|happy|happiness|lighthearted|spontaneous)\b/i,
      /\b(music|art|create|creating|dance|sport|hobby|craft|cook|garden)\b/i,
      /\b(friends|social|gather|party|together|kids|children|family time)\b/i,
      /\b(wander|explore|adventure|curious|wonder)\b/i,
    ];

    const playHints = /\b(play|game|fun|sport|hobby)\b/i;
    const joyHints = /\b(joy|delight|pleasure|happy|laugh)\b/i;
    const hobbyHints = /\b(hobby|craft|music|art|garden|cook)\b/i;
    const socialHints = /\b(friends|social|gather|party|together)\b/i;
    const highHints = /\b(deeply|fully|essential|must|love|favorite|core)\b/i;
    const lowHints = /\b(sometimes|occasionally|try|maybe|wish)\b/i;
    const gapHints = /\b(no time|too busy|no fun|all work|neglected|burned out|exhausted|serious)\b/i;

    const plays: PlayItem[] = [];
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

      if (playPatterns.some(p => p.test(cleaned))) {
        let type: PlayItem['type'] = 'unknown';
        if (playHints.test(cleaned)) type = 'play';
        else if (joyHints.test(cleaned)) type = 'joy';
        else if (hobbyHints.test(cleaned)) type = 'hobby';
        else if (socialHints.test(cleaned)) type = 'social';

        let potency: PlayItem['potency'] = 'medium';
        if (highHints.test(cleaned)) potency = 'high';
        else if (lowHints.test(cleaned)) potency = 'low';

        if (!plays.some(p => p.item === cleaned)) {
          plays.push({
            item: cleaned,
            type,
            potency,
            note:
              type === 'play'
                ? 'Play that returns life-force — protect the slot'
                : type === 'joy'
                  ? 'Delight that makes capacity worth reclaiming'
                  : type === 'hobby'
                    ? 'Hobby that compounds into living'
                    : type === 'social'
                      ? 'Connection through play — high-return living'
                      : 'Play signal — invest reclaimed time here',
          });
        }
      }
    }

    if (plays.length === 0) {
      gaps.push('No explicit play or delight source found — reclaimed capacity has nowhere playful to land');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          plays.push({
            item: line,
            type: 'unknown',
            potency: 'low',
            note: 'Candidate for play investment — name the delight or drop the work',
          });
        }
      }
    }

    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'play-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { plays, gaps };
  } catch (error: any) {
    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'play-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });
    throw error;
  }
}
