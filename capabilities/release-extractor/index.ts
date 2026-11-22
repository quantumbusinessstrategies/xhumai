import { logUsage } from '../../backend/utils/logger';

/**
 * Release Extractor Capability
 * Surfaces burdens, obligations, commitments, identities, and attachments that can be released or let go of
 * so capacity permanently returns to living more instead of being held by what no longer serves.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - elimination-extractor → low-value work that should not exist
 * - enough-extractor     → what is already enough
 * - sovereignty-extractor → reclaiming personal agency
 * - boundary-extractor   → limits that stop expansion
 */

export interface ReleaseItem {
  item: string;
  type?: 'burden' | 'obligation' | 'identity' | 'attachment' | 'unknown';
  urgency?: 'now' | 'soon' | 'consider';
  note?: string;
}

export interface ReleaseResult {
  releases: ReleaseItem[];
  gaps: string[];
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
      /\b(let go|release|drop|shed|abandon|quit|stop carrying|no longer|doesn't serve|burden|weight|obligation|should|must|have to)\b/i,
      /\b(identity|role|story|belief|attachment|holding on|clinging|guilt|shame|resentment)\b/i,
    ];

    const burdenHints = /\b(burden|weight|heavy|carrying|draining|exhausting|shoulders)\b/i;
    const obligationHints = /\b(obligation|commitment|promise|duty|have to|must|should|owe)\b/i;
    const identityHints = /\b(I am|identity|role|who I|story I tell|persona)\b/i;
    const attachmentHints = /\b(attachment|clinging|holding on|can't let|afraid to lose)\b/i;
    const nowHints = /\b(now|immediately|today|release it|let it go|done with)\b/i;
    const soonHints = /\b(soon|next|planning to|want to)\b/i;
    const gapHints = /\b(still carrying|can't drop|afraid|guilt|what if|obligation forever)\b/i;

    const releases: ReleaseItem[] = [];
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

      if (releasePatterns.some(p => p.test(cleaned))) {
        let type: ReleaseItem['type'] = 'unknown';
        if (burdenHints.test(cleaned)) type = 'burden';
        else if (obligationHints.test(cleaned)) type = 'obligation';
        else if (identityHints.test(cleaned)) type = 'identity';
        else if (attachmentHints.test(cleaned)) type = 'attachment';

        let urgency: ReleaseItem['urgency'] = 'consider';
        if (nowHints.test(cleaned)) urgency = 'now';
        else if (soonHints.test(cleaned)) urgency = 'soon';

        if (!releases.some(r => r.item === cleaned)) {
          releases.push({
            item: cleaned,
            type,
            urgency,
            note:
              type === 'burden'
                ? 'Burden that can be released — name it so capacity is no longer consumed by the weight'
                : type === 'obligation'
                  ? 'Obligation that may no longer serve — examine if it can be completed, delegated, or dropped'
                  : type === 'identity'
                    ? 'Identity or story that constrains — releasing it expands the space for living more'
                    : type === 'attachment'
                      ? 'Attachment that holds energy — releasing it returns capacity permanently'
                      : 'Release candidate — surface it so what no longer serves can stop occupying life',
          });
        }
      }
    }

    if (releases.length === 0) {
      gaps.push('No explicit release signals found — burdens may still be carried unconsciously, keeping capacity trapped');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          releases.push({
            item: line,
            type: 'unknown',
            urgency: 'consider',
            note: 'Candidate for release — ask if this still serves living more or merely occupies space',
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

    return { releases, gaps };
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
