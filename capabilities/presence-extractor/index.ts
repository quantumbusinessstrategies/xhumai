import { logUsage } from '../../backend/utils/logger';

/**
 * Presence Extractor Capability
 * Surfaces moments, activities, relationships, and conditions that create
 * presence, aliveness, and actual living — not mere productivity.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - rest-extractor      → protected non-work time
 * - freedom-extractor   → moves that expand life
 * - energy-extractor    → what restores life-force
 * - boundary-extractor  → lines that keep work from eating life
 * - presence-extractor  → what the reclaimed capacity is actually for
 */

export interface PresenceItem {
  item: string;
  type?: 'moment' | 'activity' | 'relationship' | 'condition' | 'unknown';
  intensity?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface PresenceResult {
  presence: PresenceItem[];
}

export async function runPresenceExtractor(input: string): Promise<PresenceResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract presence signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const presencePatterns = [
      /\b(present|presence|alive|aliveness|being here|here and now|flow state|in the moment)\b/i,
      /\b(joy|delight|wonder|awe|grateful|gratitude|peace|calm|stillness|quiet)\b/i,
      /\b(family time|walk|hike|nature|sunset|conversation|play|laugh|music|art)\b/i,
      /\b(living more|actually living|real life|not just working|life outside work)\b/i,
      /\b(deep connection|meaningful|purposeful|soul|heart|spirit)\b/i,
    ];

    const momentHints = /\b(moment|instant|now|today|this morning|evening)\b/i;
    const activityHints = /\b(walk|hike|play|cook|read|listen|create|make|build something)\b/i;
    const relationshipHints = /\b(family|friend|partner|kids|children|loved one|together)\b/i;
    const conditionHints = /\b(quiet|space|time|freedom|no phone|unplugged|still)\b/i;
    const highHints = /\b(deeply|profoundly|completely|fully|pure|intense)\b/i;
    const lowHints = /\b(a bit|slightly|sometimes|occasional)\b/i;

    const presence: PresenceItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (presencePatterns.some(p => p.test(cleaned))) {
        let type: PresenceItem['type'] = 'unknown';
        if (momentHints.test(cleaned)) type = 'moment';
        else if (activityHints.test(cleaned)) type = 'activity';
        else if (relationshipHints.test(cleaned)) type = 'relationship';
        else if (conditionHints.test(cleaned)) type = 'condition';

        let intensity: PresenceItem['intensity'] = 'medium';
        if (highHints.test(cleaned)) intensity = 'high';
        else if (lowHints.test(cleaned)) intensity = 'low';

        if (!presence.some(p => p.item === cleaned)) {
          presence.push({
            item: cleaned,
            type,
            intensity,
            note:
              type === 'activity'
                ? 'Candidate to protect and schedule as living, not leftover'
                : type === 'relationship'
                  ? 'Candidate to prioritize for real connection'
                  : type === 'condition'
                    ? 'Candidate condition to create for presence'
                    : 'Presence-relevant signal — protect or amplify',
          });
        }
      }
    }

    if (presence.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          presence.push({
            item: line,
            type: 'unknown',
            intensity: 'medium',
            note: 'Candidate for presence review',
          });
        }
      }
    }

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'presence-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { presence };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'presence-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
