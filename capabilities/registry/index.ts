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
  },
  {
    id: "flow-extractor",
    name: "Flow Extractor",
    description: "Surface activities, conditions, and environments that produce flow state so reclaimed capacity is invested in effortless, immersive living rather than forced productivity",
    category: "productivity",
    endpoint: "/api/capabilities/flow-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { flows: "array", gaps: "string[]" } }
  },
  {
    id: "recovery-extractor",
    name: "Recovery Extractor",
    description: "Surface recovery practices, restoration activities, and gaps where recovery is missing so reclaimed capacity is invested in actual restoration rather than more work",
    category: "productivity",
    endpoint: "/api/capabilities/recovery-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { recoveries: "array", gaps: "string[]" } }
  }
];

export default capabilities;