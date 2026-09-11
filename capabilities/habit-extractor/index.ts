import { logUsage } from '../../backend/utils/logger';

/**
 * Habit Extractor Capability
 * Surfaces recurring habits, routines, and behavioral patterns from free-form
 * notes so positive ones can be reinforced and draining ones redesigned.
 * Directly serves Work Less. Live More. by making automatic behavior visible.
 * Stub for now; later becomes real AI.
 */

export async function runHabitExtractor(input: string): Promise<{ habits: string[] }> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 15) {
      throw new Error('Text is too short to extract habits');
    }

    // --- STUB LOGIC (replace with real model later) ---
    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const habitPatterns = [
      /\b(every|always|usually|tend to|habit|routine|daily|weekly|morning|evening|regularly|consistently|often|never|keep|start|stop)\b/i,
      /\b(I|we)\s+(do|make|check|review|write|read|meet|call|scroll|check in)\b/i,
      /^[-*\u2022]\s+/,
    ];

    const habits: string[] = [];
    for (const line of lines) {
      if (habitPatterns.some(p => p.test(line))) {
        const cleaned = line.replace(/^[-*\u2022]\s+/, '').replace(/^\d+[.)]\s+/, '').trim();
        if (cleaned.length > 5 && !habits.includes(cleaned)) {
          habits.push(cleaned);
        }
      }
    }

    // Fallback: short lines that look like patterns
    if (habits.length === 0) {
      for (const line of lines.slice(0, 5)) {
        if (line.length < 140) habits.push(line);
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
