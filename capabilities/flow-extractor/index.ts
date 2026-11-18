import { logUsage } from '../../backend/utils/logger';

/**
 * Flow Extractor Capability
 * Surfaces activities, conditions, and environments that produce flow state
 * so reclaimed capacity is invested in effortless, immersive living rather than forced productivity.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - rhythm-extractor     → energy cycles and optimal windows
 * - presence-extractor   → conditions of presence
 * - aliveness-extractor  → felt sense of being fully alive
 * - play-extractor       → non-productive joy
 * - flow-extractor       → the deep absorption where living more becomes effortless
 */

export interface FlowItem {
  item: string;
  type?: 'activity' | 'condition' | 'environment' | 'relationship' | 'unknown';
  intensity?: 'high' | 'medium' | 'low';
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
      /\b(flow|in the zone|lost track of time|absorbed|immersed|effortless|deep focus|time disappeared)\b/i,
      /\b(when I|while|during|doing|making|writing|coding|playing|creating)\b/i,
    ];

    const activityHints = /\b(writing|coding|playing|creating|building|designing|reading|walking|running|cooking)\b/i;
    const conditionHints = /\b(when|if|during|while|condition|after|before|morning|evening)\b/i;
    const environmentHints = /\b(quiet|alone|outdoors|nature|music|desk|space|room)\b/i;
    const relationshipHints = /\b(with|together|collaborating|pairing)\b/i;
    const highHints = /\b(always|every time|completely|deeply|fully|lost hours|time vanishes)\b/i;
    const lowHints = /\b(sometimes|maybe|if time|wish|once|almost|rarely)\b/i;
    const gapHints = /\b(distracted|interrupted|never finish|can't focus|fragmented|always switching|no time for)\b/i;

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
        if (activityHints.test(cleaned)) type = 'activity';
        else if (relationshipHints.test(cleaned)) type = 'relationship';
        else if (environmentHints.test(cleaned)) type = 'environment';
        else if (conditionHints.test(cleaned)) type = 'condition';

        let intensity: FlowItem['intensity'] = 'medium';
        if (highHints.test(cleaned)) intensity = 'high';
        else if (lowHints.test(cleaned)) intensity = 'low';

        if (!flows.some(f => f.item === cleaned)) {
          flows.push({
            item: cleaned,
            type,
            intensity,
            note:
              type === 'activity'
                ? 'Activity that generates flow — protect the conditions so living more is effortless'
                : type === 'environment'
                  ? 'Environment for flow — recreate it so absorption becomes default'
                  : type === 'condition'
                    ? 'Condition that unlocks flow — make it non-negotiable so capacity compounds into living more'
                    : type === 'relationship'
                      ? 'Relational flow — capacity invested here multiplies presence'
                      : 'Flow signal — name it so reclaimed capacity has a direction toward effortless living more',
          });
        }
      }
    }

    if (flows.length === 0) {
      gaps.push('No explicit flow / absorption / effortless signals found — reclaimed capacity may stay forced');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          flows.push({
            item: line,
            type: 'unknown',
            intensity: 'low',
            note: 'Candidate for flow — name what makes time disappear or living more stays a slogan',
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
