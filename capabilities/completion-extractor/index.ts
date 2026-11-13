import { logUsage } from '../../backend/utils/logger';

/**
 * Completion Extractor Capability
 * Surfaces finished work, closed loops, decisions made, and things that can be marked done
 * so the mind stops holding open items and capacity returns to living more.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - progress-extractor  → forward motion and wins
 * - enough-extractor     → finish lines and stop conditions
 * - release-extractor    → letting go of the past
 * - completion-extractor → explicit closures that free attention for life
 */

export interface CompletionItem {
  item: string;
  type?: 'done' | 'closed' | 'decided' | 'released' | 'unknown';
  potency?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface CompletionResult {
  completions: CompletionItem[];
  gaps: string[];
}

export async function runCompletionExtractor(input: string): Promise<CompletionResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract completion signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const completionPatterns = [
      /\b(done|finished|completed|closed|shipped|launched|resolved|decided|settled|final)\b/i,
      /\b(no longer|stopped|dropped|archived|closed loop|marked complete)\b/i,
      /\b(win|milestone|shipped|live|merged|approved)\b/i,
    ];

    const doneHints = /\b(done|finished|completed|shipped)\b/i;
    const closedHints = /\b(closed|resolved|settled|archived)\b/i;
    const decidedHints = /\b(decided|final|approved|chose)\b/i;
    const releasedHints = /\b(released|dropped|let go|no longer)\b/i;
    const highHints = /\b(major|big|core|finally|complete|full)\b/i;
    const lowHints = /\b(partial|almost|mostly|small)\b/i;
    const gapHints = /\b(open|pending|todo|still need|unfinished|stuck|waiting|loop)\b/i;

    const completions: CompletionItem[] = [];
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

      if (completionPatterns.some(p => p.test(cleaned))) {
        let type: CompletionItem['type'] = 'unknown';
        if (doneHints.test(cleaned)) type = 'done';
        else if (closedHints.test(cleaned)) type = 'closed';
        else if (decidedHints.test(cleaned)) type = 'decided';
        else if (releasedHints.test(cleaned)) type = 'released';

        let potency: CompletionItem['potency'] = 'medium';
        if (highHints.test(cleaned)) potency = 'high';
        else if (lowHints.test(cleaned)) potency = 'low';

        if (!completions.some(c => c.item === cleaned)) {
          completions.push({
            item: cleaned,
            type,
            potency,
            note:
              type === 'done'
                ? 'Done — mark it complete so the mind stops holding it'
                : type === 'closed'
                  ? 'Closed loop — attention returns to life instead of the open item'
                  : type === 'decided'
                    ? 'Decided — the choice is made; stop re-litigating and live'
                    : type === 'released'
                      ? 'Released — capacity no longer taxed by the past'
                      : 'Completion signal — name the finish so capacity compounds into living more',
          });
        }
      }
    }

    if (completions.length === 0) {
      gaps.push('No explicit completion / closed-loop signals found — open items may continue to tax attention');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          completions.push({
            item: line,
            type: 'unknown',
            potency: 'low',
            note: 'Candidate for completion — name what is finished so the mind is free',
          });
        }
      }
    }

    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'completion-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { completions, gaps };
  } catch (error: any) {
    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'completion-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });
    throw error;
  }
}
