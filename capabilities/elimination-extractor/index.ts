import { logUsage } from '../../backend/utils/logger';

/**
 * Elimination Extractor Capability
 * Surfaces low-value work, busywork, optional commitments, and activities that can be dropped,
 * stopped, or declined so capacity permanently returns to high-leverage work and living more.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - simplicity-extractor  → reduce complexity of remaining work
 * - delegation-extractor  → move work off the founder
 * - boundary-extractor    → prevent expansion
 * - elimination-extractor → remove work that should not exist
 */

export interface EliminationItem {
  item: string;
  type?: 'busywork' | 'optional' | 'low-value' | 'recurring' | 'commitment' | 'unknown';
  impact?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface EliminationResult {
  eliminations: EliminationItem[];
  gaps: string[];
}

export async function runEliminationExtractor(input: string): Promise<EliminationResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract elimination signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const eliminationPatterns = [
      /\b(eliminate|drop|stop doing|cancel|decline|no longer|cut|remove|busywork|low value|optional|nice to have)\b/i,
      /\b(admin|overhead|reporting|status update|meeting for the sake|weekly sync|unnecessary)\b/i,
      /\b(work less|less work|fewer tasks|drop this|not worth|ROI|time sink)\b/i,
    ];

    const busyworkHints = /\b(busywork|admin|status|report|update|sync|overhead)\b/i;
    const optionalHints = /\b(optional|nice to have|if time|could|maybe)\b/i;
    const lowValueHints = /\b(low value|not worth|time sink|low ROI|busy)\b/i;
    const recurringHints = /\b(every week|recurring|always|weekly|daily)\b/i;
    const commitmentHints = /\b(commitment|promise|agreed|said yes)\b/i;
    const highHints = /\b(hours|every|always|constantly|most)\b/i;
    const lowHints = /\b(occasionally|sometimes|minor|small)\b/i;
    const gapHints = /\b(everything is important|can't drop|must do all|no prioritization)\b/i;

    const eliminations: EliminationItem[] = [];
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

      if (eliminationPatterns.some(p => p.test(cleaned))) {
        let type: EliminationItem['type'] = 'unknown';
        if (busyworkHints.test(cleaned)) type = 'busywork';
        else if (optionalHints.test(cleaned)) type = 'optional';
        else if (lowValueHints.test(cleaned)) type = 'low-value';
        else if (recurringHints.test(cleaned)) type = 'recurring';
        else if (commitmentHints.test(cleaned)) type = 'commitment';

        let impact: EliminationItem['impact'] = 'medium';
        if (highHints.test(cleaned)) impact = 'high';
        else if (lowHints.test(cleaned)) impact = 'low';

        if (!eliminations.some(e => e.item === cleaned)) {
          eliminations.push({
            item: cleaned,
            type,
            impact,
            note:
              type === 'busywork'
                ? 'Busywork candidate — eliminate to permanently reduce load'
                : type === 'optional'
                  ? 'Optional item — default to no so capacity returns'
                  : type === 'low-value'
                    ? 'Low-value signal — drop so attention compounds elsewhere'
                    : type === 'recurring'
                      ? 'Recurring drain — stop the regeneration of work'
                      : 'Elimination candidate — remove so Work Less becomes structural',
          });
        }
      }
    }

    if (eliminations.length === 0) {
      gaps.push('No explicit elimination signals found — low-value work remains invisible');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          eliminations.push({
            item: line,
            type: 'unknown',
            impact: 'medium',
            note: 'Candidate for elimination review — does this need to exist?',
          });
        }
      }
    }

    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'elimination-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { eliminations, gaps };
  } catch (error: any) {
    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'elimination-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });
    throw error;
  }
}
