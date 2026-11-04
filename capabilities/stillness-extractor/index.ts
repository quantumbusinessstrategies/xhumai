import { logUsage } from '../../backend/utils/logger';

/**
 * Stillness Extractor Capability
 * Surfaces conditions of quiet, unscheduled space, absence of input, and deliberate non-doing
 * so reclaimed capacity can be inhabited rather than immediately refilled with more work.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - rest-extractor        → recovery and non-work time
 * - margin-extractor      → buffers and slack
 * - presence-extractor    → moments of aliveness
 * - play-extractor        → joy and non-productive pleasure
 * - stillness-extractor   → the empty space that lets living actually occur
 */

export interface StillnessItem {
  item: string;
  type?: 'quiet' | 'unscheduled' | 'absence' | 'non-doing' | 'space' | 'unknown';
  potency?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface StillnessResult {
  stillnesses: StillnessItem[];
  gaps: string[];
}

export async function runStillnessExtractor(input: string): Promise<StillnessResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract stillness signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const stillnessPatterns = [
      /\b(quiet|silence|still|stillness|calm|peace|empty|space|gap|pause|nothing)\b/i,
      /\b(unscheduled|free time|open|blank|idle|do nothing|non-doing|rest of the day)\b/i,
      /\b(no meeting|no input|phone off|offline|disconnect|alone time)\b/i,
      /\b(morning quiet|evening quiet|before the day|after everything)\b/i,
    ];

    const quietHints = /\b(quiet|silence|still|calm|peace)\b/i;
    const unscheduledHints = /\b(unscheduled|free|open|blank|idle)\b/i;
    const absenceHints = /\b(nothing|no|off|offline|disconnect|absence)\b/i;
    const nonDoingHints = /\b(do nothing|non-doing|pause|gap|space)\b/i;
    const highHints = /\b(protected|sacred|non-negotiable|must|essential|core)\b/i;
    const lowHints = /\b(sometimes|maybe|if time|wish|leftover)\b/i;
    const gapHints = /\b(always on|never stop|constant|filled|packed|no space|busy|full)\b/i;

    const stillnesses: StillnessItem[] = [];
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

      if (stillnessPatterns.some(p => p.test(cleaned))) {
        let type: StillnessItem['type'] = 'unknown';
        if (quietHints.test(cleaned)) type = 'quiet';
        else if (unscheduledHints.test(cleaned)) type = 'unscheduled';
        else if (absenceHints.test(cleaned)) type = 'absence';
        else if (nonDoingHints.test(cleaned)) type = 'non-doing';

        let potency: StillnessItem['potency'] = 'medium';
        if (highHints.test(cleaned)) potency = 'high';
        else if (lowHints.test(cleaned)) potency = 'low';

        if (!stillnesses.some(s => s.item === cleaned)) {
          stillnesses.push({
            item: cleaned,
            type,
            potency,
            note:
              type === 'quiet'
                ? 'Protected quiet — defend it so capacity can be inhabited'
                : type === 'unscheduled'
                  ? 'Open space — do not fill it by default'
                  : type === 'absence'
                    ? 'Absence of demand — the condition for living more'
                    : type === 'non-doing'
                      ? 'Deliberate non-doing — living is not another task'
                      : 'Stillness signal — name it and protect the space',
          });
        }
      }
    }

    if (stillnesses.length === 0) {
      gaps.push('No explicit stillness or unscheduled space found — reclaimed capacity risks being immediately refilled');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          stillnesses.push({
            item: line,
            type: 'unknown',
            potency: 'low',
            note: 'Candidate for stillness — name a protected empty space or the capacity stays abstract',
          });
        }
      }
    }

    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'stillness-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { stillnesses, gaps };
  } catch (error: any) {
    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'stillness-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });
    throw error;
  }
}
