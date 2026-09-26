import { useMemo, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { concepts } from "@/concord/content";
import { CATEGORIES } from "@/concord/categories";
import { normalizeSearch } from "@/concord/search";
import type { RegisterKey } from "@/concord/types";
import { TraditionBadges } from "@/concord/components/Badges";
import { cn } from "@/concord/cn";
import { conceptPath } from "@/concord/paths";

const REGISTERS: { id: RegisterKey | "all"; label: string }[] = [
  { id: "all", label: "All offices" },
  { id: "charge", label: "Charge" },
  { id: "current", label: "Current" },
  { id: "mind", label: "Mind/Will" },
];

export function MatrixView() {
  const [params, setParams] = useSearchParams();
  const [openId, setOpenId] = useState<string | null>(null);

  const query = params.get("q") ?? "";
  const category = params.get("category") ?? "all";
  const register = params.get("register") ?? "all";

  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  }

  const rows = useMemo(() => {
    const needle = normalizeSearch(query);
    return concepts.filter((concept) => {
      if (category !== "all") {
        const selected = CATEGORIES.find(
          (item) => item.slug === category || item.id === category,
        );
        if (selected && concept.category !== selected.id) return false;
        if (!selected) return false;
      }
      if (register !== "all" && !concept.registers.includes(register as RegisterKey)) {
        return false;
      }
      if (!needle) return true;
      const haystack = normalizeSearch(
        [
          concept.unifiedTerm,
          concept.subtitle,
          concept.summary,
          ...concept.tags,
          ...(concept.traditionalTerms.daoist ?? []),
          ...(concept.traditionalTerms.hermetic ?? []),
          ...(concept.traditionalTerms.qabalistic ?? []),
        ].join(" "),
      );
      return needle.split(/\s+/).every((token) => haystack.includes(token));
    });
  }, [category, query, register]);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
        <label className="block">
          <span className="sr-only">Filter the matrix</span>
          <input
            value={query}
            onChange={(event) => update("q", event.target.value)}
            placeholder="Filter by Jing, Salt, orbit, Shen…"
            className="h-10 w-full rounded-full border border-border bg-card px-4 font-body text-sm outline-none focus:border-cinnabar"
          />
        </label>
        <p className="self-center font-body text-sm text-muted-foreground lg:text-right">
          {rows.length} of {concepts.length} shown
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <FilterChip active={category === "all"} onClick={() => update("category", "all")}>
            All categories
          </FilterChip>
          {CATEGORIES.map((item) => (
            <FilterChip
              key={item.id}
              active={category === item.slug}
              onClick={() => update("category", item.slug)}
            >
              {item.label}
            </FilterChip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {REGISTERS.map((item) => (
            <FilterChip
              key={item.id}
              active={register === item.id}
              onClick={() => update("register", item.id)}
            >
              {item.label}
            </FilterChip>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center">
          <p className="font-serif text-2xl">Nothing matches this cut of the matrix.</p>
          <p className="mx-auto mt-2 max-w-md font-body text-sm leading-6 text-muted-foreground">
            Clear a filter, or try a traditional term such as Jing, Mercury, or Malkuth.
          </p>
          <button
            type="button"
            className="mt-5 font-body text-sm text-cinnabar underline decoration-cinnabar/30 underline-offset-4"
            onClick={() => setParams({}, { replace: true })}
          >
            Reset the matrix
          </button>
        </div>
      ) : (
        <>
          <ul className="space-y-3 md:hidden">
            {rows.map((concept) => {
              const open = openId === concept.id;
              return (
                <li key={concept.id} className="rounded-2xl border border-border bg-card p-4">
                  <button
                    type="button"
                    className="w-full text-left"
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? null : concept.id)}
                  >
                    <span className="font-serif text-2xl">{concept.unifiedTerm}</span>
                    <span className="mt-1 block font-body text-sm text-muted-foreground">{concept.subtitle}</span>
                  </button>
                  <div className="mt-3">
                    <TraditionBadges concept={concept} emphasize={query} />
                  </div>
                  {open ? (
                    <div className="mt-4 border-t border-border pt-4">
                      <p className="font-body text-sm leading-6 text-muted-foreground">{plainSummary(concept.summary)}</p>
                      <Link
                        to={conceptPath(concept.id)}
                        className="mt-3 inline-block font-body text-sm text-cinnabar underline decoration-cinnabar/30 underline-offset-4"
                      >
                        Read {concept.unifiedTerm}
                      </Link>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>

          <div className="hidden overflow-hidden rounded-2xl border border-border md:block">
            <table className="w-full border-collapse text-left font-body text-sm">
              <thead className="bg-muted/60 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Unified term</th>
                  <th className="px-4 py-3 font-medium">Office</th>
                  <th className="px-4 py-3 font-medium">Daoist</th>
                  <th className="px-4 py-3 font-medium">Hermetic</th>
                  <th className="px-4 py-3 font-medium">Qabalistic</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((concept) => {
                  const open = openId === concept.id;
                  return (
                    <tr key={concept.id} className="border-t border-border align-top">
                      <td className="px-4 py-4" colSpan={open ? 5 : 1}>
                        {open ? (
                          <div>
                            <div className="flex flex-wrap items-baseline justify-between gap-3">
                              <button
                                type="button"
                                className="font-serif text-2xl"
                                aria-expanded="true"
                                onClick={() => setOpenId(null)}
                              >
                                {concept.unifiedTerm}
                              </button>
                              <Link
                                to={conceptPath(concept.id)}
                                className="text-sm text-cinnabar underline decoration-cinnabar/30 underline-offset-4"
                              >
                                Read the entry
                              </Link>
                            </div>
                            <p className="mt-3 max-w-3xl leading-6 text-muted-foreground">
                              {plainSummary(concept.summary)}
                            </p>
                            <div className="mt-3">
                              <TraditionBadges concept={concept} emphasize={query} />
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="text-left font-serif text-lg hover:text-cinnabar"
                            aria-expanded="false"
                            onClick={() => setOpenId(concept.id)}
                          >
                            {concept.unifiedTerm}
                          </button>
                        )}
                      </td>
                      {open ? null : (
                        <>
                          <td className="px-4 py-4 text-muted-foreground">{concept.subtitle}</td>
                          <TermCell terms={concept.traditionalTerms.daoist} query={query} />
                          <TermCell terms={concept.traditionalTerms.hermetic} query={query} />
                          <TermCell terms={concept.traditionalTerms.qabalistic} query={query} />
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function plainSummary(summary: string) {
  return summary.replace(/\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g, (_, id: string, label?: string) => {
    return label ?? id;
  });
}

function TermCell({ terms, query }: { terms?: string[]; query: string }) {
  const needle = normalizeSearch(query);
  return (
    <td className="px-4 py-4">
      <span className="flex flex-col gap-1">
        {(terms ?? ["—"]).map((term) => {
          const hot = needle.length > 1 && normalizeSearch(term).includes(needle);
          return (
            <span key={term} className={cn(hot && "font-medium text-cinnabar")}>
              {term}
            </span>
          );
        })}
      </span>
    </td>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 font-body text-sm transition-colors",
        active
          ? "border-cinnabar bg-cinnabar text-white"
          : "border-border bg-card text-foreground/80 hover:border-cinnabar/40",
      )}
    >
      {children}
    </button>
  );
}
