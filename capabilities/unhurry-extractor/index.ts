import { logUsage } from '../../backend/utils/logger';

/**
 * Unhurry Extractor Capability
 * Surfaces artificial urgency, haste defaults, "faster is better" assumptions,
 * and the specific decelerations that protect presence.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - stillness-extractor   → conditions of stillness
 * - presence-extractor    → being fully here
 * - rhythm-extractor      → natural vs imposed pace
 * - energy-extractor      → what drains vs restores
 * - boundary-extractor    → lines that protect capacity
 * - unhurry-extractor     → removes the haste that turns reclaimed time back into residual speed
 */

export interface UnhurryItem {
  item: string;
  type?: 'urgency' | 'haste-default' | 'deceleration' | 'pace' | 'unknown';
  intensity?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface UnhurryResult {
  unhurries: UnhurryItem[];
  gaps: string[];
}

export async function runUnhurryExtractor(input: string): Promise<UnhurryResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract unhurry signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const unhurryPatterns = [
      /\b(urgent|urgency|asap|right now|immediately|faster|hurry|rush|quick|speed|deadline pressure)\b/i,
      /\b(slow|slow down|decelerate|unhurry|take time|no rush|pace|natural pace|unhurried)\b/i,
      /\b(always on|never stop|constant|non-stop|back-to-back|no buffer|no margin)\b/i,
    ];

    const urgencyHints = /\b(urgent|asap|immediately|right now|must today|critical path)\b/i;
    const hasteHints = /\b(faster|hurry|rush|quick|speed|efficient|optimize time|time is money)\b/i;
    const decelerationHints = /\b(slow|slow down|decelerate|unhurry|take time|no rush|breathe|pause|margin|buffer)\b/i;
    const paceHints = /\b(pace|rhythm|tempo|natural|sustainable|human speed)\b/i;
    const highHints = /\b(always|every|must|essential|core|constant|never)\b/i;
    const lowHints = /\b(sometimes|maybe|if time|wish|once|almost|rarely)\b/i;
    const gapHints = /\b(always rushing|no time to think|back-to-back|constant urgency|never slow|speed over presence)\b/i;

    const unhurries: UnhurryItem[] = [];
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

      if (unhurryPatterns.some(p => p.test(cleaned))) {
        let type: UnhurryItem['type'] = 'unknown';
        if (urgencyHints.test(cleaned)) type = 'urgency';
        else if (hasteHints.test(cleaned)) type = 'haste-default';
        else if (decelerationHints.test(cleaned)) type = 'deceleration';
        else if (paceHints.test(cleaned)) type = 'pace';

        let intensity: UnhurryItem['intensity'] = 'medium';
        if (highHints.test(cleaned)) intensity = 'high';
        else if (lowHints.test(cleaned)) intensity = 'low';

        if (!unhurries.some(u => u.item === cleaned)) {
          unhurries.push({
            item: cleaned,
            type,
            intensity,
            note:
              type === 'urgency'
                ? 'Artificial or real urgency — name it so it does not default to haste'
                : type === 'haste-default'
                  ? 'Haste default — the assumption that faster is better is eating presence'
                  : type === 'deceleration'
                    ? 'Deceleration move — protect it so reclaimed capacity stays unhurried'
                    : type === 'pace'
                      ? 'Pace signal — restore natural speed so living more is not rushed'
                      : 'Unhurry signal — name the haste so capacity can return to living more',
          });
        }
      }
    }

    if (unhurries.length === 0) {
      gaps.push('No explicit urgency / haste / deceleration signals found — speed may be the unspoken default');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          unhurries.push({
            item: line,
            type: 'unknown',
            intensity: 'low',
            note: 'Candidate for unhurry — name where haste is optional so living more has room',
          });
        }
      }
    }

    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'unhurry-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { unhurries, gaps };
  } catch (error: any) {
    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'unhurry-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });
    throw error;
  }
}
