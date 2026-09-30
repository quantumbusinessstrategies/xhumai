import { logUsage } from '../../backend/utils/logger';

/**
 * Attention Extractor Capability
 * Surfaces attention leaks, interruptions, and compounding focus
 * from free-form notes so living more is not eaten by noise.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - energy-extractor     → what drains vs restores life-force
 * - rhythm-extractor     → natural vs forced pace
 * - capacity-extractor   → real available bandwidth vs current load
 * - reclaim-extractor    → time sinks that can be recovered
 * - attention-extractor  → where focus leaks vs compounds
 */

export interface AttentionItem {
  item: string;
  kind?: 'leak' | 'compound' | 'interrupt' | 'protected' | 'unknown';
  intensity?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface AttentionResult {
  attentions: AttentionItem[];
}

export async function runAttentionExtractor(input: string): Promise<AttentionResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract attention signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const attentionPatterns = [
      /\b(attention|focus|distract|distraction|interrupt|interruption|notification|ping|slack|inbox|context switch|context-switch)\b/i,
      /\b(deep work|flow|protected time|do not disturb|mute|batch|single-task)\b/i,
      /\b(can't concentrate|scattered|fragmented|always on|always-on|phone|tab hopping)\b/i,
    ];

    const leakHints = /\b(distract|interrupt|notification|ping|inbox|context switch|scattered|fragmented|tab hopping|always on)\b/i;
    const compoundHints = /\b(deep work|flow|compound|single-task|protected time|unbroken)\b/i;
    const interruptHints = /\b(interrupt|ping|notification|slack ping|knock)\b/i;
    const protectedHints = /\b(do not disturb|mute|protected|guard|hold focus|no meetings)\b/i;
    const highHints = /\b(constantly|always|nonstop|every minute|crushing)\b/i;
    const lowHints = /\b(occasionally|sometimes|slight|mild)\b/i;

    const attentions: AttentionItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (attentionPatterns.some(p => p.test(cleaned))) {
        let kind: AttentionItem['kind'] = 'unknown';
        if (protectedHints.test(cleaned)) kind = 'protected';
        else if (compoundHints.test(cleaned)) kind = 'compound';
        else if (interruptHints.test(cleaned)) kind = 'interrupt';
        else if (leakHints.test(cleaned)) kind = 'leak';

        let intensity: AttentionItem['intensity'] = 'medium';
        if (highHints.test(cleaned)) intensity = 'high';
        else if (lowHints.test(cleaned)) intensity = 'low';

        if (!attentions.some(a => a.item === cleaned)) {
          attentions.push({
            item: cleaned,
            kind,
            intensity,
            note:
              kind === 'leak'
                ? 'Candidate to cut, batch, or mute so focus can compound'
                : kind === 'interrupt'
                  ? 'Candidate to route async or protect with a boundary'
                  : kind === 'compound'
                    ? 'Candidate to schedule first and defend'
                    : kind === 'protected'
                      ? 'Attention already guarded — keep the line'
                      : 'Attention-relevant signal',
          });
        }
      }
    }

    if (attentions.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          attentions.push({
            item: line,
            kind: 'unknown',
            intensity: 'medium',
            note: 'Candidate for attention review',
          });
        }
      }
    }

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'attention-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { attentions };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'attention-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
