import { logUsage } from '../../backend/utils/logger';

/**
 * Aliveness Extractor Capability
 * Surfaces moments, conditions, and practices of aliveness, vitality, and full presence
 * so reclaimed capacity is directed into actually living more rather than residual productivity.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - presence-extractor   → conditions of presence
 * - wonder-extractor     → sources of awe and curiosity
 * - vitality-extractor   → health and life-force restoratives
 * - play-extractor       → sources of joy and non-productive pleasure
 * - aliveness-extractor  → the felt sense of being fully alive so living more is not abstract
 */

export interface AlivenessItem {
  item: string;
  type?: 'moment' | 'practice' | 'condition' | 'relationship' | 'unknown';
  intensity?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface AlivenessResult {
  alivenesses: AlivenessItem[];
  gaps: string[];
}

export async function runAlivenessExtractor(input: string): Promise<AlivenessResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract aliveness signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const alivenessPatterns = [
      /\b(alive|aliveness|vital|vibrant|present|awake|engaged|flow|in the moment)\b/i,
      /\b(joy|delight|wonder|awe|curiosity|play|laughter|energy|spark)\b/i,
      /\b(nature|outdoors|movement|dance|music|art|creation|connection)\b/i,
    ];

    const momentHints = /\b(moment|when|felt|suddenly|realized|in that)\b/i;
    const practiceHints = /\b(practice|habit|routine|daily|walk|meditation|exercise)\b/i;
    const conditionHints = /\b(when|if|during|while|condition|environment|setting)\b/i;
    const relationshipHints = /\b(with|together|people|friend|family|partner|community)\b/i;
    const highHints = /\b(always|every|must|essential|core|deep|full|completely)\b/i;
    const lowHints = /\b(sometimes|maybe|if time|wish|once|almost|rarely)\b/i;
    const gapHints = /\b(numb|empty|going through motions|autopilot|burnout|exhausted|never stop|always working|no time)\b/i;

    const alivenesses: AlivenessItem[] = [];
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

      if (alivenessPatterns.some(p => p.test(cleaned))) {
        let type: AlivenessItem['type'] = 'unknown';
        if (momentHints.test(cleaned)) type = 'moment';
        else if (practiceHints.test(cleaned)) type = 'practice';
        else if (relationshipHints.test(cleaned)) type = 'relationship';
        else if (conditionHints.test(cleaned)) type = 'condition';

        let intensity: AlivenessItem['intensity'] = 'medium';
        if (highHints.test(cleaned)) intensity = 'high';
        else if (lowHints.test(cleaned)) intensity = 'low';

        if (!alivenesses.some(a => a.item === cleaned)) {
          alivenesses.push({
            item: cleaned,
            type,
            intensity,
            note:
              type === 'moment'
                ? 'Moment of aliveness — protect and repeat the conditions that produced it'
                : type === 'practice'
                  ? 'Practice that generates aliveness — make it non-negotiable so living more compounds'
                  : type === 'relationship'
                    ? 'Relational aliveness — capacity invested here multiplies living more'
                    : type === 'condition'
                      ? 'Condition for aliveness — recreate the environment so presence is default'
                      : 'Aliveness signal — name it so reclaimed capacity has a direction toward living more',
          });
        }
      }
    }

    if (alivenesses.length === 0) {
      gaps.push('No explicit aliveness / vitality / presence signals found — reclaimed capacity may stay abstract');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          alivenesses.push({
            item: line,
            type: 'unknown',
            intensity: 'low',
            note: 'Candidate for aliveness — name what makes you feel fully alive or living more stays a slogan',
          });
        }
      }
    }

    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'aliveness-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { alivenesses, gaps };
  } catch (error: any) {
    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'aliveness-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });
    throw error;
  }
}
