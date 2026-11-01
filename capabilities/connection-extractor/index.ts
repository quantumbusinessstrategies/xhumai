import { logUsage } from '../../backend/utils/logger';

/**
 * Connection Extractor Capability
 * Surfaces relationships, people, community, and social bonds that enrich life
 * so reclaimed capacity is invested in actual living more with others.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - play-extractor        → joy and non-productive pleasure
 * - presence-extractor    → moments of aliveness
 * - vitality-extractor    → life-force sources
 * - rest-extractor        → protected non-work time
 * - connection-extractor  → the people that make living more worth it
 */

export interface ConnectionItem {
  item: string;
  type?: 'relationship' | 'community' | 'family' | 'friend' | 'mentor' | 'unknown';
  potency?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface ConnectionResult {
  connections: ConnectionItem[];
  gaps: string[];
}

export async function runConnectionExtractor(input: string): Promise<ConnectionResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract connection signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const connectionPatterns = [
      /\b(friend|friends|family|partner|spouse|kids|children|parents|relationship)\b/i,
      /\b(community|group|team|network|circle|tribe|gather|together)\b/i,
      /\b(mentor|mentee|colleague|neighbor|ally|support)\b/i,
      /\b(call|visit|dinner|hang|connect|reconnect|reach out)\b/i,
      /\b(love|care|belong|belonging|lonely|isolation)\b/i,
    ];

    const relationshipHints = /\b(partner|spouse|relationship|romantic)\b/i;
    const familyHints = /\b(family|kids|children|parents|sibling)\b/i;
    const friendHints = /\b(friend|friends)\b/i;
    const communityHints = /\b(community|group|circle|tribe|network)\b/i;
    const highHints = /\b(deep|essential|core|must|love|closest|priority)\b/i;
    const lowHints = /\b(sometimes|occasionally|wish|should|neglected)\b/i;
    const gapHints = /\b(lonely|isolated|no time for|neglected|distant|disconnected|all work)\b/i;

    const connections: ConnectionItem[] = [];
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

      if (connectionPatterns.some(p => p.test(cleaned))) {
        let type: ConnectionItem['type'] = 'unknown';
        if (relationshipHints.test(cleaned)) type = 'relationship';
        else if (familyHints.test(cleaned)) type = 'family';
        else if (friendHints.test(cleaned)) type = 'friend';
        else if (communityHints.test(cleaned)) type = 'community';

        let potency: ConnectionItem['potency'] = 'medium';
        if (highHints.test(cleaned)) potency = 'high';
        else if (lowHints.test(cleaned)) potency = 'low';

        if (!connections.some(c => c.item === cleaned)) {
          connections.push({
            item: cleaned,
            type,
            potency,
            note:
              type === 'relationship'
                ? 'Core relationship — protect time for presence'
                : type === 'family'
                  ? 'Family bond — high-return living investment'
                  : type === 'friend'
                    ? 'Friendship that compounds into belonging'
                    : type === 'community'
                      ? 'Community that expands life beyond work'
                      : 'Connection signal — invest reclaimed time here',
          });
        }
      }
    }

    if (connections.length === 0) {
      gaps.push('No explicit connection or relationship signal found — reclaimed capacity has nowhere relational to land');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          connections.push({
            item: line,
            type: 'unknown',
            potency: 'low',
            note: 'Candidate for connection investment — name the person or drop the isolation',
          });
        }
      }
    }

    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'connection-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { connections, gaps };
  } catch (error: any) {
    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'connection-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });
    throw error;
  }
}
