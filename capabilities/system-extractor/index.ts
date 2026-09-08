import { logUsage } from '../../backend/utils/logger';

/**
 * System Extractor Capability
 * Surfaces recurring systems, processes, structural patterns, and leverage points
 * from free-form notes so work can be systematized and continues after you stop.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - leverage-extractor   → systems and compounding moves
 * - waste-extractor      → what to eliminate
 * - delegation-extractor → what to hand off
 * - progress-extractor   → where momentum already lives
 * - system-extractor     → the repeating structures that can own the work
 */

export interface SystemItem {
  system: string;
  kind?: 'process' | 'routine' | 'automation' | 'template' | 'pipeline' | 'ritual' | 'other';
  leverage?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface SystemResult {
  systems: SystemItem[];
}

export async function runSystemExtractor(input: string): Promise<SystemResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract systems');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const systemPatterns = [
      /\b(system|process|pipeline|workflow|routine|ritual|habit|template|playbook|sop|standard operating|recurring|every (day|week|month)|always do|repeatable|automat|framework|structure)\b/i,
      /\b(build once|run forever|compounds?|scales?|reusable|can be automated|set and forget)\b/i,
      /\b(checklist|cadence|loop|cycle|sequence that repeats)\b/i,
    ];

    const processHints = /\b(process|workflow|pipeline|sop|standard)\b/i;
    const routineHints = /\b(routine|ritual|habit|cadence|every (day|week|month))\b/i;
    const autoHints = /\b(automat|set and forget|run forever)\b/i;
    const templateHints = /\b(template|playbook|checklist|reusable)\b/i;
    const highHints = /\b(compounds?|scales?|high leverage|build once|forever)\b/i;
    const lowHints = /\b(minor|small|occasional)\b/i;

    const systems: SystemItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (systemPatterns.some(p => p.test(cleaned))) {
        let kind: SystemItem['kind'] = 'other';
        if (processHints.test(cleaned)) kind = 'process';
        else if (routineHints.test(cleaned)) kind = 'routine';
        else if (autoHints.test(cleaned)) kind = 'automation';
        else if (templateHints.test(cleaned)) kind = 'template';

        let leverage: SystemItem['leverage'] = 'medium';
        if (highHints.test(cleaned)) leverage = 'high';
        else if (lowHints.test(cleaned)) leverage = 'low';

        if (!systems.some(s => s.system === cleaned)) {
          systems.push({
            system: cleaned,
            kind,
            leverage,
            note:
              kind === 'automation'
                ? 'Candidate to own the work after you stop'
                : kind === 'process' || kind === 'pipeline'
                  ? 'Candidate to document and harden into a repeatable system'
                  : kind === 'routine' || kind === 'ritual'
                    ? 'Candidate to protect as a high-signal cadence'
                    : kind === 'template'
                      ? 'Candidate to reuse and stop reinventing'
                      : 'Candidate for systematization so it compounds',
          });
        }
      }
    }

    if (systems.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          systems.push({
            system: line,
            kind: 'other',
            leverage: 'medium',
            note: 'Candidate for system review — can this become a repeatable structure?',
          });
        }
      }
    }

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'system-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { systems };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'system-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
