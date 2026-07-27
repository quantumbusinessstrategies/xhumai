export type GenesisEventType =
  | "search"
  | "capability_run"
  | "page_view"
  | "hover"
  | "scroll"
  | "signup"
  | "payment"
  | "deployment"
  | "documentation"
  | "agent_action";

export interface GenesisEvent {
  id: string;
  timestamp: number;
  type: GenesisEventType;
  weight: number;
  metadata?: Record<string, unknown>;
}

export interface GenesisState {
  entropy: number;
  harmony: number;
  complexity: number;
  momentum: number;
  curiosity: number;
  memory: number;
}

export class GenesisEngine {
  private state: GenesisState = {
    entropy: 0,
    harmony: 1,
    complexity: 0,
    momentum: 0,
    curiosity: 0,
    memory: 0,
  };

  private history: GenesisEvent[] = [];

  evolve(event: GenesisEvent) {
    this.history.push(event);

    this.state.memory += 0.001 * event.weight;
    this.state.complexity += 0.0005 * event.weight;
    this.state.momentum += 0.0002 * event.weight;

    switch (event.type) {
      case "search":
        this.state.curiosity += 0.002;
        break;

      case "capability_run":
        this.state.harmony += 0.001;
        break;

      case "deployment":
        this.state.complexity += 0.01;
        break;

      case "documentation":
        this.state.memory += 0.005;
        break;
    }
  }

  getState() {
    return { ...this.state };
  }

  getHistory() {
    return [...this.history];
  }
}