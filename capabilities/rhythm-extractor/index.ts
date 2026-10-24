import { logUsage } from '../../backend/utils/logger';

/**
 * Rhythm Extractor Capability
 * Surfaces natural energy cycles, optimal windows for deep work vs recovery,
 * biological rhythms, and misaligned schedules so work rides the body's wave
 * instead of fighting it — capacity compounds into living more.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - energy-extractor    → what drains and restores
 * - rest-extractor      → protected non-work time
 * - attention-extractor → where focus is allocated
 * - reclaim-extractor   → recoverable hours
 * - rhythm-extractor    → the natural cadence that makes the hours usable
 */

export interface RhythmItem {
  item: string;
  type?: 'peak' | 'trough' | 'transition' | 'misaligned' | 'unknown';
  window?: 'morning' | 'afternoon' | 'evening' | 'night' | 'variable';
  note?: string;
}

export interface RhythmResult {
  rhythms: RhythmItem[];
  gaps: string[];
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
      /\b(morning|afternoon|evening|night|early|late|peak|energy|tired|fatigue|circadian|rhythm|cycle|window)\b/i,
      /\b(best time|optimal|deep work|focus hours|recovery|rest|when i|schedule)\b/i,
      /\b(always tired|crash|slump|second wind|alert|sharp)\b/i,
    ];

    const peakHints = /\b(peak|sharp|alert|best|optimal|high energy|deep work)\b/i;
    const troughHints = /\b(tired|fatigue|crash|slump|low|drain|exhausted)\b/i;
    const misalignedHints = /\b(meeting|standup|always|forced|should|have to|late night)\b/i;
    const morningHints = /\b(morning|early|dawn|before noon|am)\b/i;
    const afternoonHints = /\b(afternoon|midday|after lunch|pm)\b/i;
    const eveningHints = /\b(evening|night|late|after work)\b/i;
    const gapHints = /\b(no rhythm|always on|ignore body|power through)\b/i;

    const rhythms: RhythmItem[] = [];
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

      if (rhythmPatterns.some(p => p.test(cleaned))) {
        let type: RhythmItem['type'] = 'unknown';
        if (peakHints.test(cleaned)) type = 'peak';
        else if (troughHints.test(cleaned)) type = 'trough';
        else if (misalignedHints.test(cleaned)) type = 'misaligned';

        let window: RhythmItem['window'] = 'variable';
        if (morningHints.test(cleaned)) window = 'morning';
        else if (afternoonHints.test(cleaned)) window = 'afternoon';
        else if (eveningHints.test(cleaned)) window = 'evening';

        if (!rhythms.some(r => r.item === cleaned)) {
          rhythms.push({
            item: cleaned,
            type,
            window,
            note:
              type === 'peak'
                ? 'Peak window — protect for deep, high-leverage work so the hour compounds'
                : type === 'trough'
                  ? 'Trough — schedule recovery, admin, or rest so energy is not spent fighting biology'
                  : type === 'misaligned'
                    ? 'Misaligned demand — move or drop so the body\'s rhythm is not overridden'
                    : 'Rhythm signal — align the work to the natural cycle so capacity returns',
          });
        }
      }
    }

    if (rhythms.length === 0) {
      gaps.push('No explicit rhythm signals found — natural cycles remain invisible and work fights the body');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          rhythms.push({
            item: line,
            type: 'unknown',
            window: 'variable',
            note: 'Candidate for rhythm review — when does energy actually peak or trough?',
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

    return { rhythms, gaps };
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
