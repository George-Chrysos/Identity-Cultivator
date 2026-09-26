import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { concepts } from "@/concord/content";
import { searchConcepts } from "@/concord/search";
import { getCategoryMeta } from "@/concord/categories";
import { TraditionBadges } from "@/concord/components/Badges";
import { conceptPath } from "@/concord/paths";

type SearchContextValue = {
  openSearch: (query?: string) => void;
};

const SearchContext = createContext<SearchContextValue | null>(null);

export function useSearch() {
  const value = useContext(SearchContext);
  if (!value) {
    throw new Error("Search is only available inside the register shell.");
  }
  return value;
}

const SUGGESTIONS = ["Jing", "Salt", "Malkuth", "orbit", "Shen", "Paroketh"];

export function SearchProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => searchConcepts(query, concepts).slice(0, 8), [query]);
  const activeIndexSafe = Math.min(activeIndex, Math.max(results.length - 1, 0));
  const [openPath, setOpenPath] = useState(pathname);

  if (pathname !== openPath) {
    setOpenPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable);

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
        return;
      }

      if (event.key === "Escape") {
        setOpen(false);
        return;
      }

      if (!typing && event.key === "/") {
        event.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  function openSearch(nextQuery = "") {
    setQuery(nextQuery);
    setActiveIndex(0);
    setOpen(true);
  }

  function goTo(index: number) {
    const hit = results[index];
    if (!hit) return;
    setOpen(false);
    navigate(conceptPath(hit.concept.id));
  }

  return (
    <SearchContext.Provider value={{ openSearch }}>
      {children}
      {open ? (
        <div
          className="fixed inset-0 z-[80] bg-stone-950/45 p-4"
          onMouseDown={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search the register"
            className="mx-auto mt-[10vh] flex max-h-[min(36rem,80vh)] max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-border px-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                }}
                placeholder="Search Jing, Salt, Malkuth, orbit…"
                className="h-12 w-full bg-transparent font-body text-base outline-none placeholder:text-muted-foreground"
                aria-label="Search the register"
                aria-controls="search-results"
                aria-activedescendant={
                  results[activeIndexSafe]
                    ? `search-hit-${results[activeIndexSafe].concept.id}`
                    : undefined
                }
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setActiveIndex(Math.min(activeIndexSafe + 1, Math.max(results.length - 1, 0)));
                  } else if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setActiveIndex(Math.max(activeIndexSafe - 1, 0));
                  } else if (event.key === "Enter") {
                    event.preventDefault();
                    goTo(activeIndexSafe);
                  }
                }}
              />
            </div>
            <div id="search-results" role="listbox" aria-label="Search results" className="overflow-y-auto p-2">
              {query.trim().length < 2 ? (
                <div className="px-2 py-3">
                  <p className="px-2 pb-3 font-body text-sm text-muted-foreground">
                    Try a traditional term. Jing should bring you to Charge, with Salt and Malkuth beside it.
                  </p>
                  <div className="flex flex-wrap gap-2 px-2">
                    {SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        className="rounded-full border border-border bg-background px-3 py-1 font-body text-sm hover:border-cinnabar/40 hover:text-cinnabar"
                        onClick={() => {
                          setQuery(suggestion);
                          setActiveIndex(0);
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : results.length === 0 ? (
                <p className="px-4 py-8 text-center font-body text-sm text-muted-foreground">
                  Nothing in the register matches “{query.trim()}”. Try Jing, Mercury, or the Middle Pillar.
                </p>
              ) : (
                results.map((hit, index) => {
                  const category = getCategoryMeta(hit.concept.category);
                  const selected = index === activeIndexSafe;
                  return (
                    <button
                      key={hit.concept.id}
                      id={`search-hit-${hit.concept.id}`}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      className={`flex w-full flex-col gap-2 rounded-xl px-3 py-3 text-left ${
                        selected ? "bg-muted" : "hover:bg-muted/70"
                      }`}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => goTo(index)}
                    >
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="font-serif text-lg leading-none">{hit.concept.unifiedTerm}</span>
                        <span className="shrink-0 font-body text-xs text-muted-foreground">{category.label}</span>
                      </span>
                      <span className="line-clamp-2 font-body text-sm leading-5 text-muted-foreground">
                        {hit.concept.subtitle}
                      </span>
                      <TraditionBadges concept={hit.concept} emphasize={query} />
                      {hit.matchedTerms.length > 0 ? (
                        <span className="font-body text-xs text-muted-foreground">
                          Matched {hit.matchedTerms.join(" · ")}
                        </span>
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : null}
    </SearchContext.Provider>
  );
}

export function SearchButton() {
  const { openSearch } = useSearch();

  return (
    <button
      type="button"
      onClick={() => openSearch()}
      className="ml-auto flex h-10 w-full max-w-xl items-center gap-2 rounded-full border border-border bg-card px-3 font-body text-sm text-muted-foreground shadow-sm transition-colors hover:border-cinnabar/30 hover:text-foreground"
    >
      <Search className="h-4 w-4 shrink-0" />
      <span className="truncate">Search terms, Jing, Salt, Malkuth</span>
      <kbd className="ml-auto hidden rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] tracking-wide text-muted-foreground sm:inline">
        Ctrl K
      </kbd>
    </button>
  );
}
