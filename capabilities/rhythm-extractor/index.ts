import { logUsage } from '../../backend/utils/logger';

/**
 * Rhythm Extractor Capability
 * Surfaces natural work/rest rhythms, forced schedules, recovery gaps,
 * and calendar tyranny from free-form notes so capacity is designed
 * around human pace instead of infinite availability.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - energy-extractor     → what drains vs restores life-force
 * - habit-extractor      → recurring practices that shape days
 * - reclaim-extractor    → time sinks that can be recovered
 * - boundary-extractor   → lines that protect capacity
 * - freedom-extractor    → moves that expand autonomy
 * - rhythm-extractor     → the pulse of when to push and when to stop
 */

export interface RhythmItem {
  item: string;
  kind?: 'natural' | 'forced' | 'recovery' | 'interrupt' | 'unknown';
  quality?: 'aligned' | 'misaligned' | 'missing' | 'unknown';
  note?: string;
}

export interface RhythmResult {
  rhythms: RhythmItem[];
}

export async function runRhythmExtractor(input: string): Promise<RhythmResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract rhythm signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const rhythmPatterns = [
      /\b(morning|evening|night|afternoon|early|late|dawn|dusk)\b/i,
      /\b(deep work|focus block|flow|peak|energy window|best hours)\b/i,
      /\b(meeting.?heavy|back.to.back|calendar full|overbooked|no breaks)\b/i,
      /\b(rest|recovery|break|nap|walk|shutdown|wind.?down|off.?hours)\b/i,
      /\b(context.?switch|interrupt|ping|slack|notification|always.?on)\b/i,
      /\b(rhythm|pace|cadence|cycle|ultradian|circadian|season)\b/i,
      /\b(forced|obligatory|have to|must attend|non.?optional)\b/i,
    ];

    const naturalHints = /\b(natural|peak|flow|best hours|deep work|focus block|when I'?m sharp)\b/i;
    const forcedHints = /\b(forced|overbooked|back.to.back|must attend|calendar full|always.?on|meeting.?heavy)\b/i;
    const recoveryHints = /\b(rest|recovery|break|nap|walk|shutdown|wind.?down|off.?hours|protect)\b/i;
    const interruptHints = /\b(interrupt|context.?switch|ping|slack|notification|distract)\b/i;

    const rhythms: RhythmItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (rhythmPatterns.some(p => p.test(cleaned))) {
        let kind: RhythmItem['kind'] = 'unknown';
        if (interruptHints.test(cleaned)) kind = 'interrupt';
        else if (recoveryHints.test(cleaned)) kind = 'recovery';
        else if (forcedHints.test(cleaned)) kind = 'forced';
        else if (naturalHints.test(cleaned)) kind = 'natural';

        let quality: RhythmItem['quality'] = 'unknown';
        if (kind === 'natural' || (kind === 'recovery' && !/missing|no |lack|never/.test(cleaned.toLowerCase()))) {
          quality = 'aligned';
        } else if (kind === 'forced' || kind === 'interrupt') {
          quality = 'misaligned';
        } else if (/missing|no breaks|never rest|no recovery|always on/.test(cleaned.toLowerCase())) {
          quality = 'missing';
        }

        if (!rhythms.some(r => r.item === cleaned)) {
          rhythms.push({
            item: cleaned,
            kind,
            quality,
            note:
              kind === 'forced'
                ? 'Candidate to renegotiate or batch so pace returns to human'
                : kind === 'interrupt'
                  ? 'Candidate to protect deep windows and reduce fragmentation'
                  : kind === 'recovery'
                    ? 'Candidate to schedule and defend as non-negotiable'
                    : kind === 'natural'
                      ? 'Candidate to design the day around this window'
                      : 'Rhythm-relevant signal — protect or redesign',
          });
        }
      }
    }

    if (rhythms.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          rhythms.push({
            item: line,
            kind: 'unknown',
            quality: 'unknown',
            note: 'Candidate for rhythm review',
          });
        }
      }
    }

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'rhythm-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { rhythms };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'rhythm-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
