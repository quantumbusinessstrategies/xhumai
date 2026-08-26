import { logUsage } from '../../backend/utils/logger';

/**
 * Commitment Extractor Capability
 * Surfaces promises, commitments, obligations, and "I will / we will" statements from free-form notes
 * so accountability compounds and nothing is left hanging.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - action-extractor      → what to do next
 * - decision-extractor    → what was settled
 * - follow-up-extractor   → who/what still needs a touch
 * - owner-extractor       → who owns it
 * - commitment-extractor  → what was promised / obligated so nothing is forgotten
 */

export interface CommitmentItem {
  commitment: string;
  party?: string;
  strength?: 'hard' | 'soft' | 'implied';
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
      /\b(commit(ment|ted|s)?|promise[ds]?|obligat(e|ed|ion|ions)|pledge[ds]?|vow(ed)?|guarantee[ds]?)\b/i,
      /\b(I (will|shall|am going to)|we (will|shall|are going to)|I'll|we'll)\b/i,
      /\b(agreed to|signed up|taking on|owning|responsible for delivering)\b/i,
      /\b(by (when|then)|deliver(able|ables)? by|due from me|my action)\b/i,
    ];

    const hardStrength = /\b(must|will|shall|guarantee|promise|committed|hard commit)\b/i;
    const softStrength = /\b(try|hope|aim|intend|plan to|soft)\b/i;

    const commitments: CommitmentItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/u, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (commitmentPatterns.some(p => p.test(cleaned))) {
        let strength: CommitmentItem['strength'] = 'implied';
        if (hardStrength.test(cleaned)) strength = 'hard';
        else if (softStrength.test(cleaned)) strength = 'soft';

        if (!commitments.some(c => c.commitment === cleaned)) {
          commitments.push({
            commitment: cleaned,
            strength,
            context: cleaned.length > 90 ? cleaned.slice(0, 90) + '…' : cleaned,
          });
        }
      }
    }

    // Light fallback so sparse input still returns value
    if (commitments.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          commitments.push({
            commitment: line,
            strength: 'implied',
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
