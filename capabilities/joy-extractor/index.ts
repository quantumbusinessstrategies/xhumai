import { logUsage } from '../../backend/utils/logger';

/**
 * Joy Extractor Capability
 * Surfaces sources of joy, delight, play, fulfillment, and genuine living
 * so reclaimed capacity is directed toward actually living more — not refilled with work.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - presence-extractor   → moments of aliveness
 * - reclaim-extractor    → hours that can return to life
 * - freedom-extractor    → autonomy and optionality
 * - energy-extractor     → what restores life-force
 * - boundary-extractor   → lines that protect life from work
 */

export interface JoyItem {
  item: string;
  type?: 'activity' | 'person' | 'place' | 'condition' | 'unknown';
  intensity?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface JoyResult {
  joys: JoyItem[];
  gaps: string[];
}

export async function runJoyExtractor(input: string): Promise<JoyResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract joy signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const joyPatterns = [
      /\b(joy|delight|play|fun|laughter|laugh|playful|delightful|joyful)\b/i,
      /\b(fulfill|fulfillment|meaning|meaningful|alive|aliveness|flow|wonder|awe)\b/i,
      /\b(love doing|makes me happy|lights me up|I live for|what I live for|purpose)\b/i,
      /\b(walk|hike|music|art|cook|garden|read for pleasure|friends|family time|travel)\b/i,
      /\b(live more|actually living|real life|not just work|outside work|life itself)\b/i,
    ];

    const activityHints = /\b(walk|hike|play|cook|create|make|garden|read|listen|travel|sport)\b/i;
    const personHints = /\b(family|friend|partner|kids|children|people|with others)\b/i;
    const placeHints = /\b(nature|outside|beach|mountain|home|garden|city|place)\b/i;
    const conditionHints = /\b(quiet|space|time|freedom|unplugged|no agenda|rested)\b/i;
    const highHints = /\b(deeply|profoundly|completely|fully|pure|intense|love)\b/i;
    const lowHints = /\b(a bit|slightly|sometimes|occasional|mild)\b/i;
    const gapHints = /\b(no time for|haven't|used to|miss|lost|forgot how|only work)\b/i;

    const joys: JoyItem[] = [];
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

      if (joyPatterns.some(p => p.test(cleaned))) {
        let type: JoyItem['type'] = 'unknown';
        if (activityHints.test(cleaned)) type = 'activity';
        else if (personHints.test(cleaned)) type = 'person';
        else if (placeHints.test(cleaned)) type = 'place';
        else if (conditionHints.test(cleaned)) type = 'condition';

        let intensity: JoyItem['intensity'] = 'medium';
        if (highHints.test(cleaned)) intensity = 'high';
        else if (lowHints.test(cleaned)) intensity = 'low';

        if (!joys.some(j => j.item === cleaned)) {
          joys.push({
            item: cleaned,
            type,
            intensity,
            note:
              type === 'activity'
                ? 'Protect and schedule this as living, not leftover time'
                : type === 'person'
                  ? 'Prioritize real connection — this is living more'
                  : type === 'place'
                    ? 'Create access to this place so presence can happen'
                    : type === 'condition'
                      ? 'Design the condition so joy has room'
                      : 'Joy signal — direct reclaimed capacity here',
          });
        }
      }
    }

    if (joys.length === 0) {
      gaps.push('No explicit joy or fulfillment signals found — reclaimed hours may still default to more work');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          joys.push({
            item: line,
            type: 'unknown',
            intensity: 'medium',
            note: 'Candidate for joy review — does this produce genuine living?',
          });
        }
      }
    }

    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'joy-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { joys, gaps };
  } catch (error: any) {
    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'joy-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });
    throw error;
  }
}
