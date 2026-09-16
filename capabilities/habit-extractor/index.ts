import { logUsage } from '../../backend/utils/logger';

/**
 * Habit Extractor Capability
 * Surfaces recurring behaviors, routines, and patterns from notes so they can
 * be systemized, automated, or deliberately dropped — freeing time for living more.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - leverage-extractor   → systems that keep working after you stop
 * - energy-extractor     → drains and restoratives
 * - delegation-extractor → work that can leave the founder
 * - habit-extractor      → recurring loops that compound or consume
 */

export interface HabitItem {
  text: string;
  frequency?: 'daily' | 'weekly' | 'recurring' | 'pattern' | 'unknown';
  nature?: 'productive' | 'drain' | 'neutral' | 'candidate-for-system' | 'unknown';
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
      /\b(every day|daily|each morning|every morning|every week|weekly|every time|always|usually|tend to|habit|routine|ritual|again and again|keep doing|keep checking|scroll|check email|meeting loop)\b/i,
      /\b(I always|we always|I usually|we usually|I tend to|we tend to|I keep|we keep)\b/i,
      /\b(recurring|repeatedly|over and over|on autopilot|by default)\b/i,
    ];

    const frequencyFrom = (line: string): HabitItem['frequency'] => {
      if (/\b(every day|daily|each morning|every morning)\b/i.test(line)) return 'daily';
      if (/\b(every week|weekly)\b/i.test(line)) return 'weekly';
      if (/\b(every time|always|usually|tend to|keep)\b/i.test(line)) return 'recurring';
      if (/\b(pattern|routine|ritual|autopilot)\b/i.test(line)) return 'pattern';
      return 'unknown';
    };

    const natureFrom = (line: string): HabitItem['nature'] => {
      if (/\b(scroll|check email|meeting|interrupt|distract|procrastinat)\b/i.test(line)) return 'drain';
      if (/\b(exercise|write|review|plan|reflect|meditat|walk)\b/i.test(line)) return 'productive';
      if (/\b(automat|system|template|checklist|script)\b/i.test(line)) return 'candidate-for-system';
      return 'neutral';
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
          const frequency = frequencyFrom(cleaned);
          const nature = natureFrom(cleaned);
          habits.push({
            text: cleaned,
            frequency,
            nature,
            suggestion:
              nature === 'drain'
                ? 'Candidate to eliminate or heavily constrain'
                : nature === 'candidate-for-system'
                ? 'Turn into an explicit system or automation'
                : nature === 'productive'
                ? 'Protect and schedule deliberately'
                : 'Decide: systemize, schedule, or drop',
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
            frequency: 'unknown',
            nature: 'unknown',
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
