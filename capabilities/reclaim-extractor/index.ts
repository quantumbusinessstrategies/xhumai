import { logUsage } from '../../backend/utils/logger';

/**
 * Reclaim Extractor Capability
 * Surfaces time sinks, low-leverage loops, and reclaim opportunities from notes
 * so hours and energy return to living more.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - energy-extractor     → drains vs restoratives
 * - leverage-extractor   → systems that keep working after you stop
 * - delegation-extractor → work that can leave the founder
 * - priority-sorter      → where attention should go
 * - reclaim-extractor    → explicit time/energy to take back
 */

export interface ReclaimItem {
  sink: string;
  type?: 'meeting' | 'admin' | 'context-switch' | 'rework' | 'waiting' | 'low-leverage' | 'other';
  reclaim?: string;
  estimatedImpact?: 'low' | 'medium' | 'high';
}

export interface ReclaimResult {
  reclaims: ReclaimItem[];
}

export async function runReclaimExtractor(input: string): Promise<ReclaimResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract reclaim opportunities');
    }

    // --- STUB LOGIC (replace with real model later) ---
    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const sinkPatterns = [
      /\b(meeting|sync|standup|check-in|check in|status update|catch.?up)\b/i,
      /\b(email|inbox|slack|notification|ping|thread)\b/i,
      /\b(rework|redo|again|revisit|re-do|fix over)\b/i,
      /\b(waiting|blocked|stuck|pending|depend)\b/i,
      /\b(admin|paperwork|form|report|logging|busywork|low.?value)\b/i,
      /\b(context.?switch|multitask|interrupt|distraction)\b/i,
      /\b(waste|drain|sink|time.?suck|hours lost|too much time)\b/i,
    ];

    const meetingHints = /\b(meeting|sync|standup|check-in|check in)\b/i;
    const adminHints = /\b(admin|paperwork|form|report|logging|busywork)\b/i;
    const reworkHints = /\b(rework|redo|again|revisit|fix over)\b/i;
    const waitingHints = /\b(waiting|blocked|stuck|pending)\b/i;
    const switchHints = /\b(context.?switch|multitask|interrupt|distraction)\b/i;

    const reclaims: ReclaimItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (sinkPatterns.some(p => p.test(cleaned))) {
        let type: ReclaimItem['type'] = 'other';
        if (meetingHints.test(cleaned)) type = 'meeting';
        else if (adminHints.test(cleaned)) type = 'admin';
        else if (reworkHints.test(cleaned)) type = 'rework';
        else if (waitingHints.test(cleaned)) type = 'waiting';
        else if (switchHints.test(cleaned)) type = 'context-switch';
        else if (/\b(low.?value|busywork|time.?suck)\b/i.test(cleaned)) type = 'low-leverage';

        const reclaimSuggestion =
          type === 'meeting'
            ? 'Convert to async update or shorter agenda with clear owner'
            : type === 'admin'
            ? 'Template, automate, or batch this work'
            : type === 'rework'
            ? 'Define done criteria once and stop looping'
            : type === 'waiting'
            ? 'Unblock or set a hard follow-up date'
            : type === 'context-switch'
            ? 'Protect focus blocks; batch similar work'
            : 'Eliminate, automate, or delegate so hours return to living';

        if (!reclaims.some(r => r.sink === cleaned)) {
          reclaims.push({
            sink: cleaned,
            type,
            reclaim: reclaimSuggestion,
            estimatedImpact: cleaned.length > 90 ? 'high' : 'medium',
          });
        }
      }
    }

    if (reclaims.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          reclaims.push({
            sink: line,
            type: 'other',
            reclaim: 'Review whether this still earns its place in your week',
            estimatedImpact: 'medium',
          });
        }
      }
    }
    // ------------------------------------------------

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'reclaim-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { reclaims };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'reclaim-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
