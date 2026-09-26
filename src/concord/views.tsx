import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { concepts, getConcept, getConceptsByCategory } from "@/concord/content";
import { CATEGORIES, getCategoryBySlug } from "@/concord/categories";
import { Article } from "@/concord/components/Article";
import { TraditionBadges } from "@/concord/components/Badges";
import { MatrixView } from "@/concord/components/Matrix";
import { useSearch } from "@/concord/components/Search";
import { categoryPath, conceptPath, CONCORD_HOME, MATRIX_PATH } from "@/concord/paths";

const PRINCIPLES = ["charge", "current", "mind-will"] as const;

export function ConcordHome() {
  const principles = PRINCIPLES.map((id) => getConcept(id)).filter((entry) => entry != null);
  const { openSearch } = useSearch();

  useEffect(() => {
    document.title = "Concord · Identity Cultivator";
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      <p className="font-body text-xs font-medium uppercase tracking-[0.18em] text-cinnabar">
        A unified register
      </p>
      <h1 className="mt-3 font-serif text-5xl tracking-tight text-balance sm:text-6xl">Concord</h1>
      <p className="mt-5 font-serif text-xl leading-8 text-foreground/90">
        Charge, Current, and Mind/Will are the three offices this book uses to read three older arts side by side. Daoist neidan, Hermetic alchemy, and the Qabalah do not say the same thing. They staff the same jobs.
      </p>
      <p className="mt-4 max-w-2xl font-body text-base leading-7 text-muted-foreground">
        The register names the jobs, keeps the older words in reach, and offers one order in which to read them. Start with the Triad, or search a word you already know.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {["Jing", "Salt", "Malkuth"].map((term) => (
          <button
            key={term}
            type="button"
            onClick={() => openSearch(term)}
            className="rounded-full border border-border bg-card px-3 py-1 font-body text-sm hover:border-cinnabar/40 hover:text-cinnabar"
          >
            {term}
          </button>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="font-serif text-3xl tracking-tight">The three offices</h2>
        <div className="mt-5 grid gap-4">
          {principles.map((concept) => (
            <Link
              key={concept.id}
              to={conceptPath(concept.id)}
              className="rounded-2xl border border-border bg-card px-5 py-5 transition-colors hover:border-cinnabar/40"
            >
              <span className="font-serif text-3xl">{concept.unifiedTerm}</span>
              <span className="mt-1 block font-body text-muted-foreground">{concept.subtitle}</span>
              <span className="mt-4 block">
                <TraditionBadges concept={concept} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-3xl tracking-tight">Read it through</h2>
        <p className="mt-3 font-body text-sm leading-6 text-muted-foreground">
          Eighteen entries, in the order the work itself asks for. Cosmology first only where a picture is required. The store comes before the loop. The loop comes before the greater work.
        </p>
        <ol className="mt-6 divide-y divide-border border-y border-border">
          {concepts.map((concept, index) => (
            <li key={concept.id}>
              <Link
                to={conceptPath(concept.id)}
                className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 py-3 hover:text-cinnabar sm:grid-cols-[2.5rem_minmax(0,14rem)_minmax(0,1fr)]"
              >
                <span className="font-serif text-lg text-muted-foreground">{index + 1}</span>
                <span className="font-serif text-lg">{concept.unifiedTerm}</span>
                <span className="col-start-2 font-body text-sm text-muted-foreground sm:col-start-3">
                  {concept.subtitle}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-2">
        {CATEGORIES.map((category) => (
          <Link
            key={category.slug}
            to={categoryPath(category.slug)}
            className="rounded-2xl border border-border px-4 py-4 hover:border-cinnabar/40"
          >
            <span className="font-body text-xs uppercase tracking-[0.14em] text-muted-foreground">
              {category.label}
            </span>
            <span className="mt-2 block font-body text-sm leading-6">{category.description}</span>
          </Link>
        ))}
        <Link
          to={MATRIX_PATH}
          className="rounded-2xl border border-border px-4 py-4 hover:border-cinnabar/40 sm:col-span-2"
        >
          <span className="font-body text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Dynamic correspondence matrix
          </span>
          <span className="mt-2 block font-body text-sm leading-6">
            Every entry in one table. Filter by category or by office, and search Jing to see Salt and Malkuth in the same row as Charge.
          </span>
        </Link>
      </section>

      <section className="mt-12 rounded-2xl bg-muted/70 px-5 py-5">
        <h2 className="font-serif text-2xl">How a correspondence is being used</h2>
        <p className="mt-3 font-serif text-[1.05rem] leading-7 text-foreground/90">
          A correspondence here is a claim about function. Jing is not the Latin for Malkuth. Both can name the office of stored potential, and the articles say where the likeness stops. If a sentence in your own tradition is flattened by the map, trust the tradition. Use Concord as a bilingual index, not as a replacement metaphysics.
        </p>
      </section>
    </div>
  );
}

export function CategoryView() {
  const { category: slug = "" } = useParams();
  const category = getCategoryBySlug(slug);

  useEffect(() => {
    document.title = category ? `${category.label} · Concord` : "Unknown category · Concord";
  }, [category]);

  if (!category) return <MissingPage />;

  const entries = getConceptsByCategory(category.id);

  return (
    <div className="mx-auto max-w-3xl">
      <nav aria-label="Breadcrumb" className="font-body text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link to={CONCORD_HOME} className="hover:text-cinnabar">
              Register
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground">{category.label}</li>
        </ol>
      </nav>
      <h1 className="mt-6 font-serif text-4xl tracking-tight sm:text-5xl">{category.label}</h1>
      <p className="mt-4 max-w-2xl font-serif text-xl leading-8 text-muted-foreground">
        {category.description}
      </p>
      {entries.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-border px-5 py-8 font-body text-muted-foreground">
          This shelf is empty.
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {entries.map((concept) => (
            <li key={concept.id}>
              <Link
                to={conceptPath(concept.id)}
                className="block rounded-2xl border border-border bg-card px-5 py-5 hover:border-cinnabar/40"
              >
                <span className="font-serif text-3xl">{concept.unifiedTerm}</span>
                <span className="mt-1 block font-body text-muted-foreground">{concept.subtitle}</span>
                <span className="mt-4 block">
                  <TraditionBadges concept={concept} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ConceptView() {
  const { id = "" } = useParams();
  const concept = getConcept(id);
  if (!concept) return <MissingPage />;
  return <Article concept={concept} />;
}

export function MatrixPage() {
  useEffect(() => {
    document.title = "Correspondence matrix · Concord";
  }, []);

  return (
    <div className="mx-auto max-w-6xl">
      <nav aria-label="Breadcrumb" className="font-body text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link to={CONCORD_HOME} className="hover:text-cinnabar">
              Register
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground">Correspondence matrix</li>
        </ol>
      </nav>
      <h1 className="mt-6 font-serif text-4xl tracking-tight sm:text-5xl">Correspondence matrix</h1>
      <p className="mt-4 max-w-2xl font-serif text-xl leading-8 text-muted-foreground">
        One row per office. Traditional names stay in their own columns so a search can show the likeness without pretending the columns are translations.
      </p>
      <div className="mt-8">
        <MatrixView />
      </div>
    </div>
  );
}

export function MissingPage() {
  useEffect(() => {
    document.title = "Not in the register · Concord";
  }, []);

  return (
    <div className="mx-auto max-w-xl py-10">
      <h1 className="font-serif text-4xl tracking-tight">That page is not an entry</h1>
      <p className="mt-4 font-body leading-7 text-muted-foreground">
        The register has eighteen terms. Start from one of the three offices, or return to the reading order.
      </p>
      <div className="mt-6 flex flex-wrap gap-3 font-body text-sm">
        <Link to={conceptPath("charge")} className="text-cinnabar underline underline-offset-4">
          Charge
        </Link>
        <Link to={conceptPath("current")} className="text-cinnabar underline underline-offset-4">
          Current
        </Link>
        <Link to={conceptPath("mind-will")} className="text-cinnabar underline underline-offset-4">
          Mind/Will
        </Link>
        <Link to={CONCORD_HOME} className="text-cinnabar underline underline-offset-4">
          Read through
        </Link>
      </div>
    </div>
  );
}
