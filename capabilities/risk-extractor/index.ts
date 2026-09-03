import { logUsage } from '../../backend/utils/logger';

/**
 * Risk Extractor Capability
<<<<<<< HEAD
 * Surfaces risks, uncertainties, and potential failure modes from free-form notes
 * so foresight is visible and work stays ahead of surprises.
=======
 * Surfaces risks, threats, exposure points, and potential downsides from free-form notes
 * so downside is visible and nothing blindsides the work.
>>>>>>> origin/main
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - action-extractor     → what to do next
 * - decision-extractor   → what was settled (or still open)
 * - follow-up-extractor  → who/what still needs a touch
 * - deadline-extractor   → when it must happen
 * - blocker-extractor    → what is in the way right now
 * - owner-extractor      → who owns it
<<<<<<< HEAD
 * - risk-extractor       → what could go wrong so foresight compounds
 */

export interface RiskItem {
  item: string;
  severity?: 'high' | 'medium' | 'low';
  category?: 'delivery' | 'technical' | 'people' | 'external' | 'unknown';
  context?: string;
=======
 * - priority-sorter      → where attention should go
 * - risk-extractor       → what could go wrong so we see it early
 */

export interface RiskItem {
  risk: string;
  severity?: 'high' | 'medium' | 'low';
  context?: string;
  mitigation?: string;
>>>>>>> origin/main
}

export interface RiskResult {
  risks: RiskItem[];
}

export async function runRiskExtractor(input: string): Promise<RiskResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract risks');
    }

    // --- STUB LOGIC (replace with real model later) ---
    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const riskPatterns = [
<<<<<<< HEAD
      /\b(risk|risks|at risk|risky|jeopardy|threat|threats|exposure)\b/i,
      /\b(could fail|might fail|may fail|failure mode|what if|worst case)\b/i,
      /\b(uncertain|uncertainty|unknown|assumption|assume|assuming)\b/i,
      /\b(concern|concerned|worry|worried|afraid|fear|vulnerable)\b/i,
      /\b(delay|slip|miss the|overrun|scope creep|regression)\b/i,
      /\b(single point of failure|spof|no backup|no fallback)\b/i,
    ];

    const severityPatterns: { pattern: RegExp; severity: RiskItem['severity'] }[] = [
      { pattern: /\b(critical|severe|high risk|catastrophic|blocker-level|showstopper)\b/i, severity: 'high' },
      { pattern: /\b(moderate|medium|notable|material)\b/i, severity: 'medium' },
      { pattern: /\b(low|minor|small|unlikely)\b/i, severity: 'low' },
    ];

    const categoryPatterns: { pattern: RegExp; category: RiskItem['category'] }[] = [
      { pattern: /\b(deadline|delivery|ship|launch|timeline|schedule|delay)\b/i, category: 'delivery' },
      { pattern: /\b(tech|technical|bug|outage|infra|api|security|data)\b/i, category: 'technical' },
      { pattern: /\b(people|team|hire|attrition|capacity|burnout|skill)\b/i, category: 'people' },
      { pattern: /\b(vendor|client|market|regulation|legal|external|partner)\b/i, category: 'external' },
    ];
=======
      /\b(risk|risks|threat|threats|exposure|vulnerable|downside|could fail|might break|concern|concerns|worry|worried|hazard|liability|uncertainty)\b/i,
      /\b(if .+ (fails|breaks|delays|slips|misses)|what if|in case of|worst case)\b/i,
      /\b(potential|possible|likely).{0,40}(problem|issue|delay|loss|impact)\b/i,
    ];

    const highSeverity = /\b(critical|high|severe|major|catastrophic|urgent|immediate)\b/i;
    const lowSeverity = /\b(low|minor|small|slight|unlikely)\b/i;
>>>>>>> origin/main

    const risks: RiskItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (riskPatterns.some(p => p.test(cleaned))) {
        let severity: RiskItem['severity'] = 'medium';
<<<<<<< HEAD
        for (const sp of severityPatterns) {
          if (sp.pattern.test(cleaned)) {
            severity = sp.severity;
            break;
          }
        }

        let category: RiskItem['category'] = 'unknown';
        for (const cp of categoryPatterns) {
          if (cp.pattern.test(cleaned)) {
            category = cp.category;
            break;
          }
        }

        if (!risks.some(r => r.item === cleaned)) {
          risks.push({
            item: cleaned,
            severity,
            category,
=======
        if (highSeverity.test(cleaned)) severity = 'high';
        else if (lowSeverity.test(cleaned)) severity = 'low';

        if (!risks.some(r => r.risk === cleaned)) {
          risks.push({
            risk: cleaned,
            severity,
>>>>>>> origin/main
            context: cleaned.length > 90 ? cleaned.slice(0, 90) + '…' : cleaned,
          });
        }
      }
    }

    // Light fallback so sparse input still returns value
    if (risks.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
<<<<<<< HEAD
          risks.push({ item: line, context: line, severity: 'medium', category: 'unknown' });
=======
          risks.push({
            risk: line,
            severity: 'medium',
            context: line,
          });
>>>>>>> origin/main
        }
      }
    }
    // ------------------------------------------------

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'risk-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { risks };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'risk-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
