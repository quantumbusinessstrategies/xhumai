import { logUsage } from '../../backend/utils/logger';

/**
 * Play Extractor Capability
 * Surfaces moments of play, fun, unstructured joy, creative play, games,
 * and activities done for their own sake so reclaimed hours have a destination
 * of actual living more — not merely less work.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - presence-extractor  → people, body, place, unstructured time
 * - aliveness-extractor → what makes life feel fully lived
 * - wonder-extractor    → awe, curiosity, expansive discovery
 * - rest-extractor      → recovery and non-work time
 * - play-extractor      → the active, joyful use of reclaimed capacity
 */

export interface PlayItem {
  item: string;
  kind?: 'play' | 'fun' | 'creative' | 'game' | 'unstructured' | 'missing' | 'unknown';
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
      /\b(play|playing|fun|joy|enjoy|laugh|laughter|game|games|hobby|hobbies|creative|create|draw|music|dance|explore|adventure|curiosity|wonder|delight|pleasure|spontaneous|unstructured)\b/i,
      /\b(just for fun|for the joy|no purpose|no goal|playful|playfulness|leisure|recreation)\b/i,
    ];

    const playHints = /\b(play|playing|game|games|hobby)\b/i;
    const funHints = /\b(fun|joy|enjoy|laugh|delight|pleasure)\b/i;
    const creativeHints = /\b(creative|create|draw|music|art|write|make)\b/i;
    const unstructuredHints = /\b(unstructured|spontaneous|no plan|wander|explore|curiosity)\b/i;
    const gapHints = /\b(no time for fun|too busy|all work|no play|haven't played|lost the joy|serious)\b/i;

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
        if (!plays.some(p => p.item === cleaned)) {
          let kind: PlayItem['kind'] = 'unknown';
          if (playHints.test(cleaned)) kind = 'play';
          else if (funHints.test(cleaned)) kind = 'fun';
          else if (creativeHints.test(cleaned)) kind = 'creative';
          else if (/\b(game|games)\b/i.test(cleaned)) kind = 'game';
          else if (unstructuredHints.test(cleaned)) kind = 'unstructured';

          plays.push({
            item: cleaned,
            kind,
            note:
              kind === 'play'
                ? 'Active play — keep it visible so capacity has somewhere alive to go'
                : kind === 'fun' || kind === 'creative'
                  ? 'Joy or creative play — a destination for reclaimed hours'
                  : kind === 'unstructured'
                    ? 'Unstructured time — protect it from being filled'
                    : 'Play signal — aim reclaimed capacity here',
          });
        }
      }
    }

    if (plays.length === 0) {
      gaps.push('No explicit play or joy signals found — reclaimed hours risk remaining empty or being refilled with more work');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          plays.push({
            item: line,
            kind: 'missing',
            note: 'Candidate for a play destination — name what living more looks like here',
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
