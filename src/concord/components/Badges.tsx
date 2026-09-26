import type { EsotericConcept, TraditionKey } from "@/concord/types";
import { cn } from "@/concord/cn";

const TRADITIONS: {
  key: TraditionKey;
  label: string;
  className: string;
  activeClassName: string;
}[] = [
  {
    key: "daoist",
    label: "Daoist",
    className: "bg-bronze/10 text-bronze",
    activeClassName: "bg-bronze text-white",
  },
  {
    key: "hermetic",
    label: "Hermetic",
    className: "bg-indigo-ink/10 text-indigo-ink",
    activeClassName: "bg-indigo-ink text-white",
  },
  {
    key: "qabalistic",
    label: "Qabalistic",
    className: "bg-cinnabar/10 text-cinnabar",
    activeClassName: "bg-cinnabar text-white",
  },
];

function termsMatch(term: string, query: string) {
  const normalizedTerm = term.toLowerCase();
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length < 2) return false;
  return normalizedQuery
    .split(/\s+/)
    .some((token) => token.length > 1 && normalizedTerm.includes(token));
}

export function TraditionBadges({
  concept,
  emphasize = "",
  linked = false,
}: {
  concept: EsotericConcept;
  emphasize?: string;
  linked?: boolean;
}) {
  return (
    <ul className="flex flex-wrap gap-2">
      {TRADITIONS.map((tradition) => {
        const terms = concept.traditionalTerms[tradition.key];
        if (!terms?.length) return null;
        const hot = terms.some((term) => termsMatch(term, emphasize));
        const className = cn(
          "inline-flex max-w-full items-baseline gap-x-1.5 rounded-full px-2.5 py-1 text-left text-[0.78rem] leading-5",
          hot ? tradition.activeClassName : tradition.className,
        );
        const body = (
          <>
            <span className="font-body font-medium tracking-wide">{tradition.label}</span>
            <span className={cn("truncate", hot ? "text-white/90" : "opacity-80")}>
              {terms.join(", ")}
            </span>
          </>
        );

        return (
          <li key={tradition.key}>
            {linked ? (
              <a href={`#shore-${tradition.key}`} className={className}>
                {body}
              </a>
            ) : (
              <span className={className}>{body}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
