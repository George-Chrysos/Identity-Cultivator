import { Link, useLocation } from "react-router-dom";
import { concepts, getConceptsByCategory } from "@/concord/content";
import { CATEGORIES } from "@/concord/categories";
import { cn } from "@/concord/cn";
import { categoryPath, conceptPath, CONCORD_HOME, MATRIX_PATH } from "@/concord/paths";

function Mark() {
  return (
    <span className="flex flex-col gap-1" aria-hidden="true">
      <span className="h-1.5 w-1.5 rounded-full bg-indigo-ink" />
      <span className="h-1.5 w-1.5 rounded-full bg-bronze" />
      <span className="h-1.5 w-1.5 rounded-full bg-cinnabar" />
    </span>
  );
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation();

  return (
    <div className="flex h-full flex-col bg-background">
      <Link to={CONCORD_HOME} onClick={onNavigate} className="flex items-center gap-3 px-4 py-5">
        <Mark />
        <span>
          <span className="block font-serif text-xl leading-none tracking-tight">Concord</span>
          <span className="mt-1 block font-body text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
            Unified register
          </span>
        </span>
      </Link>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6" aria-label="Register">
        <div>
          <Link
            to={CONCORD_HOME}
            onClick={onNavigate}
            className={cn(
              "mt-1 block rounded-lg px-2 py-1.5 font-body text-sm",
              pathname === CONCORD_HOME
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
            )}
          >
            Read through
          </Link>
          <Link
            to={MATRIX_PATH}
            onClick={onNavigate}
            className={cn(
              "mt-1 block rounded-lg px-2 py-1.5 font-body text-sm",
              pathname === MATRIX_PATH
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
            )}
          >
            Correspondence matrix
          </Link>
        </div>
        {CATEGORIES.map((category) => {
          const entries = getConceptsByCategory(category.id);
          const categoryActive = pathname === categoryPath(category.slug);
          return (
            <div key={category.id}>
              <Link
                to={categoryPath(category.slug)}
                onClick={onNavigate}
                className={cn(
                  "block px-2 pb-1 font-body text-[0.68rem] font-medium uppercase tracking-[0.16em]",
                  categoryActive ? "text-cinnabar" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {category.label}
              </Link>
              <ul className="space-y-0.5">
                {entries.map((entry) => {
                  const href = conceptPath(entry.id);
                  const active = pathname === href;
                  return (
                    <li key={entry.id}>
                      <Link
                        to={href}
                        onClick={onNavigate}
                        className={cn(
                          "block rounded-lg px-2 py-1.5 font-body text-sm leading-5",
                          active
                            ? "bg-cinnabar/10 font-medium text-cinnabar"
                            : "text-foreground/80 hover:bg-muted/80",
                        )}
                        aria-current={active ? "page" : undefined}
                      >
                        {entry.unifiedTerm}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
      <p className="border-t border-border px-4 py-4 font-body text-[0.72rem] leading-5 text-muted-foreground">
        {concepts.length} entries. Correspondences name an office. They do not collapse three traditions into one religion.
      </p>
    </div>
  );
}
