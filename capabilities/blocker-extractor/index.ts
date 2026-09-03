import { logUsage } from '../../backend/utils/logger';

/**
 * Blocker Extractor Capability
 * Surfaces blockers, dependencies, and friction points from free-form notes
 * so work unblocks and nothing stalls.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - action-extractor     → what to do next
 * - decision-extractor   → what was settled (or still open)
 * - follow-up-extractor  → who/what still needs a touch
 * - deadline-extractor   → when it must happen
 * - blocker-extractor    → what is in the way so friction becomes visible
 */

export interface BlockerItem {
  item: string;
  type?: 'blocker' | 'dependency' | 'risk' | 'friction';
  owner?: string;
  context?: string;
}

export interface BlockerResult {
  blockers: BlockerItem[];
}

export async function runBlockerExtractor(input: string): Promise<BlockerResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract blockers');
    }

    // --- STUB LOGIC (replace with real model later) ---
    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const blockerPatterns = [
      /\b(blocked|blocker|blocking|stuck|waiting on|depends on|dependency|dependent on)\b/i,
      /\b(can't|cannot|unable|won't|will not|prevented|held up|bottleneck)\b/i,
      /\b(risk|risks|at risk|jeopardy|threat|obstacle|hurdle|friction|impediment)\b/i,
      /\b(need (access|approval|permission|budget|resource|help from)|missing|lacking)\b/i,
      /\b(until we|once we have|after .+ is|pending .+ from)\b/i,
    ];

    const typePatterns: { pattern: RegExp; type: BlockerItem['type'] }[] = [
      { pattern: /\b(blocked|blocker|blocking|stuck|held up|bottleneck)\b/i, type: 'blocker' },
      { pattern: /\b(depends on|dependency|dependent on|until we|once we have|pending)\b/i, type: 'dependency' },
      { pattern: /\b(risk|risks|at risk|jeopardy|threat)\b/i, type: 'risk' },
      { pattern: /\b(friction|obstacle|hurdle|impediment|can't|cannot|unable)\b/i, type: 'friction' },
    ];

    const ownerPattern = /\b(?:by|from|with|for|on|@)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?|[A-Z]{2,})\b/;

    const blockers: BlockerItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (blockerPatterns.some(p => p.test(cleaned))) {
        let type: BlockerItem['type'] = 'blocker';
        for (const tp of typePatterns) {
          if (tp.pattern.test(cleaned)) {
            type = tp.type;
            break;
          }
        }

        let owner: string | undefined;
        const ownerMatch = cleaned.match(ownerPattern);
        if (ownerMatch && ownerMatch[1] && ownerMatch[1].length > 1) {
          const candidate = ownerMatch[1];
          if (!/^(The|This|That|We|I|You|They|It|And|Or|But|For|With|From|By|On|Until|Once|After|Need|Missing)$/i.test(candidate)) {
            owner = candidate;
          }
        }

        if (!blockers.some(b => b.item === cleaned)) {
          blockers.push({
            item: cleaned,
            type,
            owner,
            context: cleaned.length > 90 ? cleaned.slice(0, 90) + '…' : cleaned,
          });
        }
      }
    }

    // Light fallback so sparse input still returns value
    if (blockers.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          blockers.push({ item: line, context: line, type: 'friction' });
        }
      }
    }
    // ------------------------------------------------

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'blocker-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { blockers };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'blocker-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
