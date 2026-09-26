import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { SearchButton, SearchProvider } from "@/concord/components/Search";
import { SidebarNav } from "@/concord/components/Sidebar";

export function ConcordShell() {
  const { pathname } = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const [navPath, setNavPath] = useState(pathname);

  if (pathname !== navPath) {
    setNavPath(pathname);
    setNavOpen(false);
  }

  return (
    <SearchProvider>
      <div className="concord-root min-h-screen bg-background text-foreground">
        <div className="lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)]">
          <aside className="sticky top-0 hidden h-screen border-r border-border lg:block">
            <SidebarNav />
          </aside>
          <div className="min-w-0">
            <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border lg:hidden"
                aria-label={navOpen ? "Close register navigation" : "Open register navigation"}
                aria-expanded={navOpen}
                onClick={() => setNavOpen((open) => !open)}
              >
                {navOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
              <SearchButton />
            </header>
            <main className="px-4 py-8 sm:px-6 lg:px-10">
              <Outlet />
            </main>
          </div>
        </div>
        {navOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-stone-950/40"
              aria-label="Close register navigation"
              onClick={() => setNavOpen(false)}
            />
            <div className="relative h-full w-[min(20rem,88vw)] overflow-y-auto shadow-xl">
              <SidebarNav onNavigate={() => setNavOpen(false)} />
            </div>
          </div>
        ) : null}
      </div>
    </SearchProvider>
  );
}
