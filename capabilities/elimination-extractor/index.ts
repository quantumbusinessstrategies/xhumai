import { logUsage } from '../../backend/utils/logger';

/**
 * Elimination Extractor Capability
 * Surfaces work, meetings, habits, obligations, and processes that can be
 * eliminated or radically simplified so that less work remains and more
 * living becomes possible. Direct expression of the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - delegation-extractor  → what can leave the human
 * - energy-extractor      → what drains life-force
 * - leverage-extractor    → what compounds after you stop
 * - priority-sorter       → where attention should go
 * - elimination-extractor → what should simply cease to exist
 */

export interface EliminationItem {
  item: string;
  mode?: 'eliminate' | 'simplify' | 'merge' | 'automate-away' | 'unknown';
  impact?: 'high' | 'medium' | 'low';
  reason?: string;
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

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const eliminationPatterns = [
      /\b(stop doing|don'?t need|no longer needed|can cut|can drop|can kill|eliminate|remove|cancel|scrap|ditch|get rid of)\b/i,
      /\b(waste of time|not worth|low value|busywork|busy work|redundant|duplicate|overlap|pointless|unnecessary)\b/i,
      /\b(too many meetings|meeting load|status update|weekly sync|standup that|report that no one reads)\b/i,
      /\b(simplify|streamline|collapse|merge|combine|one less|fewer)\b/i,
      /\b(habit|routine|process|workflow|step that|extra layer|middleman)\b/i,
    ];

    const simplifyHints = /\b(simplify|streamline|reduce|fewer|less|collapse|merge|combine)\b/i;
    const automateHints = /\b(automat|script|bot|agent|zap|workflow|system)\b/i;
    const mergeHints = /\b(merge|combine|collapse into|fold into)\b/i;
    const highHints = /\b(huge|major|massive|big|significant|critical|always|every day|constant)\b/i;
    const lowHints = /\b(minor|small|occasional|sometimes|slight)\b/i;

    const eliminations: EliminationItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (eliminationPatterns.some(p => p.test(cleaned))) {
        let mode: EliminationItem['mode'] = 'eliminate';
        if (automateHints.test(cleaned)) mode = 'automate-away';
        else if (mergeHints.test(cleaned)) mode = 'merge';
        else if (simplifyHints.test(cleaned)) mode = 'simplify';

        let impact: EliminationItem['impact'] = 'medium';
        if (highHints.test(cleaned)) impact = 'high';
        else if (lowHints.test(cleaned)) impact = 'low';

        if (!eliminations.some(e => e.item === cleaned)) {
          eliminations.push({
            item: cleaned,
            mode,
            impact,
            reason:
              mode === 'automate-away'
                ? 'Candidate to disappear via a system so the human never touches it'
                : mode === 'simplify'
                  ? 'Candidate to shrink until the cost is near zero'
                  : mode === 'merge'
                    ? 'Candidate to fold into something that already exists'
                    : 'Candidate to cease so capacity and life return',
          });
        }
      }
    }

    if (eliminations.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          eliminations.push({
            item: line,
            mode: 'unknown',
            impact: 'medium',
            reason: 'Candidate for elimination review — does this need to exist?',
          });
        }
      }
    }

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
