import { logUsage } from '../../backend/utils/logger';

/**
 * Automation Extractor Capability
 * Surfaces work that can be automated, templated, scripted, or systemized
 * so the same outcome happens without ongoing human time.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - leverage-extractor   → compounding systems
 * - simplicity-extractor → reduce process surface
 * - elimination-extractor → drop what should not exist
 * - automation-extractor → make remaining work run without the founder
 */

export interface AutomationItem {
  item: string;
  type?: 'script' | 'template' | 'workflow' | 'trigger' | 'unknown';
  impact?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface AutomationResult {
  automations: AutomationItem[];
  gaps: string[];
}

export async function runAutomationExtractor(input: string): Promise<AutomationResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract automation signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const automationPatterns = [
      /\b(automat|script|template|workflow|trigger|zapier|make\.com|n8n|cron|schedule|recurring|same every|every time|manual)\b/i,
      /\b(copy paste|copy-paste|fill in|status report|weekly update|same process|standard)\b/i,
      /\b(work less|less manual|no longer do|systemize|systemise|run itself)\b/i,
    ];

    const scriptHints = /\b(script|code|api|webhook|cron)\b/i;
    const templateHints = /\b(template|checklist|form|boilerplate)\b/i;
    const workflowHints = /\b(workflow|process|approval|handoff)\b/i;
    const triggerHints = /\b(trigger|when|if|on|schedule|every)\b/i;
    const highHints = /\b(every week|daily|always|hours|constantly)\b/i;
    const lowHints = /\b(sometimes|occasional|minor)\b/i;
    const gapHints = /\b(have to do it myself|manual only|can't automate|no system)\b/i;

    const automations: AutomationItem[] = [];
    const gaps: string[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (gapHints.test(cleaned) && !gaps.includes(cleaned)) {
        gaps.push(cleaned);
      }

      if (automationPatterns.some(p => p.test(cleaned))) {
        let type: AutomationItem['type'] = 'unknown';
        if (scriptHints.test(cleaned)) type = 'script';
        else if (templateHints.test(cleaned)) type = 'template';
        else if (workflowHints.test(cleaned)) type = 'workflow';
        else if (triggerHints.test(cleaned)) type = 'trigger';

        let impact: AutomationItem['impact'] = 'medium';
        if (highHints.test(cleaned)) impact = 'high';
        else if (lowHints.test(cleaned)) impact = 'low';

        if (!automations.some(a => a.item === cleaned)) {
          automations.push({
            item: cleaned,
            type,
            impact,
            note:
              type === 'script'
                ? 'Script candidate — run once, recover the time forever'
                : type === 'template'
                  ? 'Template candidate — replace recreation with reuse'
                  : type === 'workflow'
                    ? 'Workflow candidate — encode the sequence so it no longer needs a human'
                    : type === 'trigger'
                      ? 'Trigger candidate — make the next step fire without attention'
                      : 'Automation signal — this work can stop requiring ongoing human time',
          });
        }
      }
    }

    if (automations.length === 0) {
      gaps.push('No explicit automation signals found — recurring manual work remains invisible');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          automations.push({
            item: line,
            type: 'unknown',
            impact: 'medium',
            note: 'Candidate for automation review — does this need a human every time?',
          });
        }
      }
    }

    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'automation-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { automations, gaps };
  } catch (error: any) {
    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'automation-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });
    throw error;
  }
}
