import { logUsage } from '../../backend/utils/logger';

/**
 * Priority Extractor Capability
 * Surfaces priorities, urgencies, and ranked items from free-form notes
 * so the most important work rises and noise falls.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - action-extractor     → what to do next
 * - decision-extractor   → what was settled (or still open)
 * - follow-up-extractor  → who/what still needs a touch
 * - deadline-extractor   → when it must happen
 * - blocker-extractor    → what is in the way
 * - owner-extractor      → who owns it
 * - priority-extractor   → what matters most so energy goes to the right place
 */

export interface PriorityItem {
  item: string;
  level?: 'critical' | 'high' | 'medium' | 'low';
  reason?: string;
  context?: string;
}

export interface PriorityResult {
  priorities: PriorityItem[];
}

export async function runPriorityExtractor(input: string): Promise<PriorityResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract priorities');
    }

    // --- STUB LOGIC (replace with real model later) ---
    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const priorityPatterns = [
      /\b(priority|priorities|prioritize|urgent|urgency|critical|asap|immediately|top priority|must|highest|most important|P0|P1|P2)\b/i,
      /\b(first|next|focus on|do this first|before anything|key|essential|non-negotiable)\b/i,
      /\b(low priority|later|nice to have|whenever|if time|backlog)\b/i,
    ];

    const levelPatterns: { pattern: RegExp; level: PriorityItem['level'] }[] = [
      { pattern: /\b(critical|P0|asap|immediately|urgent|must|non-negotiable|highest)\b/i, level: 'critical' },
      { pattern: /\b(high|P1|top priority|most important|key|essential|focus on)\b/i, level: 'high' },
      { pattern: /\b(medium|P2|important|should)\b/i, level: 'medium' },
      { pattern: /\b(low|later|nice to have|whenever|if time|backlog)\b/i, level: 'low' },
    ];

    const priorities: PriorityItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (priorityPatterns.some(p => p.test(cleaned))) {
        let level: PriorityItem['level'] = 'medium';
        for (const lp of levelPatterns) {
          if (lp.pattern.test(cleaned)) {
            level = lp.level;
            break;
          }
        }

        if (!priorities.some(p => p.item === cleaned)) {
          priorities.push({
            item: cleaned,
            level,
            reason: level === 'critical' || level === 'high' ? 'explicit urgency signal' : undefined,
            context: cleaned.length > 90 ? cleaned.slice(0, 90) + '…' : cleaned,
          });
        }
      }
    }

    // Light fallback so sparse input still returns value
    if (priorities.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          priorities.push({ item: line, level: 'medium', context: line });
        }
      }
    }

    // Sort critical/high first
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    priorities.sort((a, b) => (order[a.level || 'medium'] - order[b.level || 'medium']));
    // ------------------------------------------------

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'priority-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { priorities };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'priority-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
