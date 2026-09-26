/**
 * Schema for a unified encyclopedia entry.
 * Correspondences name a shared office across traditions.
 * They are not a claim that the traditions are one religion,
 * nor that their terms are historical translations of each other.
 */

export type Category =
  | "Cosmology"
  | "Energy Mechanics"
  | "Practices"
  | "Entities";

export type InfographicType = "flowchart" | "tree" | "dantian-map" | "diagram";

export type TraditionKey = "daoist" | "hermetic" | "qabalistic";

export type RegisterKey = "charge" | "current" | "mind";

export interface TraditionAccount {
  heading: string;
  paragraphs: string[];
}

export interface FigureNode {
  id: string;
  label: string;
  detail: string;
  conceptId?: string;
}

export interface ConceptFigure {
  caption: string;
  /**
   * ascend draws the first node at the base and points upward.
   * cycle adds a return stroke beside a top-to-bottom stack.
   * descend, the default, falls from the first node to the last.
   */
  flow?: "ascend" | "descend" | "cycle";
  nodes: FigureNode[];
}

export interface EsotericConcept {
  id: string;
  unifiedTerm: string;
  subtitle: string;
  traditionalTerms: {
    daoist?: string[];
    hermetic?: string[];
    qabalistic?: string[];
  };
  category: Category;
  summary: string;
  mechanics: string[];
  equivalenciesExplanation: string;
  infographicType: InfographicType;
  relatedTermIds: string[];
  tags: string[];
  registers: RegisterKey[];
  applications: string[];
  traditions: Record<TraditionKey, TraditionAccount>;
  figure: ConceptFigure;
  readingOrder: number;
}
