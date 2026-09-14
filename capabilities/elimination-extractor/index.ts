import { logUsage } from '../../backend/utils/logger';

/**
 * Elimination Extractor Capability
 * Surfaces work, processes, meetings, habits, and obligations that can be
 * stopped, simplified, or radically reduced so capacity returns and future
 * work shrinks. Direct expression of "Work Less. Live More."
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - leverage-extractor   → what to build that keeps working
 * - delegation-extractor → what to hand off
 * - energy-extractor     → what drains vs restores
 * - elimination-extractor → what to stop doing entirely
 */

export interface EliminationItem {
  item: string;
  type?: 'meeting' | 'process' | 'report' | 'habit' | 'tool' | 'obligation' | 'other';
  reason?: string;
  impact?: 'high' | 'medium' | 'low';
  effortToStop?: 'low' | 'medium' | 'high';
}

export interface EliminationResult {
  eliminations: EliminationItem[];
}

export async function runEliminationExtractor(input: string): Promise<EliminationResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract eliminations');
    }

    // --- STUB LOGIC (replace with real model later) ---
    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const eliminationPatterns = [
      /\b(stop|drop|kill|cancel|remove|eliminate|get rid of|no longer|don't need|unnecessary|waste|redundant|busywork|busy work|overhead|bloat)\b/i,
      /\b(too many|too much|always doing|keep doing|still doing|every week|every day|recurring|standing meeting)\b/i,
      /\b(never used|no one reads|no one uses|doesn't help|low value|low impact|checkbox|status update for the sake)\b/i,
      /\b(simplify|cut|reduce|trim|slash|retire|sunset|deprecate)\b/i,
    ];

    const meetingHints = /\b(meeting|sync|standup|stand-up|call|huddle|review session)\b/i;
    const processHints = /\b(process|workflow|procedure|checklist|approval|sign-off|sign off)\b/i;
    const reportHints = /\b(report|dashboard|status update|weekly update|metrics email)\b/i;
    const habitHints = /\b(habit|routine|always check|always do|ritual)\b/i;
    const toolHints = /\b(tool|app|software|subscription|platform we don't)\b/i;

    const eliminations: EliminationItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (eliminationPatterns.some(p => p.test(cleaned))) {
        let type: EliminationItem['type'] = 'other';
        if (meetingHints.test(cleaned)) type = 'meeting';
        else if (processHints.test(cleaned)) type = 'process';
        else if (reportHints.test(cleaned)) type = 'report';
        else if (habitHints.test(cleaned)) type = 'habit';
        else if (toolHints.test(cleaned)) type = 'tool';
        else if (/\b(obligation|commitment|promise we should drop)\b/i.test(cleaned)) type = 'obligation';

        if (!eliminations.some(e => e.item === cleaned)) {
          eliminations.push({
            item: cleaned,
            type,
            reason: 'Candidate for elimination or radical simplification',
            impact: cleaned.length > 90 ? 'medium' : 'high',
            effortToStop: /\b(political|stakeholder|legal|compliance)\b/i.test(cleaned) ? 'high' : 'low',
          });
        }
      }
    }

    // Light fallback so sparse input still returns value
    if (eliminations.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          eliminations.push({
            item: line,
            type: 'other',
            reason: 'Review for possible elimination or simplification',
            impact: 'medium',
            effortToStop: 'medium',
          });
        }
      }
    }
    // ------------------------------------------------

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'elimination-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { eliminations };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'elimination-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
