import { logUsage } from '../../backend/utils/logger';

/**
 * Enough Extractor Capability
 * Surfaces finish lines, diminishing returns, and explicit stop conditions
 * so work ends and the hours the creed returns are actually lived.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - decline-extractor    → incoming yeses that should be nos
 * - boundary-extractor   → lines that protect capacity
 * - reclaim-extractor    → time sinks already consuming hours
 * - presence-extractor   → what reclaimed hours return to
 * - enough-extractor     → when the current work is already enough
 */

export interface EnoughItem {
  signal: string;
  kind: 'finish-line' | 'diminishing' | 'stop-condition' | 'already-done' | 'review';
  note: string;
}

export interface EnoughResult {
  enough: EnoughItem[];
  creed: 'Work Less. Live More.';
}

export async function runEnoughExtractor(input: string): Promise<EnoughResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract enough-signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const enoughPatterns = [
      /\b(good enough|enough|done for today|call it|ship it|stop here|finish line|definition of done|diminishing|overworking|one more pass|polish|perfect)\b/i,
      /\b(already (done|shipped|sent|decided)|no more value|not worth more|close the laptop|sign off|end of day|shutdown)\b/i,
      /\b(until|once .+ then stop|when .+ stop|cap at|time box|time-box|hard stop)\b/i,
    ];
    const finishHints = /\b(done|ship|finish line|definition of done|call it|sent|closed)\b/i;
    const diminishHints = /\b(diminishing|one more pass|polish|perfect|not worth|overwork|tweak)\b/i;
    const stopHints = /\b(stop|hard stop|time box|time-box|cap at|sign off|shutdown|end of day|close the laptop)\b/i;
    const doneHints = /\b(already (done|shipped|sent|decided)|no more value)\b/i;

    const enough: EnoughItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;
      if (!enoughPatterns.some(p => p.test(cleaned))) continue;
      if (enough.some(e => e.signal === cleaned)) continue;

      let kind: EnoughItem['kind'] = 'review';
      if (doneHints.test(cleaned)) kind = 'already-done';
      else if (stopHints.test(cleaned)) kind = 'stop-condition';
      else if (diminishHints.test(cleaned)) kind = 'diminishing';
      else if (finishHints.test(cleaned)) kind = 'finish-line';

      enough.push({
        signal: cleaned,
        kind,
        note:
          kind === 'already-done'
            ? 'The work has already landed — further hours do not buy more life'
            : kind === 'stop-condition'
              ? 'An explicit stop. Honor it so living more is not postponed'
              : kind === 'diminishing'
                ? 'More effort here returns less. Stop and return the hour'
                : kind === 'finish-line'
                  ? 'A finish line. Crossing it is the win, not continuing past it'
                  : 'Candidate stop signal — decide what enough looks like before starting',
      });
    }

    if (enough.length === 0) {
      for (const line of lines.slice(0, 2)) {
        if (line.length < 160) {
          enough.push({
            signal: line,
            kind: 'review',
            note: 'No explicit stop found — name the finish line before more hours go in',
          });
        }
      }
    }

    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'enough-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { enough, creed: 'Work Less. Live More.' };
  } catch (error: any) {
    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'enough-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });
    throw error;
  }
}
