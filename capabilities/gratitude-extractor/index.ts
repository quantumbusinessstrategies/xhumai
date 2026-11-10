import { logUsage } from '../../backend/utils/logger';

/**
 * Gratitude Extractor Capability
 * Surfaces sources of gratitude, appreciation, and contentment from notes
 * so the mind registers existing abundance and capacity permanently returns to living more.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - enough-extractor     → recognize sufficiency
 * - leisure-extractor    → invest in living
 * - presence-extractor   → moments of aliveness
 * - wonder-extractor     → quality of attention
 * - gratitude-extractor  → name what is already good so striving quiets
 */

export interface GratitudeItem {
  item: string;
  type?: 'relationship' | 'health' | 'resource' | 'experience' | 'progress' | 'unknown';
  potency?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface GratitudeResult {
  gratitudes: GratitudeItem[];
  gaps: string[];
}

export async function runGratitudeExtractor(input: string): Promise<GratitudeResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract gratitude signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const gratitudePatterns = [
      /\b(grateful|gratitude|appreciate|thankful|blessed|fortunate)\b/i,
      /\b(thank|thanks|love that|glad|happy about|content with)\b/i,
      /\b(already have|have the|lucky to|privilege of)\b/i,
    ];

    const relationshipHints = /\b(family|friend|partner|team|community|people|relationship)\b/i;
    const healthHints = /\b(health|body|energy|sleep|strength|vitality|well)\b/i;
    const resourceHints = /\b(money|time|home|tool|resource|enough|have)\b/i;
    const experienceHints = /\b(experience|moment|memory|trip|event|saw|felt)\b/i;
    const progressHints = /\b(progress|done|completed|achieved|better|improved)\b/i;
    const highHints = /\b(must|essential|core|always|every|sacred|non-negotiable|deeply)\b/i;
    const lowHints = /\b(sometimes|maybe|if time|wish|leftover|once|small)\b/i;
    const gapHints = /\b(not enough|need more|never|always wanting|dissatisfied|lack|missing|want more)\b/i;

    const gratitudes: GratitudeItem[] = [];
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

      if (gratitudePatterns.some(p => p.test(cleaned))) {
        let type: GratitudeItem['type'] = 'unknown';
        if (relationshipHints.test(cleaned)) type = 'relationship';
        else if (healthHints.test(cleaned)) type = 'health';
        else if (resourceHints.test(cleaned)) type = 'resource';
        else if (experienceHints.test(cleaned)) type = 'experience';
        else if (progressHints.test(cleaned)) type = 'progress';

        let potency: GratitudeItem['potency'] = 'medium';
        if (highHints.test(cleaned)) potency = 'high';
        else if (lowHints.test(cleaned)) potency = 'low';

        if (!gratitudes.some(g => g.item === cleaned)) {
          gratitudes.push({
            item: cleaned,
            type,
            potency,
            note:
              type === 'relationship'
                ? 'Relationship — name the bond so capacity invests in connection rather than acquisition'
                : type === 'health'
                  ? 'Health — protect the body that makes living possible'
                  : type === 'resource'
                    ? 'Resource — this is already here; additional striving returns less living'
                    : type === 'experience'
                      ? 'Experience — the moment already lived compounds into presence'
                      : type === 'progress'
                        ? 'Progress — name the win so the mind stops treating it as open work'
                        : 'Gratitude signal — name what is already good so the drive to do more quiets and capacity returns to living more',
          });
        }
      }
    }

    if (gratitudes.length === 0) {
      gaps.push('No explicit gratitude or contentment signals found — the default may remain striving');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          gratitudes.push({
            item: line,
            type: 'unknown',
            potency: 'low',
            note: 'Candidate for gratitude — name something already present or the capacity stays abstract',
          });
        }
      }
    }

    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'gratitude-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { gratitudes, gaps };
  } catch (error: any) {
    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'gratitude-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });
    throw error;
  }
}
