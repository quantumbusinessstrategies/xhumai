import { logUsage } from '../../backend/utils/logger';

/**
 * Compound Extractor Capability
 * Surfaces compounding loops, habits, feedback systems, and self-reinforcing patterns
 * from free-form notes so work continues growing after attention moves on.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - leverage-extractor   → high-leverage moves and systems
 * - energy-extractor     → drains vs restoratives
 * - progress-extractor   → wins and momentum already visible
 * - compound-extractor   → loops that multiply over time without constant input
 */

export interface CompoundItem {
  pattern: string;
  type?: 'habit' | 'loop' | 'system' | 'feedback' | 'asset' | 'other';
  multiplier?: string;
  why?: string;
}

export interface CompoundResult {
  compounds: CompoundItem[];
}

export async function runCompoundExtractor(input: string): Promise<CompoundResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract compounding patterns');
    }

    // --- STUB LOGIC (replace with real model later) ---
    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const compoundPatterns = [
      /\b(compound|compounds|compounding|multipl(y|ies)|snowball|flywheel|loop|habit|routine|daily|weekly|every day|recurring|feedback|self[- ]?reinforc|grows over|pays off over|keeps working|continues after|after you stop)\b/i,
      /\b(build once|set and forget|automatic|automate once|template that|playbook that|system that runs)\b/i,
      /\b(more (you|we) (do|use|share|document)|the more|each time|over time)\b/i,
    ];

    const habitHints = /\b(habit|routine|daily|weekly|morning|evening|practice)\b/i;
    const loopHints = /\b(loop|flywheel|cycle|feedback|reinforc)\b/i;
    const systemHints = /\b(system|process|pipeline|workflow|platform)\b/i;
    const assetHints = /\b(template|playbook|library|docs|asset|content)\b/i;

    const compounds: CompoundItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (compoundPatterns.some(p => p.test(cleaned))) {
        let type: CompoundItem['type'] = 'other';
        if (habitHints.test(cleaned)) type = 'habit';
        else if (loopHints.test(cleaned)) type = 'loop';
        else if (systemHints.test(cleaned)) type = 'system';
        else if (assetHints.test(cleaned)) type = 'asset';
        else if (/\b(feedback)\b/i.test(cleaned)) type = 'feedback';

        if (!compounds.some(c => c.pattern === cleaned)) {
          compounds.push({
            pattern: cleaned,
            type,
            multiplier: type === 'habit' || type === 'loop' ? 'grows with repetition' : 'pays off over time',
            why: 'Potential self-reinforcing advantage that reduces future work',
          });
        }
      }
    }

    // Light fallback so sparse input still returns value
    if (compounds.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          compounds.push({
            pattern: line,
            type: 'other',
            multiplier: 'candidate for compounding review',
            why: 'May contain a loop or habit worth strengthening',
          });
        }
      }
    }
    // ------------------------------------------------

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'compound-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { compounds };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'compound-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
