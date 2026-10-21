import { logUsage } from '../../backend/utils/logger';

/**
 * Delight Extractor Capability
 * Surfaces activities, moments, and conditions that produce unforced delight,
 * joy, and pleasure so reclaimed capacity has a positive destination of
 * actually living more — not merely the absence of work.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - play-extractor      → unstructured fun and activities done for their own sake
 * - presence-extractor  → moments of aliveness and being there
 * - aliveness-extractor → what makes life feel fully lived
 * - wonder-extractor    → awe and expansive curiosity
 * - delight-extractor   → the specific unforced joys that make living more real
 */

export interface DelightItem {
  item: string;
  type?: 'activity' | 'moment' | 'condition' | 'person' | 'place' | 'unknown';
  intensity?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface DelightResult {
  delights: DelightItem[];
  gaps: string[];
}

export async function runDelightExtractor(input: string): Promise<DelightResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract delight signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const delightPatterns = [
      /\b(delight|joy|pleasure|enjoy|love doing|makes me happy|fun|smile|laugh|bliss|content)\b/i,
      /\b(favorite|favourite|can't wait|looking forward|pure joy|simple pleasure|little things)\b/i,
      /\b(with friends|with family|music|walk|cook|garden|read for pleasure|hobby)\b/i,
    ];

    const activityHints = /\b(walk|cook|play|music|dance|garden|hobby|sport|create|make)\b/i;
    const momentHints = /\b(moment|when|that time|yesterday|last|smile|laugh|felt)\b/i;
    const conditionHints = /\b(when|if|after|morning|evening|quiet|outside|alone|together)\b/i;
    const personHints = /\b(with|friend|family|partner|kids|people|together)\b/i;
    const placeHints = /\b(outside|nature|home|kitchen|garden|walk|place|spot)\b/i;
    const highHints = /\b(love|adore|favorite|pure|absolute|always|most|best)\b/i;
    const lowHints = /\b(sometimes|occasional|small|little|mild)\b/i;
    const gapHints = /\b(no time for|haven't enjoyed|forgot how|can't remember last|only work|no fun|joyless)\b/i;

    const delights: DelightItem[] = [];
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

      if (delightPatterns.some(p => p.test(cleaned))) {
        let type: DelightItem['type'] = 'unknown';
        if (personHints.test(cleaned)) type = 'person';
        else if (placeHints.test(cleaned)) type = 'place';
        else if (activityHints.test(cleaned)) type = 'activity';
        else if (momentHints.test(cleaned)) type = 'moment';
        else if (conditionHints.test(cleaned)) type = 'condition';

        let intensity: DelightItem['intensity'] = 'medium';
        if (highHints.test(cleaned)) intensity = 'high';
        else if (lowHints.test(cleaned)) intensity = 'low';

        if (!delights.some(d => d.item === cleaned)) {
          delights.push({
            item: cleaned,
            type,
            intensity,
            note:
              type === 'activity'
                ? 'Activity that produces unforced delight — protect time for it'
                : type === 'moment'
                  ? 'Moment of joy — the living more that other extractors make room for'
                  : type === 'person'
                    ? 'Person or connection that brings delight'
                    : type === 'place'
                      ? 'Place that reliably produces pleasure'
                      : 'Delight signal — name it so reclaimed hours have somewhere to go',
          });
        }
      }
    }

    if (delights.length === 0) {
      gaps.push('No explicit delight found — reclaimed capacity has no positive destination yet');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          delights.push({
            item: line,
            type: 'unknown',
            intensity: 'low',
            note: 'Candidate for delight — is this something that could be done for its own pleasure?',
          });
        }
      }
    }

    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'delight-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { delights, gaps };
  } catch (error: any) {
    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'delight-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });
    throw error;
  }
}
