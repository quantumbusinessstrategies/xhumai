import { logUsage } from '../../backend/utils/logger';

/**
 * Dependency Extractor Capability
 * Surfaces dependencies, prerequisites, and sequential requirements from free-form notes
 * so sequencing is visible and nothing stalls because a hidden prerequisite was missed.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - action-extractor     → what to do next
 * - decision-extractor   → what was settled (or still open)
 * - follow-up-extractor  → who/what still needs a touch
 * - deadline-extractor   → when it must happen
 * - blocker-extractor    → what is in the way right now
 * - owner-extractor      → who owns it
 * - priority-sorter      → where attention should go
 * - risk-extractor       → what could go wrong
 * - dependency-extractor → what must come before / what this depends on
 */

export interface DependencyItem {
  dependency: string;
  type?: 'prerequisite' | 'blocks' | 'requires' | 'depends-on';
  context?: string;
}

export interface DependencyResult {
  dependencies: DependencyItem[];
}

export async function runDependencyExtractor(input: string): Promise<DependencyResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract dependencies');
    }

    // --- STUB LOGIC (replace with real model later) ---
    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const dependencyPatterns = [
      /\b(depends on|dependent on|dependency|dependencies|prerequisite|prerequisites|requires|required|before we can|first we need|after .+ then|blocked by|waiting on|needs .+ before|must .+ before)\b/i,
      /\b(cannot .+ until|can't .+ until|only after|once .+ is done|when .+ is ready)\b/i,
      /\b(relies on|reliant on|contingent on|subject to)\b/i,
    ];

    const dependencies: DependencyItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (dependencyPatterns.some(p => p.test(cleaned))) {
        let type: DependencyItem['type'] = 'depends-on';
        if (/\b(prerequisite|prerequisites|first we need|before we can)\b/i.test(cleaned)) type = 'prerequisite';
        else if (/\b(blocks|blocked by|waiting on)\b/i.test(cleaned)) type = 'blocks';
        else if (/\b(requires|required|needs)\b/i.test(cleaned)) type = 'requires';

        if (!dependencies.some(d => d.dependency === cleaned)) {
          dependencies.push({
            dependency: cleaned,
            type,
            context: cleaned.length > 90 ? cleaned.slice(0, 90) + '…' : cleaned,
          });
        }
      }
    }

    // Light fallback so sparse input still returns value
    if (dependencies.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          dependencies.push({
            dependency: line,
            type: 'depends-on',
            context: line,
          });
        }
      }
    }
    // ------------------------------------------------

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'dependency-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { dependencies };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'dependency-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
