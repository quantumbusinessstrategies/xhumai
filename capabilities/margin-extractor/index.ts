import { logUsage } from '../../backend/utils/logger';

/**
 * Margin Extractor Capability
 * Surfaces missing buffers, unprotected open blocks, and the reflex
 * to refill reclaimed time. Work extractors return hours; this one
 * keeps those hours from being eaten by the next task.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - reclaim-extractor   → hours that can come back
 * - rhythm-extractor    → when to push and when to stop
 * - boundary-extractor  → lines that protect capacity
 * - presence-extractor  → where returned hours should land
 * - enough-extractor    → when a piece of work is done
 * - margin-extractor    → the slack that must stay empty
 */

export interface MarginItem {
  item: string;
  kind?: 'buffer' | 'refill' | 'unprotected' | 'recovery-gap' | 'unknown';
  note?: string;
}

export interface MarginResult {
  margins: MarginItem[];
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
      /\b(margin|buffer|slack|white space|open block|free hour|gap between|blank calendar)\b/i,
      /\b(back to back|back-to-back|no break|no gap|stacked|wall to wall|packed day)\b/i,
      /\b(fill the|use the (free|open) time|I'll just|i'll just|squeeze in|while I have a minute)\b/i,
      /\b(decompress|recovery|come down|transition|between meetings|after the call)\b/i,
      /\b(protect the (evening|morning|afternoon)|leave it empty|do not book|don't book)\b/i,
      /\b(live more|unscheduled|nothing planned|actually off)\b/i,
    ];

    const bufferHints = /\b(margin|buffer|slack|white space|open block|gap between|leave it empty|don't book|do not book)\b/i;
    const refillHints = /\b(fill the|use the (free|open) time|I'll just|i'll just|squeeze in|while I have a minute|might as well)\b/i;
    const unprotectedHints = /\b(free hour|open afternoon|nothing on the calendar|gap before|if it stays open)\b/i;
    const recoveryHints = /\b(no break|back to back|back-to-back|packed|stacked|decompress|recovery|between meetings|come down|transition)\b/i;

    const margins: MarginItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;
      if (!marginPatterns.some(p => p.test(cleaned))) continue;

      let kind: MarginItem['kind'] = 'unknown';
      if (refillHints.test(cleaned)) kind = 'refill';
      else if (recoveryHints.test(cleaned)) kind = 'recovery-gap';
      else if (unprotectedHints.test(cleaned)) kind = 'unprotected';
      else if (bufferHints.test(cleaned)) kind = 'buffer';

      if (!margins.some(m => m.item === cleaned)) {
        margins.push({
          item: cleaned,
          kind,
          note:
            kind === 'refill'
              ? 'Returned time is about to be spent on work — name it and leave the block empty'
              : kind === 'recovery-gap'
                ? 'No decompression between loads — insert a real buffer or the next block borrows from life'
                : kind === 'unprotected'
                  ? 'Open time with no owner — work will claim it unless presence does'
                  : kind === 'buffer'
                    ? 'Margin worth defending — this slack is the product, not leftover'
                    : 'Margin signal — ask whether this space stays empty or gets refilled',
        });
      }
    }

    if (margins.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          margins.push({
            item: line,
            kind: 'unknown',
            note: 'Candidate for margin review — buffer, unprotected open block, or refill reflex',
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

    return { margins };
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
