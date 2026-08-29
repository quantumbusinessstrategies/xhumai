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
    id: "assumption-extractor",
    name: "Assumption Extractor",
    description: "Surface unspoken assumptions, premises, and taken-for-granted beliefs from notes so decisions rest on clearer ground and hidden premises become visible",
    category: "productivity",
    endpoint: "/api/capabilities/assumption-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { assumptions: "array" } }
  },
  {
    id: "constraint-extractor",
    name: "Constraint Extractor",
    description: "Surface constraints, limits, and non-negotiables from notes so effort stays inside real bounds",
    category: "productivity",
    endpoint: "/api/capabilities/constraint-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { constraints: "array" } }
  },
  {
    id: "commitment-extractor",
    name: "Commitment Extractor",
    description: "Surface promises, commitments, and obligations from notes so accountability compounds and nothing is left hanging",
    category: "productivity",
    endpoint: "/api/capabilities/commitment-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { commitments: "array" } }
  },
  {
    id: "leverage-extractor",
    name: "Leverage Extractor",
    description: "Surface systems, automations, and compounding moves from notes so small effort keeps working after you stop",
    category: "productivity",
    endpoint: "/api/capabilities/leverage-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { leverage: "array" } }
  },
  {
    id: "delegation-extractor",
    name: "Delegation Extractor",
    description: "Surface work that can be delegated, outsourced, automated, or dropped so the founder keeps only high-leverage work",
    category: "productivity",
    endpoint: "/api/capabilities/delegation-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { delegations: "array" } }
  },
  {
    id: "energy-extractor",
    name: "Energy Extractor",
    description: "Surface what drains energy and what restores it from notes so work is redesigned toward living more, not just doing more",
    category: "productivity",
    endpoint: "/api/capabilities/energy-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { energy: "array" } }
  }
];

export default capabilities;
