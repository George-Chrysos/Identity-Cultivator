import { useEffect } from "react";
import { Link } from "react-router-dom";
import { concepts, getReadingNeighbors, resolveRelated } from "@/concord/content";
import { getCategoryMeta } from "@/concord/categories";
import type { EsotericConcept } from "@/concord/types";
import { ConceptFigure } from "@/concord/components/Figure";
import { InlineText, RichText } from "@/concord/components/RichText";
import { TraditionBadges } from "@/concord/components/Badges";
import { TraditionTabs } from "@/concord/components/Shores";
import { categoryPath, conceptPath, CONCORD_HOME } from "@/concord/paths";

export function Article({ concept }: { concept: EsotericConcept }) {
  const category = getCategoryMeta(concept.category);
  const related = resolveRelated(concept);
  const { previous, next } = getReadingNeighbors(concept.id);
  const position = concepts.findIndex((entry) => entry.id === concept.id) + 1;

  useEffect(() => {
    document.title = `${concept.unifiedTerm} · Concord`;
  }, [concept.unifiedTerm]);

  return (
    <div className="mx-auto grid max-w-6xl gap-10 xl:grid-cols-[minmax(0,42rem)_15rem] xl:gap-16">
      <article>
        <nav aria-label="Breadcrumb" className="font-body text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link to={CONCORD_HOME} className="hover:text-cinnabar">
                Register
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link to={categoryPath(category.slug)} className="hover:text-cinnabar">
                {category.label}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-foreground">{concept.unifiedTerm}</li>
          </ol>
        </nav>

        <header className="mt-6">
          <p className="font-body text-xs font-medium uppercase tracking-[0.16em] text-cinnabar">
            {category.label}
            <span className="text-muted-foreground">
              {" "}
              · {position} of {concepts.length}
            </span>
          </p>
          <h1 className="mt-3 font-serif text-4xl tracking-tight text-balance sm:text-5xl">
            {concept.unifiedTerm}
          </h1>
          <p className="mt-3 max-w-xl font-serif text-xl italic text-muted-foreground">
            {concept.subtitle}
          </p>
          <div className="mt-5">
            <TraditionBadges concept={concept} linked />
          </div>
        </header>

        <section id="summary" className="mt-8 scroll-mt-24 rounded-2xl border border-border bg-card px-5 py-5 sm:px-6">
          <h2 className="font-body text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            In the unified system
          </h2>
          <div className="mt-3">
            <RichText text={concept.summary} />
          </div>
        </section>

        <div id="figure" className="mt-8 scroll-mt-24">
          <ConceptFigure concept={concept} />
        </div>

        <section id="mechanics" className="mt-12 scroll-mt-24">
          <h2 className="font-serif text-3xl tracking-tight">Mechanics</h2>
          <ol className="mt-5 space-y-4">
            {concept.mechanics.map((item, index) => (
              <li key={item.slice(0, 32)} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3">
                <span className="pt-1 font-serif text-lg text-cinnabar">{index + 1}</span>
                <p className="font-serif text-[1.075rem] leading-[1.7] text-foreground/90">
                  <InlineText text={item} />
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section id="equivalencies" className="mt-12 scroll-mt-24">
          <h2 className="font-serif text-3xl tracking-tight">Why these names share an office</h2>
          <div className="mt-5">
            <RichText text={concept.equivalenciesExplanation} />
          </div>
        </section>

        <section id="applications" className="mt-12 scroll-mt-24">
          <h2 className="font-serif text-3xl tracking-tight">How the work uses it</h2>
          <ul className="mt-5 space-y-3">
            {concept.applications.map((item) => (
              <li
                key={item.slice(0, 40)}
                className="border-l-2 border-cinnabar/40 pl-4 font-serif text-[1.05rem] leading-7 text-foreground/90"
              >
                <InlineText text={item} />
              </li>
            ))}
          </ul>
        </section>

        <section id="traditions" className="mt-12 scroll-mt-24">
          <h2 className="font-serif text-3xl tracking-tight">From each shore</h2>
          <p className="mt-3 max-w-prose font-body text-sm leading-6 text-muted-foreground">
            The badges above jump to a shore. The accounts are kept apart on purpose: Daoist neidan, the Hermetic art, and the Qabalah staff the same office without becoming the same teaching.
          </p>
          <div className="mt-5">
            <TraditionTabs concept={concept} />
          </div>
        </section>

        <section id="related" className="mt-12 scroll-mt-24">
          <h2 className="font-serif text-3xl tracking-tight">Cross-references</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {related.map((entry) => (
              <li key={entry.id}>
                <Link
                  to={conceptPath(entry.id)}
                  className="block h-full rounded-2xl border border-border bg-card px-4 py-4 transition-colors hover:border-cinnabar/40"
                >
                  <span className="font-body text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    {getCategoryMeta(entry.category).label}
                  </span>
                  <span className="mt-1 block font-serif text-xl">{entry.unifiedTerm}</span>
                  <span className="mt-1 block font-body text-sm leading-5 text-muted-foreground">
                    {entry.subtitle}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <nav className="mt-12 grid gap-3 border-t border-border pt-6 sm:grid-cols-2" aria-label="Reading order">
          {previous ? (
            <Link
              to={conceptPath(previous.id)}
              className="rounded-2xl border border-border px-4 py-4 hover:border-cinnabar/40"
            >
              <span className="font-body text-xs uppercase tracking-[0.14em] text-muted-foreground">Previous</span>
              <span className="mt-1 block font-serif text-xl">{previous.unifiedTerm}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              to={conceptPath(next.id)}
              className="rounded-2xl border border-border px-4 py-4 text-right hover:border-cinnabar/40 sm:col-start-2"
            >
              <span className="font-body text-xs uppercase tracking-[0.14em] text-muted-foreground">Next</span>
              <span className="mt-1 block font-serif text-xl">{next.unifiedTerm}</span>
            </Link>
          ) : null}
        </nav>
      </article>

      <aside className="hidden xl:block">
        <div className="sticky top-24">
          <p className="font-body text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            On this page
          </p>
          <ul className="mt-3 space-y-2 font-body text-sm">
            {[
              ["summary", "Summary"],
              ["figure", "Map"],
              ["mechanics", "Mechanics"],
              ["equivalencies", "Shared office"],
              ["applications", "Use"],
              ["traditions", "Three shores"],
              ["related", "Cross-references"],
            ].map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} className="text-muted-foreground hover:text-foreground">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
