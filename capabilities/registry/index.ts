export interface Capability {
  id: string;
  name: string;
  description: string;
  category: string;
  endpoint: string;
  inputSchema: any;
  outputSchema: any;
}

// Seed capabilities
export const capabilities: Capability[] = [
  {
    id: "pdf-to-excel",
    name: "PDF to Excel",
    description: "Convert PDF tables to Excel/CSV",
    category: "documents",
    endpoint: "/api/capabilities/pdf-to-excel",
    inputSchema: { type: "file", formats: ["pdf"] },
    outputSchema: { type: "file", formats: ["xlsx", "csv"] }
  },
  {
    id: "text-summarizer",
    name: "Text Summarizer",
    description: "Condense long text",
    category: "writing",
    endpoint: "/api/capabilities/text-summarizer",
    inputSchema: { type: "text" },
    outputSchema: { type: "text" }
  },
  {
    id: "action-extractor",
    name: "Action Extractor",
    description: "Pull concrete next steps from free-form text so you can stop re-reading and start executing",
    category: "productivity",
    endpoint: "/api/capabilities/action-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "list", items: "string" }
  },
  {
    id: "decision-extractor",
    name: "Decision Extractor",
    description: "Surface explicit decisions and open questions from notes so meetings stop looping",
    category: "productivity",
    endpoint: "/api/capabilities/decision-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { decisions: "string[]", openQuestions: "string[]" } }
  },
  {
    id: "follow-up-extractor",
    name: "Follow-up Extractor",
    description: "Surface who/what still needs a follow-up from notes so open loops close and nothing drifts",
    category: "productivity",
    endpoint: "/api/capabilities/follow-up-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { followUps: "array" } }
  },
  {
    id: "deadline-extractor",
    name: "Deadline Extractor",
    description: "Surface dates, deadlines, and time-bound items from notes so time pressure is visible and nothing slips",
    category: "productivity",
    endpoint: "/api/capabilities/deadline-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { deadlines: "array" } }
  },
  {
    id: "blocker-extractor",
    name: "Blocker Extractor",
    description: "Surface blockers, dependencies, and friction points from notes so work unblocks and nothing stalls",
    category: "productivity",
    endpoint: "/api/capabilities/blocker-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { blockers: "array" } }
  },
  {
    id: "owner-extractor",
    name: "Owner Extractor",
    description: "Surface owners, assignees, and responsible parties from notes so accountability is clear and nothing floats",
    category: "productivity",
    endpoint: "/api/capabilities/owner-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { owners: "array" } }
  },
  {
    id: "priority-sorter",
    name: "Priority Sorter",
    description: "Rank messy notes into P0 / P1 / P2 so attention goes where it compounds",
    category: "productivity",
    endpoint: "/api/capabilities/priority-sorter",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { p0: "string[]", p1: "string[]", p2: "string[]" } }
  },
  {
    id: "risk-extractor",
    name: "Risk Extractor",
    description: "Surface risks, threats, and exposure points from notes so downside is visible and nothing blindsides",
    category: "productivity",
    endpoint: "/api/capabilities/risk-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { risks: "array" } }
  },
  {
    id: "opportunity-extractor",
    name: "Opportunity Extractor",
    description: "Surface opportunities, upsides, and leverage points from notes so attention goes where it compounds and high-value openings are not missed",
    category: "productivity",
    endpoint: "/api/capabilities/opportunity-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { opportunities: "array" } }
  },
  {
    id: "insight-extractor",
    name: "Insight Extractor",
    description: "Surface key insights, patterns, and non-obvious takeaways from notes so understanding compounds and nothing valuable is missed",
    category: "productivity",
    endpoint: "/api/capabilities/insight-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { insights: "array" } }
  },
  {
    id: "assumption-extractor",
    name: "Assumption Extractor",
    description: "Surface implicit assumptions and premises from notes so decisions rest on clearer ground",
    category: "productivity",
    endpoint: "/api/capabilities/assumption-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { assumptions: "array" } }
  },
  {
    id: "constraint-extractor",
    name: "Constraint Extractor",
    description: "Surface constraints and non-negotiable limits from notes so effort is not wasted on impossible paths",
    category: "productivity",
    endpoint: "/api/capabilities/constraint-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { constraints: "array" } }
  },
  {
    id: "commitment-extractor",
    name: "Commitment Extractor",
    description: "Surface promises, commitments, and agreements from notes so obligations are visible and loops close",
    category: "productivity",
    endpoint: "/api/capabilities/commitment-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { commitments: "array" } }
  },
  {
    id: "leverage-extractor",
    name: "Leverage Extractor",
    description: "Surface systems, automations, and compounding moves from notes so work keeps happening after you stop",
    category: "productivity",
    endpoint: "/api/capabilities/leverage-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { leverage: "array" } }
  },
  {
    id: "delegation-extractor",
    name: "Delegation Extractor",
    description: "Surface work that can be delegated, automated, or dropped so founder time returns to high-leverage work",
    category: "productivity",
    endpoint: "/api/capabilities/delegation-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { delegations: "array" } }
  },
  {
    id: "energy-extractor",
    name: "Energy Extractor",
    description: "Surface what drains energy and what restores it so work is redesigned toward living more",
    category: "productivity",
    endpoint: "/api/capabilities/energy-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { drains: "array", restoratives: "array" } }
  },
  {
    id: "dependency-extractor",
    name: "Dependency Extractor",
    description: "Surface prerequisites and sequential dependencies from notes so hidden waits become visible and work does not stall",
    category: "productivity",
    endpoint: "/api/capabilities/dependency-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { dependencies: "array" } }
  },
  {
    id: "metric-extractor",
    name: "Metric Extractor",
    description: "Surface success metrics, KPIs, and how-we'll-know signals from notes so work has a finish line",
    category: "productivity",
    endpoint: "/api/capabilities/metric-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { metrics: "array" } }
  },
  {
    id: "question-extractor",
    name: "Question Extractor",
    description: "Surface unanswered questions and open inquiries from notes so thinking can close instead of looping",
    category: "productivity",
    endpoint: "/api/capabilities/question-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { questions: "array" } }
  },
  {
    id: "tradeoff-extractor",
    name: "Tradeoff Extractor",
    description: "Surface tradeoffs, costs-vs-gains, and competing choices from notes so decisions get made once and are not re-litigated",
    category: "productivity",
    endpoint: "/api/capabilities/tradeoff-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { tradeoffs: "array" } }
  },
  {
    id: "stakeholder-extractor",
    name: "Stakeholder Extractor",
    description: "Surface people and groups who are affected, informed, or need buy-in so work is not built in a vacuum",
    category: "productivity",
    endpoint: "/api/capabilities/stakeholder-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { stakeholders: "array" } }
  }
];

export default capabilities;
