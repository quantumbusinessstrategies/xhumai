import { logUsage } from '../../backend/utils/logger';

/**
 * Release Extractor Capability
 * Surfaces held work, old commitments, and identities that can be let go
 * so capacity returns to living more instead of maintaining the past.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - decline-extractor    → incoming requests that should be nos
 * - elimination-extractor → work that can be cut before it starts
 * - enough-extractor     → when current work is already enough
 * - commitment-extractor → obligations still in force
 * - release-extractor    → what is already held and can be put down
 */

export interface ReleaseItem {
  item: string;
  kind: 'held-project' | 'old-commitment' | 'identity' | 'open-loop' | 'review';
  note: string;
}

export interface ReleaseResult {
  releases: ReleaseItem[];
  creed: 'Work Less. Live More.';
}

export async function runReleaseExtractor(input: string): Promise<ReleaseResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract release signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const releasePatterns = [
      /\b(let go|release|drop|abandon|sunset|retire|archive|shelve|park|put down|hand off|walk away)\b/i,
      /\b(still holding|holding onto|can't let go|cannot let go|old project|legacy|no longer|used to|identity|I am the one who)\b/i,
      /\b(open loop|unfinished|never closed|guilt|should have|owed|keeping alive)\b/i,
    ];
    const projectHints = /\b(project|initiative|product|side|legacy|version|build)\b/i;
    const commitmentHints = /\b(promise|committed|owed|obligation|said I would|keeping alive)\b/i;
    const identityHints = /\b(identity|I am the one|role|founder|only person who|can't stop being)\b/i;
    const loopHints = /\b(open loop|unfinished|never closed|still holding|guilt|should have)\b/i;

    const releases: ReleaseItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*•]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;
      if (!releasePatterns.some(p => p.test(cleaned))) continue;
      if (releases.some(r => r.item === cleaned)) continue;

      let kind: ReleaseItem['kind'] = 'review';
      if (identityHints.test(cleaned)) kind = 'identity';
      else if (commitmentHints.test(cleaned)) kind = 'old-commitment';
      else if (loopHints.test(cleaned)) kind = 'open-loop';
      else if (projectHints.test(cleaned)) kind = 'held-project';

      releases.push({
        item: cleaned,
        kind,
        note:
          kind === 'identity'
            ? 'An identity that keeps the work alive. Releasing it returns the person, not just the hour'
            : kind === 'old-commitment'
              ? 'A promise past its usefulness. Close or renegotiate so it stops taxing the present'
              : kind === 'open-loop'
                ? 'An unfinished loop held in the head. Close, archive, or explicitly drop it'
                : kind === 'held-project'
                  ? 'A project still consuming care. Sunset, archive, or hand off so life is not the remainder'
                  : 'Candidate for release — name what ends if this is put down',
      });
    }

    if (releases.length === 0) {
      for (const line of lines.slice(0, 2)) {
        if (line.length < 160) {
          releases.push({
            item: line,
            kind: 'review',
            note: 'No explicit release named — ask what is being held that no longer earns its hours',
          });
        }
      }
    }

    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'release-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { releases, creed: 'Work Less. Live More.' };
  } catch (error: any) {
    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'release-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });
    throw error;
  }
}
