import { logUsage } from '../../backend/utils/logger';

/**
 * Margin Extractor Capability
 * Surfaces buffers, slack, unscheduled time, protected margin, and places where
 * capacity is fully allocated so life has room to exist instead of being residual.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - boundary-extractor  → lines that protect capacity
 * - rest-extractor       → protected non-work time
 * - reclaim-extractor    → recoverable hours
 * - rhythm-extractor     → natural cadence that makes hours usable
 * - margin-extractor     → the unallocated space that makes living possible
 */

export interface MarginItem {
  item: string;
  type?: 'buffer' | 'slack' | 'unscheduled' | 'overallocated' | 'unknown';
  note?: string;
}

export interface MarginResult {
  margins: MarginItem[];
  gaps: string[];
}

export async function runMarginExtractor(input: string): Promise<MarginResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract margin signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const marginPatterns = [
      /\b(buffer|slack|margin|unscheduled|open time|free time|space|breathing room|padding)\b/i,
      /\b(fully booked|packed|no time|always busy|no room|overcommitted|back to back)\b/i,
      /\b(protect|reserve|hold|keep open|block time|white space)\b/i,
    ];

    const bufferHints = /\b(buffer|padding|cushion|slack|margin|room)\b/i;
    const slackHints = /\b(slack|flexible|optional|can move|wiggle)\b/i;
    const unscheduledHints = /\b(unscheduled|open|free|nothing|blank|white space)\b/i;
    const overHints = /\b(packed|fully|no time|always|back to back|over|committed|busy)\b/i;
    const gapHints = /\b(no margin|no buffer|fully allocated|zero slack|no breathing room)\b/i;

    const margins: MarginItem[] = [];
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

      if (marginPatterns.some(p => p.test(cleaned))) {
        let type: MarginItem['type'] = 'unknown';
        if (bufferHints.test(cleaned)) type = 'buffer';
        else if (slackHints.test(cleaned)) type = 'slack';
        else if (unscheduledHints.test(cleaned)) type = 'unscheduled';
        else if (overHints.test(cleaned)) type = 'overallocated';

        if (!margins.some(m => m.item === cleaned)) {
          margins.push({
            item: cleaned,
            type,
            note:
              type === 'buffer'
                ? 'Buffer — protect this so the system does not shatter when reality arrives'
                : type === 'slack'
                  ? 'Slack — this flexibility is the margin that keeps life from being residual'
                  : type === 'unscheduled'
                    ? 'Unscheduled space — this is where living more actually happens; do not fill it by default'
                    : type === 'overallocated'
                      ? 'Overallocated — no margin left; life is only what remains after work'
                      : 'Margin signal — name the unallocated space so capacity returns to living more',
          });
        }
      }
    }

    if (margins.length === 0) {
      gaps.push('No explicit margin signals found — capacity is fully allocated and life remains residual');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          margins.push({
            item: line,
            type: 'unknown',
            note: 'Candidate for margin review — where is the unallocated space?',
          });
        }
      }
    }

    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'margin-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { margins, gaps };
  } catch (error: any) {
    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'margin-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });
    throw error;
  }
}
