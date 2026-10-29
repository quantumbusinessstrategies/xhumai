import { logUsage } from '../../backend/utils/logger';

/**
 * Stillness Extractor Capability
 * Surfaces moments, conditions, and opportunities for stillness, silence,
 * non-doing, and presence without productivity so reclaimed capacity
 * compounds into actual living more rather than being refilled with more work.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - presence-extractor → people, play, body, place
 * - rest-extractor     → recovery and non-work time
 * - margin-extractor   → unprotected open blocks
 * - aliveness-extractor → what makes life feel alive
 * - stillness-extractor → the quiet, non-doing that lets life be lived
 */

export interface StillnessItem {
  item: string;
  type?: 'silence' | 'non-doing' | 'presence' | 'gap' | 'ritual' | 'unknown';
  depth?: 'deep' | 'medium' | 'light';
  note?: string;
}

export interface StillnessResult {
  stillness: StillnessItem[];
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
      /\b(still|quiet|silence|pause|gap|empty|nothing|just be|non-doing|do nothing|sit|breathe|presence without)\b/i,
      /\b(no agenda|unstructured|open time|white space|margin|rest from doing)\b/i,
      /\b(walk without|sit without|listen without|be without)\b/i,
    ];

    const silenceHints = /\b(silence|quiet|still|hush|no sound|no noise)\b/i;
    const nonDoingHints = /\b(nothing|do nothing|non-doing|stop doing|not productive|no output)\b/i;
    const presenceHints = /\b(present|here|now|aware|notice|just be)\b/i;
    const gapHints = /\b(gap|pause|between|transition|white space|open block)\b/i;
    const ritualHints = /\b(morning|evening|ritual|practice|habit of still)\b/i;
    const deepHints = /\b(deep|long|hours of|extended|real silence)\b/i;
    const lightHints = /\b(brief|quick|moment|minute)\b/i;
    const missingHints = /\b(no time to|always doing|can't stop|no stillness|never quiet)\b/i;

    const stillness: StillnessItem[] = [];
    const gaps: string[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (missingHints.test(cleaned) && !gaps.includes(cleaned)) {
        gaps.push(cleaned);
      }

      if (stillnessPatterns.some(p => p.test(cleaned))) {
        let type: StillnessItem['type'] = 'unknown';
        if (silenceHints.test(cleaned)) type = 'silence';
        else if (nonDoingHints.test(cleaned)) type = 'non-doing';
        else if (presenceHints.test(cleaned)) type = 'presence';
        else if (gapHints.test(cleaned)) type = 'gap';
        else if (ritualHints.test(cleaned)) type = 'ritual';

        let depth: StillnessItem['depth'] = 'medium';
        if (deepHints.test(cleaned)) depth = 'deep';
        else if (lightHints.test(cleaned)) depth = 'light';

        if (!stillness.some(s => s.item === cleaned)) {
          stillness.push({
            item: cleaned,
            type,
            depth,
            note:
              type === 'silence'
                ? 'Silence available — protect it so presence can deepen'
                : type === 'non-doing'
                  ? 'Non-doing window — leave it empty so life can enter'
                  : type === 'presence'
                    ? 'Presence without agenda — the point of reclaimed capacity'
                    : type === 'gap'
                      ? 'Natural gap — do not fill it with the next task'
                      : type === 'ritual'
                        ? 'Stillness ritual — design it so living more is not accidental'
                        : 'Stillness candidate — what can remain unfilled?',
          });
        }
      }
    }

    if (stillness.length === 0) {
      gaps.push('No explicit stillness signals found — capacity is likely being refilled by default');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          stillness.push({
            item: line,
            type: 'unknown',
            depth: 'medium',
            note: 'Candidate for stillness review — where can non-doing live?',
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

    return { stillness, gaps };
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
