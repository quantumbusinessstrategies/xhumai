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
  }
];

export default capabilities;
