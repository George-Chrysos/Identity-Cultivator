import { describe, expect, it } from "vitest";
import { concepts } from "@/concord/content";
import { searchConcepts } from "@/concord/search";

describe("register search", () => {
  it("Jing resolves to Charge and surfaces Salt and Malkuth", () => {
    const hits = searchConcepts("Jing", concepts);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0]?.concept.id).toBe("charge");
    const names = [
      ...(hits[0]?.concept.traditionalTerms.daoist ?? []),
      ...(hits[0]?.concept.traditionalTerms.hermetic ?? []),
      ...(hits[0]?.concept.traditionalTerms.qabalistic ?? []),
    ];
    expect(names.some((name) => name.includes("Jing"))).toBe(true);
    expect(names.some((name) => name.includes("Salt"))).toBe(true);
    expect(names.some((name) => name.includes("Malkuth"))).toBe(true);
  });

  it("Yesod and Sulphur land on their offices", () => {
    expect(searchConcepts("Yesod", concepts)[0]?.concept.id).toBe("current");
    expect(searchConcepts("Sulphur", concepts)[0]?.concept.id).toBe("mind-will");
    expect(searchConcepts("Malkuth", concepts)[0]?.concept.id).toBe("charge");
  });

  it("a nonsense query is an empty result", () => {
    expect(searchConcepts("xylophone", concepts)).toEqual([]);
    expect(searchConcepts("a", concepts)).toEqual([]);
  });
});
