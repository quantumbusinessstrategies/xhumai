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
    description: "Surface risks, uncertainties, and potential failure modes from notes so foresight is visible and work stays ahead of surprises",
    category: "productivity",
    endpoint: "/api/capabilities/risk-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { risks: "array" } }
  }
];

export default capabilities;
