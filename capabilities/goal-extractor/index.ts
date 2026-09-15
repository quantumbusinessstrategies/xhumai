import { logUsage } from '../../backend/utils/logger';

/**
 * Goal Extractor Capability
 * Surfaces goals, desired outcomes, success definitions, and north-star aims from
 * free-form notes so effort aligns to what actually matters.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - metric-extractor   → how we will know it worked
 * - progress-extractor → what already moved
 * - priority-sorter    → what to do first
 * - goal-extractor     → what we are actually aiming for
 */

export interface GoalItem {
  text: string;
  type?: 'outcome' | 'north-star' | 'milestone' | 'habit' | 'target' | 'unknown';
  timeframe?: string;
  context?: string;
}

export interface GoalResult {
  goals: GoalItem[];
}

export async function runGoalExtractor(input: string): Promise<GoalResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract goals');
    }

    // --- STUB LOGIC (replace with real model later) ---
    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const goalPatterns = [
      /\b(goal|aim|objective|target|outcome|north.?star|vision|want to|need to achieve|by the end|success looks like|define success|KPI|OKR)\b/i,
      /\b(ship|launch|reach|hit|achieve|complete|finish|grow to|get to|become)\b/i,
      /\b(this quarter|this year|by \d{4}|in \d+ (days|weeks|months)|Q[1-4])\b/i,
      /\b(I want|we want|our goal|the goal is|success means)\b/i,
    ];

    const typeFrom = (line: string): GoalItem['type'] => {
      if (/\b(north.?star|vision|mission)\b/i.test(line)) return 'north-star';
      if (/\b(milestone|checkpoint|phase)\b/i.test(line)) return 'milestone';
      if (/\b(habit|daily|weekly|routine)\b/i.test(line)) return 'habit';
      if (/\b(target|number|%|metric|kpi)\b/i.test(line)) return 'target';
      if (/\b(outcome|result|achieve|ship|launch)\b/i.test(line)) return 'outcome';
      return 'unknown';
    };

    const goals: GoalItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (goalPatterns.some(p => p.test(cleaned))) {
        if (!goals.some(g => g.text === cleaned)) {
          goals.push({
            text: cleaned,
            type: typeFrom(cleaned),
            context: cleaned.length > 90 ? cleaned.slice(0, 90) + '…' : cleaned,
          });
        }
      }
    }

    if (goals.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          goals.push({
            text: line,
            type: 'unknown',
            context: line,
          });
        }
      }
    }
    // ------------------------------------------------

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'goal-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { goals };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'goal-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
