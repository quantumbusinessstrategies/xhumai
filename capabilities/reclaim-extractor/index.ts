import { logUsage } from '../../backend/utils/logger';

/**
 * Reclaim Extractor Capability
 * Surfaces time sinks, low-leverage activities, and reclaimable hours from free-form notes
 * so capacity returns to living more, not just doing more.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - energy-extractor     → what drains vs restores life-force
 * - delegation-extractor → what should leave the founder's hands
 * - leverage-extractor   → systems that keep working after you stop
 * - priority-sorter      → where attention should go
 * - reclaim-extractor    → concrete hours and activities that can be recovered for life
 */

export interface ReclaimItem {
  item: string;
  kind?: 'time-sink' | 'low-leverage' | 'meeting-bloat' | 'context-switch' | 'admin' | 'reclaimable' | 'unknown';
  estimatedHours?: string;
  note?: string;
}

export interface ReclaimResult {
  reclaims: ReclaimItem[];
}

export async function runReclaimExtractor(input: string): Promise<ReclaimResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract reclaim signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const reclaimPatterns = [
      /\b(hours?|time|spent|wasted|lost|sink|drain|meeting|sync|standup|status|update|email|inbox|slack|admin|busywork|busy work|low.?value|low.?leverage|context.?switch|switching|multitask|reclaim|recover|free up|give back)\b/i,
      /\b(\d+\s*(hours?|hrs?|h)\b|half.?day|full.?day|all.?day|every.?day|daily|weekly)\b/i,
      /\b(could (be|have been)|should (be|have been)|if only|instead of|rather than)\b/i,
    ];

    const sinkHints = /\b(wasted|lost|sink|drain|bloat|busywork|busy work|low.?value|low.?leverage|too many|endless|constant)\b/i;
    const meetingHints = /\b(meeting|sync|standup|status|update|call|zoom|teams)\b/i;
    const adminHints = /\b(email|inbox|slack|admin|reporting|status update|tracking)\b/i;
    const switchHints = /\b(context.?switch|switching|multitask|interrupt|fragment)\b/i;
    const hourHints = /(\d+(?:\.\d+)?)\s*(hours?|hrs?|h)\b/i;

    const reclaims: ReclaimItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (reclaimPatterns.some(p => p.test(cleaned))) {
        if (!reclaims.some(r => r.item === cleaned)) {
          let kind: ReclaimItem['kind'] = 'unknown';
          if (meetingHints.test(cleaned)) kind = 'meeting-bloat';
          else if (adminHints.test(cleaned)) kind = 'admin';
          else if (switchHints.test(cleaned)) kind = 'context-switch';
          else if (sinkHints.test(cleaned)) kind = 'time-sink';
          else if (/\b(low.?leverage|low.?value)\b/i.test(cleaned)) kind = 'low-leverage';
          else kind = 'reclaimable';

          const hourMatch = cleaned.match(hourHints);
          const estimatedHours = hourMatch ? `${hourMatch[1]}h` : undefined;

          reclaims.push({
            item: cleaned,
            kind,
            estimatedHours,
            note:
              kind === 'meeting-bloat'
                ? 'Candidate to shorten, async, or drop'
                : kind === 'admin'
                  ? 'Candidate to batch, automate, or template'
                  : kind === 'context-switch'
                    ? 'Candidate for deep-work blocks and fewer interrupts'
                    : kind === 'time-sink' || kind === 'low-leverage'
                      ? 'Candidate to cut, delegate, or redesign'
                      : 'Candidate hours that can return to life',
          });
        }
      }
    }

    if (reclaims.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          reclaims.push({
            item: line,
            kind: 'unknown',
            note: 'Candidate for reclaim review',
          });
        }
      }
    }

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
