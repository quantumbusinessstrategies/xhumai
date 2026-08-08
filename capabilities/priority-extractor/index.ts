import { logUsage } from '../../backend/utils/logger';

/**
 * Priority Extractor Capability
 * Surfaces priority signals (urgent / high / medium / low, P0–P3, must / should / nice)
 * from free-form notes so the highest-leverage work is visible first and busywork shrinks.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - action-extractor     → what to do next
 * - decision-extractor   → what was settled (or still open)
 * - follow-up-extractor  → who/what still needs a touch
 * - deadline-extractor   → when it must happen
 * - blocker-extractor    → what is in the way
 * - owner-extractor      → who owns it
 * - priority-extractor   → what matters most so effort compounds
 */

export interface PriorityItem {
  item: string;
  priority: 'critical' | 'high' | 'medium' | 'low' | 'unspecified';
  signal?: string;
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
      /\b(p0|p1|p2|p3|priority\s*[0-3]|sev[0-3]|severity)\b/i,
      /\b(critical|urgent|asap|immediately|must|blocker|highest|top priority)\b/i,
      /\b(high priority|important|key|core|essential|must-have|must have)\b/i,
      /\b(medium|moderate|should|nice to have|nice-to-have|low priority|later|someday|optional)\b/i,
      /\b(depriorit|not urgent|can wait|backlog|icebox)\b/i,
    ];

    const criticalPatterns = /\b(p0|sev0|critical|urgent|asap|immediately|highest|top priority|must)\b/i;
    const highPatterns = /\b(p1|sev1|high priority|important|key|core|essential|must-have|must have)\b/i;
    const lowPatterns = /\b(p3|sev3|low priority|later|someday|optional|nice to have|nice-to-have|depriorit|not urgent|can wait|backlog|icebox)\b/i;
    const mediumPatterns = /\b(p2|sev2|medium|moderate|should)\b/i;

    const priorities: PriorityItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (priorityPatterns.some(p => p.test(cleaned))) {
        let priority: PriorityItem['priority'] = 'unspecified';
        let signal = '';

        if (criticalPatterns.test(cleaned)) {
          priority = 'critical';
          signal = 'critical/urgent';
        } else if (highPatterns.test(cleaned)) {
          priority = 'high';
          signal = 'high';
        } else if (lowPatterns.test(cleaned)) {
          priority = 'low';
          signal = 'low / later';
        } else if (mediumPatterns.test(cleaned)) {
          priority = 'medium';
          signal = 'medium';
        }

        if (!priorities.some(p => p.item === cleaned)) {
          priorities.push({
            item: cleaned,
            priority,
            signal: signal || undefined,
            context: cleaned.length > 90 ? cleaned.slice(0, 90) + '…' : cleaned,
          });
        }
      }
    }

    // Light fallback so sparse input still returns value
    if (priorities.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          priorities.push({
            item: line,
            priority: 'unspecified',
            context: line,
          });
        }
      }
    }
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
