import { logUsage } from '../../backend/utils/logger';

/**
 * Recovery Extractor Capability
 * Surfaces recovery practices, rest quality, regenerative activities, and conditions
 * that restore capacity so reclaimed hours are not just freed but replenished.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - rest-extractor        → protected non-work time
 * - energy-extractor      → drains and restoratives
 * - stillness-extractor   → quiet non-doing
 * - vitality-extractor    → sources of life force
 * - margin-extractor      → buffers that allow recovery
 */

export interface RecoveryItem {
  item: string;
  type?: 'rest' | 'movement' | 'nature' | 'social' | 'sleep' | 'unknown';
  potency?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface RecoveryResult {
  recoveries: RecoveryItem[];
  gaps: string[];
}

export async function runRecoveryExtractor(input: string): Promise<RecoveryResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract recovery signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const recoveryPatterns = [
      /\b(recovery|rest|sleep|nap|recover|restore|regenerate|recharge)\b/i,
      /\b(walk|nature|outside|sun|movement|stretch|yoga|exercise|gym)\b/i,
      /\b(friends|family|social|connection|play|hobby)\b/i,
      /\b(enough sleep|good rest|deep sleep|quality rest)\b/i,
    ];

    const restHints = /\b(rest|sleep|nap|bed|recover)\b/i;
    const movementHints = /\b(walk|move|exercise|stretch|yoga|run)\b/i;
    const natureHints = /\b(nature|outside|sun|park|forest|fresh air)\b/i;
    const socialHints = /\b(friend|family|social|talk|connection)\b/i;
    const highHints = /\b(every|always|must|essential|daily|sacred|non-negotiable)\b/i;
    const lowHints = /\b(sometimes|maybe|if time|wish|once|rarely)\b/i;
    const gapHints = /\b(no time|too busy|exhausted|burnout|no rest|can't stop|always on)\b/i;

    const recoveries: RecoveryItem[] = [];
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

      if (recoveryPatterns.some(p => p.test(cleaned))) {
        let type: RecoveryItem['type'] = 'unknown';
        if (restHints.test(cleaned)) type = 'rest';
        else if (movementHints.test(cleaned)) type = 'movement';
        else if (natureHints.test(cleaned)) type = 'nature';
        else if (socialHints.test(cleaned)) type = 'social';

        let potency: RecoveryItem['potency'] = 'medium';
        if (highHints.test(cleaned)) potency = 'high';
        else if (lowHints.test(cleaned)) potency = 'low';

        if (!recoveries.some(r => r.item === cleaned)) {
          recoveries.push({
            item: cleaned,
            type,
            potency,
            note:
              type === 'rest'
                ? 'Rest — protect it so capacity is actually restored, not just freed'
                : type === 'movement'
                  ? 'Movement — body restoration that compounds into living more'
                  : type === 'nature'
                    ? 'Nature — the recovery that does not feel like recovery'
                    : type === 'social'
                      ? 'Social recovery — connection that replenishes rather than drains'
                      : 'Recovery signal — name it so reclaimed hours become regenerative',
          });
        }
      }
    }

    if (recoveries.length === 0) {
      gaps.push('No explicit recovery / rest / regenerative signals found — living more may stay depleting');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          recoveries.push({
            item: line,
            type: 'unknown',
            potency: 'low',
            note: 'Candidate for recovery — name the restoration practice so capacity compounds',
          });
        }
      }
    }

    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'recovery-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { recoveries, gaps };
  } catch (error: any) {
    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'recovery-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });
    throw error;
  }
}
