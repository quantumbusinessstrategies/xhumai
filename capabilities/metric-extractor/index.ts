import { logUsage } from '../../backend/utils/logger';

/**
 * Metric Extractor Capability
 * Surfaces success metrics, KPIs, and "how we'll know" signals from free-form notes
 * so work has a finish line and effort is not spent without a definition of done.
 * Stub for now; later becomes real AI.
 */

export interface MetricItem {
  metric: string;
  kind?: 'kpi' | 'signal' | 'target' | 'unknown';
  context?: string;
}

export interface MetricResult {
  metrics: MetricItem[];
}

export async function runMetricExtractor(input: string): Promise<MetricResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract metrics');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const patterns = [
      /\b(kpi|kpis|metric|metrics|measure|measured by|success (looks like|metric|criteria)|definition of done|dod)\b/i,
      /\b(how (we|we'll|we will) know|target of|goal of|north star|okr|okrs)\b/i,
      /\b(\d+%|increase|decrease|reduce|grow|hit|reach)\b/i,
    ];

    const metrics: MetricItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (patterns.some(p => p.test(cleaned))) {
        let kind: MetricItem['kind'] = 'signal';
        if (/\b(kpi|okr|north star)\b/i.test(cleaned)) kind = 'kpi';
        else if (/\b(target|goal|hit|reach)\b/i.test(cleaned)) kind = 'target';

        if (!metrics.some(m => m.metric === cleaned)) {
          metrics.push({
            metric: cleaned,
            kind,
            context: cleaned.length > 90 ? cleaned.slice(0, 90) + '…' : cleaned,
          });
        }
      }
    }

    if (metrics.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          metrics.push({ metric: line, kind: 'unknown', context: line });
        }
      }
    }

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'metric-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { metrics };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'metric-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
