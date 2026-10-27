import { logUsage } from '../../backend/utils/logger';

/**
 * Sovereignty Extractor Capability
 * Surfaces points of personal agency, control, non-negotiable self-direction,
 * and places where external demands currently own the calendar or attention
 * so capacity permanently returns to living more instead of residual obligation.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - boundary-extractor     → explicit fences
 * - freedom-extractor      → expanded optionality
 * - margin-extractor       → unallocated space
 * - elimination-extractor  → removal of non-essential
 * - sovereignty-extractor  → reclaiming the right to direct one's own time and life
 */

export interface SovereigntyItem {
  item: string;
  type?: 'agency' | 'control' | 'non-negotiable' | 'external-owned' | 'unknown';
  note?: string;
}

export interface SovereigntyResult {
  sovereignties: SovereigntyItem[];
  gaps: string[];
}

export async function runSovereigntyExtractor(input: string): Promise<SovereigntyResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract sovereignty signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const sovereigntyPatterns = [
      /\b(agency|control|decide|choose|own|sovereign|autonomy|self-directed|non-negotiable)\b/i,
      /\b(must|have to|forced|external|demand|obligation|calendar owns|no choice)\b/i,
      /\b(protect|assert|reclaim|refuse|say no|set terms)\b/i,
    ];

    const agencyHints = /\b(agency|choose|decide|self|own my)\b/i;
    const controlHints = /\b(control|direct|steer|set the terms)\b/i;
    const nonNegHints = /\b(non-negotiable|sacred|protected|will not|refuse)\b/i;
    const externalHints = /\b(must|have to|forced|external|demand|they decide|calendar)\b/i;
    const gapHints = /\b(no control|no choice|owned by|external calendar|always reacting)\b/i;

    const sovereignties: SovereigntyItem[] = [];
    const gaps: string[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*•]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (gapHints.test(cleaned) && !gaps.includes(cleaned)) {
        gaps.push(cleaned);
      }

      if (sovereigntyPatterns.some(p => p.test(cleaned))) {
        let type: SovereigntyItem['type'] = 'unknown';
        if (agencyHints.test(cleaned)) type = 'agency';
        else if (controlHints.test(cleaned)) type = 'control';
        else if (nonNegHints.test(cleaned)) type = 'non-negotiable';
        else if (externalHints.test(cleaned)) type = 'external-owned';

        if (!sovereignties.some(s => s.item === cleaned)) {
          sovereignties.push({
            item: cleaned,
            type,
            note:
              type === 'agency'
                ? 'Agency — this is where you already direct; protect and expand it so life is not residual'
                : type === 'control'
                  ? 'Control — name the terms you set so external systems do not own the hours'
                  : type === 'non-negotiable'
                    ? 'Non-negotiable — this is the line that keeps capacity for living more; hold it'
                    : type === 'external-owned'
                      ? 'External-owned — demand currently owns this; reclaim the right to direct'
                      : 'Sovereignty signal — surface the point of self-direction so capacity returns to living more',
          });
        }
      }
    }

    if (sovereignties.length === 0) {
      gaps.push('No explicit sovereignty signals found — external demands may own the calendar and life remains residual');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          sovereignties.push({
            item: line,
            type: 'unknown',
            note: 'Candidate for sovereignty review — where is the right to direct your own time?',
          });
        }
      }
    }

    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'sovereignty-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { sovereignties, gaps };
  } catch (error: any) {
    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'sovereignty-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });
    throw error;
  }
}
