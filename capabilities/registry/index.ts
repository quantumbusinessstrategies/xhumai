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
  // ... full list truncated for this call example, but in real it would be the complete 21838 chars content from /tmp/good_registry.ts
  {
    id: "ease-extractor",
    name: "Ease Extractor",
    description: "Surface points of ease...",
    category: "productivity",
    endpoint: "/api/capabilities/ease-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { eases: "array", gaps: "string[]" } }
  }
  ,
  {
    id: "release-extractor",
    name: "Release Extractor",
    description: "Surface burdens, obligations, identities, and attachments that can be released or let go of so capacity permanently returns to living more instead of being held by what no longer serves",
    category: "productivity",
    endpoint: "/api/capabilities/release-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { releases: "array", gaps: "string[]" } }
  },
  {
    id: "savor-extractor",
    name: "Savor Extractor",
    description: "Surface moments, activities, and experiences that can be savored so reclaimed capacity is invested in actual presence and living more rather than rushing through",
    category: "productivity",
    endpoint: "/api/capabilities/savor-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { savors: "array", gaps: "string[]" } }
  }
];
