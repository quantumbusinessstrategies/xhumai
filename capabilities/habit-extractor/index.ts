import { logUsage } from '../../backend/utils/logger';

/**
 * Habit Extractor Capability
 * Surfaces recurring habits, routines, rituals, and patterns from free-form notes
 * so living more becomes designed instead of accidental.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - energy-extractor     → what drains vs restores
 * - leverage-extractor   → systems that keep working after you stop
 * - delegation-extractor → work that can leave the founder's hands
 * - progress-extractor   → momentum already present
 * - habit-extractor      → the recurring loops that turn insight into automatic leverage
 */

export interface HabitItem {
  habit: string;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'occasional' | 'unknown';
  polarity?: 'supportive' | 'draining' | 'neutral' | 'unknown';
  note?: string;
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

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const habitPatterns = [
      /\b(every day|daily|each morning|every morning|every night|nightly|weekly|every week|every monday|habit|routine|ritual|always|usually|typically|tend to|keep doing|keep forgetting)\b/i,
      /\b(morning routine|evening routine|wind down|shutdown|deep work block|time block|calendar block)\b/i,
      /\b(walk|meditat|journal|review|standup|check-in|inbox zero|shutdown ritual)\b/i,
    ];

    const supportiveHints = /\b(protect|protects|keeps me|gives me|restores|energiz|focus|clarity|calm|alive|compound)\b/i;
    const drainingHints = /\b(drain|drains|exhaust|burnout|grind|hate|dread|avoid|procrastinat)\b/i;
    const dailyHints = /\b(every day|daily|each morning|every morning|nightly|every night)\b/i;
    const weeklyHints = /\b(weekly|every week|every monday|once a week)\b/i;

    const habits: HabitItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (habitPatterns.some(p => p.test(cleaned))) {
        let frequency: HabitItem['frequency'] = 'unknown';
        if (dailyHints.test(cleaned)) frequency = 'daily';
        else if (weeklyHints.test(cleaned)) frequency = 'weekly';

        let polarity: HabitItem['polarity'] = 'unknown';
        if (supportiveHints.test(cleaned)) polarity = 'supportive';
        else if (drainingHints.test(cleaned)) polarity = 'draining';
        else polarity = 'neutral';

        if (!habits.some(h => h.habit === cleaned)) {
          habits.push({
            habit: cleaned,
            frequency,
            polarity,
            note:
              polarity === 'supportive'
                ? 'Protect and schedule first — compounds living more'
                : polarity === 'draining'
                  ? 'Candidate to redesign, shorten, or drop'
                  : 'Recurring pattern worth examining',
          });
        }
      }
    }

    if (habits.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          habits.push({
            habit: line,
            frequency: 'unknown',
            polarity: 'unknown',
            note: 'Candidate for habit review',
          });
        }
      }
    }

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
