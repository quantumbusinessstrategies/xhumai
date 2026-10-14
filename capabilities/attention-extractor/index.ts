import { logUsage } from '../../backend/utils/logger';

/**
 * Attention Extractor Capability
 * Surfaces where attention is currently allocated, what distracts or fragments it,
 * and where it should compound for leverage and living more.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - priority-sorter     → rank what deserves attention
 * - energy-extractor    → what drains vs restores focus
 * - boundary-extractor  → protect attention from expansion
 * - presence-extractor  → direct attention toward actual living
 * - attention-extractor → make the allocation of attention itself visible and actionable
 */

export interface AttentionItem {
  item: string;
  type?: 'allocation' | 'distraction' | 'fragmentation' | 'leverage' | 'living' | 'unknown';
  intensity?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface AttentionResult {
  attention: AttentionItem[];
  gaps: string[];
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
      /\b(attention|focus|distract|distraction|fragment|scattered|deep work|shallow|context switch|multitask)\b/i,
      /\b(inbox|notification|slack|email|meeting|interrupt|ping)\b/i,
      /\b(priority|important|urgent|high leverage|compound|flow)\b/i,
      /\b(present|living|life|family|rest|play|joy)\b/i,
      /\b(waste|overhead|busywork|admin|low value)\b/i,
    ];

    const allocationHints = /\b(spend|spent|hours on|time on|focus on|attention on)\b/i;
    const distractionHints = /\b(distract|notification|inbox|slack|email|interrupt|ping|context switch)\b/i;
    const fragmentationHints = /\b(fragment|scattered|multitask|jumping|switching)\b/i;
    const leverageHints = /\b(leverage|compound|high impact|deep work|important|priority)\b/i;
    const livingHints = /\b(life|family|rest|play|joy|present|living)\b/i;
    const highHints = /\b(constantly|always|most of|majority|deep)\b/i;
    const lowHints = /\b(occasional|sometimes|a bit|little)\b/i;
    const gapHints = /\b(no focus|scattered all day|always reactive|inbox driven)\b/i;

    const attention: AttentionItem[] = [];
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

      if (attentionPatterns.some(p => p.test(cleaned))) {
        let type: AttentionItem['type'] = 'unknown';
        if (distractionHints.test(cleaned)) type = 'distraction';
        else if (fragmentationHints.test(cleaned)) type = 'fragmentation';
        else if (leverageHints.test(cleaned)) type = 'leverage';
        else if (livingHints.test(cleaned)) type = 'living';
        else if (allocationHints.test(cleaned)) type = 'allocation';

        let intensity: AttentionItem['intensity'] = 'medium';
        if (highHints.test(cleaned)) intensity = 'high';
        else if (lowHints.test(cleaned)) intensity = 'low';

        if (!attention.some(a => a.item === cleaned)) {
          attention.push({
            item: cleaned,
            type,
            intensity,
            note:
              type === 'distraction'
                ? 'Attention leak — candidate to boundary or eliminate'
                : type === 'fragmentation'
                  ? 'Fragmentation signal — batch or protect deep blocks'
                  : type === 'leverage'
                    ? 'High-leverage allocation — protect and amplify'
                    : type === 'living'
                      ? 'Living-directed attention — expand this'
                      : 'Attention signal — make the allocation intentional',
          });
        }
      }
    }

    if (attention.length === 0) {
      gaps.push('No explicit attention signals found — allocation is invisible by default');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          attention.push({
            item: line,
            type: 'unknown',
            intensity: 'medium',
            note: 'Candidate for attention review — is this where focus should compound?',
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

    return { attention, gaps };
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
