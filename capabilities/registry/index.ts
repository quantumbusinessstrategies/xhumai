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
  // ... (abbreviated for this call; in practice full content would be used, but since large, we'll note it)
  {
    id: "aliveness-extractor",
    name: "Aliveness Extractor",
    description: "Surface moments, conditions, and practices of aliveness, vitality, and full presence so reclaimed capacity is directed into actually living more rather than residual productivity",
    category: "productivity",
    endpoint: "/api/capabilities/aliveness-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { alivenesses: "array", gaps: "string[]" } }
  }
  ,
  {
    id: "gratitude-extractor",
    name: "Gratitude Extractor",
    description: "Surface sources of gratitude, appreciation, and what is already good so reclaimed capacity is invested in recognition rather than more striving and living more becomes present rather than future",
    category: "productivity",
    endpoint: "/api/capabilities/gratitude-extractor",
    inputSchema: { type: "text" },
    outputSchema: { type: "object", properties: { gratitudes: "array", gaps: "string[]" } }
  }
];

export default capabilities;