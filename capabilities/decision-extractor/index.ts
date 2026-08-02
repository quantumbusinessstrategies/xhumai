import { logUsage } from '../../backend/utils/logger';

/**
 * Decision Extractor Capability
 * Surfaces explicit decisions and open questions from free-form notes
 * so meetings and threads stop looping. Stub for now; later becomes real AI.
 *
 * Pairs with action-extractor: actions are what to do next;
 * decisions are what has already been settled (or still needs settling).
 */

export interface DecisionResult {
  decisions: string[];
  openQuestions: string[];
}

export async function runDecisionExtractor(input: string): Promise<DecisionResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract decisions');
    }

    // --- STUB LOGIC (replace with real model later) ---
    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 6);

    const decisionPatterns = [
      /\b(decided|decision|agreed|we will|we'll|approved|chosen|settled|confirmed|going with|picked)\b/i,
      /\b(final|finalized|locked in|green light)\b/i,
    ];

    const questionPatterns = [
      /\?\s*$/,
      /\b(open question|tbd|to be decided|need to decide|unclear|not sure|pending|still open)\b/i,
      /\b(what about|how do we|should we|can we)\b/i,
    ];

    const decisions: string[] = [];
    const openQuestions: string[] = [];

    for (const line of lines) {
      const cleaned = line.replace(/^[-*\u2022]\s+/, '').replace(/^\d+[.)]\s+/, '').trim();
      if (cleaned.length < 8) continue;

      if (decisionPatterns.some(p => p.test(cleaned)) && !decisions.includes(cleaned)) {
        decisions.push(cleaned);
      } else if (questionPatterns.some(p => p.test(cleaned)) && !openQuestions.includes(cleaned)) {
        openQuestions.push(cleaned);
      }
    }

    // Light fallback so the capability still returns value on sparse input
    if (decisions.length === 0 && openQuestions.length === 0) {
      for (const line of lines.slice(0, 4)) {
        if (line.length < 140) openQuestions.push(line);
      }
    }
    // ------------------------------------------------

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'decision-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { decisions, openQuestions };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'decision-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
