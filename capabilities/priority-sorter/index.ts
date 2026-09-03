import { logUsage } from '../../backend/utils/logger';

/**
 * Priority Sorter — ranks messy notes into P0 / P1 / P2 so attention goes where it compounds.
 */
export async function runPrioritySorter(input: string): Promise<{
  p0: string[];
  p1: string[];
  p2: string[];
  note: string;
}> {
  const start = Date.now();
  try {
    if (!input || input.trim().length < 12) throw new Error('Text too short to prioritize');

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 6);

    const p0: string[] = [];
    const p1: string[] = [];
    const p2: string[] = [];

    const urgent = /\b(urgent|asap|critical|blocker|blocked|p0|immediate|today|now|emergency)\b/i;
    const important = /\b(should|need to|deadline|due|must|important|p1|this week)\b/i;

    for (const line of lines) {
      if (urgent.test(line)) p0.push(line);
      else if (important.test(line)) p1.push(line);
      else p2.push(line);
    }

    if (!p0.length && !p1.length && lines.length) {
      p1.push(...lines.slice(0, 3));
      p2.push(...lines.slice(3));
    }

    logUsage({
      capabilityId: 'priority-sorter',
      success: true,
      durationMs: Date.now() - start,
      inputSize: input.length,
    });

    return {
      p0,
      p1,
      p2,
      note: 'Ranked by urgency signals. Promote anything that unblocks the rest.',
    };
  } catch (error: any) {
    logUsage({
      capabilityId: 'priority-sorter',
      success: false,
      durationMs: Date.now() - start,
      error: error.message,
      inputSize: input?.length || 0,
    });
    throw error;
  }
}
