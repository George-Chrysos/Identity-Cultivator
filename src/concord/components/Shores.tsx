import { useEffect, useState } from "react";
import { InlineText } from "@/concord/components/RichText";
import type { EsotericConcept, TraditionKey } from "@/concord/types";
import { cn } from "@/concord/cn";

const SHORES: { key: TraditionKey; label: string }[] = [
  { key: "daoist", label: "Daoist" },
  { key: "hermetic", label: "Hermetic" },
  { key: "qabalistic", label: "Qabalistic" },
];

function shoreFromHash() {
  const hash = window.location.hash.replace("#", "");
  const found = SHORES.find((shore) => hash === `shore-${shore.key}`);
  return found?.key ?? null;
}

export function TraditionTabs({ concept }: { concept: EsotericConcept }) {
  const [value, setValue] = useState<TraditionKey>("daoist");

  useEffect(() => {
    const apply = () => {
      const next = shoreFromHash();
      if (next) setValue(next);
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  return (
    <div>
      <div className="flex flex-wrap gap-1 border-b border-border" role="tablist" aria-label="Traditions">
        {SHORES.map((shore) => {
          const selected = value === shore.key;
          return (
            <button
              key={shore.key}
              id={`shore-${shore.key}`}
              type="button"
              role="tab"
              aria-selected={selected}
              className={cn(
                "scroll-mt-24 px-3 py-2 font-body text-sm",
                selected
                  ? "border-b-2 border-cinnabar font-medium text-cinnabar"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => {
                setValue(shore.key);
                window.history.replaceState(null, "", `#shore-${shore.key}`);
              }}
            >
              {shore.label}
            </button>
          );
        })}
      </div>
      {SHORES.map((shore) => {
        const account = concept.traditions[shore.key];
        if (value !== shore.key) return null;
        return (
          <div key={shore.key} role="tabpanel" className="pt-4">
            <h3 className="font-serif text-2xl text-foreground">{account.heading}</h3>
            <div className="mt-4 space-y-4">
              {account.paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 24)}
                  className="font-serif text-[1.075rem] leading-[1.7] text-foreground/90"
                >
                  <InlineText text={paragraph} />
                </p>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
