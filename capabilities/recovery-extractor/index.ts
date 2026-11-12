import { logUsage } from '../../backend/utils/logger';

/**
 * Recovery Extractor Capability
 * Surfaces recovery practices, sleep hygiene, downtime, and restoration windows
 * so reclaimed capacity is invested in actual recovery for living more rather than further optimization.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - rest-extractor      → protected non-work time
 * - vitality-extractor  → health and life-force
 * - stillness-extractor → quiet non-doing
 * - energy-extractor    → drains and restoratives
 * - recovery-extractor  → the specific practices that restore capacity so living more is sustainable
 */

export interface RecoveryItem {
  item: string;
  type?: 'sleep' | 'downtime' | 'practice' | 'window' | 'unknown';
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
      /\b(recovery|recover|sleep|rest|downtime|unwind|restore|recharge|nap|sabbath|off|break)\b/i,
      /\b(sleep hygiene|wind down|digital detox|unplug|screen free|early night)\b/i,
      /\b(meditation|breath|walk|stretch|nature|bath|read before bed)\b/i,
    ];

    const sleepHints = /\b(sleep|nap|bed|night|insomnia|8 hours|wind down)\b/i;
    const downtimeHints = /\b(downtime|off|break|free time|unscheduled|nothing)\b/i;
    const practiceHints = /\b(practice|routine|habit|meditation|stretch|walk|bath)\b/i;
    const windowHints = /\b(window|after|before|evening|morning|weekend)\b/i;
    const highHints = /\b(every|always|core|must|sacred|essential|daily|protected)\b/i;
    const lowHints = /\b(sometimes|maybe|if time|wish|once|try)\b/i;
    const gapHints = /\b(no time|too busy|sleep less|burnout|exhausted|always on|no recovery|hustle)\b/i;

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
        else if (downtimeHints.test(cleaned)) type = 'downtime';
        else if (practiceHints.test(cleaned)) type = 'practice';
        else if (windowHints.test(cleaned)) type = 'window';

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
                ? 'Sleep — the non-negotiable recovery; protect the window so capacity returns'
                : type === 'downtime'
                  ? 'Downtime — unstructured recovery that lets the system reset'
                  : type === 'practice'
                    ? 'Practice — named restoration so recovery is intentional, not residual'
                    : type === 'window'
                      ? 'Window — schedule or guard it so recovery happens instead of being filled'
                      : 'Recovery signal — invest reclaimed capacity here so living more is sustainable',
          });
        }
      }
    }

    if (recoveries.length === 0) {
      gaps.push('No explicit recovery / sleep / downtime signals found — living more may stay unsustainable');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          recoveries.push({
            item: line,
            type: 'unknown',
            potency: 'low',
            note: 'Candidate for recovery — name the restoration practice or the living stays residual',
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
