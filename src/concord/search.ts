import type { EsotericConcept } from "@/concord/types";

export type SearchHit = {
  concept: EsotericConcept;
  score: number;
  matchedTerms: string[];
};

export function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function traditionList(concept: EsotericConcept) {
  return [
    ...(concept.traditionalTerms.daoist ?? []),
    ...(concept.traditionalTerms.hermetic ?? []),
    ...(concept.traditionalTerms.qabalistic ?? []),
  ];
}

function haystackFor(concept: EsotericConcept) {
  return normalizeSearch(
    [
      concept.unifiedTerm,
      concept.subtitle,
      concept.summary,
      concept.equivalenciesExplanation,
      concept.id.replace(/-/g, " "),
      ...concept.mechanics,
      ...concept.applications,
      ...concept.tags,
      ...traditionList(concept),
      ...Object.values(concept.traditions).flatMap((account) => [
        account.heading,
        ...account.paragraphs,
      ]),
    ].join("\n"),
  );
}

export function searchConcepts(
  rawQuery: string,
  concepts: EsotericConcept[],
): SearchHit[] {
  const query = normalizeSearch(rawQuery);
  if (query.length < 2) return [];

  const tokens = query.split(/\s+/).filter((token) => token.length >= 2);
  if (tokens.length === 0) return [];

  const hits: SearchHit[] = [];

  for (const concept of concepts) {
    const haystack = haystackFor(concept);
    if (!tokens.every((token) => haystack.includes(token))) continue;

    let score = 0;
    const matched = new Set<string>();
    const unified = normalizeSearch(concept.unifiedTerm);

    if (unified === query) score += 140;
    else if (unified.startsWith(query)) score += 84;
    else if (tokens.every((token) => unified.includes(token))) score += 62;

    for (const term of traditionList(concept)) {
      const normalized = normalizeSearch(term);
      if (!normalized) continue;
      if (normalized === query) {
        score += 120;
        matched.add(term);
      } else if (tokens.some((token) => normalized.includes(token))) {
        score += 58;
        matched.add(term);
      }
    }

    for (const tag of concept.tags) {
      const normalized = normalizeSearch(tag);
      if (!normalized) continue;
      if (normalized === query) {
        score += 74;
        matched.add(tag);
      } else if (
        tokens.some((token) => token.length > 2 && normalized.includes(token))
      ) {
        score += 22;
        matched.add(tag);
      }
    }

    const subtitle = normalizeSearch(concept.subtitle);
    const summary = normalizeSearch(concept.summary);
    if (tokens.every((token) => subtitle.includes(token))) score += 26;
    if (tokens.every((token) => summary.includes(token))) score += 16;
    if (
      concept.mechanics.some((line) => {
        const normalized = normalizeSearch(line);
        return tokens.every((token) => normalized.includes(token));
      })
    ) {
      score += 12;
    }

    hits.push({
      concept,
      score,
      matchedTerms: [...matched].slice(0, 6),
    });
  }

  hits.sort(
    (a, b) =>
      b.score - a.score ||
      a.concept.readingOrder - b.concept.readingOrder ||
      a.concept.unifiedTerm.localeCompare(b.concept.unifiedTerm),
  );

  return hits;
}
