import { logUsage } from '../../backend/utils/logger';

/**
 * Waste Extractor Capability
 * Surfaces time sinks, low-ROI activities, busywork, and eliminable work from free-form notes
 * so the system can shrink the unnecessary and free capacity for living more.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - energy-extractor     → what costs life-force vs what returns it
 * - delegation-extractor → what should leave the founder's hands
 * - leverage-extractor   → what keeps working after you stop
 * - priority-sorter      → where attention should go
 * - waste-extractor      → what can simply be stopped or removed
 */

export interface WasteItem {
  item: string;
  kind?: 'busywork' | 'low-roi' | 'redundant' | 'over-processing' | 'waiting' | 'other';
  impact?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface WasteResult {
  waste: WasteItem[];
}

export async function runWasteExtractor(input: string): Promise<WasteResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract waste signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const wastePatterns = [
      /\b(waste|wasting|busywork|busy work|low.?roi|low return|pointless|unnecessary|redundant|duplicate|over.?process|micromanag|status update for the sake|meeting that could be|email chain|context switch|context-switch|toil|grind|busy for the sake)\b/i,
      /\b(stop doing|eliminate|cut|drop|remove|no longer needed|can live without|does not move the needle|not worth it)\b/i,
      /\b(waiting on|idle time|blocked waiting|queue time|hand.?off delay)\b/i,
      /\b(rework|redo|re-do|fix the same|again and again)\b/i,
    ];

    const busyworkHints = /\b(busywork|busy work|status update|meeting that could|email chain|toil|grind)\b/i;
    const lowRoiHints = /\b(low.?roi|low return|pointless|not worth|does not move the needle)\b/i;
    const redundantHints = /\b(redundant|duplicate|again and again|rework|redo)\b/i;
    const overHints = /\b(over.?process|micromanag|too many steps)\b/i;
    const waitingHints = /\b(waiting on|idle|queue|hand.?off delay)\b/i;
    const highHints = /\b(huge|massive|constant|always|killing|crushing|major)\b/i;
    const lowHints = /\b(slight|minor|occasional|small)\b/i;

    const waste: WasteItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (wastePatterns.some(p => p.test(cleaned))) {
        let kind: WasteItem['kind'] = 'other';
        if (busyworkHints.test(cleaned)) kind = 'busywork';
        else if (lowRoiHints.test(cleaned)) kind = 'low-roi';
        else if (redundantHints.test(cleaned)) kind = 'redundant';
        else if (overHints.test(cleaned)) kind = 'over-processing';
        else if (waitingHints.test(cleaned)) kind = 'waiting';

        let impact: WasteItem['impact'] = 'medium';
        if (highHints.test(cleaned)) impact = 'high';
        else if (lowHints.test(cleaned)) impact = 'low';

        if (!waste.some(w => w.item === cleaned)) {
          waste.push({
            item: cleaned,
            kind,
            impact,
            note:
              kind === 'busywork'
                ? 'Candidate to stop or radically simplify'
                : kind === 'low-roi'
                  ? 'Candidate to cut or deprioritize hard'
                  : kind === 'redundant'
                    ? 'Candidate to collapse into one source of truth'
                    : kind === 'waiting'
                      ? 'Candidate to remove the wait or parallelize'
                      : 'Candidate for elimination or redesign',
          });
        }
      }
    }

    if (waste.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          waste.push({
            item: line,
            kind: 'other',
            impact: 'medium',
            note: 'Candidate for waste review — does this still need to exist?',
          });
        }
      }
    }

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'waste-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { waste };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'waste-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
