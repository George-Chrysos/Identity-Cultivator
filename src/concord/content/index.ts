import type { EsotericConcept } from "@/concord/types";
import { cosmology } from "@/concord/content/cosmology";
import { energy } from "@/concord/content/energy";
import { entities } from "@/concord/content/entities";
import { practices } from "@/concord/content/practices";

export const concepts: EsotericConcept[] = [
  ...cosmology,
  ...energy,
  ...practices,
  ...entities,
].sort((a, b) => a.readingOrder - b.readingOrder);

function assertCatalog(entries: EsotericConcept[]) {
  const ids = new Set<string>();
  const orders = new Set<number>();

  for (const entry of entries) {
    if (ids.has(entry.id)) {
      throw new Error(`Duplicate concept id: ${entry.id}`);
    }
    ids.add(entry.id);

    if (orders.has(entry.readingOrder)) {
      throw new Error(`Duplicate reading order ${entry.readingOrder} on ${entry.id}`);
    }
    orders.add(entry.readingOrder);

    if (!entry.summary.trim() || entry.mechanics.length < 3) {
      throw new Error(`Incomplete entry: ${entry.id}`);
    }
    if (entry.figure.nodes.length < 2) {
      throw new Error(`Figure needs nodes: ${entry.id}`);
    }
  }

  for (const entry of entries) {
    for (const relatedId of entry.relatedTermIds) {
      if (!ids.has(relatedId)) {
        throw new Error(`${entry.id} relates to missing id ${relatedId}`);
      }
    }
    for (const node of entry.figure.nodes) {
      if (node.conceptId && !ids.has(node.conceptId)) {
        throw new Error(`${entry.id} figure points at missing id ${node.conceptId}`);
      }
    }
  }
}

assertCatalog(concepts);

const byId = new Map(concepts.map((concept) => [concept.id, concept]));

export function getConcept(id: string) {
  return byId.get(id);
}

export function getConceptsByCategory(category: EsotericConcept["category"]) {
  return concepts.filter((concept) => concept.category === category);
}

export function getReadingNeighbors(id: string) {
  const index = concepts.findIndex((concept) => concept.id === id);
  if (index === -1) return { previous: undefined, next: undefined };
  return {
    previous: concepts[index - 1],
    next: concepts[index + 1],
  };
}

export function resolveRelated(concept: EsotericConcept) {
  return concept.relatedTermIds
    .map((id) => byId.get(id))
    .filter((entry): entry is EsotericConcept => Boolean(entry));
}
