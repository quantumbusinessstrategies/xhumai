import { logUsage } from '../../backend/utils/logger';

/**
 * Flow Extractor Capability
 * Surfaces conditions that enable flow, deep work enablers, interruptions that fragment progress,
 * and opportunities to design for effortless momentum so work becomes less effortful and capacity
 * compounds into living more.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - attention-extractor   → where focus is allocated
 * - energy-extractor      → what drains vs restores
 * - simplicity-extractor  → reduce friction in the work itself
 * - flow-extractor        → design the conditions so progress feels effortless
 */

export interface FlowItem {
  item: string;
  type?: 'enabler' | 'blocker' | 'interruption' | 'design' | 'unknown';
  impact?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface FlowResult {
  flows: FlowItem[];
  gaps: string[];
}

export async function runFlowExtractor(input: string): Promise<FlowResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract flow signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const flowPatterns = [
      /\b(flow|deep work|in the zone|momentum|effortless|uninterrupted|focus block|maker time)\b/i,
      /\b(interrupt|context switch|meeting|notification|distraction|fragmented|constant)\b/i,
      /\b(design|protect|batch|schedule|ritual|environment|conditions for)\b/i,
    ];

    const enablerHints = /\b(flow|deep work|zone|momentum|uninterrupted|clear|protected)\b/i;
    const blockerHints = /\b(can't focus|stuck|scattered|overwhelmed|too many)\b/i;
    const interruptionHints = /\b(interrupt|context switch|meeting|slack|notification|ping)\b/i;
    const designHints = /\b(design|protect|batch|block|ritual|environment)\b/i;
    const highHints = /\b(hours|every|always|constantly|most|critical)\b/i;
    const lowHints = /\b(occasionally|sometimes|minor|small)\b/i;
    const gapHints = /\b(always interrupted|no deep work|can't get into flow|constant context)\b/i;

    const flows: FlowItem[] = [];
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

      if (flowPatterns.some(p => p.test(cleaned))) {
        let type: FlowItem['type'] = 'unknown';
        if (enablerHints.test(cleaned)) type = 'enabler';
        else if (blockerHints.test(cleaned)) type = 'blocker';
        else if (interruptionHints.test(cleaned)) type = 'interruption';
        else if (designHints.test(cleaned)) type = 'design';

        let impact: FlowItem['impact'] = 'medium';
        if (highHints.test(cleaned)) impact = 'high';
        else if (lowHints.test(cleaned)) impact = 'low';

        if (!flows.some(f => f.item === cleaned)) {
          flows.push({
            item: cleaned,
            type,
            impact,
            note:
              type === 'enabler'
                ? 'Flow enabler — protect and amplify so progress compounds with less effort'
                : type === 'blocker'
                  ? 'Flow blocker — remove so work stops feeling hard'
                  : type === 'interruption'
                    ? 'Interruption signal — batch or eliminate so deep work becomes possible'
                    : type === 'design'
                      ? 'Design opportunity — shape conditions so effortless progress is the default'
                      : 'Flow candidate — does this support or fragment effortless progress?',
          });
        }
      }
    }

    if (flows.length === 0) {
      gaps.push('No explicit flow signals found — conditions for effortless progress remain invisible');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          flows.push({
            item: line,
            type: 'unknown',
            impact: 'medium',
            note: 'Candidate for flow review — can this be designed for less effort?',
          });
        }
      }
    }

    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'flow-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { flows, gaps };
  } catch (error: any) {
    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'flow-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });
    throw error;
  }
}
