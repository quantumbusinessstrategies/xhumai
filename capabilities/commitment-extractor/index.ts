import { logUsage } from '../../backend/utils/logger';

/**
 * Commitment Extractor Capability
 * Surfaces promises, commitments, and agreements from free-form notes
 * so obligations are visible and loops close instead of drifting.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - action-extractor      → what to do next
 * - decision-extractor    → what was settled (or still open)
 * - follow-up-extractor   → who/what still needs a touch
 * - deadline-extractor    → when it must happen
 * - blocker-extractor     → what is in the way right now
 * - owner-extractor       → who owns it
 * - priority-sorter       → where attention should go
 * - risk-extractor        → what could go wrong so we see it early
 * - opportunity-extractor → what could go right so we capture it early
 * - insight-extractor     → what we learned / what stands out
 * - commitment-extractor  → what was promised so trust compounds
 */

export interface CommitmentItem {
  commitment: string;
  party?: string;
  strength?: 'high' | 'medium' | 'low';
  context?: string;
}

export interface CommitmentResult {
  commitments: CommitmentItem[];
}

export async function runCommitmentExtractor(input: string): Promise<CommitmentResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract commitments');
    }

    // --- STUB LOGIC (replace with real model later) ---
    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const commitmentPatterns = [
      /\b(commit(?:ted|ment)?|promise[d]?|agree[d]?|agreement|will (do|send|ship|deliver|review|call|meet)|i('ll| will)|we('ll| will)|they('ll| will))\b/i,
      /\b(guaranteed?|on the hook|owed?|owing|signed off|greenlit)\b/i,
      /\b(by (eod|eow|monday|tuesday|wednesday|thursday|friday|next week))\b/i,
    ];

    const highStrength = /\b(firm|definite|guaranteed|must|will definitely|signed)\b/i;
    const lowStrength = /\b(maybe|might|try to|hope to|if possible)\b/i;
    const partyMatch = /\b(I|we|they|he|she|[A-Z][a-z]+)\b/;

    const commitments: CommitmentItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (commitmentPatterns.some(p => p.test(cleaned))) {
        let strength: CommitmentItem['strength'] = 'medium';
        if (highStrength.test(cleaned)) strength = 'high';
        else if (lowStrength.test(cleaned)) strength = 'low';

        const who = cleaned.match(partyMatch);
        if (!commitments.some(c => c.commitment === cleaned)) {
          commitments.push({
            commitment: cleaned,
            party: who ? who[0] : undefined,
            strength,
            context: cleaned.length > 90 ? cleaned.slice(0, 90) + '…' : cleaned,
          });
        }
      }
    }

    if (commitments.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          commitments.push({
            commitment: line,
            strength: 'low',
            context: line,
          });
        }
      }
    }
    // ------------------------------------------------

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'commitment-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { commitments };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'commitment-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
