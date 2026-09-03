import { logUsage } from '../../backend/utils/logger';

/**
 * Delegation Extractor Capability
 * Surfaces work that can be delegated, handed off, or removed from the founder
 * so attention stays on high-leverage work and repetitive load leaves the human.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - action-extractor      → what to do next
 * - owner-extractor       → who already owns it
 * - commitment-extractor  → what was promised
 * - leverage-extractor    → what keeps working after you stop
 * - priority-sorter       → where attention should go
 * - delegation-extractor  → what should leave the founder's hands
 */

export interface DelegationItem {
  work: string;
  mode?: 'delegate' | 'outsource' | 'automate' | 'drop' | 'unknown';
  to?: string;
  reason?: string;
}

export interface DelegationResult {
  delegations: DelegationItem[];
}

export async function runDelegationExtractor(input: string): Promise<DelegationResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract delegations');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const delegationPatterns = [
      /\b(delegat|hand off|handoff|hand-off|assign to|give to|pass to|someone else|va |assistant|contractor|outsource|offload|not me|shouldn'?t be me)\b/i,
      /\b(can (you|they|someone) (take|handle|own|do)|let (them|her|him|the team) )\b/i,
      /\b(repetitive|busywork|admin|scheduling|inbox|follow.?up emails|data entry|formatting)\b/i,
      /\b(stop doing|don'?t need to do|drop this|not worth my time|below my hourly)\b/i,
    ];

    const automateHints = /\b(automat|script|bot|agent|zap|workflow)\b/i;
    const outsourceHints = /\b(outsource|contractor|agency|freelancer|vendor)\b/i;
    const dropHints = /\b(drop|stop doing|kill|cancel|not worth)\b/i;
    const personHints = /\b(to ([A-Z][a-z]+)|ask ([A-Z][a-z]+)|([A-Z][a-z]+) (can|should|will) (take|handle|own))\b/;

    const delegations: DelegationItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (delegationPatterns.some(p => p.test(cleaned))) {
        let mode: DelegationItem['mode'] = 'delegate';
        if (automateHints.test(cleaned)) mode = 'automate';
        else if (outsourceHints.test(cleaned)) mode = 'outsource';
        else if (dropHints.test(cleaned)) mode = 'drop';

        const personMatch = cleaned.match(/\b(?:to|ask|have)\s+([A-Z][a-z]+)\b/);
        const to = personMatch ? personMatch[1] : undefined;

        if (!delegations.some(d => d.work === cleaned)) {
          delegations.push({
            work: cleaned,
            mode,
            to,
            reason: mode === 'automate'
              ? 'Candidate to leave the human via a system'
              : mode === 'drop'
                ? 'Candidate to stop so capacity returns'
                : 'Candidate to leave the founder\'s hands',
          });
        }
      }
    }

    if (delegations.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          delegations.push({
            work: line,
            mode: 'unknown',
            reason: 'Candidate for delegation review',
          });
        }
      }
    }

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'delegation-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { delegations };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'delegation-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
