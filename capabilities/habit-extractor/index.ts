import { logUsage } from '../../backend/utils/logger';

/**
 * Habit Extractor Capability
 * Surfaces recurring habits, routines, and behavioral patterns from notes
 * so compounding habits can be reinforced and draining ones redesigned.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - energy-extractor     → drains vs restoratives
 * - leverage-extractor   → systems that keep working after you stop
 * - progress-extractor   → what already moved
 * - habit-extractor      → the repeating loops that shape capacity over time
 */

export interface HabitItem {
  text: string;
  type?: 'compounding' | 'draining' | 'neutral' | 'unknown';
  frequency?: string;
  suggestion?: string;
  context?: string;
}

export interface HabitResult {
  habits: HabitItem[];
}

export async function runHabitExtractor(input: string): Promise<HabitResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract habits');
    }

    // --- STUB LOGIC (replace with real model later) ---
    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const habitPatterns = [
      /\b(every day|daily|weekly|every morning|every night|every week|habit|routine|always|usually|tend to|I (do|check|review|write|run|walk|meditat|journal|plan|reflect))/i,
      /\b(I (start|end|begin) (my|the) day|before bed|after lunch|first thing|last thing)\b/i,
      /\b(ritual|practice|cadence|rhythm|loop|pattern)\b/i,
    ];

    const typeFrom = (line: string): HabitItem['type'] => {
      if (/\b(compound|leverage|system|automat|review|reflect|journal|plan|walk|meditat|sleep|deep work|focus block)\b/i.test(line)) return 'compounding';
      if (/\b(scroll|check email|meeting|interrupt|context switch|busy work|react|doom|procrastinat)\b/i.test(line)) return 'draining';
      if (/\b(habit|routine|every|always|usually)\b/i.test(line)) return 'neutral';
      return 'unknown';
    };

    const habits: HabitItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (habitPatterns.some(p => p.test(cleaned))) {
        if (!habits.some(h => h.text === cleaned)) {
          const type = typeFrom(cleaned);
          habits.push({
            text: cleaned,
            type,
            frequency: /\b(daily|every day|every morning|every night)\b/i.test(cleaned)
              ? 'daily'
              : /\b(weekly|every week)\b/i.test(cleaned)
              ? 'weekly'
              : undefined,
            suggestion:
              type === 'compounding'
                ? 'Protect and expand this loop; it compounds'
                : type === 'draining'
                ? 'Redesign, batch, or eliminate this loop'
                : 'Make the intended outcome and frequency explicit',
            context: cleaned.length > 90 ? cleaned.slice(0, 90) + '…' : cleaned,
          });
        }
      }
    }

    if (habits.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          habits.push({
            text: line,
            type: 'unknown',
            context: line,
          });
        }
      }
    }
    // ------------------------------------------------

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'habit-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { habits };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'habit-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
