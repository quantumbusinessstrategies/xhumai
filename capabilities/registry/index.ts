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
    id: "priority-extractor",
    name: "Priority Extractor",
    description: "Surface the priorities and urgencies from notes so attention goes where it compounds",
    category: "productivity",
    endpoint: "/api/capabilities/priority-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { priorities: "array" } }
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
    description: "Surface opportunities and upside from notes so leverage becomes visible",
    category: "productivity",
    endpoint: "/api/capabilities/opportunity-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { opportunities: "array" } }
  },
  {
    id: "assumption-extractor",
    name: "Assumption Extractor",
    description: "Surface implicit assumptions and unstated premises from notes so they can be validated or challenged",
    category: "productivity",
    endpoint: "/api/capabilities/assumption-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { assumptions: "array" } }
  },
  {
    id: "constraint-extractor",
    name: "Constraint Extractor",
    description: "Surface constraints, limits, and hard boundaries from notes so the real playing field is visible",
    category: "productivity",
    endpoint: "/api/capabilities/constraint-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { constraints: "array" } }
  },
  {
    id: "dependency-extractor",
    name: "Dependency Extractor",
    description: "Surface dependencies, prerequisites, and sequential requirements from notes so sequencing is clear and hidden prerequisites never stall work",
    category: "productivity",
    endpoint: "/api/capabilities/dependency-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { dependencies: "array" } }
  },
  {
    id: "leverage-extractor",
    name: "Leverage Extractor",
    description: "Surface high-leverage systems, automations, and compounding opportunities from notes so small effort creates ongoing advantage",
    category: "productivity",
    endpoint: "/api/capabilities/leverage-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { leverage: "array" } }
  }
];

export default capabilities;
