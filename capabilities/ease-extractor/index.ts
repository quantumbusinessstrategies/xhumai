import { logUsage } from '../../backend/utils/logger';

/**
 * Ease Extractor Capability
 * Surfaces points of ease, low-resistance paths, frictionless sequences, and work that already flows without struggle
 * so effort is not the default and capacity returns to living more.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - flow-extractor       → states of effortless engagement
 * - simplicity-extractor → reduction of unnecessary complexity
 * - energy-extractor     → what restores vs drains
 * - ease-extractor       → the structural conditions that make work consume less resistance
 */

export interface EaseItem {
  item: string;
  type?: 'path' | 'sequence' | 'condition' | 'delegation' | 'unknown';
  resistance?: 'low' | 'medium' | 'high';
  note?: string;
}

export interface EaseResult {
  eases: EaseItem[];
  gaps: string[];
}

export async function runEaseExtractor(input: string): Promise<EaseResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract ease signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const easePatterns = [
      /\b(easy|ease|effortless|simple|smooth|flow|automatic|already works|no friction)\b/i,
      /\b(delegated|templated|automated|routine|habit|system|process that runs)\b/i,
      /\b(low effort|minimal|quick|straightforward|clear path)\b/i,
    ];

    const pathHints = /\b(path|way|route|approach|method|how)\b/i;
    const sequenceHints = /\b(sequence|steps|process|flow|then|after)\b/i;
    const conditionHints = /\b(when|if|during|while|condition|setup|environment)\b/i;
    const delegationHints = /\b(delegat|outsource|someone else|team|automate|template)\b/i;
    const lowHints = /\b(always|every time|effortless|no thought|runs itself)\b/i;
    const highHints = /\b(hard|struggle|friction|manual|every time I|painful|resistance)\b/i;
    const gapHints = /\b(hard|struggle|friction|manual every|always fighting|no system|reinvent|from scratch)\b/i;

    const eases: EaseItem[] = [];
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

      if (easePatterns.some(p => p.test(cleaned))) {
        let type: EaseItem['type'] = 'unknown';
        if (pathHints.test(cleaned)) type = 'path';
        else if (sequenceHints.test(cleaned)) type = 'sequence';
        else if (delegationHints.test(cleaned)) type = 'delegation';
        else if (conditionHints.test(cleaned)) type = 'condition';

        let resistance: EaseItem['resistance'] = 'medium';
        if (lowHints.test(cleaned)) resistance = 'low';
        else if (highHints.test(cleaned)) resistance = 'high';

        if (!eases.some(e => e.item === cleaned)) {
          eases.push({
            item: cleaned,
            type,
            resistance,
            note:
              type === 'path'
                ? 'Low-resistance path — protect and prefer it so work consumes less effort'
                : type === 'sequence'
                  ? 'Frictionless sequence — codify it so the outcome happens with less human resistance'
                  : type === 'delegation'
                    ? 'Delegation or automation of ease — remove the work from your plate permanently'
                    : type === 'condition'
                      ? 'Condition that creates ease — recreate it so low-resistance becomes default'
                      : 'Ease signal — name it so reclaimed capacity is not immediately refilled with struggle',
          });
        }
      }
    }

    if (eases.length === 0) {
      gaps.push('No explicit ease / low-resistance signals found — work may still be optimized for effort instead of living more');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          eases.push({
            item: line,
            type: 'unknown',
            resistance: 'high',
            note: 'Candidate for ease — redesign toward lower resistance or capacity stays trapped in struggle',
          });
        }
      }
    }

    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'ease-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { eases, gaps };
  } catch (error: any) {
    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'ease-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });
    throw error;
  }
}
