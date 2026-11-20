import { logUsage } from '../../backend/utils/logger';

/**
 * Flow Extractor Capability
 * Surfaces states of flow, deep engagement, effortless productivity, and conditions
 * where work feels less like work so resistance drops and capacity returns to living more.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - energy-extractor     → what drains vs restores
 * - attention-extractor  → where attention is allocated
 * - rhythm-extractor     → natural energy windows
 * - leverage-extractor   → systems that compound after you stop
 * - flow-extractor       → conditions where work itself becomes lighter
 */

export interface FlowItem {
  item: string;
  type?: 'deep-work' | 'effortless' | 'absorption' | 'challenge-skill' | 'conditions' | 'unknown';
  potency?: 'high' | 'medium' | 'low';
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
      /\b(flow|in the zone|deep work|absorbed|effortless|lose track of time)\b/i,
      /\b(challenge matches|skill level|immersion|focus state|uninterrupted)\b/i,
      /\b(hours flew|time disappeared|in the zone|in flow|deep focus)\b/i,
      /\b(conditions for|setup for|environment for|when I|blocks for)\b/i,
    ];

    const deepWorkHints = /\b(deep work|uninterrupted|focus block|deep focus)\b/i;
    const effortlessHints = /\b(effortless|easy|light|flowing|smooth)\b/i;
    const absorptionHints = /\b(absorbed|lose track|in the zone|immersion|hours flew)\b/i;
    const challengeHints = /\b(challenge|skill|match|just right|edge)\b/i;
    const conditionsHints = /\b(conditions|setup|environment|when|blocks|quiet|no interruptions)\b/i;
    const highHints = /\b(must|essential|core|always|every|sacred|non-negotiable|best)\b/i;
    const lowHints = /\b(sometimes|maybe|if time|wish|leftover|once|rare)\b/i;
    const gapHints = /\b(fragmented|interrupted|context switch|shallow|busy|reactive|no flow|never in the zone)\b/i;

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
        if (deepWorkHints.test(cleaned)) type = 'deep-work';
        else if (effortlessHints.test(cleaned)) type = 'effortless';
        else if (absorptionHints.test(cleaned)) type = 'absorption';
        else if (challengeHints.test(cleaned)) type = 'challenge-skill';
        else if (conditionsHints.test(cleaned)) type = 'conditions';

        let potency: FlowItem['potency'] = 'medium';
        if (highHints.test(cleaned)) potency = 'high';
        else if (lowHints.test(cleaned)) potency = 'low';

        if (!flows.some(f => f.item === cleaned)) {
          flows.push({
            item: cleaned,
            type,
            potency,
            note:
              type === 'deep-work'
                ? 'Deep work signal — protect the block so resistance drops and hours return to life'
                : type === 'effortless'
                  ? 'Effortless engagement — the state where work consumes less and living more becomes possible'
                  : type === 'absorption'
                    ? 'Absorption — time disappears; name the conditions so they can be repeated'
                    : type === 'challenge-skill'
                      ? 'Challenge-skill match — the edge where flow occurs and work feels lighter'
                      : type === 'conditions'
                        ? 'Flow conditions — make them explicit so the state is no longer accidental'
                        : 'Flow signal — name it so work becomes less resistive and capacity returns to living more',
          });
        }
      }
    }

    if (flows.length === 0) {
      gaps.push('No explicit flow, deep work, or effortless engagement found — work remains resistive by default');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          flows.push({
            item: line,
            type: 'unknown',
            potency: 'low',
            note: 'Candidate for flow — name the conditions or the work stays heavier than it needs to be',
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
