import { logUsage } from '../../backend/utils/logger';

/**
 * Freedom Extractor Capability
 * Surfaces decisions, systems, and moves that increase autonomy,
 * reduce recurring work, or expand future optionality.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - leverage-extractor   → systems that keep working after you stop
 * - delegation-extractor → work that leaves the founder
 * - energy-extractor     → what drains vs restores life-force
 * - reclaim-extractor    → time sinks that can be recovered
 * - boundary-extractor   → lines that protect capacity
 * - freedom-extractor    → moves that compound into more life
 */

export interface FreedomItem {
  item: string;
  type?: 'autonomy' | 'optionality' | 'elimination' | 'system' | 'unknown';
  leverage?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface FreedomResult {
  freedoms: FreedomItem[];
}

export async function runFreedomExtractor(input: string): Promise<FreedomResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract freedom signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const freedomPatterns = [
      /\b(automat|script|template|system|process|playbook|sop|checklist)\b/i,
      /\b(never again|stop doing|eliminate|drop|kill|remove|outsource|delegate)\b/i,
      /\b(optional|optionality|freedom|autonomy|control|choice|leverage)\b/i,
      /\b(one-time|set and forget|self-sustaining|compounds|keeps working)\b/i,
      /\b(reduce meetings|async|batch|no-meeting|focus block|deep work)\b/i,
      /\b(buy back time|hire|tool|platform|infrastructure)\b/i,
    ];

    const autonomyHints = /\b(control|choice|decide|autonomy|own schedule|own terms)\b/i;
    const optionalityHints = /\b(option|optionality|flexibility|pivot|paths open)\b/i;
    const eliminationHints = /\b(eliminate|drop|stop|kill|never again|remove)\b/i;
    const systemHints = /\b(automat|system|process|playbook|template|sop|script)\b/i;
    const highHints = /\b(massive|huge|transform|10x|permanent|forever)\b/i;
    const lowHints = /\b(slight|minor|small|temporary)\b/i;

    const freedoms: FreedomItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (freedomPatterns.some(p => p.test(cleaned))) {
        let type: FreedomItem['type'] = 'unknown';
        if (systemHints.test(cleaned)) type = 'system';
        else if (eliminationHints.test(cleaned)) type = 'elimination';
        else if (optionalityHints.test(cleaned)) type = 'optionality';
        else if (autonomyHints.test(cleaned)) type = 'autonomy';

        let leverage: FreedomItem['leverage'] = 'medium';
        if (highHints.test(cleaned)) leverage = 'high';
        else if (lowHints.test(cleaned)) leverage = 'low';

        if (!freedoms.some(f => f.item === cleaned)) {
          freedoms.push({
            item: cleaned,
            type,
            leverage,
            note:
              type === 'system'
                ? 'Candidate to productize so it keeps working after you stop'
                : type === 'elimination'
                  ? 'Candidate to remove permanently from the workload'
                  : type === 'optionality'
                    ? 'Candidate to expand future choice'
                    : 'Freedom-relevant signal — protect or amplify',
          });
        }
      }
    }

    if (freedoms.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          freedoms.push({
            item: line,
            type: 'unknown',
            leverage: 'medium',
            note: 'Candidate for freedom review',
          });
        }
      }
    }

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'freedom-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { freedoms };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'freedom-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
