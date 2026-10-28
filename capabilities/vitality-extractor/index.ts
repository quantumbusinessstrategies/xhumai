import { logUsage } from '../../backend/utils/logger';

/**
 * Vitality Extractor Capability
 * Surfaces sources of vitality, health practices, movement, nature,
 * and life-force restoratives so reclaimed capacity is invested in actual living.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - energy-extractor    → drains vs restoratives
 * - rest-extractor      → protected non-work time
 * - presence-extractor  → moments of aliveness
 * - boundary-extractor  → lines that protect capacity
 * - vitality-extractor  → the living that the capacity is for
 */

export interface VitalityItem {
  item: string;
  type?: 'movement' | 'nature' | 'health' | 'relationship' | 'practice' | 'unknown';
  potency?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface VitalityResult {
  vitalities: VitalityItem[];
  gaps: string[];
}

export async function runVitalityExtractor(input: string): Promise<VitalityResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract vitality signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const vitalityPatterns = [
      /\b(vitality|alive|energized|health|healthy|movement|exercise|walk|run|yoga|strength)\b/i,
      /\b(nature|outside|sun|fresh air|hike|forest|ocean|garden|grounded)\b/i,
      /\b(sleep|rest|recover|nutrition|food|water|breath|breathe|meditation)\b/i,
      /\b(relationship|connection|friend|family|play|laugh|joy|passion)\b/i,
      /\b(practice|routine|habit|daily|ritual|morning|evening)\b/i,
    ];

    const movementHints = /\b(walk|run|exercise|gym|yoga|strength|move|movement|sport)\b/i;
    const natureHints = /\b(nature|outside|sun|forest|hike|ocean|garden|air)\b/i;
    const healthHints = /\b(health|sleep|nutrition|food|water|recover|breath)\b/i;
    const relationshipHints = /\b(friend|family|partner|connection|together|play)\b/i;
    const practiceHints = /\b(practice|routine|habit|ritual|daily|meditation)\b/i;
    const highHints = /\b(deeply|fully|essential|must|daily|core)\b/i;
    const lowHints = /\b(sometimes|occasionally|try|maybe)\b/i;
    const gapHints = /\b(no time|too busy|sedentary|indoor|neglected|burned out|exhausted)\b/i;

    const vitalities: VitalityItem[] = [];
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

      if (vitalityPatterns.some(p => p.test(cleaned))) {
        let type: VitalityItem['type'] = 'unknown';
        if (movementHints.test(cleaned)) type = 'movement';
        else if (natureHints.test(cleaned)) type = 'nature';
        else if (healthHints.test(cleaned)) type = 'health';
        else if (relationshipHints.test(cleaned)) type = 'relationship';
        else if (practiceHints.test(cleaned)) type = 'practice';

        let potency: VitalityItem['potency'] = 'medium';
        if (highHints.test(cleaned)) potency = 'high';
        else if (lowHints.test(cleaned)) potency = 'low';

        if (!vitalities.some(v => v.item === cleaned)) {
          vitalities.push({
            item: cleaned,
            type,
            potency,
            note:
              type === 'movement'
                ? 'Movement that restores life-force — protect the slot'
                : type === 'nature'
                  ? 'Nature contact — high-return living'
                  : type === 'health'
                    ? 'Health practice that compounds capacity'
                    : type === 'relationship'
                      ? 'Connection that makes capacity worth reclaiming'
                      : 'Vitality signal — invest reclaimed time here',
          });
        }
      }
    }

    if (vitalities.length === 0) {
      gaps.push('No explicit vitality source found — reclaimed capacity has nowhere to land');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          vitalities.push({
            item: line,
            type: 'unknown',
            potency: 'low',
            note: 'Candidate for vitality investment — name the living or drop the work',
          });
        }
      }
    }

    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'vitality-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { vitalities, gaps };
  } catch (error: any) {
    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'vitality-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });
    throw error;
  }
}
