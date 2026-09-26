import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { getConcept } from "@/concord/content";
import { conceptPath } from "@/concord/paths";

const TOKEN = /\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g;

function renderInline(text: string, keyPrefix: string) {
  const nodes: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  const expression = new RegExp(TOKEN);
  let index = 0;

  while ((match = expression.exec(text))) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }

    const id = match[1];
    const concept = getConcept(id);
    const label = match[2] ?? concept?.unifiedTerm ?? id;

    if (!concept) {
      nodes.push(label);
    } else {
      nodes.push(
        <Link
          key={`${keyPrefix}-${id}-${index}`}
          to={conceptPath(id)}
          className="text-cinnabar underline decoration-cinnabar/30 underline-offset-[3px] hover:decoration-cinnabar"
        >
          {label}
        </Link>,
      );
    }

    last = match.index + match[0].length;
    index += 1;
  }

  if (last < text.length) {
    nodes.push(text.slice(last));
  }

  return nodes;
}

export function InlineText({ text }: { text: string }) {
  return <>{renderInline(text, "inline")}</>;
}

export function RichText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const paragraphs = text.split(/\n\n+/).filter(Boolean);

  return (
    <div className={className}>
      {paragraphs.map((paragraph, index) => (
        <p
          key={index}
          className="font-serif text-[1.075rem] leading-[1.7] text-foreground/90 [&+p]:mt-4"
        >
          {renderInline(paragraph, `p-${index}`)}
        </p>
      ))}
    </div>
  );
}
