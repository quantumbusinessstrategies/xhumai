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
  // ... (abbreviated for this example, but in real I need full)
  {
    id: "completion-extractor",
    name: "Completion Extractor",
    description: "Surface finished work, closed loops, decisions made, and explicit completions so open items stop taxing attention and capacity returns to living more",
    category: "productivity",
    endpoint: "/api/capabilities/completion-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { completions: "array", gaps: "string[]" } }
  },
  {
    id: "yield-extractor",
    name: "Yield Extractor",
    description: "Surface yields, returns on effort, diminishing returns, and low-yield activities so further investment stops and capacity permanently returns to living more",
    category: "productivity",
    endpoint: "/api/capabilities/yield-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { yields: "array", gaps: "string[]" } }
  }
];

export default capabilities;