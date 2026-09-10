import { logUsage } from '../../backend/utils/logger';

/**
 * Waste Extractor Capability
 * Surfaces low-leverage, repetitive, status-theater, and time-wasting activity
 * from free-form notes so the system can cut it, automate it, or drop it.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - energy-extractor      → what drains life-force
 * - leverage-extractor    → what keeps working after you stop
 * - delegation-extractor  → what should leave the founder's hands
 * - priority-sorter       → where attention should go
 * - waste-extractor       → what should simply stop existing
 */

export interface WasteItem {
  item: string;
  kind?: 'repetitive' | 'low-leverage' | 'status' | 'context-switch' | 'rework' | 'unknown';
  severity?: 'high' | 'medium' | 'low';
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
      /\b(waste|wasting|wasted|busywork|busy work|busy-work|low.?leverage|low impact|status update|status theater|meeting about meetings)\b/i,
      /\b(rework|redo|re-do|rehash|circular|looping|same conversation|again and again|over and over)\b/i,
      /\b(context switch|context-switching|too many tools|tool sprawl|inbox zero theater|notification hell)\b/i,
      /\b(manual (copy|entry|report|sync)|copy.?paste|spreadsheet hell|status slide|deck for the sake of)\b/i,
      /\b(should not exist|could be automated|no one reads|vanity metric|performative)\b/i,
    ];

    const kindHints: Array<{ re: RegExp; kind: WasteItem['kind'] }> = [
      { re: /\b(repetitive|again and again|over and over|manual (copy|entry|report)|copy.?paste)\b/i, kind: 'repetitive' },
      { re: /\b(low.?leverage|low impact|vanity|no one reads|performative)\b/i, kind: 'low-leverage' },
      { re: /\b(status update|status theater|status slide|deck for the sake)\b/i, kind: 'status' },
      { re: /\b(context switch|notification|tool sprawl|too many tools)\b/i, kind: 'context-switch' },
      { re: /\b(rework|redo|rehash|circular|looping)\b/i, kind: 'rework' },
    ];

    const highHints = /\b(extreme|constantly|always|crushing|hours of|every day|chronic)\b/i;
    const lowHints = /\b(slightly|occasional|mild|sometimes)\b/i;

    const waste: WasteItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (wastePatterns.some(p => p.test(cleaned))) {
        let kind: WasteItem['kind'] = 'unknown';
        for (const h of kindHints) {
          if (h.re.test(cleaned)) {
            kind = h.kind;
            break;
          }
        }

        let severity: WasteItem['severity'] = 'medium';
        if (highHints.test(cleaned)) severity = 'high';
        else if (lowHints.test(cleaned)) severity = 'low';

        if (!waste.some(w => w.item === cleaned)) {
          waste.push({
            item: cleaned,
            kind,
            severity,
            note:
              kind === 'repetitive'
                ? 'Candidate for automation or elimination'
                : kind === 'low-leverage'
                  ? 'Candidate to drop or redesign for leverage'
                  : kind === 'status'
                    ? 'Candidate to replace with async signal or kill'
                    : kind === 'context-switch'
                      ? 'Candidate to batch, reduce tools, or protect deep work'
                      : kind === 'rework'
                        ? 'Candidate to fix root cause so it never repeats'
                        : 'Waste-relevant signal — consider cutting',
          });
        }
      }
    }

    if (waste.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          waste.push({
            item: line,
            kind: 'unknown',
            severity: 'medium',
            note: 'Candidate for waste review',
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
