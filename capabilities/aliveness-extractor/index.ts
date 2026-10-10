import { logUsage } from '../../backend/utils/logger';

/**
 * Aliveness Extractor Capability
 * Surfaces moments, practices, people, places, and signals that restore aliveness
 * so reclaimed hours are directed toward living more, not merely less work.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - energy-extractor     → drains vs restoratives
 * - presence-extractor   → people, play, body, place
 * - enough-extractor     → finish lines so work ends
 * - margin-extractor     → protected open blocks
 * - aliveness-extractor  → what actually makes the life feel alive
 */

export interface AlivenessItem {
  item: string;
  polarity?: 'alive' | 'numb' | 'mixed' | 'unknown';
  intensity?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface AlivenessResult {
  aliveness: AlivenessItem[];
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

    const alivePatterns = [
      /\b(alive|aliveness|vital|vitality|wonder|awe|joy|delight|play|presence|flow|lit up|on fire|fully here|this is living)\b/i,
      /\b(numb|dead|empty|going through the motions|zombie|checked out|gray|grey|mechanical|surviving)\b/i,
      /\b(makes me feel|when I|the moment I|I come alive|I lose myself|I forget time)\b/i,
    ];

    const aliveHints = /\b(alive|vital|wonder|awe|joy|delight|play|flow|lit up|on fire|fully here|come alive|forget time)\b/i;
    const numbHints = /\b(numb|dead|empty|motions|zombie|checked out|gray|grey|mechanical|surviving|nothing)\b/i;
    const highHints = /\b(extremely|deeply|completely|always|every time|most)\b/i;
    const lowHints = /\b(slightly|a bit|sometimes|occasionally|mild)\b/i;

    const aliveness: AlivenessItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (alivePatterns.some(p => p.test(cleaned))) {
        const alive = aliveHints.test(cleaned);
        const numb = numbHints.test(cleaned);
        let polarity: AlivenessItem['polarity'] = 'unknown';
        if (alive && numb) polarity = 'mixed';
        else if (alive) polarity = 'alive';
        else if (numb) polarity = 'numb';

        let intensity: AlivenessItem['intensity'] = 'medium';
        if (highHints.test(cleaned)) intensity = 'high';
        else if (lowHints.test(cleaned)) intensity = 'low';

        if (!aliveness.some(e => e.item === cleaned)) {
          aliveness.push({
            item: cleaned,
            polarity,
            intensity,
            note:
              polarity === 'alive'
                ? 'Candidate to protect, schedule, and expand'
                : polarity === 'numb'
                  ? 'Candidate to reduce or redesign so life returns'
                  : 'Aliveness-relevant signal',
          });
        }
      }
    }

    if (aliveness.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          aliveness.push({
            item: line,
            polarity: 'unknown',
            intensity: 'medium',
            note: 'Candidate for aliveness review',
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

    return { aliveness };
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
