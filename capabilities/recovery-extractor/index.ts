import { logUsage } from '../../backend/utils/logger';

/**
 * Recovery Extractor Capability
 * Surfaces recovery practices, restoration activities, and gaps where recovery is missing or insufficient
 * so reclaimed capacity is invested in actual restoration rather than more work.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - rest-extractor        → protected non-work time
 * - vitality-extractor     → life-force sources
 * - energy-extractor       → drains vs restoratives
 * - boundary-extractor     → lines that protect capacity
 * - recovery-extractor     → the active restoration that makes living more possible
 */

export interface RecoveryItem {
  item: string;
  type?: 'sleep' | 'movement' | 'nature' | 'social' | 'practice' | 'unknown';
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
      /\b(recover|recovery|restore|restoration|recharge|recharge|heal|healing)\b/i,
      /\b(sleep|nap|rest day|day off|unplug|offline|no screens)\b/i,
      /\b(walk|hike|yoga|stretch|breath|meditation|nature|outside|sun)\b/i,
      /\b(friend|family|connection|talk|laugh|play|hobby)\b/i,
      /\b(burned out|exhausted|depleted|no recovery|always on|never rest)\b/i,
    ];

    const sleepHints = /\b(sleep|nap|bed|wind down)\b/i;
    const movementHints = /\b(walk|hike|yoga|stretch|exercise|move)\b/i;
    const natureHints = /\b(nature|outside|sun|forest|air|ground)\b/i;
    const socialHints = /\b(friend|family|talk|laugh|connection|play)\b/i;
    const practiceHints = /\b(meditation|breath|practice|ritual|routine)\b/i;
    const highHints = /\b(daily|essential|must|protected|non-negotiable)\b/i;
    const lowHints = /\b(sometimes|maybe|if time|wish)\b/i;
    const gapHints = /\b(burned out|exhausted|depleted|no recovery|always on|never rest|no time to recover)\b/i;

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
        if (sleepHints.test(cleaned)) type = 'sleep';
        else if (movementHints.test(cleaned)) type = 'movement';
        else if (natureHints.test(cleaned)) type = 'nature';
        else if (socialHints.test(cleaned)) type = 'social';
        else if (practiceHints.test(cleaned)) type = 'practice';

        let potency: RecoveryItem['potency'] = 'medium';
        if (highHints.test(cleaned)) potency = 'high';
        else if (lowHints.test(cleaned)) potency = 'low';

        if (!recoveries.some(r => r.item === cleaned)) {
          recoveries.push({
            item: cleaned,
            type,
            potency,
            note:
              type === 'sleep'
                ? 'Recovery floor — protect it before scheduling more work'
                : type === 'movement'
                  ? 'Movement that restores — schedule it as non-negotiable living'
                  : type === 'nature'
                    ? 'Nature contact — high-return recovery'
                    : type === 'social'
                      ? 'Connection that recovers capacity'
                      : 'Recovery signal — invest reclaimed time here or capacity decays',
          });
        }
      }
    }

    if (recoveries.length === 0) {
      gaps.push('No explicit recovery practice found — reclaimed capacity has no restoration path');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          recoveries.push({
            item: line,
            type: 'unknown',
            potency: 'low',
            note: 'Candidate for recovery — name the restoration or the capacity stays abstract',
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
