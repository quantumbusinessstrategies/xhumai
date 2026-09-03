import { logUsage } from '../../backend/utils/logger';

/**
 * Owner Extractor Capability
 * Surfaces owners, assignees, and responsible parties from free-form notes
 * so accountability is clear and nothing floats without a name.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - action-extractor     → what to do next
 * - decision-extractor   → what was settled (or still open)
 * - follow-up-extractor  → who/what still needs a touch
 * - deadline-extractor   → when it must happen
 * - blocker-extractor    → what is in the way
 * - owner-extractor      → who owns it so accountability is visible
 */

export interface OwnerItem {
  item: string;
  owner: string;
  role?: 'owner' | 'assignee' | 'responsible' | 'lead';
  context?: string;
}

export interface OwnerResult {
  owners: OwnerItem[];
}

export async function runOwnerExtractor(input: string): Promise<OwnerResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract owners');
    }

    // --- STUB LOGIC (replace with real model later) ---
    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const ownerPatterns = [
      /\b(owned by|owner|assignee|assigned to|responsible for|led by|lead is|@)\b/i,
      /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(owns|will own|is responsible|is leading|takes|handling)\b/i,
      /\b(I|we|you|they)\s+(will|should|need to)\s+/i,
    ];

    const namePattern = /\b(?:by|to|for|@)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?|[A-Z]{2,})\b/;
    const stopWords = /^(The|This|That|We|I|You|They|It|And|Or|But|For|With|From|By|On|Until|Once|After|Need|Missing|Owner|Assignee|Lead|Team|Project)$/i;

    const owners: OwnerItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (ownerPatterns.some(p => p.test(cleaned))) {
        let owner = 'Unspecified';
        const nameMatch = cleaned.match(namePattern);
        if (nameMatch && nameMatch[1] && nameMatch[1].length > 1 && !stopWords.test(nameMatch[1])) {
          owner = nameMatch[1];
        }

        // Prefer explicit @mentions
        const atMatch = cleaned.match(/@([A-Za-z][A-Za-z0-9_]+)/);
        if (atMatch) owner = atMatch[1];

        let role: OwnerItem['role'] = 'owner';
        if (/\b(assignee|assigned to)\b/i.test(cleaned)) role = 'assignee';
        else if (/\b(responsible|takes ownership)\b/i.test(cleaned)) role = 'responsible';
        else if (/\b(lead|led by|leading)\b/i.test(cleaned)) role = 'lead';

        if (!owners.some(o => o.item === cleaned && o.owner === owner)) {
          owners.push({
            item: cleaned,
            owner,
            role,
            context: cleaned.length > 90 ? cleaned.slice(0, 90) + '…' : cleaned,
          });
        }
      }
    }

    // Light fallback so sparse input still returns value
    if (owners.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          const nameMatch = line.match(namePattern);
          const owner = nameMatch && nameMatch[1] && !stopWords.test(nameMatch[1])
            ? nameMatch[1]
            : 'Unspecified';
          owners.push({ item: line, owner, context: line, role: 'owner' });
        }
      }
    }
    // ------------------------------------------------

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'owner-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { owners };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'owner-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
