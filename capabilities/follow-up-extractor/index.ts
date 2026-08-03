import { logUsage } from '../../backend/utils/logger';

/**
 * Follow-up Extractor Capability
 * Surfaces who/what needs a follow-up from free-form notes so open loops close.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - action-extractor  → what to do next
 * - decision-extractor → what was settled (or still open)
 * - follow-up-extractor → who/what still needs a touch so nothing drifts
 */

export interface FollowUpItem {
  item: string;
  owner?: string;
  context?: string;
}

export interface FollowUpResult {
  followUps: FollowUpItem[];
}

export async function runFollowUpExtractor(input: string): Promise<FollowUpResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract follow-ups');
    }

    // --- STUB LOGIC (replace with real model later) ---
    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const followUpPatterns = [
      /\b(follow[- ]?up|followup|circle back|check in|check back|ping|reconnect|touch base|get back to|reach out|remind|chase)\b/i,
      /\b(waiting on|waiting for|pending from|need response|need reply|owe|owed)\b/i,
      /\b(will get back|I.ll get back|we.ll follow|send update|status update)\b/i,
    ];

    const ownerPattern = /\b(?:by|from|with|for|@)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?|[A-Z]{2,})\b/;

    const followUps: FollowUpItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (followUpPatterns.some(p => p.test(cleaned))) {
        let owner: string | undefined;
        const ownerMatch = cleaned.match(ownerPattern);
        if (ownerMatch && ownerMatch[1] && ownerMatch[1].length > 1) {
          const candidate = ownerMatch[1];
          // Skip common non-names
          if (!/^(The|This|That|We|I|You|They|It|And|Or|But|For|With|From|By)$/i.test(candidate)) {
            owner = candidate;
          }
        }

        if (!followUps.some(f => f.item === cleaned)) {
          followUps.push({
            item: cleaned,
            owner,
            context: cleaned.length > 80 ? cleaned.slice(0, 80) + '…' : cleaned,
          });
        }
      }
    }

    // Light fallback so sparse input still returns value
    if (followUps.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          followUps.push({ item: line, context: line });
        }
      }
    }
    // ------------------------------------------------

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'follow-up-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { followUps };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'follow-up-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
