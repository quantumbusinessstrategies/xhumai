import { logUsage } from '../../backend/utils/logger';

/**
 * Decline Extractor Capability
 * Surfaces requests, invites, obligations, and scopes that should be declined,
 * deferred, or narrowed so capacity returns to living more.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - elimination-extractor → work already on the plate that can be cut
 * - delegation-extractor  → work that should leave the founder
 * - boundary-extractor    → lines that protect capacity
 * - reclaim-extractor     → time sinks already consuming hours
 * - decline-extractor     → incoming yeses that should be nos
 */

export interface DeclineItem {
  request: string;
  verdict: 'decline' | 'defer' | 'narrow' | 'review';
  why: string;
  hoursAtStake?: 'low' | 'medium' | 'high';
}

export interface DeclineResult {
  declines: DeclineItem[];
  creed: 'Work Less. Live More.';
}

export async function runDeclineExtractor(input: string): Promise<DeclineResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract declines');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const declinePatterns = [
      /\b(can you|could you|would you|please|request|invite|invitation|meeting|sync|call|hop on|quick chat|intro|review this|take a look|join|rsvp|committee|optional)\b/i,
      /\b(should we|do we need|worth it|low priority|nice to have|not sure we|someone else)\b/i,
    ];
    const deferHints = /\b(later|next quarter|after|once|when we|not now|defer|postpone)\b/i;
    const narrowHints = /\b(scope|just the|only|narrow|smaller|part of|subset)\b/i;
    const hardNoHints = /\b(decline|say no|pass|not doing|out of scope|won't|will not|no bandwidth|overbooked|optional)\b/i;

    const declines: DeclineItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*•]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;
      if (!declinePatterns.some(p => p.test(cleaned)) && !hardNoHints.test(cleaned)) continue;
      if (declines.some(d => d.request === cleaned)) continue;

      let verdict: DeclineItem['verdict'] = 'review';
      if (hardNoHints.test(cleaned)) verdict = 'decline';
      else if (deferHints.test(cleaned)) verdict = 'defer';
      else if (narrowHints.test(cleaned)) verdict = 'narrow';
      else if (/\b(meeting|sync|call|invite|optional)\b/i.test(cleaned)) verdict = 'decline';

      declines.push({
        request: cleaned,
        verdict,
        why: verdict === 'decline'
          ? 'Incoming demand that spends life without compounding leverage'
          : verdict === 'defer'
            ? 'Not now — protecting current capacity'
            : verdict === 'narrow'
              ? 'A smaller yes preserves the useful part'
              : 'Candidate for an explicit no, defer, or narrower yes',
        hoursAtStake: /\b(weekly|recurring|every|ongoing|committee)\b/i.test(cleaned) ? 'high' : cleaned.length > 90 ? 'medium' : 'low',
      });
    }

    if (declines.length === 0) {
      for (const line of lines.slice(0, 2)) {
        if (line.length < 160) {
          declines.push({
            request: line,
            verdict: 'review',
            why: 'No explicit ask found — review whether this still deserves a yes',
            hoursAtStake: 'low',
          });
        }
      }
    }

    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'decline-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { declines, creed: 'Work Less. Live More.' };
  } catch (error: any) {
    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'decline-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });
    throw error;
  }
}
