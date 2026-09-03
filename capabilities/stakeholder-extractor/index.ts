import { logUsage } from '../../backend/utils/logger';

/**
 * Stakeholder Extractor Capability
 * Surfaces people and groups who are affected, informed, or need to be considered
 * so work accounts for the human system — not only the named owner.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - owner-extractor       → who is accountable
 * - follow-up-extractor   → who still needs a touch
 * - commitment-extractor  → what was promised
 * - stakeholder-extractor → who is affected / who cares so nothing important is built in a vacuum
 */

export interface StakeholderItem {
  stakeholder: string;
  role?: 'affected' | 'influencer' | 'approver' | 'user' | 'partner' | 'unknown';
  interest?: string;
  context?: string;
}

export interface StakeholderResult {
  stakeholders: StakeholderItem[];
}

export async function runStakeholderExtractor(input: string): Promise<StakeholderResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract stakeholders');
    }

    // --- STUB LOGIC (replace with real model later) ---
    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const stakeholderPatterns = [
      /\b(stakeholder|stakeholders|audience|users?|customers?|clients?|partners?|investors?|board|faculty|students?|advisors?|team|founders?|community|public)\b/i,
      /\b(who (is|are|needs|cares|is affected|has to approve|should know))\b/i,
      /\b(for (them|users|customers|the team|the board|the university|investors))\b/i,
      /\b(buy[- ]?in|sign[- ]?off|approval from|keep .+ in the loop)\b/i,
    ];

    const roleFrom = (line: string): StakeholderItem['role'] => {
      if (/\b(approv|sign[- ]?off|board|president)\b/i.test(line)) return 'approver';
      if (/\b(user|customer|client|student)\b/i.test(line)) return 'user';
      if (/\b(partner|investor|advisor|faculty)\b/i.test(line)) return 'partner';
      if (/\b(influence|buy[- ]?in|champion)\b/i.test(line)) return 'influencer';
      if (/\b(affect|impact|for them)\b/i.test(line)) return 'affected';
      return 'unknown';
    };

    const stakeholders: StakeholderItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (stakeholderPatterns.some(p => p.test(cleaned))) {
        if (!stakeholders.some(s => s.stakeholder === cleaned)) {
          stakeholders.push({
            stakeholder: cleaned,
            role: roleFrom(cleaned),
            context: cleaned.length > 90 ? cleaned.slice(0, 90) + '…' : cleaned,
          });
        }
      }
    }

    if (stakeholders.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          stakeholders.push({
            stakeholder: line,
            role: 'unknown',
            context: line,
          });
        }
      }
    }
    // ------------------------------------------------

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'stakeholder-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { stakeholders };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'stakeholder-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
